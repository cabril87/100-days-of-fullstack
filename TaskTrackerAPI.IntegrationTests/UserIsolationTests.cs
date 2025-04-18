using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Testing;
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.IntegrationTests.Auth;
using Xunit;

namespace TaskTrackerAPI.IntegrationTests
{
    public class UserIsolationTests : IClassFixture<CustomWebApplicationFactory<Program>>
    {
        private readonly HttpClient _client;
        private readonly CustomWebApplicationFactory<Program> _factory;
        private readonly JsonSerializerOptions _jsonOptions = new()
        {
            PropertyNameCaseInsensitive = true,
            Converters = { new JsonStringEnumConverter() }
        };

        public UserIsolationTests(CustomWebApplicationFactory<Program> factory)
        {
            _factory = factory;
            
            // Set up client with user 1
            Auth.TestAuthHandler.ResetUser(); // Reset to default user (ID: 1)
            _client = factory.CreateClient(new WebApplicationFactoryClientOptions
            {
                AllowAutoRedirect = false
            });
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("TestScheme");
        }

        [Fact]
        public async Task GetTasks_OnlyReturnsTasksForCurrentUser()
        {
            // Act - Get tasks for user 1 (default user)
            HttpResponseMessage response = await _client.GetAsync("/api/TaskItems");
            
            // Assert
            response.EnsureSuccessStatusCode();
            
            var content = await response.Content.ReadAsStringAsync();
            
            // Try to deserialize directly first
            ApiResponse<List<TaskItemDTO>>? apiResponse = null;
            try
            {
                apiResponse = JsonSerializer.Deserialize<ApiResponse<List<TaskItemDTO>>>(content, _jsonOptions);
            }
            catch (JsonException ex)
            {
                Console.WriteLine($"Error deserializing: {ex.Message}");
                throw;
            }
            
            Assert.NotNull(apiResponse);
            Assert.NotNull(apiResponse.Data);
            Assert.All(apiResponse.Data, task => Assert.Equal(1, task.UserId)); // All tasks should belong to user with ID 1
        }
        
        [Fact]
        public async Task GetCategories_OnlyReturnsCategoriesForCurrentUser()
        {
            // Act - Get categories for user 1 (default user)
            var response = await _client.GetAsync("/api/Categories");
            
            // Assert
            response.EnsureSuccessStatusCode();
            
            var content = await response.Content.ReadAsStringAsync();
            
            // Try to deserialize directly first
            List<CategoryDTO>? categories = null;
            try 
            {
                categories = JsonSerializer.Deserialize<List<CategoryDTO>>(content, _jsonOptions);
            }
            catch (JsonException)
            {
                // If direct deserialization fails, try with ApiResponse wrapper
                var apiResponse = JsonSerializer.Deserialize<ApiResponse<List<CategoryDTO>>>(content, _jsonOptions);
                categories = apiResponse?.Data;
            }
            
            Assert.NotNull(categories);
            Assert.All(categories, category => Assert.Equal(1, category.UserId)); // All categories should belong to user with ID 1
        }
        
        [Fact]
        public async Task CannotAccessOtherUsersTasks()
        {
            // Create a task with user 1 (default user)
            var newTask = new TaskItemDTO
            {
                Title = "User Isolation Test Task",
                Description = "This task is owned by user 1",
                DueDate = DateTime.UtcNow.AddDays(5),
                Status = TaskItemStatus.ToDo,
                Priority = 1
            };
            
            // Use user 1's client to create a task
            var createResponse = await _client.PostAsJsonAsync("/api/TaskItems", newTask);
            createResponse.EnsureSuccessStatusCode();
            
            var createContent = await createResponse.Content.ReadAsStringAsync();
            TaskItemDTO? createdTask = null;
            
            try
            {
                createdTask = JsonSerializer.Deserialize<TaskItemDTO>(createContent, _jsonOptions);
            }
            catch (JsonException)
            {
                // Try with API response wrapper
                var apiResponse = JsonSerializer.Deserialize<ApiResponse<TaskItemDTO>>(createContent, _jsonOptions);
                createdTask = apiResponse?.Data;
            }
            
            Assert.NotNull(createdTask);
            
            // Create a fresh client with user 2's identity
            // We'll create a separate factory to avoid test contamination
            var factory2 = new CustomWebApplicationFactory<Program>();
            Auth.TestAuthHandler.UserId = "2"; // Set static user ID to 2
            Auth.TestAuthHandler.Username = "admin";
            Auth.TestAuthHandler.Role = "Admin";
            
            var user2Client = factory2.CreateClient(new WebApplicationFactoryClientOptions
            {
                AllowAutoRedirect = false
            });
            user2Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("TestScheme");
            
            // Attempt to access user 1's task with user 2's client
            var response = await user2Client.GetAsync($"/api/TaskItems/{createdTask.Id}");
            
            // Should return 404 Not Found (resource doesn't exist for user 2)
            // or 403 Forbidden
            Assert.True(response.StatusCode == HttpStatusCode.NotFound || response.StatusCode == HttpStatusCode.Forbidden, 
                $"Expected status code NotFound (404) or Forbidden (403), but got {response.StatusCode}");

            // Reset user ID back to 1 for subsequent tests
            Auth.TestAuthHandler.ResetUser();
        }
        
        [Fact]
        public async Task CannotAccessOtherUsersCategories()
        {
            // Create a category with user 1 (default user)
            var categoryName = $"Test Category {Guid.NewGuid()}";
            var newCategory = new CategoryCreateDTO
            {
                Name = categoryName,
                Description = "Category for isolation test"
            };
            
            // Use user 1's client to create a category
            var createResponse = await _client.PostAsJsonAsync("/api/Categories", newCategory);
            createResponse.EnsureSuccessStatusCode();
            
            var createContent = await createResponse.Content.ReadAsStringAsync();
            CategoryDTO? createdCategory = JsonSerializer.Deserialize<CategoryDTO>(createContent, _jsonOptions);
            
            Assert.NotNull(createdCategory);
            
            // Create a fresh client with user 2's identity
            // We'll create a separate factory to avoid test contamination
            var factory2 = new CustomWebApplicationFactory<Program>();
            Auth.TestAuthHandler.UserId = "2"; // Set static user ID to 2
            Auth.TestAuthHandler.Username = "admin";
            Auth.TestAuthHandler.Role = "Admin";
            
            var user2Client = factory2.CreateClient(new WebApplicationFactoryClientOptions
            {
                AllowAutoRedirect = false
            });
            user2Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("TestScheme");
            
            // Attempt to access user 1's category with user 2's client
            var response = await user2Client.GetAsync($"/api/Categories/{createdCategory.Id}");
            
            // Should return 404 Not Found (resource doesn't exist for user 2) 
            // or 403 Forbidden
            Assert.True(response.StatusCode == HttpStatusCode.NotFound || response.StatusCode == HttpStatusCode.Forbidden, 
                $"Expected status code NotFound (404) or Forbidden (403), but got {response.StatusCode}");
            
            // Reset user ID back to 1 for subsequent tests
            Auth.TestAuthHandler.ResetUser();
        }
    }
} 