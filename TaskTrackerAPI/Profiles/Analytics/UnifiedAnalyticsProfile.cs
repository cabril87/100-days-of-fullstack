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
using AutoMapper;
using TaskTrackerAPI.DTOs.Analytics;
using TaskTrackerAPI.DTOs.BackgroundServices;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Models.BackgroundServices;
using TaskTrackerAPI.Models.Security;
using TaskTrackerAPI.Models.Gamification;
using System;

namespace TaskTrackerAPI.Profiles.Analytics;

/// <summary>
/// AutoMapper profile for unified analytics mapping
/// Maps Models to DTOs following clean architecture principles
/// Ensures proper separation between database models and API DTOs
/// Comprehensive mapping for all UnifiedAnalyticsRepository operations
/// </summary>
public class UnifiedAnalyticsProfile : Profile
{
    public UnifiedAnalyticsProfile()
    {
        // Task Item mappings for analytics
        CreateMap<TaskItem, TaskAnalyticsSummaryDTO>()
            .ForMember(dest => dest.TotalTasks, opt => opt.Ignore())
            .ForMember(dest => dest.CompletedTasks, opt => opt.Ignore())
            .ForMember(dest => dest.PendingTasks, opt => opt.Ignore())
            .ForMember(dest => dest.OverdueTasks, opt => opt.Ignore())
            .ForMember(dest => dest.CompletionRate, opt => opt.Ignore())
            .ForMember(dest => dest.AverageCompletionTime, opt => opt.Ignore())
            .ForMember(dest => dest.CategoryBreakdown, opt => opt.Ignore())
            .ForMember(dest => dest.PriorityBreakdown, opt => opt.Ignore());

        // User mappings for analytics
        CreateMap<User, FamilyMemberAnalyticsDTO>()
            .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.Id))
            .ForMember(dest => dest.Username, opt => opt.MapFrom(src => src.Username))
            .ForMember(dest => dest.TasksCompleted, opt => opt.Ignore())
            .ForMember(dest => dest.ProductivityScore, opt => opt.Ignore())
            .ForMember(dest => dest.PointsEarned, opt => opt.Ignore())
            .ForMember(dest => dest.Trend, opt => opt.Ignore());

        CreateMap<User, FamilyMemberProductivity>()
            .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.Id))
            .ForMember(dest => dest.Username, opt => opt.MapFrom(src => src.Username))
            .ForMember(dest => dest.ProductivityScore, opt => opt.Ignore())
            .ForMember(dest => dest.TasksCompleted, opt => opt.Ignore())
            .ForMember(dest => dest.PointsEarned, opt => opt.Ignore())
            .ForMember(dest => dest.Trend, opt => opt.Ignore());

        // Family mappings for analytics
        CreateMap<Family, FamilyOverviewDTO>()
            .ForMember(dest => dest.TotalMembers, opt => opt.Ignore())
            .ForMember(dest => dest.ActiveMembers, opt => opt.Ignore())
            .ForMember(dest => dest.TotalTasks, opt => opt.Ignore())
            .ForMember(dest => dest.CompletedTasks, opt => opt.Ignore())
            .ForMember(dest => dest.FamilyProductivityScore, opt => opt.Ignore())
            .ForMember(dest => dest.ProductivityTrends, opt => opt.Ignore());

        // Board mappings for analytics
        CreateMap<Board, BoardPerformanceDTO>()
            .ForMember(dest => dest.BoardId, opt => opt.MapFrom(src => src.Id))
            .ForMember(dest => dest.BoardName, opt => opt.MapFrom(src => src.Name))
            .ForMember(dest => dest.EfficiencyScore, opt => opt.Ignore())
            .ForMember(dest => dest.ThroughputRate, opt => opt.Ignore())
            .ForMember(dest => dest.CycleTime, opt => opt.Ignore())
            .ForMember(dest => dest.WipViolations, opt => opt.Ignore())
            .ForMember(dest => dest.ColumnPerformance, opt => opt.Ignore());

        // Badge mappings for analytics
        CreateMap<Badge, RecentAchievementDTO>()
            .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name))
            .ForMember(dest => dest.EarnedAt, opt => opt.Ignore())
            .ForMember(dest => dest.Points, opt => opt.MapFrom(src => src.PointValue));

        // UserProgress mappings for analytics
        CreateMap<UserProgress, GamificationAnalyticsDTO>()
            .ForMember(dest => dest.TotalPoints, opt => opt.MapFrom(src => src.CurrentPoints))
            .ForMember(dest => dest.CurrentLevel, opt => opt.MapFrom(src => src.Level))
            .ForMember(dest => dest.CurrentStreak, opt => opt.MapFrom(src => src.CurrentStreak))
            .ForMember(dest => dest.LongestStreak, opt => opt.MapFrom(src => src.LongestStreak))
            .ForMember(dest => dest.BadgesEarned, opt => opt.Ignore())
            .ForMember(dest => dest.AchievementsUnlocked, opt => opt.Ignore())
            .ForMember(dest => dest.RecentAchievements, opt => opt.Ignore())
            .ForMember(dest => dest.PointsHistory, opt => opt.Ignore());

        // Category mappings for analytics
        CreateMap<Category, CategoryBreakdownDTO>()
            .ForMember(dest => dest.Category, opt => opt.MapFrom(src => src.Name))
            .ForMember(dest => dest.Count, opt => opt.Ignore())
            .ForMember(dest => dest.Percentage, opt => opt.Ignore());

        CreateMap<Category, CategoryActivityDTO>()
            .ForMember(dest => dest.CategoryId, opt => opt.MapFrom(src => src.Id))
            .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Name))
            .ForMember(dest => dest.TaskCount, opt => opt.Ignore())
            .ForMember(dest => dest.CompletedTasks, opt => opt.Ignore())
            .ForMember(dest => dest.CompletionRate, opt => opt.Ignore())
            .ForMember(dest => dest.Percentage, opt => opt.Ignore())
            .ForMember(dest => dest.AverageCompletionTime, opt => opt.Ignore())
            .ForMember(dest => dest.ActivityScore, opt => opt.Ignore());

        // PointTransaction mappings for analytics
        CreateMap<PointTransaction, PointsHistoryDTO>()
            .ForMember(dest => dest.Date, opt => opt.MapFrom(src => src.CreatedAt))
            .ForMember(dest => dest.Points, opt => opt.MapFrom(src => src.Points))
            .ForMember(dest => dest.Reason, opt => opt.MapFrom(src => src.Description));

        // Board Column mappings for analytics (using BoardColumn model)
        CreateMap<BoardColumn, ColumnPerformanceDTO>()
            .ForMember(dest => dest.ColumnId, opt => opt.MapFrom(src => src.Id))
            .ForMember(dest => dest.ColumnName, opt => opt.MapFrom(src => src.Name))
            .ForMember(dest => dest.Throughput, opt => opt.Ignore())
            .ForMember(dest => dest.AverageTime, opt => opt.Ignore())
            .ForMember(dest => dest.TaskCount, opt => opt.Ignore());

        // Template mappings for analytics
        CreateMap<TaskTemplate, PopularTemplateDTO>()
            .ForMember(dest => dest.TemplateId, opt => opt.MapFrom(src => src.Id))
            .ForMember(dest => dest.TemplateName, opt => opt.MapFrom(src => src.Name))
            .ForMember(dest => dest.UsageCount, opt => opt.Ignore())
            .ForMember(dest => dest.SuccessRate, opt => opt.Ignore());

        CreateMap<TaskTemplate, TemplatePerformanceDTO>()
            .ForMember(dest => dest.TemplateId, opt => opt.MapFrom(src => src.Id))
            .ForMember(dest => dest.TemplateName, opt => opt.MapFrom(src => src.Name))
            .ForMember(dest => dest.SuccessRate, opt => opt.Ignore())
            .ForMember(dest => dest.AverageCompletionTime, opt => opt.Ignore())
            .ForMember(dest => dest.TimesUsed, opt => opt.Ignore());

        // FocusSession mappings for analytics
        CreateMap<FocusSession, ProductivityTrendDTO>()
            .ForMember(dest => dest.Date, opt => opt.MapFrom(src => src.StartTime.Date))
            .ForMember(dest => dest.Score, opt => opt.Ignore())
            .ForMember(dest => dest.TasksCompleted, opt => opt.Ignore())
            .ForMember(dest => dest.TimeSpent, opt => opt.MapFrom(src => 
                src.EndTime.HasValue ? src.EndTime.Value - src.StartTime : TimeSpan.Zero));

        // Achievement mappings for analytics
        CreateMap<Achievement, RecentAchievementDTO>()
            .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name))
            .ForMember(dest => dest.EarnedAt, opt => opt.Ignore())
            .ForMember(dest => dest.Points, opt => opt.MapFrom(src => src.PointValue));

        // UserAchievement mappings for analytics
        CreateMap<UserAchievement, RecentAchievementDTO>()
            .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Achievement != null ? src.Achievement.Name : "Unknown Achievement"))
            .ForMember(dest => dest.EarnedAt, opt => opt.MapFrom(src => src.CompletedAt ?? DateTime.UtcNow))
            .ForMember(dest => dest.Points, opt => opt.MapFrom(src => src.Achievement != null ? src.Achievement.PointValue : 0));

        // UserBadge mappings for analytics
        CreateMap<UserBadge, RecentAchievementDTO>()
            .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Badge != null ? src.Badge.Name : "Unknown Badge"))
            .ForMember(dest => dest.EarnedAt, opt => opt.MapFrom(src => src.AwardedAt))
            .ForMember(dest => dest.Points, opt => opt.MapFrom(src => src.Badge != null ? src.Badge.PointValue : 0));

        // Background Service Status mappings for analytics
        CreateMap<BackgroundServiceStatus, ServiceHealthStatus>()
            .ForMember(dest => dest.ServiceName, opt => opt.MapFrom(src => src.ServiceName))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status))
            .ForMember(dest => dest.ResponseTime, opt => opt.Ignore())
            .ForMember(dest => dest.LastCheck, opt => opt.MapFrom(src => src.UpdatedAt))
            .ForMember(dest => dest.ErrorMessage, opt => opt.MapFrom(src => src.Message));

        // BackgroundServiceStatus to BackgroundServiceStatusDTO mapping
        CreateMap<BackgroundServiceStatus, BackgroundServiceStatusDTO>()
            .ForMember(dest => dest.ServiceName, opt => opt.MapFrom(src => src.ServiceName))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status))
            .ForMember(dest => dest.Message, opt => opt.MapFrom(src => src.Message))
            .ForMember(dest => dest.LastRun, opt => opt.MapFrom(src => src.LastRun))
            .ForMember(dest => dest.NextRun, opt => opt.MapFrom(src => src.NextRun))
            .ForMember(dest => dest.IsHealthy, opt => opt.MapFrom(src => src.IsHealthy))
            .ForMember(dest => dest.ExecutionCount, opt => opt.MapFrom(src => src.ExecutionCount))
            .ForMember(dest => dest.SuccessCount, opt => opt.MapFrom(src => src.SuccessCount))
            .ForMember(dest => dest.ErrorCount, opt => opt.MapFrom(src => src.ErrorCount))
            .ForMember(dest => dest.SuccessRate, opt => opt.MapFrom(src => (double)src.SuccessRate))
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedAt))
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => src.UpdatedAt));

        // BackgroundServiceExecution to BackgroundServiceExecutionDTO mapping
        CreateMap<BackgroundServiceExecution, BackgroundServiceExecutionDTO>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
            .ForMember(dest => dest.ServiceName, opt => opt.MapFrom(src => src.ServiceName))
            .ForMember(dest => dest.ExecutionTime, opt => opt.MapFrom(src => src.ExecutionTime))
            .ForMember(dest => dest.Success, opt => opt.MapFrom(src => src.Success))
            .ForMember(dest => dest.Details, opt => opt.MapFrom(src => src.Details))
            .ForMember(dest => dest.RecordsProcessed, opt => opt.MapFrom(src => src.RecordsProcessed))
            .ForMember(dest => dest.Duration, opt => opt.MapFrom(src => src.Duration))
            .ForMember(dest => dest.ErrorMessage, opt => opt.MapFrom(src => src.ErrorMessage));

        // BehavioralAnalytics mappings for security analytics
        CreateMap<BehavioralAnalytics, SecurityEvent>()
            .ForMember(dest => dest.Timestamp, opt => opt.MapFrom(src => src.Timestamp))
            .ForMember(dest => dest.EventType, opt => opt.MapFrom(src => src.ActionType))
            .ForMember(dest => dest.RiskLevel, opt => opt.MapFrom(src => src.RiskLevel))
            .ForMember(dest => dest.Description, opt => opt.MapFrom(src => src.AnomalyReason))
            .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.UserId.ToString()))
            .ForMember(dest => dest.IpAddress, opt => opt.MapFrom(src => src.IPAddress));

        // AuditLog mappings for security analytics (alternative mapping)
        CreateMap<AuditLog, SecurityEvent>()
            .ForMember(dest => dest.Timestamp, opt => opt.MapFrom(src => src.Timestamp))
            .ForMember(dest => dest.EventType, opt => opt.MapFrom(src => src.Action))
            .ForMember(dest => dest.RiskLevel, opt => opt.Ignore())
            .ForMember(dest => dest.Description, opt => opt.MapFrom(src => src.Details))
            .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.UserId.ToString()))
            .ForMember(dest => dest.IpAddress, opt => opt.Ignore());

        // UserSubscription mappings for revenue analytics (using existing RevenueBreakdownDTO)
        CreateMap<UserSubscription, RevenueBreakdownDTO>()
            .ForMember(dest => dest.Category, opt => opt.MapFrom(src => src.SubscriptionTier.Name))
            .ForMember(dest => dest.Amount, opt => opt.MapFrom(src => src.MonthlyPrice))
            .ForMember(dest => dest.Percentage, opt => opt.Ignore());
            
        // UserSubscription to SubscriptionAnalyticsDTO mapping
        CreateMap<UserSubscription, SubscriptionAnalyticsDTO>()
            .ForMember(dest => dest.TierName, opt => opt.MapFrom(src => src.SubscriptionTier.Name))
            .ForMember(dest => dest.StartDate, opt => opt.MapFrom(src => src.StartDate))
            .ForMember(dest => dest.EndDate, opt => opt.MapFrom(src => src.EndDate))
            .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => src.IsActive))
            .ForMember(dest => dest.MonthlyPrice, opt => opt.MapFrom(src => src.MonthlyPrice))
            .ForMember(dest => dest.Currency, opt => opt.MapFrom(src => src.Currency))
            .ForMember(dest => dest.SubscriptionType, opt => opt.MapFrom(src => src.SubscriptionType))
            .ForMember(dest => dest.IsTrial, opt => opt.MapFrom(src => src.IsTrial))
            .ForMember(dest => dest.TrialEndDate, opt => opt.MapFrom(src => src.TrialEndDate))
            .ForMember(dest => dest.BillingCyclesCompleted, opt => opt.MapFrom(src => src.BillingCyclesCompleted));
            
        // UserSubscription to UserSubscriptionSummaryDTO mapping
        CreateMap<UserSubscription, UserSubscriptionSummaryDTO>()
            .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.UserId))
            .ForMember(dest => dest.Username, opt => opt.MapFrom(src => src.User.Username))
            .ForMember(dest => dest.CurrentTier, opt => opt.MapFrom(src => src.SubscriptionTier.Name))
            .ForMember(dest => dest.SubscriptionStartDate, opt => opt.MapFrom(src => src.StartDate))
            .ForMember(dest => dest.TotalAmountPaid, opt => opt.MapFrom(src => src.MonthlyPrice * src.BillingCyclesCompleted))
            .ForMember(dest => dest.BillingCycles, opt => opt.MapFrom(src => src.BillingCyclesCompleted))
            .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => src.IsActive))
            .ForMember(dest => dest.NextBillingDate, opt => opt.MapFrom(src => src.NextBillingDate));

        // Productivity insights and behavior patterns
        CreateMap<User, BehaviorPatternDTO>()
            .ForMember(dest => dest.Pattern, opt => opt.Ignore())
            .ForMember(dest => dest.Confidence, opt => opt.Ignore())
            .ForMember(dest => dest.Description, opt => opt.Ignore());

        // TaskTemplate mappings for marketplace analytics
        CreateMap<TaskTemplate, TopPublisherDTO>()
            .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.UserId))
            .ForMember(dest => dest.Username, opt => opt.MapFrom(src => src.User != null ? src.User.Username : "Unknown"))
            .ForMember(dest => dest.TemplatesPublished, opt => opt.Ignore())
            .ForMember(dest => dest.TotalDownloads, opt => opt.Ignore())
            .ForMember(dest => dest.AverageRating, opt => opt.Ignore());

        // ServiceHealthStatus reverse mapping for system health
        CreateMap<ServiceHealthStatus, BackgroundServiceStatus>()
            .ForMember(dest => dest.ServiceName, opt => opt.MapFrom(src => src.ServiceName))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status))
            .ForMember(dest => dest.Message, opt => opt.MapFrom(src => src.ErrorMessage))
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => src.LastCheck))
            .ForMember(dest => dest.IsHealthy, opt => opt.Ignore())
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.LastRun, opt => opt.Ignore())
            .ForMember(dest => dest.NextRun, opt => opt.Ignore())
            .ForMember(dest => dest.ExecutionCount, opt => opt.Ignore())
            .ForMember(dest => dest.SuccessCount, opt => opt.Ignore())
            .ForMember(dest => dest.ErrorCount, opt => opt.Ignore())
            .ForMember(dest => dest.SuccessRate, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore());

        // PriorityBreakdownDTO mappings
        CreateMap<TaskItem, PriorityBreakdownDTO>()
            .ForMember(dest => dest.Priority, opt => opt.MapFrom(src => src.Priority.ToString()))
            .ForMember(dest => dest.Count, opt => opt.Ignore())
            .ForMember(dest => dest.Percentage, opt => opt.Ignore());

        // FeatureUsageDTO mappings for feature analytics
        CreateMap<object, FeatureUsageDTO>()
            .ForMember(dest => dest.FeatureName, opt => opt.Ignore())
            .ForMember(dest => dest.UsageCount, opt => opt.Ignore())
            .ForMember(dest => dest.UsagePercentage, opt => opt.Ignore());

        // ServiceExecutionDTO mappings for background service analytics
        CreateMap<BackgroundServiceExecution, ServiceExecutionDTO>()
            .ForMember(dest => dest.ServiceName, opt => opt.MapFrom(src => src.ServiceName))
            .ForMember(dest => dest.ExecutionTime, opt => opt.MapFrom(src => src.ExecutionTime))
            .ForMember(dest => dest.Success, opt => opt.MapFrom(src => src.Success))
            .ForMember(dest => dest.Duration, opt => opt.MapFrom(src => src.Duration ?? TimeSpan.Zero))
            .ForMember(dest => dest.ErrorMessage, opt => opt.MapFrom(src => src.ErrorMessage));

        // PerformanceMetricDTO mappings for system performance
        CreateMap<object, PerformanceMetricDTO>()
            .ForMember(dest => dest.Timestamp, opt => opt.Ignore())
            .ForMember(dest => dest.MetricName, opt => opt.Ignore())
            .ForMember(dest => dest.Value, opt => opt.Ignore());

        // BehaviorPatternSummary mappings for behavioral analytics
        CreateMap<BehavioralAnalytics, BehaviorPatternSummary>()
            .ForMember(dest => dest.Pattern, opt => opt.MapFrom(src => src.ActionType))
            .ForMember(dest => dest.Count, opt => opt.Ignore())
            .ForMember(dest => dest.RiskScore, opt => opt.MapFrom(src => src.AnomalyScore))
            .ForMember(dest => dest.Description, opt => opt.MapFrom(src => src.AnomalyReason));

        // MLRecommendation mappings for ML insights
        CreateMap<object, MLRecommendation>()
            .ForMember(dest => dest.Type, opt => opt.Ignore())
            .ForMember(dest => dest.Title, opt => opt.Ignore())
            .ForMember(dest => dest.Description, opt => opt.Ignore())
            .ForMember(dest => dest.Confidence, opt => opt.Ignore())
            .ForMember(dest => dest.Priority, opt => opt.Ignore());
    }
} 