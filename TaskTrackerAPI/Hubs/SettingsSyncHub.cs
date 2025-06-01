using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using TaskTrackerAPI.Services.Interfaces;
using TaskTrackerAPI.DTOs.Boards;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using System;

namespace TaskTrackerAPI.Hubs
{
    /// <summary>
    /// Settings Sync Hub for real-time board settings synchronization
    /// Provides live synchronization of board settings across multiple user sessions
    /// </summary>
    [Authorize]
    public class SettingsSyncHub : Hub
    {
        private readonly IBoardSettingsService _settingsService;
        private readonly IBoardService _boardService;
        private readonly ILogger<SettingsSyncHub> _logger;

        public SettingsSyncHub(
            IBoardSettingsService settingsService,
            IBoardService boardService,
            ILogger<SettingsSyncHub> logger)
        {
            _settingsService = settingsService;
            _boardService = boardService;
            _logger = logger;
        }

        /// <summary>
        /// Join settings sync for a specific board
        /// </summary>
        public async Task JoinBoardSettingsAsync(int boardId)
        {
            try
            {
                var userId = GetCurrentUserId();
                
                // Verify user has access to the board
                var board = await _boardService.GetBoardByIdAsync(boardId, userId);
                if (board == null)
                {
                    await Clients.Caller.SendAsync("Error", "Access denied to board settings");
                    return;
                }

                var groupName = GetSettingsGroupName(boardId);
                await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
                
                _logger.LogInformation($"User {userId} joined settings sync for board {boardId}");
                
                // Send current settings state
                await SendCurrentSettingsAsync(boardId, userId);
                
                // Notify others about user joining
                await Clients.OthersInGroup(groupName).SendAsync("UserJoinedSettings", new
                {
                    UserId = userId,
                    BoardId = boardId,
                    JoinedAt = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error joining settings sync for board {boardId}");
                await Clients.Caller.SendAsync("Error", "Failed to join settings sync");
            }
        }

        /// <summary>
        /// Leave settings sync for a specific board
        /// </summary>
        public async Task LeaveBoardSettingsAsync(int boardId)
        {
            try
            {
                var userId = GetCurrentUserId();
                var groupName = GetSettingsGroupName(boardId);
                
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
                
                _logger.LogInformation($"User {userId} left settings sync for board {boardId}");
                
                // Notify others about user leaving
                await Clients.OthersInGroup(groupName).SendAsync("UserLeftSettings", new
                {
                    UserId = userId,
                    BoardId = boardId,
                    LeftAt = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error leaving settings sync for board {boardId}");
            }
        }

        /// <summary>
        /// Sync a specific setting change
        /// </summary>
        public async Task SyncSettingChangeAsync(int boardId, string settingName, object value)
        {
            try
            {
                var userId = GetCurrentUserId();
                var groupName = GetSettingsGroupName(boardId);
                
                // Broadcast the setting change to all other users
                await Clients.OthersInGroup(groupName).SendAsync("SettingChanged", new
                {
                    BoardId = boardId,
                    SettingName = settingName,
                    Value = value,
                    ChangedBy = userId,
                    ChangedAt = DateTime.UtcNow
                });
                
                _logger.LogInformation($"Setting {settingName} changed for board {boardId} by user {userId}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error syncing setting change: {ex.Message}");
            }
        }

        /// <summary>
        /// Sync complete settings update
        /// </summary>
        public async Task SyncSettingsUpdateAsync(int boardId, UpdateBoardSettingsDTO settings)
        {
            try
            {
                var userId = GetCurrentUserId();
                var groupName = GetSettingsGroupName(boardId);
                
                // Get the updated settings from the database
                var updatedSettings = await _settingsService.GetBoardSettingsAsync(boardId, userId);
                
                // Broadcast the complete settings update
                await Clients.OthersInGroup(groupName).SendAsync("SettingsUpdated", new
                {
                    BoardId = boardId,
                    Settings = updatedSettings,
                    UpdatedBy = userId,
                    UpdatedAt = DateTime.UtcNow
                });
                
                _logger.LogInformation($"Settings updated for board {boardId} by user {userId}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error syncing settings update: {ex.Message}");
            }
        }

        /// <summary>
        /// Sync settings reset to defaults
        /// </summary>
        public async Task SyncSettingsResetAsync(int boardId)
        {
            try
            {
                var userId = GetCurrentUserId();
                var groupName = GetSettingsGroupName(boardId);
                
                // Get the reset settings
                var resetSettings = await _settingsService.GetBoardSettingsAsync(boardId, userId);
                
                // Broadcast the settings reset
                await Clients.OthersInGroup(groupName).SendAsync("SettingsReset", new
                {
                    BoardId = boardId,
                    Settings = resetSettings,
                    ResetBy = userId,
                    ResetAt = DateTime.UtcNow
                });
                
                _logger.LogInformation($"Settings reset for board {boardId} by user {userId}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error syncing settings reset: {ex.Message}");
            }
        }

        /// <summary>
        /// Sync settings import
        /// </summary>
        public async Task SyncSettingsImportAsync(int boardId)
        {
            try
            {
                var userId = GetCurrentUserId();
                var groupName = GetSettingsGroupName(boardId);
                
                // Get the imported settings
                var importedSettings = await _settingsService.GetBoardSettingsAsync(boardId, userId);
                
                // Broadcast the settings import
                await Clients.OthersInGroup(groupName).SendAsync("SettingsImported", new
                {
                    BoardId = boardId,
                    Settings = importedSettings,
                    ImportedBy = userId,
                    ImportedAt = DateTime.UtcNow
                });
                
                _logger.LogInformation($"Settings imported for board {boardId} by user {userId}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error syncing settings import: {ex.Message}");
            }
        }

        /// <summary>
        /// Request current settings state
        /// </summary>
        public async Task RequestSettingsStateAsync(int boardId)
        {
            try
            {
                var userId = GetCurrentUserId();
                await SendCurrentSettingsAsync(boardId, userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error requesting settings state: {ex.Message}");
                await Clients.Caller.SendAsync("Error", "Failed to get settings state");
            }
        }

        /// <summary>
        /// Validate settings before applying
        /// </summary>
        public async Task ValidateSettingsAsync(int boardId, UpdateBoardSettingsDTO settings)
        {
            try
            {
                var userId = GetCurrentUserId();
                var validationResult = await _settingsService.ValidateSettingsAsync(settings, userId);
                
                await Clients.Caller.SendAsync("SettingsValidation", new
                {
                    BoardId = boardId,
                    ValidationResult = validationResult,
                    ValidatedAt = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error validating settings: {ex.Message}");
                await Clients.Caller.SendAsync("Error", "Settings validation failed");
            }
        }

        /// <summary>
        /// Sync theme change specifically (for immediate visual updates)
        /// </summary>
        public async Task SyncThemeChangeAsync(int boardId, string theme)
        {
            try
            {
                var userId = GetCurrentUserId();
                var groupName = GetSettingsGroupName(boardId);
                
                await Clients.OthersInGroup(groupName).SendAsync("ThemeChanged", new
                {
                    BoardId = boardId,
                    Theme = theme,
                    ChangedBy = userId,
                    ChangedAt = DateTime.UtcNow
                });
                
                _logger.LogInformation($"Theme changed to {theme} for board {boardId} by user {userId}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error syncing theme change: {ex.Message}");
            }
        }

        /// <summary>
        /// Send current settings state to a user
        /// </summary>
        private async Task SendCurrentSettingsAsync(int boardId, int userId)
        {
            try
            {
                var settings = await _settingsService.GetBoardSettingsAsync(boardId, userId);
                
                await Clients.Caller.SendAsync("CurrentSettings", new
                {
                    BoardId = boardId,
                    Settings = settings,
                    Timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error sending current settings: {ex.Message}");
                await Clients.Caller.SendAsync("Error", "Failed to load current settings");
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
                _logger.LogInformation($"User {userId} disconnected from Settings Sync Hub");
                
                // Could implement cleanup logic here if needed
                // For example, save any pending changes or notify others
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
        /// Get settings group name for SignalR groups
        /// </summary>
        private static string GetSettingsGroupName(int boardId) => $"BoardSettings_{boardId}";
    }
} 