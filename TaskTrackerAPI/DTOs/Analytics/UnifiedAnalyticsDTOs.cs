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
using TaskTrackerAPI.DTOs.Boards;
using TaskTrackerAPI.DTOs.Tasks;

namespace TaskTrackerAPI.DTOs.Analytics;

/// <summary>
/// Comprehensive user analytics dashboard DTO
/// Consolidates all user-specific analytics into a single response
/// </summary>
public class UserAnalyticsDashboardDTO
{
    public int UserId { get; set; }
    public DateTime GeneratedAt { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    
    // Task Analytics
    public TaskAnalyticsSummaryDTO TaskAnalytics { get; set; } = new();
    
    // Productivity Metrics
    public ProductivityMetricsDTO ProductivityMetrics { get; set; } = new();
    
    // Gamification Stats
    public GamificationAnalyticsDTO GamificationStats { get; set; } = new();
    
    // Board Performance
    public List<BoardPerformanceDTO> BoardPerformance { get; set; } = new();
    
    // Template Usage
    public TemplateUsageAnalyticsDTO TemplateUsage { get; set; } = new();
    
    // ML Insights
    public UserMLInsightsDTO MLInsights { get; set; } = new();
}

/// <summary>
/// Family analytics dashboard DTO
/// </summary>
public class FamilyAnalyticsDashboardDTO
{
    public int FamilyId { get; set; }
    public DateTime GeneratedAt { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    
    public FamilyOverviewDTO Overview { get; set; } = new();
    public FamilyOverviewDTO FamilyOverview { get; set; } = new();
    public List<FamilyMemberAnalyticsDTO> MemberAnalytics { get; set; } = new();
    public FamilyCollaborationMetricsDTO CollaborationMetrics { get; set; } = new();
    public FamilyProductivityTrendsDTO ProductivityTrends { get; set; } = new();
    public FamilyProductivityInsightsDTO ProductivityInsights { get; set; } = new();
}

/// <summary>
/// Admin analytics dashboard DTO
/// Comprehensive platform analytics for administrators
/// </summary>
public class AdminAnalyticsDashboardDTO
{
    public DateTime GeneratedAt { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    
    // Platform Overview
    public PlatformOverviewDTO PlatformOverview { get; set; } = new();
    
    // User Engagement
    public UserEngagementSummaryDTO UserEngagement { get; set; } = new();
    
    // System Health
    public SystemHealthSummaryDTO SystemHealth { get; set; } = new();
    
    // Revenue & Subscriptions
    public RevenueAnalyticsDTO RevenueAnalytics { get; set; } = new();
    
    // Feature Usage
    public FeatureUsageAnalyticsDTO FeatureUsage { get; set; } = new();
    
    // Performance Metrics
    public SystemPerformanceDTO SystemPerformance { get; set; } = new();
    
    // Security Analytics
    public SecurityAnalyticsDTO SecurityAnalytics { get; set; } = new();
}

/// <summary>
/// Task analytics summary
/// </summary>
public class TaskAnalyticsSummaryDTO
{
    public int TotalTasks { get; set; }
    public int CompletedTasks { get; set; }
    public int PendingTasks { get; set; }
    public int OverdueTasks { get; set; }
    public double CompletionRate { get; set; }
    public double AverageCompletionTime { get; set; }
    public Dictionary<DateTime, int> CompletionTrends { get; set; } = new();
    public List<CategoryBreakdownDTO> CategoryBreakdown { get; set; } = new();
    public List<PriorityBreakdownDTO> PriorityBreakdown { get; set; } = new();
}

/// <summary>
/// Productivity metrics DTO (consolidated from AdvancedAnalyticsDTO)
/// </summary>
public class ProductivityMetricsDTO
{
    public double ProductivityScore { get; set; }
    public double EfficiencyRating { get; set; }
    public TimeSpan AverageFocusTime { get; set; }
    public int FocusSessionsCompleted { get; set; }
    public double StreakConsistency { get; set; }
    public List<ProductivityTrendDTO> DailyTrends { get; set; } = new();
    public List<ProductivityTrendDTO> WeeklyTrends { get; set; } = new();
}

/// <summary>
/// Gamification analytics DTO
/// </summary>
public class GamificationAnalyticsDTO
{
    public int TotalPoints { get; set; }
    public int CurrentLevel { get; set; }
    public int CurrentStreak { get; set; }
    public int LongestStreak { get; set; }
    public int BadgesEarned { get; set; }
    public int AchievementsUnlocked { get; set; }
    public List<RecentAchievementDTO> RecentAchievements { get; set; } = new();
    public List<PointsHistoryDTO> PointsHistory { get; set; } = new();
}

/// <summary>
/// Board performance DTO
/// </summary>
public class BoardPerformanceDTO
{
    public int BoardId { get; set; }
    public string BoardName { get; set; } = string.Empty;
    public double EfficiencyScore { get; set; }
    public double ThroughputRate { get; set; }
    public double CycleTime { get; set; }
    public int WipViolations { get; set; }
    public List<ColumnPerformanceDTO> ColumnPerformance { get; set; } = new();
}

/// <summary>
/// Template usage analytics summary DTO
/// </summary>
public class TemplateUsageAnalyticsDTO
{
    public int TemplatesUsed { get; set; }
    public int TemplatesCreated { get; set; }
    public int TemplatesShared { get; set; }
    public double AverageSuccessRate { get; set; }
    public List<PopularTemplateDTO> MostUsedTemplates { get; set; } = new();
    public List<TemplatePerformanceDTO> TemplatePerformance { get; set; } = new();
}

/// <summary>
/// Individual template usage record DTO
/// </summary>
public class TemplateUsageRecordDTO
{
    public int Id { get; set; }
    public int TemplateId { get; set; }
    public int UserId { get; set; }
    public DateTime UsedAt { get; set; }
    public bool Success { get; set; }
    public int CompletionTimeMinutes { get; set; }
}

/// <summary>
/// User ML insights DTO
/// </summary>
public class UserMLInsightsDTO
{
    public double ProductivityPrediction { get; set; }
    public List<string> OptimalWorkTimes { get; set; } = new();
    public List<string> PersonalizedRecommendations { get; set; } = new();
    public double BurnoutRisk { get; set; }
    public double MotivationLevel { get; set; }
    public List<BehaviorPatternDTO> BehaviorPatterns { get; set; } = new();
    public string OptimalWorkPattern { get; set; } = string.Empty;
    public string RecommendedBreakFrequency { get; set; } = string.Empty;
    public List<string> PredictedPeakPerformanceTimes { get; set; } = new();
}

/// <summary>
/// Platform overview DTO for admin dashboard
/// </summary>
public class PlatformOverviewDTO
{
    public int TotalUsers { get; set; }
    public int ActiveUsers { get; set; }
    public int TotalFamilies { get; set; }
    public int TotalTasks { get; set; }
    public int TotalBoards { get; set; }
    public double PlatformGrowthRate { get; set; }
    public double UserRetentionRate { get; set; }
}

/// <summary>
/// System health summary DTO
/// </summary>
public class SystemHealthSummaryDTO
{
    public double OverallHealthScore { get; set; }
    public int ActiveBackgroundServices { get; set; }
    public int FailedServices { get; set; }
    public double DatabasePerformance { get; set; }
    public double ApiResponseTime { get; set; }
    public double ErrorRate { get; set; }
    public List<ServiceHealthDTO> ServiceHealth { get; set; } = new();
}

/// <summary>
/// Revenue analytics DTO
/// </summary>
public class RevenueAnalyticsDTO
{
    public decimal TotalRevenue { get; set; }
    public decimal MonthlyRecurringRevenue { get; set; }
    public int ActiveSubscriptions { get; set; }
    public double ChurnRate { get; set; }
    public decimal AverageRevenuePerUser { get; set; }
    public List<RevenueBreakdownDTO> RevenueBreakdown { get; set; } = new();
}

/// <summary>
/// Feature usage analytics DTO
/// </summary>
public class FeatureUsageAnalyticsDTO
{
    public List<FeatureUsageDTO> MostUsedFeatures { get; set; } = new();
    public List<FeatureUsageDTO> LeastUsedFeatures { get; set; } = new();
    public List<FeatureAdoptionDTO> FeatureAdoption { get; set; } = new();
    public double OverallFeatureUtilization { get; set; }
}

/// <summary>
/// System performance DTO
/// </summary>
public class SystemPerformanceDTO
{
    public double CpuUsage { get; set; }
    public double MemoryUsage { get; set; }
    public double DatabaseConnections { get; set; }
    public double RequestsPerSecond { get; set; }
    public double AverageResponseTime { get; set; }
    public List<PerformanceMetricDTO> PerformanceHistory { get; set; } = new();
}

// Supporting DTOs
public class CategoryBreakdownDTO
{
    public string Category { get; set; } = string.Empty;
    public int Count { get; set; }
    public double Percentage { get; set; }
}

public class PriorityBreakdownDTO
{
    public string Priority { get; set; } = string.Empty;
    public int Count { get; set; }
    public double Percentage { get; set; }
}

public class ProductivityTrendDTO
{
    public DateTime Date { get; set; }
    public double Score { get; set; }
    public int TasksCompleted { get; set; }
    public TimeSpan TimeSpent { get; set; }
}

public class RecentAchievementDTO
{
    public string Name { get; set; } = string.Empty;
    public DateTime EarnedAt { get; set; }
    public int Points { get; set; }
}

public class PointsHistoryDTO
{
    public DateTime Date { get; set; }
    public int Points { get; set; }
    public string Reason { get; set; } = string.Empty;
}

public class ColumnPerformanceDTO
{
    public int ColumnId { get; set; }
    public string ColumnName { get; set; } = string.Empty;
    public double Throughput { get; set; }
    public double AverageTime { get; set; }
    public int TaskCount { get; set; }
}

public class PopularTemplateDTO
{
    public int TemplateId { get; set; }
    public string TemplateName { get; set; } = string.Empty;
    public int UsageCount { get; set; }
    public double SuccessRate { get; set; }
}

public class TemplatePerformanceDTO
{
    public int TemplateId { get; set; }
    public string TemplateName { get; set; } = string.Empty;
    public double SuccessRate { get; set; }
    public double AverageCompletionTime { get; set; }
    public int TimesUsed { get; set; }
}

public class BehaviorPatternDTO
{
    public string Pattern { get; set; } = string.Empty;
    public double Confidence { get; set; }
    public string Description { get; set; } = string.Empty;
}

public class ServiceHealthDTO
{
    public string ServiceName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public double HealthScore { get; set; }
    public DateTime LastCheck { get; set; }
}

public class RevenueBreakdownDTO
{
    public string Category { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public double Percentage { get; set; }
}

public class FeatureUsageDTO
{
    public string FeatureName { get; set; } = string.Empty;
    public int UsageCount { get; set; }
    public double UsagePercentage { get; set; }
}

public class FeatureAdoptionDTO
{
    public string FeatureName { get; set; } = string.Empty;
    public double AdoptionRate { get; set; }
    public DateTime LaunchDate { get; set; }
}

public class PerformanceMetricDTO
{
    public DateTime Timestamp { get; set; }
    public string MetricName { get; set; } = string.Empty;
    public double Value { get; set; }
}

/// <summary>
/// Missing DTOs for family analytics dashboard
/// </summary>
public class FamilyOverviewDTO
{
    public int TotalMembers { get; set; }
    public int ActiveMembers { get; set; }
    public int TotalTasks { get; set; }
    public int CompletedTasks { get; set; }
    public double FamilyProductivityScore { get; set; }
    public Dictionary<string, double> ProductivityTrends { get; set; } = new();
}

/// <summary>
/// Family member analytics
/// </summary>
public class FamilyMemberAnalyticsDTO
{
    public int UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public int TasksCompleted { get; set; }
    public double ProductivityScore { get; set; }
    public int PointsEarned { get; set; }
    public string Trend { get; set; } = string.Empty; // "up", "down", "stable"
}

/// <summary>
/// Family collaboration metrics
/// </summary>
public class FamilyCollaborationMetricsDTO
{
    public int SharedBoards { get; set; }
    public int CollaborativeTasks { get; set; }
    public double CollaborationScore { get; set; }
    public List<CollaborationMetric> Metrics { get; set; } = new();
}

/// <summary>
/// Collaboration metric
/// </summary>
public class CollaborationMetric
{
    public string MetricName { get; set; } = string.Empty;
    public double Value { get; set; }
    public string Description { get; set; } = string.Empty;
    public string Trend { get; set; } = string.Empty; // "up", "down", "stable"
}

/// <summary>
/// Family productivity trends
/// </summary>
public class FamilyProductivityTrendsDTO
{
    public Dictionary<DateTime, double> DailyTrends { get; set; } = new();
    public Dictionary<DateTime, double> WeeklyTrends { get; set; } = new();
    public Dictionary<DateTime, double> MonthlyTrends { get; set; } = new();
    public List<ProductivityTrendDTO> TrendAnalysis { get; set; } = new();
}

/// <summary>
/// User engagement summary for admin dashboard
/// </summary>
public class UserEngagementSummaryDTO
{
    public int DailyActiveUsers { get; set; }
    public int WeeklyActiveUsers { get; set; }
    public int MonthlyActiveUsers { get; set; }
    public double AverageSessionDuration { get; set; }
    public double BounceRate { get; set; }
    public List<EngagementTrendDTO> EngagementTrends { get; set; } = new();
}

/// <summary>
/// Engagement trend DTO
/// </summary>
public class EngagementTrendDTO
{
    public DateTime Date { get; set; }
    public int ActiveUsers { get; set; }
    public double SessionDuration { get; set; }
    public double EngagementScore { get; set; }
}

/// <summary>
/// Missing DTOs for service interface compatibility
/// </summary>
public class UserProductivityInsightsDTO
{
    public double ProductivityScore { get; set; }
    public double EfficiencyRating { get; set; }
    public TimeSpan AverageFocusTime { get; set; }
    public int FocusSessionsCompleted { get; set; }
    public List<string> ProductivityTips { get; set; } = new();
    public List<string> OptimalWorkTimes { get; set; } = new();
    public Dictionary<string, double> ProductivityTrends { get; set; } = new();
    public List<string> Recommendations { get; set; } = new();
    public FocusTimeAnalysisDTO FocusTimeAnalysis { get; set; } = new();
}

/// <summary>
/// Focus time analysis DTO
/// </summary>
public class FocusTimeAnalysisDTO
{
    public TimeSpan AverageFocusTime { get; set; }
    public int TotalFocusSessionsCompleted { get; set; }
    public double FocusEfficiencyScore { get; set; }
    public Dictionary<int, TimeSpan> FocusTimeByHour { get; set; } = new();
    public List<string> FocusInsights { get; set; } = new();
}

public class UserBoardAnalyticsDTO
{
    public int UserId { get; set; }
    public int? BoardId { get; set; }
    public string? BoardName { get; set; }
    public double EfficiencyScore { get; set; }
    public double ThroughputRate { get; set; }
    public double CycleTime { get; set; }
    public int WipViolations { get; set; }
    public Dictionary<string, int> TasksByStatus { get; set; } = new();
    public List<BoardPerformanceMetric> PerformanceMetrics { get; set; } = new();
    public List<BoardPerformanceDTO> BoardPerformance { get; set; } = new();
    public double OverallEfficiencyScore { get; set; }
    public double AverageCycleTime { get; set; }
    public int TotalBoardsManaged { get; set; }
}

public class BoardPerformanceMetric
{
    public string MetricName { get; set; } = string.Empty;
    public double Value { get; set; }
    public string Unit { get; set; } = string.Empty;
    public string Trend { get; set; } = string.Empty; // "up", "down", "stable"
}

public class FamilyProductivityInsightsDTO
{
    public double FamilyProductivityScore { get; set; }
    public List<FamilyMemberProductivity> MemberProductivity { get; set; } = new();
    public Dictionary<string, double> ProductivityTrends { get; set; } = new();
    public List<string> CollaborationInsights { get; set; } = new();
    public List<string> FamilyRecommendations { get; set; } = new();
}

public class FamilyMemberProductivity
{
    public int UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public double ProductivityScore { get; set; }
    public int TasksCompleted { get; set; }
    public int PointsEarned { get; set; }
    public string Trend { get; set; } = string.Empty; // "up", "down", "stable"
}

public class FamilyCollaborationAnalyticsDTO
{
    public int SharedBoards { get; set; }
    public int CollaborativeTasks { get; set; }
    public double CollaborationScore { get; set; }
    public List<CollaborationMetric> CollaborationMetrics { get; set; } = new();
    public Dictionary<string, int> ActivityByMember { get; set; } = new();
    public List<string> CollaborationTips { get; set; } = new();
}

public class UserEngagementAnalyticsDTO
{
    public int DailyActiveUsers { get; set; }
    public int WeeklyActiveUsers { get; set; }
    public int MonthlyActiveUsers { get; set; }
    public double AverageSessionDuration { get; set; }
    public double BounceRate { get; set; }
    public Dictionary<string, double> EngagementTrends { get; set; } = new();
    public List<EngagementMetric> EngagementMetrics { get; set; } = new();
}

public class EngagementMetric
{
    public string MetricName { get; set; } = string.Empty;
    public double Value { get; set; }
    public string Unit { get; set; } = string.Empty;
    public string Trend { get; set; } = string.Empty; // "up", "down", "stable"
}

public class SystemHealthMetricsDTO
{
    public double OverallHealthScore { get; set; }
    public int ActiveBackgroundServices { get; set; }
    public int FailedServices { get; set; }
    public double DatabasePerformance { get; set; }
    public double ApiResponseTime { get; set; }
    public double ErrorRate { get; set; }
    public double CpuUsage { get; set; }
    public double MemoryUsage { get; set; }
    public double DatabaseConnections { get; set; }
    public double RequestsPerSecond { get; set; }
    public List<ServiceHealthStatus> ServiceStatuses { get; set; } = new();
}

public class ServiceHealthStatus
{
    public string ServiceName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty; // "healthy", "degraded", "unhealthy"
    public double ResponseTime { get; set; }
    public DateTime LastCheck { get; set; }
    public string? ErrorMessage { get; set; }
}

public class SecurityAnalyticsDTO
{
    public int TotalSecurityEvents { get; set; }
    public int HighRiskEvents { get; set; }
    public int AnomalousActivities { get; set; }
    public double AverageAnomalyScore { get; set; }
    public List<SecurityEvent> RecentSecurityEvents { get; set; } = new();
    public List<BehaviorPatternSummary> BehaviorPatterns { get; set; } = new();
    public Dictionary<string, int> ThreatsByType { get; set; } = new();
}

public class SecurityEvent
{
    public DateTime Timestamp { get; set; }
    public string EventType { get; set; } = string.Empty;
    public string RiskLevel { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? UserId { get; set; }
    public string? IpAddress { get; set; }
}

public class BehaviorPatternSummary
{
    public string Pattern { get; set; } = string.Empty;
    public int Count { get; set; }
    public double RiskScore { get; set; }
    public string Description { get; set; } = string.Empty;
}

public class MLInsightsDTO
{
    public double ProductivityPrediction { get; set; }
    public double BurnoutRisk { get; set; }
    public double MotivationLevel { get; set; }
    public List<MLRecommendation> Recommendations { get; set; } = new();
    public Dictionary<string, double> PredictiveMetrics { get; set; } = new();
    public List<string> OptimalWorkTimes { get; set; } = new();
}

public class MLRecommendation
{
    public string Type { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public double Confidence { get; set; }
    public string Priority { get; set; } = string.Empty; // "high", "medium", "low"
}

public class BehaviorPattern
{
    public string Pattern { get; set; } = string.Empty;
    public double Confidence { get; set; }
    public string Description { get; set; } = string.Empty;
    public string Impact { get; set; } = string.Empty; // "positive", "negative", "neutral"
}

public class BehavioralAnalysisDTO
{
    public List<BehaviorPattern> BehaviorPatterns { get; set; } = new();
    public double ProductivityScore { get; set; }
    public Dictionary<string, double> ActivityPatterns { get; set; } = new();
    public List<string> BehaviorInsights { get; set; } = new();
    public DateTime LastAnalyzed { get; set; }
}

public class PredictiveAnalyticsDTO
{
    public double TaskCompletionProbability { get; set; }
    public double ProductivityForecast { get; set; }
    public double BurnoutRisk { get; set; }
    public List<PredictiveInsight> Predictions { get; set; } = new();
    public Dictionary<string, double> RiskFactors { get; set; } = new();
}

public class PredictiveInsight
{
    public string Type { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public double Confidence { get; set; }
    public DateTime PredictedDate { get; set; }
    public string Impact { get; set; } = string.Empty; // "positive", "negative", "neutral"
}

public class AnalyticsExportDTO
{
    public string Format { get; set; } = string.Empty;
    public byte[] Data { get; set; } = Array.Empty<byte>();
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public DateTime GeneratedAt { get; set; }
}

public class AnalyticsVisualizationDTO
{
    public string VisualizationType { get; set; } = string.Empty;
    public Dictionary<string, object> ChartData { get; set; } = new();
    public List<string> Labels { get; set; } = new();
    public List<DataSeries> DataSeries { get; set; } = new();
    public Dictionary<string, object> Configuration { get; set; } = new();
}

public class DataSeries
{
    public string Name { get; set; } = string.Empty;
    public List<double> Data { get; set; } = new();
    public string Color { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // "line", "bar", "pie", etc.
}

/// <summary>
/// Additional DTOs for controller compatibility
/// </summary>
public class PersonalizedRecommendationsDTO
{
    public List<MLRecommendation> Recommendations { get; set; } = new();
    public List<string> ProductivityTips { get; set; } = new();
    public List<string> OptimalWorkTimes { get; set; } = new();
    public double ConfidenceScore { get; set; }
    public List<string> TaskRecommendations { get; set; } = new();
    public List<string> FeatureSuggestions { get; set; } = new();
    public List<string> OptimizationOpportunities { get; set; } = new();
}

public class PlatformUsageAnalyticsDTO
{
    public int TotalUsers { get; set; }
    public int ActiveUsers { get; set; }
    public Dictionary<string, int> FeatureUsage { get; set; } = new();
    public Dictionary<string, double> UsageTrends { get; set; } = new();
    public List<PopularFeatureDTO> PopularFeatures { get; set; } = new();
}

public class PopularFeatureDTO
{
    public string FeatureName { get; set; } = string.Empty;
    public int UsageCount { get; set; }
    public double GrowthRate { get; set; }
}

public class SystemHealthAnalyticsDTO
{
    public double OverallHealthScore { get; set; }
    public List<ServiceHealthStatus> Services { get; set; } = new();
    public Dictionary<string, double> PerformanceMetrics { get; set; } = new();
    public List<string> HealthAlerts { get; set; } = new();
}

public class BackgroundServiceAnalyticsDTO
{
    public int TotalServices { get; set; }
    public int ActiveServices { get; set; }
    public int FailedServices { get; set; }
    public List<ServiceExecutionDTO> RecentExecutions { get; set; } = new();
    public Dictionary<string, double> ServicePerformance { get; set; } = new();
}

public class ServiceExecutionDTO
{
    public string ServiceName { get; set; } = string.Empty;
    public DateTime ExecutionTime { get; set; }
    public bool Success { get; set; }
    public TimeSpan Duration { get; set; }
    public string? ErrorMessage { get; set; }
}

public class MarketplaceAnalyticsDTO
{
    public int TotalTemplates { get; set; }
    public int PublicTemplates { get; set; }
    public int TemplateDownloads { get; set; }
    public double AverageRating { get; set; }
    public int ActivePublishers { get; set; }
    public List<PopularTemplateDTO> PopularTemplates { get; set; } = new();
    public Dictionary<string, int> CategoryBreakdown { get; set; } = new();
}

public class AnalyticsExportRequestDTO
{
    public string ExportType { get; set; } = string.Empty; // "user", "family", "admin"
    public string Format { get; set; } = "json"; // "json", "csv", "pdf"
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public List<string> IncludedSections { get; set; } = new();
    public Dictionary<string, object> Parameters { get; set; } = new();
}

public class DataVisualizationDTO
{
    public string VisualizationType { get; set; } = string.Empty;
    public Dictionary<string, object> Data { get; set; } = new();
    public Dictionary<string, object> Configuration { get; set; } = new();
    public List<string> SupportedFormats { get; set; } = new();
}

/// <summary>
/// Additional missing DTOs
/// </summary>
public class TemplateMarketplaceAnalyticsDTO
{
    public int TotalTemplates { get; set; }
    public int PublicTemplates { get; set; }
    public int PrivateTemplates { get; set; }
    public int TotalDownloads { get; set; }
    public int TotalUsages { get; set; }
    public double AverageRating { get; set; }
    public List<PopularTemplateDTO> PopularTemplates { get; set; } = new();
    public List<TemplateStatisticsDTO> TopTemplates { get; set; } = new();
    public Dictionary<string, int> CategoryBreakdown { get; set; } = new();
    public Dictionary<string, int> TemplatesByCategory { get; set; } = new();
    public List<TopPublisherDTO> TopPublishers { get; set; } = new();
}

public class TopPublisherDTO
{
    public int UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public int TemplatesPublished { get; set; }
    public int TotalDownloads { get; set; }
    public double AverageRating { get; set; }
}

public class BehavioralAnalyticsSummaryDTO
{
    public int TotalEvents { get; set; }
    public int AnomalousEvents { get; set; }
    public int HighRiskEvents { get; set; }
    public double AverageAnomalyScore { get; set; }
    public List<SecurityEvent> RecentEvents { get; set; } = new();
    public Dictionary<string, int> EventsByType { get; set; } = new();
}

public class ProductivityAnalyticsDTO
{
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public double ProductivityScore { get; set; }
    public double EfficiencyRating { get; set; }
    public int TasksCompleted { get; set; }
    public TimeSpan TotalTimeSpent { get; set; }
    public double AverageTaskTime { get; set; }
    public double AverageCompletionTime { get; set; }
    public List<CategoryBreakdownDTO> CategoryBreakdown { get; set; } = new();
    public Dictionary<DateTime, double> ProductivityTrends { get; set; } = new();
    public Dictionary<int, int> HourlyDistribution { get; set; } = new();
    public Dictionary<DayOfWeek, int> DayOfWeekDistribution { get; set; } = new();
    public Dictionary<DateTime, int> DailyCompletions { get; set; } = new();
    public Dictionary<DateTime, double> CompletionRateTrend { get; set; } = new();
    public DateValuePair? BestDay { get; set; }
    public ProductivitySummaryDTO? Summary { get; set; }
}

public class ProductivitySummaryDTO
{
    public string PrimaryInsight { get; set; } = string.Empty;
    public List<string> Suggestions { get; set; } = new();
}

public class CategoryActivityDTO
{
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public int TaskCount { get; set; }
    public int CompletedTasks { get; set; }
    public double CompletionRate { get; set; }
    public double Percentage { get; set; }
    public TimeSpan AverageCompletionTime { get; set; }
    public double ActivityScore { get; set; }
} 