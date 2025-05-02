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
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Repositories.Interfaces;

public interface ITaskItemRepository
{
    // Basic CRUD
    Task<IEnumerable<TaskItem>> GetAllTasksAsync(int userId);
    Task<PagedResult<TaskItem>> GetPagedTasksAsync(int userId, PaginationParams paginationParams);
    Task<TaskItem?> GetTaskByIdAsync(int id, int userId);
    Task<TaskItem> CreateTaskAsync(TaskItem task);
    Task UpdateTaskAsync(TaskItem task);
    Task DeleteTaskAsync(int id, int userId);

    // Filtering operations
    Task<IEnumerable<TaskItem>> GetTasksByStatusAsync(int userId, TaskItemStatus status);
    Task<IEnumerable<TaskItem>> GetTasksByCategoryAsync(int userId, int categoryId);
    Task<IEnumerable<TaskItem>> GetTasksByTagAsync(int userId, int tagId);

    // Additional operations
    Task<bool> IsTaskOwnedByUserAsync(int taskId, int userId);

    // Tag management
    Task AddTagToTaskAsync(int taskId, int tagId);
    Task RemoveTagFromTaskAsync(int taskId, int tagId);
    Task UpdateTaskTagsAsync(int taskId, IEnumerable<int> tagIds);
    Task<IEnumerable<Tag>> GetTagsForTaskAsync(int taskId);
    Task<TaskItem?> GetSharedTaskByIdAsync(int taskId);
    Task<IEnumerable<TaskItem>> GetTasksAssignedToFamilyMemberAsync(int familyMemberId);
    Task<IEnumerable<TaskItem>> GetFamilyTasksAsync(int familyId);
    Task<bool> AssignTaskToFamilyMemberAsync(int taskId, int familyMemberId, int assignedByUserId, bool requiresApproval);
    Task<bool> UnassignTaskFromFamilyMemberAsync(int taskId);
    Task<bool> ApproveTaskAsync(int taskId, int approverUserId, string? comment);
    Task<bool> IsUserFamilyTaskOwnerAsync(int taskId, int userId);
    
    // Deadline notifications
    Task<IEnumerable<TaskItem>> GetTasksWithUpcomingDeadlinesAsync(DateTime start, DateTime end);
}