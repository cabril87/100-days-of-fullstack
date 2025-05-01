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

public interface IReminderRepository
{
    Task<IEnumerable<Reminder>> GetAllRemindersAsync(int userId);
    Task<Reminder?> GetReminderByIdAsync(int reminderId);
    Task<IEnumerable<Reminder>> GetRemindersByStatusAsync(int userId, ReminderStatus status);
    Task<IEnumerable<Reminder>> GetUpcomingRemindersAsync(int userId, DateTime endDate);
    Task<IEnumerable<Reminder>> GetOverdueRemindersAsync(int userId);
    Task<IEnumerable<Reminder>> GetRemindersByTaskIdAsync(int taskId);
    Task<IEnumerable<Reminder>> GetDueTodayRemindersAsync(int userId);
    Task<Reminder> CreateReminderAsync(Reminder reminder);
    Task<Reminder> UpdateReminderAsync(Reminder reminder);
    Task DeleteReminderAsync(Reminder reminder);
    Task<bool> IsReminderOwnedByUserAsync(int reminderId, int userId);
    Task<int> GetReminderCountByStatusAsync(int userId, ReminderStatus status);
} 