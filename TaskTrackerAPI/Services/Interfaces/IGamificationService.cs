using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Services.Interfaces
{
    public interface IGamificationService
    {
        // User Progress
        Task<UserProgress> GetUserProgressAsync(int userId);
        Task<int> AddPointsAsync(int userId, int points, string transactionType, string description, int? taskId = null);
        Task UpdateStreakAsync(int userId);
        
        // Achievements
        Task<List<UserAchievement>> GetUserAchievementsAsync(int userId);
        Task<List<Achievement>> GetAvailableAchievementsAsync(int userId);
        Task<UserAchievement> UnlockAchievementAsync(int userId, int achievementId);
        
        // Badges
        Task<List<UserBadge>> GetUserBadgesAsync(int userId);
        Task<UserBadge> AwardBadgeAsync(int userId, int badgeId);
        Task<bool> ToggleBadgeDisplayAsync(int userId, int badgeId, bool isDisplayed);
        
        // Rewards
        Task<List<Reward>> GetAvailableRewardsAsync(int userId);
        Task<UserReward> RedeemRewardAsync(int userId, int rewardId);
        Task<bool> UseRewardAsync(int userRewardId);
        
        // Challenges
        Task<List<Challenge>> GetActiveChallengesAsync(int userId);
        Task<UserChallenge> EnrollInChallengeAsync(int userId, int challengeId);
        Task ProcessChallengeProgressAsync(int userId, string activityType, int relatedEntityId);
        Task<Challenge?> GetChallengeForUserAsync(int userId);
        Task<ChallengeProgress> GetChallengeProgressAsync(int userId, int challengeId);
        Task<ChallengeProgress> UnlockChallengeAsync(int userId, int challengeId);
        
        // Daily Login
        Task<PointTransaction> ProcessDailyLoginAsync(int userId);
        Task<bool> HasUserLoggedInTodayAsync(int userId);
        Task<LoginStatus> GetDailyLoginStatusAsync(int userId);
        
        // Suggestions and Stats
        Task<List<GamificationSuggestion>> GetGamificationSuggestionsAsync(int userId);
        Task<GamificationStats> GetGamificationStatsAsync(int userId);
        Task<List<LeaderboardEntry>> GetLeaderboardAsync(string category, int limit = 10);
        Task<List<PriorityMultiplier>> GetPointMultipliersAsync();
        
        // Transaction
        Task<PointTransaction> GetTransactionAsync(int transactionId);
    }
} 