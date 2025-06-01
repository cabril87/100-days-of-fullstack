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
using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.DTOs.Boards;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories.Interfaces;
using TaskTrackerAPI.Services.Interfaces;

namespace TaskTrackerAPI.Services;

/// <summary>
/// Service implementation for board settings business logic
/// Uses explicit typing and comprehensive settings management
/// </summary>
public class BoardSettingsService : IBoardSettingsService
{
    private readonly IBoardSettingsRepository _boardSettingsRepository;
    private readonly IBoardRepository _boardRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<BoardSettingsService> _logger;

    public BoardSettingsService(
        IBoardSettingsRepository boardSettingsRepository,
        IBoardRepository boardRepository,
        IMapper mapper,
        ILogger<BoardSettingsService> logger)
    {
        _boardSettingsRepository = boardSettingsRepository ?? throw new ArgumentNullException(nameof(boardSettingsRepository));
        _boardRepository = boardRepository ?? throw new ArgumentNullException(nameof(boardRepository));
        _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <inheritdoc />
    public async Task<BoardSettingsDTO?> GetBoardSettingsAsync(int boardId, int userId)
    {
        try
        {
            _logger.LogInformation("Getting board settings for board {BoardId} by user {UserId}", boardId, userId);

            // Verify user has access to board
            await ValidateBoardAccessAsync(boardId, userId);

            BoardSettings? settings = await _boardSettingsRepository.GetSettingsByBoardIdAsync(boardId);
            if (settings == null)
            {
                _logger.LogInformation("No settings found for board {BoardId}, creating default settings", boardId);
                settings = await _boardSettingsRepository.CreateDefaultSettingsAsync(boardId);
            }

            BoardSettingsDTO dto = _mapper.Map<BoardSettingsDTO>(settings);

            _logger.LogInformation("Retrieved board settings {SettingsId} for board {BoardId}", settings.Id, boardId);
            return dto;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting board settings for board {BoardId} by user {UserId}", boardId, userId);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<BoardSettingsDTO> UpdateBoardSettingsAsync(int boardId, UpdateBoardSettingsDTO updateDto, int userId)
    {
        try
        {
            _logger.LogInformation("Updating board settings for board {BoardId} by user {UserId}", boardId, userId);

            // Verify user has access to board
            await ValidateBoardAccessAsync(boardId, userId);

            // Validate the settings
            SettingsValidationResultDTO validation = await ValidateSettingsAsync(updateDto, userId);
            if (!validation.IsValid)
            {
                string errors = string.Join(", ", validation.Errors);
                throw new InvalidOperationException($"Invalid settings: {errors}");
            }

            BoardSettings? existingSettings = await _boardSettingsRepository.GetSettingsByBoardIdAsync(boardId);
            if (existingSettings == null)
            {
                _logger.LogInformation("No existing settings found for board {BoardId}, creating defaults first", boardId);
                existingSettings = await _boardSettingsRepository.CreateDefaultSettingsAsync(boardId);
            }

            // Update properties
            if (updateDto.EnableWipLimits.HasValue)
                existingSettings.EnableWipLimits = updateDto.EnableWipLimits.Value;
            
            if (updateDto.ShowSubtasks.HasValue)
                existingSettings.ShowSubtasks = updateDto.ShowSubtasks.Value;
            
            if (updateDto.EnableSwimLanes.HasValue)
                existingSettings.EnableSwimLanes = updateDto.EnableSwimLanes.Value;
            
            if (!string.IsNullOrWhiteSpace(updateDto.DefaultTaskView))
                existingSettings.DefaultTaskView = updateDto.DefaultTaskView;
            
            if (updateDto.EnableDragDrop.HasValue)
                existingSettings.EnableDragDrop = updateDto.EnableDragDrop.Value;
            
            if (updateDto.ShowTaskIds.HasValue)
                existingSettings.ShowTaskIds = updateDto.ShowTaskIds.Value;
            
            if (updateDto.EnableTaskTimer.HasValue)
                existingSettings.EnableTaskTimer = updateDto.EnableTaskTimer.Value;
            
            if (updateDto.ShowProgressBars.HasValue)
                existingSettings.ShowProgressBars = updateDto.ShowProgressBars.Value;
            
            if (updateDto.ShowAvatars.HasValue)
                existingSettings.ShowAvatars = updateDto.ShowAvatars.Value;
            
            if (updateDto.ShowDueDates.HasValue)
                existingSettings.ShowDueDates = updateDto.ShowDueDates.Value;
            
            if (updateDto.ShowPriority.HasValue)
                existingSettings.ShowPriority = updateDto.ShowPriority.Value;
            
            if (updateDto.ShowCategories.HasValue)
                existingSettings.ShowCategories = updateDto.ShowCategories.Value;
            
            if (updateDto.AutoRefresh.HasValue)
                existingSettings.AutoRefresh = updateDto.AutoRefresh.Value;
            
            if (updateDto.AutoRefreshInterval.HasValue)
                existingSettings.AutoRefreshInterval = updateDto.AutoRefreshInterval.Value;
            
            if (updateDto.EnableRealTimeCollaboration.HasValue)
                existingSettings.EnableRealTimeCollaboration = updateDto.EnableRealTimeCollaboration.Value;
            
            if (updateDto.ShowNotifications.HasValue)
                existingSettings.ShowNotifications = updateDto.ShowNotifications.Value;
            
            if (updateDto.EnableKeyboardShortcuts.HasValue)
                existingSettings.EnableKeyboardShortcuts = updateDto.EnableKeyboardShortcuts.Value;
            
            if (!string.IsNullOrWhiteSpace(updateDto.Theme))
                existingSettings.Theme = updateDto.Theme;
            
            if (updateDto.CustomThemeConfig != null)
                existingSettings.CustomThemeConfig = updateDto.CustomThemeConfig;
            
            if (updateDto.SwimLaneGroupBy != null)
                existingSettings.SwimLaneGroupBy = updateDto.SwimLaneGroupBy;
            
            if (!string.IsNullOrWhiteSpace(updateDto.DefaultSortBy))
                existingSettings.DefaultSortBy = updateDto.DefaultSortBy;
            
            if (!string.IsNullOrWhiteSpace(updateDto.DefaultSortDirection))
                existingSettings.DefaultSortDirection = updateDto.DefaultSortDirection;
            
            if (updateDto.ShowColumnCounts.HasValue)
                existingSettings.ShowColumnCounts = updateDto.ShowColumnCounts.Value;
            
            if (updateDto.ShowBoardStats.HasValue)
                existingSettings.ShowBoardStats = updateDto.ShowBoardStats.Value;
            
            if (updateDto.EnableGamification.HasValue)
                existingSettings.EnableGamification = updateDto.EnableGamification.Value;
            
            if (updateDto.IsArchived.HasValue)
                existingSettings.IsArchived = updateDto.IsArchived.Value;

            BoardSettings updatedSettings = await _boardSettingsRepository.UpdateSettingsAsync(existingSettings);
            BoardSettingsDTO dto = _mapper.Map<BoardSettingsDTO>(updatedSettings);

            _logger.LogInformation("Successfully updated board settings {SettingsId} for board {BoardId}", 
                updatedSettings.Id, boardId);

            return dto;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating board settings for board {BoardId} by user {UserId}", boardId, userId);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<BoardSettingsDTO> CreateDefaultSettingsAsync(int boardId, int userId)
    {
        try
        {
            _logger.LogInformation("Creating default settings for board {BoardId} by user {UserId}", boardId, userId);

            // Verify user has access to board
            await ValidateBoardAccessAsync(boardId, userId);

            // Check if settings already exist
            bool exists = await _boardSettingsRepository.SettingsExistAsync(boardId);
            if (exists)
            {
                _logger.LogWarning("Settings already exist for board {BoardId}, retrieving existing settings", boardId);
                BoardSettings? existingSettings = await _boardSettingsRepository.GetSettingsByBoardIdAsync(boardId);
                return _mapper.Map<BoardSettingsDTO>(existingSettings!);
            }

            BoardSettings defaultSettings = await _boardSettingsRepository.CreateDefaultSettingsAsync(boardId);
            BoardSettingsDTO dto = _mapper.Map<BoardSettingsDTO>(defaultSettings);

            _logger.LogInformation("Successfully created default settings {SettingsId} for board {BoardId}", 
                defaultSettings.Id, boardId);

            return dto;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating default settings for board {BoardId} by user {UserId}", boardId, userId);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<BoardSettingsDTO> ResetToDefaultsAsync(int boardId, int userId)
    {
        try
        {
            _logger.LogInformation("Resetting board settings to defaults for board {BoardId} by user {UserId}", boardId, userId);

            // Verify user has access to board
            await ValidateBoardAccessAsync(boardId, userId);

            BoardSettings resetSettings = await _boardSettingsRepository.ResetToDefaultsAsync(boardId);
            BoardSettingsDTO dto = _mapper.Map<BoardSettingsDTO>(resetSettings);

            _logger.LogInformation("Successfully reset board settings {SettingsId} to defaults for board {BoardId}", 
                resetSettings.Id, boardId);

            return dto;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error resetting board settings to defaults for board {BoardId} by user {UserId}", boardId, userId);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<bool> HasCustomSettingsAsync(int boardId, int userId)
    {
        try
        {
            _logger.LogInformation("Checking if board {BoardId} has custom settings by user {UserId}", boardId, userId);

            // Verify user has access to board
            await ValidateBoardAccessAsync(boardId, userId);

            BoardSettings? settings = await _boardSettingsRepository.GetSettingsByBoardIdAsync(boardId);
            if (settings == null)
            {
                return false;
            }

            // Create default settings to compare
            BoardSettings defaultSettings = new BoardSettings
            {
                EnableWipLimits = false,
                ShowSubtasks = true,
                EnableSwimLanes = false,
                DefaultTaskView = "detailed",
                EnableDragDrop = true,
                ShowTaskIds = false,
                EnableTaskTimer = true,
                ShowProgressBars = true,
                ShowAvatars = true,
                ShowDueDates = true,
                ShowPriority = true,
                ShowCategories = true,
                AutoRefresh = true,
                AutoRefreshInterval = 30,
                EnableRealTimeCollaboration = true,
                ShowNotifications = true,
                EnableKeyboardShortcuts = true,
                Theme = "auto",
                DefaultSortBy = "created",
                DefaultSortDirection = "desc",
                ShowColumnCounts = true,
                ShowBoardStats = true,
                EnableGamification = true,
                IsArchived = false
            };

            // Compare key settings (ignoring timestamps and IDs)
            bool isCustom = settings.EnableWipLimits != defaultSettings.EnableWipLimits ||
                           settings.ShowSubtasks != defaultSettings.ShowSubtasks ||
                           settings.EnableSwimLanes != defaultSettings.EnableSwimLanes ||
                           settings.DefaultTaskView != defaultSettings.DefaultTaskView ||
                           settings.EnableDragDrop != defaultSettings.EnableDragDrop ||
                           settings.ShowTaskIds != defaultSettings.ShowTaskIds ||
                           settings.EnableTaskTimer != defaultSettings.EnableTaskTimer ||
                           settings.ShowProgressBars != defaultSettings.ShowProgressBars ||
                           settings.ShowAvatars != defaultSettings.ShowAvatars ||
                           settings.ShowDueDates != defaultSettings.ShowDueDates ||
                           settings.ShowPriority != defaultSettings.ShowPriority ||
                           settings.ShowCategories != defaultSettings.ShowCategories ||
                           settings.AutoRefresh != defaultSettings.AutoRefresh ||
                           settings.AutoRefreshInterval != defaultSettings.AutoRefreshInterval ||
                           settings.EnableRealTimeCollaboration != defaultSettings.EnableRealTimeCollaboration ||
                           settings.ShowNotifications != defaultSettings.ShowNotifications ||
                           settings.EnableKeyboardShortcuts != defaultSettings.EnableKeyboardShortcuts ||
                           settings.Theme != defaultSettings.Theme ||
                           settings.DefaultSortBy != defaultSettings.DefaultSortBy ||
                           settings.DefaultSortDirection != defaultSettings.DefaultSortDirection ||
                           settings.ShowColumnCounts != defaultSettings.ShowColumnCounts ||
                           settings.ShowBoardStats != defaultSettings.ShowBoardStats ||
                           settings.EnableGamification != defaultSettings.EnableGamification ||
                           !string.IsNullOrEmpty(settings.CustomThemeConfig) ||
                           !string.IsNullOrEmpty(settings.SwimLaneGroupBy);

            _logger.LogInformation("Board {BoardId} has custom settings: {HasCustom}", boardId, isCustom);
            return isCustom;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking custom settings for board {BoardId} by user {UserId}", boardId, userId);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<IEnumerable<BoardSettingsDTO>> GetGamifiedBoardSettingsAsync(int userId)
    {
        try
        {
            _logger.LogInformation("Getting gamified board settings for user {UserId}", userId);

            IEnumerable<BoardSettings> gamifiedSettings = await _boardSettingsRepository.GetGamifiedBoardSettingsAsync(userId);
            List<BoardSettingsDTO> settingsDtos = new List<BoardSettingsDTO>();

            foreach (BoardSettings settings in gamifiedSettings)
            {
                BoardSettingsDTO dto = _mapper.Map<BoardSettingsDTO>(settings);
                settingsDtos.Add(dto);
            }

            _logger.LogInformation("Retrieved {Count} gamified board settings for user {UserId}", 
                settingsDtos.Count, userId);

            return settingsDtos;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting gamified board settings for user {UserId}", userId);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<IEnumerable<BoardSettingsDTO>> GetSettingsByThemeAsync(int userId, string theme)
    {
        try
        {
            _logger.LogInformation("Getting board settings with theme {Theme} for user {UserId}", theme, userId);

            IEnumerable<BoardSettings> themeSettings = await _boardSettingsRepository.GetSettingsByThemeAsync(userId, theme);
            List<BoardSettingsDTO> settingsDtos = new List<BoardSettingsDTO>();

            foreach (BoardSettings settings in themeSettings)
            {
                BoardSettingsDTO dto = _mapper.Map<BoardSettingsDTO>(settings);
                settingsDtos.Add(dto);
            }

            _logger.LogInformation("Retrieved {Count} board settings with theme {Theme} for user {UserId}", 
                settingsDtos.Count, theme, userId);

            return settingsDtos;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting board settings with theme {Theme} for user {UserId}", theme, userId);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<IEnumerable<BoardSettingsDTO>> GetArchivedSettingsAsync(int userId)
    {
        try
        {
            _logger.LogInformation("Getting archived board settings for user {UserId}", userId);

            IEnumerable<BoardSettings> archivedSettings = await _boardSettingsRepository.GetArchivedSettingsAsync(userId);
            List<BoardSettingsDTO> settingsDtos = new List<BoardSettingsDTO>();

            foreach (BoardSettings settings in archivedSettings)
            {
                BoardSettingsDTO dto = _mapper.Map<BoardSettingsDTO>(settings);
                settingsDtos.Add(dto);
            }

            _logger.LogInformation("Retrieved {Count} archived board settings for user {UserId}", 
                settingsDtos.Count, userId);

            return settingsDtos;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting archived board settings for user {UserId}", userId);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<string> ExportSettingsAsync(int boardId, int userId)
    {
        try
        {
            _logger.LogInformation("Exporting board settings for board {BoardId} by user {UserId}", boardId, userId);

            // Verify user has access to board
            await ValidateBoardAccessAsync(boardId, userId);

            BoardSettings? settings = await _boardSettingsRepository.GetSettingsByBoardIdAsync(boardId);
            if (settings == null)
            {
                throw new InvalidOperationException($"No settings found for board {boardId}");
            }

            // Create export object (exclude sensitive data)
            object exportObject = new
            {
                settings.EnableWipLimits,
                settings.ShowSubtasks,
                settings.EnableSwimLanes,
                settings.DefaultTaskView,
                settings.EnableDragDrop,
                settings.ShowTaskIds,
                settings.EnableTaskTimer,
                settings.ShowProgressBars,
                settings.ShowAvatars,
                settings.ShowDueDates,
                settings.ShowPriority,
                settings.ShowCategories,
                settings.AutoRefresh,
                settings.AutoRefreshInterval,
                settings.EnableRealTimeCollaboration,
                settings.ShowNotifications,
                settings.EnableKeyboardShortcuts,
                settings.Theme,
                settings.CustomThemeConfig,
                settings.SwimLaneGroupBy,
                settings.DefaultSortBy,
                settings.DefaultSortDirection,
                settings.ShowColumnCounts,
                settings.ShowBoardStats,
                settings.EnableGamification,
                ExportedAt = DateTime.UtcNow,
                Version = "1.0"
            };

            string json = JsonSerializer.Serialize(exportObject, new JsonSerializerOptions 
            { 
                WriteIndented = true 
            });

            _logger.LogInformation("Successfully exported board settings for board {BoardId}", boardId);
            return json;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting board settings for board {BoardId} by user {UserId}", boardId, userId);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<BoardSettingsDTO> ImportSettingsAsync(int boardId, string settingsJson, int userId)
    {
        try
        {
            _logger.LogInformation("Importing board settings for board {BoardId} by user {UserId}", boardId, userId);

            // Verify user has access to board
            await ValidateBoardAccessAsync(boardId, userId);

            // Parse JSON
            JsonDocument jsonDoc = JsonDocument.Parse(settingsJson);
            JsonElement root = jsonDoc.RootElement;

            // Create update DTO from JSON
            UpdateBoardSettingsDTO updateDto = new UpdateBoardSettingsDTO();

            if (root.TryGetProperty("EnableWipLimits", out JsonElement enableWipLimits))
                updateDto.EnableWipLimits = enableWipLimits.GetBoolean();
            
            if (root.TryGetProperty("ShowSubtasks", out JsonElement showSubtasks))
                updateDto.ShowSubtasks = showSubtasks.GetBoolean();
            
            if (root.TryGetProperty("EnableSwimLanes", out JsonElement enableSwimLanes))
                updateDto.EnableSwimLanes = enableSwimLanes.GetBoolean();
            
            if (root.TryGetProperty("DefaultTaskView", out JsonElement defaultTaskView))
                updateDto.DefaultTaskView = defaultTaskView.GetString();
            
            if (root.TryGetProperty("EnableDragDrop", out JsonElement enableDragDrop))
                updateDto.EnableDragDrop = enableDragDrop.GetBoolean();
            
            if (root.TryGetProperty("ShowTaskIds", out JsonElement showTaskIds))
                updateDto.ShowTaskIds = showTaskIds.GetBoolean();
            
            if (root.TryGetProperty("EnableTaskTimer", out JsonElement enableTaskTimer))
                updateDto.EnableTaskTimer = enableTaskTimer.GetBoolean();
            
            if (root.TryGetProperty("ShowProgressBars", out JsonElement showProgressBars))
                updateDto.ShowProgressBars = showProgressBars.GetBoolean();
            
            if (root.TryGetProperty("ShowAvatars", out JsonElement showAvatars))
                updateDto.ShowAvatars = showAvatars.GetBoolean();
            
            if (root.TryGetProperty("ShowDueDates", out JsonElement showDueDates))
                updateDto.ShowDueDates = showDueDates.GetBoolean();
            
            if (root.TryGetProperty("ShowPriority", out JsonElement showPriority))
                updateDto.ShowPriority = showPriority.GetBoolean();
            
            if (root.TryGetProperty("ShowCategories", out JsonElement showCategories))
                updateDto.ShowCategories = showCategories.GetBoolean();
            
            if (root.TryGetProperty("AutoRefresh", out JsonElement autoRefresh))
                updateDto.AutoRefresh = autoRefresh.GetBoolean();
            
            if (root.TryGetProperty("AutoRefreshInterval", out JsonElement autoRefreshInterval))
                updateDto.AutoRefreshInterval = autoRefreshInterval.GetInt32();
            
            if (root.TryGetProperty("EnableRealTimeCollaboration", out JsonElement enableRealTimeCollaboration))
                updateDto.EnableRealTimeCollaboration = enableRealTimeCollaboration.GetBoolean();
            
            if (root.TryGetProperty("ShowNotifications", out JsonElement showNotifications))
                updateDto.ShowNotifications = showNotifications.GetBoolean();
            
            if (root.TryGetProperty("EnableKeyboardShortcuts", out JsonElement enableKeyboardShortcuts))
                updateDto.EnableKeyboardShortcuts = enableKeyboardShortcuts.GetBoolean();
            
            if (root.TryGetProperty("Theme", out JsonElement theme))
                updateDto.Theme = theme.GetString();
            
            if (root.TryGetProperty("CustomThemeConfig", out JsonElement customThemeConfig))
                updateDto.CustomThemeConfig = customThemeConfig.GetString();
            
            if (root.TryGetProperty("SwimLaneGroupBy", out JsonElement swimLaneGroupBy))
                updateDto.SwimLaneGroupBy = swimLaneGroupBy.GetString();
            
            if (root.TryGetProperty("DefaultSortBy", out JsonElement defaultSortBy))
                updateDto.DefaultSortBy = defaultSortBy.GetString();
            
            if (root.TryGetProperty("DefaultSortDirection", out JsonElement defaultSortDirection))
                updateDto.DefaultSortDirection = defaultSortDirection.GetString();
            
            if (root.TryGetProperty("ShowColumnCounts", out JsonElement showColumnCounts))
                updateDto.ShowColumnCounts = showColumnCounts.GetBoolean();
            
            if (root.TryGetProperty("ShowBoardStats", out JsonElement showBoardStats))
                updateDto.ShowBoardStats = showBoardStats.GetBoolean();
            
            if (root.TryGetProperty("EnableGamification", out JsonElement enableGamification))
                updateDto.EnableGamification = enableGamification.GetBoolean();

            // Update settings using the existing method
            BoardSettingsDTO result = await UpdateBoardSettingsAsync(boardId, updateDto, userId);

            _logger.LogInformation("Successfully imported board settings for board {BoardId}", boardId);
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error importing board settings for board {BoardId} by user {UserId}", boardId, userId);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<BoardSettingsDTO> CopySettingsAsync(int sourceBoardId, int targetBoardId, int userId)
    {
        try
        {
            _logger.LogInformation("Copying settings from board {SourceBoardId} to board {TargetBoardId} by user {UserId}", 
                sourceBoardId, targetBoardId, userId);

            // Verify user has access to both boards
            await ValidateBoardAccessAsync(sourceBoardId, userId);
            await ValidateBoardAccessAsync(targetBoardId, userId);

            BoardSettings? sourceSettings = await _boardSettingsRepository.GetSettingsByBoardIdAsync(sourceBoardId);
            if (sourceSettings == null)
            {
                throw new InvalidOperationException($"No settings found for source board {sourceBoardId}");
            }

            // Create update DTO from source settings
            UpdateBoardSettingsDTO updateDto = new UpdateBoardSettingsDTO
            {
                EnableWipLimits = sourceSettings.EnableWipLimits,
                ShowSubtasks = sourceSettings.ShowSubtasks,
                EnableSwimLanes = sourceSettings.EnableSwimLanes,
                DefaultTaskView = sourceSettings.DefaultTaskView,
                EnableDragDrop = sourceSettings.EnableDragDrop,
                ShowTaskIds = sourceSettings.ShowTaskIds,
                EnableTaskTimer = sourceSettings.EnableTaskTimer,
                ShowProgressBars = sourceSettings.ShowProgressBars,
                ShowAvatars = sourceSettings.ShowAvatars,
                ShowDueDates = sourceSettings.ShowDueDates,
                ShowPriority = sourceSettings.ShowPriority,
                ShowCategories = sourceSettings.ShowCategories,
                AutoRefresh = sourceSettings.AutoRefresh,
                AutoRefreshInterval = sourceSettings.AutoRefreshInterval,
                EnableRealTimeCollaboration = sourceSettings.EnableRealTimeCollaboration,
                ShowNotifications = sourceSettings.ShowNotifications,
                EnableKeyboardShortcuts = sourceSettings.EnableKeyboardShortcuts,
                Theme = sourceSettings.Theme,
                CustomThemeConfig = sourceSettings.CustomThemeConfig,
                SwimLaneGroupBy = sourceSettings.SwimLaneGroupBy,
                DefaultSortBy = sourceSettings.DefaultSortBy,
                DefaultSortDirection = sourceSettings.DefaultSortDirection,
                ShowColumnCounts = sourceSettings.ShowColumnCounts,
                ShowBoardStats = sourceSettings.ShowBoardStats,
                EnableGamification = sourceSettings.EnableGamification
            };

            // Apply to target board
            BoardSettingsDTO result = await UpdateBoardSettingsAsync(targetBoardId, updateDto, userId);

            _logger.LogInformation("Successfully copied settings from board {SourceBoardId} to board {TargetBoardId}", 
                sourceBoardId, targetBoardId);

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error copying settings from board {SourceBoardId} to board {TargetBoardId} by user {UserId}", 
                sourceBoardId, targetBoardId, userId);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<SettingsValidationResultDTO> ValidateSettingsAsync(UpdateBoardSettingsDTO updateDto, int userId)
    {
        try
        {
            _logger.LogInformation("Validating board settings update by user {UserId}", userId);

            SettingsValidationResultDTO result = new SettingsValidationResultDTO
            {
                IsValid = true
            };

            // Validate auto refresh interval
            if (updateDto.AutoRefreshInterval.HasValue)
            {
                if (updateDto.AutoRefreshInterval.Value < 5)
                {
                    result.IsValid = false;
                    result.Errors.Add("Auto refresh interval must be at least 5 seconds");
                }
                else if (updateDto.AutoRefreshInterval.Value > 300)
                {
                    result.IsValid = false;
                    result.Errors.Add("Auto refresh interval cannot exceed 300 seconds (5 minutes)");
                }
                else if (updateDto.AutoRefreshInterval.Value < 30)
                {
                    result.Warnings.Add("Auto refresh intervals below 30 seconds may impact performance");
                }
            }

            // Validate theme
            if (!string.IsNullOrEmpty(updateDto.Theme))
            {
                List<string> validThemes = new List<string> { "light", "dark", "auto", "custom" };
                if (!validThemes.Contains(updateDto.Theme.ToLower()))
                {
                    result.IsValid = false;
                    result.Errors.Add($"Invalid theme '{updateDto.Theme}'. Valid themes are: {string.Join(", ", validThemes)}");
                }
            }

            // Validate sort direction
            if (!string.IsNullOrEmpty(updateDto.DefaultSortDirection))
            {
                List<string> validDirections = new List<string> { "asc", "desc" };
                if (!validDirections.Contains(updateDto.DefaultSortDirection.ToLower()))
                {
                    result.IsValid = false;
                    result.Errors.Add($"Invalid sort direction '{updateDto.DefaultSortDirection}'. Valid directions are: asc, desc");
                }
            }

            // Validate task view
            if (!string.IsNullOrEmpty(updateDto.DefaultTaskView))
            {
                List<string> validViews = new List<string> { "compact", "detailed", "card", "list" };
                if (!validViews.Contains(updateDto.DefaultTaskView.ToLower()))
                {
                    result.IsValid = false;
                    result.Errors.Add($"Invalid task view '{updateDto.DefaultTaskView}'. Valid views are: {string.Join(", ", validViews)}");
                }
            }

            // Validate swim lane group by
            if (!string.IsNullOrEmpty(updateDto.SwimLaneGroupBy))
            {
                List<string> validGroupBy = new List<string> { "assignee", "priority", "category", "duedate", "status" };
                if (!validGroupBy.Contains(updateDto.SwimLaneGroupBy.ToLower()))
                {
                    result.IsValid = false;
                    result.Errors.Add($"Invalid swim lane group by '{updateDto.SwimLaneGroupBy}'. Valid options are: {string.Join(", ", validGroupBy)}");
                }
            }

            // Validate custom theme config JSON
            if (!string.IsNullOrEmpty(updateDto.CustomThemeConfig))
            {
                try
                {
                    JsonDocument.Parse(updateDto.CustomThemeConfig);
                }
                catch (JsonException)
                {
                    result.IsValid = false;
                    result.Errors.Add("Custom theme configuration must be valid JSON");
                }
            }

            // Add validated settings
            result.ValidatedSettings["AutoRefreshInterval"] = updateDto.AutoRefreshInterval ?? 30;
            result.ValidatedSettings["Theme"] = updateDto.Theme ?? "auto";
            result.ValidatedSettings["DefaultTaskView"] = updateDto.DefaultTaskView ?? "detailed";
            result.ValidatedSettings["DefaultSortDirection"] = updateDto.DefaultSortDirection ?? "desc";

            _logger.LogInformation("Settings validation completed. Valid: {IsValid}, Errors: {ErrorCount}, Warnings: {WarningCount}", 
                result.IsValid, result.Errors.Count, result.Warnings.Count);

            await Task.CompletedTask;
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating settings for user {UserId}", userId);
            throw;
        }
    }

    #region Private Helper Methods

    private async Task ValidateBoardAccessAsync(int boardId, int userId)
    {
        Board? board = await _boardRepository.GetBoardByIdAsync(boardId);
        if (board == null)
        {
            throw new InvalidOperationException($"Board {boardId} not found");
        }

        if (board.UserId != userId)
        {
            throw new UnauthorizedAccessException($"User {userId} does not have access to board {boardId}");
        }
    }

    #endregion
} 