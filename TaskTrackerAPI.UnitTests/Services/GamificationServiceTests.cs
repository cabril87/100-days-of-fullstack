using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TaskTrackerAPI.Data;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Services;
using Xunit;
using TaskTrackerAPI.Models.Gamification;
using TaskTrackerAPI.Services.Interfaces;
using TaskTrackerAPI.DTOs.Gamification;
using AutoMapper;
using GamificationModels = TaskTrackerAPI.Models.Gamification;

namespace TaskTrackerAPI.UnitTests.Services
{
    public class GamificationServiceTests
    {
        private readonly DbContextOptions<ApplicationDbContext> _options;
        private readonly Mock<ILogger<GamificationService>> _mockLogger;
        
        public GamificationServiceTests()
        {
            _options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: $"GamificationDB_{Guid.NewGuid()}")
                .Options;
                
            _mockLogger = new Mock<ILogger<GamificationService>>();
            
            // Seed the database
            using (ApplicationDbContext context = new ApplicationDbContext(_options))
            {
                // Add test user
                User user = new User
                {
                    Id = 1,
                    Username = "testuser",
                    Email = "test@example.com",
                    PasswordHash = "hash",
                    Salt = "salt",
                    Role = "User",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };
                
                context.Users.Add(user);
                
                // Add test achievements
                Achievement achievement = new Achievement
                {
                    Id = 1,
                    Name = "Test Achievement",
                    Description = "For testing",
                    Category = "Task",
                    PointValue = 100,
                    IconName = "test-icon",
                    Criteria = "Complete 3 tasks",
                    RequiredCount = 3,
                    IsSecret = false
                };
                
                context.Achievements.Add(achievement);
                
                // Add test badge
                Badge badge = new Badge
                {
                    Id = 1,
                    Name = "Test Badge",
                    Description = "For testing",
                    Category = "Task",
                    Tier = "Bronze",
                    IconName = "test-badge"
                };
                
                context.Badges.Add(badge);
                
                // Add test challenge
                Challenge challenge = new Challenge
                {
                    Id = 1,
                    Name = "Test Challenge",
                    Description = "For testing",
                    ChallengeType = "Task",
                    ActivityType = "Complete",
                    TargetCount = 3,
                    PointReward = 150,
                    BadgeId = 1,
                    StartDate = DateTime.UtcNow.AddDays(-1),
                    EndDate = DateTime.UtcNow.AddDays(7),
                    IsActive = true
                };
                
                context.Challenges.Add(challenge);
                
                // Add priority multipliers
                PriorityMultiplier highPriority = new PriorityMultiplier
                {
                    Id = 1,
                    PriorityLevel = 3,
                    MultiplierValue = 1.5
                };
                
                context.PriorityMultipliers.Add(highPriority);
                
                context.SaveChanges();
            }
        }
        
        [Fact]
        public async Task ProcessDailyLoginAsync_FirstLogin_ShouldCreateLoginRecord()
        {
            // Arrange
            using (ApplicationDbContext context = new ApplicationDbContext(_options))
            {
                var mockRealTimeService = new Mock<IGamificationRealTimeService>();
                var mockMapper = new Mock<IMapper>();
                GamificationService service = new GamificationService(context, _mockLogger.Object, mockMapper.Object, mockRealTimeService.Object);
                int userId = 1;
                
                // Act
                PointTransactionDTO result = await service.ProcessDailyLoginAsync(userId);
                
                // Assert
                Assert.NotNull(result);
                Assert.Equal(userId, result.UserId);
                Assert.True(result.Points > 0);
                
                // Verify login record was created
                bool hasLoginToday = await service.HasUserLoggedInTodayAsync(userId);
                Assert.True(hasLoginToday);
            }
        }
        
        [Fact]
        public async Task HasUserLoggedInTodayAsync_AfterLogin_ShouldReturnTrue()
        {
            // Arrange
            using (ApplicationDbContext context = new ApplicationDbContext(_options))
            {
                var mockRealTimeService = new Mock<IGamificationRealTimeService>();
                var mockMapper = new Mock<IMapper>();
                GamificationService service = new GamificationService(context, _mockLogger.Object, mockMapper.Object, mockRealTimeService.Object);
                int userId = 1;
                
                // Add point transaction for today's login
                PointTransaction loginTransaction = new PointTransaction
                {
                    UserId = userId,
                    Points = 10,
                    TransactionType = "daily_login",
                    Description = "Daily login bonus",
                    CreatedAt = DateTime.UtcNow
                };
                
                context.PointTransactions.Add(loginTransaction);
                await context.SaveChangesAsync();
                
                // Act
                bool result = await service.HasUserLoggedInTodayAsync(userId);
                
                // Assert
                Assert.True(result);
            }
        }
        
        [Fact]
        public async Task EnrollInChallengeAsync_ValidChallenge_ShouldCreateUserChallenge()
        {
            // Arrange
            using (ApplicationDbContext context = new ApplicationDbContext(_options))
            {
                var mockRealTimeService = new Mock<IGamificationRealTimeService>();
                var mockMapper = new Mock<IMapper>();
                mockMapper.Setup(m => m.Map<UserChallengeDTO>(It.IsAny<UserChallenge>()))
                    .Returns(new UserChallengeDTO { Id = 1, UserId = 1, ChallengeId = 1 });
                GamificationService service = new GamificationService(context, _mockLogger.Object, mockMapper.Object, mockRealTimeService.Object);
                int userId = 1;
                int challengeId = 1;
                
                // Act
                UserChallengeDTO result = await service.EnrollInChallengeAsync(userId, challengeId);
                
                // Assert
                Assert.NotNull(result);
                Assert.Equal(userId, result.UserId);
                Assert.Equal(challengeId, result.ChallengeId);
            }
        }
        
        [Fact]
        public async Task EnrollInChallengeAsync_AlreadyEnrolled_ShouldThrowInvalidOperationException()
        {
            // Arrange
            using (ApplicationDbContext context = new ApplicationDbContext(_options))
            {
                // Add existing challenge progress
                ChallengeProgress existingProgress = new ChallengeProgress
                {
                    UserId = 1,
                    ChallengeId = 1,
                    CurrentProgress = 0,
                    IsCompleted = false,
                    EnrolledAt = DateTime.UtcNow
                };
                
                context.ChallengeProgresses.Add(existingProgress);
                await context.SaveChangesAsync();
                
                var mockRealTimeService = new Mock<IGamificationRealTimeService>();
                var mockMapper = new Mock<IMapper>();
                GamificationService service = new GamificationService(context, _mockLogger.Object, mockMapper.Object, mockRealTimeService.Object);
                
                // Act & Assert
                await Assert.ThrowsAsync<InvalidOperationException>(async () => 
                    await service.EnrollInChallengeAsync(1, 1));
            }
        }
        
        [Fact]
        public async Task ProcessChallengeProgressAsync_EnrolledChallenge_ShouldIncrementProgress()
        {
            // Arrange
            using (ApplicationDbContext context = new ApplicationDbContext(_options))
            {
                // Add a task
                TaskItem task = new TaskItem
                {
                    Id = 1,
                    Title = "Test Task",
                    UserId = 1,
                    Priority = "High",
                    Status = TaskItemStatus.Completed,
                    CreatedAt = DateTime.UtcNow
                };
                
                context.Tasks.Add(task);
                await context.SaveChangesAsync();
                
                var mockRealTimeService = new Mock<IGamificationRealTimeService>();
                var mockMapper = new Mock<IMapper>();
                GamificationService service = new GamificationService(context, _mockLogger.Object, mockMapper.Object, mockRealTimeService.Object);
                
                // Act
                await service.ProcessChallengeProgressAsync(1, "task_completion", 1);
                
                // Assert - verify challenge progress was updated
                ChallengeProgress? progress = await context.ChallengeProgresses
                    .FirstOrDefaultAsync(cp => cp.UserId == 1 && cp.ChallengeId == 1);
                    
                Assert.NotNull(progress);
                Assert.Equal(1, progress.CurrentProgress);
                Assert.False(progress.IsCompleted);
            }
        }
        
        [Fact]
        public async Task ProcessChallengeProgressAsync_CompletedChallenge_ShouldAwardPoints()
        {
            // Arrange
            using (ApplicationDbContext context = new ApplicationDbContext(_options))
            {
                // Add user progress
                UserProgress progress = new UserProgress
                {
                    Id = 1,
                    UserId = 1,
                    TotalPointsEarned = 0,
                    Level = 1,
                    CurrentPoints = 0,
                    NextLevelThreshold = 100,
                    CurrentStreak = 0,
                    LongestStreak = 0,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                
                context.UserProgresses.Add(progress);
                
                // Add user challenge at target-1
                UserChallenge userChallenge = new UserChallenge
                {
                    Id = 1,
                    UserId = 1,
                    ChallengeId = 1,
                    CurrentProgress = 2, // Target is 3, so this will complete
                    IsCompleted = false,
                    EnrolledAt = DateTime.UtcNow
                };
                
                // Add task to trigger completion
                TaskItem task = new TaskItem
                {
                    Id = 2,
                    Title = "Test Task 2",
                    UserId = 1,
                    Priority = "High",
                    Status = TaskItemStatus.Completed,
                    CreatedAt = DateTime.UtcNow
                };
                
                context.UserChallenges.Add(userChallenge);
                context.Tasks.Add(task);
                await context.SaveChangesAsync();
                
                var mockRealTimeService = new Mock<IGamificationRealTimeService>();
                var mockMapper = new Mock<IMapper>();
                GamificationService service = new GamificationService(context, _mockLogger.Object, mockMapper.Object, mockRealTimeService.Object);
                
                // Act
                await service.ProcessChallengeProgressAsync(1, "task_completion", 2);
                
                // Assert
                UserChallenge? completedChallenge = await context.UserChallenges
                    .FirstOrDefaultAsync(uc => uc.UserId == 1 && uc.ChallengeId == 1);
                    
                Assert.NotNull(completedChallenge);
                Assert.True(completedChallenge.IsCompleted);
                
                // Verify points were awarded
                PointTransaction? pointTransaction = await context.PointTransactions
                    .FirstOrDefaultAsync(pt => pt.UserId == 1 && pt.TransactionType == "challenge_completion");
                    
                Assert.NotNull(pointTransaction);
                Assert.Equal(150, pointTransaction.Points); // Challenge point reward
            }
        }

        [Fact]
        public async Task GetUserProgressAsync_NewUser_ShouldCreateProgressRecord()
        {
            // Arrange
            using (ApplicationDbContext context = new ApplicationDbContext(_options))
            {
                var mockRealTimeService = new Mock<IGamificationRealTimeService>();
                var mockMapper = new Mock<IMapper>();
                mockMapper.Setup(m => m.Map<UserProgressDTO>(It.IsAny<UserProgress>()))
                    .Returns((UserProgress up) => new UserProgressDTO
                    {
                        UserId = up.UserId,
                        Level = up.Level,
                        CurrentPoints = up.CurrentPoints,
                        TotalPointsEarned = up.TotalPointsEarned,
                        CurrentStreak = up.CurrentStreak
                    });
                GamificationService service = new GamificationService(context, _mockLogger.Object, mockMapper.Object, mockRealTimeService.Object);
                int userId = 2; // User without progress record
                
                // Add test user
                User user = new User
                {
                    Id = userId,
                    Username = "testuser2",
                    Email = "test2@example.com",
                    PasswordHash = "hashedpassword",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                
                context.Users.Add(user);
                await context.SaveChangesAsync();
                
                // Act
                UserProgressDTO result = await service.GetUserProgressAsync(userId);
                
                // Assert
                Assert.NotNull(result);
                Assert.Equal(userId, result.UserId);
                Assert.Equal(1, result.Level);
                Assert.Equal(0, result.TotalPointsEarned);
                Assert.Equal(0, result.CurrentStreak);
                
                // Verify it was persisted
                UserProgress? savedProgress = await context.UserProgresses
                    .FirstOrDefaultAsync(up => up.UserId == userId);
                    
                Assert.NotNull(savedProgress);
            }
        }

        [Fact]
        public async Task AddPointsAsync_ShouldCreatePointTransaction()
        {
            // Arrange
            using (ApplicationDbContext context = new ApplicationDbContext(_options))
            {
                var mockRealTimeService = new Mock<IGamificationRealTimeService>();
                var mockMapper = new Mock<IMapper>();
                GamificationService service = new GamificationService(context, _mockLogger.Object, mockMapper.Object, mockRealTimeService.Object);
                int userId = 1;
                
                // Setup user with progress near level threshold
                UserProgress progress = new UserProgress
                {
                    UserId = userId,
                    Level = 1,
                    TotalPoints = 95, // Level 2 requires 100 points
                    StreakDays = 0,
                    LastActivityDate = DateTime.UtcNow,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                
                context.UserProgress.Add(progress);
                await context.SaveChangesAsync();
                
                // Act
                PointTransaction transaction = await service.AddPointsAsync(userId, 10, "Level up test", "Task");
                
                // Assert
                Assert.NotNull(transaction);
                Assert.Equal(10, transaction.Points);
                
                // Verify level up
                UserProgress updatedProgress = await context.UserProgress
                    .FirstOrDefaultAsync(up => up.UserId == userId);
                    
                Assert.Equal(2, updatedProgress.Level);
                Assert.Equal(105, updatedProgress.TotalPoints);
            }
        }

        [Fact]
        public async Task UpdateStreakAsync_WhenLastActivityYesterday_ShouldIncrementStreak()
        {
            // Arrange
            using (ApplicationDbContext context = new ApplicationDbContext(_options))
            {
                GamificationService service = new GamificationService(context, _mockLogger.Object);
                int userId = 1;
                
                // Setup user with progress and yesterday's activity
                UserProgress progress = new UserProgress
                {
                    UserId = userId,
                    Level = 1,
                    TotalPoints = 100,
                    StreakDays = 5,
                    LastActivityDate = DateTime.UtcNow.AddDays(-1).Date, // Yesterday
                    CreatedAt = DateTime.UtcNow.AddDays(-5),
                    UpdatedAt = DateTime.UtcNow.AddDays(-1)
                };
                
                context.UserProgress.Add(progress);
                await context.SaveChangesAsync();
                
                // Act
                await service.UpdateStreakAsync(userId);
                
                // Assert
                UserProgress updatedProgress = await context.UserProgress
                    .FirstOrDefaultAsync(up => up.UserId == userId);
                    
                Assert.Equal(6, updatedProgress.StreakDays);
                Assert.Equal(DateTime.UtcNow.Date, updatedProgress.LastActivityDate.Value.Date);
            }
        }

        [Fact]
        public async Task UpdateStreakAsync_WhenLastActivityTwoDaysAgo_ShouldResetStreak()
        {
            // Arrange
            using (ApplicationDbContext context = new ApplicationDbContext(_options))
            {
                GamificationService service = new GamificationService(context, _mockLogger.Object);
                int userId = 1;
                
                // Setup user with progress and activity from two days ago
                UserProgress progress = new UserProgress
                {
                    UserId = userId,
                    Level = 1,
                    TotalPoints = 100,
                    StreakDays = 10,
                    LastActivityDate = DateTime.UtcNow.AddDays(-2).Date, // Two days ago
                    CreatedAt = DateTime.UtcNow.AddDays(-10),
                    UpdatedAt = DateTime.UtcNow.AddDays(-2)
                };
                
                context.UserProgress.Add(progress);
                await context.SaveChangesAsync();
                
                // Act
                await service.UpdateStreakAsync(userId);
                
                // Assert
                UserProgress updatedProgress = await context.UserProgress
                    .FirstOrDefaultAsync(up => up.UserId == userId);
                    
                Assert.Equal(1, updatedProgress.StreakDays); // Reset to 1 (today)
                Assert.Equal(DateTime.UtcNow.Date, updatedProgress.LastActivityDate.Value.Date);
            }
        }

        [Fact]
        public async Task UpdateStreakAsync_WithWeeklyMilestone_ShouldAwardBonusPoints()
        {
            // Arrange
            using (ApplicationDbContext context = new ApplicationDbContext(_options))
            {
                GamificationService service = new GamificationService(context, _mockLogger.Object);
                int userId = 1;
                
                // Setup user with progress at 6 days (next login will be 7 = weekly milestone)
                UserProgress progress = new UserProgress
                {
                    UserId = userId,
                    Level = 1,
                    TotalPoints = 100,
                    StreakDays = 6,
                    LastActivityDate = DateTime.UtcNow.AddDays(-1).Date, // Yesterday
                    CreatedAt = DateTime.UtcNow.AddDays(-6),
                    UpdatedAt = DateTime.UtcNow.AddDays(-1)
                };
                
                context.UserProgress.Add(progress);
                await context.SaveChangesAsync();
                
                // Act
                await service.UpdateStreakAsync(userId);
                
                // Assert
                UserProgress updatedProgress = await context.UserProgress
                    .FirstOrDefaultAsync(up => up.UserId == userId);
                    
                Assert.Equal(7, updatedProgress.StreakDays);
                
                // Verify bonus points were awarded
                PointTransaction bonusTransaction = await context.PointTransactions
                    .Where(pt => pt.UserId == userId && pt.TransactionType == "StreakBonus")
                    .OrderByDescending(pt => pt.CreatedAt)
                    .FirstOrDefaultAsync();
                    
                Assert.NotNull(bonusTransaction);
                Assert.Equal(50, bonusTransaction.Points); // Weekly bonus is 50 points
            }
        }

        [Fact]
        public async Task UnlockAchievementAsync_ProgressiveAchievement_ShouldIncrementProgressButNotComplete()
        {
            // Arrange
            using (ApplicationDbContext context = new ApplicationDbContext(_options))
            {
                GamificationService service = new GamificationService(context, _mockLogger.Object);
                int userId = 1;
                int achievementId = 1; // Uses the test achievement with RequiredCount = 3
                
                // Act (first progress increment)
                UserAchievement result = await service.UnlockAchievementAsync(userId, achievementId);
                
                // Assert
                Assert.NotNull(result);
                Assert.Equal(userId, result.UserId);
                Assert.Equal(achievementId, result.AchievementId);
                Assert.Equal(1, result.CurrentProgress);
                Assert.False(result.IsComplete);
                Assert.Null(result.UnlockedAt);
                
                // Verify no points were awarded yet (achievement not completed)
                PointTransaction transaction = await context.PointTransactions
                    .Where(pt => pt.UserId == userId && pt.TransactionType == "Achievement")
                    .FirstOrDefaultAsync();
                    
                Assert.Null(transaction);
            }
        }

        [Fact]
        public async Task UnlockAchievementAsync_CompletingAchievement_ShouldAwardPoints()
        {
            // Arrange
            using (ApplicationDbContext context = new ApplicationDbContext(_options))
            {
                GamificationService service = new GamificationService(context, _mockLogger.Object);
                int userId = 1;
                int achievementId = 1; // Uses the test achievement with RequiredCount = 3
                
                // Setup initial progress
                UserAchievement userAchievement = new UserAchievement
                {
                    UserId = userId,
                    AchievementId = achievementId,
                    CurrentProgress = 2, // Already at 2/3
                    IsComplete = false,
                    UnlockedAt = null
                };
                
                context.UserAchievements.Add(userAchievement);
                await context.SaveChangesAsync();
                
                // Act (final progress increment to complete achievement)
                UserAchievement result = await service.UnlockAchievementAsync(userId, achievementId);
                
                // Assert
                Assert.NotNull(result);
                Assert.Equal(3, result.CurrentProgress);
                Assert.True(result.IsComplete);
                Assert.NotNull(result.UnlockedAt);
                
                // Verify points were awarded
                PointTransaction transaction = await context.PointTransactions
                    .Where(pt => pt.UserId == userId && pt.TransactionType == "Achievement")
                    .FirstOrDefaultAsync();
                    
                Assert.NotNull(transaction);
                Assert.Equal(100, transaction.Points); // Achievement is worth 100 points
            }
        }

        [Fact]
        public async Task AwardBadgeAsync_NewBadge_ShouldAwardPointsAndSetDisplayed()
        {
            // Arrange
            using (ApplicationDbContext context = new ApplicationDbContext(_options))
            {
                GamificationService service = new GamificationService(context, _mockLogger.Object);
                int userId = 1;
                int badgeId = 1;
                
                // Act
                UserBadge result = await service.AwardBadgeAsync(userId, badgeId);
                
                // Assert
                Assert.NotNull(result);
                Assert.Equal(userId, result.UserId);
                Assert.Equal(badgeId, result.BadgeId);
                Assert.True(result.IsDisplayed);
                
                // Verify points were awarded
                PointTransaction transaction = await context.PointTransactions
                    .Where(pt => pt.UserId == userId && pt.TransactionType == "Badge")
                    .FirstOrDefaultAsync();
                    
                Assert.NotNull(transaction);
                Assert.Equal(25, transaction.Points); // Badge award is worth 25 points
            }
        }

        [Fact]
        public async Task RedeemRewardAsync_EnoughPoints_ShouldDeductPointsAndCreateUserReward()
        {
            // Arrange
            using (ApplicationDbContext context = new ApplicationDbContext(_options))
            {
                GamificationService service = new GamificationService(context, _mockLogger.Object);
                int userId = 1;
                
                // Add test reward
                Reward reward = new Reward
                {
                    Id = 1,
                    Name = "Test Reward",
                    Description = "For testing",
                    Category = "Theme",
                    PointCost = 50,
                    LevelRequired = 1,
                    IconName = "reward-icon",
                    IsActive = true
                };
                
                context.Rewards.Add(reward);
                
                // Setup user progress with enough points
                UserProgress progress = new UserProgress
                {
                    UserId = userId,
                    Level = 2,
                    TotalPoints = 200,
                    StreakDays = 0,
                    LastActivityDate = DateTime.UtcNow,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                
                context.UserProgress.Add(progress);
                await context.SaveChangesAsync();
                
                // Act
                UserReward result = await service.RedeemRewardAsync(userId, reward.Id);
                
                // Assert
                Assert.NotNull(result);
                Assert.Equal(userId, result.UserId);
                Assert.Equal(reward.Id, result.RewardId);
                Assert.False(result.IsUsed);
                
                // Verify points were deducted
                UserProgress updatedProgress = await context.UserProgress
                    .FirstOrDefaultAsync(up => up.UserId == userId);
                    
                Assert.Equal(150, updatedProgress.TotalPoints); // 200 - 50 = 150
                
                // Verify negative transaction was created
                PointTransaction transaction = await context.PointTransactions
                    .Where(pt => pt.UserId == userId && pt.TransactionType == "RewardRedemption")
                    .FirstOrDefaultAsync();
                    
                Assert.NotNull(transaction);
                Assert.Equal(-50, transaction.Points);
            }
        }

        [Fact]
        public async Task RedeemRewardAsync_NotEnoughPoints_ShouldThrowInvalidOperationException()
        {
            // Arrange
            using (ApplicationDbContext context = new ApplicationDbContext(_options))
            {
                GamificationService service = new GamificationService(context, _mockLogger.Object);
                int userId = 1;
                
                // Add test reward
                Reward reward = new Reward
                {
                    Id = 2,
                    Name = "Expensive Reward",
                    Description = "For testing",
                    Category = "Theme",
                    PointCost = 1000, // Very expensive
                    LevelRequired = 1,
                    IconName = "reward-icon",
                    IsActive = true
                };
                
                context.Rewards.Add(reward);
                
                // Setup user progress with NOT enough points
                UserProgress progress = new UserProgress
                {
                    UserId = userId,
                    Level = 2,
                    TotalPoints = 100,
                    StreakDays = 0,
                    LastActivityDate = DateTime.UtcNow,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                
                context.UserProgress.Add(progress);
                await context.SaveChangesAsync();
                
                // Act & Assert
                await Assert.ThrowsAsync<InvalidOperationException>(async () => 
                    await service.RedeemRewardAsync(userId, reward.Id));
            }
        }

        [Fact]
        public async Task GetLeaderboardAsync_PointsCategory_ShouldReturnOrderedByPoints()
        {
            // Arrange
            using (ApplicationDbContext context = new ApplicationDbContext(_options))
            {
                GamificationService service = new GamificationService(context, _mockLogger.Object);
                
                // Add multiple users with different point totals
                User user2 = new User
                {
                    Id = 2,
                    Username = "user2",
                    Email = "user2@example.com",
                    PasswordHash = "hash",
                    Salt = "salt",
                    Role = "User",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };
                
                User user3 = new User
                {
                    Id = 3,
                    Username = "user3",
                    Email = "user3@example.com",
                    PasswordHash = "hash",
                    Salt = "salt",
                    Role = "User",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };
                
                context.Users.AddRange(user2, user3);
                
                // Add progress with different points
                UserProgress progress1 = new UserProgress
                {
                    UserId = 1,
                    Level = 3,
                    TotalPoints = 300,
                    StreakDays = 5,
                    LastActivityDate = DateTime.UtcNow,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                
                UserProgress progress2 = new UserProgress
                {
                    UserId = 2,
                    Level = 5,
                    TotalPoints = 500,
                    StreakDays = 10,
                    LastActivityDate = DateTime.UtcNow,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                
                UserProgress progress3 = new UserProgress
                {
                    UserId = 3,
                    Level = 2,
                    TotalPoints = 100,
                    StreakDays = 2,
                    LastActivityDate = DateTime.UtcNow,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                
                context.UserProgress.AddRange(progress1, progress2, progress3);
                await context.SaveChangesAsync();
                
                // Act
                List<LeaderboardEntry> leaderboard = await service.GetLeaderboardAsync();
                
                // Assert
                Assert.Equal(3, leaderboard.Count);
                Assert.Equal(2, leaderboard[0].UserId); // Top user with 500 points
                Assert.Equal(1, leaderboard[1].UserId); // Second user with 300 points
                Assert.Equal(3, leaderboard[2].UserId); // Third user with 100 points
                
                Assert.Equal(1, leaderboard[0].Rank);
                Assert.Equal(2, leaderboard[1].Rank);
                Assert.Equal(3, leaderboard[2].Rank);
            }
        }
    }
} 