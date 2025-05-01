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

public class FamilyAchievement
{
    public int Id { get; set; }
    
    [Required]
    public int FamilyId { get; set; }
    
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;
    
    [StringLength(500)]
    public string Description { get; set; } = string.Empty;
    
    public int PointValue { get; set; } = 0;
    
    [StringLength(255)]
    public string? IconUrl { get; set; }
    
    public int ProgressCurrent { get; set; } = 0;
    
    public int ProgressTarget { get; set; } = 1;
    
    public bool IsCompleted { get; set; } = false;
    
    public DateTime? CompletedAt { get; set; }
    
    public AchievementType Type { get; set; } = AchievementType.Family;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime? UpdatedAt { get; set; }
    
    // Navigation properties
    [ForeignKey("FamilyId")]
    public virtual Family Family { get; set; } = null!;
    
    public virtual ICollection<FamilyAchievementMember> MemberContributions { get; set; } = new List<FamilyAchievementMember>();
}

public class FamilyAchievementMember
{
    public int Id { get; set; }
    
    [Required]
    public int AchievementId { get; set; }
    
    [Required]
    public int FamilyMemberId { get; set; }
    
    public int ContributionPoints { get; set; } = 0;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime? UpdatedAt { get; set; }
    
    // Navigation properties
    [ForeignKey("AchievementId")]
    public virtual FamilyAchievement Achievement { get; set; } = null!;
    
    [ForeignKey("FamilyMemberId")]
    public virtual FamilyMember Member { get; set; } = null!;
}

public enum AchievementType
{
    Individual = 0,
    Family = 1,
    Challenge = 2,
    Daily = 3,
    Weekly = 4,
    Monthly = 5
} 