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

/// <summary>
/// Represents parental control settings for a child user account
/// </summary>
public class ParentalControl
{
    /// <summary>
    /// Primary key
    /// </summary>
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    /// <summary>
    /// User ID of the parent/guardian who sets the controls
    /// </summary>
    [Required]
    public int ParentUserId { get; set; }

    /// <summary>
    /// User ID of the child being controlled
    /// </summary>
    [Required]
    public int ChildUserId { get; set; }

    /// <summary>
    /// Whether screen time limits are enabled
    /// </summary>
    public bool ScreenTimeEnabled { get; set; } = false;

    /// <summary>
    /// Daily time limit for app usage
    /// </summary>
    public TimeSpan DailyTimeLimit { get; set; } = TimeSpan.FromHours(2);

    /// <summary>
    /// Allowed hours when the child can use the app
    /// </summary>
    public List<TimeRange> AllowedHours { get; set; } = new();

    /// <summary>
    /// Whether child requires parent approval for task-related actions
    /// </summary>
    public bool TaskApprovalRequired { get; set; } = true;

    /// <summary>
    /// Whether child requires parent approval for spending points
    /// </summary>
    public bool PointSpendingApprovalRequired { get; set; } = true;

    /// <summary>
    /// List of features that are blocked for this child
    /// </summary>
    public List<string> BlockedFeatures { get; set; } = new();

    /// <summary>
    /// Whether chat/communication monitoring is enabled
    /// </summary>
    public bool ChatMonitoringEnabled { get; set; } = true;

    /// <summary>
    /// Maximum points the child can spend without approval
    /// </summary>
    public int MaxPointsWithoutApproval { get; set; } = 50;

    /// <summary>
    /// Whether the child can add external family members
    /// </summary>
    public bool CanInviteOthers { get; set; } = false;

    /// <summary>
    /// Whether the child can view other family members' details
    /// </summary>
    public bool CanViewOtherMembers { get; set; } = true;

    /// <summary>
    /// When the controls were created
    /// </summary>
    [Required]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// When the controls were last updated
    /// </summary>
    [Required]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Navigation property to the parent user
    /// </summary>
    [ForeignKey("ParentUserId")]
    public virtual User Parent { get; set; } = null!;

    /// <summary>
    /// Navigation property to the child user
    /// </summary>
    [ForeignKey("ChildUserId")]
    public virtual User Child { get; set; } = null!;

    /// <summary>
    /// Navigation property to permission requests
    /// </summary>
    public virtual ICollection<PermissionRequest> PermissionRequests { get; set; } = new List<PermissionRequest>();
}

/// <summary>
/// Represents a time range for allowed screen time hours
/// </summary>
public class TimeRange
{
    /// <summary>
    /// Unique identifier for the time range
    /// </summary>
    [Key]
    public int Id { get; set; }

    /// <summary>
    /// Start time of the allowed period
    /// </summary>
    [Required]
    public TimeSpan StartTime { get; set; }

    /// <summary>
    /// End time of the allowed period
    /// </summary>
    [Required]
    public TimeSpan EndTime { get; set; }

    /// <summary>
    /// Day of the week this time range applies to
    /// </summary>
    [Required]
    public DayOfWeek DayOfWeek { get; set; }

    /// <summary>
    /// Whether this time range is currently active
    /// </summary>
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Foreign key to the parental control this time range belongs to
    /// </summary>
    [Required]
    public int ParentalControlId { get; set; }

    /// <summary>
    /// Navigation property to the parental control
    /// </summary>
    [ForeignKey("ParentalControlId")]
    public virtual ParentalControl ParentalControl { get; set; } = null!;
}

/// <summary>
/// Represents a permission request from a child to their parent
/// </summary>
public class PermissionRequest
{
    /// <summary>
    /// Primary key
    /// </summary>
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    /// <summary>
    /// User ID of the child making the request
    /// </summary>
    [Required]
    public int ChildUserId { get; set; }

    /// <summary>
    /// User ID of the parent who will approve/deny
    /// </summary>
    [Required]
    public int ParentUserId { get; set; }

    /// <summary>
    /// Type of permission being requested
    /// </summary>
    [Required]
    [StringLength(100, ErrorMessage = "Request type cannot exceed 100 characters")]
    public string RequestType { get; set; } = string.Empty;

    /// <summary>
    /// Detailed description of what the child wants to do
    /// </summary>
    [Required]
    [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters")]
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Current status of the request
    /// </summary>
    [Required]
    public PermissionRequestStatus Status { get; set; } = PermissionRequestStatus.Pending;

    /// <summary>
    /// When the request was made
    /// </summary>
    [Required]
    public DateTime RequestedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// When the parent responded to the request
    /// </summary>
    public DateTime? RespondedAt { get; set; }

    /// <summary>
    /// Parent's response message
    /// </summary>
    [StringLength(500, ErrorMessage = "Response message cannot exceed 500 characters")]
    public string? ResponseMessage { get; set; }

    /// <summary>
    /// When the request expires if not responded to
    /// </summary>
    public DateTime? ExpiresAt { get; set; }

    /// <summary>
    /// Navigation property to the child user
    /// </summary>
    [ForeignKey("ChildUserId")]
    public virtual User Child { get; set; } = null!;

    /// <summary>
    /// Navigation property to the parent user
    /// </summary>
    [ForeignKey("ParentUserId")]
    public virtual User Parent { get; set; } = null!;
}

/// <summary>
/// Status of a permission request
/// </summary>
public enum PermissionRequestStatus
{
    /// <summary>
    /// Request is waiting for parent response
    /// </summary>
    Pending,

    /// <summary>
    /// Request was approved by parent
    /// </summary>
    Approved,

    /// <summary>
    /// Request was denied by parent
    /// </summary>
    Denied,

    /// <summary>
    /// Request expired without response
    /// </summary>
    Expired
}

/// <summary>
/// Types of permission requests
/// </summary>
public static class PermissionRequestTypes
{
    public const string SpendPoints = "SpendPoints";
    public const string CreateTask = "CreateTask";
    public const string ModifyTask = "ModifyTask";
    public const string InviteFamilyMember = "InviteFamilyMember";
    public const string ChangeProfile = "ChangeProfile";
    public const string AccessFeature = "AccessFeature";
    public const string ExtendScreenTime = "ExtendScreenTime";
    public const string ChatWithOthers = "ChatWithOthers";
} 