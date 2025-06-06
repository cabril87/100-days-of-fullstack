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
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;
using TaskTrackerAPI.Data;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories.Interfaces;

namespace TaskTrackerAPI.Repositories;

/// <summary>
/// Repository implementation for managing user security settings
/// </summary>
public class UserSecuritySettingsRepository : IUserSecuritySettingsRepository
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<UserSecuritySettingsRepository> _logger;

    public UserSecuritySettingsRepository(
        ApplicationDbContext context,
        ILogger<UserSecuritySettingsRepository> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Gets user security settings by user ID
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <returns>UserSecuritySettings or null if not found</returns>
    public async Task<UserSecuritySettings?> GetByUserIdAsync(int userId)
    {
        try
        {
            return await _context.UserSecuritySettings
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.UserId == userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving security settings for user {UserId}", userId);
            throw;
        }
    }

    /// <summary>
    /// Creates new user security settings
    /// </summary>
    /// <param name="settings">UserSecuritySettings to create</param>
    /// <returns>Created UserSecuritySettings</returns>
    public async Task<UserSecuritySettings> CreateAsync(UserSecuritySettings settings)
    {
        try
        {
            settings.CreatedAt = DateTime.UtcNow;
            settings.UpdatedAt = DateTime.UtcNow;

            _context.UserSecuritySettings.Add(settings);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Created security settings for user {UserId}", settings.UserId);
            return settings;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating security settings for user {UserId}", settings.UserId);
            throw;
        }
    }

    /// <summary>
    /// Updates existing user security settings
    /// </summary>
    /// <param name="settings">UserSecuritySettings to update</param>
    /// <returns>Updated UserSecuritySettings</returns>
    public async Task<UserSecuritySettings> UpdateAsync(UserSecuritySettings settings)
    {
        try
        {
            settings.UpdatedAt = DateTime.UtcNow;

            _context.UserSecuritySettings.Update(settings);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Updated security settings for user {UserId}", settings.UserId);
            return settings;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating security settings for user {UserId}", settings.UserId);
            throw;
        }
    }

    /// <summary>
    /// Deletes user security settings
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <returns>True if deleted, false if not found</returns>
    public async Task<bool> DeleteAsync(int userId)
    {
        try
        {
            UserSecuritySettings? settings = await _context.UserSecuritySettings
                .FirstOrDefaultAsync(s => s.UserId == userId);

            if (settings == null)
            {
                return false;
            }

            _context.UserSecuritySettings.Remove(settings);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Deleted security settings for user {UserId}", userId);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting security settings for user {UserId}", userId);
            throw;
        }
    }

    /// <summary>
    /// Checks if user security settings exist for a user
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <returns>True if settings exist, false otherwise</returns>
    public async Task<bool> ExistsAsync(int userId)
    {
        try
        {
            return await _context.UserSecuritySettings
                .AnyAsync(s => s.UserId == userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking if security settings exist for user {UserId}", userId);
            throw;
        }
    }

    /// <summary>
    /// Gets or creates default user security settings for a user
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <returns>UserSecuritySettings (existing or newly created)</returns>
    public async Task<UserSecuritySettings> GetOrCreateDefaultAsync(int userId)
    {
        try
        {
            UserSecuritySettings? existingSettings = await GetByUserIdAsync(userId);
            
            if (existingSettings != null)
            {
                return existingSettings;
            }

            // Create default settings
            UserSecuritySettings newSettings = new UserSecuritySettings
            {
                UserId = userId,
                MFAEnabled = false,
                SessionTimeout = 480, // 8 hours
                TrustedDevicesEnabled = true,
                LoginNotifications = true,
                DataExportRequest = false,
                AccountDeletionRequest = false,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            return await CreateAsync(newSettings);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting or creating default security settings for user {UserId}", userId);
            throw;
        }
    }
} 