using System;
using System.ComponentModel.DataAnnotations;

namespace TaskTrackerAPI.Models;

public class Reminder
{
    public int Id { get; set; }
    
    [Required]
    [StringLength(100, MinimumLength = 3)]
    public string Title { get; set; } = string.Empty;
    
    [StringLength(500)]
    public string Description { get; set; } = string.Empty;
    
    [Required]
    public DateTime ReminderTime { get; set; }
    
    public bool IsRepeating { get; set; } = false;
    
    public RepeatFrequency? RepeatFrequency { get; set; }
    
    public bool IsCompleted { get; set; } = false;
    
    public ReminderPriority Priority { get; set; } = ReminderPriority.Medium;
    
    public ReminderStatus Status { get; set; } = ReminderStatus.Pending;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime? UpdatedAt { get; set; }
    
    public DateTime? CompletedAt { get; set; }
    
    // Foreign keys
    [Required]
    public int UserId { get; set; }
    
    public int? TaskItemId { get; set; }
    
    // Navigation properties
    public virtual User? User { get; set; }
    
    public virtual TaskItem? TaskItem { get; set; }
}

public enum RepeatFrequency
{
    Daily,
    Weekly,
    Monthly,
    Yearly,
    Custom
}

public enum ReminderPriority
{
    Low,
    Medium,
    High,
    Urgent
}

public enum ReminderStatus
{
    Pending,
    Triggered,
    Completed,
    Dismissed,
    Snoozed
} 