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
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using TaskTrackerAPI.DTOs.Family;

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
        public FamilyMemberAgeGroupDTO? AgeGroup { get; set; }
        
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
        public FamilyMemberAgeGroupDTO? AgeGroup { get; set; }

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

    /// <summary>
    /// DTO for MFA setup initiation
    /// </summary>
    public class MFASetupInitiateDTO
    {
        /// <summary>
        /// Secret key for TOTP
        /// </summary>
        public string Secret { get; set; } = string.Empty;

        /// <summary>
        /// QR code as base64 string
        /// </summary>
        public string QRCode { get; set; } = string.Empty;

        /// <summary>
        /// Manual entry key (formatted secret)
        /// </summary>
        public string ManualEntryKey { get; set; } = string.Empty;
    }

    /// <summary>
    /// DTO for MFA setup completion
    /// </summary>
    public class MFASetupCompleteDTO
    {
        /// <summary>
        /// TOTP code from authenticator app
        /// </summary>
        [Required]
        [StringLength(6, MinimumLength = 6, ErrorMessage = "Code must be exactly 6 digits")]
        [RegularExpression(@"^\d{6}$", ErrorMessage = "Code must be exactly 6 digits")]
        public string Code { get; set; } = string.Empty;
    }

    /// <summary>
    /// DTO for MFA verification during login
    /// </summary>
    public class MFAVerificationDTO
    {
        /// <summary>
        /// TOTP code from authenticator app
        /// </summary>
        [Required]
        [StringLength(6, MinimumLength = 6, ErrorMessage = "Code must be exactly 6 digits")]
        [RegularExpression(@"^\d{6}$", ErrorMessage = "Code must be exactly 6 digits")]
        public string Code { get; set; } = string.Empty;
    }

    /// <summary>
    /// DTO for MFA disable request
    /// </summary>
    public class MFADisableDTO
    {
        /// <summary>
        /// Current password for security verification
        /// </summary>
        [Required]
        public string Password { get; set; } = string.Empty;

        /// <summary>
        /// TOTP code from authenticator app (optional)
        /// </summary>
        [StringLength(6, MinimumLength = 6, ErrorMessage = "Code must be exactly 6 digits")]
        [RegularExpression(@"^\d{6}$", ErrorMessage = "Code must be exactly 6 digits")]
        public string? Code { get; set; }
    }

    /// <summary>
    /// DTO for backup codes generation/retrieval
    /// </summary>
    public class MFABackupCodesDTO
    {
        /// <summary>
        /// List of backup codes
        /// </summary>
        public List<string> BackupCodes { get; set; } = new List<string>();

        /// <summary>
        /// When these codes were generated
        /// </summary>
        public DateTime GeneratedAt { get; set; }
    }

    /// <summary>
    /// DTO for MFA status information
    /// </summary>
    public class MFAStatusDTO
    {
        /// <summary>
        /// Whether MFA is enabled for the user
        /// </summary>
        public bool IsEnabled { get; set; }

        /// <summary>
        /// When MFA was set up
        /// </summary>
        public DateTime? SetupDate { get; set; }

        /// <summary>
        /// Number of backup codes remaining
        /// </summary>
        public int BackupCodesRemaining { get; set; }
    }

    /// <summary>
    /// DTO for using backup code
    /// </summary>
    public class MFABackupCodeDTO
    {
        /// <summary>
        /// Backup code
        /// </summary>
        [Required]
        [StringLength(12, MinimumLength = 8, ErrorMessage = "Invalid backup code format")]
        public string BackupCode { get; set; } = string.Empty;
    }

    /// <summary>
    /// DTO for admin user creation with family assignment
    /// </summary>
    public class AdminUserCreateDTO
    {
        /// <summary>
        /// Username
        /// </summary>
        [Required]
        [StringLength(50, ErrorMessage = "Username cannot exceed 50 characters")]
        public string Username { get; set; } = string.Empty;

        /// <summary>
        /// Email address
        /// </summary>
        [Required]
        [EmailAddress]
        [StringLength(100, ErrorMessage = "Email cannot exceed 100 characters")]
        public string Email { get; set; } = string.Empty;

        /// <summary>
        /// Password
        /// </summary>
        [Required]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "Password must be between 6 and 100 characters")]
        public string Password { get; set; } = string.Empty;

        /// <summary>
        /// Confirm Password
        /// </summary>
        [Required]
        [Compare("Password", ErrorMessage = "The password and confirmation password do not match.")]
        public string ConfirmPassword { get; set; } = string.Empty;

        /// <summary>
        /// First name
        /// </summary>
        [StringLength(50, ErrorMessage = "First name cannot exceed 50 characters")]
        public string? FirstName { get; set; }

        /// <summary>
        /// Last name
        /// </summary>
        [StringLength(50, ErrorMessage = "Last name cannot exceed 50 characters")]
        public string? LastName { get; set; }
        
        /// <summary>
        /// Age group for family permissions
        /// </summary>
        [Required]
        public FamilyMemberAgeGroupDTO AgeGroup { get; set; }

        /// <summary>
        /// Family ID to assign the user to (optional)
        /// </summary>
        public int? FamilyId { get; set; }

        /// <summary>
        /// Role ID to assign to the user in the family (optional)
        /// </summary>
        public int? FamilyRoleId { get; set; }

        /// <summary>
        /// Date of Birth (optional, will calculate age group if provided)
        /// </summary>
        [DataType(DataType.Date)]
        public DateTime? DateOfBirth { get; set; }
    }

    /// <summary>
    /// DTO for admin user creation response
    /// </summary>
    public class AdminUserCreateResponseDTO
    {
        /// <summary>
        /// Created user information
        /// </summary>
        public UserDTO User { get; set; } = null!;

        /// <summary>
        /// Family assignment information (if assigned to a family)
        /// </summary>
        public FamilyAssignmentDTO? FamilyAssignment { get; set; }

        /// <summary>
        /// Success message
        /// </summary>
        public string Message { get; set; } = string.Empty;
    }

    /// <summary>
    /// DTO for family assignment information
    /// </summary>
    public class FamilyAssignmentDTO
    {
        /// <summary>
        /// Family ID
        /// </summary>
        public int FamilyId { get; set; }

        /// <summary>
        /// Family name
        /// </summary>
        public string FamilyName { get; set; } = string.Empty;

        /// <summary>
        /// Assigned role in the family
        /// </summary>
        public string RoleName { get; set; } = string.Empty;

        /// <summary>
        /// Role ID
        /// </summary>
        public int RoleId { get; set; }
    }

    /// <summary>
    /// DTO for admin family selection (simplified family info for dropdowns)
    /// </summary>
    public class AdminFamilySelectionDTO
    {
        /// <summary>
        /// Family ID
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// Family name
        /// </summary>
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// Family description
        /// </summary>
        public string? Description { get; set; }

        /// <summary>
        /// Number of members in family
        /// </summary>
        public int MemberCount { get; set; }

        /// <summary>
        /// Family creation date
        /// </summary>
        public DateTime CreatedAt { get; set; }
    }
} 