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
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.DTOs.Activity;
using TaskTrackerAPI.Services.Interfaces;
using TaskTrackerAPI.Extensions;
using TaskTrackerAPI.Controllers.V2;
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.DTOs.Family;
using System.Linq;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Attributes;

namespace TaskTrackerAPI.Controllers.V1
{
    /// <summary>
    /// Activity controller - manages user activity tracking and history.
    /// Accessible to all authenticated users (RegularUser and above).
    /// </summary>
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/[controller]")]
    [ApiController]
    [Authorize]
    [RequireRole(UserRole.RegularUser)]
    public class ActivityController : BaseApiController
    {
        private readonly IUserActivityService _userActivityService;
        private readonly IFamilyActivityService _familyActivityService;
        private readonly IFamilyService _familyService;
        private readonly ILogger<ActivityController> _logger;

        public ActivityController(
            IUserActivityService userActivityService,
            IFamilyActivityService familyActivityService,
            IFamilyService familyService,
            ILogger<ActivityController> logger)
        {
            _userActivityService = userActivityService;
            _familyActivityService = familyActivityService;
            _familyService = familyService;
            _logger = logger;
        }

        /// <summary>
        /// Get user's recent activity with filtering and pagination
        /// </summary>
        [HttpGet("recent")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<UserActivityPagedResultDTO>> GetRecentActivity(
            [FromQuery] string? type = null,
            [FromQuery] string? dateRange = "all",
            [FromQuery] string? startDate = null,
            [FromQuery] string? endDate = null,
            [FromQuery] string? search = null,
            [FromQuery] int limit = 20,
            [FromQuery] int offset = 0)
        {
            try
            {
                int userId = User.GetUserIdAsInt();

                UserActivityFilterDTO filter = new UserActivityFilterDTO
                {
                    Type = type,
                    DateRange = dateRange ?? "all",
                    StartDate = !string.IsNullOrEmpty(startDate) ? DateTime.Parse(startDate) : null,
                    EndDate = !string.IsNullOrEmpty(endDate) ? DateTime.Parse(endDate) : null,
                    Search = search,
                    Limit = limit,
                    Offset = offset
                };

                UserActivityPagedResultDTO result = await _userActivityService.GetRecentActivitiesAsync(userId, filter);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recent user activity for user {UserId}", User.GetUserIdAsInt());
                return StatusCode(500, "An error occurred while retrieving your recent activity.");
            }
        }

        /// <summary>
        /// Get recent family activity for dashboard
        /// </summary>
        [HttpGet("family/{familyId}/recent")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ApiResponse<FamilyActivityDTO[]>>> GetFamilyRecentActivity(
            int familyId,
            [FromQuery] int limit = 10)
        {
            try
            {
                int userId = User.GetUserIdAsInt();
                _logger.LogInformation("Getting recent activity for family {FamilyId} by user {UserId}", familyId, userId);

                // Check if user is a member of the family
                bool isMember = await _familyService.IsFamilyMemberAsync(familyId, userId);
                if (!isMember)
                {
                    return ApiUnauthorized<FamilyActivityDTO[]>("You are not a member of this family");
                }

                // Get recent family activities using the real service
                FamilyActivityPagedResultDTO activities = await _familyActivityService.GetAllByFamilyIdAsync(familyId, userId, 1, limit);
                FamilyActivityDTO[] recentActivities = activities.Activities.ToArray();

                _logger.LogInformation("Successfully retrieved {ActivityCount} recent activities for family {FamilyId}", recentActivities.Length, familyId);
                return ApiOk<FamilyActivityDTO[]>(recentActivities, "Recent family activity retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recent family activity for family {FamilyId} by user {UserId}: {ErrorMessage}", familyId, User.GetUserIdAsInt(), ex.Message);
                return ApiServerError<FamilyActivityDTO[]>($"An error occurred while retrieving recent family activity: {ex.Message}");
            }
        }

        /// <summary>
        /// Get activity statistics for the user
        /// </summary>
        [HttpGet("stats")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<UserActivityStatsDTO>> GetActivityStats()
        {
            try
            {
                int userId = User.GetUserIdAsInt();
                UserActivityStatsDTO result = await _userActivityService.GetActivityStatsAsync(userId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving activity stats for user");
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    error = "Error retrieving activity stats"
                });
            }
        }

        /// <summary>
        /// Get activity timeline data for charts
        /// </summary>
        [HttpGet("timeline")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<UserActivityTimelineDTO>> GetActivityTimeline(
            [FromQuery] string dateRange = "month",
            [FromQuery] string groupBy = "day")
        {
            try
            {
                int userId = User.GetUserIdAsInt();
                UserActivityTimelineDTO result = await _userActivityService.GetActivityTimelineAsync(userId, dateRange, groupBy);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving activity timeline for user");
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    error = "Error retrieving activity timeline"
                });
            }
        }

    }
} 