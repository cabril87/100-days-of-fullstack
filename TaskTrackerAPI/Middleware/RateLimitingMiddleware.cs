using System.Collections.Concurrent;
using System.Net;
using System.Security.Claims;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using TaskTrackerAPI.Utils;

namespace TaskTrackerAPI.Middleware;

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
        
        // Load settings from configuration or use defaults
        _defaultRateLimit = _configuration.GetValue<int>("RateLimiting:DefaultLimit", 100);
        _defaultTimeWindowInSeconds = _configuration.GetValue<int>("RateLimiting:DefaultTimeWindowSeconds", 60);
        _authEndpointRateLimit = _configuration.GetValue<int>("RateLimiting:AuthEndpointLimit", 5);
        _authEndpointTimeWindowInSeconds = _configuration.GetValue<int>("RateLimiting:AuthEndpointTimeWindowSeconds", 60);
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
        
        // Calculate remaining permits - instead of GetAllowedPermits which doesn't exist
        int remainingPermits = lease.IsAcquired ? Math.Max(0, limit - 1) : 0;
        
        // Add rate limit headers
        context.Response.Headers.Append("X-RateLimit-Limit", limit.ToString());
        context.Response.Headers.Append("X-RateLimit-Remaining", remainingPermits.ToString());
        context.Response.Headers.Append("X-RateLimit-Reset", DateTimeOffset.UtcNow.AddSeconds(timeWindow).ToUnixTimeSeconds().ToString());
        
        if (!lease.IsAcquired)
        {
            _logger.LogWarning("Rate limit exceeded for {Key}", key);
            
            // Return 429 Too Many Requests
            context.Response.StatusCode = (int)HttpStatusCode.TooManyRequests;
            context.Response.Headers.Append("Retry-After", timeWindow.ToString());
            
            var response = ApiResponse<object>.ErrorResponse(
                "Too many requests. Please try again later.", 
                (int)HttpStatusCode.TooManyRequests);
            
            await context.Response.WriteAsJsonAsync(response);
            return;
        }
        
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
        // For authenticated requests, use the user's ID
        if (context.User.Identity?.IsAuthenticated == true)
        {
            string? userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!string.IsNullOrEmpty(userId))
            {
                return $"user_{userId}_{endpoint}";
            }
        }
        
        // For unauthenticated requests, use the client's IP address
        string clientIp = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        return $"ip_{clientIp}_{endpoint}";
    }
} 