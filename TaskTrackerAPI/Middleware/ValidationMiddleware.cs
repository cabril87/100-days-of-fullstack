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
using System.IO;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using TaskTrackerAPI.Exceptions;
using TaskTrackerAPI.Services.Interfaces;

namespace TaskTrackerAPI.Middleware
{
    public class ValidationMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ValidationMiddleware> _logger;
        private readonly IValidationService _validationService;
        private readonly HashSet<string> _ignoredPaths;

        public ValidationMiddleware(
            RequestDelegate next,
            ILogger<ValidationMiddleware> logger,
            IValidationService validationService)
        {
            _next = next ?? throw new ArgumentNullException(nameof(next));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _validationService = validationService ?? throw new ArgumentNullException(nameof(validationService));
            
            // Endpoints to exclude from validation (like static files, health checks, etc.)
            _ignoredPaths = new HashSet<string>
            {
                "/health",
                "/favicon.ico",
                "/swagger",
                "/css",
                "/js",
                "/images"
            };
        }

        public async Task InvokeAsync(HttpContext context)
        {
            if (ShouldSkipValidation(context))
            {
                await _next(context);
                return;
            }

            // Enable buffering so we can read the request multiple times
            context.Request.EnableBuffering();

            // Preemptively check route parameters and query strings
            if (!ValidateRouteAndQueryParameters(context))
            {
                context.Response.StatusCode = StatusCodes.Status400BadRequest;
                await context.Response.WriteAsync("Request contains potentially malicious input");
                return;
            }

            // Check request body for API methods that typically include one
            if (IsMethodWithRequestBody(context.Request.Method))
            {
                bool isValid = await ValidateRequestBodyAsync(context);
                if (!isValid)
                {
                    context.Response.StatusCode = StatusCodes.Status400BadRequest;
                    await context.Response.WriteAsync("Request contains potentially malicious input");
                    return;
                }
                
                // Reset the position for the next middleware
                context.Request.Body.Position = 0;
            }

            await _next(context);
        }

        private bool ShouldSkipValidation(HttpContext context)
        {
            string path = context.Request.Path.Value?.ToLower() ?? "";
            
            // Skip ignored paths
            foreach (string ignoredPath in _ignoredPaths)
            {
                if (path.StartsWith(ignoredPath))
                {
                    return true;
                }
            }
            
            // Skip GET and HEAD requests to reduce overhead
            // (unless they have query parameters which are checked separately)
            if ((context.Request.Method == "GET" || context.Request.Method == "HEAD") 
                && !context.Request.QueryString.HasValue)
            {
                return true;
            }
            
            return false;
        }

        private bool ValidateRouteAndQueryParameters(HttpContext context)
        {
            // Check route parameters
            foreach (object? routeValue in context.Request.RouteValues.Values)
            {
                if (routeValue != null && CheckIfPotentiallyMalicious(routeValue.ToString() ?? string.Empty))
                {
                    _logger.LogWarning("Potentially malicious route parameter detected: {Value}", routeValue);
                    return false;
                }
            }

            // Check query parameters
            foreach (KeyValuePair<string, Microsoft.Extensions.Primitives.StringValues> queryParam in context.Request.Query)
            {
                // Validate each value in multi-value query parameters
                foreach (string? value in queryParam.Value)
                {
                    if (!string.IsNullOrEmpty(value) && CheckIfPotentiallyMalicious(value))
                    {
                        _logger.LogWarning("Potentially malicious query parameter detected: {QueryParam}={Value}", 
                            queryParam.Key, value);
                        return false;
                    }
                }
            }

            return true;
        }

        private async Task<bool> ValidateRequestBodyAsync(HttpContext context)
        {
            try
            {
                // Check content type for different validation approaches
                string contentType = context.Request.ContentType?.ToLower() ?? "";
                
                if (contentType.Contains("application/json"))
                {
                    return await ValidateJsonBodyAsync(context);
                }
                else if (contentType.Contains("application/x-www-form-urlencoded"))
                {
                    return ValidateFormBody(context);
                }
                else if (contentType.Contains("multipart/form-data"))
                {
                    // For file uploads and multipart forms, we'll just check form fields
                    // File content scanning would be handled separately
                    return ValidateFormBody(context);
                }
                
                // For other content types, perform a basic check on the raw body
                return await ValidateRawBodyAsync(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating request body");
                return false;
            }
        }

        private async Task<bool> ValidateJsonBodyAsync(HttpContext context)
        {
            string body;
            using (StreamReader reader = new StreamReader(
                context.Request.Body,
                encoding: Encoding.UTF8,
                detectEncodingFromByteOrderMarks: false,
                leaveOpen: true))
            {
                body = await reader.ReadToEndAsync();
            }

            if (string.IsNullOrEmpty(body))
            {
                return true;
            }

            try
            {
                // Parse JSON
                JToken jsonObj = JToken.Parse(body);
                
                // Recursively check all string values in the JSON
                return ValidateJsonToken(jsonObj);
            }
            catch (JsonReaderException)
            {
                _logger.LogWarning("Invalid JSON in request body");
                return false;
            }
        }

        private bool ValidateJsonToken(JToken token)
        {
            switch (token.Type)
            {
                case JTokenType.Object:
                    foreach (KeyValuePair<string, JToken> prop in (JObject)token)
                    {
                        if (!ValidateJsonToken(prop.Value))
                        {
                            return false;
                        }
                    }
                    break;

                case JTokenType.Array:
                    foreach (JToken item in (JArray)token)
                    {
                        if (!ValidateJsonToken(item))
                        {
                            return false;
                        }
                    }
                    break;

                case JTokenType.String:
                    string value = token.Value<string>();
                    if (!string.IsNullOrEmpty(value) && CheckIfPotentiallyMalicious(value))
                    {
                        _logger.LogWarning("Potentially malicious value in JSON body: {Value}", value);
                        return false;
                    }
                    break;
            }

            return true;
        }

        private bool ValidateFormBody(HttpContext context)
        {
            foreach (KeyValuePair<string, Microsoft.Extensions.Primitives.StringValues> formValue in context.Request.Form)
            {
                foreach (string? value in formValue.Value)
                {
                    if (!string.IsNullOrEmpty(value) && CheckIfPotentiallyMalicious(value))
                    {
                        _logger.LogWarning("Potentially malicious form value detected: {Key}={Value}", 
                            formValue.Key, value);
                        return false;
                    }
                }
            }

            return true;
        }

        private async Task<bool> ValidateRawBodyAsync(HttpContext context)
        {
            string body;
            using (StreamReader reader = new StreamReader(
                context.Request.Body,
                encoding: Encoding.UTF8,
                detectEncodingFromByteOrderMarks: false,
                leaveOpen: true))
            {
                body = await reader.ReadToEndAsync();
            }

            if (string.IsNullOrEmpty(body))
            {
                return true;
            }

            if (CheckIfPotentiallyMalicious(body))
            {
                _logger.LogWarning("Potentially malicious content in request body");
                return false;
            }

            return true;
        }
        
        private bool CheckIfPotentiallyMalicious(string input)
        {
            // Check for SQL Injection
            if (_validationService.ContainsSqlInjection(input))
            {
                _logger.LogWarning("SQL injection attempt detected: {Input}", input);
                return true;
            }
            
            // Check for Command Injection
            if (_validationService.ContainsCommandInjection(input))
            {
                _logger.LogWarning("Command injection attempt detected: {Input}", input);
                return true;
            }
            
            // Check for XSS
            if (_validationService.ContainsXss(input))
            {
                _logger.LogWarning("XSS attempt detected: {Input}", input);
                return true;
            }
            
            return false;
        }
        
        private bool IsMethodWithRequestBody(string method)
        {
            return method == "POST" || method == "PUT" || method == "PATCH";
        }
    }
} 