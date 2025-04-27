// Services/AuthService.cs
using System.Security.Claims;
using System.Security;
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.DTOs.Auth;
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
            CreatedAt = DateTime.UtcNow,
            AgeGroup = userDto.AgeGroup ?? FamilyMemberAgeGroup.Adult
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
            CreatedAt = user.CreatedAt,
            AgeGroup = user.AgeGroup
        };
    }

    public async Task<TokensResponseDTO> LoginAsync(UserLoginDTO loginDto, string ipAddress)
    {
        try
        {
            // Find user by email
            User? user = await _userRepository.GetUserByEmailAsync(loginDto.Email);

            _logger.LogInformation("Login attempt for {Email}, user found: {UserFound}", loginDto.Email, user != null);

            if (user == null || !user.IsActive)
            {
                _logger.LogWarning("Invalid login: user not found or not active for {Email}", loginDto.Email);
                throw new UnauthorizedAccessException("Invalid email or password");
            }

            // Verify password
            bool isPasswordValid = await _userRepository.CheckPasswordAsync(user, loginDto.Password);
            _logger.LogInformation("Password validation result for {Email}: {Result}", loginDto.Email, isPasswordValid);

            if (!isPasswordValid)
            {
                _logger.LogWarning("Failed login attempt for user: {Email} - Invalid password", loginDto.Email);
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
                RevokedByIp = null,
                CreatedByIp = ipAddress,
                TokenFamily = Guid.NewGuid().ToString()
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
                    CreatedAt = user.CreatedAt,
                    AgeGroup = user.AgeGroup
                }
            };

            _logger.LogInformation("User logged in successfully: {Username}", user.Username);
            return response;
        }
        catch (UnauthorizedAccessException)
        {
            // Re-throw unauthorized exceptions which should be handled by the controller
            throw;
        }
        catch (Exception ex)
        {
            // Log the detailed exception for debugging
            _logger.LogError(ex, "Unexpected error during login for {Email}: {ErrorMessage}", loginDto.Email, ex.Message);
            throw;
        }
    }

    public async Task<TokensResponseDTO> RefreshTokenAsync(string refreshToken, string ipAddress)
    {
        // Find the refresh token in the database
        RefreshToken? existingRefreshToken = await _userRepository.GetRefreshTokenAsync(refreshToken);
            
        if (existingRefreshToken == null)
        {
            _logger.LogWarning("Refresh token not found: {Token}", refreshToken);
            throw new UnauthorizedAccessException("Invalid refresh token");
        }
        
        // Check if the refresh token is expired
        if (existingRefreshToken.IsExpired)
        {
            _logger.LogWarning("Expired refresh token used: {Token}", refreshToken);
            throw new UnauthorizedAccessException("Refresh token has expired");
        }

        // Check if the refresh token has been revoked
        if (existingRefreshToken.RevokedByIp != null)
        {
            // This is a potential token reuse attack! Revoke all descendant tokens
            _logger.LogWarning("Potential refresh token reuse detected: {Token}", refreshToken);
            await _userRepository.RevokeRefreshTokenFamilyAsync(existingRefreshToken.UserId, ipAddress);
            throw new SecurityException("Refresh token has been revoked due to security violation");
        }
        
        // Get user from token
        User? user = existingRefreshToken.User;
        if (user == null)
        {
            _logger.LogWarning("User not found for refresh token: {Token}", refreshToken);
            throw new UnauthorizedAccessException("User not found");
        }
        
        // Revoke the current refresh token
        await _userRepository.RevokeRefreshTokenAsync(existingRefreshToken, ipAddress);
        
        // Create a new refresh token in the same family
        string newRefreshToken = GenerateRefreshToken();
        DateTime newRefreshTokenExpiry = _authHelper.GetRefreshTokenExpiryTime();
        
        // Store the new refresh token with reference to the previous token
        RefreshToken newRefreshTokenEntity = new RefreshToken
        {
            Token = newRefreshToken,
            ExpiryDate = newRefreshTokenExpiry,
            UserId = user.Id,
            CreatedDate = DateTime.UtcNow,
            RevokedByIp = null,
            ReplacedByToken = null,
            TokenFamily = existingRefreshToken.TokenFamily ?? Guid.NewGuid().ToString(),
            CreatedByIp = ipAddress
        };
        
        // Update the old token to reference the new token (for audit trail)
        existingRefreshToken.ReplacedByToken = newRefreshToken;
        await _userRepository.UpdateRefreshTokenAsync(existingRefreshToken);
        
        // Save the new token
        await _userRepository.CreateRefreshTokenAsync(newRefreshTokenEntity);
        
        // Generate a new access token
        string newAccessToken = GenerateAccessToken(user);
        
        // Track this refresh operation
        _logger.LogInformation("Refreshed token for user {UserId} from IP {IpAddress}", user.Id, ipAddress);
        
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
                CreatedAt = user.CreatedAt,
                AgeGroup = user.AgeGroup
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
            CreatedAt = user.CreatedAt,
            AgeGroup = user.AgeGroup
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

    public async Task DeleteUserAsync(int userId, int currentUserId)
    {
        // Don't allow users to delete themselves
        if (userId == currentUserId)
        {
            throw new InvalidOperationException("You cannot delete your own account");
        }
        
        User? user = await _userRepository.GetUserByIdAsync(userId);
        
        if (user == null)
        {
            throw new KeyNotFoundException("User not found");
        }
        
        await _userRepository.DeleteUserAsync(userId);
    }
    
    public async Task ChangePasswordAsync(int userId, PasswordChangeDTO changePasswordDto, string ipAddress)
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
        if (changePasswordDto.NewPassword != changePasswordDto.NewPassword)
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
        
        // Get the admin user to verify they have admin privileges
        User? adminUser = await _userRepository.GetUserByIdAsync(adminId);
        
        if (adminUser == null)
        {
            throw new KeyNotFoundException("Admin user not found");
        }
        
        // Check if the user performing the update is an admin
        if (adminUser.Role != "Admin")
        {
            throw new UnauthorizedAccessException("Only administrators can update user roles");
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