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
    
    /// Data transfer object for task items
    
    public class TaskItemDTO
    {
        
        /// Unique identifier for the task
        
        public int Id { get; set; }

        
        /// Title of the task
        
        [Required]
        [StringLength(100, ErrorMessage = "Title cannot exceed 100 characters")]
        public string Title { get; set; } = string.Empty;

        
        /// Description of the task
        
        [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters")]
        public string? Description { get; set; }

        
        /// Current status of the task
        
        public TaskItemStatusDTO Status { get; set; } = TaskItemStatusDTO.NotStarted;

        
        /// Priority level of the task
        
        public int Priority { get; set; } = 0;

        
        /// Due date for the task
        
        public DateTime? DueDate { get; set; }

        
        /// Date when the task was created
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        
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

        /// The board ID where this task is placed
        
        public int? BoardId { get; set; }

        
        /// The associated tags
        
        public List<int>? TagIds { get; set; }
        
        /// Collection of tags for the task (used for response mapping)
        
        public List<TagDto>? Tags { get; set; }

        
        /// Estimated time to complete in minutes
        
        public int? EstimatedMinutes { get; set; }

        /// <summary>
        /// Estimated time to complete in minutes (alternative name for compatibility)
        /// </summary>
        public int? EstimatedTimeMinutes 
        { 
            get => EstimatedMinutes; 
            set => EstimatedMinutes = value; 
        }

        
        /// Actual time spent in minutes
        
        public int? ActualMinutes { get; set; }

        /// <summary>
        /// Actual time spent in minutes from focus sessions (alternative name for compatibility)
        /// </summary>
        public int? ActualTimeSpentMinutes 
        { 
            get => ActualMinutes; 
            set => ActualMinutes = value; 
        }

        /// <summary>
        /// Progress percentage of task completion (0-100)
        /// </summary>
        [Range(0, 100)]
        public int? ProgressPercentage { get; set; } = 0;

        
        /// Whether the task is important/starred
        
        public bool IsStarred { get; set; } = false;

        
        /// Whether the task is recurring
        
        public bool IsRecurring { get; set; } = false;

        
        /// Recurrence pattern (if recurring)
        
        public string? RecurrencePattern { get; set; }

        /// <summary>
        /// Recurrence pattern (alternative name for compatibility)
        /// </summary>
        public string? RecurringPattern 
        { 
            get => RecurrencePattern; 
            set => RecurrencePattern = value; 
        }
        
        /// Version number for optimistic concurrency
        
        public long Version { get; set; } = 1;

        /// Name of the user or family member assigned to this task

        public string? AssignedToName { get; set; }

        /// <summary>
        /// Points value for gamification system
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
        /// Name of the user assigned to this task (for family tasks)
        /// </summary>
        public string? AssignedToUserName { get; set; }
    }

    
    /// Task tag simple DTO
    
    public class TagDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Color { get; set; } = string.Empty;
    }
} 