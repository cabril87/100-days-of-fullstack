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
    /// Helper class for handling rate-limited API responses with exponential backoff
    /// </summary>
    public class RateLimitBackoffHelper
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<RateLimitBackoffHelper> _logger;
        private readonly JsonSerializerOptions _jsonOptions = new JsonSerializerOptions 
        {
            PropertyNameCaseInsensitive = true
        };
        
        // Backoff settings - these can be loaded from configuration
        private readonly int _maxRetryCount;
        private readonly int _baseBackoffDelaySeconds;
        private readonly Random _jitterSource = new();
        
        /// <summary>
        /// Constructor with default settings
        /// </summary>
        /// <param name="httpClient">HTTP client for making requests</param>
        /// <param name="logger">Logger</param>
        /// <param name="maxRetryCount">Maximum number of retries (default: 3)</param>
        /// <param name="baseBackoffDelaySeconds">Base delay in seconds for exponential backoff (default: 2)</param>
        public RateLimitBackoffHelper(
            HttpClient httpClient,
            ILogger<RateLimitBackoffHelper> logger,
            int maxRetryCount = 3,
            int baseBackoffDelaySeconds = 2)
        {
            _httpClient = httpClient;
            _logger = logger;
            _maxRetryCount = maxRetryCount;
            _baseBackoffDelaySeconds = baseBackoffDelaySeconds;
        }
        
        /// <summary>
        /// Makes an HTTP request with automatic retry and exponential backoff for rate-limited responses
        /// </summary>
        /// <typeparam name="T">The expected response type</typeparam>
        /// <param name="requestFunc">Function that creates and sends the HTTP request</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Deserialized response or default value if all retries fail</returns>
        public async Task<T?> ExecuteWithBackoffAsync<T>(
            Func<CancellationToken, Task<HttpResponseMessage>> requestFunc,
            CancellationToken cancellationToken = default)
        {
            int retryCount = 0;
            bool shouldRetry;
            bool wasRateLimited = false;
            int? retryAfterSeconds = null;
            
            do
            {
                shouldRetry = false;
                
                try
                {
                    // Add jitter to avoid thundering herd problem
                    if (wasRateLimited && retryCount > 0)
                    {
                        // Calculate delay with exponential backoff and jitter
                        double exponentialFactor = Math.Pow(2, retryCount - 1);
                        double baseDelay = retryAfterSeconds ?? (_baseBackoffDelaySeconds * exponentialFactor);
                        double jitter = _jitterSource.NextDouble() * baseDelay * 0.3; // 30% jitter max
                        int delayMs = (int)((baseDelay + jitter) * 1000);
                        
                        _logger.LogInformation(
                            "Rate limit reached. Retry {RetryCount}/{MaxRetries} after {DelayMs}ms (exponential backoff)",
                            retryCount, _maxRetryCount, delayMs);
                            
                        await Task.Delay(delayMs, cancellationToken);
                    }
                    
                    // Make the request
                    using HttpResponseMessage response = await requestFunc(cancellationToken);
                    
                    // Handle rate limiting responses (status code 429)
                    if (response.StatusCode == HttpStatusCode.TooManyRequests)
                    {
                        wasRateLimited = true;
                        retryCount++;
                        
                        // Check if we should retry
                        shouldRetry = retryCount <= _maxRetryCount;
                        
                        // Parse Retry-After header if present
                        if (response.Headers.TryGetValues("Retry-After", out IEnumerable<string>? values) && 
                            values.FirstOrDefault() is string retryAfterValue &&
                            int.TryParse(retryAfterValue, out int parsedSeconds))
                        {
                            retryAfterSeconds = parsedSeconds;
                            _logger.LogDebug("Server specified Retry-After: {RetryAfterSeconds} seconds", retryAfterSeconds);
                        }
                        
                        // Extract rate limit headers for logging
                        string limitHeader = GetHeaderValueOrDefault(response.Headers, "X-RateLimit-Limit");
                        string remainingHeader = GetHeaderValueOrDefault(response.Headers, "X-RateLimit-Remaining");
                        string resetHeader = GetHeaderValueOrDefault(response.Headers, "X-RateLimit-Reset");
                        
                        _logger.LogWarning(
                            "Rate limit exceeded. Limit: {Limit}, Remaining: {Remaining}, Reset: {Reset}. Retry {RetryCount}/{MaxRetries}",
                            limitHeader, remainingHeader, resetHeader, retryCount, _maxRetryCount);
                            
                        continue;
                    }
                    
                    // For successful responses, deserialize and return
                    if (response.IsSuccessStatusCode)
                    {
                        if (response.Content.Headers.ContentLength == 0)
                        {
                            // Handle empty responses (e.g., for void methods)
                            return default;
                        }
                        
                        string json = await response.Content.ReadAsStringAsync(cancellationToken);
                        return JsonSerializer.Deserialize<T>(json, _jsonOptions);
                    }
                    
                    // Handle other error responses
                    _logger.LogError(
                        "API request failed with status code {StatusCode}: {ReasonPhrase}",
                        (int)response.StatusCode, response.ReasonPhrase);
                        
                    return default;
                }
                catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
                {
                    // Propagate cancellation
                    _logger.LogInformation("Request was cancelled");
                    throw;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error executing request with backoff (attempt {RetryCount}/{MaxRetries})", 
                        retryCount, _maxRetryCount);
                        
                    // Retry on transient errors
                    if (IsTransientError(ex) && retryCount < _maxRetryCount)
                    {
                        shouldRetry = true;
                        retryCount++;
                        
                        // Use base backoff delay for transient errors
                        double exponentialFactor = Math.Pow(2, retryCount - 1);
                        int delayMs = (int)(_baseBackoffDelaySeconds * exponentialFactor * 1000);
                        
                        _logger.LogInformation(
                            "Transient error detected. Retry {RetryCount}/{MaxRetries} after {DelayMs}ms",
                            retryCount, _maxRetryCount, delayMs);
                            
                        await Task.Delay(delayMs, cancellationToken);
                    }
                    else
                    {
                        return default;
                    }
                }
            } while (shouldRetry);
            
            return default;
        }
        
        /// <summary>
        /// Determines if an exception represents a transient error that should be retried
        /// </summary>
        private bool IsTransientError(Exception ex)
        {
            return ex is HttpRequestException ||
                   ex is TimeoutException ||
                   ex is TaskCanceledException ||
                   (ex is JsonException && ex.Message.Contains("invalid"));
        }
        
        /// <summary>
        /// Gets a header value with a fallback
        /// </summary>
        private string GetHeaderValueOrDefault(HttpResponseHeaders headers, string headerName, string defaultValue = "unknown")
        {
            return headers.TryGetValues(headerName, out IEnumerable<string>? values) ? 
                values.FirstOrDefault() ?? defaultValue : defaultValue;
        }
        
        /// <summary>
        /// Executes an HTTP GET request with retry and backoff
        /// </summary>
        /// <typeparam name="T">Expected response type</typeparam>
        /// <param name="url">URL to request</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Response or default value if failed</returns>
        public Task<T?> GetWithBackoffAsync<T>(string url, CancellationToken cancellationToken = default)
        {
            return ExecuteWithBackoffAsync<T>(token => _httpClient.GetAsync(url, token), cancellationToken);
        }
        
        /// <summary>
        /// Executes an HTTP POST request with retry and backoff
        /// </summary>
        /// <typeparam name="TRequest">Request type</typeparam>
        /// <typeparam name="TResponse">Response type</typeparam>
        /// <param name="url">URL to request</param>
        /// <param name="data">Data to send</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Response or default value if failed</returns>
        public Task<TResponse?> PostWithBackoffAsync<TRequest, TResponse>(
            string url, 
            TRequest data, 
            CancellationToken cancellationToken = default)
        {
            return ExecuteWithBackoffAsync<TResponse>(async token =>
            {
                string json = JsonSerializer.Serialize(data, _jsonOptions);
                StringContent content = new(json, System.Text.Encoding.UTF8, "application/json");
                return await _httpClient.PostAsync(url, content, token);
            }, cancellationToken);
        }
        
        /// <summary>
        /// Executes an HTTP PUT request with retry and backoff
        /// </summary>
        /// <typeparam name="TRequest">Request type</typeparam>
        /// <typeparam name="TResponse">Response type</typeparam>
        /// <param name="url">URL to request</param>
        /// <param name="data">Data to send</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Response or default value if failed</returns>
        public Task<TResponse?> PutWithBackoffAsync<TRequest, TResponse>(
            string url, 
            TRequest data, 
            CancellationToken cancellationToken = default)
        {
            return ExecuteWithBackoffAsync<TResponse>(async token =>
            {
                string json = JsonSerializer.Serialize(data, _jsonOptions);
                StringContent content = new(json, System.Text.Encoding.UTF8, "application/json");
                return await _httpClient.PutAsync(url, content, token);
            }, cancellationToken);
        }
        
        /// <summary>
        /// Executes an HTTP DELETE request with retry and backoff
        /// </summary>
        /// <typeparam name="T">Expected response type</typeparam>
        /// <param name="url">URL to request</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Response or default value if failed</returns>
        public Task<T?> DeleteWithBackoffAsync<T>(string url, CancellationToken cancellationToken = default)
        {
            return ExecuteWithBackoffAsync<T>(token => _httpClient.DeleteAsync(url, token), cancellationToken);
        }
        
        /// <summary>
        /// Executes an HTTP request with retry and backoff using the specified method and content
        /// </summary>
        /// <typeparam name="T">Expected response type</typeparam>
        /// <param name="url">URL to request</param>
        /// <param name="method">HTTP method to use</param>
        /// <param name="content">Optional content to send</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Response or default value if failed</returns>
        public Task<T?> ExecuteRequestWithBackoffAsync<T>(
            string url, 
            HttpMethod method, 
            HttpContent? content = null, 
            CancellationToken cancellationToken = default)
        {
            return ExecuteWithBackoffAsync<T>(async token =>
            {
                HttpRequestMessage request = new(method, url);
                if (content != null)
                {
                    request.Content = content;
                }
                return await _httpClient.SendAsync(request, token);
            }, cancellationToken);
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
            int baseDelay = 1,
            CancellationToken cancellationToken = default)
        {
            // Create a helper with the specified parameters
            var helper = new RateLimitBackoffHelper(
                client, 
                (ILogger<RateLimitBackoffHelper>)logger, 
                maxRetries, 
                baseDelay);
                
            // Use the helper to execute the request with backoff
            return await helper.ExecuteWithBackoffAsync<T>(
                token => client.SendAsync(request, token),
                cancellationToken);
        }
    }
} 