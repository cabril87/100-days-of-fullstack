using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using TaskTrackerAPI.Services.Interfaces;
using TaskTrackerAPI.DTOs.Boards;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;

namespace TaskTrackerAPI.Hubs
{
    /// <summary>
    /// Enhanced Board Hub for real-time Kanban board updates
    /// Provides live updates for board changes, task movements, WIP limits, and analytics
    /// </summary>
    [Authorize]
    public class EnhancedBoardHub : Hub
    {
        private readonly IBoardService _boardService;
        private readonly IBoardColumnService _boardColumnService;
        private readonly IBoardSettingsService _boardSettingsService;
        private readonly ITaskService _taskService;
        private readonly ILogger<EnhancedBoardHub> _logger;

        public EnhancedBoardHub(
            IBoardService boardService,
            IBoardColumnService boardColumnService,
            IBoardSettingsService boardSettingsService,
            ITaskService taskService,
            ILogger<EnhancedBoardHub> logger)
        {
            _boardService = boardService;
            _boardColumnService = boardColumnService;
            _boardSettingsService = boardSettingsService;
            _taskService = taskService;
            _logger = logger;
        }

        /// <summary>
        /// Join a board room for real-time updates
        /// </summary>
        public async Task JoinBoardAsync(int boardId)
        {
            try
            {
                var userId = GetCurrentUserId();
                
                // Verify user has access to the board
                var board = await _boardService.GetBoardByIdAsync(boardId, userId);
                if (board == null)
                {
                    await Clients.Caller.SendAsync("Error", "Access denied to board");
                    return;
                }

                var groupName = GetBoardGroupName(boardId);
                await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
                
                _logger.LogInformation($"User {userId} joined board {boardId} room");
                
                // Notify others in the room
                await Clients.OthersInGroup(groupName).SendAsync("UserJoined", new
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
                _logger.LogError(ex, $"Error joining board {boardId}");
                await Clients.Caller.SendAsync("Error", "Failed to join board room");
            }
        }

        /// <summary>
        /// Leave a board room
        /// </summary>
        public async Task LeaveBoardAsync(int boardId)
        {
            try
            {
                var userId = GetCurrentUserId();
                var groupName = GetBoardGroupName(boardId);
                
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
                
                _logger.LogInformation($"User {userId} left board {boardId} room");
                
                // Notify others in the room
                await Clients.OthersInGroup(groupName).SendAsync("UserLeft", new
                {
                    UserId = userId,
                    BoardId = boardId,
                    ConnectionId = Context.ConnectionId,
                    LeftAt = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error leaving board {boardId}");
            }
        }

        /// <summary>
        /// Real-time task movement notification
        /// </summary>
        public async Task NotifyTaskMovedAsync(int boardId, int taskId, int fromColumnId, int toColumnId, int newPosition)
        {
            try
            {
                var userId = GetCurrentUserId();
                var groupName = GetBoardGroupName(boardId);
                
                // Get updated task and column information
                var task = await _taskService.GetTaskByIdAsync(taskId, userId);
                var fromColumn = await _boardColumnService.GetColumnByIdAsync(fromColumnId, userId);
                var toColumn = await _boardColumnService.GetColumnByIdAsync(toColumnId, userId);
                
                // Check WIP limits
                var wipStatus = await _boardColumnService.GetWipLimitStatusAsync(toColumnId, userId);
                
                await Clients.OthersInGroup(groupName).SendAsync("TaskMoved", new
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
                    await Clients.Group(groupName).SendAsync("WipLimitViolation", new
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
                _logger.LogError(ex, $"Error notifying task movement: {ex.Message}");
            }
        }

        /// <summary>
        /// Real-time task update notification
        /// </summary>
        public async Task NotifyTaskUpdatedAsync(int boardId, int taskId)
        {
            try
            {
                var userId = GetCurrentUserId();
                var groupName = GetBoardGroupName(boardId);
                
                var task = await _taskService.GetTaskByIdAsync(taskId, userId);
                
                await Clients.OthersInGroup(groupName).SendAsync("TaskUpdated", new
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
                _logger.LogError(ex, $"Error notifying task update: {ex.Message}");
            }
        }

        /// <summary>
        /// Real-time column update notification
        /// </summary>
        public async Task NotifyColumnUpdatedAsync(int boardId, int columnId)
        {
            try
            {
                var userId = GetCurrentUserId();
                var groupName = GetBoardGroupName(boardId);
                
                var column = await _boardColumnService.GetColumnByIdAsync(columnId, userId);
                
                await Clients.OthersInGroup(groupName).SendAsync("ColumnUpdated", new
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
                _logger.LogError(ex, $"Error notifying column update: {ex.Message}");
            }
        }

        /// <summary>
        /// Real-time board settings update notification
        /// </summary>
        public async Task NotifySettingsUpdatedAsync(int boardId)
        {
            try
            {
                var userId = GetCurrentUserId();
                var groupName = GetBoardGroupName(boardId);
                
                var settings = await _boardSettingsService.GetBoardSettingsAsync(boardId, userId);
                
                await Clients.OthersInGroup(groupName).SendAsync("SettingsUpdated", new
                {
                    BoardId = boardId,
                    Settings = settings,
                    UpdatedBy = userId,
                    UpdatedAt = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error notifying settings update: {ex.Message}");
            }
        }

        /// <summary>
        /// Real-time board analytics update
        /// </summary>
        public async Task NotifyAnalyticsUpdatedAsync(int boardId)
        {
            try
            {
                var userId = GetCurrentUserId();
                var groupName = GetBoardGroupName(boardId);
                
                // Get latest WIP status - we'll need to get individual column status
                var columns = await _boardColumnService.GetBoardColumnsAsync(boardId, userId);
                var wipStatuses = new List<WipLimitStatusDTO>();
                
                foreach (var column in columns)
                {
                    var wipStatus = await _boardColumnService.GetWipLimitStatusAsync(column.Id, userId);
                    wipStatuses.Add(wipStatus);
                }
                
                await Clients.Group(groupName).SendAsync("AnalyticsUpdated", new
                {
                    BoardId = boardId,
                    WipStatuses = wipStatuses,
                    UpdatedAt = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error notifying analytics update: {ex.Message}");
            }
        }

        /// <summary>
        /// Send typing indicator for collaborative editing
        /// </summary>
        public async Task NotifyTypingAsync(int boardId, int? taskId, string fieldName)
        {
            try
            {
                var userId = GetCurrentUserId();
                var groupName = GetBoardGroupName(boardId);
                
                await Clients.OthersInGroup(groupName).SendAsync("UserTyping", new
                {
                    BoardId = boardId,
                    TaskId = taskId,
                    FieldName = fieldName,
                    UserId = userId,
                    TypingAt = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error notifying typing: {ex.Message}");
            }
        }

        /// <summary>
        /// Send current board state to a user
        /// </summary>
        private async Task SendBoardStateAsync(int boardId, int userId)
        {
            try
            {
                var board = await _boardService.GetBoardByIdAsync(boardId, userId);
                var columns = await _boardColumnService.GetBoardColumnsAsync(boardId, userId);
                var settings = await _boardSettingsService.GetBoardSettingsAsync(boardId, userId);
                
                // Get WIP statuses for all columns
                var wipStatuses = new List<WipLimitStatusDTO>();
                foreach (var column in columns)
                {
                    var wipStatus = await _boardColumnService.GetWipLimitStatusAsync(column.Id, userId);
                    wipStatuses.Add(wipStatus);
                }
                
                await Clients.Caller.SendAsync("BoardState", new
                {
                    Board = board,
                    Columns = columns,
                    Settings = settings,
                    WipStatuses = wipStatuses,
                    Timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error sending board state: {ex.Message}");
                await Clients.Caller.SendAsync("Error", "Failed to load board state");
            }
        }

        /// <summary>
        /// Handle client disconnection
        /// </summary>
        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            try
            {
                var userId = GetCurrentUserId();
                _logger.LogInformation($"User {userId} disconnected from Enhanced Board Hub");
                
                // Could implement cleanup logic here if needed
                // For example, notify others about user going offline
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error handling disconnection");
            }
            
            await base.OnDisconnectedAsync(exception);
        }

        /// <summary>
        /// Get current user ID from claims
        /// </summary>
        private int GetCurrentUserId()
        {
            var userIdClaim = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdClaim, out var userId) ? userId : 0;
        }

        /// <summary>
        /// Get board group name for SignalR groups
        /// </summary>
        private static string GetBoardGroupName(int boardId) => $"Board_{boardId}";
    }
} 