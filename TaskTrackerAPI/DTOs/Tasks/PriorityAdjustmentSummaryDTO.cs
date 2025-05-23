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

namespace TaskTrackerAPI.DTOs.Tasks
{
    /// <summary>
    /// Represents a summary of task priority adjustments made by the auto-adjustment feature
    /// </summary>
    public class PriorityAdjustmentSummaryDTO
    {
        /// <summary>
        /// Total number of tasks that were evaluated for priority adjustment
        /// </summary>
        public int TotalTasksEvaluated { get; set; }
        
        /// <summary>
        /// Number of tasks that had their priority adjusted
        /// </summary>
        public int TasksAdjusted { get; set; }
        
        /// <summary>
        /// Number of tasks that had their priority upgraded (increased)
        /// </summary>
        public int UpgradedTasks { get; set; }
        
        /// <summary>
        /// Number of tasks that had their priority downgraded (decreased)
        /// </summary>
        public int DowngradedTasks { get; set; }
        
        /// <summary>
        /// Timestamp when the adjustment was performed
        /// </summary>
        public DateTime AdjustmentTimestamp { get; set; }
        
        /// <summary>
        /// Detailed list of all adjustments made
        /// </summary>
        public List<TaskPriorityAdjustmentDTO> Adjustments { get; set; } = new List<TaskPriorityAdjustmentDTO>();
    }
} 