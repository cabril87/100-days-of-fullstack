using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Moq;
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.DTOs.Auth;
using TaskTrackerAPI.Helpers;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories.Interfaces;
using TaskTrackerAPI.Services;
using TaskTrackerAPI.Services.Interfaces;
using TaskTrackerAPI.ServiceTests.Helpers;
using Xunit;

namespace TaskTrackerAPI.ServiceTests.Services
{
    public class AuthServiceTests
    {
        private readonly Mock<IUserRepository> _mockUserRepository;
        private readonly AuthHelperMock _authHelper;
        private readonly Mock<ILogger<AuthService>> _mockLogger;
        private readonly AuthService _authService;
        
        public AuthServiceTests()
        {
            _mockUserRepository = new Mock<IUserRepository>();
            _authHelper = new AuthHelperMock();
            _mockLogger = new Mock<ILogger<AuthService>>();
            var mockSessionManagementService = new Mock<ISessionManagementService>();
            
            _authService = new AuthService(
                _mockUserRepository.Object,
                _authHelper,
                _mockLogger.Object,
                mockSessionManagementService.Object
            );
        }
        
        [Fact]
        public async Task RegisterUserAsync_WithValidData_ReturnsUserDTO()
        {
            // Arrange
            UserCreateDTO userDto = new UserCreateDTO
            {
                Username = "testuser",
                Email = "test@example.com",
                Password = "Password123!",
                ConfirmPassword = "Password123!",
                FirstName = "Test",
                LastName = "User"
            };
            
            _mockUserRepository.Setup(repo => repo.UserExistsByEmailAsync(userDto.Email))
                .ReturnsAsync(false);
                
            _mockUserRepository.Setup(repo => repo.UserExistsByUsernameAsync(userDto.Username))
                .ReturnsAsync(false);
                
            _mockUserRepository.Setup(repo => repo.CreateUserAsync(It.IsAny<User>()))
                .ReturnsAsync((User user) => 
                {
                    user.Id = 1;
                    return user;
                });
            
            // Act
            UserDTO result = await _authService.RegisterUserAsync(userDto);
            
            // Assert
            Assert.NotNull(result);
            Assert.Equal(1, result.Id);
            Assert.Equal(userDto.Username, result.Username);
            Assert.Equal(userDto.Email, result.Email);
            Assert.Equal(userDto.FirstName, result.FirstName);
            Assert.Equal(userDto.LastName, result.LastName);
            Assert.Equal("User", result.Role);
        }
        
        [Fact]
        public async Task LoginAsync_WithValidCredentials_ReturnsTokensResponse()
        {
            // Arrange
            string ipAddress = "127.0.0.1";
            UserLoginDTO loginDto = new UserLoginDTO
            {
                EmailOrUsername = "test@example.com",
                Password = "Password123!"
            };
            
            User user = new User
            {
                Id = 1,
                Username = "testuser",
                Email = loginDto.Email,
                PasswordHash = "hashedpassword",
                Salt = "salt",
                FirstName = "Test",
                LastName = "User",
                Role = "User",
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };
            
            _mockUserRepository.Setup(repo => repo.GetUserByEmailAsync(loginDto.EmailOrUsername))
                .ReturnsAsync(user);
                
            _mockUserRepository.Setup(repo => repo.CheckPasswordAsync(user, loginDto.Password))
                .ReturnsAsync(true);
                
            _mockUserRepository.Setup(repo => repo.CreateRefreshTokenAsync(It.IsAny<RefreshToken>()))
                .ReturnsAsync((RefreshToken token) => token);
                
            _mockUserRepository.Setup(repo => repo.UpdateUserAsync(It.IsAny<User>()))
                .Returns(Task.CompletedTask);
            
            // Act
            TokensResponseDTO result = await _authService.LoginAsync(loginDto, ipAddress);
            
            // Assert
            Assert.NotNull(result);
            Assert.NotNull(result.AccessToken);
            Assert.NotEmpty(result.AccessToken);
            Assert.NotNull(result.RefreshToken);
            Assert.NotEmpty(result.RefreshToken);
            Assert.NotNull(result.User);
            Assert.Equal(user.Id, result.User.Id);
            Assert.Equal(user.Username, result.User.Username);
            Assert.Equal(user.Email, result.User.Email);
        }
        
        [Fact]
        public async Task UpdateUserRoleAsync_WithValidData_UpdatesRole()
        {
            // Arrange
            int userId = 2;
            int adminId = 1;
            string newRole = "Admin";
            
            User user = new User
            {
                Id = userId,
                Username = "testuser",
                Email = "test@example.com",
                Role = "User",
                PasswordHash = "hash1",
                Salt = "salt1"
            };
            
            User admin = new User
            {
                Id = adminId,
                Username = "admin",
                Email = "admin@example.com",
                Role = "Admin",
                PasswordHash = "hash2",
                Salt = "salt2"
            };
            
            _mockUserRepository.Setup(repo => repo.GetUserByIdAsync(userId))
                .ReturnsAsync(user);
                
            _mockUserRepository.Setup(repo => repo.GetUserByIdAsync(adminId))
                .ReturnsAsync(admin);
                
            _mockUserRepository.Setup(repo => repo.UpdateUserAsync(It.IsAny<User>()))
                .Returns(Task.CompletedTask);
            
            // Act
            await _authService.UpdateUserRoleAsync(userId, newRole, adminId);
            
            // Assert
            _mockUserRepository.Verify(repo => repo.UpdateUserAsync(It.Is<User>(u => 
                u.Id == userId && u.Role == newRole)), Times.Once);
        }
        
        [Fact]
        public async Task UpdateUserRoleAsync_WithNonAdminUser_ThrowsException()
        {
            // Arrange
            int userId = 2;
            int nonAdminId = 3;
            string newRole = "Admin";
            
            User user = new User
            {
                Id = userId,
                Username = "testuser",
                Email = "test@example.com",
                Role = "User",
                PasswordHash = "hash1",
                Salt = "salt1"
            };
            
            User nonAdmin = new User
            {
                Id = nonAdminId,
                Username = "nonadmin",
                Email = "nonadmin@example.com",
                Role = "User", // Not an admin
                PasswordHash = "hash3",
                Salt = "salt3"
            };
            
            _mockUserRepository.Setup(repo => repo.GetUserByIdAsync(userId))
                .ReturnsAsync(user);
                
            _mockUserRepository.Setup(repo => repo.GetUserByIdAsync(nonAdminId))
                .ReturnsAsync(nonAdmin);
            
            // Act & Assert
            UnauthorizedAccessException exception = await Assert.ThrowsAsync<UnauthorizedAccessException>(async () => 
                await _authService.UpdateUserRoleAsync(userId, newRole, nonAdminId));
            
            // Verify the exception message
            Assert.Contains("Only administrators can update user roles", exception.Message);
        }
    }
} 