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
using System.Collections.Concurrent;
using System.Net;
using System.Security.Claims;
using System.Threading.RateLimiting;
using Microsoft.Extensions.Caching.Memory;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using System.Threading.Tasks;
using System;

namespace TaskTrackerAPI.Middleware;

/// <summary>
/// Middleware that implements rate limiting to prevent abuse of the API
/// </summary>
public class RateLimitingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RateLimitingMiddleware> _logger;
    private readonly IMemoryCache _cache;
    private readonly IConfiguration _configuration;
    
    // Rate limiting settings with defaults
    private readonly int _defaultRateLimit;
    private readonly int _defaultTimeWindowInSeconds;
    private readonly int _authEndpointRateLimit;
    private readonly int _authEndpointTimeWindowInSeconds;
    private readonly int _maxRetryCount;
    private readonly int _baseBackoffDelaySeconds;
    
    // Cache for rate limiters
    private readonly ConcurrentDictionary<string, FixedWindowRateLimiter> _limiters = new();

    public RateLimitingMiddleware(
        RequestDelegate next,
        ILogger<RateLimitingMiddleware> logger,
        IMemoryCache cache,
        IConfiguration configuration)
    {
        _next = next;
        _logger = logger;
        _cache = cache;
        _configuration = configuration;
        
        _defaultRateLimit = _configuration.GetValue<int>("RateLimiting:DefaultLimit", 100);
        _defaultTimeWindowInSeconds = _configuration.GetValue<int>("RateLimiting:DefaultTimeWindowSeconds", 60);
        _authEndpointRateLimit = _configuration.GetValue<int>("RateLimiting:AuthEndpointLimit", 5);
        _authEndpointTimeWindowInSeconds = _configuration.GetValue<int>("RateLimiting:AuthEndpointTimeWindowSeconds", 60);
        _maxRetryCount = _configuration.GetValue<int>("RateLimiting:MaxRetryCount", 5);
        _baseBackoffDelaySeconds = _configuration.GetValue<int>("RateLimiting:BaseBackoffDelaySeconds", 1);
    }

    public async Task InvokeAsync(HttpContext context)
    {
        string endpoint = context.Request.Path.Value?.ToLowerInvariant() ?? "";
        
        // Get appropriate rate limit based on the endpoint
        (int limit, int timeWindow) = GetRateLimitForEndpoint(endpoint);
        
        // Determine the key for rate limiting (userId for authenticated users, IP for unauthenticated)
        string key = GetRateLimitKey(context, endpoint);
        
        // Get or create a rate limiter for this key
        FixedWindowRateLimiter limiter = _limiters.GetOrAdd(key, _ => new FixedWindowRateLimiter(new FixedWindowRateLimiterOptions
        {
            PermitLimit = limit,
            Window = TimeSpan.FromSeconds(timeWindow),
            QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
            QueueLimit = 0 // Don't queue requests
        }));
        
        using RateLimitLease lease = await limiter.AcquireAsync(1);
        
        // Calculate remaining permits
        int remainingPermits = lease.IsAcquired ? Math.Max(0, limit - 1) : 0;
        
        // Add rate limit headers
        context.Response.Headers.Append("X-RateLimit-Limit", limit.ToString());
        context.Response.Headers.Append("X-RateLimit-Remaining", remainingPermits.ToString());
        context.Response.Headers.Append("X-RateLimit-Reset", DateTimeOffset.UtcNow.AddSeconds(timeWindow).ToUnixTimeSeconds().ToString());
        
        if (!lease.IsAcquired)
        {
            _logger.LogWarning("Rate limit exceeded for {Key}", key);
            
            // Get retry count if it exists in cache
            string retryKey = $"RetryCount_{key}";
            int retryCount = _cache.TryGetValue(retryKey, out int cachedCount) ? cachedCount + 1 : 1;
            
            // Store retry count with expiration
            _cache.Set(retryKey, retryCount, TimeSpan.FromSeconds(timeWindow * 2));
            
            // Calculate backoff time with exponential backoff and jitter
            int baseDelay = _baseBackoffDelaySeconds;
            int maxDelay = timeWindow;
            
            // Exponential backoff: baseDelay * (2^retryCount)
            double exponentialDelay = baseDelay * Math.Pow(2, Math.Min(retryCount, _maxRetryCount));
            
            // Apply jitter (random value between 0-1 seconds)
            Random random = new Random();
            double jitter = random.NextDouble();
            
            // Cap the delay at the time window
            int retryAfterSeconds = (int)Math.Min(exponentialDelay + jitter, maxDelay);
            
            // Return 429 Too Many Requests
            context.Response.StatusCode = (int)HttpStatusCode.TooManyRequests;
            context.Response.Headers.Append("Retry-After", retryAfterSeconds.ToString());
            context.Response.Headers.Append("X-Backoff-Strategy", "exponential");
            context.Response.Headers.Append("X-Retry-Count", retryCount.ToString());
            context.Response.Headers.Append("X-Max-Retry", _maxRetryCount.ToString());
            
            object response = new
            {
                Success = false,
                StatusCode = (int)HttpStatusCode.TooManyRequests,
                Message = "Rate limit exceeded. Please try again later.",
                RetryAfter = retryAfterSeconds,
                RetryCount = retryCount,
                MaxRetry = _maxRetryCount,
                BackoffStrategy = new
                {
                    Type = "exponential",
                    BaseDelay = baseDelay,
                    Formula = "delay = baseDelay * (2^retryAttempt) + jitter",
                    Jitter = true
                }
            };
            
            await context.Response.WriteAsJsonAsync(response);
            return;
        }
        
        // Reset retry count on successful request
        string successRetryKey = $"RetryCount_{key}";
        _cache.Remove(successRetryKey);
        
        // Continue with the request
        await _next(context);
    }
    
    private (int limit, int timeWindow) GetRateLimitForEndpoint(string endpoint)
    {
        // Lower limits for authentication endpoints to prevent brute force
        if (endpoint.Contains("/api/auth/login") || 
            endpoint.Contains("/api/auth/register") || 
            endpoint.Contains("/api/auth/refresh-token"))
        {
            return (_authEndpointRateLimit, _authEndpointTimeWindowInSeconds);
        }
        
        // Lower limits for task related endpoints
        if (endpoint.Contains("/api/tasks") || endpoint.Contains("/api/taskitems"))
        {
            return (_configuration.GetValue<int>("RateLimiting:TaskEndpointLimit", 50), 
                _configuration.GetValue<int>("RateLimiting:TaskEndpointTimeWindowSeconds", 30));
        }
        
        // Default rate limit for all other endpoints
        return (_defaultRateLimit, _defaultTimeWindowInSeconds);
    }
    
    private string GetRateLimitKey(HttpContext context, string endpoint)
    {
        // Get user ID if authenticated
        if (context.User.Identity?.IsAuthenticated == true)
        {
            string? userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!string.IsNullOrEmpty(userId))
            {
                return $"user_{userId}_{endpoint}";
            }
        }
        
        // Fall back to client IP if not authenticated
        string? clientIp = context.Connection.RemoteIpAddress?.ToString();
        return $"ip_{clientIp}_{endpoint}";
    }
} 