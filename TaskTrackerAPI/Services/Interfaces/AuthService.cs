// Services/AuthService.cs
using System.Security.Claims;
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.Helpers;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories.Interfaces;
using TaskTrackerAPI.Services.Interfaces;

namespace TaskTrackerAPI.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly AuthHelper _authHelper;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        IUserRepository userRepository,
        AuthHelper authHelper,
        ILogger<AuthService> logger)
    {
        _userRepository = userRepository;
        _authHelper = authHelper;
        _logger = logger;
    }

    public async Task<UserDTO> RegisterUserAsync(UserCreateDTO userDto)
    {
        // Validate passwords match
        if (userDto.Password != userDto.ConfirmPassword)
        {
            throw new ArgumentException("Passwords do not match");
        }

        // Check if email is already registered
        if (await _userRepository.UserExistsByEmailAsync(userDto.Email))
        {
            throw new ArgumentException("Email is already registered");
        }

        // Check if username is already taken
        if (await _userRepository.UserExistsByUsernameAsync(userDto.Username))
        {
            throw new ArgumentException("Username is already taken");
        }

        // Create password hash and salt
        _authHelper.CreatePasswordHash(userDto.Password, out string passwordHash, out string salt);

        // Create new user
        User user = new User
        {
            Username = userDto.Username,
            Email = userDto.Email,
            PasswordHash = passwordHash,
            Salt = salt,
            FirstName = userDto.FirstName,
            LastName = userDto.LastName,
            Role = "User",
            CreatedAt = DateTime.UtcNow
        };

        await _userRepository.CreateUserAsync(user);

        // Create response DTO
        return new UserDTO
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Role = user.Role,
            CreatedAt = user.CreatedAt
        };
    }

    public async Task<TokensResponseDTO> LoginAsync(UserLoginDTO loginDto, string ipAddress)
    {
        // Find user by email
        User? user = await _userRepository.GetUserByEmailAsync(loginDto.Email);

        if (user == null)
        {
            throw new UnauthorizedAccessException("Invalid email or password");
        }

        // Verify password
        if (!await _userRepository.CheckPasswordAsync(user, loginDto.Password))
        {
            _logger.LogWarning("Failed login attempt for user: {Email}", loginDto.Email);
            throw new UnauthorizedAccessException("Invalid email or password");
        }

        // Generate JWT token
        string accessToken = GenerateAccessToken(user);
        
        // Generate refresh token
        string refreshToken = GenerateRefreshToken();
        DateTime refreshTokenExpiry = _authHelper.GetRefreshTokenExpiryTime();
        
        // Store refresh token in database
        RefreshToken refreshTokenEntity = new RefreshToken
        {
            Token = refreshToken,
            ExpiryDate = refreshTokenExpiry,
            UserId = user.Id,
            CreatedDate = DateTime.UtcNow,
            RevokedByIp = null
        };
        
        await _userRepository.CreateRefreshTokenAsync(refreshTokenEntity);
        
        // Update last login time
        user.UpdatedAt = DateTime.UtcNow;
        await _userRepository.UpdateUserAsync(user);

        // Create response
        TokensResponseDTO response = new TokensResponseDTO
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
        return response;
    }

    public async Task<TokensResponseDTO> RefreshTokenAsync(string refreshToken, string ipAddress)
    {
        // Find the refresh token in the database
        RefreshToken? existingRefreshToken = await _userRepository.GetRefreshTokenAsync(refreshToken);
            
        if (existingRefreshToken == null)
        {
            throw new UnauthorizedAccessException("Invalid refresh token");
        }
        
        // Check if the refresh token is active
        if (!existingRefreshToken.IsActive)
        {
            throw new UnauthorizedAccessException("Refresh token is expired or revoked");
        }
        
        // Get user from token
        User? user = existingRefreshToken.User;
        if (user == null)
        {
            throw new UnauthorizedAccessException("User not found");
        }
        
        // Revoke the current refresh token
        await _userRepository.RevokeRefreshTokenAsync(existingRefreshToken, ipAddress);
        
        // Create a new refresh token
        string newRefreshToken = GenerateRefreshToken();
        DateTime newRefreshTokenExpiry = _authHelper.GetRefreshTokenExpiryTime();
        
        // Store the new refresh token
        RefreshToken newRefreshTokenEntity = new RefreshToken
        {
            Token = newRefreshToken,
            ExpiryDate = newRefreshTokenExpiry,
            UserId = user.Id,
            CreatedDate = DateTime.UtcNow,
            RevokedByIp = null
        };
        
        await _userRepository.CreateRefreshTokenAsync(newRefreshTokenEntity);
        
        // Generate a new access token
        string newAccessToken = GenerateAccessToken(user);
        
        // Return the new tokens
        return new TokensResponseDTO
        {
            AccessToken = newAccessToken,
            RefreshToken = newRefreshToken,
            Expiration = newRefreshTokenExpiry,
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
    }
    
    public async Task<UserDTO> GetUserProfileAsync(int userId)
    {
        User? user = await _userRepository.GetUserByIdAsync(userId);
        
        if (user == null)
        {
            throw new KeyNotFoundException("User not found");
        }
        
        // Return user data without sensitive information
        return new UserDTO
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Role = user.Role,
            CreatedAt = user.CreatedAt
        };
    }
    
    public async Task UpdateUserProfileAsync(int userId, UserProfileUpdateDTO updateDto)
    {
        User? user = await _userRepository.GetUserByIdAsync(userId);
        
        if (user == null)
        {
            throw new KeyNotFoundException("User not found");
        }
        
        // Check if username is taken (if it's being changed)
        if (updateDto.Username != null && 
            updateDto.Username != user.Username &&
            await _userRepository.UserExistsByUsernameAsync(updateDto.Username))
        {
            throw new ArgumentException("Username is already taken");
        }
        
        // Check if email is taken (if it's being changed)
        if (updateDto.Email != null && 
            updateDto.Email != user.Email &&
            await _userRepository.UserExistsByEmailAsync(updateDto.Email))
        {
            throw new ArgumentException("Email is already registered");
        }
        
        // Update fields if provided
        if (!string.IsNullOrWhiteSpace(updateDto.Username))
            user.Username = updateDto.Username;
            
        if (!string.IsNullOrWhiteSpace(updateDto.Email))
            user.Email = updateDto.Email;
            
        if (updateDto.FirstName != null)
            user.FirstName = updateDto.FirstName;
            
        if (updateDto.LastName != null)
            user.LastName = updateDto.LastName;
            
        user.UpdatedAt = DateTime.UtcNow;
        
        await _userRepository.UpdateUserAsync(user);
    }
    
    public async Task ChangePasswordAsync(int userId, ChangePasswordDTO changePasswordDto, string ipAddress)
    {
        User? user = await _userRepository.GetUserByIdAsync(userId);
        
        if (user == null)
        {
            throw new KeyNotFoundException("User not found");
        }
        
        // Verify current password
        if (!await _userRepository.CheckPasswordAsync(user, changePasswordDto.CurrentPassword))
        {
            throw new ArgumentException("Current password is incorrect");
        }
        
        // Confirm passwords match
        if (changePasswordDto.NewPassword != changePasswordDto.ConfirmNewPassword)
        {
            throw new ArgumentException("New passwords do not match");
        }
        
        // Update password
        await _userRepository.ChangePasswordAsync(user, changePasswordDto.NewPassword);
        
        // Revoke all refresh tokens for this user for security
        await _userRepository.RevokeAllUserRefreshTokensAsync(userId, ipAddress);
    }
    
    public async Task<IEnumerable<UserDTO>> GetAllUsersAsync()
    {
        IEnumerable<User> users = await _userRepository.GetAllUsersAsync();
        
        return users.Select(u => new UserDTO
        {
            Id = u.Id,
            Username = u.Username,
            Email = u.Email,
            FirstName = u.FirstName,
            LastName = u.LastName,
            Role = u.Role,
            CreatedAt = u.CreatedAt
        });
    }
    
    public async Task UpdateUserRoleAsync(int userId, string role, int adminId)
    {
        // Validate role
        if (role != "User" && role != "Admin")
        {
            throw new ArgumentException("Invalid role. Must be 'User' or 'Admin'.");
        }
        
        User? user = await _userRepository.GetUserByIdAsync(userId);
        
        if (user == null)
        {
            throw new KeyNotFoundException("User not found");
        }
        
        // Don't allow admin to demote themselves
        if (adminId == userId && role != "Admin")
        {
            throw new InvalidOperationException("You cannot demote yourself from Admin role");
        }
        
        user.Role = role;
        user.UpdatedAt = DateTime.UtcNow;
        
        await _userRepository.UpdateUserAsync(user);
    }
    
    public string GenerateAccessToken(User user)
    {
        return _authHelper.CreateToken(user);
    }
    
    public string GenerateRefreshToken()
    {
        return _authHelper.GenerateRefreshToken();
    }
    
    public ClaimsPrincipal? GetPrincipalFromExpiredToken(string token)
    {
        return _authHelper.GetPrincipalFromExpiredToken(token);
    }
}