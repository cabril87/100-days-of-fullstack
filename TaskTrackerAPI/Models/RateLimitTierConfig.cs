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
/// Configuration for rate limits by endpoint and subscription tier
/// </summary>
public class RateLimitTierConfig
{
    /// <summary>
    /// Primary key
    /// </summary>
    [Key]
    public int Id { get; set; }
    
    /// <summary>
    /// ID of the subscription tier this config applies to
    /// </summary>
    public int SubscriptionTierId { get; set; }
    
    /// <summary>
    /// Foreign key to the subscription tier
    /// </summary>
    [ForeignKey("SubscriptionTierId")]
    public SubscriptionTier? SubscriptionTier { get; set; }
    
    /// <summary>
    /// Endpoint pattern this config applies to (can use wildcards)
    /// </summary>
    [Required]
    [MaxLength(255)]
    public string EndpointPattern { get; set; } = string.Empty;
    
    /// <summary>
    /// HTTP method this config applies to (GET, POST, etc. or * for all)
    /// </summary>
    [Required]
    [MaxLength(10)]
    public string HttpMethod { get; set; } = "*";
    
    /// <summary>
    /// Rate limit (requests per time window)
    /// </summary>
    public int RateLimit { get; set; }
    
    /// <summary>
    /// Time window in seconds for the rate limit
    /// </summary>
    public int TimeWindowSeconds { get; set; }
    
    /// <summary>
    /// Whether this endpoint is critical and should have stricter limits
    /// </summary>
    public bool IsCriticalEndpoint { get; set; }
    
    /// <summary>
    /// Whether to exempt system accounts from this rate limit
    /// </summary>
    public bool ExemptSystemAccounts { get; set; } = true;
    
    /// <summary>
    /// Priority value for this config when multiple patterns match
    /// </summary>
    public int MatchPriority { get; set; }
    
    /// <summary>
    /// Creation date
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    /// <summary>
    /// Last update date
    /// </summary>
    public DateTime? UpdatedAt { get; set; }
    
    /// <summary>
    /// Whether the rate limit is adaptive based on server load
    /// </summary>
    public bool IsAdaptive { get; set; }
    
    /// <summary>
    /// Percentage to reduce rate limit by during high server load
    /// </summary>
    public int HighLoadReductionPercent { get; set; } = 50;
} 