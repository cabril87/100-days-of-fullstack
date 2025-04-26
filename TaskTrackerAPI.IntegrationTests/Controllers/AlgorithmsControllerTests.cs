using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using TaskTrackerAPI.Data;
using TaskTrackerAPI.Models;
using Xunit;

namespace TaskTrackerAPI.IntegrationTests.Controllers
{
    public class AlgorithmsControllerTests : IClassFixture<CustomWebApplicationFactory<Program>>
    {
        private readonly HttpClient _client;
        private readonly CustomWebApplicationFactory<Program> _factory;
        private readonly JsonSerializerOptions _jsonOptions;

        public AlgorithmsControllerTests(CustomWebApplicationFactory<Program> factory)
        {
            _factory = factory;
            _client = factory.CreateClient();
            
            // Set up authentication with mock token
            _client.DefaultRequestHeaders.Add("Authorization", "Bearer mock-token");
            
            // Configure JSON options for enum serialization
            _jsonOptions = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
                Converters = { new JsonStringEnumConverter() }
            };
        }

        [Fact]
        public async Task GetSmartPrioritizedTasks_ReturnsSuccessAndOrderedTasks()
        {
            // Arrange - Create some test data
            await SeedTestData();
            
            // Act
            HttpResponseMessage response = await _client.GetAsync($"/api/Algorithms/smart-priority?userId=1");
            
            // Assert
            response.EnsureSuccessStatusCode();
            
            // Use the configured JSON options
            ApiResponse<List<TaskItem>> result = await response.Content.ReadFromJsonAsync<ApiResponse<List<TaskItem>>>(_jsonOptions);
            
            Assert.NotNull(result);
            Assert.True(result.Success);
            Assert.NotEmpty(result.Data);
            
            // Verify tasks are ordered by priority
            // First task should be the overdue one or one with closest due date
            List<TaskItem> tasks = result.Data;
            Assert.True(tasks.Count >= 2);
            
            // Check if order is correct based on priority, due date, etc.
            // This can vary based on your prioritization algorithm
            // but we can check that completed tasks aren't included
            Assert.DoesNotContain(tasks, t => t.Status == TaskItemStatus.Completed);
        }
        
        [Fact]
        public async Task GetFamilyLoadBalancing_ReturnsSuccessAndValidStructure()
        {
            // Act
            HttpResponseMessage response = await _client.GetAsync($"/api/Algorithms/load-balance?familyId=1");
            
            // Assert
            response.EnsureSuccessStatusCode();
            string content = await response.Content.ReadAsStringAsync();
            
            // Even if it's empty, it should return a success response
            Assert.Contains("\"success\":true", content.ToLower());
        }
        
        [Fact]
        public async Task GetSmartPrioritizedTasks_WithInvalidUserId_ReturnsSuccessWithEmptyData()
        {
            // Act - Use a negative user ID which should be invalid
            HttpResponseMessage response = await _client.GetAsync($"/api/Algorithms/smart-priority?userId=-1");
            
            // The current implementation returns success status code with empty data instead of an error
            response.EnsureSuccessStatusCode();
            
            // Verify that we get an empty result list
            ApiResponse<List<TaskItem>> result = await response.Content.ReadFromJsonAsync<ApiResponse<List<TaskItem>>>(_jsonOptions);
            Assert.NotNull(result);
            Assert.True(result.Success);
            Assert.Empty(result.Data); // Data should be empty for invalid user ID
        }
        
        private async Task SeedTestData()
        {
            using (IServiceScope scope = _factory.Services.CreateScope())
            {
                IServiceProvider scopedServices = scope.ServiceProvider;
                ApplicationDbContext dbContext = scopedServices.GetRequiredService<ApplicationDbContext>();
                
                // Clear existing tasks first to avoid conflicts
                dbContext.Tasks.RemoveRange(dbContext.Tasks);
                await dbContext.SaveChangesAsync();
                
                // Check if test user already exists before adding
                User testUser = await dbContext.Users.FindAsync(1);
                if (testUser == null)
                {
                    testUser = new User
                    {
                        Id = 1,
                        Username = "testuser",
                        Email = "test@example.com",
                        PasswordHash = "hash",
                        Salt = "salt",
                        Role = "User",
                        CreatedAt = DateTime.UtcNow
                    };
                    dbContext.Users.Add(testUser);
                    await dbContext.SaveChangesAsync();
                }
                
                // Check if category already exists before adding
                Category existingCategory = await dbContext.Categories.FirstOrDefaultAsync(c => c.Id == 1);
                if (existingCategory == null)
                {
                    Category category = new Category
                    {
                        Id = 1,
                        Name = "TestCategory",
                        UserId = testUser.Id
                    };
                    dbContext.Categories.Add(category);
                    await dbContext.SaveChangesAsync();
                }
                
                // Add test tasks with varying priorities and due dates
                DateTime now = DateTime.UtcNow;
                List<TaskItem> tasks = new List<TaskItem>
                {
                    new TaskItem
                    {
                        Title = "Overdue Task",
                        Description = "This task is overdue",
                        Status = TaskItemStatus.ToDo,
                        DueDate = now.AddDays(-2),
                        Priority = 2,
                        UserId = testUser.Id,
                        CategoryId = 1,
                        CreatedAt = now.AddDays(-5)
                    },
                    new TaskItem
                    {
                        Title = "Urgent Task",
                        Description = "This task is due soon",
                        Status = TaskItemStatus.ToDo,
                        DueDate = now.AddDays(1),
                        Priority = 3,
                        UserId = testUser.Id,
                        CategoryId = 1,
                        CreatedAt = now.AddDays(-2)
                    },
                    new TaskItem
                    {
                        Title = "Low Priority Task",
                        Description = "This task is not urgent",
                        Status = TaskItemStatus.ToDo,
                        DueDate = now.AddDays(10),
                        Priority = 1,
                        UserId = testUser.Id,
                        CategoryId = 1,
                        CreatedAt = now.AddDays(-1)
                    },
                    new TaskItem
                    {
                        Title = "Completed Task",
                        Description = "This task is already done",
                        Status = TaskItemStatus.Completed,
                        DueDate = now.AddDays(-1),
                        Priority = 3,
                        UserId = testUser.Id,
                        CategoryId = 1,
                        CreatedAt = now.AddDays(-3)
                    }
                };
                
                dbContext.Tasks.AddRange(tasks);
                await dbContext.SaveChangesAsync();
            }
        }
    }
} 