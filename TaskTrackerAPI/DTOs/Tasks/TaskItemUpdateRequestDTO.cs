using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.DTOs.Tasks
{
    
    /// Request DTO for updating an existing task item
    
    public class TaskItemUpdateRequestDTO
    {
        
        /// Title of the task
        
        [StringLength(100, ErrorMessage = "Title cannot exceed 100 characters")]
        public string? Title { get; set; }

        
        /// Description of the task
        
        [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters")]
        public string? Description { get; set; }

        
        /// Current status of the task
        
        public TaskItemStatus? Status { get; set; }

        
        /// Priority level of the task
        
        public int? Priority { get; set; }

        
        /// Due date for the task
        
        public DateTime? DueDate { get; set; }

        
        /// The associated category ID
        
        public int? CategoryId { get; set; }

        
        /// The associated tag IDs
        
        public List<int>? TagIds { get; set; }

        
        /// Estimated time to complete in minutes
        
        [Range(0, int.MaxValue, ErrorMessage = "Estimated minutes must be positive")]
        public int? EstimatedMinutes { get; set; }

        
        /// Actual time spent in minutes
        
        [Range(0, int.MaxValue, ErrorMessage = "Actual minutes must be positive")]
        public int? ActualMinutes { get; set; }

        
        /// Whether the task is important/starred
        
        public bool? IsStarred { get; set; }

        
        /// Whether the task is recurring
        
        public bool? IsRecurring { get; set; }

        
        /// Recurrence pattern (if recurring)
        
        [StringLength(100, ErrorMessage = "Recurrence pattern cannot exceed 100 characters")]
        public string? RecurrencePattern { get; set; }
    }
} 