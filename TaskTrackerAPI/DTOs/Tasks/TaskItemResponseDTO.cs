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
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.DTOs.Tasks
{
    
    /// Response DTO for task items
    
    public class TaskItemResponseDTO
    {
        
        /// Unique identifier for the task
        
        public int Id { get; set; }

        
        /// Title of the task
        
        public string Title { get; set; } = string.Empty;

        
        /// Description of the task
        
        public string? Description { get; set; }

        
        /// Current status of the task
        
        public TaskItemStatus Status { get; set; }

        
        /// Priority level of the task
        
        public int Priority { get; set; }

        
        /// Due date for the task
        
        public DateTime? DueDate { get; set; }

        
        /// Date when the task was created
        
        public DateTime CreatedAt { get; set; }

        
        /// Date when the task was last updated
        
        public DateTime? UpdatedAt { get; set; }

        
        /// Date when the task was completed
        
        public DateTime? CompletedAt { get; set; }

        
        /// The associated category ID
        
        public int? CategoryId { get; set; }

        
        /// The associated category name
        
        public string CategoryName { get; set; } = string.Empty;

        
        /// The owner user ID
        
        public int UserId { get; set; }

        
        /// The associated tags
        
        public List<TagDto> Tags { get; set; } = new List<TagDto>();

        
        /// Estimated time to complete in minutes
        
        public int? EstimatedMinutes { get; set; }

        
        /// Actual time spent in minutes
        
        public int? ActualMinutes { get; set; }

        
        /// Whether the task is important/starred
        
        public bool IsStarred { get; set; } = false;

        
        /// Whether the task is recurring
        
        public bool IsRecurring { get; set; } = false;

        
        /// Recurrence pattern (if recurring)
        
        public string? RecurrencePattern { get; set; }

        
        /// Additional properties

        
        /// Task position in a board
        
        public int? BoardPosition { get; set; }

        
        /// Board column name
        
        public string? BoardColumn { get; set; }

        
        /// Board ID
        
        public int? BoardId { get; set; }

        /// <summary>
        /// User ID assigned to this task (for family tasks)
        /// </summary>
        public int? AssignedToUserId { get; set; }

        /// <summary>
        /// Name of the user assigned to this task (for family tasks)
        /// </summary>
        public string? AssignedToUserName { get; set; }
    }
} 