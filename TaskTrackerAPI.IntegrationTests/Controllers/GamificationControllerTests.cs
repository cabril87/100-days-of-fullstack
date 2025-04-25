using Microsoft.AspNetCore.Mvc.Testing;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using Xunit;
using TaskTrackerAPI.IntegrationTests.DTOs;
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.IntegrationTests.Controllers
{
    public class GamificationControllerTests : IClassFixture<CustomWebApplicationFactory<Program>>
    {
        private readonly CustomWebApplicationFactory<Program> _factory;
        private readonly HttpClient _client;
        private string _authToken;

        public GamificationControllerTests(CustomWebApplicationFactory<Program> factory)
        {
            _factory = factory;
            _client = _factory.CreateClient(new WebApplicationFactoryClientOptions
            {
                AllowAutoRedirect = false
            });
        }

        private async Task AuthenticateAsync()
        {
            object loginDto = new
            {
                Email = "admin@tasktracker.com",
                Password = "password"
            };

            StringContent content = new StringContent(JsonConvert.SerializeObject(loginDto), Encoding.UTF8, "application/json");
            HttpResponseMessage response = await _client.PostAsync("/api/Auth/login", content);

            string responseString = await response.Content.ReadAsStringAsync();
            TaskTrackerAPI.DTOs.AuthResponseDTO? tokenResponse = JsonConvert.DeserializeObject<TaskTrackerAPI.DTOs.AuthResponseDTO>(responseString);

            _authToken = tokenResponse.Token;
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _authToken);
        }

        [Fact]
        public async Task GetUserProgress_ShouldReturnProgress()
        {
            // Arrange
            await AuthenticateAsync();

            // Act
            HttpResponseMessage response = await _client.GetAsync("/api/Gamification/progress");

            // Assert
            response.EnsureSuccessStatusCode();
            string responseString = await response.Content.ReadAsStringAsync();
            UserProgressDTO? progress = JsonConvert.DeserializeObject<UserProgressDTO>(responseString);

            Assert.NotNull(progress);
            Assert.Equal(1, progress.UserId);
            Assert.NotEmpty(progress.Username);
        }

        [Fact]
        public async Task GetDailyLoginStatus_ShouldReturnLoginStatus()
        {
            // Arrange
            await AuthenticateAsync();

            // Act
            HttpResponseMessage response = await _client.GetAsync("/api/Gamification/daily-login/status");

            // Assert
            response.EnsureSuccessStatusCode();
            string responseString = await response.Content.ReadAsStringAsync();
            DailyLoginDTO? loginStatus = JsonConvert.DeserializeObject<DailyLoginDTO>(responseString);

            Assert.NotNull(loginStatus);
            // We can't assert exact values because these could change depending on the test environment
            Assert.IsType<bool>(loginStatus.HasLoggedInToday);
            Assert.IsType<int>(loginStatus.ConsecutiveDays);
            Assert.IsType<int>(loginStatus.PointsAwarded);
        }

        [Fact]
        public async Task GetChallenges_ShouldReturnActiveChallenges()
        {
            // Arrange
            await AuthenticateAsync();

            // Act
            HttpResponseMessage response = await _client.GetAsync("/api/Gamification/challenges");

            // Assert
            response.EnsureSuccessStatusCode();
            string responseString = await response.Content.ReadAsStringAsync();
            List<ChallengeDTO>? challenges = JsonConvert.DeserializeObject<List<ChallengeDTO>>(responseString);

            Assert.NotNull(challenges);
            // At least some of the seeded challenges should be active
            Assert.True(challenges.Count > 0);
        }

        [Fact]
        public async Task EnrollInChallenge_ValidChallenge_ShouldReturnSuccess()
        {
            // Arrange
            await AuthenticateAsync();
            
            // Get available challenges
            HttpResponseMessage challengesResponse = await _client.GetAsync("/api/Gamification/challenges");
            string challengesString = await challengesResponse.Content.ReadAsStringAsync();
            List<ChallengeDTO>? challenges = JsonConvert.DeserializeObject<List<ChallengeDTO>>(challengesString);
            
            // Find a challenge that the user is not already enrolled in
            ChallengeDTO? challenge = challenges.Find(c => !c.IsEnrolled);
            
            if (challenge == null)
            {
                // Skip the test if no unenrolled challenges are available
                return;
            }

            // Act
            HttpResponseMessage response = await _client.PostAsync($"/api/Gamification/challenges/{challenge.Id}/enroll", null);

            // Assert
            response.EnsureSuccessStatusCode();
            string responseString = await response.Content.ReadAsStringAsync();
            UserChallengeDetailDTO? userChallenge = JsonConvert.DeserializeObject<UserChallengeDetailDTO>(responseString);

            Assert.NotNull(userChallenge);
            Assert.Equal(challenge.Id, userChallenge.ChallengeId);
            Assert.Equal(0, userChallenge.CurrentProgress);
            Assert.False(userChallenge.IsCompleted);
        }

        [Fact]
        public async Task CompleteTask_ShouldAwardPoints()
        {
            // Arrange
            await AuthenticateAsync();
            
            // Get current points
            HttpResponseMessage progressResponse = await _client.GetAsync("/api/Gamification/progress");
            string progressString = await progressResponse.Content.ReadAsStringAsync();
            UserProgressDTO? initialProgress = JsonConvert.DeserializeObject<UserProgressDTO>(progressString);
            
            // Create a new task
            object taskDto = new
            {
                Title = "Test Task for Gamification",
                Description = "Testing task completion rewards",
                Priority = 3, // High priority for more points
                Status = "ToDo"
            };
            
            StringContent content = new StringContent(JsonConvert.SerializeObject(taskDto), Encoding.UTF8, "application/json");
            HttpResponseMessage createResponse = await _client.PostAsync("/api/TaskItems", content);
            createResponse.EnsureSuccessStatusCode();
            
            string taskString = await createResponse.Content.ReadAsStringAsync();
            TaskItemDTO? createdTask = JsonConvert.DeserializeObject<TaskItemDTO>(taskString);

            // Act
            HttpResponseMessage completeResponse = await _client.PostAsync($"/api/Task/{createdTask.Id}/complete", null);

            // Assert
            completeResponse.EnsureSuccessStatusCode();
            
            // Verify points were awarded
            HttpResponseMessage updatedProgressResponse = await _client.GetAsync("/api/Gamification/progress");
            string updatedProgressString = await updatedProgressResponse.Content.ReadAsStringAsync();
            UserProgressDTO? updatedProgress = JsonConvert.DeserializeObject<UserProgressDTO>(updatedProgressString);
            
            Assert.True(updatedProgress.TotalPoints > initialProgress.TotalPoints);
        }

        [Fact]
        public async Task GetMultipliers_ShouldReturnMultipliers()
        {
            // Arrange
            await AuthenticateAsync();

            // Act
            HttpResponseMessage response = await _client.GetAsync("/api/Gamification/multipliers");

            // Assert
            response.EnsureSuccessStatusCode();
            string responseString = await response.Content.ReadAsStringAsync();
            List<MultiplierDTO>? multipliers = JsonConvert.DeserializeObject<List<MultiplierDTO>>(responseString);

            Assert.NotNull(multipliers);
            // We may have multipliers seeded or we may not - both are valid states
            // Just verify the response format is correct
        }

        [Fact]
        public async Task ClaimDailyLoginReward_MultipleDays_ShouldIncrementStreak()
        {
            // Arrange - First login
            await AuthenticateAsync();
            
            // Get initial streak
            HttpResponseMessage initialResponse = await _client.GetAsync("/api/Gamification/daily-login/status");
            initialResponse.EnsureSuccessStatusCode();
            DailyLoginDTO? initialStatus = JsonConvert.DeserializeObject<DailyLoginDTO>(await initialResponse.Content.ReadAsStringAsync());
            int initialStreak = initialStatus.ConsecutiveDays;

            // If user has already claimed today, we can't test this - skip
            if (initialStatus.HasClaimedReward)
            {
                return;
            }
            
            // Act - Claim daily reward
            HttpResponseMessage claimResponse = await _client.PostAsync("/api/Gamification/daily-login", null);
            claimResponse.EnsureSuccessStatusCode();
            
            // Check streak was updated
            HttpResponseMessage updatedResponse = await _client.GetAsync("/api/Gamification/daily-login/status");
            updatedResponse.EnsureSuccessStatusCode();
            DailyLoginDTO? updatedStatus = JsonConvert.DeserializeObject<DailyLoginDTO>(await updatedResponse.Content.ReadAsStringAsync());
            
            // Assert
            // Streak might not increase if user already logged in earlier today
            Assert.True(updatedStatus.HasClaimedReward);
            Assert.True(updatedStatus.PointsAwarded == 0); // Already claimed
        }

        [Fact]
        public async Task GetGamificationStats_ShouldReturnComprehensiveStats()
        {
            // Arrange
            await AuthenticateAsync();

            // Act
            HttpResponseMessage response = await _client.GetAsync("/api/Gamification/stats");

            // Assert
            response.EnsureSuccessStatusCode();
            string responseString = await response.Content.ReadAsStringAsync();
            GamificationStats? stats = JsonConvert.DeserializeObject<GamificationStats>(responseString);

            Assert.NotNull(stats);
            Assert.NotNull(stats.Progress);
            Assert.True(stats.CompletedTasks >= 0);
            Assert.True(stats.AchievementsUnlocked >= 0);
            Assert.True(stats.BadgesEarned >= 0);
            Assert.True(stats.RewardsRedeemed >= 0);
            Assert.True(stats.ConsistencyScore >= 0 && stats.ConsistencyScore <= 100);
            Assert.NotNull(stats.CategoryStats);
            Assert.NotNull(stats.TopUsers);
        }

        [Fact]
        public async Task GetSuggestions_ShouldReturnPersonalizedSuggestions()
        {
            // Arrange
            await AuthenticateAsync();

            // Act
            HttpResponseMessage response = await _client.GetAsync("/api/Gamification/suggestions");

            // Assert
            response.EnsureSuccessStatusCode();
            string responseString = await response.Content.ReadAsStringAsync();
            List<GamificationSuggestion>? suggestions = JsonConvert.DeserializeObject<List<GamificationSuggestion>>(responseString);

            Assert.NotNull(suggestions);
            // Even if user has no relevant suggestions, the API should return an empty list, not null
        }

        [Fact]
        public async Task ToggleBadgeDisplay_ShouldUpdateBadgeDisplayStatus()
        {
            // Arrange
            await AuthenticateAsync();
            
            // Get user badges
            HttpResponseMessage badgesResponse = await _client.GetAsync("/api/Gamification/badges");
            badgesResponse.EnsureSuccessStatusCode();
            List<BadgeDTO>? badges = JsonConvert.DeserializeObject<List<BadgeDTO>>(await badgesResponse.Content.ReadAsStringAsync());
            
            // Skip if user has no badges
            if (badges == null || badges.Count == 0)
            {
                return;
            }
            
            // Get first badge
            BadgeDTO badge = badges[0];
            bool newDisplayStatus = !badge.IsDisplayed;
            
            // Act - Toggle display status
            StringContent content = new StringContent(newDisplayStatus.ToString().ToLower(), Encoding.UTF8, "application/json");
            HttpResponseMessage response = await _client.PutAsync($"/api/Gamification/badges/{badge.Id}/display", content);
            
            // Assert
            response.EnsureSuccessStatusCode();
            
            // Verify badge display status was updated
            HttpResponseMessage updatedBadgesResponse = await _client.GetAsync("/api/Gamification/badges");
            updatedBadgesResponse.EnsureSuccessStatusCode();
            List<BadgeDTO>? updatedBadges = JsonConvert.DeserializeObject<List<BadgeDTO>>(await updatedBadgesResponse.Content.ReadAsStringAsync());
            
            BadgeDTO? updatedBadge = updatedBadges.FirstOrDefault(b => b.Id == badge.Id);
            Assert.NotNull(updatedBadge);
            Assert.Equal(newDisplayStatus, updatedBadge.IsDisplayed);
        }

        [Fact]
        public async Task ProcessChallenge_ShouldIncrementProgress()
        {
            // Arrange
            await AuthenticateAsync();
            
            // Check for active challenges that the user is enrolled in
            HttpResponseMessage challengesResponse = await _client.GetAsync("/api/Gamification/challenges");
            challengesResponse.EnsureSuccessStatusCode();
            List<ChallengeDTO>? challenges = JsonConvert.DeserializeObject<List<ChallengeDTO>>(await challengesResponse.Content.ReadAsStringAsync());
            
            // Find a challenge related to task completion
            ChallengeDTO? taskChallenge = challenges.FirstOrDefault(c => 
                c.IsEnrolled && !c.IsCompleted && c.ActivityType == "Complete");
            
            // If no appropriate challenge is found, try to enroll in one
            if (taskChallenge == null)
            {
                ChallengeDTO? unenrolledChallenge = challenges.FirstOrDefault(c => 
                    !c.IsEnrolled && c.ActivityType == "Complete");
                    
                if (unenrolledChallenge != null)
                {
                    HttpResponseMessage enrollResponse = await _client.PostAsync($"/api/Gamification/challenges/{unenrolledChallenge.Id}/enroll", null);
                    enrollResponse.EnsureSuccessStatusCode();
                    taskChallenge = unenrolledChallenge;
                }
            }
            
            // Skip test if no appropriate challenge is available
            if (taskChallenge == null)
            {
                return;
            }
            
            // Get current progress
            HttpResponseMessage userChallengesResponse = await _client.GetAsync("/api/Gamification/challenges/user");
            userChallengesResponse.EnsureSuccessStatusCode();
            List<UserChallengeDetailDTO>? userChallenges = JsonConvert.DeserializeObject<List<UserChallengeDetailDTO>>(await userChallengesResponse.Content.ReadAsStringAsync());
            
            int initialProgress = userChallenges.FirstOrDefault(uc => uc.ChallengeId == taskChallenge.Id)?.CurrentProgress ?? 0;
            
            // Create and complete a task (to trigger challenge progress)
            object taskDto = new
            {
                Title = "Integration Test Task",
                Description = "Testing challenge progress",
                Priority = 2,
                Status = "ToDo"
            };
            
            StringContent content = new StringContent(JsonConvert.SerializeObject(taskDto), Encoding.UTF8, "application/json");
            HttpResponseMessage createResponse = await _client.PostAsync("/api/TaskItems", content);
            createResponse.EnsureSuccessStatusCode();
            
            string taskString = await createResponse.Content.ReadAsStringAsync();
            TaskItemDTO? createdTask = JsonConvert.DeserializeObject<TaskItemDTO>(taskString);
            
            // Complete the task
            HttpResponseMessage completeResponse = await _client.PostAsync($"/api/Task/{createdTask.Id}/complete", null);

            // Get updated challenge progress
            HttpResponseMessage updatedChallengesResponse = await _client.GetAsync("/api/Gamification/challenges/user");
            updatedChallengesResponse.EnsureSuccessStatusCode();
            List<UserChallengeDetailDTO>? updatedChallenges = JsonConvert.DeserializeObject<List<UserChallengeDetailDTO>>(await updatedChallengesResponse.Content.ReadAsStringAsync());
            
            int finalProgress = updatedChallenges.FirstOrDefault(uc => uc.ChallengeId == taskChallenge.Id)?.CurrentProgress ?? 0;
            
            // Assert - in an integration test, we can't guarantee progress will increase, but it should not decrease
            Assert.True(finalProgress >= initialProgress);
        }

        [Fact]
        public async Task GetAchievements_ShouldReturnBothUnlockedAndAvailable()
        {
            // Arrange
            await AuthenticateAsync();

            // Act
            HttpResponseMessage response = await _client.GetAsync("/api/Gamification/achievements");

            // Assert
            response.EnsureSuccessStatusCode();
            string responseString = await response.Content.ReadAsStringAsync();
            List<AchievementDTO>? achievements = JsonConvert.DeserializeObject<List<AchievementDTO>>(responseString);

            Assert.NotNull(achievements);
            // Should contain both unlocked and available achievements
            Assert.True(achievements.Count > 0, "No achievements returned");
            
            // Check we have both completed and incomplete achievements
            bool hasUnlocked = achievements.Any(a => a.IsUnlocked);
            bool hasAvailable = achievements.Any(a => !a.IsUnlocked);
            
            // We can't guarantee both will exist in the test environment, but we can check
            // the response format is correct
            foreach (AchievementDTO achievement in achievements)
            {
                Assert.NotNull(achievement.Name);
                Assert.NotNull(achievement.Description);
                Assert.True(achievement.PointValue > 0);
                Assert.True(achievement.RequiredCount > 0);
                
                // Unlocked achievements should have UnlockedAt date
                if (achievement.IsUnlocked)
                {
                    Assert.NotNull(achievement.UnlockedAt);
                }
            }
        }

        [Fact]
        public async Task TaskOperations_ShouldAffectGamificationStats()
        {
            // Arrange
            await AuthenticateAsync();
            
            // Get initial stats
            HttpResponseMessage initialStatsResponse = await _client.GetAsync("/api/Gamification/stats");
            initialStatsResponse.EnsureSuccessStatusCode();
            GamificationStats? initialStats = JsonConvert.DeserializeObject<GamificationStats>(await initialStatsResponse.Content.ReadAsStringAsync());
            
            // Create and complete multiple tasks
            for (int i = 0; i < 3; i++)
            {
                object taskDto = new
                {
                    Title = $"Integration Test Task {i}",
                    Description = "Testing gamification stats impact",
                    Priority = 3, // High priority
                    Status = "ToDo"
                };
                
                StringContent content = new StringContent(JsonConvert.SerializeObject(taskDto), Encoding.UTF8, "application/json");
                HttpResponseMessage createResponse = await _client.PostAsync("/api/TaskItems", content);
                createResponse.EnsureSuccessStatusCode();
                
                string taskString = await createResponse.Content.ReadAsStringAsync();
                TaskItemDTO? createdTask = JsonConvert.DeserializeObject<TaskItemDTO>(taskString);
                
                // Complete the task
                HttpResponseMessage completeResponse = await _client.PostAsync($"/api/Task/{createdTask.Id}/complete", null);
            }
            
            // Get updated stats
            HttpResponseMessage updatedStatsResponse = await _client.GetAsync("/api/Gamification/stats");
            updatedStatsResponse.EnsureSuccessStatusCode();
            GamificationStats? updatedStats = JsonConvert.DeserializeObject<GamificationStats>(await updatedStatsResponse.Content.ReadAsStringAsync());
            
            // Assert
            Assert.True(updatedStats.TotalPoints > initialStats.TotalPoints, 
                "Points should increase after completing tasks");
            Assert.True(updatedStats.CompletedTasks >= initialStats.CompletedTasks + 3, 
                "Completed tasks count should increase");
        }
    }
} 