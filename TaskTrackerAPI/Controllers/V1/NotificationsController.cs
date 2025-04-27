using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TaskTrackerAPI.DTOs.Notifications;
using TaskTrackerAPI.Interfaces;
using TaskTrackerAPI.Models;

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

        
        /// Get all notifications for the current user
        
        [HttpGet]
        public async Task<ActionResult<ApiResponse<IEnumerable<NotificationDTO>>>> GetAllNotifications()
        {
            try
            {
                int userId = GetUserId();
                IEnumerable<NotificationDTO> notifications = await _notificationService.GetUserNotificationsAsync(userId);
                return ApiOk(notifications, "Notifications retrieved successfully");
            }
            catch (Exception ex)
            {
                return ApiServerError<IEnumerable<NotificationDTO>>(ex.Message);
            }
        }

        
        /// Get a specific notification by ID
        
        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<NotificationDTO>>> GetNotificationById(int id)
        {
            try
            {
                int userId = GetUserId();
                NotificationDTO notification = await _notificationService.GetNotificationByIdAsync(id);
                
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

        
        /// Get the count of unread notifications
        
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

        
        /// Get notification counts by type
        
        [HttpGet("counts")]
        public async Task<ActionResult<ApiResponse<NotificationCountsDTO>>> GetNotificationCounts()
        {
            try
            {
                int userId = GetUserId();
                NotificationCountsDTO counts = await _notificationService.GetNotificationCountsAsync(userId);
                return ApiOk(counts, "Notification counts retrieved successfully");
            }
            catch (Exception ex)
            {
                return ApiServerError<NotificationCountsDTO>(ex.Message);
            }
        }

        
        /// Filter notifications by criteria
        
        [HttpPost("filter")]
        public async Task<ActionResult<ApiResponse<IEnumerable<NotificationDTO>>>> FilterNotifications(NotificationFilterDTO filter)
        {
            try
            {
                int userId = GetUserId();
                IEnumerable<NotificationDTO> notifications = await _notificationService.FilterNotificationsAsync(userId, filter);
                return ApiOk(notifications, "Filtered notifications retrieved successfully");
            }
            catch (Exception ex)
            {
                return ApiServerError<IEnumerable<NotificationDTO>>(ex.Message);
            }
        }

        
        /// Create a new notification
        
        [HttpPost]
        public async Task<ActionResult<ApiResponse<NotificationDTO>>> CreateNotification(NotificationCreateDTO notification)
        {
            try
            {
                int userId = GetUserId();
                NotificationDTO createdNotification = await _notificationService.CreateNotificationAsync(notification, userId);
                return ApiCreated(createdNotification, message: "Notification created successfully");
            }
            catch (Exception ex)
            {
                return ApiServerError<NotificationDTO>(ex.Message);
            }
        }

        
        /// Mark a notification as read
        
        [HttpPut("{id}/read")]
        public async Task<ActionResult<ApiResponse<NotificationDTO>>> MarkAsRead(int id)
        {
            try
            {
                int userId = GetUserId();
                NotificationDTO notification = await _notificationService.GetNotificationByIdAsync(id);
                
                if (notification == null)
                    return ApiNotFound<NotificationDTO>("Notification not found");
                
                if (notification.UserId != userId)
                    return ApiForbidden<NotificationDTO>("You don't have permission to update this notification");
                
                NotificationDTO updatedNotification = await _notificationService.MarkNotificationAsReadAsync(id);
                return ApiOk(updatedNotification, "Notification marked as read");
            }
            catch (Exception ex)
            {
                return ApiServerError<NotificationDTO>(ex.Message);
            }
        }

        
        /// Mark all notifications as read
        
        [HttpPut("mark-all-read")]
        public async Task<ActionResult<ApiResponse<bool>>> MarkAllAsRead()
        {
            try
            {
                int userId = GetUserId();
                await _notificationService.MarkAllNotificationsAsReadAsync(userId);
                return ApiOk(true, "All notifications marked as read");
            }
            catch (Exception ex)
            {
                return ApiServerError<bool>(ex.Message);
            }
        }

        
        /// Delete a notification
        
        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<bool>>> DeleteNotification(int id)
        {
            try
            {
                int userId = GetUserId();
                NotificationDTO notification = await _notificationService.GetNotificationByIdAsync(id);
                
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

        
        /// Delete all notifications for the current user
        
        [HttpDelete]
        public async Task<ActionResult<ApiResponse<bool>>> DeleteAllNotifications()
        {
            try
            {
                int userId = GetUserId();
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