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
using System.Collections.Generic;
using FluentValidation.Results;

namespace TaskTrackerAPI.Services.Interfaces
{
    public interface IValidationService
    {
        /// <summary>
        /// Validates an object using appropriate validator
        /// </summary>
        /// <typeparam name="T">Type of object to validate</typeparam>
        /// <param name="obj">Object to validate</param>
        /// <returns>Validation result with errors if any</returns>
        Task<ValidationResult> ValidateAsync<T>(T obj);

        /// <summary>
        /// Checks if a string contains potential SQL injection attempts
        /// </summary>
        /// <param name="input">String to check</param>
        /// <returns>True if SQL injection is detected, otherwise false</returns>
        bool ContainsSqlInjection(string input);

        /// <summary>
        /// Checks if a string contains potential command injection patterns
        /// </summary>
        /// <param name="input">String to check</param>
        /// <returns>True if command injection is detected, otherwise false</returns>
        bool ContainsCommandInjection(string input);

        /// <summary>
        /// Checks if a string contains potential XSS attack patterns
        /// </summary>
        /// <param name="input">String to check</param>
        /// <returns>True if XSS is detected, otherwise false</returns>
        bool ContainsXss(string input);

        /// <summary>
        /// Sanitizes input string to prevent XSS attacks
        /// </summary>
        /// <param name="input">String to sanitize</param>
        /// <returns>Sanitized string</returns>
        string SanitizeHtml(string input);

        /// <summary>
        /// Gets cached validation result if available
        /// </summary>
        /// <typeparam name="T">Type of object that was validated</typeparam>
        /// <param name="cacheKey">Key to identify cached validation</param>
        /// <returns>Cached validation result or null if not found</returns>
        ValidationResult? GetCachedValidationResult<T>(string cacheKey);

        /// <summary>
        /// Caches a validation result for future use
        /// </summary>
        /// <typeparam name="T">Type of object that was validated</typeparam>
        /// <param name="cacheKey">Key to identify cached validation</param>
        /// <param name="result">Validation result to cache</param>
        /// <param name="expirationMinutes">How long to cache result (in minutes)</param>
        void CacheValidationResult<T>(string cacheKey, ValidationResult result, int expirationMinutes = 10);
    }
} 