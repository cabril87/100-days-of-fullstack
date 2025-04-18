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
        private readonly TaskStatisticsService _statisticsService;
        
        public TaskStatisticsServiceTests()
        {
            _mockTaskRepository = new Mock<ITaskItemRepository>();
            _mockCategoryRepository = new Mock<ICategoryRepository>();
            _mockLogger = new Mock<ILogger<TaskStatisticsService>>();
            
            _statisticsService = new TaskStatisticsService(
                _mockTaskRepository.Object,
                _mockCategoryRepository.Object,
                _mockLogger.Object
            );
        }
        
        [Fact]
        public async Task GetTaskCompletionRateAsync_ReturnsCorrectRate()
        {
            // Arrange
            int userId = 1;
            List<TaskItem> tasks = new List<TaskItem>
            {
                new TaskItem { Id = 1, Title = "Task 1", Status = TaskItemStatus.Completed, UserId = userId },
                new TaskItem { Id = 2, Title = "Task 2", Status = TaskItemStatus.Completed, UserId = userId },
                new TaskItem { Id = 3, Title = "Task 3", Status = TaskItemStatus.InProgress, UserId = userId },
                new TaskItem { Id = 4, Title = "Task 4", Status = TaskItemStatus.ToDo, UserId = userId }
            };
            
            _mockTaskRepository.Setup(repo => repo.GetAllTasksAsync(userId))
                .ReturnsAsync(tasks);
            
            // Act
            double result = await _statisticsService.GetTaskCompletionRateAsync(userId);
            
            // Assert
            Assert.Equal(0.5, result); // 2 completed out of 4 tasks = 50%
        }
        
        [Fact]
        public async Task GetTaskCompletionRateAsync_WithNoTasks_ReturnsZero()
        {
            // Arrange
            int userId = 1;
            List<TaskItem> tasks = new List<TaskItem>();
            
            _mockTaskRepository.Setup(repo => repo.GetAllTasksAsync(userId))
                .ReturnsAsync(tasks);
            
            // Act
            double result = await _statisticsService.GetTaskCompletionRateAsync(userId);
            
            // Assert
            Assert.Equal(0, result);
        }
        
        [Fact]
        public async Task GetTasksByStatusDistributionAsync_ReturnsCorrectDistribution()
        {
            // Arrange
            int userId = 1;
            List<TaskItem> tasks = new List<TaskItem>
            {
                new TaskItem { Id = 1, Title = "Task 1", Status = TaskItemStatus.Completed, UserId = userId },
                new TaskItem { Id = 2, Title = "Task 2", Status = TaskItemStatus.Completed, UserId = userId },
                new TaskItem { Id = 3, Title = "Task 3", Status = TaskItemStatus.InProgress, UserId = userId },
                new TaskItem { Id = 4, Title = "Task 4", Status = TaskItemStatus.ToDo, UserId = userId },
                new TaskItem { Id = 5, Title = "Task 5", Status = TaskItemStatus.ToDo, UserId = userId }
            };
            
            _mockTaskRepository.Setup(repo => repo.GetAllTasksAsync(userId))
                .ReturnsAsync(tasks);
            
            // Act
            Dictionary<TaskItemStatus, int> result = await _statisticsService.GetTasksByStatusDistributionAsync(userId);
            
            // Assert
            Assert.Equal(5, result.Count); // All enum status values (not just the ones we used)
            Assert.Equal(2, result[TaskItemStatus.Completed]);
            Assert.Equal(1, result[TaskItemStatus.InProgress]);
            Assert.Equal(2, result[TaskItemStatus.ToDo]);
        }
    }
} 