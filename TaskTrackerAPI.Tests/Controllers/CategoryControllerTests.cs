using System;
using System.Collections.Generic;
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
    public class CategoriesControllerTests
    {
        private readonly Mock<ICategoryService> _mockCategoryService;
        private readonly Mock<ITaskService> _mockTaskService;
        private readonly Mock<ILogger<CategoriesController>> _mockLogger;
        private readonly CategoriesController _controller;
        private readonly int _userId = 1;
        
        public CategoriesControllerTests()
        {
            _mockCategoryService = new Mock<ICategoryService>();
            _mockTaskService = new Mock<ITaskService>();
            _mockLogger = new Mock<ILogger<CategoriesController>>();
            
            _controller = new CategoriesController(_mockCategoryService.Object, _mockTaskService.Object, _mockLogger.Object);
            
            // Setup ClaimsPrincipal for authorization tests
            List<Claim> claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, _userId.ToString())
            };
            ClaimsIdentity identity = new ClaimsIdentity(claims, "TestAuthType");
            ClaimsPrincipal claimsPrincipal = new ClaimsPrincipal(identity);
            
            // Setup controller context
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = claimsPrincipal }
            };
        }
        
        [Fact]
        public async Task GetCategories_ReturnsOkResult_WithCategoryList()
        {
            // Arrange
            List<CategoryDTO> categories = new List<CategoryDTO>
            {
                new CategoryDTO { Id = 1, Name = "Work", Description = "Work tasks" },
                new CategoryDTO { Id = 2, Name = "Personal", Description = "Personal tasks" }
            };
            
            _mockCategoryService.Setup(service => service.GetAllCategoriesAsync(1))
                .ReturnsAsync(categories);
            
            // Act
            ActionResult<IEnumerable<CategoryDTO>> result = await _controller.GetCategories();
            
            // Assert
            OkObjectResult okResult = Assert.IsType<OkObjectResult>(result.Result);
            IEnumerable<CategoryDTO> returnedCategories = Assert.IsAssignableFrom<IEnumerable<CategoryDTO>>(okResult.Value);
            Assert.Equal(2, ((List<CategoryDTO>)returnedCategories).Count);
        }
        
        [Fact]
        public async Task GetCategory_WithValidId_ReturnsOkResult()
        {
            // Arrange
            int categoryId = 1;
            CategoryDTO category = new CategoryDTO 
            { 
                Id = categoryId, 
                Name = "Work", 
                Description = "Work tasks" 
            };
            
            _mockCategoryService.Setup(service => service.GetCategoryByIdAsync(categoryId, _userId))
                .ReturnsAsync(category);
                
            // Setup the IsCategoryOwnedByUserAsync to return true
            _mockCategoryService.Setup(service => service.IsCategoryOwnedByUserAsync(categoryId, _userId))
                .ReturnsAsync(true);
            
            // Act
            ActionResult<CategoryDTO> result = await _controller.GetCategory(categoryId);
            
            // Assert
            OkObjectResult okResult = Assert.IsType<OkObjectResult>(result.Result);
            CategoryDTO returnedCategory = Assert.IsType<CategoryDTO>(okResult.Value);
            Assert.Equal(categoryId, returnedCategory.Id);
        }
        
        [Fact]
        public async Task GetCategory_WithInvalidId_ReturnsNotFound()
        {
            // Arrange
            int categoryId = 999;
            
            _mockCategoryService.Setup(service => service.GetCategoryByIdAsync(categoryId, 1))
                .ReturnsAsync((CategoryDTO?)null);
            
            // Act
            ActionResult<CategoryDTO> result = await _controller.GetCategory(categoryId);
            
            // Assert
            Assert.IsType<NotFoundObjectResult>(result.Result);
        }
        
        [Fact]
        public async Task CreateCategory_WithValidData_ReturnsCreatedAtAction()
        {
            // Arrange
            CategoryCreateDTO createDto = new CategoryCreateDTO 
            { 
                Name = "New Category", 
                Description = "New Description" 
            };
            
            CategoryDTO createdCategory = new CategoryDTO 
            { 
                Id = 1, 
                Name = "New Category", 
                Description = "New Description" 
            };
            
            _mockCategoryService.Setup(service => service.CreateCategoryAsync(1, createDto))
                .ReturnsAsync(createdCategory);
            
            // Act
            ActionResult<CategoryDTO> result = await _controller.CreateCategory(createDto);
            
            // Assert
            CreatedAtActionResult createdAtActionResult = Assert.IsType<CreatedAtActionResult>(result.Result);
            Assert.Equal(nameof(CategoriesController.GetCategory), createdAtActionResult.ActionName);
            CategoryDTO returnedCategory = Assert.IsType<CategoryDTO>(createdAtActionResult.Value);
            Assert.Equal(1, returnedCategory.Id);
        }
        
        [Fact]
        public async Task CreateCategory_ThrowsInvalidOperationException_ReturnsBadRequest()
        {
            // Arrange
            CategoryCreateDTO createDto = new CategoryCreateDTO 
            { 
                Name = "Duplicate Category", 
                Description = "Duplicate Description" 
            };
            
            _mockCategoryService.Setup(service => service.CreateCategoryAsync(1, createDto))
                .ThrowsAsync(new InvalidOperationException("Category already exists"));
            
            // Act
            ActionResult<CategoryDTO> result = await _controller.CreateCategory(createDto);
            
            // Assert
            BadRequestObjectResult badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
            Assert.Equal("Category already exists", badRequestResult.Value);
        }
        
        [Fact]
        public async Task UpdateCategory_WithValidData_ReturnsNoContent()
        {
            // Arrange
            int categoryId = 1;
            CategoryUpdateDTO updateDto = new CategoryUpdateDTO 
            { 
                Name = "Updated Category", 
                Description = "Updated Description" 
            };
            
            CategoryDTO updatedCategory = new CategoryDTO 
            { 
                Id = categoryId, 
                Name = "Updated Category", 
                Description = "Updated Description" 
            };
            
            _mockCategoryService.Setup(service => service.UpdateCategoryAsync(categoryId, 1, updateDto))
                .ReturnsAsync(updatedCategory);
            
            // Act
            IActionResult result = await _controller.UpdateCategory(categoryId, updateDto);
            
            // Assert
            Assert.IsType<NoContentResult>(result);
        }
        
        [Fact]
        public async Task UpdateCategory_WithInvalidId_ReturnsNotFound()
        {
            // Arrange
            int categoryId = 999;
            CategoryUpdateDTO updateDto = new CategoryUpdateDTO 
            { 
                Name = "Updated Category",
                Description = "Updated Description"
            };
            
            _mockCategoryService.Setup(service => service.UpdateCategoryAsync(categoryId, 1, updateDto))
                .ReturnsAsync((CategoryDTO?)null);
            
            // Act
            IActionResult result = await _controller.UpdateCategory(categoryId, updateDto);
            
            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }
        
        [Fact]
        public async Task DeleteCategory_WithValidId_ReturnsNoContent()
        {
            // Arrange
            int categoryId = 1;
            
            _mockCategoryService.Setup(service => service.DeleteCategoryAsync(categoryId, 1))
                .ReturnsAsync(true);
            
            // Act
            IActionResult result = await _controller.DeleteCategory(categoryId);
            
            // Assert
            Assert.IsType<NoContentResult>(result);
        }
        
        [Fact]
        public async Task DeleteCategory_WithInvalidId_ReturnsNotFound()
        {
            // Arrange
            int categoryId = 999;
            
            _mockCategoryService.Setup(service => service.DeleteCategoryAsync(categoryId, 1))
                .ReturnsAsync(false);
            
            // Act
            IActionResult result = await _controller.DeleteCategory(categoryId);
            
            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }
        
        [Fact]
        public async Task DeleteCategory_ThrowsInvalidOperationException_ReturnsBadRequest()
        {
            // Arrange
            int categoryId = 1;
            
            _mockCategoryService.Setup(service => service.DeleteCategoryAsync(categoryId, 1))
                .ThrowsAsync(new InvalidOperationException("Cannot delete category with tasks"));
            
            // Act
            IActionResult result = await _controller.DeleteCategory(categoryId);
            
            // Assert
            BadRequestObjectResult badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Cannot delete category with tasks", badRequestResult.Value);
        }
        
        [Fact]
        public async Task SearchCategories_ReturnsOkResult_WithCategoryList()
        {
            // Arrange
            string searchTerm = "work";
            List<CategoryDTO> categories = new List<CategoryDTO>
            {
                new CategoryDTO { Id = 1, Name = "Work", Description = "Work tasks" }
            };
            
            _mockCategoryService.Setup(service => service.SearchCategoriesAsync(1, searchTerm))
                .ReturnsAsync(categories);
            
            // Act
            ActionResult<IEnumerable<CategoryDTO>> result = await _controller.SearchCategories(searchTerm);
            
            // Assert
            OkObjectResult okResult = Assert.IsType<OkObjectResult>(result.Result);
            IEnumerable<CategoryDTO> returnedCategories = Assert.IsAssignableFrom<IEnumerable<CategoryDTO>>(okResult.Value);
            Assert.Single((List<CategoryDTO>)returnedCategories);
        }
        
        [Fact]
        public async Task GetCategoryTaskCount_WithValidId_ReturnsOkResult()
        {
            // Arrange
            int categoryId = 1;
            int taskCount = 5;
            
            _mockCategoryService.Setup(service => service.GetTaskCountInCategoryAsync(categoryId, 1))
                .ReturnsAsync(taskCount);
            
            // Act
            ActionResult<int> result = await _controller.GetCategoryTaskCount(categoryId);
            
            // Assert
            OkObjectResult okResult = Assert.IsType<OkObjectResult>(result.Result);
            int returnedCount = Assert.IsType<int>(okResult.Value);
            Assert.Equal(taskCount, returnedCount);
        }
        
        [Fact]
        public async Task GetCategoryTaskCount_ThrowsUnauthorizedAccessException_ReturnsForbid()
        {
            // Arrange
            int categoryId = 2;
            
            _mockCategoryService.Setup(service => service.GetTaskCountInCategoryAsync(categoryId, 1))
                .ThrowsAsync(new UnauthorizedAccessException("Not authorized"));
            
            // Act
            ActionResult<int> result = await _controller.GetCategoryTaskCount(categoryId);
            
            // Assert
            Assert.IsType<ForbidResult>(result.Result);
        }
        
        [Fact]
        public async Task GetCategoryStatistics_ReturnsOkResult_WithStatisticsDictionary()
        {
            // Arrange
            Dictionary<string, int> statistics = new Dictionary<string, int>
            {
                { "Work", 5 },
                { "Personal", 3 }
            };
            
            _mockCategoryService.Setup(service => service.GetCategoryStatisticsAsync(1))
                .ReturnsAsync(statistics);
            
            // Act
            ActionResult<Dictionary<string, int>> result = await _controller.GetCategoryStatistics();
            
            // Assert
            OkObjectResult okResult = Assert.IsType<OkObjectResult>(result.Result);
            Dictionary<string, int> returnedStatistics = Assert.IsType<Dictionary<string, int>>(okResult.Value);
            Assert.Equal(2, returnedStatistics.Count);
            Assert.Equal(5, returnedStatistics["Work"]);
            Assert.Equal(3, returnedStatistics["Personal"]);
        }
        
        [Fact]
        public async Task GetTasksByCategory_ReturnsOkResult_WithTaskList()
        {
            // Arrange
            int categoryId = 1;
            List<TaskItemDTO> tasks = new List<TaskItemDTO>
            {
                new TaskItemDTO { Id = 1, Title = "Task 1", CategoryId = categoryId },
                new TaskItemDTO { Id = 2, Title = "Task 2", CategoryId = categoryId }
            };
            
            _mockCategoryService.Setup(service => service.IsCategoryOwnedByUserAsync(categoryId, _userId))
                .ReturnsAsync(true);
            
            _mockTaskService.Setup(service => service.GetTasksByCategoryAsync(_userId, categoryId))
                .ReturnsAsync(tasks);
            
            // Act
            ActionResult<IEnumerable<TaskItemDTO>> result = await _controller.GetTasksByCategory(categoryId);
            
            // Assert
            OkObjectResult okResult = Assert.IsType<OkObjectResult>(result.Result);
            IEnumerable<TaskItemDTO> returnedTasks = Assert.IsAssignableFrom<IEnumerable<TaskItemDTO>>(okResult.Value);
            Assert.Equal(2, returnedTasks.Count());
        }
        
        [Fact]
        public async Task GetTasksByCategory_WithInvalidId_ReturnsNotFound()
        {
            // Arrange
            int categoryId = 999;
            
            _mockCategoryService.Setup(service => service.IsCategoryOwnedByUserAsync(categoryId, _userId))
                .ReturnsAsync(false);
            
            // Act
            ActionResult<IEnumerable<TaskItemDTO>> result = await _controller.GetTasksByCategory(categoryId);
            
            // Assert
            Assert.IsType<NotFoundObjectResult>(result.Result);
        }
        
        [Fact]
        public async Task GetTasksByCategory_WithUnauthorizedAccess_ReturnsForbid()
        {
            // Arrange
            int categoryId = 2;
            
            _mockCategoryService.Setup(service => service.IsCategoryOwnedByUserAsync(categoryId, _userId))
                .ReturnsAsync(true);
            
            _mockTaskService.Setup(service => service.GetTasksByCategoryAsync(_userId, categoryId))
                .ThrowsAsync(new UnauthorizedAccessException("Not authorized"));
            
            // Act
            ActionResult<IEnumerable<TaskItemDTO>> result = await _controller.GetTasksByCategory(categoryId);
            
            // Assert
            Assert.IsType<ForbidResult>(result.Result);
        }
    }
} 