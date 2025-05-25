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
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.DTOs.Gamification;
using TaskTrackerAPI.Hubs;
using TaskTrackerAPI.Services.Interfaces;

namespace TaskTrackerAPI.Services;

/// <summary>
/// Service for delivering real-time gamification updates via SignalR
/// </summary>
public class GamificationRealTimeService : IGamificationRealTimeService
{
    private readonly IHubContext<GamificationHub> _gamificationHubContext;
    private readonly ILogger<GamificationRealTimeService> _logger;

    public GamificationRealTimeService(
        IHubContext<GamificationHub> gamificationHubContext,
        ILogger<GamificationRealTimeService> logger)
    {
        _gamificationHubContext = gamificationHubContext ?? throw new ArgumentNullException(nameof(gamificationHubContext));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <inheritdoc />
    public async Task SendPointsEarnedAsync(int userId, int points, string reason, int? relatedEntityId = null)
    {
        try
        {
            string userGroup = $"user-gamification-{userId}";
            object data = new
            {
                points,
                reason,
                userId,
                relatedEntityId
            };
            
            await _gamificationHubContext.Clients.Group(userGroup).SendAsync("PointsEarned", data);
            _logger.LogInformation("Sent points earned notification to user {UserId}: {Points} points for {Reason}", 
                userId, points, reason);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending points earned notification to user {UserId}", userId);
        }
    }

    /// <inheritdoc />
    public async Task SendAchievementUnlockedAsync(int userId, string achievementName, int achievementId, int points)
    {
        try
        {
            string userGroup = $"user-gamification-{userId}";
            object data = new
            {
                achievementName,
                achievementId,
                points,
                userId
            };
            
            await _gamificationHubContext.Clients.Group(userGroup).SendAsync("AchievementUnlocked", data);
            _logger.LogInformation("Sent achievement unlocked notification to user {UserId}: {AchievementName}", 
                userId, achievementName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending achievement unlocked notification to user {UserId}", userId);
        }
    }

    /// <inheritdoc />
    public async Task SendLevelUpAsync(int userId, int newLevel, int oldLevel)
    {
        try
        {
            string userGroup = $"user-gamification-{userId}";
            object data = new
            {
                newLevel,
                oldLevel,
                userId
            };
            
            await _gamificationHubContext.Clients.Group(userGroup).SendAsync("LevelUp", data);
            _logger.LogInformation("Sent level up notification to user {UserId}: Level {OldLevel} -> {NewLevel}", 
                userId, oldLevel, newLevel);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending level up notification to user {UserId}", userId);
        }
    }

    /// <inheritdoc />
    public async Task SendStreakUpdatedAsync(int userId, int currentStreak, bool isNewRecord)
    {
        try
        {
            string userGroup = $"user-gamification-{userId}";
            object data = new
            {
                currentStreak,
                isNewRecord,
                userId
            };
            
            await _gamificationHubContext.Clients.Group(userGroup).SendAsync("StreakUpdated", data);
            _logger.LogInformation("Sent streak updated notification to user {UserId}: {CurrentStreak} days", 
                userId, currentStreak);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending streak updated notification to user {UserId}", userId);
        }
    }

    /// <inheritdoc />
    public async Task SendBadgeEarnedAsync(int userId, string badgeName, int badgeId, string rarity)
    {
        try
        {
            string userGroup = $"user-gamification-{userId}";
            object data = new
            {
                badgeName,
                badgeId,
                rarity,
                userId
            };
            
            await _gamificationHubContext.Clients.Group(userGroup).SendAsync("BadgeEarned", data);
            _logger.LogInformation("Sent badge earned notification to user {UserId}: {BadgeName}", 
                userId, badgeName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending badge earned notification to user {UserId}", userId);
        }
    }

    /// <inheritdoc />
    public async Task SendChallengeProgressAsync(int userId, string challengeName, int progress, int target, bool isCompleted)
    {
        try
        {
            string userGroup = $"user-gamification-{userId}";
            object data = new
            {
                challengeName,
                progress,
                target,
                isCompleted,
                userId
            };
            
            await _gamificationHubContext.Clients.Group(userGroup).SendAsync("ChallengeProgress", data);
            _logger.LogInformation("Sent challenge progress notification to user {UserId}: {ChallengeName} {Progress}/{Target}", 
                userId, challengeName, progress, target);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending challenge progress notification to user {UserId}", userId);
        }
    }

    /// <inheritdoc />
    public async Task SendRewardRedeemedAsync(int userId, string rewardName, int pointsCost)
    {
        try
        {
            string userGroup = $"user-gamification-{userId}";
            object data = new
            {
                rewardName,
                pointsCost,
                userId
            };
            
            await _gamificationHubContext.Clients.Group(userGroup).SendAsync("RewardRedeemed", data);
            _logger.LogInformation("Sent reward redeemed notification to user {UserId}: {RewardName} for {PointsCost} points", 
                userId, rewardName, pointsCost);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending reward redeemed notification to user {UserId}", userId);
        }
    }

    /// <inheritdoc />
    public async Task SendGamificationUpdateAsync(int userId, object updateData)
    {
        try
        {
            string userGroup = $"user-gamification-{userId}";
            await _gamificationHubContext.Clients.Group(userGroup).SendAsync("GamificationUpdate", updateData);
            _logger.LogInformation("Sent general gamification update to user {UserId}", userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending gamification update to user {UserId}", userId);
        }
    }

    /// <inheritdoc />
    public async Task SendFamilyGamificationUpdateAsync(int familyId, object updateData)
    {
        try
        {
            string familyGroup = $"family-gamification-{familyId}";
            await _gamificationHubContext.Clients.Group(familyGroup).SendAsync("FamilyGamificationUpdate", updateData);
            _logger.LogInformation("Sent family gamification update to family {FamilyId}", familyId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending family gamification update to family {FamilyId}", familyId);
        }
    }
} 