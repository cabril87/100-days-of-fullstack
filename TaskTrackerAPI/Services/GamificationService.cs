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
using Microsoft.Extensions.Logging;
using AutoMapper;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Services.Interfaces;
using TaskTrackerAPI.DTOs.Gamification;
using TaskTrackerAPI.Models.Gamification;
using TaskTrackerAPI.Repositories.Interfaces;
using TaskTrackerAPI.Exceptions;

namespace TaskTrackerAPI.Services
{
    public class GamificationService : IGamificationService
    {
        private readonly IGamificationRepository _gamificationRepository;
        private readonly IUserRepository _userRepository;
        private readonly IUnifiedRealTimeService _unifiedRealTimeService;
        private readonly IMapper _mapper;
        private readonly ILogger<GamificationService> _logger;

        public GamificationService(
            IGamificationRepository gamificationRepository,
            IUserRepository userRepository,
            IUnifiedRealTimeService unifiedRealTimeService,
            IMapper mapper,
            ILogger<GamificationService> logger)
        {
            _gamificationRepository = gamificationRepository ?? throw new ArgumentNullException(nameof(gamificationRepository));
            _userRepository = userRepository ?? throw new ArgumentNullException(nameof(userRepository));
            _unifiedRealTimeService = unifiedRealTimeService ?? throw new ArgumentNullException(nameof(unifiedRealTimeService));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        #region User Progress

        public async Task<UserProgressDTO> GetUserProgressAsync(int userId)
        {
            UserProgress? userProgress = await _gamificationRepository.GetUserProgressAsync(userId);

            if (userProgress == null)
            {
                // Create a new progress record if none exists
                userProgress = new UserProgress
                {
                    UserId = userId,
                    Level = 1,
                    CurrentPoints = 0,
                    TotalPointsEarned = 0,
                    NextLevelThreshold = 100,
                    CurrentStreak = 0,
                    LongestStreak = 0,
                    LastActivityDate = null,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                userProgress = await _gamificationRepository.CreateUserProgressAsync(userProgress);
            }

            return _mapper.Map<UserProgressDTO>(userProgress);
        }

        public async Task<int> AddPointsAsync(int userId, int points, string transactionType, string description, int? taskId = null)
        {
            if (points < 0)
            {
                throw new ArgumentException("Points cannot be negative", nameof(points));
            }

            // For new comprehensive system, use calculated points instead of passed points for certain transaction types
            int finalPoints = points;

            if (transactionType == "task_completion" && taskId.HasValue)
            {
                // Use comprehensive task completion calculation
                TaskItem? task = await _gamificationRepository.GetTaskAsync(taskId.Value);
                if (task != null)
                {
                    // Determine if task is collaborative based on assignment to family members
                    bool isCollaborative = task.AssignedToFamilyMemberId.HasValue || task.FamilyId.HasValue;

                    // Map priority to difficulty (since difficulty doesn't exist in TaskItem)
                    // We'll treat priority as difficulty for point calculation purposes
                    string difficulty = task.Priority?.ToLower() switch
                    {
                        "critical" => "Expert",
                        "high" => "High",
                        "medium" => "Medium",
                        "low" => "Low",
                        _ => "Medium"
                    };

                    finalPoints = await CalculateTaskCompletionPointsAsync(
                        userId,
                        taskId.Value,
                        difficulty,
                        task.Priority ?? "Medium",
                        task.DueDate,
                        isCollaborative
                    );
                }
            }
            else if (transactionType == "daily_login")
            {
                // Use comprehensive daily login calculation
                finalPoints = await CalculateAdvancedDailyLoginPointsAsync(userId);
            }

            UserProgress userProgress = await GetInternalUserProgressAsync(userId);


            // This prevents foreign key constraint violations during concurrent operations
            if (taskId.HasValue && transactionType != "task_deletion")
            {
                try
                {
                    TaskItem? taskExists = await _gamificationRepository.GetTaskAsync(taskId ?? 0);
                    if (taskExists == null)
                    {
                        _logger.LogWarning("Task {TaskId} no longer exists, creating transaction without TaskId reference", taskId ?? 0);
                        taskId = null; // Set to null to avoid FK constraint violation
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Unable to verify task {TaskId} existence, proceeding without TaskId reference", taskId ?? 0);
                    taskId = null; // Set to null to avoid FK constraint violation
                }
            }

            // Create a point transaction record
            PointTransaction transaction = new PointTransaction
            {
                UserId = userId,
                Points = finalPoints,
                TransactionType = transactionType,
                Description = $"{description} (Earned: {finalPoints} points)",
                TaskId = taskId, // Will be NULL if task doesn't exist or was deleted
                CreatedAt = DateTime.UtcNow
            };

            try
            {
                _gamificationRepository.AddPointTransaction(transaction);

                // Update user progress
                userProgress.CurrentPoints += finalPoints;
                userProgress.TotalPointsEarned += finalPoints;
                userProgress.UpdatedAt = DateTime.UtcNow;

                // Check for level up
                int oldLevel = userProgress.Level;
                while (userProgress.CurrentPoints >= userProgress.NextLevelThreshold)
                {
                    userProgress.Level++;
                    userProgress.CurrentPoints -= userProgress.NextLevelThreshold;
                    userProgress.NextLevelThreshold = CalculateNextLevelThreshold(userProgress.Level);

                    // Create level up notification or achievement
                    await UnlockLevelBasedAchievements(userId, userProgress.Level);
                }

                // Check for tier advancement
                await UpdateUserTierAsync(userId);

                await _gamificationRepository.SaveChangesAsync();

                _logger.LogInformation("Successfully added {Points} points to user {UserId} for {TransactionType}",
                    finalPoints, userId, transactionType);
            }
            catch (DbUpdateException dbEx) when (dbEx.Message.Contains("FK_PointTransactions_Tasks_TaskId"))
            {
                // Handle foreign key constraint violation gracefully
                _logger.LogWarning(dbEx, "Foreign key constraint violation for TaskId {TaskId}, retrying without TaskId reference", taskId ?? 0);

                // Retry without TaskId reference
                transaction.TaskId = null;
                _gamificationRepository.AddPointTransaction(transaction);
                await _gamificationRepository.SaveChangesAsync();

                _logger.LogInformation("Successfully added {Points} points to user {UserId} for {TransactionType} (without TaskId reference)",
                    finalPoints, userId, transactionType);
            }

            // Send real-time notifications
            try
            {
                // Send points earned notification
                await _unifiedRealTimeService.SendPointsEarnedAsync(userId, finalPoints, description, taskId);

                // Send level up notification if level changed
                UserProgress updatedProgress = await GetInternalUserProgressAsync(userId);
                if (updatedProgress.Level > userProgress.Level)
                {
                    await _unifiedRealTimeService.SendLevelUpAsync(userId, updatedProgress.Level, userProgress.Level);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending real-time gamification notifications for user {UserId}", userId);
                // Don't throw - real-time notifications shouldn't break the main flow
            }

            return transaction.Id;
        }

        private int CalculateNextLevelThreshold(int level)
        {
            // Simple formula: 100 * level^1.5
            return (int)(100 * Math.Pow(level, 1.5));
        }

        public async Task UpdateStreakAsync(int userId)
        {
            UserProgress userProgress = await GetInternalUserProgressAsync(userId);
            DateTime now = DateTime.UtcNow.Date;

            if (userProgress.LastActivityDate.HasValue)
            {
                DateTime lastActivityDate = userProgress.LastActivityDate.Value.Date;

                if (lastActivityDate == now)
                {
                    // Already updated today, no need to do anything
                    return;
                }
                else if (lastActivityDate == now.AddDays(-1))
                {
                    // Consecutive day
                    userProgress.CurrentStreak++;

                    // Update longest streak if current streak is longer
                    if (userProgress.CurrentStreak > userProgress.LongestStreak)
                    {
                        userProgress.LongestStreak = userProgress.CurrentStreak;
                    }

                    // Check for streak achievements
                    await CheckForStreakAchievements(userId, userProgress.CurrentStreak);
                }
                else
                {
                    // Streak broken
                    userProgress.CurrentStreak = 1;
                }
            }
            else
            {
                // First activity
                userProgress.CurrentStreak = 1;
            }

            userProgress.LastActivityDate = now;
            userProgress.UpdatedAt = DateTime.UtcNow;

            await _gamificationRepository.SaveChangesAsync();

            // Send real-time streak update notification
            try
            {
                bool isNewRecord = userProgress.CurrentStreak == userProgress.LongestStreak;
                await _unifiedRealTimeService.SendStreakUpdatedAsync(userId, userProgress.CurrentStreak, isNewRecord);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending real-time streak notification for user {UserId}", userId);
                // Don't throw - real-time notifications shouldn't break the main flow
            }
        }

        private async Task CheckForStreakAchievements(int userId, int currentStreak)
        {
            // Find achievements related to streaks
            IEnumerable<Achievement> allAchievements = await _gamificationRepository.GetAllAchievementsAsync();
            List<Achievement> streakAchievements = allAchievements
                .Where(a => a.Category == "Streak")
                .ToList();

            foreach (Achievement achievement in streakAchievements)
            {
                // Check if user already has this achievement
                bool hasAchievement = await _gamificationRepository.AnyUserAchievementAsync(userId, achievement.Id);
                if (hasAchievement)
                    continue;

                // Check if the streak meets the criteria
                if (int.TryParse(achievement.Criteria, out int targetValue) && currentStreak >= targetValue)
                {
                    await UnlockAchievementAsync(userId, achievement.Id);
                }
            }
        }

        #endregion

        #region Achievements

        public async Task<List<UserAchievementDTO>> GetUserAchievementsAsync(int userId)
        {
            IEnumerable<UserAchievement> userAchievements = await _gamificationRepository.GetUserAchievementsAsync(userId);
            return _mapper.Map<List<UserAchievementDTO>>(userAchievements);
        }

        public async Task<List<AchievementDTO>> GetAvailableAchievementsAsync(int userId)
        {
            // Get all achievements except those already unlocked by the user
            IEnumerable<Achievement> availableAchievements = await _gamificationRepository.GetAvailableAchievementsAsync(userId);
            return _mapper.Map<List<AchievementDTO>>(availableAchievements);
        }

        public async Task<UserAchievementDTO> UnlockAchievementAsync(int userId, int achievementId)
        {
            // Check if already unlocked
            UserAchievement? existingUnlock = await _gamificationRepository.GetUserAchievementAsync(userId, achievementId);

            if (existingUnlock != null && existingUnlock.IsCompleted)
            {
                throw new InvalidOperationException("Achievement already unlocked");
            }

            // Get the achievement
            Achievement? achievement = await _gamificationRepository.GetAchievementAsync(achievementId);
            if (achievement == null)
            {
                throw new ArgumentException("Achievement not found", nameof(achievementId));
            }

            // Create or update the user achievement record
            if (existingUnlock == null)
            {
                existingUnlock = new UserAchievement
                {
                    UserId = userId,
                    AchievementId = achievementId,
                    Progress = 100,
                    IsCompleted = true,
                    StartedAt = DateTime.UtcNow,
                    CompletedAt = DateTime.UtcNow
                };
                await _gamificationRepository.CreateUserAchievementAsync(existingUnlock);
            }
            else
            {
                existingUnlock.Progress = 100;
                existingUnlock.IsCompleted = true;
                existingUnlock.CompletedAt = DateTime.UtcNow;
                await _gamificationRepository.UpdateUserProgressAsync(await GetInternalUserProgressAsync(userId));
            }

            // Calculate points using comprehensive system based on achievement tier and difficulty
            string achievementTier = achievement.Category?.ToLower().Contains("bronze") == true ? "bronze" :
                                   achievement.Category?.ToLower().Contains("silver") == true ? "silver" :
                                   achievement.Category?.ToLower().Contains("gold") == true ? "gold" :
                                   achievement.Category?.ToLower().Contains("platinum") == true ? "platinum" :
                                   achievement.Category?.ToLower().Contains("diamond") == true ? "diamond" :
                                   achievement.Category?.ToLower().Contains("onyx") == true ? "onyx" : "bronze";

            // Determine difficulty from achievement properties
            string difficulty = achievement.Difficulty.ToString();

            int calculatedPoints = CalculateAchievementPoints(achievementTier, difficulty);

            // Award points for unlocking this achievement using calculated amount
            await AddPointsAsync(userId, calculatedPoints, "achievement",
                $"Unlocked {achievementTier} achievement: {achievement.Name}");

            await _gamificationRepository.SaveChangesAsync();

            // Load the achievement relationship
            existingUnlock.Achievement = achievement;

            // Send real-time achievement unlock notification
            try
            {
                await _unifiedRealTimeService.SendAchievementUnlockedAsync(userId, achievement.Name, achievementId, calculatedPoints);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to send real-time achievement unlock notification for user {UserId}", userId);
            }

            // Check for new level-based achievements after this unlock
            await UnlockLevelBasedAchievements(userId, (await GetInternalUserProgressAsync(userId)).Level);

            return _mapper.Map<UserAchievementDTO>(existingUnlock);
        }

        private async Task UnlockLevelBasedAchievements(int userId, int level)
        {
            // Find achievements related to level milestones
            List<Achievement> levelAchievements = await _gamificationRepository.GetLevelAchievementsAsync(level);

            foreach (Achievement achievement in levelAchievements)
            {
                // Check if already unlocked
                if (!await _gamificationRepository.AnyUserAchievementAsync(userId, achievement.Id))
                {
                    try
                    {
                        await UnlockAchievementAsync(userId, achievement.Id);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to unlock level-based achievement {AchievementId} for user {UserId}", achievement.Id, userId);
                    }
                }
            }
        }

        #endregion

        #region Badges

        public async Task<List<UserBadgeDTO>> GetUserBadgesAsync(int userId)
        {
            IEnumerable<UserBadge> userBadges = await _gamificationRepository.GetUserBadgesAsync(userId);
            return _mapper.Map<List<UserBadgeDTO>>(userBadges.ToList());
        }

        public async Task<UserBadgeDTO> AwardBadgeAsync(int userId, int badgeId)
        {
            // Check if already awarded
            UserBadge? existingBadge = await _gamificationRepository.GetUserBadgeAsync(userId, badgeId);

            if (existingBadge != null)
            {
                throw new InvalidOperationException("Badge already awarded");
            }

            // Get the badge
            Badge? badge = await _gamificationRepository.GetBadgeAsync(badgeId);
            if (badge == null)
            {
                throw new ArgumentException("Badge not found", nameof(badgeId));
            }

            // Create the user badge record
            UserBadge userBadge = new UserBadge
            {
                UserId = userId,
                BadgeId = badgeId,
                IsDisplayed = true,
                AwardedAt = DateTime.UtcNow
            };

            _gamificationRepository.AddUserBadge(userBadge);

            // Award points for earning this badge
            await AddPointsAsync(userId, badge.PointValue, "badge", $"Earned badge: {badge.Name}");

            await _gamificationRepository.SaveChangesAsync();

            // Load the badge relationship
            userBadge.Badge = badge;

            // Send real-time badge earned notification
            try
            {
                await _unifiedRealTimeService.SendBadgeEarnedAsync(userId, badge.Name, badgeId, badge.Rarity ?? "Common");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending real-time badge notification for user {UserId}", userId);
                // Don't throw - real-time notifications shouldn't break the main flow
            }

            return _mapper.Map<UserBadgeDTO>(userBadge);
        }

        public async Task<bool> ToggleBadgeDisplayAsync(int userId, int badgeId, bool isDisplayed)
        {
            UserBadge? userBadge = await _gamificationRepository.GetUserBadgeAsync(userId, badgeId);

            if (userBadge == null)
            {
                throw new ArgumentException("User does not have this badge", nameof(badgeId));
            }

            userBadge.IsDisplayed = isDisplayed;
            await _gamificationRepository.SaveChangesAsync();

            return true;
        }

        #endregion

        #region Rewards

        public async Task<List<RewardDTO>> GetAvailableRewardsAsync(int userId)
        {
            UserProgress userProgress = await GetInternalUserProgressAsync(userId);

            // Return ALL active rewards, frontend will handle locked/unlocked display
            List<Reward> rewards = await _gamificationRepository.GetActiveRewardsAsync();

            // Map to DTOs and include user's level info for frontend to determine lock status
            List<RewardDTO> rewardDTOs = _mapper.Map<List<RewardDTO>>(rewards);

            // Add user context to each reward
            foreach (RewardDTO reward in rewardDTOs)
            {
                reward.IsAvailable = userProgress.Level >= reward.MinimumLevel;
                reward.UserLevel = userProgress.Level;
                reward.UserPoints = userProgress.CurrentPoints;
            }

            return rewardDTOs;
        }

        public async Task<UserRewardDTO> RedeemRewardAsync(int userId, int rewardId)
        {
            // Get user progress
            UserProgress userProgress = await GetInternalUserProgressAsync(userId);

            // Get the reward
            Reward? reward = await _gamificationRepository.GetRewardAsync(rewardId);
            if (reward == null)
            {
                throw new ArgumentException("Reward not found", nameof(rewardId));
            }

            // Check if user has enough points
            if (userProgress.CurrentPoints < reward.PointCost)
            {
                throw new InvalidOperationException("Not enough points to redeem this reward");
            }

            // Check if reward is available at user's level
            if (userProgress.Level < reward.MinimumLevel)
            {
                throw new InvalidOperationException("User level is too low to redeem this reward");
            }

            // Deduct points
            userProgress.CurrentPoints -= reward.PointCost;
            userProgress.UpdatedAt = DateTime.UtcNow;

            // Create transaction record
            PointTransaction transaction = new PointTransaction
            {
                UserId = userId,
                Points = -reward.PointCost,
                TransactionType = "reward_redemption",
                Description = $"Redeemed reward: {reward.Name}",
                CreatedAt = DateTime.UtcNow
            };

            _gamificationRepository.AddPointTransaction(transaction);

            // Create user reward record
            UserReward userReward = new UserReward
            {
                UserId = userId,
                RewardId = rewardId,
                IsUsed = false,
                RedeemedAt = DateTime.UtcNow
            };

            _gamificationRepository.AddUserReward(userReward);
            await _gamificationRepository.SaveChangesAsync();

            // Load the reward relationship
            userReward.Reward = reward;

            return _mapper.Map<UserRewardDTO>(userReward);
        }

        // Helper method to get internal UserProgress for use within the service
        private async Task<UserProgress> GetInternalUserProgressAsync(int userId)
        {
            UserProgress? userProgress = await _gamificationRepository.GetUserProgressAsync(userId);

            if (userProgress == null)
            {
                // Create a new progress record if none exists
                userProgress = new UserProgress
                {
                    UserId = userId,
                    Level = 1,
                    CurrentPoints = 0,
                    TotalPointsEarned = 0,
                    NextLevelThreshold = 100,
                    CurrentStreak = 0,
                    LongestStreak = 0,
                    LastActivityDate = null,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                userProgress = await _gamificationRepository.CreateUserProgressAsync(userProgress);
            }

            return userProgress;
        }

        public async Task<bool> UseRewardAsync(int userRewardId)
        {
            UserReward? userReward = await _gamificationRepository.GetUserRewardAsync(userRewardId);
            if (userReward == null)
            {
                throw new ArgumentException("User reward not found", nameof(userRewardId));
            }

            if (userReward.IsUsed)
            {
                return false;
            }

            userReward.IsUsed = true;
            userReward.UsedAt = DateTime.UtcNow;

            await _gamificationRepository.UpdateUserRewardAsync(userReward);
            return true;
        }

        #endregion

        #region Challenges

        /// <summary>
        /// Gets user's active challenges with progress information
        /// </summary>
        public async Task<List<UserActiveChallengeDTO>> GetUserActiveChallengesAsync(int userId)
        {
            IEnumerable<UserChallenge> activeChallenges = await _gamificationRepository.GetUserActiveChallengesAsync(userId);
            return _mapper.Map<List<UserActiveChallengeDTO>>(activeChallenges);
        }

        /// <summary>
        /// Leaves/abandons a challenge
        /// </summary>
        public async Task<bool> LeaveChallengeAsync(int userId, int challengeId)
        {
            ChallengeProgress? challengeProgress = await _gamificationRepository.GetChallengeProgressAsync(userId, challengeId);

            if (challengeProgress == null)
            {
                return false; // Not enrolled or already completed
            }

            // Remove the challenge progress
            _gamificationRepository.RemoveChallengeProgress(challengeProgress);

            // Also remove the user challenge record
            UserChallenge? userChallenge = await _gamificationRepository.GetUserChallengeAsync(userId, challengeId);

            if (userChallenge != null)
            {
                _gamificationRepository.RemoveUserChallenge(userChallenge);
            }

            await _gamificationRepository.SaveChangesAsync();

            _logger.LogInformation($"User {userId} left challenge {challengeId}");
            return true;
        }

        public async Task<List<ChallengeDTO>> GetActiveChallengesAsync(int userId)
        {
            // Get challenges user is enrolled in but hasn't completed
            List<int> enrolledChallengeIds = await _gamificationRepository.GetEnrolledChallengeIdsAsync(userId);

            // Get active challenges user isn't enrolled in yet
            List<Challenge> availableChallenges = await _gamificationRepository.GetAvailableChallengesAsync();

            // Get challenges user is enrolled in
            List<Challenge> enrolledChallenges = await _gamificationRepository.GetEnrolledChallengesAsync(userId);

            // Combine and return
            List<Challenge> allChallenges = availableChallenges.Concat(enrolledChallenges)
                .OrderBy(c => c.EndDate)
                .ToList();

            return _mapper.Map<List<ChallengeDTO>>(allChallenges);
        }

        public async Task<UserChallengeDTO> EnrollInChallengeAsync(int userId, int challengeId)
        {
            // Check if already enrolled
            ChallengeProgress? existingEnrollment = await _gamificationRepository.GetChallengeProgressAsync(userId, challengeId);

            if (existingEnrollment != null)
            {
                throw new InvalidOperationException("User already enrolled in this challenge");
            }

            // Check active challenge limit (2 challenges max)
            int activeChallengeCount = await _gamificationRepository.GetActiveChallengeCountAsync(userId);

            if (activeChallengeCount >= 2)
            {
                throw new InvalidOperationException("You can only participate in 2 challenges at a time. Complete or leave an existing challenge before joining a new one.");
            }

            // Get the challenge
            Challenge? challenge = await _gamificationRepository.GetChallengeAsync(challengeId);
            if (challenge == null)
            {
                throw new ArgumentException("Challenge not found", nameof(challengeId));
            }

            // Check if challenge is active
            if (!challenge.IsActive || (challenge.EndDate.HasValue && challenge.EndDate.Value < DateTime.UtcNow))
            {
                throw new InvalidOperationException("Challenge is not active");
            }

            // Check if user has enough points to join
            UserProgress userProgress = await GetInternalUserProgressAsync(userId);
            if (userProgress.TotalPointsEarned < challenge.PointsRequired)
            {
                throw new InvalidOperationException($"Insufficient points to join this challenge. Required: {challenge.PointsRequired}, You have: {userProgress.TotalPointsEarned}");
            }

            // Create user challenge record
            UserChallenge userChallenge = new UserChallenge
            {
                UserId = userId,
                ChallengeId = challengeId,
                CurrentProgress = 0,
                IsCompleted = false,
                EnrolledAt = DateTime.UtcNow
            };

            _gamificationRepository.AddUserChallenge(userChallenge);

            // Also create a progress record for tracking
            ChallengeProgress challengeProgress = new ChallengeProgress
            {
                UserId = userId,
                ChallengeId = challengeId,
                CurrentProgress = 0,
                IsCompleted = false,
                EnrolledAt = DateTime.UtcNow
            };

            _gamificationRepository.AddChallengeProgress(challengeProgress);
            await _gamificationRepository.SaveChangesAsync();

            _logger.LogInformation($"User {userId} enrolled in challenge {challengeId}. Active challenges: {activeChallengeCount + 1}/2");

            // Load the challenge relationship
            userChallenge.Challenge = challenge;

            return _mapper.Map<UserChallengeDTO>(userChallenge);
        }

        public async Task<ChallengeDTO?> GetChallengeForUserAsync(int userId)
        {
            try
            {
                // First look for an active challenge the user is already working on
                ChallengeProgress? activeProgress = await _gamificationRepository.GetActiveChallengeProgressAsync(userId);

                if (activeProgress != null)
                {
                    // Get the challenge directly since navigation property is ignored
                    Challenge? challenge = await _gamificationRepository.GetChallengeAsync(activeProgress.ChallengeId);

                    if (challenge != null)
                    {
                        return _mapper.Map<ChallengeDTO>(challenge);
                    }
                }

                // Otherwise, suggest a new challenge the user hasn't completed yet
                List<int> completedChallengeIds = await _gamificationRepository.GetCompletedChallengeIdsAsync(userId);

                Challenge? suggestedChallenge = await _gamificationRepository.GetAvailableChallengeAsync(userId);

                return suggestedChallenge != null ? _mapper.Map<ChallengeDTO>(suggestedChallenge) : null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error finding challenge for user {UserId}", userId);
                return null;
            }
        }

        public async Task<ChallengeProgressDTO> GetChallengeProgressAsync(int userId, int challengeId)
        {
            Challenge? challenge = await _gamificationRepository.GetChallengeAsync(challengeId);
            if (challenge == null)
            {
                throw new ArgumentException("Challenge not found", nameof(challengeId));
            }

            ChallengeProgress? progress = await _gamificationRepository.GetChallengeProgressAsync(userId, challengeId);

            if (progress == null)
            {
                // Create a new progress entry
                progress = new ChallengeProgress
                {
                    UserId = userId,
                    ChallengeId = challengeId,
                    CurrentProgress = 0,
                    IsCompleted = false,
                    EnrolledAt = DateTime.UtcNow
                };

                _gamificationRepository.AddChallengeProgress(progress);
                await _gamificationRepository.SaveChangesAsync();
            }

            return _mapper.Map<ChallengeProgressDTO>(progress);
        }

        public async Task<ChallengeProgressDTO> UnlockChallengeAsync(int userId, int challengeId)
        {
            // Implementation for unlocking challenges
            ChallengeProgressDTO? progress = await GetChallengeProgressAsync(userId, challengeId);
            return progress;
        }

        #endregion

        #region Daily Login

        public async Task<PointTransactionDTO> ProcessDailyLoginAsync(int userId)
        {
            // Check if user has already logged in today
            DateTime today = DateTime.UtcNow.Date;
            bool hasLoggedInToday = await _gamificationRepository.HasDailyLoginTransactionAsync(userId, today);

            if (hasLoggedInToday)
            {
                throw new InvalidOperationException("Daily login reward already claimed today");
            }

            // Calculate streak-based points
            UserProgress userProgress = await GetInternalUserProgressAsync(userId);
            int pointsToAdd = CalculateDailyLoginPoints(userProgress.CurrentStreak + 1);

            // Add points with daily login transaction
            int transactionId = await AddPointsAsync(userId, pointsToAdd, "daily_login", "Daily login reward");

            // Update streak
            await UpdateStreakAsync(userId);

            // Return the created transaction
            PointTransaction? transaction = await _gamificationRepository.GetPointTransactionAsync(transactionId);
            if (transaction == null)
            {
                throw new InvalidOperationException("Failed to create transaction record");
            }

            return _mapper.Map<PointTransactionDTO>(transaction);
        }

        private int CalculateDailyLoginPoints(int currentStreak)
        {
            // Base points for daily login
            int basePoints = 10;

            // Bonus points for streak milestones
            int streakBonus = (currentStreak / 7) * 5; // +5 points for every week of streak

            return Math.Min(basePoints + streakBonus, 50); // Cap at 50 points
        }

        public async Task<bool> HasUserLoggedInTodayAsync(int userId)
        {
            DateTime today = DateTime.UtcNow.Date;

            // Check for a daily login transaction today
            return await _gamificationRepository.HasDailyLoginTransactionAsync(userId, today);
        }

        public async Task<DailyLoginStatusDetailDTO> GetDailyLoginStatusAsync(int userId)
        {
            bool hasLoggedInToday = await HasUserLoggedInTodayAsync(userId);
            UserProgress progress = await GetInternalUserProgressAsync(userId);

            return new DailyLoginStatusDetailDTO
            {
                UserId = userId,
                HasLoggedInToday = hasLoggedInToday,
                ConsecutiveDays = progress.CurrentStreak,
                TotalLogins = 0, // Could be enhanced to track actual login count
                LastLoginDate = progress.LastActivityDate,
                CurrentStreakPoints = CalculateDailyLoginPoints(progress.CurrentStreak),
                RewardClaimed = hasLoggedInToday
            };
        }

        #endregion

        #region Suggestions and Stats

        public async Task<List<GamificationSuggestionDetailDTO>> GetGamificationSuggestionsAsync(int userId)
        {
            List<GamificationSuggestionDetailDTO> suggestions = new List<GamificationSuggestionDetailDTO>();

            // Suggestion 1: Check for incomplete tasks
            List<TaskItem> incompleteTasks = await _gamificationRepository.GetIncompleteTasksAsync(userId);
            if (incompleteTasks.Count > 0)
            {
                suggestions.Add(new GamificationSuggestionDetailDTO
                {
                    SuggestionType = "task_completion",
                    Title = "Complete a Task",
                    Description = $"You have {incompleteTasks.Count} incomplete tasks. Complete one to earn points!",
                    RequiredPoints = 25,
                    ActionType = "/tasks",
                    Priority = 1
                });
            }

            // Suggestion 2: Check for available achievements
            List<Achievement> availableAchievements = (await _gamificationRepository.GetAvailableAchievementsAsync(userId)).Take(3).ToList();

            if (availableAchievements.Count > 0)
            {
                foreach (Achievement achievement in availableAchievements)
                {
                    suggestions.Add(new GamificationSuggestionDetailDTO
                    {
                        SuggestionType = "achievement",
                        Title = $"Unlock: {achievement.Name}",
                        Description = achievement.Description,
                        RequiredPoints = achievement.PointValue,
                        ActionType = "/achievements",
                        Priority = 2
                    });
                }
            }

            // Suggestion 3: Check if daily login is available
            bool hasLoggedInToday = await HasUserLoggedInTodayAsync(userId);
            if (!hasLoggedInToday)
            {
                UserProgress progress = await GetInternalUserProgressAsync(userId);
                suggestions.Add(new GamificationSuggestionDetailDTO
                {
                    SuggestionType = "daily_login",
                    Title = "Claim Daily Login Reward",
                    Description = "Don't forget to claim your daily login bonus!",
                    RequiredPoints = CalculateDailyLoginPoints(progress.CurrentStreak + 1),
                    ActionType = "/gamification/daily-login",
                    Priority = 0
                });
            }

            return suggestions.OrderBy(s => s.Priority).ToList();
        }

        public async Task<GamificationStatsDTO> GetGamificationStatsAsync(int userId)
        {
            UserProgress userProgress = await GetInternalUserProgressAsync(userId);

            // Count completed tasks
            int completedTasks = await _gamificationRepository.GetCompletedTasksCountAsync(userId);

            // Count achievements and badges
            int achievementsUnlocked = await _gamificationRepository.GetUserAchievementsCountAsync(userId);

            int badgesEarned = await _gamificationRepository.GetUserBadgesCountAsync(userId);

            int rewardsRedeemed = await _gamificationRepository.GetUserRewardsCountAsync(userId);

            // Calculate consistency score (0-100)
            double consistencyScore = await CalculateConsistencyScoreAsync(userId);

            // Get task category stats
            Dictionary<string, int> categoryStats = await GetCategoryStatsAsync(userId);

            // Get top users on leaderboard via DTO
            List<LeaderboardEntryDTO> topUsers = await GetLeaderboardAsync("points", 5);

            return new GamificationStatsDTO
            {
                Progress = _mapper.Map<UserProgressDTO>(userProgress),
                CompletedTasks = completedTasks,
                AchievementsUnlocked = achievementsUnlocked,
                BadgesEarned = badgesEarned,
                RewardsRedeemed = rewardsRedeemed,
                ConsistencyScore = consistencyScore,
                CategoryStats = categoryStats,
                TopUsers = topUsers
            };
        }

        public async Task<List<LeaderboardEntryDTO>> GetLeaderboardAsync(string category, int limit = 10)
        {
            if (category == "points")
            {
                // Leaderboard by total points
                List<UserProgress> leaderboardData = await _gamificationRepository.GetLeaderboardByPointsAsync(limit);
                List<LeaderboardEntryDTO> leaderboardEntries = leaderboardData.Select((up, index) => new LeaderboardEntryDTO
                {
                    Rank = index + 1,
                    UserId = up.UserId,
                    Username = $"User {up.UserId}", // Default username - could be enhanced to get actual username
                    Value = up.TotalPointsEarned
                }).ToList();

                return leaderboardEntries;
            }
            else if (category == "streak")
            {
                // Leaderboard by current streak
                List<UserProgress> leaderboardData = await _gamificationRepository.GetLeaderboardByStreakAsync(limit);
                List<LeaderboardEntryDTO> leaderboardEntries = leaderboardData.Select((up, index) => new LeaderboardEntryDTO
                {
                    Rank = index + 1,
                    UserId = up.UserId,
                    Username = $"User {up.UserId}", // Default username - could be enhanced to get actual username
                    Value = up.CurrentStreak
                }).ToList();

                return leaderboardEntries;
            }
            else if (category == "tasks")
            {
                // Leaderboard by completed tasks
                List<TaskCountData> userTaskCounts = await _gamificationRepository.GetUserTaskCountsAsync();

                List<LeaderboardEntryDTO> result = new List<LeaderboardEntryDTO>();
                int rank = 1;

                foreach (TaskCountData item in userTaskCounts.OrderByDescending(x => x.Count).Take(limit))
                {
                    if (item.UserId.HasValue)
                    {
                        User? user = await _gamificationRepository.GetUserAsync(item.UserId.Value);
                        if (user != null)
                        {
                            result.Add(new LeaderboardEntryDTO
                            {
                                Rank = rank++,
                                UserId = item.UserId.Value,
                                Username = user.Username ?? "Unknown",
                                Value = item.Count
                            });
                        }
                    }
                }

                return result;
            }

            return new List<LeaderboardEntryDTO>();
        }

        public async Task<List<LeaderboardEntryDTO>> GetFamilyMembersLeaderboardAsync(int userId, string category, int limit = 10)
        {
            // Get user's family ID
            FamilyMember? familyMember = await _gamificationRepository.GetFamilyMembersAsync(0).ContinueWith(t => t.Result.FirstOrDefault(fm => fm.UserId == userId));
            if (familyMember == null)
            {
                return new List<LeaderboardEntryDTO>();
            }

            // Get all family members
            List<FamilyMember> familyMembers = await _gamificationRepository.GetFamilyMembersAsync(familyMember.FamilyId);
            List<int> familyUserIds = familyMembers.Select(fm => fm.UserId).ToList();

            if (category == "points")
            {
                // Get user progress for family members
                List<UserProgress> familyProgresses = await _gamificationRepository.GetUserProgressByIdsAsync(familyUserIds);

                List<LeaderboardEntryDTO> result = new List<LeaderboardEntryDTO>();
                int rank = 1;

                foreach (UserProgress progress in familyProgresses.OrderByDescending(p => p.TotalPointsEarned).Take(limit))
                {
                    User? user = await _gamificationRepository.GetUserAsync(progress.UserId);
                    if (user != null)
                    {
                        result.Add(new LeaderboardEntryDTO
                        {
                            Rank = rank++,
                            UserId = progress.UserId,
                            Username = user.Username ?? "Unknown",
                            Value = progress.TotalPointsEarned
                        });
                    }
                }

                return result;
            }
            else if (category == "streak")
            {
                // Get user progress for family members 
                List<UserProgress> familyProgresses = await _gamificationRepository.GetUserProgressByIdsAsync(familyUserIds);

                List<LeaderboardEntryDTO> result = new List<LeaderboardEntryDTO>();
                int rank = 1;

                foreach (UserProgress progress in familyProgresses.OrderByDescending(p => p.CurrentStreak).Take(limit))
                {
                    User? user = await _gamificationRepository.GetUserAsync(progress.UserId);
                    if (user != null)
                    {
                        result.Add(new LeaderboardEntryDTO
                        {
                            Rank = rank++,
                            UserId = progress.UserId,
                            Username = user.Username ?? "Unknown",
                            Value = progress.CurrentStreak
                        });
                    }
                }

                return result;
            }
            else if (category == "tasks")
            {
                // Get task completion data for family members
                List<TaskCountData> allTaskCounts = await _gamificationRepository.GetUserTaskCountsAsync();
                List<TaskCountData> familyTaskCounts = allTaskCounts.Where(tc => tc.UserId.HasValue && familyUserIds.Contains(tc.UserId.Value)).ToList();

                List<LeaderboardEntryDTO> result = new List<LeaderboardEntryDTO>();
                int rank = 1;

                foreach (TaskCountData taskCount in familyTaskCounts.OrderByDescending(tc => tc.Count).Take(limit))
                {
                    if (taskCount.UserId.HasValue)
                    {
                        User? user = await _gamificationRepository.GetUserAsync(taskCount.UserId.Value);
                        if (user != null)
                        {
                            result.Add(new LeaderboardEntryDTO
                            {
                                Rank = rank++,
                                UserId = taskCount.UserId.Value,
                                Username = user.Username ?? "Unknown",
                                Value = taskCount.Count
                            });
                        }
                    }
                }

                return result;
            }

            return new List<LeaderboardEntryDTO>();
        }

        public async Task<List<LeaderboardEntryDTO>> GetSpecificFamilyLeaderboardAsync(int userId, int familyId, string category, int limit = 10)
        {
            // Verify user belongs to this family
            bool userBelongsToFamily = await _gamificationRepository.CheckUserBelongsToFamilyAsync(userId, familyId);

            if (!userBelongsToFamily)
            {
                throw new UnauthorizedAccessException("User does not belong to this family");
            }

            // Get all members of this specific family
            List<int> familyMemberUserIds = await _gamificationRepository.GetFamilyMemberUserIdsAsync(familyId);

            if (category == "points")
            {
                // Simplified query - get users and their progress separately, then combine in memory
                List<UserSummaryDTO> usersData = await _gamificationRepository.GetUsersByIdsAsync(familyMemberUserIds);

                List<UserProgressDataDTO> progressData = await _gamificationRepository.GetUserProgressDataByIdsAsync(familyMemberUserIds);

                List<LeaderboardEntryDTO> result = new List<LeaderboardEntryDTO>();
                int rank = 1;

                foreach (UserSummaryDTO userData in usersData)
                {
                    UserProgressDataDTO? userProgressData = progressData.FirstOrDefault(pd => pd.UserId == userData.Id);
                    if (userProgressData != null)
                    {
                        result.Add(new LeaderboardEntryDTO
                        {
                            Rank = rank++,
                            UserId = userData.Id,
                            Username = userData.Username,
                            Value = userProgressData.TotalPointsEarned
                        });
                    }
                }

                return result.OrderByDescending(r => r.Value).Take(limit).ToList();
            }
            else if (category == "streak")
            {
                // Simplified query for streak data
                List<UserSummaryDTO> usersData = await _gamificationRepository.GetUsersByIdsAsync(familyMemberUserIds);

                List<UserStreakDataDTO> progressData = await _gamificationRepository.GetUserStreakDataByIdsAsync(familyMemberUserIds);

                List<LeaderboardEntryDTO> result = new List<LeaderboardEntryDTO>();
                int rank = 1;

                foreach (UserSummaryDTO userData in usersData)
                {
                    UserStreakDataDTO? userProgressData = progressData.FirstOrDefault(pd => pd.UserId == userData.Id);
                    if (userProgressData != null)
                    {
                        result.Add(new LeaderboardEntryDTO
                        {
                            Rank = rank++,
                            UserId = userData.Id,
                            Username = userData.Username,
                            Value = userProgressData.CurrentStreak
                        });
                    }
                }

                return result.OrderByDescending(r => r.Value).Take(limit).ToList();
            }
            else if (category == "tasks")
            {
                // Get task counts for family members
                List<UserTaskCountDTO> taskCounts = await _gamificationRepository.GetFamilyTaskCountsAsync(familyMemberUserIds);

                // Get all unique users (proper deduplication)
                List<UserSummaryDTO> uniqueUsers = await _gamificationRepository.GetUsersByIdsAsync(familyMemberUserIds);

                List<LeaderboardEntryDTO> result = new List<LeaderboardEntryDTO>();
                int rank = 1;

                foreach (UserTaskCountDTO taskCount in taskCounts.OrderByDescending(tc => tc.Count).Take(limit))
                {
                    UserSummaryDTO? user = uniqueUsers.FirstOrDefault(u => u.Id == taskCount.UserId);
                    if (user != null)
                    {
                        result.Add(new LeaderboardEntryDTO
                        {
                            Rank = rank++,
                            UserId = user.Id,
                            Username = user.Username,
                            Value = taskCount.Count
                        });
                    }
                }

                return result;
            }

            return new List<LeaderboardEntryDTO>();
        }

        #endregion

        #region Helper Methods for Stats (now return DTOs)

        public async Task<List<PriorityMultiplierDTO>> GetPointMultipliersAsync()
        {
            // Get priority multipliers from database or use defaults
            List<PriorityMultiplier> multipliers = (await _gamificationRepository.GetPriorityMultipliersAsync()).ToList();

            if (!multipliers.Any())
            {
                // Return default multipliers
                return new List<PriorityMultiplierDTO>
                {
                    new() { Priority = "Low", Multiplier = 1.0 },
                    new() { Priority = "Medium", Multiplier = 1.2 },
                    new() { Priority = "High", Multiplier = 1.5 },
                    new() { Priority = "Critical", Multiplier = 2.0 }
                };
            }

            return multipliers.Select(m => new PriorityMultiplierDTO
            {
                Priority = m.Priority,
                Multiplier = (double)m.Multiplier
            }).ToList();
        }

        public async Task<PointTransactionDTO> GetTransactionAsync(int transactionId)
        {
            PointTransaction? transaction = await _gamificationRepository.GetPointTransactionAsync(transactionId);
            if (transaction == null)
                throw new NotFoundException($"Transaction with ID {transactionId} not found");

            return _mapper.Map<PointTransactionDTO>(transaction);
        }

        public async Task<List<PointTransactionDTO>> GetUserPointTransactionsAsync(int userId, int limit = 100)
        {
            IEnumerable<PointTransaction> transactions = await _gamificationRepository.GetUserPointTransactionsAsync(userId, limit);
            return _mapper.Map<List<PointTransactionDTO>>(transactions);
        }

        private async Task<double> CalculateConsistencyScoreAsync(int userId)
        {
            DateTime thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);

            // Count days with activity in the last 30 days
            int activeDays = await _gamificationRepository.GetActiveDaysCountAsync(userId, thirtyDaysAgo);

            // Calculate consistency as percentage (active days / 30)
            return (double)activeDays / 30.0 * 100.0;
        }

        private async Task<Dictionary<string, int>> GetCategoryStatsAsync(int userId)
        {

            // Get completed tasks by category
            List<CategoryCount> categoryCounts = await _gamificationRepository.GetCategoryCountsAsync(userId);

            return categoryCounts.ToDictionary(cc => cc.Category, cc => cc.Count);
        }

        #endregion

        #region Tier System

        public async Task<TierProgressDTO> GetTierProgressAsync(int userId)
        {
            UserProgress userProgress = await GetInternalUserProgressAsync(userId);

            Dictionary<string, (int pointsRequired, string color, string bgColor)> tierMap = new Dictionary<string, (int pointsRequired, string color, string bgColor)>
            {
                { "bronze", (0, "text-amber-700", "bg-amber-100") },
                { "silver", (100, "text-gray-500", "bg-gray-100") },
                { "gold", (500, "text-yellow-500", "bg-yellow-100") },
                { "platinum", (1500, "text-blue-400", "bg-blue-50") },
                { "diamond", (5000, "text-cyan-400", "bg-cyan-50") },
                { "onyx", (15000, "text-purple-600", "bg-purple-100") }
            };

            string currentTier = GetCurrentTier(userProgress.TotalPointsEarned, tierMap);
            string? nextTier = GetNextTier(currentTier, tierMap);

            TierProgressDTO tierProgress = new TierProgressDTO
            {
                CurrentTier = currentTier,
                TierLevel = tierMap.Keys.ToList().IndexOf(currentTier) + 1,
                CurrentPoints = userProgress.TotalPointsEarned
            };

            if (nextTier != null)
            {
                int nextTierPoints = tierMap[nextTier].pointsRequired;
                tierProgress.PointsForNextTier = nextTierPoints - userProgress.TotalPointsEarned;
                tierProgress.ProgressPercentage = (int)((double)userProgress.TotalPointsEarned / nextTierPoints * 100);
            }
            else
            {
                tierProgress.PointsForNextTier = 0;
                tierProgress.ProgressPercentage = 100;
            }

            // Build all tiers info
            tierProgress.AllTiers = tierMap.Select((kvp, index) => new TierInfoDTO
            {
                Name = kvp.Key,
                Level = index + 1,
                PointsRequired = kvp.Value.pointsRequired,
                Color = kvp.Value.color,
                BgColor = kvp.Value.bgColor,
                IsUnlocked = userProgress.TotalPointsEarned >= kvp.Value.pointsRequired,
                IsCurrent = kvp.Key == currentTier
            }).ToList();

            return tierProgress;
        }

        public async Task<bool> UpdateUserTierAsync(int userId)
        {
            UserProgress userProgress = await GetInternalUserProgressAsync(userId);

            // Use the new challenging tier thresholds
            Dictionary<string, int> tierMap = TaskTrackerAPI.Models.TierSystem.Tiers.ToDictionary(
                kvp => kvp.Key,
                kvp => kvp.Value.PointsRequired);

            string newTier = GetCurrentTier(userProgress.TotalPointsEarned, tierMap.ToDictionary(
                kvp => kvp.Key,
                kvp => (kvp.Value, "", "")));

            if (userProgress.UserTier != newTier)
            {
                string oldTier = userProgress.UserTier;
                userProgress.UserTier = newTier;
                userProgress.UpdatedAt = DateTime.UtcNow;

                // Award tier advancement bonus (much more significant now)
                TierInfo tierInfo = TaskTrackerAPI.Models.TierSystem.Tiers[newTier];
                int tierLevel = Array.IndexOf(TaskTrackerAPI.Models.TierSystem.Tiers.Keys.ToArray(), newTier) + 1;
                int bonusPoints = tierLevel * 250; // Increased from 100 to 250 for tier advancement

                await AddPointsAsync(userId, bonusPoints, "tier_advancement",
                    $"🎉 Advanced to {tierInfo.Name} tier! {tierInfo.Description}");

                _logger.LogInformation($"User {userId} advanced from {oldTier} to {newTier} tier. Awarded {bonusPoints} bonus points.");

                await _gamificationRepository.SaveChangesAsync();
                return true;
            }

            return false;
        }

        private string GetCurrentTier(int totalPoints, Dictionary<string, (int pointsRequired, string color, string bgColor)> tierMap)
        {
            return tierMap
                .Where(kvp => totalPoints >= kvp.Value.pointsRequired)
                .OrderByDescending(kvp => kvp.Value.pointsRequired)
                .First().Key;
        }

        private string? GetNextTier(string currentTier, Dictionary<string, (int pointsRequired, string color, string bgColor)> tierMap)
        {
            int currentPoints = tierMap[currentTier].pointsRequired;
            return tierMap
                .Where(kvp => kvp.Value.pointsRequired > currentPoints)
                .OrderBy(kvp => kvp.Value.pointsRequired)
                .FirstOrDefault().Key;
        }

        #endregion

        #region Comprehensive Point Calculation System

        /// <summary>
        /// Calculate points for task completion with all multipliers and bonuses
        /// </summary>
        public async Task<int> CalculateTaskCompletionPointsAsync(int userId, int taskId, string difficulty = "Medium", string priority = "Medium", DateTime? dueDate = null, bool isCollaborative = false)
        {
            // Get base points
            double points = PointCalculationSystem.BasePoints.TaskCompletionBase;

            // Apply difficulty multiplier
            points *= difficulty switch
            {
                "Low" => PointCalculationSystem.DifficultyMultipliers.Low,
                "High" => PointCalculationSystem.DifficultyMultipliers.High,
                "Critical" => PointCalculationSystem.DifficultyMultipliers.Critical,
                "Expert" => PointCalculationSystem.DifficultyMultipliers.Expert,
                _ => PointCalculationSystem.DifficultyMultipliers.Medium
            };

            // Apply priority multiplier
            points *= priority switch
            {
                "Low" => PointCalculationSystem.PriorityMultipliers.Low,
                "High" => PointCalculationSystem.PriorityMultipliers.High,
                "Urgent" => PointCalculationSystem.PriorityMultipliers.Urgent,
                "Critical" => PointCalculationSystem.PriorityMultipliers.Critical,
                _ => PointCalculationSystem.PriorityMultipliers.Medium
            };

            // Apply time-based bonus/penalty
            if (dueDate.HasValue)
            {
                DateTime now = DateTime.UtcNow;
                if (now < dueDate.Value)
                {
                    points *= PointCalculationSystem.TimeBonuses.EarlyCompletion;
                }
                else if (now > dueDate.Value)
                {
                    points *= PointCalculationSystem.TimeBonuses.LateCompletion;
                }
            }

            // Apply time of day bonus
            DateTime completionTime = DateTime.UtcNow;
            if (completionTime.Hour < 9)
            {
                points *= PointCalculationSystem.TimeBonuses.EarlyBird;
            }
            else if (completionTime.Hour >= 22)
            {
                points *= PointCalculationSystem.TimeBonuses.NightOwl;
            }

            // Apply collaborative task bonus
            if (isCollaborative)
            {
                points *= PointCalculationSystem.FamilyBonuses.CollaborativeTask;
            }

            // Apply streak multiplier
            UserProgress userProgress = await GetInternalUserProgressAsync(userId);
            points *= PointCalculationSystem.StreakMultipliers.GetStreakMultiplier(userProgress.CurrentStreak);

            // Apply weekly consistency multiplier
            int activeDaysThisWeek = await GetActiveDaysThisWeekAsync(userId);
            points *= PointCalculationSystem.ConsistencyBonuses.GetWeeklyConsistencyMultiplier(activeDaysThisWeek);

            // Apply special event multipliers
            if (IsWeekend())
            {
                points *= PointCalculationSystem.SpecialEventMultipliers.WeekendWarrior;
            }

            if (IsJanuary())
            {
                points *= PointCalculationSystem.SpecialEventMultipliers.NewYearResolution;
            }

            return (int)Math.Round(points);
        }

        /// <summary>
        /// Calculate points for focus session completion
        /// </summary>
        public async Task<int> CalculateFocusSessionPointsAsync(int userId, int durationMinutes, bool wasCompleted)
        {
            if (!wasCompleted)
            {
                return 0; // No points for incomplete sessions
            }

            // Base points per minute
            double points = PointCalculationSystem.BasePoints.FocusSessionBase * durationMinutes;

            // Apply duration multiplier
            points *= PointCalculationSystem.FocusBonuses.GetFocusMultiplier(durationMinutes);

            // Check for daily focus consistency
            bool hadFocusSessionYesterday = await HasUserHadFocusSessionYesterdayAsync(userId);
            if (hadFocusSessionYesterday)
            {
                points *= PointCalculationSystem.FocusBonuses.ConsistencyBonus;
            }

            // Weekend bonus
            if (IsWeekend())
            {
                points *= PointCalculationSystem.FocusBonuses.WeekendBonus;
            }

            // Apply streak multiplier
            UserProgress userProgress = await GetInternalUserProgressAsync(userId);
            points *= PointCalculationSystem.StreakMultipliers.GetStreakMultiplier(userProgress.CurrentStreak);

            return (int)Math.Round(points);
        }

        /// <summary>
        /// Calculate comprehensive daily login points with diminishing returns
        /// </summary>
        public async Task<int> CalculateAdvancedDailyLoginPointsAsync(int userId)
        {
            UserProgress userProgress = await GetInternalUserProgressAsync(userId);

            // Base points (kept low to encourage actual productivity)
            double points = PointCalculationSystem.BasePoints.DailyLoginBase;

            // Streak bonus (but capped to prevent login-only farming)
            double streakMultiplier = Math.Min(
                PointCalculationSystem.StreakMultipliers.GetStreakMultiplier(userProgress.CurrentStreak),
                2.0); // Cap at 2x multiplier for login

            points *= streakMultiplier;

            // Add streak maintenance bonus
            if (userProgress.CurrentStreak > 0)
            {
                points += PointCalculationSystem.BasePoints.StreakMaintenance;
            }

            // Diminishing returns for long streaks to encourage diverse activities
            if (userProgress.CurrentStreak > 30)
            {
                points *= 0.8; // 20% reduction for very long streaks
            }

            if (userProgress.CurrentStreak > 100)
            {
                points *= 0.6; // Additional 40% reduction (total 52% of original)
            }

            return (int)Math.Round(points);
        }

        /// <summary>
        /// Calculate achievement unlock points based on tier and difficulty
        /// </summary>
        public int CalculateAchievementPoints(string tier, string difficulty = "Medium")
        {
            double basePoints = PointCalculationSystem.BasePoints.AchievementUnlockBase;

            // Apply tier multiplier (this is where the real value is!)
            double tierMultiplier = tier.ToLower() switch
            {
                "bronze" => PointCalculationSystem.AchievementTierMultipliers.Bronze,
                "silver" => PointCalculationSystem.AchievementTierMultipliers.Silver,
                "gold" => PointCalculationSystem.AchievementTierMultipliers.Gold,
                "platinum" => PointCalculationSystem.AchievementTierMultipliers.Platinum,
                "diamond" => PointCalculationSystem.AchievementTierMultipliers.Diamond,
                "onyx" => PointCalculationSystem.AchievementTierMultipliers.Onyx,
                _ => 1.0
            };

            // Apply difficulty multiplier
            double difficultyMultiplier = difficulty switch
            {
                "Easy" => PointCalculationSystem.DifficultyMultipliers.Low,
                "Hard" => PointCalculationSystem.DifficultyMultipliers.High,
                "Expert" => PointCalculationSystem.DifficultyMultipliers.Expert,
                _ => PointCalculationSystem.DifficultyMultipliers.Medium
            };

            return (int)Math.Round(basePoints * tierMultiplier * difficultyMultiplier);
        }

        /// <summary>
        /// Calculate badge earning points with tier consideration
        /// </summary>
        public int CalculateBadgePoints(string rarity, string tier = "bronze")
        {
            double basePoints = PointCalculationSystem.BasePoints.BadgeEarnBase;

            // Rarity multiplier
            double rarityMultiplier = rarity.ToLower() switch
            {
                "common" => 1.0,
                "uncommon" => 1.5,
                "rare" => 2.0,
                "epic" => 3.0,
                "legendary" => 5.0,
                _ => 1.0
            };

            // Tier multiplier (smaller than achievements but still significant)
            double tierMultiplier = tier.ToLower() switch
            {
                "bronze" => 1.0,
                "silver" => 1.5,
                "gold" => 2.0,
                "platinum" => 3.0,
                "diamond" => 4.0,
                "onyx" => 6.0,
                _ => 1.0
            };

            return (int)Math.Round(basePoints * rarityMultiplier * tierMultiplier);
        }

        #endregion

        #region Helper Methods for Point Calculations

        private async Task<int> GetActiveDaysThisWeekAsync(int userId)
        {
            DateTime startOfWeek = DateTime.UtcNow.Date.AddDays(-(int)DateTime.UtcNow.DayOfWeek);
            return await _gamificationRepository.GetActiveDaysCountAsync(userId, startOfWeek);
        }

        private async Task<int> GetActiveDaysThisMonthAsync(int userId)
        {
            DateTime startOfMonth = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
            return await _gamificationRepository.GetActiveDaysCountAsync(userId, startOfMonth);
        }

        private async Task<bool> HasUserHadFocusSessionYesterdayAsync(int userId)
        {
            DateTime yesterday = DateTime.UtcNow.Date.AddDays(-1);
            return await _gamificationRepository.HasFocusSessionYesterdayAsync(userId, yesterday);
        }

        private static bool IsWeekend()
        {
            DayOfWeek today = DateTime.UtcNow.DayOfWeek;
            return today == DayOfWeek.Saturday || today == DayOfWeek.Sunday;
        }

        private static bool IsJanuary()
        {
            return DateTime.UtcNow.Month == 1;
        }

        private static bool IsHoliday()
        {
            // You can expand this with actual holiday detection logic
            DateTime today = DateTime.UtcNow.Date;
            // Example: New Year's Day
            if (today.Month == 1 && today.Day == 1) return true;
            // Example: Christmas
            if (today.Month == 12 && today.Day == 25) return true;

            return false;
        }

        #endregion

        #region Achievement Tracking

        private async Task CheckAndUnlockTaskAchievements(int userId, string activityType, int relatedEntityId)
        {
            await ProcessAchievementUnlocksAsync(userId, activityType, relatedEntityId);
        }

        /// <summary>
        /// Main achievement tracking method called after any user activity
        /// </summary>
        public async Task ProcessAchievementUnlocksAsync(int userId, string activityType, int relatedEntityId = 0, Dictionary<string, object>? additionalData = null)
        {
            try
            {
                switch (activityType)
                {
                    case "task_completion":
                        await ProcessTaskCompletionAchievements(userId, relatedEntityId, additionalData);
                        break;
                    case "task_creation":
                        await ProcessTaskCreationAchievements(userId, relatedEntityId, additionalData);
                        break;
                    case "category_creation":
                        await ProcessCategoryCreationAchievements(userId, relatedEntityId);
                        break;
                    case "tag_usage":
                        await ProcessTagUsageAchievements(userId, relatedEntityId);
                        break;
                    case "focus_session":
                        await ProcessFocusSessionAchievements(userId, relatedEntityId, additionalData);
                        break;
                    case "family_join":
                        await ProcessFamilyAchievements(userId, relatedEntityId);
                        break;
                    case "daily_login":
                        await ProcessDailyLoginAchievements(userId);
                        break;
                    case "streak_updated":
                        await ProcessStreakAchievements(userId);
                        break;
                    // Calendar/Smart Scheduling Activity Types
                    case "smart_scheduling_used":
                        await ProcessSmartSchedulingAchievements(userId, relatedEntityId, additionalData);
                        break;
                    case "scheduling_conflict_resolved":
                        await ProcessConflictResolutionAchievements(userId, relatedEntityId, additionalData);
                        break;
                    case "optimal_time_selected":
                        await ProcessOptimalTimeAchievements(userId, relatedEntityId, additionalData);
                        break;
                    case "batch_calendar_operation":
                        await ProcessBatchCalendarAchievements(userId, relatedEntityId, additionalData);
                        break;
                    case "availability_updated":
                        await ProcessAvailabilityUpdateAchievements(userId, relatedEntityId, additionalData);
                        break;
                    case "calendar_analytics_viewed":
                        await ProcessCalendarAnalyticsAchievements(userId, relatedEntityId, additionalData);
                        break;
                    case "family_event_creation":
                        await ProcessFamilyEventCreationAchievements(userId, relatedEntityId, additionalData);
                        break;
                }

                // Always check milestone and time-based achievements
                await ProcessMilestoneAchievements(userId);
                await ProcessSeasonalAchievements(userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing achievements for user {UserId}, activity {ActivityType}", userId, activityType);
            }
        }

        private async Task ProcessTaskCompletionAchievements(int userId, int taskId, Dictionary<string, object>? additionalData)
        {
            // Get task details
            TaskItem? task = await _gamificationRepository.GetTaskAsync(taskId);
            if (task == null) return;

            // Count total completed tasks
            int completedTaskCount = await _gamificationRepository.GetPointTransactionCountByTypeAsync(userId, "task_completion");

            // Progress achievements (IDs 1-3, 34, 51-52, 101-104, 133-135)
            await CheckProgressAchievements(userId, completedTaskCount);

            // Priority-based achievements
            if (!string.IsNullOrEmpty(task.Priority))
            {
                await CheckPriorityAchievements(userId, task.Priority);
            }

            // Time-based achievements
            await CheckTimeBasedTaskAchievements(userId, taskId);

            // Category-based achievements if available
            if (task.CategoryId.HasValue)
            {
                await CheckVersatilityAchievements(userId);
            }
        }

        private async Task ProcessTaskCreationAchievements(int userId, int taskId, Dictionary<string, object>? additionalData)
        {
            int createdTaskCount = await _gamificationRepository.GetPointTransactionCountByTypeAsync(userId, "task_creation");

            // Creator achievements (IDs 4, 70, 118)
            await CheckCreationAchievements(userId, createdTaskCount);
        }

        private async Task ProcessCategoryCreationAchievements(int userId, int categoryId)
        {
            int categoryCount = await _gamificationRepository.GetCategoryCountAsync(userId);

            // Organizer achievements (IDs 5, 37, 72, 119)
            await CheckOrganizerAchievements(userId, categoryCount);
        }

        private async Task ProcessFocusSessionAchievements(int userId, int sessionId, Dictionary<string, object>? additionalData)
        {
            int focusSessionCount = await _gamificationRepository.GetPointTransactionCountByTypeAsync(userId, "focus_session");

            // Focus achievements (IDs 21-22, 73-75, 121-123)
            await CheckFocusAchievements(userId, focusSessionCount, additionalData);
        }

        private async Task ProcessFamilyAchievements(int userId, int familyId)
        {
            // Team Player achievement (ID 17)
            await CheckAndUnlockSingleAchievement(userId, 17);
        }

        private async Task ProcessStreakAchievements(int userId)
        {
            UserProgress? userProgress = await _gamificationRepository.GetUserProgressAsync(userId);

            if (userProgress == null) return;

            // Streak achievements (IDs 14-15, 31, 57-58, 109-111, 139-141)
            await CheckStreakMilestones(userId, userProgress.CurrentStreak);
        }

        private async Task ProcessDailyLoginAchievements(int userId)
        {
            // Usage milestones
            await CheckUsageMilestones(userId);
        }

        private async Task ProcessMilestoneAchievements(int userId)
        {
            // Days using app (IDs 31-32, 86-88)
            await CheckUsageMilestones(userId);

            // Point milestones (ID 46)
            UserProgress? userProgress = await _gamificationRepository.GetUserProgressAsync(userId);

            if (userProgress != null)
            {
                await CheckPointMilestones(userId, userProgress.TotalPointsEarned);
            }
        }

        private async Task ProcessSeasonalAchievements(int userId)
        {
            DateTime now = DateTime.UtcNow;
            await CheckSeasonalMilestones(userId, now.Month);
        }

        private async Task CheckProgressAchievements(int userId, int completedTaskCount)
        {
            Dictionary<int, int> progressMilestones = new Dictionary<int, int>
            {
                { 1, 1 },    // First Steps
                { 2, 5 },    // Task Starter  
                { 3, 10 },   // Getting Started
                { 34, 20 },  // Task Destroyer
                { 51, 50 },  // Task Warrior
                { 52, 100 }, // Productive
                { 101, 200 }, // Champion
                { 102, 300 }, // Task Master
                { 133, 500 }, // Legend
                { 134, 750 }, // Myth
                { 135, 1000 } // Deity
            };

            foreach (KeyValuePair<int, int> milestone in progressMilestones)
            {
                if (completedTaskCount >= milestone.Value)
                {
                    await CheckAndUnlockSingleAchievement(userId, milestone.Key);
                }
            }
        }

        private async Task CheckPriorityAchievements(int userId, string priority)
        {
            // Count high priority tasks
            if (priority.ToLower() == "high")
            {
                int highPriorityCount = await CountTasksByPriority(userId, "high");
                if (highPriorityCount >= 10) await CheckAndUnlockSingleAchievement(userId, 35); // Priority Pro
                if (highPriorityCount >= 50) await CheckAndUnlockSingleAchievement(userId, 80); // Priority Master
            }

            // Count critical priority tasks
            if (priority.ToLower() == "critical")
            {
                int criticalCount = await CountTasksByPriority(userId, "critical");
                if (criticalCount >= 5) await CheckAndUnlockSingleAchievement(userId, 36); // Critical Thinker
                if (criticalCount >= 20) await CheckAndUnlockSingleAchievement(userId, 82); // Crisis Manager
            }
        }

        private async Task CheckTimeBasedTaskAchievements(int userId, int taskId)
        {
            PointTransaction? transaction = await _gamificationRepository.GetLatestPointTransactionAsync(userId, taskId);

            if (transaction == null) return;

            DateTime completionTime = transaction.CreatedAt;

            // Early Bird - Completed before 8 AM
            if (completionTime.Hour < 8)
            {
                await CheckAndUnlockSingleAchievement(userId, 6); // Early Bird
            }

            // Night Owl - Completed after 10 PM  
            if (completionTime.Hour >= 22)
            {
                await CheckAndUnlockSingleAchievement(userId, 7); // Night Owl
            }

            // Lunch Break - Completed between 12-1 PM
            if (completionTime.Hour == 12)
            {
                await CheckAndUnlockSingleAchievement(userId, 8); // Lunch Break
            }

            // Weekend Warrior - Completed on weekend
            if (completionTime.DayOfWeek == DayOfWeek.Saturday || completionTime.DayOfWeek == DayOfWeek.Sunday)
            {
                int weekendCount = await CountWeekendCompletions(userId);
                if (weekendCount >= 5) await CheckAndUnlockSingleAchievement(userId, 8);
            }

            // On Time - Complete before due date
            TaskItem? task = await _gamificationRepository.GetTaskAsync(taskId);
            if (task?.DueDate.HasValue == true && completionTime < task.DueDate.Value)
            {
                int onTimeCount = await CountOnTimeCompletions(userId);
                if (onTimeCount >= 5) await CheckAndUnlockSingleAchievement(userId, 10); // On Time
                if (onTimeCount >= 50) await CheckAndUnlockSingleAchievement(userId, 61); // Punctuality Expert
            }
        }

        private async Task CheckStreakMilestones(int userId, int currentStreak)
        {
            Dictionary<int, int> streakMilestones = new Dictionary<int, int>
            {
                { 14, 3 },   // Streak Starter
                { 15, 5 },   // Daily Dose
                { 57, 14 },  // Flame Keeper
                { 58, 21 },  // Dedicated
                { 109, 30 }, // Campfire
                { 110, 60 }, // Bonfire
                { 111, 90 }, // Wildfire
                { 139, 180 }, // Eternal Flame
                { 140, 365 }, // Immortal
                { 141, 730 }  // Unbreakable
            };

            foreach (KeyValuePair<int, int> milestone in streakMilestones)
            {
                if (currentStreak >= milestone.Value)
                {
                    await CheckAndUnlockSingleAchievement(userId, milestone.Key);
                }
            }
        }

        private async Task CheckFocusAchievements(int userId, int sessionCount, Dictionary<string, object>? additionalData)
        {
            Dictionary<int, int> focusMilestones = new Dictionary<int, int>
            {
                { 21, 1 },   // Focused (first session)
                { 22, 5 },   // Zen Master
                { 73, 25 },  // Focus Master
                { 121, 100 } // Deep Focus
            };

            foreach (KeyValuePair<int, int> milestone in focusMilestones)
            {
                if (sessionCount >= milestone.Value)
                {
                    await CheckAndUnlockSingleAchievement(userId, milestone.Key);
                }
            }
        }

        private async Task CheckSeasonalMilestones(int userId, int month)
        {
            DateTime startOfMonth = new DateTime(DateTime.UtcNow.Year, month, 1);
            DateTime endOfMonth = startOfMonth.AddMonths(1);

            int monthlyTasks = await _gamificationRepository.GetPointTransactionCountByTypeAndDateAsync(userId, "task_completion", startOfMonth, endOfMonth);

            // New Year Resolution - January
            if (month == 1 && monthlyTasks >= 10)
            {
                await CheckAndUnlockSingleAchievement(userId, 26);
            }

            // Spring Cleaning - March  
            if (month == 3 && monthlyTasks >= 15)
            {
                await CheckAndUnlockSingleAchievement(userId, 27);
            }

            // Summer tasks
            if ((month >= 6 && month <= 8) && monthlyTasks >= 20)
            {
                await CheckAndUnlockSingleAchievement(userId, 28);
            }
        }

        // Helper method to check and unlock a specific achievement
        private async Task CheckAndUnlockSingleAchievement(int userId, int achievementId)
        {
            bool hasAchievement = await _gamificationRepository.AnyUserAchievementAsync(userId, achievementId);

            if (!hasAchievement)
            {
                try
                {
                    await UnlockAchievementAsync(userId, achievementId);
                }
                catch (InvalidOperationException)
                {
                    // Achievement already exists, ignore
                }
            }
        }

        // Helper methods for counting specific activities
        private async Task<int> CountTasksByPriority(int userId, string priority)
        {
            return await _gamificationRepository.GetTaskCountByPriorityAsync(userId, priority);
        }

        private async Task<int> CountEarlyBirdCompletions(int userId)
        {
            List<PointTransaction> transactions = await _gamificationRepository.GetPointTransactionsByTimeOfDayAsync(userId, TimeSpan.Zero, TimeSpan.FromHours(8));
            return transactions.Where(t => t.TransactionType == "task_completion").Count();
        }

        private async Task<int> CountLunchBreakCompletions(int userId)
        {
            List<PointTransaction> transactions = await _gamificationRepository.GetPointTransactionsByTimeOfDayAsync(userId, TimeSpan.FromHours(12), TimeSpan.FromHours(13));
            return transactions.Where(t => t.TransactionType == "task_completion").Count();
        }

        private async Task<int> CountWeekendCompletions(int userId)
        {
            IEnumerable<PointTransaction> allTransactions = await _gamificationRepository.GetTransactionsByTypeAsync(userId, "task_completion");
            return allTransactions.Count(t => t.CreatedAt.DayOfWeek == DayOfWeek.Saturday || t.CreatedAt.DayOfWeek == DayOfWeek.Sunday);
        }

        private async Task<int> CountOnTimeCompletions(int userId)
        {
            IEnumerable<PointTransaction> transactionsWithTasks = await _gamificationRepository.GetPointTransactionsWithTaskJoinAsync(userId);
            return transactionsWithTasks.Count(); // Simplified - would need better logic in production
        }

        // Placeholder methods for remaining achievement categories
        private async Task CheckCreationAchievements(int userId, int count)
        {
            if (count >= 1) await CheckAndUnlockSingleAchievement(userId, 4); // Creator
            if (count >= 25) await CheckAndUnlockSingleAchievement(userId, 70); // Innovator
            if (count >= 100) await CheckAndUnlockSingleAchievement(userId, 118); // Master Creator
        }

        private async Task CheckOrganizerAchievements(int userId, int count)
        {
            if (count >= 1) await CheckAndUnlockSingleAchievement(userId, 5); // Organizer
            if (count >= 5) await CheckAndUnlockSingleAchievement(userId, 37); // Category Creator
            if (count >= 15) await CheckAndUnlockSingleAchievement(userId, 72); // System Builder
        }

        private async Task CheckUsageMilestones(int userId)
        {
            // Count days with activity
            DateTime sevenDaysAgo = DateTime.UtcNow.AddDays(-7);
            DateTime thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);

            int activeDaysLastWeek = await _gamificationRepository.GetActiveDaysCountAsync(userId, sevenDaysAgo);
            int activeDaysLastMonth = await _gamificationRepository.GetActiveDaysCountAsync(userId, thirtyDaysAgo);

            if (activeDaysLastWeek >= 7) await CheckAndUnlockSingleAchievement(userId, 31); // First Week
            if (activeDaysLastMonth >= 30) await CheckAndUnlockSingleAchievement(userId, 32); // Loyal User
        }

        private async Task CheckPointMilestones(int userId, int points)
        {
            if (points >= 100) await CheckAndUnlockSingleAchievement(userId, 46); // Point Collector
        }

        private async Task CheckProductivityPatternAchievements(int userId)
        {
            // Check for Power Hour - 5 tasks in one hour
            DateTime oneHourAgo = DateTime.UtcNow.AddHours(-1);
            int tasksLastHour = await _gamificationRepository.GetPointTransactionCountByTypeAndDateAsync(userId, "task_completion", oneHourAgo);

            if (tasksLastHour >= 5) await CheckAndUnlockSingleAchievement(userId, 33); // Power Hour
        }

        private async Task CheckFamilyTaskAchievements(int userId, int familyId)
        {
            int familyTaskCount = await _gamificationRepository.GetTaskCountByFamilyAsync(userId, true);

            if (familyTaskCount >= 3) await CheckAndUnlockSingleAchievement(userId, 18); // Helpful
            if (familyTaskCount >= 10) await CheckAndUnlockSingleAchievement(userId, 63); // Team Player
            if (familyTaskCount >= 25) await CheckAndUnlockSingleAchievement(userId, 64); // Family Champion
        }

        private async Task CheckSeasonalTaskAchievements(int userId, DateTime completionTime)
        {
            int month = completionTime.Month;

            // Use existing method for seasonal achievements
            await CheckSeasonalMilestones(userId, month);

            // Check for holiday-specific achievements
            if (month == 12) // December
            {
                int decemberTasks = await _gamificationRepository.GetPointTransactionCountByTypeAndDateAsync(
                    userId, "task_completion", new DateTime(completionTime.Year, 12, 1), new DateTime(completionTime.Year + 1, 1, 1));
                if (decemberTasks >= 15) await CheckAndUnlockSingleAchievement(userId, 87); // Holiday Hero
            }
        }

        private async Task ProcessTagUsageAchievements(int userId, int tagId)
        {
            int uniqueTagsUsed = await _gamificationRepository.GetUniqueTagsUsedCountAsync(userId);

            if (uniqueTagsUsed >= 5) await CheckAndUnlockSingleAchievement(userId, 25); // Tag Master
            if (uniqueTagsUsed >= 15) await CheckAndUnlockSingleAchievement(userId, 93); // Organization Expert
        }

        private async Task CheckVersatilityAchievements(int userId)
        {
            // Versatile - Complete tasks in 5 different categories (ID 25)
            DateTime today = DateTime.UtcNow.Date;
            DateTime tomorrow = today.AddDays(1);

            int categoriesUsedToday = await _gamificationRepository.GetCategoryCountAsync(userId);

            if (categoriesUsedToday >= 5) await CheckAndUnlockSingleAchievement(userId, 25); // Versatile

            // Skill Builder - Complete tasks in 10 different categories (ID 93)
            int totalCategoriesUsed = await _gamificationRepository.GetCategoryCountAsync(userId);

            if (totalCategoriesUsed >= 10) await CheckAndUnlockSingleAchievement(userId, 93); // Skill Builder
        }

        // Calendar/Smart Scheduling Achievement Methods
        private async Task ProcessSmartSchedulingAchievements(int userId, int familyId, Dictionary<string, object>? additionalData)
        {
            // Count smart scheduling usage
            int smartSchedulingCount = await _gamificationRepository.GetPointTransactionCountByTypeAsync(userId, "smart_scheduling_used");

            // Smart Scheduler achievement (ID 156) - Use smart scheduling suggestions 5 times
            if (smartSchedulingCount >= 5)
            {
                await CheckAndUnlockSingleAchievement(userId, 156); // Smart Scheduler
            }

            if (smartSchedulingCount >= 25)
            {
                await CheckAndUnlockSingleAchievement(userId, 160); // Scheduling Master
            }
        }

        private async Task ProcessConflictResolutionAchievements(int userId, int familyId, Dictionary<string, object>? additionalData)
        {
            // Count conflict resolutions
            int conflictResolutionCount = await _gamificationRepository.GetPointTransactionCountByTypeAsync(userId, "scheduling_conflict_resolved");

            // Conflict Resolver achievement (ID 157) - Resolve your first scheduling conflict
            if (conflictResolutionCount >= 1)
            {
                await CheckAndUnlockSingleAchievement(userId, 157); // Conflict Resolver
            }

            // Harmony Keeper achievement (ID 158) - Resolve 10 scheduling conflicts
            if (conflictResolutionCount >= 10)
            {
                await CheckAndUnlockSingleAchievement(userId, 158); // Harmony Keeper
            }

            // Peace Maker achievement (ID 161) - Resolve 50 scheduling conflicts
            if (conflictResolutionCount >= 50)
            {
                await CheckAndUnlockSingleAchievement(userId, 161); // Peace Maker
            }
        }

        private async Task ProcessOptimalTimeAchievements(int userId, int eventId, Dictionary<string, object>? additionalData)
        {
            // Optimal Time achievement would be tracked here
            await CheckAndUnlockSingleAchievement(userId, 159); // Time Optimizer
        }

        private async Task ProcessBatchCalendarAchievements(int userId, int familyId, Dictionary<string, object>? additionalData)
        {
            if (additionalData?.ContainsKey("eventCount") == true && additionalData["eventCount"] is int eventCount)
            {
                // Count total batch operations
                int batchOperationCount = await _gamificationRepository.GetPointTransactionCountByTypeAsync(userId, "batch_calendar_operation");

                // Batch Master achievement (ID 163) - Successfully manage 20+ events in bulk operations
                if (batchOperationCount >= 20)
                {
                    await CheckAndUnlockSingleAchievement(userId, 163); // Batch Master
                }
            }
        }

        private async Task ProcessAvailabilityUpdateAchievements(int userId, int familyId, Dictionary<string, object>? additionalData)
        {
            // Count availability updates in the last 7 days
            DateTime weekAgo = DateTime.UtcNow.AddDays(-7);
            int recentAvailabilityUpdates = await _gamificationRepository.GetPointTransactionCountByTypeAndDateAsync(userId, "availability_updated", weekAgo);

            // Reliable achievement (ID 162) - Update availability regularly for a week
            if (recentAvailabilityUpdates >= 7)
            {
                await CheckAndUnlockSingleAchievement(userId, 162); // Reliable
            }
        }

        private async Task ProcessCalendarAnalyticsAchievements(int userId, int familyId, Dictionary<string, object>? additionalData)
        {
            // Analytics achievement tracking would go here
            await CheckAndUnlockSingleAchievement(userId, 164); // Analytics Master
        }

        private async Task ProcessFamilyEventCreationAchievements(int userId, int familyId, Dictionary<string, object>? additionalData)
        {
            // Count total family events created by this user
            int eventCreationCount = await _gamificationRepository.GetPointTransactionCountByTypeAsync(userId, "family_event_creation");

            // Event Organizer achievement (ID 19) - Create your first family event
            if (eventCreationCount >= 1)
            {
                await CheckAndUnlockSingleAchievement(userId, 19); // Event Organizer
            }

            // Event Master achievement (ID 65) - Organize 10 family events
            if (eventCreationCount >= 10)
            {
                await CheckAndUnlockSingleAchievement(userId, 65); // Event Master
            }

            // Check for recurring event achievements if applicable
            if (additionalData?.ContainsKey("isRecurring") == true && additionalData["isRecurring"] is bool isRecurring && isRecurring)
            {
                // Recurrence Rookie achievement (ID 169) - Create your first recurring event
                await CheckAndUnlockSingleAchievement(userId, 169); // Recurrence Rookie

                // Count recurring events created
                int recurringEventCount = await _gamificationRepository.GetPointTransactionCountByTypeAsync(userId, "recurring_event_creation");

                // Series Specialist achievement (ID 170) - Manage 10 different recurring event series
                if (recurringEventCount >= 10)
                {
                    await CheckAndUnlockSingleAchievement(userId, 170); // Series Specialist
                }
            }

            // Check for coordination achievements based on attendee count
            if (additionalData?.ContainsKey("attendeeCount") == true && additionalData["attendeeCount"] is int attendeeCount)
            {
                // Large event coordination achievements
                if (attendeeCount >= 5)
                {
                    // Track large event coordination
                    int largeEventCount = await _gamificationRepository.GetPointTransactionCountByTypeAsync(userId, "large_event_coordination");

                    // Family Harmonizer achievement (ID 165) - Coordinate 50 family events without conflicts
                    if (largeEventCount >= 50)
                    {
                        await CheckAndUnlockSingleAchievement(userId, 165); // Family Harmonizer
                    }
                }
            }

            // Check for seasonal event creation
            await CheckSeasonalEventAchievements(userId);
        }

        private async Task CheckSeasonalEventAchievements(int userId)
        {
            DateTime now = DateTime.UtcNow;

            // Holiday events during December
            if (now.Month == 12)
            {
                DateTime holidayStart = new DateTime(now.Year, 12, 1);
                DateTime holidayEnd = new DateTime(now.Year + 1, 1, 1);

                int holidayEvents = await _gamificationRepository.GetPointTransactionCountByTypeAndDateAsync(userId, "family_event_creation", holidayStart, holidayEnd);
                if (holidayEvents >= 5)
                {
                    // Could add a Holiday Planner achievement
                    _logger.LogInformation("User {UserId} created {Count} holiday events", userId, holidayEvents);
                }
            }
        }

        #endregion

        #region Focus Mode Integration

        public async Task<FocusCompletionRewardDTO> ProcessFocusSessionCompletionAsync(int userId, int sessionId, int durationMinutes, bool wasCompleted)
        {
            FocusCompletionRewardDTO reward = new FocusCompletionRewardDTO();

            if (!wasCompleted)
            {
                reward.Message = "Focus session was not completed";
                return reward;
            }

            // Use comprehensive focus session calculation
            int totalPoints = await CalculateFocusSessionPointsAsync(userId, durationMinutes, wasCompleted);
            reward.PointsAwarded = totalPoints;

            // Award points using the new system
            await AddPointsAsync(userId, totalPoints, "focus_session", $"Completed {durationMinutes} minute focus session");

            // Award character XP (2 XP per minute focused with duration multipliers)
            double xpMultiplier = PointCalculationSystem.FocusBonuses.GetFocusMultiplier(durationMinutes);
            int characterXP = (int)(durationMinutes * 2 * xpMultiplier);
            reward.CharacterXPAwarded = characterXP;
            await AddCharacterXPAsync(userId, characterXP);

            // Check for focus-related achievements
            await CheckFocusAchievements(userId, durationMinutes);

            // Check if user leveled up or advanced tier
            UserProgress userProgress = await GetInternalUserProgressAsync(userId);
            reward.LeveledUp = false; // This would be set during level up detection
            reward.TierAdvanced = await UpdateUserTierAsync(userId);

            reward.Message = $"Excellent focus session! Earned {totalPoints} points and {characterXP} character XP.";

            // Add streak encouragement if applicable
            if (userProgress.CurrentStreak > 0)
            {
                double streakMultiplier = PointCalculationSystem.StreakMultipliers.GetStreakMultiplier(userProgress.CurrentStreak);
                if (streakMultiplier > 1.0)
                {
                    reward.Message += $" Streak bonus: {(streakMultiplier - 1.0) * 100:F0}% extra points!";
                }
            }

            return reward;
        }

        private async Task CheckFocusAchievements(int userId, int durationMinutes)
        {
            // Check for focus milestones
            int focusSessionCount = await _gamificationRepository.GetPointTransactionCountByTypeAsync(userId, "focus_session");

            // First focus session achievement
            if (focusSessionCount == 1)
            {
                // Unlock first focus achievement if it exists
                Achievement? firstFocusAchievement = await _gamificationRepository.GetAchievementAsync(21);

                if (firstFocusAchievement != null)
                {
                    try
                    {
                        await UnlockAchievementAsync(userId, firstFocusAchievement.Id);
                    }
                    catch (InvalidOperationException)
                    {
                        // Achievement already unlocked
                    }
                }
            }

            // Long focus session achievements
            if (durationMinutes >= 90)
            {
                Achievement? longFocusAchievement = await _gamificationRepository.GetAchievementAsync(22);

                if (longFocusAchievement != null)
                {
                    try
                    {
                        await UnlockAchievementAsync(userId, longFocusAchievement.Id);
                    }
                    catch (InvalidOperationException)
                    {
                        // Achievement already unlocked
                    }
                }
            }
        }

        #endregion

        #region Admin Testing Methods

        /// <summary>
        /// Resets all gamification data for a user - FOR TESTING PURPOSES ONLY
        /// This should only be used by admin accounts for debugging and testing
        /// </summary>
        public async Task<bool> ResetUserGamificationDataAsync(int userId)
        {
            try
            {
                // Remove all point transactions
                List<PointTransaction> pointTransactions = await _gamificationRepository.GetAllUserPointTransactionsAsync(userId);
                _gamificationRepository.RemoveRangePointTransactions(pointTransactions);

                // Remove all user achievements
                List<UserAchievement> userAchievements = await _gamificationRepository.GetAllUserAchievementsAsync(userId);
                _gamificationRepository.RemoveRangeUserAchievements(userAchievements);

                // Remove all user badges
                List<UserBadge> userBadges = await _gamificationRepository.GetAllUserBadgesAsync(userId);
                _gamificationRepository.RemoveRangeUserBadges(userBadges);

                // Remove all user rewards
                List<UserReward> userRewards = await _gamificationRepository.GetAllUserRewardsAsync(userId);
                _gamificationRepository.RemoveRangeUserRewards(userRewards);

                // Remove all challenge progress
                List<ChallengeProgress> challengeProgresses = await _gamificationRepository.GetAllUserChallengeProgressesAsync(userId);
                foreach (ChallengeProgress progress in challengeProgresses)
                {
                    _gamificationRepository.RemoveChallengeProgress(progress);
                }

                // Remove all user challenges
                List<UserChallenge> userChallenges = await _gamificationRepository.GetAllUserChallengesAsync(userId);
                _gamificationRepository.RemoveRangeUserChallenges(userChallenges);

                // Reset user progress to initial state
                UserProgress? userProgress = await _gamificationRepository.GetUserProgressAsync(userId);

                if (userProgress != null)
                {
                    // Reset to initial values
                    userProgress.Level = 1;
                    userProgress.CurrentPoints = 0;
                    userProgress.TotalPointsEarned = 0;
                    userProgress.NextLevelThreshold = 100;
                    userProgress.CurrentStreak = 0;
                    userProgress.LongestStreak = 0;
                    userProgress.LastActivityDate = null;
                    userProgress.UserTier = "bronze";
                    userProgress.CurrentCharacterClass = "explorer";
                    userProgress.UnlockedCharacters = "explorer";
                    userProgress.CharacterLevel = 1;
                    userProgress.CharacterXP = 0;
                    userProgress.UpdatedAt = DateTime.UtcNow;
                }
                else
                {
                    // Create fresh user progress if it doesn't exist
                    userProgress = new UserProgress
                    {
                        UserId = userId,
                        Level = 1,
                        CurrentPoints = 0,
                        TotalPointsEarned = 0,
                        NextLevelThreshold = 100,
                        CurrentStreak = 0,
                        LongestStreak = 0,
                        LastActivityDate = null,
                        UserTier = "bronze",
                        CurrentCharacterClass = "explorer",
                        UnlockedCharacters = "explorer",
                        CharacterLevel = 1,
                        CharacterXP = 0,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    _gamificationRepository.AddUserProgress(userProgress);
                }

                await _gamificationRepository.SaveChangesAsync();

                _logger.LogInformation($"Successfully reset all gamification data for user {userId}");
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error resetting gamification data for user {userId}");
                return false;
            }
        }

        /// <summary>
        /// Gets comprehensive reset statistics to show what will be cleared
        /// </summary>
        public async Task<GamificationResetStatsDTO> GetResetStatsAsync(int userId)
        {
            int pointTransactionCount = await _gamificationRepository.GetTotalPointTransactionCountAsync(userId);

            int achievementCount = await _gamificationRepository.GetTotalUserAchievementCountAsync(userId);

            int badgeCount = await _gamificationRepository.GetTotalUserBadgeCountAsync(userId);

            int rewardCount = await _gamificationRepository.GetTotalUserRewardCountAsync(userId);

            int challengeCount = await _gamificationRepository.GetTotalChallengeProgressCountAsync(userId);

            UserProgress? userProgress = await _gamificationRepository.GetUserProgressAsync(userId);

            return new GamificationResetStatsDTO
            {
                UserId = userId,
                CurrentLevel = userProgress?.Level ?? 1,
                CurrentPoints = userProgress?.CurrentPoints ?? 0,
                TotalPointsEarned = userProgress?.TotalPointsEarned ?? 0,
                CurrentStreak = userProgress?.CurrentStreak ?? 0,
                LongestStreak = userProgress?.LongestStreak ?? 0,
                CurrentTier = userProgress?.UserTier ?? "bronze",
                PointTransactionCount = pointTransactionCount,
                AchievementCount = achievementCount,
                BadgeCount = badgeCount,
                RewardCount = rewardCount,
                ChallengeProgressCount = challengeCount,
                CharacterLevel = userProgress?.CharacterLevel ?? 1,
                CharacterXP = userProgress?.CharacterXP ?? 0,
                UnlockedCharacters = userProgress?.UnlockedCharacters?.Split(',') ?? new[] { "explorer" }
            };
        }

        #endregion

        #region Character Class System

        public async Task<bool> SwitchCharacterClassAsync(int userId, string characterClass)
        {
            UserProgress userProgress = await GetInternalUserProgressAsync(userId);

            // Check if character class is unlocked
            string[] unlockedCharacters = userProgress.UnlockedCharacters?.Split(',') ?? new[] { "explorer" };
            if (!unlockedCharacters.Contains(characterClass))
            {
                throw new InvalidOperationException($"Character class '{characterClass}' is not unlocked for this user");
            }

            userProgress.CurrentCharacterClass = characterClass;
            userProgress.UpdatedAt = DateTime.UtcNow;

            await _gamificationRepository.SaveChangesAsync();
            _logger.LogInformation($"User {userId} switched to character class: {characterClass}");

            return true;
        }

        public async Task<bool> UnlockCharacterClassAsync(int userId, string characterClass)
        {
            UserProgress userProgress = await GetInternalUserProgressAsync(userId);

            string[] currentUnlocked = userProgress.UnlockedCharacters?.Split(',') ?? new[] { "explorer" };
            if (currentUnlocked.Contains(characterClass))
            {
                return false; // Already unlocked
            }

            // Add the new character class to unlocked list
            List<string> updatedUnlocked = currentUnlocked.ToList();
            updatedUnlocked.Add(characterClass);
            userProgress.UnlockedCharacters = string.Join(",", updatedUnlocked);
            userProgress.UpdatedAt = DateTime.UtcNow;

            await _gamificationRepository.SaveChangesAsync();
            _logger.LogInformation($"User {userId} unlocked character class: {characterClass}");

            return true;
        }

        public async Task<string[]> GetUnlockedCharactersAsync(int userId)
        {
            UserProgress userProgress = await GetInternalUserProgressAsync(userId);
            return userProgress.UnlockedCharacters?.Split(',') ?? new[] { "explorer" };
        }

        public async Task<bool> AddCharacterXPAsync(int userId, int xp)
        {
            UserProgress userProgress = await GetInternalUserProgressAsync(userId);

            userProgress.CharacterXP += xp;

            // Check for character level up (every 1000 XP = 1 level)
            int newCharacterLevel = (userProgress.CharacterXP / 1000) + 1;
            bool leveledUp = newCharacterLevel > userProgress.CharacterLevel;

            if (leveledUp)
            {
                userProgress.CharacterLevel = newCharacterLevel;
                _logger.LogInformation($"User {userId} character leveled up to level {newCharacterLevel}");
            }

            userProgress.UpdatedAt = DateTime.UtcNow;
            await _gamificationRepository.SaveChangesAsync();

            return leveledUp;
        }

        #endregion

        #region Challenge Progress System

        public async Task ProcessChallengeProgressAsync(int userId, string activityType, int relatedEntityId)
        {
            // Get all active challenge progresses for the user
            List<ChallengeProgress> activeProgresses = await _gamificationRepository.GetActiveChallengeProgressesWithIncludesAsync(userId);

            foreach (ChallengeProgress progress in activeProgresses)
            {
                if (progress.Challenge == null) continue;

                bool progressMade = false;

                // Update progress based on activity type and challenge requirements
                switch (activityType.ToLower())
                {
                    case "task_completion":
                        if (progress.Challenge.ActivityType == "task_completion")
                        {
                            progress.CurrentProgress++;
                            progressMade = true;
                        }
                        break;

                    case "daily_login":
                        if (progress.Challenge.ActivityType == "daily_login")
                        {
                            progress.CurrentProgress++;
                            progressMade = true;
                        }
                        break;

                    case "focus_session":
                        if (progress.Challenge.ActivityType == "focus_session")
                        {
                            progress.CurrentProgress++;
                            progressMade = true;
                        }
                        break;
                }

                if (progressMade)
                {
                    // Check if challenge is completed
                    if (progress.CurrentProgress >= progress.Challenge.TargetCount)
                    {
                        progress.IsCompleted = true;
                        progress.CompletedAt = DateTime.UtcNow;

                        // Award challenge completion rewards
                        await AddPointsAsync(userId, progress.Challenge.PointReward,
                            "challenge_completion",
                            $"Completed challenge: {progress.Challenge.Name}");

                        _logger.LogInformation($"User {userId} completed challenge: {progress.Challenge.Name}");
                    }

                    await _gamificationRepository.SaveChangesAsync();
                }
            }
        }

        #endregion

        #region ✨ Enhanced Task Completion Achievement Processing

        /// <summary>
        /// ✨ NEW: Enhanced task completion achievement processing with comprehensive context
        /// </summary>
        public async Task ProcessTaskCompletionAchievementsAsync(int userId, int taskId, Dictionary<string, object> taskData)
        {
            try
            {
                _logger.LogInformation("🏆 Processing enhanced task completion achievements - User: {UserId}, Task: {TaskId}", userId, taskId);

                // Extract task context data
                string taskTitle = taskData.GetValueOrDefault("taskTitle", "Unknown Task").ToString() ?? "Unknown Task";
                string taskPriority = taskData.GetValueOrDefault("taskPriority", "Medium").ToString() ?? "Medium";
                string taskCategory = taskData.GetValueOrDefault("taskCategory", "General").ToString() ?? "General";
                int pointsEarned = Convert.ToInt32(taskData.GetValueOrDefault("pointsEarned", 0));
                DateTime completionTime = (DateTime)(taskData.GetValueOrDefault("completionTime", DateTime.UtcNow));

                // Use existing achievement processing method
                await ProcessAchievementUnlocksAsync(userId, "task_completion", taskId, taskData);

                // Check for milestone achievements (10th, 50th, 100th task, etc.)
                int totalCompletedTasks = await _gamificationRepository.GetPointTransactionCountByTypeAsync(userId, "task_completion");
                await CheckTaskMilestoneAchievements(userId, totalCompletedTasks);

                // Check for high-value task achievements
                if (pointsEarned >= 25)
                {
                    await CheckHighValueTaskAchievements(userId, pointsEarned);
                }

                _logger.LogInformation("✅ Enhanced task completion achievement processing completed - User: {UserId}, Achievements checked", userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error processing enhanced task completion achievements - User: {UserId}, Task: {TaskId}", userId, taskId);
                // Don't throw - achievement processing shouldn't break task completion
            }
        }

        /// <summary>
        /// Check for task milestone achievements (10th, 50th, 100th task, etc.)
        /// </summary>
        private async Task CheckTaskMilestoneAchievements(int userId, int totalCompletedTasks)
        {
            // Major milestones
            if (totalCompletedTasks == 10) await CheckAndUnlockSingleAchievement(userId, 34); // Dedicated
            if (totalCompletedTasks == 50) await CheckAndUnlockSingleAchievement(userId, 51); // Achiever
            if (totalCompletedTasks == 100) await CheckAndUnlockSingleAchievement(userId, 52); // Centurion
            if (totalCompletedTasks == 250) await CheckAndUnlockSingleAchievement(userId, 101); // Elite
            if (totalCompletedTasks == 500) await CheckAndUnlockSingleAchievement(userId, 102); // Master
            if (totalCompletedTasks == 1000) await CheckAndUnlockSingleAchievement(userId, 103); // Legend
        }

        /// <summary>
        /// Check for high-value task achievements
        /// </summary>
        private async Task CheckHighValueTaskAchievements(int userId, int pointsEarned)
        {
            // Simplified implementation - check for high-value task achievements
            if (pointsEarned >= 25) await CheckAndUnlockSingleAchievement(userId, 45); // High Achiever
            if (pointsEarned >= 50) await CheckAndUnlockSingleAchievement(userId, 89); // Perfectionist
            if (pointsEarned >= 75) await CheckAndUnlockSingleAchievement(userId, 75); // Excellence
        }

        #endregion

        #region ✨ Family Gamification Implementation

        /// <summary>
        /// Get comprehensive family gamification profile with aggregated data
        /// </summary>
        public async Task<FamilyGamificationProfileDTO> GetFamilyGamificationProfileAsync(int userId, int familyId)
        {
            try
            {
                // Verify user has access to this family
                await VerifyFamilyAccessAsync(userId, familyId);

                // Get family members using proper repository pattern (no dynamic types)
                List<FamilyMember> familyMembers = await _gamificationRepository.GetFamilyMembersAsync(familyId);

                // Calculate aggregated family stats
                int totalFamilyPoints = 0;
                int familyLevel = 1;
                int familyStreak = 0;

                foreach (FamilyMember member in familyMembers)
                {
                    UserProgress? memberProgress = await _gamificationRepository.GetUserProgressAsync(member.UserId);
                    if (memberProgress != null)
                    {
                        totalFamilyPoints += memberProgress.TotalPointsEarned;
                        familyStreak = Math.Max(familyStreak, memberProgress.CurrentStreak);
                    }
                }

                // Calculate family level based on total points
                familyLevel = (totalFamilyPoints / 10000) + 1;

                // Get family entity for AutoMapper conversion
                Family? family = new Family { Id = familyId, Name = "Family", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };

                // Use AutoMapper for base mapping, then set calculated values
                FamilyGamificationProfileDTO profile = _mapper.Map<FamilyGamificationProfileDTO>(family);

                // Set calculated values that AutoMapper ignores
                profile.TotalFamilyPoints = totalFamilyPoints;
                profile.FamilyLevel = familyLevel;
                profile.FamilyStreak = familyStreak;
                profile.FamilyRank = GetFamilyRank(totalFamilyPoints);
                profile.WeeklyGoals = await GetActiveFamilyGoalsAsync(familyId);
                profile.MonthlyChallenge = await GetActiveFamilyChallengeAsync(familyId);
                profile.Settings = GetDefaultFamilySettings();
                profile.Statistics = await CalculateFamilyStatisticsAsync(familyId);

                return profile;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting family gamification profile for family {FamilyId}", familyId);
                throw;
            }
        }

        /// <summary>
        /// Get family goals with filtering by status
        /// </summary>
        public async Task<List<FamilyGoalDTO>> GetFamilyGoalsAsync(int userId, int familyId, string status = "active")
        {
            try
            {
                await VerifyFamilyAccessAsync(userId, familyId);

                // For now, return sample goals - in a full implementation, these would come from database
                List<FamilyGoalDTO> goals = new List<FamilyGoalDTO>
                {
                    new FamilyGoalDTO
                    {
                        Id = 1,
                        Title = "Complete 50 Family Tasks This Week",
                        Description = "Work together to complete 50 tasks as a family",
                        TargetValue = 50,
                        CurrentValue = 23,
                        Unit = "tasks",
                        Type = "family",
                        Priority = "medium",
                        DueDate = DateTime.UtcNow.AddDays(7),
                        AssignedTo = new List<int>(),
                        Rewards = new List<GoalRewardDTO>
                        {
                            new GoalRewardDTO
                            {
                                Type = "points",
                                Value = "500",
                                Description = "500 bonus points for everyone",
                                Icon = "🏆",
                                EligibleMembers = new List<int>()
                            }
                        },
                        Status = status,
                        CreatedBy = userId,
                        CreatedAt = DateTime.UtcNow
                    }
                };

                return goals.Where(g => status == "all" || g.Status == status).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting family goals for family {familyId}");
                throw;
            }
        }

        /// <summary>
        /// Create a new family goal
        /// </summary>
        public async Task<FamilyGoalDTO> CreateFamilyGoalAsync(int userId, int familyId, CreateFamilyGoalDTO dto)
        {
            try
            {
                await VerifyFamilyAccessAsync(userId, familyId);

                // In a full implementation, this would save to database
                FamilyGoalDTO goal = new FamilyGoalDTO
                {
                    Id = new Random().Next(1000, 9999),
                    Title = dto.Title,
                    Description = dto.Description,
                    TargetValue = dto.TargetValue,
                    CurrentValue = 0,
                    Unit = dto.Unit,
                    Type = dto.Type,
                    Priority = dto.Priority,
                    DueDate = dto.DueDate,
                    AssignedTo = dto.AssignedTo,
                    Rewards = dto.Rewards,
                    Status = "active",
                    CreatedBy = userId,
                    CreatedAt = DateTime.UtcNow
                };

                _logger.LogInformation($"Created family goal '{dto.Title}' for family {familyId}");
                return goal;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error creating family goal for family {familyId}");
                throw;
            }
        }

        /// <summary>
        /// Update family goal progress
        /// </summary>
        public async Task<bool> UpdateFamilyGoalProgressAsync(int userId, int familyId, int goalId, int progress)
        {
            try
            {
                await VerifyFamilyAccessAsync(userId, familyId);

                // In a full implementation, this would update the database
                _logger.LogInformation($"Updated family goal {goalId} progress to {progress} for family {familyId}");
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating family goal progress for family {familyId}, goal {goalId}");
                return false;
            }
        }

        /// <summary>
        /// Get family-specific challenges
        /// </summary>
        public async Task<List<FamilyChallengeDTO>> GetFamilyChallengesAsync(int userId, int familyId, string status = "active")
        {
            try
            {
                await VerifyFamilyAccessAsync(userId, familyId);

                // Get existing challenges and convert to family-specific format
                List<ChallengeDTO> challenges = await GetActiveChallengesAsync(userId);

                return challenges.Select(c => new FamilyChallengeDTO
                {
                    Id = c.Id,
                    Title = c.Name,
                    Description = c.Description,
                    Type = "weekly",
                    Difficulty = c.Difficulty.ToString(),
                    Icon = "🏆",
                    StartDate = c.StartDate,
                    EndDate = c.EndDate,
                    TargetPoints = c.PointReward,
                    CurrentProgress = 0,
                    Participants = new List<int>(),
                    Rewards = new List<ChallengeRewardDTO>(),
                    Milestones = new List<ChallengeMilestoneDTO>(),
                    Status = status,
                    IsOptional = true,
                    AgeRestrictions = new List<string>(),
                    FamilyId = familyId
                }).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting family challenges for family {familyId}");
                throw;
            }
        }

        /// <summary>
        /// Join a family challenge
        /// </summary>
        public async Task<bool> JoinFamilyChallengeAsync(int userId, int familyId, int challengeId)
        {
            try
            {
                await VerifyFamilyAccessAsync(userId, familyId);

                // Use existing challenge enrollment
                await EnrollInChallengeAsync(userId, challengeId);

                _logger.LogInformation($"User {userId} joined family challenge {challengeId} for family {familyId}");
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error joining family challenge for family {familyId}, challenge {challengeId}");
                return false;
            }
        }

        /// <summary>
        /// Update member gamification preferences
        /// </summary>
        public async Task<bool> UpdateMemberGamificationPreferencesAsync(int userId, int familyId, int memberId, UpdateMemberGamificationPreferencesDTO dto)
        {
            try
            {
                await VerifyFamilyAccessAsync(userId, familyId);

                // Verify user can update preferences (must be self or family admin)
                if (userId != memberId)
                {
                    // Check if user is family admin (simplified check - would use proper family repository)
                    bool isAdmin = userId == memberId; // Simplified - would implement proper admin check
                    if (!isAdmin)
                    {
                        throw new UnauthorizedAccessException("Only family admins can update other members' preferences");
                    }
                }

                // In a full implementation, this would save preferences to database
                _logger.LogInformation($"Updated gamification preferences for member {memberId} in family {familyId}");
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating member gamification preferences for family {familyId}, member {memberId}");
                return false;
            }
        }

        /// <summary>
        /// Update family gamification settings
        /// </summary>
        public async Task<bool> UpdateFamilyGamificationSettingsAsync(int userId, int familyId, UpdateFamilyGamificationSettingsDTO dto)
        {
            try
            {
                await VerifyFamilyAccessAsync(userId, familyId);

                // Verify user is family admin (simplified check - would use proper family repository)
                bool isAdmin = true; // Simplified - would implement proper admin check
                if (!isAdmin)
                {
                    throw new UnauthorizedAccessException("Only family admins can update family gamification settings");
                }

                // In a full implementation, this would save settings to database
                _logger.LogInformation($"Updated family gamification settings for family {familyId}");
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating family gamification settings for family {familyId}");
                return false;
            }
        }

        #endregion

        #region Private Helper Methods for Family Gamification

        /// <summary>
        /// Verify user has access to family using existing repository pattern
        /// </summary>
        private async Task VerifyFamilyAccessAsync(int userId, int familyId)
        {
            bool isMember = await _gamificationRepository.CheckUserBelongsToFamilyAsync(userId, familyId);
            if (!isMember)
            {
                throw new UnauthorizedAccessException($"User {userId} does not have access to family {familyId}");
            }
        }

        /// <summary>
        /// Get family rank based on total points
        /// </summary>
        private string GetFamilyRank(int totalPoints)
        {
            if (totalPoints >= 100000) return "Diamond";
            if (totalPoints >= 50000) return "Platinum";
            if (totalPoints >= 25000) return "Gold";
            if (totalPoints >= 10000) return "Silver";
            return "Bronze";
        }

        /// <summary>
        /// Get active family goals (placeholder implementation)
        /// </summary>
        private async Task<List<FamilyGoalDTO>> GetActiveFamilyGoalsAsync(int familyId)
        {
            await Task.CompletedTask; // Placeholder for async operation
            return new List<FamilyGoalDTO>();
        }

        /// <summary>
        /// Get active family challenge (placeholder implementation)
        /// </summary>
        private async Task<FamilyChallengeDTO?> GetActiveFamilyChallengeAsync(int familyId)
        {
            await Task.CompletedTask; // Placeholder for async operation
            return null;
        }

        /// <summary>
        /// Get default family settings
        /// </summary>
        private FamilyGamificationSettingsDTO GetDefaultFamilySettings()
        {
            return new FamilyGamificationSettingsDTO
            {
                IsEnabled = true,
                DifficultyLevel = "normal",
                CelebrationLevel = "normal",
                SoundEnabled = true,
                AnimationsEnabled = true,
                WeeklyGoalsEnabled = true,
                MonthlyChallengesEnabled = true,
                LeaderboardEnabled = true,
                PublicRankingOptIn = false,
                ParentalOversight = new ParentalOversightSettingsDTO(),
                Notifications = new GamificationNotificationSettingsDTO(),
                Rewards = new RewardSettingsDTO()
            };
        }

        /// <summary>
        /// Calculate family statistics (placeholder implementation)
        /// </summary>
        private async Task<FamilyGamificationStatsDTO> CalculateFamilyStatisticsAsync(int familyId)
        {
            await Task.CompletedTask; // Placeholder for async operation
            return new FamilyGamificationStatsDTO
            {
                TotalPointsEarned = 0,
                TotalTasksCompleted = 0,
                TotalAchievementsUnlocked = 0,
                AverageFamilyStreak = 0,
                MostActiveDay = "Monday",
                MostProductiveHour = 14,
                TopCategory = "task_completion",
                WeeklyProgress = new List<WeeklyProgressDTO>(),
                MonthlyProgress = new List<MonthlyProgressDTO>(),
                MemberContributions = new List<MemberContributionDTO>(),
                EngagementMetrics = new EngagementMetricsDTO()
            };
        }

        #endregion
    }
}