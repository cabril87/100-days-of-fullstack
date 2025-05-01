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
using System.Collections.Generic;
using System.Net;

namespace TaskTrackerAPI.Models
{
    
    /// Standard API response model for consistent response format across the application
    
    /// <typeparam name="T">Type of data being returned</typeparam>
    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public T? Data { get; set; }
        public string? Message { get; set; }
        public int StatusCode { get; set; }
        public List<string>? Errors { get; set; }

        
        /// Creates a successful response
        
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

        
        /// Creates a failed response with specific status code and error message
        
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

        
        /// Creates a not found response
        
        public static ApiResponse<T> NotFoundResponse(string message = "Resource not found")
        {
            return FailureResponse(message, (int)HttpStatusCode.NotFound);
        }

        
        /// Creates a bad request response
        
        public static ApiResponse<T> BadRequestResponse(string message, List<string>? errors = null)
        {
            return FailureResponse(message, (int)HttpStatusCode.BadRequest, errors);
        }

        
        /// Creates an unauthorized response
        
        public static ApiResponse<T> UnauthorizedResponse(string message = "Unauthorized access")
        {
            return FailureResponse(message, (int)HttpStatusCode.Unauthorized);
        }

        
        /// Creates a forbidden response
        
        public static ApiResponse<T> ForbiddenResponse(string message = "Access forbidden")
        {
            return FailureResponse(message, (int)HttpStatusCode.Forbidden);
        }

        
        /// Creates a server error response
        
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