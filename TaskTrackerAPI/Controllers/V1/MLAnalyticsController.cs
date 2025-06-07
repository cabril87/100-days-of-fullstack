using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.Models.ML;
using TaskTrackerAPI.Services.Interfaces;
using TaskTrackerAPI.Attributes;

namespace TaskTrackerAPI.Controllers.V1
{
    /// <summary>
    /// ML Analytics controller - provides machine learning insights and model management.
    /// Accessible to Developers and Global Admins only.
    /// Used for AI-powered productivity analytics and predictions.
    /// </summary>
    [ApiController]
    [Route("api/v1/[controller]")]
    [Authorize]
    [RequireDeveloper] // ML analytics for Developers and Global Admins
    public class MLAnalyticsController : ControllerBase
    {
        private readonly IMLAnalyticsService _mlAnalyticsService;
        private readonly ILogger<MLAnalyticsController> _logger;

        public MLAnalyticsController(IMLAnalyticsService mlAnalyticsService, ILogger<MLAnalyticsController> logger)
        {
            _mlAnalyticsService = mlAnalyticsService;
            _logger = logger;
        }

        /// <summary>
        /// Get comprehensive ML-powered insights for a user
        /// </summary>
        [HttpGet("insights/{userId}")]
        public async Task<ActionResult<MLInsightsResult>> GetMLInsights(int userId)
        {
            try
            {
                var insights = await _mlAnalyticsService.GetComprehensiveMLInsightsAsync(userId);
                return Ok(insights);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting ML insights for user {UserId}", userId);
                return StatusCode(500, "Error generating ML insights");
            }
        }

        /// <summary>
        /// Predict success of next focus session
        /// </summary>
        [HttpGet("predict/session-success/{userId}")]
        public async Task<ActionResult<FocusSessionPrediction>> PredictSessionSuccess(int userId)
        {
            try
            {
                var prediction = await _mlAnalyticsService.PredictNextSessionSuccessAsync(userId);
                return Ok(prediction);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error predicting session success for user {UserId}", userId);
                return StatusCode(500, "Error generating prediction");
            }
        }

        /// <summary>
        /// Get personalized recommendations based on ML analysis
        /// </summary>
        [HttpGet("recommendations/{userId}")]
        public async Task<ActionResult<List<string>>> GetPersonalizedRecommendations(int userId)
        {
            try
            {
                var recommendations = await _mlAnalyticsService.GetPersonalizedRecommendationsAsync(userId);
                return Ok(recommendations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recommendations for user {UserId}", userId);
                return StatusCode(500, "Error generating recommendations");
            }
        }

        /// <summary>
        /// Get optimal focus times for a specific date
        /// </summary>
        [HttpGet("optimal-times/{userId}")]
        public async Task<ActionResult<List<DateTime>>> GetOptimalFocusTimes(int userId, [FromQuery] DateTime? targetDate = null)
        {
            try
            {
                var date = targetDate ?? DateTime.Today.AddDays(1);
                var optimalTimes = await _mlAnalyticsService.GetOptimalFocusTimesAsync(userId, date);
                return Ok(optimalTimes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting optimal times for user {UserId}", userId);
                return StatusCode(500, "Error generating optimal times");
            }
        }

        /// <summary>
        /// Get weekly productivity patterns
        /// </summary>
        [HttpGet("patterns/weekly/{userId}")]
        public async Task<ActionResult<Dictionary<DayOfWeek, float>>> GetWeeklyPatterns(int userId)
        {
            try
            {
                var patterns = await _mlAnalyticsService.GetWeeklyProductivityPatternsAsync(userId);
                return Ok(patterns);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting weekly patterns for user {UserId}", userId);
                return StatusCode(500, "Error analyzing patterns");
            }
        }

        /// <summary>
        /// Get hourly productivity patterns
        /// </summary>
        [HttpGet("patterns/hourly/{userId}")]
        public async Task<ActionResult<Dictionary<int, float>>> GetHourlyPatterns(int userId)
        {
            try
            {
                var patterns = await _mlAnalyticsService.GetHourlyProductivityPatternsAsync(userId);
                return Ok(patterns);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting hourly patterns for user {UserId}", userId);
                return StatusCode(500, "Error analyzing patterns");
            }
        }

        /// <summary>
        /// Train ML models for a specific user
        /// </summary>
        [HttpPost("train/{userId}")]
        public async Task<ActionResult> TrainUserModels(int userId)
        {
            try
            {
                var successModelTrained = await _mlAnalyticsService.TrainFocusSuccessModelAsync(userId);
                var durationModelTrained = await _mlAnalyticsService.TrainFocusDurationModelAsync(userId);
                var distractionModelTrained = await _mlAnalyticsService.TrainDistractionModelAsync(userId);

                return Ok(new
                {
                    SuccessModelTrained = successModelTrained,
                    DurationModelTrained = durationModelTrained,
                    DistractionModelTrained = distractionModelTrained,
                    Message = "Model training completed"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error training models for user {UserId}", userId);
                return StatusCode(500, "Error training models");
            }
        }

        /// <summary>
        /// Get model performance metrics
        /// </summary>
        [HttpGet("model-metrics")]
        public async Task<ActionResult<Dictionary<string, object>>> GetModelMetrics()
        {
            try
            {
                var metrics = await _mlAnalyticsService.GetModelMetricsAsync();
                return Ok(metrics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting model metrics");
                return StatusCode(500, "Error retrieving metrics");
            }
        }

        /// <summary>
        /// Validate model health
        /// </summary>
        [HttpGet("health")]
        public async Task<ActionResult> ValidateModelHealth()
        {
            try
            {
                var isHealthy = await _mlAnalyticsService.ValidateModelHealthAsync();
                return Ok(new { IsHealthy = isHealthy, Timestamp = DateTime.UtcNow });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating model health");
                return StatusCode(500, "Error validating model health");
            }
        }

        /// <summary>
        /// Get productivity anomalies
        /// </summary>
        [HttpGet("anomalies/{userId}")]
        public async Task<ActionResult<List<string>>> GetProductivityAnomalies(int userId)
        {
            try
            {
                var anomalies = await _mlAnalyticsService.DetectProductivityAnomaliesAsync(userId);
                return Ok(anomalies);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error detecting anomalies for user {UserId}", userId);
                return StatusCode(500, "Error detecting anomalies");
            }
        }

        /// <summary>
        /// Get environmental recommendations
        /// </summary>
        [HttpGet("environment/{userId}")]
        public async Task<ActionResult<List<string>>> GetEnvironmentalRecommendations(int userId)
        {
            try
            {
                var recommendations = await _mlAnalyticsService.GetEnvironmentalRecommendationsAsync(userId);
                return Ok(recommendations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting environmental recommendations for user {UserId}", userId);
                return StatusCode(500, "Error generating environmental recommendations");
            }
        }
    }
} 