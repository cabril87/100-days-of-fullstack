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

namespace TaskTrackerAPI.Controllers.V1
{
    [ApiVersion("1.0")]
    [Authorize]
    [ApiController]
    [Route("api/v{version:apiVersion}/[controller]")]
    [Route("api/[controller]")]
    public class ActivityController : ControllerBase
    {
        private readonly IUserActivityService _userActivityService;
        private readonly ILogger<ActivityController> _logger;

        public ActivityController(
            IUserActivityService userActivityService,
            ILogger<ActivityController> logger)
        {
            _userActivityService = userActivityService;
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

                var filter = new UserActivityFilterDTO
                {
                    Type = type,
                    DateRange = dateRange ?? "all",
                    StartDate = !string.IsNullOrEmpty(startDate) ? DateTime.Parse(startDate) : null,
                    EndDate = !string.IsNullOrEmpty(endDate) ? DateTime.Parse(endDate) : null,
                    Search = search,
                    Limit = limit,
                    Offset = offset
                };

                var result = await _userActivityService.GetRecentActivitiesAsync(userId, filter);
                return Ok(result);
            }
            catch (FormatException ex)
            {
                _logger.LogWarning(ex, "Invalid date format in activity request");
                return BadRequest(new { error = "Invalid date format" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving recent activity for user");
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    error = "Error retrieving recent activity"
                });
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
                var result = await _userActivityService.GetActivityStatsAsync(userId);
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
                var result = await _userActivityService.GetActivityTimelineAsync(userId, dateRange, groupBy);
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