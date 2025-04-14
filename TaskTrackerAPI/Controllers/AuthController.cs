// Controllers/AuthController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TaskTrackerAPI.Data;
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.Helpers;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly AuthHelper _authHelper;
    private readonly ILogger<AuthController> _logger;

    public AuthController(ApplicationDbContext context, IConfiguration configuration, ILogger<AuthController> logger)
    {
        _context = context;
        _authHelper = new AuthHelper(configuration);
        _logger = logger;
    }

    [HttpPost("register")]
    public async Task<ActionResult<UserDTO>> Register(UserCreateDTO userCreateDto)
    {
        try
        {
            if (userCreateDto.Password != userCreateDto.ConfirmPassword)
            {
                return BadRequest("Passwords do not match");
            }

            // Check if email is already registered
            if (await _context.Users.AnyAsync(u => u.Email.ToLower() == userCreateDto.Email.ToLower()))
            {
                return BadRequest("Email is already registered");
            }

            // Check if username is already taken
            if (await _context.Users.AnyAsync(u => u.Username.ToLower() == userCreateDto.Username.ToLower()))
            {
                return BadRequest("Username is already taken");
            }

            // Create password hash and salt
            _authHelper.CreatePasswordHash(userCreateDto.Password, out string passwordHash, out string salt);

            // Create new user
            var user = new User
            {
                Username = userCreateDto.Username,
                Email = userCreateDto.Email,
                PasswordHash = passwordHash,
                Salt = salt,
                FirstName = userCreateDto.FirstName,
                LastName = userCreateDto.LastName,
                Role = "User",
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Create response DTO
            var userDto = new UserDTO
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Role = user.Role,
                CreatedAt = user.CreatedAt
            };

            _logger.LogInformation("User registered successfully: {Username}", user.Username);
            return CreatedAtAction(nameof(Register), userDto);
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
            // Find user by email
            var user = await _context.Users.FirstOrDefaultAsync(u => 
                u.Email.ToLower() == userLoginDto.Email.ToLower());

            if (user == null)
            {
                // Use a generic error message to prevent user enumeration
                return Unauthorized("Invalid email or password");
            }

            // Verify password
            if (!_authHelper.VerifyPasswordHash(userLoginDto.Password, user.PasswordHash, user.Salt))
            {
                _logger.LogWarning("Failed login attempt for user: {Email}", userLoginDto.Email);
                return Unauthorized("Invalid email or password");
            }

            // Generate JWT token
            string accessToken = _authHelper.CreateToken(user);
            
            // Generate refresh token
            string refreshToken = _authHelper.GenerateRefreshToken();
            DateTime refreshTokenExpiry = _authHelper.GetRefreshTokenExpiryTime();
            
            // Store refresh token in database
            var refreshTokenEntity = new RefreshToken
            {
                Token = refreshToken,
                ExpiryDate = refreshTokenExpiry,
                UserId = user.Id,
                CreatedDate = DateTime.UtcNow,
                RevokedByIp = null
            };
            
            _context.Add(refreshTokenEntity);
            
            // Update last login time
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            // Create response
            var response = new TokensResponseDTO
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                Expiration = refreshTokenExpiry,
                User = new UserDTO
                {
                    Id = user.Id,
                    Username = user.Username,
                    Email = user.Email,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Role = user.Role,
                    CreatedAt = user.CreatedAt
                }
            };

            _logger.LogInformation("User logged in successfully: {Username}", user.Username);
            return Ok(response);
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
            // Find the refresh token in the database
            var refreshToken = await _context.Set<RefreshToken>()
                .Include(r => r.User)
                .FirstOrDefaultAsync(r => r.Token == refreshRequest.RefreshToken);
                
            if (refreshToken == null)
            {
                return Unauthorized("Invalid refresh token");
            }
            
            // Check if the refresh token is active
            if (!refreshToken.IsActive)
            {
                return Unauthorized("Refresh token is expired or revoked");
            }
            
            // Revoke the current refresh token
            refreshToken.RevokedByIp = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            
            // Create a new refresh token
            string newRefreshToken = _authHelper.GenerateRefreshToken();
            DateTime newRefreshTokenExpiry = _authHelper.GetRefreshTokenExpiryTime();
            
            // Store the new refresh token
            var newRefreshTokenEntity = new RefreshToken
            {
                Token = newRefreshToken,
                ExpiryDate = newRefreshTokenExpiry,
                UserId = refreshToken.UserId,
                CreatedDate = DateTime.UtcNow,
                RevokedByIp = null
            };
            
            _context.Add(newRefreshTokenEntity);
            
            // Generate a new access token
            string newAccessToken = _authHelper.CreateToken(refreshToken.User!);
            
            await _context.SaveChangesAsync();
            
            // Return the new tokens
            var response = new TokensResponseDTO
            {
                AccessToken = newAccessToken,
                RefreshToken = newRefreshToken,
                Expiration = newRefreshTokenExpiry,
                User = new UserDTO
                {
                    Id = refreshToken.User!.Id,
                    Username = refreshToken.User.Username,
                    Email = refreshToken.User.Email,
                    FirstName = refreshToken.User.FirstName,
                    LastName = refreshToken.User.LastName,
                    Role = refreshToken.User.Role,
                    CreatedAt = refreshToken.User.CreatedAt
                }
            };
            
            return Ok(response);
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
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            
            var user = await _context.Users.FindAsync(userId);
            
            if (user == null)
            {
                return NotFound("User not found");
            }
            
            // Return user data without sensitive information
            var userDto = new UserDTO
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Role = user.Role,
                CreatedAt = user.CreatedAt
            };
            
            return Ok(userDto);
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
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            
            var user = await _context.Users.FindAsync(userId);
            
            if (user == null)
            {
                return NotFound("User not found");
            }
            
            // Check if username is taken (if it's being changed)
            if (profileUpdateDto.Username != null && 
                profileUpdateDto.Username != user.Username &&
                await _context.Users.AnyAsync(u => 
                    u.Username.ToLower() == profileUpdateDto.Username.ToLower()))
            {
                return BadRequest("Username is already taken");
            }
            
            // Check if email is taken (if it's being changed)
            if (profileUpdateDto.Email != null && 
                profileUpdateDto.Email != user.Email &&
                await _context.Users.AnyAsync(u => 
                    u.Email.ToLower() == profileUpdateDto.Email.ToLower()))
            {
                return BadRequest("Email is already registered");
            }
            
            // Update fields if provided
            if (!string.IsNullOrWhiteSpace(profileUpdateDto.Username))
                user.Username = profileUpdateDto.Username;
                
            if (!string.IsNullOrWhiteSpace(profileUpdateDto.Email))
                user.Email = profileUpdateDto.Email;
                
            if (profileUpdateDto.FirstName != null)
                user.FirstName = profileUpdateDto.FirstName;
                
            if (profileUpdateDto.LastName != null)
                user.LastName = profileUpdateDto.LastName;
                
            user.UpdatedAt = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();
            
            return NoContent();
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
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            
            var user = await _context.Users.FindAsync(userId);
            
            if (user == null)
            {
                return NotFound("User not found");
            }
            
            // Verify current password
            if (!_authHelper.VerifyPasswordHash(
                changePasswordDto.CurrentPassword, user.PasswordHash, user.Salt))
            {
                return BadRequest("Current password is incorrect");
            }
            
            // Confirm passwords match
            if (changePasswordDto.NewPassword != changePasswordDto.ConfirmNewPassword)
            {
                return BadRequest("New passwords do not match");
            }
            
            // Hash new password
            _authHelper.CreatePasswordHash(
                changePasswordDto.NewPassword, out string newPasswordHash, out string newSalt);
                
            // Update password and salt
            user.PasswordHash = newPasswordHash;
            user.Salt = newSalt;
            user.UpdatedAt = DateTime.UtcNow;
            
            // Revoke all refresh tokens for this user for security
            var activeRefreshTokens = await _context.Set<RefreshToken>()
                .Where(r => r.UserId == userId && r.IsActive)
                .ToListAsync();
                
            foreach (var token in activeRefreshTokens)
            {
                token.RevokedByIp = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            }
            
            await _context.SaveChangesAsync();
            
            return NoContent();
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
            var users = await _context.Users.ToListAsync();
            
            var userDtos = users.Select(u => new UserDTO
            {
                Id = u.Id,
                Username = u.Username,
                Email = u.Email,
                FirstName = u.FirstName,
                LastName = u.LastName,
                Role = u.Role,
                CreatedAt = u.CreatedAt
            }).ToList();
            
            return Ok(userDtos);
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
            // Validate role
            if (role != "User" && role != "Admin")
            {
                return BadRequest("Invalid role. Must be 'User' or 'Admin'.");
            }
            
            var user = await _context.Users.FindAsync(id);
            
            if (user == null)
            {
                return NotFound("User not found");
            }
            
            // Don't allow admin to demote themselves
            var adminId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            if (adminId == id && role != "Admin")
            {
                return BadRequest("You cannot demote yourself from Admin role");
            }
            
            user.Role = role;
            user.UpdatedAt = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();
            
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user role");
            return StatusCode(500, "An error occurred while updating the user role.");
        }
    }
}