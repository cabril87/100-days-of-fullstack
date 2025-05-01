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
using System.Text.Json;
using TaskTrackerAPI.Exceptions;

namespace TaskTrackerAPI.Middleware;

/// <summary>
/// Middleware that handles exceptions globally
/// </summary>
public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;
    private readonly IWebHostEnvironment _env;
    
    public ExceptionHandlingMiddleware(
        RequestDelegate next,
        ILogger<ExceptionHandlingMiddleware> logger,
        IWebHostEnvironment env)
    {
        _next = next;
        _logger = logger;
        _env = env;
    }
    
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }
    
    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        _logger.LogError(exception, "An unhandled exception occurred");
        
        HttpStatusCode statusCode = HttpStatusCode.InternalServerError;
        string message = "An unexpected error occurred";
        object? details = null;
        
        // Determine the status code and message based on the exception type
        if (exception is NotFoundException)
        {
            statusCode = HttpStatusCode.NotFound;
            message = exception.Message;
        }
        else if (exception is BadRequestException)
        {
            statusCode = HttpStatusCode.BadRequest;
            message = exception.Message;
        }
        else if (exception is UnauthorizedException)
        {
            statusCode = HttpStatusCode.Unauthorized;
            message = exception.Message;
        }
        else if (exception is ForbiddenException)
        {
            statusCode = HttpStatusCode.Forbidden;
            message = exception.Message;
        }
        else if (exception is ConcurrencyException concurrencyEx)
        {
            statusCode = HttpStatusCode.Conflict;
            message = "A conflict occurred due to concurrent updates";
            details = concurrencyEx.Conflict;
            _logger.LogWarning("Concurrency conflict detected: {Message}", concurrencyEx.Message);
        }
        
        // Set the response code
        context.Response.StatusCode = (int)statusCode;
        context.Response.ContentType = "application/json";
        
        // Create the response
        object response = new 
        {
            status = (int)statusCode,
            message = message,
            details = details,
            debugInfo = _env.IsDevelopment() ? exception.ToString() : null
        };
        
        // Serialize and return the response
        string json = JsonSerializer.Serialize(response, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = _env.IsDevelopment(),
            PropertyNameCaseInsensitive = true
        });
        
        await context.Response.WriteAsync(json);
    }
} 