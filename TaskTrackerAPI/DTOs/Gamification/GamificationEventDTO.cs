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

namespace TaskTrackerAPI.DTOs.Gamification;

/// <summary>
/// DTO for real-time gamification events sent via SignalR
/// </summary>
public class GamificationEventDTO
{
    /// <summary>
    /// Type of gamification event (PointsEarned, AchievementUnlocked, LevelUp, etc.)
    /// </summary>
    public string EventType { get; set; } = string.Empty;

    /// <summary>
    /// ID of the user receiving the event
    /// </summary>
    public int UserId { get; set; }

    /// <summary>
    /// Points earned or involved in the event
    /// </summary>
    public int? Points { get; set; }

    /// <summary>
    /// Reason for the event (e.g., "Task completed", "Daily streak")
    /// </summary>
    public string? Reason { get; set; }

    /// <summary>
    /// ID of related entity (task, challenge, etc.)
    /// </summary>
    public int? RelatedEntityId { get; set; }

    /// <summary>
    /// Achievement name for achievement events
    /// </summary>
    public string? AchievementName { get; set; }

    /// <summary>
    /// Achievement ID for achievement events
    /// </summary>
    public int? AchievementId { get; set; }

    /// <summary>
    /// New level for level up events
    /// </summary>
    public int? NewLevel { get; set; }

    /// <summary>
    /// Previous level for level up events
    /// </summary>
    public int? OldLevel { get; set; }

    /// <summary>
    /// Current streak count for streak events
    /// </summary>
    public int? CurrentStreak { get; set; }

    /// <summary>
    /// Whether the streak is a new record
    /// </summary>
    public bool? IsNewRecord { get; set; }

    /// <summary>
    /// Badge name for badge events
    /// </summary>
    public string? BadgeName { get; set; }

    /// <summary>
    /// Badge ID for badge events
    /// </summary>
    public int? BadgeId { get; set; }

    /// <summary>
    /// Badge rarity (Common, Rare, Epic, Legendary)
    /// </summary>
    public string? Rarity { get; set; }

    /// <summary>
    /// Challenge name for challenge events
    /// </summary>
    public string? ChallengeName { get; set; }

    /// <summary>
    /// Current progress for challenge events
    /// </summary>
    public int? Progress { get; set; }

    /// <summary>
    /// Target value for challenge events
    /// </summary>
    public int? Target { get; set; }

    /// <summary>
    /// Whether the challenge is completed
    /// </summary>
    public bool? IsCompleted { get; set; }

    /// <summary>
    /// Reward name for reward events
    /// </summary>
    public string? RewardName { get; set; }

    /// <summary>
    /// Points cost for reward events
    /// </summary>
    public int? PointsCost { get; set; }

    /// <summary>
    /// Timestamp when the event occurred
    /// </summary>
    public DateTime Timestamp { get; set; }
} 