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
using AutoMapper;
using TaskTrackerAPI.DTOs.Notifications;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories.Interfaces;
using TaskTrackerAPI.Services.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using System.Collections.Generic;
using System.Threading.Tasks;
using System;
using Microsoft.Extensions.Logging;

namespace TaskTrackerAPI.Services;

/// <summary>
/// Service for managing notifications
/// </summary>
public class NotificationService : INotificationService
{
    private readonly INotificationRepository _notificationRepository;
    private readonly IUserRepository _userRepository;
    private readonly IUnifiedRealTimeService _unifiedRealTimeService;
    private readonly IMapper _mapper;
    private readonly ILogger<NotificationService> _logger;
    private readonly IServiceProvider _serviceProvider;

    public NotificationService(
        INotificationRepository notificationRepository,
        IUserRepository userRepository,
        IUnifiedRealTimeService unifiedRealTimeService,
        IMapper mapper,
        ILogger<NotificationService> logger,
        IServiceProvider serviceProvider)
    {
        _notificationRepository = notificationRepository ?? throw new ArgumentNullException(nameof(notificationRepository));
        _userRepository = userRepository ?? throw new ArgumentNullException(nameof(userRepository));
        _unifiedRealTimeService = unifiedRealTimeService ?? throw new ArgumentNullException(nameof(unifiedRealTimeService));
        _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _serviceProvider = serviceProvider ?? throw new ArgumentNullException(nameof(serviceProvider));
    }

    public async Task<IEnumerable<NotificationDTO>> GetAllNotificationsAsync(int userId)
    {
        IEnumerable<Notification> notifications = await _notificationRepository.GetNotificationsByUserIdAsync(userId);
        IEnumerable<NotificationDTO> notificationDtos = _mapper.Map<IEnumerable<NotificationDTO>>(notifications);
        return notificationDtos;
    }

    public async Task<IEnumerable<NotificationDTO>> GetFilteredNotificationsAsync(int userId, NotificationFilterDTO filter)
    {
        IEnumerable<Notification> notifications = await _notificationRepository.GetFilteredNotificationsAsync(userId, filter);
        IEnumerable<NotificationDTO> notificationDtos = _mapper.Map<IEnumerable<NotificationDTO>>(notifications);
        return notificationDtos;
    }

    public async Task<NotificationDTO?> GetNotificationByIdAsync(int userId, int notificationId)
    {
        if (!await _notificationRepository.IsNotificationOwnedByUserAsync(notificationId, userId))
        {
            return null;
        }

        Notification? notification = await _notificationRepository.GetNotificationByIdAsync(notificationId);
        if (notification == null)
            return null;
        NotificationDTO notificationDto = _mapper.Map<NotificationDTO>(notification);
        return notificationDto;
    }

    public async Task<NotificationDTO?> CreateNotificationAsync(int userId, CreateNotificationDTO notificationDto)
    {
        return await CreateNotificationForUserAsync(userId, userId, notificationDto);
    }

    public async Task<NotificationDTO?> CreateNotificationForUserAsync(int creatorUserId, int targetUserId, CreateNotificationDTO notificationDto)
    {
        // Verify the target user exists
        User? user = await _userRepository.GetUserByIdAsync(targetUserId);
        if (user == null)
        {
            return null;
        }
        
        Notification notification = _mapper.Map<Notification>(notificationDto);
        notification.UserId = targetUserId;
        notification.CreatedAt = DateTime.UtcNow;
        
        await _notificationRepository.CreateNotificationAsync(notification);
        NotificationDTO result = _mapper.Map<NotificationDTO>(notification);
        
        // Send real-time notification
        await _unifiedRealTimeService.SendNotificationToUserAsync(targetUserId, result);
        
        // Update unread count
        int unreadCount = await _notificationRepository.GetUnreadNotificationCountAsync(targetUserId);
        NotificationCountsDTO counts = new NotificationCountsDTO { UnreadCount = unreadCount };
        await _unifiedRealTimeService.SendNotificationCountUpdateAsync(targetUserId, counts);
        
        return result;
    }

    public async Task<NotificationDTO?> MarkNotificationAsReadAsync(int userId, int notificationId)
    {
        if (!await _notificationRepository.IsNotificationOwnedByUserAsync(notificationId, userId))
        {
            return null;
        }
        
        await _notificationRepository.MarkNotificationAsReadAsync(notificationId);
        Notification? notification = await _notificationRepository.GetNotificationByIdAsync(notificationId);
        
        if (notification == null)
            return null;
            
        NotificationDTO notificationDto = _mapper.Map<NotificationDTO>(notification);
        
        await _unifiedRealTimeService.SendNotificationUpdateToUserAsync(userId, notificationId, true);
        
        // Update unread count
        int unreadCount = await _notificationRepository.GetUnreadNotificationCountAsync(userId);
        NotificationCountsDTO counts = new NotificationCountsDTO { UnreadCount = unreadCount };
        await _unifiedRealTimeService.SendNotificationCountUpdateAsync(userId, counts);
        
        return notificationDto;
    }

    public async Task<int> MarkAllNotificationsAsReadAsync(int userId)
    {
        int count = await _notificationRepository.MarkAllNotificationsAsReadAsync(userId);
        
        // Update unread count (should be 0)
        NotificationCountsDTO counts = new NotificationCountsDTO { UnreadCount = 0 };
        await _unifiedRealTimeService.SendNotificationCountUpdateAsync(userId, counts);
        
        return count;
    }

    public async Task DeleteNotificationAsync(int userId, int notificationId)
    {
        if (!await _notificationRepository.IsNotificationOwnedByUserAsync(notificationId, userId))
        {
            return;
        }
        
        Notification? notification = await _notificationRepository.GetNotificationByIdAsync(notificationId);
        
        if (notification != null)
        {
            await _notificationRepository.DeleteNotificationAsync(notification);
            
            // Update unread count
            int unreadCount = await _notificationRepository.GetUnreadNotificationCountAsync(userId);
            NotificationCountsDTO counts = new NotificationCountsDTO { UnreadCount = unreadCount };
            await _unifiedRealTimeService.SendNotificationCountUpdateAsync(userId, counts);
        }
    }

    public async Task DeleteAllNotificationsAsync(int userId)
    {
        await _notificationRepository.DeleteAllNotificationsAsync(userId);
        
        // Update unread count (should be 0)
        NotificationCountsDTO counts = new NotificationCountsDTO { UnreadCount = 0 };
        await _unifiedRealTimeService.SendNotificationCountUpdateAsync(userId, counts);
    }

    public async Task<NotificationCountDTO> GetNotificationCountsAsync(int userId)
    {
        return await _notificationRepository.GetNotificationCountsAsync(userId);
    }

    public async Task<int> GetUnreadNotificationCountAsync(int userId)
    {
        return await _notificationRepository.GetUnreadNotificationCountAsync(userId);
    }

    public async Task<bool> IsNotificationOwnedByUserAsync(int notificationId, int userId)
    {
        return await _notificationRepository.IsNotificationOwnedByUserAsync(notificationId, userId);
    }

    public async Task<NotificationDTO?> CreateTaskDeadlineNotificationAsync(int userId, int taskId, string message)
    {
        // Create a notification DTO for the task deadline
        CreateNotificationDTO notificationDto = new CreateNotificationDTO
        {
            Title = "Task Deadline Reminder",
            Message = message,
            NotificationType = "TaskDue",
            Type = _mapper.Map<NotificationTypeDTO>(NotificationType.TaskDue),
            IsImportant = true,
            RelatedEntityId = taskId,
            RelatedEntityType = "Task"
        };
        
        return await CreateNotificationAsync(userId, notificationDto);
    }
    
    public async Task<IEnumerable<NotificationDTO>> GenerateUpcomingDeadlineNotificationsAsync(int hoursThreshold = 24)
    {
        // Get all tasks with due dates within the threshold
        ITaskItemRepository taskRepository = _serviceProvider.GetRequiredService<ITaskItemRepository>();
        
        // Get current date/time
        DateTime now = DateTime.UtcNow;
        DateTime thresholdTime = now.AddHours(hoursThreshold);
        
        // Get tasks with due dates within the threshold that haven't been notified
        IEnumerable<TaskItem> upcomingTasks = await taskRepository.GetTasksWithUpcomingDeadlinesAsync(now, thresholdTime);
        
        List<NotificationDTO> createdNotifications = new List<NotificationDTO>();
        
        // Create notifications for each task
        foreach (TaskItem task in upcomingTasks)
        {
            // Skip tasks without due dates
            if (!task.DueDate.HasValue)
            {
                continue;
            }
            
            // Calculate hours remaining
            double hoursRemaining = (task.DueDate.Value - now).TotalHours;
            string timeMessage;
            
            if (hoursRemaining < 1)
            {
                timeMessage = "less than an hour";
            }
            else if (hoursRemaining < 2)
            {
                timeMessage = "about 1 hour";
            }
            else
            {
                timeMessage = $"about {Math.Round(hoursRemaining)} hours";
            }
            
            string message = $"Task '{task.Title}' is due in {timeMessage}";
            
            NotificationDTO? notification = await CreateTaskDeadlineNotificationAsync(task.UserId, task.Id, message);
            if (notification != null)
            {
                createdNotifications.Add(notification);
            }
        }
        
        return createdNotifications;
    }
} 