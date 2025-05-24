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
                // Add debugging to see what claims are available
                _logger.LogInformation("Authenticated: {IsAuthenticated}", User.Identity?.IsAuthenticated);
                _logger.LogInformation("Claims count: {ClaimsCount}", User.Claims.Count());
                foreach (var claim in User.Claims)
                {
                    _logger.LogInformation("Claim: {Type} = {Value}", claim.Type, claim.Value);
                }

                int userId = User.GetUserIdAsInt();
                _logger.LogInformation("User ID extracted: {UserId}", userId);

                UserProgressDTO userProgress = await _gamificationService.GetUserProgressAsync(userId);

                return Ok(ApiResponse<UserProgressDTO>.SuccessResponse(userProgress));
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogError(ex, "Authentication error retrieving user progress: {Message}", ex.Message);
                return StatusCode(StatusCodes.Status401Unauthorized,
                    ApiResponse<UserProgressDTO>.FailureResponse($"Authentication error: {ex.Message}", StatusCodes.Status401Unauthorized));
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
                PointTransactionDTO transaction = await _gamificationService.GetTransactionAsync(transactionId);
                
                return Ok(ApiResponse<PointTransactionDTO>.SuccessResponse(transaction));
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
                List<UserAchievementDTO> achievements = await _gamificationService.GetUserAchievementsAsync(userId);
                
                return Ok(achievements);
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
                List<AchievementDTO> achievements = await _gamificationService.GetAvailableAchievementsAsync(userId);
                
                return Ok(achievements);
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

                List<UserBadgeDTO> badges = await _gamificationService.GetUserBadgesAsync(userId);

                return Ok(ApiResponse<IEnumerable<UserBadgeDTO>>.SuccessResponse(badges));
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

                List<RewardDTO> rewards = await _gamificationService.GetAvailableRewardsAsync(userId);

                return Ok(ApiResponse<IEnumerable<RewardDTO>>.SuccessResponse(rewards));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving available rewards");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<IEnumerable<RewardDTO>>.FailureResponse("Error retrieving available rewards", StatusCodes.Status500InternalServerError));
            }
        }

        [HttpPost("rewards/claim/{rewardId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<UserRewardDTO>> ClaimReward(int rewardId)
        {
            try
            {
                int userId = User.GetUserIdAsInt();

                UserRewardDTO userReward = await _gamificationService.RedeemRewardAsync(userId, rewardId);
                
                return Ok(ApiResponse<UserRewardDTO>.SuccessResponse(userReward));
                }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid reward claim attempt for user {UserId}, reward {RewardId}", User.GetUserIdAsInt(), rewardId);
                return NotFound(ApiResponse<UserRewardDTO>.NotFoundResponse("Reward not found or not available"));
                }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Invalid reward claim operation for user {UserId}, reward {RewardId}", User.GetUserIdAsInt(), rewardId);
                return BadRequest(ApiResponse<UserRewardDTO>.BadRequestResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error claiming reward");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<UserRewardDTO>.FailureResponse("Error claiming reward", StatusCodes.Status500InternalServerError));
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

                List<ChallengeDTO> challenges = await _gamificationService.GetActiveChallengesAsync(userId);

                return Ok(ApiResponse<IEnumerable<ChallengeDTO>>.SuccessResponse(challenges));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving active challenges");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<IEnumerable<ChallengeDTO>>.FailureResponse("Error retrieving active challenges", StatusCodes.Status500InternalServerError));
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

                ChallengeDTO? challenge = await _gamificationService.GetChallengeForUserAsync(userId);

                if (challenge == null)
                {
                    return NotFound(ApiResponse<ChallengeDTO>.NotFoundResponse("No active challenge found"));
                }

                return Ok(ApiResponse<ChallengeDTO>.SuccessResponse(challenge));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving current challenge");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<ChallengeDTO>.FailureResponse("Error retrieving current challenge", StatusCodes.Status500InternalServerError));
            }
        }

        [HttpGet("challenges/active")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<IEnumerable<UserActiveChallengeDTO>>> GetUserActiveChallenges()
        {
            try
            {
                int userId = User.GetUserIdAsInt();

                List<UserActiveChallengeDTO> activeChallenges = await _gamificationService.GetUserActiveChallengesAsync(userId);

                return Ok(ApiResponse<IEnumerable<UserActiveChallengeDTO>>.SuccessResponse(activeChallenges));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user active challenges");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<IEnumerable<UserActiveChallengeDTO>>.FailureResponse("Error retrieving user active challenges", StatusCodes.Status500InternalServerError));
            }
        }

        [HttpPost("challenges/{challengeId}/enroll")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<UserChallengeDTO>> EnrollInChallenge(int challengeId)
        {
            try
            {
                int userId = User.GetUserIdAsInt();

                UserChallengeDTO result = await _gamificationService.EnrollInChallengeAsync(userId, challengeId);

                return Ok(ApiResponse<UserChallengeDTO>.SuccessResponse(result));
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Invalid operation for enrolling in challenge {ChallengeId}", challengeId);
                return BadRequest(ApiResponse<UserChallengeDTO>.BadRequestResponse(ex.Message));
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid argument for enrolling in challenge {ChallengeId}", challengeId);
                return BadRequest(ApiResponse<UserChallengeDTO>.BadRequestResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error enrolling in challenge {ChallengeId}", challengeId);
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<UserChallengeDTO>.FailureResponse("Error enrolling in challenge", StatusCodes.Status500InternalServerError));
            }
        }

        [HttpPost("challenges/{challengeId}/leave")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<bool>> LeaveChallenge(int challengeId)
        {
            try
            {
                int userId = User.GetUserIdAsInt();

                bool result = await _gamificationService.LeaveChallengeAsync(userId, challengeId);

                if (!result)
                {
                    return NotFound(ApiResponse<bool>.NotFoundResponse("Challenge not found or not enrolled"));
                }

                return Ok(ApiResponse<bool>.SuccessResponse(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error leaving challenge {ChallengeId}", challengeId);
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<bool>.FailureResponse("Error leaving challenge", StatusCodes.Status500InternalServerError));
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
                DailyLoginStatusDetailDTO loginStatus = await _gamificationService.GetDailyLoginStatusAsync(userId);
                
                return Ok(ApiResponse<DailyLoginStatusDetailDTO>.SuccessResponse(loginStatus));
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

                PointTransactionDTO transactionResult = await _gamificationService.ProcessDailyLoginAsync(userId);

                return Ok(ApiResponse<PointTransactionDTO>.SuccessResponse(transactionResult, "Daily login reward claimed successfully"));
            }
            catch (InvalidOperationException ex)
                {
                _logger.LogWarning(ex, "Daily login reward already claimed for user {UserId}", User.GetUserIdAsInt());
                    return BadRequest(ApiResponse<PointTransactionDTO>.BadRequestResponse("Daily login reward already claimed today"));
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
                GamificationStatsDTO stats = await _gamificationService.GetGamificationStatsAsync(userId);

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
                List<GamificationSuggestionDetailDTO> suggestions = await _gamificationService.GetGamificationSuggestionsAsync(userId);
                
                return Ok(ApiResponse<List<GamificationSuggestionDetailDTO>>.SuccessResponse(suggestions));
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
                    // Get family-based leaderboard data instead of global
                    List<LeaderboardEntryDTO> leaderboardEntries = await _gamificationService.GetFamilyMembersLeaderboardAsync(userId, category, 10);
                
                    return Ok(ApiResponse<IEnumerable<LeaderboardEntryDTO>>.SuccessResponse(leaderboardEntries));
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

        [HttpGet("leaderboard/family/{familyId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<IEnumerable<LeaderboardEntryDTO>>> GetSpecificFamilyLeaderboard(int familyId, [FromQuery] string category = "points", [FromQuery] int limit = 10)
        {
            try
            {
                _logger.LogInformation($"Fetching family-specific leaderboard for family {familyId} with category: {category}");
                int userId = User.GetUserIdAsInt();

                // Validate category parameter
                if (string.IsNullOrEmpty(category))
                {
                    category = "points"; // Default to points if empty
                }

                if (category != "points" && category != "streak" && category != "tasks")
                {
                    _logger.LogWarning($"Invalid category parameter: {category}");
                    return BadRequest(ApiResponse<IEnumerable<LeaderboardEntryDTO>>.BadRequestResponse($"Invalid category parameter: {category}. Valid values are 'points', 'streak', or 'tasks'"));
                }

                try
                {
                    // Get family-specific leaderboard data
                    List<LeaderboardEntryDTO> leaderboardEntries = await _gamificationService.GetSpecificFamilyLeaderboardAsync(userId, familyId, category, limit);

                    return Ok(ApiResponse<IEnumerable<LeaderboardEntryDTO>>.SuccessResponse(leaderboardEntries));
                }
                catch (ArgumentException argEx)
                {
                    _logger.LogWarning(argEx, $"Invalid argument for family leaderboard: {argEx.Message}");
                    return BadRequest(ApiResponse<IEnumerable<LeaderboardEntryDTO>>.BadRequestResponse(argEx.Message));
                }
                catch (UnauthorizedAccessException)
                {
                    _logger.LogWarning($"User {userId} attempted to access leaderboard for family {familyId} without permission");
                    return Forbid();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving family leaderboard for family {familyId}");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<IEnumerable<LeaderboardEntryDTO>>.FailureResponse("Error retrieving family leaderboard", StatusCodes.Status500InternalServerError));
            }
        }

        #endregion

        #region Character System

        [HttpGet("character")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<CharacterProgressDTO>> GetCharacterProgress()
        {
            try
            {
                int userId = User.GetUserIdAsInt();
                
                // Get unlocked characters using the service method
                string[] unlockedCharacters = await _gamificationService.GetUnlockedCharactersAsync(userId);
                
                // Get basic user progress
                UserProgressDTO userProgress = await _gamificationService.GetUserProgressAsync(userId);
                
                // For now, we'll use default values for character-specific data
                // In a future iteration, these should be included in the UserProgressDTO or a dedicated CharacterProgressDTO service method
                CharacterProgressDTO characterProgress = new CharacterProgressDTO
                {
                    UserId = userId,
                    CurrentCharacterClass = "explorer", // Default value - should be enhanced to get from database
                    CharacterLevel = 1, // Default value - should be enhanced to get from database  
                    CharacterXP = 0, // Default value - should be enhanced to get from database
                    UnlockedCharacters = unlockedCharacters.ToList(),
                    CurrentTier = "bronze", // Default value - should be enhanced to get from database
                    TotalPoints = userProgress.TotalPoints
                };

                return Ok(ApiResponse<CharacterProgressDTO>.SuccessResponse(characterProgress));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving character progress");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<CharacterProgressDTO>.FailureResponse("Error retrieving character progress", StatusCodes.Status500InternalServerError));
            }
        }

        [HttpPost("character/switch")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<bool>> SwitchCharacterClass([FromBody] SwitchCharacterDTO dto)
        {
            try
            {
                int userId = User.GetUserIdAsInt();
                bool result = await _gamificationService.SwitchCharacterClassAsync(userId, dto.CharacterClass);

                if (!result)
                {
                    return BadRequest(ApiResponse<bool>.BadRequestResponse("Character class not unlocked or invalid"));
                }

                return Ok(ApiResponse<bool>.SuccessResponse(true, "Character class switched successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error switching character class");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<bool>.FailureResponse("Error switching character class", StatusCodes.Status500InternalServerError));
            }
        }

        [HttpPost("character/unlock")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<bool>> UnlockCharacterClass([FromBody] UnlockCharacterDTO dto)
        {
            try
            {
                int userId = User.GetUserIdAsInt();
                bool result = await _gamificationService.UnlockCharacterClassAsync(userId, dto.CharacterClass);

                if (!result)
                {
                    return BadRequest(ApiResponse<bool>.BadRequestResponse("Character class cannot be unlocked yet or is already unlocked"));
                }

                return Ok(ApiResponse<bool>.SuccessResponse(true, "Character class unlocked successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error unlocking character class");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<bool>.FailureResponse("Error unlocking character class", StatusCodes.Status500InternalServerError));
            }
        }

        #endregion

        #region Focus Mode Integration

        [HttpPost("focus/complete")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<FocusCompletionRewardDTO>> CompleteFocusSession([FromBody] FocusSessionCompletionDTO dto)
        {
            try
            {
                int userId = User.GetUserIdAsInt();
                FocusCompletionRewardDTO reward = await _gamificationService.ProcessFocusSessionCompletionAsync(userId, dto.SessionId, dto.DurationMinutes, dto.WasCompleted);

                return Ok(ApiResponse<FocusCompletionRewardDTO>.SuccessResponse(reward, "Focus session completion processed"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing focus session completion");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<FocusCompletionRewardDTO>.FailureResponse("Error processing focus completion", StatusCodes.Status500InternalServerError));
            }
        }

        #endregion

        #region Tier System

        [HttpGet("tier/progress")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<TierProgressDTO>> GetTierProgress()
        {
            try
            {
                int userId = User.GetUserIdAsInt();
                TierProgressDTO tierProgress = await _gamificationService.GetTierProgressAsync(userId);

                return Ok(ApiResponse<TierProgressDTO>.SuccessResponse(tierProgress));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving tier progress");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<TierProgressDTO>.FailureResponse("Error retrieving tier progress", StatusCodes.Status500InternalServerError));
            }
        }

        #endregion
    }
} 