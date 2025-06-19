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

namespace TaskTrackerAPI.DTOs.Family;

/// <summary>
/// DTO for real-time family activity events sent via SignalR
/// Used for family activity streams and notifications
/// </summary>
public class FamilyActivityEventDTO
{
    /// <summary>
    /// ID of the family this activity belongs to
    /// </summary>
    public int FamilyId { get; set; }

    /// <summary>
    /// ID of the user who performed the activity
    /// </summary>
    public int UserId { get; set; }

    /// <summary>
    /// Type of activity (task_completed, achievement_unlocked, etc.)
    /// </summary>
    public string ActivityType { get; set; } = string.Empty;

    /// <summary>
    /// Human-readable description of the activity
    /// </summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Points earned from this activity (if applicable)
    /// </summary>
    public int? PointsEarned { get; set; }

    /// <summary>
    /// When the activity occurred
    /// </summary>
    public DateTime Timestamp { get; set; }

    /// <summary>
    /// ID of related entity (task, achievement, etc.)
    /// </summary>
    public int? RelatedEntityId { get; set; }

    /// <summary>
    /// Type of related entity (task, achievement, challenge, etc.)
    /// </summary>
    public string? RelatedEntityType { get; set; }

    /// <summary>
    /// Priority level for activity importance
    /// </summary>
    public string? Priority { get; set; }

    /// <summary>
    /// Category for grouping activities
    /// </summary>
    public string? Category { get; set; }

    /// <summary>
    /// Display name of the user (for UI)
    /// </summary>
    public string? UserDisplayName { get; set; }

    /// <summary>
    /// Icon or emoji to display with the activity
    /// </summary>
    public string? ActivityIcon { get; set; }
} 