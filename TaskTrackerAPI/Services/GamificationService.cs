using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.Data;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Services.Interfaces;

namespace TaskTrackerAPI.Services
{
    // DTO classes to enable explicit types for LINQ projections
    internal class CategoryCount
    {
        public string Category { get; set; } = default!;
        public int Count { get; set; }
    }

    internal class UserTaskCount
    {
        public int? UserId { get; set; }
        public int Count { get; set; }
    }

    public class GamificationService : IGamificationService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<GamificationService> _logger;

        public GamificationService(ApplicationDbContext context, ILogger<GamificationService> logger)
        {
            _context = context;
            _logger = logger;
        }

        #region User Progress

        public async Task<UserProgress> GetUserProgressAsync(int userId)
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

        public async Task<int> AddPointsAsync(int userId, int points, string transactionType, string description, int? taskId = null)
        {
            if (points < 0)
            {
                throw new ArgumentException("Points cannot be negative", nameof(points));
            }

            UserProgress userProgress = await GetUserProgressAsync(userId);
            
            // Create a point transaction record
            PointTransaction transaction = new PointTransaction
            {
                UserId = userId,
                Points = points,
                TransactionType = transactionType,
                Description = description,
                TaskId = taskId,
                CreatedAt = DateTime.UtcNow
            };

            _context.PointTransactions.Add(transaction);
            
            // Update user progress
            userProgress.CurrentPoints += points;
            userProgress.TotalPointsEarned += points;
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
            UserProgress userProgress = await GetUserProgressAsync(userId);
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
                // Assuming the threshold is stored in the achievement target value
                if (currentStreak >= achievement.TargetValue)
                {
                    await UnlockAchievementAsync(userId, achievement.Id);
                }
            }
        }

        #endregion
        
        #region Achievements

        public async Task<List<UserAchievement>> GetUserAchievementsAsync(int userId)
        {
            return await _context.UserAchievements
                .Include(ua => ua.Achievement)
                .Where(ua => ua.UserId == userId)
                .OrderByDescending(ua => ua.UnlockedAt)
                .ToListAsync();
        }

        public async Task<List<Achievement>> GetAvailableAchievementsAsync(int userId)
        {
            // Get all achievements except those already unlocked by the user
            List<int> unlockedAchievementIds = await _context.UserAchievements
                .Where(ua => ua.UserId == userId)
                .Select(ua => ua.AchievementId)
                .ToListAsync();
                
            return await _context.Achievements
                .Where(a => !unlockedAchievementIds.Contains(a.Id))
                .OrderBy(a => a.Category)
                .ThenBy(a => a.Name)
                .ToListAsync();
        }

        public async Task<UserAchievement> UnlockAchievementAsync(int userId, int achievementId)
        {
            // Check if already unlocked
            UserAchievement? existingUnlock = await _context.UserAchievements
                .FirstOrDefaultAsync(ua => ua.UserId == userId && ua.AchievementId == achievementId);
                
            if (existingUnlock != null)
            {
                throw new InvalidOperationException("Achievement already unlocked");
            }
            
            // Get the achievement
            Achievement? achievement = await _context.Achievements.FindAsync(achievementId);
            if (achievement == null)
            {
                throw new ArgumentException("Achievement not found", nameof(achievementId));
            }
            
            // Create the user achievement record
            UserAchievement userAchievement = new UserAchievement
            {
                UserId = userId,
                AchievementId = achievementId,
                UnlockedAt = DateTime.UtcNow
            };
            
            _context.UserAchievements.Add(userAchievement);
            
            // Award points for unlocking this achievement
            await AddPointsAsync(userId, achievement.PointValue, "achievement", $"Unlocked achievement: {achievement.Name}");
            
            await _context.SaveChangesAsync();
            
            // Load the achievement relationship
            await _context.Entry(userAchievement).Reference(ua => ua.Achievement).LoadAsync();
            
            return userAchievement;
        }
        
        private async Task UnlockLevelBasedAchievements(int userId, int level)
        {
            // Find achievements related to level milestones
            List<Achievement> levelAchievements = await _context.Achievements
                .Where(a => a.Category == "Level" && !_context.UserAchievements.Any(ua => ua.UserId == userId && ua.AchievementId == a.Id))
                .ToListAsync();
                
            foreach (Achievement achievement in levelAchievements)
            {
                // Compare current level against achievement target value
                if (level >= achievement.TargetValue)
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

        public async Task<List<UserBadge>> GetUserBadgesAsync(int userId)
        {
            return await _context.UserBadges
                .Include(ub => ub.Badge)
                .Where(ub => ub.UserId == userId)
                .OrderByDescending(ub => ub.AwardedAt)
                .ToListAsync();
        }

        public async Task<UserBadge> AwardBadgeAsync(int userId, int badgeId)
        {
            // Check if already awarded
            UserBadge? existingBadge = await _context.UserBadges
                .FirstOrDefaultAsync(ub => ub.UserId == userId && ub.BadgeId == badgeId);
                
            if (existingBadge != null)
            {
                throw new InvalidOperationException("Badge already awarded");
            }
            
            // Get the badge
            Badge? badge = await _context.Badges.FindAsync(badgeId);
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
            
            _context.UserBadges.Add(userBadge);
            
            // Award points for earning this badge
            await AddPointsAsync(userId, badge.PointValue, "badge", $"Earned badge: {badge.Name}");
            
            await _context.SaveChangesAsync();
            
            // Load the badge relationship
            await _context.Entry(userBadge).Reference(ub => ub.Badge).LoadAsync();
            
            return userBadge;
        }

        public async Task<bool> ToggleBadgeDisplayAsync(int userId, int badgeId, bool isDisplayed)
        {
            UserBadge? userBadge = await _context.UserBadges
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

        public async Task<List<Reward>> GetAvailableRewardsAsync(int userId)
        {
            UserProgress userProgress = await GetUserProgressAsync(userId);
            
            return await _context.Rewards
                .Where(r => r.IsActive && r.MinimumLevel <= userProgress.Level)
                .OrderBy(r => r.PointCost)
                .ToListAsync();
        }

        public async Task<UserReward> RedeemRewardAsync(int userId, int rewardId)
        {
            // Get user progress
            UserProgress userProgress = await GetUserProgressAsync(userId);
            
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
            
            return userReward;
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

        public async Task<List<Challenge>> GetActiveChallengesAsync(int userId)
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
            return availableChallenges.Concat(enrolledChallenges)
                .OrderBy(c => c.EndDate)
                .ToList();
        }

        public async Task<UserChallenge> EnrollInChallengeAsync(int userId, int challengeId)
        {
            // Check if already enrolled
            ChallengeProgress? existingEnrollment = await _context.ChallengeProgresses
                .FirstOrDefaultAsync(cp => cp.UserId == userId && cp.ChallengeId == challengeId);
                
            if (existingEnrollment != null)
            {
                throw new InvalidOperationException("User already enrolled in this challenge");
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
            
            // Load the challenge relationship
            await _context.Entry(userChallenge).Reference(uc => uc.Challenge).LoadAsync();
            
            return userChallenge;
        }

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
        }

        #endregion
        
        #region Daily Login

        public async Task<PointTransaction> ProcessDailyLoginAsync(int userId)
        {
            // Check if already logged in today
            bool hasLoggedIn = await HasUserLoggedInTodayAsync(userId);
            if (hasLoggedIn)
            {
                throw new InvalidOperationException("User has already claimed daily login bonus today");
            }
            
            // Get user progress to check streak
            UserProgress userProgress = await GetUserProgressAsync(userId);
            
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
            
            return transaction;
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

        public async Task<LoginStatus> GetDailyLoginStatusAsync(int userId)
        {
            bool hasLoggedIn = await HasUserLoggedInTodayAsync(userId);
            UserProgress userProgress = await GetUserProgressAsync(userId);
            
            return new LoginStatus
            {
                HasClaimedToday = hasLoggedIn,
                CurrentStreak = userProgress.CurrentStreak,
                PotentialPoints = CalculateDailyLoginPoints(userProgress.CurrentStreak)
            };
        }

        #endregion
        
        #region Suggestions and Stats

        public async Task<List<GamificationSuggestion>> GetGamificationSuggestionsAsync(int userId)
        {
            List<GamificationSuggestion> suggestions = new List<GamificationSuggestion>();
            UserProgress userProgress = await GetUserProgressAsync(userId);
            
            // Suggestion 1: Complete a task if there are incomplete tasks
            List<TaskItem> incompleteTasks = await _context.Tasks
                .Where(t => t.AssignedToId == userId && !t.IsCompleted)
                .ToListAsync();
                
            if (incompleteTasks.Count > 0)
            {
                TaskItem? task = incompleteTasks.FirstOrDefault();
                if (task != null)
                {
                    suggestions.Add(new GamificationSuggestion
                    {
                        Type = "task",
                        Title = "Complete a task",
                        Description = $"Complete \"{task.Title}\" to earn points and make progress.",
                        Points = 10,
                        ActionType = "complete_task",
                        ActionId = task.Id
                    });
                }
            }
            
            // Suggestion 2: Maintain streak
            if (userProgress.LastActivityDate == null || userProgress.LastActivityDate.Value.Date != DateTime.UtcNow.Date)
            {
                suggestions.Add(new GamificationSuggestion
                {
                    Type = "login",
                    Title = "Check in today",
                    Description = $"Log in today to maintain your {userProgress.CurrentStreak} day streak.",
                    Points = 5,
                    ActionType = "login",
                    ActionId = 0
                });
            }
            
            // Suggestion 3: Try to unlock an achievement
            List<int> unlockedAchievements = await _context.UserAchievements
                .Where(ua => ua.UserId == userId)
                .Select(ua => ua.AchievementId)
                .ToListAsync();
                
            Achievement? nextAchievement = await _context.Achievements
                .Where(a => !unlockedAchievements.Contains(a.Id))
                .OrderBy(a => a.Difficulty)
                .FirstOrDefaultAsync();
                
            if (nextAchievement != null)
            {
                suggestions.Add(new GamificationSuggestion
                {
                    Type = "achievement",
                    Title = "Unlock an achievement",
                    Description = $"Try to unlock \"{nextAchievement.Name}\": {nextAchievement.Description}",
                    Points = nextAchievement.PointValue,
                    ActionType = "unlock_achievement",
                    ActionId = nextAchievement.Id
                });
            }
            
            // Suggestion 4: Redeem a reward if they have enough points
            GamificationSuggestion? rewardSuggestion = await GetRewardSuggestionAsync(userId, userProgress.CurrentPoints);
            if (rewardSuggestion != null)
            {
                suggestions.Add(rewardSuggestion);
            }
            
            // Suggestion 5: Work on active challenge
            GamificationSuggestion? challengeSuggestion = await GetChallengeSuggestionAsync(userId);
            if (challengeSuggestion != null)
            {
                suggestions.Add(challengeSuggestion);
            }
            
            return suggestions;
        }

        private async Task<GamificationSuggestion?> GetRewardSuggestionAsync(int userId, int availablePoints)
        {
            // Find a reward the user can afford
            Reward? affordableReward = await _context.Rewards
                .Where(r => r.IsActive && r.PointCost <= availablePoints)
                .OrderBy(r => r.PointCost)
                .FirstOrDefaultAsync();
                
            if (affordableReward != null)
            {
                return new GamificationSuggestion
                {
                    Type = "reward",
                    Title = "Redeem a reward",
                    Description = $"You have enough points to redeem \"{affordableReward.Name}\"",
                    Points = 0, // No points earned for redeeming
                    ActionType = "redeem_reward",
                    ActionId = affordableReward.Id
                };
            }
            
            return null;
        }
        
        private async Task<GamificationSuggestion?> GetChallengeSuggestionAsync(int userId)
        {
            // Get an active challenge for the user
            Challenge? challenge = await GetChallengeForUserAsync(userId);
            
            if (challenge != null)
            {
                ChallengeProgress? progress = await _context.ChallengeProgresses
                    .FirstOrDefaultAsync(cp => cp.UserId == userId && cp.ChallengeId == challenge.Id);
                
                int currentProgress = progress?.CurrentProgress ?? 0;
                int targetCount = challenge.TargetCount;
                int remaining = targetCount - currentProgress;
                
                return new GamificationSuggestion
                {
                    Type = "challenge",
                    Title = "Complete a challenge",
                    Description = $"Work on '{challenge.Name}' - {remaining} more actions needed",
                    Points = challenge.PointReward,
                    ActionType = "work_on_challenge",
                    ActionId = challenge.Id
                };
            }
            
            return null;
        }

        public async Task<GamificationStats> GetGamificationStatsAsync(int userId)
        {
            // Get basic user progress
            UserProgress userProgress = await GetUserProgressAsync(userId);
            
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
            double consistencyScore = CalculateConsistencyScore(userId);
            
            // Get task category stats
            Dictionary<string, int> categoryStats = await GetCategoryStatsAsync(userId);
            
            // Get top users on leaderboard
            List<LeaderboardEntry> topUsers = await GetLeaderboardAsync("points", 5);
            
            return new GamificationStats
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
        
        private double CalculateConsistencyScore(int userId)
        {
            DateTime now = DateTime.UtcNow;
            DateTime thirtyDaysAgo = now.AddDays(-30);
            
            // Count days with activity in the last 30 days
            int activeDays = _context.PointTransactions
                .Where(pt => pt.UserId == userId && pt.CreatedAt >= thirtyDaysAgo)
                .Select(pt => pt.CreatedAt.Date)
                .Distinct()
                .Count();
                
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

        public async Task<List<LeaderboardEntry>> GetLeaderboardAsync(string category, int limit = 10)
        {
            if (category == "points")
            {
                // Leaderboard by total points
                return await _context.UserProgresses
                    .OrderByDescending(up => up.TotalPointsEarned)
                    .Take(limit)
                    .Select(up => new LeaderboardEntry
                    {
                        UserId = up.UserId,
                        Username = up.User != null ? up.User.Username : "Unknown",
                        Value = up.TotalPointsEarned,
                        Rank = 0 // Will be assigned below
                    })
                    .ToListAsync();
            }
            else if (category == "streak")
            {
                // Leaderboard by current streak
                return await _context.UserProgresses
                    .OrderByDescending(up => up.CurrentStreak)
                    .Take(limit)
                    .Select(up => new LeaderboardEntry
                    {
                        UserId = up.UserId,
                        Username = up.User != null ? up.User.Username : "Unknown",
                        Value = up.CurrentStreak,
                        Rank = 0 // Will be assigned below
                    })
                    .ToListAsync();
            }
            else if (category == "tasks")
            {
                // Leaderboard by completed tasks
                List<UserTaskCount> userTaskCounts = await _context.Tasks
                    .Where(t => t.IsCompleted && t.AssignedToId.HasValue)
                    .GroupBy(t => t.AssignedToId)
                    .Select(g => new UserTaskCount { UserId = g.Key, Count = g.Count() })
                    .OrderByDescending(x => x.Count)
                    .Take(limit)
                    .ToListAsync();
                
                List<LeaderboardEntry> result = new List<LeaderboardEntry>();
                
                foreach (UserTaskCount item in userTaskCounts)
                {
                    if (item.UserId.HasValue)
                    {
                        User? user = await _context.Users.FindAsync(item.UserId.Value);
                        if (user != null)
                        {
                            result.Add(new LeaderboardEntry
                            {
                                UserId = item.UserId.Value,
                                Username = user.Username,
                                Value = item.Count,
                                Rank = 0 // Will be assigned below
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

        public async Task<List<PriorityMultiplier>> GetPointMultipliersAsync()
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
            
            return multipliers;
        }
        
        private async Task<double> GetPriorityMultiplier(string priority)
        {
            List<PriorityMultiplier> multipliers = await GetPointMultipliersAsync();
            PriorityMultiplier? multiplier = multipliers.FirstOrDefault(m => m.Priority == priority);
            
            return multiplier?.Multiplier ?? 1.0;
        }

        #endregion

        #region Transaction
        
        public async Task<PointTransaction> GetTransactionAsync(int transactionId)
        {
            PointTransaction? transaction = await _context.PointTransactions.FindAsync(transactionId);
            if (transaction == null)
            {
                throw new ArgumentException("Transaction not found", nameof(transactionId));
            }
            
            return transaction;
        }
        
        #endregion

        public async Task<ChallengeProgress> GetChallengeProgressAsync(int userId, int challengeId)
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
            
            return progress;
        }

        public async Task<ChallengeProgress> UnlockChallengeAsync(int userId, int challengeId)
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
                return existingProgress; // Already unlocked
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
            
            return progress;
        }

        // Better implementation to avoid CS8603 warning
        #nullable enable
        #pragma warning disable CS8603
        public async Task<Challenge?> GetChallengeForUserAsync(int userId)
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
                        return challenge;
                    }
                }
                
                // Otherwise, suggest a new challenge the user hasn't completed yet
                List<int> completedChallengeIds = await _context.ChallengeProgresses
                    .Where(cp => cp.UserId == userId && cp.IsCompleted)
                    .Select(cp => cp.ChallengeId)
                    .ToListAsync();
                
                // The ? indicates this might return null, which is expected and handled
                Challenge? suggestedChallenge = await _context.Challenges
                    .Where(c => c.IsActive && !completedChallengeIds.Contains(c.Id))
                    .OrderBy(c => c.Difficulty)
                    .FirstOrDefaultAsync();
                
                return suggestedChallenge; // This is explicitly nullable, as indicated by the return type
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error finding challenge for user {UserId}", userId);
                return null; // This is intentionally null in the error case
            }
        }
        #pragma warning restore CS8603
        #nullable disable
    }
} 