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
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories.Interfaces;

namespace TaskTrackerAPI.Repositories
{
    public class MLAnalyticsRepository : IMLAnalyticsRepository
    {
        private readonly ApplicationDbContext _context;

        public MLAnalyticsRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        #region Focus Sessions

        public async Task<IEnumerable<FocusSession>> GetUserFocusSessionsAsync(int userId)
        {
            return await _context.FocusSessions
                .Where(fs => fs.UserId == userId)
                .Include(fs => fs.Distractions)
                .OrderByDescending(fs => fs.StartTime)
                .ToListAsync();
        }

        public async Task<IEnumerable<FocusSession>> GetCompletedFocusSessionsAsync(int userId)
        {
            return await _context.FocusSessions
                .Where(fs => fs.UserId == userId && fs.EndTime.HasValue)
                .Include(fs => fs.Distractions)
                .OrderBy(fs => fs.StartTime)
                .ToListAsync();
        }

        public async Task<FocusSession?> GetFocusSessionAsync(int sessionId)
        {
            return await _context.FocusSessions
                .Include(fs => fs.Distractions)
                .FirstOrDefaultAsync(fs => fs.Id == sessionId);
        }

        #endregion

        #region Tasks for ML Analysis

        public async Task<IEnumerable<TaskItem>> GetUserTasksForMLAsync(int userId)
        {
            return await _context.Tasks
                .Where(t => t.UserId == userId)
                .Include(t => t.Category)
                .ToListAsync();
        }

        public async Task<IEnumerable<TaskItem>> GetCompletedTasksForDateAsync(int userId, DateTime date)
        {
            return await _context.Tasks
                .Where(t => t.UserId == userId && t.CompletedAt != null && t.CompletedAt.Value.Date == date.Date)
                .Include(t => t.Category)
                .ToListAsync();
        }

        public async Task<int> GetTasksCompletedTodayCountAsync(int userId)
        {
            var today = DateTime.Today;
            return await _context.Tasks
                .Where(t => t.UserId == userId && t.CompletedAt != null && t.CompletedAt.Value.Date == today)
                .CountAsync();
        }

        #endregion

        #region Focus Analytics

        public async Task<double> GetAverageSessionLengthAsync(int userId)
        {
            var sessions = await _context.FocusSessions
                .Where(fs => fs.UserId == userId && fs.EndTime.HasValue)
                .Select(fs => fs.DurationMinutes)
                .ToListAsync();

            return sessions.Any() ? sessions.Average() : 0;
        }

        public async Task<int> GetWeeklyFocusMinutesAsync(int userId, DateTime startDate)
        {
            var endDate = startDate.AddDays(7);
            return await _context.FocusSessions
                .Where(fs => fs.UserId == userId && fs.StartTime >= startDate && fs.StartTime < endDate)
                .SumAsync(fs => fs.DurationMinutes);
        }

        public async Task<int> GetConsecutiveActiveDaysAsync(int userId, DateTime currentDate)
        {
            var sessions = await _context.FocusSessions
                .Where(fs => fs.UserId == userId && fs.StartTime < currentDate)
                .OrderByDescending(fs => fs.StartTime)
                .Select(fs => fs.StartTime.Date)
                .Distinct()
                .ToListAsync();

            int consecutiveDays = 0;
            DateTime? previousDate = null;

            foreach (var date in sessions)
            {
                if (previousDate == null || previousDate.Value.AddDays(-1) == date)
                {
                    consecutiveDays++;
                    previousDate = date;
                }
                else
                {
                    break;
                }
            }

            return consecutiveDays;
        }

        public async Task<FocusSession?> GetLastFocusSessionAsync(int userId)
        {
            return await _context.FocusSessions
                .Where(fs => fs.UserId == userId && fs.EndTime.HasValue)
                .OrderByDescending(fs => fs.StartTime)
                .Include(fs => fs.Distractions)
                .FirstOrDefaultAsync();
        }

        #endregion

        #region User Behavior Analytics

        public async Task<Dictionary<int, int>> GetHourlyProductivityPatternAsync(int userId)
        {
            var tasks = await _context.Tasks
                .Where(t => t.UserId == userId && t.CompletedAt != null)
                .Select(t => t.CompletedAt!.Value.Hour)
                .ToListAsync();

            return tasks.GroupBy(hour => hour)
                       .ToDictionary(g => g.Key, g => g.Count());
        }

        public async Task<Dictionary<DayOfWeek, double>> GetWeeklyProductivityPatternAsync(int userId)
        {
            var tasks = await _context.Tasks
                .Where(t => t.UserId == userId && t.CompletedAt != null)
                .Select(t => new { DayOfWeek = t.CompletedAt!.Value.DayOfWeek })
                .ToListAsync();

            var grouped = tasks.GroupBy(t => t.DayOfWeek)
                              .ToDictionary(g => g.Key, g => (double)g.Count());

            // Ensure all days are represented
            foreach (DayOfWeek day in Enum.GetValues<DayOfWeek>())
            {
                if (!grouped.ContainsKey(day))
                    grouped[day] = 0;
            }

            return grouped;
        }

        public async Task<IEnumerable<DateTime>> GetUserActiveHoursAsync(int userId, DateTime startDate, DateTime endDate)
        {
            return await _context.FocusSessions
                .Where(fs => fs.UserId == userId && fs.StartTime >= startDate && fs.StartTime <= endDate)
                .Select(fs => fs.StartTime)
                .ToListAsync();
        }

        #endregion

        #region Distraction Analytics

        public async Task<double> GetAverageDistractionsPerSessionAsync(int userId)
        {
            var sessions = await _context.FocusSessions
                .Where(fs => fs.UserId == userId && fs.EndTime.HasValue)
                .Include(fs => fs.Distractions)
                .ToListAsync();

            return sessions.Any() ? sessions.Average(s => s.Distractions.Count) : 0;
        }

        public async Task<IEnumerable<Distraction>> GetUserDistractionsAsync(int userId)
        {
            List<Distraction> distractions = await _context.Distractions
                .Where(fd => fd.FocusSession != null && fd.FocusSession.UserId == userId )
                .Include(fd => fd.FocusSession)
                .ToListAsync();
            return distractions;
        }

        #endregion

        #region Session Success Metrics

        public async Task<double> GetSessionSuccessRateAsync(int userId)
        {
            var completedSessions = await GetCompletedFocusSessionsAsync(userId);
            if (!completedSessions.Any()) return 0;

            var successfulSessions = completedSessions.Count(s => 
                s.DurationMinutes >= 15 && s.Distractions.Count <= 3);

            return (double)successfulSessions / completedSessions.Count() * 100;
        }

        public async Task<IEnumerable<FocusSession>> GetSuccessfulSessionsAsync(int userId, int minimumMinutes = 15, int maximumDistractions = 3)
        {
            return await _context.FocusSessions
                .Where(fs => fs.UserId == userId && 
                           fs.EndTime.HasValue && 
                           fs.DurationMinutes >= minimumMinutes)
                .Include(fs => fs.Distractions)
                .Where(fs => fs.Distractions.Count <= maximumDistractions)
                .ToListAsync();
        }

        #endregion

        #region Time Series Data

        public async Task<IEnumerable<DateTime>> GetFocusSessionDatesAsync(int userId, DateTime startDate, DateTime endDate)
        {
            return await _context.FocusSessions
                .Where(fs => fs.UserId == userId && 
                           fs.StartTime >= startDate && 
                           fs.StartTime <= endDate)
                .Select(fs => fs.StartTime.Date)
                .Distinct()
                .OrderBy(d => d)
                .ToListAsync();
        }

        public async Task<Dictionary<DateTime, int>> GetDailyFocusMinutesAsync(int userId, DateTime startDate, DateTime endDate)
        {
            var sessions = await _context.FocusSessions
                .Where(fs => fs.UserId == userId && 
                           fs.StartTime >= startDate && 
                           fs.StartTime <= endDate)
                .GroupBy(fs => fs.StartTime.Date)
                .Select(g => new { Date = g.Key, Minutes = g.Sum(s => s.DurationMinutes) })
                .ToListAsync();

            return sessions.ToDictionary(s => s.Date, s => s.Minutes);
        }

        #endregion
    }
} 