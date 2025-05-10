using Microsoft.AspNetCore.Mvc;
using TaskTrackerAPI.Helpers;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Hosting;
using System.Text.Json;
using TaskTrackerAPI.Services;
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.Data;
using Microsoft.EntityFrameworkCore;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Controllers.V1;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
public class DebugController : ControllerBase
{
    private readonly IConfiguration _configuration;
    private readonly IHostEnvironment _environment;
    private readonly PasswordDebugHelper _passwordHelper;
    private readonly ILogger<DebugController> _logger;
    private readonly ApplicationDbContext _dbContext;

    public DebugController(
        IConfiguration configuration,
        IHostEnvironment environment,
        ILogger<DebugController> logger,
        ApplicationDbContext dbContext)
    {
        _configuration = configuration;
        _environment = environment;
        _passwordHelper = new PasswordDebugHelper(configuration);
        _logger = logger;
        _dbContext = dbContext;
    }

    [HttpGet("csrf-test")]
    public IActionResult TestCsrf()
    {
        if (!_environment.IsDevelopment())
        {
            return NotFound();
        }

        // Check if CSRF token is in the header
        bool hasCSRFHeader = HttpContext.Request.Headers.TryGetValue("X-CSRF-TOKEN", out var csrfHeader);
        string csrfHeaderValue = hasCSRFHeader ? csrfHeader.ToString() : "Not present";
        
        // Get the CSRF token from the cookie
        bool hasCSRFCookie = HttpContext.Request.Cookies.TryGetValue("XSRF-TOKEN", out var csrfCookie);
        string csrfCookieValue = hasCSRFCookie ? csrfCookie : "Not present";

        var result = new
        {
            Message = "CSRF Debug Info",
            HasCSRFHeader = hasCSRFHeader,
            CSRFHeaderValue = csrfHeaderValue,
            HasCSRFCookie = hasCSRFCookie,
            CSRFCookieValue = csrfCookieValue,
            CSRFCookieDecoded = hasCSRFCookie ? System.Net.WebUtility.UrlDecode(csrfCookie) : "N/A",
            TokensMatch = hasCSRFHeader && hasCSRFCookie ? 
                System.Net.WebUtility.UrlDecode(csrfHeaderValue) == System.Net.WebUtility.UrlDecode(csrfCookieValue) : 
                false,
            AllRequestHeaders = HttpContext.Request.Headers.ToDictionary(h => h.Key, h => h.Value.ToString())
        };

        return Ok(result);
    }

    [HttpPost("test-login")]
    public IActionResult TestLogin([FromBody] LoginModel model)
    {
        if (!_environment.IsDevelopment())
        {
            return NotFound();
        }

        string debugKey = _configuration["AppSettings:DebugKey"];
        if (string.IsNullOrEmpty(debugKey) || debugKey != "DEVELOPMENT_DEBUG_ONLY_7865421")
        {
            return Unauthorized("Debug key is missing or invalid");
        }

        try
        {
            // This is for debugging purposes only - it doesn't actually authenticate
            // It just shows what credentials were received and checks if they match expected values
            bool credentialsMatch = 
                model.EmailOrUsername == "admin@tasktracker.com" && 
                model.Password == "password";
            
            var response = new
            {
                Success = credentialsMatch,
                ReceivedCredentials = new
                {
                    EmailOrUsername = model.EmailOrUsername,
                    Password = "[REDACTED]"
                },
                Message = credentialsMatch ? 
                    "Credentials match expected admin credentials" : 
                    "Credentials do not match expected admin credentials"
            };
            
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in test login");
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [HttpGet("generate-password")]
    public IActionResult GeneratePassword(string password = "password")
    {
        if (!_environment.IsDevelopment())
        {
            return NotFound();
        }

        string debugKey = _configuration["AppSettings:DebugKey"];
        if (string.IsNullOrEmpty(debugKey) || debugKey != "DEVELOPMENT_DEBUG_ONLY_7865421")
        {
            return Unauthorized("Debug key is missing or invalid");
        }

        var (hash, salt) = _passwordHelper.GeneratePasswordHashForSeed(password);
        
        var result = new
        {
            Password = password,
            Hash = hash,
            Salt = salt
        };

        return Ok(result);
    }

    [HttpGet("hash-for-seed")]
    public IActionResult GetHashForSeed()
    {
        // Only allow in development environment
        if (!_environment.IsDevelopment())
        {
            return NotFound();
        }

        // Check for debug key to prevent unauthorized access
        string? debugKey = Request.Headers["X-Debug-Key"];
        string configDebugKey = _configuration["AppSettings:DebugKey"] ?? "NO_KEY_SET";
        
        if (string.IsNullOrEmpty(debugKey) || debugKey != configDebugKey)
        {
            return Unauthorized();
        }

        var (hash, salt) = _passwordHelper.GeneratePasswordHashForSeed("password");

        // This is only for development use to generate seed values
        return Ok(new 
        { 
            Note = "FOR DEVELOPMENT USE ONLY. DO NOT EXPOSE THESE VALUES IN PRODUCTION.",
            Salt = salt,
            Hash = hash,
            SeedCode = $@"
// Copy this code into your ApplicationDbContext.cs OnModelCreating method
modelBuilder.Entity<User>().HasData(
    new User
    {{
        Id = 1,
        Username = ""admin"",
        Email = ""admin@tasktracker.com"",
        PasswordHash = ""{hash}"",
        Salt = ""{salt}"",
        FirstName = ""Admin"", 
        LastName = ""User"",
        Role = ""Admin"",
        CreatedAt = new DateTime(2025, 4, 1)
    }}
);"
        });
    }

    [HttpGet("check-users")]
    public IActionResult CheckDatabaseUsers()
    {
        if (!_environment.IsDevelopment())
        {
            return NotFound();
        }

        try 
        {
            // Get count of all users
            int userCount = _dbContext.Users.Count();
            
            // Check for specific admin user
            bool adminExists = _dbContext.Users.Any(u => u.Email == "admin@tasktracker.com");
            
            // Get all users (limited information)
            var users = _dbContext.Users
                .Select(u => new 
                { 
                    u.Id, 
                    u.Username, 
                    u.Email, 
                    u.Role, 
                    u.IsActive,
                    HasPasswordHash = !string.IsNullOrEmpty(u.PasswordHash),
                    HasSalt = !string.IsNullOrEmpty(u.Salt)
                })
                .ToList();
                
            return Ok(new 
            { 
                TotalUsers = userCount,
                AdminExists = adminExists,
                Users = users
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking database users");
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [HttpPost("cleanup-users")]
    [IgnoreAntiforgeryToken]
    public IActionResult CleanupDuplicateUsers()
    {
        if (!_environment.IsDevelopment())
        {
            return NotFound();
        }

        try 
        {
            // Find users with the same email
            var userGroups = _dbContext.Users
                .AsEnumerable()
                .GroupBy(u => u.Email.ToLower())
                .Where(g => g.Count() > 1)
                .ToList();
                
            var cleanupResults = new List<object>();
            
            // For each group of duplicate users
            foreach (var group in userGroups)
            {
                // Keep the user with the lowest ID (oldest) and delete the rest
                var sortedUsers = group.OrderBy(u => u.Id).ToList();
                var keepUser = sortedUsers[0];
                var deleteUsers = sortedUsers.Skip(1).ToList();
                
                // Delete the duplicate users (direct database delete, not just marking inactive)
                _dbContext.Users.RemoveRange(deleteUsers);
                
                cleanupResults.Add(new {
                    Email = group.Key,
                    KeptUserId = keepUser.Id,
                    DeletedUserIds = deleteUsers.Select(u => u.Id).ToList()
                });
            }
            
            // Save changes
            _dbContext.SaveChanges();
            
            return Ok(new {
                Message = "Duplicate users cleanup completed",
                DuplicateGroups = userGroups.Count(),
                CleanupResults = cleanupResults
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error cleaning up duplicate users");
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [HttpPost("test-password")]
    [IgnoreAntiforgeryToken]
    public async Task<IActionResult> TestPasswordVerification([FromBody] LoginModel model)
    {
        if (!_environment.IsDevelopment())
        {
            return await Task.FromResult(NotFound());
        }

        try 
        {
            // Get all users first for diagnostic purposes
            var allUsers = _dbContext.Users.ToList();
            
            // Debug information before finding the user
            var debugInfo = new
            {
                TotalUsers = allUsers.Count,
                InputEmail = model.EmailOrUsername,
                InputEmailLower = model.EmailOrUsername.ToLower(),
                AllEmails = allUsers.Select(u => new { 
                    Id = u.Id,
                    Email = u.Email, 
                    EmailLower = u.Email.ToLower(),
                    Username = u.Username,
                    UsernameLower = u.Username.ToLower(),
                    Match = u.Email.ToLower() == model.EmailOrUsername.ToLower() || u.Username.ToLower() == model.EmailOrUsername.ToLower()
                }).ToList()
            };
            
            // Log detail of all users to help debug
            _logger.LogInformation("Found {Count} total users, with {MatchCount} matching emails/usernames", 
                allUsers.Count, 
                debugInfo.AllEmails.Count(e => e.Match));
            
            // Find the user directly from the database
            var matchingUsers = _dbContext.Users
                .Where(u => 
                    u.Email.ToLower() == model.EmailOrUsername.ToLower() || 
                    u.Username.ToLower() == model.EmailOrUsername.ToLower())
                .OrderBy(u => u.Id)
                .ToList();
                
            if (!matchingUsers.Any())
            {
                return Ok(new { 
                    Success = false,
                    Message = "User not found",
                    EmailOrUsername = model.EmailOrUsername,
                    Debug = debugInfo
                });
            }
            
            // Use the first matching user (the one with the lowest ID)
            var user = matchingUsers.First();
            _logger.LogInformation("Using user with ID {UserId} for password verification", user.Id);
            
            // Get the auth helper to test password verification
            var authHelper = new Helpers.AuthHelper(
                _configuration
            );
            
            // Try to verify the password
            bool passwordVerified = false;
            string errorMessage = null;
            
            try {
                passwordVerified = authHelper.VerifyPasswordHash(model.Password, user.PasswordHash, user.Salt);
                _logger.LogInformation("Password verification result: {Result}", passwordVerified);
            }
            catch (Exception ex) {
                errorMessage = ex.Message;
                _logger.LogError(ex, "Error verifying password for user {UserId}", user.Id);
            }
            
            return Ok(new {
                Success = passwordVerified,
                User = new {
                    Id = user.Id,
                    Email = user.Email,
                    Username = user.Username,
                    HasPasswordHash = !string.IsNullOrEmpty(user.PasswordHash),
                    PasswordHashStart = user.PasswordHash?.Substring(0, Math.Min(10, user.PasswordHash?.Length ?? 0)),
                    HasSalt = !string.IsNullOrEmpty(user.Salt),
                    SaltStart = user.Salt?.Substring(0, Math.Min(10, user.Salt?.Length ?? 0))
                },
                PasswordVerified = passwordVerified,
                ErrorMessage = errorMessage,
                Debug = new {
                    TotalUsers = allUsers.Count,
                    MatchingUsers = matchingUsers.Count,
                    SelectedUserId = user.Id
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error testing password verification");
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [HttpGet("fix-admin")]
    [IgnoreAntiforgeryToken]
    public IActionResult FixAdminUser()
    {
        if (!_environment.IsDevelopment())
        {
            return NotFound();
        }

        try 
        {
            // First, remove any tasks that reference users
            var tasks = _dbContext.Tasks.ToList();
            _dbContext.Tasks.RemoveRange(tasks);
            _dbContext.SaveChanges();
            
            _logger.LogInformation("Removed {Count} tasks that had User references", tasks.Count);
            
            // Next, remove any categories that reference users
            var categories = _dbContext.Categories.ToList();
            _dbContext.Categories.RemoveRange(categories);
            _dbContext.SaveChanges();
            
            _logger.LogInformation("Removed {Count} categories that had User references", categories.Count);
            
            // Now it's safe to remove users
            _logger.LogInformation("Preparing to clear all users from the database");
            
            var allUsers = _dbContext.Users.ToList();
            _dbContext.Users.RemoveRange(allUsers);
            _dbContext.SaveChanges();
            
            _logger.LogInformation("Removed {Count} existing users", allUsers.Count);
            
            // Create a fresh admin user with known credentials
            var passwordDebugHelper = new PasswordDebugHelper(_configuration);
            var (passwordHash, salt) = passwordDebugHelper.GeneratePasswordHashForSeed("password");
            
            // Create admin user
            User admin = new User
            {
                Username = "admin",
                Email = "admin@tasktracker.com",
                FirstName = "Admin",
                LastName = "User",
                PasswordHash = passwordHash,
                Salt = salt,
                Role = "Admin",
                IsActive = true,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now,
                AgeGroup = Models.FamilyMemberAgeGroup.Adult
            };
            
            _dbContext.Users.Add(admin);
            _dbContext.SaveChanges();
            
            _logger.LogInformation("Created fresh admin user with ID {Id}", admin.Id);
            
            return Ok(new {
                Message = $"Completely reset the database. Removed {tasks.Count} tasks, {categories.Count} categories and {allUsers.Count} users, then created a fresh admin user",
                RemovedTaskCount = tasks.Count,
                RemovedCategoryCount = categories.Count,
                RemovedUserCount = allUsers.Count,
                NewAdmin = new { admin.Id, admin.Email, admin.Username },
                Note = "You can now log in with admin@tasktracker.com and password 'password'"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fixing admin user");
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [HttpPost("test-auth-service")]
    [IgnoreAntiforgeryToken]
    public async Task<IActionResult> TestAuthService([FromBody] LoginModel model)
    {
        if (!_environment.IsDevelopment())
        {
            return NotFound();
        }

        try 
        {
            // Get the IAuthService from dependency injection
            var authService = HttpContext.RequestServices.GetRequiredService<TaskTrackerAPI.Services.Interfaces.IAuthService>();
            
            // Create the login DTO
            var loginDto = new TaskTrackerAPI.DTOs.Auth.UserLoginDTO
            {
                EmailOrUsername = model.EmailOrUsername,
                Password = model.Password
            };
            
            // Log details for debugging
            _logger.LogInformation("Testing auth service login with {Email}", model.EmailOrUsername);
            
            try
            {
                // Attempt to authenticate
                var result = await authService.LoginAsync(loginDto, "127.0.0.1");
                
                // If successful, return details
                return Ok(new {
                    Success = true,
                    AccessToken = result.AccessToken,
                    User = new {
                        Id = result.User.Id,
                        Username = result.User.Username,
                        Email = result.User.Email,
                        Role = result.User.Role
                    }
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Ok(new {
                    Success = false,
                    Message = ex.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in auth service test");
                return Ok(new {
                    Success = false,
                    Message = ex.Message,
                    StackTrace = ex.StackTrace
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error testing auth service");
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [HttpGet("user-detail")]
    [IgnoreAntiforgeryToken]
    public IActionResult GetUserDetail([FromQuery] string email = "admin@tasktracker.com")
    {
        if (!_environment.IsDevelopment())
        {
            return NotFound();
        }

        try 
        {
            // Log the search before trying to find the user
            _logger.LogInformation("Searching for user with email: {Email}", email);
            
            // Get all users for debugging
            var allUsers = _dbContext.Users.ToList();
            _logger.LogInformation("Total users in database: {Count}", allUsers.Count);
            
            foreach (var u in allUsers)
            {
                _logger.LogInformation("User in database: ID={Id}, Email={Email}, Username={Username}", 
                    u.Id, u.Email, u.Username);
            }
            
            // Different case variations to try
            var exactMatch = allUsers.FirstOrDefault(u => u.Email == email);
            var lowerCaseMatch = allUsers.FirstOrDefault(u => u.Email.ToLower() == email.ToLower());
            var ignoreCase = allUsers.FirstOrDefault(u => 
                string.Equals(u.Email, email, StringComparison.OrdinalIgnoreCase));
            
            // Try to find user by username instead of email as a fallback
            var usernameMatch = allUsers.FirstOrDefault(u => 
                string.Equals(u.Username, "admin", StringComparison.OrdinalIgnoreCase));
            
            // Choose which user to return
            var user = exactMatch ?? lowerCaseMatch ?? ignoreCase ?? usernameMatch;
            
            if (user == null)
            {
                return Ok(new { 
                    Found = false, 
                    Message = "User not found",
                    SearchEmail = email,
                    ExactMatch = exactMatch != null,
                    LowerCaseMatch = lowerCaseMatch != null,
                    IgnoreCaseMatch = ignoreCase != null,
                    UsernameMatch = usernameMatch != null,
                    AllUsers = allUsers.Select(u => new { 
                        u.Id, 
                        u.Email, 
                        EmailLower = u.Email?.ToLower(),
                        SearchEmailLower = email.ToLower(),
                        u.Username
                    }).ToList()
                });
            }
            
            return Ok(new {
                Found = true,
                SearchedFor = email,
                MatchType = exactMatch != null ? "Exact" : 
                           (lowerCaseMatch != null ? "LowerCase" : 
                           (ignoreCase != null ? "IgnoreCase" : "Username")),
                User = new {
                    Id = user.Id,
                    Email = user.Email,
                    EmailLower = user.Email?.ToLower(),
                    Username = user.Username,
                    Role = user.Role,
                    IsActive = user.IsActive,
                    PasswordHash = user.PasswordHash,
                    Salt = user.Salt,
                    CreatedAt = user.CreatedAt,
                    UpdatedAt = user.UpdatedAt
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user detail");
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [HttpPost("verify-password")]
    [IgnoreAntiforgeryToken]
    public IActionResult VerifyUserPassword([FromBody] UserPasswordTestModel model)
    {
        if (!_environment.IsDevelopment())
        {
            return NotFound();
        }

        try 
        {
            // Find user by ID
            var user = _dbContext.Users.Find(model.UserId);
            
            if (user == null)
            {
                return Ok(new { 
                    Success = false, 
                    Message = "User not found" 
                });
            }
            
            // Create an auth helper instance
            var authHelper = new Helpers.AuthHelper(_configuration);
            
            // Try to verify the password
            bool passwordVerified = false;
            string errorMessage = null;
            
            try {
                passwordVerified = authHelper.VerifyPasswordHash(model.Password, user.PasswordHash, user.Salt);
                _logger.LogInformation("Direct password verification result: {Result}", passwordVerified);
            }
            catch (Exception ex) {
                errorMessage = ex.Message;
                _logger.LogError(ex, "Error in direct password verification for user {UserId}", user.Id);
            }
            
            return Ok(new {
                Success = passwordVerified,
                User = new {
                    Id = user.Id,
                    Email = user.Email,
                    Username = user.Username,
                    IsActive = user.IsActive,
                    Role = user.Role
                },
                PasswordVerified = passwordVerified,
                ErrorMessage = errorMessage,
                UserPasswordHash = user.PasswordHash,
                UserSalt = user.Salt,
                InputPassword = model.Password
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error verifying user password");
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [HttpPost("test-repo")]
    [IgnoreAntiforgeryToken]
    public async Task<IActionResult> TestRepositoryQuery([FromBody] LoginModel model)
    {
        if (!_environment.IsDevelopment())
        {
            return NotFound();
        }

        try 
        {
            // We'll bypass the service layer and work directly with the repository
            var userRepository = HttpContext.RequestServices.GetRequiredService<TaskTrackerAPI.Repositories.Interfaces.IUserRepository>();
            
            // Log what we're looking for
            _logger.LogInformation("Testing repository query for {Email}", model.EmailOrUsername);
            
            // Try both methods to find the user
            var userByEmail = await userRepository.GetUserByEmailAsync(model.EmailOrUsername);
            var userByUsername = await userRepository.GetUserByUsernameAsync(model.EmailOrUsername);
            
            // Also try the exact match to check if we're having issues with case sensitivity
            var exactMatch = _dbContext.Users.FirstOrDefault(u => u.Email == model.EmailOrUsername);
            
            // Query all users for debugging
            var allUsers = _dbContext.Users.ToList();
            
            return Ok(new {
                EmailInput = model.EmailOrUsername,
                EmailInputLower = model.EmailOrUsername.ToLower(),
                UserFoundByEmail = userByEmail != null,
                UserFoundByUsername = userByUsername != null,
                UserFoundByExactMatch = exactMatch != null,
                TotalUsers = allUsers.Count,
                UserDetails = userByEmail != null ? new {
                    userByEmail.Id,
                    userByEmail.Email,
                    EmailLower = userByEmail.Email.ToLower(),
                    userByEmail.Username
                } : null,
                AllUsers = allUsers.Select(u => new {
                    u.Id,
                    u.Email,
                    EmailLower = u.Email.ToLower(),
                    u.Username,
                    IsMatch = u.Email.ToLower() == model.EmailOrUsername.ToLower()
                }).ToList()
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error testing repository query");
            return StatusCode(500, new { message = ex.Message });
        }
    }
}

// Simple login model for debugging
public class LoginModel
{
    public string EmailOrUsername { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class UserPasswordTestModel
{
    public int UserId { get; set; }
    public string Password { get; set; } = string.Empty;
} 