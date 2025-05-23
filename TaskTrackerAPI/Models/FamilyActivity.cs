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

namespace TaskTrackerAPI.Models;

/// <summary>
/// Represents an activity that occurred in a family context
/// </summary>
public class FamilyActivity
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

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
    
    [Required]
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    // Additional data in JSON format
    public string? Metadata { get; set; }

    // Navigation properties
    [ForeignKey("FamilyId")]
    public Family? Family { get; set; }
    
    [ForeignKey("ActorId")]
    public User? Actor { get; set; }
    
    [ForeignKey("TargetId")]
    public User? Target { get; set; }
}

/// <summary>
/// Types of actions that can be logged in the family activity system
/// </summary>
public static class FamilyActivityActionType
{
    // Member related actions
    public const string MemberJoined = "MemberJoined";
    public const string MemberLeft = "MemberLeft";
    public const string MemberRoleChanged = "MemberRoleChanged";
    public const string InvitationSent = "InvitationSent";
    public const string InvitationAccepted = "InvitationAccepted";
    public const string InvitationDeclined = "InvitationDeclined";
    
    // Task related actions
    public const string TaskCreated = "TaskCreated";
    public const string TaskAssigned = "TaskAssigned";
    public const string TaskCompleted = "TaskCompleted";
    public const string TaskDeleted = "TaskDeleted";
    
    // Calendar related actions
    public const string EventCreated = "EventCreated";
    public const string EventUpdated = "EventUpdated";
    public const string EventCancelled = "EventCancelled";
    
    // Achievement related actions
    public const string AchievementEarned = "AchievementEarned";
    public const string ProgressUpdate = "ProgressUpdate";
    
    // Family related actions
    public const string FamilyCreated = "FamilyCreated";
    public const string FamilyUpdated = "FamilyUpdated";
    public const string FamilyDeleted = "FamilyDeleted";
} 