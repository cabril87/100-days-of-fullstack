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
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TaskTrackerAPI.DTOs.Tasks;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Services.Interfaces;
using TaskTrackerAPI.Extensions;
using TaskTrackerAPI.DTOs.Tags;
using TaskTrackerAPI.Attributes;
using System.Text.Json;
using System.Linq;
using AutoMapper;
using TaskTrackerAPI.Controllers.V2;

namespace TaskTrackerAPI.Controllers.V1;

/// <summary>
/// Task management controller - handles core task CRUD operations and task-related features.
/// Accessible to all authenticated users (RegularUser and above).
/// Some admin functions require elevated privileges.
/// </summary>
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
[ApiController]
[Authorize]
[RequireRole(UserRole.RegularUser)] // All authenticated users can access task management
[RateLimit(100, 60)] // Default rate limit for all controller methods: 100 requests per 60 seconds
public class TaskItemsController : BaseApiController
{
    private readonly ITaskService _taskService;
    private readonly ITagService _tagService;
    private readonly ILogger<TaskItemsController> _logger;
    private readonly IFamilyMemberService _familyMemberService;
    private readonly IMapper _mapper;

    public TaskItemsController(
        ITaskService taskService, 
        ITagService tagService,
        ILogger<TaskItemsController> logger, 
        IFamilyMemberService familyMemberService,
        IMapper mapper)
    {
        _taskService = taskService;
        _tagService = tagService;
        _logger = logger;
        _familyMemberService = familyMemberService;
        _mapper = mapper;
    }

    // GET: api/TaskItems
    [HttpGet]
    [RateLimit(50, 30)] // More strict limit for this potentially resource-intensive endpoint
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<TaskItemDTO>>), 200)]
    public async Task<ActionResult<ApiResponse<IEnumerable<TaskItemDTO>>>> GetTasks(
        [FromQuery] string? due = null,
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
            int userId = User.GetUserIdAsInt();
            IEnumerable<TaskItemDTO> tasks;
            
            // Handle different 'due' parameter values for backward compatibility
            switch (due?.ToLower())
            {
                case "today":
                    tasks = await _taskService.GetDueTodayTasksAsync(userId);
                    break;
                case "week":
                case "thisweek":
                    tasks = await _taskService.GetDueThisWeekTasksAsync(userId);
                    break;
                case "overdue":
                    tasks = await _taskService.GetOverdueTasksAsync(userId);
                    break;
                default:
                    // Use pagination if no specific 'due' filter is specified
                    if (page > 1 || pageSize != 10 || status.HasValue || categoryId.HasValue || !string.IsNullOrEmpty(searchTerm))
                    {
                        // Cap page size at 50 to prevent performance issues
                        pageSize = Math.Min(pageSize, 50);
                        if (page < 1) page = 1;
                        if (pageSize < 1) pageSize = 10;

                        PaginationParams paginationParams = new PaginationParams
                        {
                            PageNumber = page,
                            PageSize = pageSize
                        };

                        PagedResult<TaskItemDTO> pagedTasks = await _taskService.GetPagedTasksAsync(userId, paginationParams);
                        tasks = pagedTasks.Items;

                        // Apply filters (should ideally be in repository layer)
                        if (status.HasValue)
                            tasks = tasks.Where(t => t.Status == status.Value);
                        if (categoryId.HasValue)
                            tasks = tasks.Where(t => t.CategoryId == categoryId.Value);
                        if (!string.IsNullOrEmpty(priorityLevel))
                            tasks = tasks.Where(t => t.Priority.ToString().Equals(priorityLevel, StringComparison.OrdinalIgnoreCase));
                        if (dueDateStart.HasValue)
                            tasks = tasks.Where(t => t.DueDate >= dueDateStart.Value);
                        if (dueDateEnd.HasValue)
                            tasks = tasks.Where(t => t.DueDate <= dueDateEnd.Value);
                        if (!string.IsNullOrEmpty(searchTerm))
                            tasks = tasks.Where(t => t.Title.Contains(searchTerm, StringComparison.OrdinalIgnoreCase) ||
                                                   (t.Description != null && t.Description.Contains(searchTerm, StringComparison.OrdinalIgnoreCase)));

                        // Add pagination headers
                        Response.Headers["X-Pagination-TotalCount"] = pagedTasks.TotalCount.ToString();
                        Response.Headers["X-Pagination-PageSize"] = pagedTasks.PageSize.ToString();
                        Response.Headers["X-Pagination-CurrentPage"] = pagedTasks.PageNumber.ToString();
                        Response.Headers["X-Pagination-TotalPages"] = pagedTasks.TotalPages.ToString();
                    }
                    else
                    {
                        tasks = await _taskService.GetAllTasksAsync(userId);
                    }
                    break;
            }
            
            return Ok(ApiResponse<IEnumerable<TaskItemDTO>>.SuccessResponse(tasks));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving tasks");
            return StatusCode(500, ApiResponse<IEnumerable<TaskItemDTO>>.ServerErrorResponse());
        }
    }

    // GET: api/TaskItems/5
    [HttpGet("{id}")]
    [SecurityRequirements(
        requirementLevel: SecurityRequirementLevel.Authenticated,
        resourceType: ResourceType.Task,
        requireOwnership: true)]
    [ProducesResponseType(typeof(ApiResponse<TaskItemDTO>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 404)]
    public async Task<ActionResult<ApiResponse<TaskItemDTO>>> GetTaskItem(int id)
    {
        try
        {
            int userId = User.GetUserIdAsInt();
            TaskItemDTO? task = await _taskService.GetTaskByIdAsync(userId, id);
            
            if (task == null)
            {
                return NotFound(ApiResponse<TaskItemDTO>.NotFoundResponse($"Task with ID {id} not found"));
            }
            
            return Ok(ApiResponse<TaskItemDTO>.SuccessResponse(task));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving task {TaskId}", id);
            return StatusCode(500, ApiResponse<TaskItemDTO>.ServerErrorResponse());
        }
    }

    // POST: api/TaskItems
    [HttpPost]
    [RateLimit(30, 60)] // Limit creation rate to prevent abuse
    [ProducesResponseType(typeof(ApiResponse<TaskItemDTO>), 201)]
    [ProducesResponseType(typeof(ApiResponse<object>), 400)]
    public async Task<ActionResult<TaskItemDTO>> CreateTaskItem([FromBody] object taskData, [FromQuery] bool quick = false)
    {
        try
        {
            int userId = User.GetUserIdAsInt();
            TaskItemDTO? createdTask;
            
            if (quick)
            {
                // Handle quick task creation (minimal fields)
                QuickTaskDTO? quickTaskDto = JsonSerializer.Deserialize<QuickTaskDTO>(
                    taskData.ToString() ?? "", 
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
                );
                
                if (quickTaskDto == null)
                {
                    return BadRequest(ApiResponse<TaskItemDTO>.BadRequestResponse("Invalid quick task data"));
                }
                
                // Use AutoMapper to convert QuickTaskDTO to TaskItemDTO
                TaskItemDTO taskDto = _mapper.Map<TaskItemDTO>(quickTaskDto);
                taskDto.Status = TaskItemStatus.NotStarted;
                taskDto.IsRecurring = false;
                
                createdTask = await _taskService.CreateTaskAsync(userId, taskDto);
            }
            else
            {
                // Handle normal task creation - support both V1 and V2 formats
                try
                {
                    // Try V2 format first (TaskItemCreateRequestDTO)
                    TaskItemCreateRequestDTO? createRequest = JsonSerializer.Deserialize<TaskItemCreateRequestDTO>(
                        taskData.ToString() ?? "", 
                        new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
                    );
                    
                    if (createRequest != null && !string.IsNullOrEmpty(createRequest.Title))
                    {
                        // Use AutoMapper to convert to service DTO
                        TaskItemDTO taskDto = _mapper.Map<TaskItemDTO>(createRequest);
                        taskDto.UserId = userId;
                        
                        createdTask = await _taskService.CreateTaskAsync(userId, taskDto);
                        
                        // Handle tags if provided (convert string tags to tag IDs)
                        if (createRequest.Tags?.Count > 0)
                        {
                            try
                            {
                                // Convert tag names to tag IDs (create tags if they don't exist)
                                List<int> tagIds = await ConvertTagNamesToIds(userId, createRequest.Tags);
                                if (tagIds.Count > 0)
                                {
                                    await _taskService.UpdateTaskTagsAsync(userId, createdTask?.Id ?? 0, tagIds);
                                    // Refresh to include tags
                                    createdTask = await _taskService.GetTaskByIdAsync(userId, createdTask?.Id ?? 0);
                                }
                            }
                            catch (Exception ex)
                            {
                                _logger.LogWarning(ex, "Failed to process tags for task creation: {Tags}", 
                                    string.Join(", ", createRequest.Tags));
                                // Continue without tags rather than failing the entire task creation
                            }
                        }
                    }
                    else
                    {
                        throw new JsonException("V2 format parsing failed");
                    }
                }
                catch
                {
                    // Fallback to V1 format (TaskItemDTO)
                    TaskItemDTO? taskDto = JsonSerializer.Deserialize<TaskItemDTO>(
                        taskData.ToString() ?? "", 
                        new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
                    );
                    
                    if (taskDto == null)
                    {
                        return BadRequest(ApiResponse<TaskItemDTO>.BadRequestResponse("Invalid task data"));
                    }
                    
                    createdTask = await _taskService.CreateTaskAsync(userId, taskDto);
                }
            }
            
            if (createdTask == null)
            {
                return BadRequest(ApiResponse<TaskItemDTO>.BadRequestResponse("Failed to create task"));
            }
            
            return CreatedAtAction(
                nameof(GetTaskItem), 
                new { id = createdTask.Id }, 
                ApiResponse<TaskItemDTO>.SuccessResponse(createdTask)
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
            return StatusCode(500, ApiResponse<TaskItemDTO>.ServerErrorResponse());
        }
    }

    // PUT: api/TaskItems/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTaskItem(int id, TaskItemDTO taskDto)
    {
        try
        {
            int userId = User.GetUserIdAsInt();
            
            TaskItemDTO? updatedTask = await _taskService.UpdateTaskAsync(userId, id, taskDto);
            
            if (updatedTask == null)
            {
                return NotFound(ApiResponse<TaskItemDTO>.NotFoundResponse($"Task with ID {id} not found or you are not authorized to modify it"));
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
            return StatusCode(500, ApiResponse<TaskItemDTO>.ServerErrorResponse());
        }
    }

    // DELETE: api/TaskItems/5
    [HttpDelete("{id}")]
    [SecurityRequirements(
        requirementLevel: SecurityRequirementLevel.Authenticated,
        resourceType: ResourceType.Task,
        requireOwnership: true,
        allowChildAccess: false)]
    public async Task<IActionResult> DeleteTaskItem(int id)
    {
        try
        {
            int userId = User.GetUserIdAsInt();
            await _taskService.DeleteTaskAsync(userId, id);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting task {TaskId}", id);
            return StatusCode(500, ApiResponse<object>.ServerErrorResponse());
        }
    }
    
    // GET: api/TaskItems/status/{status}
    [HttpGet("status/{status}")]
    public async Task<ActionResult<IEnumerable<TaskItemDTO>>> GetTasksByStatus(TaskItemStatus status)
    {
        try
        {
            int userId = User.GetUserIdAsInt();
            
            IEnumerable<TaskItemDTO> tasks = await _taskService.GetTasksByStatusAsync(userId, status);
            
            return Ok(ApiResponse<IEnumerable<TaskItemDTO>>.SuccessResponse(tasks));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving tasks with status {Status}", status);
            return StatusCode(500, ApiResponse<IEnumerable<TaskItemDTO>>.ServerErrorResponse());
        }
    }
    
    // GET: api/TaskItems/category/{categoryId}
    [HttpGet("category/{categoryId}")]
    public async Task<ActionResult<IEnumerable<TaskItemDTO>>> GetTasksByCategory(int categoryId)
    {
        try
        {
            int userId = User.GetUserIdAsInt();
            
            IEnumerable<TaskItemDTO> tasks = await _taskService.GetTasksByCategoryAsync(userId, categoryId);
            
            return Ok(ApiResponse<IEnumerable<TaskItemDTO>>.SuccessResponse(tasks));
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "User tried to access categories they don't own");
            return Forbid();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving tasks for category ID {CategoryId}", categoryId);
            return StatusCode(500, ApiResponse<IEnumerable<TaskItemDTO>>.ServerErrorResponse());
        }
    }
    
    // GET: api/TaskItems/tags/{tagId}
    [HttpGet("tags/{tagId}")]
    public async Task<ActionResult<IEnumerable<TaskItemDTO>>> GetTasksByTag(int tagId)
    {
        try
        {
            int userId = User.GetUserIdAsInt();
            
            IEnumerable<TaskItemDTO> tasks = await _taskService.GetTasksByTagAsync(userId, tagId);
            
            return Ok(ApiResponse<IEnumerable<TaskItemDTO>>.SuccessResponse(tasks));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving tasks for tag ID {TagId}", tagId);
            return StatusCode(500, ApiResponse<IEnumerable<TaskItemDTO>>.ServerErrorResponse());
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
            int userId = User.GetUserIdAsInt();
            
            IEnumerable<TaskItemDTO> tasks = await _taskService.GetTasksByDueDateRangeAsync(userId, startDate, endDate);
            
            return Ok(ApiResponse<IEnumerable<TaskItemDTO>>.SuccessResponse(tasks));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving tasks by due date range");
            return StatusCode(500, ApiResponse<IEnumerable<TaskItemDTO>>.ServerErrorResponse());
        }
    }
    
    // GET: api/TaskItems/overdue
    [HttpGet("overdue")]
    public async Task<ActionResult<IEnumerable<TaskItemDTO>>> GetOverdueTasks()
    {
        try
        {
            int userId = User.GetUserIdAsInt();
            
            IEnumerable<TaskItemDTO> tasks = await _taskService.GetOverdueTasksAsync(userId);
            
            return Ok(ApiResponse<IEnumerable<TaskItemDTO>>.SuccessResponse(tasks));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving overdue tasks");
            return StatusCode(500, ApiResponse<IEnumerable<TaskItemDTO>>.ServerErrorResponse());
        }
    }
    
    // GET: api/TaskItems/due-today
    [HttpGet("due-today")]
    public async Task<ActionResult<IEnumerable<TaskItemDTO>>> GetDueTodayTasks()
    {
        try
        {
            int userId = User.GetUserIdAsInt();
            
            IEnumerable<TaskItemDTO> tasks = await _taskService.GetDueTodayTasksAsync(userId);
            
            return Ok(ApiResponse<IEnumerable<TaskItemDTO>>.SuccessResponse(tasks));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving tasks due today");
            return StatusCode(500, ApiResponse<IEnumerable<TaskItemDTO>>.ServerErrorResponse());
        }
    }
    
    // GET: api/TaskItems/due-this-week
    [HttpGet("due-this-week")]
    public async Task<ActionResult<IEnumerable<TaskItemDTO>>> GetDueThisWeekTasks()
    {
        try
        {
            int userId = User.GetUserIdAsInt();
            
            IEnumerable<TaskItemDTO> tasks = await _taskService.GetDueThisWeekTasksAsync(userId);
            
            return Ok(ApiResponse<IEnumerable<TaskItemDTO>>.SuccessResponse(tasks));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving tasks due this week");
            return StatusCode(500, ApiResponse<IEnumerable<TaskItemDTO>>.ServerErrorResponse());
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
            
            TimeRangeTaskStatisticsDTO statistics = await _taskService.GetTaskStatisticsAsync(userId);
            
            return Ok(ApiResponse<TimeRangeTaskStatisticsDTO>.SuccessResponse(statistics));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving task statistics");
            return StatusCode(500, ApiResponse<TimeRangeTaskStatisticsDTO>.ServerErrorResponse());
        }
    }
    
    // POST: api/TaskItems/complete-batch
    [HttpPost("complete-batch")]
    [RateLimit(20, 60)] // Limit batch operations more strictly
    public async Task<IActionResult> CompleteTasks([FromBody] List<int> taskIds)
    {
        try
        {
            int userId = User.GetUserIdAsInt();
            
            // Verify task ownership for all tasks
            List<int> validTaskIds = new List<int>();
            foreach (int taskId in taskIds)
            {
                bool isTaskOwned = await _taskService.IsTaskOwnedByUserAsync(taskId, userId);
                if (!isTaskOwned)
                {
                    return NotFound(ApiResponse<object>.NotFoundResponse($"Task with ID {taskId} not found"));
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
            return StatusCode(500, ApiResponse<object>.ServerErrorResponse());
        }
    }
    
    // PUT: api/TaskItems/{id}/status
    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateTaskStatus(int id, [FromBody] TaskItemStatus status)
    {
        try
        {
            int userId = User.GetUserIdAsInt();
            
            // Verify task ownership
            bool isTaskOwned = await _taskService.IsTaskOwnedByUserAsync(id, userId);
            if (!isTaskOwned)
            {
                return NotFound(ApiResponse<object>.NotFoundResponse($"Task with ID {id} not found"));
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
            return BadRequest(ApiResponse<object>.BadRequestResponse(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating status for task {TaskId}", id);
            return StatusCode(500, ApiResponse<object>.ServerErrorResponse());
        }
    }
    
    // POST: api/TaskItems/{id}/tags/{tagId}
    [HttpPost("{id}/tags/{tagId}")]
    public async Task<IActionResult> AddTagToTask(int id, int tagId)
    {
        try
        {
            int userId = User.GetUserIdAsInt();
            
            // Verify task ownership
            bool isTaskOwned = await _taskService.IsTaskOwnedByUserAsync(id, userId);
            if (!isTaskOwned)
            {
                return NotFound(ApiResponse<object>.NotFoundResponse($"Task with ID {id} not found"));
            }
            
            await _taskService.AddTagToTaskAsync(userId, id, tagId);
            
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding tag to task");
            return StatusCode(500, ApiResponse<object>.ServerErrorResponse());
        }
    }
    
    // DELETE: api/TaskItems/{id}/tags/{tagId}
    [HttpDelete("{id}/tags/{tagId}")]
    public async Task<IActionResult> RemoveTagFromTask(int id, int tagId)
    {
        try
        {
            int userId = User.GetUserIdAsInt();
            
            // Verify task ownership
            bool isTaskOwned = await _taskService.IsTaskOwnedByUserAsync(id, userId);
            if (!isTaskOwned)
            {
                return NotFound(ApiResponse<object>.NotFoundResponse($"Task with ID {id} not found"));
            }
            
            await _taskService.RemoveTagFromTaskAsync(userId, id, tagId);
            
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing tag from task");
            return StatusCode(500, ApiResponse<object>.ServerErrorResponse());
        }
    }
    
    // PUT: api/TaskItems/{id}/tags
    [HttpPut("{id}/tags")]
    public async Task<IActionResult> UpdateTaskTags(int id, [FromBody] List<int> tagIds)
    {
        try
        {
            int userId = User.GetUserIdAsInt();
            
            // Verify task ownership
            bool isTaskOwned = await _taskService.IsTaskOwnedByUserAsync(id, userId);
            if (!isTaskOwned)
            {
                return NotFound(ApiResponse<object>.NotFoundResponse($"Task with ID {id} not found"));
            }
            
            await _taskService.UpdateTaskTagsAsync(userId, id, tagIds);
            
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating task tags");
            return StatusCode(500, ApiResponse<object>.ServerErrorResponse());
        }
    }
    
    // GET: api/TaskItems/{id}/tags
    [HttpGet("{id}/tags")]
    public async Task<ActionResult<IEnumerable<TagDTO>>> GetTagsForTask(int id)
    {
        try
        {
            int userId = User.GetUserIdAsInt();
            
            // Verify task ownership
            bool isTaskOwned = await _taskService.IsTaskOwnedByUserAsync(id, userId);
            if (!isTaskOwned)
            {
                return NotFound(ApiResponse<IEnumerable<TagDTO>>.NotFoundResponse($"Task with ID {id} not found"));
            }
            
            IEnumerable<TagDTO> tags = await _taskService.GetTagsForTaskAsync(userId, id);
            
            return Ok(ApiResponse<IEnumerable<TagDTO>>.SuccessResponse(tags));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving tags for task");
            return StatusCode(500, ApiResponse<IEnumerable<TagDTO>>.ServerErrorResponse());
        }
    }

    [HttpGet("paged")]
    public async Task<ActionResult<PagedResult<TaskItemDTO>>> GetPagedTasks([FromQuery] PaginationParams paginationParams)
    {
        try
        {
            int userId = User.GetUserIdAsInt();
            PagedResult<TaskItemDTO> pagedTasks = await _taskService.GetPagedTasksAsync(userId, paginationParams);
            return Ok(ApiResponse<PagedResult<TaskItemDTO>>.SuccessResponse(pagedTasks));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving paged tasks");
            return StatusCode(500, ApiResponse<PagedResult<TaskItemDTO>>.ServerErrorResponse());
        }
    }

    // GET: api/tasks/{taskId}/checklist - Get checklist items for a task
    [HttpGet("{taskId}/checklist")]
    public async Task<ActionResult<IEnumerable<ChecklistItemDTO>>> GetChecklistItems(int taskId)
    {
        try
        {
            int userId = User.GetUserIdAsInt();
            
            // Verify task ownership
            bool isTaskOwned = await _taskService.IsTaskOwnedByUserAsync(taskId, userId);
            if (!isTaskOwned)
            {
                return NotFound(ApiResponse<IEnumerable<ChecklistItemDTO>>.NotFoundResponse($"Task with ID {taskId} not found"));
            }
            
            IEnumerable<ChecklistItemDTO> checklistItems = await _taskService.GetChecklistItemsAsync(userId, taskId);
            
            return Ok(ApiResponse<IEnumerable<ChecklistItemDTO>>.SuccessResponse(checklistItems));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving checklist items for task {TaskId}", taskId);
            return StatusCode(500, ApiResponse<IEnumerable<ChecklistItemDTO>>.ServerErrorResponse());
        }
    }
    
    // POST: api/tasks/{taskId}/checklist - Add checklist item to a task
    [HttpPost("{taskId}/checklist")]
    public async Task<ActionResult<ChecklistItemDTO>> AddChecklistItem(int taskId, [FromBody] ChecklistItemDTO checklistItemDto)
    {
        try
        {
            int userId = User.GetUserIdAsInt();
            
            // Verify task ownership
            bool isTaskOwned = await _taskService.IsTaskOwnedByUserAsync(taskId, userId);
            if (!isTaskOwned)
            {
                return NotFound(ApiResponse<ChecklistItemDTO>.NotFoundResponse($"Task with ID {taskId} not found"));
            }
            
            checklistItemDto.TaskId = taskId;
            ChecklistItemDTO? createdItem = await _taskService.AddChecklistItemAsync(userId, checklistItemDto);
            
            if (createdItem == null)
            {
                return BadRequest(ApiResponse<ChecklistItemDTO>.BadRequestResponse("Failed to add checklist item"));
            }
            
            return CreatedAtAction(
                nameof(GetChecklistItems), 
                new { taskId = taskId }, 
                ApiResponse<ChecklistItemDTO>.SuccessResponse(createdItem)
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding checklist item to task {TaskId}", taskId);
            return StatusCode(500, ApiResponse<ChecklistItemDTO>.ServerErrorResponse());
        }
    }
    
    // PUT: api/tasks/{taskId}/checklist/{itemId} - Update checklist item
    [HttpPut("{taskId}/checklist/{itemId}")]
    public async Task<IActionResult> UpdateChecklistItem(int taskId, int itemId, [FromBody] ChecklistItemDTO checklistItemDto)
    {
        try
        {
            int userId = User.GetUserIdAsInt();
            
            // Verify task ownership
            bool isTaskOwned = await _taskService.IsTaskOwnedByUserAsync(taskId, userId);
            if (!isTaskOwned)
            {
                return NotFound(ApiResponse<object>.NotFoundResponse($"Task with ID {taskId} not found"));
            }
            
            checklistItemDto.Id = itemId;
            checklistItemDto.TaskId = taskId;
            
            bool updated = await _taskService.UpdateChecklistItemAsync(userId, checklistItemDto);
            
            if (!updated)
            {
                return NotFound(ApiResponse<object>.NotFoundResponse($"Checklist item with ID {itemId} not found"));
            }
            
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating checklist item {ItemId} for task {TaskId}", itemId, taskId);
            return StatusCode(500, ApiResponse<object>.ServerErrorResponse());
        }
    }
    
    // DELETE: api/tasks/{taskId}/checklist/{itemId} - Delete checklist item
    [HttpDelete("{taskId}/checklist/{itemId}")]
    public async Task<IActionResult> DeleteChecklistItem(int taskId, int itemId)
    {
        try
        {
            int userId = User.GetUserIdAsInt();
            
            // Verify task ownership
            bool isTaskOwned = await _taskService.IsTaskOwnedByUserAsync(taskId, userId);
            if (!isTaskOwned)
            {
                return NotFound(ApiResponse<object>.NotFoundResponse($"Task with ID {taskId} not found"));
            }
            
            bool deleted = await _taskService.DeleteChecklistItemAsync(userId, taskId, itemId);
            
            if (!deleted)
            {
                return NotFound(ApiResponse<object>.NotFoundResponse($"Checklist item with ID {itemId} not found"));
            }
            
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting checklist item {ItemId} from task {TaskId}", itemId, taskId);
            return StatusCode(500, ApiResponse<object>.ServerErrorResponse());
        }
    }

    // POST: api/tasks/{taskId}/checklist/batch/complete - Complete multiple checklist items
    [HttpPost("{taskId}/checklist/batch/complete")]
    public async Task<IActionResult> BatchCompleteChecklistItems(int taskId, [FromBody] List<int> itemIds)
    {
        try
        {
            int userId = User.GetUserIdAsInt();
            
            // Verify task ownership
            bool isTaskOwned = await _taskService.IsTaskOwnedByUserAsync(taskId, userId);
            if (!isTaskOwned)
            {
                return NotFound(ApiResponse<object>.NotFoundResponse($"Task with ID {taskId} not found"));
            }
            
            if (itemIds == null || !itemIds.Any())
            {
                return BadRequest(ApiResponse<object>.BadRequestResponse("No checklist item IDs provided"));
            }
            
            Dictionary<int, bool> result = new Dictionary<int, bool>();
            
            foreach (int itemId in itemIds)
            {
                // Create a completed checklist item DTO
                ChecklistItemDTO checklistItemDto = new ChecklistItemDTO
                {
                    Id = itemId,
                    TaskId = taskId,
                    IsCompleted = true,
                    CompletedAt = DateTime.UtcNow
                };
                
                bool updated = await _taskService.UpdateChecklistItemAsync(userId, checklistItemDto);
                result.Add(itemId, updated);
            }
            
            return Ok(ApiResponse<Dictionary<int, bool>>.SuccessResponse(result, "Checklist items updated"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error batch completing checklist items for task {TaskId}", taskId);
            return StatusCode(500, ApiResponse<object>.ServerErrorResponse());
        }
    }
    
    // POST: api/tasks/{taskId}/checklist/batch/delete - Delete multiple checklist items
    [HttpPost("{taskId}/checklist/batch/delete")]
    public async Task<IActionResult> BatchDeleteChecklistItems(int taskId, [FromBody] List<int> itemIds)
    {
        try
        {
            int userId = User.GetUserIdAsInt();
            
            // Verify task ownership
            bool isTaskOwned = await _taskService.IsTaskOwnedByUserAsync(taskId, userId);
            if (!isTaskOwned)
            {
                return NotFound(ApiResponse<object>.NotFoundResponse($"Task with ID {taskId} not found"));
            }
            
            if (itemIds == null || !itemIds.Any())
            {
                return BadRequest(ApiResponse<object>.BadRequestResponse("No checklist item IDs provided"));
            }
            
            Dictionary<int, bool> result = new Dictionary<int, bool>();
            
            foreach (int itemId in itemIds)
            {
                bool deleted = await _taskService.DeleteChecklistItemAsync(userId, taskId, itemId);
                result.Add(itemId, deleted);
            }
            
            return Ok(ApiResponse<Dictionary<int, bool>>.SuccessResponse(result, "Checklist items deleted"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error batch deleting checklist items for task {TaskId}", taskId);
            return StatusCode(500, ApiResponse<object>.ServerErrorResponse());
        }
    }
    
    // GET: api/tasks/search - Search tasks by text in title and description
    [HttpGet("search")]
    public async Task<ActionResult<IEnumerable<TaskItemDTO>>> SearchTasks([FromQuery] string query)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(query))
            {
                return BadRequest(ApiResponse<IEnumerable<TaskItemDTO>>.BadRequestResponse("Search query is required"));
            }

            int userId = User.GetUserIdAsInt();
            
            // Get all tasks for the user
            IEnumerable<TaskItemDTO> allTasks = await _taskService.GetAllTasksAsync(userId);
            
            // Perform search on the client side for now
            // In a real application, this should be implemented in the service/repository layer
            IEnumerable<TaskItemDTO> searchResults = allTasks.Where(t => 
                t.Title.Contains(query, StringComparison.OrdinalIgnoreCase) || 
                (t.Description != null && t.Description.Contains(query, StringComparison.OrdinalIgnoreCase))
            );
            
            return Ok(ApiResponse<IEnumerable<TaskItemDTO>>.SuccessResponse(searchResults));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching tasks with query: {Query}", query);
            return StatusCode(500, ApiResponse<IEnumerable<TaskItemDTO>>.ServerErrorResponse());
        }
    }

    // GET: api/tasks/sorted - Get sorted tasks by various criteria
    [HttpGet("sorted")]
    public async Task<ActionResult<IEnumerable<TaskItemDTO>>> GetSortedTasks(
        [FromQuery] string sortBy = "priority",
        [FromQuery] bool ascending = false)
    {
        try
        {
            int userId = User.GetUserIdAsInt();
            
            // Get all tasks for the user
            IEnumerable<TaskItemDTO> allTasks = await _taskService.GetAllTasksAsync(userId);
            
            // Apply sorting based on provided criteria
            IEnumerable<TaskItemDTO> sortedTasks;
            
            switch (sortBy.ToLower())
            {
                case "priority":
                    sortedTasks = ascending 
                        ? allTasks.OrderBy(t => t.Priority)
                        : allTasks.OrderByDescending(t => t.Priority);
                    break;
                    
                case "duedate":
                case "due":
                    sortedTasks = ascending
                        ? allTasks.OrderBy(t => t.DueDate ?? DateTime.MaxValue)
                        : allTasks.OrderByDescending(t => t.DueDate ?? DateTime.MinValue);
                    break;
                    
                case "title":
                    sortedTasks = ascending
                        ? allTasks.OrderBy(t => t.Title)
                        : allTasks.OrderByDescending(t => t.Title);
                    break;
                    
                case "created":
                case "createdat":
                    sortedTasks = ascending
                        ? allTasks.OrderBy(t => t.CreatedAt)
                        : allTasks.OrderByDescending(t => t.CreatedAt);
                    break;
                    
                case "status":
                    sortedTasks = ascending
                        ? allTasks.OrderBy(t => t.Status)
                        : allTasks.OrderByDescending(t => t.Status);
                    break;

                case "estimatedtime":
                case "estimated":
                    sortedTasks = ascending
                        ? allTasks.OrderBy(t => t.EstimatedMinutes ?? int.MaxValue)
                        : allTasks.OrderByDescending(t => t.EstimatedMinutes ?? 0);
                    break;
                    
                default:
                    sortedTasks = allTasks;
                    break;
            }
            
            return Ok(ApiResponse<IEnumerable<TaskItemDTO>>.SuccessResponse(sortedTasks));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving sorted tasks");
            return StatusCode(500, ApiResponse<IEnumerable<TaskItemDTO>>.ServerErrorResponse());
        }
    }

    // PUT: api/TaskItems/{id}/progress
    [HttpPut("{id}/progress")]
    public async Task<IActionResult> UpdateTaskProgress(int id, [FromBody] TaskProgressUpdateDto progressDto)
    {
        try
        {
            int userId = User.GetUserIdAsInt();
            
            var task = await _taskService.GetTaskByIdAsync(userId, id);
            if (task == null)
            {
                return NotFound(ApiResponse<object>.NotFoundResponse($"Task with ID {id} not found"));
            }
            
            // Update the task progress
            var updateDto = new TaskItemDTO
            {
                Id = id,
                Title = task.Title,
                Description = task.Description,
                Status = task.Status,
                Priority = task.Priority,
                DueDate = task.DueDate,
                CategoryId = task.CategoryId,
                ProgressPercentage = progressDto.ProgressPercentage,
                // Copy other existing properties
                IsRecurring = task.IsRecurring,
                RecurringPattern = task.RecurringPattern,
                EstimatedTimeMinutes = task.EstimatedTimeMinutes
            };
            
            var updatedTask = await _taskService.UpdateTaskAsync(userId, id, updateDto);
            if (updatedTask == null)
            {
                return BadRequest(ApiResponse<object>.BadRequestResponse("Failed to update task progress"));
            }
            
            _logger.LogInformation("Task {TaskId} progress updated to {Progress}% by user {UserId}", 
                id, progressDto.ProgressPercentage, userId);
            
            return Ok(ApiResponse<TaskItemDTO>.SuccessResponse(updatedTask, "Task progress updated successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating task progress for task {TaskId}", id);
            return StatusCode(500, ApiResponse<object>.ServerErrorResponse());
        }
    }
    
    // POST: api/TaskItems/{id}/complete
    [HttpPost("{id}/complete")]
    public async Task<IActionResult> CompleteTask(int id)
    {
        try
        {
            int userId = User.GetUserIdAsInt();
            
            var task = await _taskService.GetTaskByIdAsync(userId, id);
            if (task == null)
            {
                return NotFound(ApiResponse<object>.NotFoundResponse($"Task with ID {id} not found"));
            }
            
            // Mark task as completed with 100% progress
            var updateDto = new TaskItemDTO
            {
                Id = id,
                Title = task.Title,
                Description = task.Description,
                Status = TaskItemStatus.Completed,
                Priority = task.Priority,
                DueDate = task.DueDate,
                CategoryId = task.CategoryId,
                ProgressPercentage = 100,
                CompletedAt = DateTime.UtcNow,
                // Copy other existing properties
                IsRecurring = task.IsRecurring,
                RecurringPattern = task.RecurringPattern,
                EstimatedTimeMinutes = task.EstimatedTimeMinutes
            };
            
            var updatedTask = await _taskService.UpdateTaskAsync(userId, id, updateDto);
            if (updatedTask == null)
            {
                return BadRequest(ApiResponse<object>.BadRequestResponse("Failed to complete task"));
            }
            
            _logger.LogInformation("Task {TaskId} marked as completed by user {UserId}", id, userId);
            
            return Ok(ApiResponse<TaskItemDTO>.SuccessResponse(updatedTask, "Task completed successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error completing task {TaskId}", id);
            return StatusCode(500, ApiResponse<object>.ServerErrorResponse());
        }
    }
    
    // GET: api/TaskItems/{id}/time-tracking
    [HttpGet("{id}/time-tracking")]
    public async Task<ActionResult<TaskTimeTrackingDto>> GetTaskTimeTracking(int id)
    {
        try
        {
            int userId = User.GetUserIdAsInt();
            
            var task = await _taskService.GetTaskByIdAsync(userId, id);
            if (task == null)
            {
                return NotFound(ApiResponse<TaskTimeTrackingDto>.NotFoundResponse($"Task with ID {id} not found"));
            }
            
            // This would typically be implemented in a service, but for now I'll create a basic response
            var timeTracking = new TaskTimeTrackingDto
            {
                TaskId = task.Id,
                Title = task.Title,
                EstimatedTimeMinutes = task.EstimatedTimeMinutes,
                ActualTimeSpentMinutes = task.ActualTimeSpentMinutes ?? 0,
                ProgressPercentage = task.ProgressPercentage ?? 0,
                IsCompleted = task.Status == TaskItemStatus.Completed,
                CompletedAt = task.CompletedAt,
                TotalFocusSessions = 0, // Would be calculated from focus sessions
                AverageSessionLength = 0, // Would be calculated from focus sessions
                TimeEfficiencyRating = task.EstimatedTimeMinutes.HasValue && task.ActualTimeSpentMinutes.HasValue && task.EstimatedTimeMinutes > 0 
                    ? (double)task.ActualTimeSpentMinutes.Value / task.EstimatedTimeMinutes.Value 
                    : null,
                FocusSessions = new List<FocusSessionSummaryDto>() // Would be populated from focus sessions
            };
            
            return Ok(ApiResponse<TaskTimeTrackingDto>.SuccessResponse(timeTracking));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving time tracking for task {TaskId}", id);
            return StatusCode(500, ApiResponse<TaskTimeTrackingDto>.ServerErrorResponse());
        }
    }

    /// <summary>
    /// Convert tag names to tag IDs, creating new tags if they don't exist
    /// </summary>
    /// <param name="userId">User ID for tag ownership</param>
    /// <param name="tagNames">List of tag names</param>
    /// <returns>List of tag IDs</returns>
    private async Task<List<int>> ConvertTagNamesToIds(int userId, List<string> tagNames)
    {
        if (tagNames == null || !tagNames.Any())
        {
            return new List<int>();
        }
        
        _logger.LogInformation("Processing {TagCount} tags for user {UserId}: {TagNames}", 
            tagNames.Count, userId, string.Join(", ", tagNames));
            
        try
        {
            // Use TagService to find or create tags by names
            List<int> tagIds = await _tagService.FindOrCreateTagsByNamesAsync(userId, tagNames);
            
            _logger.LogInformation("Successfully processed tags for user {UserId}. Found/Created {TagIdCount} tag IDs: {TagIds}", 
                userId, tagIds.Count, string.Join(", ", tagIds));
                
            return tagIds;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to process tags for user {UserId}: {TagNames}", 
                userId, string.Join(", ", tagNames));
            
            // Return empty list on error to prevent task creation from failing completely
            return new List<int>();
        }
    }
} 