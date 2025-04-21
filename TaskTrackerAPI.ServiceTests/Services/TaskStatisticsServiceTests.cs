using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Moq;
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories.Interfaces;
using TaskTrackerAPI.Services;
using Xunit;

namespace TaskTrackerAPI.ServiceTests.Services
{
    public class TaskStatisticsServiceTests
    {
        private readonly Mock<ITaskItemRepository> _mockTaskRepository;
        private readonly Mock<ICategoryRepository> _mockCategoryRepository;
        private readonly Mock<ILogger<TaskStatisticsService>> _mockLogger;
        private readonly TaskStatisticsService _service;
        private readonly int _userId = 1;

        public TaskStatisticsServiceTests()
        {
            _mockTaskRepository = new Mock<ITaskItemRepository>();
            _mockCategoryRepository = new Mock<ICategoryRepository>();
            _mockLogger = new Mock<ILogger<TaskStatisticsService>>();
            _service = new TaskStatisticsService(
                _mockTaskRepository.Object,
                _mockCategoryRepository.Object,
                _mockLogger.Object);

            SetupMockRepositories();
        }

        private void SetupMockRepositories()
        {
            // Sample tasks for testing
            var tasks = new List<TaskItem>
            {
                // Completed tasks
                new TaskItem
                {
                    Id = 1,
                    Title = "Task 1",
                    Description = "Description 1",
                    Status = TaskItemStatus.Completed,
                    Priority = 1,
                    UserId = _userId,
                    CategoryId = 1,
                    CreatedAt = DateTime.UtcNow.AddDays(-10),
                    CompletedAt = DateTime.UtcNow.AddDays(-8)
                },
                new TaskItem
                {
                    Id = 2,
                    Title = "Task 2",
                    Description = "Description 2",
                    Status = TaskItemStatus.Completed,
                    Priority = 2,
                    UserId = _userId,
                    CategoryId = 1,
                    CreatedAt = DateTime.UtcNow.AddDays(-5),
                    CompletedAt = DateTime.UtcNow.AddDays(-3)
                },
                // In progress tasks
                new TaskItem
                {
                    Id = 3,
                    Title = "Task 3",
                    Description = "Description 3",
                    Status = TaskItemStatus.InProgress,
                    Priority = 3,
                    UserId = _userId,
                    CategoryId = 2,
                    CreatedAt = DateTime.UtcNow.AddDays(-3),
                    CompletedAt = null
                },
                // Pending tasks
                new TaskItem
                {
                    Id = 4,
                    Title = "Task 4",
                    Description = "Description 4",
                    Status = TaskItemStatus.Pending,
                    Priority = 3,
                    UserId = _userId,
                    CategoryId = 2,
                    CreatedAt = DateTime.UtcNow.AddDays(-2),
                    CompletedAt = null
                },
                // Overdue tasks
                new TaskItem
                {
                    Id = 5,
                    Title = "Task 5",
                    Description = "Description 5",
                    Status = TaskItemStatus.Pending,
                    Priority = 4,
                    UserId = _userId,
                    CategoryId = 3,
                    CreatedAt = DateTime.UtcNow.AddDays(-20),
                    DueDate = DateTime.UtcNow.AddDays(-5),
                    CompletedAt = null
                }
            };

            // Sample categories
            var categories = new List<Category>
            {
                new Category { Id = 1, Name = "Work", UserId = _userId },
                new Category { Id = 2, Name = "Personal", UserId = _userId },
                new Category { Id = 3, Name = "Study", UserId = _userId }
            };

            _mockTaskRepository.Setup(r => r.GetAllTasksAsync(_userId))
                .ReturnsAsync(tasks);

            _mockCategoryRepository.Setup(r => r.GetCategoriesForUserAsync(_userId))
                .ReturnsAsync(categories);
        }

        [Fact]
        public async Task GetProductivityAnalyticsAsync_ReturnsCorrectData()
        {
            // Act
            var result = await _service.GetProductivityAnalyticsAsync(_userId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(DateTime.UtcNow.Date, result.GeneratedAt.Date);
            
            // Test time of day data
            Assert.NotNull(result.TimeOfDayAnalytics);
            Assert.True(result.TimeOfDayAnalytics.Count > 0);
            
            // Test daily data
            Assert.NotNull(result.DailyProductivity);
            Assert.True(result.DailyProductivity.Count > 0);
            
            // Test weekly data
            Assert.NotNull(result.WeeklyProductivity);
            
            // Test monthly data
            Assert.NotNull(result.MonthlyProductivity);
        }

        [Fact]
        public async Task GetProductivityAnalyticsAsync_CalculatesAveragesCorrectly()
        {
            // Act
            var result = await _service.GetProductivityAnalyticsAsync(_userId);

            // Assert
            Assert.True(result.AverageCompletionRate >= 0 && result.AverageCompletionRate <= 1);
            Assert.True(result.AverageTasksPerDay >= 0);
            Assert.True(result.AverageTasksPerWeek >= 0);
        }

        [Fact]
        public async Task GetProductivityAnalyticsAsync_FiltersCorrectlyByDateRange()
        {
            // Arrange
            var startDate = DateTime.UtcNow.AddDays(-6);
            var endDate = DateTime.UtcNow;

            // Act
            var result = await _service.GetProductivityAnalyticsAsync(_userId, startDate, endDate);

            // Assert
            Assert.NotNull(result);
            
            // Check that all daily productivity entries are within the date range
            foreach (var entry in result.DailyProductivity)
            {
                Assert.True(entry.Date >= startDate.Date);
                Assert.True(entry.Date <= endDate.Date);
            }
        }

        [Fact]
        public async Task GetTaskStatisticsAsync_ReturnsCorrectStatistics()
        {
            // Act
            var result = await _service.GetTaskStatisticsAsync(_userId);

            // Assert
            Assert.NotNull(result);
            Assert.NotNull(result.CompletionRate);
            Assert.NotNull(result.TasksByStatus);
            Assert.NotNull(result.TasksByPriority);
            Assert.NotNull(result.TasksByCategory);
            Assert.NotNull(result.CompletionTime);
            Assert.NotNull(result.ProductivityTrend);
            Assert.NotNull(result.OverdueTasks);
            
            // Check completion rate data
            Assert.Equal(5, result.CompletionRate.TotalTasks);
            Assert.Equal(2, result.CompletionRate.CompletedTasks);
            Assert.Equal(0.4, result.CompletionRate.CompletionRate);
            
            // Check task status distribution
            Assert.Equal(5, result.TasksByStatus.Sum(x => x.Count));
            Assert.Contains(result.TasksByStatus, x => x.Label == "Completed" && x.Count == 2);
            Assert.Contains(result.TasksByStatus, x => x.Label == "Pending" && x.Count == 2);
            Assert.Contains(result.TasksByStatus, x => x.Label == "InProgress" && x.Count == 1);
            
            // Check task category distribution
            Assert.Equal(5, result.TasksByCategory.Sum(x => x.Count));
            Assert.Contains(result.TasksByCategory, x => x.Label == "Work" && x.Count == 2);
            Assert.Contains(result.TasksByCategory, x => x.Label == "Personal" && x.Count == 2);
            Assert.Contains(result.TasksByCategory, x => x.Label == "Study" && x.Count == 1);
        }
    }
} 