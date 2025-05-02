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
using System.Net;
using System.Text;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Primitives;

namespace TaskTrackerAPI.Middleware;

/// <summary>
/// Middleware that provides response caching for API endpoints
/// to improve performance and reduce load on the server
/// </summary>
public class ResponseCachingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly IMemoryCache _cache;
    private readonly ILogger<ResponseCachingMiddleware> _logger;
    private readonly IConfiguration _configuration;
    
    // Default cache duration
    private readonly TimeSpan _defaultCacheDuration;
    
    // List of cacheable paths (partial matches)
    private readonly List<string> _cacheablePaths;
    
    // List of HTTP methods that can be cached (usually just GET)
    private readonly string[] _cacheableMethods = new[] { "GET" };
    
    /// <summary>
    /// Initializes a new instance of the <see cref="ResponseCachingMiddleware"/> class.
    /// </summary>
    /// <param name="next">The next middleware in the pipeline</param>
    /// <param name="cache">The memory cache instance</param>
    /// <param name="logger">The logger instance</param>
    /// <param name="configuration">The application configuration</param>
    public ResponseCachingMiddleware(
        RequestDelegate next,
        IMemoryCache cache,
        ILogger<ResponseCachingMiddleware> logger,
        IConfiguration configuration)
    {
        _next = next;
        _cache = cache;
        _logger = logger;
        _configuration = configuration;
        
        // Load settings from configuration or use defaults
        _defaultCacheDuration = TimeSpan.FromSeconds(
            _configuration.GetValue<int>("Caching:DefaultDurationSeconds", 60));
            
        _cacheablePaths = _configuration.GetSection("Caching:CacheablePaths")
            .Get<List<string>>() ?? new List<string>
            {
                "/api/categories",
                "/api/tags",
                "/api/taskstatistics"
            };
    }
    
    /// <summary>
    /// Processes the request through the middleware
    /// </summary>
    /// <param name="context">The HTTP context</param>
    /// <returns>A task representing the asynchronous operation</returns>
    public async Task InvokeAsync(HttpContext context)
    {
        // Only cache GET requests
        if (!_cacheableMethods.Contains(context.Request.Method))
        {
            await _next(context);
            return;
        }
        
        // Check if the path is cacheable
        string path = context.Request.Path.Value?.ToLowerInvariant() ?? "";
        if (!ShouldCachePath(path))
        {
            await _next(context);
            return;
        }
        
        // Generate cache key based on full URL and query params
        string cacheKey = GenerateCacheKey(context);
        
        // Try to get from cache
        if (_cache.TryGetValue(cacheKey, out CachedResponse? cachedResponse))
        {
            _logger.LogInformation("Cache hit for {CacheKey}", cacheKey);
            await ApplyCachedResponseAsync(context, cachedResponse!);
            return;
        }
        
        // Cache miss, capture the original body stream
        Stream originalBodyStream = context.Response.Body;
        
        try
        {
            // Create a new memory stream to capture the response
            using MemoryStream responseBody = new MemoryStream();
            context.Response.Body = responseBody;
            
            // Call the next middleware
            await _next(context);
            
            // Only cache successful responses
            if (context.Response.StatusCode == (int)HttpStatusCode.OK)
            {
                // Reset the memory stream position
                responseBody.Seek(0, SeekOrigin.Begin);
                
                // Read the response body
                string responseContent = await new StreamReader(responseBody).ReadToEndAsync();
                
                // Create a cached response
                Dictionary<string, string> headers = new Dictionary<string, string>();
                foreach (KeyValuePair<string, StringValues> header in context.Response.Headers)
                {
                    headers[header.Key] = header.Value.ToString();
                }
                
                CachedResponse cacheResponse = new CachedResponse
                {
                    Body = responseContent,
                    ContentType = context.Response.ContentType ?? "application/json",
                    StatusCode = context.Response.StatusCode,
                    Headers = headers
                };
                
                // Cache the response with sliding expiration
                MemoryCacheEntryOptions cacheEntryOptions = new MemoryCacheEntryOptions()
                    .SetSlidingExpiration(_defaultCacheDuration);
                    
                _cache.Set(cacheKey, cacheResponse, cacheEntryOptions);
                
                _logger.LogInformation("Cached response for {CacheKey}", cacheKey);
                
                // Reset the stream position and copy to the original stream
                responseBody.Seek(0, SeekOrigin.Begin);
                await responseBody.CopyToAsync(originalBodyStream);
            }
            else
            {
                // For non-successful responses, just copy the response
                responseBody.Seek(0, SeekOrigin.Begin);
                await responseBody.CopyToAsync(originalBodyStream);
            }
        }
        finally
        {
            // Restore the original response body
            context.Response.Body = originalBodyStream;
        }
    }
    
    /// <summary>
    /// Determines if the given path should be cached based on configuration
    /// </summary>
    /// <param name="path">The request path</param>
    /// <returns>True if the path should be cached, false otherwise</returns>
    private bool ShouldCachePath(string path)
    {
        // Check if the path matches any of the cacheable paths
        return _cacheablePaths.Any(cachePath => path.StartsWith(cachePath, StringComparison.OrdinalIgnoreCase));
    }
    
    /// <summary>
    /// Generates a unique cache key for the current request
    /// </summary>
    /// <param name="context">The HTTP context</param>
    /// <returns>A string representing the cache key</returns>
    private string GenerateCacheKey(HttpContext context)
    {
        HttpRequest request = context.Request;
        
        // Include authenticated user ID in the cache key if available
        string userPart = "";
        if (context.User.Identity?.IsAuthenticated == true)
        {
            string? userId = context.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (!string.IsNullOrEmpty(userId))
            {
                userPart = $"_user_{userId}";
            }
        }
        
        // Build cache key from the request path and query string
        string pathAndQuery = $"{request.Path}{request.QueryString}";
        
        return $"response_cache_{pathAndQuery}{userPart}";
    }
    
    /// <summary>
    /// Applies the cached response to the current context
    /// </summary>
    /// <param name="context">The HTTP context</param>
    /// <param name="cachedResponse">The cached response to apply</param>
    /// <returns>A task representing the asynchronous operation</returns>
    private async Task ApplyCachedResponseAsync(HttpContext context, CachedResponse cachedResponse)
    {
        context.Response.StatusCode = cachedResponse.StatusCode;
        context.Response.ContentType = cachedResponse.ContentType;
        
        // Apply cached headers
        foreach (KeyValuePair<string, string> header in cachedResponse.Headers)
        {
            if (!context.Response.Headers.ContainsKey(header.Key))
            {
                context.Response.Headers[header.Key] = header.Value;
            }
        }
        
        // Add header to indicate this is a cached response
        context.Response.Headers["X-Cache"] = "HIT";
        
        // Write the cached body
        await context.Response.WriteAsync(cachedResponse.Body);
    }
}

/// <summary>
/// Represents a cached HTTP response
/// </summary>
public class CachedResponse
{
    /// <summary>
    /// The body content of the response
    /// </summary>
    public required string Body { get; set; }
    
    /// <summary>
    /// The content type of the response
    /// </summary>
    public required string ContentType { get; set; }
    
    /// <summary>
    /// The HTTP status code of the response
    /// </summary>
    public int StatusCode { get; set; }
    
    /// <summary>
    /// The HTTP headers of the response
    /// </summary>
    public required Dictionary<string, string> Headers { get; set; }
} 