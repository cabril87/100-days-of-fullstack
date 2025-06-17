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

using System.ComponentModel.DataAnnotations;

namespace TaskTrackerAPI.DTOs.Tasks
{
    /// <summary>
    /// Represents a single task priority adjustment made by the auto-adjustment system
    /// </summary>
    public class TaskPriorityAdjustmentDTO
    {
        /// <summary>
        /// ID of the task that was adjusted
        /// </summary>
        public int TaskId { get; set; }
        
        /// <summary>
        /// Title of the task
        /// </summary>
        public string TaskTitle { get; set; } = string.Empty;
        
        /// <summary>
        /// The original priority before adjustment
        /// </summary>
        public TaskPriorityDTO PreviousPriority { get; set; }
        
        /// <summary>
        /// The new priority after adjustment
        /// </summary>
        public TaskPriorityDTO NewPriority { get; set; }
        
        /// <summary>
        /// Human-readable reason for the priority adjustment
        /// </summary>
        public string AdjustmentReason { get; set; } = string.Empty;

        /// <summary>
        /// Current priority of the task
        /// </summary>
        [Required]
        public TaskPriorityDTO CurrentPriority { get; set; }

        /// <summary>
        /// Target priority to change to
        /// </summary>
        [Required]
        public TaskPriorityDTO TargetPriority { get; set; }
    }
} 