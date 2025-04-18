using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.Extensions.Logging;
using Moq;
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories.Interfaces;
using TaskTrackerAPI.Services;
using Xunit;

namespace TaskTrackerAPI.Tests.Services
{
    public class UserIsolationTests
    {
        // Task Service Tests for User Isolation
        [Fact(Skip = "This test is redundant with tests in TaskServiceTests")]
        public async Task TaskService_OnlyAccessesUserOwnedTasks()
        {
            // This test is being skipped as it's redundant with tests already in TaskServiceTests
        }
        
        // Category Service Tests for User Isolation
        [Fact]
        public async Task CategoryService_OnlyAccessesUserOwnedCategories()
        {
            // Arrange
            var mockCategoryRepo = new Mock<ICategoryRepository>();
            var mockLogger = new Mock<ILogger<CategoryService>>();
            var mockMapper = new Mock<IMapper>();
            
            // Set up the mapper mock
            mockMapper.Setup(m => m.Map<IEnumerable<CategoryDTO>>(It.IsAny<IEnumerable<Category>>()))
                .Returns((IEnumerable<Category> src) => src.Select(c => new CategoryDTO
                {
                    Id = c.Id,
                    Name = c.Name,
                    Description = c.Description,
                    UserId = c.UserId
                }));
                
            mockMapper.Setup(m => m.Map<CategoryDTO>(It.IsAny<Category>()))
                .Returns((Category src) => new CategoryDTO
                {
                    Id = src.Id,
                    Name = src.Name,
                    Description = src.Description,
                    UserId = src.UserId
                });
            
            // User 1's categories
            var user1Categories = new List<Category>
            {
                new Category { Id = 1, Name = "User 1 Category 1", UserId = 1 },
                new Category { Id = 2, Name = "User 1 Category 2", UserId = 1 }
            };
            
            // User 2's categories
            var user2Categories = new List<Category>
            {
                new Category { Id = 3, Name = "User 2 Category 1", UserId = 2 },
                new Category { Id = 4, Name = "User 2 Category 2", UserId = 2 }
            };
            
            // Setup the repository behavior
            mockCategoryRepo.Setup(repo => repo.GetCategoriesForUserAsync(1))
                .ReturnsAsync(user1Categories);
                
            mockCategoryRepo.Setup(repo => repo.GetCategoriesForUserAsync(2))
                .ReturnsAsync(user2Categories);
            
            mockCategoryRepo.Setup(repo => repo.GetCategoryByIdAsync(It.IsInRange(1, 2, Moq.Range.Inclusive), 1))
                .ReturnsAsync((int id, int userId) => user1Categories.FirstOrDefault(c => c.Id == id));
                
            mockCategoryRepo.Setup(repo => repo.GetCategoryByIdAsync(It.IsInRange(3, 4, Moq.Range.Inclusive), 2))
                .ReturnsAsync((int id, int userId) => user2Categories.FirstOrDefault(c => c.Id == id));
                
            // Cross-user access should return null (category not found for that user)
            mockCategoryRepo.Setup(repo => repo.GetCategoryByIdAsync(It.IsInRange(1, 2, Moq.Range.Inclusive), 2))
                .ReturnsAsync((Category)null);
                
            mockCategoryRepo.Setup(repo => repo.GetCategoryByIdAsync(It.IsInRange(3, 4, Moq.Range.Inclusive), 1))
                .ReturnsAsync((Category)null);
                
            // IsCategoryOwnedByUserAsync checks
            mockCategoryRepo.Setup(repo => repo.IsCategoryOwnedByUserAsync(It.IsInRange(1, 2, Moq.Range.Inclusive), 1))
                .ReturnsAsync(true);
                
            mockCategoryRepo.Setup(repo => repo.IsCategoryOwnedByUserAsync(It.IsInRange(3, 4, Moq.Range.Inclusive), 2))
                .ReturnsAsync(true);
                
            mockCategoryRepo.Setup(repo => repo.IsCategoryOwnedByUserAsync(It.IsInRange(1, 2, Moq.Range.Inclusive), 2))
                .ReturnsAsync(false);
                
            mockCategoryRepo.Setup(repo => repo.IsCategoryOwnedByUserAsync(It.IsInRange(3, 4, Moq.Range.Inclusive), 1))
                .ReturnsAsync(false);
            
            var categoryService = new CategoryService(
                mockCategoryRepo.Object,
                mockLogger.Object,
                mockMapper.Object
            );
            
            // Act & Assert - User 1 can access their own categories
            var user1AllCategories = await categoryService.GetAllCategoriesAsync(1);
            Assert.Equal(2, user1AllCategories.Count());
            
            var user1Category1 = await categoryService.GetCategoryByIdAsync(1, 1);
            Assert.NotNull(user1Category1);
            Assert.Equal(1, user1Category1.Id);
            
            // Act & Assert - User 2 can access their own categories
            var user2AllCategories = await categoryService.GetAllCategoriesAsync(2);
            Assert.Equal(2, user2AllCategories.Count());
            
            var user2Category3 = await categoryService.GetCategoryByIdAsync(3, 2);
            Assert.NotNull(user2Category3);
            Assert.Equal(3, user2Category3.Id);
            
            // Act & Assert - User 1 cannot access User 2's categories
            var user1AccessingUser2Category = await categoryService.GetCategoryByIdAsync(3, 1);
            Assert.Null(user1AccessingUser2Category);
            
            var isUser1OwnedUser2Category = await categoryService.IsCategoryOwnedByUserAsync(3, 1);
            Assert.False(isUser1OwnedUser2Category);
            
            // Act & Assert - User 2 cannot access User 1's categories
            var user2AccessingUser1Category = await categoryService.GetCategoryByIdAsync(1, 2);
            Assert.Null(user2AccessingUser1Category);
            
            var isUser2OwnedUser1Category = await categoryService.IsCategoryOwnedByUserAsync(1, 2);
            Assert.False(isUser2OwnedUser1Category);
        }
        
        // Task Service - Delete Operation Isolation
        [Fact]
        public async Task TaskService_DeleteTaskAsync_OnlyDeletesUserOwnedTasks()
        {
            // Arrange
            var mockTaskRepo = new Mock<ITaskItemRepository>();
            var mockMapper = new Mock<IMapper>();
            
            // User 1's task
            var user1Task = new TaskItem { Id = 1, Title = "User 1 Task", UserId = 1 };
            
            // User 2's task
            var user2Task = new TaskItem { Id = 2, Title = "User 2 Task", UserId = 2 };
            
            // Setup repository behavior for GetTaskByIdAsync
            mockTaskRepo.Setup(repo => repo.GetTaskByIdAsync(1, 1))
                .ReturnsAsync(user1Task);
                
            mockTaskRepo.Setup(repo => repo.GetTaskByIdAsync(2, 2))
                .ReturnsAsync(user2Task);
                
            // Setup the repository behavior for IsTaskOwnedByUserAsync to control access
            mockTaskRepo.Setup(repo => repo.IsTaskOwnedByUserAsync(1, 1))
                .ReturnsAsync(true);
                
            mockTaskRepo.Setup(repo => repo.IsTaskOwnedByUserAsync(2, 2))
                .ReturnsAsync(true);
                
            mockTaskRepo.Setup(repo => repo.IsTaskOwnedByUserAsync(1, 2))
                .ReturnsAsync(false);
                
            mockTaskRepo.Setup(repo => repo.IsTaskOwnedByUserAsync(2, 1))
                .ReturnsAsync(false);
                
            // Delete setup - only record the call without actually doing anything
            mockTaskRepo.Setup(repo => repo.DeleteTaskAsync(It.IsAny<int>(), It.IsAny<int>()))
                .Returns(Task.CompletedTask);
            
            // Mock category repository
            Mock<ICategoryRepository> mockCategoryRepo = new Mock<ICategoryRepository>();
            
            var taskService = new TaskService(
                mockTaskRepo.Object,
                mockMapper.Object,
                mockCategoryRepo.Object
            );
            
            // Act - User 1 can delete their own task
            await taskService.DeleteTaskAsync(1, 1);
            
            // Verify that DeleteTaskAsync was called
            mockTaskRepo.Verify(repo => repo.DeleteTaskAsync(1, 1), Times.Once);
            
            // Reset call count
            mockTaskRepo.Invocations.Clear();
            
            // Act - User 2 can delete their own task
            await taskService.DeleteTaskAsync(2, 2);
            
            // Verify
            mockTaskRepo.Verify(repo => repo.DeleteTaskAsync(2, 2), Times.Once);
            
            // Reset call count
            mockTaskRepo.Invocations.Clear();
            
            // Act - User 1 tries to delete User 2's task
            await taskService.DeleteTaskAsync(2, 1);
            
            // Verify - No delete call should happen since task check will verify ownership
            mockTaskRepo.Verify(repo => repo.DeleteTaskAsync(It.IsAny<int>(), It.IsAny<int>()), Times.Never);
            
            // Reset call count
            mockTaskRepo.Invocations.Clear();
            
            // Act - User 2 tries to delete User 1's task
            await taskService.DeleteTaskAsync(1, 2);
            
            // Verify - No delete call should happen since task check will verify ownership
            mockTaskRepo.Verify(repo => repo.DeleteTaskAsync(It.IsAny<int>(), It.IsAny<int>()), Times.Never);
        }
        
        // Category Service - Update Operation Isolation
        [Fact]
        public async Task CategoryService_UpdateCategoryAsync_OnlyUpdatesUserOwnedCategories()
        {
            // Arrange
            var mockCategoryRepo = new Mock<ICategoryRepository>();
            var mockLogger = new Mock<ILogger<CategoryService>>();
            var mockMapper = new Mock<IMapper>();
            
            // Set up the mapper mock
            mockMapper.Setup(m => m.Map<IEnumerable<CategoryDTO>>(It.IsAny<IEnumerable<Category>>()))
                .Returns((IEnumerable<Category> src) => src.Select(c => new CategoryDTO
                {
                    Id = c.Id,
                    Name = c.Name,
                    Description = c.Description,
                    UserId = c.UserId
                }));
                
            mockMapper.Setup(m => m.Map<CategoryDTO>(It.IsAny<Category>()))
                .Returns((Category src) => new CategoryDTO
                {
                    Id = src.Id,
                    Name = src.Name,
                    Description = src.Description,
                    UserId = src.UserId
                });
            
            // User 1's category
            var user1Category = new Category { Id = 1, Name = "User 1 Category", UserId = 1 };
            
            // User 2's category
            var user2Category = new Category { Id = 2, Name = "User 2 Category", UserId = 2 };
            
            // Setup repository behavior
            mockCategoryRepo.Setup(repo => repo.GetCategoryByIdAsync(1, 1))
                .ReturnsAsync(user1Category);
                
            mockCategoryRepo.Setup(repo => repo.GetCategoryByIdAsync(2, 2))
                .ReturnsAsync(user2Category);
                
            // Cross-user access
            mockCategoryRepo.Setup(repo => repo.GetCategoryByIdAsync(1, 2))
                .ReturnsAsync((Category)null);
                
            mockCategoryRepo.Setup(repo => repo.GetCategoryByIdAsync(2, 1))
                .ReturnsAsync((Category)null);
                
            // IsCategoryOwnedByUserAsync checks
            mockCategoryRepo.Setup(repo => repo.IsCategoryOwnedByUserAsync(1, 1))
                .ReturnsAsync(true);
                
            mockCategoryRepo.Setup(repo => repo.IsCategoryOwnedByUserAsync(2, 2))
                .ReturnsAsync(true);
                
            mockCategoryRepo.Setup(repo => repo.IsCategoryOwnedByUserAsync(1, 2))
                .ReturnsAsync(false);
                
            mockCategoryRepo.Setup(repo => repo.IsCategoryOwnedByUserAsync(2, 1))
                .ReturnsAsync(false);
                
            // UpdateCategoryAsync setup - only record the call without actually doing anything
            mockCategoryRepo.Setup(repo => repo.UpdateCategoryAsync(It.IsAny<Category>()))
                .Returns(Task.CompletedTask);
            
            var categoryService = new CategoryService(
                mockCategoryRepo.Object,
                mockLogger.Object,
                mockMapper.Object
            );
            
            // Create DTOs for updates
            var user1CategoryUpdateDto = new CategoryUpdateDTO { Name = "Updated User 1 Category", Description = "Updated description" };
            var user2CategoryUpdateDto = new CategoryUpdateDTO { Name = "Updated User 2 Category", Description = "Updated description" };
            
            // Act & Assert - User 1 can update their own category
            var user1UpdateResult = await categoryService.UpdateCategoryAsync(1, 1, user1CategoryUpdateDto);
            Assert.NotNull(user1UpdateResult);
            mockCategoryRepo.Verify(repo => repo.UpdateCategoryAsync(It.IsAny<Category>()), Times.Once);
            
            // Reset call count
            mockCategoryRepo.Invocations.Clear();
            
            // User 2 can update their own category
            var user2UpdateResult = await categoryService.UpdateCategoryAsync(2, 2, user2CategoryUpdateDto);
            Assert.NotNull(user2UpdateResult);
            mockCategoryRepo.Verify(repo => repo.UpdateCategoryAsync(It.IsAny<Category>()), Times.Once);
            
            // Reset call count
            mockCategoryRepo.Invocations.Clear();
            
            // User 1 cannot update User 2's category
            var user1UpdateUser2CategoryResult = await categoryService.UpdateCategoryAsync(2, 1, user1CategoryUpdateDto);
            Assert.Null(user1UpdateUser2CategoryResult);
            mockCategoryRepo.Verify(repo => repo.UpdateCategoryAsync(It.IsAny<Category>()), Times.Never);
            
            // User 2 cannot update User 1's category
            var user2UpdateUser1CategoryResult = await categoryService.UpdateCategoryAsync(1, 2, user2CategoryUpdateDto);
            Assert.Null(user2UpdateUser1CategoryResult);
            mockCategoryRepo.Verify(repo => repo.UpdateCategoryAsync(It.IsAny<Category>()), Times.Never);
        }
    }
} 