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
// Services/AuthService.cs
using System.Security.Claims;
using System.Security;
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.DTOs.Auth;
using TaskTrackerAPI.Helpers;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories.Interfaces;
using TaskTrackerAPI.Services.Interfaces;
using Microsoft.Extensions.Logging;
using System.Threading.Tasks;
using System;
using System.Collections.Generic;
using System.Linq;

namespace TaskTrackerAPI.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly AuthHelper _authHelper;
    private readonly ILogger<AuthService> _logger;
    private readonly ISessionManagementService _sessionManagementService;

    public AuthService(
        IUserRepository userRepository,
        AuthHelper authHelper,
        ILogger<AuthService> logger,
        ISessionManagementService sessionManagementService)
    {
        _userRepository = userRepository;
        _authHelper = authHelper;
        _logger = logger;
        _sessionManagementService = sessionManagementService;
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

        // Determine age group based on birth date if provided
        FamilyMemberAgeGroup ageGroup = FamilyMemberAgeGroup.Adult; // Default to Adult
        
        if (userDto.DateOfBirth.HasValue)
        {
            // Calculate age
            DateTime today = DateTime.Today;
            DateTime birthDate = userDto.DateOfBirth.Value;
            int age = today.Year - birthDate.Year;
            
            // Adjust age if birthday hasn't occurred yet this year
            if (birthDate.Date > today.AddYears(-age)) 
                age--;
            
            // Assign age group based on age
            if (age < 13)
                ageGroup = FamilyMemberAgeGroup.Child;
            else if (age < 18)
                ageGroup = FamilyMemberAgeGroup.Teen;
            else
                ageGroup = FamilyMemberAgeGroup.Adult;
        }
        
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
            AgeGroup = userDto.AgeGroup ?? ageGroup // Use provided age group or calculated one
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

    public async Task<TokensResponseDTO> LoginAsync(UserLoginDTO loginDto, string ipAddress, string? userAgent = null)
    {
        try
        {
            // Log the login attempt with detailed info
            _logger.LogInformation("Login attempt details - EmailOrUsername: '{EmailOrUsername}', Email property: '{Email}'", 
                loginDto.EmailOrUsername, loginDto.Email);
            
            // Try to find user by email first
            User? user = await _userRepository.GetUserByEmailAsync(loginDto.EmailOrUsername);
            
            // If not found by email, try by username
            if (user == null)
            {
                user = await _userRepository.GetUserByUsernameAsync(loginDto.EmailOrUsername);
                _logger.LogInformation("Email lookup failed, tried username lookup: {Result}", user != null);
            }

            _logger.LogInformation("Login attempt for {EmailOrUsername}, user found: {UserFound}", 
                loginDto.EmailOrUsername, user != null);

            if (user == null || !user.IsActive)
            {
                _logger.LogWarning("Invalid login: user not found or not active for {EmailOrUsername}", 
                    loginDto.EmailOrUsername);
                throw new UnauthorizedAccessException("Invalid email or password");
            }

            // Verify password
            bool isPasswordValid = await _userRepository.CheckPasswordAsync(user, loginDto.Password);
            _logger.LogInformation("Password validation result for {EmailOrUsername}: {Result}", 
                loginDto.EmailOrUsername, isPasswordValid);

            if (!isPasswordValid)
            {
                _logger.LogWarning("Failed login attempt for user: {EmailOrUsername} - Invalid password", 
                    loginDto.EmailOrUsername);
                throw new UnauthorizedAccessException("Invalid email or password");
            }

            // Check if the hash is in the old ASP.NET Identity format and rehash it
            if (user.PasswordHash.StartsWith("AQAAAA"))
            {
                _logger.LogInformation("Upgrading password hash to Argon2id for user: {EmailOrUsername}", 
                    loginDto.EmailOrUsername);
                
                // Create a new Argon2id hash
                _authHelper.CreatePasswordHash(loginDto.Password, out string newPasswordHash, out string newSalt);
                
                // Update the user's password hash and salt
                user.PasswordHash = newPasswordHash;
                user.Salt = newSalt;
                
                // Save the updated user
                await _userRepository.UpdateUserAsync(user);
                
                _logger.LogInformation("Password hash upgraded successfully for user: {EmailOrUsername}", 
                    loginDto.EmailOrUsername);
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

            // Create session tracking entry
            try
            {
                string sessionToken = await _sessionManagementService.CreateSessionAsync(user.Id, ipAddress, userAgent);
                _logger.LogInformation("Session created for user {UserId}: {SessionToken}", user.Id, sessionToken);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to create session tracking for user {UserId}, but login will continue", user.Id);
                // Don't fail the login if session creation fails
            }

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
            _logger.LogError(ex, "Unexpected error during login for {EmailOrUsername}: {ErrorMessage}", 
                loginDto.EmailOrUsername, ex.Message);
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
    
    public async Task AdminChangePasswordAsync(AdminPasswordChangeDTO changePasswordDto, int adminId, string ipAddress)
    {
        // Verify admin permissions
        User? adminUser = await _userRepository.GetUserByIdAsync(adminId);
        
        if (adminUser == null)
        {
            throw new KeyNotFoundException("Admin user not found");
        }
        
        // Check if the user performing the update is an admin
        if (adminUser.Role != "Admin")
        {
            throw new UnauthorizedAccessException("Only administrators can update user passwords");
        }
        
        // Get the target user
        User? user = await _userRepository.GetUserByIdAsync(changePasswordDto.UserId);
        
        if (user == null)
        {
            throw new KeyNotFoundException("User not found");
        }
        
        // Verify passwords match
        if (changePasswordDto.NewPassword != changePasswordDto.ConfirmNewPassword)
        {
            throw new ArgumentException("New passwords do not match");
        }
        
        // Update password
        await _userRepository.ChangePasswordAsync(user, changePasswordDto.NewPassword);
        
        // Revoke all refresh tokens for this user for security
        await _userRepository.RevokeAllUserRefreshTokensAsync(changePasswordDto.UserId, ipAddress);
        
        _logger.LogInformation("Admin {AdminId} changed password for user {UserId}", adminId, changePasswordDto.UserId);
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

    public async Task LogoutAsync(int userId, string refreshToken, string ipAddress)
    {
        try
        {
            _logger.LogInformation("Logging out user ID {UserId} from IP {IpAddress}", userId, ipAddress);

            User? user = await _userRepository.GetUserByIdAsync(userId);
            if (user == null)
            {
                _logger.LogWarning("Logout attempt for non-existent user {UserId}", userId);
                throw new KeyNotFoundException("User not found");
            }

            // Find and invalidate the refresh token using the repository
            RefreshToken? token = await _userRepository.GetRefreshTokenAsync(refreshToken);
            if (token != null && token.UserId == userId)
            {
                await _userRepository.RevokeRefreshTokenAsync(token, ipAddress);
                _logger.LogInformation("Invalidated refresh token for user {UserId}", userId);
            }
            else
            {
                _logger.LogWarning("No matching refresh token found for user {UserId} during logout", userId);
            }

            // Also revoke all other tokens for this user for complete logout
            await _userRepository.RevokeAllUserRefreshTokensAsync(userId, ipAddress);

            _logger.LogInformation("User {UserId} logged out successfully", userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during logout for user {UserId}", userId);
            throw;
        }
    }
}