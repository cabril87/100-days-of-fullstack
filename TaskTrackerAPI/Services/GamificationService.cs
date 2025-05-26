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
using TaskTrackerAPI.Data;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Services.Interfaces;
using TaskTrackerAPI.DTOs.Gamification;
using TaskTrackerAPI.Models.Gamification;
using GamificationModels = TaskTrackerAPI.Models.Gamification;

namespace TaskTrackerAPI.Services
{
    // DTO classes to enable explicit types for LINQ projections
    internal class CategoryCount
    {
        public string Category { get; set; } = default!;
        public int Count { get; set; }
    }

    public class GamificationService : IGamificationService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<GamificationService> _logger;
        private readonly IMapper _mapper;

        public GamificationService(ApplicationDbContext context, ILogger<GamificationService> logger, IMapper mapper)
        {
            _context = context;
            _logger = logger;
            _mapper = mapper;
        }

        #region User Progress

        public async Task<UserProgressDTO> GetUserProgressAsync(int userId)
        {
            UserProgress? userProgress = await _context.UserProgresses
                .FirstOrDefaultAsync(up => up.UserId == userId);

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

                _context.UserProgresses.Add(userProgress);
                await _context.SaveChangesAsync();
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
                TaskItem? task = await _context.Tasks.FindAsync(taskId.Value);
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
            
            // Create a point transaction record
            PointTransaction transaction = new PointTransaction
            {
                UserId = userId,
                Points = finalPoints,
                TransactionType = transactionType,
                Description = $"{description} (Earned: {finalPoints} points)",
                TaskId = taskId,
                CreatedAt = DateTime.UtcNow
            };

            _context.PointTransactions.Add(transaction);
            
            // Update user progress
            userProgress.CurrentPoints += finalPoints;
            userProgress.TotalPointsEarned += finalPoints;
            userProgress.UpdatedAt = DateTime.UtcNow;
            
            // Check for level up
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
            
            await _context.SaveChangesAsync();
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
            
            await _context.SaveChangesAsync();
        }
        
        private async Task CheckForStreakAchievements(int userId, int currentStreak)
        {
            // Find achievements related to streaks
            List<Achievement> streakAchievements = await _context.Achievements
                .Where(a => a.Category == "Streak" && !_context.UserAchievements.Any(ua => ua.UserId == userId && ua.AchievementId == a.Id))
                .ToListAsync();
                
            foreach (Achievement achievement in streakAchievements)
            {
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
            List<UserAchievement> userAchievements = await _context.UserAchievements
                .Include(ua => ua.Achievement)
                .Where(ua => ua.UserId == userId)
                .OrderByDescending(ua => ua.CompletedAt)
                .ToListAsync();

            return _mapper.Map<List<UserAchievementDTO>>(userAchievements);
        }

        public async Task<List<AchievementDTO>> GetAvailableAchievementsAsync(int userId)
        {
            // Get all achievements except those already unlocked by the user
            List<int> unlockedAchievementIds = await _context.UserAchievements
                .Where(ua => ua.UserId == userId && ua.IsCompleted)
                .Select(ua => ua.AchievementId)
                .ToListAsync();
                
            List<Achievement> availableAchievements = await _context.Achievements
                .Where(a => !unlockedAchievementIds.Contains(a.Id) && !a.IsDeleted)
                .OrderBy(a => a.Category)
                .ThenBy(a => a.Name)
                .ToListAsync();

            return _mapper.Map<List<AchievementDTO>>(availableAchievements);
        }

        public async Task<UserAchievementDTO> UnlockAchievementAsync(int userId, int achievementId)
        {
            // Check if already unlocked
            UserAchievement? existingUnlock = await _context.UserAchievements
                .FirstOrDefaultAsync(ua => ua.UserId == userId && ua.AchievementId == achievementId);
                
            if (existingUnlock != null && existingUnlock.IsCompleted)
            {
                throw new InvalidOperationException("Achievement already unlocked");
            }
            
            // Get the achievement
            Achievement? achievement = await _context.Achievements.FindAsync(achievementId);
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
                _context.UserAchievements.Add(existingUnlock);
            }
            else
            {
                existingUnlock.Progress = 100;
                existingUnlock.IsCompleted = true;
                existingUnlock.CompletedAt = DateTime.UtcNow;
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
            
            await _context.SaveChangesAsync();
            
            // Load the achievement relationship
            await _context.Entry(existingUnlock).Reference(ua => ua.Achievement).LoadAsync();
            
            return _mapper.Map<UserAchievementDTO>(existingUnlock);
        }
        
        private async Task UnlockLevelBasedAchievements(int userId, int level)
        {
            // Find achievements related to level milestones
            List<Achievement> levelAchievements = await _context.Achievements
                .Where(a => a.Category == "Level" && !_context.UserAchievements.Any(ua => ua.UserId == userId && ua.AchievementId == a.Id))
                .ToListAsync();
                
            foreach (Achievement achievement in levelAchievements)
            {
                // Check if the level meets the criteria
                if (int.TryParse(achievement.Criteria, out int targetValue) && level >= targetValue)
                {
                    try
                    {
                        await UnlockAchievementAsync(userId, achievement.Id);
                    }
                    catch (InvalidOperationException)
                    {
                        // Achievement already unlocked, ignore
                    }
                }
            }
        }

        #endregion
        
        #region Badges

        public async Task<List<UserBadgeDTO>> GetUserBadgesAsync(int userId)
        {
            List<GamificationModels.UserBadge> userBadges = await _context.UserBadges
                .Include(ub => ub.Badge)
                .Where(ub => ub.UserId == userId)
                .OrderByDescending(ub => ub.AwardedAt)
                .ToListAsync();

            return _mapper.Map<List<UserBadgeDTO>>(userBadges);
        }

        public async Task<UserBadgeDTO> AwardBadgeAsync(int userId, int badgeId)
        {
            // Check if already awarded
            GamificationModels.UserBadge? existingBadge = await _context.UserBadges
                .FirstOrDefaultAsync(ub => ub.UserId == userId && ub.BadgeId == badgeId);
                
            if (existingBadge != null)
            {
                throw new InvalidOperationException("Badge already awarded");
            }
            
            // Get the badge
            GamificationModels.Badge? badge = await _context.Badges.FindAsync(badgeId);
            if (badge == null)
            {
                throw new ArgumentException("Badge not found", nameof(badgeId));
            }
            
            // Create the user badge record
            GamificationModels.UserBadge userBadge = new GamificationModels.UserBadge
            {
                UserId = userId,
                BadgeId = badgeId,
                IsDisplayed = true,
                AwardedAt = DateTime.UtcNow
            };
            
            _context.UserBadges.Add(userBadge);
            
            // Award points for earning this badge
            await AddPointsAsync(userId, badge.PointValue, "badge", $"Earned badge: {badge.Name}");
            
            await _context.SaveChangesAsync();
            
            // Load the badge relationship
            await _context.Entry(userBadge).Reference(ub => ub.Badge).LoadAsync();
            
            return _mapper.Map<UserBadgeDTO>(userBadge);
        }

        public async Task<bool> ToggleBadgeDisplayAsync(int userId, int badgeId, bool isDisplayed)
        {
            GamificationModels.UserBadge? userBadge = await _context.UserBadges
                .FirstOrDefaultAsync(ub => ub.UserId == userId && ub.BadgeId == badgeId);
                
            if (userBadge == null)
            {
                throw new ArgumentException("User does not have this badge", nameof(badgeId));
            }
            
            userBadge.IsDisplayed = isDisplayed;
            await _context.SaveChangesAsync();
            
            return true;
        }

        #endregion
        
        #region Rewards

        public async Task<List<RewardDTO>> GetAvailableRewardsAsync(int userId)
        {
            UserProgress userProgress = await GetInternalUserProgressAsync(userId);
            
            // Return ALL active rewards, frontend will handle locked/unlocked display
            List<Reward> rewards = await _context.Rewards
                .Where(r => r.IsActive)
                .OrderBy(r => r.MinimumLevel)
                .ThenBy(r => r.PointCost)
                .ToListAsync();

            // Map to DTOs and include user's level info for frontend to determine lock status
            var rewardDTOs = _mapper.Map<List<RewardDTO>>(rewards);
            
            // Add user context to each reward
            foreach (var reward in rewardDTOs)
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
            Reward? reward = await _context.Rewards.FindAsync(rewardId);
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
            
            _context.PointTransactions.Add(transaction);
            
            // Create user reward record
            UserReward userReward = new UserReward
            {
                UserId = userId,
                RewardId = rewardId,
                IsUsed = false,
                RedeemedAt = DateTime.UtcNow
            };
            
            _context.UserRewards.Add(userReward);
            await _context.SaveChangesAsync();
            
            // Load the reward relationship
            await _context.Entry(userReward).Reference(ur => ur.Reward).LoadAsync();
            
            return _mapper.Map<UserRewardDTO>(userReward);
        }

        // Helper method to get internal UserProgress for use within the service
        private async Task<UserProgress> GetInternalUserProgressAsync(int userId)
        {
            UserProgress? userProgress = await _context.UserProgresses
                .FirstOrDefaultAsync(up => up.UserId == userId);

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

                _context.UserProgresses.Add(userProgress);
                await _context.SaveChangesAsync();
            }

            return userProgress;
        }

        public async Task<bool> UseRewardAsync(int userRewardId)
        {
            UserReward? userReward = await _context.UserRewards.FindAsync(userRewardId);
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
            
            await _context.SaveChangesAsync();
            return true;
        }

        #endregion
        
        #region Challenges

        /// <summary>
        /// Gets user's active challenges with progress information
        /// </summary>
        public async Task<List<UserActiveChallengeDTO>> GetUserActiveChallengesAsync(int userId)
        {
            var activeChallenges = await _context.ChallengeProgresses
                .Where(cp => cp.UserId == userId && !cp.IsCompleted)
                .Include(cp => cp.Challenge)
                .Select(cp => new UserActiveChallengeDTO
                {
                    Id = cp.Id,
                    ChallengeId = cp.ChallengeId,
                    ChallengeName = cp.Challenge != null ? cp.Challenge.Name : "Unknown",
                    ChallengeDescription = cp.Challenge != null ? cp.Challenge.Description : "",
                    CurrentProgress = cp.CurrentProgress,
                    TargetProgress = cp.Challenge != null ? cp.Challenge.TargetCount : 0,
                    ProgressPercentage = cp.Challenge != null && cp.Challenge.TargetCount > 0 
                        ? Math.Min(100, (cp.CurrentProgress * 100) / cp.Challenge.TargetCount) 
                        : 0,
                    PointReward = cp.Challenge != null ? cp.Challenge.PointReward : 0,
                    EndDate = cp.Challenge != null ? cp.Challenge.EndDate : null,
                    EnrolledAt = cp.EnrolledAt,
                    DaysRemaining = cp.Challenge != null && cp.Challenge.EndDate.HasValue 
                        ? Math.Max(0, (int)(cp.Challenge.EndDate.Value - DateTime.UtcNow).TotalDays)
                        : null,
                    ActivityType = cp.Challenge != null ? cp.Challenge.ActivityType : "",
                    Difficulty = cp.Challenge != null ? cp.Challenge.Difficulty : 1
                })
                .OrderByDescending(c => c.EnrolledAt)
                .ToListAsync();

            return activeChallenges;
        }

        /// <summary>
        /// Leaves/abandons a challenge
        /// </summary>
        public async Task<bool> LeaveChallengeAsync(int userId, int challengeId)
        {
            var challengeProgress = await _context.ChallengeProgresses
                .FirstOrDefaultAsync(cp => cp.UserId == userId && cp.ChallengeId == challengeId && !cp.IsCompleted);
                
            if (challengeProgress == null)
            {
                return false; // Not enrolled or already completed
            }
            
            // Remove the challenge progress
            _context.ChallengeProgresses.Remove(challengeProgress);
            
            // Also remove the user challenge record
            var userChallenge = await _context.UserChallenges
                .FirstOrDefaultAsync(uc => uc.UserId == userId && uc.ChallengeId == challengeId && !uc.IsCompleted);
                
            if (userChallenge != null)
            {
                _context.UserChallenges.Remove(userChallenge);
            }
            
            await _context.SaveChangesAsync();
            
            _logger.LogInformation($"User {userId} left challenge {challengeId}");
            return true;
        }

        public async Task<List<ChallengeDTO>> GetActiveChallengesAsync(int userId)
        {
            // Get challenges user is enrolled in but hasn't completed
            List<int> enrolledChallengeIds = await _context.ChallengeProgresses
                .Where(cp => cp.UserId == userId && !cp.IsCompleted)
                .Select(cp => cp.ChallengeId)
                .ToListAsync();
                
            // Get active challenges user isn't enrolled in yet
            List<Challenge> availableChallenges = await _context.Challenges
                .Where(c => c.IsActive && !enrolledChallengeIds.Contains(c.Id))
                .ToListAsync();
                
            // Get challenges user is enrolled in
            List<Challenge> enrolledChallenges = await _context.Challenges
                .Where(c => enrolledChallengeIds.Contains(c.Id))
                .ToListAsync();
                
            // Combine and return
            var allChallenges = availableChallenges.Concat(enrolledChallenges)
                .OrderBy(c => c.EndDate)
                .ToList();

            return _mapper.Map<List<ChallengeDTO>>(allChallenges);
        }

        public async Task<UserChallengeDTO> EnrollInChallengeAsync(int userId, int challengeId)
        {
            // Check if already enrolled
            ChallengeProgress? existingEnrollment = await _context.ChallengeProgresses
                .FirstOrDefaultAsync(cp => cp.UserId == userId && cp.ChallengeId == challengeId);
                
            if (existingEnrollment != null)
            {
                throw new InvalidOperationException("User already enrolled in this challenge");
            }
            
            // Check active challenge limit (2 challenges max)
            int activeChallengeCount = await _context.ChallengeProgresses
                .CountAsync(cp => cp.UserId == userId && !cp.IsCompleted);
                
            if (activeChallengeCount >= 2)
            {
                throw new InvalidOperationException("You can only participate in 2 challenges at a time. Complete or leave an existing challenge before joining a new one.");
            }
            
            // Get the challenge
            Challenge? challenge = await _context.Challenges.FindAsync(challengeId);
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
            
            _context.UserChallenges.Add(userChallenge);
            
            // Also create a progress record for tracking
            ChallengeProgress challengeProgress = new ChallengeProgress
            {
                UserId = userId,
                ChallengeId = challengeId,
                CurrentProgress = 0,
                IsCompleted = false,
                EnrolledAt = DateTime.UtcNow
            };
            
            _context.ChallengeProgresses.Add(challengeProgress);
            await _context.SaveChangesAsync();
            
            _logger.LogInformation($"User {userId} enrolled in challenge {challengeId}. Active challenges: {activeChallengeCount + 1}/2");
            
            // Load the challenge relationship
            await _context.Entry(userChallenge).Reference(uc => uc.Challenge).LoadAsync();
            
            return _mapper.Map<UserChallengeDTO>(userChallenge);
        }

        public async Task<ChallengeDTO?> GetChallengeForUserAsync(int userId)
        {
            try
            {
                // First look for an active challenge the user is already working on
                ChallengeProgress? activeProgress = await _context.ChallengeProgresses
                .Where(cp => cp.UserId == userId && !cp.IsCompleted)
                    .FirstOrDefaultAsync();
                
                if (activeProgress != null)
            {
                // Get the challenge directly since navigation property is ignored
                    Challenge? challenge = await _context.Challenges
                        .FindAsync(activeProgress.ChallengeId);
                    
                    if (challenge != null)
                    {
                        return _mapper.Map<ChallengeDTO>(challenge);
                    }
                }
                
                // Otherwise, suggest a new challenge the user hasn't completed yet
                List<int> completedChallengeIds = await _context.ChallengeProgresses
                    .Where(cp => cp.UserId == userId && cp.IsCompleted)
                    .Select(cp => cp.ChallengeId)
                    .ToListAsync();
                
                Challenge? suggestedChallenge = await _context.Challenges
                    .Where(c => c.IsActive && !completedChallengeIds.Contains(c.Id))
                    .OrderBy(c => c.Difficulty)
                    .FirstOrDefaultAsync();
                
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
            Challenge? challenge = await _context.Challenges.FindAsync(challengeId);
            if (challenge == null)
            {
                throw new ArgumentException("Challenge not found", nameof(challengeId));
            }
            
            ChallengeProgress? progress = await _context.ChallengeProgresses
                .FirstOrDefaultAsync(cp => cp.UserId == userId && cp.ChallengeId == challengeId);
                
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
                
                _context.ChallengeProgresses.Add(progress);
                await _context.SaveChangesAsync();
            }
            
            return _mapper.Map<ChallengeProgressDTO>(progress);
        }

        public async Task<ChallengeProgressDTO> UnlockChallengeAsync(int userId, int challengeId)
        {
            // Get the challenge
            Challenge? challenge = await _context.Challenges.FindAsync(challengeId);
            if (challenge == null)
            {
                throw new ArgumentException("Challenge not found", nameof(challengeId));
            }
            
            // Check if user already has progress for this challenge
            ChallengeProgress? existingProgress = await _context.ChallengeProgresses
                .FirstOrDefaultAsync(cp => cp.UserId == userId && cp.ChallengeId == challengeId);
                
            if (existingProgress != null)
            {
                return _mapper.Map<ChallengeProgressDTO>(existingProgress); // Already unlocked
            }
            
            // Create new progress entry
            ChallengeProgress progress = new ChallengeProgress
            {
                UserId = userId,
                ChallengeId = challengeId,
                CurrentProgress = 0,
                IsCompleted = false,
                EnrolledAt = DateTime.UtcNow
            };
            
            _context.ChallengeProgresses.Add(progress);
            await _context.SaveChangesAsync();
            
            return _mapper.Map<ChallengeProgressDTO>(progress);
        }

        #endregion
        
        #region Daily Login

        public async Task<PointTransactionDTO> ProcessDailyLoginAsync(int userId)
        {
            // Check if already logged in today
            bool hasLoggedIn = await HasUserLoggedInTodayAsync(userId);
            if (hasLoggedIn)
            {
                throw new InvalidOperationException("User has already claimed daily login bonus today");
            }
            
            // Get user progress to check streak
            UserProgress userProgress = await GetInternalUserProgressAsync(userId);
            
            // Calculate points based on streak
            int points = CalculateDailyLoginPoints(userProgress.CurrentStreak);
            
            // Update streak
            await UpdateStreakAsync(userId);
            
            // Add points
            int transactionId = await AddPointsAsync(userId, points, "daily_login", "Daily login bonus");
            
            // Return the created transaction
            PointTransaction? transaction = await _context.PointTransactions.FindAsync(transactionId);
            if (transaction == null)
            {
                throw new InvalidOperationException("Failed to create transaction record");
            }
            
            return _mapper.Map<PointTransactionDTO>(transaction);
        }

        private int CalculateDailyLoginPoints(int currentStreak)
        {
            // Base points plus streak bonus
            int basePoints = 10;
            int streakBonus = Math.Min(currentStreak, 30) * 2; // Cap at 30 days
            
            return basePoints + streakBonus;
        }

        public async Task<bool> HasUserLoggedInTodayAsync(int userId)
        {
            DateTime today = DateTime.UtcNow.Date;
            
            // Check for a daily login transaction today
            return await _context.PointTransactions
                .AnyAsync(pt => pt.UserId == userId && pt.TransactionType == "daily_login" && pt.CreatedAt.Date == today);
        }

        public async Task<DailyLoginStatusDetailDTO> GetDailyLoginStatusAsync(int userId)
        {
            bool hasLoggedIn = await HasUserLoggedInTodayAsync(userId);
            UserProgress userProgress = await GetInternalUserProgressAsync(userId);
            
            LoginStatus loginStatus = new LoginStatus
            {
                HasClaimedToday = hasLoggedIn,
                CurrentStreak = userProgress.CurrentStreak,
                PotentialPoints = CalculateDailyLoginPoints(userProgress.CurrentStreak)
            };

            var result = _mapper.Map<DailyLoginStatusDetailDTO>(loginStatus);
            result.UserId = userId;
            result.LastLoginDate = userProgress.LastActivityDate ?? DateTime.UtcNow;

            return result;
        }

        #endregion
        
        #region Suggestions and Stats

        public async Task<List<GamificationSuggestionDetailDTO>> GetGamificationSuggestionsAsync(int userId)
        {
            List<GamificationSuggestionDetailDTO> suggestions = new List<GamificationSuggestionDetailDTO>();
            UserProgressDTO userProgress = await GetUserProgressAsync(userId);
            
            // Suggestion 1: Complete a task if there are incomplete tasks
            List<TaskItem> incompleteTasks = await _context.Tasks
                .Where(t => t.AssignedToId == userId && !t.IsCompleted)
                .ToListAsync();
                
            if (incompleteTasks.Count > 0)
            {
                TaskItem? task = incompleteTasks.FirstOrDefault();
                if (task != null)
                {
                    suggestions.Add(new GamificationSuggestionDetailDTO
                    {
                        SuggestionType = "task",
                        Title = "Complete a task",
                        Description = $"Complete \"{task.Title}\" to earn points and make progress.",
                        Priority = 8,
                        RequiredPoints = 10,
                        ActionType = "complete_task",
                        ActionId = task.Id
                    });
                }
            }
            
            // Suggestion 2: Maintain streak
            if (userProgress.LastActivityDate.Date != DateTime.UtcNow.Date)
            {
                suggestions.Add(new GamificationSuggestionDetailDTO
                {
                    SuggestionType = "login",
                    Title = "Check in today",
                    Description = $"Log in today to maintain your {userProgress.HighestStreak} day streak.",
                    Priority = 9,
                    RequiredPoints = 5,
                    ActionType = "login",
                    ActionId = 0
                });
            }
            
            return suggestions;
        }

        public async Task<GamificationStatsDTO> GetGamificationStatsAsync(int userId)
        {
            // Get basic user progress via DTO
            UserProgressDTO userProgress = await GetUserProgressAsync(userId);
            
            // Count completed tasks
            int completedTasks = await _context.Tasks
                .CountAsync(t => t.AssignedToId == userId && t.IsCompleted);
                
            // Count achievements and badges
            int achievementsUnlocked = await _context.UserAchievements
                .CountAsync(ua => ua.UserId == userId);
                
            int badgesEarned = await _context.UserBadges
                .CountAsync(ub => ub.UserId == userId);
                
            int rewardsRedeemed = await _context.UserRewards
                .CountAsync(ur => ur.UserId == userId);
                
            // Calculate consistency score (0-100)
            double consistencyScore = await CalculateConsistencyScoreAsync(userId);
            
            // Get task category stats
            Dictionary<string, int> categoryStats = await GetCategoryStatsAsync(userId);
            
            // Get top users on leaderboard via DTO
            List<LeaderboardEntryDTO> topUsers = await GetLeaderboardAsync("points", 5);
            
            return new GamificationStatsDTO
            {
                Progress = userProgress,
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
                var leaderboardData = await _context.UserProgresses
                    .OrderByDescending(up => up.TotalPointsEarned)
                    .Take(limit)
                    .Select(up => new LeaderboardEntryDTO
                    {
                        UserId = up.UserId,
                        Username = up.User != null ? up.User.Username : "Unknown",
                        Value = up.TotalPointsEarned,
                        Rank = 0 // Will be assigned below
                    })
                    .ToListAsync();

                // Assign ranks
                for (int i = 0; i < leaderboardData.Count; i++)
                {
                    leaderboardData[i].Rank = i + 1;
                }

                return leaderboardData;
            }
            else if (category == "streak")
            {
                // Leaderboard by current streak
                var leaderboardData = await _context.UserProgresses
                    .OrderByDescending(up => up.CurrentStreak)
                    .Take(limit)
                    .Select(up => new LeaderboardEntryDTO
                    {
                        UserId = up.UserId,
                        Username = up.User != null ? up.User.Username : "Unknown",
                        Value = up.CurrentStreak,
                        Rank = 0 // Will be assigned below
                    })
                    .ToListAsync();

                // Assign ranks
                for (int i = 0; i < leaderboardData.Count; i++)
                {
                    leaderboardData[i].Rank = i + 1;
                }

                return leaderboardData;
            }
            else if (category == "tasks")
            {
                // Leaderboard by completed tasks
                List<GeneralUserTaskCountDTO> userTaskCounts = await _context.Tasks
                    .Where(t => t.IsCompleted && t.AssignedToId.HasValue)
                    .GroupBy(t => t.AssignedToId)
                    .Select(g => new GeneralUserTaskCountDTO { UserId = g.Key, Count = g.Count() })
                    .OrderByDescending(x => x.Count)
                    .Take(limit)
                    .ToListAsync();
                
                List<LeaderboardEntryDTO> result = new List<LeaderboardEntryDTO>();
                
                foreach (GeneralUserTaskCountDTO item in userTaskCounts)
                {
                    if (item.UserId.HasValue)
                    {
                        User? user = await _context.Users.FindAsync(item.UserId.Value);
                        if (user != null)
                        {
                            result.Add(new LeaderboardEntryDTO
                            {
                                UserId = item.UserId.Value,
                                Username = user.Username,
                                Value = item.Count,
                                Rank = result.Count + 1
                            });
                        }
                    }
                }
                
                return result;
            }
            else
            {
                throw new ArgumentException("Invalid leaderboard category", nameof(category));
            }
        }

        public async Task<List<LeaderboardEntryDTO>> GetFamilyMembersLeaderboardAsync(int userId, string category, int limit = 10)
        {
            // Get all families the user belongs to
            List<int> userFamilyIds = await _context.FamilyMembers
                .Where(fm => fm.UserId == userId)
                .Select(fm => fm.FamilyId)
                .ToListAsync();

            if (!userFamilyIds.Any())
            {
                return new List<LeaderboardEntryDTO>();
            }

            // Get all unique family member user IDs (explicit deduplication)
            List<int> familyMemberUserIds = await _context.FamilyMembers
                .Where(fm => userFamilyIds.Contains(fm.FamilyId))
                .Select(fm => fm.UserId)
                .Distinct()
                .ToListAsync();

            if (category == "points")
            {
                // Simplified query - get users and their progress separately, then combine in memory
                List<UserSummaryDTO> usersData = await _context.Users
                    .Where(u => familyMemberUserIds.Contains(u.Id))
                    .Select(u => new UserSummaryDTO { Id = u.Id, Username = u.Username })
                    .ToListAsync();

                List<UserProgressDataDTO> progressData = await _context.UserProgresses
                    .Where(up => familyMemberUserIds.Contains(up.UserId))
                    .Select(up => new UserProgressDataDTO { UserId = up.UserId, TotalPointsEarned = up.TotalPointsEarned })
                    .ToListAsync();

                // Combine in memory and handle deduplication (both users and progress data)
                Dictionary<int, int> userProgressMap = progressData
                    .GroupBy(p => p.UserId)
                    .ToDictionary(g => g.Key, g => g.Max(x => x.TotalPointsEarned));
                
                List<LeaderboardEntryDTO> leaderboard = usersData
                    .GroupBy(u => new { u.Id, u.Username })
                    .Select(g => g.First())
                    .Select(user => new LeaderboardEntryDTO
                    {
                        UserId = user.Id,
                        Username = user.Username,
                        Value = userProgressMap.GetValueOrDefault(user.Id, 0),
                        Rank = 0 // Will be assigned below
                    })
                    .OrderByDescending(entry => entry.Value)
                    .Take(limit)
                    .ToList();

                // Assign ranks
                for (int i = 0; i < leaderboard.Count; i++)
                {
                    leaderboard[i].Rank = i + 1;
                }

                return leaderboard;
            }
            else if (category == "streak")
            {
                // Simplified query for streak data
                List<UserSummaryDTO> usersData = await _context.Users
                    .Where(u => familyMemberUserIds.Contains(u.Id))
                    .Select(u => new UserSummaryDTO { Id = u.Id, Username = u.Username })
                    .ToListAsync();

                List<UserStreakDataDTO> progressData = await _context.UserProgresses
                    .Where(up => familyMemberUserIds.Contains(up.UserId))
                    .Select(up => new UserStreakDataDTO { UserId = up.UserId, CurrentStreak = up.CurrentStreak })
                    .ToListAsync();

                // Combine in memory and handle deduplication (both users and progress data)
                Dictionary<int, int> userProgressMap = progressData
                    .GroupBy(p => p.UserId)
                    .ToDictionary(g => g.Key, g => g.Max(x => x.CurrentStreak));
                
                List<LeaderboardEntryDTO> leaderboard = usersData
                    .GroupBy(u => new { u.Id, u.Username })
                    .Select(g => g.First())
                    .Select(user => new LeaderboardEntryDTO
                    {
                        UserId = user.Id,
                        Username = user.Username,
                        Value = userProgressMap.GetValueOrDefault(user.Id, 0),
                        Rank = 0 // Will be assigned below
                    })
                    .OrderByDescending(entry => entry.Value)
                    .Take(limit)
                    .ToList();

                // Assign ranks
                for (int i = 0; i < leaderboard.Count; i++)
                {
                    leaderboard[i].Rank = i + 1;
                }

                return leaderboard;
            }
            else if (category == "tasks")
            {
                // Get task counts for family members
                List<UserTaskCountDTO> taskCounts = await _context.Tasks
                    .Where(t => t.IsCompleted && t.AssignedToId.HasValue && familyMemberUserIds.Contains(t.AssignedToId.Value))
                    .GroupBy(t => t.AssignedToId)
                    .Select(g => new UserTaskCountDTO { UserId = g.Key!.Value, Count = g.Count() })
                    .ToListAsync();

                // Get all unique users (proper deduplication)
                List<UserSummaryDTO> uniqueUsers = await _context.Users
                    .Where(u => familyMemberUserIds.Contains(u.Id))
                    .Select(u => new UserSummaryDTO { Id = u.Id, Username = u.Username })
                    .ToListAsync();

                // Combine in memory and handle deduplication (tasks should already be grouped, but be safe)
                Dictionary<int, int> taskCountMap = taskCounts
                    .GroupBy(tc => tc.UserId)
                    .ToDictionary(g => g.Key, g => g.Max(x => x.Count));
                
                List<LeaderboardEntryDTO> result = uniqueUsers
                    .GroupBy(u => new { u.Id, u.Username })
                    .Select(g => g.First())
                    .Select(user => new LeaderboardEntryDTO
                    {
                        UserId = user.Id,
                        Username = user.Username,
                        Value = taskCountMap.GetValueOrDefault(user.Id, 0),
                        Rank = 0 // Will be assigned below
                    })
                    .OrderByDescending(entry => entry.Value)
                    .Take(limit)
                    .ToList();

                // Assign ranks
                for (int i = 0; i < result.Count; i++)
                {
                    result[i].Rank = i + 1;
                }
                
                return result;
            }
            else
            {
                throw new ArgumentException("Invalid leaderboard category", nameof(category));
            }
        }

        public async Task<List<LeaderboardEntryDTO>> GetSpecificFamilyLeaderboardAsync(int userId, int familyId, string category, int limit = 10)
        {
            // Verify user belongs to this family
            bool userBelongsToFamily = await _context.FamilyMembers
                .AnyAsync(fm => fm.UserId == userId && fm.FamilyId == familyId);

            if (!userBelongsToFamily)
            {
                return new List<LeaderboardEntryDTO>();
            }

            // Get all members of this specific family
            List<int> familyMemberUserIds = await _context.FamilyMembers
                .Where(fm => fm.FamilyId == familyId)
                .Select(fm => fm.UserId)
                .Distinct()
                .ToListAsync();

            if (category == "points")
            {
                // Simplified query - get users and their progress separately, then combine in memory
                List<UserSummaryDTO> usersData = await _context.Users
                    .Where(u => familyMemberUserIds.Contains(u.Id))
                    .Select(u => new UserSummaryDTO { Id = u.Id, Username = u.Username })
                    .ToListAsync();

                List<UserProgressDataDTO> progressData = await _context.UserProgresses
                    .Where(up => familyMemberUserIds.Contains(up.UserId))
                    .Select(up => new UserProgressDataDTO { UserId = up.UserId, TotalPointsEarned = up.TotalPointsEarned })
                    .ToListAsync();

                // Combine in memory and handle deduplication (both users and progress data)
                Dictionary<int, int> userProgressMap = progressData
                    .GroupBy(p => p.UserId)
                    .ToDictionary(g => g.Key, g => g.Max(x => x.TotalPointsEarned));
                
                List<LeaderboardEntryDTO> leaderboard = usersData
                    .GroupBy(u => new { u.Id, u.Username })
                    .Select(g => g.First())
                    .Select(user => new LeaderboardEntryDTO
                    {
                        UserId = user.Id,
                        Username = user.Username,
                        Value = userProgressMap.GetValueOrDefault(user.Id, 0),
                        Rank = 0 // Will be assigned below
                    })
                    .OrderByDescending(entry => entry.Value)
                    .Take(limit)
                    .ToList();

                // Assign ranks
                for (int i = 0; i < leaderboard.Count; i++)
                {
                    leaderboard[i].Rank = i + 1;
                }

                return leaderboard;
            }
            else if (category == "streak")
            {
                // Simplified query for streak data
                List<UserSummaryDTO> usersData = await _context.Users
                    .Where(u => familyMemberUserIds.Contains(u.Id))
                    .Select(u => new UserSummaryDTO { Id = u.Id, Username = u.Username })
                    .ToListAsync();

                List<UserStreakDataDTO> progressData = await _context.UserProgresses
                    .Where(up => familyMemberUserIds.Contains(up.UserId))
                    .Select(up => new UserStreakDataDTO { UserId = up.UserId, CurrentStreak = up.CurrentStreak })
                    .ToListAsync();

                // Combine in memory and handle deduplication (both users and progress data)
                Dictionary<int, int> userProgressMap = progressData
                    .GroupBy(p => p.UserId)
                    .ToDictionary(g => g.Key, g => g.Max(x => x.CurrentStreak));
                
                List<LeaderboardEntryDTO> leaderboard = usersData
                    .GroupBy(u => new { u.Id, u.Username })
                    .Select(g => g.First())
                    .Select(user => new LeaderboardEntryDTO
                    {
                        UserId = user.Id,
                        Username = user.Username,
                        Value = userProgressMap.GetValueOrDefault(user.Id, 0),
                        Rank = 0 // Will be assigned below
                    })
                    .OrderByDescending(entry => entry.Value)
                    .Take(limit)
                    .ToList();

                // Assign ranks
                for (int i = 0; i < leaderboard.Count; i++)
                {
                    leaderboard[i].Rank = i + 1;
                }

                return leaderboard;
            }
            else if (category == "tasks")
            {
                // Get task counts for family members
                List<UserTaskCountDTO> taskCounts = await _context.Tasks
                    .Where(t => t.IsCompleted && t.AssignedToId.HasValue && familyMemberUserIds.Contains(t.AssignedToId.Value))
                    .GroupBy(t => t.AssignedToId)
                    .Select(g => new UserTaskCountDTO { UserId = g.Key!.Value, Count = g.Count() })
                    .ToListAsync();

                // Get all unique users (proper deduplication)
                List<UserSummaryDTO> uniqueUsers = await _context.Users
                    .Where(u => familyMemberUserIds.Contains(u.Id))
                    .Select(u => new UserSummaryDTO { Id = u.Id, Username = u.Username })
                    .ToListAsync();

                // Combine in memory and handle deduplication (tasks should already be grouped, but be safe)
                Dictionary<int, int> taskCountMap = taskCounts
                    .GroupBy(tc => tc.UserId)
                    .ToDictionary(g => g.Key, g => g.Max(x => x.Count));
                
                List<LeaderboardEntryDTO> result = uniqueUsers
                    .GroupBy(u => new { u.Id, u.Username })
                    .Select(g => g.First())
                    .Select(user => new LeaderboardEntryDTO
                    {
                        UserId = user.Id,
                        Username = user.Username,
                        Value = taskCountMap.GetValueOrDefault(user.Id, 0),
                        Rank = 0 // Will be assigned below
                    })
                    .OrderByDescending(entry => entry.Value)
                    .Take(limit)
                    .ToList();

                // Assign ranks
                for (int i = 0; i < result.Count; i++)
                {
                    result[i].Rank = i + 1;
                }
                
                return result;
            }
            else
            {
                throw new ArgumentException("Invalid leaderboard category", nameof(category));
            }
        }
        
        #endregion

        #region Helper Methods for Stats (now return DTOs)

        public async Task<List<PriorityMultiplierDTO>> GetPointMultipliersAsync()
        {
            // Get priority multipliers from database or use defaults
            List<PriorityMultiplier> multipliers = await _context.PriorityMultipliers.ToListAsync();
            
            if (!multipliers.Any())
            {
                // Use defaults
                multipliers = new List<PriorityMultiplier>
                {
                    new PriorityMultiplier { Priority = "Low", Multiplier = 0.5 },
                    new PriorityMultiplier { Priority = "Medium", Multiplier = 1.0 },
                    new PriorityMultiplier { Priority = "High", Multiplier = 1.5 },
                    new PriorityMultiplier { Priority = "Critical", Multiplier = 2.0 }
                };
            }
            
            return _mapper.Map<List<PriorityMultiplierDTO>>(multipliers);
        }

        public async Task<PointTransactionDTO> GetTransactionAsync(int transactionId)
        {
            PointTransaction? transaction = await _context.PointTransactions.FindAsync(transactionId);
            if (transaction == null)
            {
                throw new ArgumentException("Transaction not found", nameof(transactionId));
            }
            
            return _mapper.Map<PointTransactionDTO>(transaction);
        }

        public async Task<List<PointTransactionDTO>> GetUserPointTransactionsAsync(int userId, int limit = 100)
        {
            List<PointTransaction> transactions = await _context.PointTransactions
                .Where(pt => pt.UserId == userId)
                .OrderByDescending(pt => pt.CreatedAt)
                .Take(limit)
                .ToListAsync();
            
            return _mapper.Map<List<PointTransactionDTO>>(transactions);
        }

        private async Task<double> CalculateConsistencyScoreAsync(int userId)
        {
            DateTime now = DateTime.UtcNow;
            DateTime thirtyDaysAgo = now.AddDays(-30);
            
            // Count days with activity in the last 30 days
            int activeDays = await _context.PointTransactions
                .Where(pt => pt.UserId == userId && pt.CreatedAt >= thirtyDaysAgo)
                .Select(pt => pt.CreatedAt.Date)
                .Distinct()
                .CountAsync();
                
            // Simple formula: percentage of days with activity
            return Math.Round((activeDays / 30.0) * 100, 1);
        }
        
        private async Task<Dictionary<string, int>> GetCategoryStatsAsync(int userId)
        {
            Dictionary<string, int> result = new Dictionary<string, int>();
            
            // Get completed tasks by category
            List<CategoryCount> categoryCounts = await _context.Tasks
                .Where(t => t.AssignedToId == userId && t.IsCompleted)
                .GroupBy(t => t.Category != null ? t.Category.Name : "Uncategorized")
                .Select(g => new CategoryCount { Category = g.Key, Count = g.Count() })
                .ToListAsync();
            
            foreach (CategoryCount item in categoryCounts)
            {
                result[item.Category] = item.Count;
            }
            
            return result;
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
                
                await _context.SaveChangesAsync();
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
            DateTime endOfWeek = startOfWeek.AddDays(7);
            
            return await _context.PointTransactions
                .Where(pt => pt.UserId == userId && pt.CreatedAt >= startOfWeek && pt.CreatedAt < endOfWeek)
                .Select(pt => pt.CreatedAt.Date)
                .Distinct()
                .CountAsync();
        }

        private async Task<int> GetActiveDaysThisMonthAsync(int userId)
        {
            DateTime startOfMonth = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
            DateTime endOfMonth = startOfMonth.AddMonths(1);
            
            return await _context.PointTransactions
                .Where(pt => pt.UserId == userId && pt.CreatedAt >= startOfMonth && pt.CreatedAt < endOfMonth)
                .Select(pt => pt.CreatedAt.Date)
                .Distinct()
                .CountAsync();
        }

        private async Task<bool> HasUserHadFocusSessionYesterdayAsync(int userId)
        {
            DateTime yesterday = DateTime.UtcNow.Date.AddDays(-1);
            DateTime today = DateTime.UtcNow.Date;
            
            return await _context.PointTransactions
                .AnyAsync(pt => pt.UserId == userId && 
                               pt.TransactionType == "focus_session" && 
                               pt.CreatedAt >= yesterday && 
                               pt.CreatedAt < today);
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
            TaskItem? task = await _context.Tasks.FindAsync(taskId);
            if (task == null) return;

            // Count total completed tasks
            int completedTaskCount = await _context.PointTransactions
                .CountAsync(pt => pt.UserId == userId && pt.TransactionType == "task_completion");

            // Progress achievements (IDs 1-3, 34, 51-52, 101-104, 133-135)
            await CheckProgressAchievements(userId, completedTaskCount);

            // Priority-based achievements (IDs 35-36, 80-82)
            await CheckPriorityAchievements(userId, task.Priority ?? "Medium");

            // Time-based achievements (IDs 6-10, 60-62)
            await CheckTimeBasedTaskAchievements(userId, taskId);

            // Productivity patterns (IDs 33, 53, 103-104)
            await CheckProductivityPatternAchievements(userId);

            // Family task achievements (IDs 18, 63-64)
            if (task.FamilyId.HasValue || task.AssignedToFamilyMemberId.HasValue)
            {
                await CheckFamilyTaskAchievements(userId, task.FamilyId ?? 0);
            }

            // Seasonal achievements based on current month
            await CheckSeasonalTaskAchievements(userId);

            // Speed achievements (IDs 11-13, 54-56, 106-108)
            await CheckSpeedAchievements(userId, additionalData);

            // Intensity achievements (IDs 53, 103-104)
            await CheckIntensityAchievements(userId);

            // Quality achievements (IDs 24, 67, 112-114, 142-144)
            await CheckQualityAchievements(userId, additionalData);

            // Versatility achievements (IDs 20, 25, 93)
            await CheckVersatilityAchievements(userId);

            // Documentation achievements (IDs 41-42, 68, 97)
            await CheckDocumentationAchievements(userId);

            // Habit achievements (IDs 16, 50, 59)
            await CheckHabitAchievements(userId);

            // Efficiency achievements (IDs 29-30, 83-84)
            await CheckEfficiencyAchievements(userId);

            // Resilience achievements (ID 23)
            await CheckResilienceAchievements(userId);

            // Exploration achievements (IDs 47-48)
            await CheckExplorationAchievements(userId);

            // Advanced achievements (IDs 133-135)
            await CheckAdvancedAchievements(userId);
        }

        private async Task ProcessTaskCreationAchievements(int userId, int taskId, Dictionary<string, object>? additionalData)
        {
            int createdTaskCount = await _context.PointTransactions
                .CountAsync(pt => pt.UserId == userId && pt.TransactionType == "task_creation");

            // Creator achievements (IDs 4, 70, 118)
            await CheckCreationAchievements(userId, createdTaskCount);
        }

        private async Task ProcessCategoryCreationAchievements(int userId, int categoryId)
        {
            int categoryCount = await _context.Categories
                .CountAsync(c => c.UserId == userId);

            // Organizer achievements (IDs 5, 37, 72, 119)
            await CheckOrganizerAchievements(userId, categoryCount);
        }

        private async Task ProcessFocusSessionAchievements(int userId, int sessionId, Dictionary<string, object>? additionalData)
        {
            int focusSessionCount = await _context.PointTransactions
                .CountAsync(pt => pt.UserId == userId && pt.TransactionType == "focus_session");

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
            UserProgress? userProgress = await _context.UserProgresses
                .FirstOrDefaultAsync(up => up.UserId == userId);

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
            UserProgress? userProgress = await _context.UserProgresses
                .FirstOrDefaultAsync(up => up.UserId == userId);

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
            var progressMilestones = new Dictionary<int, int>
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

            foreach (var milestone in progressMilestones)
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
            var transaction = await _context.PointTransactions
                .Where(pt => pt.UserId == userId && pt.TaskId == taskId && pt.TransactionType == "task_completion")
                .OrderByDescending(pt => pt.CreatedAt)
                .FirstOrDefaultAsync();

            if (transaction == null) return;

            DateTime completionTime = transaction.CreatedAt;
            TimeSpan timeOfDay = completionTime.TimeOfDay;

            // Early Bird - Complete before 8 AM
            if (timeOfDay < TimeSpan.FromHours(8))
            {
                await CheckAndUnlockSingleAchievement(userId, 6);
                
                int earlyBirdCount = await CountEarlyBirdCompletions(userId);
                if (earlyBirdCount >= 25) await CheckAndUnlockSingleAchievement(userId, 62); // Early Bird Master
            }

            // Night Owl - Complete after 10 PM
            if (timeOfDay > TimeSpan.FromHours(22))
            {
                await CheckAndUnlockSingleAchievement(userId, 7);
            }

            // Lunch Break Hero - Complete during lunch (12-1 PM)
            if (timeOfDay >= TimeSpan.FromHours(12) && timeOfDay < TimeSpan.FromHours(13))
            {
                int lunchCount = await CountLunchBreakCompletions(userId);
                if (lunchCount >= 3) await CheckAndUnlockSingleAchievement(userId, 9);
            }

            // Weekend Warrior
            if (completionTime.DayOfWeek == DayOfWeek.Saturday || completionTime.DayOfWeek == DayOfWeek.Sunday)
            {
                int weekendCount = await CountWeekendCompletions(userId);
                if (weekendCount >= 5) await CheckAndUnlockSingleAchievement(userId, 8);
            }

            // On Time - Complete before due date
            var task = await _context.Tasks.FindAsync(taskId);
            if (task?.DueDate.HasValue == true && completionTime < task.DueDate.Value)
            {
                int onTimeCount = await CountOnTimeCompletions(userId);
                if (onTimeCount >= 5) await CheckAndUnlockSingleAchievement(userId, 10); // On Time
                if (onTimeCount >= 50) await CheckAndUnlockSingleAchievement(userId, 61); // Punctuality Expert
            }
        }

        private async Task CheckStreakMilestones(int userId, int currentStreak)
        {
            var streakMilestones = new Dictionary<int, int>
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

            foreach (var milestone in streakMilestones)
            {
                if (currentStreak >= milestone.Value)
                {
                    await CheckAndUnlockSingleAchievement(userId, milestone.Key);
                }
            }
        }

        private async Task CheckFocusAchievements(int userId, int sessionCount, Dictionary<string, object>? additionalData)
        {
            var focusMilestones = new Dictionary<int, int>
            {
                { 21, 1 },   // Focused (first session)
                { 22, 5 },   // Zen Master
                { 73, 25 },  // Focus Master
                { 121, 100 } // Deep Focus
            };

            foreach (var milestone in focusMilestones)
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

            int monthlyTasks = await _context.PointTransactions
                .CountAsync(pt => pt.UserId == userId && 
                                 pt.TransactionType == "task_completion" &&
                                 pt.CreatedAt >= startOfMonth && 
                                 pt.CreatedAt < endOfMonth);

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
            bool hasAchievement = await _context.UserAchievements
                .AnyAsync(ua => ua.UserId == userId && ua.AchievementId == achievementId);

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
            return await _context.Tasks
                .CountAsync(t => t.UserId == userId && 
                                t.IsCompleted && 
                                t.Priority != null &&
                                t.Priority.ToLower() == priority.ToLower());
        }

        private async Task<int> CountEarlyBirdCompletions(int userId)
        {
            return await _context.PointTransactions
                .CountAsync(pt => pt.UserId == userId && 
                                 pt.TransactionType == "task_completion" &&
                                 pt.CreatedAt.TimeOfDay < TimeSpan.FromHours(8));
        }

        private async Task<int> CountLunchBreakCompletions(int userId)
        {
            return await _context.PointTransactions
                .CountAsync(pt => pt.UserId == userId && 
                                 pt.TransactionType == "task_completion" &&
                                 pt.CreatedAt.TimeOfDay >= TimeSpan.FromHours(12) &&
                                 pt.CreatedAt.TimeOfDay < TimeSpan.FromHours(13));
        }

        private async Task<int> CountWeekendCompletions(int userId)
        {
            return await _context.PointTransactions
                .CountAsync(pt => pt.UserId == userId && 
                                 pt.TransactionType == "task_completion" &&
                                 (pt.CreatedAt.DayOfWeek == DayOfWeek.Saturday || 
                                  pt.CreatedAt.DayOfWeek == DayOfWeek.Sunday));
        }

        private async Task<int> CountOnTimeCompletions(int userId)
        {
            return await _context.PointTransactions
                .Where(pt => pt.UserId == userId && pt.TransactionType == "task_completion" && pt.TaskId.HasValue)
                .Join(_context.Tasks, pt => pt.TaskId, t => t.Id, (pt, t) => new { pt, t })
                .CountAsync(x => x.t.DueDate.HasValue && x.pt.CreatedAt < x.t.DueDate.Value);
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

            int activeDaysLastWeek = await _context.PointTransactions
                .Where(pt => pt.UserId == userId && pt.CreatedAt >= sevenDaysAgo)
                .Select(pt => pt.CreatedAt.Date)
                .Distinct()
                .CountAsync();

            int activeDaysLastMonth = await _context.PointTransactions
                .Where(pt => pt.UserId == userId && pt.CreatedAt >= thirtyDaysAgo)
                .Select(pt => pt.CreatedAt.Date)
                .Distinct()
                .CountAsync();

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
            int tasksLastHour = await _context.PointTransactions
                .CountAsync(pt => pt.UserId == userId && 
                                 pt.TransactionType == "task_completion" &&
                                 pt.CreatedAt >= oneHourAgo);

            if (tasksLastHour >= 5) await CheckAndUnlockSingleAchievement(userId, 33); // Power Hour
        }

        private async Task CheckFamilyTaskAchievements(int userId, int familyId) 
        {
            int familyTaskCount = await _context.Tasks
                .CountAsync(t => t.UserId == userId && t.IsCompleted && 
                               (t.FamilyId.HasValue || t.AssignedToFamilyMemberId.HasValue));

            if (familyTaskCount >= 3) await CheckAndUnlockSingleAchievement(userId, 18); // Helpful
            if (familyTaskCount >= 25) await CheckAndUnlockSingleAchievement(userId, 63); // Team Player
        }

        private async Task CheckSeasonalTaskAchievements(int userId) 
        {
            DateTime now = DateTime.UtcNow;
            
            // Check for seasonal achievements based on specific categories and months
            if (now.Month == 3) // March - Spring Cleaning
            {
                int organizationTasks = await _context.Tasks
                    .Where(t => t.UserId == userId && t.IsCompleted && 
                               t.Category != null && t.Category.Name.ToLower().Contains("organization") &&
                               t.CompletedAt.HasValue && t.CompletedAt.Value.Month == 3)
                    .CountAsync();
                
                if (organizationTasks >= 15) await CheckAndUnlockSingleAchievement(userId, 27); // Spring Cleaning
            }
            
            // Summer productivity (June-August)
            if (now.Month >= 6 && now.Month <= 8)
            {
                DateTime summerStart = new DateTime(now.Year, 6, 1);
                DateTime summerEnd = new DateTime(now.Year, 9, 1);
                
                int summerTasks = await _context.PointTransactions
                    .CountAsync(pt => pt.UserId == userId && 
                                     pt.TransactionType == "task_completion" &&
                                     pt.CreatedAt >= summerStart && 
                                     pt.CreatedAt < summerEnd);
                
                if (summerTasks >= 75) await CheckAndUnlockSingleAchievement(userId, 76); // Spring Productivity
                if (summerTasks >= 20) await CheckAndUnlockSingleAchievement(userId, 28); // Summer Vibes
            }
            
            // Winter productivity (December-February)
            if (now.Month == 12 || now.Month <= 2)
            {
                int winterYear = now.Month == 12 ? now.Year : now.Year - 1;
                DateTime winterStart = new DateTime(winterYear, 12, 1);
                DateTime winterEnd = new DateTime(winterYear + 1, 3, 1);
                
                int winterTasks = await _context.PointTransactions
                    .CountAsync(pt => pt.UserId == userId && 
                                     pt.TransactionType == "task_completion" &&
                                     pt.CreatedAt >= winterStart && 
                                     pt.CreatedAt < winterEnd);
                
                // Check for consistent winter activity
                if (winterTasks >= 50) await CheckAndUnlockSingleAchievement(userId, 79); // Winter Warrior
            }
        }

        private async Task CheckTagUsageAchievements(int userId, int tagId) 
        {
            await ProcessTagUsageAchievements(userId, tagId);
        }

        private async Task ProcessTagUsageAchievements(int userId, int tagId)
        {
            int uniqueTagsUsed = await _context.TaskTags
                .Include(tt => tt.Task)
                .Where(tt => tt.Task.UserId == userId)
                .Select(tt => tt.TagId)
                .Distinct()
                .CountAsync();

            // Tag Master achievement (ID 38)
            if (uniqueTagsUsed >= 10) await CheckAndUnlockSingleAchievement(userId, 38);
        }

        private async Task CheckVersatilityAchievements(int userId) 
        {
            // Multi-tasker - Work on 3 different categories in one day (ID 25)
            DateTime today = DateTime.UtcNow.Date;
            DateTime tomorrow = today.AddDays(1);
            
            int categoriesUsedToday = await _context.Tasks
                .Where(t => t.UserId == userId && t.IsCompleted && 
                           t.CompletedAt.HasValue && 
                           t.CompletedAt.Value >= today && 
                           t.CompletedAt.Value < tomorrow &&
                           t.CategoryId.HasValue)
                .Select(t => t.CategoryId.Value)
                .Distinct()
                .CountAsync();
                
            if (categoriesUsedToday >= 3) await CheckAndUnlockSingleAchievement(userId, 25); // Multi-tasker
            
            // Skill Builder - Complete tasks in 10 different categories (ID 93)
            int totalCategoriesUsed = await _context.Tasks
                .Where(t => t.UserId == userId && t.IsCompleted && t.CategoryId.HasValue)
                .Select(t => t.CategoryId.Value)
                .Distinct()
                .CountAsync();
                
            if (totalCategoriesUsed >= 10) await CheckAndUnlockSingleAchievement(userId, 93); // Skill Builder
            
            // Experimenter - Try 3 different task priorities (ID 20)
            int prioritiesUsed = await _context.Tasks
                .Where(t => t.UserId == userId && t.IsCompleted && !string.IsNullOrEmpty(t.Priority))
                .Select(t => t.Priority)
                .Distinct()
                .CountAsync();
                
            if (prioritiesUsed >= 3) await CheckAndUnlockSingleAchievement(userId, 20); // Experimenter
        }

        private async Task CheckDocumentationAchievements(int userId) 
        {
            // Note Taker - Add notes to 5 tasks (ID 41)
            int tasksWithNotes = await _context.Tasks
                .CountAsync(t => t.UserId == userId && !string.IsNullOrEmpty(t.Description) && t.Description.Length > 10);
                
            if (tasksWithNotes >= 5) await CheckAndUnlockSingleAchievement(userId, 41); // Note Taker
            
            // Detailed - Write notes longer than 100 characters (ID 42)
            bool hasDetailedNote = await _context.Tasks
                .AnyAsync(t => t.UserId == userId && !string.IsNullOrEmpty(t.Description) && t.Description.Length > 100);
                
            if (hasDetailedNote) await CheckAndUnlockSingleAchievement(userId, 42); // Detailed
            
            // Attention to Detail - Add detailed notes to 25 tasks (ID 68)
            int detailedNotes = await _context.Tasks
                .CountAsync(t => t.UserId == userId && !string.IsNullOrEmpty(t.Description) && t.Description.Length > 50);
                
            if (detailedNotes >= 25) await CheckAndUnlockSingleAchievement(userId, 68); // Attention to Detail
            
            // Knowledge Keeper - Maintain detailed notes for 3 months (ID 97)
            DateTime threeMonthsAgo = DateTime.UtcNow.AddMonths(-3);
            int recentDetailedNotes = await _context.Tasks
                .CountAsync(t => t.UserId == userId && 
                               !string.IsNullOrEmpty(t.Description) && 
                               t.Description.Length > 100 &&
                               t.CreatedAt >= threeMonthsAgo);
                               
            if (recentDetailedNotes >= 30) await CheckAndUnlockSingleAchievement(userId, 97); // Knowledge Keeper
        }

        private async Task CheckSpeedAchievements(int userId, Dictionary<string, object>? additionalData)
        {
            if (additionalData?.TryGetValue("completionTimeMinutes", out var time) == true)
            {
                int minutes = (int)time;
                
                // Speed Runner - Complete task in under 5 minutes (ID 11)
                if (minutes < 5)
                {
                    await CheckAndUnlockSingleAchievement(userId, 11);
                    
                    // Count quick completions for advanced speed achievements
                    int quickCompletions = await _context.PointTransactions
                        .CountAsync(pt => pt.UserId == userId && 
                                         pt.TransactionType == "task_completion" &&
                                         pt.Description.Contains("5 minutes"));
                    
                    // Lightning Fast - Complete 10 tasks in under 5 minutes each (ID 54)
                    if (quickCompletions >= 10) await CheckAndUnlockSingleAchievement(userId, 54);
                    
                    // Rocket Speed - Complete 20 tasks in under 5 minutes each (ID 106)
                    if (quickCompletions >= 20) await CheckAndUnlockSingleAchievement(userId, 106);
                }
                
                // Quick Draw - Complete 3 tasks in under 10 minutes each (ID 12)
                if (minutes < 10)
                {
                    int quickDrawCount = await _context.PointTransactions
                        .CountAsync(pt => pt.UserId == userId && 
                                         pt.TransactionType == "task_completion" &&
                                         pt.Description.Contains("10 minutes"));
                    
                    if (quickDrawCount >= 3) await CheckAndUnlockSingleAchievement(userId, 12);
                }
            }
            
            // Flash - Complete 5 tasks in under 15 minutes total (ID 13)
            DateTime fifteenMinutesAgo = DateTime.UtcNow.AddMinutes(-15);
            int recentCompletions = await _context.PointTransactions
                .CountAsync(pt => pt.UserId == userId && 
                                 pt.TransactionType == "task_completion" &&
                                 pt.CreatedAt >= fifteenMinutesAgo);
                                 
            if (recentCompletions >= 5) await CheckAndUnlockSingleAchievement(userId, 13); // Flash
        }

        private async Task CheckIntensityAchievements(int userId)
        {
            // Task Machine - Complete 25 tasks in one week (ID 53)
            DateTime oneWeekAgo = DateTime.UtcNow.AddDays(-7);
            int weeklyTasks = await _context.PointTransactions
                .CountAsync(pt => pt.UserId == userId && 
                                 pt.TransactionType == "task_completion" &&
                                 pt.CreatedAt >= oneWeekAgo);
                                 
            if (weeklyTasks >= 25) await CheckAndUnlockSingleAchievement(userId, 53); // Task Machine
            
            // Productivity Beast - Complete 50 tasks in one week (ID 103)
            if (weeklyTasks >= 50) await CheckAndUnlockSingleAchievement(userId, 103); // Productivity Beast
            
            // Marathon Runner - Complete 100 tasks in one month (ID 104)
            DateTime oneMonthAgo = DateTime.UtcNow.AddDays(-30);
            int monthlyTasks = await _context.PointTransactions
                .CountAsync(pt => pt.UserId == userId && 
                                 pt.TransactionType == "task_completion" &&
                                 pt.CreatedAt >= oneMonthAgo);
                                 
            if (monthlyTasks >= 100) await CheckAndUnlockSingleAchievement(userId, 104); // Marathon Runner
        }

        private async Task CheckHabitAchievements(int userId)
        {
            // Morning Routine - Complete morning tasks 5 days in a row (ID 16)
            DateTime today = DateTime.UtcNow.Date;
            int consecutiveMorningDays = 0;
            
            for (int i = 0; i < 5; i++)
            {
                DateTime checkDate = today.AddDays(-i);
                DateTime morningStart = checkDate.AddHours(6);
                DateTime morningEnd = checkDate.AddHours(10);
                
                bool hasMorningTask = await _context.PointTransactions
                    .AnyAsync(pt => pt.UserId == userId && 
                                   pt.TransactionType == "task_completion" &&
                                   pt.CreatedAt >= morningStart && 
                                   pt.CreatedAt < morningEnd);
                
                if (hasMorningTask)
                    consecutiveMorningDays++;
                else
                    break;
            }
            
            if (consecutiveMorningDays >= 5) await CheckAndUnlockSingleAchievement(userId, 16); // Morning Routine
            
            // Habit Builder - Complete the same type of task 7 days in a row (ID 50)
            await CheckHabitConsistency(userId);
            
            // Morning Champion - Complete morning tasks for 14 days straight (ID 59)
            if (consecutiveMorningDays >= 14) await CheckAndUnlockSingleAchievement(userId, 59); // Morning Champion
        }

        private async Task CheckHabitConsistency(int userId)
        {
            // Check for consistent task categories over 7 days
            DateTime today = DateTime.UtcNow.Date;
            
            var categoryGroups = await _context.Tasks
                .Where(t => t.UserId == userId && t.IsCompleted && 
                           t.CompletedAt.HasValue && 
                           t.CompletedAt.Value >= today.AddDays(-7) &&
                           t.CategoryId.HasValue)
                .GroupBy(t => t.CategoryId.Value)
                .ToListAsync();
            
            foreach (var group in categoryGroups)
            {
                var tasksByDay = group.GroupBy(t => t.CompletedAt.Value.Date).ToList();
                if (tasksByDay.Count >= 7)
                {
                    await CheckAndUnlockSingleAchievement(userId, 50); // Habit Builder
                    break;
                }
            }
        }

        private async Task CheckQualityAchievements(int userId, Dictionary<string, object>? additionalData)
        {
            if (additionalData?.TryGetValue("qualityRating", out var rating) == true)
            {
                int qualityRating = (int)rating;
                if (qualityRating >= 5) // Perfect quality
                {
                    int perfectTasks = await _context.PointTransactions
                        .CountAsync(pt => pt.UserId == userId && 
                                         pt.TransactionType == "task_completion" &&
                                         pt.Description.Contains("perfect"));
                    
                    if (perfectTasks >= 5) await CheckAndUnlockSingleAchievement(userId, 24); // Perfectionist
                    if (perfectTasks >= 25) await CheckAndUnlockSingleAchievement(userId, 67); // Quality Control
                    if (perfectTasks >= 50) await CheckAndUnlockSingleAchievement(userId, 112); // Gold Perfectionist
                    if (perfectTasks >= 200) await CheckAndUnlockSingleAchievement(userId, 142); // Platinum Perfectionist
                }
            }
        }

        private async Task CheckEfficiencyAchievements(int userId)
        {
            // Template Master - Use task templates 10 times (ID 29)
            int templateUsage = await _context.PointTransactions
                .CountAsync(pt => pt.UserId == userId && 
                                 pt.TransactionType.Contains("template"));
            
            if (templateUsage >= 10) await CheckAndUnlockSingleAchievement(userId, 29); // Template Master
            if (templateUsage >= 50) await CheckAndUnlockSingleAchievement(userId, 84); // Efficiency Master
            
            // Automation Lover - Create 3 recurring tasks (ID 30)
            int recurringTasks = await _context.Tasks
                .CountAsync(t => t.UserId == userId && t.IsRecurring);
            
            if (recurringTasks >= 3) await CheckAndUnlockSingleAchievement(userId, 30); // Automation Lover
            if (recurringTasks >= 20) await CheckAndUnlockSingleAchievement(userId, 83); // Automation Expert
        }

        private async Task CheckResilienceAchievements(int userId)
        {
            // Comeback Kid - Return after 7 days of inactivity (ID 23)
            UserProgress? userProgress = await _context.UserProgresses
                .FirstOrDefaultAsync(up => up.UserId == userId);
            
            if (userProgress?.LastActivityDate.HasValue == true)
            {
                var daysSinceLastActivity = (DateTime.UtcNow - userProgress.LastActivityDate.Value).Days;
                if (daysSinceLastActivity >= 7)
                {
                    // Check if they have activity today
                    DateTime today = DateTime.UtcNow.Date;
                    bool hasActivityToday = await _context.PointTransactions
                        .AnyAsync(pt => pt.UserId == userId && pt.CreatedAt.Date == today);
                    
                    if (hasActivityToday) await CheckAndUnlockSingleAchievement(userId, 23); // Comeback Kid
                }
            }
        }

        private async Task CheckExplorationAchievements(int userId)
        {
            // Feature Hunter - Use 5 different app features (ID 48)
            var featureUsage = new List<string>();
            
            // Check various feature usage
            if (await _context.Tasks.AnyAsync(t => t.UserId == userId)) featureUsage.Add("tasks");
            if (await _context.Categories.AnyAsync(c => c.UserId == userId)) featureUsage.Add("categories");
            if (await _context.PointTransactions.AnyAsync(pt => pt.UserId == userId && pt.TransactionType == "focus_session")) featureUsage.Add("focus");
            if (await _context.FamilyMembers.AnyAsync(fm => fm.UserId == userId)) featureUsage.Add("family");
            if (await _context.ChallengeProgresses.AnyAsync(cp => cp.UserId == userId)) featureUsage.Add("challenges");
            if (await _context.UserRewards.AnyAsync(ur => ur.UserId == userId)) featureUsage.Add("rewards");
            if (await _context.Boards.AnyAsync(b => b.UserId == userId)) featureUsage.Add("boards");
            
            if (featureUsage.Count >= 5) await CheckAndUnlockSingleAchievement(userId, 48); // Feature Hunter
            if (featureUsage.Count >= 7) await CheckAndUnlockSingleAchievement(userId, 47); // Explorer
        }

        private async Task CheckAdvancedAchievements(int userId)
        {
            // High-tier achievements for advanced users
            int totalTasks = await _context.PointTransactions
                .CountAsync(pt => pt.UserId == userId && pt.TransactionType == "task_completion");
            
            // Advanced progress achievements
            if (totalTasks >= 500) await CheckAndUnlockSingleAchievement(userId, 133); // Legend
            if (totalTasks >= 750) await CheckAndUnlockSingleAchievement(userId, 134); // Myth
            if (totalTasks >= 1000) await CheckAndUnlockSingleAchievement(userId, 135); // Deity
        }

        #endregion

        #region Missing Methods from Interface

        public async Task ProcessChallengeProgressAsync(int userId, string activityType, int relatedEntityId)
        {
            // Get user's active challenges
            List<ChallengeProgress> challengeProgresses = await _context.ChallengeProgresses
                .Where(cp => cp.UserId == userId && !cp.IsCompleted)
                .ToListAsync();
                
            foreach (ChallengeProgress challengeProgress in challengeProgresses)
            {
                // Get the challenge directly since navigation property is ignored
                Challenge? challenge = await _context.Challenges.FindAsync(challengeProgress.ChallengeId);
                
                // Check if this activity applies to this challenge
                if (challenge != null && challenge.ActivityType == activityType)
                {
                    // For challenges related to specific entities
                    if (challenge.TargetEntityId.HasValue && challenge.TargetEntityId.Value != relatedEntityId)
                    {
                        continue;
                    }
                    
                    // Increment progress
                    challengeProgress.CurrentProgress++;
                    
                    // Check if challenge is completed
                    if (challengeProgress.CurrentProgress >= challenge.TargetCount)
                    {
                        challengeProgress.IsCompleted = true;
                        challengeProgress.CompletedAt = DateTime.UtcNow;
                        
                        // Award points for completing challenge
                        await AddPointsAsync(userId, challenge.PointReward, "challenge", $"Completed challenge: {challenge.Name}");
                        
                        // Check if there's a badge reward
                        if (challenge.RewardBadgeId.HasValue)
                        {
                            try
                            {
                                await AwardBadgeAsync(userId, challenge.RewardBadgeId.Value);
                            }
                            catch (InvalidOperationException)
                            {
                                // Badge already awarded, ignore
                            }
                        }
                    }
                }
            }
            
            await _context.SaveChangesAsync();
            
            // Check for task-related achievements
            if (activityType == "task_completion" || activityType == "task_creation")
            {
                await CheckAndUnlockTaskAchievements(userId, activityType, relatedEntityId);
            }
        }

        #endregion

        #region Character System

        public async Task<bool> SwitchCharacterClassAsync(int userId, string characterClass)
        {
            // Valid character classes
            string[] validClasses = new[] { "explorer", "warrior", "mage", "guardian", "speedster", "healer" };
            
            if (!validClasses.Contains(characterClass))
            {
                return false;
            }

            UserProgress userProgress = await GetInternalUserProgressAsync(userId);
            
            // Check if character is unlocked
            string[] unlockedCharacters = userProgress.UnlockedCharacters?.Split(',') ?? new[] { "explorer" };
            if (!unlockedCharacters.Contains(characterClass))
            {
                return false;
            }

            userProgress.CurrentCharacterClass = characterClass;
            userProgress.UpdatedAt = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UnlockCharacterClassAsync(int userId, string characterClass)
        {
            string[] validClasses = new[] { "explorer", "warrior", "mage", "guardian", "speedster", "healer" };
            
            if (!validClasses.Contains(characterClass))
            {
                return false;
            }

            UserProgress userProgress = await GetInternalUserProgressAsync(userId);
            
            // Check if already unlocked
            string[] unlockedCharacters = userProgress.UnlockedCharacters?.Split(',') ?? new[] { "explorer" };
            if (unlockedCharacters.Contains(characterClass))
            {
                return false; // Already unlocked
            }

            // Character unlock requirements based on achievements/points
            Dictionary<string, int> unlockRequirements = new Dictionary<string, int>
            {
                { "explorer", 0 },      // Default unlocked
                { "warrior", 100 },     // Bronze tier
                { "mage", 500 },        // Gold tier
                { "guardian", 1500 },   // Platinum tier
                { "speedster", 5000 },  // Diamond tier
                { "healer", 15000 }     // Onyx tier
            };

            if (userProgress.TotalPointsEarned < unlockRequirements[characterClass])
            {
                return false; // Not enough points
            }

            // Add to unlocked characters
            List<string> newUnlockedList = unlockedCharacters.ToList();
            newUnlockedList.Add(characterClass);
            userProgress.UnlockedCharacters = string.Join(",", newUnlockedList);
            userProgress.UpdatedAt = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();
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
            
            // Check for character level up (every 1000 XP)
            int newLevel = (userProgress.CharacterXP / 1000) + 1;
            if (newLevel > userProgress.CharacterLevel)
            {
                userProgress.CharacterLevel = newLevel;
                
                // Award bonus points for character level up
                await AddPointsAsync(userId, newLevel * 50, "character_levelup", $"Character level up to {newLevel}");
            }
            
            userProgress.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            
            return true;
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
            int focusSessionCount = await _context.PointTransactions
                .CountAsync(pt => pt.UserId == userId && pt.TransactionType == "focus_session");

            // First focus session achievement
            if (focusSessionCount == 1)
            {
                // Unlock first focus achievement if it exists
                Achievement? firstFocusAchievement = await _context.Achievements
                    .FirstOrDefaultAsync(a => a.Category == "Focus" && a.Name.Contains("First"));
                
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
                Achievement? longFocusAchievement = await _context.Achievements
                    .FirstOrDefaultAsync(a => a.Category == "Focus" && a.Name.Contains("Marathon"));
                
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
                var pointTransactions = await _context.PointTransactions
                    .Where(pt => pt.UserId == userId)
                    .ToListAsync();
                _context.PointTransactions.RemoveRange(pointTransactions);

                // Remove all user achievements
                var userAchievements = await _context.UserAchievements
                    .Where(ua => ua.UserId == userId)
                    .ToListAsync();
                _context.UserAchievements.RemoveRange(userAchievements);

                // Remove all user badges
                var userBadges = await _context.UserBadges
                    .Where(ub => ub.UserId == userId)
                    .ToListAsync();
                _context.UserBadges.RemoveRange(userBadges);

                // Remove all user rewards
                var userRewards = await _context.UserRewards
                    .Where(ur => ur.UserId == userId)
                    .ToListAsync();
                _context.UserRewards.RemoveRange(userRewards);

                // Remove all challenge progress
                var challengeProgresses = await _context.ChallengeProgresses
                    .Where(cp => cp.UserId == userId)
                    .ToListAsync();
                _context.ChallengeProgresses.RemoveRange(challengeProgresses);

                // Remove all user challenges
                var userChallenges = await _context.UserChallenges
                    .Where(uc => uc.UserId == userId)
                    .ToListAsync();
                _context.UserChallenges.RemoveRange(userChallenges);

                // Reset user progress to initial state
                UserProgress? userProgress = await _context.UserProgresses
                    .FirstOrDefaultAsync(up => up.UserId == userId);

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
                    _context.UserProgresses.Add(userProgress);
                }

                await _context.SaveChangesAsync();

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
            var pointTransactionCount = await _context.PointTransactions
                .CountAsync(pt => pt.UserId == userId);

            var achievementCount = await _context.UserAchievements
                .CountAsync(ua => ua.UserId == userId);

            var badgeCount = await _context.UserBadges
                .CountAsync(ub => ub.UserId == userId);

            var rewardCount = await _context.UserRewards
                .CountAsync(ur => ur.UserId == userId);

            var challengeCount = await _context.ChallengeProgresses
                .CountAsync(cp => cp.UserId == userId);

            var userProgress = await _context.UserProgresses
                .FirstOrDefaultAsync(up => up.UserId == userId);

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
    }
} 