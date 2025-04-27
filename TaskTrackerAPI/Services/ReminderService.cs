using AutoMapper;
using TaskTrackerAPI.DTOs.Tasks;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories.Interfaces;
using TaskTrackerAPI.Services.Interfaces;
using ModelReminderStatus = TaskTrackerAPI.Models.ReminderStatus;

namespace TaskTrackerAPI.Services;

public class ReminderService : IReminderService
{
    private readonly IReminderRepository _reminderRepository;
    private readonly ITaskItemRepository _taskItemRepository;
    private readonly IMapper _mapper;

    public ReminderService(
        IReminderRepository reminderRepository,
        ITaskItemRepository taskItemRepository,
        IMapper mapper)
    {
        _reminderRepository = reminderRepository;
        _taskItemRepository = taskItemRepository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<ReminderDTO>> GetAllRemindersAsync(int userId)
    {
        IEnumerable<Reminder> reminders = await _reminderRepository.GetAllRemindersAsync(userId);
        return _mapper.Map<IEnumerable<ReminderDTO>>(reminders);
    }

    public async Task<ReminderDTO?> GetReminderByIdAsync(int userId, int reminderId)
    {
        // Ensure reminder exists and belongs to user
        bool isOwned = await _reminderRepository.IsReminderOwnedByUserAsync(reminderId, userId);
        if (!isOwned)
        {
            return null;
        }

        Reminder? reminder = await _reminderRepository.GetReminderByIdAsync(reminderId);
        return reminder != null ? _mapper.Map<ReminderDTO>(reminder) : null;
    }

    public async Task<IEnumerable<ReminderDTO>> GetRemindersByStatusAsync(int userId, ModelReminderStatus status)
    {
        IEnumerable<Reminder> reminders = await _reminderRepository.GetRemindersByStatusAsync(userId, status);
        return _mapper.Map<IEnumerable<ReminderDTO>>(reminders);
    }

    public async Task<IEnumerable<ReminderDTO>> GetUpcomingRemindersAsync(int userId, int days)
    {
        DateTime endDate = DateTime.UtcNow.AddDays(days);
        IEnumerable<Reminder> reminders = await _reminderRepository.GetUpcomingRemindersAsync(userId, endDate);
        return _mapper.Map<IEnumerable<ReminderDTO>>(reminders);
    }

    public async Task<IEnumerable<ReminderDTO>> GetOverdueRemindersAsync(int userId)
    {
        IEnumerable<Reminder> reminders = await _reminderRepository.GetOverdueRemindersAsync(userId);
        return _mapper.Map<IEnumerable<ReminderDTO>>(reminders);
    }

    public async Task<IEnumerable<ReminderDTO>> GetRemindersByTaskIdAsync(int userId, int taskId)
    {
        // Verify the task belongs to the user
        bool isTaskOwned = await _taskItemRepository.IsTaskOwnedByUserAsync(taskId, userId);
        if (!isTaskOwned)
        {
            throw new UnauthorizedAccessException($"Task with ID {taskId} does not belong to the user");
        }

        IEnumerable<Reminder> reminders = await _reminderRepository.GetRemindersByTaskIdAsync(taskId);
        return _mapper.Map<IEnumerable<ReminderDTO>>(reminders);
    }

    public async Task<ReminderDTO?> CreateReminderAsync(int userId, CreateReminderDTO reminderDto)
    {
        // If a task ID is provided, verify it belongs to the user
        if (reminderDto.TaskId.HasValue)
        {
            bool isTaskOwned = await _taskItemRepository.IsTaskOwnedByUserAsync(reminderDto.TaskId.Value, userId);
            if (!isTaskOwned)
            {
                throw new UnauthorizedAccessException($"Task with ID {reminderDto.TaskId.Value} does not belong to the user");
            }
        }

        // Create and save the reminder
        Reminder reminder = _mapper.Map<Reminder>(reminderDto);
        reminder.UserId = userId;
        reminder.CreatedAt = DateTime.UtcNow;

        Reminder createdReminder = await _reminderRepository.CreateReminderAsync(reminder);
        return _mapper.Map<ReminderDTO>(createdReminder);
    }

    public async Task<ReminderDTO?> UpdateReminderAsync(int userId, int reminderId, UpdateReminderDTO reminderDto)
    {
        // Ensure reminder exists and belongs to user
        bool isOwned = await _reminderRepository.IsReminderOwnedByUserAsync(reminderId, userId);
        if (!isOwned)
        {
            return null;
        }

        // Get the existing reminder
        Reminder? existingReminder = await _reminderRepository.GetReminderByIdAsync(reminderId);
        if (existingReminder == null)
        {
            return null;
        }

        // Update properties
        if (reminderDto.Title != null)
            existingReminder.Title = reminderDto.Title;
            
        if (reminderDto.Description != null)
            existingReminder.Description = reminderDto.Description;
            
        if (reminderDto.ReminderTime.HasValue)
            existingReminder.ReminderTime = reminderDto.ReminderTime.Value;
            
        if (reminderDto.IsRecurring.HasValue)
            existingReminder.IsRepeating = reminderDto.IsRecurring.Value;
            
        if (reminderDto.RecurrencePattern != null)
            existingReminder.RepeatFrequency = (RepeatFrequency)int.Parse(reminderDto.RecurrencePattern);
            
        if (reminderDto.Priority.HasValue)
            existingReminder.Priority = (ReminderPriority)reminderDto.Priority.Value;
            
        if (reminderDto.Status.HasValue)
            existingReminder.Status = (ModelReminderStatus)reminderDto.Status.Value;
            
        existingReminder.UpdatedAt = DateTime.UtcNow;

        Reminder updatedReminder = await _reminderRepository.UpdateReminderAsync(existingReminder);
        return _mapper.Map<ReminderDTO>(updatedReminder);
    }

    public async Task DeleteReminderAsync(int userId, int reminderId)
    {
        // Ensure reminder exists and belongs to user
        bool isOwned = await _reminderRepository.IsReminderOwnedByUserAsync(reminderId, userId);
        if (!isOwned)
        {
            throw new ArgumentException($"Reminder with ID {reminderId} not found or does not belong to the user");
        }

        Reminder? reminder = await _reminderRepository.GetReminderByIdAsync(reminderId);
        if (reminder != null)
        {
            await _reminderRepository.DeleteReminderAsync(reminder);
        }
    }

    public async Task<bool> IsReminderOwnedByUserAsync(int reminderId, int userId)
    {
        return await _reminderRepository.IsReminderOwnedByUserAsync(reminderId, userId);
    }

    public async Task<ReminderDTO?> UpdateReminderStatusAsync(int userId, int reminderId, ModelReminderStatus status)
    {
        // Ensure reminder exists and belongs to user
        bool isOwned = await _reminderRepository.IsReminderOwnedByUserAsync(reminderId, userId);
        if (!isOwned)
        {
            return null;
        }

        // Get the existing reminder
        Reminder? existingReminder = await _reminderRepository.GetReminderByIdAsync(reminderId);
        if (existingReminder == null)
        {
            return null;
        }

        // Update status
        existingReminder.Status = status;
        
        // Update completed timestamp if completing the reminder
        if (status == ModelReminderStatus.Completed)
        {
            existingReminder.IsCompleted = true;
            existingReminder.CompletedAt = DateTime.UtcNow;
        }
        
        existingReminder.UpdatedAt = DateTime.UtcNow;

        Reminder updatedReminder = await _reminderRepository.UpdateReminderAsync(existingReminder);
        return _mapper.Map<ReminderDTO>(updatedReminder);
    }

    public async Task<ReminderStatisticsDTO> GetReminderStatisticsAsync(int userId)
    {
        DateTime now = DateTime.UtcNow;
        
        // Get counts
        int totalReminders = (await _reminderRepository.GetAllRemindersAsync(userId)).Count();
        int pendingReminders = await _reminderRepository.GetReminderCountByStatusAsync(userId, ModelReminderStatus.Pending);
        int completedReminders = await _reminderRepository.GetReminderCountByStatusAsync(userId, ModelReminderStatus.Completed);
        
        // Get upcoming reminders (next 7 days)
        DateTime nextWeek = now.AddDays(7);
        int upcomingReminders = (await _reminderRepository.GetUpcomingRemindersAsync(userId, nextWeek)).Count();
        
        // Get overdue reminders
        int overdueReminders = (await _reminderRepository.GetOverdueRemindersAsync(userId)).Count();
        
        // Calculate completion rate
        double completionRate = totalReminders > 0 
            ? (double)completedReminders / totalReminders * 100 
            : 0;

        return new ReminderStatisticsDTO
        {
            TotalReminders = totalReminders,
            PendingReminders = pendingReminders,
            CompletedReminders = completedReminders,
            UpcomingReminders = upcomingReminders,
            MissedReminders = overdueReminders,
            DueTodayReminders = 0 // Default value
        };
    }
} 