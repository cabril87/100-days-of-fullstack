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
using System.ComponentModel.DataAnnotations;

namespace TaskTrackerAPI.Models;

/// <summary>
/// Represents a user subscription tier with associated rate limits and quotas
/// </summary>
public class SubscriptionTier
{
    /// <summary>
    /// Primary key
    /// </summary>
    [Key]
    public int Id { get; set; }
    
    /// <summary>
    /// Name of the subscription tier (e.g., Free, Premium, Enterprise)
    /// </summary>
    [Required]
    [MaxLength(50)]
    public string Name { get; set; } = string.Empty;
    
    /// <summary>
    /// Description of the tier features
    /// </summary>
    [MaxLength(500)]
    public string? Description { get; set; }
    
    /// <summary>
    /// Default rate limit for general endpoints
    /// </summary>
    public int DefaultRateLimit { get; set; }
    
    /// <summary>
    /// Default time window in seconds for the rate limit
    /// </summary>
    public int DefaultTimeWindowSeconds { get; set; }
    
    /// <summary>
    /// Daily API call quota for this tier
    /// </summary>
    public int DailyApiQuota { get; set; }
    
    /// <summary>
    /// Maximum concurrent connections allowed
    /// </summary>
    public int MaxConcurrentConnections { get; set; }
    
    /// <summary>
    /// Whether this tier bypasses rate limits for non-critical endpoints
    /// </summary>
    public bool BypassStandardRateLimits { get; set; }
    
    /// <summary>
    /// Priority for this tier (higher means more priority in resource allocation)
    /// </summary>
    public int Priority { get; set; }
    
    /// <summary>
    /// Whether this tier is for system accounts
    /// </summary>
    public bool IsSystemTier { get; set; }
    
    /// <summary>
    /// Cost of the subscription tier
    /// </summary>
    public decimal MonthlyCost { get; set; }
    
    /// <summary>
    /// Date the tier was created
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    /// <summary>
    /// Date the tier was last updated
    /// </summary>
    public DateTime? UpdatedAt { get; set; }
} 