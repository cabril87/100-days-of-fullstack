// Controllers/AuthController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.Services.Interfaces;

namespace TaskTrackerAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
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
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error registering user");
            return StatusCode(500, "An error occurred while registering. Please try again later.");
        }
    }

    [HttpPost("login")]
    public async Task<ActionResult<TokensResponseDTO>> Login(UserLoginDTO userLoginDto)
    {
        try
        {
            string ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            TokensResponseDTO response = await _authService.LoginAsync(userLoginDto, ipAddress);
            _logger.LogInformation("User logged in successfully: {Email}", userLoginDto.Email);
            return Ok(response);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during login");
            return StatusCode(500, "An error occurred during login. Please try again later.");
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
            return Unauthorized(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error refreshing token");
            return StatusCode(500, "An error occurred while refreshing the token.");
        }
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
    public async Task<IActionResult> ChangePassword(ChangePasswordDTO changePasswordDto)
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
}