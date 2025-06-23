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

namespace TaskTrackerAPI.DTOs.Auth
{
    /// <summary>
    /// DTO for setting up security questions during initial setup
    /// </summary>
    public class SecurityQuestionSetupDTO
    {
        /// <summary>
        /// First security question
        /// </summary>
        [Required]
        [StringLength(250, MinimumLength = 10, ErrorMessage = "Security question must be between 10 and 250 characters")]
        public string Question1 { get; set; } = string.Empty;

        /// <summary>
        /// Answer to first security question
        /// </summary>
        [Required]
        [StringLength(100, MinimumLength = 3, ErrorMessage = "Security answer must be between 3 and 100 characters")]
        public string Answer1 { get; set; } = string.Empty;

        /// <summary>
        /// Second security question
        /// </summary>
        [Required]
        [StringLength(250, MinimumLength = 10, ErrorMessage = "Security question must be between 10 and 250 characters")]
        public string Question2 { get; set; } = string.Empty;

        /// <summary>
        /// Answer to second security question
        /// </summary>
        [Required]
        [StringLength(100, MinimumLength = 3, ErrorMessage = "Security answer must be between 3 and 100 characters")]
        public string Answer2 { get; set; } = string.Empty;

        /// <summary>
        /// Third security question
        /// </summary>
        [Required]
        [StringLength(250, MinimumLength = 10, ErrorMessage = "Security question must be between 10 and 250 characters")]
        public string Question3 { get; set; } = string.Empty;

        /// <summary>
        /// Answer to third security question
        /// </summary>
        [Required]
        [StringLength(100, MinimumLength = 3, ErrorMessage = "Security answer must be between 3 and 100 characters")]
        public string Answer3 { get; set; } = string.Empty;
    }

    /// <summary>
    /// DTO for verifying security question answers during password reset
    /// </summary>
    public class SecurityQuestionVerificationDTO
    {
        /// <summary>
        /// Email address of the user requesting password reset
        /// </summary>
        [Required]
        [EmailAddress]
        [StringLength(100, ErrorMessage = "Email cannot exceed 100 characters")]
        public string Email { get; set; } = string.Empty;

        /// <summary>
        /// Answer to first security question
        /// </summary>
        [Required]
        [StringLength(100, ErrorMessage = "Security answer cannot exceed 100 characters")]
        public string Answer1 { get; set; } = string.Empty;

        /// <summary>
        /// Answer to second security question
        /// </summary>
        [Required]
        [StringLength(100, ErrorMessage = "Security answer cannot exceed 100 characters")]
        public string Answer2 { get; set; } = string.Empty;

        /// <summary>
        /// Answer to third security question
        /// </summary>
        [Required]
        [StringLength(100, ErrorMessage = "Security answer cannot exceed 100 characters")]
        public string Answer3 { get; set; } = string.Empty;
    }

    /// <summary>
    /// DTO for returning user's security questions (without answers)
    /// </summary>
    public class SecurityQuestionListDTO
    {
        /// <summary>
        /// User's security questions
        /// </summary>
        public List<SecurityQuestionDisplayDTO> Questions { get; set; } = new List<SecurityQuestionDisplayDTO>();

        /// <summary>
        /// Whether the user has security questions set up
        /// </summary>
        public bool HasQuestionsSetup { get; set; }

        /// <summary>
        /// Number of security questions configured
        /// </summary>
        public int QuestionCount { get; set; }
    }

    /// <summary>
    /// DTO for displaying individual security questions (without answers)
    /// </summary>
    public class SecurityQuestionDisplayDTO
    {
        /// <summary>
        /// Security question ID
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// The security question text
        /// </summary>
        public string Question { get; set; } = string.Empty;

        /// <summary>
        /// The order/position of this question (1, 2, or 3)
        /// </summary>
        public int QuestionOrder { get; set; }

        /// <summary>
        /// Whether this question is age-appropriate for the user
        /// </summary>
        public bool IsAgeAppropriate { get; set; }

        /// <summary>
        /// When this security question was created
        /// </summary>
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// When this security question was last used
        /// </summary>
        public DateTime? LastUsedAt { get; set; }
    }

    /// <summary>
    /// DTO for updating existing security questions
    /// </summary>
    public class SecurityQuestionUpdateDTO
    {
        /// <summary>
        /// Updated first security question (optional)
        /// </summary>
        [StringLength(250, MinimumLength = 10, ErrorMessage = "Security question must be between 10 and 250 characters")]
        public string? Question1 { get; set; }

        /// <summary>
        /// Updated answer to first security question (optional)
        /// </summary>
        [StringLength(100, MinimumLength = 3, ErrorMessage = "Security answer must be between 3 and 100 characters")]
        public string? Answer1 { get; set; }

        /// <summary>
        /// Updated second security question (optional)
        /// </summary>
        [StringLength(250, MinimumLength = 10, ErrorMessage = "Security question must be between 10 and 250 characters")]
        public string? Question2 { get; set; }

        /// <summary>
        /// Updated answer to second security question (optional)
        /// </summary>
        [StringLength(100, MinimumLength = 3, ErrorMessage = "Security answer must be between 3 and 100 characters")]
        public string? Answer2 { get; set; }

        /// <summary>
        /// Updated third security question (optional)
        /// </summary>
        [StringLength(250, MinimumLength = 10, ErrorMessage = "Security question must be between 10 and 250 characters")]
        public string? Question3 { get; set; }

        /// <summary>
        /// Updated answer to third security question (optional)
        /// </summary>
        [StringLength(100, MinimumLength = 3, ErrorMessage = "Security answer must be between 3 and 100 characters")]
        public string? Answer3 { get; set; }
    }

    /// <summary>
    /// DTO for security question verification result
    /// </summary>
    public class SecurityQuestionVerificationResultDTO
    {
        /// <summary>
        /// Whether all security questions were answered correctly
        /// </summary>
        public bool IsVerified { get; set; }

        /// <summary>
        /// Number of questions answered correctly
        /// </summary>
        public int CorrectAnswers { get; set; }

        /// <summary>
        /// Total number of questions asked
        /// </summary>
        public int TotalQuestions { get; set; }

        /// <summary>
        /// Verification token for password reset (only if IsVerified is true)
        /// </summary>
        public string? VerificationToken { get; set; }

        /// <summary>
        /// Token expiration time
        /// </summary>
        public DateTime? TokenExpiration { get; set; }

        /// <summary>
        /// Error message if verification failed
        /// </summary>
        public string? ErrorMessage { get; set; }
    }

    /// <summary>
    /// DTO for enhanced password reset request with security questions
    /// </summary>
    public class EnhancedPasswordResetRequestDTO
    {
        /// <summary>
        /// Email address of the user requesting password reset
        /// </summary>
        [Required]
        [EmailAddress]
        [StringLength(100, ErrorMessage = "Email cannot exceed 100 characters")]
        public string Email { get; set; } = string.Empty;

        /// <summary>
        /// Whether to use security questions for verification
        /// </summary>
        public bool UseSecurityQuestions { get; set; } = false;

        /// <summary>
        /// Security question answers (if UseSecurityQuestions is true)
        /// </summary>
        public SecurityQuestionVerificationDTO? SecurityQuestions { get; set; }
    }

    /// <summary>
    /// DTO for predefined age-appropriate security questions
    /// </summary>
    public class PredefinedSecurityQuestionDTO
    {
        /// <summary>
        /// Question text
        /// </summary>
        public string Question { get; set; } = string.Empty;

        /// <summary>
        /// Minimum age group this question is appropriate for
        /// </summary>
        public string MinimumAgeGroup { get; set; } = string.Empty;

        /// <summary>
        /// Category of the question (Personal, Family, School, etc.)
        /// </summary>
        public string Category { get; set; } = string.Empty;

        /// <summary>
        /// Example answer format (for user guidance)
        /// </summary>
        public string ExampleFormat { get; set; } = string.Empty;
    }

    /// <summary>
    /// DTO for getting age-appropriate security questions
    /// </summary>
    public class AgeAppropriateQuestionsRequestDTO
    {
        /// <summary>
        /// User's age group
        /// </summary>
        [Required]
        public string AgeGroup { get; set; } = string.Empty;

        /// <summary>
        /// Number of questions to return (default: 10)
        /// </summary>
        [Range(5, 20, ErrorMessage = "Question count must be between 5 and 20")]
        public int Count { get; set; } = 10;

        /// <summary>
        /// Question categories to include (optional)
        /// </summary>
        public List<string>? Categories { get; set; }
    }
} 