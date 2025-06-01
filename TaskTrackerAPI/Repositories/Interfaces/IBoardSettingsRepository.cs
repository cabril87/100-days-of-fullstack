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
using System.Collections.Generic;
using System.Threading.Tasks;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Repositories.Interfaces;

/// <summary>
/// Repository interface for BoardSettings entity operations
/// Follows repository pattern with explicit typing and no var declarations
/// </summary>
public interface IBoardSettingsRepository
{
    /// <summary>
    /// Get board settings by board ID
    /// </summary>
    /// <param name="boardId">The board ID</param>
    /// <returns>BoardSettings if found, null otherwise</returns>
    Task<BoardSettings?> GetSettingsByBoardIdAsync(int boardId);

    /// <summary>
    /// Get board settings by settings ID
    /// </summary>
    /// <param name="id">Settings ID</param>
    /// <returns>BoardSettings if found, null otherwise</returns>
    Task<BoardSettings?> GetSettingsByIdAsync(int id);

    /// <summary>
    /// Create new board settings
    /// </summary>
    /// <param name="settings">Settings to create</param>
    /// <returns>Created settings with assigned ID</returns>
    Task<BoardSettings> CreateSettingsAsync(BoardSettings settings);

    /// <summary>
    /// Update existing board settings
    /// </summary>
    /// <param name="settings">Settings to update</param>
    /// <returns>Updated settings</returns>
    Task<BoardSettings> UpdateSettingsAsync(BoardSettings settings);

    /// <summary>
    /// Create default settings for a board
    /// </summary>
    /// <param name="boardId">Board ID</param>
    /// <returns>Created default settings</returns>
    Task<BoardSettings> CreateDefaultSettingsAsync(int boardId);

    /// <summary>
    /// Reset board settings to default values
    /// </summary>
    /// <param name="boardId">Board ID</param>
    /// <returns>Reset settings</returns>
    Task<BoardSettings> ResetToDefaultsAsync(int boardId);

    /// <summary>
    /// Check if settings exist for a board
    /// </summary>
    /// <param name="boardId">Board ID</param>
    /// <returns>True if settings exist</returns>
    Task<bool> SettingsExistAsync(int boardId);

    /// <summary>
    /// Get all archived board settings
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <returns>List of archived board settings</returns>
    Task<IEnumerable<BoardSettings>> GetArchivedSettingsAsync(int userId);

    /// <summary>
    /// Get settings for boards with specific theme
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <param name="theme">Theme name</param>
    /// <returns>List of board settings with the theme</returns>
    Task<IEnumerable<BoardSettings>> GetSettingsByThemeAsync(int userId, string theme);

    /// <summary>
    /// Get settings for boards with gamification enabled
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <returns>List of board settings with gamification enabled</returns>
    Task<IEnumerable<BoardSettings>> GetGamifiedBoardSettingsAsync(int userId);
} 