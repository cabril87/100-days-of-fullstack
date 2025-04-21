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
    Task<Reminder> CreateReminderAsync(Reminder reminder);
    Task<Reminder> UpdateReminderAsync(Reminder reminder);
    Task DeleteReminderAsync(Reminder reminder);
    Task<bool> IsReminderOwnedByUserAsync(int reminderId, int userId);
    Task<int> GetReminderCountByStatusAsync(int userId, ReminderStatus status);
} 