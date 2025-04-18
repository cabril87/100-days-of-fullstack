using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Services.Interfaces
{
    public interface ITaskStatisticsService
    {
        Task<TaskStatisticsDTO> GetTaskStatisticsAsync(int userId);
        Task<ProductivityAnalyticsDTO> GetProductivityAnalyticsAsync(int userId, DateTime? startDate = null, DateTime? endDate = null);
        Task<double> GetTaskCompletionRateAsync(int userId);
        Task<Dictionary<TaskItemStatus, int>> GetTasksByStatusDistributionAsync(int userId);
        Task<TimeSpan> GetTaskCompletionTimeAverageAsync(int userId);
        Task<Dictionary<int, int>> GetTasksByPriorityDistributionAsync(int userId);
        Task<List<CategoryActivityDTO>> GetMostActiveCategoriesAsync(int userId, int limit);
        Task ValidateUserAccess(int taskId, int userId);
    }
} 