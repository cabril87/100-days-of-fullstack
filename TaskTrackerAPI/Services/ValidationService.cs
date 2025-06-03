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
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using FluentValidation;
using FluentValidation.Results;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.Services.Interfaces;

namespace TaskTrackerAPI.Services
{
    public class ValidationService : IValidationService
    {
        private readonly IMemoryCache _cache;
        private readonly ILogger<ValidationService> _logger;
        private readonly IServiceProvider _serviceProvider;

        // List of route method names that are safe and should not trigger SQL injection detection
        private static readonly HashSet<string> SafeRouteNames = new HashSet<string>
        {
            "CreateTaskItem",
            "UpdateTaskItem",
            "DeleteTaskItem",
            "CreateQuickTask",
            "CompleteTaskItem",
            "CreateBoard",
            "UpdateBoard",
            "DeleteBoard",
            "CreateBoardColumn",
            "UpdateBoardColumn",
            "DeleteBoardColumn",
            "CreateBoardTemplate",
            "UpdateBoardTemplate",
            "DeleteBoardTemplate",
            "CreateBoardFromTemplate",
            "SaveBoardAsTemplate"
        };

        // Regex patterns for detecting security threats
        private static readonly string[] SqlInjectionPatterns = new[]
        {
            @"(\s|\A)(ALTER|CREATE|DELETE|DROP|EXEC(UTE){0,1}|INSERT( +INTO){0,1}|MERGE|SELECT|UPDATE|UNION|WHERE)",
            @"--",
            @";",
            @"'",
            @"/\*.*\*/",
            @"xp_cmdshell"
        };

        private static readonly string[] CommandInjectionPatterns = new[]
        {
            @"(;\s*\w+)|(\|\s*\w+)",  // Command chaining
            @"\&\s*\w+",              // Background execution
            @"\|\|\s*\w+",            // Command chaining with OR
            @"\&\&\s*\w+",            // Command chaining with AND
            @"`.*?`",                 // Backtick execution
            @"\$\(.*?\)",             // Command substitution
            @"\/bin\/(?:ba)?sh"       // Direct shell access
        };

        private static readonly string[] XssPatterns = new[]
        {
            @"<script.*?>",
            @"javascript:",
            @"onload=",
            @"onclick=",
            @"onerror=",
            @"<iframe",
            @"<object",
            @"<embed",
            @"<form",
            @"document\.cookie",
            @"alert\(",
            @"eval\(",
            @"prompt\("
        };

        public ValidationService(
            IMemoryCache cache,
            ILogger<ValidationService> logger,
            IServiceProvider serviceProvider)
        {
            _cache = cache ?? throw new ArgumentNullException(nameof(cache));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _serviceProvider = serviceProvider ?? throw new ArgumentNullException(nameof(serviceProvider));
        }

        public async Task<ValidationResult> ValidateAsync<T>(T obj)
        {
            if (obj == null)
            {
                return new ValidationResult(new[] { new ValidationFailure("", "Object cannot be null") });
            }

            // Generate cache key based on object type and content
            string objHash = obj.GetHashCode().ToString();
            string cacheKey = $"Validation_{typeof(T).Name}_{objHash}";

            // Try to get result from cache
            ValidationResult? cachedResult = GetCachedValidationResult<T>(cacheKey);
            if (cachedResult != null)
            {
                _logger.LogDebug("Using cached validation result for {Type}", typeof(T).Name);
                return cachedResult;
            }

            // Find the appropriate validator
            IValidator<T>? validator = _serviceProvider.GetService(typeof(IValidator<T>)) as IValidator<T>;
            if (validator == null)
            {
                _logger.LogWarning("No validator found for type {Type}", typeof(T).Name);
                return new ValidationResult();
            }

            // Perform validation
            ValidationResult result = await validator.ValidateAsync(obj);

            // Cache the result
            CacheValidationResult<T>(cacheKey, result);

            return result;
        }

        public bool ContainsSqlInjection(string input)
        {
            if (string.IsNullOrEmpty(input))
                return false;
            
            // Skip checks if input is one of our safe route names
            if (SafeRouteNames.Contains(input))
            {
                _logger.LogInformation("Safe route name detected, skipping SQL injection check: {Input}", input);
                return false;
            }
            
            // Skip checks for common controller action method patterns
            if (input.StartsWith("Create", StringComparison.OrdinalIgnoreCase) ||
                input.StartsWith("Update", StringComparison.OrdinalIgnoreCase) ||
                input.StartsWith("Delete", StringComparison.OrdinalIgnoreCase) ||
                input.StartsWith("Get", StringComparison.OrdinalIgnoreCase))
            {
                // These are likely controller action method names, not user input
                _logger.LogDebug("Controller action method pattern detected, skipping SQL injection check: {Input}", input);
                return false;
            }

            // Check against SQL injection patterns
            foreach (string pattern in SqlInjectionPatterns)
            {
                if (Regex.IsMatch(input, pattern, RegexOptions.IgnoreCase))
                {
                    _logger.LogWarning("Potential SQL injection detected: {Input}", input);
                    return true;
                }
            }

            return false;
        }

        public bool ContainsCommandInjection(string input)
        {
            if (string.IsNullOrEmpty(input))
                return false;

            // Check against command injection patterns
            foreach (string pattern in CommandInjectionPatterns)
            {
                if (Regex.IsMatch(input, pattern, RegexOptions.IgnoreCase))
                {
                    _logger.LogWarning("Potential command injection detected: {Input}", input);
                    return true;
                }
            }

            return false;
        }

        public bool ContainsXss(string input)
        {
            if (string.IsNullOrEmpty(input))
                return false;

            // Check against XSS patterns
            foreach (string pattern in XssPatterns)
            {
                if (Regex.IsMatch(input, pattern, RegexOptions.IgnoreCase))
                {
                    _logger.LogWarning("Potential XSS attack detected: {Input}", input);
                    return true;
                }
            }

            return false;
        }

        public string SanitizeHtml(string input)
        {
            if (string.IsNullOrEmpty(input))
                return input;

            // Replace potentially dangerous HTML tags and attributes
            string sanitized = input;

            // Remove <script> tags and contents
            sanitized = Regex.Replace(sanitized, @"<script.*?>.*?</script>", "", RegexOptions.IgnoreCase | RegexOptions.Singleline);

            // Remove event handlers
            sanitized = Regex.Replace(sanitized, @"(on\w+)=([""']?).*?\2", "", RegexOptions.IgnoreCase);

            // Remove javascript: protocol
            sanitized = Regex.Replace(sanitized, @"javascript:", "", RegexOptions.IgnoreCase);

            // Remove iframe, object, embed tags
            sanitized = Regex.Replace(sanitized, @"<(iframe|object|embed).*?>.*?</\1>", "", RegexOptions.IgnoreCase | RegexOptions.Singleline);

            // Remove inline styles
            sanitized = Regex.Replace(sanitized, @"style=([""']?).*?\1", "", RegexOptions.IgnoreCase);

            // HTML encode the result
            sanitized = System.Net.WebUtility.HtmlEncode(sanitized);

            return sanitized;
        }

        public ValidationResult? GetCachedValidationResult<T>(string cacheKey)
        {
            if (_cache.TryGetValue(cacheKey, out ValidationResult? cachedResult))
            {
                return cachedResult;
            }

            return null;
        }

        public void CacheValidationResult<T>(string cacheKey, ValidationResult result, int expirationMinutes = 10)
        {
            MemoryCacheEntryOptions cacheEntryOptions = new MemoryCacheEntryOptions()
                .SetSlidingExpiration(TimeSpan.FromMinutes(expirationMinutes));

            _cache.Set(cacheKey, result, cacheEntryOptions);
        }
    }
} 