using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Services.Interfaces;

public interface IReminderService
{
    Task<IEnumerable<ReminderDTO>> GetAllRemindersAsync(int userId);
    Task<ReminderDTO?> GetReminderByIdAsync(int userId, int reminderId);
    Task<IEnumerable<ReminderDTO>> GetRemindersByStatusAsync(int userId, ReminderStatus status);
    Task<IEnumerable<ReminderDTO>> GetUpcomingRemindersAsync(int userId, int days);
    Task<IEnumerable<ReminderDTO>> GetOverdueRemindersAsync(int userId);
    Task<IEnumerable<ReminderDTO>> GetRemindersByTaskIdAsync(int userId, int taskId);
    Task<ReminderDTO?> CreateReminderAsync(int userId, CreateReminderDTO reminderDto);
    Task<ReminderDTO?> UpdateReminderAsync(int userId, int reminderId, UpdateReminderDTO reminderDto);
    Task DeleteReminderAsync(int userId, int reminderId);
    Task<bool> IsReminderOwnedByUserAsync(int reminderId, int userId);
    Task<ReminderDTO?> UpdateReminderStatusAsync(int userId, int reminderId, ReminderStatus status);
    Task<ReminderStatisticsDTO> GetReminderStatisticsAsync(int userId);
} 