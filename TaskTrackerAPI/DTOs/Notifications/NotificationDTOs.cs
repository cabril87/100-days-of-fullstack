/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 *
 * This file may not be used, copied, modified, or distributed except in
 * accordance with the terms contained in the LICENSE file.
 */
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

    /// <summary>
    /// DTO for notification statistics
    /// </summary>
    public class NotificationStats
    {
        public int TotalSent { get; set; }
        public int UnreadCount { get; set; }
        public int ThisWeek { get; set; }
        public int DeliveryRate { get; set; }
    }

    /// <summary>
    /// DTO for comprehensive notification settings
    /// </summary>
    public class NotificationSettingsDTO
    {
        public EmailNotificationSettings EmailNotifications { get; set; } = new();
        public PushNotificationSettings PushNotifications { get; set; } = new();
        public NotificationSchedule NotificationSchedule { get; set; } = new();
        public FamilyNotificationSettings FamilyNotifications { get; set; } = new();
    }

    /// <summary>
    /// Email notification settings
    /// </summary>
    public class EmailNotificationSettings
    {
        public bool TaskReminders { get; set; } = true;
        public bool AchievementAlerts { get; set; } = true;
        public bool FamilyActivity { get; set; } = true;
        public bool SecurityAlerts { get; set; } = true;
        public bool WeeklyDigest { get; set; } = true;
        public bool MarketingEmails { get; set; } = false;
        public bool SystemUpdates { get; set; } = true;
    }

    /// <summary>
    /// Push notification settings
    /// </summary>
    public class PushNotificationSettings
    {
        public bool TaskReminders { get; set; } = true;
        public bool AchievementAlerts { get; set; } = true;
        public bool FamilyActivity { get; set; } = true;
        public bool SecurityAlerts { get; set; } = true;
        public bool ImmediateAlerts { get; set; } = true;
        public bool QuietHours { get; set; } = false;
    }

    /// <summary>
    /// Notification schedule settings
    /// </summary>
    public class NotificationSchedule
    {
        public string StartTime { get; set; } = "09:00";
        public string EndTime { get; set; } = "22:00";
        public string Timezone { get; set; } = "UTC";
        public bool WeekendsOnly { get; set; } = false;
        public List<int> CustomDays { get; set; } = new();
    }

    /// <summary>
    /// Family notification settings
    /// </summary>
    public class FamilyNotificationSettings
    {
        public bool ChildTaskUpdates { get; set; } = true;
        public bool PermissionRequests { get; set; } = true;
        public bool AchievementSharing { get; set; } = true;
        public bool EmergencyAlerts { get; set; } = true;
        public bool ParentalControlChanges { get; set; } = true;
    }
} 