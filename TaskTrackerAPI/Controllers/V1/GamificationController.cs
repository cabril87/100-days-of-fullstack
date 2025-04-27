using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.DTOs.Gamification;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Models.Gamification;
using TaskTrackerAPI.Services.Interfaces;
using TaskTrackerAPI.Extensions;
using System.Linq;
using System.Text.Json;
using System.Security.Claims;

namespace TaskTrackerAPI.Controllers.V1
{
    // Define DTOs used in the controller
    public class BadgeDisplayDTO
    {
        public int Id { get; set; }
        public int BadgeId { get; set; }
        public int UserId { get; set; }
        public DateTime AwardedAt { get; set; }
        public bool IsDisplayed { get; set; }
        public bool IsFeatured { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public string UnlockCriteria { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Rarity { get; set; } = string.Empty;
    }

    public class LoginStatusDTO
    {
        public int CurrentStreak { get; set; }
        public bool CanClaimDailyReward { get; set; }
        public int NextRewardAt { get; set; }
        public DateTime? LastLoginDate { get; set; }
    }

    public class UserStatsDTO
    {
        public int TotalTasksCompleted { get; set; }
        public int TasksCompletedThisWeek { get; set; }
        public int TotalPointsEarned { get; set; }
        public int PointsEarnedThisWeek { get; set; }
        public int ConsecutiveLoginDays { get; set; }
        public int BadgesEarned { get; set; }
        public int CurrentLevel { get; set; }
        public int ChallengesCompleted { get; set; }
    }

    public class LeaderboardDisplayDTO
    {
        public int UserId { get; set; }
        public int Rank { get; set; }
        public string Username { get; set; } = string.Empty;
        public int Points { get; set; }
        public int Level { get; set; }
        public string AvatarUrl { get; set; } = string.Empty;
    }

    [ApiVersion("1.0")]
    [Authorize]
    [ApiController]
    [Route("api/v{version:apiVersion}/[controller]")]
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
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<UserProgressDTO>> GetUserProgress()
        {
            try
            {
                int userId = User.GetUserIdAsInt();

                TaskTrackerAPI.Models.UserProgress userProgress = await _gamificationService.GetUserProgressAsync(userId);
                UserProgressDTO userProgressDto = new UserProgressDTO
                {
                    Id = userProgress.Id,
                    UserId = userProgress.UserId,
                    TotalPoints = userProgress.CurrentPoints,
                    CurrentLevel = userProgress.Level,
                    PointsToNextLevel = userProgress.NextLevelThreshold,
                    CurrentStreak = userProgress.CurrentStreak,
                    HighestStreak = userProgress.LongestStreak,
                    LastActivityDate = userProgress.LastActivityDate ?? DateTime.UtcNow,
                    LastUpdated = userProgress.UpdatedAt
                };
                
                return Ok(ApiResponse<UserProgressDTO>.SuccessResponse(userProgressDto));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user progress");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<UserProgressDTO>.FailureResponse("Error retrieving user progress", StatusCodes.Status500InternalServerError));
            }
        }

        [HttpPost("points")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<PointTransactionDTO>> AddPoints([FromBody] AddPointsDTO dto)
        {
            try
            {
                if (dto.Points <= 0)
                {
                    return BadRequest(ApiResponse<PointTransactionDTO>.BadRequestResponse("Points must be greater than zero"));
                }

                int userId = User.GetUserIdAsInt();
                int transactionId = await _gamificationService.AddPointsAsync(userId, dto.Points, dto.TransactionType, dto.Description, dto.RelatedEntityId);
                
                // Get the transaction through the service
                TaskTrackerAPI.Models.PointTransaction transaction = await _gamificationService.GetTransactionAsync(transactionId);
                
                PointTransactionDTO pointTransactionDto = new PointTransactionDTO
                {
                    Id = transaction.Id,
                    UserId = transaction.UserId,
                    Points = transaction.Points,
                    TransactionType = transaction.TransactionType,
                    Description = transaction.Description,
                    RelatedEntityId = transaction.TaskId,
                    CreatedAt = transaction.CreatedAt
                };
                
                return Ok(ApiResponse<PointTransactionDTO>.SuccessResponse(pointTransactionDto));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding points to user");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<PointTransactionDTO>.FailureResponse("Error adding points", StatusCodes.Status500InternalServerError));
            }
        }

        #endregion

        #region Achievements

        [HttpGet("achievements")]
        public async Task<ActionResult<IEnumerable<UserAchievementDTO>>> GetUserAchievements()
        {
            try
            {
                int userId = User.GetUserIdAsInt();
                IEnumerable<TaskTrackerAPI.Models.UserAchievement> achievements = await _gamificationService.GetUserAchievementsAsync(userId);
                
                List<UserAchievementDTO> result = new List<UserAchievementDTO>();
                foreach (TaskTrackerAPI.Models.UserAchievement ua in achievements)
                {
                    result.Add(new UserAchievementDTO
                    {
                        Id = ua.Id,
                        UserId = ua.UserId,
                        AchievementId = ua.AchievementId,
                        IsCompleted = true,
                        CompletedAt = ua.UnlockedAt,
                        Achievement = new AchievementDTO
                        {
                            Id = ua.Achievement?.Id ?? 0,
                            Name = ua.Achievement?.Name ?? string.Empty,
                            Description = ua.Achievement?.Description ?? string.Empty,
                            Category = ua.Achievement?.Category ?? string.Empty,
                            PointValue = ua.Achievement?.PointValue ?? 0,
                            IconUrl = ua.Achievement?.IconUrl ?? string.Empty,
                            Difficulty = ua.Achievement?.Difficulty.ToString() ?? "Easy"
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
                int userId = User.GetUserIdAsInt();
                IEnumerable<TaskTrackerAPI.Models.Achievement> achievements = await _gamificationService.GetAvailableAchievementsAsync(userId);
                
                List<AchievementDTO> result = new List<AchievementDTO>();
                foreach (TaskTrackerAPI.Models.Achievement achievement in achievements)
                {
                    // Skip admin-only achievements for regular users
                    // Use appropriate property - IsHidden, IsSecret, or check visibility another way
                    bool isAdminOnly = false; // Determine based on available properties
                    if (isAdminOnly && !User.IsInRole("Admin"))
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
                        IconUrl = achievement.IconUrl,
                        IsHidden = false, // Default value
                        Difficulty = achievement.Difficulty.ToString()
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
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<IEnumerable<BadgeDisplayDTO>>> GetUserBadges()
        {
            try
            {
                int userId = User.GetUserIdAsInt();

                IEnumerable<TaskTrackerAPI.Models.UserBadge> badges = await _gamificationService.GetUserBadgesAsync(userId);
                List<BadgeDisplayDTO> badgeResults = new List<BadgeDisplayDTO>();

                foreach (TaskTrackerAPI.Models.UserBadge badge in badges)
                {
                    BadgeDisplayDTO badgeDisplay = new BadgeDisplayDTO
                    {
                        Id = badge.Id,
                        BadgeId = badge.BadgeId,
                        UserId = badge.UserId,
                        AwardedAt = badge.AwardedAt,
                        IsDisplayed = badge.IsDisplayed,
                        IsFeatured = false,
                        Name = badge.Badge.Name,
                        Description = badge.Badge.Description,
                        ImageUrl = badge.Badge.IconPath ?? string.Empty,
                        UnlockCriteria = badge.Badge.Description ?? string.Empty,
                        Category = badge.Badge.Category,
                        Rarity = "Common"
                    };
                    badgeResults.Add(badgeDisplay);
                }
                
                return Ok(ApiResponse<IEnumerable<BadgeDisplayDTO>>.SuccessResponse(badgeResults));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user badges");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<IEnumerable<BadgeDisplayDTO>>.FailureResponse("Error retrieving user badges", StatusCodes.Status500InternalServerError));
            }
        }

        [HttpPost("badges/toggle")]
        public async Task<ActionResult<bool>> ToggleBadgeDisplay([FromBody] BadgeToggleDTO dto)
        {
            try
            {
                int userId = User.GetUserIdAsInt();
                bool result = await _gamificationService.ToggleBadgeDisplayAsync(userId, dto.BadgeId, dto.IsDisplayed);
                
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid argument for toggling badge display");
                return BadRequest(ex.Message);
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Unauthorized access attempt for toggling badge");
                return Unauthorized(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error toggling badge display");
                return StatusCode(500, "An error occurred while toggling badge display.");
            }
        }

        #endregion

        #region Rewards

        [HttpGet("rewards")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<IEnumerable<RewardDTO>>> GetAvailableRewards()
        {
            try
            {
                int userId = User.GetUserIdAsInt();

                IEnumerable<TaskTrackerAPI.Models.Reward> rewards = await _gamificationService.GetAvailableRewardsAsync(userId);
                IEnumerable<TaskTrackerAPI.Models.UserReward> userRewards = await _gamificationService.RedeemRewardAsync(userId, 0).ContinueWith(t => new List<TaskTrackerAPI.Models.UserReward>()); // Temporary fix for missing GetUserRewardsAsync
                List<RewardDTO> result = rewards.Select(r => new RewardDTO
                    {
                    Id = r.Id,
                    Name = r.Name,
                    Description = r.Description,
                    PointCost = r.PointCost,
                    Category = r.Category ?? string.Empty,
                    MinimumLevel = r.MinimumLevel,
                    IconUrl = r.IconPath ?? string.Empty,
                    IsActive = r.IsActive
                }).ToList();

                return Ok(ApiResponse<IEnumerable<RewardDTO>>.SuccessResponse(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving available rewards");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<IEnumerable<RewardDTO>>.FailureResponse("Error retrieving rewards", StatusCodes.Status500InternalServerError));
            }
        }

        [HttpPost("rewards/claim/{rewardId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<RewardDTO>> ClaimReward(int rewardId)
        {
            try
            {
                int userId = User.GetUserIdAsInt();

                // Get reward by ID - using temporary implementation since GetRewardByIdAsync doesn't exist
                TaskTrackerAPI.Models.Reward reward = await _gamificationService.GetAvailableRewardsAsync(userId)
                    .ContinueWith(t => t.Result.FirstOrDefault(r => r.Id == rewardId));
                
                if (reward == null)
                {
                    return NotFound(ApiResponse<RewardDTO>.NotFoundResponse($"Reward with ID {rewardId} not found"));
                }

                RewardDTO rewardDto = new RewardDTO
                    {
                    Id = reward.Id,
                    Name = reward.Name,
                    Description = reward.Description,
                    PointCost = reward.PointCost,
                    Category = reward.Category ?? string.Empty,
                    MinimumLevel = reward.MinimumLevel,
                    IconUrl = reward.IconPath ?? string.Empty,
                    IsActive = reward.IsActive
                };

                if (!reward.IsActive)
                {
                    return BadRequest(ApiResponse<RewardDTO>.BadRequestResponse("This reward is not available for claiming"));
                }

                TaskTrackerAPI.Models.UserReward claimedReward = await _gamificationService.RedeemRewardAsync(userId, rewardId);
                if (claimedReward == null)
                {
                    return BadRequest(ApiResponse<RewardDTO>.BadRequestResponse("You don't have enough points to claim this reward"));
            }

                UserRewardDTO userRewardDto = new UserRewardDTO
                {
                    Id = claimedReward.Id,
                    UserId = claimedReward.UserId,
                    RewardId = claimedReward.RewardId,
                    RedeemedAt = claimedReward.RedeemedAt,
                    IsUsed = claimedReward.IsUsed,
                    UsedAt = claimedReward.UsedAt,
                    Reward = rewardDto
                };

                return Ok(ApiResponse<UserRewardDTO>.SuccessResponse(userRewardDto, "Reward claimed successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error claiming reward {RewardId}", rewardId);
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<RewardDTO>.FailureResponse("Error claiming reward", StatusCodes.Status500InternalServerError));
            }
        }

        [HttpPost("rewards/use")]
        public async Task<ActionResult<bool>> UseReward([FromBody] UseRewardDTO dto)
        {
            try
            {
                int userId = User.GetUserIdAsInt();
                bool result = await _gamificationService.UseRewardAsync(dto.UserRewardId);
                
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid argument for using reward");
                return BadRequest(ex.Message);
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Unauthorized access attempt for using reward");
                return Unauthorized(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error using reward");
                return StatusCode(500, "An error occurred while using reward.");
            }
        }

        #endregion

        #region Challenges

        [HttpGet("challenges")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<IEnumerable<ChallengeDTO>>> GetActiveChallenges()
        {
            try
            {
                int userId = User.GetUserIdAsInt();

                IEnumerable<TaskTrackerAPI.Models.Challenge> challenges = await _gamificationService.GetActiveChallengesAsync(userId);
                List<ChallengeDTO> result = challenges.Select(c => new ChallengeDTO
                {
                    Id = c.Id,
                    Name = c.Name,
                    Description = c.Description,
                    StartDate = c.StartDate,
                    EndDate = c.EndDate ?? DateTime.MaxValue, // Use null coalescing for nullable DateTime
                    PointReward = c.PointReward,
                    ChallengeType = string.Empty // Use empty string as placeholder
                }).ToList();

                return Ok(ApiResponse<IEnumerable<ChallengeDTO>>.SuccessResponse(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving active challenges");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<IEnumerable<ChallengeDTO>>.FailureResponse("Error retrieving challenges", StatusCodes.Status500InternalServerError));
            }
        }

        [HttpGet("challenges/current")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ChallengeDTO>> GetCurrentChallenge()
        {
            try
            {
                int userId = User.GetUserIdAsInt();

                IEnumerable<TaskTrackerAPI.Models.Challenge> challenge = await _gamificationService.GetActiveChallengesAsync(userId);
                if (challenge == null || !challenge.Any())
                {
                    return NotFound(ApiResponse<ChallengeDTO>.NotFoundResponse("No active challenge found"));
                }

                TaskTrackerAPI.Models.Challenge currentChallenge = challenge.First();

                ChallengeDTO challengeDto = new ChallengeDTO
                {
                    Id = currentChallenge.Id,
                    Name = currentChallenge.Name,
                    Description = currentChallenge.Description,
                    StartDate = currentChallenge.StartDate,
                    EndDate = currentChallenge.EndDate ?? DateTime.MaxValue, // Use null coalescing for nullable DateTime
                    PointReward = currentChallenge.PointReward,
                    ChallengeType = string.Empty // Use empty string as placeholder
                };

                return Ok(ApiResponse<ChallengeDTO>.SuccessResponse(challengeDto));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving current challenge");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<ChallengeDTO>.FailureResponse("Error retrieving current challenge", StatusCodes.Status500InternalServerError));
            }
        }

        #endregion

        #region Daily Login

        [HttpGet("login/status")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<DailyLoginStatusDetailDTO>> GetDailyLoginStatus()
        {
            try
            {
                int userId = User.GetUserIdAsInt();

                // Get user progress for streak information
                TaskTrackerAPI.Models.UserProgress userProgress = await _gamificationService.GetUserProgressAsync(userId);
                
                DailyLoginStatusDetailDTO loginStatusResponse = new DailyLoginStatusDetailDTO
                {
                    UserId = userId,
                    HasLoggedInToday = true, // Default value
                    ConsecutiveDays = userProgress.CurrentStreak,
                    LastLoginDate = userProgress.LastActivityDate,
                    CurrentStreakPoints = 0, // Default value 
                    RewardClaimed = false // Default value
                };

                return Ok(ApiResponse<DailyLoginStatusDetailDTO>.SuccessResponse(loginStatusResponse));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving daily login status");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<DailyLoginStatusDetailDTO>.FailureResponse("Error retrieving daily login status", StatusCodes.Status500InternalServerError));
            }
        }

        [HttpPost("login/claim")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<PointTransactionDTO>> ClaimDailyLoginReward()
        {
            try
            {
                int userId = User.GetUserIdAsInt();

                TaskTrackerAPI.Models.PointTransaction transactionResult = await _gamificationService.ProcessDailyLoginAsync(userId);
                if (transactionResult == null)
                {
                    return BadRequest(ApiResponse<PointTransactionDTO>.BadRequestResponse("Daily login reward already claimed today"));
                }

                PointTransactionDTO transactionDto = new PointTransactionDTO
                {
                    Id = transactionResult.Id,
                    UserId = transactionResult.UserId,
                    Points = transactionResult.Points,
                    TransactionType = transactionResult.TransactionType,
                    Description = transactionResult.Description,
                    RelatedEntityId = null, // Daily login doesn't have a related entity
                    CreatedAt = transactionResult.CreatedAt
                };

                return Ok(ApiResponse<PointTransactionDTO>.SuccessResponse(transactionDto, "Daily login reward claimed successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error claiming daily login reward");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<PointTransactionDTO>.FailureResponse("Error claiming daily login reward", StatusCodes.Status500InternalServerError));
            }
        }

        #endregion

        #region Statistics and Suggestions

        [HttpGet("stats")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<UserStatsDTO>> GetUserStats()
        {
            try
            {
                int userId = User.GetUserIdAsInt();
                TaskTrackerAPI.Models.UserProgress userProgress = await _gamificationService.GetUserProgressAsync(userId);

                UserStatsDTO stats = new UserStatsDTO
                {
                    TotalTasksCompleted = 0, // Use default value
                    TasksCompletedThisWeek = 0, // Default value
                    TotalPointsEarned = userProgress.TotalPointsEarned,
                    PointsEarnedThisWeek = 0, // Default value
                    ConsecutiveLoginDays = userProgress.CurrentStreak,
                    BadgesEarned = 0, // Use default value
                    CurrentLevel = userProgress.Level,
                    ChallengesCompleted = 0 // Default value
                };

                return Ok(ApiResponse<UserStatsDTO>.SuccessResponse(stats));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user gamification stats");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<UserStatsDTO>.FailureResponse("Error retrieving user stats", StatusCodes.Status500InternalServerError));
            }
        }

        [HttpGet("suggestions")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<List<GamificationSuggestion>>> GetSuggestions()
        {
            try
            {
                int userId = User.GetUserIdAsInt();
                List<GamificationSuggestion> suggestions = await _gamificationService.GetGamificationSuggestionsAsync(userId);
                return Ok(ApiResponse<List<GamificationSuggestion>>.SuccessResponse(suggestions));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving gamification suggestions");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<List<GamificationSuggestion>>.FailureResponse("Error retrieving suggestions", StatusCodes.Status500InternalServerError));
            }
        }

        #endregion

        #region Leaderboard

        [HttpGet("leaderboard")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<IEnumerable<LeaderboardDisplayDTO>>> GetLeaderboard([FromQuery] string timeFrame = "all")
        {
            try
            {
                int userId = User.GetUserIdAsInt();

                // Instead of using enum, use string directly
                List<TaskTrackerAPI.Models.LeaderboardEntry> leaderboardEntries = await _gamificationService.GetLeaderboardAsync(timeFrame, 10);
                
                // Create simple anonymous objects for leaderboard to avoid property mapping issues
                List<LeaderboardDisplayDTO> leaderboardData = leaderboardEntries.Select(e => new LeaderboardDisplayDTO
                    {
                    UserId = e.UserId,
                    Rank = e.Rank,
                    Username = e.Username ?? "User",
                    Points = 0, // Default value
                    Level = 0, // Default value 
                    AvatarUrl = string.Empty // Default value
                }).ToList();
                
                return Ok(ApiResponse<IEnumerable<LeaderboardDisplayDTO>>.SuccessResponse(leaderboardData));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving leaderboard");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<IEnumerable<LeaderboardDisplayDTO>>.FailureResponse("Error retrieving leaderboard", StatusCodes.Status500InternalServerError));
            }
        }

        #endregion
    }
} 