using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TaskTrackerAPI.Data;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories;
using Xunit;

namespace TaskTrackerAPI.UnitTests.Repositories
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
            using (ApplicationDbContext context = new ApplicationDbContext(_options))
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
            using ApplicationDbContext context = new ApplicationDbContext(_options);
            CategoryRepository repository = new CategoryRepository(context);
            int userId = 1;
            
            // Act
            IEnumerable<Category> categories = await repository.GetCategoriesForUserAsync(userId);
            
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
            using ApplicationDbContext context = new ApplicationDbContext(_options);
            CategoryRepository repository = new CategoryRepository(context);
            int categoryId = 1;
            int userId = 1;
            
            // Act
            Category? category = await repository.GetCategoryByIdAsync(categoryId, userId);
            
            // Assert
            Assert.NotNull(category);
            Assert.Equal(categoryId, category!.Id);
            Assert.Equal("Work", category.Name);
        }
        
        [Fact]
        public async Task HasTasksAsync_WithTasksInCategory_ReturnsTrue()
        {
            // Arrange
            using ApplicationDbContext context = new ApplicationDbContext(_options);
            CategoryRepository repository = new CategoryRepository(context);
            int categoryId = 1;
            
            // Act
            bool result = await repository.HasTasksAsync(categoryId);
            
            // Assert - Category 1 has a task
            Assert.True(result);
        }
    }
} 