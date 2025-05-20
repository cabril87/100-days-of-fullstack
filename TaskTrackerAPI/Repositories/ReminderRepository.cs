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
using TaskTrackerAPI.Data;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories.Interfaces;

namespace TaskTrackerAPI.Repositories;

public class ReminderRepository : IReminderRepository
{
    private readonly ApplicationDbContext _context;

    public ReminderRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Reminder>> GetAllRemindersAsync(int userId)
    {
        return await _context.Reminders
            .Where(r => r.UserId == userId)
            .OrderBy(r => r.ReminderTime)
            .ToListAsync();
    }

    public async Task<Reminder?> GetReminderByIdAsync(int reminderId)
    {
        return await _context.Reminders
            .Where(r => r.Id == reminderId)
            .Select(r => new Reminder
            {
                Id = r.Id,
                UserId = r.UserId,
                TaskItemId = r.TaskItemId,
                Title = r.Title,
                Description = r.Description,
                ReminderTime = r.ReminderTime,
                Priority = r.Priority,
                IsRepeating = r.IsRepeating,
                RepeatFrequency = r.RepeatFrequency,
                Status = r.Status,
                CreatedAt = r.CreatedAt,
                UpdatedAt = r.UpdatedAt,
                DueDate = r.DueDate,
                IsCompleted = r.IsCompleted,
                CompletedAt = r.CompletedAt,
                TaskItem = r.TaskItem != null ? new TaskItem
                {
                    Id = r.TaskItem.Id,
                    Title = r.TaskItem.Title,
                    Description = r.TaskItem.Description,
                    Status = r.TaskItem.Status,
                    DueDate = r.TaskItem.DueDate,
                    Priority = r.TaskItem.Priority,
                    CreatedAt = r.TaskItem.CreatedAt,
                    UpdatedAt = r.TaskItem.UpdatedAt,
                    IsCompleted = r.TaskItem.IsCompleted,
                    UserId = r.TaskItem.UserId,
                    // Don't include AssignedToName to avoid the error
                } : null
            })
            .FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<Reminder>> GetRemindersByStatusAsync(int userId, ReminderStatus status)
    {
        return await _context.Reminders
            .Where(r => r.UserId == userId && r.Status == status)
            .OrderBy(r => r.ReminderTime)
            .ToListAsync();
    }

    public async Task<IEnumerable<Reminder>> GetUpcomingRemindersAsync(int userId, DateTime endDate)
    {
        DateTime now = DateTime.UtcNow;
        return await _context.Reminders
            .Where(r => r.UserId == userId && 
                   r.ReminderTime >= now && 
                   r.ReminderTime <= endDate &&
                   r.Status != ReminderStatus.Completed &&
                   r.Status != ReminderStatus.Dismissed)
            .OrderBy(r => r.ReminderTime)
            .ToListAsync();
    }

    public async Task<IEnumerable<Reminder>> GetOverdueRemindersAsync(int userId)
    {
        return await _context.Reminders
            .Where(r => r.UserId == userId && 
                    r.DueDate < DateTime.Today && 
                    r.Status == ReminderStatus.Pending)
            .OrderBy(r => r.DueDate)
            .ToListAsync();
    }

    public async Task<IEnumerable<Reminder>> GetDueTodayRemindersAsync(int userId)
    {
        return await _context.Reminders
            .Where(r => r.UserId == userId && 
                        r.DueDate.Date == DateTime.Today.Date && 
                        r.Status == ReminderStatus.Pending)
            .OrderBy(r => r.DueDate)
            .ToListAsync();
    }

    public async Task<IEnumerable<Reminder>> GetRemindersByTaskIdAsync(int taskId)
    {
        return await _context.Reminders
            .Where(r => r.TaskItemId == taskId)
            .OrderBy(r => r.ReminderTime)
            .ToListAsync();
    }

    public async Task<Reminder> CreateReminderAsync(Reminder reminder)
    {
        _context.Reminders.Add(reminder);
        await _context.SaveChangesAsync();
        return reminder;
    }

    public async Task<Reminder> UpdateReminderAsync(Reminder reminder)
    {
        reminder.UpdatedAt = DateTime.UtcNow;
        _context.Reminders.Update(reminder);
        await _context.SaveChangesAsync();
        return reminder;
    }

    public async Task DeleteReminderAsync(Reminder reminder)
    {
        _context.Reminders.Remove(reminder);
        await _context.SaveChangesAsync();
    }

    public async Task<bool> IsReminderOwnedByUserAsync(int reminderId, int userId)
    {
        return await _context.Reminders
            .AnyAsync(r => r.Id == reminderId && r.UserId == userId);
    }

    public async Task<int> GetReminderCountByStatusAsync(int userId, ReminderStatus status)
    {
        return await _context.Reminders
            .CountAsync(r => r.UserId == userId && r.Status == status);
    }
} 