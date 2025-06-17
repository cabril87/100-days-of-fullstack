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
using TaskTrackerAPI.DTOs.Analytics;
using TaskTrackerAPI.DTOs.BackgroundServices;
using TaskTrackerAPI.DTOs.Boards;
using TaskTrackerAPI.DTOs.Tasks;

namespace TaskTrackerAPI.Services.Interfaces;

/// <summary>
/// Unified analytics service interface that properly separates user and admin analytics
/// Follows repository pattern and respects access boundaries
/// Consolidates 7+ analytics services into a single, comprehensive service
/// </summary>
public interface IUnifiedAnalyticsService
{
    #region User Analytics (Available to End Users)
    
    /// <summary>
    /// Get comprehensive user analytics dashboard
    /// Consolidates task analytics, productivity metrics, gamification stats, board performance, and template usage
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <param name="startDate">Optional start date for analytics period</param>
    /// <param name="endDate">Optional end date for analytics period</param>
    /// <returns>Complete user analytics dashboard</returns>
    Task<UserAnalyticsDashboardDTO> GetUserAnalyticsDashboardAsync(int userId, DateTime? startDate = null, DateTime? endDate = null);
    
    /// <summary>
    /// Get user's productivity insights with ML-powered recommendations
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <returns>Productivity insights and recommendations</returns>
    Task<UserProductivityInsightsDTO> GetUserProductivityInsightsAsync(int userId);
    
    /// <summary>
    /// Get user's board analytics for specific board or all boards
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <param name="boardId">Optional specific board ID</param>
    /// <returns>Board performance analytics</returns>
    Task<UserBoardAnalyticsDTO> GetUserBoardAnalyticsAsync(int userId, int? boardId = null);
    
    /// <summary>
    /// Get user's ML-powered recommendations and insights
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <returns>ML insights and recommendations</returns>
    Task<UserMLInsightsDTO> GetUserMLInsightsAsync(int userId);
    
    /// <summary>
    /// Get personalized recommendations for a user
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <returns>Personalized recommendations</returns>
    Task<PersonalizedRecommendationsDTO> GetPersonalizedRecommendationsAsync(int userId);

    #endregion

    #region Family Analytics (Available to Family Members)
    
    /// <summary>
    /// Get comprehensive family analytics dashboard
    /// Available to all family members for collaboration insights
    /// </summary>
    /// <param name="familyId">Family ID</param>
    /// <param name="startDate">Optional start date for analytics period</param>
    /// <param name="endDate">Optional end date for analytics period</param>
    /// <returns>Complete family analytics dashboard</returns>
    Task<FamilyAnalyticsDashboardDTO> GetFamilyAnalyticsDashboardAsync(int familyId, DateTime? startDate = null, DateTime? endDate = null);
    
    /// <summary>
    /// Get family productivity insights and collaboration metrics
    /// </summary>
    /// <param name="familyId">Family ID</param>
    /// <returns>Family productivity insights</returns>
    Task<FamilyProductivityInsightsDTO> GetFamilyProductivityInsightsAsync(int familyId);
    
    /// <summary>
    /// Get family collaboration analytics
    /// </summary>
    /// <param name="familyId">Family ID</param>
    /// <returns>Collaboration analytics</returns>
    Task<FamilyCollaborationAnalyticsDTO> GetFamilyCollaborationAnalyticsAsync(int familyId);

    #endregion

    #region Admin Analytics (RESTRICTED - Admin Only)
    
    /// <summary>
    /// Get comprehensive admin analytics dashboard
    /// ADMIN ONLY - Contains sensitive platform-wide data
    /// </summary>
    /// <param name="startDate">Optional start date for analytics period</param>
    /// <param name="endDate">Optional end date for analytics period</param>
    /// <returns>Complete admin analytics dashboard</returns>
    Task<AdminAnalyticsDashboardDTO> GetAdminAnalyticsDashboardAsync(DateTime? startDate = null, DateTime? endDate = null);
    
    /// <summary>
    /// Get platform overview and growth metrics
    /// ADMIN ONLY - Contains sensitive business metrics
    /// </summary>
    /// <returns>Platform overview analytics</returns>
    Task<PlatformOverviewDTO> GetPlatformOverviewAsync();
    
    /// <summary>
    /// Get user engagement and retention analytics
    /// ADMIN ONLY - Contains user behavior data
    /// </summary>
    /// <param name="startDate">Optional start date</param>
    /// <param name="endDate">Optional end date</param>
    /// <returns>User engagement analytics</returns>
    Task<UserEngagementAnalyticsDTO> GetUserEngagementAnalyticsAsync(DateTime? startDate = null, DateTime? endDate = null);
    
    /// <summary>
    /// Get system health and performance metrics
    /// ADMIN ONLY - Contains infrastructure data
    /// </summary>
    /// <returns>System health metrics</returns>
    Task<SystemHealthMetricsDTO> GetSystemHealthMetricsAsync();
    
    /// <summary>
    /// Get revenue and subscription analytics
    /// ADMIN ONLY - Contains financial data
    /// </summary>
    /// <param name="startDate">Optional start date</param>
    /// <param name="endDate">Optional end date</param>
    /// <returns>Revenue analytics</returns>
    Task<RevenueAnalyticsDTO> GetRevenueAnalyticsAsync(DateTime? startDate = null, DateTime? endDate = null);
    
    /// <summary>
    /// Get feature usage and adoption analytics
    /// ADMIN ONLY - Contains product analytics
    /// </summary>
    /// <param name="startDate">Optional start date</param>
    /// <param name="endDate">Optional end date</param>
    /// <returns>Feature usage analytics</returns>
    Task<FeatureUsageAnalyticsDTO> GetFeatureUsageAnalyticsAsync(DateTime? startDate = null, DateTime? endDate = null);
    
    /// <summary>
    /// Get security and behavioral analytics
    /// ADMIN ONLY - Contains security-sensitive data
    /// </summary>
    /// <param name="startDate">Optional start date</param>
    /// <param name="endDate">Optional end date</param>
    /// <returns>Security analytics</returns>
    Task<SecurityAnalyticsDTO> GetSecurityAnalyticsAsync(DateTime? startDate = null, DateTime? endDate = null);
    
    /// <summary>
    /// Get platform usage analytics
    /// ADMIN ONLY - Contains platform-wide usage data
    /// </summary>
    /// <returns>Platform usage analytics</returns>
    Task<PlatformUsageAnalyticsDTO> GetPlatformUsageAnalyticsAsync();
    
    /// <summary>
    /// Get system health analytics
    /// ADMIN ONLY - Contains system health data
    /// </summary>
    /// <returns>System health analytics</returns>
    Task<SystemHealthAnalyticsDTO> GetSystemHealthAnalyticsAsync();
    
    /// <summary>
    /// Get background service analytics
    /// ADMIN ONLY - Contains background service data
    /// </summary>
    /// <returns>Background service analytics</returns>
    Task<BackgroundServiceAnalyticsDTO> GetBackgroundServiceAnalyticsAsync();
    
    /// <summary>
    /// Get marketplace analytics
    /// ADMIN ONLY - Contains marketplace data
    /// </summary>
    /// <returns>Marketplace analytics</returns>
    Task<MarketplaceAnalyticsDTO> GetMarketplaceAnalyticsAsync();

    #endregion

    #region ML Analytics & Predictions (User-Specific Data Only)
    
    /// <summary>
    /// Get ML-powered insights for a specific user
    /// Only returns data for the specified user - no cross-user data
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <returns>ML insights for the user</returns>
    Task<MLInsightsDTO> GetMLInsightsAsync(int userId);
    
    /// <summary>
    /// Get ML-powered insights for a specific user with date range
    /// Only returns data for the specified user - no cross-user data
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <param name="startDate">Start date for analysis</param>
    /// <param name="endDate">End date for analysis</param>
    /// <returns>ML insights for the user</returns>
    Task<MLInsightsDTO> GetMLInsightsAsync(int userId, DateTime? startDate, DateTime? endDate = null);
    
    /// <summary>
    /// Get behavioral analysis for a specific user
    /// Only returns the user's own behavioral patterns
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <returns>User's behavioral analysis</returns>
    Task<BehavioralAnalysisDTO> GetBehavioralAnalysisAsync(int userId);
    
    /// <summary>
    /// Get predictive analytics for a specific user
    /// Provides personalized predictions based on user's data only
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <returns>Predictive analytics for the user</returns>
    Task<PredictiveAnalyticsDTO> GetPredictiveAnalyticsAsync(int userId);

    #endregion

    #region Real-Time Analytics Processing
    
    /// <summary>
    /// Process real-time analytics update for user actions
    /// Updates analytics in real-time as users interact with the system
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <param name="actionType">Type of action performed</param>
    /// <param name="metadata">Additional action metadata</param>
    /// <returns>Success status</returns>
    Task<bool> ProcessRealTimeAnalyticsAsync(int userId, string actionType, Dictionary<string, object>? metadata = null);
    
    /// <summary>
    /// Process real-time family analytics update
    /// Updates family analytics when family members interact
    /// </summary>
    /// <param name="familyId">Family ID</param>
    /// <param name="userId">User ID who performed the action</param>
    /// <param name="actionType">Type of action performed</param>
    /// <param name="metadata">Additional action metadata</param>
    /// <returns>Success status</returns>
    Task<bool> ProcessRealTimeFamilyAnalyticsAsync(int familyId, int userId, string actionType, Dictionary<string, object>? metadata = null);

    #endregion

    #region Export & Visualization
    
    /// <summary>
    /// Export user analytics data
    /// User can export their own analytics data
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <param name="format">Export format (json, csv, pdf)</param>
    /// <param name="startDate">Optional start date</param>
    /// <param name="endDate">Optional end date</param>
    /// <returns>Export data</returns>
    Task<AnalyticsExportDTO> ExportUserAnalyticsAsync(int userId, string format = "json", DateTime? startDate = null, DateTime? endDate = null);
    
    /// <summary>
    /// Export family analytics data
    /// Family members can export family analytics data
    /// </summary>
    /// <param name="familyId">Family ID</param>
    /// <param name="format">Export format (json, csv, pdf)</param>
    /// <param name="startDate">Optional start date</param>
    /// <param name="endDate">Optional end date</param>
    /// <returns>Export data</returns>
    Task<AnalyticsExportDTO> ExportFamilyAnalyticsAsync(int familyId, string format = "json", DateTime? startDate = null, DateTime? endDate = null);
    
    /// <summary>
    /// Export admin analytics data
    /// ADMIN ONLY - Export platform-wide analytics
    /// </summary>
    /// <param name="format">Export format (json, csv, pdf)</param>
    /// <param name="startDate">Optional start date</param>
    /// <param name="endDate">Optional end date</param>
    /// <returns>Export data</returns>
    Task<AnalyticsExportDTO> ExportAdminAnalyticsAsync(string format = "json", DateTime? startDate = null, DateTime? endDate = null);
    
    /// <summary>
    /// Generate analytics visualization data
    /// Provides data formatted for charts and graphs
    /// </summary>
    /// <param name="userId">User ID (null for admin visualizations)</param>
    /// <param name="visualizationType">Type of visualization</param>
    /// <param name="parameters">Visualization parameters</param>
    /// <returns>Visualization data</returns>
    Task<AnalyticsVisualizationDTO> GenerateVisualizationDataAsync(int? userId, string visualizationType, Dictionary<string, object>? parameters = null);
    
    /// <summary>
    /// Export analytics data in specified format
    /// </summary>
    /// <param name="request">Export request details</param>
    /// <returns>Export data</returns>
    Task<AnalyticsExportDTO> ExportAnalyticsAsync(AnalyticsExportRequestDTO request);
    
    /// <summary>
    /// Get data visualization for analytics
    /// </summary>
    /// <param name="visualizationType">Type of visualization</param>
    /// <param name="parameters">Visualization parameters</param>
    /// <returns>Visualization data</returns>
    Task<DataVisualizationDTO> GetDataVisualizationAsync(string visualizationType, Dictionary<string, object>? parameters = null);

    #endregion

    #region Cache Management
    
    /// <summary>
    /// Refresh analytics cache for a user
    /// Invalidates and rebuilds user analytics cache
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <returns>Success status</returns>
    Task<bool> RefreshUserAnalyticsCacheAsync(int userId);
    
    /// <summary>
    /// Refresh analytics cache for a family
    /// Invalidates and rebuilds family analytics cache
    /// </summary>
    /// <param name="familyId">Family ID</param>
    /// <returns>Success status</returns>
    Task<bool> RefreshFamilyAnalyticsCacheAsync(int familyId);
    
    /// <summary>
    /// Refresh admin analytics cache
    /// ADMIN ONLY - Invalidates and rebuilds admin analytics cache
    /// </summary>
    /// <returns>Success status</returns>
    Task<bool> RefreshAdminAnalyticsCacheAsync();
    
    /// <summary>
    /// Refresh analytics cache
    /// </summary>
    /// <param name="cacheType">Type of cache to refresh</param>
    /// <returns>Success status</returns>
    Task<bool> RefreshAnalyticsCacheAsync(string cacheType);

    #endregion
} 