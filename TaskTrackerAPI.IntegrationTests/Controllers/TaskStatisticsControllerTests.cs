using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Testing;
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.Models;
using Xunit;

namespace TaskTrackerAPI.IntegrationTests.Controllers
{
    public class TaskStatisticsControllerTests : IClassFixture<CustomWebApplicationFactory<Program>>
    {
        private readonly HttpClient _client;
        private readonly CustomWebApplicationFactory<Program> _factory;
        private readonly JsonSerializerOptions _jsonOptions = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };

        public TaskStatisticsControllerTests(CustomWebApplicationFactory<Program> factory)
        {
            _factory = factory;
            _client = factory.CreateClient(new WebApplicationFactoryClientOptions
            {
                AllowAutoRedirect = false
            });

            // Set authentication for all requests
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Test");
        }

        [Fact]
        public async Task GetTaskCompletionRate_ReturnsTaskCompletionRate()
        {
            // Act
            HttpResponseMessage response = await _client.GetAsync("/api/TaskStatistics/completion-rate");

            // Assert
            response.EnsureSuccessStatusCode();
            TaskCompletionRateDTO? completionRate = await response.Content.ReadFromJsonAsync<TaskCompletionRateDTO>(_jsonOptions);
            
            Assert.NotNull(completionRate);
            // Validate that it's within valid range (0-100%)
            Assert.True(completionRate.CompletionRate >= 0 && completionRate.CompletionRate <= 100, 
                "Completion rate should be between 0 and 100%");
        }

        [Fact]
        public async Task GetTasksByStatusDistribution_ReturnsStatusDistribution()
        {
            // Act
            HttpResponseMessage response = await _client.GetAsync("/api/TaskStatistics/status-distribution");

            // Assert
            response.EnsureSuccessStatusCode();
            Dictionary<string, int>? distribution = await response.Content.ReadFromJsonAsync<Dictionary<string, int>>(_jsonOptions);
            
            Assert.NotNull(distribution);
            
            // Verify that at least one status is represented
            Assert.True(distribution.Count > 0, "Status distribution should have at least one status");
            
            // Verify that all values are non-negative
            foreach (int count in distribution.Values)
            {
                Assert.True(count >= 0, "Status count should be non-negative");
            }
        }

        [Fact]
        public async Task GetTasksByPriorityDistribution_ReturnsPriorityDistribution()
        {
            // Act
            HttpResponseMessage response = await _client.GetAsync("/api/TaskStatistics/priority-distribution");

            // Assert
            response.EnsureSuccessStatusCode();
            Dictionary<string, int>? distribution = await response.Content.ReadFromJsonAsync<Dictionary<string, int>>(_jsonOptions);
            
            Assert.NotNull(distribution);
            
            // Verify that all values are non-negative
            foreach (int count in distribution.Values)
            {
                Assert.True(count >= 0, "Priority count should be non-negative");
            }
        }

        [Fact]
        public async Task GetMostActiveCategories_ReturnsActiveCategoriesList()
        {
            // Act
            HttpResponseMessage response = await _client.GetAsync("/api/TaskStatistics/active-categories?limit=3");

            // Assert
            response.EnsureSuccessStatusCode();
            List<CategoryActivityDTO>? categories = await response.Content.ReadFromJsonAsync<List<CategoryActivityDTO>>(_jsonOptions);
            
            Assert.NotNull(categories);
            
            // Verify we get at most the number requested
            Assert.True(categories.Count <= 3, "Should return at most 3 categories");
            
            // If we have results, verify they have the expected properties
            if (categories.Count > 0)
            {
                CategoryActivityDTO firstCategory = categories[0];
                Assert.True(firstCategory.CategoryId > 0, "Category ID should be positive");
                Assert.False(string.IsNullOrEmpty(firstCategory.Name), "Category name should not be empty");
                Assert.True(firstCategory.TaskCount >= 0, "Task count should be non-negative");
            }
        }

        [Fact]
        public async Task GetTaskCompletionTimeAverage_ReturnsAverageTime()
        {
            // Act
            HttpResponseMessage response = await _client.GetAsync("/api/TaskStatistics/completion-time-average");

            // Assert
            response.EnsureSuccessStatusCode();
            TimeSpan averageTime = await response.Content.ReadFromJsonAsync<TimeSpan>(_jsonOptions);

            // TimeSpan can be negative but in this context it should be non-negative
            Assert.True(averageTime.TotalMilliseconds >= 0, 
                "Average completion time should be non-negative");
        }

        [Fact]
        public async Task GetOverdueTasksStatistics_ReturnsOverdueStats()
        {
            // Act
            HttpResponseMessage response = await _client.GetAsync("/api/TaskStatistics/overdue");

            // Assert
            response.EnsureSuccessStatusCode();
            OverdueTasksStatisticsDTO? overdueStats = await response.Content.ReadFromJsonAsync<OverdueTasksStatisticsDTO>(_jsonOptions);
            
            Assert.NotNull(overdueStats);
            Assert.True(overdueStats.TotalOverdueTasks >= 0, "Total overdue tasks should be non-negative");
            Assert.True(overdueStats.AverageDaysOverdue >= 0, "Average days overdue should be non-negative");
        }

        // Helper method to create a task for testing
        private async Task<TaskItemDTO> CreateTestTask(string title, TaskItemStatus status, int priority)
        {
            TaskItemDTO newTask = new TaskItemDTO
            {
                Title = title,
                Description = "Test task for statistics",
                DueDate = DateTime.UtcNow.AddDays(1),
                Status = status,
                Priority = priority,
                CategoryId = 1 // Assuming category ID 1 exists
            };

            HttpResponseMessage response = await _client.PostAsJsonAsync("/api/TaskItems", newTask);
            response.EnsureSuccessStatusCode();
            
            TaskItemDTO? created = await response.Content.ReadFromJsonAsync<TaskItemDTO>(_jsonOptions);
            return created!;
        }
    }
} 