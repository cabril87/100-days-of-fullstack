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

                // Check if the task exists and if the user has permission to assign it
                TaskItem? task = await _taskRepository.GetTaskByIdAsync(taskId, userId);
                if (task == null)
                {
                    // Try to get a shared task
                    TaskItem? sharedTask = await _taskRepository.GetSharedTaskByIdAsync(taskId);
                    if (sharedTask == null || sharedTask?.FamilyId != familyId)
                    {
                        _logger.LogWarning("Task {TaskId} not found or not part of family {FamilyId}", taskId, familyId);
                        return null;
                    }
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
                // Get the task
                TaskItem? task = await _taskRepository.GetSharedTaskByIdAsync(taskId);
                if (task == null || task.AssignedToFamilyMemberId == null)
                {
                    _logger.LogWarning("Task {TaskId} not found or not assigned to any family member", taskId);
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
    }
}