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
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.DTOs.Gamification;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Services.Interfaces;
using TaskTrackerAPI.Extensions;
using System.Linq;
using System.Text.Json;
using System.Security.Claims;
using AutoMapper;

namespace TaskTrackerAPI.Controllers.V1
{
    [ApiVersion("1.0")]
    [Authorize]
    [ApiController]
    [Route("api/v{version:apiVersion}/[controller]")]
    [Route("api/[controller]")]
    public class GamificationController : ControllerBase
    {
        private readonly IGamificationService _gamificationService;
        private readonly ILogger<GamificationController> _logger;
        private readonly IMapper _mapper;

        public GamificationController(
            IGamificationService gamificationService,
            ILogger<GamificationController> logger,
            IMapper mapper)
        {
            _gamificationService = gamificationService;
            _logger = logger;
            _mapper = mapper;
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

                UserProgress userProgress = await _gamificationService.GetUserProgressAsync(userId);
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
                PointTransaction transaction = await _gamificationService.GetTransactionAsync(transactionId);
                
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
                IEnumerable<Models.Gamification.UserAchievement> achievements = await _gamificationService.GetUserAchievementsAsync(userId);
                
                List<UserAchievementDTO> result = new List<UserAchievementDTO>();
                foreach (Models.Gamification.UserAchievement ua in achievements)
                {
                    result.Add(new UserAchievementDTO
                    {
                        Id = ua.Id,
                        UserId = ua.UserId,
                        AchievementId = ua.AchievementId,
                        IsCompleted = ua.IsCompleted,
                        CompletedAt = ua.CompletedAt,
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
                IEnumerable<Models.Gamification.Achievement> achievements = await _gamificationService.GetAvailableAchievementsAsync(userId);
                
                List<AchievementDTO> result = new List<AchievementDTO>();
                foreach (Models.Gamification.Achievement achievement in achievements)
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
        public async Task<ActionResult<IEnumerable<UserBadgeDTO>>> GetUserBadges()
        {
            try
            {
                int userId = User.GetUserIdAsInt();

                IEnumerable<UserBadge> badges = await _gamificationService.GetUserBadgesAsync(userId);
                List<UserBadgeDTO> badgeResults = new List<UserBadgeDTO>();

                foreach (UserBadge badge in badges)
                {
                    UserBadgeDTO badgeDisplay = new UserBadgeDTO
                    {
                        Id = badge.Id,
                        AwardedAt = badge.AwardedAt,
                        IsDisplayed = badge.IsDisplayed,
                        IsFeatured = false,
                        Badge = new BadgeDTO
                        {
                            Id = badge.BadgeId,
                            Name = badge?.Badge?.Name,
                            Description = badge?.Badge?.Description,
                            IconUrl = badge?.Badge?.IconPath ?? string.Empty,
                            Category = badge?.Badge?.Category,
                            Rarity = "Common"
                        }
                    };
                    badgeResults.Add(badgeDisplay);
                }
                
                return Ok(ApiResponse<IEnumerable<UserBadgeDTO>>.SuccessResponse(badgeResults));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user badges");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<IEnumerable<UserBadgeDTO>>.FailureResponse("Error retrieving user badges", StatusCodes.Status500InternalServerError));
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

                IEnumerable<Reward> rewards = await _gamificationService.GetAvailableRewardsAsync(userId);
                IEnumerable<UserReward> userRewards = await _gamificationService.RedeemRewardAsync(userId, 0).ContinueWith(t => new List<UserReward>()); // Temporary fix for missing GetUserRewardsAsync
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
                Reward? reward = await _gamificationService.GetAvailableRewardsAsync(userId)
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

                UserReward claimedReward = await _gamificationService.RedeemRewardAsync(userId, rewardId);
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

                IEnumerable<Challenge> challenges = await _gamificationService.GetActiveChallengesAsync(userId);
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

                IEnumerable<Challenge> challenge = await _gamificationService.GetActiveChallengesAsync(userId);
                if (challenge == null || !challenge.Any())
                {
                    return NotFound(ApiResponse<ChallengeDTO>.NotFoundResponse("No active challenge found"));
                }

                Challenge currentChallenge = challenge.First();

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

                // Get login status from service
                LoginStatus loginStatus = await _gamificationService.GetDailyLoginStatusAsync(userId);
                
                // Get user progress for additional info
                UserProgress userProgress = await _gamificationService.GetUserProgressAsync(userId);
                
                DailyLoginStatusDetailDTO loginStatusResponse = new DailyLoginStatusDetailDTO
                {
                    UserId = userId,
                    HasLoggedInToday = loginStatus.HasClaimedToday,
                    ConsecutiveDays = loginStatus.CurrentStreak,
                    TotalLogins = 0, // Default value since UserProgress doesn't have TotalLogins
                    LastLoginDate = userProgress.LastActivityDate,
                    CurrentStreakPoints = loginStatus.PotentialPoints,
                    RewardClaimed = loginStatus.HasClaimedToday
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

                PointTransaction transactionResult = await _gamificationService.ProcessDailyLoginAsync(userId);
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
        public async Task<ActionResult<GamificationStatsDTO>> GetUserStats()
        {
            try
            {
                int userId = User.GetUserIdAsInt();
                UserProgress userProgress = await _gamificationService.GetUserProgressAsync(userId);

                GamificationStatsDTO stats = new GamificationStatsDTO
                {
                    Progress = new UserProgressDTO
                    {
                        Id = userProgress.Id,
                        UserId = userProgress.UserId,
                        CurrentLevel = userProgress.Level,
                        TotalPoints = userProgress.CurrentPoints,
                        HighestStreak = userProgress.LongestStreak,
                        CurrentStreak = userProgress.CurrentStreak
                    },
                    CompletedTasks = 0, // Default value
                    AchievementsUnlocked = 0, // Default value
                    BadgesEarned = 0, // Default value
                    RewardsRedeemed = 0, // Default value
                    ConsistencyScore = 0 // Default value
                };

                return Ok(ApiResponse<GamificationStatsDTO>.SuccessResponse(stats));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user gamification stats");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<GamificationStatsDTO>.FailureResponse("Error retrieving user stats", StatusCodes.Status500InternalServerError));
            }
        }

        /// <summary>
        /// Get personalized gamification suggestions for the current user
        /// </summary>
        /// <remarks>
        /// Returns a list of suggestions that might help the user earn points or make progress.
        /// Suggestions can include task completion, maintaining streaks, unlocking achievements, etc.
        /// </remarks>
        /// <response code="200">Returns a list of personalized suggestions</response>
        /// <response code="500">If there was an internal server error</response>
        [HttpGet("suggestions")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<List<GamificationSuggestionDetailDTO>>> GetSuggestions()
        {
            try
            {
                int userId = User.GetUserIdAsInt();
                List<GamificationSuggestion> suggestions = await _gamificationService.GetGamificationSuggestionsAsync(userId);
                
                // Map to DTO using AutoMapper
                List<GamificationSuggestionDetailDTO> suggestionDtos = _mapper.Map<List<GamificationSuggestionDetailDTO>>(suggestions);
                
                return Ok(ApiResponse<List<GamificationSuggestionDetailDTO>>.SuccessResponse(suggestionDtos));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving gamification suggestions");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<List<GamificationSuggestionDetailDTO>>.FailureResponse("Error retrieving suggestions", StatusCodes.Status500InternalServerError));
            }
        }

        #endregion

        #region Leaderboard

        [HttpGet("leaderboard")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<IEnumerable<LeaderboardEntryDTO>>> GetLeaderboard([FromQuery] string timeFrame = "all")
        {
            try
            {
                _logger.LogInformation($"Fetching leaderboard with timeFrame: {timeFrame}");
                int userId = User.GetUserIdAsInt();

                // Validate timeFrame parameter
                if (string.IsNullOrEmpty(timeFrame))
                {
                    timeFrame = "points"; // Default to points if empty
                }

                if (timeFrame != "points" && timeFrame != "streak" && timeFrame != "tasks" && timeFrame != "all")
                {
                    _logger.LogWarning($"Invalid timeFrame parameter: {timeFrame}");
                    return BadRequest(ApiResponse<IEnumerable<LeaderboardEntryDTO>>.BadRequestResponse($"Invalid timeFrame parameter: {timeFrame}. Valid values are 'points', 'streak', 'tasks', or 'all'"));
                }

                // Use "points" as default category if "all" is specified
                string category = timeFrame == "all" ? "points" : timeFrame;
                
                try
                {
                    // Get leaderboard data
                    List<LeaderboardEntry> leaderboardEntries = await _gamificationService.GetLeaderboardAsync(category, 10);
                
                    // Create leaderboard DTOs
                List<LeaderboardEntryDTO> leaderboardData = leaderboardEntries.Select(e => new LeaderboardEntryDTO
                    {
                    UserId = e.UserId,
                    Rank = e.Rank,
                    Username = e.Username ?? "User",
                        Value = e.Value, // Use the actual value from the LeaderboardEntry
                    AvatarUrl = string.Empty // Default value
                }).ToList();
                    
                    // Add rank if not set
                    for (int i = 0; i < leaderboardData.Count; i++)
                    {
                        if (leaderboardData[i].Rank == 0)
                        {
                            leaderboardData[i].Rank = i + 1;
                        }
                    }
                
                return Ok(ApiResponse<IEnumerable<LeaderboardEntryDTO>>.SuccessResponse(leaderboardData));
                }
                catch (ArgumentException argEx)
                {
                    _logger.LogWarning(argEx, $"Invalid argument for leaderboard: {argEx.Message}");
                    return BadRequest(ApiResponse<IEnumerable<LeaderboardEntryDTO>>.BadRequestResponse(argEx.Message));
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving leaderboard: {ErrorMessage}", ex.Message);
                if (ex.InnerException != null)
                {
                    _logger.LogError("Inner exception: {InnerError}", ex.InnerException.Message);
                }
                
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<IEnumerable<LeaderboardEntryDTO>>.FailureResponse($"Error retrieving leaderboard: {ex.Message}", StatusCodes.Status500InternalServerError));
            }
        }

        #endregion
    }
} 