// Controllers/TaskItemsController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Services.Interfaces;

namespace TaskTrackerAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class TaskItemsController : ControllerBase
{
    private readonly ITaskService _taskService;
    private readonly ILogger<TaskItemsController> _logger;

    public TaskItemsController(ITaskService taskService, ILogger<TaskItemsController> logger)
    {
        _taskService = taskService;
        _logger = logger;
    }

    // GET: api/TaskItems
    [HttpGet]
    public async Task<ActionResult<IEnumerable<TaskItemDTO>>> GetTasks()
    {
        try
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            
            IEnumerable<TaskItemDTO> tasks = await _taskService.GetAllTasksAsync(userId);
            
            return Ok(tasks);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving tasks");
            return StatusCode(500, "An error occurred while retrieving tasks.");
        }
    }

    // GET: api/TaskItems/5
    [HttpGet("{id}")]
    public async Task<ActionResult<TaskItemDTO>> GetTaskItem(int id)
    {
        try
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            
            TaskItemDTO? task = await _taskService.GetTaskByIdAsync(userId, id);
            
            if (task == null)
            {
                return NotFound($"Task with ID {id} not found");
            }
            
            return Ok(task);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving task with ID {TaskId}", id);
            return StatusCode(500, "An error occurred while retrieving the task.");
        }
    }

    // POST: api/TaskItems
    [HttpPost]
    public async Task<ActionResult<TaskItemDTO>> CreateTaskItem(TaskItemDTO taskDto)
    {
        try
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            
            TaskItemDTO? createdTask = await _taskService.CreateTaskAsync(userId, taskDto);
            
            if (createdTask == null)
            {
                return BadRequest("Failed to create task");
            }
            
            return CreatedAtAction(nameof(GetTaskItem), new { id = createdTask.Id }, createdTask);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating task");
            return StatusCode(500, "An error occurred while creating the task.");
        }
    }

    // PUT: api/TaskItems/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTaskItem(int id, TaskItemDTO taskDto)
    {
        try
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            
            TaskItemDTO? updatedTask = await _taskService.UpdateTaskAsync(userId, id, taskDto);
            
            if (updatedTask == null)
            {
                return NotFound($"Task with ID {id} not found or you are not authorized to modify it");
            }
            
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating task with ID {TaskId}", id);
            return StatusCode(500, "An error occurred while updating the task.");
        }
    }

    // DELETE: api/TaskItems/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTaskItem(int id)
    {
        try
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            
            await _taskService.DeleteTaskAsync(userId, id);
            
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting task with ID {TaskId}", id);
            return StatusCode(500, "An error occurred while deleting the task.");
        }
    }
    
    // GET: api/TaskItems/status/{status}
    [HttpGet("status/{status}")]
    public async Task<ActionResult<IEnumerable<TaskItemDTO>>> GetTasksByStatus(TaskItemStatus status)
    {
        try
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            
            IEnumerable<TaskItemDTO> tasks = await _taskService.GetTasksByStatusAsync(userId, status);
            
            return Ok(tasks);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving tasks with status {Status}", status);
            return StatusCode(500, "An error occurred while retrieving tasks.");
        }
    }
    
    // GET: api/TaskItems/category/{categoryId}
    [HttpGet("category/{categoryId}")]
    public async Task<ActionResult<IEnumerable<TaskItemDTO>>> GetTasksByCategory(int categoryId)
    {
        try
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            
            IEnumerable<TaskItemDTO> tasks = await _taskService.GetTasksByCategoryAsync(userId, categoryId);
            
            return Ok(tasks);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving tasks for category ID {CategoryId}", categoryId);
            return StatusCode(500, "An error occurred while retrieving tasks.");
        }
    }
    
    // GET: api/TaskItems/tags/{tagId}
    [HttpGet("tags/{tagId}")]
    public async Task<ActionResult<IEnumerable<TaskItemDTO>>> GetTasksByTag(int tagId)
    {
        try
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            
            IEnumerable<TaskItemDTO> tasks = await _taskService.GetTasksByTagAsync(userId, tagId);
            
            return Ok(tasks);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving tasks for tag ID {TagId}", tagId);
            return StatusCode(500, "An error occurred while retrieving tasks.");
        }
    }
    
    // GET: api/TaskItems/due-date-range
    [HttpGet("due-date-range")]
    public async Task<ActionResult<IEnumerable<TaskItemDTO>>> GetTasksByDueDateRange(
        [FromQuery] DateTime startDate, 
        [FromQuery] DateTime endDate)
    {
        try
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            
            IEnumerable<TaskItemDTO> tasks = await _taskService.GetTasksByDueDateRangeAsync(userId, startDate, endDate);
            
            return Ok(tasks);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving tasks by due date range");
            return StatusCode(500, "An error occurred while retrieving tasks.");
        }
    }
    
    // GET: api/TaskItems/overdue
    [HttpGet("overdue")]
    public async Task<ActionResult<IEnumerable<TaskItemDTO>>> GetOverdueTasks()
    {
        try
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            
            IEnumerable<TaskItemDTO> tasks = await _taskService.GetOverdueTasksAsync(userId);
            
            return Ok(tasks);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving overdue tasks");
            return StatusCode(500, "An error occurred while retrieving tasks.");
        }
    }
    
    // GET: api/TaskItems/due-today
    [HttpGet("due-today")]
    public async Task<ActionResult<IEnumerable<TaskItemDTO>>> GetDueTodayTasks()
    {
        try
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            
            IEnumerable<TaskItemDTO> tasks = await _taskService.GetDueTodayTasksAsync(userId);
            
            return Ok(tasks);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving tasks due today");
            return StatusCode(500, "An error occurred while retrieving tasks.");
        }
    }
    
    // GET: api/TaskItems/due-this-week
    [HttpGet("due-this-week")]
    public async Task<ActionResult<IEnumerable<TaskItemDTO>>> GetDueThisWeekTasks()
    {
        try
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            
            IEnumerable<TaskItemDTO> tasks = await _taskService.GetDueThisWeekTasksAsync(userId);
            
            return Ok(tasks);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving tasks due this week");
            return StatusCode(500, "An error occurred while retrieving tasks.");
        }
    }
    
    // GET: api/TaskItems/statistics
    [HttpGet("statistics")]
    public async Task<ActionResult<TaskStatisticsDTO>> GetTaskStatistics()
    {
        try
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            
            TaskStatisticsDTO statistics = await _taskService.GetTaskStatisticsAsync(userId);
            
            return Ok(statistics);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving task statistics");
            return StatusCode(500, "An error occurred while retrieving task statistics.");
        }
    }
    
    // POST: api/TaskItems/complete-batch
    [HttpPost("complete-batch")]
    public async Task<IActionResult> CompleteTasks([FromBody] List<int> taskIds)
    {
        try
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            
            await _taskService.CompleteTasksAsync(userId, taskIds);
            
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error completing tasks");
            return StatusCode(500, "An error occurred while completing tasks.");
        }
    }
    
    // PUT: api/TaskItems/{id}/status
    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateTaskStatus(int id, [FromBody] TaskItemStatus status)
    {
        try
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            
            await _taskService.UpdateTaskStatusAsync(userId, id, status);
            
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating task status");
            return StatusCode(500, "An error occurred while updating task status.");
        }
    }
    
    // POST: api/TaskItems/{id}/tags/{tagId}
    [HttpPost("{id}/tags/{tagId}")]
    public async Task<IActionResult> AddTagToTask(int id, int tagId)
    {
        try
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            
            await _taskService.AddTagToTaskAsync(userId, id, tagId);
            
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding tag to task");
            return StatusCode(500, "An error occurred while adding tag to task.");
        }
    }
    
    // DELETE: api/TaskItems/{id}/tags/{tagId}
    [HttpDelete("{id}/tags/{tagId}")]
    public async Task<IActionResult> RemoveTagFromTask(int id, int tagId)
    {
        try
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            
            await _taskService.RemoveTagFromTaskAsync(userId, id, tagId);
            
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing tag from task");
            return StatusCode(500, "An error occurred while removing tag from task.");
        }
    }
    
    // PUT: api/TaskItems/{id}/tags
    [HttpPut("{id}/tags")]
    public async Task<IActionResult> UpdateTaskTags(int id, [FromBody] List<int> tagIds)
    {
        try
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            
            await _taskService.UpdateTaskTagsAsync(userId, id, tagIds);
            
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating task tags");
            return StatusCode(500, "An error occurred while updating task tags.");
        }
    }
    
    // GET: api/TaskItems/{id}/tags
    [HttpGet("{id}/tags")]
    public async Task<ActionResult<IEnumerable<TagDTO>>> GetTagsForTask(int id)
    {
        try
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            
            IEnumerable<TagDTO> tags = await _taskService.GetTagsForTaskAsync(userId, id);
            
            return Ok(tags);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving tags for task");
            return StatusCode(500, "An error occurred while retrieving tags.");
        }
    }
}