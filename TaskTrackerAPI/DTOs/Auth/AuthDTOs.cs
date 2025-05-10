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
using System;
using System.ComponentModel.DataAnnotations;
using TaskTrackerAPI.DTOs.User;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.DTOs.Auth
{
    
    /// DTO for user information
    
    public class UserDTO
    {
        
        /// Unique identifier for the user
        
        public int Id { get; set; }

        
        /// Username
        
        [Required]
        [StringLength(50, ErrorMessage = "Username cannot exceed 50 characters")]
        public string Username { get; set; } = string.Empty;

        
        /// Email address
        
        [Required]
        [EmailAddress]
        [StringLength(100, ErrorMessage = "Email cannot exceed 100 characters")]
        public string Email { get; set; } = string.Empty;

        
        /// First name
        
        [StringLength(50)]
        public string? FirstName { get; set; }

        
        /// Last name
        
        [StringLength(50)]
        public string? LastName { get; set; }

        
        /// Full name/display name
        public string DisplayName { get; set; } = string.Empty;

        
        /// Avatar URL
        
        [StringLength(255)]
        public string? AvatarUrl { get; set; }

        /// User role
        public string Role { get; set; } = "User";
        
        /// Age group
        public FamilyMemberAgeGroup? AgeGroup { get; set; }
        
        /// Date when the user joined
        
        public DateTime CreatedAt { get; set; }
    }

    
    /// DTO for user login request
    
    public class UserLoginDTO
    {
        
        /// Email or username
        
        [Required]
        public string EmailOrUsername { get; set; } = string.Empty;

        /// Email address - Will use EmailOrUsername value for backward compatibility
        [EmailAddress]
        public string Email => EmailOrUsername;
        
        /// Password
        
        [Required]
        public string Password { get; set; } = string.Empty;
    }

    
    /// DTO for user registration
    
    public class UserCreateDTO
    {
        
        /// Username
        
        [Required]
        [StringLength(50, ErrorMessage = "Username cannot exceed 50 characters")]
        public string Username { get; set; } = string.Empty;

        
        /// Email address
        
        [Required]
        [EmailAddress]
        [StringLength(100, ErrorMessage = "Email cannot exceed 100 characters")]
        public string Email { get; set; } = string.Empty;

        
        /// Password
        
        [Required]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "Password must be between 6 and 100 characters")]
        public string Password { get; set; } = string.Empty;

        
        /// Confirm Password
        
        [Required]
        [Compare("Password", ErrorMessage = "The password and confirmation password do not match.")]
        public string ConfirmPassword { get; set; } = string.Empty;

        
        /// First name
        
        [StringLength(50, ErrorMessage = "First name cannot exceed 50 characters")]
        public string? FirstName { get; set; }

        
        /// Last name
        
        [StringLength(50, ErrorMessage = "Last name cannot exceed 50 characters")]
        public string? LastName { get; set; }
        
        /// Age group
        public FamilyMemberAgeGroup? AgeGroup { get; set; }

        /// Date of Birth
        [DataType(DataType.Date)]
        public DateTime? DateOfBirth { get; set; }
    }

    
    /// DTO for user profile updates
    
    public class UserProfileUpdateDTO
    {
        /// Username
        [StringLength(50)]
        public string? Username { get; set; }
        
        /// Email
        [EmailAddress]
        [StringLength(100)]
        public string? Email { get; set; }
        
        /// First name
        
        [StringLength(50)]
        public string? FirstName { get; set; }

        
        /// Last name
        
        [StringLength(50)]
        public string? LastName { get; set; }

        
        /// Avatar URL
        
        [StringLength(255)]
        public string? AvatarUrl { get; set; }

        
        /// Bio or about text
        
        [StringLength(500)]
        public string? Bio { get; set; }

        
        /// User preferences as JSON
        
        public string? Preferences { get; set; }
    }

    
    /// DTO for token response
    
    public class TokensResponseDTO
    {
        
        /// JWT access token
        
        public string AccessToken { get; set; } = string.Empty;

        
        /// Refresh token
        
        public string RefreshToken { get; set; } = string.Empty;

        
        /// Access token expiration time
        
        public DateTime AccessTokenExpiration { get; set; }

        
        /// Refresh token expiration time
        
        public DateTime RefreshTokenExpiration { get; set; }
        
        /// For backward compatibility
        public DateTime Expiration { get; set; }

        
        /// User information
        
        public UserDTO User { get; set; } = null!;
    }

    
    /// DTO for refresh token request
    
    public class RefreshTokenRequestDTO
    {
        
        /// Refresh token
        
        [Required]
        public string RefreshToken { get; set; } = string.Empty;
    }

    
    /// DTO for password reset request
    
    public class PasswordResetRequestDTO
    {
        
        /// User email address
        
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
    }

    
    /// DTO for password reset confirmation
    
    public class PasswordResetConfirmDTO
    {
        
        /// Reset token
        
        [Required]
        public string Token { get; set; } = string.Empty;

        
        /// New password
        
        [Required]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "Password must be between 6 and 100 characters")]
        public string NewPassword { get; set; } = string.Empty;
    }

    
    /// DTO for password change
    
    public class PasswordChangeDTO
    {
        
        /// Current password
        
        [Required]
        public string CurrentPassword { get; set; } = string.Empty;

        
        /// New password
        
        [Required]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "Password must be between 6 and 100 characters")]
        public string NewPassword { get; set; } = string.Empty;
    }

    
    /// DTO for changing password with confirmation
    public class ChangePasswordDTO
    {
        /// Current password
        [Required]
        public string CurrentPassword { get; set; } = string.Empty;
        
        /// New password
        [Required]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "Password must be between 6 and 100 characters")]
        public string NewPassword { get; set; } = string.Empty;
        
        /// Confirm new password
        [Required]
        [Compare("NewPassword", ErrorMessage = "The new password and confirmation password do not match.")]
        public string ConfirmNewPassword { get; set; } = string.Empty;
    }

    /// <summary>
    /// DTO for admin to update a user's password
    /// </summary>
    public class AdminPasswordChangeDTO
    {
        /// <summary>
        /// ID of the user whose password will be changed
        /// </summary>
        [Required]
        public int UserId { get; set; }
        
        /// <summary>
        /// New password
        /// </summary>
        [Required]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "Password must be between 6 and 100 characters")]
        public string NewPassword { get; set; } = string.Empty;
        
        /// <summary>
        /// Confirm new password
        /// </summary>
        [Required]
        [Compare("NewPassword", ErrorMessage = "The new password and confirmation password do not match.")]
        public string ConfirmNewPassword { get; set; } = string.Empty;
    }
} 