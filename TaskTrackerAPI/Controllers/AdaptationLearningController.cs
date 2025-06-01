using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.DTOs.ML;
using TaskTrackerAPI.Services.Interfaces;

namespace TaskTrackerAPI.Controllers
{
    /// <summary>
    /// Controller for adaptation learning system
    /// </summary>
    [ApiController]
    [Route("api/v1/learning")]
    [Authorize]
    public class AdaptationLearningController : ControllerBase
    {
        private readonly IAdaptationLearningService _learningService;
        private readonly IPersonalizedRecommendationService _recommendationService;
        private readonly ILogger<AdaptationLearningController> _logger;

        public AdaptationLearningController(
            IAdaptationLearningService learningService,
            IPersonalizedRecommendationService recommendationService,
            ILogger<AdaptationLearningController> logger)
        {
            _learningService = learningService;
            _recommendationService = recommendationService;
            _logger = logger;
        }

        #region User Learning Profile Endpoints

        /// <summary>
        /// Get user's learning profile
        /// </summary>
        [HttpGet("profile/{userId}")]
        public async Task<IActionResult> GetUserLearningProfile(int userId)
        {
            try
            {
                UserLearningProfileDto? profile = await _learningService.GetUserLearningProfileAsync(userId);
                if (profile == null)
                {
                    return NotFound($"Learning profile not found for user {userId}");
                }

                return Ok(profile);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting learning profile for user {UserId}", userId);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Create a new learning profile for a user
        /// </summary>
        [HttpPost("profile")]
        public async Task<IActionResult> CreateUserLearningProfile([FromBody] CreateUserLearningProfileDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                UserLearningProfileDto profile = await _learningService.CreateUserLearningProfileAsync(createDto);
                return CreatedAtAction(nameof(GetUserLearningProfile), new { userId = profile.UserId }, profile);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating learning profile for user {UserId}", createDto.UserId);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Update user's learning profile
        /// </summary>
        [HttpPut("profile/{userId}")]
        public async Task<IActionResult> UpdateUserLearningProfile(int userId, [FromBody] UpdateUserLearningProfileDto updateDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                UserLearningProfileDto profile = await _learningService.UpdateUserLearningProfileAsync(userId, updateDto);
                return Ok(profile);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating learning profile for user {UserId}", userId);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Delete user's learning profile
        /// </summary>
        [HttpDelete("profile/{userId}")]
        public async Task<IActionResult> DeleteUserLearningProfile(int userId)
        {
            try
            {
                bool result = await _learningService.DeleteUserLearningProfileAsync(userId);
                if (!result)
                {
                    return NotFound($"Learning profile not found for user {userId}");
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting learning profile for user {UserId}", userId);
                return StatusCode(500, "Internal server error");
            }
        }

        #endregion

        #region Adaptation Endpoints

        /// <summary>
        /// Trigger adaptation for a user's preferences
        /// </summary>
        [HttpPost("adapt/{userId}")]
        public async Task<IActionResult> AdaptUserPreferences(int userId)
        {
            try
            {
                UserLearningProfileDto adaptedProfile = await _learningService.AdaptUserPreferencesAsync(userId);
                return Ok(adaptedProfile);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adapting preferences for user {UserId}", userId);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Record an adaptation event
        /// </summary>
        [HttpPost("events")]
        public async Task<IActionResult> RecordAdaptationEvent([FromBody] CreateAdaptationEventDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                AdaptationEventDto adaptationEvent = await _learningService.RecordAdaptationEventAsync(createDto);
                return CreatedAtAction(nameof(GetAdaptationMetrics), new { userId = createDto.UserId }, adaptationEvent);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error recording adaptation event for user {UserId}", createDto.UserId);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Update adaptation event with feedback
        /// </summary>
        [HttpPut("events/{adaptationEventId}/feedback")]
        public async Task<IActionResult> UpdateAdaptationFeedback(int adaptationEventId, [FromBody] AdaptationFeedbackDto feedbackDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                AdaptationEventDto adaptationEvent = await _learningService.UpdateAdaptationFeedbackAsync(adaptationEventId, feedbackDto);
                return Ok(adaptationEvent);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating adaptation feedback for event {EventId}", adaptationEventId);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Process user behavior data for learning
        /// </summary>
        [HttpPost("behavior/{userId}")]
        public async Task<IActionResult> ProcessUserBehaviorData(int userId, [FromBody] Dictionary<string, object> behaviorData)
        {
            try
            {
                await _learningService.ProcessUserBehaviorDataAsync(userId, behaviorData);
                return Ok(new { message = "Behavior data processed successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing behavior data for user {UserId}", userId);
                return StatusCode(500, "Internal server error");
            }
        }

        #endregion

        #region Analytics Endpoints

        /// <summary>
        /// Get adaptation metrics for a user
        /// </summary>
        [HttpGet("metrics/{userId}")]
        public async Task<IActionResult> GetAdaptationMetrics(int userId, [FromQuery] DateTime? since = null)
        {
            try
            {
                AdaptationMetricsDto metrics = await _learningService.GetAdaptationMetricsAsync(userId, since);
                return Ok(metrics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting adaptation metrics for user {UserId}", userId);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get learning insights for a user
        /// </summary>
        [HttpGet("insights/{userId}")]
        public async Task<IActionResult> GetLearningInsights(int userId)
        {
            try
            {
                LearningInsightsDto insights = await _learningService.GetLearningInsightsAsync(userId);
                return Ok(insights);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting learning insights for user {UserId}", userId);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get adaptation trends for a user
        /// </summary>
        [HttpGet("trends/{userId}")]
        public async Task<IActionResult> GetAdaptationTrends(int userId, [FromQuery] int days = 30)
        {
            try
            {
                List<AdaptationTrendDto> trends = await _learningService.GetAdaptationTrendsAsync(userId, days);
                return Ok(trends);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting adaptation trends for user {UserId}", userId);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Check if adaptation should be triggered for a user
        /// </summary>
        [HttpGet("should-adapt/{userId}")]
        public async Task<IActionResult> ShouldTriggerAdaptation(int userId)
        {
            try
            {
                var shouldTrigger = await _learningService.ShouldTriggerAdaptationAsync(userId);
                return Ok(new { shouldTrigger });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking adaptation trigger for user {UserId}", userId);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Generate personalization insights for a user
        /// </summary>
        [HttpGet("personalization-insights/{userId}")]
        public async Task<IActionResult> GetPersonalizationInsights(int userId)
        {
            try
            {
                var insights = await _learningService.GeneratePersonalizationInsightsAsync(userId);
                return Ok(insights);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating personalization insights for user {UserId}", userId);
                return StatusCode(500, "Internal server error");
            }
        }

        #endregion

        #region Personalized Recommendations

        /// <summary>
        /// Get personalized template recommendations
        /// </summary>
        [HttpPost("recommendations")]
        public async Task<IActionResult> GetPersonalizedRecommendations([FromBody] RecommendationRequestDto request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var recommendations = await _recommendationService.GetPersonalizedRecommendationsAsync(request);
                return Ok(recommendations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting personalized recommendations for user {UserId}", request.UserId);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get recommendations for specific context
        /// </summary>
        [HttpPost("recommendations/{userId}/context")]
        public async Task<IActionResult> GetRecommendationsForContext(int userId, [FromBody] Dictionary<string, object> context)
        {
            try
            {
                var recommendations = await _recommendationService.GetRecommendationsForContextAsync(userId, context);
                return Ok(recommendations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting context recommendations for user {UserId}", userId);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get recommendation for a specific template
        /// </summary>
        [HttpGet("recommendations/{userId}/template/{templateId}")]
        public async Task<IActionResult> GetRecommendationForTemplate(int userId, int templateId)
        {
            try
            {
                var recommendation = await _recommendationService.GetRecommendationForTemplateAsync(userId, templateId);
                if (recommendation == null)
                {
                    return NotFound($"No recommendation available for template {templateId}");
                }

                return Ok(recommendation);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recommendation for user {UserId} and template {TemplateId}", userId, templateId);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Record feedback on a recommendation
        /// </summary>
        [HttpPost("recommendations/feedback")]
        public async Task<IActionResult> RecordRecommendationFeedback([FromBody] RecommendationFeedbackDto feedbackDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var recommendationScore = await _recommendationService.RecordRecommendationFeedbackAsync(feedbackDto);
                return Ok(recommendationScore);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error recording recommendation feedback for recommendation {RecommendationId}", feedbackDto.RecommendationId);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Mark recommendations as shown to user
        /// </summary>
        [HttpPost("recommendations/mark-shown")]
        public async Task<IActionResult> MarkRecommendationsAsShown([FromBody] List<int> recommendationIds)
        {
            try
            {
                await _recommendationService.MarkRecommendationsAsShownAsync(recommendationIds);
                return Ok(new { message = "Recommendations marked as shown" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking recommendations as shown");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Record template usage for learning
        /// </summary>
        [HttpPost("recommendations/{userId}/template/{templateId}/usage")]
        public async Task<IActionResult> RecordTemplateUsage(int userId, int templateId)
        {
            try
            {
                var recommendationScore = await _recommendationService.RecordTemplateUsageAsync(userId, templateId);
                return Ok(recommendationScore);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error recording template usage for user {UserId} and template {TemplateId}", userId, templateId);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get recommendation metrics for a user
        /// </summary>
        [HttpGet("recommendations/{userId}/metrics")]
        public async Task<IActionResult> GetRecommendationMetrics(int userId, [FromQuery] DateTime? since = null)
        {
            try
            {
                var metrics = await _recommendationService.GetRecommendationMetricsAsync(userId, since);
                return Ok(metrics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recommendation metrics for user {UserId}", userId);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get recommendation history for a user
        /// </summary>
        [HttpGet("recommendations/{userId}/history")]
        public async Task<IActionResult> GetRecommendationHistory(int userId, [FromQuery] int? templateId = null)
        {
            try
            {
                List<RecommendationScoreDto> history = await _recommendationService.GetRecommendationHistoryAsync(userId, templateId);
                return Ok(history);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recommendation history for user {UserId}", userId);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Refresh recommendations for a user
        /// </summary>
        [HttpPost("recommendations/{userId}/refresh")]
        public async Task<IActionResult> RefreshRecommendations(int userId)
        {
            try
            {
                await _recommendationService.RefreshRecommendationsAsync(userId);
                return Ok(new { message = "Recommendations refreshed successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error refreshing recommendations for user {UserId}", userId);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get fallback recommendations when no learning profile exists
        /// </summary>
        [HttpGet("recommendations/{userId}/fallback")]
        public async Task<IActionResult> GetFallbackRecommendations(int userId)
        {
            try
            {
                var recommendations = await _recommendationService.GetFallbackRecommendationsAsync(userId);
                return Ok(recommendations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting fallback recommendations for user {UserId}", userId);
                return StatusCode(500, "Internal server error");
            }
        }

        #endregion
    }
} 