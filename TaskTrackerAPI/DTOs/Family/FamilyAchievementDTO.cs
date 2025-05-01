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

public class FamilyAchievementDTO
{
    public int Id { get; set; }
    public int FamilyId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int PointValue { get; set; }
    public string? IconUrl { get; set; }
    public int ProgressCurrent { get; set; }
    public int ProgressTarget { get; set; }
    public bool IsCompleted { get; set; }
    public DateTime? CompletedAt { get; set; }
    public AchievementType Type { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<FamilyAchievementMemberDTO> MemberContributions { get; set; } = new();
}

public class FamilyAchievementMemberDTO
{
    public int Id { get; set; }
    public int AchievementId { get; set; }
    public int FamilyMemberId { get; set; }
    public string MemberName { get; set; } = string.Empty;
    public int ContributionPoints { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class FamilyAchievementCreateDTO
{
    [Required]
    public int FamilyId { get; set; }
    
    [Required]
    [StringLength(100, MinimumLength = 3)]
    public string Name { get; set; } = string.Empty;
    
    [StringLength(500)]
    public string Description { get; set; } = string.Empty;
    
    [Range(0, 1000)]
    public int PointValue { get; set; } = 10;
    
    public string? IconUrl { get; set; }
    
    [Range(0, int.MaxValue)]
    public int ProgressTarget { get; set; } = 1;
    
    public AchievementType Type { get; set; } = AchievementType.Family;
}

public class FamilyAchievementUpdateDTO
{
    [StringLength(100, MinimumLength = 3)]
    public string? Name { get; set; }
    
    [StringLength(500)]
    public string? Description { get; set; }
    
    [Range(0, 1000)]
    public int? PointValue { get; set; }
    
    public string? IconUrl { get; set; }
    
    [Range(0, int.MaxValue)]
    public int? ProgressTarget { get; set; }
}

public class FamilyLeaderboardDTO
{
    public int FamilyId { get; set; }
    public string FamilyName { get; set; } = string.Empty;
    public int TotalPoints { get; set; }
    public int CompletedAchievements { get; set; }
    public DateTime LastUpdated { get; set; }
} 