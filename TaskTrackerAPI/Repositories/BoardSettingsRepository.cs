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
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.Data;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories.Interfaces;

namespace TaskTrackerAPI.Repositories;

/// <summary>
/// Repository implementation for BoardSettings entity operations
/// Uses explicit typing and follows established repository patterns
/// </summary>
public class BoardSettingsRepository : IBoardSettingsRepository
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<BoardSettingsRepository> _logger;

    public BoardSettingsRepository(ApplicationDbContext context, ILogger<BoardSettingsRepository> logger)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <inheritdoc />
    public async Task<BoardSettings?> GetSettingsByBoardIdAsync(int boardId)
    {
        try
        {
            _logger.LogInformation("Getting board settings for board {BoardId}", boardId);

            BoardSettings? settings = await _context.BoardSettings
                .FirstOrDefaultAsync(s => s.BoardId == boardId);

            if (settings != null)
            {
                _logger.LogInformation("Found board settings {SettingsId} for board {BoardId}", 
                    settings.Id, boardId);
            }
            else
            {
                _logger.LogWarning("No board settings found for board {BoardId}", boardId);
            }

            return settings;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting board settings for board {BoardId}", boardId);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<BoardSettings?> GetSettingsByIdAsync(int id)
    {
        try
        {
            _logger.LogInformation("Getting board settings by ID {SettingsId}", id);

            BoardSettings? settings = await _context.BoardSettings
                .FirstOrDefaultAsync(s => s.Id == id);

            if (settings != null)
            {
                _logger.LogInformation("Found board settings {SettingsId} for board {BoardId}", 
                    id, settings.BoardId);
            }
            else
            {
                _logger.LogWarning("Board settings {SettingsId} not found", id);
            }

            return settings;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting board settings {SettingsId}", id);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<BoardSettings> CreateSettingsAsync(BoardSettings settings)
    {
        try
        {
            _logger.LogInformation("Creating board settings for board {BoardId}", settings.BoardId);

            settings.CreatedAt = DateTime.UtcNow;
            settings.UpdatedAt = null;

            _context.BoardSettings.Add(settings);
            int result = await _context.SaveChangesAsync();

            if (result > 0)
            {
                _logger.LogInformation("Successfully created board settings {SettingsId} for board {BoardId}", 
                    settings.Id, settings.BoardId);
            }
            else
            {
                _logger.LogWarning("Failed to create board settings for board {BoardId}", settings.BoardId);
            }

            return settings;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating board settings for board {BoardId}", settings.BoardId);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<BoardSettings> UpdateSettingsAsync(BoardSettings settings)
    {
        try
        {
            _logger.LogInformation("Updating board settings {SettingsId} for board {BoardId}", 
                settings.Id, settings.BoardId);

            settings.UpdatedAt = DateTime.UtcNow;

            _context.BoardSettings.Update(settings);
            int result = await _context.SaveChangesAsync();

            if (result > 0)
            {
                _logger.LogInformation("Successfully updated board settings {SettingsId} for board {BoardId}", 
                    settings.Id, settings.BoardId);
            }
            else
            {
                _logger.LogWarning("Failed to update board settings {SettingsId} for board {BoardId}", 
                    settings.Id, settings.BoardId);
            }

            return settings;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating board settings {SettingsId} for board {BoardId}", 
                settings.Id, settings.BoardId);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<BoardSettings> CreateDefaultSettingsAsync(int boardId)
    {
        try
        {
            _logger.LogInformation("Creating default board settings for board {BoardId}", boardId);

            BoardSettings defaultSettings = new BoardSettings
            {
                BoardId = boardId,
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
                CustomThemeConfig = null,
                SwimLaneGroupBy = null,
                DefaultSortBy = "created",
                DefaultSortDirection = "desc",
                ShowColumnCounts = true,
                ShowBoardStats = true,
                EnableGamification = true,
                IsArchived = false,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = null
            };

            _context.BoardSettings.Add(defaultSettings);
            int result = await _context.SaveChangesAsync();

            if (result > 0)
            {
                _logger.LogInformation("Successfully created default board settings {SettingsId} for board {BoardId}", 
                    defaultSettings.Id, boardId);
            }
            else
            {
                _logger.LogWarning("Failed to create default board settings for board {BoardId}", boardId);
            }

            return defaultSettings;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating default board settings for board {BoardId}", boardId);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<BoardSettings> ResetToDefaultsAsync(int boardId)
    {
        try
        {
            _logger.LogInformation("Resetting board settings to defaults for board {BoardId}", boardId);

            BoardSettings? existingSettings = await _context.BoardSettings
                .FirstOrDefaultAsync(s => s.BoardId == boardId);

            if (existingSettings == null)
            {
                _logger.LogInformation("No existing settings found, creating new default settings for board {BoardId}", boardId);
                return await CreateDefaultSettingsAsync(boardId);
            }

            // Reset to default values
            existingSettings.EnableWipLimits = false;
            existingSettings.ShowSubtasks = true;
            existingSettings.EnableSwimLanes = false;
            existingSettings.DefaultTaskView = "detailed";
            existingSettings.EnableDragDrop = true;
            existingSettings.ShowTaskIds = false;
            existingSettings.EnableTaskTimer = true;
            existingSettings.ShowProgressBars = true;
            existingSettings.ShowAvatars = true;
            existingSettings.ShowDueDates = true;
            existingSettings.ShowPriority = true;
            existingSettings.ShowCategories = true;
            existingSettings.AutoRefresh = true;
            existingSettings.AutoRefreshInterval = 30;
            existingSettings.EnableRealTimeCollaboration = true;
            existingSettings.ShowNotifications = true;
            existingSettings.EnableKeyboardShortcuts = true;
            existingSettings.Theme = "auto";
            existingSettings.CustomThemeConfig = null;
            existingSettings.SwimLaneGroupBy = null;
            existingSettings.DefaultSortBy = "created";
            existingSettings.DefaultSortDirection = "desc";
            existingSettings.ShowColumnCounts = true;
            existingSettings.ShowBoardStats = true;
            existingSettings.EnableGamification = true;
            existingSettings.IsArchived = false;
            existingSettings.UpdatedAt = DateTime.UtcNow;

            int result = await _context.SaveChangesAsync();

            if (result > 0)
            {
                _logger.LogInformation("Successfully reset board settings {SettingsId} to defaults for board {BoardId}", 
                    existingSettings.Id, boardId);
            }
            else
            {
                _logger.LogWarning("Failed to reset board settings for board {BoardId}", boardId);
            }

            return existingSettings;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error resetting board settings to defaults for board {BoardId}", boardId);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<bool> SettingsExistAsync(int boardId)
    {
        try
        {
            _logger.LogInformation("Checking if settings exist for board {BoardId}", boardId);

            bool exists = await _context.BoardSettings
                .AnyAsync(s => s.BoardId == boardId);

            _logger.LogInformation("Settings exist for board {BoardId}: {Exists}", boardId, exists);
            return exists;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking if settings exist for board {BoardId}", boardId);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<IEnumerable<BoardSettings>> GetArchivedSettingsAsync(int userId)
    {
        try
        {
            _logger.LogInformation("Getting archived board settings for user {UserId}", userId);

            List<BoardSettings> archivedSettings = await _context.BoardSettings
                .Include(s => s.Board)
                .Where(s => s.Board != null && s.Board.UserId == userId && s.IsArchived)
                .OrderByDescending(s => s.UpdatedAt ?? s.CreatedAt)
                .ToListAsync();

            _logger.LogInformation("Found {Count} archived board settings for user {UserId}", 
                archivedSettings.Count, userId);

            return archivedSettings;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting archived board settings for user {UserId}", userId);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<IEnumerable<BoardSettings>> GetSettingsByThemeAsync(int userId, string theme)
    {
        try
        {
            _logger.LogInformation("Getting board settings with theme {Theme} for user {UserId}", theme, userId);

            List<BoardSettings> themeSettings = await _context.BoardSettings
                .Include(s => s.Board)
                .Where(s => s.Board != null && s.Board.UserId == userId && s.Theme == theme && !s.IsArchived)
                .OrderBy(s => s.Board != null ? s.Board.Name : "")
                .ToListAsync();

            _logger.LogInformation("Found {Count} board settings with theme {Theme} for user {UserId}", 
                themeSettings.Count, theme, userId);

            return themeSettings;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting board settings with theme {Theme} for user {UserId}", theme, userId);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<IEnumerable<BoardSettings>> GetGamifiedBoardSettingsAsync(int userId)
    {
        try
        {
            _logger.LogInformation("Getting gamified board settings for user {UserId}", userId);

            List<BoardSettings> gamifiedSettings = await _context.BoardSettings
                .Include(s => s.Board)
                .Where(s => s.Board != null && s.Board.UserId == userId && s.EnableGamification && !s.IsArchived)
                .OrderBy(s => s.Board != null ? s.Board.Name : "")
                .ToListAsync();

            _logger.LogInformation("Found {Count} gamified board settings for user {UserId}", 
                gamifiedSettings.Count, userId);

            return gamifiedSettings;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting gamified board settings for user {UserId}", userId);
            throw;
        }
    }
} 