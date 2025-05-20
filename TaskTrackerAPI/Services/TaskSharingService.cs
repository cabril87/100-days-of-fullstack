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
// TaskSharingService.cs
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.DTOs.Family;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories.Interfaces;
using TaskTrackerAPI.Services.Interfaces;

namespace TaskTrackerAPI.Services
{
    public class TaskSharingService : ITaskSharingService
    {
        private readonly ITaskItemRepository _taskRepository;
        private readonly IFamilyRepository _familyRepository;
        private readonly IFamilyMemberRepository _familyMemberRepository;
        private readonly IUserRepository _userRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<TaskSharingService> _logger;

        public TaskSharingService(
            ITaskItemRepository taskRepository,
            IFamilyRepository familyRepository,
            IFamilyMemberRepository familyMemberRepository,
            IUserRepository userRepository,
            IMapper mapper,
            ILogger<TaskSharingService> logger)
        {
            _taskRepository = taskRepository;
            _familyRepository = familyRepository;
            _familyMemberRepository = familyMemberRepository;
            _userRepository = userRepository;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<FamilyTaskItemDTO?> AssignTaskToFamilyMemberAsync(int taskId, int familyMemberId, int userId, bool requiresApproval)
        {
            try
            {
                // First check if the user has permission to assign tasks
                FamilyMember? familyMember = await _familyMemberRepository.GetByIdAsync(familyMemberId);
                if (familyMember == null)
                {
                    _logger.LogWarning("Family member with ID {FamilyMemberId} not found", familyMemberId);
                    return null;
                }

                int familyId = familyMember.FamilyId;

                // Check if the user is a member of the family and has assign_tasks permission
                bool canAssign = await _familyRepository.HasPermissionAsync(familyId, userId, "assign_tasks");
                if (!canAssign)
                {
                    _logger.LogWarning("User {UserId} doesn't have permission to assign tasks in family {FamilyId}", userId, familyId);
                    throw new UnauthorizedAccessException("You don't have permission to assign tasks in this family");
                }

                // Check if the assigned user is a minor
                User? memberUser = await _userRepository.GetByIdAsync(familyMember.UserId);
                if (memberUser == null)
                {
                    _logger.LogWarning("User associated with family member {FamilyMemberId} not found", familyMemberId);
                    return null;
                }

                // Get assignee name for display
                string assignedToName = !string.IsNullOrEmpty(memberUser.Username) ? memberUser.Username : 
                                        !string.IsNullOrEmpty(familyMember.Name) ? familyMember.Name : 
                                        memberUser.Email ?? "Family Member";

                _logger.LogInformation("Assigning task to {AssignedToName}", assignedToName);

                // Check if the task exists and if the user has permission to assign it - USE SHARED TASK METHOD INSTEAD
                    TaskItem? sharedTask = await _taskRepository.GetSharedTaskByIdAsync(taskId);
                if (sharedTask == null)
                    {
                        _logger.LogWarning("Task {TaskId} not found or not part of family {FamilyId}", taskId, familyId);
                        return null;
                }

                // Perform the assignment
                bool success = await _taskRepository.AssignTaskToFamilyMemberAsync(
                    taskId, familyMemberId, userId, requiresApproval);

                if (!success)
                {
                    _logger.LogWarning("Failed to assign task {TaskId} to family member {FamilyMemberId}", taskId, familyMemberId);
                    return null;
                }

                // Get the updated task
                TaskItem? updatedTask = await _taskRepository.GetSharedTaskByIdAsync(taskId);
                return _mapper.Map<FamilyTaskItemDTO>(updatedTask);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error assigning task {TaskId} to family member {FamilyMemberId}", taskId, familyMemberId);
                throw;
            }
        }

        public async Task<bool> UnassignTaskFromFamilyMemberAsync(int taskId, int userId)
        {
            try
            {
                _logger.LogInformation("Attempting to unassign task {TaskId} by user {UserId}", taskId, userId);
                
                // Get the task
                TaskItem? task = await _taskRepository.GetSharedTaskByIdAsync(taskId);
                if (task == null)
                {
                    _logger.LogWarning("Task {TaskId} not found", taskId);
                    return false;
                }
                
                if (task.AssignedToFamilyMemberId == null)
                {
                    _logger.LogWarning("Task {TaskId} is not assigned to any family member", taskId);
                    return false;
                }

                // Check if user has permission to unassign
                int familyId = task.FamilyId ?? 0;
                if (familyId == 0)
                {
                    _logger.LogWarning("Task {TaskId} is not associated with any family", taskId);
                    return false;
                }

                bool canManage = await _familyRepository.HasPermissionAsync(familyId, userId, "assign_tasks") || 
                                 task.UserId == userId || 
                                 task.AssignedByUserId == userId;

                if (!canManage)
                {
                    _logger.LogWarning("User {UserId} doesn't have permission to unassign task {TaskId}", userId, taskId);
                    throw new UnauthorizedAccessException("You don't have permission to unassign this task");
                }

                _logger.LogInformation("Unassigning task {TaskId} from family member {FamilyMemberId}", taskId, task.AssignedToFamilyMemberId);
                return await _taskRepository.UnassignTaskFromFamilyMemberAsync(taskId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error unassigning task {TaskId}", taskId);
                throw;
            }
        }

        public async Task<IEnumerable<FamilyTaskItemDTO>> GetTasksAssignedToFamilyMemberAsync(int familyMemberId, int userId)
        {
            try
            {
                // Check if the user has permission to view the tasks
                FamilyMember? familyMember = await _familyMemberRepository.GetByIdAsync(familyMemberId);
                if (familyMember == null)
                {
                    _logger.LogWarning("Family member with ID {FamilyMemberId} not found", familyMemberId);
                    return Enumerable.Empty<FamilyTaskItemDTO>();
                }

                // Allow viewing if the user is the assigned member or has view_tasks permission
                bool isSelf = await _familyMemberRepository.IsFamilyMemberOwnedByUserAsync(familyMemberId, userId);
                bool canView = isSelf || await _familyRepository.HasPermissionAsync(familyMember.FamilyId, userId, "view_tasks");

                if (!canView)
                {
                    _logger.LogWarning("User {UserId} doesn't have permission to view tasks for family member {FamilyMemberId}", userId, familyMemberId);
                    throw new UnauthorizedAccessException("You don't have permission to view these tasks");
                }

                IEnumerable<TaskItem> tasks = await _taskRepository.GetTasksAssignedToFamilyMemberAsync(familyMemberId);
                return _mapper.Map<IEnumerable<FamilyTaskItemDTO>>(tasks);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting tasks assigned to family member {FamilyMemberId}", familyMemberId);
                throw;
            }
        }

        public async Task<IEnumerable<FamilyTaskItemDTO>> GetFamilyTasksAsync(int familyId, int userId)
        {
            try
            {
                // Check if the user is a member of the family
                bool isMember = await _familyRepository.IsMemberAsync(familyId, userId);
                if (!isMember)
                {
                    _logger.LogWarning("User {UserId} is not a member of family {FamilyId}", userId, familyId);
                    throw new UnauthorizedAccessException("You are not a member of this family");
                }

                IEnumerable<TaskItem> tasks = await _taskRepository.GetFamilyTasksAsync(familyId);
                return _mapper.Map<IEnumerable<FamilyTaskItemDTO>>(tasks);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting tasks for family {FamilyId}", familyId);
                throw;
            }
        }

        public async Task<bool> ApproveTaskAsync(int taskId, int userId, TaskApprovalDTO approvalDto)
        {
            try
            {
                // Get the task
                TaskItem? task = await _taskRepository.GetSharedTaskByIdAsync(taskId);
                if (task == null || !task.RequiresApproval)
                {
                    _logger.LogWarning("Task {TaskId} not found or doesn't require approval", taskId);
                    return false;
                }

                // Check if the user has permission to approve
                int familyId = task.FamilyId ?? 0;
                if (familyId == 0)
                {
                    _logger.LogWarning("Task {TaskId} is not associated with any family", taskId);
                    return false;
                }

                bool canApprove = await _familyRepository.HasPermissionAsync(familyId, userId, "manage_tasks") || 
                                  task.UserId == userId || 
                                  task.AssignedByUserId == userId;

                if (!canApprove)
                {
                    _logger.LogWarning("User {UserId} doesn't have permission to approve task {TaskId}", userId, taskId);
                    throw new UnauthorizedAccessException("You don't have permission to approve this task");
                }

                return await _taskRepository.ApproveTaskAsync(taskId, userId, approvalDto.ApprovalComment);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error approving task {TaskId}", taskId);
                throw;
            }
        }

        public async Task<FamilyTaskItemDTO?> GetFamilyTaskByIdAsync(int taskId, int userId)
        {
            try
            {
                // Get the task
                TaskItem? task = await _taskRepository.GetSharedTaskByIdAsync(taskId);
                if (task == null)
                {
                    _logger.LogWarning("Family task {TaskId} not found", taskId);
                    return null;
                }

                // Check if the user has permission to view the task
                int familyId = task.FamilyId ?? 0;
                if (familyId == 0)
                {
                    _logger.LogWarning("Task {TaskId} is not associated with any family", taskId);
                    return null;
                }

                bool isMember = await _familyRepository.IsMemberAsync(familyId, userId);
                if (!isMember)
                {
                    _logger.LogWarning("User {UserId} is not a member of family {FamilyId}", userId, familyId);
                    throw new UnauthorizedAccessException("You are not a member of this family");
                }

                return _mapper.Map<FamilyTaskItemDTO>(task);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting family task {TaskId}", taskId);
                throw;
            }
        }

        public async Task<int> UnassignAllTasksFromFamilyMemberAsync(int familyMemberId, int userId)
        {
            try
            {
                // Get the family member to check permissions
                FamilyMember? familyMember = await _familyMemberRepository.GetByIdAsync(familyMemberId);
                if (familyMember == null)
                {
                    _logger.LogWarning("Family member with ID {FamilyMemberId} not found", familyMemberId);
                    return 0;
                }

                int familyId = familyMember.FamilyId;

                // Check if the user has admin permissions for this family
                bool hasPermission = await _familyRepository.HasPermissionAsync(familyId, userId, "manage_family");
                if (!hasPermission)
                {
                    _logger.LogWarning("User {UserId} doesn't have admin permission for family {FamilyId}", userId, familyId);
                    throw new UnauthorizedAccessException("You need admin permissions to perform this action");
                }

                // Get all tasks assigned to this family member
                IEnumerable<TaskItem> tasks = await _taskRepository.GetTasksAssignedToFamilyMemberAsync(familyMemberId);
                if (!tasks.Any())
                {
                    _logger.LogInformation("No tasks found assigned to family member {FamilyMemberId}", familyMemberId);
                    return 0;
                }

                int unassignedCount = 0;
                foreach (var task in tasks)
                {
                    bool success = await _taskRepository.UnassignTaskFromFamilyMemberAsync(task.Id);
                    if (success)
                    {
                        unassignedCount++;
                        _logger.LogInformation("Successfully unassigned task {TaskId} from family member {FamilyMemberId}", task.Id, familyMemberId);
                    }
                    else
                    {
                        _logger.LogWarning("Failed to unassign task {TaskId} from family member {FamilyMemberId}", task.Id, familyMemberId);
                    }
                }

                _logger.LogInformation("Unassigned {Count} tasks from family member {FamilyMemberId}", unassignedCount, familyMemberId);
                return unassignedCount;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error unassigning all tasks from family member {FamilyMemberId}", familyMemberId);
                throw;
            }
        }

        public async Task<bool> DeleteFamilyTaskAsync(int taskId, int userId)
        {
            try
            {
                // Get the task
                TaskItem? task = await _taskRepository.GetSharedTaskByIdAsync(taskId);
                if (task == null)
                {
                    _logger.LogWarning("Task {TaskId} not found", taskId);
                    return false;
                }

                // Check if the user has permission to delete the task
                int familyId = task.FamilyId ?? 0;
                if (familyId == 0)
                {
                    _logger.LogWarning("Task {TaskId} is not associated with any family", taskId);
                    return false;
                }

                bool canDelete = await _familyRepository.HasPermissionAsync(familyId, userId, "manage_tasks") || 
                                 task.AssignedByUserId == userId;

                if (!canDelete)
                {
                    _logger.LogWarning("User {UserId} doesn't have permission to delete task {TaskId}", userId, taskId);
                    throw new UnauthorizedAccessException("You don't have permission to delete this task");
                }

                // Delete the task
                await _taskRepository.DeleteTaskAsync(task.Id, task.UserId);
                _logger.LogInformation("Task {TaskId} deleted successfully by user {UserId}", taskId, userId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting task {TaskId}", taskId);
                throw;
            }
        }
    }
}