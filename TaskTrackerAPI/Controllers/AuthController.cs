// Controllers/AuthController.cs
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

    public AuthController(ApplicationDbContext context, IConfiguration configuration)
    {
        _context = context;
        _authHelper = new AuthHelper(configuration);
    }

    [HttpPost("register")]
    public async Task<ActionResult<UserDTO>> Register(UserCreateDTO userCreateDto)
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

        return CreatedAtAction(nameof(Register), userDto);
    }
}