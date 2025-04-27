using System;
using System.ComponentModel.DataAnnotations;

namespace TaskTrackerAPI.DTOs.Tasks
{
    
    /// Data transfer object for reminders
    
    public class ReminderDTO
    {
        
        /// Unique identifier for the reminder
        
        public int Id { get; set; }

        
        /// Title of the reminder
        
        [Required]
        [StringLength(100, ErrorMessage = "Title cannot exceed 100 characters")]
        public string Title { get; set; } = string.Empty;

        
        /// Description of the reminder
        
        [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters")]
        public string? Description { get; set; }

        
        /// User ID associated with this reminder
        
        public int UserId { get; set; }

        
        /// Task ID this reminder is associated with (if any)
        
        public int? TaskId { get; set; }

        
        /// Scheduled date and time for the reminder
        
        [Required]
        public DateTime ReminderTime { get; set; }

        
        /// Status of the reminder
        
        public ReminderStatus Status { get; set; } = ReminderStatus.Pending;

        
        /// Priority level (0-3)
        
        [Range(0, 3)]
        public int Priority { get; set; } = 0;

        
        /// Whether this is a recurring reminder
        
        public bool IsRecurring { get; set; } = false;

        
        /// Recurrence pattern (if recurring)
        
        public string? RecurrencePattern { get; set; }

        
        /// Date when the reminder was created
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        
        /// Date when the reminder was acknowledged
        
        public DateTime? AcknowledgedAt { get; set; }
    }

    
    /// DTO for creating a reminder
    
    public class CreateReminderDTO
    {
        
        /// Title of the reminder
        
        [Required]
        [StringLength(100)]
        public string Title { get; set; } = string.Empty;

        
        /// Optional description
        
        [StringLength(500)]
        public string? Description { get; set; }

        
        /// Associated task ID (optional)
        
        public int? TaskId { get; set; }

        
        /// Scheduled reminder time
        
        [Required]
        public DateTime ReminderTime { get; set; }

        
        /// Priority level (0-3)
        
        [Range(0, 3)]
        public int Priority { get; set; } = 0;

        
        /// Whether this is a recurring reminder
        
        public bool IsRecurring { get; set; } = false;

        
        /// Recurrence pattern (if recurring)
        
        public string? RecurrencePattern { get; set; }
    }

    
    /// DTO for updating a reminder
    
    public class UpdateReminderDTO
    {
        
        /// Title of the reminder
        
        [StringLength(100)]
        public string? Title { get; set; }

        
        /// Description of the reminder
        
        [StringLength(500)]
        public string? Description { get; set; }

        
        /// Scheduled reminder time
        
        public DateTime? ReminderTime { get; set; }

        
        /// Priority level (0-3)
        
        [Range(0, 3)]
        public int? Priority { get; set; }

        
        /// Status of the reminder
        
        public ReminderStatus? Status { get; set; }

        
        /// Whether this is a recurring reminder
        
        public bool? IsRecurring { get; set; }

        
        /// Recurrence pattern
        
        public string? RecurrencePattern { get; set; }
    }

    
    /// Reminder statistics DTO
    
    public class ReminderStatisticsDTO
    {
        
        /// Total number of reminders
        
        public int TotalReminders { get; set; }

        
        /// Number of pending reminders
        
        public int PendingReminders { get; set; }

        
        /// Number of completed reminders
        
        public int CompletedReminders { get; set; }

        
        /// Number of missed reminders
        
        public int MissedReminders { get; set; }

        
        /// Number of upcoming reminders
        
        public int UpcomingReminders { get; set; }

        
        /// Reminders due today
        
        public int DueTodayReminders { get; set; }
    }

    
    /// Reminder status enum
    
    public enum ReminderStatus
    {
        Pending = 0,
        Triggered = 1,
        Acknowledged = 2,
        Dismissed = 3,
        Missed = 4,
        Completed = 5
    }
}
 