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
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Services.Interfaces
{
    /// <summary>
    /// Service for prioritizing tasks based on various factors
    /// </summary>
    public interface ITaskPriorityService
    {
        /// <summary>
        /// Gets the highest priority task for a user
        /// </summary>
        /// <param name="userId">The user ID</param>
        /// <returns>The highest priority task</returns>
        Task<TaskItem?> GetHighestPriorityTaskAsync(string userId);
        
        /// <summary>
        /// Gets a list of prioritized tasks for a user
        /// </summary>
        /// <param name="userId">The user ID</param>
        /// <param name="count">The number of tasks to return</param>
        /// <returns>A list of prioritized tasks</returns>
        Task<List<TaskItem>> GetPrioritizedTasksAsync(string userId, int count);
    }
} 