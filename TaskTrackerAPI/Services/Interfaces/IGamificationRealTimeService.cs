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
using System.Threading.Tasks;

namespace TaskTrackerAPI.Services.Interfaces;

/// <summary>
/// Interface for delivering real-time gamification updates via SignalR
/// </summary>
public interface IGamificationRealTimeService
{
    /// <summary>
    /// Send points earned notification to a user
    /// </summary>
    Task SendPointsEarnedAsync(int userId, int points, string reason, int? relatedEntityId = null);

    /// <summary>
    /// Send achievement unlocked notification to a user
    /// </summary>
    Task SendAchievementUnlockedAsync(int userId, string achievementName, int achievementId, int points);

    /// <summary>
    /// Send level up notification to a user
    /// </summary>
    Task SendLevelUpAsync(int userId, int newLevel, int oldLevel);

    /// <summary>
    /// Send streak updated notification to a user
    /// </summary>
    Task SendStreakUpdatedAsync(int userId, int currentStreak, bool isNewRecord);

    /// <summary>
    /// Send badge earned notification to a user
    /// </summary>
    Task SendBadgeEarnedAsync(int userId, string badgeName, int badgeId, string rarity);

    /// <summary>
    /// Send challenge progress notification to a user
    /// </summary>
    Task SendChallengeProgressAsync(int userId, string challengeName, int progress, int target, bool isCompleted);

    /// <summary>
    /// Send reward redeemed notification to a user
    /// </summary>
    Task SendRewardRedeemedAsync(int userId, string rewardName, int pointsCost);

    /// <summary>
    /// Send general gamification update to a user
    /// </summary>
    Task SendGamificationUpdateAsync(int userId, object updateData);

    /// <summary>
    /// Send gamification update to all members of a family
    /// </summary>
    Task SendFamilyGamificationUpdateAsync(int familyId, object updateData);
} 