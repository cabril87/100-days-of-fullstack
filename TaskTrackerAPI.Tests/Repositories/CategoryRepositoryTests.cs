using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TaskTrackerAPI.Data;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories;
using Xunit;

namespace TaskTrackerAPI.Tests.Repositories
{
    public class CategoryRepositoryTests
    {
        private readonly DbContextOptions<ApplicationDbContext> _options;
        
        public CategoryRepositoryTests()
        {
            // Use a unique DB name for each test run to avoid conflicts
            _options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
                
            // Seed the database
            SeedDatabase();
        }
        
        private void SeedDatabase()
        {
            using (var context = new ApplicationDbContext(_options))
            {
                // Clear existing data
                context.Categories.RemoveRange(context.Categories);
                if (context.Tasks != null) 
                {
                    context.Tasks.RemoveRange(context.Tasks);
                }
                context.SaveChanges();
                
                // Add test data
                context.Categories.AddRange(
                    new Category 
                    { 
                        Id = 1, 
                        Name = "Work", 
                        Description = "Work related tasks", 
                        UserId = 1 
                    },
                    new Category 
                    { 
                        Id = 2, 
                        Name = "Personal", 
                        Description = "Personal tasks", 
                        UserId = 1 
                    },
                    new Category 
                    { 
                        Id = 3, 
                        Name = "Shopping", 
                        Description = "Shopping list", 
                        UserId = 2 
                    }
                );
                
                // Add a task to the first category
                if (context.Tasks != null)
                {
                    context.Tasks.Add(
                        new TaskItem
                        {
                            Id = 1,
                            Title = "Test Task",
                            Description = "Test Description",
                            CategoryId = 1,
                            UserId = 1,
                            Status = TaskItemStatus.ToDo,
                            Priority = 1
                        }
                    );
                }
                
                context.SaveChanges();
            }
        }
        
        [Fact]
        public async Task GetCategoriesForUserAsync_ReturnsCorrectCategories()
        {
            // Arrange
            using var context = new ApplicationDbContext(_options);
            var repository = new CategoryRepository(context);
            int userId = 1;
            
            // Act
            var categories = await repository.GetCategoriesForUserAsync(userId);
            
            // Assert
            Assert.Equal(2, categories.Count());
            Assert.All(categories, c => Assert.Equal(userId, c.UserId));
            Assert.Contains("Work", categories.Select(c => c.Name));
            Assert.Contains("Personal", categories.Select(c => c.Name));
        }
        
        [Fact]
        public async Task GetCategoryByIdAsync_WithValidIdAndUser_ReturnsCategory()
        {
            // Arrange
            using var context = new ApplicationDbContext(_options);
            var repository = new CategoryRepository(context);
            int categoryId = 1;
            int userId = 1;
            
            // Act
            var category = await repository.GetCategoryByIdAsync(categoryId, userId);
            
            // Assert
            Assert.NotNull(category);
            Assert.Equal(categoryId, category.Id);
            Assert.Equal("Work", category.Name);
        }
        
        [Fact]
        public async Task GetCategoryByIdAsync_WithWrongUser_ReturnsNull()
        {
            // Arrange
            using var context = new ApplicationDbContext(_options);
            var repository = new CategoryRepository(context);
            int categoryId = 1;
            int wrongUserId = 2;
            
            // Act
            var category = await repository.GetCategoryByIdAsync(categoryId, wrongUserId);
            
            // Assert
            Assert.Null(category);
        }
        
        [Fact]
        public async Task CreateCategoryAsync_SavesNewCategory()
        {
            // Arrange
            using var context = new ApplicationDbContext(_options);
            var repository = new CategoryRepository(context);
            var newCategory = new Category
            {
                Name = "New Category",
                Description = "New Description",
                UserId = 1
            };
            
            // Act
            var result = await repository.CreateCategoryAsync(newCategory);
            
            // Assert
            Assert.NotNull(result);
            Assert.NotEqual(0, result.Id);
            Assert.Equal("New Category", result.Name);
            
            // Verify in database
            using var verifyContext = new ApplicationDbContext(_options);
            var savedCategory = await verifyContext.Categories.FindAsync(result.Id);
            Assert.NotNull(savedCategory);
            Assert.Equal("New Category", savedCategory.Name);
        }
        
        [Fact]
        public async Task UpdateCategoryAsync_UpdatesExistingCategory()
        {
            // Arrange
            using var context = new ApplicationDbContext(_options);
            var repository = new CategoryRepository(context);
            var categoryToUpdate = await context.Categories.FindAsync(1);
            Assert.NotNull(categoryToUpdate);
            
            categoryToUpdate.Name = "Updated Work";
            categoryToUpdate.Description = "Updated Description";
            
            // Act
            await repository.UpdateCategoryAsync(categoryToUpdate);
            
            // Assert
            using var verifyContext = new ApplicationDbContext(_options);
            var updatedCategory = await verifyContext.Categories.FindAsync(1);
            Assert.NotNull(updatedCategory);
            Assert.Equal("Updated Work", updatedCategory.Name);
            Assert.Equal("Updated Description", updatedCategory.Description);
        }
        
        [Fact]
        public async Task DeleteCategoryAsync_RemovesCategory()
        {
            // Arrange
            using var context = new ApplicationDbContext(_options);
            var repository = new CategoryRepository(context);
            int categoryId = 2;
            int userId = 1;
            
            // Act
            await repository.DeleteCategoryAsync(categoryId, userId);
            
            // Assert
            using var verifyContext = new ApplicationDbContext(_options);
            var deletedCategory = await verifyContext.Categories.FindAsync(categoryId);
            Assert.Null(deletedCategory);
        }
        
        [Fact]
        public async Task IsCategoryOwnedByUserAsync_WithMatchingUser_ReturnsTrue()
        {
            // Arrange
            using var context = new ApplicationDbContext(_options);
            var repository = new CategoryRepository(context);
            int categoryId = 1;
            int userId = 1;
            
            // Act
            var result = await repository.IsCategoryOwnedByUserAsync(categoryId, userId);
            
            // Assert
            Assert.True(result);
        }
        
        [Fact]
        public async Task IsCategoryOwnedByUserAsync_WithNonMatchingUser_ReturnsFalse()
        {
            // Arrange
            using var context = new ApplicationDbContext(_options);
            var repository = new CategoryRepository(context);
            int categoryId = 1;
            int userId = 999;
            
            // Act
            var result = await repository.IsCategoryOwnedByUserAsync(categoryId, userId);
            
            // Assert
            Assert.False(result);
        }
        
        [Fact]
        public async Task HasTasksAsync_WithTasksInCategory_ReturnsTrue()
        {
            // Arrange
            using var context = new ApplicationDbContext(_options);
            var repository = new CategoryRepository(context);
            int categoryId = 1;
            
            // Act
            var result = await repository.HasTasksAsync(categoryId);
            
            // Assert - Category 1 has a task
            Assert.True(result);
        }
        
        [Fact]
        public async Task HasTasksAsync_WithNoTasksInCategory_ReturnsFalse()
        {
            // Arrange
            using var context = new ApplicationDbContext(_options);
            var repository = new CategoryRepository(context);
            int categoryId = 2;
            
            // Act
            var result = await repository.HasTasksAsync(categoryId);
            
            // Assert - Category 2 has no tasks
            Assert.False(result);
        }
    }
}