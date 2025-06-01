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

public interface IUserCalendarRepository
{
    // User events aggregation across all families
    Task<IEnumerable<FamilyCalendarEvent>> GetAllUserEventsAsync(int userId);
    Task<IEnumerable<FamilyCalendarEvent>> GetUserEventsInRangeAsync(int userId, DateTime startDate, DateTime endDate);
    Task<IEnumerable<FamilyCalendarEvent>> GetUserEventsTodayAsync(int userId);
    Task<IEnumerable<FamilyCalendarEvent>> GetUserUpcomingEventsAsync(int userId, int days = 7);
    
    // User family summaries
    Task<IEnumerable<Family>> GetUserFamiliesAsync(int userId);
    Task<Dictionary<int, int>> GetFamilyEventCountsAsync(int userId);
    Task<Dictionary<int, int>> GetFamilyUpcomingEventCountsAsync(int userId);
    Task<Dictionary<int, int>> GetFamilyTodayEventCountsAsync(int userId);
    Task<Dictionary<int, int>> GetUserCreatedEventCountsAsync(int userId);
    Task<Dictionary<int, int>> GetUserAttendingEventCountsAsync(int userId);
    Task<Dictionary<int, DateTime?>> GetFamilyNextEventDatesAsync(int userId);
    Task<Dictionary<int, DateTime>> GetFamilyLastActivityDatesAsync(int userId);
    
    // User availability and conflicts
    Task<IEnumerable<FamilyCalendarEvent>> GetUserConflictingEventsAsync(int userId, DateTime startDate, DateTime endDate);
    Task<IEnumerable<FamilyCalendarEvent>> GetUserEventsOnDateAsync(int userId, DateTime date);
    
    // User statistics and analytics
    Task<int> GetUserTotalEventsCountAsync(int userId);
    Task<int> GetUserUpcomingEventsCountAsync(int userId);
    Task<int> GetUserPastEventsCountAsync(int userId);
    Task<int> GetUserEventsCreatedCountAsync(int userId);
    Task<int> GetUserEventsAttendingCountAsync(int userId);
    Task<Dictionary<string, int>> GetUserEventTypeDistributionAsync(int userId);
    Task<Dictionary<string, int>> GetUserDailyActivityPatternAsync(int userId);
    Task<Dictionary<int, int>> GetUserHourlyActivityPatternAsync(int userId);
    Task<Dictionary<string, int>> GetUserMonthlyActivityPatternAsync(int userId);
    Task<DateTime?> GetUserLastEventCreatedAsync(int userId);
    Task<DateTime?> GetUserLastEventAttendedAsync(int userId);
    Task<DateTime?> GetUserNextUpcomingEventAsync(int userId);
    
    // User permissions
    Task<bool> CanUserCreateEventsInFamilyAsync(int userId, int familyId);
    Task<bool> CanUserManageEventsInFamilyAsync(int userId, int familyId);
    
    // User member information
    Task<FamilyMember?> GetUserMemberInFamilyAsync(int userId, int familyId);
    Task<IEnumerable<FamilyMember>> GetUserMembershipsAsync(int userId);
} 