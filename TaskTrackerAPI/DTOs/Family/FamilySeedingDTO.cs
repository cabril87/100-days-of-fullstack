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
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.DTOs.Family;

/// <summary>
/// DTO for requesting family seeding (Admin only)
/// </summary>
public class FamilySeedingRequestDTO
{
    /// <summary>
    /// Family scenario to seed
    /// </summary>
    [Required]
    public FamilyScenario Scenario { get; set; }
    
    /// <summary>
    /// Number of members to include (0 = clear all seed data)
    /// </summary>
    [Range(0, 50)]
    public int MemberCount { get; set; }
    
    /// <summary>
    /// Custom family name (optional)
    /// </summary>
    [StringLength(100)]
    public string? FamilyName { get; set; }
    
    /// <summary>
    /// Whether to clear existing test families first
    /// </summary>
    public bool ClearExisting { get; set; } = true;
    
    /// <summary>
    /// Custom member configurations (optional)
    /// </summary>
    public List<CustomFamilyMemberDTO>? CustomMembers { get; set; }
}

/// <summary>
/// DTO for custom family member definition
/// </summary>
public class CustomFamilyMemberDTO
{
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    public FamilyMemberAgeGroup AgeGroup { get; set; }
    
    [Required]
    public FamilyRelationshipType RelationshipToAdmin { get; set; }
    
    public FamilyRelationshipType? RelationshipToMember { get; set; }
    
    public int? RelatedToMemberId { get; set; }
    
    public string? Email { get; set; }
    
    public string? AvatarUrl { get; set; }
    
    public DateTime? DateOfBirth { get; set; }
    
    public bool WantsAdminRole { get; set; } = false;
    
    public bool IsNaturalLeader { get; set; } = false;
    
    public string? Notes { get; set; }
    
    public string RoleName { get; set; } = "Member";
}

/// <summary>
/// Response DTO for family seeding
/// </summary>
public class FamilySeedingResponseDTO
{
    public bool Success { get; set; }
    
    public string Message { get; set; } = string.Empty;
    
    public int FamilyId { get; set; }
    
    public string FamilyName { get; set; } = string.Empty;
    
    public int MembersCreated { get; set; }
    
    public List<SeededMemberInfoDTO> SeededMembers { get; set; } = new List<SeededMemberInfoDTO>();
}

/// <summary>
/// Information about a seeded family member
/// </summary>
public class SeededMemberInfoDTO
{
    public int Id { get; set; }
    
    public string Name { get; set; } = string.Empty;
    
    public string Email { get; set; } = string.Empty;
    
    public FamilyMemberAgeGroup AgeGroup { get; set; }
    
    public FamilyRelationshipType RelationshipToAdmin { get; set; }
    
    public string RoleName { get; set; } = string.Empty;
    
    public bool IsAdmin { get; set; }
    
    public string TestPassword { get; set; } = string.Empty;
}

/// <summary>
/// Available family scenarios for seeding
/// </summary>
public enum FamilyScenario
{
    /// <summary>
    /// Clear all seed data
    /// </summary>
    ClearAll = 0,
    
    /// <summary>
    /// Nuclear family: 2 parents + 2 children
    /// </summary>
    NuclearFamily = 1,
    
    /// <summary>
    /// Single parent family: 1 parent + 2 children
    /// </summary>
    SingleParent = 2,
    
    /// <summary>
    /// Extended family: Grandparents + parents + children
    /// </summary>
    ExtendedFamily = 3,
    
    /// <summary>
    /// Blended family: Step-parents and step-children
    /// </summary>
    BlendedFamily = 4,
    
    /// <summary>
    /// Multi-generational: 3 generations living together
    /// </summary>
    MultiGenerational = 5,
    
    /// <summary>
    /// Large family: Many siblings and relatives
    /// </summary>
    LargeFamily = 6,
    
    /// <summary>
    /// Only adults: Testing adult-only scenarios
    /// </summary>
    AdultOnly = 7,
    
    /// <summary>
    /// Only children: Testing child-centric scenarios
    /// </summary>
    ChildCentric = 8,
    
    /// <summary>
    /// Teen-heavy: Mostly teenagers for testing
    /// </summary>
    TeenHeavy = 9,
    
    /// <summary>
    /// Edge cases: Unusual relationship combinations
    /// </summary>
    EdgeCases = 10,
    
    /// <summary>
    /// Admin transitions: Testing admin role changes
    /// </summary>
    AdminTransitions = 11,
    
    /// <summary>
    /// Minimal: Just admin + 1 other member
    /// </summary>
    Minimal = 12,
    
    /// <summary>
    /// Custom: Use custom member definitions
    /// </summary>
    Custom = 99
}

/// <summary>
/// DTO for getting available family scenarios
/// </summary>
public class FamilyScenarioInfoDTO
{
    public FamilyScenario Scenario { get; set; }
    
    public string Name { get; set; } = string.Empty;
    
    public string Description { get; set; } = string.Empty;
    
    public int DefaultMemberCount { get; set; }
    
    public List<string> MemberTypes { get; set; } = new List<string>();
    
    public List<string> TestCases { get; set; } = new List<string>();
} 