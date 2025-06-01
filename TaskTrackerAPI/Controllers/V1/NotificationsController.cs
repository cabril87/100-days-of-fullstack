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
using Microsoft.EntityFrameworkCore;
using TaskTrackerAPI.Data;
using TaskTrackerAPI.Controllers.V2;

namespace TaskTrackerAPI.Controllers.V1
{
    [ApiVersion("1.0")]
    [Authorize]
    [Route("api/v{version:apiVersion}/notifications")]
    [Route("api/notifications")]
    public class NotificationsController : BaseApiController
    {
        private readonly INotificationService _notificationService;
        private readonly INotificationPreferenceService _preferenceService;

        public NotificationsController(
            INotificationService notificationService,
            INotificationPreferenceService preferenceService)
        {
            _notificationService = notificationService;
            _preferenceService = preferenceService;
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
        
        #region Notification Preferences
        
        /// <summary>
        /// Get all notification preferences for the current user
        /// </summary>
        [HttpGet("preferences")]
        public async Task<ActionResult<ApiResponse<IEnumerable<NotificationPreferenceDTO>>>> GetAllPreferences()
        {
            try
            {
                int userId = GetUserId();
                var preferences = await _preferenceService.GetAllPreferencesAsync(userId);
                return ApiOk(preferences, "Notification preferences retrieved successfully");
            }
            catch (Exception ex)
            {
                return ApiServerError<IEnumerable<NotificationPreferenceDTO>>(ex.Message);
            }
        }
        
        /// <summary>
        /// Get notification preferences for a specific family
        /// </summary>
        [HttpGet("preferences/family/{familyId}")]
        public async Task<ActionResult<ApiResponse<IEnumerable<NotificationPreferenceDTO>>>> GetFamilyPreferences(int familyId)
        {
            try
            {
                int userId = GetUserId();
                var preferences = await _preferenceService.GetFamilyPreferencesAsync(userId, familyId);
                return ApiOk(preferences, "Family notification preferences retrieved successfully");
            }
            catch (UnauthorizedAccessException ex)
            {
                return ApiForbidden<IEnumerable<NotificationPreferenceDTO>>(ex.Message);
            }
            catch (Exception ex)
            {
                return ApiServerError<IEnumerable<NotificationPreferenceDTO>>(ex.Message);
            }
        }
        
        /// <summary>
        /// Get a notification preference summary
        /// </summary>
        [HttpGet("preferences/summary")]
        public async Task<ActionResult<ApiResponse<NotificationPreferenceSummaryDTO>>> GetPreferenceSummary()
        {
            try
            {
                int userId = GetUserId();
                var summary = await _preferenceService.GetPreferenceSummaryAsync(userId);
                return ApiOk(summary, "Notification preference summary retrieved successfully");
            }
            catch (Exception ex)
            {
                return ApiServerError<NotificationPreferenceSummaryDTO>(ex.Message);
            }
        }
        
        /// <summary>
        /// Get a specific notification preference
        /// </summary>
        [HttpGet("preferences/{id}")]
        public async Task<ActionResult<ApiResponse<NotificationPreferenceDTO>>> GetPreferenceById(int id)
        {
            try
            {
                int userId = GetUserId();
                var preference = await _preferenceService.GetPreferenceByIdAsync(userId, id);
                
                if (preference == null)
                    return ApiNotFound<NotificationPreferenceDTO>("Notification preference not found");
                
                return ApiOk(preference, "Notification preference retrieved successfully");
            }
            catch (Exception ex)
            {
                return ApiServerError<NotificationPreferenceDTO>(ex.Message);
            }
        }
        
        /// <summary>
        /// Create a new notification preference
        /// </summary>
        [HttpPost("preferences")]
        public async Task<ActionResult<ApiResponse<NotificationPreferenceDTO>>> CreatePreference(UpdateNotificationPreferenceDTO preference)
        {
            try
            {
                int userId = GetUserId();
                var createdPreference = await _preferenceService.CreatePreferenceAsync(userId, preference);
                return ApiCreated(createdPreference, "Notification preference created successfully");
            }
            catch (UnauthorizedAccessException ex)
            {
                return ApiForbidden<NotificationPreferenceDTO>(ex.Message);
            }
            catch (Exception ex)
            {
                return ApiServerError<NotificationPreferenceDTO>(ex.Message);
            }
        }
        
        /// <summary>
        /// Update a notification preference
        /// </summary>
        [HttpPut("preferences/{id}")]
        public async Task<ActionResult<ApiResponse<NotificationPreferenceDTO>>> UpdatePreference(int id, UpdateNotificationPreferenceDTO preference)
        {
            try
            {
                int userId = GetUserId();
                var updatedPreference = await _preferenceService.UpdatePreferenceAsync(userId, id, preference);
                
                if (updatedPreference == null)
                    return ApiNotFound<NotificationPreferenceDTO>("Notification preference not found");
                
                return ApiOk(updatedPreference, "Notification preference updated successfully");
            }
            catch (UnauthorizedAccessException ex)
            {
                return ApiForbidden<NotificationPreferenceDTO>(ex.Message);
            }
            catch (Exception ex)
            {
                return ApiServerError<NotificationPreferenceDTO>(ex.Message);
            }
        }
        
        /// <summary>
        /// Delete a notification preference
        /// </summary>
        [HttpDelete("preferences/{id}")]
        public async Task<ActionResult<ApiResponse<bool>>> DeletePreference(int id)
        {
            try
            {
                int userId = GetUserId();
                bool result = await _preferenceService.DeletePreferenceAsync(userId, id);
                
                if (!result)
                    return ApiNotFound<bool>("Notification preference not found");
                
                return ApiOk(true, "Notification preference deleted successfully");
            }
            catch (Exception ex)
            {
                return ApiServerError<bool>(ex.Message);
            }
        }
        
        /// <summary>
        /// Set global email notification preference for all notification types
        /// </summary>
        [HttpPut("preferences/email/{enabled}")]
        public async Task<ActionResult<ApiResponse<bool>>> SetEmailPreference(bool enabled)
        {
            try
            {
                int userId = GetUserId();
                bool result = await _preferenceService.SetEmailNotificationsAsync(userId, enabled);
                return ApiOk(result, $"Email notifications {(enabled ? "enabled" : "disabled")} successfully");
            }
            catch (Exception ex)
            {
                return ApiServerError<bool>(ex.Message);
            }
        }
        
        /// <summary>
        /// Set global push notification preference for all notification types
        /// </summary>
        [HttpPut("preferences/push/{enabled}")]
        public async Task<ActionResult<ApiResponse<bool>>> SetPushPreference(bool enabled)
        {
            try
            {
                int userId = GetUserId();
                bool result = await _preferenceService.SetPushNotificationsAsync(userId, enabled);
                return ApiOk(result, $"Push notifications {(enabled ? "enabled" : "disabled")} successfully");
            }
            catch (Exception ex)
            {
                return ApiServerError<bool>(ex.Message);
            }
        }
        
        /// <summary>
        /// Initialize default notification preferences
        /// </summary>
        [HttpPost("preferences/initialize")]
        public async Task<ActionResult<ApiResponse<bool>>> InitializePreferences([FromServices] ApplicationDbContext dbContext)
        {
            try
            {
                // Check if NotificationPreferences table exists
                bool tableExists = false;
                try
                {
                    // Try to query the table
                    await dbContext.NotificationPreferences.FirstOrDefaultAsync();
                    tableExists = true;
                }
                catch (Exception ex)
                {
                    // Table doesn't exist or other error
                    if (ex.Message.Contains("Invalid object name") || ex.Message.Contains("doesn't exist"))
                    {
                        tableExists = false;
                    }
                    else
                    {
                        throw; // Rethrow if it's a different error
                    }
                }

                // If table doesn't exist, create it
                if (!tableExists)
                {
                    // Create the table using SQL script
                    string createTableSql = @"
                    CREATE TABLE [dbo].[NotificationPreferences](
                        [Id] [int] IDENTITY(1,1) NOT NULL,
                        [UserId] [int] NOT NULL,
                        [NotificationType] [nvarchar](50) NOT NULL,
                        [Enabled] [bit] NOT NULL,
                        [Priority] [int] NOT NULL,
                        [FamilyId] [int] NULL,
                        [EnableEmailNotifications] [bit] NOT NULL,
                        [EnablePushNotifications] [bit] NOT NULL,
                        [CreatedAt] [datetime2](7) NOT NULL DEFAULT '2025-01-01T00:00:00.0000000',
                        [UpdatedAt] [datetime2](7) NOT NULL DEFAULT '2025-01-01T00:00:00.0000000',
                        CONSTRAINT [PK_NotificationPreferences] PRIMARY KEY CLUSTERED ([Id] ASC)
                    );

                    CREATE INDEX [IX_NotificationPreferences_UserId] ON [dbo].[NotificationPreferences] ([UserId]);
                    CREATE INDEX [IX_NotificationPreferences_FamilyId] ON [dbo].[NotificationPreferences] ([FamilyId]);

                    ALTER TABLE [dbo].[NotificationPreferences] ADD CONSTRAINT [FK_NotificationPreferences_Users_UserId] 
                        FOREIGN KEY([UserId]) REFERENCES [dbo].[Users] ([Id]) ON DELETE CASCADE;
                        
                    ALTER TABLE [dbo].[NotificationPreferences] ADD CONSTRAINT [FK_NotificationPreferences_Families_FamilyId] 
                        FOREIGN KEY([FamilyId]) REFERENCES [dbo].[Families] ([Id]);";

                    await dbContext.Database.ExecuteSqlRawAsync(createTableSql);
                }

                // Now initialize preferences
                int userId = GetUserId();
                bool result = await _preferenceService.InitializeDefaultPreferencesAsync(userId);
                return ApiOk(result, "Notification preferences initialized successfully");
            }
            catch (Exception ex)
            {
                return ApiServerError<bool>($"Error initializing notification preferences: {ex.Message}");
            }
        }
        
        #endregion
    }
} 