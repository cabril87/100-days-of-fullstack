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
    /// Request DTO for creating a new task item - matches frontend CreateTaskDTO
    /// </summary>
    public class TaskItemCreateRequestDTO
    {
        /// <summary>
        /// Title of the task
        /// </summary>
        [Required]
        [StringLength(100, ErrorMessage = "Title cannot exceed 100 characters")]
        public string Title { get; set; } = string.Empty;

        /// <summary>
        /// Description of the task
        /// </summary>
        [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters")]
        public string? Description { get; set; }

        /// <summary>
        /// Priority level of the task as string to match frontend
        /// </summary>
        public string Priority { get; set; } = "Medium";

        /// <summary>
        /// Due date for the task as ISO string
        /// </summary>
        public string? DueDate { get; set; }

        /// <summary>
        /// The associated category ID
        /// </summary>
        public int? CategoryId { get; set; }

        /// <summary>
        /// Estimated time to complete in minutes
        /// </summary>
        [Range(0, int.MaxValue, ErrorMessage = "Estimated minutes must be positive")]
        public int? EstimatedTimeMinutes { get; set; }

        /// <summary>
        /// Points value for gamification
        /// </summary>
        [Range(0, int.MaxValue, ErrorMessage = "Points value must be positive")]
        public int? PointsValue { get; set; }

        /// <summary>
        /// Family ID for family tasks
        /// </summary>
        public int? FamilyId { get; set; }

        /// <summary>
        /// User ID to assign task to
        /// </summary>
        public int? AssignedToUserId { get; set; }

        /// <summary>
        /// Tags as string array to match frontend
        /// </summary>
        public List<string>? Tags { get; set; }

        /// <summary>
        /// Current status of the task
        /// </summary>
        public TaskItemStatusDTO Status { get; set; } = TaskItemStatusDTO.NotStarted;

        /// <summary>
        /// Whether the task is important/starred
        /// </summary>
        public bool IsStarred { get; set; } = false;

        /// <summary>
        /// Recurrence pattern for recurring tasks
        /// </summary>
        public string? RecurrencePattern { get; set; }
    }
} 