using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories.Interfaces;

namespace TaskTrackerAPI.Services
{
    public class TaskStatisticsService
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

            Dictionary<int, int> distribution = new Dictionary<int, int>();
            // Assuming priorities are 1-5, adjust as needed
            for (int i = 1; i <= 5; i++)
            {
                distribution[i] = 0;
            }

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

            foreach (KeyValuePair<int, int> kvp in distribution)
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

            // Add CompletedAt property to TaskItem model or use UpdatedAt as a proxy
            List<TaskItem> completedTasks = tasks.Where(t => 
                t.Status == TaskItemStatus.Completed && 
                t.UpdatedAt.HasValue && 
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
                TimeSpan completionTime = task.UpdatedAt!.Value - task.CreatedAt;
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
                    t.UpdatedAt.HasValue && 
                    t.UpdatedAt.Value.Date == date);
                    
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
                Dictionary<int, int> priorityGroups = overdueTasks.GroupBy(t => t.Priority)
                    .OrderByDescending(g => g.Key)
                    .ToDictionary(g => g.Key, g => g.Count());
                    
                foreach (KeyValuePair<int, int> kvp in priorityGroups)
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
                    ? categoryTasks.Max(t => t.UpdatedAt ?? t.CreatedAt) 
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
    }

    public class ProductivityPeriodDTO
    {
        public int PeriodNumber { get; set; }
        public int CompletedTasks { get; set; }
    }
} 