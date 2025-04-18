using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Services;

namespace TaskTrackerAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TaskStatisticsController : ControllerBase
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

        // GET: api/TaskStatistics/completion-rate
        [HttpGet("completion-rate")]
        public async Task<ActionResult<TaskCompletionRateDTO>> GetTaskCompletionRate()
        {
            try
            {
                int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
                
                var completionRate = await _taskStatisticsService.GetTaskStatisticsAsync(userId);
                
                return Ok(completionRate.CompletionRate);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving task completion rate");
                return StatusCode(500, "An error occurred while retrieving task completion rate.");
            }
        }

        // GET: api/TaskStatistics/status-distribution
        [HttpGet("status-distribution")]
        public async Task<ActionResult<Dictionary<TaskItemStatus, int>>> GetTasksByStatusDistribution()
        {
            try
            {
                int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
                
                var distribution = await _taskStatisticsService.GetTasksByStatusDistributionAsync(userId);
                
                return Ok(distribution);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving task status distribution");
                return StatusCode(500, "An error occurred while retrieving task status distribution.");
            }
        }

        // GET: api/TaskStatistics/priority-distribution
        [HttpGet("priority-distribution")]
        public async Task<ActionResult<Dictionary<int, int>>> GetTasksByPriorityDistribution()
        {
            try
            {
                int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
                
                var distribution = await _taskStatisticsService.GetTasksByPriorityDistributionAsync(userId);
                
                return Ok(distribution);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving task priority distribution");
                return StatusCode(500, "An error occurred while retrieving task priority distribution.");
            }
        }

        // GET: api/TaskStatistics/active-categories
        [HttpGet("active-categories")]
        public async Task<ActionResult<List<CategoryActivityDTO>>> GetMostActiveCategories([FromQuery] int limit = 5)
        {
            try
            {
                int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
                
                var activeCategories = await _taskStatisticsService.GetMostActiveCategoriesAsync(userId, limit);
                
                return Ok(activeCategories);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving most active categories");
                return StatusCode(500, "An error occurred while retrieving most active categories.");
            }
        }

        // GET: api/TaskStatistics/completion-time-average
        [HttpGet("completion-time-average")]
        public async Task<ActionResult<TimeSpan>> GetTaskCompletionTimeAverage()
        {
            try
            {
                int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
                
                var averageTime = await _taskStatisticsService.GetTaskCompletionTimeAverageAsync(userId);
                
                return Ok(averageTime);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving task completion time average");
                return StatusCode(500, "An error occurred while retrieving task completion time average.");
            }
        }

        // GET: api/TaskStatistics/overdue
        [HttpGet("overdue")]
        public async Task<ActionResult<OverdueTasksStatisticsDTO>> GetOverdueTasksStatistics()
        {
            try
            {
                int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
                
                var stats = await _taskStatisticsService.GetTaskStatisticsAsync(userId);
                
                return Ok(stats.OverdueTasks);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving overdue tasks statistics");
                return StatusCode(500, "An error occurred while retrieving overdue tasks statistics.");
            }
        }
    }
} 