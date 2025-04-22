using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using TaskTrackerAPI.DTOs.User;

namespace TaskTrackerAPI.DTOs.Notifications
{
    /// <summary>
    /// Base notification DTO
    /// </summary>
    public class NotificationDTO
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Title { get; set; }
        public string Message { get; set; }
        public string NotificationType { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsRead { get; set; }
        public int? RelatedEntityId { get; set; }
        public string RelatedEntityType { get; set; }
        public UserDTO CreatedBy { get; set; }
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
        public string Title { get; set; }

        [Required]
        [MaxLength(500)]
        public string Message { get; set; }

        [Required]
        [MaxLength(50)]
        public string NotificationType { get; set; }

        public int? RelatedEntityId { get; set; }
        
        [MaxLength(50)]
        public string RelatedEntityType { get; set; }
    }

    /// <summary>
    /// DTO for filtering notifications
    /// </summary>
    public class NotificationFilterDTO
    {
        public bool? IsRead { get; set; }
        public string NotificationType { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public string SearchTerm { get; set; }
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
} 