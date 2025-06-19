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

namespace TaskTrackerAPI.DTOs.Tasks;

/// <summary>
/// DTO for real-time task completion events sent via SignalR
/// Used for enhanced gamification and family notifications
/// </summary>
public class TaskCompletionEventDTO
{
    /// <summary>
    /// ID of the completed task
    /// </summary>
    public int TaskId { get; set; }

    /// <summary>
    /// Title of the completed task
    /// </summary>
    public string TaskTitle { get; set; } = string.Empty;

    /// <summary>
    /// Display name of the user who completed the task
    /// </summary>
    public string CompletedBy { get; set; } = string.Empty;

    /// <summary>
    /// ID of the user who completed the task
    /// </summary>
    public int CompletedByUserId { get; set; }

    /// <summary>
    /// Points earned for completing this task
    /// </summary>
    public int PointsEarned { get; set; }

    /// <summary>
    /// When the task was completed
    /// </summary>
    public DateTime CompletionTime { get; set; }

    /// <summary>
    /// Family ID if this is a family task
    /// </summary>
    public int? FamilyId { get; set; }

    /// <summary>
    /// Task category for achievement tracking
    /// </summary>
    public string Category { get; set; } = string.Empty;

    /// <summary>
    /// Task priority for celebration intensity
    /// </summary>
    public string Priority { get; set; } = string.Empty;

    /// <summary>
    /// Any achievement unlocked by this completion
    /// </summary>
    public string? AchievementUnlocked { get; set; }

    /// <summary>
    /// Whether this completion triggered a level up
    /// </summary>
    public bool TriggeredLevelUp { get; set; }

    /// <summary>
    /// New level if level up occurred
    /// </summary>
    public int? NewLevel { get; set; }
} 