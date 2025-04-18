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

namespace TaskTrackerAPI.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class TaskStatisticsController : BaseApiController
    {
        private readonly TaskStatisticsService _taskStatisticsService;
        private readonly ILogger<TaskStatisticsController> _logger;

        public TaskStatisticsController(
            TaskStatisticsService taskStatisticsService,
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
    }
} 