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
using System.Collections.Concurrent;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace TaskTrackerAPI.Utils
{
    /// <summary>
    /// Helper class for implementing rate limit backoff strategies in client applications
    /// </summary>
    public class RateLimitBackoffHelper
    {
        private readonly ILogger _logger;
        private readonly HttpClient _httpClient;
        private readonly ConcurrentDictionary<string, int> _retryCounters = new();
        private readonly int _maxRetries;
        private readonly int _baseDelay;
        private readonly bool _useJitter;
        private readonly Random _random = new();

        /// <summary>
        /// Initializes a new instance of the RateLimitBackoffHelper class
        /// </summary>
        /// <param name="httpClient">The HttpClient to use for requests</param>
        /// <param name="logger">Logger for recording retry attempts</param>
        /// <param name="maxRetries">Maximum number of retries (default: 5)</param>
        /// <param name="baseDelay">Base delay in milliseconds (default: 1000)</param>
        /// <param name="useJitter">Whether to add randomness to delays (default: true)</param>
        public RateLimitBackoffHelper(
            HttpClient httpClient,
            ILogger logger,
            int maxRetries = 5,
            int baseDelay = 1000,
            bool useJitter = true)
        {
            _httpClient = httpClient ?? throw new ArgumentNullException(nameof(httpClient));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _maxRetries = maxRetries;
            _baseDelay = baseDelay;
            _useJitter = useJitter;
        }

        /// <summary>
        /// Executes an HTTP request with exponential backoff retry logic for rate limiting
        /// </summary>
        /// <typeparam name="T">Type to deserialize the response to</typeparam>
        /// <param name="requestUri">The request URI</param>
        /// <param name="method">The HTTP method</param>
        /// <param name="content">The request content (optional)</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>The deserialized response, or default if all retries fail</returns>
        public async Task<T?> ExecuteWithBackoffAsync<T>(
            string requestUri,
            HttpMethod method,
            HttpContent? content = null,
            CancellationToken cancellationToken = default)
        {
            int currentRetry = 0;
            int maxRetryAttempts = _maxRetries;

            // Reset counter for this endpoint
            _retryCounters.TryRemove(requestUri, out _);

            while (currentRetry <= maxRetryAttempts)
            {
                using HttpRequestMessage request = new(method, requestUri);
                if (content != null)
                {
                    request.Content = content;
                }

                try
                {
                    using HttpResponseMessage response = await _httpClient.SendAsync(request, cancellationToken);

                    // If not rate limited, return the result
                    if (response.StatusCode != HttpStatusCode.TooManyRequests)
                    {
                        if (response.IsSuccessStatusCode)
                        {
                            string responseBody = await response.Content.ReadAsStringAsync(cancellationToken);
                            return JsonSerializer.Deserialize<T>(responseBody, new JsonSerializerOptions
                            {
                                PropertyNameCaseInsensitive = true
                            });
                        }

                        // Handle other error codes as needed
                        _logger.LogWarning("API request failed with status code {StatusCode}", response.StatusCode);
                        return default;
                    }

                    // Handle rate limiting (429 Too Many Requests)
                    _retryCounters.TryGetValue(requestUri, out int retryCount);
                    retryCount++;
                    _retryCounters[requestUri] = retryCount;

                    // Get retry information from headers if available
                    int retryAfterSeconds = GetRetryAfterSeconds(response, retryCount);

                    // Override max retries if server specifies it
                    if (response.Headers.TryGetValues("X-Max-Retry", out var maxRetryValues) &&
                        int.TryParse(maxRetryValues.FirstOrDefault(), out int serverMaxRetry))
                    {
                        maxRetryAttempts = serverMaxRetry;
                    }

                    // Check if we should abort retrying
                    if (currentRetry >= maxRetryAttempts)
                    {
                        _logger.LogWarning("Max retry attempts ({MaxRetries}) reached for {RequestUri}", 
                            maxRetryAttempts, requestUri);
                        return default;
                    }

                    // Apply exponential backoff with optional jitter
                    int delayMs = CalculateBackoffDelay(retryCount, retryAfterSeconds * 1000);
                    
                    _logger.LogInformation(
                        "Rate limit hit for {RequestUri}. Retrying in {DelayMs}ms (attempt {RetryCount}/{MaxRetries})",
                        requestUri, delayMs, currentRetry + 1, maxRetryAttempts);

                    await Task.Delay(delayMs, cancellationToken);
                    currentRetry++;
                }
                catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
                {
                    _logger.LogWarning("Request cancelled for {RequestUri}", requestUri);
                    throw;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error during request to {RequestUri}", requestUri);
                    return default;
                }
            }

            return default;
        }

        /// <summary>
        /// Gets retry delay in seconds from response headers or calculates a default
        /// </summary>
        private int GetRetryAfterSeconds(HttpResponseMessage response, int retryCount)
        {
            // Try to get Retry-After header (in seconds)
            if (response.Headers.TryGetValues("Retry-After", out var retryAfterValues) &&
                int.TryParse(retryAfterValues.FirstOrDefault(), out int retryAfter))
            {
                return retryAfter;
            }

            // Fall back to reset time if provided
            if (response.Headers.TryGetValues("X-RateLimit-Reset", out var resetValues) &&
                long.TryParse(resetValues.FirstOrDefault(), out long resetTimestamp))
            {
                var resetTime = DateTimeOffset.FromUnixTimeSeconds(resetTimestamp);
                var timeUntilReset = resetTime - DateTimeOffset.UtcNow;
                
                if (timeUntilReset.TotalSeconds > 0)
                {
                    return (int)timeUntilReset.TotalSeconds;
                }
            }

            // Use exponential backoff with the retry count if no header is present
            return (int)Math.Min(Math.Pow(2, retryCount), 60);  // Cap at 60 seconds
        }

        /// <summary>
        /// Calculates the backoff delay using exponential backoff formula with optional jitter
        /// </summary>
        private int CalculateBackoffDelay(int retryCount, int retryAfterMs = 0)
        {
            // If the server suggests a delay, use that as a base
            int baseDelayMs = retryAfterMs > 0 ? retryAfterMs : _baseDelay;
            
            // Calculate exponential backoff: baseDelay * (2^retryAttempt)
            double delayMs = baseDelayMs * Math.Pow(2, Math.Min(retryCount - 1, 5));  // Prevent overflow
            
            // Add jitter to prevent thundering herd
            if (_useJitter)
            {
                delayMs += _random.Next(0, 1000);  // Add 0-1000ms random jitter
            }
            
            // Cap the delay at 60 seconds to prevent excessive waits
            return (int)Math.Min(delayMs, 60000);
        }
    }

    /// <summary>
    /// Static extensions for HTTP client backoff strategies
    /// </summary>
    public static class RateLimitBackoffExtensions
    {
        /// <summary>
        /// Extension method for HttpClient to easily add backoff support
        /// </summary>
        public static async Task<T?> SendWithBackoffAsync<T>(
            this HttpClient client,
            HttpRequestMessage request,
            ILogger logger,
            int maxRetries = 5,
            int baseDelay = 1000,
            bool useJitter = true,
            CancellationToken cancellationToken = default)
        {
            var helper = new RateLimitBackoffHelper(client, logger, maxRetries, baseDelay, useJitter);
            return await helper.ExecuteWithBackoffAsync<T>(
                request.RequestUri!.ToString(),
                request.Method,
                request.Content,
                cancellationToken);
        }
    }
} 