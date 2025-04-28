using System;
using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.DependencyInjection;
using TaskTrackerAPI.Utils;

namespace TaskTrackerAPI.Attributes;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = false)]
public class RateLimitAttribute : ActionFilterAttribute
{
    private readonly int _maxRequests;
    private readonly int _timeWindowInSeconds;

    public RateLimitAttribute(int maxRequests = 30, int timeWindowInSeconds = 15)
    {
        _maxRequests = maxRequests;
        _timeWindowInSeconds = timeWindowInSeconds;
    }

    public override async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var memoryCache = context.HttpContext.RequestServices.GetRequiredService<IMemoryCache>();
        var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<RateLimitAttribute>>();

        // Get the client's identity (IP or user ID)
        string clientKey = GetClientKey(context);
        
        // Cache key for this specific endpoint
        string endpoint = $"{context.HttpContext.Request.Path}_{context.HttpContext.Request.Method}";
        string cacheKey = $"RateLimit_{clientKey}_{endpoint}";
        
        // Check if the client has records in the cache
        if (!memoryCache.TryGetValue(cacheKey, out RateLimitInfo? rateLimitInfo))
        {
            // First request, create new record
            rateLimitInfo = new RateLimitInfo
            {
                Counter = 1,
                FirstRequest = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddSeconds(_timeWindowInSeconds)
            };
        }
        else if (rateLimitInfo != null)
        {
            // Check if the time window has elapsed
            if (DateTime.UtcNow > rateLimitInfo.ExpiresAt)
            {
                // Reset the counter
                rateLimitInfo.Counter = 1;
                rateLimitInfo.FirstRequest = DateTime.UtcNow;
                rateLimitInfo.ExpiresAt = DateTime.UtcNow.AddSeconds(_timeWindowInSeconds);
            }
            else
            {
                // Increment the counter
                rateLimitInfo.Counter++;
            }
        }

        // Store in cache
        if (rateLimitInfo != null)
        {
            memoryCache.Set(cacheKey, rateLimitInfo, rateLimitInfo.ExpiresAt);
            
            // Add headers to show rate limit info
            context.HttpContext.Response.Headers.Append("X-RateLimit-Limit", _maxRequests.ToString());
            context.HttpContext.Response.Headers.Append("X-RateLimit-Remaining", Math.Max(0, _maxRequests - rateLimitInfo.Counter).ToString());
            context.HttpContext.Response.Headers.Append("X-RateLimit-Reset", new DateTimeOffset(rateLimitInfo.ExpiresAt).ToUnixTimeSeconds().ToString());

            // Check if the client has exceeded the rate limit
            if (rateLimitInfo.Counter > _maxRequests)
            {
                logger.LogWarning("Rate limit exceeded for client {ClientKey} on endpoint {Endpoint}", clientKey, endpoint);
                
                // Return 429 Too Many Requests
                context.HttpContext.Response.StatusCode = (int)HttpStatusCode.TooManyRequests;
                context.HttpContext.Response.Headers.Append("Retry-After", _timeWindowInSeconds.ToString());
                
                var response = ApiResponse<object>.ErrorResponse(
                    "Too many requests. Please try again later.", 
                    (int)HttpStatusCode.TooManyRequests);
                
                await context.HttpContext.Response.WriteAsJsonAsync(response);
                context.Result = new EmptyResult();
                return;
            }
        }

        // Continue with the request
        await next();
    }

    private string GetClientKey(ActionExecutingContext context)
    {
        // If authenticated, use user ID
        if (context.HttpContext.User.Identity?.IsAuthenticated == true)
        {
            string? userId = context.HttpContext.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (!string.IsNullOrEmpty(userId))
            {
                return $"user_{userId}";
            }
        }
        
        // Otherwise use IP address
        string ip = context.HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        return $"ip_{ip}";
    }

    private class RateLimitInfo
    {
        public int Counter { get; set; }
        public DateTime FirstRequest { get; set; }
        public DateTime ExpiresAt { get; set; }
    }
} 