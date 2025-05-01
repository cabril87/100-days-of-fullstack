using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Moq;
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories.Interfaces;
using TaskTrackerAPI.Services;
using Xunit;

namespace TaskTrackerAPI.ServiceTests.Services
{
    public class TaskServiceTests
    {
        private readonly Mock<ITaskItemRepository> _mockTaskRepository;
        private readonly Mock<IMapper> _mockMapper;
        private readonly Mock<ICategoryRepository> _mockCategoryRepository;
        private readonly Mock<IChecklistItemRepository> _mockChecklistItemRepository;
        private readonly TaskService _taskService;
        
        public TaskServiceTests()
        {
            _mockTaskRepository = new Mock<ITaskItemRepository>();
            _mockMapper = new Mock<IMapper>();
            _mockCategoryRepository = new Mock<ICategoryRepository>();
            _mockChecklistItemRepository = new Mock<IChecklistItemRepository>();
            
            _taskService = new TaskService(
                _mockTaskRepository.Object,
                _mockMapper.Object,
                _mockCategoryRepository.Object,
                _mockChecklistItemRepository.Object
            );
            
            // Default setup for category ownership validation
            _mockCategoryRepository.Setup(repo => repo.IsCategoryOwnedByUserAsync(It.IsAny<int>(), It.IsAny<int>()))
                .ReturnsAsync(true);
        }
        
        [Fact]
        public async Task GetAllTasksAsync_ReturnsMappedTaskDTOs()
        {
            // Arrange
            int userId = 1;
            List<TaskItem> tasks = new List<TaskItem>
            {
                new TaskItem { Id = 1, Title = "Task 1", UserId = userId },
                new TaskItem { Id = 2, Title = "Task 2", UserId = userId }
            };
            
            List<TaskItemDTO> taskDtos = new List<TaskItemDTO>
            {
                new TaskItemDTO { Id = 1, Title = "Task 1" },
                new TaskItemDTO { Id = 2, Title = "Task 2" }
            };
            
            _mockTaskRepository.Setup(repo => repo.GetAllTasksAsync(userId))
                .ReturnsAsync(tasks);
            
            _mockMapper.Setup(m => m.Map<IEnumerable<TaskItemDTO>>(tasks))
                .Returns(taskDtos);
            
            // Act
            IEnumerable<TaskItemDTO> result = await _taskService.GetAllTasksAsync(userId);
            
            // Assert
            List<TaskItemDTO> resultList = result.ToList();
            Assert.Equal(2, resultList.Count);
            Assert.Equal(1, resultList[0].Id);
            Assert.Equal("Task 1", resultList[0].Title);
        }
        
        // Add more test methods here...
    }
} 