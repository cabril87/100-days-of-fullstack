using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.DTOs.Notifications
{
    /// <summary>
    /// Base notification DTO
    /// </summary>
    public class NotificationDTO
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string NotificationType { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public bool IsRead { get; set; }
        public int? RelatedEntityId { get; set; }
        public string RelatedEntityType { get; set; } = string.Empty;
        public UserDTO? CreatedBy { get; set; }
    }

    /// <summary>
    /// DTO for creating a new notification
    /// </summary>
    public class NotificationCreateDTO
    {
        [Required]
        public int UserId { get; set; }

        [Required]
        [MaxLength(100)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MaxLength(500)]
        public string Message { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string NotificationType { get; set; } = string.Empty;

        public int? RelatedEntityId { get; set; }
        
        [MaxLength(50)]
        public string RelatedEntityType { get; set; } = string.Empty;
    }

    /// <summary>
    /// DTO for filtering notifications
    /// </summary>
    public class NotificationFilterDTO
    {
        public bool? IsRead { get; set; }
        public bool? IsImportant { get; set; }
        public NotificationType? Type { get; set; }
        public string? RelatedEntityType { get; set; }
        public int? RelatedEntityId { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public string SearchTerm { get; set; } = string.Empty;
    }

    /// <summary>
    /// DTO for notification counts by category/type
    /// </summary>
    public class NotificationCountsDTO
    {
        public int TotalCount { get; set; }
        public int UnreadCount { get; set; }
        public Dictionary<string, int> CountsByType { get; set; } = new Dictionary<string, int>();
    }
    
    /// <summary>
    /// DTO for notification count details
    /// </summary>
    public class NotificationCountDTO
    {
        public int TotalCount { get; set; }
        public int UnreadCount { get; set; }
        public int ImportantCount { get; set; }
        public Dictionary<string, int> CountsByType { get; set; } = new Dictionary<string, int>();
    }
    
    /// <summary>
    /// DTO for creating notifications
    /// </summary>
    public class CreateNotificationDTO
    {
        [Required]
        [MaxLength(100)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MaxLength(500)]
        public string Message { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string NotificationType { get; set; } = string.Empty;

        public NotificationType? Type { get; set; }

        public bool IsImportant { get; set; } = false;

        public int? RelatedEntityId { get; set; }
        
        [MaxLength(50)]
        public string RelatedEntityType { get; set; } = string.Empty;
    }
} 