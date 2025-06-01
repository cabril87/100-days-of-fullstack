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
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.DTOs.Analytics;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Services.Interfaces;
using TaskTrackerAPI.Repositories.Interfaces;

namespace TaskTrackerAPI.Services.Analytics
{
    /// <summary>
    /// Service for advanced analytics functionality
    /// </summary>
    public class AdvancedAnalyticsService : IAdvancedAnalyticsService
    {
        private readonly ITaskItemRepository _taskRepository;
        private readonly IFamilyMemberRepository _familyMemberRepository;
        private readonly ILogger<AdvancedAnalyticsService> _logger;

        public AdvancedAnalyticsService(
            ITaskItemRepository taskRepository,
            IFamilyMemberRepository familyMemberRepository,
            ILogger<AdvancedAnalyticsService> logger)
        {
            _taskRepository = taskRepository ?? throw new ArgumentNullException(nameof(taskRepository));
            _familyMemberRepository = familyMemberRepository ?? throw new ArgumentNullException(nameof(familyMemberRepository));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<AdvancedAnalyticsDTO> GetAdvancedAnalyticsAsync(int userId, DateTime? startDate = null, DateTime? endDate = null)
        {
            try
            {
                DateTime start = startDate ?? DateTime.UtcNow.AddDays(-30);
                DateTime end = endDate ?? DateTime.UtcNow;

                List<TaskTrendDTO> taskTrends = await GetTaskTrendsAsync(userId, start, end);
                ProductivityMetricsDTO productivityMetrics = await GetProductivityMetricsAsync(userId, start, end);
                TimeAnalysisDTO timeAnalysis = await GetTimeAnalysisAsync(userId, start, end);
                List<CategoryBreakdownDTO> categoryBreakdown = await GetCategoryBreakdownAsync(userId, start, end);

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
                // Get all tasks for the user using repository
                IEnumerable<TaskItem> allUserTasks = await _taskRepository.GetAllTasksAsync(userId);
                List<TaskItem> tasks = allUserTasks.Where(t => t.CreatedAt >= startDate && t.CreatedAt <= endDate).ToList();

                List<TaskTrendDTO> trends = new List<TaskTrendDTO>();
                DateTime current = startDate.Date;

                while (current <= endDate.Date)
                {
                    DateTime nextDate = granularity switch
                    {
                        "weekly" => current.AddDays(7),
                        "monthly" => current.AddMonths(1),
                        _ => current.AddDays(1)
                    };

                    List<TaskItem> periodTasks = tasks.Where(t => t.CreatedAt >= current && t.CreatedAt < nextDate).ToList();
                    List<TaskItem> completedTasks = periodTasks.Where(t => t.Status == TaskItemStatus.Completed).ToList();
                    List<TaskItem> overdueTasks = periodTasks.Where(t => t.DueDate.HasValue && t.DueDate < DateTime.UtcNow && t.Status != TaskItemStatus.Completed).ToList();

                    TaskTrendDTO trend = new TaskTrendDTO
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
                // Get all tasks for the user using repository
                IEnumerable<TaskItem> allUserTasks = await _taskRepository.GetAllTasksAsync(userId);
                List<TaskItem> tasks = allUserTasks.Where(t => t.CreatedAt >= startDate && t.CreatedAt <= endDate).ToList();

                List<TaskItem> completedTasks = tasks.Where(t => t.Status == TaskItemStatus.Completed).ToList();
                int totalDays = (endDate - startDate).Days + 1;
                double dailyAverage = totalDays > 0 ? (double)completedTasks.Count() / totalDays : 0;

                // Calculate weekly trends
                List<WeeklyTrendDTO> weeklyTrends = new List<WeeklyTrendDTO>();
                DateTime current = startDate.Date;
                while (current <= endDate.Date)
                {
                    DateTime weekEnd = current.AddDays(7);
                    List<TaskItem> weekTasks = completedTasks.Where(t => t.CompletedAt >= current && t.CompletedAt < weekEnd).ToList();
                    
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
                List<int> peakHours = completedTasks
                    .Where(t => t.CompletedAt.HasValue)
                    .GroupBy(t => t.CompletedAt!.Value.Hour)
                    .OrderByDescending(g => g.Count())
                    .Take(3)
                    .Select(g => g.Key)
                    .ToList();

                double efficiencyScore = CalculateEfficiencyScore(tasks, completedTasks);

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
                IEnumerable<FamilyMember> familyMembersEnum = await _familyMemberRepository.GetByFamilyIdAsync(familyId);
                List<FamilyMember> familyMembers = familyMembersEnum.ToList();

                List<int> memberIds = familyMembers.Select(fm => fm.UserId).ToList();

                // Get tasks for all family members
                List<TaskItem> allTasks = new List<TaskItem>();
                foreach (int memberId in memberIds)
                {
                    IEnumerable<TaskItem> memberTasks = await _taskRepository.GetAllTasksAsync(memberId);
                    List<TaskItem> filteredTasks = memberTasks.Where(t => t.CreatedAt >= startDate && t.CreatedAt <= endDate).ToList();
                    allTasks.AddRange(filteredTasks);
                }

                List<TaskItem> completedTasks = allTasks.Where(t => t.Status == TaskItemStatus.Completed).ToList();

                // Family productivity
                FamilyProductivityDTO familyProductivity = new FamilyProductivityDTO
                {
                    TotalTasks = allTasks.Count(),
                    CompletedTasks = completedTasks.Count(),
                    FamilyCompletionRate = allTasks.Count() > 0 ? (double)completedTasks.Count() / allTasks.Count() * 100 : 0,
                    AverageTasksPerMember = familyMembers.Count > 0 ? (double)allTasks.Count() / familyMembers.Count() : 0
                };

                // Member comparisons
                List<MemberComparisonDTO> memberComparisons = new List<MemberComparisonDTO>();
                foreach (FamilyMember member in familyMembers)
                {
                    List<TaskItem> memberTasks = allTasks.Where(t => t.UserId == member.UserId).ToList();
                    List<TaskItem> memberCompleted = memberTasks.Where(t => t.Status == TaskItemStatus.Completed).ToList();

                    memberComparisons.Add(new MemberComparisonDTO
                    {
                        MemberId = member.UserId,
                        MemberName = $"User_{member.UserId}", // Would need User data to get actual username
                        TasksCompleted = memberCompleted.Count(),
                        CompletionRate = memberTasks.Count() > 0 ? (double)memberCompleted.Count() / memberTasks.Count() * 100 : 0,
                        ProductivityScore = CalculateProductivityScore(memberCompleted),
                        AverageCompletionTime = memberCompleted.Count() > 0 ? memberCompleted.Average(t => 
                            t.CompletedAt.HasValue && t.CreatedAt != default ? 
                            (t.CompletedAt.Value - t.CreatedAt).TotalHours : 0) : 0
                    });
                }

                // Collaboration metrics
                int sharedTasks = allTasks.Count(t => (t.AssignedToId.HasValue && t.AssignedToId != t.UserId) || 
                                                     t.AssignedToFamilyMemberId.HasValue);
                CollaborationMetricsDTO collaborationMetrics = new CollaborationMetricsDTO
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
                DateTime start = startDate ?? DateTime.UtcNow.AddDays(-30);
                DateTime end = endDate ?? DateTime.UtcNow;

                AdvancedAnalyticsDTO userAnalytics = await GetAdvancedAnalyticsAsync(userId, start, end);

                // Build comparison users list
                List<object> comparisonUsers = new List<object>();
                if (compareUserIds?.Any() == true)
                {
                    foreach (int compareUserId in compareUserIds)
                    {
                        AdvancedAnalyticsDTO compareAnalytics = await GetAdvancedAnalyticsAsync(compareUserId, start, end);
                        comparisonUsers.Add(new { UserId = compareUserId, Analytics = compareAnalytics });
                    }
                }

                // Build comparison period data
                object? comparisonPeriod = null;
                if (compareStartDate.HasValue && compareEndDate.HasValue)
                {
                    comparisonPeriod = await GetAdvancedAnalyticsAsync(userId, compareStartDate.Value, compareEndDate.Value);
                }

                object comparison = new
                {
                    CurrentPeriod = userAnalytics,
                    ComparisonUsers = comparisonUsers,
                    ComparisonPeriod = comparisonPeriod
                };

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
                DateTime endDate = DateTime.UtcNow;
                DateTime startDate = timeRange switch
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
                IEnumerable<TaskItem> allUserTasks = await _taskRepository.GetAllTasksAsync(userId);
                List<TaskItem> tasks = allUserTasks.Where(t => t.CreatedAt >= startDate && t.CreatedAt <= endDate).ToList();

                List<TaskItem> completedTasks = tasks.Where(t => t.Status == TaskItemStatus.Completed && t.CompletedAt.HasValue).ToList();

                double averageCompletionTime = completedTasks.Count() > 0 ? 
                    completedTasks.Average(t => (t.CompletedAt!.Value - t.CreatedAt).TotalHours) : 0;

                int mostProductiveHour = completedTasks
                    .GroupBy(t => t.CompletedAt!.Value.Hour)
                    .OrderByDescending(g => g.Count())
                    .FirstOrDefault()?.Key ?? 9;

                string mostProductiveDay = completedTasks
                    .GroupBy(t => t.CompletedAt!.Value.DayOfWeek)
                    .OrderByDescending(g => g.Count())
                    .FirstOrDefault()?.Key.ToString() ?? "Monday";

                double totalTimeSpent = completedTasks.Sum(t => (t.CompletedAt!.Value - t.CreatedAt).TotalHours);

                List<TimeDistributionDTO> timeDistribution = completedTasks
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
                IEnumerable<TaskItem> allUserTasks = await _taskRepository.GetAllTasksAsync(userId);
                List<TaskItem> tasks = allUserTasks.Where(t => t.CreatedAt >= startDate && t.CreatedAt <= endDate).ToList();

                List<CategoryBreakdownDTO> categoryBreakdown = tasks
                    .GroupBy(t => t.Category?.Name ?? "Uncategorized")
                    .Select(g =>
                    {
                        List<TaskItem> categoryTasks = g.ToList();
                        List<TaskItem> completedTasks = categoryTasks.Where(t => t.Status == TaskItemStatus.Completed).ToList();
                        
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

            double completionRate = (double)tasks.Count(t => t.Status == TaskItemStatus.Completed) / tasks.Count;
            double onTimeRate = tasks.Count(t => t.DueDate.HasValue) > 0 ? 
                (double)tasks.Count(t => t.DueDate.HasValue && t.CompletedAt.HasValue && t.CompletedAt <= t.DueDate) / 
                tasks.Count(t => t.DueDate.HasValue) : 1;

            return (completionRate * 0.7 + onTimeRate * 0.3) * 100;
        }

        private static double CalculateEfficiencyScore(List<TaskItem> allTasks, List<TaskItem> completedTasks)
        {
            if (!allTasks.Any()) return 0;

            double completionRate = (double)completedTasks.Count() / allTasks.Count();
            double averageCompletionTime = completedTasks.Count() > 0 ? 
                completedTasks.Average(t => t.CompletedAt.HasValue ? 
                    (t.CompletedAt.Value - t.CreatedAt).TotalHours : 0) : 0;

            // Efficiency decreases with longer completion times
            double timeEfficiency = averageCompletionTime > 0 ? Math.Max(0, 1 - (averageCompletionTime / 168)) : 1; // 168 hours = 1 week

            return (completionRate * 0.6 + timeEfficiency * 0.4) * 100;
        }
    }
} 