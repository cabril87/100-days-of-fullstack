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

namespace TaskTrackerAPI.DTOs.Auth;

/// <summary>
/// DTO for parental control settings
/// </summary>
public class ParentalControlDTO
{
    /// <summary>
    /// Unique identifier
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// User ID of the parent/guardian
    /// </summary>
    public int ParentUserId { get; set; }

    /// <summary>
    /// User ID of the child being controlled
    /// </summary>
    public int ChildUserId { get; set; }

    /// <summary>
    /// Whether screen time limits are enabled
    /// </summary>
    public bool ScreenTimeEnabled { get; set; }

    /// <summary>
    /// Daily time limit for app usage
    /// </summary>
    public TimeSpan DailyTimeLimit { get; set; }

    /// <summary>
    /// Allowed hours when the child can use the app
    /// </summary>
    public List<TimeRangeDTO> AllowedHours { get; set; } = new();

    /// <summary>
    /// Whether child requires parent approval for task-related actions
    /// </summary>
    public bool TaskApprovalRequired { get; set; }

    /// <summary>
    /// Whether child requires parent approval for spending points
    /// </summary>
    public bool PointSpendingApprovalRequired { get; set; }

    /// <summary>
    /// List of features that are blocked for this child
    /// </summary>
    public List<string> BlockedFeatures { get; set; } = new();

    /// <summary>
    /// Whether chat/communication monitoring is enabled
    /// </summary>
    public bool ChatMonitoringEnabled { get; set; }

    /// <summary>
    /// Maximum points the child can spend without approval
    /// </summary>
    public int MaxPointsWithoutApproval { get; set; }

    /// <summary>
    /// Whether the child can add external family members
    /// </summary>
    public bool CanInviteOthers { get; set; }

    /// <summary>
    /// Whether the child can view other family members' details
    /// </summary>
    public bool CanViewOtherMembers { get; set; }

    /// <summary>
    /// When the controls were created
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// When the controls were last updated
    /// </summary>
    public DateTime UpdatedAt { get; set; }

    /// <summary>
    /// Parent user information
    /// </summary>
    public UserDTO? Parent { get; set; }

    /// <summary>
    /// Child user information
    /// </summary>
    public UserDTO? Child { get; set; }
}

/// <summary>
/// DTO for creating or updating parental control settings
/// </summary>
public class ParentalControlCreateUpdateDTO
{
    /// <summary>
    /// User ID of the child being controlled
    /// </summary>
    [Required(ErrorMessage = "Child user ID is required")]
    public int ChildUserId { get; set; }

    /// <summary>
    /// Whether screen time limits are enabled
    /// </summary>
    public bool ScreenTimeEnabled { get; set; } = false;

    /// <summary>
    /// Daily time limit for app usage (in hours)
    /// </summary>
    [Range(0.5, 24, ErrorMessage = "Daily time limit must be between 0.5 and 24 hours")]
    public double DailyTimeLimitHours { get; set; } = 2.0;

    /// <summary>
    /// Allowed hours when the child can use the app
    /// </summary>
    public List<TimeRangeCreateDTO> AllowedHours { get; set; } = new();

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
    [Range(0, 1000, ErrorMessage = "Max points without approval must be between 0 and 1000")]
    public int MaxPointsWithoutApproval { get; set; } = 50;

    /// <summary>
    /// Whether the child can add external family members
    /// </summary>
    public bool CanInviteOthers { get; set; } = false;

    /// <summary>
    /// Whether the child can view other family members' details
    /// </summary>
    public bool CanViewOtherMembers { get; set; } = true;
}

/// <summary>
/// DTO for time range settings
/// </summary>
public class TimeRangeDTO
{
    /// <summary>
    /// Start time of the allowed period
    /// </summary>
    public TimeSpan StartTime { get; set; }

    /// <summary>
    /// End time of the allowed period
    /// </summary>
    public TimeSpan EndTime { get; set; }

    /// <summary>
    /// Day of week (0 = Sunday, 6 = Saturday)
    /// </summary>
    public DayOfWeek DayOfWeek { get; set; }

    /// <summary>
    /// Whether this time range is active
    /// </summary>
    public bool IsActive { get; set; }
}

/// <summary>
/// DTO for creating time range settings
/// </summary>
public class TimeRangeCreateDTO
{
    /// <summary>
    /// Start time in HH:mm format (e.g., "09:00")
    /// </summary>
    [Required(ErrorMessage = "Start time is required")]
    [RegularExpression(@"^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$", ErrorMessage = "Start time must be in HH:mm format")]
    public string StartTime { get; set; } = string.Empty;

    /// <summary>
    /// End time in HH:mm format (e.g., "17:00")
    /// </summary>
    [Required(ErrorMessage = "End time is required")]
    [RegularExpression(@"^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$", ErrorMessage = "End time must be in HH:mm format")]
    public string EndTime { get; set; } = string.Empty;

    /// <summary>
    /// Day of week (0 = Sunday, 6 = Saturday)
    /// </summary>
    [Range(0, 6, ErrorMessage = "Day of week must be between 0 (Sunday) and 6 (Saturday)")]
    public int DayOfWeek { get; set; }

    /// <summary>
    /// Whether this time range is active
    /// </summary>
    public bool IsActive { get; set; } = true;
}

/// <summary>
/// DTO for permission request
/// </summary>
public class PermissionRequestDTO
{
    /// <summary>
    /// Unique identifier
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// User ID of the child making the request
    /// </summary>
    public int ChildUserId { get; set; }

    /// <summary>
    /// User ID of the parent who will approve/deny
    /// </summary>
    public int ParentUserId { get; set; }

    /// <summary>
    /// Type of permission being requested
    /// </summary>
    public string RequestType { get; set; } = string.Empty;

    /// <summary>
    /// Detailed description of what the child wants to do
    /// </summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Current status of the request
    /// </summary>
    public PermissionRequestStatus Status { get; set; }

    /// <summary>
    /// When the request was made
    /// </summary>
    public DateTime RequestedAt { get; set; }

    /// <summary>
    /// When the parent responded to the request
    /// </summary>
    public DateTime? RespondedAt { get; set; }

    /// <summary>
    /// Parent's response message
    /// </summary>
    public string? ResponseMessage { get; set; }

    /// <summary>
    /// When the request expires if not responded to
    /// </summary>
    public DateTime? ExpiresAt { get; set; }

    /// <summary>
    /// Child user information
    /// </summary>
    public UserDTO? Child { get; set; }

    /// <summary>
    /// Parent user information
    /// </summary>
    public UserDTO? Parent { get; set; }
}

/// <summary>
/// DTO for creating a permission request
/// </summary>
public class PermissionRequestCreateDTO
{
    /// <summary>
    /// Type of permission being requested
    /// </summary>
    [Required(ErrorMessage = "Request type is required")]
    [StringLength(100, ErrorMessage = "Request type cannot exceed 100 characters")]
    public string RequestType { get; set; } = string.Empty;

    /// <summary>
    /// Detailed description of what the child wants to do
    /// </summary>
    [Required(ErrorMessage = "Description is required")]
    [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters")]
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Optional expiration time for the request
    /// </summary>
    public DateTime? ExpiresAt { get; set; }
}

/// <summary>
/// DTO for responding to a permission request
/// </summary>
public class PermissionRequestResponseDTO
{
    /// <summary>
    /// Whether the request is approved (true) or denied (false)
    /// </summary>
    [Required(ErrorMessage = "Approval status is required")]
    public bool IsApproved { get; set; }

    /// <summary>
    /// Optional response message from the parent
    /// </summary>
    [StringLength(500, ErrorMessage = "Response message cannot exceed 500 characters")]
    public string? ResponseMessage { get; set; }
}

/// <summary>
/// DTO for bulk permission request operations
/// </summary>
public class BulkPermissionRequestResponseDTO
{
    /// <summary>
    /// List of request IDs to process
    /// </summary>
    [Required(ErrorMessage = "Request IDs are required")]
    [MinLength(1, ErrorMessage = "At least one request ID must be provided")]
    public List<int> RequestIds { get; set; } = new();

    /// <summary>
    /// Whether all requests are approved (true) or denied (false)
    /// </summary>
    [Required(ErrorMessage = "Approval status is required")]
    public bool IsApproved { get; set; }

    /// <summary>
    /// Optional response message from the parent
    /// </summary>
    [StringLength(500, ErrorMessage = "Response message cannot exceed 500 characters")]
    public string? ResponseMessage { get; set; }
}

/// <summary>
/// DTO for parental control summary/dashboard
/// </summary>
public class ParentalControlSummaryDTO
{
    /// <summary>
    /// Child user information
    /// </summary>
    public UserDTO Child { get; set; } = null!;

    /// <summary>
    /// Current parental control settings
    /// </summary>
    public ParentalControlDTO? Settings { get; set; }

    /// <summary>
    /// Number of pending permission requests
    /// </summary>
    public int PendingRequestsCount { get; set; }

    /// <summary>
    /// Child's screen time usage today (in minutes)
    /// </summary>
    public int TodayScreenTimeMinutes { get; set; }

    /// <summary>
    /// Child's remaining screen time today (in minutes)
    /// </summary>
    public int RemainingScreenTimeMinutes { get; set; }

    /// <summary>
    /// Whether the child is currently within allowed hours
    /// </summary>
    public bool IsWithinAllowedHours { get; set; }

    /// <summary>
    /// Recent permission requests (last 5)
    /// </summary>
    public List<PermissionRequestDTO> RecentRequests { get; set; } = new();
} 