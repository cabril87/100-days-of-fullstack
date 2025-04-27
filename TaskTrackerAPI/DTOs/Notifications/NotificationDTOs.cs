using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.DTOs.User;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.DTOs.Notifications
{
    
    /// Base notification DTO
    
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

    
    /// DTO for creating a new notification
    
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

    
    /// DTO for filtering notifications
    
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

    
    /// DTO for notification counts by category/type
    
    public class NotificationCountsDTO
    {
        public int TotalCount { get; set; }
        public int UnreadCount { get; set; }
        public Dictionary<string, int> CountsByType { get; set; } = new Dictionary<string, int>();
    }
    
    
    /// DTO for notification count details
    
    public class NotificationCountDTO
    {
        public int TotalCount { get; set; }
        public int UnreadCount { get; set; }
        public int ImportantCount { get; set; }
        public Dictionary<string, int> CountsByType { get; set; } = new Dictionary<string, int>();
    }
    
    
    /// DTO for creating notifications
    
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