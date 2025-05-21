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
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.DTOs.Notifications;
using TaskTrackerAPI.Hubs;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Services.Interfaces;

namespace TaskTrackerAPI.Services;

/// <summary>
/// Service for delivering real-time notifications via SignalR
/// </summary>
public class NotificationRealTimeService : INotificationRealTimeService
{
    private readonly IHubContext<NotificationHub> _notificationHubContext;
    private readonly ILogger<NotificationRealTimeService> _logger;

    public NotificationRealTimeService(
        IHubContext<NotificationHub> notificationHubContext,
        ILogger<NotificationRealTimeService> logger)
    {
        _notificationHubContext = notificationHubContext ?? throw new ArgumentNullException(nameof(notificationHubContext));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <inheritdoc />
    public async Task SendNotificationToUserAsync(int userId, NotificationDTO notification)
    {
        try
        {
            string userGroup = $"user-notifications-{userId}";
            await _notificationHubContext.Clients.Group(userGroup).SendAsync("ReceiveNotification", notification);
            _logger.LogInformation("Sent notification {NotificationId} to user {UserId}", notification.Id, userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending notification to user {UserId}", userId);
        }
    }

    /// <inheritdoc />
    public async Task SendNotificationToFamilyAsync(int familyId, NotificationDTO notification)
    {
        try
        {
            string familyGroup = $"family-notifications-{familyId}";
            await _notificationHubContext.Clients.Group(familyGroup).SendAsync("ReceiveFamilyNotification", notification);
            _logger.LogInformation("Sent notification {NotificationId} to family {FamilyId}", notification.Id, familyId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending notification to family {FamilyId}", familyId);
        }
    }

    /// <inheritdoc />
    public async Task SendNotificationUpdateToUserAsync(int userId, int notificationId, bool isRead)
    {
        try
        {
            string userGroup = $"user-notifications-{userId}";
            var updateInfo = new { NotificationId = notificationId, IsRead = isRead };
            await _notificationHubContext.Clients.Group(userGroup).SendAsync("NotificationStatusUpdated", updateInfo);
            _logger.LogInformation("Sent notification status update for notification {NotificationId} to user {UserId}", notificationId, userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending notification update to user {UserId}", userId);
        }
    }

    /// <inheritdoc />
    public async Task SendNotificationCountsToUserAsync(int userId, NotificationCountDTO counts)
    {
        try
        {
            string userGroup = $"user-notifications-{userId}";
            await _notificationHubContext.Clients.Group(userGroup).SendAsync("NotificationCountsUpdated", counts);
            _logger.LogInformation("Sent notification counts update to user {UserId}", userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending notification counts to user {UserId}", userId);
        }
    }
    
    /// <inheritdoc />
    public async Task UpdateNotificationCountAsync(int userId, int unreadCount)
    {
        try
        {
            string userGroup = $"user-notifications-{userId}";
            await _notificationHubContext.Clients.Group(userGroup).SendAsync("UnreadCountUpdated", unreadCount);
            _logger.LogInformation("Sent unread count update ({Count}) to user {UserId}", unreadCount, userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending unread count update to user {UserId}", userId);
        }
    }
    
    /// <inheritdoc />
    public async Task SendActionResultToUserAsync(int userId, NotificationActionResultDTO result)
    {
        try
        {
            string userGroup = $"user-notifications-{userId}";
            await _notificationHubContext.Clients.Group(userGroup).SendAsync("NotificationActionResult", result);
            _logger.LogInformation("Sent notification action result for action {Action} to user {UserId}", result.Action, userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending notification action result to user {UserId}", userId);
        }
    }
} 