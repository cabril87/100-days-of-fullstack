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
namespace TaskTrackerAPI.Models
{
    /// <summary>
    /// Represents the priority level of a task
    /// </summary>
    public enum TaskPriority
    {
        /// <summary>
        /// Low priority tasks (not urgent)
        /// </summary>
        Low = 0,
        
        /// <summary>
        /// Medium priority tasks (somewhat important)
        /// </summary>
        Medium = 1,
        
        /// <summary>
        /// High priority tasks (important and somewhat urgent)
        /// </summary>
        High = 2,
        
        /// <summary>
        /// Critical priority tasks (important and very urgent)
        /// </summary>
        Critical = 3
    }
} 