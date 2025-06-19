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
/// DTO for real-time family milestone events sent via SignalR
/// Used for celebrating significant family achievements and progress
/// </summary>
public class FamilyMilestoneEventDTO
{
    /// <summary>
    /// ID of the family that achieved the milestone
    /// </summary>
    public int FamilyId { get; set; }

    /// <summary>
    /// Type of milestone (high_value_task_completion, family_streak, etc.)
    /// </summary>
    public string MilestoneType { get; set; } = string.Empty;

    /// <summary>
    /// Title of the milestone achievement
    /// </summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Detailed description of what was achieved
    /// </summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Points earned from this milestone (if applicable)
    /// </summary>
    public int? PointsEarned { get; set; }

    /// <summary>
    /// ID of the user who primarily achieved this milestone
    /// </summary>
    public int? AchievedByUserId { get; set; }

    /// <summary>
    /// When the milestone was achieved
    /// </summary>
    public DateTime Timestamp { get; set; }

    /// <summary>
    /// Celebration level (1-5, with 5 being the most exciting)
    /// </summary>
    public int CelebrationLevel { get; set; } = 3;

    /// <summary>
    /// Icon or emoji to display with the milestone
    /// </summary>
    public string? MilestoneIcon { get; set; }

    /// <summary>
    /// Color theme for the milestone celebration
    /// </summary>
    public string? ColorTheme { get; set; }

    /// <summary>
    /// Whether this milestone should trigger confetti
    /// </summary>
    public bool TriggerConfetti { get; set; } = true;

    /// <summary>
    /// Sound effect to play (optional)
    /// </summary>
    public string? SoundEffect { get; set; }
} 