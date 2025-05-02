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
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories.Interfaces;
using System.Globalization;
using TaskTrackerAPI.Services.Interfaces;
using TaskTrackerAPI.DTOs.Tasks;

namespace TaskTrackerAPI.Services
{
    // Add helper records for explicit projections
    internal record TimeFrame(string Name, int Start, int End);
    internal record CategoryGroup(int CategoryId, int Count);
    internal record YearMonth(int Year, int Month);

    public class TaskStatisticsService : ITaskStatisticsService
    {
        private readonly ITaskItemRepository _taskRepository;
        private readonly ICategoryRepository _categoryRepository;
        private readonly ILogger<TaskStatisticsService> _logger;

        public TaskStatisticsService(
            ITaskItemRepository taskRepository,
            ICategoryRepository categoryRepository,
            ILogger<TaskStatisticsService> logger)
        {
            _taskRepository = taskRepository;
            _categoryRepository = categoryRepository;
            _logger = logger;
        }

        // Implement the interface method
        public async Task<TaskStatisticsDTO> GetTaskStatisticsAsync(int userId)
        {
            try
            {
                IEnumerable<TaskItem> tasks = await _taskRepository.GetAllTasksAsync(userId);
                
                TaskStatisticsDTO taskStatistics = new TaskStatisticsDTO
                {
                    TotalTasks = tasks.Count(),
                    CompletedTasks = tasks.Count(t => t.Status == TaskItemStatus.Completed),
                    OverdueTasks = tasks.Count(t => 
                        t.DueDate.HasValue && 
                        t.DueDate.Value.Date < DateTime.UtcNow.Date && 
                        t.Status != TaskItemStatus.Completed),
                    DueTodayTasks = tasks.Count(t => 
                        t.DueDate.HasValue && 
                        t.DueDate.Value.Date == DateTime.UtcNow.Date),
                    DueThisWeekTasks = tasks.Count(t => 
                        t.DueDate.HasValue && 
                        t.DueDate.Value.Date > DateTime.UtcNow.Date && 
                        t.DueDate.Value.Date <= DateTime.UtcNow.Date.AddDays(7))
                };

                // Get completion rate
                taskStatistics.CompletionRate = tasks.Any() 
                    ? (double)taskStatistics.CompletedTasks / taskStatistics.TotalTasks * 100 
                    : 0;

                // Tasks by status
                taskStatistics.TasksByStatus = GetTasksByStatusDictionary(tasks);

                // Tasks by priority
                taskStatistics.TasksByPriority = GetTasksByPriorityDictionary(tasks);

                // Tasks by category
                taskStatistics.TasksByCategory = await GetTasksByCategoryDictionary(userId, tasks);

                // Calculate average completion time
                taskStatistics.AverageCompletionTime = CalculateAverageCompletionTime(tasks);

                // Determine most active hour
                taskStatistics.MostActiveHour = GetMostActiveHour(tasks);
                
                // Determine most active day
                taskStatistics.MostActiveDay = GetMostActiveDay(tasks);

                // Get completion trend
                taskStatistics.CompletionTrend = GetCompletionTrend(tasks);

                return taskStatistics;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating task statistics for user {UserId}", userId);
                throw;
            }
        }

        private Dictionary<string, int> GetTasksByStatusDictionary(IEnumerable<TaskItem> tasks)
        {
            Dictionary<string, int> result = new Dictionary<string, int>();
            foreach (TaskItemStatus status in Enum.GetValues<TaskItemStatus>())
            {
                string statusName = status.ToString();
                int count = tasks.Count(t => t.Status == status);
                result[statusName] = count;
            }
            return result;
        }

        private Dictionary<int, int> GetTasksByPriorityDictionary(IEnumerable<TaskItem> tasks)
        {
            Dictionary<int, int> result = new Dictionary<int, int>();
            
            // Group tasks by priority
            Dictionary<int, int> priorityGroups = tasks
                .GroupBy(t => GetPriorityValue(t.Priority))
                .ToDictionary(g => g.Key, g => g.Count());

            foreach (int priority in new[] { 1, 2, 3, 4 }) // Common priority levels
            {
                result[priority] = priorityGroups.ContainsKey(priority) ? priorityGroups[priority] : 0;
            }

            return result;
        }

        private async Task<Dictionary<string, int>> GetTasksByCategoryDictionary(int userId, IEnumerable<TaskItem> tasks)
        {
            Dictionary<string, int> result = new Dictionary<string, int>();

            // Get categories
            IEnumerable<Category> categories = await _categoryRepository.GetCategoriesForUserAsync(userId);
            
            // Group tasks by category
            foreach (Category category in categories)
            {
                int count = tasks.Count(t => t.CategoryId == category.Id);
                result[category.Name ?? "Unknown"] = count;
            }
            
            // Add uncategorized tasks
            int uncategorizedCount = tasks.Count(t => !t.CategoryId.HasValue);
            if (uncategorizedCount > 0)
            {
                result["Uncategorized"] = uncategorizedCount;
            }

            return result;
        }

        private double CalculateAverageCompletionTime(IEnumerable<TaskItem> tasks)
        {
            List<TaskItem> completedTasks = tasks.Where(t => 
                t.Status == TaskItemStatus.Completed && 
                t.CompletedAt.HasValue).ToList();
            
            if (!completedTasks.Any())
                return 0;
                
            double totalMinutes = 0;
            foreach (TaskItem task in completedTasks)
            {
                TimeSpan completionTime = task.CompletedAt!.Value - task.CreatedAt;
                totalMinutes += completionTime.TotalMinutes;
            }

            return totalMinutes / completedTasks.Count;
        }

        private int GetMostActiveHour(IEnumerable<TaskItem> tasks)
        {
            IEnumerable<TaskItem> completedTasks = tasks.Where(t => t.CompletedAt.HasValue);
            if (!completedTasks.Any())
                return 9; // Default to 9 AM
                
            // Group by hour of day
            Dictionary<int, int> hourGroups = completedTasks
                .GroupBy(t => t.CompletedAt!.Value.Hour)
                .ToDictionary(g => g.Key, g => g.Count());
                
            return hourGroups.OrderByDescending(kvp => kvp.Value).First().Key;
        }

        private DayOfWeek GetMostActiveDay(IEnumerable<TaskItem> tasks)
        {
            IEnumerable<TaskItem> completedTasks = tasks.Where(t => t.CompletedAt.HasValue);
            if (!completedTasks.Any())
                return DayOfWeek.Monday; // Default
                
            // Group by day of week
            Dictionary<DayOfWeek, int> dayGroups = completedTasks
                .GroupBy(t => t.CompletedAt!.Value.DayOfWeek)
                .ToDictionary(g => g.Key, g => g.Count());
                
            return dayGroups.OrderByDescending(kvp => kvp.Value).First().Key;
        }

        private List<DateValuePair> GetCompletionTrend(IEnumerable<TaskItem> tasks)
        {
            // Get completed tasks from the last 30 days
            DateTime startDate = DateTime.UtcNow.Date.AddDays(-29);
            DateTime endDate = DateTime.UtcNow.Date;
            
            List<DateValuePair> result = new List<DateValuePair>();
            
            for (DateTime date = startDate; date <= endDate; date = date.AddDays(1))
            {
                int count = tasks.Count(t => 
                    t.CompletedAt.HasValue && 
                    t.CompletedAt.Value.Date == date);
                
                result.Add(new DateValuePair
                {
                    Date = date,
                    Value = count
                });
            }
            
            return result;
        }

        // Interface method implementation
        public async Task<ProductivityAnalyticsDTO> GetProductivityAnalyticsAsync(int userId, DateTime? startDate = null, DateTime? endDate = null)
        {
            try
            {
                // Default to last 30 days if no date range specified
                DateTime effectiveStartDate = startDate ?? DateTime.UtcNow.AddDays(-30);
                DateTime effectiveEndDate = endDate ?? DateTime.UtcNow;

                // Get all tasks within the date range
                IEnumerable<TaskItem> tasks = await _taskRepository.GetAllTasksAsync(userId);
                IEnumerable<TaskItem> tasksInRange = tasks.Where(t => 
                    t.CreatedAt >= effectiveStartDate && 
                    (t.CreatedAt <= effectiveEndDate || (t.CompletedAt.HasValue && t.CompletedAt <= effectiveEndDate)));

                // Create productivity analytics object from Tasks namespace
                ProductivityAnalyticsDTO analytics = new ProductivityAnalyticsDTO
                {
                    StartDate = effectiveStartDate,
                    EndDate = effectiveEndDate
                };

                // Add category breakdown
                analytics.CategoryBreakdown = await GetMostActiveCategoriesAsync(userId, 10);

                // Calculate hourly distribution
                Dictionary<int, int> hourlyDistribution = new Dictionary<int, int>();
                for (int hour = 0; hour < 24; hour++)
                {
                    hourlyDistribution[hour] = 0;
                }
                
                foreach (TaskItem task in tasksInRange.Where(t => t.Status == TaskItemStatus.Completed))
                {
                    if (task.CompletedAt.HasValue)
                    {
                        int hour = task.CompletedAt.Value.Hour;
                        hourlyDistribution[hour]++;
                    }
                }
                analytics.HourlyDistribution = hourlyDistribution;

                // Calculate day of week distribution
                Dictionary<DayOfWeek, int> dayOfWeekDistribution = new Dictionary<DayOfWeek, int>();
                foreach (DayOfWeek day in Enum.GetValues<DayOfWeek>())
                {
                    dayOfWeekDistribution[day] = 0;
                }
                
                foreach (TaskItem task in tasksInRange.Where(t => t.Status == TaskItemStatus.Completed))
                {
                    if (task.CompletedAt.HasValue)
                    {
                        DayOfWeek day = task.CompletedAt.Value.DayOfWeek;
                        dayOfWeekDistribution[day]++;
                    }
                }
                analytics.DayOfWeekDistribution = dayOfWeekDistribution;

                // Calculate completion trends
                List<DateValuePair> completionTrend = new List<DateValuePair>();
                for (DateTime date = effectiveStartDate.Date; date <= effectiveEndDate.Date; date = date.AddDays(1))
                {
                    int completedOnDay = tasksInRange.Count(t => 
                        t.CompletedAt.HasValue && t.CompletedAt.Value.Date == date);
                    
                    completionTrend.Add(new DateValuePair
                    {
                        Date = date,
                        Value = completedOnDay
                    });
                }
                analytics.DailyCompletions = completionTrend;

                // Calculate average completion time
                IEnumerable<TaskItem> completedTasks = tasksInRange.Where(t => 
                    t.Status == TaskItemStatus.Completed && t.CompletedAt.HasValue);

                if (completedTasks.Any())
                {
                    double totalHours = 0;
                    foreach (TaskItem task in completedTasks)
                    {
                        TimeSpan completionTime = task.CompletedAt!.Value - task.CreatedAt;
                        totalHours += completionTime.TotalHours;
                    }
                    analytics.AverageCompletionTime = totalHours / completedTasks.Count();
                }

                // Find best day
                if (completionTrend.Any())
                {
                    DateValuePair bestDay = completionTrend.OrderByDescending(p => p.Value).First();
                    analytics.BestDay = bestDay;
                }

                // Calculate productivity score (a simple metric between 0-100)
                double completionRate = tasksInRange.Any() 
                    ? (double)completedTasks.Count() / tasksInRange.Count() * 100 
                    : 0;
                analytics.ProductivityScore = completionRate;

                // Add summary
                analytics.Summary = new ProductivitySummaryDTO
                {
                    PrimaryInsight = GeneratePrimaryInsight(analytics),
                    Suggestions = GenerateSuggestions(analytics)
                };

                return analytics;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating productivity analytics for user {UserId}", userId);
                throw;
            }
        }

        private string GeneratePrimaryInsight(ProductivityAnalyticsDTO analytics)
        {
            if (analytics.DailyCompletions.Any())
            {
                if (analytics.ProductivityScore >= 75)
                {
                    return "Great job! Your completion rate is excellent.";
                }
                else if (analytics.ProductivityScore >= 50)
                {
                    return "You're doing well with task completion, but there's room for improvement.";
                }
                else
                {
                    return "Your task completion rate is low. Focus on completing more tasks.";
                }
            }
            return "Not enough data to generate insights yet.";
        }

        private List<string> GenerateSuggestions(ProductivityAnalyticsDTO analytics)
        {
            List<string> suggestions = new List<string>();
            
            // Add some basic suggestions based on the data
            if (analytics.HourlyDistribution.Any())
            {
                int mostProductiveHour = analytics.HourlyDistribution.OrderByDescending(kvp => kvp.Value).First().Key;
                suggestions.Add($"You're most productive at {mostProductiveHour}:00. Consider scheduling important tasks during this time.");
            }
            
            if (analytics.DayOfWeekDistribution.Any())
            {
                DayOfWeek mostProductiveDay = analytics.DayOfWeekDistribution.OrderByDescending(kvp => kvp.Value).First().Key;
                suggestions.Add($"You complete more tasks on {mostProductiveDay}. Try to allocate more work on this day.");
            }
            
            if (analytics.AverageCompletionTime > 24)
            {
                suggestions.Add("Your average completion time is quite long. Consider breaking tasks into smaller, more manageable pieces.");
            }

            return suggestions;
        }

        // Interface method implementation
        public async Task<double> GetTaskCompletionRateAsync(int userId)
        {
            IEnumerable<TaskItem> tasks = await _taskRepository.GetAllTasksAsync(userId);
            int total = tasks.Count();
            int completed = tasks.Count(t => t.Status == TaskItemStatus.Completed);
            
            return total > 0 ? (double)completed / total : 0;
        }

        // Interface method implementation
        public async Task<Dictionary<TaskItemStatus, int>> GetTasksByStatusDistributionAsync(int userId)
        {
            IEnumerable<TaskItem> tasks = await _taskRepository.GetAllTasksAsync(userId);
            Dictionary<TaskItemStatus, int> result = new Dictionary<TaskItemStatus, int>();
            
            foreach (TaskItemStatus status in Enum.GetValues<TaskItemStatus>())
            {
                result[status] = tasks.Count(t => t.Status == status);
            }

            return result;
        }

        // Interface method implementation
        public async Task<TimeSpan> GetTaskCompletionTimeAverageAsync(int userId)
        {
            IEnumerable<TaskItem> tasks = await _taskRepository.GetAllTasksAsync(userId);
            List<TaskItem> completedTasks = tasks
                .Where(t => t.Status == TaskItemStatus.Completed && t.CompletedAt.HasValue)
                .ToList();

            if (!completedTasks.Any())
                return TimeSpan.Zero;
                
            double totalMinutes = 0;
            foreach (TaskItem task in completedTasks)
            {
                TimeSpan completionTime = task.CompletedAt!.Value - task.CreatedAt;
                totalMinutes += completionTime.TotalMinutes;
            }
            
            return TimeSpan.FromMinutes(totalMinutes / completedTasks.Count);
        }

        // Interface method implementation
        public async Task<Dictionary<int, int>> GetTasksByPriorityDistributionAsync(int userId)
        {
            IEnumerable<TaskItem> tasks = await _taskRepository.GetAllTasksAsync(userId);
            
            return GetTasksByPriorityDictionary(tasks);
        }
        
        private int GetPriorityValue(string priorityName)
        {
            return priorityName?.ToLower() switch
            {
                "low" => 1,
                "medium" => 2,
                "high" => 3,
                "critical" => 4,
                _ => 0
            };
        }

        // Interface method implementation
        public async Task<List<CategoryActivityDTO>> GetMostActiveCategoriesAsync(int userId, int limit)
        {
            IEnumerable<TaskItem> tasks = await _taskRepository.GetAllTasksAsync(userId);
            IEnumerable<Category> categories = await _categoryRepository.GetCategoriesForUserAsync(userId);
            
            List<CategoryActivityDTO> categoryActivities = categories.Select(category => 
            {
                List<TaskItem> categoryTasks = tasks.Where(t => t.CategoryId == category.Id).ToList();
                int completedTasks = categoryTasks.Count(t => t.Status == TaskItemStatus.Completed);
                
                return new CategoryActivityDTO
                {
                    CategoryId = category.Id,
                    CategoryName = category.Name ?? string.Empty,
                    CompletedTasks = completedTasks,
                    Percentage = categoryTasks.Any() && tasks.Any() 
                        ? (double)categoryTasks.Count / tasks.Count() * 100 
                        : 0
                };
            })
            .OrderByDescending(c => c.CompletedTasks)
            .Take(limit)
            .ToList();
            
            return categoryActivities;
                }

        // Interface method implementation
        public async Task ValidateUserAccess(int taskId, int userId)
        {
            if (!await _taskRepository.IsTaskOwnedByUserAsync(taskId, userId))
            {
                throw new UnauthorizedAccessException("You do not have access to this task");
            }
        }

        private DateTime GetWeekStartDate(DateTime date)
        {
            int diff = (7 + (date.DayOfWeek - DayOfWeek.Monday)) % 7;
            return date.AddDays(-1 * diff).Date;
        }
    }

    public class ProductivityPeriodDTO
    {
        public int PeriodNumber { get; set; }
        public int CompletedTasks { get; set; }
    }
} 