using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using TaskTrackerAPI.Controllers;
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Services.Interfaces;
using Xunit;

namespace TaskTrackerAPI.Tests.Controllers
{
    public class TaskItemsControllerTests
    {
        private readonly Mock<ITaskService> _mockTaskService;
        private readonly Mock<ILogger<TaskItemsController>> _mockLogger;
        private readonly TaskItemsController _controller;
        private readonly ClaimsPrincipal _user;
        private const int UserId = 1;

        public TaskItemsControllerTests()
        {
            _mockTaskService = new Mock<ITaskService>();
            _mockLogger = new Mock<ILogger<TaskItemsController>>();
            
            // Setup ClaimsPrincipal for authenticated user
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, UserId.ToString())
            };
            var identity = new ClaimsIdentity(claims, "TestAuthType");
            _user = new ClaimsPrincipal(identity);
            
            _controller = new TaskItemsController(_mockTaskService.Object, _mockLogger.Object);
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = _user }
            };
        }
        
        [Fact]
        public async Task GetTasks_ReturnsOkWithTasks()
        {
            // Arrange
            var tasks = new List<TaskItem>
            {
                new TaskItem { Id = 1, Title = "Task 1", UserId = UserId },
                new TaskItem { Id = 2, Title = "Task 2", UserId = UserId }
            };
            
            var taskDtos = new List<TaskItemDTO>
            {
                new TaskItemDTO { Id = 1, Title = "Task 1" },
                new TaskItemDTO { Id = 2, Title = "Task 2" }
            };
            
            _mockTaskService.Setup(s => s.GetAllTasksAsync(UserId))
                .ReturnsAsync(taskDtos);
                
            // Act
            var result = await _controller.GetTasks();
            
            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnValue = Assert.IsAssignableFrom<IEnumerable<TaskItemDTO>>(okResult.Value);
            Assert.Equal(2, returnValue.Count());
        }
        
        [Fact]
        public async Task GetTaskItem_WithValidId_ReturnsOkWithTask()
        {
            // Arrange
            int taskId = 1;
            var taskDto = new TaskItemDTO { Id = taskId, Title = "Task 1" };
            
            _mockTaskService.Setup(s => s.GetTaskByIdAsync(UserId, taskId))
                .ReturnsAsync(taskDto);
                
            // Act
            var result = await _controller.GetTaskItem(taskId);
            
            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnValue = Assert.IsType<TaskItemDTO>(okResult.Value);
            Assert.Equal(taskId, returnValue.Id);
            Assert.Equal("Task 1", returnValue.Title);
        }
        
        [Fact]
        public async Task GetTaskItem_WithInvalidId_ReturnsNotFound()
        {
            // Arrange
            int taskId = 999;
            
            _mockTaskService.Setup(s => s.GetTaskByIdAsync(UserId, taskId))
                .ReturnsAsync((TaskItemDTO)null);
                
            // Act
            var result = await _controller.GetTaskItem(taskId);
            
            // Assert
            Assert.IsType<NotFoundObjectResult>(result.Result);
        }
        
        [Fact]
        public async Task CreateTaskItem_WithValidData_ReturnsCreatedAtAction()
        {
            // Arrange
            var taskDto = new TaskItemDTO
            {
                Title = "New Task",
                Description = "New Description",
                CategoryId = 1,
                Priority = 1,
                Status = TaskItemStatus.ToDo
            };
            
            var createdTaskDto = new TaskItemDTO
            {
                Id = 3,
                Title = "New Task",
                Description = "New Description",
                CategoryId = 1,
                Priority = 1,
                Status = TaskItemStatus.ToDo
            };
            
            _mockTaskService.Setup(s => s.CreateTaskAsync(UserId, taskDto))
                .ReturnsAsync(createdTaskDto);
                
            // Act
            var result = await _controller.CreateTaskItem(taskDto);
            
            // Assert
            var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(result.Result);
            Assert.Equal(nameof(TaskItemsController.GetTaskItem), createdAtActionResult.ActionName);
            Assert.Equal(3, createdAtActionResult.RouteValues["id"]);
            
            var returnValue = Assert.IsType<TaskItemDTO>(createdAtActionResult.Value);
            Assert.Equal(3, returnValue.Id);
            Assert.Equal("New Task", returnValue.Title);
        }
        
        [Fact]
        public async Task CreateTaskItem_WithUnauthorizedCategory_ReturnsBadRequest()
        {
            // Arrange
            var taskDto = new TaskItemDTO
            {
                Title = "New Task",
                Description = "New Description",
                CategoryId = 999,
                Priority = 1,
                Status = TaskItemStatus.ToDo
            };
            
            _mockTaskService.Setup(s => s.CreateTaskAsync(UserId, taskDto))
                .ThrowsAsync(new UnauthorizedAccessException("User is not authorized to use this category"));
                
            // Act
            var result = await _controller.CreateTaskItem(taskDto);
            
            // Assert
            Assert.IsType<ObjectResult>(result.Result);
            Assert.Equal(500, ((ObjectResult)result.Result).StatusCode);
        }
        
        [Fact]
        public async Task UpdateTaskItem_WithValidData_ReturnsNoContent()
        {
            // Arrange
            int taskId = 1;
            var taskDto = new TaskItemDTO
            {
                Title = "Updated Task",
                Description = "Updated Description",
                CategoryId = 1,
                Priority = 2,
                Status = TaskItemStatus.InProgress
            };
            
            var updatedTaskDto = new TaskItemDTO
            {
                Id = taskId,
                Title = "Updated Task",
                Description = "Updated Description",
                CategoryId = 1,
                Priority = 2,
                Status = TaskItemStatus.InProgress
            };
            
            _mockTaskService.Setup(s => s.UpdateTaskAsync(UserId, taskId, taskDto))
                .ReturnsAsync(updatedTaskDto);
                
            // Act
            var result = await _controller.UpdateTaskItem(taskId, taskDto);
            
            // Assert
            Assert.IsType<NoContentResult>(result);
        }
        
        [Fact]
        public async Task UpdateTaskItem_WithInvalidId_ReturnsNotFound()
        {
            // Arrange
            int taskId = 999;
            var taskDto = new TaskItemDTO
            {
                Title = "Updated Task",
                Description = "Updated Description",
                CategoryId = 1,
                Priority = 2,
                Status = TaskItemStatus.InProgress
            };
            
            _mockTaskService.Setup(s => s.UpdateTaskAsync(UserId, taskId, taskDto))
                .ReturnsAsync((TaskItemDTO)null);
                
            // Act
            var result = await _controller.UpdateTaskItem(taskId, taskDto);
            
            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }
        
        [Fact]
        public async Task DeleteTaskItem_WithValidId_ReturnsNoContent()
        {
            // Arrange
            int taskId = 1;
            
            _mockTaskService.Setup(s => s.DeleteTaskAsync(UserId, taskId))
                .Returns(Task.CompletedTask);
                
            // Act
            var result = await _controller.DeleteTaskItem(taskId);
            
            // Assert
            Assert.IsType<NoContentResult>(result);
        }
        
        [Fact]
        public async Task GetTasksByCategory_WithValidId_ReturnsOkWithTasks()
        {
            // Arrange
            int categoryId = 1;
            var taskDtos = new List<TaskItemDTO>
            {
                new TaskItemDTO { Id = 1, Title = "Task 1", CategoryId = categoryId },
                new TaskItemDTO { Id = 2, Title = "Task 2", CategoryId = categoryId }
            };
            
            _mockTaskService.Setup(s => s.GetTasksByCategoryAsync(UserId, categoryId))
                .ReturnsAsync(taskDtos);
                
            // Act
            var result = await _controller.GetTasksByCategory(categoryId);
            
            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnValue = Assert.IsAssignableFrom<IEnumerable<TaskItemDTO>>(okResult.Value);
            Assert.Equal(2, returnValue.Count());
            Assert.All(returnValue, dto => Assert.Equal(categoryId, dto.CategoryId));
        }
        
        [Fact]
        public async Task GetTasksByCategory_WithUnauthorizedCategory_ReturnsForbidden()
        {
            // Arrange
            int categoryId = 999;
            
            _mockTaskService.Setup(s => s.GetTasksByCategoryAsync(UserId, categoryId))
                .ThrowsAsync(new UnauthorizedAccessException("User is not authorized to access this category"));
                
            // Act
            var result = await _controller.GetTasksByCategory(categoryId);
            
            // Assert
            Assert.IsType<ObjectResult>(result.Result);
            Assert.Equal(500, ((ObjectResult)result.Result).StatusCode);
        }
    }
} 