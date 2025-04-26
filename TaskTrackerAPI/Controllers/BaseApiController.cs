using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using TaskTrackerAPI.Models;
using System;
using System.Security.Claims;

namespace TaskTrackerAPI.Controllers
{
    /// <summary>
    /// Base controller class that provides standardized response methods for API controllers
    /// </summary>
    [ApiController]
    public abstract class BaseApiController : ControllerBase
    {
        /// <summary>
        /// Creates a successful response with the provided data
        /// </summary>
        protected ActionResult<ApiResponse<T>> ApiOk<T>(T data, string? message = null)
        {
            return Ok(ApiResponse<T>.SuccessResponse(data, message));
        }

        /// <summary>
        /// Creates a successful response with no data (204 No Content)
        /// </summary>
        protected ActionResult ApiNoContent(string? message = null)
        {
            return NoContent();
        }
        
        /// <summary>
        /// Creates a created response (201 Created) with the provided data
        /// </summary>
        protected ActionResult<ApiResponse<T>> ApiCreated<T>(T data, string? routeName = null, object? routeValues = null, string? message = null) where T : class
        {
            ApiResponse<T> response = ApiResponse<T>.SuccessResponse(data, message);
            response.StatusCode = 201;
            
            if (routeName != null && routeValues != null)
            {
                return CreatedAtRoute(routeName, routeValues, response);
            }
            
            return StatusCode(201, response);
        }

        /// <summary>
        /// Creates a not found response (404)
        /// </summary>
        protected ActionResult<ApiResponse<T>> ApiNotFound<T>(string message = "Resource not found")
        {
            return NotFound(ApiResponse<T>.NotFoundResponse(message));
        }

        /// <summary>
        /// Creates a bad request response (400)
        /// </summary>
        protected ActionResult<ApiResponse<T>> ApiBadRequest<T>(string message, List<string>? errors = null) where T : class
        {
            return BadRequest(ApiResponse<T>.BadRequestResponse(message, errors));
        }

        /// <summary>
        /// Creates a server error response (500)
        /// </summary>
        protected ActionResult<ApiResponse<T>> ApiServerError<T>(string message = "An unexpected error occurred")
        {
            return StatusCode(500, ApiResponse<T>.ServerErrorResponse(message));
        }
        
        /// <summary>
        /// Creates an unauthorized response (401)
        /// </summary>
        protected ActionResult<ApiResponse<T>> ApiUnauthorized<T>(string message = "Unauthorized access") where T : class
        {
            return Unauthorized(ApiResponse<T>.UnauthorizedResponse(message));
        }
        
        /// <summary>
        /// Creates a forbidden response (403)
        /// </summary>
        protected ActionResult<ApiResponse<T>> ApiForbidden<T>(string message = "Access forbidden")
        {
            return StatusCode(403, ApiResponse<T>.ForbiddenResponse(message));
        }

        protected ActionResult<ApiResponse<T>> OkApiResponse<T>(T data, string? message = null)
        {
            ApiResponse<T> response = ApiResponse<T>.SuccessResponse(data, message);
            return Ok(response);
        }

        protected int GetUserIdFromClaims()
        {
            if (User.Identity?.IsAuthenticated != true)
                throw new UnauthorizedAccessException("User is not authenticated");
                
            string userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ??
                        throw new InvalidOperationException("User ID claim not found");
                
            return int.TryParse(userId, out int id) 
                ? id 
                : throw new InvalidOperationException("User ID is not a valid integer");
        }
        
        /// <summary>
        /// Gets the current user's ID from claims
        /// </summary>
        /// <returns>The authenticated user's ID</returns>
        protected int GetUserId()
        {
            return GetUserIdFromClaims();
        }
    }
} 