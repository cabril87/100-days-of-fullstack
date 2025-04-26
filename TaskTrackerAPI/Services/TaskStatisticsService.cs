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

        public async Task<TaskStatisticsDTO> GetTaskStatisticsAsync(int userId)
        {
            try
            {
                IEnumerable<TaskItem> tasks = await _taskRepository.GetAllTasksAsync(userId);
                TaskStatisticsDTO result = new TaskStatisticsDTO
                {
                    GeneratedAt = DateTime.UtcNow
                };

                // Completion rate
                result.CompletionRate = await GetCompletionRateAsync(userId, tasks);

                // Tasks by status
                result.TasksByStatus = await GetTasksByStatusAsync(userId, tasks);

                // Tasks by priority
                result.TasksByPriority = await GetTasksByPriorityAsync(userId, tasks);

                // Tasks by category
                result.TasksByCategory = await GetTasksByCategoryAsync(userId, tasks);

                // Completion time
                result.CompletionTime = await GetCompletionTimeAsync(userId, tasks);

                // Productivity trend
                result.ProductivityTrend = await GetProductivityTrendAsync(userId, tasks);
                
                // Overdue tasks
                result.OverdueTasks = await GetOverdueTasksStatisticsAsync(userId, tasks);

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating task statistics for user {UserId}", userId);
                throw;
            }
        }

        private async Task<TaskCompletionRateDTO> GetCompletionRateAsync(int userId, IEnumerable<TaskItem> tasks = null!)
        {
            tasks ??= await _taskRepository.GetAllTasksAsync(userId);

            int totalTasks = tasks.Count();
            int completedTasks = tasks.Count(t => t.Status == TaskItemStatus.Completed);
            
            return new TaskCompletionRateDTO
            {
                TotalTasks = totalTasks,
                CompletedTasks = completedTasks,
                CompletionRate = totalTasks > 0 ? (double)completedTasks / totalTasks : 0
            };
        }

        private async Task<List<TaskDistributionDTO>> GetTasksByStatusAsync(int userId, IEnumerable<TaskItem> tasks = null!)
        {
            tasks ??= await _taskRepository.GetAllTasksAsync(userId);

            Dictionary<TaskItemStatus, int> distribution = new Dictionary<TaskItemStatus, int>();
            foreach (TaskItemStatus status in Enum.GetValues<TaskItemStatus>())
            {
                distribution[status] = 0;
            }

            foreach (TaskItem task in tasks)
            {
                distribution[task.Status]++;
            }

            int totalTasks = tasks.Count();
            List<TaskDistributionDTO> result = new List<TaskDistributionDTO>();

            foreach (KeyValuePair<TaskItemStatus, int> kvp in distribution)
            {
                result.Add(new TaskDistributionDTO
                {
                    Label = kvp.Key.ToString(),
                    Count = kvp.Value,
                    Percentage = totalTasks > 0 ? (double)kvp.Value / totalTasks * 100 : 0
                });
            }

            return result;
        }

        private async Task<List<TaskDistributionDTO>> GetTasksByPriorityAsync(int userId, IEnumerable<TaskItem> tasks = null!)
        {
            tasks ??= await _taskRepository.GetAllTasksAsync(userId);

            Dictionary<string, int> distribution = new Dictionary<string, int>
            {
                { "Low", 0 },
                { "Medium", 0 },
                { "High", 0 },
                { "Critical", 0 }
            };

            foreach (TaskItem task in tasks)
            {
                if (distribution.ContainsKey(task.Priority))
                {
                    distribution[task.Priority]++;
                }
                else
                {
                    distribution[task.Priority] = 1;
                }
            }

            int totalTasks = tasks.Count();
            List<TaskDistributionDTO> result = new List<TaskDistributionDTO>();

            foreach (KeyValuePair<string, int> kvp in distribution)
            {
                result.Add(new TaskDistributionDTO
                {
                    Label = $"Priority {kvp.Key}",
                    Count = kvp.Value,
                    Percentage = totalTasks > 0 ? (double)kvp.Value / totalTasks * 100 : 0
                });
            }

            return result;
        }

        private async Task<List<TaskDistributionDTO>> GetTasksByCategoryAsync(int userId, IEnumerable<TaskItem> tasks = null!)
        {
            tasks ??= await _taskRepository.GetAllTasksAsync(userId);

            IEnumerable<Category> categories = await _categoryRepository.GetCategoriesForUserAsync(userId);
            Dictionary<int, string> categoryMap = categories.ToDictionary(c => c.Id, c => c.Name);
            
            // Use an approach that doesn't involve null keys in dictionaries
            Dictionary<int, int> categoryTaskCounts = new Dictionary<int, int>();
            int uncategorizedCount = 0;
            
            foreach (Category category in categories)
            {
                categoryTaskCounts[category.Id] = 0;
            }

            foreach (TaskItem task in tasks)
            {
                if (task.CategoryId.HasValue)
                {
                    if (categoryTaskCounts.ContainsKey(task.CategoryId.Value))
                    {
                        categoryTaskCounts[task.CategoryId.Value]++;
                    }
                    else
                    {
                        categoryTaskCounts[task.CategoryId.Value] = 1;
                    }
                }
                else
                {
                    uncategorizedCount++;
                }
            }

            int totalTasks = tasks.Count();
            List<TaskDistributionDTO> result = new List<TaskDistributionDTO>();

            foreach (KeyValuePair<int, int> kvp in categoryTaskCounts)
            {
                string label = categoryMap.GetValueOrDefault(kvp.Key, "Unknown");
                
                result.Add(new TaskDistributionDTO
                {
                    Label = label,
                    Count = kvp.Value,
                    Percentage = totalTasks > 0 ? (double)kvp.Value / totalTasks * 100 : 0
                });
            }
            
            // Add uncategorized tasks
            if (uncategorizedCount > 0)
            {
                result.Add(new TaskDistributionDTO
                {
                    Label = "Uncategorized",
                    Count = uncategorizedCount,
                    Percentage = totalTasks > 0 ? (double)uncategorizedCount / totalTasks * 100 : 0
                });
            }

            return result;
        }

        private async Task<TaskCompletionTimeDTO> GetCompletionTimeAsync(int userId, IEnumerable<TaskItem> tasks = null!)
        {
            tasks ??= await _taskRepository.GetAllTasksAsync(userId);

            // Filter completed tasks
            List<TaskItem> completedTasks = tasks.Where(t => 
                t.Status == TaskItemStatus.Completed && 
                t.CreatedAt != default).ToList();
            
            if (!completedTasks.Any())
            {
                return new TaskCompletionTimeDTO
                {
                    AverageCompletionTimeInHours = 0,
                    TasksAnalyzed = 0
                };
            }

            double totalHours = 0;
            foreach (TaskItem task in completedTasks)
            {
                TimeSpan completionTime = task.UpdatedAt - task.CreatedAt;
                totalHours += completionTime.TotalHours;
            }

            return new TaskCompletionTimeDTO
            {
                AverageCompletionTimeInHours = totalHours / completedTasks.Count,
                TasksAnalyzed = completedTasks.Count
            };
        }

        private async Task<List<ProductivityDataPointDTO>> GetProductivityTrendAsync(int userId, IEnumerable<TaskItem> tasks = null!)
        {
            tasks ??= await _taskRepository.GetAllTasksAsync(userId);

            // Get data for the last 30 days
            DateTime endDate = DateTime.UtcNow.Date;
            DateTime startDate = endDate.AddDays(-29); // 30 days including today
            
            List<ProductivityDataPointDTO> result = new List<ProductivityDataPointDTO>();
            
            for (DateTime date = startDate; date <= endDate; date = date.AddDays(1))
            {
                int tasksCompleted = tasks.Count(t => 
                    t.Status == TaskItemStatus.Completed && 
                    t.UpdatedAt.Date == date);
                    
                int tasksCreated = tasks.Count(t => 
                    t.CreatedAt.Date == date);
                
                result.Add(new ProductivityDataPointDTO
                {
                    Date = date,
                    TasksCompleted = tasksCompleted,
                    TasksCreated = tasksCreated
                });
            }
            
            return result;
        }

        private async Task<DTOs.OverdueTasksStatisticsDTO> GetOverdueTasksStatisticsAsync(int userId, IEnumerable<TaskItem> tasks = null!)
        {
            tasks ??= await _taskRepository.GetAllTasksAsync(userId);
            
            DateTime today = DateTime.UtcNow.Date;
            List<TaskItem> overdueTasks = tasks.Where(t => 
                t.DueDate.HasValue && 
                t.DueDate.Value.Date < today && 
                t.Status != TaskItemStatus.Completed).ToList();
                
            DTOs.OverdueTasksStatisticsDTO result = new DTOs.OverdueTasksStatisticsDTO
            {
                TotalOverdueTasks = overdueTasks.Count,
                PercentageOfAllTasks = tasks.Any() ? (double)overdueTasks.Count / tasks.Count() * 100 : 0
            };
            
            if (overdueTasks.Any())
            {
                // Calculate average days overdue
                double totalDaysOverdue = 0;
                foreach (TaskItem task in overdueTasks)
                {
                    if (task.DueDate.HasValue)
                    {
                        totalDaysOverdue += (today - task.DueDate.Value.Date).Days;
                    }
                }
                
                result.AverageDaysOverdue = totalDaysOverdue / overdueTasks.Count;
                
                // Group by priority
                Dictionary<string, int> priorityGroups = overdueTasks.GroupBy(t => t.Priority)
                    .OrderByDescending(g => g.Key)
                    .ToDictionary(g => g.Key, g => g.Count());
                    
                foreach (KeyValuePair<string, int> kvp in priorityGroups)
                {
                    result.OverdueByPriority.Add(new TaskDistributionDTO
                    {
                        Label = $"Priority {kvp.Key}",
                        Count = kvp.Value,
                        Percentage = (double)kvp.Value / overdueTasks.Count * 100
                    });
                }
            }
            
            return result;
        }

        // Keeping the original method for API compatibility
        public async Task<double> GetTaskCompletionRateAsync(int userId)
        {
            TaskCompletionRateDTO stats = await GetCompletionRateAsync(userId);
            return stats.CompletionRate;
        }

        // Keeping the original method for API compatibility
        public async Task<Dictionary<TaskItemStatus, int>> GetTasksByStatusDistributionAsync(int userId)
        {
            List<TaskDistributionDTO> distribution = await GetTasksByStatusAsync(userId);
            return distribution.ToDictionary(
                d => Enum.Parse<TaskItemStatus>(d.Label), 
                d => d.Count);
        }

        // Keeping the original method for API compatibility
        public async Task<TimeSpan> GetTaskCompletionTimeAverageAsync(int userId)
        {
            TaskCompletionTimeDTO stats = await GetCompletionTimeAsync(userId);
            return TimeSpan.FromHours(stats.AverageCompletionTimeInHours);
        }

        // Keeping the original method for API compatibility
        public async Task<Dictionary<int, int>> GetTasksByPriorityDistributionAsync(int userId)
        {
            List<TaskDistributionDTO> distribution = await GetTasksByPriorityAsync(userId);
            return distribution.ToDictionary(
                d => int.Parse(d.Label.Replace("Priority ", "")), 
                d => d.Count);
        }

        // Method to get most active categories
        public async Task<List<CategoryActivityDTO>> GetMostActiveCategoriesAsync(int userId, int limit)
        {
            IEnumerable<TaskItem> tasks = await _taskRepository.GetAllTasksAsync(userId);
            IEnumerable<Category> categories = await _categoryRepository.GetCategoriesForUserAsync(userId);
            
            List<CategoryActivityDTO> categoryActivities = categories.Select(category => 
            {
                List<TaskItem> categoryTasks = tasks.Where(t => t.CategoryId == category.Id).ToList();
                int completedTasks = categoryTasks.Count(t => t.Status == TaskItemStatus.Completed);
                DateTime lastActivity = categoryTasks.Any() 
                    ? categoryTasks.Max(t => t.UpdatedAt) 
                    : DateTime.MinValue;
                
                return new CategoryActivityDTO
                {
                    CategoryId = category.Id,
                    Name = category.Name ?? string.Empty,
                    TaskCount = categoryTasks.Count,
                    CompletedTaskCount = completedTasks,
                    LastActivityDate = lastActivity,
                    CompletionRate = categoryTasks.Any() ? (double)completedTasks / categoryTasks.Count * 100 : 0
                };
            })
            .OrderByDescending(c => c.TaskCount)
            .ThenByDescending(c => c.LastActivityDate)
            .Take(limit)
            .ToList();
            
            return categoryActivities;
        }

        // Helper method to validate user access to a task
        public async Task ValidateUserAccess(int taskId, int userId)
        {
            if (!await _taskRepository.IsTaskOwnedByUserAsync(taskId, userId))
            {
                throw new UnauthorizedAccessException("You do not have access to this task");
            }
        }

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

                ProductivityAnalyticsDTO analytics = new ProductivityAnalyticsDTO
                {
                    GeneratedAt = DateTime.UtcNow,
                    TimeOfDayAnalytics = await GetTimeOfDayProductivityAsync(userId, tasksInRange),
                    DailyProductivity = await GetDailyProductivityAsync(userId, tasksInRange, effectiveStartDate, effectiveEndDate),
                    WeeklyProductivity = await GetWeeklyProductivityAsync(userId, tasksInRange, effectiveStartDate, effectiveEndDate),
                    MonthlyProductivity = await GetMonthlyProductivityAsync(userId, tasksInRange, effectiveStartDate, effectiveEndDate)
                };

                // Calculate averages
                if (analytics.DailyProductivity.Any())
                {
                    analytics.AverageTasksPerDay = analytics.DailyProductivity.Average(d => d.CreatedTasks);
                }

                if (analytics.WeeklyProductivity.Any())
                {
                    analytics.AverageTasksPerWeek = analytics.WeeklyProductivity.Average(w => w.CreatedTasks);
                }

                // Get completion times for completed tasks
                IEnumerable<TaskItem> completedTasks = tasksInRange.Where(t => 
                    t.Status == TaskItemStatus.Completed && 
                    t.CompletedAt.HasValue);

                if (completedTasks.Any())
                {
                    analytics.AverageCompletionRate = (double)completedTasks.Count() / tasksInRange.Count();
                    
                    List<TimeSpan> completionTimes = completedTasks
                        .Where(t => t.CompletedAt.HasValue)
                        .Select(t => t.CompletedAt!.Value - t.CreatedAt)
                        .ToList();
                    
                    if (completionTimes.Any())
                    {
                        analytics.AverageTimeToComplete = TimeSpan.FromTicks((long)completionTimes.Average(t => t.Ticks));
                    }
                }

                return analytics;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating productivity analytics for user {UserId}", userId);
                throw;
            }
        }

        private async Task<List<TimeOfDayProductivityDTO>> GetTimeOfDayProductivityAsync(int userId, IEnumerable<TaskItem> tasks = null!)
        {
            tasks ??= await _taskRepository.GetAllTasksAsync(userId);

            // Define time frames
            TimeFrame[] timeFrames = new[]
            {
                new TimeFrame("Early Morning (5AM-8AM)", 5, 8),
                new TimeFrame("Morning (8AM-12PM)", 8, 12),
                new TimeFrame("Afternoon (12PM-5PM)", 12, 17),
                new TimeFrame("Evening (5PM-9PM)", 17, 21),
                new TimeFrame("Night (9PM-5AM)", 21, 5)
            };

            List<TimeOfDayProductivityDTO> result = new List<TimeOfDayProductivityDTO>();

            foreach (TimeFrame timeFrame in timeFrames)
            {
                // Tasks created in this time frame
                int created = tasks.Count(t => 
                    (timeFrame.Start <= timeFrame.End 
                        ? t.CreatedAt.Hour >= timeFrame.Start && t.CreatedAt.Hour < timeFrame.End
                        : t.CreatedAt.Hour >= timeFrame.Start || t.CreatedAt.Hour < timeFrame.End));

                // Tasks completed in this time frame
                int completed = tasks.Count(t => 
                    t.CompletedAt.HasValue && 
                    (timeFrame.Start <= timeFrame.End 
                        ? t.CompletedAt.Value.Hour >= timeFrame.Start && t.CompletedAt.Value.Hour < timeFrame.End
                        : t.CompletedAt.Value.Hour >= timeFrame.Start || t.CompletedAt.Value.Hour < timeFrame.End));

                result.Add(new TimeOfDayProductivityDTO
                {
                    TimeFrame = timeFrame.Name,
                    CreatedTasks = created,
                    CompletedTasks = completed,
                    CompletionRate = created > 0 ? (double)completed / created : 0
                });
            }

            return result;
        }

        private async Task<List<DailyProductivityDTO>> GetDailyProductivityAsync(
            int userId, 
            IEnumerable<TaskItem> tasks = null!, 
            DateTime startDate = default, 
            DateTime endDate = default)
        {
            tasks ??= await _taskRepository.GetAllTasksAsync(userId);

            if (startDate == default)
                startDate = DateTime.UtcNow.AddDays(-30);
            
            if (endDate == default)
                endDate = DateTime.UtcNow;

            List<DailyProductivityDTO> result = new List<DailyProductivityDTO>();
            
            for (DateTime date = startDate.Date; date <= endDate.Date; date = date.AddDays(1))
            {
                DateTime nextDate = date.AddDays(1);
                
                // Tasks created on this day
                int created = tasks.Count(t => t.CreatedAt.Date == date.Date);

                // Tasks completed on this day
                int completed = tasks.Count(t => 
                    t.CompletedAt.HasValue && 
                    t.CompletedAt.Value.Date == date.Date);

                // Calculate efficiency - ratio of tasks completed to created, normalized
                double efficiency = created > 0 
                    ? Math.Min((double)completed / created, 1.0) 
                    : completed > 0 ? 1.0 : 0.0;

                result.Add(new DailyProductivityDTO
                {
                    Date = date,
                    CreatedTasks = created,
                    CompletedTasks = completed,
                    CompletionRate = created > 0 ? (double)completed / created : 0,
                    EfficiencyScore = efficiency
                });
            }

            return result;
        }

        private async Task<List<WeeklyProductivityDTO>> GetWeeklyProductivityAsync(
            int userId, 
            IEnumerable<TaskItem> tasks = null!, 
            DateTime startDate = default, 
            DateTime endDate = default)
        {
            tasks ??= await _taskRepository.GetAllTasksAsync(userId);

            if (startDate == default)
                startDate = DateTime.UtcNow.AddDays(-90);
            
            if (endDate == default)
                endDate = DateTime.UtcNow;

            // Group tasks by ISO week number
            Calendar calendar = CultureInfo.CurrentCulture.Calendar;
            List<IGrouping<int, TaskItem>> weekGroups = tasks
                .Where(t => t.CreatedAt >= startDate && t.CreatedAt <= endDate)
                .GroupBy(t => calendar.GetWeekOfYear(t.CreatedAt, CalendarWeekRule.FirstFourDayWeek, DayOfWeek.Monday))
                .OrderBy(g => g.Key)
                .ToList();

            // Get categories for task analysis
            IEnumerable<Category> categories = await _categoryRepository.GetCategoriesForUserAsync(userId);
            Dictionary<int, string> categoryMap = categories.ToDictionary(c => c.Id, c => c.Name);

            List<WeeklyProductivityDTO> result = new List<WeeklyProductivityDTO>();

            foreach (IGrouping<int, TaskItem> weekGroup in weekGroups)
            {
                int weekNumber = weekGroup.Key;
                
                // Get week date range (Monday to Sunday)
                TaskItem firstTask = weekGroup.OrderBy(t => t.CreatedAt).First();
                DateTime weekStart = GetWeekStartDate(firstTask.CreatedAt);
                DateTime weekEnd = weekStart.AddDays(6);

                // Tasks created in this week
                int created = weekGroup.Count();
                
                // Tasks completed in this week
                int completed = tasks.Count(t => 
                    t.CompletedAt.HasValue && 
                    t.CompletedAt.Value >= weekStart && 
                    t.CompletedAt.Value <= weekEnd);

                // Top categories
                IEnumerable<CategoryGroup> categoryDistribution = weekGroup
                    .Where(t => t.CategoryId.HasValue)
                    .GroupBy(t => t.CategoryId!.Value)
                    .Select(g => new CategoryGroup(g.Key, g.Count()))
                    .OrderByDescending(x => x.Count)
                    .Take(3);
                
                List<string> topCategories = new List<string>();
                foreach (CategoryGroup category in categoryDistribution)
                {
                    if (categoryMap.TryGetValue(category.CategoryId, out string? name) && !string.IsNullOrEmpty(name))
                    {
                        topCategories.Add(name);
                    }
                }

                // Calculate efficiency - ratio of tasks completed to created, normalized
                double efficiency = created > 0 
                    ? Math.Min((double)completed / created, 1.0) 
                    : completed > 0 ? 1.0 : 0.0;

                result.Add(new WeeklyProductivityDTO
                {
                    WeekNumber = weekNumber,
                    StartDate = weekStart,
                    EndDate = weekEnd,
                    CreatedTasks = created,
                    CompletedTasks = completed,
                    CompletionRate = created > 0 ? (double)completed / created : 0,
                    TopCategories = topCategories,
                    EfficiencyScore = efficiency
                });
            }

            return result;
        }

        private async Task<List<MonthlyProductivityDTO>> GetMonthlyProductivityAsync(
            int userId, 
            IEnumerable<TaskItem>? tasks = null, 
            DateTime startDate = default, 
            DateTime endDate = default)
        {
            tasks ??= await _taskRepository.GetAllTasksAsync(userId);

            if (startDate == default)
                startDate = DateTime.UtcNow.AddMonths(-12);
            
            if (endDate == default)
                endDate = DateTime.UtcNow;

            // Group tasks by month
            List<IGrouping<YearMonth, TaskItem>> monthlyGroups = tasks
                .Where(t => t.CreatedAt >= startDate && t.CreatedAt <= endDate)
                .GroupBy(t => new YearMonth(t.CreatedAt.Year, t.CreatedAt.Month))
                .OrderBy(g => g.Key.Year)
                .ThenBy(g => g.Key.Month)
                .ToList();

            // Get categories for task analysis
            IEnumerable<Category> categories = await _categoryRepository.GetCategoriesForUserAsync(userId);
            Dictionary<int, string> categoryMap = categories.ToDictionary(c => c.Id, c => c.Name);

            List<MonthlyProductivityDTO> result = new List<MonthlyProductivityDTO>();

            foreach (IGrouping<YearMonth, TaskItem> monthGroup in monthlyGroups)
            {
                int year = monthGroup.Key.Year;
                int month = monthGroup.Key.Month;
                
                // First and last day of month
                DateTime monthStart = new DateTime(year, month, 1);
                DateTime monthEnd = monthStart.AddMonths(1).AddDays(-1);

                // Tasks created in this month
                int created = monthGroup.Count();
                
                // Tasks completed in this month
                int completed = tasks.Count(t => 
                    t.CompletedAt.HasValue && 
                    t.CompletedAt.Value.Year == year && 
                    t.CompletedAt.Value.Month == month);

                // Top categories
                IEnumerable<CategoryGroup> categoryDistribution = monthGroup
                    .Where(t => t.CategoryId.HasValue)
                    .GroupBy(t => t.CategoryId!.Value)
                    .Select(g => new CategoryGroup(g.Key, g.Count()))
                    .OrderByDescending(x => x.Count)
                    .Take(3);
                
                List<string> topCategories = new List<string>();
                foreach (CategoryGroup category in categoryDistribution)
                {
                    if (categoryMap.TryGetValue(category.CategoryId, out string? name) && !string.IsNullOrEmpty(name))
                    {
                        topCategories.Add(name);
                    }
                }

                // Calculate efficiency - ratio of tasks completed to created, normalized
                double efficiency = created > 0 
                    ? Math.Min((double)completed / created, 1.0) 
                    : completed > 0 ? 1.0 : 0.0;

                result.Add(new MonthlyProductivityDTO
                {
                    Year = year,
                    Month = month,
                    CreatedTasks = created,
                    CompletedTasks = completed,
                    CompletionRate = created > 0 ? (double)completed / created : 0,
                    TopCategories = topCategories,
                    EfficiencyScore = efficiency
                });
            }

            return result;
        }

        private DateTime GetWeekStartDate(DateTime date)
        {
            int diff = (7 + (date.DayOfWeek - DayOfWeek.Monday)) % 7;
            return date.AddDays(-1 * diff).Date;
        }

        private async Task<EfficiencyMetricsDTO> GetEfficiencyMetricsAsync(
            int userId, 
            IEnumerable<TaskItem>? tasks = null)
        {
            tasks ??= await _taskRepository.GetAllTasksAsync(userId);

            IEnumerable<TaskItem> completedTasks = tasks.Where(t => t.Status == TaskItemStatus.Completed && t.CompletedAt.HasValue);
            
            // Calculate average time to complete (in hours)
            double avgTimeToComplete = 0;
            int completedCount = 0;
            
            foreach (TaskItem task in completedTasks)
            {
                if (task.CompletedAt.HasValue)
                {
                    TimeSpan duration = task.CompletedAt.Value - task.CreatedAt;
                    avgTimeToComplete += duration.TotalHours;
                    completedCount++;
                }
            }
            
            if (completedCount > 0)
                avgTimeToComplete /= completedCount;

            // Tasks completed on time (due date respected)
            int onTimeCount = completedTasks.Count(t => 
                !t.DueDate.HasValue || // No due date
                (t.CompletedAt.HasValue && t.CompletedAt.Value <= t.DueDate.Value)); // Completed before due
            
            // Overdue tasks at completion
            int overdueCount = completedTasks.Count(t => 
                t.DueDate.HasValue && t.CompletedAt.HasValue && t.CompletedAt.Value > t.DueDate.Value);
            
            // Currently overdue tasks
            int currentlyOverdue = tasks.Count(t => 
                t.Status != TaskItemStatus.Completed && 
                t.DueDate.HasValue && 
                t.DueDate.Value < DateTime.UtcNow);
            
            // On-time completion rate
            double onTimeCompletionRate = completedCount > 0 
                ? (double)onTimeCount / completedCount 
                : 0;
            
            return new EfficiencyMetricsDTO
            {
                AverageTimeToComplete = Math.Round(avgTimeToComplete, 1),
                TasksCompletedOnTime = onTimeCount,
                OverdueTasks = overdueCount,
                CurrentlyOverdueTasks = currentlyOverdue,
                OnTimeCompletionRate = Math.Round(onTimeCompletionRate * 100, 1)
            };
        }
    }

    public class ProductivityPeriodDTO
    {
        public int PeriodNumber { get; set; }
        public int CompletedTasks { get; set; }
    }
} 