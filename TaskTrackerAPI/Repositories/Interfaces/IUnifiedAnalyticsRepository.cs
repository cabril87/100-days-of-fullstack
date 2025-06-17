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
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Models.BackgroundServices;
using TaskTrackerAPI.Models.Security;
using TaskTrackerAPI.DTOs.Analytics;

namespace TaskTrackerAPI.Repositories.Interfaces;

/// <summary>
/// Unified analytics repository interface following repository pattern
/// Consolidates data access for all analytics while respecting user/admin boundaries
/// Replaces multiple analytics repositories with a single, comprehensive interface
/// </summary>
public interface IUnifiedAnalyticsRepository
{
    #region User Analytics Data Access (Available to End Users)
    
    /// <summary>
    /// Get user's task analytics data
    /// </summary>
    Task<(int TotalTasks, int CompletedTasks, int PendingTasks, int OverdueTasks)> GetUserTaskStatsAsync(int userId, DateTime? startDate = null, DateTime? endDate = null);
    
    /// <summary>
    /// Get user's task completion trends
    /// </summary>
    Task<Dictionary<DateTime, int>> GetUserTaskCompletionTrendsAsync(int userId, DateTime startDate, DateTime endDate);
    
    /// <summary>
    /// Get user's category breakdown
    /// </summary>
    Task<Dictionary<string, int>> GetUserCategoryBreakdownAsync(int userId, DateTime? startDate = null, DateTime? endDate = null);
    
    /// <summary>
    /// Get user's priority breakdown
    /// </summary>
    Task<Dictionary<string, int>> GetUserPriorityBreakdownAsync(int userId, DateTime? startDate = null, DateTime? endDate = null);
    
    /// <summary>
    /// Get user's productivity metrics
    /// </summary>
    Task<(double ProductivityScore, double EfficiencyRating, TimeSpan AverageFocusTime, int FocusSessionsCompleted)> GetUserProductivityMetricsAsync(int userId, DateTime? startDate = null, DateTime? endDate = null);
    
    /// <summary>
    /// Get user's gamification stats
    /// </summary>
    Task<(int TotalPoints, int CurrentLevel, int CurrentStreak, int LongestStreak, int BadgesEarned, int AchievementsUnlocked)> GetUserGamificationStatsAsync(int userId);
    
    /// <summary>
    /// Get user's recent achievements
    /// </summary>
    Task<IEnumerable<RecentAchievementDTO>> GetUserRecentAchievementsAsync(int userId, int count = 5);
    
    /// <summary>
    /// Get user's points history
    /// </summary>
    Task<IEnumerable<PointTransaction>> GetUserPointsHistoryAsync(int userId, DateTime? startDate = null, DateTime? endDate = null);
    
    /// <summary>
    /// Get user's board performance data
    /// </summary>
    Task<IEnumerable<(int BoardId, string BoardName, double EfficiencyScore, double ThroughputRate, double CycleTime, int WipViolations)>> GetUserBoardPerformanceAsync(int userId, int? boardId = null);
    
    /// <summary>
    /// Get user's template usage analytics
    /// </summary>
    Task<(int TemplatesUsed, int TemplatesCreated, int TemplatesShared, double AverageSuccessRate)> GetUserTemplateUsageAsync(int userId);
    
    /// <summary>
    /// Get user's most used templates
    /// </summary>
    Task<IEnumerable<(int TemplateId, string TemplateName, int UsageCount, double SuccessRate)>> GetUserMostUsedTemplatesAsync(int userId, int count = 5);

    #endregion

    #region Family Analytics Data Access (Available to Family Members)
    
    /// <summary>
    /// Get family overview statistics
    /// </summary>
    Task<(int TotalMembers, int ActiveMembers, int TotalTasks, int CompletedTasks, double FamilyProductivityScore)> GetFamilyOverviewAsync(int familyId, DateTime? startDate = null, DateTime? endDate = null);
    
    /// <summary>
    /// Get family member analytics
    /// </summary>
    Task<IEnumerable<(int UserId, string Username, int TasksCompleted, double ProductivityScore, int PointsEarned)>> GetFamilyMemberAnalyticsAsync(int familyId, DateTime? startDate = null, DateTime? endDate = null);
    
    /// <summary>
    /// Get family collaboration metrics
    /// </summary>
    Task<(int SharedBoards, int CollaborativeTasks, double CollaborationScore)> GetFamilyCollaborationMetricsAsync(int familyId, DateTime? startDate = null, DateTime? endDate = null);
    
    /// <summary>
    /// Get family productivity trends
    /// </summary>
    Task<Dictionary<DateTime, double>> GetFamilyProductivityTrendsAsync(int familyId, DateTime startDate, DateTime endDate);

    #endregion

    #region Admin-Only Analytics Data Access (Restricted to Admins)
    
    /// <summary>
    /// Get platform overview statistics (ADMIN ONLY)
    /// </summary>
    Task<(int TotalUsers, int ActiveUsers, int TotalFamilies, int TotalTasks, int TotalBoards, double PlatformGrowthRate, double UserRetentionRate)> GetPlatformOverviewAsync(DateTime? startDate = null, DateTime? endDate = null);
    
    /// <summary>
    /// Get user engagement statistics (ADMIN ONLY)
    /// </summary>
    Task<(int DailyActiveUsers, int WeeklyActiveUsers, int MonthlyActiveUsers, double AverageSessionDuration, double BounceRate)> GetUserEngagementStatsAsync(DateTime? startDate = null, DateTime? endDate = null);
    
    /// <summary>
    /// Get system health metrics (ADMIN ONLY)
    /// </summary>
    Task<(double OverallHealthScore, int ActiveBackgroundServices, int FailedServices, double DatabasePerformance, double ApiResponseTime, double ErrorRate)> GetSystemHealthMetricsAsync();
    
    /// <summary>
    /// Get background service status (ADMIN ONLY)
    /// </summary>
    Task<IEnumerable<BackgroundServiceStatus>> GetBackgroundServiceStatusAsync();
    
    /// <summary>
    /// Get background service execution history (ADMIN ONLY)
    /// </summary>
    Task<IEnumerable<BackgroundServiceExecution>> GetBackgroundServiceExecutionHistoryAsync(string? serviceName = null, int count = 50);
    
    /// <summary>
    /// Get revenue analytics (ADMIN ONLY)
    /// </summary>
    Task<(decimal TotalRevenue, decimal MonthlyRecurringRevenue, int ActiveSubscriptions, double ChurnRate, decimal AverageRevenuePerUser)> GetRevenueAnalyticsAsync(DateTime? startDate = null, DateTime? endDate = null);
    
    /// <summary>
    /// Get feature usage statistics (ADMIN ONLY)
    /// </summary>
    Task<IEnumerable<(string FeatureName, int UsageCount, double UsagePercentage, double AdoptionRate)>> GetFeatureUsageStatsAsync(DateTime? startDate = null, DateTime? endDate = null);
    
    /// <summary>
    /// Get system performance metrics (ADMIN ONLY)
    /// </summary>
    Task<(double CpuUsage, double MemoryUsage, double DatabaseConnections, double RequestsPerSecond, double AverageResponseTime)> GetSystemPerformanceMetricsAsync();
    
    /// <summary>
    /// Get marketplace analytics (ADMIN ONLY)
    /// </summary>
    Task<(int TotalTemplates, int PublicTemplates, int TemplateDownloads, double AverageRating, int ActivePublishers)> GetMarketplaceAnalyticsAsync(DateTime? startDate = null, DateTime? endDate = null);
    
    /// <summary>
    /// Get security analytics (ADMIN ONLY)
    /// </summary>
    Task<IEnumerable<BehavioralAnalytics>> GetSecurityAnalyticsAsync(DateTime? startDate = null, DateTime? endDate = null, int count = 100);
    
    /// <summary>
    /// Get user behavior patterns (ADMIN ONLY)
    /// </summary>
    Task<IEnumerable<(string Pattern, int Count, double RiskScore)>> GetUserBehaviorPatternsAsync(DateTime? startDate = null, DateTime? endDate = null);

    #endregion

    #region ML Analytics Data Access (Available to Users for Their Own Data)
    
    /// <summary>
    /// Get user's ML insights data
    /// </summary>
    Task<(double ProductivityPrediction, double BurnoutRisk, double MotivationLevel)> GetUserMLInsightsAsync(int userId);
    
    /// <summary>
    /// Get user's behavior patterns
    /// </summary>
    Task<IEnumerable<(string Pattern, double Confidence, string Description)>> GetUserBehaviorPatternsAsync(int userId);
    
    /// <summary>
    /// Get user's optimal work times
    /// </summary>
    Task<IEnumerable<string>> GetUserOptimalWorkTimesAsync(int userId);
    
    /// <summary>
    /// Get user's focus session data for ML analysis
    /// </summary>
    Task<IEnumerable<FocusSession>> GetUserFocusSessionsForMLAsync(int userId, DateTime? startDate = null, DateTime? endDate = null);
    
    /// <summary>
    /// Get user's task completion patterns for ML analysis
    /// </summary>
    Task<Dictionary<DayOfWeek, double>> GetUserWeeklyProductivityPatternAsync(int userId);
    
    /// <summary>
    /// Get user's hourly productivity patterns for ML analysis
    /// </summary>
    Task<Dictionary<int, double>> GetUserHourlyProductivityPatternAsync(int userId);

    #endregion

    #region Cache Management
    
    /// <summary>
    /// Cache user analytics data for performance
    /// </summary>
    Task CacheUserAnalyticsAsync(int userId, object analyticsData, TimeSpan? expiration = null);
    
    /// <summary>
    /// Get cached user analytics data
    /// </summary>
    Task<T?> GetCachedUserAnalyticsAsync<T>(int userId, string cacheKey) where T : class;
    
    /// <summary>
    /// Invalidate user analytics cache
    /// </summary>
    Task InvalidateUserAnalyticsCacheAsync(int userId);
    
    /// <summary>
    /// Cache family analytics data for performance
    /// </summary>
    Task CacheFamilyAnalyticsAsync(int familyId, object analyticsData, TimeSpan? expiration = null);
    
    /// <summary>
    /// Get cached family analytics data
    /// </summary>
    Task<T?> GetCachedFamilyAnalyticsAsync<T>(int familyId, string cacheKey) where T : class;
    
    /// <summary>
    /// Invalidate family analytics cache
    /// </summary>
    Task InvalidateFamilyAnalyticsCacheAsync(int familyId);
    
    /// <summary>
    /// Refresh analytics cache for all data types
    /// </summary>
    Task RefreshCacheAsync();

    #endregion

    #region Data Export Support
    
    /// <summary>
    /// Get user's exportable analytics data
    /// </summary>
    Task<Dictionary<string, object>> GetUserExportDataAsync(int userId, DateTime? startDate = null, DateTime? endDate = null);
    
    /// <summary>
    /// Get family's exportable analytics data
    /// </summary>
    Task<Dictionary<string, object>> GetFamilyExportDataAsync(int familyId, DateTime? startDate = null, DateTime? endDate = null);
    
    /// <summary>
    /// Get admin exportable analytics data (ADMIN ONLY)
    /// </summary>
    Task<Dictionary<string, object>> GetAdminExportDataAsync(DateTime? startDate = null, DateTime? endDate = null);

    #endregion
} 