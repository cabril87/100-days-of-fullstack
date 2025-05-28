/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 *
 * This file may not be used, copied, modified, or distributed except in
 * accordance with the terms contained in the LICENSE file.
 */
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Security.Claims;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using TaskTrackerAPI.Services.Interfaces;
using Microsoft.AspNetCore.Builder;

namespace TaskTrackerAPI.Middleware
{
    /// <summary>
    /// Middleware that logs security-relevant events and detects potential security threats
    /// </summary>
    public class SecurityAuditMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<SecurityAuditMiddleware> _logger;
        private readonly IServiceProvider _serviceProvider;
        
        // Patterns for detecting potential security threats
        private static readonly Regex SqlInjectionPattern = new Regex(
            @"(\s|^)(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|EXEC|CREATE)\s", 
            RegexOptions.IgnoreCase | RegexOptions.Compiled);
        
        private static readonly Regex XssPattern = new Regex(
            @"<script.*?>|javascript\s*:|on\w+\s*=", 
            RegexOptions.IgnoreCase | RegexOptions.Compiled);
        
        private static readonly Regex PathTraversalPattern = new Regex(
            @"\.\.(/|\\)", 
            RegexOptions.Compiled);
        
        // List of sensitive parameter names that should be redacted
        private static readonly HashSet<string> SensitiveParameters = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "password", "pwd", "secret", "token", "apikey", "api_key", "key", "ssn", "creditcard", 
            "cc", "cardnumber", "cvv", "ssn", "email", "address", "phone", "dob", "birthdate"
        };

        // List of paths to exclude from security auditing (to prevent infinite loops)
        private static readonly HashSet<string> ExcludedPaths = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "/health",
            "/metrics",
            "/api/v1/health",
            "/api/v1/metrics",
        };
        
        // Counter to track consecutive requests to the same path
        private static readonly Dictionary<string, int> PathRequestCounter = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
        private static readonly int MaxConsecutiveRequests = 5;
        private static readonly object LockObject = new object();

        public SecurityAuditMiddleware(
            RequestDelegate next,
            ILogger<SecurityAuditMiddleware> logger,
            IServiceProvider serviceProvider)
        {
            _next = next;
            _logger = logger;
            _serviceProvider = serviceProvider;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // Skip processing for excluded paths
            if (ShouldSkipProcessing(context))
            {
                // Skip all processing and directly pass to next middleware
                await _next(context);
                return;
            }
            
            // Check for potential infinite loops
            string requestPath = context.Request.Path.ToString();
            
            bool shouldSkipDueToFrequency = false;
            lock (LockObject)
            {
                if (PathRequestCounter.TryGetValue(requestPath, out int count))
                {
                    if (count >= MaxConsecutiveRequests)
                    {
                        shouldSkipDueToFrequency = true;
                        // Reset counter after skipping
                        PathRequestCounter[requestPath] = 0;
                    }
                    else
                    {
                        PathRequestCounter[requestPath] = count + 1;
                    }
                }
                else
                {
                    PathRequestCounter[requestPath] = 1;
                }
            }
            
            if (shouldSkipDueToFrequency)
            {
                _logger.LogWarning("Skipping security audit for path {Path} due to too many consecutive requests", requestPath);
                await _next(context);
                return;
            }
            
            // Create a scope to resolve scoped services
            using IServiceScope scope = _serviceProvider.CreateScope();
            IDataProtectionService dataProtectionService = scope.ServiceProvider.GetRequiredService<IDataProtectionService>();
            
            // Create a copy of the request body so we can read it for auditing
            context.Request.EnableBuffering();
            string? requestBody = await ReadRequestBodyAsync(context.Request);
            
            // Reset the request body position
            context.Request.Body.Position = 0;
            
            // Look for potential attack signatures
            bool potentialThreat = DetectPotentialThreats(context, requestBody);
            
            // Log request information with PII protection
            await LogRequestInfoAsync(context, requestBody, potentialThreat);
            
            // Create response tracking
            Stream originalBodyStream = context.Response.Body;
            using MemoryStream responseBodyStream = new MemoryStream();
            context.Response.Body = responseBodyStream;
            
            Stopwatch stopwatch = Stopwatch.StartNew();
            
            try
            {
                // Continue with the request
                await _next(context);
            }
            catch (Exception ex)
            {
                // Log security-relevant exceptions
                _logger.LogError(ex, "Security audit caught exception during request processing: {Path}", 
                    context.Request.Path);
                throw;
            }
            finally
            {
                stopwatch.Stop();
                
                // Log response information
                await LogResponseInfoAsync(context, stopwatch.ElapsedMilliseconds, potentialThreat);
                
                // Copy the response body to the original stream
                responseBodyStream.Position = 0;
                await responseBodyStream.CopyToAsync(originalBodyStream);
                
                // Reset counter after successful request
                lock (LockObject)
                {
                    if (PathRequestCounter.ContainsKey(requestPath))
                    {
                        PathRequestCounter[requestPath] = 0;
                    }
                }
            }
        }

        private bool ShouldSkipProcessing(HttpContext context)
        {
            // Get the raw path for comparison
            string rawPath = context.Request.Path.ToString();
            
            // Normalize the path: remove trailing slashes and convert to lowercase
            string normalizedPath = rawPath.TrimEnd('/').ToLowerInvariant();
            
            
            // Skip health checks and other excluded paths
            foreach (var excludedPath in ExcludedPaths)
            {
                string normalizedExcludedPath = excludedPath.TrimEnd('/').ToLowerInvariant();
                if (normalizedPath == normalizedExcludedPath || 
                    normalizedPath.StartsWith(normalizedExcludedPath + "/", StringComparison.OrdinalIgnoreCase))
                {
                    _logger.LogDebug("Skipping security audit for excluded path: {Path}", rawPath);
                    return true;
                }
            }
            
            // Always skip OPTIONS requests (CORS preflight)
            if (context.Request.Method.Equals("OPTIONS", StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }
            
            // Skip if there's an X-Internal-Request header
            if (context.Request.Headers.ContainsKey("X-Internal-Request"))
            {
                return true;
            }
            
            return false;
        }

        private async Task<string?> ReadRequestBodyAsync(HttpRequest request)
        {
            try
            {
                if (!request.Body.CanRead || request.Body.Length == 0)
                {
                    return null;
                }
                
                using StreamReader reader = new StreamReader(
                    request.Body,
                    encoding: Encoding.UTF8,
                    detectEncodingFromByteOrderMarks: false,
                    bufferSize: 1024,
                    leaveOpen: true);
                
                return await reader.ReadToEndAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error reading request body for security audit");
                return null;
            }
        }

        private bool DetectPotentialThreats(HttpContext context, string? requestBody)
        {
            // Check for SQL injection
            if (!string.IsNullOrEmpty(requestBody) && SqlInjectionPattern.IsMatch(requestBody))
            {
                _logger.LogWarning("Potential SQL injection detected: {IpAddress}, {Path}", 
                    GetClientIp(context), context.Request.Path);
                return true;
            }
            
            // Check for XSS
            if (!string.IsNullOrEmpty(requestBody) && XssPattern.IsMatch(requestBody))
            {
                _logger.LogWarning("Potential XSS attack detected: {IpAddress}, {Path}", 
                    GetClientIp(context), context.Request.Path);
                return true;
            }
            
            // Check for path traversal
            if (PathTraversalPattern.IsMatch(context.Request.Path))
            {
                _logger.LogWarning("Potential path traversal attack detected: {IpAddress}, {Path}", 
                    GetClientIp(context), context.Request.Path);
                return true;
            }
            
            // Check if authorization header looks suspicious
            if (context.Request.Headers.ContainsKey("Authorization"))
            {
                string authHeader = context.Request.Headers["Authorization"].ToString();
                if (authHeader.Length > 1000)
                {
                    _logger.LogWarning("Suspicious authorization header (length > 1000): {IpAddress}, {Path}", 
                        GetClientIp(context), context.Request.Path);
                    return true;
                }
            }
            
            return false;
        }

        private async Task LogRequestInfoAsync(HttpContext context, string? requestBody, bool potentialThreat)
        {
            // Get user ID if authenticated
            string? userId = context.User.Identity?.IsAuthenticated == true
                ? context.User.FindFirstValue(ClaimTypes.NameIdentifier)
                : null;
            
            string? username = context.User.Identity?.IsAuthenticated == true
                ? context.User.FindFirstValue(ClaimTypes.Name)
                : null;
            
            // Get client IP
            string clientIp = GetClientIp(context);
            
            // Get user agent
            string userAgent = context.Request.Headers["User-Agent"].ToString();
            
            // Redact sensitive information from the request body
            string? redactedBody = RedactSensitiveInformation(requestBody);
            
            // Log basic request information
            if (potentialThreat)
            {
                // For potential threats, log more detailed information
                _logger.LogWarning(
                    "SECURITY AUDIT - Request: {Method} {Path} from IP:{IpAddress} User:{UserId} Body:{Body}",
                    context.Request.Method,
                    context.Request.Path,
                    clientIp,
                    userId ?? "anonymous",
                    redactedBody ?? "empty");
            }
            else
            {
                // For normal requests, log basic information
                _logger.LogInformation(
                    "Security Audit - Request: {Method} {Path} from IP:{IpAddress} User:{UserId}",
                    context.Request.Method,
                    context.Request.Path,
                    clientIp,
                    userId ?? "anonymous");
            }
            
            // Log to database for admin dashboard
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var securityMonitoringService = scope.ServiceProvider.GetRequiredService<ISecurityMonitoringService>();
                
                int? userIdInt = null;
                if (!string.IsNullOrEmpty(userId) && int.TryParse(userId, out int parsedUserId))
                {
                    userIdInt = parsedUserId;
                }
                
                string eventType = potentialThreat ? "SECURITY_THREAT" : "USER_REQUEST";
                string action = $"{context.Request.Method} {context.Request.Path}";
                string severity = potentialThreat ? "HIGH" : "INFO";
                string? details = potentialThreat ? $"Potential threat detected. Body: {redactedBody}" : null;
                
                await securityMonitoringService.LogSecurityAuditAsync(
                    eventType: eventType,
                    action: action,
                    ipAddress: clientIp,
                    userAgent: userAgent,
                    userId: userIdInt,
                    username: username,
                    resource: context.Request.Path,
                    severity: severity,
                    details: details,
                    isSuccessful: true,
                    isSuspicious: potentialThreat
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to log security audit to database");
            }
        }

        private async Task LogResponseInfoAsync(HttpContext context, long elapsedMs, bool potentialThreat)
        {
            // Get user ID if authenticated
            string? userId = context.User.Identity?.IsAuthenticated == true
                ? context.User.FindFirstValue(ClaimTypes.NameIdentifier)
                : null;
            
            string? username = context.User.Identity?.IsAuthenticated == true
                ? context.User.FindFirstValue(ClaimTypes.Name)
                : null;
            
            // Get client IP
            string clientIp = GetClientIp(context);
            
            // Get user agent
            string userAgent = context.Request.Headers["User-Agent"].ToString();
            
            bool isSuccessful = context.Response.StatusCode < 400;
            bool isError = context.Response.StatusCode >= 400;
            
            // Log response details
            if (potentialThreat || isError)
            {
                // For potential threats or error responses, log more detailed information
                _logger.LogWarning(
                    "SECURITY AUDIT - Response: {StatusCode} for {Method} {Path} from IP:{IpAddress} User:{UserId} Elapsed:{ElapsedMs}ms",
                    context.Response.StatusCode,
                    context.Request.Method,
                    context.Request.Path,
                    clientIp,
                    userId ?? "anonymous",
                    elapsedMs);
            }
            else
            {
                // For normal responses, log basic information
                _logger.LogDebug(
                    "Security Audit - Response: {StatusCode} for {Path} Elapsed:{ElapsedMs}ms",
                    context.Response.StatusCode,
                    context.Request.Path,
                    elapsedMs);
            }
            
            // Log response to database for admin dashboard
            // Log all requests for performance metrics, but with different detail levels
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var securityMonitoringService = scope.ServiceProvider.GetRequiredService<ISecurityMonitoringService>();
                
                int? userIdInt = null;
                if (!string.IsNullOrEmpty(userId) && int.TryParse(userId, out int parsedUserId))
                {
                    userIdInt = parsedUserId;
                }
                
                string eventType;
                string severity;
                
                if (potentialThreat)
                {
                    eventType = "SECURITY_THREAT_RESPONSE";
                    severity = "HIGH";
                }
                else if (isError)
                {
                    eventType = "ERROR_RESPONSE";
                    severity = "MEDIUM";
                }
                else
                {
                    eventType = "API_REQUEST";
                    severity = "INFO";
                }
                
                string action = $"{context.Request.Method} {context.Request.Path} -> {context.Response.StatusCode}";
                string details = $"Response: {context.Response.StatusCode}, Elapsed: {elapsedMs}ms";
                
                // Add user agent for performance tracking
                if (!string.IsNullOrEmpty(userAgent))
                {
                    details += $", UserAgent: {userAgent.Substring(0, Math.Min(userAgent.Length, 100))}";
                }
                
                await securityMonitoringService.LogSecurityAuditAsync(
                    eventType: eventType,
                    action: action,
                    ipAddress: clientIp,
                    userAgent: userAgent,
                    userId: userIdInt,
                    username: username,
                    resource: context.Request.Path,
                    severity: severity,
                    details: details,
                    isSuccessful: isSuccessful,
                    isSuspicious: potentialThreat
                );

                // Generate SecurityMetrics based on the type of event
                await GenerateSecurityMetricsAsync(securityMonitoringService, context, potentialThreat, isError, isSuccessful, userIdInt);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to log response audit to database");
            }
        }

        private async Task GenerateSecurityMetricsAsync(ISecurityMonitoringService securityMonitoringService, HttpContext context, bool potentialThreat, bool isError, bool isSuccessful, int? userId)
        {
            try
            {
                // Generate SecurityMetrics based on different event types
                if (potentialThreat)
                {
                    // Log threat detection metrics
                    await securityMonitoringService.LogSecurityMetricAsync(
                        metricType: "Threat Detection",
                        metricName: "Suspicious IP Activity",
                        value: 1,
                        description: "Suspicious activity from unknown IP addresses",
                        source: "Security Monitor",
                        severity: "High"
                    );
                }
                else if (isError)
                {
                    if (context.Response.StatusCode == 401 || context.Response.StatusCode == 403)
                    {
                        // Log access control violations
                        await securityMonitoringService.LogSecurityMetricAsync(
                            metricType: "Access Control",
                            metricName: "Permission Violations",
                            value: 1,
                            description: "Attempts to access unauthorized resources",
                            source: "Security Monitor",
                            severity: "High"
                        );
                    }
                    else if (context.Response.StatusCode == 429)
                    {
                        // Log blocked requests (rate limiting)
                        await securityMonitoringService.LogSecurityMetricAsync(
                            metricType: "Threat Detection",
                            metricName: "Blocked Requests",
                            value: 1,
                            description: "Number of malicious requests blocked",
                            source: "Security Monitor",
                            severity: "Medium"
                        );
                    }
                }
                else if (isSuccessful && userId.HasValue)
                {
                    // Log successful authentications (only for authenticated users)
                    await securityMonitoringService.LogSecurityMetricAsync(
                        metricType: "Access Control",
                        metricName: "Successful Authentications",
                        value: 1,
                        description: "Number of successful user authentications",
                        source: "Security Monitor",
                        severity: "Info"
                    );
                }

                // Periodically generate system security score (every 50th request)
                if (Random.Shared.Next(1, 51) == 1)
                {
                    double securityScore = await securityMonitoringService.CalculateSecurityScoreAsync();
                    await securityMonitoringService.LogSecurityMetricAsync(
                        metricType: "System Security",
                        metricName: "Security Score",
                        value: securityScore,
                        description: "Overall system security score",
                        source: "Security Monitor",
                        severity: "Info"
                    );
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to generate security metrics");
            }
        }

        private string GetClientIp(HttpContext context)
        {
            // Get client IP, preferring X-Forwarded-For if available
            string? ip = context.Request.Headers["X-Forwarded-For"].ToString();
            if (string.IsNullOrEmpty(ip))
            {
                ip = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            }
            else
            {
                // X-Forwarded-For can contain multiple IPs - use the first one
                int commaIndex = ip.IndexOf(',');
                if (commaIndex > 0)
                {
                    ip = ip.Substring(0, commaIndex).Trim();
                }
            }
            
            return ip;
        }

        private string? RedactSensitiveInformation(string? content)
        {
            if (string.IsNullOrEmpty(content))
            {
                return content;
            }
            
            // Redact sensitive key-value pairs
            foreach (string paramName in SensitiveParameters)
            {
                // Match JSON format: "paramName": "value"
                content = Regex.Replace(
                    content,
                    $"\"{paramName}\"\\s*:\\s*\"[^\"]*\"",
                    $"\"{paramName}\": \"[REDACTED]\"",
                    RegexOptions.IgnoreCase);
                
                // Match form data format: paramName=value
                content = Regex.Replace(
                    content,
                    $"{paramName}=[^&\n]+",
                    $"{paramName}=[REDACTED]",
                    RegexOptions.IgnoreCase);
            }
            
            // Redact potential credit card numbers
            content = Regex.Replace(
                content,
                @"\b(?:\d[ -]*?){13,16}\b",
                "[POSSIBLE-CC-REDACTED]");
            
            // Redact potential SSNs
            content = Regex.Replace(
                content,
                @"\b\d{3}[ -]?\d{2}[ -]?\d{4}\b",
                "[POSSIBLE-SSN-REDACTED]");
            
            // Redact potential email addresses
            content = Regex.Replace(
                content,
                @"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b",
                "[EMAIL-REDACTED]");
            
            return content;
        }
    }

    // Extension methods for adding the middleware to the request pipeline
    public static class SecurityAuditMiddlewareExtensions
    {
        public static IApplicationBuilder UseSecurityAudit(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<SecurityAuditMiddleware>();
        }
    }
} 