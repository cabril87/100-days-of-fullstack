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
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskTrackerAPI.Models;

/// <summary>
/// Tracks API usage quota for users
/// </summary>
public class UserApiQuota
{
    /// <summary>
    /// Primary key
    /// </summary>
    [Key]
    public int Id { get; set; }
    
    /// <summary>
    /// User ID this quota applies to
    /// </summary>
    public int UserId { get; set; }
    
    /// <summary>
    /// Foreign key to the user
    /// </summary>
    [ForeignKey("UserId")]
    public User? User { get; set; }
    
    /// <summary>
    /// Number of API calls used today
    /// </summary>
    public int ApiCallsUsedToday { get; set; }
    
    /// <summary>
    /// Maximum allowed API calls per day based on subscription
    /// </summary>
    public int MaxDailyApiCalls { get; set; }
    
    /// <summary>
    /// Last API usage reset time
    /// </summary>
    public DateTime LastResetTime { get; set; } = DateTime.UtcNow.Date;
    
    /// <summary>
    /// Last time this record was updated
    /// </summary>
    public DateTime LastUpdatedTime { get; set; } = DateTime.UtcNow;
    
    /// <summary>
    /// ID of the user's subscription tier
    /// </summary>
    public int SubscriptionTierId { get; set; }
    
    /// <summary>
    /// Foreign key to the subscription tier
    /// </summary>
    [ForeignKey("SubscriptionTierId")]
    public SubscriptionTier? SubscriptionTier { get; set; }
    
    /// <summary>
    /// Whether this user is exempted from quota limits
    /// </summary>
    public bool IsExemptFromQuota { get; set; }
    
    /// <summary>
    /// Whether this user has received a warning about approaching quota
    /// </summary>
    public bool HasReceivedQuotaWarning { get; set; }
    
    /// <summary>
    /// Percentage threshold at which to send a quota warning
    /// </summary>
    public int QuotaWarningThresholdPercent { get; set; } = 80;
} 