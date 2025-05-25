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
    /// SignalR hub for real-time gamification updates
    /// </summary>
    [Authorize]
    public class GamificationHub : Hub
    {
        private readonly ILogger<GamificationHub> _logger;

        public GamificationHub(ILogger<GamificationHub> logger)
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
                    string userGroup = $"user-gamification-{userId}";
                    
                    // Add to user-specific gamification group
                    await Groups.AddToGroupAsync(Context.ConnectionId, userGroup);
                    
                    _logger.LogInformation("User {UserId} connected to GamificationHub with connection {ConnectionId}", 
                        userId, Context.ConnectionId);
                }
                
                await base.OnConnectedAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GamificationHub.OnConnectedAsync");
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
                    string userGroup = $"user-gamification-{userId}";
                    
                    // Remove from user-specific gamification group
                    await Groups.RemoveFromGroupAsync(Context.ConnectionId, userGroup);
                    
                    _logger.LogInformation("User {UserId} disconnected from GamificationHub", userId);
                }
                
                await base.OnDisconnectedAsync(exception);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GamificationHub.OnDisconnectedAsync");
                throw;
            }
        }

        /// <summary>
        /// Join a family gamification group to receive updates for that family
        /// </summary>
        public async Task JoinFamilyGroup(int familyId)
        {
            try
            {
                if (Context.User == null)
                {
                    throw new UnauthorizedAccessException("User is not authenticated");
                }
                
                int userId = Context.User.GetUserIdAsInt();
                string familyGroup = $"family-gamification-{familyId}";
                
                // TODO: Add validation to check if user has access to this family
                
                await Groups.AddToGroupAsync(Context.ConnectionId, familyGroup);
                _logger.LogInformation("User {UserId} joined family gamification group {FamilyId}", userId, familyId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error joining family gamification group {FamilyId}: {Message}", familyId, ex.Message);
                throw;
            }
        }

        /// <summary>
        /// Leave a family gamification group
        /// </summary>
        public async Task LeaveFamilyGroup(int familyId)
        {
            try
            {
                string familyGroup = $"family-gamification-{familyId}";
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, familyGroup);
                
                _logger.LogInformation("Connection {ConnectionId} left family gamification group {FamilyId}", 
                    Context.ConnectionId, familyId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error leaving family gamification group: {Message}", ex.Message);
                throw;
            }
        }

        /// <summary>
        /// Join a user-specific group for targeted updates
        /// </summary>
        public async Task JoinUserGroup(int userId)
        {
            try
            {
                if (Context.User == null)
                {
                    throw new UnauthorizedAccessException("User is not authenticated");
                }
                
                int currentUserId = Context.User.GetUserIdAsInt();
                
                // Only allow users to join their own group
                if (currentUserId != userId)
                {
                    throw new UnauthorizedAccessException("Cannot join another user's group");
                }
                
                string userGroup = $"user-gamification-{userId}";
                await Groups.AddToGroupAsync(Context.ConnectionId, userGroup);
                
                _logger.LogInformation("User {UserId} joined their gamification group", userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error joining user gamification group {UserId}: {Message}", userId, ex.Message);
                throw;
            }
        }

        /// <summary>
        /// Leave a user-specific group
        /// </summary>
        public async Task LeaveUserGroup(int userId)
        {
            try
            {
                string userGroup = $"user-gamification-{userId}";
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, userGroup);
                
                _logger.LogInformation("Connection {ConnectionId} left user gamification group {UserId}", 
                    Context.ConnectionId, userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error leaving user gamification group: {Message}", ex.Message);
                throw;
            }
        }
    }
} 