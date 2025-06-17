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
using System.ComponentModel.DataAnnotations;

namespace TaskTrackerAPI.DTOs.Tasks
{
    /// <summary>
    /// DTO for updating a task's status
    /// </summary>
    public class TaskStatusUpdateRequestDTO
    {
        [Required]
        public TaskItemStatusDTO Status { get; set; }
    }

    /// <summary>
    /// DTO for task status update response
    /// </summary>
    public class TaskStatusUpdateResponseDTO
    {
        public int TaskId { get; set; }
        public TaskItemStatusDTO PreviousStatus { get; set; }
        public TaskItemStatusDTO NewStatus { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    /// <summary>
    /// DTO for batch completion of tasks
    /// </summary>
    public class BatchCompleteRequestDTO
    {
        [Required]
        public List<int> TaskIds { get; set; } = new List<int>();
    }

    /// <summary>
    /// DTO for batch status update of tasks
    /// </summary>
    public class BatchStatusUpdateRequestDTO
    {
        /// <summary>
        /// List of task IDs to update
        /// </summary>
        [Required]
        public List<int> TaskIds { get; set; } = new List<int>();

        /// <summary>
        /// New status for all tasks
        /// </summary>
        [Required]
        public TaskItemStatusDTO Status { get; set; }
    }

    /// <summary>
    /// Simple task status update DTO
    /// </summary>
    public class TaskStatusUpdateDTO
    {
        /// <summary>
        /// New status to set for the task
        /// </summary>
        [Required]
        public TaskItemStatusDTO Status { get; set; }
    }

    /// <summary>
    /// Bulk status update for multiple tasks
    /// </summary>
    public class BulkStatusUpdateDTO
    {
        /// <summary>
        /// Task IDs to update
        /// </summary>
        [Required]
        [MinLength(1, ErrorMessage = "At least one task ID must be provided")]
        public List<int> TaskIds { get; set; } = new List<int>();

        /// <summary>
        /// New status to apply to all selected tasks
        /// </summary>
        [Required]
        public TaskItemStatusDTO Status { get; set; }
    }
} 