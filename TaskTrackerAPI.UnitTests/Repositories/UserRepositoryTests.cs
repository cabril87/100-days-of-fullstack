using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TaskTrackerAPI.Data;
using TaskTrackerAPI.Helpers;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories;
using TaskTrackerAPI.ServiceTests.Helpers;
using Xunit;

namespace TaskTrackerAPI.UnitTests.Repositories
{
    public class UserRepositoryTests
    {
        private readonly DbContextOptions<ApplicationDbContext> _options;
        private readonly AuthHelperMock _authHelper;
        
        public UserRepositoryTests()
        {
            // Use a unique DB name for each test run to avoid conflicts
            _options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            
            _authHelper = new AuthHelperMock();
                
            // Seed the database
            SeedDatabase();
        }
        
        private void SeedDatabase()
        {
            using (ApplicationDbContext context = new ApplicationDbContext(_options))
            {
                // Clear existing data
                context.Users.RemoveRange(context.Users);
                context.SaveChanges();
                
                // Add test users
                context.Users.AddRange(
                    new User 
                    { 
                        Id = 1, 
                        Username = "testuser1",
                        Email = "test1@example.com",
                        PasswordHash = "hashedpassword1",
                        Salt = "salt1",
                        Role = "User",
                        FirstName = "Test",
                        LastName = "User1",
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    },
                    new User 
                    { 
                        Id = 2, 
                        Username = "testuser2",
                        Email = "test2@example.com",
                        PasswordHash = "hashedpassword2",
                        Salt = "salt2",
                        Role = "User",
                        FirstName = "Test",
                        LastName = "User2",
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    }
                );
                
                context.SaveChanges();
            }
        }
        
        [Fact]
        public async Task GetByIdAsync_WithValidId_ReturnsUser()
        {
            // Arrange
            using ApplicationDbContext context = new ApplicationDbContext(_options);
            UserRepository repository = new UserRepository(context, _authHelper);
            int userId = 1;
            
            // Act
            User? user = await repository.GetUserByIdAsync(userId);
            
            // Assert
            Assert.NotNull(user);
            Assert.Equal(userId, user!.Id);
            Assert.Equal("testuser1", user.Username);
        }
        
        // More tests...
    }
} 