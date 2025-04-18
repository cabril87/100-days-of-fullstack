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

namespace TaskTrackerAPI.Tests.Services
{
    public class TaskServiceTests
    {
        private readonly Mock<ITaskItemRepository> _mockTaskRepository;
        private readonly Mock<IMapper> _mockMapper;
        private readonly Mock<ICategoryRepository> _mockCategoryRepository;
        private readonly TaskService _taskService;
        
        public TaskServiceTests()
        {
            _mockTaskRepository = new Mock<ITaskItemRepository>();
            _mockMapper = new Mock<IMapper>();
            _mockCategoryRepository = new Mock<ICategoryRepository>();
            
            _taskService = new TaskService(
                _mockTaskRepository.Object,
                _mockMapper.Object,
                _mockCategoryRepository.Object
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
            var tasks = new List<TaskItem>
            {
                new TaskItem { Id = 1, Title = "Task 1", UserId = userId },
                new TaskItem { Id = 2, Title = "Task 2", UserId = userId }
            };
            
            var taskDtos = new List<TaskItemDTO>
            {
                new TaskItemDTO { Id = 1, Title = "Task 1" },
                new TaskItemDTO { Id = 2, Title = "Task 2" }
            };
            
            _mockTaskRepository.Setup(repo => repo.GetAllTasksAsync(userId))
                .ReturnsAsync(tasks);
            
            _mockMapper.Setup(m => m.Map<IEnumerable<TaskItemDTO>>(tasks))
                .Returns(taskDtos);
            
            // Act
            var result = await _taskService.GetAllTasksAsync(userId);
            
            // Assert
            var resultList = result.ToList();
            Assert.Equal(2, resultList.Count);
            Assert.Equal(1, resultList[0].Id);
            Assert.Equal("Task 1", resultList[0].Title);
        }
        
        [Fact]
        public async Task GetTaskByIdAsync_WithValidId_ReturnsMappedTaskDTO()
        {
            // Arrange
            int userId = 1;
            int taskId = 1;
            var task = new TaskItem { Id = taskId, Title = "Task 1", UserId = userId };
            var taskDto = new TaskItemDTO { Id = taskId, Title = "Task 1" };
            
            _mockTaskRepository.Setup(repo => repo.GetTaskByIdAsync(taskId, userId))
                .ReturnsAsync(task);
            
            _mockMapper.Setup(m => m.Map<TaskItemDTO>(task))
                .Returns(taskDto);
            
            // Act
            var result = await _taskService.GetTaskByIdAsync(userId, taskId);
            
            // Assert
            Assert.NotNull(result);
            Assert.Equal(taskId, result!.Id);
            Assert.Equal("Task 1", result.Title);
        }
        
        [Fact]
        public async Task GetTaskByIdAsync_WithInvalidId_ReturnsNull()
        {
            // Arrange
            int userId = 1;
            int taskId = 999;
            
            _mockTaskRepository.Setup(repo => repo.GetTaskByIdAsync(taskId, userId))
                .ReturnsAsync((TaskItem?)null);
            
            // Act
            var result = await _taskService.GetTaskByIdAsync(userId, taskId);
            
            // Assert
            Assert.Null(result);
        }
        
        [Fact]
        public async Task CreateTaskAsync_WithValidData_ReturnsCreatedTaskDTO()
        {
            // Arrange
            int userId = 1;
            var taskDto = new TaskItemDTO 
            { 
                Title = "New Task",
                Description = "New Description",
                Status = TaskItemStatus.ToDo,
                Priority = 1
            };
            
            var taskEntity = new TaskItem 
            {
                Title = "New Task",
                Description = "New Description",
                Status = TaskItemStatus.ToDo,
                Priority = 1,
                UserId = userId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            
            var createdTask = new TaskItem 
            { 
                Id = 1,
                Title = "New Task",
                Description = "New Description",
                Status = TaskItemStatus.ToDo,
                Priority = 1,
                UserId = userId,
                CreatedAt = DateTime.UtcNow
            };
            
            var createdTaskDto = new TaskItemDTO 
            { 
                Id = 1,
                Title = "New Task",
                Description = "New Description",
                Status = TaskItemStatus.ToDo,
                Priority = 1
            };
            
            // Setup the CreateTaskAsync to return the task with Id set
            _mockTaskRepository.Setup(repo => repo.CreateTaskAsync(It.IsAny<TaskItem>()))
                .ReturnsAsync((TaskItem taskItem) => {
                    // Simulate the repository setting the Id
                    taskItem.Id = 1;
                    return taskItem;
                });
            
            // Setup GetTaskByIdAsync to return the created task
            _mockTaskRepository.Setup(repo => repo.GetTaskByIdAsync(1, userId))
                .ReturnsAsync(createdTask);
            
            _mockMapper.Setup(m => m.Map<TaskItemDTO>(createdTask))
                .Returns(createdTaskDto);
            
            // Act
            var result = await _taskService.CreateTaskAsync(userId, taskDto);
            
            // Assert
            Assert.NotNull(result);
            Assert.Equal(1, result!.Id);
            Assert.Equal("New Task", result.Title);
            
            _mockTaskRepository.Verify(repo => repo.CreateTaskAsync(It.IsAny<TaskItem>()), Times.Once);
        }
        
        [Fact]
        public async Task CreateTaskAsync_WithTags_CallsUpdateTaskTags()
        {
            // Arrange
            int userId = 1;
            var taskDto = new TaskItemDTO 
            { 
                Title = "New Task",
                Status = TaskItemStatus.ToDo,
                Tags = new List<TagDTO> { new TagDTO { Id = 1, Name = "Tag1" } }
            };
            
            var taskEntity = new TaskItem 
            {
                Title = "New Task",
                Status = TaskItemStatus.ToDo,
                UserId = userId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            
            var createdTask = new TaskItem 
            { 
                Id = 1,
                Title = "New Task",
                Status = TaskItemStatus.ToDo,
                UserId = userId
            };
            
            var createdTaskDto = new TaskItemDTO 
            { 
                Id = 1,
                Title = "New Task",
                Status = TaskItemStatus.ToDo,
                Tags = new List<TagDTO> { new TagDTO { Id = 1, Name = "Tag1" } }
            };
            
            // Setup the CreateTaskAsync to return the task with Id set
            _mockTaskRepository.Setup(repo => repo.CreateTaskAsync(It.IsAny<TaskItem>()))
                .ReturnsAsync((TaskItem taskItem) => {
                    // Simulate the repository setting the Id
                    taskItem.Id = 1;
                    return taskItem;
                });
            
            _mockTaskRepository.Setup(repo => repo.UpdateTaskTagsAsync(1, It.IsAny<IEnumerable<int>>()))
                .Returns(Task.CompletedTask);
            
            _mockTaskRepository.Setup(repo => repo.GetTaskByIdAsync(1, userId))
                .ReturnsAsync(createdTask);
            
            _mockMapper.Setup(m => m.Map<TaskItemDTO>(createdTask))
                .Returns(createdTaskDto);
            
            // Act
            var result = await _taskService.CreateTaskAsync(userId, taskDto);
            
            // Assert
            Assert.NotNull(result);
            
            _mockTaskRepository.Verify(repo => repo.UpdateTaskTagsAsync(1, It.IsAny<IEnumerable<int>>()), Times.Once);
        }
        
        [Fact]
        public async Task UpdateTaskAsync_WithValidData_ReturnsUpdatedTaskDTO()
        {
            // Arrange
            int userId = 1;
            int taskId = 1;
            var taskDto = new TaskItemDTO 
            { 
                Id = taskId,
                Title = "Updated Task",
                Description = "Updated Description",
                Status = TaskItemStatus.InProgress,
                Priority = 2
            };
            
            var existingTask = new TaskItem 
            { 
                Id = taskId,
                Title = "Original Task",
                Description = "Original Description",
                Status = TaskItemStatus.ToDo,
                Priority = 1,
                UserId = userId
            };
            
            var updatedTask = new TaskItem 
            { 
                Id = taskId,
                Title = "Updated Task",
                Description = "Updated Description",
                Status = TaskItemStatus.InProgress,
                Priority = 2,
                UserId = userId
            };
            
            var updatedTaskDto = new TaskItemDTO 
            { 
                Id = taskId,
                Title = "Updated Task",
                Description = "Updated Description",
                Status = TaskItemStatus.InProgress,
                Priority = 2
            };
            
            _mockTaskRepository.Setup(repo => repo.IsTaskOwnedByUserAsync(taskId, userId))
                .ReturnsAsync(true);
                
            _mockTaskRepository.Setup(repo => repo.GetTaskByIdAsync(taskId, userId))
                .ReturnsAsync(existingTask);
            
            _mockTaskRepository.Setup(repo => repo.UpdateTaskAsync(It.IsAny<TaskItem>()))
                .Returns(Task.CompletedTask);
            
            _mockTaskRepository.Setup(repo => repo.GetTaskByIdAsync(taskId, userId))
                .ReturnsAsync(updatedTask);
            
            _mockMapper.Setup(m => m.Map<TaskItemDTO>(updatedTask))
                .Returns(updatedTaskDto);
            
            // Act
            var result = await _taskService.UpdateTaskAsync(userId, taskId, taskDto);
            
            // Assert
            Assert.NotNull(result);
            Assert.Equal("Updated Task", result!.Title);
            Assert.Equal(TaskItemStatus.InProgress, result.Status);
            
            _mockTaskRepository.Verify(repo => repo.UpdateTaskAsync(It.IsAny<TaskItem>()), Times.Once);
        }
        
        [Fact]
        public async Task UpdateTaskAsync_WithInvalidId_ReturnsNull()
        {
            // Arrange
            int userId = 1;
            int taskId = 999;
            var taskDto = new TaskItemDTO { Id = taskId, Title = "Updated Task" };
            
            _mockTaskRepository.Setup(repo => repo.IsTaskOwnedByUserAsync(taskId, userId))
                .ReturnsAsync(false);
            
            // Act
            var result = await _taskService.UpdateTaskAsync(userId, taskId, taskDto);
            
            // Assert
            Assert.Null(result);
            
            _mockTaskRepository.Verify(repo => repo.UpdateTaskAsync(It.IsAny<TaskItem>()), Times.Never);
        }
        
        [Fact]
        public async Task DeleteTaskAsync_WithOwnedTask_CallsRepository()
        {
            // Arrange
            int userId = 1;
            int taskId = 1;
            
            _mockTaskRepository.Setup(repo => repo.IsTaskOwnedByUserAsync(taskId, userId))
                .ReturnsAsync(true);
            
            _mockTaskRepository.Setup(repo => repo.DeleteTaskAsync(taskId, userId))
                .Returns(Task.CompletedTask);
            
            // Act
            await _taskService.DeleteTaskAsync(userId, taskId);
            
            // Assert
            _mockTaskRepository.Verify(repo => repo.IsTaskOwnedByUserAsync(taskId, userId), Times.Once);
            _mockTaskRepository.Verify(repo => repo.DeleteTaskAsync(taskId, userId), Times.Once);
        }
        
        [Fact]
        public async Task DeleteTaskAsync_WithUnownedTask_DoesNotCallDelete()
        {
            // Arrange
            int userId = 1;
            int taskId = 1;
            
            _mockTaskRepository.Setup(repo => repo.IsTaskOwnedByUserAsync(taskId, userId))
                .ReturnsAsync(false);
            
            // Act
            await _taskService.DeleteTaskAsync(userId, taskId);
            
            // Assert
            _mockTaskRepository.Verify(repo => repo.IsTaskOwnedByUserAsync(taskId, userId), Times.Once);
            _mockTaskRepository.Verify(repo => repo.DeleteTaskAsync(taskId, userId), Times.Never);
        }
        
        [Fact]
        public async Task GetTasksByStatusAsync_ReturnsTasksWithMatchingStatus()
        {
            // Arrange
            int userId = 1;
            TaskItemStatus status = TaskItemStatus.InProgress;
            
            var tasks = new List<TaskItem>
            {
                new TaskItem { Id = 1, Title = "Task 1", Status = status, UserId = userId }
            };
            
            var taskDtos = new List<TaskItemDTO>
            {
                new TaskItemDTO { Id = 1, Title = "Task 1", Status = status }
            };
            
            _mockTaskRepository.Setup(repo => repo.GetTasksByStatusAsync(userId, status))
                .ReturnsAsync(tasks);
            
            _mockMapper.Setup(m => m.Map<IEnumerable<TaskItemDTO>>(tasks))
                .Returns(taskDtos);
            
            // Act
            var result = await _taskService.GetTasksByStatusAsync(userId, status);
            
            // Assert
            Assert.Single(result);
            Assert.Equal(status, result.First().Status);
        }
        
        [Fact]
        public async Task GetTasksByCategoryAsync_ReturnsTasksInCategory()
        {
            // Arrange
            int userId = 1;
            int categoryId = 1;
            
            var tasks = new List<TaskItem>
            {
                new TaskItem { Id = 1, Title = "Task 1", CategoryId = categoryId, UserId = userId }
            };
            
            var taskDtos = new List<TaskItemDTO>
            {
                new TaskItemDTO { Id = 1, Title = "Task 1", CategoryId = categoryId }
            };
            
            _mockTaskRepository.Setup(repo => repo.GetTasksByCategoryAsync(userId, categoryId))
                .ReturnsAsync(tasks);
            
            _mockMapper.Setup(m => m.Map<IEnumerable<TaskItemDTO>>(tasks))
                .Returns(taskDtos);
            
            // Act
            var result = await _taskService.GetTasksByCategoryAsync(userId, categoryId);
            
            // Assert
            Assert.Single(result);
            Assert.Equal(categoryId, result.First().CategoryId);
        }
        
        [Fact]
        public async Task GetTasksByTagAsync_ReturnsTasksWithTag()
        {
            // Arrange
            int userId = 1;
            int tagId = 1;
            
            var tasks = new List<TaskItem>
            {
                new TaskItem { Id = 1, Title = "Task 1", UserId = userId }
            };
            
            var taskDtos = new List<TaskItemDTO>
            {
                new TaskItemDTO { Id = 1, Title = "Task 1" }
            };
            
            _mockTaskRepository.Setup(repo => repo.GetTasksByTagAsync(userId, tagId))
                .ReturnsAsync(tasks);
            
            _mockMapper.Setup(m => m.Map<IEnumerable<TaskItemDTO>>(tasks))
                .Returns(taskDtos);
            
            // Act
            var result = await _taskService.GetTasksByTagAsync(userId, tagId);
            
            // Assert
            Assert.Single(result);
        }
        
        [Fact]
        public async Task GetTasksByDueDateRangeAsync_ReturnsTasksInDateRange()
        {
            // Arrange
            int userId = 1;
            DateTime startDate = DateTime.Now;
            DateTime endDate = DateTime.Now.AddDays(7);
            
            var tasks = new List<TaskItem>
            {
                new TaskItem { Id = 1, Title = "Task 1", DueDate = DateTime.Now.AddDays(3), UserId = userId }
            };
            
            var taskDtos = new List<TaskItemDTO>
            {
                new TaskItemDTO { Id = 1, Title = "Task 1", DueDate = DateTime.Now.AddDays(3) }
            };
            
            _mockTaskRepository.Setup(repo => repo.GetAllTasksAsync(userId))
                .ReturnsAsync(tasks);
            
            _mockMapper.Setup(m => m.Map<IEnumerable<TaskItemDTO>>(It.IsAny<IEnumerable<TaskItem>>()))
                .Returns(taskDtos);
            
            // Act
            var result = await _taskService.GetTasksByDueDateRangeAsync(userId, startDate, endDate);
            
            // Assert
            Assert.Single(result);
        }
        
        [Fact]
        public async Task GetOverdueTasksAsync_ReturnsOverdueTasks()
        {
            // Arrange
            int userId = 1;
            
            var tasks = new List<TaskItem>
            {
                new TaskItem 
                { 
                    Id = 1, 
                    Title = "Task 1", 
                    DueDate = DateTime.Now.AddDays(-1),
                    Status = TaskItemStatus.ToDo,
                    UserId = userId 
                }
            };
            
            var taskDtos = new List<TaskItemDTO>
            {
                new TaskItemDTO 
                { 
                    Id = 1, 
                    Title = "Task 1", 
                    DueDate = DateTime.Now.AddDays(-1),
                    Status = TaskItemStatus.ToDo
                }
            };
            
            _mockTaskRepository.Setup(repo => repo.GetAllTasksAsync(userId))
                .ReturnsAsync(tasks);
            
            _mockMapper.Setup(m => m.Map<IEnumerable<TaskItemDTO>>(It.IsAny<IEnumerable<TaskItem>>()))
                .Returns(taskDtos);
            
            // Act
            var result = await _taskService.GetOverdueTasksAsync(userId);
            
            // Assert
            Assert.Single(result);
        }
        
        [Fact]
        public async Task AddTagToTaskAsync_WithUnownedTask_DoesNothing()
        {
            // Arrange
            int userId = 1;
            int taskId = 1;
            int tagId = 1;
            
            // Task is not owned by the user
            _mockTaskRepository.Setup(repo => repo.IsTaskOwnedByUserAsync(taskId, userId))
                .ReturnsAsync(false);
            
            // Act
            await _taskService.AddTagToTaskAsync(userId, taskId, tagId);
            
            // Assert
            _mockTaskRepository.Verify(
                repo => repo.AddTagToTaskAsync(It.IsAny<int>(), It.IsAny<int>()), 
                Times.Never);
        }
        
        [Fact]
        public async Task RemoveTagFromTaskAsync_WithUnownedTask_DoesNothing()
        {
            // Arrange
            int userId = 1;
            int taskId = 1;
            int tagId = 1;
            
            // Task is not owned by the user
            _mockTaskRepository.Setup(repo => repo.IsTaskOwnedByUserAsync(taskId, userId))
                .ReturnsAsync(false);
            
            // Act
            await _taskService.RemoveTagFromTaskAsync(userId, taskId, tagId);
            
            // Assert
            _mockTaskRepository.Verify(
                repo => repo.RemoveTagFromTaskAsync(It.IsAny<int>(), It.IsAny<int>()), 
                Times.Never);
        }
        
        [Fact]
        public async Task UpdateTaskTagsAsync_WithUnownedTask_DoesNothing()
        {
            // Arrange
            int userId = 1;
            int taskId = 1;
            var tagIds = new List<int> { 1, 2, 3 };
            
            // Task is not owned by the user
            _mockTaskRepository.Setup(repo => repo.IsTaskOwnedByUserAsync(taskId, userId))
                .ReturnsAsync(false);
            
            // Act
            await _taskService.UpdateTaskTagsAsync(userId, taskId, tagIds);
            
            // Assert
            _mockTaskRepository.Verify(
                repo => repo.UpdateTaskTagsAsync(It.IsAny<int>(), It.IsAny<IEnumerable<int>>()), 
                Times.Never);
        }
        
        [Fact]
        public async Task GetTagsForTaskAsync_WithUnownedTask_ReturnsEmptyList()
        {
            // Arrange
            int userId = 1;
            int taskId = 1;
            
            // Task is not owned by the user
            _mockTaskRepository.Setup(repo => repo.IsTaskOwnedByUserAsync(taskId, userId))
                .ReturnsAsync(false);
            
            // Act
            var result = await _taskService.GetTagsForTaskAsync(userId, taskId);
            
            // Assert
            Assert.Empty(result);
            _mockTaskRepository.Verify(
                repo => repo.GetTagsForTaskAsync(It.IsAny<int>()), 
                Times.Never);
        }
        
        [Fact]
        public async Task CompleteTasksAsync_WithMixedOwnership_OnlyCompletesOwnedTasks()
        {
            // Arrange
            int userId = 1;
            var taskIds = new List<int> { 1, 2, 3 };
            
            // Task 1 is owned by user, others are not
            _mockTaskRepository.Setup(repo => repo.IsTaskOwnedByUserAsync(1, userId))
                .ReturnsAsync(true);
            _mockTaskRepository.Setup(repo => repo.IsTaskOwnedByUserAsync(2, userId))
                .ReturnsAsync(false);
            _mockTaskRepository.Setup(repo => repo.IsTaskOwnedByUserAsync(3, userId))
                .ReturnsAsync(false);
        
            var task1 = new TaskItem { Id = 1, Title = "Task 1", UserId = userId };
            _mockTaskRepository.Setup(repo => repo.GetTaskByIdAsync(1, userId))
                .ReturnsAsync(task1);
        
            // Act
            await _taskService.CompleteTasksAsync(userId, taskIds);
        
            // Assert
            // Verify only task 1 was updated
            _mockTaskRepository.Verify(repo => repo.UpdateTaskAsync(It.Is<TaskItem>(t => t.Id == 1)), Times.Once);
            _mockTaskRepository.Verify(repo => repo.UpdateTaskAsync(It.Is<TaskItem>(t => t.Id != 1)), Times.Never);
        
            // Verify task 1 was marked as completed
            Assert.Equal(TaskItemStatus.Completed, task1.Status);
        }
        
        [Fact]
        public async Task UpdateTaskStatusAsync_WithUnownedTask_DoesNothing()
        {
            // Arrange
            int userId = 1;
            int taskId = 1;
            var newStatus = TaskItemStatus.Completed;
            
            // Task is not owned by the user
            _mockTaskRepository.Setup(repo => repo.IsTaskOwnedByUserAsync(taskId, userId))
                .ReturnsAsync(false);
            
            // Act
            await _taskService.UpdateTaskStatusAsync(userId, taskId, newStatus);
            
            // Assert
            _mockTaskRepository.Verify(repo => repo.UpdateTaskAsync(It.IsAny<TaskItem>()), Times.Never);
        }
        
        [Fact]
        public async Task GetTaskStatisticsAsync_ReturnsValidStatistics()
        {
            // Arrange
            int userId = 1;
            var tasks = new List<TaskItem>
            {
                new TaskItem 
                { 
                    Id = 1, 
                    Title = "Task 1", 
                    Status = TaskItemStatus.Completed, 
                    Priority = 2, 
                    UserId = userId,
                    Category = new Category { Id = 1, Name = "Work", UserId = userId },
                    CreatedAt = DateTime.UtcNow.AddDays(-5),
                    UpdatedAt = DateTime.UtcNow.AddDays(-1)
                },
                new TaskItem 
                { 
                    Id = 2, 
                    Title = "Task 2", 
                    Status = TaskItemStatus.InProgress, 
                    Priority = 1, 
                    UserId = userId,
                    Category = new Category { Id = 2, Name = "Personal", UserId = userId },
                    CreatedAt = DateTime.UtcNow.AddDays(-3),
                    UpdatedAt = DateTime.UtcNow.AddDays(-2)
                },
                new TaskItem 
                { 
                    Id = 3, 
                    Title = "Task 3", 
                    Status = TaskItemStatus.ToDo, 
                    Priority = 0, 
                    UserId = userId,
                    Category = new Category { Id = 1, Name = "Work", UserId = userId },
                    CreatedAt = DateTime.UtcNow.AddDays(-1),
                    UpdatedAt = DateTime.UtcNow.AddDays(-1)
                }
            };
            
            _mockTaskRepository.Setup(repo => repo.GetAllTasksAsync(userId))
                .ReturnsAsync(tasks);
            
            _mockTaskRepository.Setup(repo => repo.GetTagsForTaskAsync(It.IsAny<int>()))
                .ReturnsAsync(new List<Tag>());
            
            // Act
            var result = await _taskService.GetTaskStatisticsAsync(userId);
            
            // Assert
            Assert.NotNull(result);
            Assert.Equal(3, result.TotalTasks);
            Assert.Equal(1, result.CompletedTasksCount);
            Assert.Equal(1, result.InProgressTasksCount);
            Assert.Equal(1, result.OtherStatusTasksCount);
            Assert.NotNull(result.TasksByCategory);
            Assert.Equal(2, result.TasksByCategory.Count);
            Assert.True(result.TasksByCategory.ContainsKey("Work"));
            Assert.Equal(2, result.TasksByCategory["Work"]);
        }
        
        [Fact]
        public async Task GetDueTodayTasksAsync_ReturnsOnlyTasksDueToday()
        {
            // Arrange
            int userId = 1;
            var today = DateTime.Today;
            
            var tasks = new List<TaskItem>
            {
                new TaskItem 
                { 
                    Id = 1, 
                    Title = "Due Today", 
                    DueDate = today, 
                    UserId = userId 
                },
                new TaskItem 
                { 
                    Id = 2, 
                    Title = "Due Tomorrow", 
                    DueDate = today.AddDays(1), 
                    UserId = userId 
                },
                new TaskItem 
                { 
                    Id = 3, 
                    Title = "Due Yesterday", 
                    DueDate = today.AddDays(-1), 
                    UserId = userId 
                },
                new TaskItem 
                { 
                    Id = 4, 
                    Title = "No Due Date", 
                    DueDate = null, 
                    UserId = userId 
                }
            };
            
            _mockTaskRepository.Setup(repo => repo.GetAllTasksAsync(userId))
                .ReturnsAsync(tasks);
            
            _mockMapper.Setup(m => m.Map<IEnumerable<TaskItemDTO>>(It.IsAny<IEnumerable<TaskItem>>()))
                .Returns((IEnumerable<TaskItem> source) => source.Select(t => new TaskItemDTO 
                { 
                    Id = t.Id, 
                    Title = t.Title, 
                    DueDate = t.DueDate 
                }));
            
            // Act
            var result = await _taskService.GetDueTodayTasksAsync(userId);
            
            // Assert
            Assert.Single(result);
            Assert.Equal("Due Today", result.First().Title);
        }
        
        [Fact]
        public async Task GetDueThisWeekTasksAsync_ReturnsTasksDueWithinAWeek()
        {
            // Arrange
            int userId = 1;
            var today = DateTime.Today;
            var endOfWeek = today.AddDays(7 - (int)today.DayOfWeek);
            
            var tasks = new List<TaskItem>
            {
                new TaskItem 
                { 
                    Id = 1, 
                    Title = "Due Today", 
                    DueDate = today, 
                    UserId = userId 
                },
                new TaskItem 
                { 
                    Id = 2, 
                    Title = "Due This Week", 
                    DueDate = today.AddDays(3), 
                    UserId = userId 
                },
                new TaskItem 
                { 
                    Id = 3, 
                    Title = "Due Next Week", 
                    DueDate = endOfWeek.AddDays(2), 
                    UserId = userId 
                },
                new TaskItem 
                { 
                    Id = 4, 
                    Title = "Due Last Week", 
                    DueDate = today.AddDays(-5), 
                    UserId = userId 
                }
            };
            
            _mockTaskRepository.Setup(repo => repo.GetAllTasksAsync(userId))
                .ReturnsAsync(tasks);
            
            _mockMapper.Setup(m => m.Map<IEnumerable<TaskItemDTO>>(It.IsAny<IEnumerable<TaskItem>>()))
                .Returns((IEnumerable<TaskItem> source) => source.Select(t => new TaskItemDTO 
                { 
                    Id = t.Id, 
                    Title = t.Title, 
                    DueDate = t.DueDate 
                }));
            
            // Act
            var result = await _taskService.GetDueThisWeekTasksAsync(userId);
            
            // Assert
            Assert.Equal(2, result.Count());
            Assert.Contains(result, t => t.Title == "Due Today");
            Assert.Contains(result, t => t.Title == "Due This Week");
        }
    }
} 