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
using AutoMapper;
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.DTOs.Notifications;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories.Interfaces;
using TaskTrackerAPI.Services.Interfaces;

namespace TaskTrackerAPI.Services;

public class NotificationPreferenceService : INotificationPreferenceService
{
    private readonly INotificationPreferenceRepository _preferenceRepository;
    private readonly IFamilyRepository _familyRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<NotificationPreferenceService> _logger;

    public NotificationPreferenceService(
        INotificationPreferenceRepository preferenceRepository,
        IFamilyRepository familyRepository,
        IMapper mapper,
        ILogger<NotificationPreferenceService> logger)
    {
        _preferenceRepository = preferenceRepository;
        _familyRepository = familyRepository;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<IEnumerable<NotificationPreferenceDTO>> GetAllPreferencesAsync(int userId)
    {
        try
        {
            IEnumerable<NotificationPreference> preferences = await _preferenceRepository.GetAllForUserAsync(userId);
            return _mapper.Map<IEnumerable<NotificationPreferenceDTO>>(preferences);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting notification preferences for user {UserId}", userId);
            throw;
        }
    }

    public async Task<IEnumerable<NotificationPreferenceDTO>> GetFamilyPreferencesAsync(int userId, int familyId)
    {
        try
        {
            // Verify user is a member of this family
            bool isMember = await _familyRepository.IsMemberAsync(familyId, userId);
            if (!isMember)
            {
                _logger.LogWarning("User {UserId} attempted to access family preferences for family {FamilyId} without being a member", userId, familyId);
                throw new UnauthorizedAccessException("You are not a member of this family");
            }
            
            IEnumerable<NotificationPreference> preferences = await _preferenceRepository.GetForUserAndFamilyAsync(userId, familyId);
            
            var prefDtos = _mapper.Map<IEnumerable<NotificationPreferenceDTO>>(preferences);
            
            // Attach family names
            var family = await _familyRepository.GetByIdAsync(familyId);
            if (family != null)
            {
                foreach (var pref in prefDtos)
                {
                    if (pref.FamilyId == familyId)
                    {
                        pref.FamilyName = family.Name;
                    }
                }
            }
            
            return prefDtos;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting family notification preferences for user {UserId} and family {FamilyId}", userId, familyId);
            throw;
        }
    }

    public async Task<NotificationPreferenceDTO?> GetPreferenceByIdAsync(int userId, int preferenceId)
    {
        try
        {
            // Verify ownership
            bool isOwner = await _preferenceRepository.IsOwnerAsync(preferenceId, userId);
            if (!isOwner)
            {
                _logger.LogWarning("User {UserId} attempted to access preference {PreferenceId} without ownership", userId, preferenceId);
                return null;
            }
            
            NotificationPreference? preference = await _preferenceRepository.GetByIdAsync(preferenceId);
            if (preference == null)
            {
                return null;
            }
            
            return _mapper.Map<NotificationPreferenceDTO>(preference);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting notification preference {PreferenceId} for user {UserId}", preferenceId, userId);
            throw;
        }
    }

    public async Task<NotificationPreferenceDTO?> UpdatePreferenceAsync(int userId, int preferenceId, UpdateNotificationPreferenceDTO preferenceDto)
    {
        try
        {
            // Verify ownership
            bool isOwner = await _preferenceRepository.IsOwnerAsync(preferenceId, userId);
            if (!isOwner)
            {
                _logger.LogWarning("User {UserId} attempted to update preference {PreferenceId} without ownership", userId, preferenceId);
                return null;
            }
            
            NotificationPreference? preference = await _preferenceRepository.GetByIdAsync(preferenceId);
            if (preference == null)
            {
                return null;
            }
            
            // If family ID specified, verify user is member
            if (preferenceDto.FamilyId.HasValue)
            {
                bool isMember = await _familyRepository.IsMemberAsync(preferenceDto.FamilyId.Value, userId);
                if (!isMember)
                {
                    _logger.LogWarning("User {UserId} attempted to set family preference for family {FamilyId} without being a member", 
                        userId, preferenceDto.FamilyId.Value);
                    throw new UnauthorizedAccessException("You are not a member of this family");
                }
            }
            
            // Update properties
            preference.NotificationType = preferenceDto.NotificationType;
            preference.Enabled = preferenceDto.Enabled;
            preference.Priority = _mapper.Map<NotificationPriority>(preferenceDto.Priority);
            preference.FamilyId = preferenceDto.FamilyId;
            preference.EnableEmailNotifications = preferenceDto.EnableEmailNotifications;
            preference.EnablePushNotifications = preferenceDto.EnablePushNotifications;
            preference.UpdatedAt = DateTime.UtcNow;
            
            // Save changes
            NotificationPreference? updatedPreference = await _preferenceRepository.UpdateAsync(preference);
            if (updatedPreference == null)
            {
                return null;
            }
            
            return _mapper.Map<NotificationPreferenceDTO>(updatedPreference);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating notification preference {PreferenceId} for user {UserId}", preferenceId, userId);
            throw;
        }
    }

    public async Task<NotificationPreferenceDTO> CreatePreferenceAsync(int userId, UpdateNotificationPreferenceDTO preferenceDto)
    {
        try
        {
            // If family ID specified, verify user is member
            if (preferenceDto.FamilyId.HasValue)
            {
                bool isMember = await _familyRepository.IsMemberAsync(preferenceDto.FamilyId.Value, userId);
                if (!isMember)
                {
                    _logger.LogWarning("User {UserId} attempted to create family preference for family {FamilyId} without being a member", 
                        userId, preferenceDto.FamilyId.Value);
                    throw new UnauthorizedAccessException("You are not a member of this family");
                }
            }
            
            // Create new preference
            var preference = new NotificationPreference
            {
                UserId = userId,
                NotificationType = preferenceDto.NotificationType,
                Enabled = preferenceDto.Enabled,
                Priority = _mapper.Map<NotificationPriority>(preferenceDto.Priority),
                FamilyId = preferenceDto.FamilyId,
                EnableEmailNotifications = preferenceDto.EnableEmailNotifications,
                EnablePushNotifications = preferenceDto.EnablePushNotifications,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            
            // Save changes
            NotificationPreference createdPreference = await _preferenceRepository.CreateAsync(preference);
            
            return _mapper.Map<NotificationPreferenceDTO>(createdPreference);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating notification preference for user {UserId}", userId);
            throw;
        }
    }

    public async Task<bool> DeletePreferenceAsync(int userId, int preferenceId)
    {
        try
        {
            // Verify ownership
            bool isOwner = await _preferenceRepository.IsOwnerAsync(preferenceId, userId);
            if (!isOwner)
            {
                _logger.LogWarning("User {UserId} attempted to delete preference {PreferenceId} without ownership", userId, preferenceId);
                return false;
            }
            
            return await _preferenceRepository.DeleteAsync(preferenceId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting notification preference {PreferenceId} for user {UserId}", preferenceId, userId);
            throw;
        }
    }

    public async Task<bool> SetPreferenceEnabledStatusAsync(int userId, string notificationType, bool enabled, int? familyId = null)
    {
        try
        {
            // If family ID specified, verify user is member
            if (familyId.HasValue)
            {
                bool isMember = await _familyRepository.IsMemberAsync(familyId.Value, userId);
                if (!isMember)
                {
                    _logger.LogWarning("User {UserId} attempted to update family preference for family {FamilyId} without being a member", 
                        userId, familyId.Value);
                    throw new UnauthorizedAccessException("You are not a member of this family");
                }
            }
            
            return await _preferenceRepository.SetPreferenceEnabledStatusAsync(userId, notificationType, enabled, familyId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error setting enabled status for notification type {Type} for user {UserId}", notificationType, userId);
            throw;
        }
    }

    public async Task<bool> SetPreferencePriorityAsync(int userId, string notificationType, NotificationPriority priority, int? familyId = null)
    {
        try
        {
            // If family ID specified, verify user is member
            if (familyId.HasValue)
            {
                bool isMember = await _familyRepository.IsMemberAsync(familyId.Value, userId);
                if (!isMember)
                {
                    _logger.LogWarning("User {UserId} attempted to update family preference for family {FamilyId} without being a member", 
                        userId, familyId.Value);
                    throw new UnauthorizedAccessException("You are not a member of this family");
                }
            }
            
            return await _preferenceRepository.SetPreferencePriorityAsync(userId, notificationType, priority, familyId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error setting priority for notification type {Type} for user {UserId}", notificationType, userId);
            throw;
        }
    }

    public async Task<bool> SetEmailNotificationsAsync(int userId, bool enabled)
    {
        try
        {
            return await _preferenceRepository.SetEmailNotificationsAsync(userId, enabled);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error setting email notifications for user {UserId}", userId);
            throw;
        }
    }

    public async Task<bool> SetPushNotificationsAsync(int userId, bool enabled)
    {
        try
        {
            return await _preferenceRepository.SetPushNotificationsAsync(userId, enabled);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error setting push notifications for user {UserId}", userId);
            throw;
        }
    }

    public async Task<NotificationPreferenceSummaryDTO> GetPreferenceSummaryAsync(int userId)
    {
        try
        {
            var preferences = await _preferenceRepository.GetAllForUserAsync(userId);
            
            if (!preferences.Any())
            {
                // No preferences exist yet, create defaults and try again
                await InitializeDefaultPreferencesAsync(userId);
                preferences = await _preferenceRepository.GetAllForUserAsync(userId);
            }
            
            var summary = new NotificationPreferenceSummaryDTO
            {
                EnableGlobalNotifications = true, // Default to true
                EnableTaskNotifications = true,   // Default to true
                EnableFamilyNotifications = true, // Default to true
                EnableSystemNotifications = true  // Default to true
            };
            
            if (!preferences.Any())
            {
                return summary; // Return defaults if still no preferences
            }
            
            // Get email/push preferences from any preference (should be consistent)
            var anyPref = preferences.First();
            summary.EnableEmailNotifications = anyPref.EnableEmailNotifications;
            summary.EnablePushNotifications = anyPref.EnablePushNotifications;
            
            // Check specific notification types
            summary.EnableTaskNotifications = preferences
                .Where(p => p.NotificationType.Contains("Task"))
                .All(p => p.Enabled);
                
            summary.EnableFamilyNotifications = preferences
                .Where(p => p.NotificationType.Contains("Family"))
                .All(p => p.Enabled);
                
            summary.EnableSystemNotifications = preferences
                .Where(p => p.NotificationType.Contains("System"))
                .All(p => p.Enabled);
                
            // Global is only false if ALL are false
            summary.EnableGlobalNotifications = preferences.Any(p => p.Enabled);
            
            return summary;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting notification preference summary for user {UserId}", userId);
            throw;
        }
    }

    public async Task<bool> InitializeDefaultPreferencesAsync(int userId)
    {
        try
        {
            return await _preferenceRepository.BulkCreateDefaultPreferencesAsync(userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error initializing default notification preferences for user {UserId}", userId);
            throw;
        }
    }
} 