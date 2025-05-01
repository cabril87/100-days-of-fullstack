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
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using TaskTrackerAPI.DTOs.Tasks;
using TaskTrackerAPI.Hubs;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Services.Interfaces;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;

namespace TaskTrackerAPI.Services
{
    /// <summary>
    /// Service for handling real-time task synchronization via SignalR
    /// </summary>
    public class TaskSyncService : ITaskSyncService
    {
        private readonly IHubContext<TaskHub> _taskHubContext;
        private readonly ILogger<TaskSyncService> _logger;

        public TaskSyncService(
            IHubContext<TaskHub> taskHubContext,
            ILogger<TaskSyncService> logger)
        {
            _taskHubContext = taskHubContext ?? throw new ArgumentNullException(nameof(taskHubContext));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Notify user(s) about a task creation
        /// </summary>
        public async Task NotifyTaskCreatedAsync(int userId, TaskItemDTO task)
        {
            try
            {
                string userGroup = $"user-{userId}";
                await _taskHubContext.Clients.Group(userGroup).SendAsync("TaskCreated", task);
                
                // If task is assigned to a board, notify board members
                if (task.BoardId.HasValue && task.BoardId.Value > 0)
                {
                    string boardRoom = $"board-{task.BoardId.Value}";
                    await _taskHubContext.Clients.Group(boardRoom).SendAsync("TaskCreated", task);
                }
                
                _logger.LogInformation("Notified about task creation: TaskId={TaskId}, UserId={UserId}", 
                    task.Id, userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error notifying task creation: {Message}", ex.Message);
            }
        }

        /// <summary>
        /// Notify user(s) about a task update
        /// </summary>
        public async Task NotifyTaskUpdatedAsync(int userId, TaskItemDTO task, TaskItemDTO previousState)
        {
            try
            {
                string userGroup = $"user-{userId}";
                
                // Create payload with current and previous state for conflict resolution on client
                TaskUpdatePayload updatePayload = new TaskUpdatePayload
                {
                    Current = task,
                    Previous = previousState,
                    UpdatedAt = DateTime.UtcNow
                };
                
                await _taskHubContext.Clients.Group(userGroup).SendAsync("TaskUpdated", updatePayload);
                
                // If task is assigned to a board, notify board members
                if (task.BoardId.HasValue && task.BoardId.Value > 0)
                {
                    string boardRoom = $"board-{task.BoardId.Value}";
                    await _taskHubContext.Clients.Group(boardRoom).SendAsync("TaskUpdated", updatePayload);
                }
                
                _logger.LogInformation("Notified about task update: TaskId={TaskId}, UserId={UserId}", 
                    task.Id, userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error notifying task update: {Message}", ex.Message);
            }
        }

        /// <summary>
        /// Notify user(s) about a task deletion
        /// </summary>
        public async Task NotifyTaskDeletedAsync(int userId, int taskId, int? boardId)
        {
            try
            {
                string userGroup = $"user-{userId}";
                await _taskHubContext.Clients.Group(userGroup).SendAsync("TaskDeleted", taskId);
                
                // If task was assigned to a board, notify board members
                if (boardId.HasValue && boardId.Value > 0)
                {
                    string boardRoom = $"board-{boardId.Value}";
                    await _taskHubContext.Clients.Group(boardRoom).SendAsync("TaskDeleted", taskId);
                }
                
                _logger.LogInformation("Notified about task deletion: TaskId={TaskId}, UserId={UserId}", 
                    taskId, userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error notifying task deletion: {Message}", ex.Message);
            }
        }

        /// <summary>
        /// Notify about multiple tasks being updated in a batch operation
        /// </summary>
        public async Task NotifyTaskBatchUpdateAsync(int userId, List<TaskStatusUpdateResponseDTO> updates)
        {
            try
            {
                if (updates == null || updates.Count == 0)
                {
                    return;
                }
                
                string userGroup = $"user-{userId}";
                await _taskHubContext.Clients.Group(userGroup).SendAsync("TaskBatchUpdated", updates);
                
                _logger.LogInformation("Notified about batch update: Count={Count}, UserId={UserId}", 
                    updates.Count, userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error notifying batch update: {Message}", ex.Message);
            }
        }

        /// <summary>
        /// Notify about a conflict detected during update
        /// </summary>
        public async Task NotifyTaskConflictAsync(int userId, TaskConflictDTO conflict)
        {
            try
            {
                string userGroup = $"user-{userId}";
                await _taskHubContext.Clients.Group(userGroup).SendAsync("TaskConflict", conflict);
                
                _logger.LogInformation("Notified about task conflict: TaskId={TaskId}, UserId={UserId}", 
                    conflict.TaskId, userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error notifying task conflict: {Message}", ex.Message);
            }
        }
    }

    /// <summary>
    /// Payload for task updates containing both current and previous state
    /// </summary>
    public class TaskUpdatePayload
    {
        /// <summary>
        /// Current state of the task
        /// </summary>
        public TaskItemDTO Current { get; set; } = null!;
        
        /// <summary>
        /// Previous state of the task
        /// </summary>
        public TaskItemDTO Previous { get; set; } = null!;
        
        /// <summary>
        /// When the update occurred
        /// </summary>
        public DateTime UpdatedAt { get; set; }
    }
} 