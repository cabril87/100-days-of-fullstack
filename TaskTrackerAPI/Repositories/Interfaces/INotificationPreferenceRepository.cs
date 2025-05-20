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
using System.Threading.Tasks;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Repositories.Interfaces;

public interface INotificationPreferenceRepository
{
    Task<IEnumerable<NotificationPreference>> GetAllForUserAsync(int userId);
    Task<IEnumerable<NotificationPreference>> GetForUserAndFamilyAsync(int userId, int familyId);
    Task<NotificationPreference?> GetByIdAsync(int id);
    Task<NotificationPreference?> GetByTypeAndUserAsync(int userId, string notificationType, int? familyId = null);
    Task<NotificationPreference> CreateAsync(NotificationPreference preference);
    Task<NotificationPreference?> UpdateAsync(NotificationPreference preference);
    Task<bool> DeleteAsync(int id);
    Task<bool> SetPreferenceEnabledStatusAsync(int userId, string notificationType, bool enabled, int? familyId = null);
    Task<bool> SetPreferencePriorityAsync(int userId, string notificationType, NotificationPriority priority, int? familyId = null);
    Task<bool> SetEmailNotificationsAsync(int userId, bool enabled);
    Task<bool> SetPushNotificationsAsync(int userId, bool enabled);
    Task<bool> IsOwnerAsync(int preferenceId, int userId);
    Task<bool> BulkCreateDefaultPreferencesAsync(int userId);
} 