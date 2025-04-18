using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Services.Interfaces;

namespace TaskTrackerAPI.UnitTests.Mocks
{
    public class MockTaskStatisticsService : ITaskStatisticsService
    {
        public Task<TaskStatisticsDTO> GetTaskStatisticsAsync(int userId)
        {
            return Task.FromResult(new TaskStatisticsDTO());
        }

        public Task<ProductivityAnalyticsDTO> GetProductivityAnalyticsAsync(int userId, DateTime? startDate = null, DateTime? endDate = null)
        {
            return Task.FromResult(new ProductivityAnalyticsDTO());
        }

        public Task<double> GetTaskCompletionRateAsync(int userId)
        {
            return Task.FromResult(0.5);
        }

        public Task<Dictionary<TaskItemStatus, int>> GetTasksByStatusDistributionAsync(int userId)
        {
            return Task.FromResult(new Dictionary<TaskItemStatus, int>());
        }

        public Task<TimeSpan> GetTaskCompletionTimeAverageAsync(int userId)
        {
            return Task.FromResult(TimeSpan.FromHours(1));
        }

        public Task<Dictionary<int, int>> GetTasksByPriorityDistributionAsync(int userId)
        {
            return Task.FromResult(new Dictionary<int, int>());
        }

        public Task<List<CategoryActivityDTO>> GetMostActiveCategoriesAsync(int userId, int limit)
        {
            return Task.FromResult(new List<CategoryActivityDTO>());
        }

        public Task ValidateUserAccess(int taskId, int userId)
        {
            return Task.CompletedTask;
        }
    }
} 