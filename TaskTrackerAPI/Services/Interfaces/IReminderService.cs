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
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.DTOs.Tasks;
using TaskTrackerAPI.Models;
using ModelReminderStatus = TaskTrackerAPI.Models.ReminderStatus;

namespace TaskTrackerAPI.Services.Interfaces;

public interface IReminderService
{
    Task<IEnumerable<ReminderDTO>> GetAllRemindersAsync(int userId);
    Task<ReminderDTO?> GetReminderByIdAsync(int userId, int reminderId);
    Task<IEnumerable<ReminderDTO>> GetRemindersByStatusAsync(int userId, ModelReminderStatus status);
    Task<IEnumerable<ReminderDTO>> GetUpcomingRemindersAsync(int userId, int days);
    Task<IEnumerable<ReminderDTO>> GetOverdueRemindersAsync(int userId);
    Task<IEnumerable<ReminderDTO>> GetDueTodayRemindersAsync(int userId);
    Task<IEnumerable<ReminderDTO>> GetRemindersByTaskIdAsync(int userId, int taskId);
    Task<ReminderDTO?> CreateReminderAsync(int userId, CreateReminderDTO reminderDto);
    Task<ReminderDTO?> UpdateReminderAsync(int userId, int reminderId, UpdateReminderDTO reminderDto);
    Task DeleteReminderAsync(int userId, int reminderId);
    Task<bool> IsReminderOwnedByUserAsync(int reminderId, int userId);
    Task<ReminderDTO?> UpdateReminderStatusAsync(int userId, int reminderId, ModelReminderStatus status);
    Task<ReminderStatisticsDTO> GetReminderStatisticsAsync(int userId);
} 