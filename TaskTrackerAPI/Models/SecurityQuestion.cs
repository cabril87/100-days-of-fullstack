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
using System.ComponentModel.DataAnnotations.Schema;
using TaskTrackerAPI.Attributes;

namespace TaskTrackerAPI.Models;

/// <summary>
/// Represents a security question for enhanced password recovery
/// Supports age-appropriate questions and encrypted answer storage
/// </summary>
public class SecurityQuestion
{
    /// <summary>
    /// Primary key for the security question
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Foreign key to the User who owns this security question
    /// </summary>
    [Required]
    public int UserId { get; set; }

    /// <summary>
    /// Navigation property to the User
    /// </summary>
    [ForeignKey("UserId")]
    public virtual User User { get; set; } = null!;

    /// <summary>
    /// The security question text
    /// </summary>
    [Required]
    [StringLength(250, ErrorMessage = "Security question cannot exceed 250 characters")]
    public string Question { get; set; } = string.Empty;

    /// <summary>
    /// The encrypted answer to the security question
    /// Encrypted to protect user's sensitive information
    /// </summary>
    [Required]
    [StringLength(500, ErrorMessage = "Security answer cannot exceed 500 characters")]
    [Encrypt(purpose: "SecurityQuestions")]
    public string EncryptedAnswer { get; set; } = string.Empty;

    /// <summary>
    /// The order/position of this question (1, 2, or 3)
    /// </summary>
    [Required]
    [Range(1, 3, ErrorMessage = "Question order must be between 1 and 3")]
    public int QuestionOrder { get; set; }

    /// <summary>
    /// Indicates if this question is age-appropriate for the user
    /// Used for child-friendly question filtering
    /// </summary>
    public bool IsAgeAppropriate { get; set; } = true;

    /// <summary>
    /// The minimum age group this question is appropriate for
    /// </summary>
    public FamilyMemberAgeGroup MinimumAgeGroup { get; set; } = FamilyMemberAgeGroup.Child;

    /// <summary>
    /// When this security question was created
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// When this security question was last updated
    /// </summary>
    public DateTime? UpdatedAt { get; set; }

    /// <summary>
    /// When this security question was last used for verification
    /// </summary>
    public DateTime? LastUsedAt { get; set; }

    /// <summary>
    /// Number of times this question has been used for verification
    /// </summary>
    public int UsageCount { get; set; } = 0;

    /// <summary>
    /// Whether this security question is currently active
    /// </summary>
    public bool IsActive { get; set; } = true;
} 