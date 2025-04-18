using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using TaskTrackerAPI.Controllers;
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.Services.Interfaces;
using Xunit;

namespace TaskTrackerAPI.Tests.Controllers
{
    public class AuthControllerTests
    {
        private readonly Mock<IAuthService> _mockAuthService;
        private readonly Mock<ILogger<AuthController>> _mockLogger;
        private readonly AuthController _controller;
        
        public AuthControllerTests()
        {
            _mockAuthService = new Mock<IAuthService>();
            _mockLogger = new Mock<ILogger<AuthController>>();
            _controller = new AuthController(_mockAuthService.Object, _mockLogger.Object);
        }
        
        [Fact]
        public async Task Register_ValidUser_ReturnsCreatedAtAction()
        {
            // Arrange
            var userCreateDto = new UserCreateDTO 
            { 
                Username = "testuser",
                Email = "test@example.com", 
                Password = "Test123!",
                FirstName = "Test",
                LastName = "User"
            };
            
            var userDto = new UserDTO 
            { 
                Id = 1, 
                Username = "testuser",
                Email = "test@example.com",
                FirstName = "Test",
                LastName = "User"
            };
            
            _mockAuthService.Setup(x => x.RegisterUserAsync(userCreateDto))
                .ReturnsAsync(userDto);
                
            // Act
            var result = await _controller.Register(userCreateDto);
            
            // Assert
            var createdAtResult = Assert.IsType<CreatedAtActionResult>(result.Result);
            var returnValue = Assert.IsType<UserDTO>(createdAtResult.Value);
            Assert.Equal(userDto.Id, returnValue.Id);
            Assert.Equal(userDto.Email, returnValue.Email);
        }
        
        [Fact]
        public async Task Register_ServiceThrowsArgumentException_ReturnsBadRequest()
        {
            // Arrange
            var userCreateDto = new UserCreateDTO 
            { 
                Email = "test@example.com", 
                Password = "Test123!" 
            };
            
            string errorMessage = "Email already exists";
            _mockAuthService.Setup(x => x.RegisterUserAsync(userCreateDto))
                .ThrowsAsync(new ArgumentException(errorMessage));
                
            // Act
            var result = await _controller.Register(userCreateDto);
            
            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
            Assert.Equal(errorMessage, badRequestResult.Value);
        }
        
        [Fact]
        public async Task Login_ValidCredentials_ReturnsOkWithTokens()
        {
            // Arrange
            var loginDto = new UserLoginDTO 
            { 
                Email = "test@example.com", 
                Password = "Test123!" 
            };
            
            var tokensResponse = new TokensResponseDTO 
            { 
                AccessToken = "test-access-token",
                RefreshToken = "test-refresh-token",
                Expiration = DateTime.UtcNow.AddHours(1),
                User = new UserDTO
                {
                    Id = 1,
                    Username = "testuser",
                    Email = "test@example.com"
                }
            };
            
            _mockAuthService.Setup(x => x.LoginAsync(loginDto, It.IsAny<string>()))
                .ReturnsAsync(tokensResponse);
                
            // Setup HttpContext.Connection.RemoteIpAddress
            var httpContext = new DefaultHttpContext();
            _controller.ControllerContext = new ControllerContext()
            {
                HttpContext = httpContext
            };
                
            // Act
            var result = await _controller.Login(loginDto);
            
            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnValue = Assert.IsType<TokensResponseDTO>(okResult.Value);
            Assert.Equal(tokensResponse.AccessToken, returnValue.AccessToken);
            Assert.Equal(tokensResponse.RefreshToken, returnValue.RefreshToken);
        }
        
        [Fact]
        public async Task Login_InvalidCredentials_ReturnsUnauthorized()
        {
            // Arrange
            var loginDto = new UserLoginDTO 
            { 
                Email = "test@example.com", 
                Password = "WrongPassword" 
            };
            
            string errorMessage = "Invalid email or password";
            _mockAuthService.Setup(x => x.LoginAsync(loginDto, It.IsAny<string>()))
                .ThrowsAsync(new UnauthorizedAccessException(errorMessage));
                
            // Setup HttpContext
            var httpContext = new DefaultHttpContext();
            _controller.ControllerContext = new ControllerContext()
            {
                HttpContext = httpContext
            };
                
            // Act
            var result = await _controller.Login(loginDto);
            
            // Assert
            var unauthorizedResult = Assert.IsType<UnauthorizedObjectResult>(result.Result);
            Assert.Equal(errorMessage, unauthorizedResult.Value);
        }
        
        [Fact]
        public async Task GetProfile_AuthenticatedUser_ReturnsOkWithProfile()
        {
            // Arrange
            int userId = 1;
            var userDto = new UserDTO 
            { 
                Id = userId, 
                Username = "testuser",
                Email = "test@example.com" 
            };
            
            _mockAuthService.Setup(x => x.GetUserProfileAsync(userId))
                .ReturnsAsync(userDto);
                
            // Setup authenticated user claims
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString())
            };
            var identity = new ClaimsIdentity(claims);
            var claimsPrincipal = new ClaimsPrincipal(identity);
            
            var httpContext = new DefaultHttpContext
            {
                User = claimsPrincipal
            };
            
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = httpContext
            };
                
            // Act
            var result = await _controller.GetProfile();
            
            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnValue = Assert.IsType<UserDTO>(okResult.Value);
            Assert.Equal(userDto.Id, returnValue.Id);
            Assert.Equal(userDto.Email, returnValue.Email);
        }
        
        [Fact]
        public async Task GetProfile_UserNotFound_ReturnsNotFound()
        {
            // Arrange
            int userId = 999;
            string errorMessage = "User not found";
            
            _mockAuthService.Setup(x => x.GetUserProfileAsync(userId))
                .ThrowsAsync(new KeyNotFoundException(errorMessage));
                
            // Setup authenticated user claims
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString())
            };
            var identity = new ClaimsIdentity(claims);
            var claimsPrincipal = new ClaimsPrincipal(identity);
            
            var httpContext = new DefaultHttpContext
            {
                User = claimsPrincipal
            };
            
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = httpContext
            };
                
            // Act
            var result = await _controller.GetProfile();
            
            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result.Result);
            Assert.Equal(errorMessage, notFoundResult.Value);
        }
    }
} 