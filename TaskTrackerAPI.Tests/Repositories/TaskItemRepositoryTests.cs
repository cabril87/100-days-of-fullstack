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
    public class TaskItemRepositoryTests
    {
        private readonly DbContextOptions<ApplicationDbContext> _options;
        
        public TaskItemRepositoryTests()
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
                context.Tasks.RemoveRange(context.Tasks);
                context.Categories.RemoveRange(context.Categories);
                context.Tags.RemoveRange(context.Tags);
                context.TaskTags.RemoveRange(context.TaskTags);
                context.SaveChanges();
                
                // Add test categories
                var category1 = new Category 
                { 
                    Id = 1, 
                    Name = "Work", 
                    Description = "Work related tasks",
                    UserId = 1 
                };
                
                var category2 = new Category 
                { 
                    Id = 2, 
                    Name = "Personal", 
                    Description = "Personal tasks",
                    UserId = 1 
                };
                
                context.Categories.AddRange(category1, category2);
                context.SaveChanges();
                
                // Add test tags
                var tag1 = new Tag { Id = 1, Name = "Important", UserId = 1 };
                var tag2 = new Tag { Id = 2, Name = "Urgent", UserId = 1 };
                var tag3 = new Tag { Id = 3, Name = "Low Priority", UserId = 1 };
                
                context.Tags.AddRange(tag1, tag2, tag3);
                context.SaveChanges();
                
                // Add test tasks
                var task1 = new TaskItem
                {
                    Id = 1,
                    Title = "Complete Project",
                    Description = "Finish the project by the deadline",
                    Status = TaskItemStatus.InProgress,
                    Priority = 2, // High priority
                    DueDate = DateTime.Now.AddDays(7),
                    CategoryId = 1,
                    Category = category1,
                    UserId = 1
                };
                
                var task2 = new TaskItem
                {
                    Id = 2,
                    Title = "Buy Groceries",
                    Description = "Get items for the week",
                    Status = TaskItemStatus.ToDo,
                    Priority = 1, // Medium priority
                    DueDate = DateTime.Now.AddDays(1),
                    CategoryId = 2,
                    Category = category2,
                    UserId = 1
                };
                
                var task3 = new TaskItem
                {
                    Id = 3,
                    Title = "Team Meeting",
                    Description = "Weekly team sync",
                    Status = TaskItemStatus.ToDo,
                    Priority = 1, // Medium priority
                    DueDate = DateTime.Now.AddDays(2),
                    CategoryId = 1,
                    Category = category1,
                    UserId = 2
                };
                
                context.Tasks.AddRange(task1, task2, task3);
                context.SaveChanges();
                
                // Add task-tag relationships
                context.TaskTags.AddRange(
                    new TaskTag { TaskId = 1, TagId = 1 },
                    new TaskTag { TaskId = 1, TagId = 2 },
                    new TaskTag { TaskId = 2, TagId = 3 }
                );
                
                context.SaveChanges();
            }
        }
        
        [Fact]
        public async Task GetAllTasksAsync_ReturnsCorrectTasksForUser()
        {
            // Arrange
            using var context = new ApplicationDbContext(_options);
            var repository = new TaskItemRepository(context);
            int userId = 1;
            
            // Act
            var tasks = await repository.GetAllTasksAsync(userId);
            
            // Assert
            Assert.Equal(2, tasks.Count());
            Assert.All(tasks, t => Assert.Equal(userId, t.UserId));
            Assert.Contains("Complete Project", tasks.Select(t => t.Title));
            Assert.Contains("Buy Groceries", tasks.Select(t => t.Title));
        }
        
        [Fact]
        public async Task GetTaskByIdAsync_WithValidIdAndUser_ReturnsTask()
        {
            // Arrange
            using var context = new ApplicationDbContext(_options);
            var repository = new TaskItemRepository(context);
            int taskId = 1;
            int userId = 1;
            
            // Act
            var task = await repository.GetTaskByIdAsync(taskId, userId);
            
            // Assert
            Assert.NotNull(task);
            Assert.Equal(taskId, task!.Id);
            Assert.Equal("Complete Project", task.Title);
            Assert.NotNull(task.Category);
            Assert.Equal("Work", task.Category!.Name);
        }
        
        [Fact]
        public async Task GetTaskByIdAsync_WithWrongUser_ReturnsNull()
        {
            // Arrange
            using var context = new ApplicationDbContext(_options);
            var repository = new TaskItemRepository(context);
            int taskId = 1;
            int wrongUserId = 2;
            
            // Act
            var task = await repository.GetTaskByIdAsync(taskId, wrongUserId);
            
            // Assert
            Assert.Null(task);
        }
        
        [Fact]
        public async Task GetTasksByStatusAsync_ReturnsTasksWithMatchingStatus()
        {
            // Arrange
            using var context = new ApplicationDbContext(_options);
            var repository = new TaskItemRepository(context);
            int userId = 1;
            TaskItemStatus status = TaskItemStatus.InProgress;
            
            // Act
            var tasks = await repository.GetTasksByStatusAsync(userId, status);
            
            // Assert
            Assert.Single(tasks);
            Assert.All(tasks, t => Assert.Equal(status, t.Status));
            Assert.All(tasks, t => Assert.Equal(userId, t.UserId));
            Assert.Equal("Complete Project", tasks.First().Title);
        }
        
        [Fact]
        public async Task GetTasksByCategoryAsync_ReturnsTasksInCategory()
        {
            // Arrange
            using var context = new ApplicationDbContext(_options);
            var repository = new TaskItemRepository(context);
            int userId = 1;
            int categoryId = 1;
            
            // Act
            var tasks = await repository.GetTasksByCategoryAsync(userId, categoryId);
            
            // Assert
            Assert.Single(tasks);
            Assert.All(tasks, t => Assert.Equal(categoryId, t.CategoryId));
            Assert.All(tasks, t => Assert.Equal(userId, t.UserId));
            Assert.Equal("Complete Project", tasks.First().Title);
        }
        
        [Fact]
        public async Task GetTasksByTagAsync_ReturnsTasksWithTag()
        {
            // Arrange
            using var context = new ApplicationDbContext(_options);
            var repository = new TaskItemRepository(context);
            int userId = 1;
            int tagId = 1; // Important tag
            
            // Act
            var tasks = await repository.GetTasksByTagAsync(userId, tagId);
            
            // Assert
            Assert.Single(tasks);
            Assert.All(tasks, t => Assert.Equal(userId, t.UserId));
            Assert.Equal("Complete Project", tasks.First().Title);
        }
        
        [Fact]
        public async Task IsTaskOwnedByUserAsync_WithCorrectOwner_ReturnsTrue()
        {
            // Arrange
            using var context = new ApplicationDbContext(_options);
            var repository = new TaskItemRepository(context);
            int taskId = 1;
            int userId = 1;
            
            // Act
            var result = await repository.IsTaskOwnedByUserAsync(taskId, userId);
            
            // Assert
            Assert.True(result);
        }
        
        [Fact]
        public async Task IsTaskOwnedByUserAsync_WithWrongOwner_ReturnsFalse()
        {
            // Arrange
            using var context = new ApplicationDbContext(_options);
            var repository = new TaskItemRepository(context);
            int taskId = 1;
            int wrongUserId = 3;
            
            // Act
            var result = await repository.IsTaskOwnedByUserAsync(taskId, wrongUserId);
            
            // Assert
            Assert.False(result);
        }
        
        [Fact]
        public async Task GetTagsForTaskAsync_ReturnsCorrectTags()
        {
            // Arrange
            using var context = new ApplicationDbContext(_options);
            var repository = new TaskItemRepository(context);
            int taskId = 1;
            
            // Act
            var tags = await repository.GetTagsForTaskAsync(taskId);
            
            // Assert
            Assert.Equal(2, tags.Count());
            Assert.Contains("Important", tags.Select(t => t.Name));
            Assert.Contains("Urgent", tags.Select(t => t.Name));
        }
        
        [Fact]
        public async Task CreateTaskAsync_ShouldAddNewTask()
        {
            // Arrange
            using var context = new ApplicationDbContext(_options);
            var repository = new TaskItemRepository(context);
            var newTask = new TaskItem
            {
                Title = "New Test Task",
                Description = "Test description",
                Status = TaskItemStatus.ToDo,
                Priority = 0, // Low priority
                DueDate = DateTime.Now.AddDays(10),
                CategoryId = 1,
                UserId = 1
            };
            
            // Act
            var result = await repository.CreateTaskAsync(newTask);
            
            // Assert
            Assert.True(result.Id > 0);
            Assert.Contains(context.Tasks, t => t.Title == "New Test Task");
        }
        
        [Fact]
        public async Task UpdateTaskAsync_ShouldModifyExistingTask()
        {
            // Arrange
            using var context = new ApplicationDbContext(_options);
            var repository = new TaskItemRepository(context);
            var task = await context.Tasks.FindAsync(1);
            task!.Title = "Updated Task Title";
            task.Status = TaskItemStatus.Completed;
            
            // Act
            await repository.UpdateTaskAsync(task);
            
            // Assert
            var updatedTask = await context.Tasks.FindAsync(1);
            Assert.Equal("Updated Task Title", updatedTask!.Title);
            Assert.Equal(TaskItemStatus.Completed, updatedTask.Status);
        }
        
        [Fact]
        public async Task DeleteTaskAsync_ShouldRemoveTask()
        {
            // Arrange
            using var context = new ApplicationDbContext(_options);
            var repository = new TaskItemRepository(context);
            int taskId = 1;
            int userId = 1;
            
            // Act
            await repository.DeleteTaskAsync(taskId, userId);
            
            // Assert
            var task = await context.Tasks.FindAsync(taskId);
            Assert.Null(task);
        }
    }
} 