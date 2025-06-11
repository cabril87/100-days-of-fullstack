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
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TaskTrackerAPI.Data;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Models.Gamification;
using TaskTrackerAPI.Repositories.Interfaces;
using TaskTrackerAPI.DTOs.Gamification;
using TaskTrackerAPI.DTOs;

namespace TaskTrackerAPI.Repositories
{
    public class GamificationRepository : IGamificationRepository
    {
        private readonly ApplicationDbContext _context;

        public GamificationRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        #region User Progress

        public async Task<UserProgress?> GetUserProgressAsync(int userId)
        {
            return await _context.UserProgresses
                .FirstOrDefaultAsync(up => up.UserId == userId);
        }

        public async Task<UserProgress> CreateUserProgressAsync(UserProgress userProgress)
        {
            _context.UserProgresses.Add(userProgress);
            await _context.SaveChangesAsync();
            return userProgress;
        }

        public async Task<UserProgress> UpdateUserProgressAsync(UserProgress userProgress)
        {
            _context.UserProgresses.Update(userProgress);
            await _context.SaveChangesAsync();
            return userProgress;
        }

        public async Task DeleteUserProgressAsync(int userId)
        {
            var userProgress = await GetUserProgressAsync(userId);
            if (userProgress != null)
            {
                _context.UserProgresses.Remove(userProgress);
                await _context.SaveChangesAsync();
            }
        }

        #endregion

        #region Point Transactions

        public async Task<PointTransaction> CreatePointTransactionAsync(PointTransaction transaction)
        {
            _context.PointTransactions.Add(transaction);
            await _context.SaveChangesAsync();
            return transaction;
        }

        public async Task<IEnumerable<PointTransaction>> GetUserPointTransactionsAsync(int userId, int limit = 100)
        {
            return await _context.PointTransactions
                .Where(pt => pt.UserId == userId)
                .OrderByDescending(pt => pt.CreatedAt)
                .Take(limit)
                .ToListAsync();
        }

        public async Task<PointTransaction?> GetPointTransactionAsync(int transactionId)
        {
            return await _context.PointTransactions
                .FirstOrDefaultAsync(pt => pt.Id == transactionId);
        }

        #endregion

        #region Achievements

        public async Task<IEnumerable<Achievement>> GetAllAchievementsAsync()
        {
            return await _context.Achievements.ToListAsync();
        }

        public async Task<IEnumerable<Achievement>> GetAvailableAchievementsAsync(int userId)
        {
            var userAchievementIds = await _context.UserAchievements
                .Where(ua => ua.UserId == userId)
                .Select(ua => ua.AchievementId)
                .ToListAsync();

            return await _context.Achievements
                .Where(a => !userAchievementIds.Contains(a.Id))
                .ToListAsync();
        }

        public async Task<Achievement?> GetAchievementAsync(int achievementId)
        {
            return await _context.Achievements
                .FirstOrDefaultAsync(a => a.Id == achievementId);
        }

        public async Task<UserAchievement?> GetUserAchievementAsync(int userId, int achievementId)
        {
            return await _context.UserAchievements
                .Include(ua => ua.Achievement)
                .FirstOrDefaultAsync(ua => ua.UserId == userId && ua.AchievementId == achievementId);
        }

        public async Task<IEnumerable<UserAchievement>> GetUserAchievementsAsync(int userId)
        {
            return await _context.UserAchievements
                .Include(ua => ua.Achievement)
                .Where(ua => ua.UserId == userId)
                .OrderByDescending(ua => ua.CompletedAt)
                .ToListAsync();
        }

        public async Task<UserAchievement> CreateUserAchievementAsync(UserAchievement userAchievement)
        {
            _context.UserAchievements.Add(userAchievement);
            await _context.SaveChangesAsync();
            return userAchievement;
        }

        #endregion

        #region Badges

        public async Task<IEnumerable<Badge>> GetAllBadgesAsync()
        {
            return await _context.Badges.ToListAsync();
        }

        public async Task<Badge?> GetBadgeAsync(int badgeId)
        {
            return await _context.Badges
                .FirstOrDefaultAsync(b => b.Id == badgeId);
        }

        public async Task<IEnumerable<UserBadge>> GetUserBadgesAsync(int userId)
        {
            return await _context.UserBadges
                .Include(ub => ub.Badge)
                .Where(ub => ub.UserId == userId)
                .OrderByDescending(ub => ub.AwardedAt)
                .ToListAsync();
        }

        public async Task<UserBadge?> GetUserBadgeAsync(int userId, int badgeId)
        {
            return await _context.UserBadges
                .Include(ub => ub.Badge)
                .FirstOrDefaultAsync(ub => ub.UserId == userId && ub.BadgeId == badgeId);
        }

        public async Task<UserBadge> CreateUserBadgeAsync(UserBadge userBadge)
        {
            _context.UserBadges.Add(userBadge);
            await _context.SaveChangesAsync();
            return userBadge;
        }

        public async Task<UserBadge> UpdateUserBadgeAsync(UserBadge userBadge)
        {
            _context.UserBadges.Update(userBadge);
            await _context.SaveChangesAsync();
            return userBadge;
        }

        #endregion

        #region Rewards

        public async Task<IEnumerable<Reward>> GetAvailableRewardsAsync(int userId)
        {
            var userProgress = await GetUserProgressAsync(userId);
            int userPoints = userProgress?.CurrentPoints ?? 0;

            return await _context.Rewards
                .Where(r => r.PointCost <= userPoints)
                .OrderBy(r => r.PointCost)
                .ToListAsync();
        }

        public async Task<Reward?> GetRewardAsync(int rewardId)
        {
            return await _context.Rewards
                .FirstOrDefaultAsync(r => r.Id == rewardId);
        }

        public async Task<IEnumerable<UserReward>> GetUserRewardsAsync(int userId)
        {
            return await _context.UserRewards
                .Include(ur => ur.Reward)
                .Where(ur => ur.UserId == userId)
                .OrderByDescending(ur => ur.RedeemedAt)
                .ToListAsync();
        }

        public async Task<UserReward?> GetUserRewardAsync(int userRewardId)
        {
            return await _context.UserRewards
                .Include(ur => ur.Reward)
                .FirstOrDefaultAsync(ur => ur.Id == userRewardId);
        }

        public async Task<UserReward> CreateUserRewardAsync(UserReward userReward)
        {
            _context.UserRewards.Add(userReward);
            await _context.SaveChangesAsync();
            return userReward;
        }

        public async Task<UserReward> UpdateUserRewardAsync(UserReward userReward)
        {
            _context.UserRewards.Update(userReward);
            await _context.SaveChangesAsync();
            return userReward;
        }

        #endregion

        #region Challenges

        public async Task<IEnumerable<Challenge>> GetActiveChallengesAsync()
        {
            return await _context.Challenges
                .Where(c => c.IsActive && c.StartDate <= DateTime.UtcNow && c.EndDate >= DateTime.UtcNow)
                .ToListAsync();
        }

        public async Task<Challenge?> GetChallengeAsync(int challengeId)
        {
            return await _context.Challenges
                .FirstOrDefaultAsync(c => c.Id == challengeId);
        }

        public async Task<IEnumerable<UserChallenge>> GetUserActiveChallengesAsync(int userId)
        {
            return await _context.UserChallenges
                .Include(uc => uc.Challenge)
                .Where(uc => uc.UserId == userId && uc.Challenge != null && uc.Challenge.IsActive)
                .ToListAsync();
        }

        public async Task<UserChallenge?> GetUserChallengeAsync(int userId, int challengeId)
        {
            return await _context.UserChallenges
                .Include(uc => uc.Challenge)
                .FirstOrDefaultAsync(uc => uc.UserId == userId && uc.ChallengeId == challengeId);
        }

        public async Task<UserChallenge> CreateUserChallengeAsync(UserChallenge userChallenge)
        {
            _context.UserChallenges.Add(userChallenge);
            await _context.SaveChangesAsync();
            return userChallenge;
        }

        public async Task<UserChallenge> UpdateUserChallengeAsync(UserChallenge userChallenge)
        {
            _context.UserChallenges.Update(userChallenge);
            await _context.SaveChangesAsync();
            return userChallenge;
        }

        public async Task DeleteUserChallengeAsync(int userId, int challengeId)
        {
            var userChallenge = await GetUserChallengeAsync(userId, challengeId);
            if (userChallenge != null)
            {
                _context.UserChallenges.Remove(userChallenge);
                await _context.SaveChangesAsync();
            }
        }

        #endregion

        #region Statistics and Analytics

        public async Task<int> GetCompletedTasksCountAsync(int userId)
        {
            return await _context.Tasks
                .Where(t => t.UserId == userId && t.CompletedAt != null)
                .CountAsync();
        }

        public async Task<int> GetCompletedTasksCountByCategoryAsync(int userId, string category)
        {
            return await _context.Tasks
                .Where(t => t.UserId == userId && t.CompletedAt != null && t.Category!.Name == category)
                .CountAsync();
        }

        public async Task<int> GetCompletedTasksByPriorityCountAsync(int userId, string priority)
        {
            return await _context.Tasks
                .Where(t => t.UserId == userId && t.CompletedAt != null && t.Priority == priority)
                .CountAsync();
        }

        public async Task<int> GetTaskCompletionStreakAsync(int userId)
        {
            var completions = await _context.Tasks
                .Where(t => t.UserId == userId && t.CompletedAt != null)
                .OrderByDescending(t => t.CompletedAt)
                .Select(t => t.CompletedAt!.Value.Date)
                .Distinct()
                .ToListAsync();

            int streak = 0;
            DateTime? previousDate = null;

            foreach (var date in completions)
            {
                if (previousDate == null || previousDate.Value.AddDays(-1) == date)
                {
                    streak++;
                    previousDate = date;
                }
                else
                {
                    break;
                }
            }

            return streak;
        }

        public async Task<DateTime?> GetLastActivityDateAsync(int userId)
        {
            var lastTaskCompletion = await _context.Tasks
                .Where(t => t.UserId == userId && t.CompletedAt != null)
                .OrderByDescending(t => t.CompletedAt)
                .Select(t => t.CompletedAt)
                .FirstOrDefaultAsync();

            var lastFocusSession = await _context.FocusSessions
                .Where(fs => fs.UserId == userId)
                .OrderByDescending(fs => fs.StartTime)
                .Select(fs => (DateTime?)fs.StartTime)
                .FirstOrDefaultAsync();

            if (lastTaskCompletion.HasValue && lastFocusSession.HasValue)
            {
                return lastTaskCompletion > lastFocusSession ? lastTaskCompletion : lastFocusSession;
            }

            return lastTaskCompletion ?? lastFocusSession;
        }

        public async Task<IEnumerable<TaskItem>> GetUserTasksAsync(int userId)
        {
            return await _context.Tasks
                .Where(t => t.UserId == userId)
                .Include(t => t.Category)
                .Include(t => t.TaskTags!).ThenInclude(tt => tt.Tag)
                .ToListAsync();
        }

        public async Task<IEnumerable<TaskItem>> GetUserTasksCompletedInTimeRangeAsync(int userId, DateTime startDate, DateTime endDate)
        {
            return await _context.Tasks
                .Where(t => t.UserId == userId && t.CompletedAt != null && 
                           t.CompletedAt >= startDate && t.CompletedAt <= endDate)
                .Include(t => t.Category)
                .Include(t => t.TaskTags!).ThenInclude(tt => tt.Tag)
                .ToListAsync();
        }

        #endregion

        #region Leaderboard and Rankings

        public async Task<IEnumerable<UserProgress>> GetTopUsersByPointsAsync(int limit = 10)
        {
            return await _context.UserProgresses
                .OrderByDescending(up => up.TotalPointsEarned)
                .Take(limit)
                .ToListAsync();
        }

        public async Task<IEnumerable<UserProgress>> GetTopUsersByLevelAsync(int limit = 10)
        {
            return await _context.UserProgresses
                .OrderByDescending(up => up.Level)
                .ThenByDescending(up => up.CurrentPoints)
                .Take(limit)
                .ToListAsync();
        }

        public async Task<IEnumerable<UserProgress>> GetTopUsersByStreakAsync(int limit = 10)
        {
            return await _context.UserProgresses
                .OrderByDescending(up => up.CurrentStreak)
                .Take(limit)
                .ToListAsync();
        }

        public async Task<IEnumerable<UserProgress>> GetFamilyMembersLeaderboardAsync(int familyId, int limit = 10)
        {
            var familyUserIds = await _context.FamilyMembers
                .Where(fm => fm.FamilyId == familyId)
                .Select(fm => fm.UserId)
                .ToListAsync();

            return await _context.UserProgresses
                .Where(up => familyUserIds.Contains(up.UserId))
                .OrderByDescending(up => up.TotalPointsEarned)
                .Take(limit)
                .ToListAsync();
        }

        #endregion

        #region Additional Methods for GamificationService

        public async Task<TaskItem?> GetTaskAsync(int taskId)
        {
            return await _context.Tasks
                .Include(t => t.Category)
                .Include(t => t.TaskTags!).ThenInclude(tt => tt.Tag)
                .FirstOrDefaultAsync(t => t.Id == taskId);
        }

        public void AddPointTransaction(PointTransaction transaction)
        {
            _context.PointTransactions.Add(transaction);
        }

        public async Task<IEnumerable<PriorityMultiplier>> GetPriorityMultipliersAsync()
        {
            return await _context.PriorityMultipliers.ToListAsync();
        }

        public async Task<bool> HasDailyLoginTransactionAsync(int userId, DateTime date)
        {
            return await _context.PointTransactions
                .AnyAsync(pt => pt.UserId == userId && 
                               pt.TransactionType == "daily_login" && 
                               pt.CreatedAt.Date == date.Date);
        }

        public async Task<IEnumerable<PointTransaction>> GetTransactionsForDateRangeAsync(int userId, DateTime startDate, DateTime endDate)
        {
            return await _context.PointTransactions
                .Where(pt => pt.UserId == userId && 
                           pt.CreatedAt >= startDate && 
                           pt.CreatedAt <= endDate)
                .OrderByDescending(pt => pt.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<PointTransaction>> GetTransactionsByTypeAsync(int userId, string transactionType)
        {
            return await _context.PointTransactions
                .Where(pt => pt.UserId == userId && pt.TransactionType == transactionType)
                .OrderByDescending(pt => pt.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<ChallengeProgress>> GetUserChallengeProgressesAsync(int userId)
        {
            return await _context.ChallengeProgresses
                .Include(cp => cp.Challenge)
                .Where(cp => cp.UserId == userId)
                .ToListAsync();
        }

        public async Task<ChallengeProgress?> GetChallengeProgressAsync(int userId, int challengeId)
        {
            return await _context.ChallengeProgresses
                .Include(cp => cp.Challenge)
                .FirstOrDefaultAsync(cp => cp.UserId == userId && cp.ChallengeId == challengeId);
        }

        public async Task<ChallengeProgress> CreateChallengeProgressAsync(ChallengeProgress progress)
        {
            _context.ChallengeProgresses.Add(progress);
            await _context.SaveChangesAsync();
            return progress;
        }

        public async Task<ChallengeProgress> UpdateChallengeProgressAsync(ChallengeProgress progress)
        {
            _context.ChallengeProgresses.Update(progress);
            await _context.SaveChangesAsync();
            return progress;
        }

        public async Task<IEnumerable<UserChallenge>> GetUserChallengesAsync(int userId)
        {
            return await _context.UserChallenges
                .Include(uc => uc.Challenge)
                .Where(uc => uc.UserId == userId)
                .ToListAsync();
        }

        public async Task<bool> AnyUserAchievementAsync(int userId, int achievementId)
        {
            return await _context.UserAchievements
                .AnyAsync(ua => ua.UserId == userId && ua.AchievementId == achievementId);
        }

        public async Task<bool> AnyUserBadgeAsync(int userId, int badgeId)
        {
            return await _context.UserBadges
                .AnyAsync(ub => ub.UserId == userId && ub.BadgeId == badgeId);
        }

        public async Task<bool> AnyUserRewardAsync(int userId, int rewardId)
        {
            return await _context.UserRewards
                .AnyAsync(ur => ur.UserId == userId && ur.RewardId == rewardId);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
        public async Task<List<Achievement>> GetLevelAchievementsAsync(int level)
        {
            return await _context.Achievements
                .Where(a => a.Category == "Level")
                .ToListAsync();
        }

        public async Task<List<Reward>> GetActiveRewardsAsync()
        {
            return await _context.Rewards
                .Where(r => r.IsActive)
                .OrderBy(r => r.MinimumLevel)
                .ThenBy(r => r.PointCost)
                .ToListAsync();
        }

        public void AddUserBadge(UserBadge userBadge)
        {
            _context.UserBadges.Add(userBadge);
        }

        public void AddUserReward(UserReward userReward)
        {
            _context.UserRewards.Add(userReward);
        }

        public void RemoveChallengeProgress(ChallengeProgress progress)
        {
            _context.ChallengeProgresses.Remove(progress);
        }

        public void RemoveUserChallenge(UserChallenge userChallenge)
        {
            _context.UserChallenges.Remove(userChallenge);
        }

        public async Task<List<int>> GetEnrolledChallengeIdsAsync(int userId)
        {
            return await _context.ChallengeProgresses
                .Where(cp => cp.UserId == userId && !cp.IsCompleted)
                .Select(cp => cp.ChallengeId)
                .ToListAsync();
        }

        public async Task<List<Challenge>> GetAvailableChallengesAsync()
        {
            return await _context.Challenges
                .Where(c => c.IsActive)
                .ToListAsync();
        }

        public async Task<List<Challenge>> GetEnrolledChallengesAsync(int userId)
        {
            var enrolledIds = await GetEnrolledChallengeIdsAsync(userId);
            return await _context.Challenges
                .Where(c => enrolledIds.Contains(c.Id))
                .ToListAsync();
        }

        public async Task<int> GetActiveChallengeCountAsync(int userId)
        {
            return await _context.ChallengeProgresses
                .CountAsync(cp => cp.UserId == userId && !cp.IsCompleted);
        }

        public void AddUserChallenge(UserChallenge userChallenge)
        {
            _context.UserChallenges.Add(userChallenge);
        }

        public void AddChallengeProgress(ChallengeProgress progress)
        {
            _context.ChallengeProgresses.Add(progress);
        }

        public async Task<ChallengeProgress?> GetActiveChallengeProgressAsync(int userId)
        {
            return await _context.ChallengeProgresses
                .Where(cp => cp.UserId == userId && !cp.IsCompleted)
                .FirstOrDefaultAsync();
        }

        public async Task<List<int>> GetCompletedChallengeIdsAsync(int userId)
        {
            return await _context.ChallengeProgresses
                .Where(cp => cp.UserId == userId && cp.IsCompleted)
                .Select(cp => cp.ChallengeId)
                .ToListAsync();
        }

        public async Task<Challenge?> GetAvailableChallengeAsync(int userId)
        {
            var completedIds = await GetCompletedChallengeIdsAsync(userId);
            return await _context.Challenges
                .Where(c => c.IsActive && !completedIds.Contains(c.Id))
                .OrderBy(c => c.Difficulty)
                .FirstOrDefaultAsync();
        }
        public async Task<List<TaskItem>> GetIncompleteTasksAsync(int userId)
        {
            return await _context.Tasks
                .Where(t => t.AssignedToId == userId && !t.IsCompleted)
                .Include(t => t.Category)
                .Include(t => t.TaskTags!).ThenInclude(tt => tt.Tag)
                .ToListAsync();
        }

        public async Task<int> GetUserAchievementsCountAsync(int userId)
        {
            return await _context.UserAchievements
                .CountAsync(ua => ua.UserId == userId);
        }

        public async Task<int> GetUserBadgesCountAsync(int userId)
        {
            return await _context.UserBadges
                .CountAsync(ub => ub.UserId == userId);
        }

        public async Task<int> GetUserRewardsCountAsync(int userId)
        {
            return await _context.UserRewards
                .CountAsync(ur => ur.UserId == userId);
        }

        public async Task<List<UserProgress>> GetLeaderboardByPointsAsync(int limit)
        {
            return await _context.UserProgresses
                .OrderByDescending(up => up.TotalPointsEarned)
                .Take(limit)
                .ToListAsync();
        }

        public async Task<List<UserProgress>> GetLeaderboardByStreakAsync(int limit)
        {
            return await _context.UserProgresses
                .OrderByDescending(up => up.CurrentStreak)
                .Take(limit)
                .ToListAsync();
        }

        #endregion

        #region Additional Leaderboard Methods

        public async Task<List<TaskCountData>> GetUserTaskCountsAsync()
        {
            return await _context.Tasks
                .Where(t => t.IsCompleted && t.AssignedToId.HasValue)
                .GroupBy(t => t.AssignedToId)
                .Select(g => new TaskCountData { UserId = g.Key, Count = g.Count() })
                .ToListAsync();
        }

        public async Task<User?> GetUserAsync(int userId)
        {
            return await _context.Users.FindAsync(userId);
        }

        public async Task<List<FamilyMember>> GetFamilyMembersAsync(int familyId)
        {
            return await _context.FamilyMembers
                .Where(fm => fm.FamilyId == familyId)
                .ToListAsync();
        }

        public async Task<List<UserProgress>> GetUserProgressByIdsAsync(List<int> userIds)
        {
            return await _context.UserProgresses
                .Where(up => userIds.Contains(up.UserId))
                .ToListAsync();
        }

        #endregion

        #region Comprehensive GamificationService Support Methods

        // Family-related methods
        public async Task<bool> CheckUserBelongsToFamilyAsync(int userId, int familyId)
        {
            return await _context.FamilyMembers
                .AnyAsync(fm => fm.UserId == userId && fm.FamilyId == familyId);
        }

        public async Task<List<int>> GetFamilyMemberUserIdsAsync(int familyId)
        {
            return await _context.FamilyMembers
                .Where(fm => fm.FamilyId == familyId)
                .Select(fm => fm.UserId)
                .Distinct()
                .ToListAsync();
        }

        public async Task<List<UserSummaryDTO>> GetUsersByIdsAsync(List<int> userIds)
        {
            return await _context.Users
                .Where(u => userIds.Contains(u.Id))
                .Select(u => new UserSummaryDTO { Id = u.Id, Username = u.Username ?? "Unknown" })
                .ToListAsync();
        }

        public async Task<List<UserProgressDataDTO>> GetUserProgressDataByIdsAsync(List<int> userIds)
        {
            return await _context.UserProgresses
                .Where(up => userIds.Contains(up.UserId))
                .Select(up => new UserProgressDataDTO { UserId = up.UserId, TotalPointsEarned = up.TotalPointsEarned })
                .ToListAsync();
        }

        public async Task<List<UserStreakDataDTO>> GetUserStreakDataByIdsAsync(List<int> userIds)
        {
            return await _context.UserProgresses
                .Where(up => userIds.Contains(up.UserId))
                .Select(up => new UserStreakDataDTO { UserId = up.UserId, CurrentStreak = up.CurrentStreak })
                .ToListAsync();
        }

        public async Task<List<UserTaskCountDTO>> GetFamilyTaskCountsAsync(List<int> familyUserIds)
        {
            return await _context.Tasks
                .Where(t => t.IsCompleted && t.AssignedToId.HasValue && familyUserIds.Contains(t.AssignedToId.Value))
                .GroupBy(t => t.AssignedToId)
                .Select(g => new UserTaskCountDTO { UserId = g.Key!.Value, Count = g.Count() })
                .ToListAsync();
        }

        public async Task<int> GetActiveDaysCountAsync(int userId, DateTime startDate)
        {
            return await _context.PointTransactions
                .Where(pt => pt.UserId == userId && pt.CreatedAt >= startDate)
                .Select(pt => pt.CreatedAt.Date)
                .Distinct()
                .CountAsync();
        }

        public async Task<List<CategoryCount>> GetCategoryCountsAsync(int userId)
        {
            return await _context.Tasks
                .Where(t => t.AssignedToId == userId && t.IsCompleted)
                .GroupBy(t => t.Category != null ? t.Category.Name : "Uncategorized")
                .Select(g => new CategoryCount { Category = g.Key, Count = g.Count() })
                .ToListAsync();
        }

        // Point transaction queries
        public async Task<List<PointTransaction>> GetPointTransactionsByTypeAndDateAsync(int userId, string transactionType, DateTime startDate, DateTime? endDate = null)
        {
            var query = _context.PointTransactions
                .Where(pt => pt.UserId == userId && pt.TransactionType == transactionType && pt.CreatedAt >= startDate);

            if (endDate.HasValue)
                query = query.Where(pt => pt.CreatedAt < endDate.Value);

            return await query.OrderByDescending(pt => pt.CreatedAt).ToListAsync();
        }

        public async Task<int> GetPointTransactionCountByTypeAsync(int userId, string transactionType)
        {
            return await _context.PointTransactions
                .CountAsync(pt => pt.UserId == userId && pt.TransactionType == transactionType);
        }

        public async Task<int> GetPointTransactionCountByTypeAndDateAsync(int userId, string transactionType, DateTime startDate, DateTime? endDate = null)
        {
            var query = _context.PointTransactions
                .Where(pt => pt.UserId == userId && pt.TransactionType == transactionType && pt.CreatedAt >= startDate);

            if (endDate.HasValue)
                query = query.Where(pt => pt.CreatedAt < endDate.Value);

            return await query.CountAsync();
        }

        public async Task<PointTransaction?> GetLatestPointTransactionAsync(int userId, int? taskId = null)
        {
            var query = _context.PointTransactions
                .Where(pt => pt.UserId == userId);

            if (taskId.HasValue)
                query = query.Where(pt => pt.TaskId == taskId.Value);

            return await query.OrderByDescending(pt => pt.CreatedAt).FirstOrDefaultAsync();
        }

        public async Task<bool> HasPointTransactionTodayAsync(int userId, string transactionType)
        {
            DateTime today = DateTime.UtcNow.Date;
            DateTime tomorrow = today.AddDays(1);

            return await _context.PointTransactions
                .AnyAsync(pt => pt.UserId == userId && 
                               pt.TransactionType == transactionType &&
                               pt.CreatedAt >= today && 
                               pt.CreatedAt < tomorrow);
        }

        public async Task<List<PointTransaction>> GetPointTransactionsByTimeOfDayAsync(int userId, TimeSpan startTime, TimeSpan endTime)
        {
            return await _context.PointTransactions
                .Where(pt => pt.UserId == userId && 
                           pt.CreatedAt.TimeOfDay >= startTime && 
                           pt.CreatedAt.TimeOfDay < endTime)
                .OrderByDescending(pt => pt.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<PointTransaction>> GetPointTransactionsByDateRangeAsync(int userId, DateTime startDate, DateTime endDate)
        {
            return await _context.PointTransactions
                .Where(pt => pt.UserId == userId && pt.CreatedAt >= startDate && pt.CreatedAt < endDate)
                .OrderByDescending(pt => pt.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<PointTransaction>> GetPointTransactionsWithTaskJoinAsync(int userId, DateTime? startDate = null)
        {
            var query = _context.PointTransactions
                .Where(pt => pt.UserId == userId && pt.TaskId.HasValue);

            if (startDate.HasValue)
                query = query.Where(pt => pt.CreatedAt >= startDate.Value);

            return await query.OrderByDescending(pt => pt.CreatedAt).ToListAsync();
        }

        // Task queries
        public async Task<int> GetTaskCountByPriorityAsync(int userId, string priority)
        {
            return await _context.Tasks
                .CountAsync(t => t.UserId == userId && 
                               t.IsCompleted && 
                               t.Priority != null &&
                               t.Priority.ToLower() == priority.ToLower());
        }

        public async Task<int> GetTaskCountByCategoryAndDateAsync(int userId, string categoryName, DateTime startDate, DateTime endDate)
        {
            return await _context.Tasks
                .Where(t => t.UserId == userId && t.IsCompleted && 
                           t.Category != null && t.Category.Name.ToLower().Contains(categoryName.ToLower()) &&
                           t.CompletedAt.HasValue && t.CompletedAt.Value >= startDate && t.CompletedAt.Value < endDate)
                .CountAsync();
        }

        public async Task<int> GetTaskCountByFamilyAsync(int userId, bool isCompleted = true)
        {
            return await _context.Tasks
                .CountAsync(t => t.UserId == userId && t.IsCompleted == isCompleted && 
                               (t.FamilyId.HasValue || t.AssignedToFamilyMemberId.HasValue));
        }

        public async Task<int> GetTaskCountWithNotesAsync(int userId, int minLength = 0)
        {
            return await _context.Tasks
                .CountAsync(t => t.UserId == userId && !string.IsNullOrEmpty(t.Description) && t.Description.Length > minLength);
        }

        public async Task<bool> HasTaskWithDetailedNotesAsync(int userId, int minLength = 100)
        {
            return await _context.Tasks
                .AnyAsync(t => t.UserId == userId && !string.IsNullOrEmpty(t.Description) && t.Description.Length > minLength);
        }

        public async Task<int> GetRecurringTaskCountAsync(int userId)
        {
            return await _context.Tasks
                .CountAsync(t => t.UserId == userId && t.IsRecurring);
        }

        public async Task<List<TaskItem>> GetTasksByCategoryAndDateAsync(int userId, List<int> categoryIds, DateTime date)
        {
            DateTime startOfDay = date.Date;
            DateTime endOfDay = startOfDay.AddDays(1);

            return await _context.Tasks
                .Where(t => t.UserId == userId && t.IsCompleted && 
                           t.CompletedAt.HasValue && 
                           t.CompletedAt.Value >= startOfDay && 
                           t.CompletedAt.Value < endOfDay &&
                           t.CategoryId.HasValue && categoryIds.Contains(t.CategoryId.Value))
                .Include(t => t.Category)
                .Include(t => t.TaskTags!).ThenInclude(tt => tt.Tag)
                .ToListAsync();
        }

        public async Task<List<TaskItem>> GetTasksByPriorityAsync(int userId, List<string> priorities)
        {
            return await _context.Tasks
                .Where(t => t.UserId == userId && t.IsCompleted && 
                           !string.IsNullOrEmpty(t.Priority) && priorities.Contains(t.Priority))
                .Include(t => t.Category)
                .Include(t => t.TaskTags!).ThenInclude(tt => tt.Tag)
                .ToListAsync();
        }

        // Category queries  
        public async Task<int> GetCategoryCountAsync(int userId)
        {
            return await _context.Categories
                .CountAsync(c => c.UserId == userId);
        }

        // Achievement & Badge & Reward queries
        public async Task<Achievement?> GetAchievementByCategoryAndNameAsync(string category, string namePattern)
        {
            return await _context.Achievements
                .FirstOrDefaultAsync(a => a.Category == category && a.Name.Contains(namePattern));
        }

        public async Task<List<Achievement>> GetAchievementsByCategoryAsync(string category)
        {
            return await _context.Achievements
                .Where(a => a.Category == category)
                .ToListAsync();
        }

        // Feature usage checks
        public async Task<bool> HasUserUsedTasksAsync(int userId)
        {
            return await _context.Tasks.AnyAsync(t => t.UserId == userId);
        }

        public async Task<bool> HasUserUsedCategoriesAsync(int userId)
        {
            return await _context.Categories.AnyAsync(c => c.UserId == userId);
        }

        public async Task<bool> HasUserUsedFocusAsync(int userId)
        {
            return await _context.PointTransactions.AnyAsync(pt => pt.UserId == userId && pt.TransactionType == "focus_session");
        }

        public async Task<bool> HasUserUsedFamilyAsync(int userId)
        {
            return await _context.FamilyMembers.AnyAsync(fm => fm.UserId == userId);
        }

        public async Task<bool> HasUserUsedChallengesAsync(int userId)
        {
            return await _context.ChallengeProgresses.AnyAsync(cp => cp.UserId == userId);
        }

        public async Task<bool> HasUserUsedRewardsAsync(int userId)
        {
            return await _context.UserRewards.AnyAsync(ur => ur.UserId == userId);
        }

        public async Task<bool> HasUserUsedBoardsAsync(int userId)
        {
            return await _context.Boards.AnyAsync(b => b.UserId == userId);
        }

        // Tag queries
        public async Task<int> GetUniqueTagsUsedCountAsync(int userId)
        {
            return await _context.TaskTags
                .Include(tt => tt.Task)
                .Where(tt => tt.Task!.UserId == userId)
                .Select(tt => tt.TagId)
                .Distinct()
                .CountAsync();
        }

        // Challenge progress queries  
        public async Task<List<ChallengeProgress>> GetActiveChallengeProgressesWithIncludesAsync(int userId)
        {
            return await _context.ChallengeProgresses
                .Include(cp => cp.Challenge)
                .Where(cp => cp.UserId == userId && 
                            !cp.IsCompleted &&
                            cp.Challenge != null &&
                            cp.Challenge.IsActive &&
                            cp.Challenge.StartDate <= DateTime.UtcNow &&
                            (cp.Challenge.EndDate == null || cp.Challenge.EndDate > DateTime.UtcNow))
                .ToListAsync();
        }

        // Admin/Reset methods
        public async Task<List<PointTransaction>> GetAllUserPointTransactionsAsync(int userId)
        {
            return await _context.PointTransactions
                .Where(pt => pt.UserId == userId)
                .ToListAsync();
        }

        public async Task<List<UserAchievement>> GetAllUserAchievementsAsync(int userId)
        {
            return await _context.UserAchievements
                .Where(ua => ua.UserId == userId)
                .ToListAsync();
        }

        public async Task<List<UserBadge>> GetAllUserBadgesAsync(int userId)
        {
            return await _context.UserBadges
                .Where(ub => ub.UserId == userId)
                .ToListAsync();
        }

        public async Task<List<UserReward>> GetAllUserRewardsAsync(int userId)
        {
            return await _context.UserRewards
                .Where(ur => ur.UserId == userId)
                .ToListAsync();
        }

        public async Task<List<ChallengeProgress>> GetAllUserChallengeProgressesAsync(int userId)
        {
            return await _context.ChallengeProgresses
                .Where(cp => cp.UserId == userId)
                .ToListAsync();
        }

        public async Task<List<UserChallenge>> GetAllUserChallengesAsync(int userId)
        {
            return await _context.UserChallenges
                .Where(uc => uc.UserId == userId)
                .ToListAsync();
        }

        public void RemoveRangePointTransactions(IEnumerable<PointTransaction> transactions)
        {
            _context.PointTransactions.RemoveRange(transactions);
        }

        public void RemoveRangeUserAchievements(IEnumerable<UserAchievement> achievements)
        {
            _context.UserAchievements.RemoveRange(achievements);
        }

        public void RemoveRangeUserBadges(IEnumerable<UserBadge> badges)
        {
            _context.UserBadges.RemoveRange(badges);
        }

        public void RemoveRangeUserRewards(IEnumerable<UserReward> rewards)
        {
            _context.UserRewards.RemoveRange(rewards);
        }

        public void RemoveRangeUserChallenges(IEnumerable<UserChallenge> challenges)
        {
            _context.UserChallenges.RemoveRange(challenges);
        }

        public void AddUserProgress(UserProgress userProgress)
        {
            _context.UserProgresses.Add(userProgress);
        }

        // Count methods for stats
        public async Task<int> GetTotalPointTransactionCountAsync(int userId)
        {
            return await _context.PointTransactions
                .CountAsync(pt => pt.UserId == userId);
        }

        public async Task<int> GetTotalUserAchievementCountAsync(int userId)
        {
            return await _context.UserAchievements
                .CountAsync(ua => ua.UserId == userId);
        }

        public async Task<int> GetTotalUserBadgeCountAsync(int userId)
        {
            return await _context.UserBadges
                .CountAsync(ub => ub.UserId == userId);
        }

        public async Task<int> GetTotalUserRewardCountAsync(int userId)
        {
            return await _context.UserRewards
                .CountAsync(ur => ur.UserId == userId);
        }

        public async Task<int> GetTotalChallengeProgressCountAsync(int userId)
        {
            return await _context.ChallengeProgresses
                .CountAsync(cp => cp.UserId == userId);
        }

        public async Task<bool> HasFocusSessionYesterdayAsync(int userId, DateTime yesterday)
        {
            DateTime yesterdayEnd = yesterday.AddDays(1);
            return await _context.PointTransactions
                .AnyAsync(pt => pt.UserId == userId && 
                               pt.TransactionType == "focus_session" && 
                               pt.CreatedAt >= yesterday && pt.CreatedAt < yesterdayEnd);
        }

        #endregion
    }
} 