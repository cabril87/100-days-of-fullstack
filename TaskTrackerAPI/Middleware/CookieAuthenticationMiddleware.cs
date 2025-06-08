using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;

namespace TaskTrackerAPI.Middleware
{
    /// <summary>
    /// Middleware to handle HTTP-only cookie authentication for server components
    /// </summary>
    public class CookieAuthenticationMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<CookieAuthenticationMiddleware> _logger;

        public CookieAuthenticationMiddleware(RequestDelegate next, ILogger<CookieAuthenticationMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // Debug logging for cookie authentication troubleshooting
            _logger.LogDebug("Cookie Auth Middleware - Path: {Path}, Method: {Method}", 
                context.Request.Path, context.Request.Method);
            
            // Log all cookies received
            foreach (KeyValuePair<string, string> cookie in context.Request.Cookies)
            {
                _logger.LogDebug("Cookie: {Name} = {Value}", cookie.Key, 
                    cookie.Key == "access_token" ? "[REDACTED]" : cookie.Value);
            }
            
            // Check if Authorization header is already present (JWT auth)
            if (!context.Request.Headers.ContainsKey("Authorization"))
            {
                // Check for access token in HTTP-only cookie
                if (context.Request.Cookies.TryGetValue("access_token", out string? accessToken) && !string.IsNullOrEmpty(accessToken))
                {
                    // Add the token to the Authorization header for JWT middleware
                    context.Request.Headers.Authorization = $"Bearer {accessToken}";
                    
                    _logger.LogInformation("Successfully added cookie-based access token to Authorization header for path: {Path}", context.Request.Path);
                }
                else
                {
                    _logger.LogDebug("No access_token cookie found for path: {Path}", context.Request.Path);
                }
            }
            else
            {
                _logger.LogDebug("Authorization header already present, skipping cookie authentication for path: {Path}", context.Request.Path);
            }

            await _next(context);
        }
    }

    /// <summary>
    /// Extension method to register the cookie authentication middleware
    /// </summary>
    public static class CookieAuthenticationMiddlewareExtensions
    {
        public static IApplicationBuilder UseCookieAuthentication(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<CookieAuthenticationMiddleware>();
        }
    }
} 