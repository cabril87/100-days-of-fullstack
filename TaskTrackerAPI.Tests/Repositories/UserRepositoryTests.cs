using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TaskTrackerAPI.Data;
using TaskTrackerAPI.Helpers;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories;
using TaskTrackerAPI.Tests.Helpers;
using Xunit;

namespace TaskTrackerAPI.Tests.Repositories
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
            using (var context = new ApplicationDbContext(_options))
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
            using var context = new ApplicationDbContext(_options);
            var repository = new UserRepository(context, _authHelper);
            int userId = 1;
            
            // Act
            var user = await repository.GetUserByIdAsync(userId);
            
            // Assert
            Assert.NotNull(user);
            Assert.Equal(userId, user!.Id);
            Assert.Equal("testuser1", user.Username);
        }
        
        [Fact]
        public async Task GetByIdAsync_WithInvalidId_ReturnsNull()
        {
            // Arrange
            using var context = new ApplicationDbContext(_options);
            var repository = new UserRepository(context, _authHelper);
            int invalidUserId = 999;
            
            // Act
            var user = await repository.GetUserByIdAsync(invalidUserId);
            
            // Assert
            Assert.Null(user);
        }
        
        [Fact]
        public async Task GetByUsernameAsync_WithValidUsername_ReturnsUser()
        {
            // Arrange
            using var context = new ApplicationDbContext(_options);
            var repository = new UserRepository(context, _authHelper);
            string username = "testuser1";
            
            // Act
            var user = await repository.GetUserByUsernameAsync(username);
            
            // Assert
            Assert.NotNull(user);
            Assert.Equal(username, user!.Username);
            Assert.Equal(1, user.Id);
        }
        
        [Fact]
        public async Task GetByUsernameAsync_WithInvalidUsername_ReturnsNull()
        {
            // Arrange
            using var context = new ApplicationDbContext(_options);
            var repository = new UserRepository(context, _authHelper);
            string invalidUsername = "nonexistentuser";
            
            // Act
            var user = await repository.GetUserByUsernameAsync(invalidUsername);
            
            // Assert
            Assert.Null(user);
        }
        
        [Fact]
        public async Task GetByEmailAsync_WithValidEmail_ReturnsUser()
        {
            // Arrange
            using var context = new ApplicationDbContext(_options);
            var repository = new UserRepository(context, _authHelper);
            string email = "test1@example.com";
            
            // Act
            var user = await repository.GetUserByEmailAsync(email);
            
            // Assert
            Assert.NotNull(user);
            Assert.Equal(email, user!.Email);
            Assert.Equal(1, user.Id);
        }
        
        [Fact]
        public async Task GetByEmailAsync_WithInvalidEmail_ReturnsNull()
        {
            // Arrange
            using var context = new ApplicationDbContext(_options);
            var repository = new UserRepository(context, _authHelper);
            string invalidEmail = "nonexistent@example.com";
            
            // Act
            var user = await repository.GetUserByEmailAsync(invalidEmail);
            
            // Assert
            Assert.Null(user);
        }
        
        [Fact]
        public async Task CreateAsync_ShouldAddNewUser()
        {
            // Arrange
            using var context = new ApplicationDbContext(_options);
            var repository = new UserRepository(context, _authHelper);
            var newUser = new User
            {
                Username = "newuser",
                Email = "new@example.com",
                PasswordHash = "newhashpassword",
                Salt = "newsalt",
                Role = "User",
                FirstName = "New",
                LastName = "User",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            
            // Act
            var result = await repository.CreateUserAsync(newUser);
            
            // Assert
            Assert.True(result.Id > 0);
            Assert.Contains(context.Users, u => u.Username == "newuser");
        }
        
        [Fact]
        public async Task UpdateAsync_ShouldModifyExistingUser()
        {
            // Arrange
            using var context = new ApplicationDbContext(_options);
            var repository = new UserRepository(context, _authHelper);
            var user = await context.Users.FindAsync(1);
            user!.FirstName = "Updated";
            user.LastName = "Name";
            
            // Act
            await repository.UpdateUserAsync(user);
            
            // Assert
            var updatedUser = await context.Users.FindAsync(1);
            Assert.Equal("Updated", updatedUser!.FirstName);
            Assert.Equal("Name", updatedUser.LastName);
        }
        
        [Fact]
        public async Task DeleteAsync_ShouldDeactivateUser()
        {
            // Arrange
            using var context = new ApplicationDbContext(_options);
            var repository = new UserRepository(context, _authHelper);
            int userId = 1;
            
            // Act
            await repository.DeleteUserAsync(userId);
            
            // Assert
            var user = await context.Users.FindAsync(userId);
            Assert.NotNull(user);
            Assert.False(user!.IsActive);
        }
        
        [Fact]
        public async Task UserExistsByUsernameAsync_WithExistingUsername_ReturnsTrue()
        {
            // Arrange
            using var context = new ApplicationDbContext(_options);
            var repository = new UserRepository(context, _authHelper);
            string existingUsername = "testuser1";
            
            // Act
            var result = await repository.UserExistsByUsernameAsync(existingUsername);
            
            // Assert
            Assert.True(result);
        }
        
        [Fact]
        public async Task UserExistsByUsernameAsync_WithNonExistingUsername_ReturnsFalse()
        {
            // Arrange
            using var context = new ApplicationDbContext(_options);
            var repository = new UserRepository(context, _authHelper);
            string nonExistingUsername = "nonexistentuser";
            
            // Act
            var result = await repository.UserExistsByUsernameAsync(nonExistingUsername);
            
            // Assert
            Assert.False(result);
        }
        
        [Fact]
        public async Task UserExistsByEmailAsync_WithExistingEmail_ReturnsTrue()
        {
            // Arrange
            using var context = new ApplicationDbContext(_options);
            var repository = new UserRepository(context, _authHelper);
            string existingEmail = "test1@example.com";
            
            // Act
            var result = await repository.UserExistsByEmailAsync(existingEmail);
            
            // Assert
            Assert.True(result);
        }
        
        [Fact]
        public async Task UserExistsByEmailAsync_WithNonExistingEmail_ReturnsFalse()
        {
            // Arrange
            using var context = new ApplicationDbContext(_options);
            var repository = new UserRepository(context, _authHelper);
            string nonExistingEmail = "nonexistent@example.com";
            
            // Act
            var result = await repository.UserExistsByEmailAsync(nonExistingEmail);
            
            // Assert
            Assert.False(result);
        }
    }
} 