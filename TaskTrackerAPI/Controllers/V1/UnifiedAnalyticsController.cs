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
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TaskTrackerAPI.DTOs.Analytics;
using TaskTrackerAPI.Extensions;
using TaskTrackerAPI.Services.Interfaces;

namespace TaskTrackerAPI.Controllers.V1;

/// <summary>
/// Unified Analytics Controller - Single API for all analytics needs
/// Replaces: AdvancedAnalyticsController, MLAnalyticsController, DataVisualizationController
/// Provides: User Analytics, Family Analytics, Admin Analytics, ML Insights
/// Benefits: Single API call, reduced network overhead, unified caching, consistent responses
/// </summary>
[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class UnifiedAnalyticsController : ControllerBase
{
    private readonly IUnifiedAnalyticsService _analyticsService;
    private readonly ILogger<UnifiedAnalyticsController> _logger;

    public UnifiedAnalyticsController(
        IUnifiedAnalyticsService analyticsService,
        ILogger<UnifiedAnalyticsController> logger)
    {
        _analyticsService = analyticsService ?? throw new ArgumentNullException(nameof(analyticsService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    #region User Analytics Endpoints

    /// <summary>
    /// Get comprehensive user analytics dashboard
    /// Single endpoint replacing multiple analytics calls
    /// </summary>
    [HttpGet("user/dashboard")]
    public async Task<ActionResult<UserAnalyticsDashboardDTO>> GetUserDashboard(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        try
        {
            int userId = User.GetUserIdAsInt();
            UserAnalyticsDashboardDTO dashboard = await _analyticsService.GetUserAnalyticsDashboardAsync(userId, startDate, endDate);
            
            _logger.LogInformation("User analytics dashboard retrieved for user {UserId}", userId);
            return Ok(dashboard);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user analytics dashboard");
            return StatusCode(500, "An error occurred while retrieving analytics data");
        }
    }

    /// <summary>
    /// Get user productivity insights with ML predictions
    /// </summary>
    [HttpGet("user/productivity-insights")]
    public async Task<ActionResult<UserProductivityInsightsDTO>> GetUserProductivityInsights()
    {
        try
        {
            int userId = User.GetUserIdAsInt();
            UserProductivityInsightsDTO insights = await _analyticsService.GetUserProductivityInsightsAsync(userId);
            
            return Ok(insights);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user productivity insights for user {UserId}", User.GetUserIdAsInt());
            return StatusCode(500, "An error occurred while retrieving productivity insights");
        }
    }

    /// <summary>
    /// Get user's board performance analytics
    /// </summary>
    [HttpGet("user/board-analytics")]
    public async Task<ActionResult<UserBoardAnalyticsDTO>> GetUserBoardAnalytics(
        [FromQuery] int? boardId = null)
    {
        try
        {
            int userId = User.GetUserIdAsInt();
            UserBoardAnalyticsDTO analytics = await _analyticsService.GetUserBoardAnalyticsAsync(userId, boardId);
            
            return Ok(analytics);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving board analytics for user {UserId}", User.GetUserIdAsInt());
            return StatusCode(500, "An error occurred while retrieving board analytics");
        }
    }

    /// <summary>
    /// Get personalized recommendations based on ML analysis
    /// </summary>
    [HttpGet("user/recommendations")]
    public async Task<ActionResult<PersonalizedRecommendationsDTO>> GetPersonalizedRecommendations()
    {
        try
        {
            int userId = User.GetUserIdAsInt();
            PersonalizedRecommendationsDTO recommendations = await _analyticsService.GetPersonalizedRecommendationsAsync(userId);
            
            return Ok(recommendations);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving recommendations for user {UserId}", User.GetUserIdAsInt());
            return StatusCode(500, "An error occurred while retrieving recommendations");
        }
    }

    #endregion

    #region Family Analytics Endpoints

    /// <summary>
    /// Get comprehensive family analytics dashboard
    /// </summary>
    [HttpGet("family/{familyId}/dashboard")]
    public async Task<ActionResult<FamilyAnalyticsDashboardDTO>> GetFamilyDashboard(
        int familyId,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        try
        {
            FamilyAnalyticsDashboardDTO dashboard = await _analyticsService.GetFamilyAnalyticsDashboardAsync(familyId, startDate, endDate);
            
            _logger.LogInformation("Family analytics dashboard retrieved for family {FamilyId}", familyId);
            return Ok(dashboard);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving family analytics dashboard for family {FamilyId}", familyId);
            return StatusCode(500, "An error occurred while retrieving family analytics");
        }
    }

    /// <summary>
    /// Get family productivity insights
    /// </summary>
    [HttpGet("family/{familyId}/productivity-insights")]
    public async Task<ActionResult<FamilyProductivityInsightsDTO>> GetFamilyProductivityInsights(int familyId)
    {
        try
        {
            FamilyProductivityInsightsDTO insights = await _analyticsService.GetFamilyProductivityInsightsAsync(familyId);
            return Ok(insights);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving family productivity insights for family {FamilyId}", familyId);
            return StatusCode(500, "An error occurred while retrieving family productivity insights");
        }
    }

    /// <summary>
    /// Get family collaboration analytics
    /// </summary>
    [HttpGet("family/{familyId}/collaboration")]
    public async Task<ActionResult<FamilyCollaborationAnalyticsDTO>> GetFamilyCollaborationAnalytics(int familyId)
    {
        try
        {
            FamilyCollaborationAnalyticsDTO analytics = await _analyticsService.GetFamilyCollaborationAnalyticsAsync(familyId);
            return Ok(analytics);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving family collaboration analytics for family {FamilyId}", familyId);
            return StatusCode(500, "An error occurred while retrieving collaboration analytics");
        }
    }

    #endregion

    #region Admin Analytics Endpoints

    /// <summary>
    /// Get comprehensive admin analytics dashboard
    /// Requires admin role
    /// </summary>
    [HttpGet("admin/dashboard")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<AdminAnalyticsDashboardDTO>> GetAdminDashboard(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        try
        {
            AdminAnalyticsDashboardDTO dashboard = await _analyticsService.GetAdminAnalyticsDashboardAsync(startDate, endDate);
            
            _logger.LogInformation("Admin analytics dashboard retrieved");
            return Ok(dashboard);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving admin analytics dashboard");
            return StatusCode(500, "An error occurred while retrieving admin analytics");
        }
    }

    /// <summary>
    /// Get platform usage analytics
    /// </summary>
    [HttpGet("admin/platform-usage")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<PlatformUsageAnalyticsDTO>> GetPlatformUsageAnalytics(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        try
        {
            PlatformUsageAnalyticsDTO analytics = await _analyticsService.GetPlatformUsageAnalyticsAsync();
            return Ok(analytics);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving platform usage analytics");
            return StatusCode(500, "An error occurred while retrieving platform usage analytics");
        }
    }

    /// <summary>
    /// Get system health analytics
    /// </summary>
    [HttpGet("admin/system-health")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<SystemHealthAnalyticsDTO>> GetSystemHealthAnalytics()
    {
        try
        {
            SystemHealthAnalyticsDTO analytics = await _analyticsService.GetSystemHealthAnalyticsAsync();
            return Ok(analytics);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving system health analytics");
            return StatusCode(500, "An error occurred while retrieving system health analytics");
        }
    }

    /// <summary>
    /// Get background service analytics
    /// </summary>
    [HttpGet("admin/background-services")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<BackgroundServiceAnalyticsDTO>> GetBackgroundServiceAnalytics()
    {
        try
        {
            BackgroundServiceAnalyticsDTO analytics = await _analyticsService.GetBackgroundServiceAnalyticsAsync();
            return Ok(analytics);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving background service analytics");
            return StatusCode(500, "An error occurred while retrieving background service analytics");
        }
    }

    /// <summary>
    /// Get marketplace analytics
    /// </summary>
    [HttpGet("admin/marketplace")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<MarketplaceAnalyticsDTO>> GetMarketplaceAnalytics()
    {
        try
        {
            MarketplaceAnalyticsDTO analytics = await _analyticsService.GetMarketplaceAnalyticsAsync();
            return Ok(analytics);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving marketplace analytics");
            return StatusCode(500, "An error occurred while retrieving marketplace analytics");
        }
    }

    /// <summary>
    /// Get user engagement analytics
    /// </summary>
    [HttpGet("admin/user-engagement")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<UserEngagementAnalyticsDTO>> GetUserEngagementAnalytics(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        try
        {
            UserEngagementAnalyticsDTO analytics = await _analyticsService.GetUserEngagementAnalyticsAsync(startDate, endDate);
            return Ok(analytics);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user engagement analytics");
            return StatusCode(500, "An error occurred while retrieving user engagement analytics");
        }
    }

    #endregion

    #region ML Analytics & Predictions

    /// <summary>
    /// Get ML-powered insights and predictions
    /// </summary>
    [HttpGet("ml/insights")]
    public async Task<ActionResult<MLInsightsDTO>> GetMLInsights(
        [FromQuery] int? userId = null,
        [FromQuery] int? familyId = null)
    {
        try
        {
            // If no specific user/family provided, use current user
            if (!userId.HasValue && !familyId.HasValue)
            {
                userId = User.GetUserIdAsInt();
            }

            var insights = await _analyticsService.GetMLInsightsAsync(userId ?? User.GetUserIdAsInt());
            return Ok(insights);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving ML insights");
            return StatusCode(500, "An error occurred while retrieving ML insights");
        }
    }

    /// <summary>
    /// Get behavioral analysis and patterns
    /// </summary>
    [HttpGet("ml/behavioral-analysis")]
    public async Task<ActionResult<BehavioralAnalysisDTO>> GetBehavioralAnalysis()
    {
        try
        {
            int userId = User.GetUserIdAsInt();
            BehavioralAnalysisDTO analysis = await _analyticsService.GetBehavioralAnalysisAsync(userId);
            return Ok(analysis);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving behavioral analysis for user {UserId}", User.GetUserIdAsInt());
            return StatusCode(500, "An error occurred while retrieving behavioral analysis");
        }
    }

    /// <summary>
    /// Get predictive analytics for user success
    /// </summary>
    [HttpGet("ml/predictive-analytics")]
    public async Task<ActionResult<PredictiveAnalyticsDTO>> GetPredictiveAnalytics()
    {
        try
        {
            int userId = User.GetUserIdAsInt();
            PredictiveAnalyticsDTO analytics = await _analyticsService.GetPredictiveAnalyticsAsync(userId);
            return Ok(analytics);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving predictive analytics for user {UserId}", User.GetUserIdAsInt());
            return StatusCode(500, "An error occurred while retrieving predictive analytics");
        }
    }

    #endregion

    #region Export & Visualization

    /// <summary>
    /// Export analytics data in various formats
    /// </summary>
    [HttpPost("export")]
    public async Task<ActionResult<AnalyticsExportDTO>> ExportAnalytics([FromBody] AnalyticsExportRequestDTO request)
    {
        try
        {
            AnalyticsExportDTO export = await _analyticsService.ExportAnalyticsAsync(request);
            return Ok(export);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting analytics data");
            return StatusCode(500, "An error occurred while exporting analytics data");
        }
    }

    /// <summary>
    /// Get data visualization configurations
    /// </summary>
    [HttpGet("visualization/{visualizationType}")]
    public async Task<ActionResult<DataVisualizationDTO>> GetDataVisualization(
        string visualizationType,
        [FromQuery] Dictionary<string, object> parameters)
    {
        try
        {
            DataVisualizationDTO visualization = await _analyticsService.GetDataVisualizationAsync(visualizationType, parameters);
            return Ok(visualization);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving data visualization for type {VisualizationType}", visualizationType);
            return StatusCode(500, "An error occurred while retrieving data visualization");
        }
    }

    #endregion

    #region Cache Management

    /// <summary>
    /// Refresh analytics cache for current user
    /// </summary>
    [HttpPost("cache/refresh")]
    public async Task<ActionResult> RefreshAnalyticsCache()
    {
        try
        {
            int userId = User.GetUserIdAsInt();
            await _analyticsService.RefreshUserAnalyticsCacheAsync(userId);
            
            _logger.LogInformation("Analytics cache refreshed for user {UserId}", userId);
            return Ok(new { message = "Analytics cache refreshed successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error refreshing analytics cache for user {UserId}", User.GetUserIdAsInt());
            return StatusCode(500, "An error occurred while refreshing analytics cache");
        }
    }

    /// <summary>
    /// Refresh analytics cache for family
    /// </summary>
    [HttpPost("cache/refresh/family/{familyId}")]
    public async Task<ActionResult> RefreshFamilyAnalyticsCache(int familyId)
    {
        try
        {
            await _analyticsService.RefreshFamilyAnalyticsCacheAsync(familyId);
            
            _logger.LogInformation("Analytics cache refreshed for family {FamilyId}", familyId);
            return Ok(new { message = "Family analytics cache refreshed successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error refreshing analytics cache for family {FamilyId}", familyId);
            return StatusCode(500, "An error occurred while refreshing family analytics cache");
        }
    }

    #endregion
} 