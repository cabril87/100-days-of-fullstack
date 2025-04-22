using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TaskTrackerAPI.DTOs.Notifications;
using TaskTrackerAPI.Interfaces;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Controllers
{
    [Authorize]
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
                var userId = GetUserId();
                var notifications = await _notificationService.GetUserNotificationsAsync(userId);
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
                var userId = GetUserId();
                var notification = await _notificationService.GetNotificationByIdAsync(id);
                
                if (notification == null)
                    return ApiNotFound<NotificationDTO>("Notification not found");
                
                if (notification.UserId != userId)
                    return ApiForbidden<NotificationDTO>("You don't have permission to view this notification");
                
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
                var userId = GetUserId();
                var count = await _notificationService.GetUnreadNotificationCountAsync(userId);
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
        public async Task<ActionResult<ApiResponse<NotificationCountsDTO>>> GetNotificationCounts()
        {
            try
            {
                var userId = GetUserId();
                var counts = await _notificationService.GetNotificationCountsAsync(userId);
                return ApiOk(counts, "Notification counts retrieved successfully");
            }
            catch (Exception ex)
            {
                return ApiServerError<NotificationCountsDTO>(ex.Message);
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
                var userId = GetUserId();
                var notifications = await _notificationService.FilterNotificationsAsync(userId, filter);
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
        public async Task<ActionResult<ApiResponse<NotificationDTO>>> CreateNotification(NotificationCreateDTO notification)
        {
            try
            {
                var userId = GetUserId();
                var createdNotification = await _notificationService.CreateNotificationAsync(notification, userId);
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
                var userId = GetUserId();
                var notification = await _notificationService.GetNotificationByIdAsync(id);
                
                if (notification == null)
                    return ApiNotFound<NotificationDTO>("Notification not found");
                
                if (notification.UserId != userId)
                    return ApiForbidden<NotificationDTO>("You don't have permission to update this notification");
                
                var updatedNotification = await _notificationService.MarkNotificationAsReadAsync(id);
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
        public async Task<ActionResult<ApiResponse<bool>>> MarkAllAsRead()
        {
            try
            {
                var userId = GetUserId();
                await _notificationService.MarkAllNotificationsAsReadAsync(userId);
                return ApiOk(true, "All notifications marked as read");
            }
            catch (Exception ex)
            {
                return ApiServerError<bool>(ex.Message);
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
                var userId = GetUserId();
                var notification = await _notificationService.GetNotificationByIdAsync(id);
                
                if (notification == null)
                    return ApiNotFound<bool>("Notification not found");
                
                if (notification.UserId != userId)
                    return ApiForbidden<bool>("You don't have permission to delete this notification");
                
                await _notificationService.DeleteNotificationAsync(id);
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
                var userId = GetUserId();
                await _notificationService.DeleteAllUserNotificationsAsync(userId);
                return ApiOk(true, "All notifications deleted successfully");
            }
            catch (Exception ex)
            {
                return ApiServerError<bool>(ex.Message);
            }
        }
    }
} 