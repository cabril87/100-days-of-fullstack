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
using System.Collections.Generic;
using System.Threading.Tasks;
using TaskTrackerAPI.DTOs.Tasks;

namespace TaskTrackerAPI.Services.Interfaces
{
    /// <summary>
    /// Interface for task synchronization service
    /// </summary>
    public interface ITaskSyncService
    {
        /// <summary>
        /// Notify user(s) about a task creation
        /// </summary>
        /// <param name="userId">The user who created the task</param>
        /// <param name="task">The created task</param>
        Task NotifyTaskCreatedAsync(int userId, TaskItemDTO task);
        
        /// <summary>
        /// Notify user(s) about a task update
        /// </summary>
        /// <param name="userId">The user who updated the task</param>
        /// <param name="task">The updated task</param>
        /// <param name="previousState">The previous state of the task</param>
        Task NotifyTaskUpdatedAsync(int userId, TaskItemDTO task, TaskItemDTO previousState);
        
        /// <summary>
        /// Notify user(s) about a task deletion
        /// </summary>
        /// <param name="userId">The user who deleted the task</param>
        /// <param name="taskId">The ID of the deleted task</param>
        /// <param name="boardId">The board ID if the task was on a board</param>
        Task NotifyTaskDeletedAsync(int userId, int taskId, int? boardId);
        
        /// <summary>
        /// Notify about multiple tasks being updated in a batch operation
        /// </summary>
        /// <param name="userId">The user who performed the batch update</param>
        /// <param name="updates">List of task updates</param>
        Task NotifyTaskBatchUpdateAsync(int userId, List<TaskStatusUpdateResponseDTO> updates);
        
        /// <summary>
        /// Notify about a conflict detected during update
        /// </summary>
        /// <param name="userId">The user who encountered the conflict</param>
        /// <param name="conflict">Details about the conflict</param>
        Task NotifyTaskConflictAsync(int userId, TaskConflictDTO conflict);
    }
} 