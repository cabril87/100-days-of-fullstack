using System.Collections.Generic;
using System.Net;

namespace TaskTrackerAPI.Models
{
    /// <summary>
    /// Standard API response model for consistent response format across the application
    /// </summary>
    /// <typeparam name="T">Type of data being returned</typeparam>
    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public T? Data { get; set; }
        public string? Message { get; set; }
        public int StatusCode { get; set; }
        public List<string>? Errors { get; set; }

        /// <summary>
        /// Creates a successful response
        /// </summary>
        public static ApiResponse<T> SuccessResponse(T data, string? message = null)
        {
            return new ApiResponse<T>
            {
                Success = true,
                Data = data,
                Message = message,
                StatusCode = (int)HttpStatusCode.OK
            };
        }

        /// <summary>
        /// Creates a failed response with specific status code and error message
        /// </summary>
        public static ApiResponse<T> FailureResponse(string message, int statusCode, List<string>? errors = null)
        {
            return new ApiResponse<T>
            {
                Success = false,
                Message = message,
                StatusCode = statusCode,
                Errors = errors
            };
        }

        /// <summary>
        /// Creates a not found response
        /// </summary>
        public static ApiResponse<T> NotFoundResponse(string message = "Resource not found")
        {
            return FailureResponse(message, (int)HttpStatusCode.NotFound);
        }

        /// <summary>
        /// Creates a bad request response
        /// </summary>
        public static ApiResponse<T> BadRequestResponse(string message, List<string>? errors = null)
        {
            return FailureResponse(message, (int)HttpStatusCode.BadRequest, errors);
        }

        /// <summary>
        /// Creates an unauthorized response
        /// </summary>
        public static ApiResponse<T> UnauthorizedResponse(string message = "Unauthorized access")
        {
            return FailureResponse(message, (int)HttpStatusCode.Unauthorized);
        }

        /// <summary>
        /// Creates a forbidden response
        /// </summary>
        public static ApiResponse<T> ForbiddenResponse(string message = "Access forbidden")
        {
            return FailureResponse(message, (int)HttpStatusCode.Forbidden);
        }

        /// <summary>
        /// Creates a server error response
        /// </summary>
        public static ApiResponse<T> ServerErrorResponse(string message = "An unexpected error occurred")
        {
            return FailureResponse(message, (int)HttpStatusCode.InternalServerError);
        }

        public static ApiResponse<T> ErrorResponse(string message)
        {
            return new ApiResponse<T>
            {
                Success = false,
                Message = message,
                Data = default
            };
        }
    }
}