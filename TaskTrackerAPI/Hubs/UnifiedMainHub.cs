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
using TaskTrackerAPI.Services.Interfaces;
using TaskTrackerAPI.DTOs.Tasks;
using TaskTrackerAPI.DTOs.Boards;
using TaskTrackerAPI.DTOs.Analytics;
using System.Security.Claims;
using System.Collections.Generic;
using TaskTrackerAPI.DTOs.Tags;

namespace TaskTrackerAPI.Hubs
{
    /// <summary>
    /// Unified SignalR hub for real-time updates across all main application features
    /// Consolidates task updates, gamification events, notifications, board changes, and template marketplace
    /// Provides optimized performance with single connection handling multiple event types
    /// </summary>
    [Authorize]
    public class UnifiedMainHub : Hub
    {
        private readonly ILogger<UnifiedMainHub> _logger;
        private readonly IBoardService _boardService;
        private readonly IBoardColumnService _boardColumnService;
        private readonly IBoardSettingsService _boardSettingsService;
        private readonly ITaskService _taskService;
        private readonly IBoardTemplateService _templateService;

        public UnifiedMainHub(
            ILogger<UnifiedMainHub> logger,
            IBoardService boardService,
            IBoardColumnService boardColumnService,
            IBoardSettingsService boardSettingsService,
            ITaskService taskService,
            IBoardTemplateService templateService)
        {
            _logger = logger;
            _boardService = boardService;
            _boardColumnService = boardColumnService;
            _boardSettingsService = boardSettingsService;
            _taskService = taskService;
            _templateService = templateService;
        }

        #region Connection Management

        /// <summary>
        /// Override of OnConnectedAsync to manage unified group membership
        /// Automatically joins user to all relevant groups for comprehensive real-time updates
        /// </summary>
        public override async Task OnConnectedAsync()
        {
            try
            {
                if (Context.User != null)
                {
                    int userId = Context.User.GetUserIdAsInt();
                    
                    // Join all user-specific groups for unified updates
                    await Groups.AddToGroupAsync(Context.ConnectionId, $"user-{userId}");
                    await Groups.AddToGroupAsync(Context.ConnectionId, $"user-gamification-{userId}");
                    await Groups.AddToGroupAsync(Context.ConnectionId, $"user-notifications-{userId}");
                    
                    _logger.LogInformation("User {UserId} connected to UnifiedMainHub with connection {ConnectionId}", 
                        userId, Context.ConnectionId);
                }
                
                await base.OnConnectedAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in UnifiedMainHub.OnConnectedAsync");
                throw;
            }
        }

        /// <summary>
        /// Override of OnDisconnectedAsync to clean up unified group membership
        /// </summary>
        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            try
            {
                if (Context.User?.Identity?.IsAuthenticated == true)
                {
                    int userId = Context.User.GetUserIdAsInt();
                    
                    // Remove from all user-specific groups
                    await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"user-{userId}");
                    await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"user-gamification-{userId}");
                    await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"user-notifications-{userId}");
                    
                    _logger.LogInformation("User {UserId} disconnected from UnifiedMainHub", userId);
                }
                
                await base.OnDisconnectedAsync(exception);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in UnifiedMainHub.OnDisconnectedAsync");
                throw;
            }
        }

        #endregion

        #region Task Management Methods

        /// <summary>
        /// Join a specific board room to receive task and board updates for that board
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
                
                // Verify user has access to the board
                BoardDTO? board = await _boardService.GetBoardByIdAsync(boardId, userId);
                if (board == null)
                {
                    await Clients.Caller.SendAsync("Error", "Access denied to board");
                    return;
                }

                string boardRoom = $"board-{boardId}";
                await Groups.AddToGroupAsync(Context.ConnectionId, boardRoom);
                
                _logger.LogInformation("User {UserId} joined board room {BoardId}", userId, boardId);
                
                // Notify others in the room
                await Clients.OthersInGroup(boardRoom).SendAsync("UserJoinedBoard", new
                {
                    UserId = userId,
                    BoardId = boardId,
                    ConnectionId = Context.ConnectionId,
                    JoinedAt = DateTime.UtcNow
                });

                // Send current board state to the joining user
                await SendBoardStateAsync(boardId, userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error joining board room {BoardId}: {Message}", boardId, ex.Message);
                await Clients.Caller.SendAsync("Error", "Failed to join board room");
            }
        }

        /// <summary>
        /// Leave a specific board room
        /// </summary>
        public async Task LeaveBoardRoom(int boardId)
        {
            try
            {
                int userId = Context.User?.GetUserIdAsInt() ?? 0;
                string boardRoom = $"board-{boardId}";
                
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, boardRoom);
                
                _logger.LogInformation("User {UserId} left board room {BoardId}", userId, boardId);
                
                // Notify others in the room
                await Clients.OthersInGroup(boardRoom).SendAsync("UserLeftBoard", new
                {
                    UserId = userId,
                    BoardId = boardId,
                    ConnectionId = Context.ConnectionId,
                    LeftAt = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error leaving board room {BoardId}: {Message}", boardId, ex.Message);
            }
        }

        #endregion

        #region Board Management Methods

        /// <summary>
        /// Real-time task movement notification with WIP limit checking
        /// </summary>
        public async Task NotifyTaskMoved(int boardId, int taskId, int fromColumnId, int toColumnId, int newPosition)
        {
            try
            {
                int userId = GetCurrentUserId();
                string boardRoom = $"board-{boardId}";
                
                // Get updated task and column information
                TaskItemDTO? task = await _taskService.GetTaskByIdAsync(taskId, userId);
                EnhancedBoardColumnDTO? fromColumn = await _boardColumnService.GetColumnByIdAsync(fromColumnId, userId);
                EnhancedBoardColumnDTO? toColumn = await _boardColumnService.GetColumnByIdAsync(toColumnId, userId);
                
                // Check WIP limits
                WipLimitStatusDTO wipStatus = await _boardColumnService.GetWipLimitStatusAsync(toColumnId, userId);
                
                await Clients.OthersInGroup(boardRoom).SendAsync("TaskMoved", new
                {
                    BoardId = boardId,
                    TaskId = taskId,
                    Task = task,
                    FromColumn = fromColumn,
                    ToColumn = toColumn,
                    NewPosition = newPosition,
                    MovedBy = userId,
                    MovedAt = DateTime.UtcNow,
                    WipStatus = wipStatus
                });

                // Send WIP limit warning if applicable
                if (wipStatus.IsOverLimit)
                {
                    await Clients.Group(boardRoom).SendAsync("WipLimitViolation", new
                    {
                        BoardId = boardId,
                        ColumnId = toColumnId,
                        ColumnName = toColumn?.Name,
                        CurrentCount = wipStatus.CurrentTaskCount,
                        WipLimit = wipStatus.WipLimit,
                        ViolatedAt = DateTime.UtcNow
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error notifying task movement: {Message}", ex.Message);
            }
        }

        /// <summary>
        /// Real-time task update notification
        /// </summary>
        public async Task NotifyTaskUpdated(int boardId, int taskId)
        {
            try
            {
                int userId = GetCurrentUserId();
                string boardRoom = $"board-{boardId}";
                
                TaskItemDTO? task = await _taskService.GetTaskByIdAsync(taskId, userId);
                
                await Clients.OthersInGroup(boardRoom).SendAsync("TaskUpdated", new
                {
                    BoardId = boardId,
                    TaskId = taskId,
                    Task = task,
                    UpdatedBy = userId,
                    UpdatedAt = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error notifying task update: {Message}", ex.Message);
            }
        }

        /// <summary>
        /// Real-time column update notification
        /// </summary>
        public async Task NotifyColumnUpdated(int boardId, int columnId)
        {
            try
            {
                int userId = GetCurrentUserId();
                string boardRoom = $"board-{boardId}";
                
                EnhancedBoardColumnDTO? column = await _boardColumnService.GetColumnByIdAsync(columnId, userId);
                
                await Clients.OthersInGroup(boardRoom).SendAsync("ColumnUpdated", new
                {
                    BoardId = boardId,
                    ColumnId = columnId,
                    Column = column,
                    UpdatedBy = userId,
                    UpdatedAt = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error notifying column update: {Message}", ex.Message);
            }
        }

        #endregion

        #region Gamification Methods

        /// <summary>
        /// Join a family gamification group to receive gamification updates for that family
        /// </summary>
        public async Task JoinFamilyGamificationGroup(int familyId)
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
        public async Task LeaveFamilyGamificationGroup(int familyId)
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

        #endregion

        #region Notification Methods

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

        #endregion

        #region Template Marketplace Methods

        /// <summary>
        /// Join the template marketplace for real-time updates
        /// </summary>
        public async Task JoinTemplateMarketplace()
        {
            try
            {
                int userId = GetCurrentUserId();
                const string marketplaceGroup = "TemplateMarketplace";
                
                await Groups.AddToGroupAsync(Context.ConnectionId, marketplaceGroup);
                
                _logger.LogInformation("User {UserId} joined template marketplace", userId);
                
                // Send current marketplace statistics
                await SendMarketplaceStatsAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error joining template marketplace: {Message}", ex.Message);
                await Clients.Caller.SendAsync("Error", "Failed to join marketplace");
            }
        }

        /// <summary>
        /// Leave the template marketplace
        /// </summary>
        public async Task LeaveTemplateMarketplace()
        {
            try
            {
                int userId = GetCurrentUserId();
                const string marketplaceGroup = "TemplateMarketplace";
                
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, marketplaceGroup);
                
                _logger.LogInformation("User {UserId} left template marketplace", userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error leaving template marketplace: {Message}", ex.Message);
            }
        }

        /// <summary>
        /// Notify when a new template is published to the marketplace
        /// </summary>
        public async Task NotifyTemplatePublished(int templateId)
        {
            try
            {
                int userId = GetCurrentUserId();
                BoardTemplateDTO? template = await _templateService.GetTemplateByIdAsync(templateId, userId);
                const string marketplaceGroup = "TemplateMarketplace";
                
                if (template != null && template.IsPublic)
                {
                    await Clients.Group(marketplaceGroup).SendAsync("TemplatePublished", new
                    {
                        Template = template,
                        PublishedBy = userId,
                        PublishedAt = DateTime.UtcNow
                    });

                    _logger.LogInformation("Template {TemplateId} published by user {UserId}", templateId, userId);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error notifying template publication: {Message}", ex.Message);
            }
        }

        #endregion

        #region Private Helper Methods

        /// <summary>
        /// Send current board state to a user
        /// </summary>
        private async Task SendBoardStateAsync(int boardId, int userId)
        {
            try
            {
                BoardDTO? board = await _boardService.GetBoardByIdAsync(boardId, userId);
                IEnumerable<EnhancedBoardColumnDTO> columns = await _boardColumnService.GetBoardColumnsAsync(boardId, userId);
                BoardSettingsDTO? settings = await _boardSettingsService.GetBoardSettingsAsync(boardId, userId);
                
                await Clients.Caller.SendAsync("BoardState", new
                {
                    BoardId = boardId,
                    Board = board,
                    Columns = columns,
                    Settings = settings,
                    Timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending board state: {Message}", ex.Message);
                await Clients.Caller.SendAsync("Error", "Failed to load board state");
            }
        }

        /// <summary>
        /// Send current marketplace statistics to a user
        /// </summary>
        private async Task SendMarketplaceStatsAsync()
        {
            try
            {
                int userId = GetCurrentUserId();
                TemplateMarketplaceAnalyticsDTO stats = await _templateService.GetMarketplaceAnalyticsAsync(userId);
                
                await Clients.Caller.SendAsync("MarketplaceStats", new
                {
                    Stats = stats,
                    Timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending marketplace stats: {Message}", ex.Message);
                await Clients.Caller.SendAsync("Error", "Failed to load marketplace statistics");
            }
        }

        /// <summary>
        /// Get current user ID from claims
        /// </summary>
        private int GetCurrentUserId()
        {
            string? userIdClaim = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdClaim, out var userId) ? userId : 0;
        }

        #endregion
    }
} 