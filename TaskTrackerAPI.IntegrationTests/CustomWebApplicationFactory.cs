using System;
using System.Linq;
using System.Collections.Generic;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.Data;
using TaskTrackerAPI.Models;
using Microsoft.Extensions.Configuration;
using TaskTrackerAPI.Helpers;
using Microsoft.Extensions.Time.Testing;
using TaskTrackerAPI.Services;
using TaskTrackerAPI.Services.Interfaces;
using TaskTrackerAPI.Repositories;
using TaskTrackerAPI.Repositories.Interfaces;
using AutoMapper;
using TaskTrackerAPI.Profiles;
using System.Text.Json;
using System.Text.Json.Serialization;
using TaskTrackerAPI.IntegrationTests.Auth;

namespace TaskTrackerAPI.IntegrationTests
{
    public class CustomWebApplicationFactory<TStartup> : WebApplicationFactory<TStartup> where TStartup : class
    {
        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.UseEnvironment("Testing");

            builder.ConfigureServices(services =>
            {
                // Create a unique database name for this test run
                string dbName = $"InMemoryTestDb_{Guid.NewGuid()}";

                // Find and remove the existing DbContextOptions registration
                ServiceDescriptor? descriptor = services.SingleOrDefault(
                    d => d.ServiceType == 
                        typeof(DbContextOptions<ApplicationDbContext>));

                if (descriptor != null)
                {
                    services.Remove(descriptor);
                }

                // Remove the ApplicationDbContext registration if it exists
                ServiceDescriptor? contextDescriptor = services.SingleOrDefault(
                    d => d.ServiceType == typeof(ApplicationDbContext));
                    
                if (contextDescriptor != null)
                {
                    services.Remove(contextDescriptor);
                }

                // Add a mock configuration with required settings
                Dictionary<string, string> configDict = new Dictionary<string, string>
                {
                    {"AppSettings:Secret", "test_secret_key_for_integration_testing_with_sufficient_length_12345"},
                    {"AppSettings:PasswordPepper", "test_pepper_for_integration_tests"},
                    {"AppSettings:RefreshTokenTTL", "2"},
                    {"AppSettings:TokenKey", "test_token_key_with_sufficient_length_for_testing_purposes_123456"},
                    {"ConnectionStrings:DefaultConnection", "InMemoryConnection"},
                    {"AppSettings:ValidIssuer", "testIssuer"},
                    {"AppSettings:ValidAudience", "testAudience"}
                };
                
                IConfiguration configuration = new ConfigurationBuilder()
                    .AddInMemoryCollection(configDict.Select(kvp => new KeyValuePair<string, string?>(kvp.Key, kvp.Value)))
                    .Build();
                    
                services.AddSingleton<IConfiguration>(configuration);

                // Create DbContextOptions with the in-memory database
                services.AddDbContext<ApplicationDbContext>(options => 
                {
                    options.UseInMemoryDatabase(dbName);
                });

                // Add a scoped factory for creating the context with options only (avoiding constructor ambiguity)
                services.AddScoped(serviceProvider =>
                {
                    DbContextOptions<ApplicationDbContext> options = serviceProvider.GetRequiredService<DbContextOptions<ApplicationDbContext>>();
                    // Use the constructor that takes only DbContextOptions to avoid ambiguity
                    return new ApplicationDbContext(options);
                });

                // Register a fake time provider
                FakeTimeProvider timeProvider = new FakeTimeProvider(DateTimeOffset.UtcNow);
                services.AddSingleton<TimeProvider>(timeProvider);

                // Remove existing authentication if present
                services.Remove(services.SingleOrDefault(
                    d => d.ServiceType == typeof(AuthenticationHandlerProvider)));
                
                // Configure test authentication
                services.AddAuthentication(options =>
                {
                    options.DefaultAuthenticateScheme = "TestScheme";
                    options.DefaultChallengeScheme = "TestScheme";
                    options.DefaultScheme = "TestScheme";
                })
                .AddScheme<AuthenticationSchemeOptions, TestAuthHandler>(
                    "TestScheme", options => { });

                // Register repositories
                services.AddScoped<ITaskItemRepository, TaskItemRepository>();
                services.AddScoped<ICategoryRepository, CategoryRepository>();
                services.AddScoped<ITagRepository, TagRepository>();
                
                // Register services
                services.AddScoped<ITaskService, TaskService>();
                services.AddScoped<ICategoryService, CategoryService>();
                services.AddScoped<ITagService, TagService>();
                services.AddScoped<TaskStatisticsService>();
                
                // Register AutoMapper
                services.AddAutoMapper(typeof(MappingProfile));

                // Configure JSON options with enum converter
                services.Configure<JsonSerializerOptions>(options =>
                {
                    options.PropertyNameCaseInsensitive = true;
                    options.Converters.Add(new JsonStringEnumConverter());
                });

                // Register JsonSerializerOptions with enum converter as a singleton
                services.AddSingleton(new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true,
                    Converters = { new JsonStringEnumConverter() }
                });

                // Register helpers
                services.AddScoped<AuthHelper>();

                // Build the service provider
                ServiceProvider sp = services.BuildServiceProvider();

                // Create a scope to obtain a reference to the database context
                using (IServiceScope scope = sp.CreateScope())
                {
                    IServiceProvider scopedServices = scope.ServiceProvider;
                    ApplicationDbContext db = scopedServices.GetRequiredService<ApplicationDbContext>();

                    // Ensure the database is created
                    db.Database.EnsureCreated();

                    // Clear any existing data
                    db.Users.RemoveRange(db.Users);
                    db.Categories.RemoveRange(db.Categories);
                    db.Tasks.RemoveRange(db.Tasks);
                    db.SaveChanges();

                    // Seed the database with test data
                    SeedDatabase(db);
                }
            });
        }

        private void SeedDatabase(ApplicationDbContext context)
        {
            // Add test users
            User user1 = new User
            {
                Id = 1,
                Username = "testuser",
                Email = "test@example.com",
                PasswordHash = "hashedpassword123",
                Salt = "salt123",
                Role = "User",
                FirstName = "Test",
                LastName = "User"
            };

            User user2 = new User
            {
                Id = 2,
                Username = "admin",
                Email = "admin@example.com",
                PasswordHash = "hashedpassword456",
                Salt = "salt456",
                Role = "Admin",
                FirstName = "Admin",
                LastName = "User"
            };

            context.Users.Add(user1);
            context.Users.Add(user2);

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

            context.Categories.Add(category1);
            context.Categories.Add(category2);

            // Add test task items
            TaskItem task1 = new TaskItem
            {
                Id = 3,
                Title = "Finish project",
                Description = "Complete the current project",
                DueDate = DateTime.Now.AddDays(7),
                Status = TaskItemStatus.InProgress,
                Priority = 2,
                CategoryId = 1,
                UserId = 1
            };

            TaskItem task2 = new TaskItem
            {
                Id = 4,
                Title = "Buy groceries",
                Description = "Get items from the supermarket",
                DueDate = DateTime.Now.AddDays(1),
                Status = TaskItemStatus.ToDo,
                Priority = 1,
                CategoryId = 2,
                UserId = 1
            };

            context.Tasks.Add(task1);
            context.Tasks.Add(task2);

            context.SaveChanges();
        }

        public HttpClient CreateClientWithUser(string userId, string username = "testuser", string role = "User")
        {
            // Set the user identity for the TestAuthHandler
            Auth.TestAuthHandler.SetUser(userId, username, role);
            
            // Create client
            var client = CreateClient(new WebApplicationFactoryClientOptions
            {
                AllowAutoRedirect = false
            });
            
            // Set auth header
            client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("TestScheme");
            
            return client;
        }
    }
} 