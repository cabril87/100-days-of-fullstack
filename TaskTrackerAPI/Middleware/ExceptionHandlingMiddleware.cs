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
using System.IO;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
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
        
        // Check if response has already started or if we can't write to it
        if (context.Response.HasStarted)
        {
            _logger.LogWarning("Cannot write to response. Response has already started.");
            return;
        }
        
        // Additional check for response body stream
        try
        {
            if (context.Response.Body == null || !context.Response.Body.CanWrite)
            {
                _logger.LogWarning("Cannot write to response. Response body is not writable.");
                return;
            }
        }
        catch (ObjectDisposedException)
        {
            _logger.LogWarning("Cannot write to response. Response body stream is disposed.");
            return;
        }
        
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
        
        try
        {
            // Double-check response state before attempting to write
            if (context.Response.HasStarted)
            {
                _logger.LogWarning("Response started during exception processing, aborting write attempt.");
                return;
            }
            
            // Set the response code and content type with additional safety checks
            context.Response.StatusCode = (int)statusCode;
            context.Response.ContentType = "application/json";
            
            // Create the response
            object response = new 
            {
                status = (int)statusCode,
                message = message,
                details = details,
                timestamp = DateTime.UtcNow
            };
            
            // Serialize the response
            string json = JsonSerializer.Serialize(response, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = false, // Disable indenting in production
                PropertyNameCaseInsensitive = true
            });
            
            // Final check before writing
            if (!context.Response.HasStarted && context.Response.Body != null && context.Response.Body.CanWrite)
            {
                await context.Response.WriteAsync(json);
                _logger.LogDebug("Successfully wrote error response for status code {StatusCode}", statusCode);
            }
            else
            {
                _logger.LogWarning("Cannot write error response - response state changed during processing");
            }
        }
        catch (ObjectDisposedException ex)
        {
            _logger.LogWarning(ex, "Cannot write to response. Response stream is disposed.");
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Cannot write to response. Response is in an invalid state.");
        }
        catch (IOException ex)
        {
            _logger.LogWarning(ex, "Cannot write to response. I/O error occurred.");
        }
        catch (Exception writeEx)
        {
            _logger.LogError(writeEx, "Unexpected error writing exception response");
        }
    }
} 