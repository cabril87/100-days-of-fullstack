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
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Services;
using TaskTrackerAPI.Services.Interfaces;
using System.Linq;
using TaskTrackerAPI.DTOs.Tasks;
using TaskTrackerAPI.Controllers.V2;
using TaskTrackerAPI.Attributes;

namespace TaskTrackerAPI.Controllers.V1
{
    /// <summary>
    /// Task statistics controller - provides detailed analytics and insights for user task data.
    /// Accessible to all authenticated users (RegularUser and above).
    /// Users can only view statistics for their own tasks with privacy protection.
    /// </summary>
    [ApiVersion("1.0")]
    [Authorize]
    [RequireRole(UserRole.RegularUser)] // All authenticated users can view their task statistics
    [ApiController]
    [Route("api/v{version:apiVersion}/[controller]")]
    public class TaskStatisticsController : BaseApiController
    {
        private readonly ITaskStatisticsService _taskStatisticsService;
        private readonly ILogger<TaskStatisticsController> _logger;

        public TaskStatisticsController(
            ITaskStatisticsService taskStatisticsService,
            ILogger<TaskStatisticsController> logger)
        {
            _taskStatisticsService = taskStatisticsService;
            _logger = logger;
        }

        [HttpGet("completion-rate")]
        public async Task<IActionResult> GetCompletionRate()
        {
            try
            {
                int userId = GetUserIdFromClaims();
                TaskStatisticsDTO completionRate = await _taskStatisticsService.GetTaskStatisticsAsync(userId);
                return Ok(completionRate.CompletionRate);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving task completion rate");
                return StatusCode(500, "An error occurred while retrieving task completion rate.");
            }
        }

        [HttpGet("status-distribution")]
        public async Task<IActionResult> GetTasksByStatusDistribution()
        {
            try
            {
                int userId = GetUserIdFromClaims();
                Dictionary<TaskItemStatus, int> distribution = await _taskStatisticsService.GetTasksByStatusDistributionAsync(userId);
                return Ok(distribution);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving task status distribution");
                return StatusCode(500, "An error occurred while retrieving task status distribution.");
            }
        }

        [HttpGet("tasks-by-status")]
        public async Task<IActionResult> GetTasksByStatus()
        {
            try
            {
                int userId = GetUserIdFromClaims();
                Dictionary<TaskItemStatus, int> distribution = await _taskStatisticsService.GetTasksByStatusDistributionAsync(userId);
                return Ok(distribution);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving tasks by status");
                return StatusCode(500, "An error occurred while retrieving tasks by status.");
            }
        }

        [HttpGet("tasks-by-status-distribution")]
        public async Task<IActionResult> GetTasksByStatusDistributionAlias()
        {
            return await GetTasksByStatus();
        }

        [HttpGet("priority-distribution")]
        public async Task<IActionResult> GetTasksByPriorityDistribution()
        {
            try
            {
                int userId = GetUserIdFromClaims();
                Dictionary<int, int> distribution = await _taskStatisticsService.GetTasksByPriorityDistributionAsync(userId);
                return Ok(distribution);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving task priority distribution");
                return StatusCode(500, "An error occurred while retrieving task priority distribution.");
            }
        }

        [HttpGet("active-categories")]
        public async Task<IActionResult> GetMostActiveCategories([FromQuery, Range(1, 20)] int limit = 5)
        {
            try
            {
                int userId = GetUserIdFromClaims();
                List<CategoryActivityDTO> activeCategories = await _taskStatisticsService.GetMostActiveCategoriesAsync(userId, limit);
                return Ok(activeCategories);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving most active categories");
                return StatusCode(500, "An error occurred while retrieving most active categories.");
            }
        }

        [HttpGet("completion-time")]
        public async Task<IActionResult> GetCompletionTimeAverage()
        {
            try
            {
                int userId = GetUserIdFromClaims();
                TimeSpan averageTime = await _taskStatisticsService.GetTaskCompletionTimeAverageAsync(userId);
                return Ok(new { AverageHours = averageTime.TotalHours });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving task completion time average");
                return StatusCode(500, "An error occurred while retrieving task completion time average.");
            }
        }

        [HttpGet("completion-time-average")]
        public async Task<IActionResult> GetCompletionTimeAverageAlias()
        {
            try
            {
                int userId = GetUserIdFromClaims();
                TimeSpan averageTime = await _taskStatisticsService.GetTaskCompletionTimeAverageAsync(userId);
                return Ok(averageTime);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving task completion time average");
                return StatusCode(500, "An error occurred while retrieving task completion time average.");
            }
        }

        [HttpGet("overdue")]
        public async Task<IActionResult> GetOverdueTasksStatistics()
        {
            try
            {
                int userId = GetUserIdFromClaims();
                TaskStatisticsDTO stats = await _taskStatisticsService.GetTaskStatisticsAsync(userId);
                return Ok(stats.OverdueTasks);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving overdue tasks statistics");
                return StatusCode(500, "An error occurred while retrieving overdue tasks statistics.");
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetAllStatistics()
        {
            try
            {
                int userId = GetUserIdFromClaims();
                TaskStatisticsDTO stats = await _taskStatisticsService.GetTaskStatisticsAsync(userId);
                return Ok(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving task statistics");
                return StatusCode(500, "An error occurred while retrieving task statistics.");
            }
        }

        [HttpGet("productivity")]
        public async Task<IActionResult> GetProductivityAnalytics(
            [FromQuery] DateTime? startDate = null, 
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                int userId = GetUserIdFromClaims();
                ProductivityAnalyticsDTO analytics = await _taskStatisticsService.GetProductivityAnalyticsAsync(
                    userId, startDate, endDate);
                return Ok(analytics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving productivity analytics");
                return StatusCode(500, "An error occurred while retrieving productivity analytics.");
            }
        }

        [HttpGet("productivity/time-of-day")]
        public async Task<IActionResult> GetTimeOfDayProductivity(
            [FromQuery] DateTime? startDate = null, 
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                int userId = GetUserIdFromClaims();
                ProductivityAnalyticsDTO analytics = await _taskStatisticsService.GetProductivityAnalyticsAsync(
                    userId, startDate, endDate);
                return Ok(analytics.HourlyDistribution);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving time of day productivity analytics");
                return StatusCode(500, "An error occurred while retrieving time of day productivity analytics.");
            }
        }

        [HttpGet("productivity/daily")]
        public async Task<IActionResult> GetDailyProductivity(
            [FromQuery] DateTime? startDate = null, 
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                int userId = GetUserIdFromClaims();
                ProductivityAnalyticsDTO analytics = await _taskStatisticsService.GetProductivityAnalyticsAsync(
                    userId, startDate, endDate);
                return Ok(analytics.DailyCompletions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving daily productivity analytics");
                return StatusCode(500, "An error occurred while retrieving daily productivity analytics.");
            }
        }

        [HttpGet("productivity/weekly")]
        public async Task<IActionResult> GetWeeklyProductivity(
            [FromQuery] DateTime? startDate = null, 
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                int userId = GetUserIdFromClaims();
                ProductivityAnalyticsDTO analytics = await _taskStatisticsService.GetProductivityAnalyticsAsync(
                    userId, startDate, endDate);
                return Ok(analytics.DayOfWeekDistribution);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving weekly productivity analytics");
                return StatusCode(500, "An error occurred while retrieving weekly productivity analytics.");
            }
        }

        [HttpGet("productivity/monthly")]
        public async Task<IActionResult> GetMonthlyProductivity(
            [FromQuery] DateTime? startDate = null, 
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                int userId = GetUserIdFromClaims();
                ProductivityAnalyticsDTO analytics = await _taskStatisticsService.GetProductivityAnalyticsAsync(
                    userId, startDate, endDate);
                return Ok(analytics.CompletionRateTrend);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving monthly productivity analytics");
                return StatusCode(500, "An error occurred while retrieving monthly productivity analytics.");
            }
        }

        [HttpGet("productivity-summary")]
        public async Task<IActionResult> GetProductivitySummary(
            [FromQuery] DateTime? startDate = null, 
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                int userId = GetUserIdFromClaims();
                ProductivityAnalyticsDTO analytics = await _taskStatisticsService.GetProductivityAnalyticsAsync(
                    userId, startDate, endDate);
                return Ok(analytics.Summary);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving productivity summary");
                return StatusCode(500, "An error occurred while retrieving productivity summary.");
            }
        }
    }
} 