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
using System.Diagnostics;
using System.Net;
using System.Security.Claims;
using System.Threading.RateLimiting;
using Microsoft.Extensions.Caching.Memory;
using TaskTrackerAPI.Services.Interfaces;
using TaskTrackerAPI.Utils;

namespace TaskTrackerAPI.Middleware;

/// <summary>
/// Advanced middleware that implements adaptive rate limiting based on subscription tier,
/// server load, and circuit breaker pattern to prevent cascading failures
/// </summary>
public class AdaptiveRateLimitingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<AdaptiveRateLimitingMiddleware> _logger;
    private readonly IMemoryCache _cache;
    private readonly IConfiguration _configuration;
    private readonly IUserSubscriptionService _userSubscriptionService;
    private readonly string _highLoadCircuitName;
    
    // Cache for rate limiters
    private readonly ConcurrentDictionary<string, FixedWindowRateLimiter> _limiters = new();
    
    // Process performance counters
    private readonly PerformanceCounter? _cpuCounter;
    private readonly PerformanceCounter? _memoryCounter;
    private DateTime _lastPerformanceCheck = DateTime.MinValue;
    private double _currentCpuUsage;
    private double _currentMemoryUsage;
    private bool _isHighLoad;
    
    // Rate limiting settings
    private readonly int _performanceCheckIntervalSeconds;
    private readonly int _highLoadThresholdPercent;
    private readonly int _highLoadReductionPercent;
    private readonly int _circuitBreakerFailureThreshold;
    private readonly int _circuitBreakerRecoverySeconds;
    
    public AdaptiveRateLimitingMiddleware(
        RequestDelegate next,
        ILogger<AdaptiveRateLimitingMiddleware> logger,
        IMemoryCache cache,
        IConfiguration configuration,
        IUserSubscriptionService userSubscriptionService)
    {
        _next = next;
        _logger = logger;
        _cache = cache;
        _configuration = configuration;
        _userSubscriptionService = userSubscriptionService;
        
        // Load configuration settings
        _performanceCheckIntervalSeconds = _configuration.GetValue<int>("RateLimiting:PerformanceCheckIntervalSeconds", 30);
        _highLoadThresholdPercent = _configuration.GetValue<int>("RateLimiting:HighLoadThresholdPercent", 80);
        _highLoadReductionPercent = _configuration.GetValue<int>("RateLimiting:HighLoadReductionPercent", 50);
        _circuitBreakerFailureThreshold = _configuration.GetValue<int>("RateLimiting:CircuitBreakerFailureThreshold", 5);
        _circuitBreakerRecoverySeconds = _configuration.GetValue<int>("RateLimiting:CircuitBreakerRecoverySeconds", 60);
        _highLoadCircuitName = _configuration.GetValue<string>("RateLimiting:HighLoadCircuitName", "system_high_load");
        
        // Initialize performance counters if on Windows (in Linux/Docker these would need to be replaced with appropriate metrics)
        try
        {
            if (OperatingSystem.IsWindows())
            {
                _cpuCounter = new PerformanceCounter("Processor", "% Processor Time", "_Total", true);
                _memoryCounter = new PerformanceCounter("Memory", "% Committed Bytes In Use", true);
                _logger.LogInformation("Performance counters initialized successfully");
            }
            else
            {
                _logger.LogInformation("Performance counters not initialized (non-Windows environment)");
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to initialize performance counters - adaptive rate limiting will use fallback mode");
        }
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Check system load periodically
        CheckSystemLoad();
        
        // Get user ID from claims
        int userId = 0;
        if (context.User.Identity?.IsAuthenticated == true)
        {
            string? userIdStr = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!string.IsNullOrEmpty(userIdStr) && int.TryParse(userIdStr, out int parsedId))
            {
                userId = parsedId;
            }
        }
        
        string endpoint = context.Request.Path.Value?.ToLowerInvariant() ?? "";
        
        // Check if user has exceeded their daily quota
        if (userId > 0 && await _userSubscriptionService.HasUserExceededDailyQuotaAsync(userId))
        {
            (int remaining, DateTime resetTime) = await _userSubscriptionService.GetRemainingQuotaAsync(userId);
            
            _logger.LogWarning("User {UserId} has exceeded their daily API quota", userId);
            
            context.Response.StatusCode = (int)HttpStatusCode.TooManyRequests;
            context.Response.Headers.Append("Retry-After", ((int)(resetTime - DateTime.UtcNow).TotalSeconds).ToString());
            context.Response.Headers.Append("X-Rate-Limit-Daily-Reset", new DateTimeOffset(resetTime).ToUnixTimeSeconds().ToString());
            
            await context.Response.WriteAsJsonAsync(new
            {
                Success = false,
                StatusCode = (int)HttpStatusCode.TooManyRequests,
                Message = "Daily API quota exceeded. Quota will reset at the start of the next day (UTC).",
                DailyQuota = new
                {
                    Remaining = 0,
                    ResetTime = resetTime
                }
            });
            
            return;
        }
        
        // Check if this is a trusted system account that can bypass rate limits
        bool isTrustedAccount = userId > 0 && await _userSubscriptionService.IsTrustedSystemAccountAsync(userId);
        
        // Only continue with rate limiting for non-trusted accounts
        if (!isTrustedAccount)
        {
            // Get appropriate rate limit based on subscription tier and endpoint
            (int limit, int timeWindow) = userId > 0
                ? await _userSubscriptionService.GetRateLimitForUserAndEndpointAsync(userId, endpoint)
                : GetDefaultRateLimits(endpoint);
                
            // Apply reduction if system is under high load
            if (_isHighLoad)
            {
                limit = ApplyHighLoadReduction(limit);
            }
            
            // Create the rate limiter key
            string key = userId > 0
                ? $"user_{userId}_{endpoint}"
                : $"ip_{context.Connection.RemoteIpAddress}_{endpoint}";
            
            // Get or create a rate limiter for this key
            FixedWindowRateLimiter limiter = _limiters.GetOrAdd(key, _ => new FixedWindowRateLimiter(new FixedWindowRateLimiterOptions
            {
                PermitLimit = limit,
                Window = TimeSpan.FromSeconds(timeWindow),
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 0 // Don't queue requests
            }));
            
            // Try to acquire a permit
            using RateLimitLease lease = await limiter.AcquireAsync(1);
            
            // Add rate limit headers
            int remainingPermits = lease.IsAcquired ? Math.Max(0, limit - 1) : 0;
            context.Response.Headers.Append("X-RateLimit-Limit", limit.ToString());
            context.Response.Headers.Append("X-RateLimit-Remaining", remainingPermits.ToString());
            context.Response.Headers.Append("X-RateLimit-Reset", DateTimeOffset.UtcNow.AddSeconds(timeWindow).ToUnixTimeSeconds().ToString());
            
            // If high load, add a warning header
            if (_isHighLoad)
            {
                context.Response.Headers.Append("X-System-Load", "high");
                context.Response.Headers.Append("X-Rate-Limit-Reduced", "true");
            }
            
            // If rate limit exceeded, return 429 response
            if (!lease.IsAcquired)
            {
                _logger.LogWarning("Rate limit exceeded for {Key}", key);
                
                context.Response.StatusCode = (int)HttpStatusCode.TooManyRequests;
                context.Response.Headers.Append("Retry-After", timeWindow.ToString());
                
                await context.Response.WriteAsJsonAsync(new
                {
                    Success = false,
                    StatusCode = (int)HttpStatusCode.TooManyRequests,
                    Message = "Rate limit exceeded. Please try again later.",
                    RetryAfter = timeWindow
                });
                
                return;
            }
            
            // Increment the user's API usage counter if authenticated
            if (userId > 0)
            {
                try
                {
                    await _userSubscriptionService.IncrementUserApiUsageAsync(userId);
                }
                catch (Exception ex)
                {
                    // Don't fail the request if quota tracking fails
                    _logger.LogError(ex, "Failed to increment API usage for user {UserId}", userId);
                }
            }
        }
        else
        {
            // For trusted accounts, just add a header indicating they're exempt
            context.Response.Headers.Append("X-RateLimit-Status", "exempt");
        }
        
        // Use circuit breaker to protect downstream services
        CircuitBreaker circuitBreaker = CircuitBreaker.GetOrCreate(
            _highLoadCircuitName,
            _circuitBreakerFailureThreshold,
            _circuitBreakerRecoverySeconds,
            _logger as ILogger<CircuitBreaker>);
        
        if (_isHighLoad && circuitBreaker.State == CircuitState.Open)
        {
            // If the circuit is open under high load, only allow trusted system accounts
            if (!isTrustedAccount)
            {
                _logger.LogWarning("Circuit breaker open during high load - request blocked");
                
                context.Response.StatusCode = (int)HttpStatusCode.ServiceUnavailable;
                context.Response.Headers.Append("Retry-After", "60");
                
                await context.Response.WriteAsJsonAsync(new
                {
                    Success = false,
                    StatusCode = (int)HttpStatusCode.ServiceUnavailable,
                    Message = "Service temporarily unavailable due to high system load. Please try again later.",
                    RetryAfter = 60
                });
                
                return;
            }
        }
        
        // Continue with the request using the circuit breaker
        bool executed = await circuitBreaker.ExecuteActionAsync(async () =>
        {
            await _next(context);
        });
        
        // If circuit breaker blocked the request
        if (!executed)
        {
            _logger.LogWarning("Circuit breaker prevented request execution");
            
            context.Response.StatusCode = (int)HttpStatusCode.ServiceUnavailable;
            context.Response.Headers.Append("Retry-After", _circuitBreakerRecoverySeconds.ToString());
            
            await context.Response.WriteAsJsonAsync(new
            {
                Success = false,
                StatusCode = (int)HttpStatusCode.ServiceUnavailable,
                Message = "Service temporarily unavailable. Please try again later.",
                RetryAfter = _circuitBreakerRecoverySeconds
            });
        }
    }
    
    /// <summary>
    /// Get default rate limits for anonymous users
    /// </summary>
    private (int limit, int timeWindow) GetDefaultRateLimits(string endpoint)
    {
        // Lower limits for authentication endpoints to prevent brute force
        if (endpoint.Contains("/api/auth/login") || 
            endpoint.Contains("/api/auth/register") || 
            endpoint.Contains("/api/auth/refresh-token"))
        {
            return (_configuration.GetValue<int>("RateLimiting:AuthEndpointLimit", 5), 
                _configuration.GetValue<int>("RateLimiting:AuthEndpointTimeWindowSeconds", 60));
        }
        
        // Lower limits for task related endpoints
        if (endpoint.Contains("/api/tasks") || endpoint.Contains("/api/taskitems"))
        {
            return (_configuration.GetValue<int>("RateLimiting:TaskEndpointLimit", 20), 
                _configuration.GetValue<int>("RateLimiting:TaskEndpointTimeWindowSeconds", 30));
        }
        
        // Default rate limit for all other endpoints
        return (_configuration.GetValue<int>("RateLimiting:DefaultLimit", 30), 
            _configuration.GetValue<int>("RateLimiting:DefaultTimeWindowSeconds", 60));
    }
    
    /// <summary>
    /// Applies a reduction to the rate limit based on high system load
    /// </summary>
    private int ApplyHighLoadReduction(int limit)
    {
        // Apply the configured percentage reduction
        int reducedLimit = limit * (100 - _highLoadReductionPercent) / 100;
        
        // Ensure we always have at least a minimal limit
        return Math.Max(reducedLimit, 5);
    }
    
    /// <summary>
    /// Checks the system load and updates the high load flag
    /// </summary>
    private void CheckSystemLoad()
    {
        // Only check performance periodically
        if ((DateTime.UtcNow - _lastPerformanceCheck).TotalSeconds < _performanceCheckIntervalSeconds)
        {
            return;
        }
        
        try
        {
            _lastPerformanceCheck = DateTime.UtcNow;
            
            if (_cpuCounter != null && _memoryCounter != null)
            {
                // Get CPU and memory usage
                _currentCpuUsage = _cpuCounter.NextValue();
                _currentMemoryUsage = _memoryCounter.NextValue();
                
                // Wait a moment for more accurate CPU reading (first reading is often 0)
                if (_currentCpuUsage < 0.1)
                {
                    Thread.Sleep(1000);
                    _currentCpuUsage = _cpuCounter.NextValue();
                }
                
                bool wasHighLoad = _isHighLoad;
                
                // Check if we're in a high load situation
                _isHighLoad = _currentCpuUsage > _highLoadThresholdPercent || 
                              _currentMemoryUsage > _highLoadThresholdPercent;
                
                // If load state changed, log it
                if (wasHighLoad != _isHighLoad)
                {
                    if (_isHighLoad)
                    {
                        _logger.LogWarning(
                            "System under high load detected (CPU: {CpuUsage}%, Memory: {MemoryUsage}%). Rate limits reduced by {ReductionPercent}%",
                            Math.Round(_currentCpuUsage, 1), Math.Round(_currentMemoryUsage, 1), _highLoadReductionPercent);
                    }
                    else
                    {
                        _logger.LogInformation(
                            "System returned to normal load (CPU: {CpuUsage}%, Memory: {MemoryUsage}%). Rate limits restored",
                            Math.Round(_currentCpuUsage, 1), Math.Round(_currentMemoryUsage, 1));
                    }
                }
                
                // Update circuit breaker state if needed
                CircuitBreaker circuitBreaker = CircuitBreaker.GetOrCreate(
                    _highLoadCircuitName,
                    _circuitBreakerFailureThreshold,
                    _circuitBreakerRecoverySeconds);
                
                if (_isHighLoad && circuitBreaker.State == CircuitState.Closed)
                {
                    // If load is extremely high, trip the circuit breaker
                    if (_currentCpuUsage > 95 || _currentMemoryUsage > 95)
                    {
                        circuitBreaker.Trip();
                        _logger.LogWarning("Circuit breaker tripped due to extreme system load");
                    }
                }
                else if (!_isHighLoad && circuitBreaker.State == CircuitState.Open)
                {
                    // If load is back to normal, reset the circuit breaker
                    circuitBreaker.Reset();
                    _logger.LogInformation("Circuit breaker reset as system load returned to normal");
                }
            }
            else
            {
                // Fallback if performance counters not available
                // This could be replaced with Linux-specific metrics or Docker metrics
                _isHighLoad = false;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking system load");
            _isHighLoad = false;
        }
    }
} 