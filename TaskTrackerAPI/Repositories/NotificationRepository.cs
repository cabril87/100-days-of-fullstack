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
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.DTOs.Notifications;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories.Interfaces;

namespace TaskTrackerAPI.Repositories;

public class NotificationRepository : INotificationRepository
{
    private readonly ApplicationDbContext _context;

    public NotificationRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Notification>> GetAllNotificationsAsync()
    {
        return await _context.Notifications
            .Include(n => n.User)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Notification>> GetNotificationsByUserIdAsync(int userId)
    {
        return await _context.Notifications
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Notification>> GetUnreadNotificationsByUserIdAsync(int userId)
    {
        return await _context.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync();
    }

    public async Task<Notification?> GetNotificationByIdAsync(int id)
    {
        return await _context.Notifications
            .Include(n => n.User)
            .FirstOrDefaultAsync(n => n.Id == id);
    }

    public async Task<bool> CreateNotificationAsync(Notification notification)
    {
        _context.Notifications.Add(notification);
        return await _context.SaveChangesAsync() > 0;
    }

    public async Task<bool> UpdateNotificationAsync(Notification notification)
    {
        _context.Notifications.Update(notification);
        return await _context.SaveChangesAsync() > 0;
    }

    public async Task<bool> DeleteNotificationAsync(int id)
    {
        Notification? notification = await _context.Notifications.FindAsync(id);
        if (notification == null)
            return false;

        _context.Notifications.Remove(notification);
        return await _context.SaveChangesAsync() > 0;
    }

    public async Task<bool> DeleteNotificationAsync(Notification notification)
    {
        _context.Notifications.Remove(notification);
        return await _context.SaveChangesAsync() > 0;
    }

    public async Task<bool> MarkAsReadAsync(int id)
    {
        Notification? notification = await _context.Notifications.FindAsync(id);
        if (notification == null)
            return false;

        notification.IsRead = true;
        notification.ReadAt = DateTime.UtcNow;
        return await _context.SaveChangesAsync() > 0;
    }

    public async Task<bool> MarkAllAsReadAsync(int userId)
    {
        List<Notification> notifications = await _context.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ToListAsync();

        if (!notifications.Any())
            return true;

        foreach (Notification notification in notifications)
        {
            notification.IsRead = true;
            notification.ReadAt = DateTime.UtcNow;
        }

        return await _context.SaveChangesAsync() > 0;
    }

    public async Task<int> GetUnreadCountAsync(int userId)
    {
        return await _context.Notifications
            .CountAsync(n => n.UserId == userId && !n.IsRead);
    }

    public async Task<Dictionary<string, int>> GetCountsByTypeAsync(int userId)
    {
        return await _context.Notifications
            .Where(n => n.UserId == userId)
            .GroupBy(n => n.NotificationType)
            .Select(g => new { Type = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.Type, x => x.Count);
    }

    public async Task<bool> IsOwnerAsync(int notificationId, int userId)
    {
        return await _context.Notifications
            .AnyAsync(n => n.Id == notificationId && n.UserId == userId);
    }

    public async Task<bool> IsNotificationOwnedByUserAsync(int notificationId, int userId)
    {
        return await _context.Notifications
            .AnyAsync(n => n.Id == notificationId && n.UserId == userId);
    }

    public async Task<IEnumerable<Notification>> FilterNotificationsAsync(
        int userId, 
        bool? isRead = null, 
        string? notificationType = null, 
        DateTime? fromDate = null, 
        DateTime? toDate = null, 
        string? searchTerm = null)
    {
        IQueryable<Notification> query = _context.Notifications.Where(n => n.UserId == userId);

        if (isRead.HasValue)
            query = query.Where(n => n.IsRead == isRead.Value);

        if (!string.IsNullOrEmpty(notificationType))
            query = query.Where(n => n.NotificationType == notificationType);

        if (fromDate.HasValue)
            query = query.Where(n => n.CreatedAt >= fromDate.Value);

        if (toDate.HasValue)
            query = query.Where(n => n.CreatedAt <= toDate.Value);

        if (!string.IsNullOrEmpty(searchTerm))
            query = query.Where(n => n.Title.Contains(searchTerm) || n.Message.Contains(searchTerm));

        return await query
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Notification>> GetFilteredNotificationsAsync(int userId, NotificationFilterDTO filter)
    {
        IQueryable<Notification> query = _context.Notifications.Where(n => n.UserId == userId);

        // Apply filters
        if (filter.IsRead.HasValue)
            query = query.Where(n => n.IsRead == filter.IsRead.Value);

        if (filter.IsImportant.HasValue)
            query = query.Where(n => n.IsImportant == filter.IsImportant.Value);

        if (filter.Type.HasValue)
            query = query.Where(n => n.Type == filter.Type.Value);

        if (!string.IsNullOrEmpty(filter.RelatedEntityType))
            query = query.Where(n => n.RelatedEntityType == filter.RelatedEntityType);

        if (filter.RelatedEntityId.HasValue)
            query = query.Where(n => n.RelatedEntityId == filter.RelatedEntityId.Value);

        if (filter.FromDate.HasValue)
            query = query.Where(n => n.CreatedAt >= filter.FromDate.Value);

        if (filter.ToDate.HasValue)
            query = query.Where(n => n.CreatedAt <= filter.ToDate.Value);

        return await query.OrderByDescending(n => n.CreatedAt)
            .ToListAsync();
    }

    public async Task<Notification?> MarkNotificationAsReadAsync(int notificationId)
    {
        Notification? notification = await _context.Notifications
            .FirstOrDefaultAsync(n => n.Id == notificationId);

        if (notification == null)
            return null;

        notification.IsRead = true;
        notification.ReadAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return notification;
    }

    public async Task<int> MarkAllNotificationsAsReadAsync(int userId)
    {
        DateTime now = DateTime.UtcNow;
        List<Notification> unreadNotifications = await _context.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ToListAsync();

        foreach (Notification notification in unreadNotifications)
        {
            notification.IsRead = true;
            notification.ReadAt = now;
        }

        await _context.SaveChangesAsync();
        return unreadNotifications.Count;
    }

    public async Task<int> GetUnreadNotificationCountAsync(int userId)
    {
        return await _context.Notifications
            .CountAsync(n => n.UserId == userId && !n.IsRead);
    }

    public async Task<NotificationCountDTO> GetNotificationCountsAsync(int userId)
    {
        NotificationCountDTO counts = new NotificationCountDTO
        {
            TotalCount = await _context.Notifications.CountAsync(n => n.UserId == userId),
            UnreadCount = await _context.Notifications.CountAsync(n => n.UserId == userId && !n.IsRead),
            ImportantCount = await _context.Notifications.CountAsync(n => n.UserId == userId && n.IsImportant)
        };

        return counts;
    }

    public async Task DeleteAllNotificationsAsync(int userId)
    {
        List<Notification> userNotifications = await _context.Notifications
            .Where(n => n.UserId == userId)
            .ToListAsync();

        _context.Notifications.RemoveRange(userNotifications);
        await _context.SaveChangesAsync();
    }
} 