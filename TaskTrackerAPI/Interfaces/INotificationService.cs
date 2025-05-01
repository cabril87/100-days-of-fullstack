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
using System.Collections.Generic;
using System.Threading.Tasks;
using TaskTrackerAPI.DTOs.Notifications;

namespace TaskTrackerAPI.Interfaces
{
    public interface INotificationService
    {
        
        /// Get all notifications for a specific user
        
        Task<IEnumerable<NotificationDTO>> GetUserNotificationsAsync(int userId);

        
        /// Get a notification by its ID
        
        Task<NotificationDTO> GetNotificationByIdAsync(int notificationId);

        
        /// Get the count of unread notifications for a user
        
        Task<int> GetUnreadNotificationCountAsync(int userId);

        
        /// Get notification counts by category/type for a user
        
        Task<NotificationCountsDTO> GetNotificationCountsAsync(int userId);

        
        /// Filter notifications based on criteria
        
        Task<IEnumerable<NotificationDTO>> FilterNotificationsAsync(int userId, NotificationFilterDTO filter);

        
        /// Create a new notification
        
        Task<NotificationDTO> CreateNotificationAsync(NotificationCreateDTO notification, int createdByUserId);

        
        /// Mark a notification as read
        
        Task<NotificationDTO> MarkNotificationAsReadAsync(int notificationId);

        
        /// Mark all notifications as read for a user
        
        Task MarkAllNotificationsAsReadAsync(int userId);

        
        /// Delete a notification
        
        Task DeleteNotificationAsync(int notificationId);

        
        /// Delete all notifications for a user
        
        Task DeleteAllUserNotificationsAsync(int userId);
    }
} 