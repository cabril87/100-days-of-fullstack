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
using System.Threading.Tasks;
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.DTOs.Notifications;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Repositories.Interfaces;

public interface INotificationRepository
{
    Task<IEnumerable<Notification>> GetAllNotificationsAsync();
    Task<IEnumerable<Notification>> GetNotificationsByUserIdAsync(int userId);
    Task<IEnumerable<Notification>> GetUnreadNotificationsByUserIdAsync(int userId);
    Task<Notification?> GetNotificationByIdAsync(int id);
    Task<bool> CreateNotificationAsync(Notification notification);
    Task<bool> UpdateNotificationAsync(Notification notification);
    Task<bool> DeleteNotificationAsync(int id);
    Task<bool> DeleteNotificationAsync(Notification notification);
    Task<bool> MarkAsReadAsync(int id);
    Task<bool> MarkAllAsReadAsync(int userId);
    Task<int> GetUnreadCountAsync(int userId);
    Task<Dictionary<string, int>> GetCountsByTypeAsync(int userId);
    Task<bool> IsOwnerAsync(int notificationId, int userId);
    Task<bool> IsNotificationOwnedByUserAsync(int notificationId, int userId);
    
    Task<IEnumerable<Notification>> FilterNotificationsAsync(
        int userId, 
        bool? isRead = null, 
        string? notificationType = null, 
        DateTime? fromDate = null, 
        DateTime? toDate = null, 
        string? searchTerm = null);
    
    Task<IEnumerable<Notification>> GetFilteredNotificationsAsync(int userId, NotificationFilterDTO filter);
    Task<Notification?> MarkNotificationAsReadAsync(int notificationId);
    Task<int> MarkAllNotificationsAsReadAsync(int userId);
    Task<int> GetUnreadNotificationCountAsync(int userId);
    Task<NotificationCountDTO> GetNotificationCountsAsync(int userId);
    Task DeleteAllNotificationsAsync(int userId);
} 