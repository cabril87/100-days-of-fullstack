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

namespace TaskTrackerAPI.Tests.Services
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
            var tasks = new List<TaskItem>
            {
                new TaskItem { Id = 1, Title = "Task 1", Status = TaskItemStatus.Completed, UserId = userId },
                new TaskItem { Id = 2, Title = "Task 2", Status = TaskItemStatus.Completed, UserId = userId },
                new TaskItem { Id = 3, Title = "Task 3", Status = TaskItemStatus.InProgress, UserId = userId },
                new TaskItem { Id = 4, Title = "Task 4", Status = TaskItemStatus.ToDo, UserId = userId }
            };
            
            _mockTaskRepository.Setup(repo => repo.GetAllTasksAsync(userId))
                .ReturnsAsync(tasks);
            
            // Act
            var result = await _statisticsService.GetTaskCompletionRateAsync(userId);
            
            // Assert
            Assert.Equal(0.5, result); // 2 completed out of 4 tasks = 50%
        }
        
        [Fact]
        public async Task GetTaskCompletionRateAsync_WithNoTasks_ReturnsZero()
        {
            // Arrange
            int userId = 1;
            var tasks = new List<TaskItem>();
            
            _mockTaskRepository.Setup(repo => repo.GetAllTasksAsync(userId))
                .ReturnsAsync(tasks);
            
            // Act
            var result = await _statisticsService.GetTaskCompletionRateAsync(userId);
            
            // Assert
            Assert.Equal(0, result);
        }
        
        [Fact]
        public async Task GetTasksByStatusDistributionAsync_ReturnsCorrectDistribution()
        {
            // Arrange
            int userId = 1;
            var tasks = new List<TaskItem>
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
            var result = await _statisticsService.GetTasksByStatusDistributionAsync(userId);
            
            // Assert
            Assert.Equal(5, result.Count); // All enum status values (not just the ones we used)
            Assert.Equal(2, result[TaskItemStatus.Completed]);
            Assert.Equal(1, result[TaskItemStatus.InProgress]);
            Assert.Equal(2, result[TaskItemStatus.ToDo]);
        }
        
        [Fact]
        public async Task GetMostActiveCategories_ReturnsTopCategories()
        {
            // Arrange
            int userId = 1;
            var tasks = new List<TaskItem>
            {
                new TaskItem { Id = 1, Title = "Task 1", CategoryId = 1, UserId = userId },
                new TaskItem { Id = 2, Title = "Task 2", CategoryId = 1, UserId = userId },
                new TaskItem { Id = 3, Title = "Task 3", CategoryId = 1, UserId = userId },
                new TaskItem { Id = 4, Title = "Task 4", CategoryId = 2, UserId = userId },
                new TaskItem { Id = 5, Title = "Task 5", CategoryId = 2, UserId = userId },
                new TaskItem { Id = 6, Title = "Task 6", CategoryId = 3, UserId = userId }
            };
            
            var categories = new List<Category>
            {
                new Category { Id = 1, Name = "Work", UserId = userId },
                new Category { Id = 2, Name = "Personal", UserId = userId },
                new Category { Id = 3, Name = "Shopping", UserId = userId }
            };
            
            _mockTaskRepository.Setup(repo => repo.GetAllTasksAsync(userId))
                .ReturnsAsync(tasks);
                
            _mockCategoryRepository.Setup(repo => repo.GetCategoriesForUserAsync(userId))
                .ReturnsAsync(categories);
                
            _mockCategoryRepository.Setup(repo => repo.GetCategoryByIdAsync(1, userId))
                .ReturnsAsync(categories[0]);
                
            _mockCategoryRepository.Setup(repo => repo.GetCategoryByIdAsync(2, userId))
                .ReturnsAsync(categories[1]);
                
            _mockCategoryRepository.Setup(repo => repo.GetCategoryByIdAsync(3, userId))
                .ReturnsAsync(categories[2]);
            
            // Act
            var result = await _statisticsService.GetMostActiveCategoriesAsync(userId, 2);
            
            // Assert
            Assert.Equal(2, result.Count);
            Assert.Equal(3, result[0].TaskCount);
            Assert.Equal(2, result[1].TaskCount);
        }
        
        [Fact]
        public async Task GetTasksByPriorityDistributionAsync_ReturnsCorrectDistribution()
        {
            // Arrange
            int userId = 1;
            var tasks = new List<TaskItem>
            {
                new TaskItem { Id = 1, Title = "Task 1", Priority = 0, UserId = userId }, // Low
                new TaskItem { Id = 2, Title = "Task 2", Priority = 0, UserId = userId }, // Low
                new TaskItem { Id = 3, Title = "Task 3", Priority = 1, UserId = userId }, // Medium
                new TaskItem { Id = 4, Title = "Task 4", Priority = 2, UserId = userId }, // High
                new TaskItem { Id = 5, Title = "Task 5", Priority = 2, UserId = userId }  // High
            };
            
            _mockTaskRepository.Setup(repo => repo.GetAllTasksAsync(userId))
                .ReturnsAsync(tasks);
            
            // Act
            var result = await _statisticsService.GetTasksByPriorityDistributionAsync(userId);
            
            // Assert
            Assert.Equal(6, result.Count); // Priorities 0-5 (not just the ones we used)
            Assert.Equal(2, result[0]); // Low
            Assert.Equal(1, result[1]); // Medium
            Assert.Equal(2, result[2]); // High
        }
        
        [Fact]
        public async Task GetOverdueTasksStatisticsAsync_ReturnsCorrectStats()
        {
            // Arrange
            int userId = 1;
            var now = DateTime.UtcNow;
            var tasks = new List<TaskItem>
            {
                // Overdue tasks
                new TaskItem 
                { 
                    Id = 1,
                    Title = "Overdue Task 1",
                    Status = TaskItemStatus.ToDo, 
                    UserId = userId,
                    DueDate = now.AddDays(-5) // 5 days overdue
                },
                new TaskItem 
                { 
                    Id = 2,
                    Title = "Overdue Task 2",
                    Status = TaskItemStatus.InProgress, 
                    UserId = userId,
                    DueDate = now.AddDays(-3) // 3 days overdue
                },
                new TaskItem 
                { 
                    Id = 3,
                    Title = "Overdue Task 3",
                    Status = TaskItemStatus.InProgress, 
                    UserId = userId,
                    DueDate = now.AddDays(-1) // 1 day overdue
                },
                
                // Completed overdue task (shouldn't count as overdue)
                new TaskItem 
                { 
                    Id = 4,
                    Title = "Completed Overdue Task",
                    Status = TaskItemStatus.Completed, 
                    UserId = userId,
                    DueDate = now.AddDays(-2)
                },
                
                // Future tasks
                new TaskItem 
                { 
                    Id = 5,
                    Title = "Future Task 1",
                    Status = TaskItemStatus.ToDo, 
                    UserId = userId,
                    DueDate = now.AddDays(1)
                },
                
                // Task with no due date
                new TaskItem 
                { 
                    Id = 6,
                    Title = "No Due Date Task",
                    Status = TaskItemStatus.ToDo, 
                    UserId = userId,
                    DueDate = null
                }
            };
            
            _mockTaskRepository.Setup(repo => repo.GetAllTasksAsync(userId))
                .ReturnsAsync(tasks);
            
            // Act
            var stats = await _statisticsService.GetTaskStatisticsAsync(userId);
            
            // Assert
            Assert.NotNull(stats);
            Assert.NotNull(stats.OverdueTasks);
            // There should be 3 overdue tasks
            Assert.Equal(3, stats.OverdueTasks.TotalOverdueTasks);
        }
        
        [Fact]
        public async Task ValidateUserAccessThrowsExceptionForInvalidUser()
        {
            // Arrange
            int userId = 999; // Invalid user
            int taskId = 1;
            
            _mockTaskRepository.Setup(repo => repo.IsTaskOwnedByUserAsync(taskId, userId))
                .ReturnsAsync(false);
            
            // Act & Assert
            var exception = await Assert.ThrowsAsync<UnauthorizedAccessException>(
                () => _statisticsService.ValidateUserAccess(taskId, userId));
                
            Assert.Contains("You do not have access to this task", exception.Message);
        }
    }
} 