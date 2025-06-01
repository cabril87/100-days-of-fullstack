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
using TaskTrackerAPI.DTOs.Boards;

namespace TaskTrackerAPI.Services.Interfaces;

/// <summary>
/// Service interface for board settings business logic
/// Follows service pattern with comprehensive settings management
/// </summary>
public interface IBoardSettingsService
{
    /// <summary>
    /// Get board settings for a specific board
    /// </summary>
    /// <param name="boardId">Board ID</param>
    /// <param name="userId">User ID for authorization</param>
    /// <returns>Board settings DTO if found</returns>
    Task<BoardSettingsDTO?> GetBoardSettingsAsync(int boardId, int userId);

    /// <summary>
    /// Update board settings
    /// </summary>
    /// <param name="boardId">Board ID</param>
    /// <param name="updateDto">Settings update data</param>
    /// <param name="userId">User ID for authorization</param>
    /// <returns>Updated board settings DTO</returns>
    Task<BoardSettingsDTO> UpdateBoardSettingsAsync(int boardId, UpdateBoardSettingsDTO updateDto, int userId);

    /// <summary>
    /// Create default settings for a new board
    /// </summary>
    /// <param name="boardId">Board ID</param>
    /// <param name="userId">User ID for authorization</param>
    /// <returns>Created default settings DTO</returns>
    Task<BoardSettingsDTO> CreateDefaultSettingsAsync(int boardId, int userId);

    /// <summary>
    /// Reset board settings to default values
    /// </summary>
    /// <param name="boardId">Board ID</param>
    /// <param name="userId">User ID for authorization</param>
    /// <returns>Reset settings DTO</returns>
    Task<BoardSettingsDTO> ResetToDefaultsAsync(int boardId, int userId);

    /// <summary>
    /// Check if board has custom settings (not defaults)
    /// </summary>
    /// <param name="boardId">Board ID</param>
    /// <param name="userId">User ID for authorization</param>
    /// <returns>True if board has custom settings</returns>
    Task<bool> HasCustomSettingsAsync(int boardId, int userId);

    /// <summary>
    /// Get all gamified board settings for a user
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <returns>List of gamified board settings</returns>
    Task<IEnumerable<BoardSettingsDTO>> GetGamifiedBoardSettingsAsync(int userId);

    /// <summary>
    /// Get board settings filtered by theme
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <param name="theme">Theme name</param>
    /// <returns>List of board settings with specified theme</returns>
    Task<IEnumerable<BoardSettingsDTO>> GetSettingsByThemeAsync(int userId, string theme);

    /// <summary>
    /// Get archived board settings for a user
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <returns>List of archived board settings</returns>
    Task<IEnumerable<BoardSettingsDTO>> GetArchivedSettingsAsync(int userId);

    /// <summary>
    /// Export board settings as JSON
    /// </summary>
    /// <param name="boardId">Board ID</param>
    /// <param name="userId">User ID for authorization</param>
    /// <returns>JSON string of board settings</returns>
    Task<string> ExportSettingsAsync(int boardId, int userId);

    /// <summary>
    /// Import board settings from JSON
    /// </summary>
    /// <param name="boardId">Board ID</param>
    /// <param name="settingsJson">JSON settings data</param>
    /// <param name="userId">User ID for authorization</param>
    /// <returns>Imported settings DTO</returns>
    Task<BoardSettingsDTO> ImportSettingsAsync(int boardId, string settingsJson, int userId);

    /// <summary>
    /// Copy settings from one board to another
    /// </summary>
    /// <param name="sourceBoardId">Source board ID</param>
    /// <param name="targetBoardId">Target board ID</param>
    /// <param name="userId">User ID for authorization</param>
    /// <returns>Copied settings DTO</returns>
    Task<BoardSettingsDTO> CopySettingsAsync(int sourceBoardId, int targetBoardId, int userId);

    /// <summary>
    /// Validate settings before applying
    /// </summary>
    /// <param name="updateDto">Settings to validate</param>
    /// <param name="userId">User ID for authorization</param>
    /// <returns>Validation result</returns>
    Task<SettingsValidationResultDTO> ValidateSettingsAsync(UpdateBoardSettingsDTO updateDto, int userId);
} 