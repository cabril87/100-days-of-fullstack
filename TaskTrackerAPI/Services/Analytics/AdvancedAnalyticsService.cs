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
using TaskTrackerAPI.DTOs.Analytics;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Services.Interfaces;

namespace TaskTrackerAPI.Services.Analytics
{
    /// <summary>
    /// Service for advanced analytics functionality
    /// </summary>
    public class AdvancedAnalyticsService : IAdvancedAnalyticsService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<AdvancedAnalyticsService> _logger;

        public AdvancedAnalyticsService(ApplicationDbContext context, ILogger<AdvancedAnalyticsService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<AdvancedAnalyticsDTO> GetAdvancedAnalyticsAsync(int userId, DateTime? startDate = null, DateTime? endDate = null)
        {
            try
            {
                var start = startDate ?? DateTime.UtcNow.AddDays(-30);
                var end = endDate ?? DateTime.UtcNow;

                var taskTrends = await GetTaskTrendsAsync(userId, start, end);
                var productivityMetrics = await GetProductivityMetricsAsync(userId, start, end);
                var timeAnalysis = await GetTimeAnalysisAsync(userId, start, end);
                var categoryBreakdown = await GetCategoryBreakdownAsync(userId, start, end);

                return new AdvancedAnalyticsDTO
                {
                    TaskTrends = taskTrends,
                    ProductivityMetrics = productivityMetrics,
                    TimeAnalysis = timeAnalysis,
                    CategoryBreakdown = categoryBreakdown
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting advanced analytics for user {UserId}", userId);
                throw;
            }
        }

        public async Task<List<TaskTrendDTO>> GetTaskTrendsAsync(int userId, DateTime startDate, DateTime endDate, string granularity = "daily")
        {
            try
            {
                var tasks = await _context.Tasks
                    .Where(t => t.UserId == userId && t.CreatedAt >= startDate && t.CreatedAt <= endDate)
                    .ToListAsync();

                var trends = new List<TaskTrendDTO>();
                var current = startDate.Date;

                while (current <= endDate.Date)
                {
                    var nextDate = granularity switch
                    {
                        "weekly" => current.AddDays(7),
                        "monthly" => current.AddMonths(1),
                        _ => current.AddDays(1)
                    };

                    var periodTasks = tasks.Where(t => t.CreatedAt >= current && t.CreatedAt < nextDate).ToList();
                    var completedTasks = periodTasks.Where(t => t.Status == TaskItemStatus.Completed).ToList();
                    var overdueTasks = periodTasks.Where(t => t.DueDate.HasValue && t.DueDate < DateTime.UtcNow && t.Status != TaskItemStatus.Completed).ToList();

                    var trend = new TaskTrendDTO
                    {
                        Date = current,
                        TasksCreated = periodTasks.Count(),
                        TasksCompleted = completedTasks.Count(),
                        TasksOverdue = overdueTasks.Count(),
                        CompletionRate = periodTasks.Count() > 0 ? (double)completedTasks.Count() / periodTasks.Count() * 100 : 0
                    };

                    trends.Add(trend);
                    current = nextDate;
                }

                return trends;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting task trends for user {UserId}", userId);
                throw;
            }
        }

        public async Task<ProductivityMetricsDTO> GetProductivityMetricsAsync(int userId, DateTime startDate, DateTime endDate)
        {
            try
            {
                var tasks = await _context.Tasks
                    .Where(t => t.UserId == userId && t.CreatedAt >= startDate && t.CreatedAt <= endDate)
                    .ToListAsync();

                var completedTasks = tasks.Where(t => t.Status == TaskItemStatus.Completed).ToList();
                var totalDays = (endDate - startDate).Days + 1;
                var dailyAverage = totalDays > 0 ? (double)completedTasks.Count() / totalDays : 0;

                // Calculate weekly trends
                var weeklyTrends = new List<WeeklyTrendDTO>();
                var current = startDate.Date;
                while (current <= endDate.Date)
                {
                    var weekEnd = current.AddDays(7);
                    var weekTasks = completedTasks.Where(t => t.CompletedAt >= current && t.CompletedAt < weekEnd).ToList();
                    
                    weeklyTrends.Add(new WeeklyTrendDTO
                    {
                        Week = $"{current:yyyy-MM-dd}",
                        TasksCompleted = weekTasks.Count(),
                        AverageCompletionTime = weekTasks.Count() > 0 ? weekTasks.Average(t => 
                            t.CompletedAt.HasValue && t.CreatedAt != default ? 
                            (t.CompletedAt.Value - t.CreatedAt).TotalHours : 0) : 0,
                        ProductivityScore = CalculateProductivityScore(weekTasks)
                    });

                    current = weekEnd;
                }

                // Calculate peak hours
                var peakHours = completedTasks
                    .Where(t => t.CompletedAt.HasValue)
                    .GroupBy(t => t.CompletedAt!.Value.Hour)
                    .OrderByDescending(g => g.Count())
                    .Take(3)
                    .Select(g => g.Key)
                    .ToList();

                var efficiencyScore = CalculateEfficiencyScore(tasks, completedTasks);

                return new ProductivityMetricsDTO
                {
                    DailyAverage = dailyAverage,
                    WeeklyTrends = weeklyTrends,
                    PeakHours = peakHours,
                    EfficiencyScore = efficiencyScore
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting productivity metrics for user {UserId}", userId);
                throw;
            }
        }

        public async Task<FamilyAnalyticsDTO> GetFamilyAnalyticsAsync(int familyId, DateTime startDate, DateTime endDate)
        {
            try
            {
                var familyMembers = await _context.FamilyMembers
                    .Where(fm => fm.FamilyId == familyId)
                    .Include(fm => fm.User)
                    .ToListAsync();

                var memberIds = familyMembers.Select(fm => fm.UserId).ToList();

                var allTasks = await _context.Tasks
                    .Where(t => memberIds.Contains(t.UserId) && t.CreatedAt >= startDate && t.CreatedAt <= endDate)
                    .ToListAsync();

                var completedTasks = allTasks.Where(t => t.Status == TaskItemStatus.Completed).ToList();

                // Family productivity
                var familyProductivity = new FamilyProductivityDTO
                {
                    TotalTasks = allTasks.Count(),
                    CompletedTasks = completedTasks.Count(),
                    FamilyCompletionRate = allTasks.Count() > 0 ? (double)completedTasks.Count() / allTasks.Count() * 100 : 0,
                    AverageTasksPerMember = familyMembers.Count > 0 ? (double)allTasks.Count() / familyMembers.Count() : 0
                };

                // Member comparisons
                var memberComparisons = new List<MemberComparisonDTO>();
                foreach (var member in familyMembers)
                {
                    var memberTasks = allTasks.Where(t => t.UserId == member.UserId).ToList();
                    var memberCompleted = memberTasks.Where(t => t.Status == TaskItemStatus.Completed).ToList();

                    memberComparisons.Add(new MemberComparisonDTO
                    {
                        MemberId = member.UserId,
                        MemberName = member.User.Username,
                        TasksCompleted = memberCompleted.Count(),
                        CompletionRate = memberTasks.Count() > 0 ? (double)memberCompleted.Count() / memberTasks.Count() * 100 : 0,
                        ProductivityScore = CalculateProductivityScore(memberCompleted),
                        AverageCompletionTime = memberCompleted.Count() > 0 ? memberCompleted.Average(t => 
                            t.CompletedAt.HasValue && t.CreatedAt != default ? 
                            (t.CompletedAt.Value - t.CreatedAt).TotalHours : 0) : 0
                    });
                }

                // Collaboration metrics
                var sharedTasks = allTasks.Count(t => (t.AssignedToId.HasValue && t.AssignedToId != t.UserId) || 
                                                     t.AssignedToFamilyMemberId.HasValue);
                var collaborationMetrics = new CollaborationMetricsDTO
                {
                    SharedTasks = sharedTasks,
                    CollaborativeCompletionRate = sharedTasks > 0 ? 
                        (double)completedTasks.Count(t => (t.AssignedToId.HasValue && t.AssignedToId != t.UserId) || 
                                                         t.AssignedToFamilyMemberId.HasValue) / sharedTasks * 100 : 0,
                    MostActiveCollaborators = memberComparisons
                        .OrderByDescending(m => m.TasksCompleted)
                        .Take(3)
                        .Select(m => m.MemberName)
                        .ToList(),
                    TeamEfficiencyScore = memberComparisons.Count > 0 ? memberComparisons.Average(m => m.ProductivityScore) : 0
                };

                return new FamilyAnalyticsDTO
                {
                    FamilyProductivity = familyProductivity,
                    MemberComparisons = memberComparisons,
                    CollaborationMetrics = collaborationMetrics
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting family analytics for family {FamilyId}", familyId);
                throw;
            }
        }

        public async Task<object> GetComparativeAnalyticsAsync(int userId, List<int>? compareUserIds = null, 
            DateTime? startDate = null, DateTime? endDate = null, 
            DateTime? compareStartDate = null, DateTime? compareEndDate = null)
        {
            try
            {
                var start = startDate ?? DateTime.UtcNow.AddDays(-30);
                var end = endDate ?? DateTime.UtcNow;

                var userAnalytics = await GetAdvancedAnalyticsAsync(userId, start, end);

                var comparison = new
                {
                    CurrentPeriod = userAnalytics,
                    ComparisonUsers = new List<object>(),
                    ComparisonPeriod = (object?)null
                };

                // Compare with other users if specified
                if (compareUserIds?.Any() == true)
                {
                    var comparisonUsers = new List<object>();
                    foreach (var compareUserId in compareUserIds)
                    {
                        var compareAnalytics = await GetAdvancedAnalyticsAsync(compareUserId, start, end);
                        comparisonUsers.Add(new { UserId = compareUserId, Analytics = compareAnalytics });
                    }
                    comparison = comparison with { ComparisonUsers = comparisonUsers };
                }

                // Compare with previous period if specified
                if (compareStartDate.HasValue && compareEndDate.HasValue)
                {
                    var previousPeriodAnalytics = await GetAdvancedAnalyticsAsync(userId, compareStartDate.Value, compareEndDate.Value);
                    comparison = comparison with { ComparisonPeriod = previousPeriodAnalytics };
                }

                return comparison;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting comparative analytics for user {UserId}", userId);
                throw;
            }
        }

        public async Task<AdvancedAnalyticsDTO> GetTimeRangeAnalyticsAsync(int userId, string timeRange)
        {
            try
            {
                var endDate = DateTime.UtcNow;
                var startDate = timeRange switch
                {
                    "7d" => endDate.AddDays(-7),
                    "30d" => endDate.AddDays(-30),
                    "90d" => endDate.AddDays(-90),
                    "1y" => endDate.AddYears(-1),
                    _ => endDate.AddDays(-30)
                };

                return await GetAdvancedAnalyticsAsync(userId, startDate, endDate);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting time range analytics for user {UserId}", userId);
                throw;
            }
        }

        public async Task<TimeAnalysisDTO> GetTimeAnalysisAsync(int userId, DateTime startDate, DateTime endDate)
        {
            try
            {
                var tasks = await _context.Tasks
                    .Where(t => t.UserId == userId && t.CreatedAt >= startDate && t.CreatedAt <= endDate)
                    .ToListAsync();

                var completedTasks = tasks.Where(t => t.Status == TaskItemStatus.Completed && t.CompletedAt.HasValue).ToList();

                var averageCompletionTime = completedTasks.Count() > 0 ? 
                    completedTasks.Average(t => (t.CompletedAt!.Value - t.CreatedAt).TotalHours) : 0;

                var mostProductiveHour = completedTasks
                    .GroupBy(t => t.CompletedAt!.Value.Hour)
                    .OrderByDescending(g => g.Count())
                    .FirstOrDefault()?.Key ?? 9;

                var mostProductiveDay = completedTasks
                    .GroupBy(t => t.CompletedAt!.Value.DayOfWeek)
                    .OrderByDescending(g => g.Count())
                    .FirstOrDefault()?.Key.ToString() ?? "Monday";

                var totalTimeSpent = completedTasks.Sum(t => (t.CompletedAt!.Value - t.CreatedAt).TotalHours);

                var timeDistribution = completedTasks
                    .GroupBy(t => t.CompletedAt!.Value.Hour)
                    .Select(g => new TimeDistributionDTO
                    {
                        Hour = g.Key,
                        TaskCount = g.Count(),
                        CompletionRate = tasks.Count(t => t.CreatedAt.Hour == g.Key) > 0 ? 
                            (double)g.Count() / tasks.Count(t => t.CreatedAt.Hour == g.Key) * 100 : 0
                    })
                    .OrderBy(td => td.Hour)
                    .ToList();

                return new TimeAnalysisDTO
                {
                    AverageCompletionTime = averageCompletionTime,
                    MostProductiveHour = mostProductiveHour,
                    MostProductiveDay = mostProductiveDay,
                    TotalTimeSpent = totalTimeSpent,
                    TimeDistribution = timeDistribution
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting time analysis for user {UserId}", userId);
                throw;
            }
        }

        public async Task<List<CategoryBreakdownDTO>> GetCategoryBreakdownAsync(int userId, DateTime startDate, DateTime endDate)
        {
            try
            {
                var tasks = await _context.Tasks
                    .Include(t => t.Category)
                    .Where(t => t.UserId == userId && t.CreatedAt >= startDate && t.CreatedAt <= endDate)
                    .ToListAsync();

                var categoryBreakdown = tasks
                    .GroupBy(t => t.Category?.Name ?? "Uncategorized")
                    .Select(g =>
                    {
                        var categoryTasks = g.ToList();
                        var completedTasks = categoryTasks.Where(t => t.Status == TaskItemStatus.Completed).ToList();
                        
                        return new CategoryBreakdownDTO
                        {
                            Category = g.Key,
                            Count = categoryTasks.Count(),
                            Percentage = tasks.Count() > 0 ? (double)categoryTasks.Count() / tasks.Count() * 100 : 0,
                            CompletionRate = categoryTasks.Count() > 0 ? (double)completedTasks.Count() / categoryTasks.Count() * 100 : 0,
                            AverageTime = completedTasks.Count() > 0 ? 
                                completedTasks.Average(t => t.CompletedAt.HasValue ? 
                                    (t.CompletedAt.Value - t.CreatedAt).TotalHours : 0) : 0
                        };
                    })
                    .OrderByDescending(cb => cb.Count)
                    .ToList();

                return categoryBreakdown;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting category breakdown for user {UserId}", userId);
                throw;
            }
        }

        private static double CalculateProductivityScore(List<TaskItem> tasks)
        {
            if (!tasks.Any()) return 0;

            var completionRate = (double)tasks.Count(t => t.Status == TaskItemStatus.Completed) / tasks.Count;
            var onTimeRate = tasks.Count(t => t.DueDate.HasValue) > 0 ? 
                (double)tasks.Count(t => t.DueDate.HasValue && t.CompletedAt.HasValue && t.CompletedAt <= t.DueDate) / 
                tasks.Count(t => t.DueDate.HasValue) : 1;

            return (completionRate * 0.7 + onTimeRate * 0.3) * 100;
        }

        private static double CalculateEfficiencyScore(List<TaskItem> allTasks, List<TaskItem> completedTasks)
        {
            if (!allTasks.Any()) return 0;

            var completionRate = (double)completedTasks.Count() / allTasks.Count();
            var averageCompletionTime = completedTasks.Count() > 0 ? 
                completedTasks.Average(t => t.CompletedAt.HasValue ? 
                    (t.CompletedAt.Value - t.CreatedAt).TotalHours : 0) : 0;

            // Efficiency decreases with longer completion times
            var timeEfficiency = averageCompletionTime > 0 ? Math.Max(0, 1 - (averageCompletionTime / 168)) : 1; // 168 hours = 1 week

            return (completionRate * 0.6 + timeEfficiency * 0.4) * 100;
        }
    }
} 