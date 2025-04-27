using System;
using System.ComponentModel.DataAnnotations;

namespace TaskTrackerAPI.DTOs.User
{
    
    /// Data transfer object for users
    
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

        
        /// Avatar URL
        
        [StringLength(255)]
        public string? AvatarUrl { get; set; }

        
        /// Date when the user joined
        
        public DateTime CreatedAt { get; set; }
    }

    
    /// DTO for user registration
    
    public class UserRegistrationDTO
    {
        
        /// Username
        
        [Required]
        [StringLength(50)]
        public string Username { get; set; } = string.Empty;

        
        /// Email address
        
        [Required]
        [EmailAddress]
        [StringLength(100)]
        public string Email { get; set; } = string.Empty;

        
        /// Password
        
        [Required]
        [StringLength(100, MinimumLength = 6)]
        public string Password { get; set; } = string.Empty;

        
        /// First name
        
        [StringLength(50)]
        public string? FirstName { get; set; }

        
        /// Last name
        
        [StringLength(50)]
        public string? LastName { get; set; }
    }

    
    /// DTO for user login
    
    public class UserLoginDTO
    {
        
        /// Email or username
        
        [Required]
        public string EmailOrUsername { get; set; } = string.Empty;

        
        /// Password
        
        [Required]
        public string Password { get; set; } = string.Empty;
    }

    
    /// DTO for user profile updates
    
    public class UserProfileUpdateDTO
    {
        
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

    
    /// DTO for auth response
    
    public class AuthResponseDTO
    {
        
        /// JWT token
        
        public string Token { get; set; } = string.Empty;

        
        /// Refresh token
        
        public string RefreshToken { get; set; } = string.Empty;

        
        /// Token expiration
        
        public DateTime Expiration { get; set; }

        
        /// User data
        
        public UserDTO User { get; set; } = null!;
    }

    
    /// DTO for refresh token requests
    
    public class RefreshTokenDTO
    {
        
        /// Refresh token
        
        [Required]
        public string RefreshToken { get; set; } = string.Empty;
    }
} 