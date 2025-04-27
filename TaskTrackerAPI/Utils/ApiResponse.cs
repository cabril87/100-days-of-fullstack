using System;
using System.Collections.Generic;
using System.Net;

namespace TaskTrackerAPI.Utils
{
    
    /// Standardized API response wrapper for consistent response format
    
    /// <typeparam name="T">The type of data being returned</typeparam>
    public class ApiResponse<T>
    {
        
        /// Indicates if the request was successful
        
        public bool Success { get; set; }
        
        
        /// HTTP status code of the response
        
        public int StatusCode { get; set; }
        
        
        /// Message providing additional information about the response
        
        public string Message { get; set; } = string.Empty;
        
        
        /// The data payload of the response
        
        public T? Data { get; set; }
        
        
        /// Collection of error details if the request failed
        
        public List<string>? Errors { get; set; }
        
        
        /// Timestamp of when the response was generated
        
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        
        /// Creates a success response
        
        /// <param name="data">The data to return</param>
        /// <param name="message">Optional success message</param>
        /// <param name="statusCode">HTTP status code (defaults to 200 OK)</param>
        /// <returns>A standardized API response indicating success</returns>
        public static ApiResponse<T> SuccessResponse(T data, string message = "Request successful", int statusCode = (int)HttpStatusCode.OK)
        {
            return new ApiResponse<T>
            {
                Success = true,
                StatusCode = statusCode,
                Message = message,
                Data = data
            };
        }

        
        /// Creates an error response
        
        /// <param name="message">Error message</param>
        /// <param name="statusCode">HTTP status code (defaults to 400 Bad Request)</param>
        /// <param name="errors">Optional list of detailed error messages</param>
        /// <returns>A standardized API response indicating failure</returns>
        public static ApiResponse<T> ErrorResponse(string message, int statusCode = (int)HttpStatusCode.BadRequest, List<string>? errors = null)
        {
            return new ApiResponse<T>
            {
                Success = false,
                StatusCode = statusCode,
                Message = message,
                Errors = errors
            };
        }

        
        /// Creates a "not found" error response
        
        /// <param name="message">Error message</param>
        /// <returns>A standardized API response for not found errors</returns>
        public static ApiResponse<T> NotFoundResponse(string message = "Resource not found")
        {
            return ErrorResponse(message, (int)HttpStatusCode.NotFound);
        }

        
        /// Creates a "bad request" error response
        
        /// <param name="message">Error message</param>
        /// <param name="errors">Optional list of detailed error messages</param>
        /// <returns>A standardized API response for bad request errors</returns>
        public static ApiResponse<T> BadRequestResponse(string message = "Invalid request", List<string>? errors = null)
        {
            return ErrorResponse(message, (int)HttpStatusCode.BadRequest, errors);
        }

        
        /// Creates a server error response
        
        /// <param name="message">Error message</param>
        /// <returns>A standardized API response for server errors</returns>
        public static ApiResponse<T> ServerErrorResponse(string message = "An unexpected error occurred")
        {
            return ErrorResponse(message, (int)HttpStatusCode.InternalServerError);
        }

        
        /// Creates an unauthorized error response
        
        /// <param name="message">Error message</param>
        /// <returns>A standardized API response for unauthorized errors</returns>
        public static ApiResponse<T> UnauthorizedResponse(string message = "Unauthorized access")
        {
            return ErrorResponse(message, (int)HttpStatusCode.Unauthorized);
        }

        
        /// Creates a forbidden error response
        
        /// <param name="message">Error message</param>
        /// <returns>A standardized API response for forbidden errors</returns>
        public static ApiResponse<T> ForbiddenResponse(string message = "Access forbidden")
        {
            return ErrorResponse(message, (int)HttpStatusCode.Forbidden);
        }
    }
} 