using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;

namespace TaskTrackerAPI.Middleware
{
    public class CsrfProtectionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<CsrfProtectionMiddleware> _logger;
        private readonly IWebHostEnvironment _environment;

        // Safe HTTP methods that don't need CSRF protection
        private readonly string[] _safeMethods = { "GET", "HEAD", "OPTIONS" };

        // The header that will contain the CSRF token
        public const string CSRF_HEADER = "X-CSRF-TOKEN";

        // The name of the cookie that will contain the CSRF token
        public const string CSRF_COOKIE = "X-CSRF-TOKEN-COOKIE";

        public CsrfProtectionMiddleware(RequestDelegate next, ILogger<CsrfProtectionMiddleware> logger, IWebHostEnvironment environment)
        {
            _next = next;
            _logger = logger;
            _environment = environment;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // Skip CSRF validation for API endpoints when in development or for safe methods
            if (_environment.IsDevelopment() || 
                _safeMethods.Contains(context.Request.Method, StringComparer.OrdinalIgnoreCase))
            {
                // For GET requests, generate and set a CSRF token if not already present
                if (context.Request.Method.Equals("GET", StringComparison.OrdinalIgnoreCase) &&
                    !context.Request.Cookies.ContainsKey(CSRF_COOKIE))
                {
                    string newToken = GenerateToken();
                    context.Response.Cookies.Append(CSRF_COOKIE, newToken, new CookieOptions
                    {
                        HttpOnly = true,
                        Secure = !_environment.IsDevelopment(),
                        SameSite = SameSiteMode.Strict,
                        MaxAge = TimeSpan.FromHours(24)
                    });
                }

                await _next(context);
                return;
            }

            // For non-safe methods, validate the CSRF token
            if (!ValidateToken(context))
            {
                _logger.LogWarning("CSRF token validation failed for {Method} {Path}", 
                    context.Request.Method, context.Request.Path);

                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                await context.Response.WriteAsJsonAsync(new { message = "Invalid or missing CSRF token" });
                return;
            }

            await _next(context);
        }

        private bool ValidateToken(HttpContext context)
        {
            // Get the token from the cookie
            if (!context.Request.Cookies.TryGetValue(CSRF_COOKIE, out string? cookieToken) || string.IsNullOrEmpty(cookieToken))
            {
                _logger.LogWarning("Missing CSRF cookie token");
                return false;
            }

            // Get the token from the header
            if (!context.Request.Headers.TryGetValue(CSRF_HEADER, out Microsoft.Extensions.Primitives.StringValues headerValues))
            {
                _logger.LogWarning("Missing CSRF header token");
                return false;
            }

            string headerToken = headerValues.ToString();
            if (string.IsNullOrEmpty(headerToken))
            {
                _logger.LogWarning("Empty CSRF header token");
                return false;
            }

            // Compare tokens - must match exactly
            bool isValid = cookieToken.Equals(headerToken, StringComparison.Ordinal);

            if (!isValid)
            {
                _logger.LogWarning("CSRF token mismatch");
            }

            return isValid;
        }

        private string GenerateToken()
        {
            // Generate a cryptographically secure random token
            byte[] tokenBytes = new byte[32]; // 256 bits
            using RandomNumberGenerator rng = RandomNumberGenerator.Create();
            rng.GetBytes(tokenBytes);
            
            // Convert to Base64 for easier handling
            return Convert.ToBase64String(tokenBytes);
        }
    }
} 