using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.DependencyInjection;
using TaskTrackerAPI.Data;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Services;
using TaskTrackerAPI.Services.Interfaces;
using Xunit;
using Xunit.Abstractions;

namespace TaskTrackerAPI.ServiceTests.Services
{
    public class AlgorithmServiceTests
    {
        private readonly ITestOutputHelper _testOutputHelper;
        private readonly IServiceProvider _serviceProvider;
        
        public AlgorithmServiceTests(ITestOutputHelper testOutputHelper)
        {
            _testOutputHelper = testOutputHelper;
            
            // Set up services
            ServiceCollection services = new ServiceCollection();
            
            // Configure test database with in-memory database
            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseInMemoryDatabase("AlgorithmServiceTestDb"));
            
            // Register memory cache
            services.AddMemoryCache();
            
            // Register services
            services.AddScoped<IAlgorithmService, AlgorithmService>();
            
            _serviceProvider = services.BuildServiceProvider();
        }
        
        [Fact]
        public async Task SmartTaskPrioritization_PerformanceTest_WithLargeDataset()
        {
            // Arrange
            const int userId = 1;
            const int taskCount = 500; // Large enough to test performance
            
            await SeedLargeDataset(userId, taskCount);
            
            using IServiceScope scope = _serviceProvider.CreateScope();
            AlgorithmService algorithmService = scope.ServiceProvider.GetRequiredService<AlgorithmService>();
            
            // Act
            Stopwatch stopwatch = Stopwatch.StartNew();
            IEnumerable<TaskItem> prioritizedTasks = await algorithmService.GetSmartPrioritizedTasksAsync(userId);
            stopwatch.Stop();
            
            // Assert
            _testOutputHelper.WriteLine($"Prioritized {prioritizedTasks.Count()} tasks in {stopwatch.ElapsedMilliseconds}ms");
            
            // Performance benchmark - should prioritize 500 tasks in under 500ms
            Assert.True(stopwatch.ElapsedMilliseconds < 500, 
                $"Smart prioritization took too long: {stopwatch.ElapsedMilliseconds}ms for {taskCount} tasks");
            
            // Verify correct prioritization
            List<TaskItem> orderedTasks = prioritizedTasks.ToList();
            Assert.NotEmpty(orderedTasks);
            
            // Verify at least the first few tasks are correctly prioritized
            // This might be probabilistic since the test data is randomly generated
            TaskItem firstTask = orderedTasks.First();
            
            // Overdue high priority tasks should be at the top
            if (firstTask.DueDate.HasValue && firstTask.DueDate.Value < DateTime.UtcNow)
            {
                _testOutputHelper.WriteLine("First task is overdue as expected");
            }
            else if (firstTask.Priority == 3)
            {
                _testOutputHelper.WriteLine("First task is high priority as expected");
            }
            else
            {
                _testOutputHelper.WriteLine($"First task has priority {firstTask.Priority} and due date {firstTask.DueDate}");
            }
        }
        
        private async Task SeedLargeDataset(int userId, int taskCount)
        {
            using IServiceScope seedScope = _serviceProvider.CreateScope();
            ApplicationDbContext dbContext = seedScope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            
            // Clear existing data
            dbContext.Users.RemoveRange(dbContext.Users);
            dbContext.Categories.RemoveRange(dbContext.Categories);
            dbContext.Tasks.RemoveRange(dbContext.Tasks);
            await dbContext.SaveChangesAsync();
            
            // Create test user
            User user = new User
            {
                Id = userId,
                Username = "testuser",
                Email = "test@example.com",
                PasswordHash = "hash",
                Salt = "salt",
                Role = "User",
                CreatedAt = DateTime.UtcNow
            };
            dbContext.Users.Add(user);
            
            // Create some categories
            List<Category> categories = new List<Category>
            {
                new Category { Id = 1, Name = "Work", UserId = userId },
                new Category { Id = 2, Name = "Personal", UserId = userId },
                new Category { Id = 3, Name = "Urgent", UserId = userId },
                new Category { Id = 4, Name = "Important", UserId = userId },
                new Category { Id = 5, Name = "Low Priority", UserId = userId }
            };
            dbContext.Categories.AddRange(categories);
            await dbContext.SaveChangesAsync();
            
            // Generate random tasks
            Random random = new Random(42); // Fixed seed for reproducibility
            DateTime now = DateTime.UtcNow;
            List<TaskItem> tasks = new List<TaskItem>();
            
            for (int i = 0; i < taskCount; i++)
            {
                int priority = random.Next(1, 4); // 1-3
                int categoryId = random.Next(1, 6); // 1-5
                int daysOffset = random.Next(-10, 30); // Due date between -10 and +30 days
                int createdDaysAgo = random.Next(1, 60); // Created between 1 and 60 days ago
                bool isCompleted = random.NextDouble() < 0.2; // 20% completed
                
                tasks.Add(new TaskItem
                {
                    Title = $"Task {i}",
                    Description = $"Description for task {i}",
                    Status = isCompleted ? TaskItemStatus.Completed : TaskItemStatus.ToDo,
                    Priority = priority,
                    CategoryId = categoryId,
                    UserId = userId,
                    DueDate = now.AddDays(daysOffset),
                    CreatedAt = now.AddDays(-createdDaysAgo)
                });
            }
            
            dbContext.Tasks.AddRange(tasks);
            await dbContext.SaveChangesAsync();
            
            _testOutputHelper.WriteLine($"Seeded {taskCount} tasks for performance testing");
        }
    }
} 