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
using System.Threading.Tasks;
using TaskTrackerAPI.DTOs.Gamification;

namespace TaskTrackerAPI.Services.Interfaces
{
    public interface IGamificationService
    {
        // User Progress
        Task<UserProgressDTO> GetUserProgressAsync(int userId);
        Task<int> AddPointsAsync(int userId, int points, string transactionType, string description, int? taskId = null);
        Task UpdateStreakAsync(int userId);
        
        // Achievements
        Task<List<UserAchievementDTO>> GetUserAchievementsAsync(int userId);
        Task<List<AchievementDTO>> GetAvailableAchievementsAsync(int userId);
        Task<UserAchievementDTO> UnlockAchievementAsync(int userId, int achievementId);
        
        // Badges
        Task<List<UserBadgeDTO>> GetUserBadgesAsync(int userId);
        Task<UserBadgeDTO> AwardBadgeAsync(int userId, int badgeId);
        Task<bool> ToggleBadgeDisplayAsync(int userId, int badgeId, bool isDisplayed);
        
        // Rewards
        Task<List<RewardDTO>> GetAvailableRewardsAsync(int userId);
        Task<UserRewardDTO> RedeemRewardAsync(int userId, int rewardId);
        Task<bool> UseRewardAsync(int userRewardId);
        
        // Challenges
        Task<List<ChallengeDTO>> GetActiveChallengesAsync(int userId);
        Task<List<UserActiveChallengeDTO>> GetUserActiveChallengesAsync(int userId);
        Task<UserChallengeDTO> EnrollInChallengeAsync(int userId, int challengeId);
        Task<bool> LeaveChallengeAsync(int userId, int challengeId);
        Task ProcessChallengeProgressAsync(int userId, string activityType, int relatedEntityId);
        Task<ChallengeDTO?> GetChallengeForUserAsync(int userId);
        Task<ChallengeProgressDTO> GetChallengeProgressAsync(int userId, int challengeId);
        Task<ChallengeProgressDTO> UnlockChallengeAsync(int userId, int challengeId);
        
        // Daily Login
        Task<PointTransactionDTO> ProcessDailyLoginAsync(int userId);
        Task<bool> HasUserLoggedInTodayAsync(int userId);
        Task<DailyLoginStatusDetailDTO> GetDailyLoginStatusAsync(int userId);
        
        // Suggestions and Stats
        Task<List<GamificationSuggestionDetailDTO>> GetGamificationSuggestionsAsync(int userId);
        Task<GamificationStatsDTO> GetGamificationStatsAsync(int userId);
        Task<List<LeaderboardEntryDTO>> GetLeaderboardAsync(string category, int limit = 10);
        Task<List<LeaderboardEntryDTO>> GetFamilyMembersLeaderboardAsync(int userId, string category, int limit = 10);
        Task<List<LeaderboardEntryDTO>> GetSpecificFamilyLeaderboardAsync(int userId, int familyId, string category, int limit = 10);
        Task<List<PriorityMultiplierDTO>> GetPointMultipliersAsync();
        
        // Character System
        Task<bool> SwitchCharacterClassAsync(int userId, string characterClass);
        Task<bool> UnlockCharacterClassAsync(int userId, string characterClass);
        Task<string[]> GetUnlockedCharactersAsync(int userId);
        Task<bool> AddCharacterXPAsync(int userId, int xp);
        
        // Focus Mode Integration
        Task<FocusCompletionRewardDTO> ProcessFocusSessionCompletionAsync(int userId, int sessionId, int durationMinutes, bool wasCompleted);
        
        // Tier System
        Task<TierProgressDTO> GetTierProgressAsync(int userId);
        Task<bool> UpdateUserTierAsync(int userId);
        
        // Transaction
        Task<PointTransactionDTO> GetTransactionAsync(int transactionId);
        
        // Point Calculation Methods
        Task<int> CalculateTaskCompletionPointsAsync(int userId, int taskId, string difficulty = "Medium", string priority = "Medium", DateTime? dueDate = null, bool isCollaborative = false);
        Task<int> CalculateFocusSessionPointsAsync(int userId, int durationMinutes, bool wasCompleted);
        Task<int> CalculateAdvancedDailyLoginPointsAsync(int userId);
        int CalculateAchievementPoints(string tier, string difficulty = "Medium");
        int CalculateBadgePoints(string rarity, string tier = "bronze");

        // Admin Testing Methods (Admin only)
        Task<bool> ResetUserGamificationDataAsync(int userId);
        Task<GamificationResetStatsDTO> GetResetStatsAsync(int userId);
    }
} 