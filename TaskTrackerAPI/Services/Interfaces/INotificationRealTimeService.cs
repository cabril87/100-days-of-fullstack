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
using TaskTrackerAPI.DTOs.Notifications;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Services.Interfaces;

/// <summary>
/// Interface for real-time notification delivery using SignalR
/// </summary>
public interface INotificationRealTimeService
{
    /// <summary>
    /// Send a notification to a specific user
    /// </summary>
    /// <param name="userId">The user ID to send the notification to</param>
    /// <param name="notification">The notification to send</param>
    Task SendNotificationToUserAsync(int userId, NotificationDTO notification);
    
    /// <summary>
    /// Send a notification to all members of a family
    /// </summary>
    /// <param name="familyId">The family ID to send the notification to</param>
    /// <param name="notification">The notification to send</param>
    Task SendNotificationToFamilyAsync(int familyId, NotificationDTO notification);
    
    /// <summary>
    /// Send a notification update (such as read status change) to a user
    /// </summary>
    /// <param name="userId">The user ID to send the update to</param>
    /// <param name="notificationId">The ID of the updated notification</param>
    /// <param name="isRead">The new read status</param>
    Task SendNotificationUpdateToUserAsync(int userId, int notificationId, bool isRead);
    
    /// <summary>
    /// Send notification count update to a user
    /// </summary>
    /// <param name="userId">The user ID to send the update to</param>
    /// <param name="counts">The updated notification counts</param>
    Task SendNotificationCountsToUserAsync(int userId, NotificationCountDTO counts);
    
    /// <summary>
    /// Update notification count for a user
    /// </summary>
    /// <param name="userId">The user ID to update count for</param>
    /// <param name="unreadCount">The updated unread count</param>
    Task UpdateNotificationCountAsync(int userId, int unreadCount);
    
    /// <summary>
    /// Send the result of a notification action to a user
    /// </summary>
    /// <param name="userId">The user ID to send the result to</param>
    /// <param name="result">The result of the notification action</param>
    Task SendActionResultToUserAsync(int userId, NotificationActionResultDTO result);
} 