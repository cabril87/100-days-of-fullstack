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
using System.Threading.Tasks;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Repositories.Interfaces;

/// <summary>
/// Repository interface for managing user security settings
/// </summary>
public interface IUserSecuritySettingsRepository
{
    /// <summary>
    /// Gets user security settings by user ID
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <returns>UserSecuritySettings or null if not found</returns>
    Task<UserSecuritySettings?> GetByUserIdAsync(int userId);

    /// <summary>
    /// Creates new user security settings
    /// </summary>
    /// <param name="settings">UserSecuritySettings to create</param>
    /// <returns>Created UserSecuritySettings</returns>
    Task<UserSecuritySettings> CreateAsync(UserSecuritySettings settings);

    /// <summary>
    /// Updates existing user security settings
    /// </summary>
    /// <param name="settings">UserSecuritySettings to update</param>
    /// <returns>Updated UserSecuritySettings</returns>
    Task<UserSecuritySettings> UpdateAsync(UserSecuritySettings settings);

    /// <summary>
    /// Deletes user security settings
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <returns>True if deleted, false if not found</returns>
    Task<bool> DeleteAsync(int userId);

    /// <summary>
    /// Checks if user security settings exist for a user
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <returns>True if settings exist, false otherwise</returns>
    Task<bool> ExistsAsync(int userId);

    /// <summary>
    /// Gets or creates default user security settings for a user
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <returns>UserSecuritySettings (existing or newly created)</returns>
    Task<UserSecuritySettings> GetOrCreateDefaultAsync(int userId);
} 