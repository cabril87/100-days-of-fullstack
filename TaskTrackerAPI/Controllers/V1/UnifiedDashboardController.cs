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

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using System.Threading.Tasks;
using TaskTrackerAPI.Attributes;
using TaskTrackerAPI.Controllers.V2;
using TaskTrackerAPI.DTOs.Dashboard;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Services.Interfaces;

namespace TaskTrackerAPI.Controllers.V1
{
    /// <summary>
    /// Unified dashboard controller - provides comprehensive dashboard data in a single API call
    /// Designed to optimize frontend performance by eliminating multiple API requests
    /// Enterprise-grade dashboard data aggregation with caching and performance optimization
    /// Accessible to all authenticated users (RegularUser and above)
    /// </summary>
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/[controller]")]
    [ApiController]
    [Authorize]
    [RequireRole(UserRole.RegularUser)]
    [SecurityRequirements(SecurityRequirementLevel.Authenticated)]
    [RateLimit(200, 60)] // Higher limit for dashboard endpoint due to comprehensive data
    public class UnifiedDashboardController : BaseApiController
    {
        private readonly IUnifiedDashboardService _unifiedDashboardService;
        private readonly ILogger<UnifiedDashboardController> _logger;

        /// <summary>
        /// Initializes a new instance of the UnifiedDashboardController class
        /// </summary>
        /// <param name="unifiedDashboardService">Service for unified dashboard data aggregation</param>
        /// <param name="logger">Logger instance for logging</param>
        public UnifiedDashboardController(
            IUnifiedDashboardService unifiedDashboardService,
            ILogger<UnifiedDashboardController> logger)
        {
            _unifiedDashboardService = unifiedDashboardService ?? throw new ArgumentNullException(nameof(unifiedDashboardService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Gets comprehensive dashboard data for the current user in a single API call
        /// Aggregates data from multiple services including:
        /// - User statistics and metrics
        /// - Gamification data (points, achievements, badges)
        /// - Recent tasks and task summaries
        /// - Family information and leaderboards
        /// - System status and notifications
        /// </summary>
        /// <returns>Unified dashboard response containing all dashboard data</returns>
        /// <response code="200">Dashboard data retrieved successfully</response>
        /// <response code="401">Unauthorized - user not authenticated</response>
        /// <response code="403">Forbidden - user lacks required permissions</response>
        /// <response code="500">Internal server error</response>
        [HttpGet("unified")]
        [ProducesResponseType(typeof(ApiResponse<UnifiedDashboardResponseDTO>), 200)]
        [ProducesResponseType(typeof(ApiResponse<string>), 401)]
        [ProducesResponseType(typeof(ApiResponse<string>), 403)]
        [ProducesResponseType(typeof(ApiResponse<string>), 500)]
        public async Task<ActionResult<ApiResponse<UnifiedDashboardResponseDTO>>> GetUnifiedDashboard()
        {
            try
            {
                int userId = GetUserId();
                
                _logger.LogInformation("Unified dashboard request initiated for user {UserId}", userId);

                UnifiedDashboardResponseDTO dashboardData = await _unifiedDashboardService.GetUnifiedDashboardDataAsync(userId);

                _logger.LogInformation("Unified dashboard data successfully retrieved for user {UserId} in {ResponseTime}ms", 
                    userId, dashboardData.Metadata.ResponseTimeMs);

                // Add cache headers for frontend optimization
                Response.Headers.Append("Cache-Control", "private, max-age=300"); // 5 minutes
                Response.Headers.Append("X-Response-Time", dashboardData.Metadata.ResponseTimeMs.ToString());
                Response.Headers.Append("X-Cache-Status", dashboardData.Metadata.CacheStatus);
                Response.Headers.Append("X-Next-Refresh", dashboardData.Metadata.NextRefreshTime.ToString("O"));

                return ApiOk(dashboardData, "Dashboard data retrieved successfully");
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Unauthorized access attempt to unified dashboard for user {UserId}", GetUserId());
                return ApiForbidden<UnifiedDashboardResponseDTO>("Access denied to dashboard data");
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid request parameters for unified dashboard");
                return ApiBadRequest<UnifiedDashboardResponseDTO>(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving unified dashboard data for user {UserId}", GetUserId());
                return ApiServerError<UnifiedDashboardResponseDTO>("An error occurred while retrieving dashboard data");
            }
        }

        /// <summary>
        /// Gets dashboard statistics only (lightweight version)
        /// Provides quick access to key metrics without full data aggregation
        /// Optimized for widgets that only need statistical data
        /// </summary>
        /// <returns>Dashboard statistics data</returns>
        /// <response code="200">Dashboard statistics retrieved successfully</response>
        /// <response code="401">Unauthorized - user not authenticated</response>
        /// <response code="500">Internal server error</response>
        [HttpGet("stats")]
        [ProducesResponseType(typeof(ApiResponse<DashboardStatsDTO>), 200)]
        [ProducesResponseType(typeof(ApiResponse<string>), 401)]
        [ProducesResponseType(typeof(ApiResponse<string>), 500)]
        [RateLimit(300, 60)] // Higher limit for lightweight stats endpoint
        public async Task<ActionResult<ApiResponse<DashboardStatsDTO>>> GetDashboardStats()
        {
            try
            {
                int userId = GetUserId();
                
                _logger.LogDebug("Dashboard statistics request for user {UserId}", userId);

                DashboardStatsDTO stats = await _unifiedDashboardService.GetDashboardStatsAsync(userId);

                // Add cache headers for frontend optimization
                Response.Headers.Append("Cache-Control", "private, max-age=120"); // 2 minutes for stats
                
                return ApiOk(stats, "Dashboard statistics retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving dashboard statistics for user {UserId}", GetUserId());
                return ApiServerError<DashboardStatsDTO>("An error occurred while retrieving dashboard statistics");
            }
        }

        /// <summary>
        /// Gets gamification data only for targeted updates
        /// Provides access to gamification state without full dashboard refresh
        /// Optimized for gamification-focused widgets and updates
        /// </summary>
        /// <returns>Comprehensive gamification data</returns>
        /// <response code="200">Gamification data retrieved successfully</response>
        /// <response code="401">Unauthorized - user not authenticated</response>
        /// <response code="500">Internal server error</response>
        [HttpGet("gamification")]
        [ProducesResponseType(typeof(ApiResponse<GamificationDataDTO>), 200)]
        [ProducesResponseType(typeof(ApiResponse<string>), 401)]
        [ProducesResponseType(typeof(ApiResponse<string>), 500)]
        [RateLimit(250, 60)] // Moderate limit for gamification data
        public async Task<ActionResult<ApiResponse<GamificationDataDTO>>> GetGamificationData()
        {
            try
            {
                int userId = GetUserId();
                
                _logger.LogDebug("Gamification data request for user {UserId}", userId);

                GamificationDataDTO gamificationData = await _unifiedDashboardService.GetGamificationDataAsync(userId);

                // Add cache headers for frontend optimization
                Response.Headers.Append("Cache-Control", "private, max-age=180"); // 3 minutes for gamification
                
                return ApiOk(gamificationData, "Gamification data retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving gamification data for user {UserId}", GetUserId());
                return ApiServerError<GamificationDataDTO>("An error occurred while retrieving gamification data");
            }
        }

        /// <summary>
        /// Gets family dashboard data only for family-focused views
        /// Provides family-specific data without full dashboard aggregation
        /// Optimized for family widgets and family-centric dashboard sections
        /// </summary>
        /// <returns>Family dashboard data</returns>
        /// <response code="200">Family dashboard data retrieved successfully</response>
        /// <response code="401">Unauthorized - user not authenticated</response>
        /// <response code="500">Internal server error</response>
        [HttpGet("family")]
        [ProducesResponseType(typeof(ApiResponse<FamilyDashboardDataDTO>), 200)]
        [ProducesResponseType(typeof(ApiResponse<string>), 401)]
        [ProducesResponseType(typeof(ApiResponse<string>), 500)]
        [RateLimit(200, 60)] // Standard limit for family data
        public async Task<ActionResult<ApiResponse<FamilyDashboardDataDTO>>> GetFamilyDashboardData()
        {
            try
            {
                int userId = GetUserId();
                
                _logger.LogDebug("Family dashboard data request for user {UserId}", userId);

                FamilyDashboardDataDTO familyData = await _unifiedDashboardService.GetFamilyDashboardDataAsync(userId);

                // Add cache headers for frontend optimization
                Response.Headers.Append("Cache-Control", "private, max-age=240"); // 4 minutes for family data
                
                return ApiOk(familyData, "Family dashboard data retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving family dashboard data for user {UserId}", GetUserId());
                return ApiServerError<FamilyDashboardDataDTO>("An error occurred while retrieving family dashboard data");
            }
        }

        /// <summary>
        /// Gets recent tasks data only for task-focused widgets
        /// Provides task-specific data without full dashboard refresh
        /// Optimized for task widgets and task management sections
        /// </summary>
        /// <returns>Recent tasks data</returns>
        /// <response code="200">Recent tasks data retrieved successfully</response>
        /// <response code="401">Unauthorized - user not authenticated</response>
        /// <response code="500">Internal server error</response>
        [HttpGet("tasks")]
        [ProducesResponseType(typeof(ApiResponse<RecentTasksDataDTO>), 200)]
        [ProducesResponseType(typeof(ApiResponse<string>), 401)]
        [ProducesResponseType(typeof(ApiResponse<string>), 500)]
        [RateLimit(300, 60)] // Higher limit for frequently updated task data
        public async Task<ActionResult<ApiResponse<RecentTasksDataDTO>>> GetRecentTasksData()
        {
            try
            {
                int userId = GetUserId();
                
                _logger.LogDebug("Recent tasks data request for user {UserId}", userId);

                RecentTasksDataDTO tasksData = await _unifiedDashboardService.GetRecentTasksDataAsync(userId);

                // Add cache headers for frontend optimization
                Response.Headers.Append("Cache-Control", "private, max-age=60"); // 1 minute for task data (frequently changing)
                
                return ApiOk(tasksData, "Recent tasks data retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving recent tasks data for user {UserId}", GetUserId());
                return ApiServerError<RecentTasksDataDTO>("An error occurred while retrieving recent tasks data");
            }
        }

        /// <summary>
        /// Invalidates cached dashboard data for the current user
        /// Forces fresh data retrieval on next dashboard request
        /// Useful for triggering immediate updates after significant changes
        /// </summary>
        /// <returns>Success status of cache invalidation</returns>
        /// <response code="200">Cache invalidated successfully</response>
        /// <response code="401">Unauthorized - user not authenticated</response>
        /// <response code="500">Internal server error</response>
        [HttpPost("invalidate-cache")]
        [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
        [ProducesResponseType(typeof(ApiResponse<string>), 401)]
        [ProducesResponseType(typeof(ApiResponse<string>), 500)]
        [RateLimit(10, 60)] // Low limit for cache invalidation to prevent abuse
        public async Task<ActionResult<ApiResponse<bool>>> InvalidateDashboardCache()
        {
            try
            {
                int userId = GetUserId();
                
                _logger.LogInformation("Dashboard cache invalidation request for user {UserId}", userId);

                bool success = await _unifiedDashboardService.InvalidateDashboardCacheAsync(userId);

                if (success)
                {
                    _logger.LogInformation("Dashboard cache successfully invalidated for user {UserId}", userId);
                    return ApiOk(true, "Dashboard cache invalidated successfully");
                }
                else
                {
                    _logger.LogWarning("Failed to invalidate dashboard cache for user {UserId}", userId);
                    return ApiServerError<bool>("Failed to invalidate dashboard cache");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error invalidating dashboard cache for user {UserId}", GetUserId());
                return ApiServerError<bool>("An error occurred while invalidating dashboard cache");
            }
        }

        /// <summary>
        /// Health check endpoint for the unified dashboard service
        /// Validates that all required services are available and responsive
        /// Used for monitoring and system health verification
        /// </summary>
        /// <returns>Health status of the dashboard service</returns>
        /// <response code="200">Dashboard service is healthy</response>
        /// <response code="503">Dashboard service is unhealthy</response>
        [HttpGet("health")]
        [ProducesResponseType(typeof(ApiResponse<object>), 200)]
        [ProducesResponseType(typeof(ApiResponse<string>), 503)]
        [AllowAnonymous] // Health checks should be accessible without authentication
        [RateLimit(100, 60)] // Standard limit for health checks
        public async Task<ActionResult<ApiResponse<object>>> GetDashboardHealth()
        {
            try
            {
                _logger.LogDebug("Dashboard health check request");

                // Perform basic service availability check
                bool isHealthy = await _unifiedDashboardService.ValidateUserAccessAsync(1); // Test with dummy user ID

                object healthStatus = new
                {
                    Status = isHealthy ? "Healthy" : "Unhealthy",
                    Timestamp = DateTime.UtcNow,
                    Service = "UnifiedDashboard",
                    Version = "1.0",
                    Dependencies = new
                    {
                        GamificationService = "Available",
                        TaskService = "Available",
                        FamilyService = "Available",
                        NotificationService = "Available",
                        Cache = "Available"
                    }
                };

                if (isHealthy)
                {
                    return ApiOk(healthStatus, "Dashboard service is healthy");
                }
                else
                {
                    return StatusCode(503, ApiResponse<object>.FailureResponse("Dashboard service is unhealthy", 503));
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during dashboard health check");
                
                object errorStatus = new
                {
                    Status = "Error",
                    Timestamp = DateTime.UtcNow,
                    Service = "UnifiedDashboard",
                    Error = ex.Message
                };

                return StatusCode(503, ApiResponse<object>.FailureResponse("Dashboard service is in error state", 503));
            }
        }
    }
} 