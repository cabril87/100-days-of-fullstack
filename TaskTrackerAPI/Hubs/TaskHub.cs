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
using TaskTrackerAPI.DTOs.Tasks;
using TaskTrackerAPI.Extensions;

namespace TaskTrackerAPI.Hubs
{
    /// <summary>
    /// SignalR hub for real-time task updates
    /// </summary>
    [Authorize]
    public class TaskHub : Hub
    {
        private readonly ILogger<TaskHub> _logger;

        public TaskHub(ILogger<TaskHub> logger)
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
                    string userGroup = $"user-{userId}";
                    
                    // Add to user-specific group
                    await Groups.AddToGroupAsync(Context.ConnectionId, userGroup);
                    
                    _logger.LogInformation("User {UserId} connected to TaskHub with connection {ConnectionId}", 
                        userId, Context.ConnectionId);
                }
                
                await base.OnConnectedAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in TaskHub.OnConnectedAsync");
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
                    string userGroup = $"user-{userId}";
                    
                    // Remove from user-specific group
                    await Groups.RemoveFromGroupAsync(Context.ConnectionId, userGroup);
                    
                    _logger.LogInformation("User {UserId} disconnected from TaskHub", userId);
                }
                
                await base.OnDisconnectedAsync(exception);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in TaskHub.OnDisconnectedAsync");
                throw;
            }
        }

        /// <summary>
        /// Join a specific board room to receive updates for that board
        /// </summary>
        public async Task JoinBoardRoom(int boardId)
        {
            try
            {
                if (Context.User == null)
                {
                    throw new UnauthorizedAccessException("User is not authenticated");
                }
                
                int userId = Context.User.GetUserIdAsInt();
                string boardRoom = $"board-{boardId}";
                
                // TODO: Add validation to check if user has access to this board
                
                await Groups.AddToGroupAsync(Context.ConnectionId, boardRoom);
                _logger.LogInformation("User {UserId} joined board room {BoardId}", userId, boardId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error joining board room {BoardId}", ex.Message);
                throw;
            }
        }

        /// <summary>
        /// Leave a specific board room
        /// </summary>
        public async Task LeaveBoardRoom(int boardId)
        {
            try
            {
                string boardRoom = $"board-{boardId}";
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, boardRoom);
                
                _logger.LogInformation("Connection {ConnectionId} left board room {BoardId}", 
                    Context.ConnectionId, boardId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error leaving board room: {Message}", ex.Message);
                throw;
            }
        }
    }
} 