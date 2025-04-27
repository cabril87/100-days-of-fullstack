using System;
using System.ComponentModel.DataAnnotations;

namespace TaskTrackerAPI.DTOs.Tasks
{
    
    /// Data transfer object for task assignments
    
    public class TaskAssignmentDTO
    {
        
        /// Unique identifier for the assignment
        
        public int Id { get; set; }

        
        /// Task ID being assigned
        
        [Required]
        public int TaskId { get; set; }

        
        /// User ID the task is assigned to
        
        [Required]
        public int AssignedToUserId { get; set; }

        
        /// User ID of who assigned the task
        
        [Required]
        public int AssignedByUserId { get; set; }

        
        /// Date when the task was assigned
        
        public DateTime AssignedAt { get; set; } = DateTime.UtcNow;

        
        /// Notes about the assignment
        
        [StringLength(200, ErrorMessage = "Notes cannot exceed 200 characters")]
        public string? Notes { get; set; }

        
        /// Whether the assignment has been accepted
        
        public bool IsAccepted { get; set; } = false;

        
        /// Date when the assignment was accepted
        
        public DateTime? AcceptedAt { get; set; }
    }

    
    /// DTO for creating a task assignment
    
    public class CreateTaskAssignmentDTO
    {
        
        /// Task ID to assign
        
        [Required]
        public int TaskId { get; set; }

        
        /// User ID to assign the task to
        
        [Required]
        public int AssignedToUserId { get; set; }

        
        /// Optional notes about the assignment
        
        [StringLength(200)]
        public string? Notes { get; set; }
    }
} 