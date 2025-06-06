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
using TaskTrackerAPI.Models;
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.DTOs.User;

namespace TaskTrackerAPI.DTOs.Family;

public class FamilyMemberDTO
{
    public int Id { get; set; }
    public int FamilyId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? AvatarUrl { get; set; }
    public FamilyRelationship Relationship { get; set; }
    public UserDTO User { get; set; } = null!;
    public FamilyRoleDTO Role { get; set; } = null!;
    public DateTime JoinedAt { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public bool IsPending { get; set; }
    public string? Nickname { get; set; }
    
    // New relationship fields
    public FamilyRelationshipType RelationshipToAdmin { get; set; }
    public int? RelatedToMemberId { get; set; }
    public FamilyRelationshipType? RelationshipToMember { get; set; }
    public bool IsNaturalLeader { get; set; }
    public DateTime? LastActiveAt { get; set; }
    public bool WantsAdminRole { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? Notes { get; set; }
    
    // Computed properties for smart analysis
    public string RelationshipToAdminDisplayName => GetRelationshipDisplayName(RelationshipToAdmin);
    public bool IsActive => LastActiveAt?.AddDays(30) > DateTime.UtcNow; // Active in last 30 days
    public int? DaysUntilAdult => GetDaysUntilAdult();
    
    private string GetRelationshipDisplayName(FamilyRelationshipType relationship)
    {
        return relationship switch
        {
            FamilyRelationshipType.Parent => "Parent",
            FamilyRelationshipType.Child => "Child",
            FamilyRelationshipType.Spouse => "Spouse",
            FamilyRelationshipType.Partner => "Partner",
            FamilyRelationshipType.Sibling => "Sibling",
            FamilyRelationshipType.Grandparent => "Grandparent",
            FamilyRelationshipType.Grandchild => "Grandchild",
            FamilyRelationshipType.Stepparent => "Step-Parent",
            FamilyRelationshipType.Stepchild => "Step-Child",
            FamilyRelationshipType.Stepsister => "Step-Sister",
            FamilyRelationshipType.Stepbrother => "Step-Brother",
            FamilyRelationshipType.FamilyFriend => "Family Friend",
            FamilyRelationshipType.Caregiver => "Caregiver",
            FamilyRelationshipType.Guardian => "Guardian",
            FamilyRelationshipType.Other => "Other",
            _ => "Unknown"
        };
    }
    
    private int? GetDaysUntilAdult()
    {
        if (DateOfBirth == null || User?.AgeGroup != FamilyMemberAgeGroup.Teen) return null;
        
        DateTime adultDate = DateOfBirth.Value.AddYears(18);
        int daysUntil = (adultDate - DateTime.UtcNow).Days;
        
        return daysUntil > 0 ? daysUntil : null;
    }
}

public class FamilyMemberCreateDTO
{
    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string Name { get; set; } = string.Empty;
    
    [EmailAddress]
    public string? Email { get; set; }
    
    public string? AvatarUrl { get; set; }
    
    public FamilyRelationship Relationship { get; set; } = FamilyRelationship.Other;
    
    [Required]
    public int RoleId { get; set; }
    
    [Required]
    public int FamilyId { get; set; }
    
    [Required]
    public int UserId { get; set; }
    
    public string? Nickname { get; set; }
    
    // Relationship information
    public FamilyRelationshipType RelationshipToAdmin { get; set; } = FamilyRelationshipType.Other;
    public int? RelatedToMemberId { get; set; }
    public FamilyRelationshipType? RelationshipToMember { get; set; }
    public bool IsNaturalLeader { get; set; } = false;
    public bool WantsAdminRole { get; set; } = false;
    public DateTime? DateOfBirth { get; set; }
    public string? Notes { get; set; }
}

public class FamilyMemberUpdateDTO
{
    [StringLength(100, MinimumLength = 2)]
    public string? Name { get; set; }
    
    [EmailAddress]
    public string? Email { get; set; }
    
    public string? AvatarUrl { get; set; }
    
    public FamilyRelationship? Relationship { get; set; }
    
    public int? RoleId { get; set; }
    
    public string? Nickname { get; set; }
    
    // Relationship updates
    public FamilyRelationshipType? RelationshipToAdmin { get; set; }
    public int? RelatedToMemberId { get; set; }
    public FamilyRelationshipType? RelationshipToMember { get; set; }
    public bool? IsNaturalLeader { get; set; }
    public bool? WantsAdminRole { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? Notes { get; set; }
} 