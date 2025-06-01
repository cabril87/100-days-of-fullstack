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
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.Data;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories.Interfaces;

namespace TaskTrackerAPI.Repositories;

public class UserCalendarRepository : IUserCalendarRepository
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<UserCalendarRepository> _logger;

    public UserCalendarRepository(ApplicationDbContext context, ILogger<UserCalendarRepository> logger)
    {
        _context = context;
        _logger = logger;
    }

    // User events aggregation across all families
    public async Task<IEnumerable<FamilyCalendarEvent>> GetAllUserEventsAsync(int userId)
    {
        var userFamilyIds = await GetUserFamilyIdsAsync(userId);

        return await _context.FamilyCalendarEvents
            .Where(e => userFamilyIds.Contains(e.FamilyId))
            .Include(e => e.CreatedByUser)
            .Include(e => e.Attendees)
                .ThenInclude(a => a.FamilyMember)
            .Include(e => e.Reminders)
            .Include(e => e.Family)
            .OrderBy(e => e.StartTime)
            .ToListAsync();
    }

    public async Task<IEnumerable<FamilyCalendarEvent>> GetUserEventsInRangeAsync(int userId, DateTime startDate, DateTime endDate)
    {
        var userFamilyIds = await GetUserFamilyIdsAsync(userId);

        return await _context.FamilyCalendarEvents
            .Where(e => userFamilyIds.Contains(e.FamilyId) &&
                       ((e.StartTime >= startDate && e.StartTime <= endDate) ||
                        (e.EndTime >= startDate && e.EndTime <= endDate) ||
                        (e.StartTime <= startDate && e.EndTime >= endDate)))
            .Include(e => e.CreatedByUser)
            .Include(e => e.Attendees)
                .ThenInclude(a => a.FamilyMember)
            .Include(e => e.Reminders)
            .Include(e => e.Family)
            .OrderBy(e => e.StartTime)
            .ToListAsync();
    }

    public async Task<IEnumerable<FamilyCalendarEvent>> GetUserEventsTodayAsync(int userId)
    {
        var today = DateTime.Today;
        var tomorrow = today.AddDays(1);
        return await GetUserEventsInRangeAsync(userId, today, tomorrow);
    }

    public async Task<IEnumerable<FamilyCalendarEvent>> GetUserUpcomingEventsAsync(int userId, int days = 7)
    {
        var startDate = DateTime.Today;
        var endDate = startDate.AddDays(days);
        return await GetUserEventsInRangeAsync(userId, startDate, endDate);
    }

    // User family summaries
    public async Task<IEnumerable<Family>> GetUserFamiliesAsync(int userId)
    {
        return await _context.Families
            .Where(f => f.Members.Any(m => m.UserId == userId))
            .Include(f => f.Members)
                .ThenInclude(m => m.Role)
            .Distinct()
            .ToListAsync();
    }

    public async Task<Dictionary<int, int>> GetFamilyEventCountsAsync(int userId)
    {
        var userFamilyIds = await GetUserFamilyIdsAsync(userId);

        return await _context.FamilyCalendarEvents
            .Where(e => userFamilyIds.Contains(e.FamilyId))
            .GroupBy(e => e.FamilyId)
            .ToDictionaryAsync(g => g.Key, g => g.Count());
    }

    public async Task<Dictionary<int, int>> GetFamilyUpcomingEventCountsAsync(int userId)
    {
        var userFamilyIds = await GetUserFamilyIdsAsync(userId);
        var now = DateTime.UtcNow;

        return await _context.FamilyCalendarEvents
            .Where(e => userFamilyIds.Contains(e.FamilyId) && e.StartTime > now)
            .GroupBy(e => e.FamilyId)
            .ToDictionaryAsync(g => g.Key, g => g.Count());
    }

    public async Task<Dictionary<int, int>> GetFamilyTodayEventCountsAsync(int userId)
    {
        var userFamilyIds = await GetUserFamilyIdsAsync(userId);
        var today = DateTime.Today;
        var tomorrow = today.AddDays(1);

        return await _context.FamilyCalendarEvents
            .Where(e => userFamilyIds.Contains(e.FamilyId) &&
                       e.StartTime >= today && e.StartTime < tomorrow)
            .GroupBy(e => e.FamilyId)
            .ToDictionaryAsync(g => g.Key, g => g.Count());
    }

    public async Task<Dictionary<int, int>> GetUserCreatedEventCountsAsync(int userId)
    {
        var userFamilyIds = await GetUserFamilyIdsAsync(userId);

        return await _context.FamilyCalendarEvents
            .Where(e => userFamilyIds.Contains(e.FamilyId) && e.CreatedById == userId)
            .GroupBy(e => e.FamilyId)
            .ToDictionaryAsync(g => g.Key, g => g.Count());
    }

    public async Task<Dictionary<int, int>> GetUserAttendingEventCountsAsync(int userId)
    {
        var userMemberIds = await GetUserMemberIdsAsync(userId);

        return await _context.FamilyEventAttendees
            .Where(a => userMemberIds.Contains(a.FamilyMemberId))
            .Include(a => a.Event)
            .GroupBy(a => a.Event!.FamilyId)
            .ToDictionaryAsync(g => g.Key, g => g.Count());
    }

    public async Task<Dictionary<int, DateTime?>> GetFamilyNextEventDatesAsync(int userId)
    {
        var userFamilyIds = await GetUserFamilyIdsAsync(userId);
        var now = DateTime.UtcNow;

        return await _context.FamilyCalendarEvents
            .Where(e => userFamilyIds.Contains(e.FamilyId) && e.StartTime > now)
            .GroupBy(e => e.FamilyId)
            .ToDictionaryAsync(
                g => g.Key,
                g => (DateTime?)g.Min(e => e.StartTime)
            );
    }

    public async Task<Dictionary<int, DateTime>> GetFamilyLastActivityDatesAsync(int userId)
    {
        var userFamilyIds = await GetUserFamilyIdsAsync(userId);

        return await _context.FamilyCalendarEvents
            .Where(e => userFamilyIds.Contains(e.FamilyId))
            .GroupBy(e => e.FamilyId)
            .ToDictionaryAsync(
                g => g.Key,
                g => g.Max(e => e.CreatedAt)
            );
    }

    // User availability and conflicts
    public async Task<IEnumerable<FamilyCalendarEvent>> GetUserConflictingEventsAsync(int userId, DateTime startDate, DateTime endDate)
    {
        var userFamilyIds = await GetUserFamilyIdsAsync(userId);

        var events = await _context.FamilyCalendarEvents
            .Where(e => userFamilyIds.Contains(e.FamilyId) &&
                       ((e.StartTime >= startDate && e.StartTime <= endDate) ||
                        (e.EndTime >= startDate && e.EndTime <= endDate) ||
                        (e.StartTime <= startDate && e.EndTime >= endDate)))
            .Include(e => e.CreatedByUser)
            .Include(e => e.Attendees)
                .ThenInclude(a => a.FamilyMember)
            .Include(e => e.Family)
            .OrderBy(e => e.StartTime)
            .ToListAsync();

        // Find conflicting events
        var conflicts = new List<FamilyCalendarEvent>();
        for (int i = 0; i < events.Count; i++)
        {
            for (int j = i + 1; j < events.Count; j++)
            {
                if (DoEventsOverlap(events[i], events[j]))
                {
                    if (!conflicts.Contains(events[i])) conflicts.Add(events[i]);
                    if (!conflicts.Contains(events[j])) conflicts.Add(events[j]);
                }
            }
        }

        return conflicts;
    }

    public async Task<IEnumerable<FamilyCalendarEvent>> GetUserEventsOnDateAsync(int userId, DateTime date)
    {
        var startOfDay = date.Date;
        var endOfDay = startOfDay.AddDays(1).AddTicks(-1);
        return await GetUserEventsInRangeAsync(userId, startOfDay, endOfDay);
    }

    // User statistics and analytics
    public async Task<int> GetUserTotalEventsCountAsync(int userId)
    {
        var userFamilyIds = await GetUserFamilyIdsAsync(userId);

        return await _context.FamilyCalendarEvents
            .CountAsync(e => userFamilyIds.Contains(e.FamilyId));
    }

    public async Task<int> GetUserUpcomingEventsCountAsync(int userId)
    {
        var userFamilyIds = await GetUserFamilyIdsAsync(userId);
        var now = DateTime.UtcNow;

        return await _context.FamilyCalendarEvents
            .CountAsync(e => userFamilyIds.Contains(e.FamilyId) && e.StartTime > now);
    }

    public async Task<int> GetUserPastEventsCountAsync(int userId)
    {
        var userFamilyIds = await GetUserFamilyIdsAsync(userId);
        var now = DateTime.UtcNow;

        return await _context.FamilyCalendarEvents
            .CountAsync(e => userFamilyIds.Contains(e.FamilyId) && e.EndTime < now);
    }

    public async Task<int> GetUserEventsCreatedCountAsync(int userId)
    {
        var userFamilyIds = await GetUserFamilyIdsAsync(userId);

        return await _context.FamilyCalendarEvents
            .CountAsync(e => userFamilyIds.Contains(e.FamilyId) && e.CreatedById == userId);
    }

    public async Task<int> GetUserEventsAttendingCountAsync(int userId)
    {
        var userMemberIds = await GetUserMemberIdsAsync(userId);

        return await _context.FamilyEventAttendees
            .CountAsync(a => userMemberIds.Contains(a.FamilyMemberId));
    }

    public async Task<Dictionary<string, int>> GetUserEventTypeDistributionAsync(int userId)
    {
        var userFamilyIds = await GetUserFamilyIdsAsync(userId);

        return await _context.FamilyCalendarEvents
            .Where(e => userFamilyIds.Contains(e.FamilyId))
            .GroupBy(e => e.EventType.ToString())
            .ToDictionaryAsync(g => g.Key, g => g.Count());
    }

    public async Task<Dictionary<string, int>> GetUserDailyActivityPatternAsync(int userId)
    {
        var userFamilyIds = await GetUserFamilyIdsAsync(userId);

        var events = await _context.FamilyCalendarEvents
            .Where(e => userFamilyIds.Contains(e.FamilyId))
            .ToListAsync();

        return events
            .GroupBy(e => e.StartTime.DayOfWeek.ToString())
            .ToDictionary(g => g.Key, g => g.Count());
    }

    public async Task<Dictionary<int, int>> GetUserHourlyActivityPatternAsync(int userId)
    {
        var userFamilyIds = await GetUserFamilyIdsAsync(userId);

        var events = await _context.FamilyCalendarEvents
            .Where(e => userFamilyIds.Contains(e.FamilyId))
            .ToListAsync();

        return events
            .GroupBy(e => e.StartTime.Hour)
            .ToDictionary(g => g.Key, g => g.Count());
    }

    public async Task<Dictionary<string, int>> GetUserMonthlyActivityPatternAsync(int userId)
    {
        var userFamilyIds = await GetUserFamilyIdsAsync(userId);

        var events = await _context.FamilyCalendarEvents
            .Where(e => userFamilyIds.Contains(e.FamilyId))
            .ToListAsync();

        return events
            .GroupBy(e => e.StartTime.ToString("yyyy-MM"))
            .ToDictionary(g => g.Key, g => g.Count());
    }

    public async Task<DateTime?> GetUserLastEventCreatedAsync(int userId)
    {
        var userFamilyIds = await GetUserFamilyIdsAsync(userId);

        var lastEvent = await _context.FamilyCalendarEvents
            .Where(e => userFamilyIds.Contains(e.FamilyId) && e.CreatedById == userId)
            .OrderByDescending(e => e.CreatedAt)
            .FirstOrDefaultAsync();

        return lastEvent?.CreatedAt;
    }

    public async Task<DateTime?> GetUserLastEventAttendedAsync(int userId)
    {
        var userMemberIds = await GetUserMemberIdsAsync(userId);
        var now = DateTime.UtcNow;

        var lastAttendedEvent = await _context.FamilyEventAttendees
            .Where(a => userMemberIds.Contains(a.FamilyMemberId))
            .Include(a => a.Event)
            .Where(a => a.Event!.EndTime < now)
            .OrderByDescending(a => a.Event!.EndTime)
            .FirstOrDefaultAsync();

        return lastAttendedEvent?.Event?.EndTime;
    }

    public async Task<DateTime?> GetUserNextUpcomingEventAsync(int userId)
    {
        var userFamilyIds = await GetUserFamilyIdsAsync(userId);
        var now = DateTime.UtcNow;

        var nextEvent = await _context.FamilyCalendarEvents
            .Where(e => userFamilyIds.Contains(e.FamilyId) && e.StartTime > now)
            .OrderBy(e => e.StartTime)
            .FirstOrDefaultAsync();

        return nextEvent?.StartTime;
    }

    // User permissions
    public async Task<bool> CanUserCreateEventsInFamilyAsync(int userId, int familyId)
    {
        var member = await GetUserMemberInFamilyAsync(userId, familyId);
        if (member?.Role == null) return false;

        var permissions = member.Role.Permissions.Select(p => p.Name).ToList();
        return permissions.Contains("calendar.create") || permissions.Contains("calendar.manage");
    }

    public async Task<bool> CanUserManageEventsInFamilyAsync(int userId, int familyId)
    {
        var member = await GetUserMemberInFamilyAsync(userId, familyId);
        if (member?.Role == null) return false;

        var permissions = member.Role.Permissions.Select(p => p.Name).ToList();
        return permissions.Contains("calendar.manage") || permissions.Contains("admin");
    }

    // User member information
    public async Task<FamilyMember?> GetUserMemberInFamilyAsync(int userId, int familyId)
    {
        return await _context.FamilyMembers
            .Include(m => m.User)
            .Include(m => m.Role)
            .Include(m => m.Family)
            .FirstOrDefaultAsync(m => m.UserId == userId && m.FamilyId == familyId);
    }

    public async Task<IEnumerable<FamilyMember>> GetUserMembershipsAsync(int userId)
    {
        return await _context.FamilyMembers
            .Where(m => m.UserId == userId)
            .Include(m => m.User)
            .Include(m => m.Role)
            .Include(m => m.Family)
            .ToListAsync();
    }

    // Helper methods
    private async Task<List<int>> GetUserFamilyIdsAsync(int userId)
    {
        return await _context.FamilyMembers
            .Where(fm => fm.UserId == userId)
            .Select(fm => fm.FamilyId)
            .ToListAsync();
    }

    private async Task<List<int>> GetUserMemberIdsAsync(int userId)
    {
        return await _context.FamilyMembers
            .Where(fm => fm.UserId == userId)
            .Select(fm => fm.Id)
            .ToListAsync();
    }

    private static bool DoEventsOverlap(FamilyCalendarEvent event1, FamilyCalendarEvent event2)
    {
        return event1.StartTime < event2.EndTime && event2.StartTime < event1.EndTime;
    }
}