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
using System.Net;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Caching.Memory;
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

    public CsrfProtectionMiddleware(
        RequestDelegate next,
        ILogger<CsrfProtectionMiddleware> logger,
        IMemoryCache cache,
        IConfiguration configuration)
    {
        _next = next;
        _logger = logger;
        _cache = cache;
        _configuration = configuration;
        
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
                    "/api/auth/csrf"
                },
            StringComparer.OrdinalIgnoreCase);
        
        // Get token expiration from configuration or use default
        _tokenExpiration = TimeSpan.FromMinutes(
            _configuration.GetValue<int>("Csrf:TokenExpirationMinutes", 120));
    }

    public async Task InvokeAsync(HttpContext context)
    {
        string path = context.Request.Path.Value?.ToLowerInvariant() ?? string.Empty;
        
        // Skip CSRF validation for excluded endpoints
        if (_excludedEndpoints.Any(endpoint => path.StartsWith(endpoint, StringComparison.OrdinalIgnoreCase)))
        {
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
                await RespondWithCsrfError(context);
                return;
            }
            
            // Get the token from the cookie
            string? cookieToken = context.Request.Cookies[CsrfTokenCookieName];
            if (string.IsNullOrEmpty(cookieToken))
            {
                _logger.LogWarning("CSRF token missing from cookie for {Path}", path);
                await RespondWithCsrfError(context);
                return;
            }
            
            // Validate the token
            if (!ValidateToken(headerToken!, cookieToken!))
            {
                _logger.LogWarning("CSRF token validation failed for {Path}", path);
                await RespondWithCsrfError(context);
                return;
            }
        }
        
        // For GET requests, generate and set a new CSRF token if one doesn't exist
        if (context.Request.Method == "GET" && !context.Request.Cookies.ContainsKey(CsrfTokenCookieName))
        {
            string token = GenerateToken();
            SetCsrfCookie(context, token);
        }
        
        await _next(context);
    }
    
    private async Task RespondWithCsrfError(HttpContext context)
    {
        context.Response.StatusCode = (int)HttpStatusCode.Forbidden;
        context.Response.ContentType = "application/json";
        
        await context.Response.WriteAsJsonAsync(new 
        {
            Status = (int)HttpStatusCode.Forbidden,
            Message = "Invalid CSRF token"
        });
    }
    
    private bool ValidateToken(string headerToken, string cookieToken)
    {
        // Simple validation - tokens should match
        return headerToken.Equals(cookieToken, StringComparison.Ordinal);
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