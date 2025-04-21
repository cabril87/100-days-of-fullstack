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
            .Include(r => r.TaskItem)
            .FirstOrDefaultAsync(r => r.Id == reminderId);
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
        DateTime now = DateTime.UtcNow;
        return await _context.Reminders
            .Where(r => r.UserId == userId && 
                   r.ReminderTime < now &&
                   r.Status != ReminderStatus.Completed &&
                   r.Status != ReminderStatus.Dismissed)
            .OrderBy(r => r.ReminderTime)
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