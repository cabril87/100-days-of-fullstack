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
using TaskTrackerAPI.DTOs.User;

namespace TaskTrackerAPI.Services.Interfaces;

public interface IUserCalendarService
{
    // Global calendar aggregation
    Task<UserGlobalCalendarDTO> GetUserGlobalCalendarAsync(int userId);
    Task<IEnumerable<FamilyCalendarEventWithFamilyDTO>> GetAllUserEventsAsync(int userId);
    Task<IEnumerable<FamilyCalendarEventWithFamilyDTO>> GetAllUserEventsInRangeAsync(int userId, DateTime startDate, DateTime endDate);
    Task<IEnumerable<FamilyCalendarEventWithFamilyDTO>> GetAllUserEventsTodayAsync(int userId);
    Task<IEnumerable<FamilyCalendarEventWithFamilyDTO>> GetAllUserUpcomingEventsAsync(int userId, int days = 7);
    
    // Family summaries
    Task<IEnumerable<UserFamilyCalendarSummaryDTO>> GetUserFamiliesCalendarSummaryAsync(int userId);
    
    // User availability
    Task<UserAvailabilityDTO> GetUserAvailabilityAsync(int userId, DateTime date);
    
    // Conflict detection
    Task<IEnumerable<CalendarConflictDTO>> GetUserCalendarConflictsAsync(int userId);
    
    // Statistics and analytics
    Task<UserCalendarStatisticsDTO> GetUserCalendarStatisticsAsync(int userId);
} 