using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using TaskTrackerAPI.Controllers;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.Services.Interfaces;
using Xunit;

namespace TaskTrackerAPI.UnitTests.Controllers
{
    public class GamificationControllerTests
    {
        private readonly Mock<IGamificationService> _mockGamificationService;
        private readonly Mock<ILogger<GamificationController>> _mockLogger;
        private readonly GamificationController _controller;

        public GamificationControllerTests()
        {
            _mockGamificationService = new Mock<IGamificationService>();
            _mockLogger = new Mock<ILogger<GamificationController>>();
            
            // Create the controller with our mock service
            _controller = new GamificationController(_mockGamificationService.Object, _mockLogger.Object);

            // Setup controller context with mock user
            ClaimsPrincipal user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.NameIdentifier, "1"),
                new Claim(ClaimTypes.Name, "testuser")
            }, "mock"));

            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            };
        }

        #region User Progress Tests

        [Fact]
        public async Task GetUserProgress_ReturnsOkResult_WithUserProgressDTO()
        {
            // Arrange
            UserProgress userProgress = new UserProgress
            {
                Id = 1,
                UserId = 1,
                Level = 3,
                CurrentPoints = 500,
                TotalPointsEarned = 500,
                CurrentStreak = 5,
                LastActivityDate = DateTime.UtcNow.AddDays(-1)
            };

            _mockGamificationService.Setup(s => s.GetUserProgressAsync(1))
                .ReturnsAsync(userProgress);

            // Act
            ActionResult<UserProgressDTO> result = await _controller.GetUserProgress();

            // Assert
            OkObjectResult okResult = Assert.IsType<OkObjectResult>(result.Result);
            UserProgressDTO returnValue = Assert.IsType<UserProgressDTO>(okResult.Value);
            Assert.Equal(1, returnValue.UserId);
            Assert.Equal(3, returnValue.Level);
            Assert.Equal(500, returnValue.CurrentPoints);
            Assert.Equal(5, returnValue.CurrentStreak);
        }

        [Fact]
        public async Task GetUserProgress_WhenExceptionOccurs_ReturnsInternalServerError()
        {
            // Arrange
            _mockGamificationService.Setup(s => s.GetUserProgressAsync(1))
                .ThrowsAsync(new Exception("Test exception"));

            // Act
            ActionResult<UserProgressDTO> result = await _controller.GetUserProgress();

            // Assert
            ObjectResult statusCodeResult = Assert.IsType<ObjectResult>(result.Result);
            Assert.Equal(500, statusCodeResult.StatusCode);
        }

        #endregion

        #region Achievements Tests

        [Fact]
        public async Task GetUserAchievements_ReturnsOkResult_WithAchievementsList()
        {
            // Arrange
            Achievement achievement = new Achievement
            {
                Id = 1,
                Name = "Test Achievement",
                Description = "Test Description",
                Category = "Test",
                PointValue = 100,
                IconPath = "award.png",
                IsHidden = false,
                Difficulty = 1
            };

            UserAchievement userAchievement = new UserAchievement
            {
                Id = 1,
                UserId = 1,
                AchievementId = 1,
                Achievement = achievement,
                UnlockedAt = DateTime.UtcNow.AddDays(-1)
            };

            List<UserAchievement> userAchievements = new List<UserAchievement> { userAchievement };

            _mockGamificationService.Setup(s => s.GetUserAchievementsAsync(1))
                .ReturnsAsync(userAchievements);

            // Act
            ActionResult<IEnumerable<UserAchievementDTO>> result = await _controller.GetUserAchievements();

            // Assert
            OkObjectResult okResult = Assert.IsType<OkObjectResult>(result.Result);
            List<UserAchievementDTO> returnValue = Assert.IsType<List<UserAchievementDTO>>(okResult.Value);
            Assert.Single(returnValue);
            UserAchievementDTO firstAchievement = Assert.Single(returnValue);
            Assert.Equal("Test Achievement", firstAchievement.Achievement.Name);
            Assert.Equal(DateTime.UtcNow.AddDays(-1).Date, firstAchievement.UnlockedAt.Date);
        }

        [Fact]
        public async Task GetUserAchievements_WhenExceptionOccurs_ReturnsInternalServerError()
        {
            // Arrange
            _mockGamificationService.Setup(s => s.GetUserAchievementsAsync(1))
                .ThrowsAsync(new Exception("Test exception"));

            // Act
            ActionResult<IEnumerable<UserAchievementDTO>> result = await _controller.GetUserAchievements();

            // Assert
            ObjectResult statusCodeResult = Assert.IsType<ObjectResult>(result.Result);
            Assert.Equal(500, statusCodeResult.StatusCode);
        }

        #endregion

        #region Badges Tests

        [Fact]
        public async Task GetUserBadges_ReturnsOkResult_WithBadgesList()
        {
            // Arrange
            Badge badge = new Badge
            {
                Id = 1,
                Name = "Test Badge",
                Description = "Test Description",
                Category = "Test",
                IconPath = "star.png",
                IsSpecial = false
            };

            UserBadge userBadge = new UserBadge
            {
                Id = 1,
                UserId = 1,
                BadgeId = 1,
                Badge = badge,
                AwardedAt = DateTime.UtcNow.AddDays(-1),
                IsDisplayed = true
            };

            List<UserBadge> userBadges = new List<UserBadge> { userBadge };

            _mockGamificationService.Setup(s => s.GetUserBadgesAsync(1))
                .ReturnsAsync(userBadges);

            // Act
            ActionResult<IEnumerable<UserBadgeDTO>> result = await _controller.GetUserBadges();

            // Assert
            OkObjectResult okResult = Assert.IsType<OkObjectResult>(result.Result);
            List<UserBadgeDTO> returnValue = Assert.IsType<List<UserBadgeDTO>>(okResult.Value);
            Assert.Single(returnValue);
            UserBadgeDTO firstBadge = Assert.Single(returnValue);
            Assert.Equal("Test Badge", firstBadge.Badge.Name);
            Assert.True(firstBadge.IsDisplayed);
        }

        [Fact]
        public async Task ToggleBadgeDisplay_WhenBadgeExists_ReturnsNoContent()
        {
            // Arrange
            BadgeToggleDTO toggleDto = new BadgeToggleDTO
            {
                BadgeId = 1,
                IsDisplayed = true
            };

            _mockGamificationService.Setup(s => s.ToggleBadgeDisplayAsync(1, 1, true))
                .ReturnsAsync(true);

            // Act
            ActionResult<bool> result = await _controller.ToggleBadgeDisplay(toggleDto);

            // Assert
            Assert.IsType<NoContentResult>(result.Result);
        }

        #endregion

        #region Gamification Features Tests

        [Fact]
        public async Task GetSuggestions_ReturnsOkResult_WithSuggestionsList()
        {
            // Arrange
            List<GamificationSuggestion> suggestions = new List<GamificationSuggestion>
            {
                new GamificationSuggestion
                {
                    Title = "Complete a High Priority Task",
                    Description = "Complete a high priority task to earn more points",
                    Type = "Task",
                    PotentialPoints = 30,
                    RelevanceScore = 0.8
                }
            };

            _mockGamificationService.Setup(s => s.GetGamificationSuggestionsAsync(1))
                .ReturnsAsync(suggestions);

            // Act
            ActionResult<List<GamificationSuggestion>> result = await _controller.GetSuggestions();

            // Assert
            OkObjectResult okResult = Assert.IsType<OkObjectResult>(result.Result);
            List<GamificationSuggestion> returnValue = Assert.IsType<List<GamificationSuggestion>>(okResult.Value);
            Assert.Single(returnValue);
            Assert.Equal("Complete a High Priority Task", returnValue[0].Title);
        }

        [Fact]
        public async Task GetStats_ReturnsOkResult_WithGamificationStats()
        {
            // Arrange
            GamificationStats stats = new GamificationStats
            {
                Progress = new UserProgressDTO { Level = 3, TotalPoints = 500 },
                CompletedTasks = 25,
                AchievementsUnlocked = 5,
                BadgesEarned = 3
            };

            _mockGamificationService.Setup(s => s.GetGamificationStatsAsync(1))
                .ReturnsAsync(stats);

            // Act
            ActionResult<GamificationStats> result = await _controller.GetStats();

            // Assert
            OkObjectResult okResult = Assert.IsType<OkObjectResult>(result.Result);
            GamificationStats returnValue = Assert.IsType<GamificationStats>(okResult.Value);
            Assert.Equal(3, returnValue.Progress.Level);
            Assert.Equal(25, returnValue.CompletedTasks);
        }

        [Fact]
        public async Task GetLeaderboard_ReturnsOkResult_WithLeaderboardEntries()
        {
            // Arrange
            List<LeaderboardEntry> leaderboard = new List<LeaderboardEntry>
            {
                new LeaderboardEntry { UserId = 1, Username = "user1", Score = 500, Rank = 1 },
                new LeaderboardEntry { UserId = 2, Username = "user2", Score = 300, Rank = 2 }
            };

            _mockGamificationService.Setup(s => s.GetLeaderboardAsync("points", 10))
                .ReturnsAsync(leaderboard);

            // Act
            ActionResult<List<LeaderboardEntry>> result = await _controller.GetLeaderboard();

            // Assert
            OkObjectResult okResult = Assert.IsType<OkObjectResult>(result.Result);
            List<LeaderboardEntry> returnValue = Assert.IsType<List<LeaderboardEntry>>(okResult.Value);
            Assert.Equal(2, returnValue.Count);
            Assert.Equal("user1", returnValue[0].Username);
            Assert.Equal(500, returnValue[0].Score);
        }

        [Fact]
        public async Task GetLeaderboard_WithInvalidCategory_ReturnsBadRequest()
        {
            // Arrange
            _mockGamificationService.Setup(s => s.GetLeaderboardAsync("invalid", 10))
                .ThrowsAsync(new ArgumentException("Invalid category"));

            // Act
            ActionResult<List<LeaderboardEntry>> result = await _controller.GetLeaderboard("invalid");

            // Assert
            Assert.IsType<BadRequestObjectResult>(result.Result);
        }

        #endregion

        #region Daily Login Tests

        [Fact]
        public async Task ClaimDailyLoginReward_WhenNotClaimedYet_ReturnsOkWithPoints()
        {
            // Arrange
            PointTransaction pointTransaction = new PointTransaction
            {
                Id = 1,
                UserId = 1,
                Points = 10,
                Description = "Daily login reward",
                TransactionType = "Login",
                CreatedAt = DateTime.UtcNow
            };

            _mockGamificationService.Setup(s => s.HasUserLoggedInTodayAsync(1))
                .ReturnsAsync(false);
            _mockGamificationService.Setup(s => s.ProcessDailyLoginAsync(1))
                .ReturnsAsync(pointTransaction);

            // Act
            ActionResult<PointTransactionDTO> result = await _controller.ClaimDailyLoginReward();

            // Assert
            OkObjectResult okResult = Assert.IsType<OkObjectResult>(result.Result);
            PointTransactionDTO returnValue = Assert.IsType<PointTransactionDTO>(okResult.Value);
            Assert.Equal(10, returnValue.Points);
            Assert.Equal("Daily login reward", returnValue.Description);
        }

        [Fact]
        public async Task ClaimDailyLoginReward_WhenAlreadyClaimed_ReturnsBadRequest()
        {
            // Arrange
            _mockGamificationService.Setup(s => s.HasUserLoggedInTodayAsync(1))
                .ReturnsAsync(true);

            // Act
            ActionResult<PointTransactionDTO> result = await _controller.ClaimDailyLoginReward();

            // Assert
            Assert.IsType<BadRequestObjectResult>(result.Result);
        }

        [Fact]
        public async Task GetDailyLoginStatus_ReturnsOkResult_WithLoginStatus()
        {
            // Arrange
            UserProgress progress = new UserProgress
            {
                UserId = 1,
                StreakDays = 6
            };

            _mockGamificationService.Setup(s => s.HasUserLoggedInTodayAsync(1))
                .ReturnsAsync(true);
            _mockGamificationService.Setup(s => s.GetUserProgressAsync(1))
                .ReturnsAsync(progress);

            // Act
            ActionResult<DailyLoginDTO> result = await _controller.GetDailyLoginStatus();

            // Assert
            OkObjectResult okResult = Assert.IsType<OkObjectResult>(result.Result);
            DailyLoginDTO returnValue = Assert.IsType<DailyLoginDTO>(okResult.Value);
            Assert.True(returnValue.HasLoggedInToday);
            Assert.Equal(6, returnValue.ConsecutiveDays);
            Assert.Equal(1, returnValue.DaysUntilBonusReward); // 7 - (6 % 7) = 1
        }

        #endregion

        #region Challenge Tests

        [Fact]
        public async Task GetActiveChallenges_ReturnsOkResult_WithChallengesList()
        {
            // Arrange
            Challenge challenge = new Challenge
            {
                Id = 1,
                Name = "Test Challenge",
                Description = "Test Description",
                ChallengeType = "Task",
                ActivityType = "Complete",
                TargetCount = 5,
                PointReward = 100,
                StartDate = DateTime.UtcNow.AddDays(-5),
                EndDate = DateTime.UtcNow.AddDays(5),
                IsActive = true
            };

            List<Challenge> activeChallenges = new List<Challenge> { challenge };
            List<UserChallenge> userChallenges = new List<UserChallenge>();

            _mockGamificationService.Setup(s => s.GetActiveChallengesAsync())
                .ReturnsAsync(activeChallenges);
            _mockGamificationService.Setup(s => s.GetUserChallengesAsync(1))
                .ReturnsAsync(userChallenges);

            // Act
            ActionResult<List<ChallengeDTO>> result = await _controller.GetActiveChallenges();

            // Assert
            OkObjectResult okResult = Assert.IsType<OkObjectResult>(result.Result);
            List<ChallengeDTO> returnValue = Assert.IsType<List<ChallengeDTO>>(okResult.Value);
            Assert.Single(returnValue);
            Assert.Equal("Test Challenge", returnValue[0].Name);
            Assert.False(returnValue[0].IsEnrolled);
        }

        [Fact]
        public async Task EnrollInChallenge_ValidChallenge_ReturnsOkWithUserChallenge()
        {
            // Arrange
            Challenge challenge = new Challenge
            {
                Id = 1,
                Name = "Test Challenge",
                Description = "Test Description",
                TargetCount = 5,
                EndDate = DateTime.UtcNow.AddDays(5)
            };

            UserChallenge userChallenge = new UserChallenge
            {
                Id = 1,
                UserId = 1,
                ChallengeId = 1,
                Challenge = challenge,
                CurrentProgress = 0,
                IsCompleted = false,
                EnrolledAt = DateTime.UtcNow
            };

            _mockGamificationService.Setup(s => s.EnrollInChallengeAsync(1, 1))
                .ReturnsAsync(userChallenge);

            // Act
            ActionResult<UserChallengeDetailDTO> result = await _controller.EnrollInChallenge(1);

            // Assert
            OkObjectResult okResult = Assert.IsType<OkObjectResult>(result.Result);
            UserChallengeDetailDTO returnValue = Assert.IsType<UserChallengeDetailDTO>(okResult.Value);
            Assert.Equal(1, returnValue.ChallengeId);
            Assert.Equal("Test Challenge", returnValue.ChallengeName);
            Assert.Equal(0, returnValue.CurrentProgress);
        }

        #endregion

        #region Multipliers Tests

        [Fact]
        public async Task GetMultipliers_ReturnsOkResult_WithMultipliersList()
        {
            // Arrange
            List<Category> categories = new List<Category>
            {
                new Category { Id = 1, Name = "Work" },
                new Category { Id = 2, Name = "Personal" }
            };

            UserProgress progress = new UserProgress
            {
                UserId = 1,
                StreakDays = 10
            };

            _mockGamificationService.Setup(s => s.GetCategoryMultiplierAsync(1))
                .ReturnsAsync(1.2);
            _mockGamificationService.Setup(s => s.GetCategoryMultiplierAsync(2))
                .ReturnsAsync(1.0); // No multiplier
            _mockGamificationService.Setup(s => s.GetTaskPriorityMultiplierAsync(3))
                .ReturnsAsync(1.5); // High priority
            _mockGamificationService.Setup(s => s.GetUserProgressAsync(1))
                .ReturnsAsync(progress);

            // Act
            ActionResult<List<MultiplierDTO>> result = await _controller.GetMultipliers();

            // Assert
            OkObjectResult okResult = Assert.IsType<OkObjectResult>(result.Result);
            List<MultiplierDTO> returnValue = Assert.IsType<List<MultiplierDTO>>(okResult.Value);
            Assert.Equal(2, returnValue.Count); // Work category (1.2x) and High Priority (1.5x)
            
            // Check for Work category multiplier
            MultiplierDTO categoryMultiplier = returnValue.Find(m => m.Type == "Category");
            Assert.NotNull(categoryMultiplier);
            Assert.Equal("Work", categoryMultiplier.Name);
            Assert.Equal(1.2, categoryMultiplier.Value);
            
            // Check for streak multiplier
            MultiplierDTO streakMultiplier = returnValue.Find(m => m.Type == "Streak");
            Assert.NotNull(streakMultiplier);
            Assert.Equal("Streak Bonus", streakMultiplier.Name);
            // 1.0 + (10/100) = 1.1
            Assert.Equal(1.1, streakMultiplier.Value);
        }

        #endregion
    }
} 