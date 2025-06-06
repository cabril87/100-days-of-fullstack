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
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskTrackerAPI.Models;

public class FamilyMember
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string Name { get; set; } = string.Empty;

    [EmailAddress]
    public string? Email { get; set; }

    public string? AvatarUrl { get; set; }

    public FamilyRelationship Relationship { get; set; } = FamilyRelationship.Other;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    [Required]
    public int UserId { get; set; }

    [Required]
    public int FamilyId { get; set; }

    [Required]
    public int RoleId { get; set; }

    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
    public bool IsPending { get; set; } = false;
    public bool ProfileCompleted { get; set; } = false;
    public DateTime? ApprovedAt { get; set; }

    // New relationship fields
    public FamilyRelationshipType RelationshipToAdmin { get; set; } = FamilyRelationshipType.Other;
    
    public int? RelatedToMemberId { get; set; } // Points to another family member they're related to
    
    public FamilyRelationshipType? RelationshipToMember { get; set; } // How they're related to that member
    
    public bool IsNaturalLeader { get; set; } = false; // Marked as natural family leader (eldest child, etc.)
    
    public DateTime? LastActiveAt { get; set; } = DateTime.UtcNow;
    
    public bool WantsAdminRole { get; set; } = false; // Member preference for admin responsibilities
    
    public DateTime? DateOfBirth { get; set; } // For age transitions
    
    public string? Notes { get; set; } // Family notes about this member

    // Navigation properties
    [ForeignKey("UserId")]
    public virtual User User { get; set; } = null!;
    [ForeignKey("FamilyId")]
    public virtual Family Family { get; set; } = null!;
    [ForeignKey("RoleId")]
    public virtual FamilyRole Role { get; set; } = null!;
    [ForeignKey("RelatedToMemberId")]
    public virtual FamilyMember? RelatedToMember { get; set; }
    public virtual ICollection<FamilyMember> RelatedMembers { get; set; } = new List<FamilyMember>();
    
    // Tasks assigned to this family member
    public virtual ICollection<TaskItem> AssignedTasks { get; set; } = new List<TaskItem>();
}

// FamilyRelationshipType enum is now defined in FamilyRelationshipType.cs