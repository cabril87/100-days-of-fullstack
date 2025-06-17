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
using System.ComponentModel.DataAnnotations;


namespace TaskTrackerAPI.DTOs.Notifications;

public class NotificationPreferenceDTO
{
    public int Id { get; set; }
    public string NotificationType { get; set; } = string.Empty;
    public bool Enabled { get; set; } = true;
    public NotificationPriorityDTO Priority { get; set; } = NotificationPriorityDTO.Normal;
    public int? FamilyId { get; set; }
    public string? FamilyName { get; set; }
    public bool EnableEmailNotifications { get; set; } = false;
    public bool EnablePushNotifications { get; set; } = true;
}

public class UpdateNotificationPreferenceDTO
{
    [Required]
    public string NotificationType { get; set; } = string.Empty;
    
    public bool Enabled { get; set; } = true;
    
    public NotificationPriorityDTO Priority { get; set; } = NotificationPriorityDTO.Normal;
    
    public int? FamilyId { get; set; }
    
    public bool EnableEmailNotifications { get; set; } = false;
    
    public bool EnablePushNotifications { get; set; } = true;
}

public class NotificationPreferenceSummaryDTO
{
    public bool EnableGlobalNotifications { get; set; } = true;
    public bool EnableTaskNotifications { get; set; } = true;
    public bool EnableFamilyNotifications { get; set; } = true;
    public bool EnableSystemNotifications { get; set; } = true;
    public bool EnableEmailNotifications { get; set; } = false;
    public bool EnablePushNotifications { get; set; } = true;
} 