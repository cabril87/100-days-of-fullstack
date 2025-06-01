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
using Microsoft.AspNetCore.Mvc;
using TaskTrackerAPI.DTOs.Analytics;
using TaskTrackerAPI.Services.Interfaces;
using TaskTrackerAPI.Attributes;
using Microsoft.Extensions.Logging;
using System.Threading.Tasks;
using System;
using System.Collections.Generic;
using TaskTrackerAPI.Controllers.V2;

namespace TaskTrackerAPI.Controllers.V1
{
    [ApiVersion("1.0")]
    [Authorize]
    [ApiController]
    [Route("api/v{version:apiVersion}/analytics/advanced")]
    [SecurityRequirements(SecurityRequirementLevel.Authenticated)]
    public class AdvancedAnalyticsController : BaseApiController
    {
        private readonly IAdvancedAnalyticsService _analyticsService;
        private readonly ILogger<AdvancedAnalyticsController> _logger;

        public AdvancedAnalyticsController(
            IAdvancedAnalyticsService analyticsService,
            ILogger<AdvancedAnalyticsController> logger)
        {
            _analyticsService = analyticsService;
            _logger = logger;
        }

        /// <summary>
        /// Get comprehensive advanced analytics for the current user
        /// </summary>
        /// <param name="startDate">Start date for analysis (optional)</param>
        /// <param name="endDate">End date for analysis (optional)</param>
        /// <returns>Advanced analytics data</returns>
        [HttpGet]
        public async Task<IActionResult> GetAdvancedAnalytics(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                int userId = GetUserIdFromClaims();
                var analytics = await _analyticsService.GetAdvancedAnalyticsAsync(userId, startDate, endDate);
                return Ok(analytics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting advanced analytics");
                return StatusCode(500, "An error occurred while retrieving advanced analytics.");
            }
        }

        /// <summary>
        /// Get task trends over time
        /// </summary>
        /// <param name="startDate">Start date for analysis</param>
        /// <param name="endDate">End date for analysis</param>
        /// <param name="granularity">Data granularity (daily, weekly, monthly)</param>
        /// <returns>Task trend data</returns>
        [HttpGet("task-trends")]
        public async Task<IActionResult> GetTaskTrends(
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate,
            [FromQuery] string granularity = "daily")
        {
            try
            {
                int userId = GetUserIdFromClaims();
                var trends = await _analyticsService.GetTaskTrendsAsync(userId, startDate, endDate, granularity);
                return Ok(trends);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting task trends");
                return StatusCode(500, "An error occurred while retrieving task trends.");
            }
        }

        /// <summary>
        /// Get productivity metrics for the current user
        /// </summary>
        /// <param name="startDate">Start date for analysis</param>
        /// <param name="endDate">End date for analysis</param>
        /// <returns>Productivity metrics</returns>
        [HttpGet("productivity-metrics")]
        public async Task<IActionResult> GetProductivityMetrics(
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate)
        {
            try
            {
                int userId = GetUserIdFromClaims();
                var metrics = await _analyticsService.GetProductivityMetricsAsync(userId, startDate, endDate);
                return Ok(metrics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting productivity metrics");
                return StatusCode(500, "An error occurred while retrieving productivity metrics.");
            }
        }

        /// <summary>
        /// Get family analytics data
        /// </summary>
        /// <param name="familyId">Family ID</param>
        /// <param name="startDate">Start date for analysis</param>
        /// <param name="endDate">End date for analysis</param>
        /// <returns>Family analytics data</returns>
        [HttpGet("family-analytics")]
        public async Task<IActionResult> GetFamilyAnalytics(
            [FromQuery] int familyId,
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate)
        {
            try
            {
                // TODO: Add family membership validation
                var analytics = await _analyticsService.GetFamilyAnalyticsAsync(familyId, startDate, endDate);
                return Ok(analytics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting family analytics for family {FamilyId}", familyId);
                return StatusCode(500, "An error occurred while retrieving family analytics.");
            }
        }

        /// <summary>
        /// Get comparative analytics between users or time periods
        /// </summary>
        /// <param name="compareUserIds">User IDs to compare with (optional)</param>
        /// <param name="startDate">Start date for analysis (optional)</param>
        /// <param name="endDate">End date for analysis (optional)</param>
        /// <param name="compareStartDate">Comparison period start date (optional)</param>
        /// <param name="compareEndDate">Comparison period end date (optional)</param>
        /// <returns>Comparative analytics data</returns>
        [HttpGet("comparative")]
        public async Task<IActionResult> GetComparativeAnalytics(
            [FromQuery] List<int>? compareUserIds = null,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null,
            [FromQuery] DateTime? compareStartDate = null,
            [FromQuery] DateTime? compareEndDate = null)
        {
            try
            {
                int userId = GetUserIdFromClaims();
                var analytics = await _analyticsService.GetComparativeAnalyticsAsync(
                    userId, compareUserIds, startDate, endDate, compareStartDate, compareEndDate);
                return Ok(analytics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting comparative analytics");
                return StatusCode(500, "An error occurred while retrieving comparative analytics.");
            }
        }

        /// <summary>
        /// Get time-range specific analytics
        /// </summary>
        /// <param name="timeRange">Time range (7d, 30d, 90d, 1y)</param>
        /// <returns>Time-range analytics data</returns>
        [HttpGet("time-range")]
        public async Task<IActionResult> GetTimeRangeAnalytics([FromQuery] string timeRange = "30d")
        {
            try
            {
                int userId = GetUserIdFromClaims();
                var analytics = await _analyticsService.GetTimeRangeAnalyticsAsync(userId, timeRange);
                return Ok(analytics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting time range analytics for range {TimeRange}", timeRange);
                return StatusCode(500, "An error occurred while retrieving time range analytics.");
            }
        }

        /// <summary>
        /// Get time analysis data
        /// </summary>
        /// <param name="startDate">Start date for analysis</param>
        /// <param name="endDate">End date for analysis</param>
        /// <returns>Time analysis data</returns>
        [HttpGet("time-analysis")]
        public async Task<IActionResult> GetTimeAnalysis(
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate)
        {
            try
            {
                int userId = GetUserIdFromClaims();
                var analysis = await _analyticsService.GetTimeAnalysisAsync(userId, startDate, endDate);
                return Ok(analysis);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting time analysis");
                return StatusCode(500, "An error occurred while retrieving time analysis.");
            }
        }

        /// <summary>
        /// Get category breakdown analytics
        /// </summary>
        /// <param name="startDate">Start date for analysis</param>
        /// <param name="endDate">End date for analysis</param>
        /// <returns>Category breakdown data</returns>
        [HttpGet("category-breakdown")]
        public async Task<IActionResult> GetCategoryBreakdown(
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate)
        {
            try
            {
                int userId = GetUserIdFromClaims();
                var breakdown = await _analyticsService.GetCategoryBreakdownAsync(userId, startDate, endDate);
                return Ok(breakdown);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting category breakdown");
                return StatusCode(500, "An error occurred while retrieving category breakdown.");
            }
        }
    }
} 