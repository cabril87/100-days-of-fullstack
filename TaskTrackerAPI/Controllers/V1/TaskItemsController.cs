using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskTrackerAPI.Services.Interfaces;
using TaskTrackerAPI.Utils;
using TaskTrackerAPI.DTOs.Tasks;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.DTOs.Tags;
using TaskTrackerAPI.Attributes;

namespace TaskTrackerAPI.Controllers.V1;

[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
[Route("api/[controller]")]
[Route("api/tasks")]
[ApiController]
[Authorize]
[RateLimit(100, 60)] // Default rate limit for all controller methods: 100 requests per 60 seconds
public class TaskItemsController : ControllerBase
{
    private readonly ITaskService _taskService;
    private readonly ILogger<TaskItemsController> _logger;
    private readonly IFamilyMemberService _familyMemberService;

    public TaskItemsController(ITaskService taskService, ILogger<TaskItemsController> logger, 
        IFamilyMemberService familyMemberService)
    {
        _taskService = taskService;
        _logger = logger;
        _familyMemberService = familyMemberService;
    }

    // GET: api/TaskItems
    [HttpGet]
    [RateLimit(50, 30)] // More strict limit for this potentially resource-intensive endpoint
    public async Task<ActionResult<IEnumerable<TaskItemDTO>>> GetTasks()
    {
        try
        {
            int userId = User.GetUserId();
            IEnumerable<TaskItemDTO> tasks = await _taskService.GetAllTasksAsync(userId);
            return Ok(Utils.ApiResponse<IEnumerable<TaskItemDTO>>.SuccessResponse(tasks));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving all tasks");
            return StatusCode(500, Utils.ApiResponse<IEnumerable<TaskItemDTO>>.ServerErrorResponse());
        }
    }

    // GET: api/TaskItems/5
    [HttpGet("{id}")]
    public async Task<ActionResult<TaskItemDTO>> GetTaskItem(int id)
    {
        try
        {
            int userId = User.GetUserId();
            
            // First check if the task exists and belongs to the user
            bool isTaskOwned = await _taskService.IsTaskOwnedByUserAsync(id, userId);
            
            if (!isTaskOwned)
            {
                return NotFound(Utils.ApiResponse<TaskItemDTO>.NotFoundResponse($"Task with ID {id} not found"));
            }
            
            TaskItemDTO? task = await _taskService.GetTaskByIdAsync(userId, id);
            
            if (task == null)
            {
                return NotFound(Utils.ApiResponse<TaskItemDTO>.NotFoundResponse($"Task with ID {id} not found"));
            }
            
            return Ok(Utils.ApiResponse<TaskItemDTO>.SuccessResponse(task));
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access attempt for task {TaskId}", id);
            return Forbid();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving task {TaskId}", id);
            return StatusCode(500, Utils.ApiResponse<TaskItemDTO>.ServerErrorResponse());
        }
    }

    // POST: api/TaskItems
    [HttpPost]
    [RateLimit(30, 60)] // Limit creation rate to prevent abuse
    public async Task<ActionResult<TaskItemDTO>> CreateTaskItem(TaskItemDTO taskDto)
    {
        try
        {
            int userId = User.GetUserId();
            
            TaskItemDTO? createdTask = await _taskService.CreateTaskAsync(userId, taskDto);
            
            if (createdTask == null)
            {
                return BadRequest(Utils.ApiResponse<TaskItemDTO>.BadRequestResponse("Failed to create task"));
            }
            
            return CreatedAtAction(
                nameof(GetTaskItem), 
                new { id = createdTask.Id }, 
                Utils.ApiResponse<TaskItemDTO>.SuccessResponse(createdTask)
            );
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "User tried to create a task with a category they don't own");
            return Forbid();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating task");
            return StatusCode(500, Utils.ApiResponse<TaskItemDTO>.ServerErrorResponse());
        }
    }

    // PUT: api/TaskItems/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTaskItem(int id, TaskItemDTO taskDto)
    {
        try
        {
            int userId = User.GetUserId();
            
            TaskItemDTO? updatedTask = await _taskService.UpdateTaskAsync(userId, id, taskDto);
            
            if (updatedTask == null)
            {
                return NotFound(Utils.ApiResponse<TaskItemDTO>.NotFoundResponse($"Task with ID {id} not found or you are not authorized to modify it"));
            }
            
            return NoContent();
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "User tried to update a task they don't own");
            return Forbid();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating task with ID {TaskId}", id);
            return StatusCode(500, Utils.ApiResponse<TaskItemDTO>.ServerErrorResponse());
        }
    }

    // DELETE: api/TaskItems/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTaskItem(int id)
    {
        try
        {
            int userId = User.GetUserId();
            
            // Check if task exists and belongs to user
            bool isTaskOwned = await _taskService.IsTaskOwnedByUserAsync(id, userId);
            if (!isTaskOwned)
            {
                return NotFound(Utils.ApiResponse<object>.NotFoundResponse($"Task with ID {id} not found"));
            }
            
            await _taskService.DeleteTaskAsync(userId, id);
            
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting task with ID {TaskId}", id);
            return StatusCode(500, Utils.ApiResponse<object>.ServerErrorResponse());
        }
    }
    
    // GET: api/TaskItems/status/{status}
    [HttpGet("status/{status}")]
    public async Task<ActionResult<IEnumerable<TaskItemDTO>>> GetTasksByStatus(TaskItemStatus status)
    {
        try
        {
            int userId = User.GetUserId();
            
            IEnumerable<TaskItemDTO> tasks = await _taskService.GetTasksByStatusAsync(userId, status);
            
            return Ok(Utils.ApiResponse<IEnumerable<TaskItemDTO>>.SuccessResponse(tasks));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving tasks with status {Status}", status);
            return StatusCode(500, Utils.ApiResponse<IEnumerable<TaskItemDTO>>.ServerErrorResponse());
        }
    }
    
    // GET: api/TaskItems/category/{categoryId}
    [HttpGet("category/{categoryId}")]
    public async Task<ActionResult<IEnumerable<TaskItemDTO>>> GetTasksByCategory(int categoryId)
    {
        try
        {
            int userId = User.GetUserId();
            
            IEnumerable<TaskItemDTO> tasks = await _taskService.GetTasksByCategoryAsync(userId, categoryId);
            
            return Ok(Utils.ApiResponse<IEnumerable<TaskItemDTO>>.SuccessResponse(tasks));
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "User tried to access categories they don't own");
            return Forbid();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving tasks for category ID {CategoryId}", categoryId);
            return StatusCode(500, Utils.ApiResponse<IEnumerable<TaskItemDTO>>.ServerErrorResponse());
        }
    }
    
    // GET: api/TaskItems/tags/{tagId}
    [HttpGet("tags/{tagId}")]
    public async Task<ActionResult<IEnumerable<TaskItemDTO>>> GetTasksByTag(int tagId)
    {
        try
        {
            int userId = User.GetUserId();
            
            IEnumerable<TaskItemDTO> tasks = await _taskService.GetTasksByTagAsync(userId, tagId);
            
            return Ok(Utils.ApiResponse<IEnumerable<TaskItemDTO>>.SuccessResponse(tasks));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving tasks for tag ID {TagId}", tagId);
            return StatusCode(500, Utils.ApiResponse<IEnumerable<TaskItemDTO>>.ServerErrorResponse());
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
            int userId = User.GetUserId();
            
            IEnumerable<TaskItemDTO> tasks = await _taskService.GetTasksByDueDateRangeAsync(userId, startDate, endDate);
            
            return Ok(Utils.ApiResponse<IEnumerable<TaskItemDTO>>.SuccessResponse(tasks));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving tasks by due date range");
            return StatusCode(500, Utils.ApiResponse<IEnumerable<TaskItemDTO>>.ServerErrorResponse());
        }
    }
    
    // GET: api/TaskItems/overdue
    [HttpGet("overdue")]
    public async Task<ActionResult<IEnumerable<TaskItemDTO>>> GetOverdueTasks()
    {
        try
        {
            int userId = User.GetUserId();
            
            IEnumerable<TaskItemDTO> tasks = await _taskService.GetOverdueTasksAsync(userId);
            
            return Ok(Utils.ApiResponse<IEnumerable<TaskItemDTO>>.SuccessResponse(tasks));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving overdue tasks");
            return StatusCode(500, Utils.ApiResponse<IEnumerable<TaskItemDTO>>.ServerErrorResponse());
        }
    }
    
    // GET: api/TaskItems/due-today
    [HttpGet("due-today")]
    public async Task<ActionResult<IEnumerable<TaskItemDTO>>> GetDueTodayTasks()
    {
        try
        {
            int userId = User.GetUserId();
            
            IEnumerable<TaskItemDTO> tasks = await _taskService.GetDueTodayTasksAsync(userId);
            
            return Ok(Utils.ApiResponse<IEnumerable<TaskItemDTO>>.SuccessResponse(tasks));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving tasks due today");
            return StatusCode(500, Utils.ApiResponse<IEnumerable<TaskItemDTO>>.ServerErrorResponse());
        }
    }
    
    // GET: api/TaskItems/due-this-week
    [HttpGet("due-this-week")]
    public async Task<ActionResult<IEnumerable<TaskItemDTO>>> GetDueThisWeekTasks()
    {
        try
        {
            int userId = User.GetUserId();
            
            IEnumerable<TaskItemDTO> tasks = await _taskService.GetDueThisWeekTasksAsync(userId);
            
            return Ok(Utils.ApiResponse<IEnumerable<TaskItemDTO>>.SuccessResponse(tasks));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving tasks due this week");
            return StatusCode(500, Utils.ApiResponse<IEnumerable<TaskItemDTO>>.ServerErrorResponse());
        }
    }
    
    // GET: api/TaskItems/statistics
    [HttpGet("statistics")]
    [RateLimit(20, 30)] // Statistics can be resource-intensive
    public async Task<ActionResult<TimeRangeTaskStatisticsDTO>> GetTaskStatistics()
    {
        try
        {
            int userId = User.GetUserId();
            
            TimeRangeTaskStatisticsDTO statistics = await _taskService.GetTaskStatisticsAsync(userId);
            
            return Ok(Utils.ApiResponse<TimeRangeTaskStatisticsDTO>.SuccessResponse(statistics));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving task statistics");
            return StatusCode(500, Utils.ApiResponse<TimeRangeTaskStatisticsDTO>.ServerErrorResponse());
        }
    }
    
    // POST: api/TaskItems/complete-batch
    [HttpPost("complete-batch")]
    [RateLimit(20, 60)] // Limit batch operations more strictly
    public async Task<IActionResult> CompleteTasks([FromBody] List<int> taskIds)
    {
        try
        {
            int userId = User.GetUserId();
            
            // Verify task ownership for all tasks
            List<int> validTaskIds = new List<int>();
            foreach (int taskId in taskIds)
            {
                bool isTaskOwned = await _taskService.IsTaskOwnedByUserAsync(taskId, userId);
                if (!isTaskOwned)
                {
                    return NotFound(Utils.ApiResponse<object>.NotFoundResponse($"Task with ID {taskId} not found"));
                }
                validTaskIds.Add(taskId);
            }
            
            if (validTaskIds.Count > 0)
            {
                await _taskService.CompleteTasksAsync(userId, validTaskIds);
            }
            
            return NoContent();
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "User tried to complete tasks they don't own");
            return Forbid();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error completing batch of tasks");
            return StatusCode(500, Utils.ApiResponse<object>.ServerErrorResponse());
        }
    }
    
    // PUT: api/TaskItems/{id}/status
    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateTaskStatus(int id, [FromBody] TaskItemStatus status)
    {
        try
        {
            int userId = User.GetUserId();
            
            // Verify task ownership
            bool isTaskOwned = await _taskService.IsTaskOwnedByUserAsync(id, userId);
            if (!isTaskOwned)
            {
                return NotFound(Utils.ApiResponse<object>.NotFoundResponse($"Task with ID {id} not found"));
            }
            
            await _taskService.UpdateTaskStatusAsync(userId, id, status);
            
            return NoContent();
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "User tried to update status for a task they don't own");
            return Forbid();
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Invalid operation on task {TaskId}", id);
            return BadRequest(Utils.ApiResponse<object>.BadRequestResponse(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating status for task {TaskId}", id);
            return StatusCode(500, Utils.ApiResponse<object>.ServerErrorResponse());
        }
    }
    
    // POST: api/TaskItems/{id}/tags/{tagId}
    [HttpPost("{id}/tags/{tagId}")]
    public async Task<IActionResult> AddTagToTask(int id, int tagId)
    {
        try
        {
            int userId = User.GetUserId();
            
            // Verify task ownership
            bool isTaskOwned = await _taskService.IsTaskOwnedByUserAsync(id, userId);
            if (!isTaskOwned)
            {
                return NotFound(Utils.ApiResponse<object>.NotFoundResponse($"Task with ID {id} not found"));
            }
            
            await _taskService.AddTagToTaskAsync(userId, id, tagId);
            
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding tag to task");
            return StatusCode(500, Utils.ApiResponse<object>.ServerErrorResponse());
        }
    }
    
    // DELETE: api/TaskItems/{id}/tags/{tagId}
    [HttpDelete("{id}/tags/{tagId}")]
    public async Task<IActionResult> RemoveTagFromTask(int id, int tagId)
    {
        try
        {
            int userId = User.GetUserId();
            
            // Verify task ownership
            bool isTaskOwned = await _taskService.IsTaskOwnedByUserAsync(id, userId);
            if (!isTaskOwned)
            {
                return NotFound(Utils.ApiResponse<object>.NotFoundResponse($"Task with ID {id} not found"));
            }
            
            await _taskService.RemoveTagFromTaskAsync(userId, id, tagId);
            
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing tag from task");
            return StatusCode(500, Utils.ApiResponse<object>.ServerErrorResponse());
        }
    }
    
    // PUT: api/TaskItems/{id}/tags
    [HttpPut("{id}/tags")]
    public async Task<IActionResult> UpdateTaskTags(int id, [FromBody] List<int> tagIds)
    {
        try
        {
            int userId = User.GetUserId();
            
            // Verify task ownership
            bool isTaskOwned = await _taskService.IsTaskOwnedByUserAsync(id, userId);
            if (!isTaskOwned)
            {
                return NotFound(Utils.ApiResponse<object>.NotFoundResponse($"Task with ID {id} not found"));
            }
            
            await _taskService.UpdateTaskTagsAsync(userId, id, tagIds);
            
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating task tags");
            return StatusCode(500, Utils.ApiResponse<object>.ServerErrorResponse());
        }
    }
    
    // GET: api/TaskItems/{id}/tags
    [HttpGet("{id}/tags")]
    public async Task<ActionResult<IEnumerable<TagDTO>>> GetTagsForTask(int id)
    {
        try
        {
            int userId = User.GetUserId();
            
            // Verify task ownership
            bool isTaskOwned = await _taskService.IsTaskOwnedByUserAsync(id, userId);
            if (!isTaskOwned)
            {
                return NotFound(Utils.ApiResponse<IEnumerable<TagDTO>>.NotFoundResponse($"Task with ID {id} not found"));
            }
            
            IEnumerable<TagDTO> tags = await _taskService.GetTagsForTaskAsync(userId, id);
            
            return Ok(Utils.ApiResponse<IEnumerable<TagDTO>>.SuccessResponse(tags));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving tags for task");
            return StatusCode(500, Utils.ApiResponse<IEnumerable<TagDTO>>.ServerErrorResponse());
        }
    }

    [HttpGet("paged")]
    public async Task<ActionResult<PagedResult<TaskItemDTO>>> GetPagedTasks([FromQuery] PaginationParams paginationParams)
    {
        try
        {
            int userId = User.GetUserId();
            PagedResult<TaskItemDTO> pagedTasks = await _taskService.GetPagedTasksAsync(userId, paginationParams);
            return Ok(Utils.ApiResponse<PagedResult<TaskItemDTO>>.SuccessResponse(pagedTasks));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving paged tasks");
            return StatusCode(500, Utils.ApiResponse<PagedResult<TaskItemDTO>>.ServerErrorResponse());
        }
    }
} 