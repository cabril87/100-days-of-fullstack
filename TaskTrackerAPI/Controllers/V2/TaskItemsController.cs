using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.DTOs.Tasks;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Services.Interfaces;
using TaskTrackerAPI.Utils;
using AutoMapper;
using TaskTrackerAPI.Extensions;
using TaskTrackerAPI.Attributes;

namespace TaskTrackerAPI.Controllers.V2;

[ApiVersion("2.0")]
[Route("api/v{version:apiVersion}/[controller]")]
[ApiController]
[Authorize]
[RateLimit(100, 60)] // Default rate limit for all controller methods: 100 requests per 60 seconds
public class TaskItemsController : ControllerBase
{
    private readonly ITaskService _taskService;
    private readonly ILogger<TaskItemsController> _logger;
    private readonly IFamilyMemberService _familyMemberService;
    private readonly IMapper _mapper;

    public TaskItemsController(
        ITaskService taskService, 
        ILogger<TaskItemsController> logger, 
        IFamilyMemberService familyMemberService,
        IMapper mapper)
    {
        _taskService = taskService;
        _logger = logger;
        _familyMemberService = familyMemberService;
        _mapper = mapper;
    }

    
    /// Gets tasks with pagination and advanced filtering capabilities
    
    /// <param name="page">Page number (default: 1)</param>
    /// <param name="pageSize">Number of items per page (default: 10, max: 50)</param>
    /// <param name="status">Filter tasks by status</param>
    /// <param name="categoryId">Filter tasks by category ID</param>
    /// <param name="priorityLevel">Filter tasks by priority</param>
    /// <param name="dueDateStart">Filter tasks by due date range start</param>
    /// <param name="dueDateEnd">Filter tasks by due date range end</param>
    /// <param name="searchTerm">Search within task title and description</param>
    /// <returns>Paginated list of tasks with metadata</returns>
    [HttpGet]
    [RateLimit(50, 30)] // More strict limit for this potentially resource-intensive endpoint
    [ProducesResponseType(typeof(Utils.ApiResponse<TaskItemCollectionResponseDTO>), 200)]
    public async Task<ActionResult<Utils.ApiResponse<TaskItemCollectionResponseDTO>>> GetTasks(
        [FromQuery] int page = 1, 
        [FromQuery] int pageSize = 10,
        [FromQuery] TaskItemStatus? status = null,
        [FromQuery] int? categoryId = null,
        [FromQuery] string? priorityLevel = null,
        [FromQuery] DateTime? dueDateStart = null,
        [FromQuery] DateTime? dueDateEnd = null,
        [FromQuery] string? searchTerm = null)
    {
        try
        {
            // Cap page size at 50 to prevent performance issues
            pageSize = Math.Min(pageSize, 50);
            
            // Ensure valid page parameters
            if (page < 1) page = 1;
            if (pageSize < 1) pageSize = 10;
            
            int userId = User.GetUserIdAsInt();
            
            // Create pagination parameters
            PaginationParams paginationParams = new PaginationParams
            {
                PageNumber = page,
                PageSize = pageSize
            };
            
            // Get paged tasks
            PagedResult<TaskItemDTO> tasks = await _taskService.GetPagedTasksAsync(userId, paginationParams);
            
            // Apply filters (placeholder logic - should be implemented in repository layer)
            IEnumerable<TaskItemDTO> filteredTasks = tasks.Items;
            
            // Apply status filter
            if (status.HasValue)
            {
                filteredTasks = filteredTasks.Where(t => t.Status == status.Value);
            }
            
            // Apply category filter
            if (categoryId.HasValue)
            {
                filteredTasks = filteredTasks.Where(t => t.CategoryId == categoryId.Value);
            }
            
            // Apply priority filter
            if (!string.IsNullOrEmpty(priorityLevel))
            {
                filteredTasks = filteredTasks.Where(t => t.Priority.ToString().Equals(priorityLevel, StringComparison.OrdinalIgnoreCase));
            }
            
            // Apply due date range filter
            if (dueDateStart.HasValue)
            {
                filteredTasks = filteredTasks.Where(t => t.DueDate >= dueDateStart.Value);
            }
            
            if (dueDateEnd.HasValue)
            {
                filteredTasks = filteredTasks.Where(t => t.DueDate <= dueDateEnd.Value);
            }
            
            // Apply search term filter
            if (!string.IsNullOrEmpty(searchTerm))
            {
                filteredTasks = filteredTasks.Where(t => 
                    t.Title.Contains(searchTerm, StringComparison.OrdinalIgnoreCase) || 
                    (t.Description != null && t.Description.Contains(searchTerm, StringComparison.OrdinalIgnoreCase)));
            }
            
            // Map to response DTOs
            List<TaskItemResponseDTO> responseTasks = _mapper.Map<List<TaskItemResponseDTO>>(filteredTasks);
            
            // Create new paged result with filtered items
            PagedResult<TaskItemResponseDTO> pagedFilteredResult = new PagedResult<TaskItemResponseDTO>(
                responseTasks,
                filteredTasks.Count(),
                paginationParams.PageNumber,
                paginationParams.PageSize
            );
            
            // Add pagination headers
            Response.Headers.Append("X-Pagination-TotalCount", pagedFilteredResult.TotalCount.ToString());
            Response.Headers.Append("X-Pagination-PageSize", pagedFilteredResult.PageSize.ToString());
            Response.Headers.Append("X-Pagination-CurrentPage", pagedFilteredResult.PageNumber.ToString());
            Response.Headers.Append("X-Pagination-TotalPages", pagedFilteredResult.TotalPages.ToString());
            
            // Create HATEOAS links
            string baseUrl = $"{Request.Scheme}://{Request.Host}{Request.Path}";
            Dictionary<string, string> links = new Dictionary<string, string>();
            
            if (pagedFilteredResult.HasPreviousPage)
            {
                links.Add("previousPage", $"{baseUrl}?page={pagedFilteredResult.PageNumber - 1}&pageSize={pageSize}");
            }
            
            if (pagedFilteredResult.HasNextPage)
            {
                links.Add("nextPage", $"{baseUrl}?page={pagedFilteredResult.PageNumber + 1}&pageSize={pageSize}");
            }
            
            links.Add("firstPage", $"{baseUrl}?page=1&pageSize={pageSize}");
            links.Add("lastPage", $"{baseUrl}?page={pagedFilteredResult.TotalPages}&pageSize={pageSize}");
            
            // Create response object
            TaskItemCollectionResponseDTO collectionResponse = new TaskItemCollectionResponseDTO
            {
                Tasks = responseTasks,
                TotalCount = filteredTasks.Count(),
                Links = links
            };
            
            return Ok(Utils.ApiResponse<TaskItemCollectionResponseDTO>.SuccessResponse(collectionResponse));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving tasks with pagination and filtering");
            return StatusCode(500, Utils.ApiResponse<TaskItemCollectionResponseDTO>.ServerErrorResponse());
        }
    }

    // GET: api/v2/TaskItems/5
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(Utils.ApiResponse<TaskItemDetailResponseDTO>), 200)]
    [ProducesResponseType(typeof(Utils.ApiResponse<object>), 404)]
    public async Task<ActionResult<Utils.ApiResponse<TaskItemDetailResponseDTO>>> GetTaskItem(int id)
    {
        try
        {
            int userId = User.GetUserIdAsInt();
            
            // First check if the task exists and belongs to the user
            bool isTaskOwned = await _taskService.IsTaskOwnedByUserAsync(id, userId);
            
            if (!isTaskOwned)
            {
                return NotFound(Utils.ApiResponse<TaskItemDetailResponseDTO>.NotFoundResponse($"Task with ID {id} not found"));
            }
            
            TaskItemDTO? task = await _taskService.GetTaskByIdAsync(userId, id);
            
            if (task == null)
            {
                return NotFound(Utils.ApiResponse<TaskItemDetailResponseDTO>.NotFoundResponse($"Task with ID {id} not found"));
            }
            
            // Map to response DTO
            TaskItemResponseDTO responseTask = _mapper.Map<TaskItemResponseDTO>(task);
            
            // Add HATEOAS links
            TaskItemDetailResponseDTO detailResponse = new TaskItemDetailResponseDTO
            {
                Task = responseTask,
                Links = new Dictionary<string, string>
                {
                    { "self", $"{Request.Scheme}://{Request.Host}/api/v2/TaskItems/{id}" },
                    { "update", $"{Request.Scheme}://{Request.Host}/api/v2/TaskItems/{id}" },
                    { "delete", $"{Request.Scheme}://{Request.Host}/api/v2/TaskItems/{id}" },
                    { "related_tasks", $"{Request.Scheme}://{Request.Host}/api/v2/TaskItems?categoryId={task.CategoryId}" }
                }
            };
            
            return Ok(Utils.ApiResponse<TaskItemDetailResponseDTO>.SuccessResponse(detailResponse));
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access attempt for task {TaskId}", id);
            return Forbid();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving task {TaskId}", id);
            return StatusCode(500, Utils.ApiResponse<TaskItemDetailResponseDTO>.ServerErrorResponse());
        }
    }
    
    // POST: api/v2/TaskItems
    [HttpPost]
    [RateLimit(30, 60)] // Limit creation rate to prevent abuse
    [ProducesResponseType(typeof(Utils.ApiResponse<TaskItemResponseDTO>), 201)]
    [ProducesResponseType(typeof(Utils.ApiResponse<object>), 400)]
    public async Task<ActionResult<Utils.ApiResponse<TaskItemResponseDTO>>> CreateTaskItem([FromBody] TaskItemCreateRequestDTO createRequest)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(Utils.ApiResponse<object>.BadRequestResponse("Invalid task data", ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList()));
            }
            
            int userId = User.GetUserIdAsInt();
            
            // Map to the service DTO
            TaskItemDTO taskDto = new TaskItemDTO
            {
                Title = createRequest.Title,
                Description = createRequest.Description,
                Status = createRequest.Status,
                DueDate = createRequest.DueDate,
                Priority = createRequest.Priority,
                CategoryId = createRequest.CategoryId,
                UserId = userId
            };
            
            // Create the task
            TaskItemDTO? createdTask = await _taskService.CreateTaskAsync(userId, taskDto);
            
            if (createdTask == null)
            {
                return BadRequest(Utils.ApiResponse<TaskItemResponseDTO>.BadRequestResponse("Failed to create task"));
            }
            
            // Add tags if provided
            if (createRequest.TagIds.Count > 0)
            {
                await _taskService.UpdateTaskTagsAsync(userId, createdTask.Id, createRequest.TagIds);
                
                // Refresh the task to include tags
                createdTask = await _taskService.GetTaskByIdAsync(userId, createdTask.Id);
            }
            
            // Map to response DTO
            TaskItemResponseDTO responseTask = _mapper.Map<TaskItemResponseDTO>(createdTask);
            
            // Return created task with location header
            return CreatedAtAction(
                nameof(GetTaskItem), 
                new { id = responseTask.Id, version = "2.0" }, 
                Utils.ApiResponse<TaskItemResponseDTO>.SuccessResponse(responseTask)
            );
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "User tried to create a task with unauthorized data");
            return Forbid();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating task");
            return StatusCode(500, Utils.ApiResponse<TaskItemResponseDTO>.ServerErrorResponse());
        }
    }
    
    // PUT: api/v2/TaskItems/5
    [HttpPut("{id}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(typeof(Utils.ApiResponse<object>), 400)]
    [ProducesResponseType(typeof(Utils.ApiResponse<object>), 404)]
    public async Task<IActionResult> UpdateTaskItem(int id, [FromBody] TaskItemUpdateRequestDTO updateRequest)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(Utils.ApiResponse<object>.BadRequestResponse("Invalid task data", ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList()));
            }
            
            int userId = User.GetUserIdAsInt();
            
            // Check if task exists and is owned by the user
            bool isTaskOwned = await _taskService.IsTaskOwnedByUserAsync(id, userId);
            if (!isTaskOwned)
            {
                return NotFound(Utils.ApiResponse<object>.NotFoundResponse($"Task with ID {id} not found"));
            }
            
            // Get existing task
            TaskItemDTO? existingTask = await _taskService.GetTaskByIdAsync(userId, id);
            if (existingTask == null)
            {
                return NotFound(Utils.ApiResponse<object>.NotFoundResponse($"Task with ID {id} not found"));
            }
            
            // Update with provided values
            if (updateRequest.Title != null) existingTask.Title = updateRequest.Title;
            if (updateRequest.Description != null) existingTask.Description = updateRequest.Description;
            if (updateRequest.Status.HasValue) existingTask.Status = updateRequest.Status.Value;
            if (updateRequest.DueDate.HasValue) existingTask.DueDate = updateRequest.DueDate;
            if (updateRequest.Priority.HasValue) existingTask.Priority = updateRequest.Priority.Value;
            if (updateRequest.CategoryId.HasValue) existingTask.CategoryId = updateRequest.CategoryId;
            
            // Update task
            await _taskService.UpdateTaskAsync(userId, id, existingTask);
            
            // Update tags if provided
            if (updateRequest.TagIds != null)
            {
                await _taskService.UpdateTaskTagsAsync(userId, id, updateRequest.TagIds);
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
            return StatusCode(500, Utils.ApiResponse<object>.ServerErrorResponse());
        }
    }
    
    // PUT: api/v2/TaskItems/5/status
    [HttpPut("{id}/status")]
    [ProducesResponseType(typeof(Utils.ApiResponse<TaskStatusUpdateResponseDTO>), 200)]
    [ProducesResponseType(typeof(Utils.ApiResponse<object>), 400)]
    [ProducesResponseType(typeof(Utils.ApiResponse<object>), 404)]
    public async Task<ActionResult<Utils.ApiResponse<TaskStatusUpdateResponseDTO>>> UpdateTaskStatus(
        int id, 
        [FromBody] TaskStatusUpdateRequestDTO statusUpdate)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(Utils.ApiResponse<object>.BadRequestResponse("Invalid status data", ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList()));
            }
            
            int userId = User.GetUserIdAsInt();
            
            // Check if task exists and is owned by the user
            bool isTaskOwned = await _taskService.IsTaskOwnedByUserAsync(id, userId);
            if (!isTaskOwned)
            {
                return NotFound(Utils.ApiResponse<object>.NotFoundResponse($"Task with ID {id} not found"));
            }
            
            // Get existing task to capture previous status
            TaskItemDTO? existingTask = await _taskService.GetTaskByIdAsync(userId, id);
            if (existingTask == null)
            {
                return NotFound(Utils.ApiResponse<object>.NotFoundResponse($"Task with ID {id} not found"));
            }
            
            TaskItemStatus previousStatus = existingTask.Status;
            
            // Update task status
            await _taskService.UpdateTaskStatusAsync(userId, id, statusUpdate.Status);
            
            // Create response
            var statusUpdateResponse = new TaskStatusUpdateResponseDTO
            {
                TaskId = id,
                PreviousStatus = previousStatus,
                NewStatus = statusUpdate.Status,
                UpdatedAt = DateTime.UtcNow
            };
            
            return Ok(Utils.ApiResponse<TaskStatusUpdateResponseDTO>.SuccessResponse(statusUpdateResponse));
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
    
    // DELETE: api/v2/TaskItems/5
    [HttpDelete("{id}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(typeof(Utils.ApiResponse<object>), 404)]
    public async Task<IActionResult> DeleteTaskItem(int id)
    {
        try
        {
            int userId = User.GetUserIdAsInt();
            
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
    
    // POST: api/v2/TaskItems/batch-complete
    [HttpPost("batch-complete")]
    [ProducesResponseType(204)]
    [ProducesResponseType(typeof(Utils.ApiResponse<object>), 400)]
    public async Task<IActionResult> CompleteTasks([FromBody] BatchCompleteRequestDTO batchRequest)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(Utils.ApiResponse<object>.BadRequestResponse("Invalid batch data", ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList()));
            }
            
            int userId = User.GetUserIdAsInt();
            
            // Verify task ownership for all tasks
            List<int> validTaskIds = new List<int>();
            foreach (int taskId in batchRequest.TaskIds)
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

    // POST: api/TaskItems/smart-prioritize
    [HttpGet("smart-prioritize")]
    [RateLimit(10, 60)] // Strict limit due to complex algorithm
    public async Task<ActionResult<IEnumerable<TaskItemDTO>>> GetSmartPrioritizedTasks()
    {
        try 
        {
            int userId = User.GetUserIdAsInt();
            
            // Get user tasks first
            var tasks = await _taskService.GetAllTasksAsync(userId);
            
            // Here you would implement your prioritization algorithm
            // For now, just returning the tasks ordered by due date and priority
            var prioritizedTasks = tasks
                .OrderBy(t => t.DueDate)
                .ThenByDescending(t => t.Priority)
                .ToList();
                
            return Ok(Utils.ApiResponse<IEnumerable<TaskItemDTO>>.SuccessResponse(prioritizedTasks));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting smart prioritized tasks");
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
            int userId = User.GetUserIdAsInt();
            
            // Get task statistics directly from the service - using the existing DTO
            var statistics = await _taskService.GetTaskStatisticsAsync(userId);
            
            return Ok(Utils.ApiResponse<TimeRangeTaskStatisticsDTO>.SuccessResponse(statistics));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving task statistics");
            return StatusCode(500, Utils.ApiResponse<TimeRangeTaskStatisticsDTO>.ServerErrorResponse());
        }
    }
} 