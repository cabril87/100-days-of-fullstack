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
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using System;
using System.Security.Cryptography;
using System.Text;
using System.Collections.Generic;
using System.Text.RegularExpressions;

namespace TaskTrackerAPI.Middleware
{
    /// <summary>
    /// Middleware that adds security headers to all responses
    /// Enhanced with OWASP-recommended security headers and CSP policies
    /// </summary>
    public class SecurityHeadersMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<SecurityHeadersMiddleware> _logger;
        private readonly IConfiguration _configuration;
        private readonly SecurityHeaderOptions _options;
        
        // Random number generator for CSP nonces
        private readonly RandomNumberGenerator _rng = RandomNumberGenerator.Create();
        
        // Thread-safe dictionary to store nonces for the current request context
        private static readonly AsyncLocal<Dictionary<string, string>?> _requestNonces = new();
        
        // Key under which the CSP nonce is stored in the HttpContext.Items dictionary
        public const string CspNonceKey = "csp-nonce";
        
        // Cache security header values that don't change per request
        private readonly string _permissionsPolicy;
        private readonly string _corsResourcePolicy;
        private readonly string _corsOpenerPolicy;
        private readonly string _corsEmbedderPolicy;
        private readonly string _defaultCacheControl;
        private readonly string _referrerPolicy;
        private readonly string _hstsHeader;

        public SecurityHeadersMiddleware(
            RequestDelegate next,
            ILogger<SecurityHeadersMiddleware> logger,
            IConfiguration configuration)
        {
            _next = next;
            _logger = logger;
            _configuration = configuration;
            
            // Load security header options from configuration or use defaults
            _options = new SecurityHeaderOptions();
            _configuration.GetSection("SecurityHeaders").Bind(_options);
            
            // Pre-compute static header values
            _permissionsPolicy = _options.UsePermissionsPolicy ? _options.PermissionsPolicy : string.Empty;
            _corsResourcePolicy = _options.UseCrossOriginResourcePolicy ? _options.CrossOriginResourcePolicy : string.Empty;
            _corsOpenerPolicy = _options.UseCrossOriginOpenerPolicy ? _options.CrossOriginOpenerPolicy : string.Empty;
            _corsEmbedderPolicy = _options.UseCrossOriginEmbedderPolicy ? _options.CrossOriginEmbedderPolicy : string.Empty;
            _defaultCacheControl = _options.UseCacheControl ? _options.CacheControl : string.Empty;
            _referrerPolicy = _options.UseReferrerPolicy ? _options.ReferrerPolicy : string.Empty;
            
            // Pre-compute HSTS header if it doesn't vary per request
            if (_options.UseHsts || _options.UseStrictTransportSecurity)
            {
                _hstsHeader = $"max-age={_options.HstsMaxAge}{(_options.HstsIncludeSubDomains ? "; includeSubDomains" : "")}{(_options.HstsPreload ? "; preload" : "")}";
            }
            else
            {
                _hstsHeader = string.Empty;
            }
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // Initialize nonce dictionary for this request
            _requestNonces.Value = new Dictionary<string, string>();
            
            // Generate a CSP nonce for this request if nonce-based CSP is enabled
            if (_options.EnableNonceBasedCSP)
            {
                string nonce = GenerateNonce();
                context.Items[CspNonceKey] = nonce;
                _requestNonces.Value["script"] = nonce;
                _requestNonces.Value["style"] = nonce;
            }
            
            // Add security headers before the request is processed
            AddSecurityHeaders(context);
            
            // Continue with the request
            await _next(context);
            
            // Clear the nonce dictionary after the request is complete
            _requestNonces.Value = null;
        }

        private void AddSecurityHeaders(HttpContext context)
        {
            // Always add these basic security headers
            if (_options.UseXContentTypeOptions)
            {
                context.Response.Headers["X-Content-Type-Options"] = "nosniff";
            }
            
            if (_options.UseXFrameOptions)
            {
                context.Response.Headers["X-Frame-Options"] = _options.XFrameOptionsMode;
            }
            
            // X-XSS-Protection is deprecated but still recommended as defense in depth
            if (_options.UseXXssProtection)
            {
                context.Response.Headers["X-XSS-Protection"] = "1; mode=block";
            }
            
            if (_options.UseReferrerPolicy)
            {
                context.Response.Headers["Referrer-Policy"] = _referrerPolicy;
            }
            
            // Content Security Policy
            if (_options.UseContentSecurityPolicy)
            {
                // For API endpoints, a strict CSP is appropriate
                string csp = BuildContentSecurityPolicy(context);
                context.Response.Headers["Content-Security-Policy"] = csp;
                
                // Add CSP Report-Only header if ReportTo is enabled but this is our first deploy of the new CSP
                if (_options.UseReportTo && !string.IsNullOrEmpty(_options.ReportToEndpoint))
                {
                    context.Response.Headers["Content-Security-Policy-Report-Only"] = 
                        $"{csp}; report-to endpoint-1; report-uri {_options.ReportToEndpoint}";
                    
                    // Add Report-To header for CSP violation reporting
                    context.Response.Headers["Report-To"] = 
                        $"{{\"group\":\"endpoint-1\",\"max_age\":10886400,\"endpoints\":[{{\"url\":\"{_options.ReportToEndpoint}\"}}]}}";
                }
            }
            
            // Permissions Policy (formerly Feature Policy)
            if (_options.UsePermissionsPolicy)
            {
                context.Response.Headers["Permissions-Policy"] = _permissionsPolicy;
            }
            
            // Cache control with enhanced rules
            if (_options.UseCacheControl)
            {
                ApplyCacheControlHeaders(context);
            }
            
            // Strict-Transport-Security header
            if ((_options.UseHsts || _options.UseStrictTransportSecurity) && context.Request.IsHttps)
            {
                context.Response.Headers["Strict-Transport-Security"] = _hstsHeader;
            }
            
            // Cross-Origin-Resource-Policy
            if (_options.UseCrossOriginResourcePolicy)
            {
                context.Response.Headers["Cross-Origin-Resource-Policy"] = _corsResourcePolicy;
            }
            
            // Cross-Origin-Opener-Policy 
            if (_options.UseCrossOriginOpenerPolicy)
            {
                context.Response.Headers["Cross-Origin-Opener-Policy"] = _corsOpenerPolicy;
            }
            
            // Cross-Origin-Embedder-Policy
            if (_options.UseCrossOriginEmbedderPolicy)
            {
                context.Response.Headers["Cross-Origin-Embedder-Policy"] = _corsEmbedderPolicy;
            }
            
            // Handle sign-out actions for Clear-Site-Data
            if (_options.UseClearSiteData && _options.ClearSiteDataOnSignOut != null)
            {
                // Check if this is a sign-out endpoint
                bool isSignOutEndpoint = context.Request.Path.StartsWithSegments("/api/auth/logout") ||
                                         context.Request.Path.StartsWithSegments("/api/v1/auth/logout");
                
                if (isSignOutEndpoint && context.Request.Method == HttpMethods.Post)
                {
                    // Add Clear-Site-Data header on sign-out
                    context.Response.Headers["Clear-Site-Data"] = $"\"{_options.ClearSiteDataOnSignOut}\"";
                }
            }
        }

        private void ApplyCacheControlHeaders(HttpContext context)
        {
            // Define patterns for sensitive endpoints
            List<string> sensitivePatterns = new List<string>
            {
                "/api/auth",
                "/api/v1/auth",
                "/api/users",
                "/api/v1/users",
                "/api/admin",
                "/api/v1/admin"
            };
            
            // Financial data patterns
            List<string> financialPatterns = new List<string>
            {
                "/api/billing",
                "/api/v1/billing",
                "/api/payments",
                "/api/v1/payments",
                "/api/subscription",
                "/api/v1/subscription"
            };
            
            // Identify various endpoint types for different caching policies
            bool isSensitiveEndpoint = sensitivePatterns.Exists(p => context.Request.Path.StartsWithSegments(p));
            bool isFinancialEndpoint = financialPatterns.Exists(p => context.Request.Path.StartsWithSegments(p));
            bool isStaticResource = context.Request.Path.StartsWithSegments("/static") || 
                                   context.Request.Path.Value?.EndsWith(".js") == true || 
                                   context.Request.Path.Value?.EndsWith(".css") == true || 
                                   context.Request.Path.Value?.EndsWith(".png") == true ||
                                   context.Request.Path.Value?.EndsWith(".jpg") == true ||
                                   context.Request.Path.Value?.EndsWith(".svg") == true;
            
            // Apply appropriate cache-control headers based on endpoint type
            if (isSensitiveEndpoint || isFinancialEndpoint)
            {
                // No caching for sensitive endpoints
                context.Response.Headers["Cache-Control"] = "no-store, no-cache, must-revalidate, proxy-revalidate";
                context.Response.Headers["Pragma"] = "no-cache";
                context.Response.Headers["Expires"] = "0";
            }
            else if (isStaticResource)
            {
                // Aggressive caching for static resources
                context.Response.Headers["Cache-Control"] = "public, max-age=31536000, immutable";
            }
            else if (context.Request.Method == HttpMethods.Get)
            {
                // Moderate caching for GET requests to non-sensitive endpoints
                context.Response.Headers["Cache-Control"] = "private, max-age=60, stale-while-revalidate=30";
            }
            else
            {
                // For non-sensitive POST/PUT/DELETE endpoints, use the default
                context.Response.Headers["Cache-Control"] = _defaultCacheControl;
            }
        }

        private string BuildContentSecurityPolicy(HttpContext context)
        {
            // For APIs, a very restrictive CSP is appropriate
            if (_options.ApiOnlyMode)
            {
                // API-only CSP
                return "default-src 'none'; frame-ancestors 'none'";
            }
            
            // For web apps with APIs, a more balanced approach with nonce support
            if (_options.EnableNonceBasedCSP && _requestNonces.Value != null)
            {
                // Get nonces
                string scriptNonce = _requestNonces.Value.TryGetValue("script", out string? sNonce) ? sNonce ?? string.Empty : GenerateNonce();
                string styleNonce = _requestNonces.Value.TryGetValue("style", out string? stNonce) ? stNonce ?? string.Empty : GenerateNonce();
                
                // Build CSP with nonces
                return _options.ContentSecurityPolicy
                    .Replace("'self'", "'self'")
                    .Replace("script-src", $"script-src 'nonce-{scriptNonce}'")
                    .Replace("style-src", $"style-src 'nonce-{styleNonce}'");
            }
            
            // Default CSP
            return _options.ContentSecurityPolicy;
        }
        
        /// <summary>
        /// Generates a cryptographically secure random string for use as a CSP nonce
        /// </summary>
        /// <returns>Base64 encoded random string</returns>
        private string GenerateNonce()
        {
            byte[] nonceBytes = new byte[16];
            _rng.GetBytes(nonceBytes);
            
            // Base64 encode the nonce value
            string nonce = Convert.ToBase64String(nonceBytes);
            
            // Ensure nonce is valid and doesn't contain problematic characters
            nonce = Regex.Replace(nonce, "[+/=]", "");
            
            return nonce;
        }
        
        /// <summary>
        /// Gets the CSP nonce for the current request
        /// </summary>
        public static string GetCurrentRequestNonce(HttpContext context, string type = "script")
        {
            // First try to get the nonce from the context items
            if (context.Items.TryGetValue(CspNonceKey, out var nonceObj) && nonceObj is string nonce)
            {
                return nonce;
            }
            
            // Then check the request-specific nonce dictionary
            var nonces = _requestNonces.Value;
            if (nonces != null && nonces.TryGetValue(type, out var typeNonce))
            {
                return typeNonce;
            }
            
            return string.Empty;
        }
    }

    /// <summary>
    /// Contains configuration options for security headers
    /// Enhanced with OWASP-recommended settings
    /// </summary>
    public class SecurityHeaderOptions
    {
        // X-Content-Type-Options
        public bool UseXContentTypeOptions { get; set; } = true;
        
        // X-Frame-Options
        public bool UseXFrameOptions { get; set; } = true;
        public string XFrameOptionsMode { get; set; } = "DENY"; // DENY, SAMEORIGIN
        
        // X-XSS-Protection
        public bool UseXXssProtection { get; set; } = true;
        
        // Referrer-Policy
        public bool UseReferrerPolicy { get; set; } = true;
        public string ReferrerPolicy { get; set; } = "strict-origin-when-cross-origin";
        
        // Content-Security-Policy
        public bool UseContentSecurityPolicy { get; set; } = true;
        public string ContentSecurityPolicy { get; set; } = "default-src 'self'; script-src 'self'; object-src 'none'; frame-ancestors 'none'";
        public bool ApiOnlyMode { get; set; } = true;
        
        // CSP nonce-based execution
        public bool EnableNonceBasedCSP { get; set; } = false;
        
        // CSP Reporting
        public bool UseReportTo { get; set; } = false;
        public string ReportToEndpoint { get; set; } = "/api/security/cspreport";
        
        // Permissions-Policy
        public bool UsePermissionsPolicy { get; set; } = true;
        public string PermissionsPolicy { get; set; } = "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()";
        
        // Cache-Control
        public bool UseCacheControl { get; set; } = true;
        public string CacheControl { get; set; } = "no-cache, no-store, must-revalidate";
        
        // HTTP Strict Transport Security
        public bool UseHsts { get; set; } = true;
        public bool UseStrictTransportSecurity { get; set; } = true;
        public int HstsMaxAge { get; set; } = 31536000; // 1 year in seconds
        public bool HstsIncludeSubDomains { get; set; } = true;
        public bool HstsPreload { get; set; } = true;
        
        // Cross-Origin-Resource-Policy
        public bool UseCrossOriginResourcePolicy { get; set; } = true;
        public string CrossOriginResourcePolicy { get; set; } = "same-origin";
        
        // Cross-Origin-Opener-Policy
        public bool UseCrossOriginOpenerPolicy { get; set; } = true;
        public string CrossOriginOpenerPolicy { get; set; } = "same-origin";
        
        // Cross-Origin-Embedder-Policy
        public bool UseCrossOriginEmbedderPolicy { get; set; } = true;
        public string CrossOriginEmbedderPolicy { get; set; } = "require-corp";
        
        // Clear-Site-Data
        public bool UseClearSiteData { get; set; } = false;
        public string ClearSiteDataOnSignOut { get; set; } = "cache, cookies, storage";
    }
    
    // Extension methods for adding the middleware to the request pipeline
    public static class SecurityHeadersMiddlewareExtensions
    {
        public static IApplicationBuilder UseSecurityHeaders(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<SecurityHeadersMiddleware>();
        }
    }
} 