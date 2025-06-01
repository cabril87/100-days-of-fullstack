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
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Models.Gamification;
using TaskTrackerAPI.DTOs.Gamification;

namespace TaskTrackerAPI.Repositories.Interfaces
{
    public interface IGamificationRepository
    {
        // User Progress
        Task<UserProgress?> GetUserProgressAsync(int userId);
        Task<UserProgress> CreateUserProgressAsync(UserProgress userProgress);
        Task<UserProgress> UpdateUserProgressAsync(UserProgress userProgress);
        Task DeleteUserProgressAsync(int userId);

        // Point Transactions
        Task<PointTransaction> CreatePointTransactionAsync(PointTransaction transaction);
        Task<IEnumerable<PointTransaction>> GetUserPointTransactionsAsync(int userId, int limit = 100);
        Task<PointTransaction?> GetPointTransactionAsync(int transactionId);

        // Achievements
        Task<IEnumerable<Achievement>> GetAllAchievementsAsync();
        Task<IEnumerable<Achievement>> GetAvailableAchievementsAsync(int userId);
        Task<Achievement?> GetAchievementAsync(int achievementId);
        Task<UserAchievement?> GetUserAchievementAsync(int userId, int achievementId);
        Task<IEnumerable<UserAchievement>> GetUserAchievementsAsync(int userId);
        Task<UserAchievement> CreateUserAchievementAsync(UserAchievement userAchievement);

        // Badges
        Task<IEnumerable<Badge>> GetAllBadgesAsync();
        Task<Badge?> GetBadgeAsync(int badgeId);
        Task<IEnumerable<UserBadge>> GetUserBadgesAsync(int userId);
        Task<UserBadge?> GetUserBadgeAsync(int userId, int badgeId);
        Task<UserBadge> CreateUserBadgeAsync(UserBadge userBadge);
        Task<UserBadge> UpdateUserBadgeAsync(UserBadge userBadge);

        // Rewards
        Task<IEnumerable<Reward>> GetAvailableRewardsAsync(int userId);
        Task<Reward?> GetRewardAsync(int rewardId);
        Task<IEnumerable<UserReward>> GetUserRewardsAsync(int userId);
        Task<UserReward?> GetUserRewardAsync(int userRewardId);
        Task<UserReward> CreateUserRewardAsync(UserReward userReward);
        Task<UserReward> UpdateUserRewardAsync(UserReward userReward);

        // Challenges
        Task<IEnumerable<Challenge>> GetActiveChallengesAsync();
        Task<Challenge?> GetChallengeAsync(int challengeId);
        Task<IEnumerable<UserChallenge>> GetUserActiveChallengesAsync(int userId);
        Task<UserChallenge?> GetUserChallengeAsync(int userId, int challengeId);
        Task<UserChallenge> CreateUserChallengeAsync(UserChallenge userChallenge);
        Task<UserChallenge> UpdateUserChallengeAsync(UserChallenge userChallenge);
        Task DeleteUserChallengeAsync(int userId, int challengeId);

        // Statistics and Analytics
        Task<int> GetCompletedTasksCountAsync(int userId);
        Task<int> GetCompletedTasksCountByCategoryAsync(int userId, string category);
        Task<int> GetCompletedTasksByPriorityCountAsync(int userId, string priority);
        Task<int> GetTaskCompletionStreakAsync(int userId);
        Task<DateTime?> GetLastActivityDateAsync(int userId);
        Task<IEnumerable<TaskItem>> GetUserTasksAsync(int userId);
        Task<IEnumerable<TaskItem>> GetUserTasksCompletedInTimeRangeAsync(int userId, DateTime startDate, DateTime endDate);

        // Leaderboard and Rankings
        Task<IEnumerable<UserProgress>> GetTopUsersByPointsAsync(int limit = 10);
        Task<IEnumerable<UserProgress>> GetTopUsersByLevelAsync(int limit = 10);
        Task<IEnumerable<UserProgress>> GetTopUsersByStreakAsync(int limit = 10);
        Task<IEnumerable<UserProgress>> GetFamilyMembersLeaderboardAsync(int familyId, int limit = 10);

        // Additional methods needed by GamificationService
        Task<TaskItem?> GetTaskAsync(int taskId);
        void AddPointTransaction(PointTransaction transaction);
        Task<IEnumerable<PriorityMultiplier>> GetPriorityMultipliersAsync();
        Task<bool> HasDailyLoginTransactionAsync(int userId, DateTime date);
        Task<IEnumerable<PointTransaction>> GetTransactionsForDateRangeAsync(int userId, DateTime startDate, DateTime endDate);
        Task<IEnumerable<PointTransaction>> GetTransactionsByTypeAsync(int userId, string transactionType);
        Task<IEnumerable<ChallengeProgress>> GetUserChallengeProgressesAsync(int userId);
        Task<ChallengeProgress?> GetChallengeProgressAsync(int userId, int challengeId);
        Task<ChallengeProgress> CreateChallengeProgressAsync(ChallengeProgress progress);
        Task<ChallengeProgress> UpdateChallengeProgressAsync(ChallengeProgress progress);
        Task<IEnumerable<UserChallenge>> GetUserChallengesAsync(int userId);
        Task<bool> AnyUserAchievementAsync(int userId, int achievementId);
        Task<bool> AnyUserBadgeAsync(int userId, int badgeId);
        Task<bool> AnyUserRewardAsync(int userId, int rewardId);
        Task SaveChangesAsync();
        Task<List<Achievement>> GetLevelAchievementsAsync(int level);
        Task<List<Reward>> GetActiveRewardsAsync();
        void AddUserBadge(UserBadge userBadge);
        void AddUserReward(UserReward userReward);
        void RemoveChallengeProgress(ChallengeProgress progress);
        void RemoveUserChallenge(UserChallenge userChallenge);
        Task<List<int>> GetEnrolledChallengeIdsAsync(int userId);
        Task<List<Challenge>> GetAvailableChallengesAsync();
        Task<List<Challenge>> GetEnrolledChallengesAsync(int userId);
        Task<int> GetActiveChallengeCountAsync(int userId);
        void AddUserChallenge(UserChallenge userChallenge);
        void AddChallengeProgress(ChallengeProgress progress);
        Task<ChallengeProgress?> GetActiveChallengeProgressAsync(int userId);
        Task<List<int>> GetCompletedChallengeIdsAsync(int userId);
        Task<Challenge?> GetAvailableChallengeAsync(int userId);
        Task<List<TaskItem>> GetIncompleteTasksAsync(int userId);
        Task<int> GetUserAchievementsCountAsync(int userId);
        Task<int> GetUserBadgesCountAsync(int userId);
        Task<int> GetUserRewardsCountAsync(int userId);
        Task<List<UserProgress>> GetLeaderboardByPointsAsync(int limit);
        Task<List<UserProgress>> GetLeaderboardByStreakAsync(int limit);
        Task<List<TaskCountData>> GetUserTaskCountsAsync();
        Task<User?> GetUserAsync(int userId);
        Task<List<FamilyMember>> GetFamilyMembersAsync(int familyId);
        Task<List<UserProgress>> GetUserProgressByIdsAsync(List<int> userIds);
        
        // Additional comprehensive methods for GamificationService refactoring
        Task<bool> CheckUserBelongsToFamilyAsync(int userId, int familyId);
        Task<List<int>> GetFamilyMemberUserIdsAsync(int familyId);
        Task<List<UserSummaryDTO>> GetUsersByIdsAsync(List<int> userIds);
        Task<List<UserProgressDataDTO>> GetUserProgressDataByIdsAsync(List<int> userIds);
        Task<List<UserStreakDataDTO>> GetUserStreakDataByIdsAsync(List<int> userIds);
        Task<List<UserTaskCountDTO>> GetFamilyTaskCountsAsync(List<int> familyUserIds);
        Task<int> GetActiveDaysCountAsync(int userId, DateTime startDate);
        Task<List<CategoryCount>> GetCategoryCountsAsync(int userId);
        
        // Point transaction queries
        Task<List<PointTransaction>> GetPointTransactionsByTypeAndDateAsync(int userId, string transactionType, DateTime startDate, DateTime? endDate = null);
        Task<int> GetPointTransactionCountByTypeAsync(int userId, string transactionType);
        Task<int> GetPointTransactionCountByTypeAndDateAsync(int userId, string transactionType, DateTime startDate, DateTime? endDate = null);
        Task<PointTransaction?> GetLatestPointTransactionAsync(int userId, int? taskId = null);
        Task<bool> HasPointTransactionTodayAsync(int userId, string transactionType);
        Task<List<PointTransaction>> GetPointTransactionsByTimeOfDayAsync(int userId, TimeSpan startTime, TimeSpan endTime);
        Task<List<PointTransaction>> GetPointTransactionsByDateRangeAsync(int userId, DateTime startDate, DateTime endDate);
        Task<List<PointTransaction>> GetPointTransactionsWithTaskJoinAsync(int userId, DateTime? startDate = null);
        
        // Task queries
        Task<int> GetTaskCountByPriorityAsync(int userId, string priority);
        Task<int> GetTaskCountByCategoryAndDateAsync(int userId, string categoryName, DateTime startDate, DateTime endDate);
        Task<int> GetTaskCountByFamilyAsync(int userId, bool isCompleted = true);
        Task<int> GetTaskCountWithNotesAsync(int userId, int minLength = 0);
        Task<bool> HasTaskWithDetailedNotesAsync(int userId, int minLength = 100);
        Task<int> GetRecurringTaskCountAsync(int userId);
        Task<List<TaskItem>> GetTasksByCategoryAndDateAsync(int userId, List<int> categoryIds, DateTime date);
        Task<List<TaskItem>> GetTasksByPriorityAsync(int userId, List<string> priorities);
        
        // Category queries  
        Task<int> GetCategoryCountAsync(int userId);
        
        // Achievement & Badge & Reward queries
        Task<Achievement?> GetAchievementByCategoryAndNameAsync(string category, string namePattern);
        Task<List<Achievement>> GetAchievementsByCategoryAsync(string category);
        
        // Feature usage checks
        Task<bool> HasUserUsedTasksAsync(int userId);
        Task<bool> HasUserUsedCategoriesAsync(int userId);
        Task<bool> HasUserUsedFocusAsync(int userId);
        Task<bool> HasUserUsedFamilyAsync(int userId);
        Task<bool> HasUserUsedChallengesAsync(int userId);
        Task<bool> HasUserUsedRewardsAsync(int userId);
        Task<bool> HasUserUsedBoardsAsync(int userId);
        
        // Tag queries
        Task<int> GetUniqueTagsUsedCountAsync(int userId);
        
        // Challenge progress queries  
        Task<List<ChallengeProgress>> GetActiveChallengeProgressesWithIncludesAsync(int userId);
        
        // Admin/Reset methods
        Task<List<PointTransaction>> GetAllUserPointTransactionsAsync(int userId);
        Task<List<UserAchievement>> GetAllUserAchievementsAsync(int userId);
        Task<List<UserBadge>> GetAllUserBadgesAsync(int userId);
        Task<List<UserReward>> GetAllUserRewardsAsync(int userId);
        Task<List<ChallengeProgress>> GetAllUserChallengeProgressesAsync(int userId);
        Task<List<UserChallenge>> GetAllUserChallengesAsync(int userId);
        void RemoveRangePointTransactions(IEnumerable<PointTransaction> transactions);
        void RemoveRangeUserAchievements(IEnumerable<UserAchievement> achievements);
        void RemoveRangeUserBadges(IEnumerable<UserBadge> badges);
        void RemoveRangeUserRewards(IEnumerable<UserReward> rewards);
        void RemoveRangeUserChallenges(IEnumerable<UserChallenge> challenges);
        void AddUserProgress(UserProgress userProgress);
        
        // Count methods for stats
        Task<int> GetTotalPointTransactionCountAsync(int userId);
        Task<int> GetTotalUserAchievementCountAsync(int userId);
        Task<int> GetTotalUserBadgeCountAsync(int userId);
        Task<int> GetTotalUserRewardCountAsync(int userId);
        Task<int> GetTotalChallengeProgressCountAsync(int userId);
        
        // Focus session specific checks
        Task<bool> HasFocusSessionYesterdayAsync(int userId, DateTime yesterday);
    }

    // Helper classes for repository methods
    public class TaskCountData
    {
        public int? UserId { get; set; }
        public int Count { get; set; }
    }

    public class CategoryCount
    {
        public string Category { get; set; } = string.Empty;
        public int Count { get; set; }
    }
}