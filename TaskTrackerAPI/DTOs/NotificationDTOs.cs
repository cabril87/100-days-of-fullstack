using System;
using System.ComponentModel.DataAnnotations;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.DTOs;

public class NotificationDTO
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public NotificationType Type { get; set; }
    public string? RelatedEntityType { get; set; }
    public int? RelatedEntityId { get; set; }
    public string? ActionUrl { get; set; }
    public bool IsRead { get; set; }
    public bool IsDismissed { get; set; }
    public bool IsImportant { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ReadAt { get; set; }
    public DateTime? DismissedAt { get; set; }
}

public class CreateNotificationDTO
{
    [Required]
    [StringLength(200)]
    public string Title { get; set; } = string.Empty;
    
    [StringLength(1000)]
    public string Message { get; set; } = string.Empty;
    
    [Required]
    public NotificationType Type { get; set; } = NotificationType.Info;
    
    public string? RelatedEntityType { get; set; }
    
    public int? RelatedEntityId { get; set; }
    
    public string? ActionUrl { get; set; }
    
    public bool IsImportant { get; set; } = false;
    
    // Optional: Target user ID (if different from current user, e.g., for admin notifications)
    public int? TargetUserId { get; set; }
}

public class NotificationCountDTO
{
    public int TotalCount { get; set; }
    public int UnreadCount { get; set; }
    public int ImportantCount { get; set; }
}

public class NotificationFilterDTO
{
    public bool? IsRead { get; set; }
    public bool? IsImportant { get; set; }
    public NotificationType? Type { get; set; }
    public string? RelatedEntityType { get; set; }
    public int? RelatedEntityId { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
} 