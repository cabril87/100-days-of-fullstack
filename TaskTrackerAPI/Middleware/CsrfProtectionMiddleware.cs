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
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Primitives;

namespace TaskTrackerAPI.Middleware;

/// <summary>
/// Middleware that implements CSRF protection
/// </summary>
public class CsrfProtectionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<CsrfProtectionMiddleware> _logger;
    private readonly IMemoryCache _cache;
    private readonly IConfiguration _configuration;
    private readonly IHostEnvironment _environment;
    
    // CSRF token header name
    private const string CsrfTokenHeaderName = "X-CSRF-TOKEN";
    
    // CSRF token cookie name
    private const string CsrfTokenCookieName = "XSRF-TOKEN";
    
    // Methods that require CSRF protection
    private readonly string[] _protectedMethods = { "POST", "PUT", "DELETE", "PATCH" };
    
    // Endpoints to exclude from CSRF protection
    private readonly HashSet<string> _excludedEndpoints;
    
    // Token expiration time
    private readonly TimeSpan _tokenExpiration;
    
    // Toggle for development bypass
    private readonly bool _bypassCsrfInDevelopment;

    public CsrfProtectionMiddleware(
        RequestDelegate next,
        ILogger<CsrfProtectionMiddleware> logger,
        IMemoryCache cache,
        IConfiguration configuration,
        IHostEnvironment environment)
    {
        _next = next;
        _logger = logger;
        _cache = cache;
        _configuration = configuration;
        _environment = environment;
        
        // Load excluded endpoints from configuration or use defaults
        _excludedEndpoints = new HashSet<string>(
            _configuration.GetSection("Csrf:ExcludedEndpoints")
                .Get<string[]>() ?? new[] 
                {
                    "/api/auth/login",
                    "/api/auth/register",
                    "/hubs/",  // Exclude all hub paths including negotiation
                    "/hubs/tasks",
                    "/hubs/tasks/negotiate",
                    "/api/auth/csrf",
                    "/api/v1/auth/login",
                    "/api/v1/auth/register",
                    "/api/v1/auth/csrf",
                    "/api/v1/auth/public-csrf",
                    "/api/v1/debug/", // Exclude all debug endpoints for testing
                    "/api/v1/debug/csrf-test",
                    "/api/v1/debug/test-login",
                    "/api/v1/focus/test", // Only exclude the public test endpoint
                    "/api/v1/dataprotection/" // Exclude data protection endpoints
                },
            StringComparer.OrdinalIgnoreCase);
        
        // Get token expiration from configuration or use default
        _tokenExpiration = TimeSpan.FromMinutes(
            _configuration.GetValue<int>("Csrf:TokenExpirationMinutes", 120));
            
        // In development mode, make CSRF optional based on configuration
        _bypassCsrfInDevelopment = _environment.IsDevelopment() && 
            _configuration.GetValue<bool>("Csrf:BypassInDevelopment", false);
    }

    public async Task InvokeAsync(HttpContext context)
    {
        string path = context.Request.Path.Value?.ToLowerInvariant() ?? string.Empty;
        
        // Always generate a new token for GET requests if one doesn't exist
        if (context.Request.Method == "GET" && !context.Request.Cookies.ContainsKey(CsrfTokenCookieName))
        {
            string token = GenerateToken();
            SetCsrfCookie(context, token);
            _logger.LogDebug("Generated new CSRF token for path: {Path}", path);
        }
        
        // Skip CSRF validation for excluded endpoints
        if (_excludedEndpoints.Any(endpoint => 
            endpoint.EndsWith("/") 
                ? path.StartsWith(endpoint, StringComparison.OrdinalIgnoreCase) 
                : path.Equals(endpoint, StringComparison.OrdinalIgnoreCase) || path.StartsWith($"{endpoint}/", StringComparison.OrdinalIgnoreCase)))
        {
            _logger.LogDebug("Skipping CSRF validation for excluded path: {Path}", path);
            await _next(context);
            return;
        }
        
        // Skip validation in development mode if bypass is enabled
        if (_bypassCsrfInDevelopment)
        {
            _logger.LogWarning("Bypassing CSRF validation in development mode for path: {Path}", path);
            await _next(context);
            return;
        }
        
        // Only check CSRF token for protected methods
        if (_protectedMethods.Contains(context.Request.Method))
        {
            // Get the token from the request header
            if (!context.Request.Headers.TryGetValue(CsrfTokenHeaderName, out StringValues headerToken) || string.IsNullOrEmpty(headerToken))
            {
                _logger.LogWarning("CSRF token missing from header for {Path}", path);
                
                // In development, we'll log details and continue for easier debugging
                if (_environment.IsDevelopment())
                {
                    _logger.LogWarning("CSRF validation failed, but continuing in development mode");
                    string token = GenerateToken();
                    SetCsrfCookie(context, token);
                    
                    // Add header to response indicating the token was missing
                    context.Response.Headers.Append("X-CSRF-Status", "Token-Missing");
                    
                    await _next(context);
                    return;
                }
                
                await RespondWithCsrfError(context, "CSRF token missing from request header");
                return;
            }
            
            // Get the token from the cookie
            string? cookieToken = context.Request.Cookies[CsrfTokenCookieName];
            if (string.IsNullOrEmpty(cookieToken))
            {
                _logger.LogWarning("CSRF token missing from cookie for {Path}", path);
                
                // In development, refresh the token and continue
                if (_environment.IsDevelopment())
                {
                    _logger.LogWarning("CSRF cookie missing, but continuing in development mode");
                    string token = GenerateToken();
                    SetCsrfCookie(context, token);
                    
                    // Add header to response indicating the cookie was missing
                    context.Response.Headers.Append("X-CSRF-Status", "Cookie-Missing");
                    
                    await _next(context);
                    return;
                }
                
                await RespondWithCsrfError(context, "CSRF token cookie missing");
                return;
            }
            
            // Validate the token
            if (!ValidateToken(headerToken!, cookieToken!))
            {
                _logger.LogWarning("CSRF token validation failed for {Path}", path);
                
                // Log token values in development for debugging
                if (_environment.IsDevelopment())
                {
                    _logger.LogWarning("Header token: {HeaderToken}, Cookie token: {CookieToken}", 
                        headerToken.ToString(), cookieToken);
                        
                    // Continue in development but set a new token
                    _logger.LogWarning("CSRF validation failed, but continuing in development mode");
                    string token = GenerateToken();
                    SetCsrfCookie(context, token);
                    
                    // Add header to response indicating tokens didn't match
                    context.Response.Headers.Append("X-CSRF-Status", "Token-Mismatch");
                    
                    await _next(context);
                    return;
                }
                
                await RespondWithCsrfError(context, "CSRF token validation failed");
                return;
            }
        }
        
        await _next(context);
    }
    
    private async Task RespondWithCsrfError(HttpContext context, string message)
    {
        context.Response.StatusCode = (int)HttpStatusCode.Forbidden;
        context.Response.ContentType = "application/json";
        
        await context.Response.WriteAsJsonAsync(new 
        {
            Status = (int)HttpStatusCode.Forbidden,
            Message = message
        });
    }
    
    private bool ValidateToken(string headerToken, string cookieToken)
    {
        try
        {
            // URL decode both tokens before comparison
            string decodedHeaderToken = WebUtility.UrlDecode(headerToken);
            string decodedCookieToken = WebUtility.UrlDecode(cookieToken);
            
            // Compare the decoded tokens
            return decodedHeaderToken.Equals(decodedCookieToken, StringComparison.Ordinal);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating CSRF token");
            return false;
        }
    }
    
    private string GenerateToken()
    {
        // Generate a random token
        byte[] tokenBytes = new byte[32];
        using (RandomNumberGenerator rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(tokenBytes);
        }
        
        return Convert.ToBase64String(tokenBytes);
    }
    
    private void SetCsrfCookie(HttpContext context, string token)
    {
        // Set the token in a cookie
        CookieOptions cookieOptions = new CookieOptions
        {
            HttpOnly = false, // JavaScript needs to read this cookie
            Secure = context.Request.IsHttps,
            SameSite = SameSiteMode.Lax,
            Expires = DateTimeOffset.UtcNow.Add(_tokenExpiration)
        };
        
        context.Response.Cookies.Append(CsrfTokenCookieName, token, cookieOptions);
    }
} 