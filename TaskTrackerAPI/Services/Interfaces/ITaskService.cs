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
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.DTOs.Tags;
using TaskTrackerAPI.DTOs.Tasks;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Services.Interfaces
{
    public interface ITaskService
    {
        // Basic CRUD operations
        Task<IEnumerable<TaskItemDTO>> GetAllTasksAsync(int userId);
        Task<PagedResult<TaskItemDTO>> GetPagedTasksAsync(int userId, PaginationParams paginationParams);
        Task<TaskItemDTO?> GetTaskByIdAsync(int userId, int taskId);
        Task<TaskItemDTO?> CreateTaskAsync(int userId, TaskItemDTO taskDto);
        Task<TaskItemDTO?> UpdateTaskAsync(int userId, int taskId, TaskItemDTO taskDto);
        Task DeleteTaskAsync(int userId, int taskId);
        
        // Security check
        Task<bool> IsTaskOwnedByUserAsync(int taskId, int userId);
        
        // Filtering methods
        Task<IEnumerable<TaskItemDTO>> GetTasksByStatusAsync(int userId, TaskItemStatus status);
        Task<IEnumerable<TaskItemDTO>> GetTasksByCategoryAsync(int userId, int categoryId);
        Task<IEnumerable<TaskItemDTO>> GetTasksByTagAsync(int userId, int tagId);
        Task<IEnumerable<TaskItemDTO>> GetTasksByDueDateRangeAsync(int userId, DateTime startDate, DateTime endDate);
        Task<IEnumerable<TaskItemDTO>> GetOverdueTasksAsync(int userId);
        Task<IEnumerable<TaskItemDTO>> GetDueTodayTasksAsync(int userId);
        Task<IEnumerable<TaskItemDTO>> GetDueThisWeekTasksAsync(int userId);
        
        // Statistics and dashboard
        Task<TimeRangeTaskStatisticsDTO> GetTaskStatisticsAsync(int userId);
        
        // Batch operations
        Task CompleteTasksAsync(int userId, List<int> taskIds);
        Task UpdateTaskStatusAsync(int userId, int taskId, TaskItemStatus newStatus);
        Task<List<TaskStatusUpdateResponseDTO>> BatchUpdateTaskStatusAsync(int userId, BatchStatusUpdateRequestDTO batchUpdateDto);
        
        // Assignment operations
        Task<TaskAssignmentDTO?> AssignTaskAsync(int userId, CreateTaskAssignmentDTO assignmentDto);
        Task<List<TaskAssignmentDTO>> BatchAssignTasksAsync(int userId, BatchAssignmentRequestDTO batchAssignmentDto);
        
        // Tag operations
        Task AddTagToTaskAsync(int userId, int taskId, int tagId);
        Task RemoveTagFromTaskAsync(int userId, int taskId, int tagId);
        Task UpdateTaskTagsAsync(int userId, int taskId, IEnumerable<int> tagIds);
        Task<IEnumerable<TagDTO>> GetTagsForTaskAsync(int userId, int taskId);
        
        // Checklist operations
        Task<IEnumerable<ChecklistItemDTO>> GetChecklistItemsAsync(int userId, int taskId);
        Task<ChecklistItemDTO?> AddChecklistItemAsync(int userId, ChecklistItemDTO checklistItemDto);
        Task<bool> UpdateChecklistItemAsync(int userId, ChecklistItemDTO checklistItemDto);
        Task<bool> DeleteChecklistItemAsync(int userId, int taskId, int itemId);
    }
}