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
using System.Linq;
using System.Threading.Tasks;
using TaskTrackerAPI.DTOs.Family;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories.Interfaces;
using TaskTrackerAPI.Services.Interfaces;
using TaskTrackerAPI.Utils;
using TaskTrackerAPI.Extensions;

namespace TaskTrackerAPI.Controllers.V1
{
    [ApiVersion("1.0")]
    [Authorize]
    [Route("api/v{version:apiVersion}/family/{familyId}/tasks")]
    [ApiController]
    public class FamilyTasksController : ControllerBase
    {
        private readonly ITaskSharingService _taskSharingService;
        private readonly IFamilyService _familyService;
        private readonly IUserRepository _userRepository;
        private readonly ILogger<FamilyTasksController> _logger;

        public FamilyTasksController(
            ITaskSharingService taskSharingService,
            IFamilyService familyService,
            IUserRepository userRepository,
            ILogger<FamilyTasksController> logger)
        {
            _taskSharingService = taskSharingService;
            _familyService = familyService;
            _userRepository = userRepository;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<FamilyTaskItemDTO>>> GetFamilyTasks(int familyId)
        {
            try
            {
                int userId = User.GetUserIdAsInt();
                
                // Check if user is a member of the family (without requiring specific permission)
                bool isFamilyMember = await _familyService.IsFamilyMemberAsync(familyId, userId);
                if (!isFamilyMember)
                {
                    return Unauthorized("You must be a member of this family to view tasks");
                }
                
                IEnumerable<FamilyTaskItemDTO> tasks = await _taskSharingService.GetFamilyTasksAsync(familyId, userId);
                return Ok(Utils.ApiResponse<IEnumerable<FamilyTaskItemDTO>>.SuccessResponse(tasks));
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Unauthorized access attempt for family tasks");
                return Unauthorized(Utils.ApiResponse<object>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving family tasks");
                return StatusCode(500, Utils.ApiResponse<object>.ServerErrorResponse());
            }
        }

        [HttpGet("{taskId}")]
        public async Task<ActionResult<FamilyTaskItemDTO>> GetFamilyTask(int familyId, int taskId)
        {
            try
            {
                int userId = User.GetUserIdAsInt();
                
                // Check if user is a member of the family (without requiring specific permission)
                bool isFamilyMember = await _familyService.IsFamilyMemberAsync(familyId, userId);
                if (!isFamilyMember)
                {
                    return Unauthorized("You must be a member of this family to view tasks");
                }
                
                FamilyTaskItemDTO? task = await _taskSharingService.GetFamilyTaskByIdAsync(taskId, userId);
                
                if (task == null)
                {
                    return NotFound(Utils.ApiResponse<object>.NotFoundResponse($"Task with ID {taskId} not found"));
                }
                
                return Ok(Utils.ApiResponse<FamilyTaskItemDTO>.SuccessResponse(task));
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Unauthorized access attempt for family task {TaskId}", taskId);
                return Unauthorized(Utils.ApiResponse<object>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving family task {TaskId}", taskId);
                return StatusCode(500, Utils.ApiResponse<object>.ServerErrorResponse());
            }
        }

        [HttpPost("assign")]
        public async Task<ActionResult<FamilyTaskItemDTO>> AssignTaskToFamilyMember(int familyId, [FromBody] FlexibleTaskAssignmentDTO assignmentDto)
        {
            try
            {
                int userId = User.GetUserIdAsInt();
                
                // Log with simplified format to avoid dynamic dispatch issues
                _logger.LogInformation(
                    "Task assignment request for family {0}, task {1}, user {2}",
                    familyId, assignmentDto.TaskId, userId);
                
                // Check if user has permission to assign tasks
                if (!await _familyService.HasPermissionAsync(familyId, userId, "assign_tasks"))
                {
                    _logger.LogWarning("User {UserId} does not have permission to assign tasks in family {FamilyId}", userId, familyId);
                    return Unauthorized(Utils.ApiResponse<object>.ErrorResponse("You don't have permission to assign tasks in this family"));
                }
                
                // Handle possible string user ID by converting to int
                int assignToUserIdInt;
                if (assignmentDto.AssignToUserId is string)
                {
                    string userIdStr = assignmentDto.AssignToUserId.ToString();
                    if (!int.TryParse(userIdStr, out assignToUserIdInt))
                    {
                        // Simplified logging to avoid dynamic dispatch issues
                        _logger.LogError("Invalid assignToUserId format");
                        return BadRequest(Utils.ApiResponse<object>.BadRequestResponse("Invalid user ID format"));
                    }
                }
                else
                {
                    // Safely convert JsonElement or numeric types to int
                    assignToUserIdInt = SafeConvertToInt(assignmentDto.AssignToUserId);
                }
                
                // Check if the assigned user is a child (under 13)
                User? assignedUser = await _userRepository.GetByIdAsync(assignToUserIdInt);
                if (assignedUser == null)
                {
                    _logger.LogWarning("Assigned user with ID {UserId} not found", assignToUserIdInt);
                    return BadRequest(Utils.ApiResponse<object>.BadRequestResponse("Assigned user not found"));
                }
                
                // Get the family member ID for the assigned user
                IEnumerable<FamilyMemberDTO> familyMembers = await _familyService.GetMembersAsync(familyId, userId);
                _logger.LogInformation("Found {Count} family members for family {FamilyId}", familyMembers.Count(), familyId);
                
                FamilyMemberDTO? familyMember = familyMembers.FirstOrDefault(fm => 
                    fm.User?.Id == assignToUserIdInt || 
                    fm.Id == assignToUserIdInt || 
                    fm.User?.Id.ToString() == assignToUserIdInt.ToString());
                
                if (familyMember == null)
                {
                    _logger.LogWarning("User {UserId} is not a member of family {FamilyId}", assignToUserIdInt, familyId);
                    return BadRequest(Utils.ApiResponse<object>.BadRequestResponse("User is not a member of this family"));
                }
                
                // Create modified DTO with corrected user ID
                FlexibleTaskAssignmentDTO correctedDto = new FlexibleTaskAssignmentDTO
                {
                    TaskId = SafeConvertToInt(assignmentDto.TaskId),
                    AssignToUserId = familyMember.User?.Id ?? assignToUserIdInt,
                    RequiresApproval = assignmentDto.RequiresApproval,
                    // Ensure these fields are explicitly set to pass validation
                    UserId = familyMember.User?.Id ?? assignToUserIdInt,
                    MemberId = familyMember.Id
                };
                
                FamilyTaskItemDTO? task = await _taskSharingService.AssignTaskToFamilyMemberAsync(
                    SafeConvertToInt(correctedDto.TaskId), 
                    SafeConvertToInt(familyMember.Id), 
                    userId, 
                    correctedDto.RequiresApproval);
                
                if (task == null)
                {
                    // Simplified logging to avoid dynamic dispatch issues
                    _logger.LogError("Failed to assign task {0} to family member {1}", 
                        SafeConvertToInt(assignmentDto.TaskId), 
                        SafeConvertToInt(familyMember.Id));
                    return BadRequest(Utils.ApiResponse<object>.BadRequestResponse("Failed to assign task"));
                }
                
                // Simplified logging to avoid dynamic dispatch issues
                _logger.LogInformation("Successfully assigned task {0} to family member {1}", 
                    SafeConvertToInt(assignmentDto.TaskId), 
                    SafeConvertToInt(familyMember.Id));
                return Ok(Utils.ApiResponse<FamilyTaskItemDTO>.SuccessResponse(task));
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Unauthorized access attempt for assigning task");
                return Unauthorized(Utils.ApiResponse<object>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error assigning task to family member");
                return StatusCode(500, Utils.ApiResponse<object>.ServerErrorResponse($"An error occurred: {ex.Message}"));
            }
        }

        [HttpDelete("{taskId}/unassign")]
        public async Task<ActionResult<Utils.ApiResponse<bool>>> UnassignTask(int familyId, int taskId)
        {
            try
            {
                int userId = User.GetUserIdAsInt();
                
                _logger.LogInformation("User {UserId} is attempting to unassign task {TaskId} from family {FamilyId}", userId, taskId, familyId);
                
                // Check if user is a member of the family
                bool isFamilyMember = await _familyService.IsFamilyMemberAsync(familyId, userId);
                if (!isFamilyMember)
                {
                    _logger.LogWarning("User {UserId} is not a member of family {FamilyId}", userId, familyId);
                    return Unauthorized(Utils.ApiResponse<bool>.UnauthorizedResponse("You must be a member of this family"));
                }
                
                // Check if task exists first
                FamilyTaskItemDTO? task = await _taskSharingService.GetFamilyTaskByIdAsync(taskId, userId);
                if (task == null)
                {
                    _logger.LogWarning("Task {TaskId} not found for family {FamilyId}", taskId, familyId);
                    return NotFound(Utils.ApiResponse<bool>.NotFoundResponse($"Task with ID {taskId} not found"));
                }
                
                // Check if task is assigned
                if (task.AssignedToFamilyMemberId == null)
                {
                    _logger.LogWarning("Task {TaskId} is not assigned to anyone", taskId);
                    return NotFound(Utils.ApiResponse<bool>.NotFoundResponse($"Task with ID {taskId} is not assigned to any family member"));
                }
                
                // Attempt to unassign
                bool result = await _taskSharingService.UnassignTaskFromFamilyMemberAsync(taskId, userId);
                
                if (!result)
                {
                    _logger.LogWarning("Failed to unassign task {TaskId}", taskId);
                    return BadRequest(Utils.ApiResponse<bool>.BadRequestResponse("Failed to unassign task"));
                }
                
                _logger.LogInformation("Successfully unassigned task {TaskId}", taskId);
                return Ok(Utils.ApiResponse<bool>.SuccessResponse(true));
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Unauthorized attempt to unassign task {TaskId}", taskId);
                return Unauthorized(Utils.ApiResponse<bool>.UnauthorizedResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error unassigning task {TaskId}", taskId);
                return StatusCode(500, Utils.ApiResponse<bool>.ServerErrorResponse());
            }
        }

        [HttpPost("{taskId}/approve")]
        public async Task<IActionResult> ApproveTask(int familyId, int taskId, [FromBody] TaskApprovalDTO approvalDto)
        {
            try
            {
                int userId = User.GetUserIdAsInt();
                
                // Check if the task ID matches
                if (taskId != approvalDto.TaskId)
                {
                    return BadRequest(Utils.ApiResponse<object>.BadRequestResponse("Task ID mismatch"));
                }
                
                // Permissions are checked in the service
                bool success = await _taskSharingService.ApproveTaskAsync(taskId, userId, approvalDto);
                
                if (!success)
                {
                    return NotFound(Utils.ApiResponse<object>.NotFoundResponse($"Task with ID {taskId} not found or doesn't require approval"));
                }
                
                return NoContent();
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Unauthorized access attempt for approving task {TaskId}", taskId);
                return Unauthorized(Utils.ApiResponse<object>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error approving task {TaskId}", taskId);
                return StatusCode(500, Utils.ApiResponse<object>.ServerErrorResponse());
            }
        }

        [HttpGet("member/{familyMemberId}")]
        public async Task<ActionResult<IEnumerable<FamilyTaskItemDTO>>> GetTasksForFamilyMember(int familyId, int familyMemberId)
        {
            try
            {
                int userId = User.GetUserIdAsInt();
                
                // Permissions are checked in the service
                IEnumerable<FamilyTaskItemDTO> tasks = await _taskSharingService.GetTasksAssignedToFamilyMemberAsync(familyMemberId, userId);
                
                return Ok(Utils.ApiResponse<IEnumerable<FamilyTaskItemDTO>>.SuccessResponse(tasks));
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Unauthorized access attempt for viewing tasks of family member {FamilyMemberId}", familyMemberId);
                return Unauthorized(Utils.ApiResponse<object>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving tasks for family member {FamilyMemberId}", familyMemberId);
                return StatusCode(500, Utils.ApiResponse<object>.ServerErrorResponse());
            }
        }

        [HttpGet("{taskId}/details")]
        public async Task<ActionResult<FamilyTaskItemDTO>> GetTaskDetails(int familyId, int taskId)
        {
            try
            {
                int userId = User.GetUserIdAsInt();
                
                // Check if user is a member of the family
                bool isFamilyMember = await _familyService.IsFamilyMemberAsync(familyId, userId);
                if (!isFamilyMember)
                {
                    return Unauthorized("You must be a member of this family to view tasks");
                }
                
                FamilyTaskItemDTO? task = await _taskSharingService.GetFamilyTaskByIdAsync(taskId, userId);
                
                if (task == null)
                {
                    return NotFound(Utils.ApiResponse<object>.NotFoundResponse($"Task with ID {taskId} not found"));
                }
                
                return Ok(Utils.ApiResponse<FamilyTaskItemDTO>.SuccessResponse(task));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving task details for {TaskId}", taskId);
                return StatusCode(500, Utils.ApiResponse<object>.ServerErrorResponse());
            }
        }

        [HttpDelete("member/{familyMemberId}/unassign-all")]
        public async Task<ActionResult<Utils.ApiResponse<int>>> UnassignAllTasksFromMember(int familyId, int familyMemberId)
        {
            try
            {
                int userId = User.GetUserIdAsInt();
                
                _logger.LogInformation("User {UserId} is attempting to unassign all tasks from member {MemberId} in family {FamilyId}", 
                    userId, familyMemberId, familyId);
                
                // Check if user has admin permission for the family
                bool hasPermission = await _familyService.HasPermissionAsync(familyId, userId, "manage_family");
                if (!hasPermission)
                {
                    _logger.LogWarning("User {UserId} doesn't have manage_family permission for family {FamilyId}", userId, familyId);
                    return Unauthorized(Utils.ApiResponse<int>.UnauthorizedResponse("You need admin permissions to perform this action"));
                }
                
                // Call service to handle bulk unassignment
                int tasksUnassigned = await _taskSharingService.UnassignAllTasksFromFamilyMemberAsync(familyMemberId, userId);
                
                _logger.LogInformation("Successfully unassigned {Count} tasks from family member {MemberId}", tasksUnassigned, familyMemberId);
                return Ok(Utils.ApiResponse<int>.SuccessResponse(tasksUnassigned, $"Successfully unassigned {tasksUnassigned} tasks"));
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Unauthorized attempt to unassign all tasks from member {MemberId}", familyMemberId);
                return Unauthorized(Utils.ApiResponse<int>.UnauthorizedResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error unassigning all tasks from family member {MemberId}", familyMemberId);
                return StatusCode(500, Utils.ApiResponse<int>.ServerErrorResponse());
            }
        }

        [HttpDelete("{taskId}")]
        public async Task<ActionResult<Utils.ApiResponse<bool>>> DeleteFamilyTask(int familyId, int taskId)
        {
            try
            {
                int userId = User.GetUserIdAsInt();
                
                _logger.LogInformation("User {UserId} is attempting to delete task {TaskId} from family {FamilyId}", 
                    userId, taskId, familyId);
                
                // Check if user has appropriate permission for the family
                bool hasPermission = await _familyService.HasPermissionAsync(familyId, userId, "manage_tasks");
                if (!hasPermission)
                {
                    // Allow task creator to delete their own task - check if assigned by this user
                    FamilyTaskItemDTO? task = await _taskSharingService.GetFamilyTaskByIdAsync(taskId, userId);
                    bool isTaskAssignedByUser = task?.AssignedByUserId == userId;
                    
                    if (!isTaskAssignedByUser)
                    {
                        _logger.LogWarning("User {UserId} doesn't have permission to delete task {TaskId}", userId, taskId);
                        return Unauthorized(Utils.ApiResponse<bool>.UnauthorizedResponse(
                            "You need management permissions or to be the task creator to delete this task"));
                    }
                }
                
                // Check if task exists and belongs to this family
                FamilyTaskItemDTO? taskToDelete = await _taskSharingService.GetFamilyTaskByIdAsync(taskId, userId);
                if (taskToDelete == null)
                {
                    _logger.LogWarning("Task {TaskId} not found for family {FamilyId}", taskId, familyId);
                    return NotFound(Utils.ApiResponse<bool>.NotFoundResponse($"Task with ID {taskId} not found"));
                }
                
                if (taskToDelete.FamilyId != familyId)
                {
                    _logger.LogWarning("Task {TaskId} does not belong to family {FamilyId}", taskId, familyId);
                    return BadRequest(Utils.ApiResponse<bool>.BadRequestResponse("Task does not belong to this family"));
                }
                
                // Delete the task completely
                bool result = await _taskSharingService.DeleteFamilyTaskAsync(taskId, userId);
                
                if (!result)
                {
                    _logger.LogWarning("Failed to delete task {TaskId}", taskId);
                    return BadRequest(Utils.ApiResponse<bool>.BadRequestResponse("Failed to delete task"));
                }
                
                _logger.LogInformation("Successfully deleted task {TaskId}", taskId);
                return Ok(Utils.ApiResponse<bool>.SuccessResponse(true, "Task deleted successfully"));
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Unauthorized attempt to delete task {TaskId}", taskId);
                return Unauthorized(Utils.ApiResponse<bool>.UnauthorizedResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting task {TaskId}", taskId);
                return StatusCode(500, Utils.ApiResponse<bool>.ServerErrorResponse());
            }
        }

        private int SafeConvertToInt(dynamic value)
        {
            try
            {
                // First check if value is null using ReferenceEquals to avoid dynamic binding issues
                if (ReferenceEquals(value, null))
                    return 0;
                    
                // Handle string type
                if (value is string strValue)
                    return int.TryParse(strValue, out int result) ? result : 0;
                    
                // Handle integer types
                if (value is int intValue)
                    return intValue;
                    
                // Handle System.Text.Json.JsonElement
                string? valueType = value?.GetType()?.FullName;
                if (valueType != null && 
                   valueType.Equals("System.Text.Json.JsonElement", StringComparison.Ordinal))
                {
                    var element = (System.Text.Json.JsonElement)value;
                    
                    if (element.ValueKind == System.Text.Json.JsonValueKind.Number)
                        return element.GetInt32();
                        
                    if (element.ValueKind == System.Text.Json.JsonValueKind.String)
                        return int.TryParse(element.GetString(), out int result) ? result : 0;
                        
                    if (element.ValueKind == System.Text.Json.JsonValueKind.Null)
                        return 0;
                }
                
                // Last resort - try standard conversion
                return Convert.ToInt32(value);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error converting value to integer");
                return 0;
            }
        }
    }
} 