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

namespace TaskTrackerAPI.Middleware
{
    /// <summary>
    /// Middleware that adds security headers to all responses
    /// </summary>
    public class SecurityHeadersMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<SecurityHeadersMiddleware> _logger;
        private readonly IConfiguration _configuration;
        private readonly SecurityHeaderOptions _options;

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
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // Add security headers before the request is processed
            AddSecurityHeaders(context);
            
            // Continue with the request
            await _next(context);
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
                context.Response.Headers["Referrer-Policy"] = _options.ReferrerPolicy;
            }
            
            // Content Security Policy
            if (_options.UseContentSecurityPolicy)
            {
                // For API endpoints, a strict CSP is appropriate
                string csp = BuildContentSecurityPolicy();
                context.Response.Headers["Content-Security-Policy"] = csp;
            }
            
            // Permissions Policy (formerly Feature Policy)
            if (_options.UsePermissionsPolicy)
            {
                context.Response.Headers["Permissions-Policy"] = _options.PermissionsPolicy;
            }
            
            // Cache control
            if (_options.UseCacheControl)
            {
                // For sensitive data, we want to prevent caching
                bool isSensitiveEndpoint = context.Request.Path.StartsWithSegments("/api/auth")
                                        || context.Request.Path.StartsWithSegments("/api/v1/auth");
                
                if (isSensitiveEndpoint)
                {
                    context.Response.Headers["Cache-Control"] = "no-store, no-cache, must-revalidate, proxy-revalidate";
                    context.Response.Headers["Pragma"] = "no-cache";
                    context.Response.Headers["Expires"] = "0";
                }
                else
                {
                    // For non-sensitive data, we can use more permissive caching
                    context.Response.Headers["Cache-Control"] = _options.CacheControl;
                }
            }
            
            // Strict-Transport-Security header
            if (_options.UseHsts && context.Request.IsHttps)
            {
                context.Response.Headers["Strict-Transport-Security"] = 
                    $"max-age={_options.HstsMaxAge}{(_options.HstsIncludeSubDomains ? "; includeSubDomains" : "")}{(_options.HstsPreload ? "; preload" : "")}";
            }
            
            // Cross-Origin-Resource-Policy
            if (_options.UseCrossOriginResourcePolicy)
            {
                context.Response.Headers["Cross-Origin-Resource-Policy"] = _options.CrossOriginResourcePolicy;
            }
            
            // Cross-Origin-Opener-Policy 
            if (_options.UseCrossOriginOpenerPolicy)
            {
                context.Response.Headers["Cross-Origin-Opener-Policy"] = _options.CrossOriginOpenerPolicy;
            }
            
            // Cross-Origin-Embedder-Policy
            if (_options.UseCrossOriginEmbedderPolicy)
            {
                context.Response.Headers["Cross-Origin-Embedder-Policy"] = _options.CrossOriginEmbedderPolicy;
            }
        }

        private string BuildContentSecurityPolicy()
        {
            // For APIs, a very restrictive CSP is appropriate
            if (_options.ApiOnlyMode)
            {
                // API-only CSP
                return "default-src 'none'; frame-ancestors 'none'";
            }
            
            // For web apps with APIs, a more balanced approach
            return _options.ContentSecurityPolicy;
        }
    }

    /// <summary>
    /// Contains configuration options for security headers
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
        
        // Permissions-Policy
        public bool UsePermissionsPolicy { get; set; } = true;
        public string PermissionsPolicy { get; set; } = "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()";
        
        // Cache-Control
        public bool UseCacheControl { get; set; } = true;
        public string CacheControl { get; set; } = "no-cache, no-store, must-revalidate";
        
        // HTTP Strict Transport Security
        public bool UseHsts { get; set; } = true;
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