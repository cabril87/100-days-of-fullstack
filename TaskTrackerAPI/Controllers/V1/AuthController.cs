/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 *
 * This file may not be used, copied, modified, or distributed except in
 * accordance with the terms contained in the LICENSE file.
 */
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using TaskTrackerAPI.DTOs.Auth;
using TaskTrackerAPI.Services.Interfaces;

namespace TaskTrackerAPI.Controllers.V1;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IAuthService authService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    [HttpPost("register")]
    public async Task<ActionResult<UserDTO>> Register(UserCreateDTO userCreateDto)
    {
        try
        {
            UserDTO user = await _authService.RegisterUserAsync(userCreateDto);
            _logger.LogInformation("User registered successfully: {Username}", user.Username);
            return CreatedAtAction(nameof(Register), user);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error registering user");
            return StatusCode(500, new { message = "An error occurred while registering. Please try again later." });
        }
    }

    [HttpPost("login")]
    public async Task<ActionResult<TokensResponseDTO>> Login(UserLoginDTO userLoginDto)
    {
        try
        {
            _logger.LogInformation("Login request received: {@UserLoginDto}", new { Email = userLoginDto.EmailOrUsername });
            
            string ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            TokensResponseDTO response = await _authService.LoginAsync(userLoginDto, ipAddress);
            _logger.LogInformation("User logged in successfully: {Email}", userLoginDto.EmailOrUsername);
            return Ok(response);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning("Unauthorized access: {Message}", ex.Message);
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during login for {Email}: {ErrorMessage}", 
                userLoginDto.EmailOrUsername, ex.Message);
            return StatusCode(500, new { message = "An error occurred during login. Please try again later." });
        }
    }

    [HttpPost("refresh-token")]
    public async Task<ActionResult<TokensResponseDTO>> RefreshToken(RefreshTokenRequestDTO refreshRequest)
    {
        try
        {
            string ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            TokensResponseDTO response = await _authService.RefreshTokenAsync(refreshRequest.RefreshToken, ipAddress);
            return Ok(response);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error refreshing token");
            return StatusCode(500, new { message = "An error occurred while refreshing the token." });
        }
    }

    /// <summary>
    /// Provides a CSRF token for SignalR connections
    /// </summary>
    /// <returns>Success response with token in cookie</returns>
    [HttpGet("csrf")]
    [AllowAnonymous]
    public ActionResult GetCsrfToken()
    {
        // CSRF token is automatically set in a cookie by the middleware for GET requests
        return Ok(new { message = "CSRF token has been set" });
    }

    /// <summary>
    /// Provides a CSRF token for unauthenticated requests (specifically for login/register)
    /// </summary>
    /// <returns>Success response with token in cookie</returns>
    [HttpGet("public-csrf")]
    [AllowAnonymous]
    public ActionResult GetPublicCsrfToken()
    {
        // CSRF token is automatically set in a cookie by the middleware for GET requests
        return Ok(new { message = "Public CSRF token has been set" });
    }

    [Authorize]
    [HttpGet("profile")]
    public async Task<ActionResult<UserDTO>> GetProfile()
    {
        try
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            UserDTO profile = await _authService.GetUserProfileAsync(userId);
            return Ok(profile);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user profile");
            return StatusCode(500, "An error occurred while retrieving your profile.");
        }
    }

    [Authorize]
    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile(UserProfileUpdateDTO profileUpdateDto)
    {
        try
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            await _authService.UpdateUserProfileAsync(userId, profileUpdateDto);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user profile");
            return StatusCode(500, "An error occurred while updating your profile.");
        }
    }

    [Authorize]
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword(PasswordChangeDTO changePasswordDto)
    {
        try
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            string ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            await _authService.ChangePasswordAsync(userId, changePasswordDto, ipAddress);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error changing password");
            return StatusCode(500, "An error occurred while changing your password.");
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("users")]
    public async Task<ActionResult<IEnumerable<UserDTO>>> GetAllUsers()
    {
        try
        {
            IEnumerable<UserDTO> users = await _authService.GetAllUsersAsync();
            return Ok(users);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving all users");
            return StatusCode(500, "An error occurred while retrieving users.");
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("users/{id}/role")]
    public async Task<IActionResult> UpdateUserRole(int id, [FromBody] string role)
    {
        try
        {
            int adminId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            await _authService.UpdateUserRoleAsync(id, role, adminId);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user role");
            return StatusCode(500, "An error occurred while updating the user role.");
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("users/{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        try
        {
            int currentUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            await _authService.DeleteUserAsync(id, currentUserId);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting user");
            return StatusCode(500, "An error occurred while deleting the user.");
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("users/change-password")]
    public async Task<IActionResult> AdminChangePassword(AdminPasswordChangeDTO changePasswordDto)
    {
        try
        {
            int adminId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            string ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            await _authService.AdminChangePasswordAsync(changePasswordDto, adminId, ipAddress);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during admin password change for user {UserId}", changePasswordDto.UserId);
            return StatusCode(500, "An error occurred while changing the user's password.");
        }
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout([FromBody] LogoutRequestDTO logoutRequest)
    {
        try
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            
            // Get IP address for logging purposes
            string ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            
            await _authService.LogoutAsync(userId, logoutRequest.RefreshToken, ipAddress);
            
            // Clear cookies
            Response.Headers.Append("Clear-Site-Data", "\"cache\", \"cookies\", \"storage\"");
            
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound("User not found");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during logout");
            return StatusCode(500, "An error occurred during logout");
        }
    }
} 