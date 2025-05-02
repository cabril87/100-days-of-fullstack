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
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TaskTrackerAPI.DTOs.Notifications;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Services.Interfaces;

namespace TaskTrackerAPI.Controllers.V1
{
    [ApiVersion("1.0")]
    [Authorize]
    [Route("api/v{version:apiVersion}/notifications")]
    [Route("api/notifications")]
    public class NotificationsController : BaseApiController
    {
        private readonly INotificationService _notificationService;

        public NotificationsController(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        /// <summary>
        /// Get all notifications for the current user
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<ApiResponse<IEnumerable<NotificationDTO>>>> GetAllNotifications()
        {
            try
            {
                int userId = GetUserId();
                IEnumerable<NotificationDTO> notifications = await _notificationService.GetAllNotificationsAsync(userId);
                return ApiOk(notifications, "Notifications retrieved successfully");
            }
            catch (Exception ex)
            {
                return ApiServerError<IEnumerable<NotificationDTO>>(ex.Message);
            }
        }

        /// <summary>
        /// Get a specific notification by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<NotificationDTO>>> GetNotificationById(int id)
        {
            try
            {
                int userId = GetUserId();
                NotificationDTO? notification = await _notificationService.GetNotificationByIdAsync(userId, id);
                
                if (notification == null)
                    return ApiNotFound<NotificationDTO>("Notification not found");
                
                return ApiOk(notification, "Notification retrieved successfully");
            }
            catch (Exception ex)
            {
                return ApiServerError<NotificationDTO>(ex.Message);
            }
        }

        /// <summary>
        /// Get the count of unread notifications
        /// </summary>
        [HttpGet("unread-count")]
        public async Task<ActionResult<ApiResponse<int>>> GetUnreadCount()
        {
            try
            {
                int userId = GetUserId();
                int count = await _notificationService.GetUnreadNotificationCountAsync(userId);
                return ApiOk(count, "Unread notification count retrieved successfully");
            }
            catch (Exception ex)
            {
                return ApiServerError<int>(ex.Message);
            }
        }

        /// <summary>
        /// Get notification counts by type
        /// </summary>
        [HttpGet("counts")]
        public async Task<ActionResult<ApiResponse<NotificationCountDTO>>> GetNotificationCounts()
        {
            try
            {
                int userId = GetUserId();
                NotificationCountDTO counts = await _notificationService.GetNotificationCountsAsync(userId);
                return ApiOk(counts, "Notification counts retrieved successfully");
            }
            catch (Exception ex)
            {
                return ApiServerError<NotificationCountDTO>(ex.Message);
            }
        }

        /// <summary>
        /// Filter notifications by criteria
        /// </summary>
        [HttpPost("filter")]
        public async Task<ActionResult<ApiResponse<IEnumerable<NotificationDTO>>>> FilterNotifications(NotificationFilterDTO filter)
        {
            try
            {
                int userId = GetUserId();
                IEnumerable<NotificationDTO> notifications = await _notificationService.GetFilteredNotificationsAsync(userId, filter);
                return ApiOk(notifications, "Filtered notifications retrieved successfully");
            }
            catch (Exception ex)
            {
                return ApiServerError<IEnumerable<NotificationDTO>>(ex.Message);
            }
        }

        /// <summary>
        /// Create a new notification
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<ApiResponse<NotificationDTO>>> CreateNotification(CreateNotificationDTO notification)
        {
            try
            {
                int userId = GetUserId();
                NotificationDTO? createdNotification = await _notificationService.CreateNotificationAsync(userId, notification);
                
                if (createdNotification == null)
                    return ApiBadRequest<NotificationDTO>("Failed to create notification");
                    
                return ApiCreated(createdNotification, message: "Notification created successfully");
            }
            catch (Exception ex)
            {
                return ApiServerError<NotificationDTO>(ex.Message);
            }
        }

        /// <summary>
        /// Mark a notification as read
        /// </summary>
        [HttpPut("{id}/read")]
        public async Task<ActionResult<ApiResponse<NotificationDTO>>> MarkAsRead(int id)
        {
            try
            {
                int userId = GetUserId();
                
                if (!await _notificationService.IsNotificationOwnedByUserAsync(id, userId))
                    return ApiNotFound<NotificationDTO>("Notification not found");
                
                NotificationDTO? updatedNotification = await _notificationService.MarkNotificationAsReadAsync(userId, id);
                
                if (updatedNotification == null)
                    return ApiNotFound<NotificationDTO>("Notification not found");
                    
                return ApiOk(updatedNotification, "Notification marked as read");
            }
            catch (Exception ex)
            {
                return ApiServerError<NotificationDTO>(ex.Message);
            }
        }

        /// <summary>
        /// Mark all notifications as read
        /// </summary>
        [HttpPut("mark-all-read")]
        public async Task<ActionResult<ApiResponse<int>>> MarkAllAsRead()
        {
            try
            {
                int userId = GetUserId();
                int count = await _notificationService.MarkAllNotificationsAsReadAsync(userId);
                return ApiOk(count, "All notifications marked as read");
            }
            catch (Exception ex)
            {
                return ApiServerError<int>(ex.Message);
            }
        }

        /// <summary>
        /// Delete a notification
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<bool>>> DeleteNotification(int id)
        {
            try
            {
                int userId = GetUserId();
                
                if (!await _notificationService.IsNotificationOwnedByUserAsync(id, userId))
                    return ApiNotFound<bool>("Notification not found");
                
                await _notificationService.DeleteNotificationAsync(userId, id);
                return ApiOk(true, "Notification deleted successfully");
            }
            catch (Exception ex)
            {
                return ApiServerError<bool>(ex.Message);
            }
        }

        /// <summary>
        /// Delete all notifications for the current user
        /// </summary>
        [HttpDelete]
        public async Task<ActionResult<ApiResponse<bool>>> DeleteAllNotifications()
        {
            try
            {
                int userId = GetUserId();
                await _notificationService.DeleteAllNotificationsAsync(userId);
                return ApiOk(true, "All notifications deleted successfully");
            }
            catch (Exception ex)
            {
                return ApiServerError<bool>(ex.Message);
            }
        }
    }
} 