// Controllers/AuthController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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
    public async Task<ActionResult<AuthResponseDTO>> Login(UserLoginDTO userLoginDto)
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
            string token = _authHelper.CreateToken(user);

            // Update last login time (optional)
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            // Create response
            var response = new AuthResponseDTO
            {
                Token = token,
                Expiration = DateTime.UtcNow.AddDays(1), // Token expires in 1 day
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
}