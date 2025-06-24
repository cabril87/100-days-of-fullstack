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
using System.Text.Json.Serialization;

namespace TaskTrackerAPI.DTOs.Family;

/// <summary>
/// Data transfer object for family activity records
/// </summary>
public class FamilyActivityDTO
{
    public int Id { get; set; }
    
    public int FamilyId { get; set; }
    
    public int ActorId { get; set; }
    
    public string ActorName { get; set; } = string.Empty;
    
    public string ActorDisplayName { get; set; } = string.Empty;
    
    public string? ActorAvatarUrl { get; set; }
    
    public int? TargetId { get; set; }
    
    public string? TargetName { get; set; }
    
    public string? TargetDisplayName { get; set; }
    
    public string ActionType { get; set; } = string.Empty;
    
    public string? Description { get; set; }
    
    public DateTime Timestamp { get; set; }
    
    public string? EntityType { get; set; }
    
    public int? EntityId { get; set; }
    
    public Dictionary<string, object>? Metadata { get; set; }
}

/// <summary>
/// Data transfer object for creating a family activity record
/// </summary>
public class FamilyActivityCreateDTO
{
    [Required]
    public int FamilyId { get; set; }
    
    [Required]
    public int ActorId { get; set; }
    
    public int? TargetId { get; set; }
    
    [Required]
    [StringLength(50)]
    public string ActionType { get; set; } = string.Empty;
    
    [StringLength(500)]
    public string? Description { get; set; }
    
    public string? EntityType { get; set; }
    
    public int? EntityId { get; set; }
    
    public Dictionary<string, object>? Metadata { get; set; }
}

/// <summary>
/// Data transfer object for filtering family activity records
/// </summary>
public class FamilyActivityFilterDTO
{
    public int? ActorId { get; set; }
    
    public int? TargetId { get; set; }
    
    public string? ActionType { get; set; }
    
    public string? EntityType { get; set; }
    
    public int? EntityId { get; set; }
    
    public DateTime? StartDate { get; set; }
    
    public DateTime? EndDate { get; set; }
    
    public int PageNumber { get; set; } = 1;
    
    public int PageSize { get; set; } = 20;
}

/// <summary>
/// Data transfer object for paginated family activity results
/// </summary>
public class FamilyActivityPagedResultDTO
{
    public IEnumerable<FamilyActivityDTO> Activities { get; set; } = new List<FamilyActivityDTO>();
    
    public int TotalCount { get; set; }
    
    public int PageNumber { get; set; }
    
    public int PageSize { get; set; }
    
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
    
    public bool HasPreviousPage => PageNumber > 1;
    
    public bool HasNextPage => PageNumber < TotalPages;
}

/// <summary>
/// Data transfer object for family activity statistics
/// </summary>
public class FamilyActivityStatsDTO
{
    /// <summary>
    /// Total number of activities in the family
    /// </summary>
    public int TotalActivities { get; set; } = 0;
    
    /// <summary>
    /// Number of activities today
    /// </summary>
    public int TodayActivities { get; set; } = 0;
    
    /// <summary>
    /// Number of activities this week
    /// </summary>
    public int WeekActivities { get; set; } = 0;
    
    /// <summary>
    /// Number of activities this month
    /// </summary>
    public int MonthActivities { get; set; } = 0;
    
    /// <summary>
    /// Most active family member
    /// </summary>
    public string MostActiveUser { get; set; } = string.Empty;
    
    /// <summary>
    /// Most common activity type
    /// </summary>
    public string MostCommonActivityType { get; set; } = string.Empty;
    
    /// <summary>
    /// Last activity timestamp
    /// </summary>
    public DateTime? LastActivityTime { get; set; }
    
    /// <summary>
    /// Average activities per day over the last 30 days
    /// </summary>
    public double AverageActivitiesPerDay { get; set; } = 0;
} 