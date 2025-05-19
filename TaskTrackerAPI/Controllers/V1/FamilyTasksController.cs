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
                
                // Check if user is member of the family
                if (!await _familyService.HasPermissionAsync(familyId, userId, "view_tasks"))
                {
                    return Unauthorized("You don't have permission to view tasks in this family");
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
                
                // Check if user is member of the family
                if (!await _familyService.HasPermissionAsync(familyId, userId, "view_tasks"))
                {
                    return Unauthorized("You don't have permission to view tasks in this family");
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
        public async Task<ActionResult<FamilyTaskItemDTO>> AssignTaskToFamilyMember(int familyId, [FromBody] TaskAssignmentDTO assignmentDto)
        {
            try
            {
                int userId = User.GetUserIdAsInt();
                
                // Check if user has permission to assign tasks
                if (!await _familyService.HasPermissionAsync(familyId, userId, "assign_tasks"))
                {
                    return Unauthorized("You don't have permission to assign tasks in this family");
                }
                
                // Check if the assigned user is a child (under 13)
                User? assignedUser = await _userRepository.GetByIdAsync(assignmentDto.AssignToUserId);
                if (assignedUser == null)
                {
                    return BadRequest(Utils.ApiResponse<object>.BadRequestResponse("Assigned user not found"));
                }
                
                // Get the family member ID for the assigned user
                IEnumerable<FamilyMemberDTO> familyMembers = await _familyService.GetMembersAsync(familyId, userId);
                FamilyMemberDTO? familyMember = familyMembers.FirstOrDefault(fm => fm.User.Id == assignmentDto.AssignToUserId);
                
                if (familyMember == null)
                {
                    return BadRequest(Utils.ApiResponse<object>.BadRequestResponse("User is not a member of this family"));
                }
                
                FamilyTaskItemDTO? task = await _taskSharingService.AssignTaskToFamilyMemberAsync(
                    assignmentDto.TaskId, 
                    familyMember.Id, 
                    userId, 
                    assignmentDto.RequiresApproval);
                
                if (task == null)
                {
                    return BadRequest(Utils.ApiResponse<object>.BadRequestResponse("Failed to assign task"));
                }
                
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
                return StatusCode(500, Utils.ApiResponse<object>.ServerErrorResponse());
            }
        }

        [HttpDelete("{taskId}/unassign")]
        public async Task<IActionResult> UnassignTask(int familyId, int taskId)
        {
            try
            {
                int userId = User.GetUserIdAsInt();
                
                // Check if user has permission
                if (!await _familyService.HasPermissionAsync(familyId, userId, "assign_tasks"))
                {
                    return Unauthorized("You don't have permission to manage tasks in this family");
                }
                
                bool success = await _taskSharingService.UnassignTaskFromFamilyMemberAsync(taskId, userId);
                
                if (!success)
                {
                    return NotFound(Utils.ApiResponse<object>.NotFoundResponse($"Task with ID {taskId} not found or not assigned"));
                }
                
                return NoContent();
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Unauthorized access attempt for unassigning task {TaskId}", taskId);
                return Unauthorized(Utils.ApiResponse<object>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error unassigning task {TaskId}", taskId);
                return StatusCode(500, Utils.ApiResponse<object>.ServerErrorResponse());
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
    }
} 