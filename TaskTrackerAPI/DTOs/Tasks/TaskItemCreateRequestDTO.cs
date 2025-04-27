using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.DTOs.Tasks
{
    
    /// Request DTO for creating a new task item
    
    public class TaskItemCreateRequestDTO
    {
        
        /// Title of the task
        
        [Required]
        [StringLength(100, ErrorMessage = "Title cannot exceed 100 characters")]
        public string Title { get; set; } = string.Empty;

        
        /// Description of the task
        
        [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters")]
        public string? Description { get; set; }

        
        /// Current status of the task
        
        public TaskItemStatus Status { get; set; } = TaskItemStatus.ToDo;

        
        /// Priority level of the task
        
        public int Priority { get; set; } = 0;

        
        /// Due date for the task
        
        public DateTime? DueDate { get; set; }

        
        /// The associated category ID
        
        public int? CategoryId { get; set; }

        
        /// The associated tag IDs
        
        public List<int> TagIds { get; set; } = new List<int>();

        
        /// Estimated time to complete in minutes
        
        [Range(0, int.MaxValue, ErrorMessage = "Estimated minutes must be positive")]
        public int? EstimatedMinutes { get; set; }

        
        /// Whether the task is important/starred
        
        public bool IsStarred { get; set; } = false;

        
        /// Whether the task is recurring
        
        public bool IsRecurring { get; set; } = false;

        
        /// Recurrence pattern (if recurring)
        
        [StringLength(100, ErrorMessage = "Recurrence pattern cannot exceed 100 characters")]
        public string? RecurrencePattern { get; set; }
    }
} 