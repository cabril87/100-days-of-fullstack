using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Services.Interfaces;
using TaskTrackerAPI.Utils;

namespace TaskTrackerAPI.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class GamificationController : ControllerBase
    {
        private readonly IGamificationService _gamificationService;
        private readonly ILogger<GamificationController> _logger;

        public GamificationController(
            IGamificationService gamificationService,
            ILogger<GamificationController> logger)
        {
            _gamificationService = gamificationService;
            _logger = logger;
        }

        #region User Progress

        [HttpGet("progress")]
        public async Task<ActionResult<UserProgressDTO>> GetUserProgress()
        {
            try
            {
                int userId = User.GetUserId();
                UserProgress progress = await _gamificationService.GetUserProgressAsync(userId);
                
                return Ok(new UserProgressDTO
                {
                    UserId = progress.UserId,
                    Level = progress.Level,
                    CurrentPoints = progress.CurrentPoints,
                    TotalPointsEarned = progress.TotalPointsEarned,
                    NextLevelThreshold = progress.NextLevelThreshold,
                    CurrentStreak = progress.CurrentStreak,
                    LongestStreak = progress.LongestStreak,
                    LastActivityDate = progress.LastActivityDate
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user progress");
                return StatusCode(500, "An error occurred while retrieving user progress.");
            }
        }

        [HttpPost("points/add")]
        public async Task<ActionResult<PointTransactionDTO>> AddPoints([FromBody] AddPointsDTO dto)
        {
            try
            {
                int userId = User.GetUserId();
                int transactionId = await _gamificationService.AddPointsAsync(
                    userId, 
                    dto.Points, 
                    dto.TransactionType, 
                    dto.Description, 
                    dto.TaskId);
                
                // Get the transaction
                PointTransaction transaction = await _gamificationService.GetTransactionAsync(transactionId);
                
                return Ok(new PointTransactionDTO
                {
                    Id = transaction.Id,
                    UserId = transaction.UserId,
                    Points = transaction.Points,
                    TransactionType = transaction.TransactionType,
                    Description = transaction.Description,
                    TaskId = transaction.TaskId,
                    CreatedAt = transaction.CreatedAt
                });
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid argument for adding points");
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding points");
                return StatusCode(500, "An error occurred while adding points.");
            }
        }

        #endregion

        #region Achievements

        [HttpGet("achievements")]
        public async Task<ActionResult<IEnumerable<UserAchievementDTO>>> GetUserAchievements()
        {
            try
            {
                int userId = User.GetUserId();
                IEnumerable<UserAchievement> achievements = await _gamificationService.GetUserAchievementsAsync(userId);
                
                List<UserAchievementDTO> result = new List<UserAchievementDTO>();
                foreach (UserAchievement ua in achievements)
                {
                    result.Add(new UserAchievementDTO
                    {
                        Id = ua.Id,
                        UserId = ua.UserId,
                        UnlockedAt = ua.UnlockedAt,
                        Achievement = new AchievementDTO
                        {
                            Id = ua.Achievement?.Id ?? 0,
                            Name = ua.Achievement?.Name ?? string.Empty,
                            Description = ua.Achievement?.Description ?? string.Empty,
                            Category = ua.Achievement?.Category ?? string.Empty,
                            PointValue = ua.Achievement?.PointValue ?? 0,
                            IconPath = ua.Achievement?.IconPath,
                            IsHidden = ua.Achievement?.IsHidden ?? false,
                            Difficulty = ua.Achievement?.Difficulty ?? 1
                        }
                    });
                }
                
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user achievements");
                return StatusCode(500, "An error occurred while retrieving user achievements.");
            }
        }

        [HttpGet("achievements/available")]
        public async Task<ActionResult<IEnumerable<AchievementDTO>>> GetAvailableAchievements()
        {
            try
            {
                int userId = User.GetUserId();
                IEnumerable<Achievement> achievements = await _gamificationService.GetAvailableAchievementsAsync(userId);
                
                List<AchievementDTO> result = new List<AchievementDTO>();
                foreach (Achievement achievement in achievements)
                {
                    // Skip hidden achievements for regular users
                    if (achievement.IsHidden && !User.IsInRole("Admin"))
                    {
                        continue;
                    }
                    
                    result.Add(new AchievementDTO
                    {
                        Id = achievement.Id,
                        Name = achievement.Name,
                        Description = achievement.Description,
                        Category = achievement.Category,
                        PointValue = achievement.PointValue,
                        IconPath = achievement.IconPath,
                        IsHidden = achievement.IsHidden,
                        Difficulty = achievement.Difficulty
                    });
                }
                
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving available achievements");
                return StatusCode(500, "An error occurred while retrieving available achievements.");
            }
        }

        #endregion

        #region Badges

        [HttpGet("badges")]
        public async Task<ActionResult<IEnumerable<UserBadgeDTO>>> GetUserBadges()
        {
            try
            {
                int userId = User.GetUserId();
                IEnumerable<UserBadge> badges = await _gamificationService.GetUserBadgesAsync(userId);
                
                List<UserBadgeDTO> result = new List<UserBadgeDTO>();
                foreach (UserBadge ub in badges)
                {
                    result.Add(new UserBadgeDTO
                    {
                        Id = ub.Id,
                        UserId = ub.UserId,
                        AwardedAt = ub.AwardedAt,
                        IsDisplayed = ub.IsDisplayed,
                        Badge = new BadgeDTO
                        {
                            Id = ub.Badge?.Id ?? 0,
                            Name = ub.Badge?.Name ?? string.Empty,
                            Description = ub.Badge?.Description ?? string.Empty,
                            Category = ub.Badge?.Category ?? string.Empty,
                            PointValue = ub.Badge?.PointValue ?? 0,
                            IconPath = ub.Badge?.IconPath ?? string.Empty,
                            IsSpecial = ub.Badge?.IsSpecial ?? false
                        }
                    });
                }
                
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user badges");
                return StatusCode(500, "An error occurred while retrieving user badges.");
            }
        }

        [HttpPost("badges/toggle")]
        public async Task<ActionResult<bool>> ToggleBadgeDisplay([FromBody] BadgeToggleDTO dto)
        {
            try
            {
                int userId = User.GetUserId();
                bool result = await _gamificationService.ToggleBadgeDisplayAsync(userId, dto.BadgeId, dto.IsDisplayed);
                
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid badge toggle request");
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error toggling badge display");
                return StatusCode(500, "An error occurred while toggling badge display.");
            }
        }

        #endregion

        #region Rewards

        [HttpGet("rewards/available")]
        public async Task<ActionResult<IEnumerable<RewardDTO>>> GetAvailableRewards()
        {
            try
            {
                int userId = User.GetUserId();
                IEnumerable<Reward> rewards = await _gamificationService.GetAvailableRewardsAsync(userId);
                
                List<RewardDTO> result = new List<RewardDTO>();
                foreach (Reward reward in rewards)
                {
                    result.Add(new RewardDTO
                    {
                        Id = reward.Id,
                        Name = reward.Name,
                        Description = reward.Description,
                        Category = reward.Category,
                        PointCost = reward.PointCost,
                        MinimumLevel = reward.MinimumLevel,
                        IconPath = reward.IconPath,
                        IsActive = reward.IsActive,
                        Quantity = reward.Quantity,
                        ExpirationDate = reward.ExpirationDate
                    });
                }
                
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving available rewards");
                return StatusCode(500, "An error occurred while retrieving available rewards.");
            }
        }

        [HttpPost("rewards/redeem")]
        public async Task<ActionResult<UserRewardDTO>> RedeemReward([FromBody] RedeemRewardDTO dto)
        {
            try
            {
                int userId = User.GetUserId();
                UserReward userReward = await _gamificationService.RedeemRewardAsync(userId, dto.RewardId);
                
                return Ok(new UserRewardDTO
                {
                    Id = userReward.Id,
                    UserId = userReward.UserId,
                    RedeemedAt = userReward.RedeemedAt,
                    IsUsed = userReward.IsUsed,
                    UsedAt = userReward.UsedAt,
                    Reward = new RewardDTO
                    {
                        Id = userReward.Reward?.Id ?? 0,
                        Name = userReward.Reward?.Name ?? string.Empty,
                        Description = userReward.Reward?.Description ?? string.Empty,
                        Category = userReward.Reward?.Category ?? string.Empty,
                        PointCost = userReward.Reward?.PointCost ?? 0,
                        MinimumLevel = userReward.Reward?.MinimumLevel ?? 1,
                        IconPath = userReward.Reward?.IconPath,
                        IsActive = userReward.Reward?.IsActive ?? false
                    }
                });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Invalid reward redemption attempt");
                return BadRequest(ex.Message);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid reward redemption argument");
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error redeeming reward");
                return StatusCode(500, "An error occurred while redeeming the reward.");
            }
        }

        [HttpPost("rewards/use")]
        public async Task<ActionResult<bool>> UseReward([FromBody] UseRewardDTO dto)
        {
            try
            {
                bool result = await _gamificationService.UseRewardAsync(dto.UserRewardId);
                
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid reward use attempt");
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error using reward");
                return StatusCode(500, "An error occurred while using the reward.");
            }
        }

        #endregion

        #region Challenges

        [HttpGet("challenges/active")]
        public async Task<IActionResult> GetActiveChallenges()
        {
            int userId = User.GetUserId();
            IEnumerable<Challenge> challenges = await _gamificationService.GetActiveChallengesAsync(userId);
            return Ok(challenges);
        }

        [HttpGet("challenges/current")]
        public async Task<IActionResult> GetCurrentChallenge()
        {
            int userId = User.GetUserId();
            Challenge? challenge = await _gamificationService.GetChallengeForUserAsync(userId);
            
            if (challenge == null)
            {
                return NotFound("No active challenge found for the user");
            }
            
            return Ok(challenge);
        }

        [HttpGet("challenges/{challengeId}/progress")]
        public async Task<IActionResult> GetChallengeProgress(int challengeId)
        {
            int userId = User.GetUserId();
            ChallengeProgress progress = await _gamificationService.GetChallengeProgressAsync(userId, challengeId);
            
            if (progress == null)
            {
                return NotFound($"No progress found for challenge {challengeId}");
            }
            
            return Ok(progress);
        }

        [HttpPost("challenges/enroll")]
        public async Task<ActionResult<UserChallengeDTO>> EnrollInChallenge([FromBody] EnrollChallengeDTO dto)
        {
            try
            {
                int userId = User.GetUserId();
                UserChallenge userChallenge = await _gamificationService.EnrollInChallengeAsync(userId, dto.ChallengeId);
                
                return Ok(new UserChallengeDTO
                {
                    Id = userChallenge.Id,
                    UserId = userChallenge.UserId,
                    EnrolledAt = userChallenge.EnrolledAt,
                    CurrentProgress = userChallenge.CurrentProgress,
                    IsComplete = userChallenge.IsCompleted,
                    CompletedAt = userChallenge.CompletedAt,
                    Challenge = new ChallengeDTO
                    {
                        Id = userChallenge.Challenge?.Id ?? 0,
                        Name = userChallenge.Challenge?.Name ?? string.Empty,
                        Description = userChallenge.Challenge?.Description ?? string.Empty,
                        StartDate = userChallenge.Challenge?.StartDate ?? DateTime.UtcNow,
                        EndDate = userChallenge.Challenge?.EndDate ?? DateTime.MaxValue,
                        PointReward = userChallenge.Challenge?.PointReward ?? 0,
                        ChallengeType = userChallenge.Challenge?.ActivityType ?? string.Empty,
                        TargetCount = userChallenge.Challenge?.TargetCount ?? 0,
                        AdditionalCriteria = userChallenge.Challenge?.AdditionalCriteria,
                        IsActive = userChallenge.Challenge?.IsActive ?? true,
                        Difficulty = userChallenge.Challenge?.Difficulty ?? 1
                    }
                });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Invalid challenge enrollment attempt");
                return BadRequest(ex.Message);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid challenge enrollment argument");
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error enrolling in challenge");
                return StatusCode(500, "An error occurred while enrolling in the challenge.");
            }
        }

        [HttpPost("challenges/progress")]
        public async Task<ActionResult> ProcessChallengeProgress([FromBody] ChallengeProgressDTO dto)
        {
            try
            {
                int userId = User.GetUserId();
                await _gamificationService.ProcessChallengeProgressAsync(userId, dto.ActivityType, dto.RelatedEntityId);
                
                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing challenge progress");
                return StatusCode(500, "An error occurred while processing challenge progress.");
            }
        }

        #endregion

        #region Daily Login

        [HttpGet("login/status")]
        public async Task<ActionResult<LoginStatusDTO>> GetDailyLoginStatus()
        {
            try
            {
                int userId = User.GetUserId();
                LoginStatus status = await _gamificationService.GetDailyLoginStatusAsync(userId);
                
                return Ok(new LoginStatusDTO
                {
                    HasClaimedToday = status.HasClaimedToday,
                    CurrentStreak = status.CurrentStreak,
                    PotentialPoints = status.PotentialPoints
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving daily login status");
                return StatusCode(500, "An error occurred while retrieving daily login status.");
            }
        }

        [HttpPost("login/daily")]
        public async Task<ActionResult<PointTransactionDTO>> ProcessDailyLogin()
        {
            try
            {
                int userId = User.GetUserId();
                PointTransaction transaction = await _gamificationService.ProcessDailyLoginAsync(userId);
                
                return Ok(new PointTransactionDTO
                {
                    Id = transaction.Id,
                    UserId = transaction.UserId,
                    Points = transaction.Points,
                    TransactionType = transaction.TransactionType,
                    Description = transaction.Description,
                    TaskId = transaction.TaskId,
                    CreatedAt = transaction.CreatedAt
                });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Invalid daily login attempt");
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing daily login");
                return StatusCode(500, "An error occurred while processing daily login.");
            }
        }

        #endregion

        #region Stats and Suggestions

        [HttpGet("stats")]
        public async Task<ActionResult<GamificationStatsDTO>> GetGamificationStats()
        {
            try
            {
                int userId = User.GetUserId();
                GamificationStats stats = await _gamificationService.GetGamificationStatsAsync(userId);
                
                GamificationStatsDTO result = new GamificationStatsDTO
                {
                    Progress = new UserProgressDTO
                    {
                        UserId = stats.Progress.UserId,
                        Level = stats.Progress.Level,
                        CurrentPoints = stats.Progress.CurrentPoints,
                        TotalPointsEarned = stats.Progress.TotalPointsEarned,
                        NextLevelThreshold = stats.Progress.NextLevelThreshold,
                        CurrentStreak = stats.Progress.CurrentStreak,
                        LongestStreak = stats.Progress.LongestStreak,
                        LastActivityDate = stats.Progress.LastActivityDate
                    },
                    CompletedTasks = stats.CompletedTasks,
                    AchievementsUnlocked = stats.AchievementsUnlocked,
                    BadgesEarned = stats.BadgesEarned,
                    RewardsRedeemed = stats.RewardsRedeemed,
                    ConsistencyScore = stats.ConsistencyScore,
                    CategoryStats = stats.CategoryStats,
                    TopUsers = stats.TopUsers.Select(u => new LeaderboardEntryDTO
                    {
                        UserId = u.UserId,
                        Username = u.Username,
                        Value = u.Value,
                        Rank = u.Rank
                    }).ToList()
                };
                
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving gamification stats");
                return StatusCode(500, "An error occurred while retrieving gamification stats.");
            }
        }

        [HttpGet("suggestions")]
        public async Task<ActionResult<IEnumerable<GamificationSuggestionDTO>>> GetGamificationSuggestions()
        {
            try
            {
                int userId = User.GetUserId();
                IEnumerable<GamificationSuggestion> suggestions = await _gamificationService.GetGamificationSuggestionsAsync(userId);
                
                List<GamificationSuggestionDTO> result = suggestions.Select(s => new GamificationSuggestionDTO
                {
                    Title = s.Title,
                    Description = s.Description,
                    Type = s.Type,
                    RelevantId = s.RelevantId,
                    PotentialPoints = s.PotentialPoints,
                    RelevanceScore = s.RelevanceScore
                }).ToList();
                
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving gamification suggestions");
                return StatusCode(500, "An error occurred while retrieving gamification suggestions.");
            }
        }

        [HttpGet("leaderboard/{category}")]
        public async Task<ActionResult<IEnumerable<LeaderboardEntryDTO>>> GetLeaderboard(string category, [FromQuery] int limit = 10)
        {
            try
            {
                string[] validCategories = new[] { "points", "streak", "tasks" };
                if (!validCategories.Contains(category.ToLower()))
                {
                    return BadRequest($"Invalid leaderboard category. Valid categories are: {string.Join(", ", validCategories)}");
                }
                
                IEnumerable<LeaderboardEntry> entries = await _gamificationService.GetLeaderboardAsync(category.ToLower(), limit);
                
                List<LeaderboardEntryDTO> result = entries.Select((e, i) => new LeaderboardEntryDTO
                {
                    UserId = e.UserId,
                    Username = e.Username,
                    Value = e.Value,
                    Rank = i + 1 // Assign ranks based on order
                }).ToList();
                
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid leaderboard request");
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving leaderboard");
                return StatusCode(500, "An error occurred while retrieving the leaderboard.");
            }
        }

        #endregion
    }
} 