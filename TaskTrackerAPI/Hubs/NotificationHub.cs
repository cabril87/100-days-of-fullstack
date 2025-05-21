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
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.Extensions;

namespace TaskTrackerAPI.Hubs
{
    /// <summary>
    /// SignalR hub for real-time notification delivery
    /// </summary>
    [Authorize]
    public class NotificationHub : Hub
    {
        private readonly ILogger<NotificationHub> _logger;

        public NotificationHub(ILogger<NotificationHub> logger)
        {
            _logger = logger;
        }

        /// <summary>
        /// Override of OnConnectedAsync to manage group membership
        /// </summary>
        public override async Task OnConnectedAsync()
        {
            try
            {
                if (Context.User != null)
                {
                    int userId = Context.User.GetUserIdAsInt();
                    string userNotificationGroup = $"user-notifications-{userId}";
                    
                    // Add to user-specific notification group
                    await Groups.AddToGroupAsync(Context.ConnectionId, userNotificationGroup);
                    
                    _logger.LogInformation("User {UserId} connected to NotificationHub with connection {ConnectionId}", 
                        userId, Context.ConnectionId);
                }
                
                await base.OnConnectedAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in NotificationHub.OnConnectedAsync");
                throw;
            }
        }

        /// <summary>
        /// Override of OnDisconnectedAsync to clean up group membership
        /// </summary>
        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            try
            {
                if (Context.User?.Identity?.IsAuthenticated == true)
                {
                    int userId = Context.User.GetUserIdAsInt();
                    string userNotificationGroup = $"user-notifications-{userId}";
                    
                    // Remove from user-specific notification group
                    await Groups.RemoveFromGroupAsync(Context.ConnectionId, userNotificationGroup);
                    
                    _logger.LogInformation("User {UserId} disconnected from NotificationHub", userId);
                }
                
                await base.OnDisconnectedAsync(exception);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in NotificationHub.OnDisconnectedAsync");
                throw;
            }
        }

        /// <summary>
        /// Join a family notification group to receive notifications for that family
        /// </summary>
        public async Task JoinFamilyNotificationGroup(int familyId)
        {
            try
            {
                if (Context.User == null)
                {
                    throw new UnauthorizedAccessException("User is not authenticated");
                }
                
                int userId = Context.User.GetUserIdAsInt();
                string familyNotificationGroup = $"family-notifications-{familyId}";
                
                // TODO: Add validation to check if user has access to this family
                
                await Groups.AddToGroupAsync(Context.ConnectionId, familyNotificationGroup);
                _logger.LogInformation("User {UserId} joined family notification group {FamilyId}", userId, familyId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error joining family notification group {FamilyId}: {Message}", familyId, ex.Message);
                throw;
            }
        }

        /// <summary>
        /// Leave a family notification group
        /// </summary>
        public async Task LeaveFamilyNotificationGroup(int familyId)
        {
            try
            {
                string familyNotificationGroup = $"family-notifications-{familyId}";
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, familyNotificationGroup);
                
                _logger.LogInformation("Connection {ConnectionId} left family notification group {FamilyId}", 
                    Context.ConnectionId, familyId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error leaving family notification group: {Message}", ex.Message);
                throw;
            }
        }
    }
} 