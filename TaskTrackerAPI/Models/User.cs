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
// Models/User.cs
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using TaskTrackerAPI.Attributes;
using TaskTrackerAPI.Models.Gamification;

namespace TaskTrackerAPI.Models;

public class User
{
    public int Id { get; set; }

    [Required]
    [StringLength(50)]
    public required string Username { get; set; }

    [Required]
    [EmailAddress]
    [StringLength(500)]
    [Encrypt(purpose: "PII")]
    public required string Email { get; set; }

    [Required]
    public required string PasswordHash { get; set; }

    [Required]
    public required string Salt { get; set; }

    [StringLength(250)]
    [Encrypt(purpose: "PII")]
    public string? FirstName { get; set; }

    [StringLength(250)]
    [Encrypt(purpose: "PII")]
    public string? LastName { get; set; }

    [Required]
    public required string Role { get; set; } = "RegularUser";

    /// <summary>
    /// Gets the UserRole enum value from the Role string property.
    /// Provides type-safe access to user roles with legacy support.
    /// </summary>
    [NotMapped]
    public UserRole UserRole 
    { 
        get => UserRoleConstants.FromString(Role);
        set => Role = UserRoleConstants.ToString(value);
    }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    public bool IsActive { get; set; } = true;

    // MARKETPLACE POINTS SYSTEM
    public int Points { get; set; } = 100; // Starting points for new users

    // Navigation property for user's tasks
    public virtual ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();

    // Navigation property for user's boards
    public virtual ICollection<Board> Boards { get; set; } = new List<Board>();

    // Navigation property for user's family members
    public virtual ICollection<FamilyMember> FamilyMembers { get; set; } = new List<FamilyMember>();
    
    // Navigation property for user's achievements
    public virtual ICollection<UserAchievement> UserAchievements { get; set; } = new List<UserAchievement>();

    public int? PrimaryFamilyId { get; set; }
    
    [ForeignKey("PrimaryFamilyId")]
    public virtual Family? PrimaryFamily { get; set; }
    
    public virtual ICollection<UserDevice> Devices { get; set; } = new List<UserDevice>();

    // Multi-Factor Authentication fields
    [Encrypt(purpose: "MFA")]
    public string? MFASecret { get; set; }

    public bool MFAEnabled { get; set; } = false;

    [Encrypt(purpose: "MFA")]
    public string? BackupCodes { get; set; } // JSON array of backup codes

    public DateTime? MFASetupDate { get; set; }

    public FamilyMemberAgeGroup AgeGroup { get; set; } = FamilyMemberAgeGroup.Adult;
}

public enum FamilyMemberAgeGroup
{
    Child,    // Under 13
    Teen,     // 13-17 
    Adult     // 18+
}