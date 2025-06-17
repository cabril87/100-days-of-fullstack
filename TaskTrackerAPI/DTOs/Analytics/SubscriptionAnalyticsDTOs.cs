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
using System.ComponentModel.DataAnnotations;

namespace TaskTrackerAPI.DTOs.Analytics;

/// <summary>
/// DTO for subscription analytics data
/// </summary>
public class SubscriptionAnalyticsDTO
{
    /// <summary>
    /// Subscription tier name
    /// </summary>
    public string TierName { get; set; } = string.Empty;
    
    /// <summary>
    /// Start date of the subscription
    /// </summary>
    public DateTime StartDate { get; set; }
    
    /// <summary>
    /// End date of the subscription
    /// </summary>
    public DateTime? EndDate { get; set; }
    
    /// <summary>
    /// Whether the subscription is active
    /// </summary>
    public bool IsActive { get; set; }
    
    /// <summary>
    /// Monthly price
    /// </summary>
    public decimal MonthlyPrice { get; set; }
    
    /// <summary>
    /// Currency code
    /// </summary>
    public string Currency { get; set; } = "USD";
    
    /// <summary>
    /// Subscription type
    /// </summary>
    public string SubscriptionType { get; set; } = string.Empty;
    
    /// <summary>
    /// Whether it's a trial subscription
    /// </summary>
    public bool IsTrial { get; set; }
    
    /// <summary>
    /// Trial end date
    /// </summary>
    public DateTime? TrialEndDate { get; set; }
    
    /// <summary>
    /// Number of billing cycles completed
    /// </summary>
    public int BillingCyclesCompleted { get; set; }
}

// Note: RevenueBreakdownDTO already exists in UnifiedAnalyticsDTOs.cs

/// <summary>
/// DTO for subscription tier statistics
/// </summary>
public class SubscriptionTierStatsDTO
{
    /// <summary>
    /// Tier name
    /// </summary>
    public string TierName { get; set; } = string.Empty;
    
    /// <summary>
    /// Number of active subscribers
    /// </summary>
    public int ActiveSubscribers { get; set; }
    
    /// <summary>
    /// Total revenue from this tier
    /// </summary>
    public decimal TotalRevenue { get; set; }
    
    /// <summary>
    /// Average subscription length in months
    /// </summary>
    public double AverageSubscriptionLength { get; set; }
    
    /// <summary>
    /// Churn rate percentage
    /// </summary>
    public double ChurnRate { get; set; }
    
    /// <summary>
    /// Monthly recurring revenue
    /// </summary>
    public decimal MonthlyRecurringRevenue { get; set; }
}

/// <summary>
/// DTO for subscription trends over time
/// </summary>
public class SubscriptionTrendDTO
{
    /// <summary>
    /// Date of the data point
    /// </summary>
    public DateTime Date { get; set; }
    
    /// <summary>
    /// Number of new subscriptions
    /// </summary>
    public int NewSubscriptions { get; set; }
    
    /// <summary>
    /// Number of cancelled subscriptions
    /// </summary>
    public int CancelledSubscriptions { get; set; }
    
    /// <summary>
    /// Total active subscriptions
    /// </summary>
    public int TotalActiveSubscriptions { get; set; }
    
    /// <summary>
    /// Monthly recurring revenue
    /// </summary>
    public decimal MonthlyRecurringRevenue { get; set; }
    
    /// <summary>
    /// Customer lifetime value
    /// </summary>
    public decimal CustomerLifetimeValue { get; set; }
}

/// <summary>
/// DTO for user subscription summary
/// </summary>
public class UserSubscriptionSummaryDTO
{
    /// <summary>
    /// User ID
    /// </summary>
    public int UserId { get; set; }
    
    /// <summary>
    /// Username
    /// </summary>
    public string Username { get; set; } = string.Empty;
    
    /// <summary>
    /// Current subscription tier
    /// </summary>
    public string CurrentTier { get; set; } = string.Empty;
    
    /// <summary>
    /// Subscription start date
    /// </summary>
    public DateTime SubscriptionStartDate { get; set; }
    
    /// <summary>
    /// Total amount paid
    /// </summary>
    public decimal TotalAmountPaid { get; set; }
    
    /// <summary>
    /// Number of billing cycles
    /// </summary>
    public int BillingCycles { get; set; }
    
    /// <summary>
    /// Whether subscription is active
    /// </summary>
    public bool IsActive { get; set; }
    
    /// <summary>
    /// Next billing date
    /// </summary>
    public DateTime? NextBillingDate { get; set; }
}

/// <summary>
/// DTO for subscription conversion analytics
/// </summary>
public class SubscriptionConversionDTO
{
    /// <summary>
    /// Source tier (null for new subscriptions)
    /// </summary>
    public string? SourceTier { get; set; }
    
    /// <summary>
    /// Target tier
    /// </summary>
    public string TargetTier { get; set; } = string.Empty;
    
    /// <summary>
    /// Number of conversions
    /// </summary>
    public int ConversionCount { get; set; }
    
    /// <summary>
    /// Conversion rate percentage
    /// </summary>
    public double ConversionRate { get; set; }
    
    /// <summary>
    /// Average time to conversion in days
    /// </summary>
    public double AverageTimeToConversion { get; set; }
} 