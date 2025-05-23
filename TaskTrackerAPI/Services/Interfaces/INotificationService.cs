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
using System.Threading.Tasks;
using System.Collections.Generic;

namespace TaskTrackerAPI.Services.Interfaces;

public interface INotificationService
{
    Task<IEnumerable<NotificationDTO>> GetAllNotificationsAsync(int userId);
    Task<IEnumerable<NotificationDTO>> GetFilteredNotificationsAsync(int userId, NotificationFilterDTO filter);
    Task<NotificationDTO?> GetNotificationByIdAsync(int userId, int notificationId);
    Task<NotificationDTO?> CreateNotificationAsync(int userId, CreateNotificationDTO notificationDto);
    Task<NotificationDTO?> CreateNotificationForUserAsync(int creatorUserId, int targetUserId, CreateNotificationDTO notificationDto);
    Task<NotificationDTO?> MarkNotificationAsReadAsync(int userId, int notificationId);
    Task<int> MarkAllNotificationsAsReadAsync(int userId);
    Task DeleteNotificationAsync(int userId, int notificationId);
    Task DeleteAllNotificationsAsync(int userId);
    Task<NotificationCountDTO> GetNotificationCountsAsync(int userId);
    Task<int> GetUnreadNotificationCountAsync(int userId);
    Task<bool> IsNotificationOwnedByUserAsync(int notificationId, int userId);
    
    // Task deadline notification methods
    Task<NotificationDTO?> CreateTaskDeadlineNotificationAsync(int userId, int taskId, string message);
    Task<IEnumerable<NotificationDTO>> GenerateUpcomingDeadlineNotificationsAsync(int hoursThreshold = 24);
} 