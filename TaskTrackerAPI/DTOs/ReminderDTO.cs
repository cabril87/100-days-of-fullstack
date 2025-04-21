using System;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.DTOs;

public class ReminderDTO
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime ReminderTime { get; set; }
    public bool IsRepeating { get; set; }
    public RepeatFrequency? RepeatFrequency { get; set; }
    public bool IsCompleted { get; set; }
    public ReminderPriority Priority { get; set; }
    public ReminderStatus Status { get; set; }
    public int? TaskItemId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
}

public class CreateReminderDTO
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime ReminderTime { get; set; }
    public bool IsRepeating { get; set; }
    public RepeatFrequency? RepeatFrequency { get; set; }
    public ReminderPriority Priority { get; set; } = ReminderPriority.Medium;
    public int? TaskItemId { get; set; }
}

public class UpdateReminderDTO
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public DateTime? ReminderTime { get; set; }
    public bool? IsRepeating { get; set; }
    public RepeatFrequency? RepeatFrequency { get; set; }
    public ReminderPriority? Priority { get; set; }
    public int? TaskItemId { get; set; }
}

public class ReminderStatisticsDTO
{
    public int TotalReminders { get; set; }
    public int PendingReminders { get; set; }
    public int CompletedReminders { get; set; }
    public int UpcomingReminders { get; set; }
    public int OverdueReminders { get; set; }
    public double CompletionRate { get; set; }
} 