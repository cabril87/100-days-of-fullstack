using System.Net;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.Exceptions;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Middleware;

public class GlobalExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionHandlingMiddleware> _logger;

    public GlobalExceptionHandlingMiddleware(RequestDelegate next, ILogger<GlobalExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
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
        context.Response.ContentType = "application/json";
        
        ApiResponse<object> response = ApiResponse<object>.ServerErrorResponse("An unexpected error occurred.");

        switch (exception)
        {
            case ResourceNotFoundException notFoundEx:
                context.Response.StatusCode = (int)HttpStatusCode.NotFound;
                response = ApiResponse<object>.NotFoundResponse(notFoundEx.Message);
                break;
                
            case BadRequestException badRequestEx:
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                response = ApiResponse<object>.BadRequestResponse(badRequestEx.Message, 
                    badRequestEx.Errors?.SelectMany(e => e.Value).ToList());
                break;
                
            case ValidationException validationEx:
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                response = ApiResponse<object>.BadRequestResponse(validationEx.Message,
                    validationEx.Errors?.SelectMany(e => e.Value).ToList());
                break;
                
            case UnauthorizedException unauthorizedEx:
                context.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
                response = ApiResponse<object>.UnauthorizedResponse(unauthorizedEx.Message);
                break;
                
            case ForbiddenException forbiddenEx:
                context.Response.StatusCode = (int)HttpStatusCode.Forbidden;
                response = ApiResponse<object>.ForbiddenResponse(forbiddenEx.Message);
                break;
                
            case SecurityException securityEx:
                context.Response.StatusCode = (int)HttpStatusCode.Forbidden;
                response = ApiResponse<object>.ForbiddenResponse(securityEx.Message);
                _logger.LogWarning(securityEx, "Security violation detected");
                break;
                
            default:
                context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                _logger.LogError(exception, "An unhandled exception occurred.");
                response = ApiResponse<object>.ServerErrorResponse();
                break;
        }

        JsonSerializerOptions jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };
        
        string jsonResponse = JsonSerializer.Serialize(response, jsonOptions);
        await context.Response.WriteAsync(jsonResponse);
    }
} 