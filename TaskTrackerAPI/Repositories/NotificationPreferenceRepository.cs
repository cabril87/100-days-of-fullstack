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

public class NotificationPreferenceRepository : INotificationPreferenceRepository
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<NotificationPreferenceRepository> _logger;

    public NotificationPreferenceRepository(
        ApplicationDbContext context,
        ILogger<NotificationPreferenceRepository> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<IEnumerable<NotificationPreference>> GetAllForUserAsync(int userId)
    {
        return await _context.NotificationPreferences
            .Where(p => p.UserId == userId)
            .OrderBy(p => p.NotificationType)
            .ToListAsync();
    }

    public async Task<IEnumerable<NotificationPreference>> GetForUserAndFamilyAsync(int userId, int familyId)
    {
        return await _context.NotificationPreferences
            .Where(p => p.UserId == userId && (p.FamilyId == familyId || p.FamilyId == null))
            .OrderBy(p => p.NotificationType)
            .ToListAsync();
    }

    public async Task<NotificationPreference?> GetByIdAsync(int id)
    {
        return await _context.NotificationPreferences
            .Include(p => p.Family)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<NotificationPreference?> GetByTypeAndUserAsync(int userId, string notificationType, int? familyId = null)
    {
        return await _context.NotificationPreferences
            .FirstOrDefaultAsync(p => 
                p.UserId == userId && 
                p.NotificationType == notificationType && 
                p.FamilyId == familyId);
    }

    public async Task<NotificationPreference> CreateAsync(NotificationPreference preference)
    {
        // Check if it already exists
        var existing = await _context.NotificationPreferences
            .FirstOrDefaultAsync(p => 
                p.UserId == preference.UserId && 
                p.NotificationType == preference.NotificationType && 
                p.FamilyId == preference.FamilyId);

        if (existing != null)
        {
            _logger.LogInformation("Preference already exists for user {UserId}, type {Type}, family {FamilyId}", 
                preference.UserId, preference.NotificationType, preference.FamilyId);
            return existing;
        }

        _context.NotificationPreferences.Add(preference);
        await _context.SaveChangesAsync();
        return preference;
    }

    public async Task<NotificationPreference?> UpdateAsync(NotificationPreference preference)
    {
        preference.UpdatedAt = DateTime.UtcNow;
        _context.NotificationPreferences.Update(preference);
        await _context.SaveChangesAsync();
        return preference;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var preference = await _context.NotificationPreferences.FindAsync(id);
        if (preference == null)
            return false;

        _context.NotificationPreferences.Remove(preference);
        return await _context.SaveChangesAsync() > 0;
    }

    public async Task<bool> SetPreferenceEnabledStatusAsync(int userId, string notificationType, bool enabled, int? familyId = null)
    {
        var preference = await GetByTypeAndUserAsync(userId, notificationType, familyId);
        
        if (preference == null)
        {
            // Create new preference if it doesn't exist
            preference = new NotificationPreference
            {
                UserId = userId,
                NotificationType = notificationType,
                FamilyId = familyId,
                Enabled = enabled
            };
            
            _context.NotificationPreferences.Add(preference);
        }
        else
        {
            preference.Enabled = enabled;
            preference.UpdatedAt = DateTime.UtcNow;
            _context.NotificationPreferences.Update(preference);
        }
        
        return await _context.SaveChangesAsync() > 0;
    }

    public async Task<bool> SetPreferencePriorityAsync(int userId, string notificationType, NotificationPriority priority, int? familyId = null)
    {
        var preference = await GetByTypeAndUserAsync(userId, notificationType, familyId);
        
        if (preference == null)
        {
            // Create new preference if it doesn't exist
            preference = new NotificationPreference
            {
                UserId = userId,
                NotificationType = notificationType,
                FamilyId = familyId,
                Priority = priority
            };
            
            _context.NotificationPreferences.Add(preference);
        }
        else
        {
            preference.Priority = priority;
            preference.UpdatedAt = DateTime.UtcNow;
            _context.NotificationPreferences.Update(preference);
        }
        
        return await _context.SaveChangesAsync() > 0;
    }

    public async Task<bool> SetEmailNotificationsAsync(int userId, bool enabled)
    {
        var preferences = await _context.NotificationPreferences
            .Where(p => p.UserId == userId)
            .ToListAsync();
            
        if (!preferences.Any())
        {
            // No preferences exist yet, create defaults
            await BulkCreateDefaultPreferencesAsync(userId);
            preferences = await _context.NotificationPreferences
                .Where(p => p.UserId == userId)
                .ToListAsync();
        }
        
        foreach (var preference in preferences)
        {
            preference.EnableEmailNotifications = enabled;
            preference.UpdatedAt = DateTime.UtcNow;
        }
        
        return await _context.SaveChangesAsync() > 0;
    }

    public async Task<bool> SetPushNotificationsAsync(int userId, bool enabled)
    {
        var preferences = await _context.NotificationPreferences
            .Where(p => p.UserId == userId)
            .ToListAsync();
            
        if (!preferences.Any())
        {
            // No preferences exist yet, create defaults
            await BulkCreateDefaultPreferencesAsync(userId);
            preferences = await _context.NotificationPreferences
                .Where(p => p.UserId == userId)
                .ToListAsync();
        }
        
        foreach (var preference in preferences)
        {
            preference.EnablePushNotifications = enabled;
            preference.UpdatedAt = DateTime.UtcNow;
        }
        
        return await _context.SaveChangesAsync() > 0;
    }

    public async Task<bool> IsOwnerAsync(int preferenceId, int userId)
    {
        return await _context.NotificationPreferences
            .AnyAsync(p => p.Id == preferenceId && p.UserId == userId);
    }

    public async Task<bool> BulkCreateDefaultPreferencesAsync(int userId)
    {
        // Get existing preferences
        var existingPreferences = await _context.NotificationPreferences
            .Where(p => p.UserId == userId)
            .ToListAsync();
        
        // Define default preferences
        var defaultTypes = new[] 
        {
            "TaskDue", 
            "TaskCompleted", 
            "TaskReminder", 
            "FamilyAssignment", 
            "FamilyInvitation", 
            "SystemUpdate"
        };
        
        // Prepare batch of new preferences to add
        var newPreferences = new List<NotificationPreference>();
        
        foreach (var type in defaultTypes)
        {
            if (!existingPreferences.Any(p => p.NotificationType == type && p.FamilyId == null))
            {
                newPreferences.Add(new NotificationPreference
                {
                    UserId = userId,
                    NotificationType = type,
                    Enabled = true,
                    Priority = type.Contains("Task") ? NotificationPriority.High : NotificationPriority.Normal,
                    EnableEmailNotifications = false,
                    EnablePushNotifications = true
                });
            }
        }
        
        if (newPreferences.Any())
        {
            await _context.NotificationPreferences.AddRangeAsync(newPreferences);
            return await _context.SaveChangesAsync() > 0;
        }
        
        return true; // No changes needed
    }
} 