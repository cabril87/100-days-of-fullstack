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
            using (ApplicationDbContext context = new ApplicationDbContext(_options))
            {
                // Clear existing data
                context.Tasks.RemoveRange(context.Tasks);
                context.Categories.RemoveRange(context.Categories);
                context.Tags.RemoveRange(context.Tags);
                context.TaskTags.RemoveRange(context.TaskTags);
                context.SaveChanges();
                
                // Add test categories
                Category category1 = new Category 
                { 
                    Id = 1, 
                    Name = "Work", 
                    Description = "Work related tasks",
                    UserId = 1 
                };
                
                Category category2 = new Category 
                { 
                    Id = 2, 
                    Name = "Personal", 
                    Description = "Personal tasks",
                    UserId = 1 
                };
                
                context.Categories.AddRange(category1, category2);
                context.SaveChanges();
                
                // Add test tags
                Tag tag1 = new Tag { Id = 1, Name = "Important", UserId = 1 };
                Tag tag2 = new Tag { Id = 2, Name = "Urgent", UserId = 1 };
                Tag tag3 = new Tag { Id = 3, Name = "Low Priority", UserId = 1 };
                
                context.Tags.AddRange(tag1, tag2, tag3);
                context.SaveChanges();
                
                // Add test tasks
                TaskItem task1 = new TaskItem
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
                
                TaskItem task2 = new TaskItem
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
                
                TaskItem task3 = new TaskItem
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
            using ApplicationDbContext context = new ApplicationDbContext(_options);
            TaskItemRepository repository = new TaskItemRepository(context);
            int userId = 1;
            
            // Act
            IEnumerable<TaskItem> tasks = await repository.GetAllTasksAsync(userId);
            
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
            using ApplicationDbContext context = new ApplicationDbContext(_options);
            TaskItemRepository repository = new TaskItemRepository(context);
            int taskId = 1;
            int userId = 1;
            
            // Act
            TaskItem? task = await repository.GetTaskByIdAsync(taskId, userId);
            
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
            using ApplicationDbContext context = new ApplicationDbContext(_options);
            TaskItemRepository repository = new TaskItemRepository(context);
            int taskId = 1;
            int wrongUserId = 2;
            
            // Act
            TaskItem? task = await repository.GetTaskByIdAsync(taskId, wrongUserId);
            
            // Assert
            Assert.Null(task);
        }
    }
} 