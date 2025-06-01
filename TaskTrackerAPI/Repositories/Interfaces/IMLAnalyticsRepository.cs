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

namespace TaskTrackerAPI.Repositories.Interfaces
{
    public interface IMLAnalyticsRepository
    {
        // Focus Sessions
        Task<IEnumerable<FocusSession>> GetUserFocusSessionsAsync(int userId);
        Task<IEnumerable<FocusSession>> GetCompletedFocusSessionsAsync(int userId);
        Task<FocusSession?> GetFocusSessionAsync(int sessionId);
        
        // Tasks for ML Analysis
        Task<IEnumerable<TaskItem>> GetUserTasksForMLAsync(int userId);
        Task<IEnumerable<TaskItem>> GetCompletedTasksForDateAsync(int userId, DateTime date);
        Task<int> GetTasksCompletedTodayCountAsync(int userId);
        
        // Focus Analytics
        Task<double> GetAverageSessionLengthAsync(int userId);
        Task<int> GetWeeklyFocusMinutesAsync(int userId, DateTime startDate);
        Task<int> GetConsecutiveActiveDaysAsync(int userId, DateTime currentDate);
        Task<FocusSession?> GetLastFocusSessionAsync(int userId);
        
        // User Behavior Analytics
        Task<Dictionary<int, int>> GetHourlyProductivityPatternAsync(int userId);
        Task<Dictionary<DayOfWeek, double>> GetWeeklyProductivityPatternAsync(int userId);
        Task<IEnumerable<DateTime>> GetUserActiveHoursAsync(int userId, DateTime startDate, DateTime endDate);
        
        // Distraction Analytics
        Task<double> GetAverageDistractionsPerSessionAsync(int userId);
        Task<IEnumerable<Distraction>> GetUserDistractionsAsync(int userId);
        
        // Session Success Metrics
        Task<double> GetSessionSuccessRateAsync(int userId);
        Task<IEnumerable<FocusSession>> GetSuccessfulSessionsAsync(int userId, int minimumMinutes = 15, int maximumDistractions = 3);
        
        // Time Series Data
        Task<IEnumerable<DateTime>> GetFocusSessionDatesAsync(int userId, DateTime startDate, DateTime endDate);
        Task<Dictionary<DateTime, int>> GetDailyFocusMinutesAsync(int userId, DateTime startDate, DateTime endDate);
    }
} 