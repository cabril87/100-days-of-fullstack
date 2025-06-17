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
/// Represents a user's subscription history and current subscription details
/// </summary>
public class UserSubscription
{
    /// <summary>
    /// Primary key
    /// </summary>
    [Key]
    public int Id { get; set; }
    
    /// <summary>
    /// User ID this subscription belongs to
    /// </summary>
    [Required]
    public int UserId { get; set; }
    
    /// <summary>
    /// Foreign key to the user
    /// </summary>
    [ForeignKey("UserId")]
    public virtual User User { get; set; } = null!;
    
    /// <summary>
    /// Subscription tier ID
    /// </summary>
    [Required]
    public int SubscriptionTierId { get; set; }
    
    /// <summary>
    /// Foreign key to the subscription tier
    /// </summary>
    [ForeignKey("SubscriptionTierId")]
    public virtual SubscriptionTier SubscriptionTier { get; set; } = null!;
    
    /// <summary>
    /// Type of subscription (Monthly, Annual, Lifetime, etc.)
    /// </summary>
    [Required]
    [StringLength(50)]
    public string SubscriptionType { get; set; } = "Monthly";
    
    /// <summary>
    /// Start date of the subscription
    /// </summary>
    [Required]
    public DateTime StartDate { get; set; } = DateTime.UtcNow;
    
    /// <summary>
    /// End date of the subscription (null for active subscriptions)
    /// </summary>
    public DateTime? EndDate { get; set; }
    
    /// <summary>
    /// Whether the subscription is currently active
    /// </summary>
    public bool IsActive { get; set; } = true;
    
    /// <summary>
    /// Whether the subscription is set to auto-renew
    /// </summary>
    public bool AutoRenew { get; set; } = true;
    
    /// <summary>
    /// Monthly price paid for this subscription
    /// </summary>
    [Column(TypeName = "decimal(10,2)")]
    public decimal MonthlyPrice { get; set; }
    
    /// <summary>
    /// Currency of the subscription price
    /// </summary>
    [StringLength(3)]
    public string Currency { get; set; } = "USD";
    
    /// <summary>
    /// Payment method used (Credit Card, PayPal, etc.)
    /// </summary>
    [StringLength(50)]
    public string? PaymentMethod { get; set; }
    
    /// <summary>
    /// External payment provider subscription ID
    /// </summary>
    [StringLength(255)]
    public string? ExternalSubscriptionId { get; set; }
    
    /// <summary>
    /// Reason for subscription cancellation (if cancelled)
    /// </summary>
    [StringLength(500)]
    public string? CancellationReason { get; set; }
    
    /// <summary>
    /// Date the subscription was cancelled
    /// </summary>
    public DateTime? CancelledAt { get; set; }
    
    /// <summary>
    /// User who cancelled the subscription
    /// </summary>
    public int? CancelledByUserId { get; set; }
    
    /// <summary>
    /// Notes about the subscription
    /// </summary>
    [StringLength(1000)]
    public string? Notes { get; set; }
    
    /// <summary>
    /// Trial period end date (if applicable)
    /// </summary>
    public DateTime? TrialEndDate { get; set; }
    
    /// <summary>
    /// Whether this is a trial subscription
    /// </summary>
    public bool IsTrial { get; set; } = false;
    
    /// <summary>
    /// Next billing date
    /// </summary>
    public DateTime? NextBillingDate { get; set; }
    
    /// <summary>
    /// Last billing date
    /// </summary>
    public DateTime? LastBillingDate { get; set; }
    
    /// <summary>
    /// Number of billing cycles completed
    /// </summary>
    public int BillingCyclesCompleted { get; set; } = 0;
    
    /// <summary>
    /// Date the subscription was created
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    /// <summary>
    /// Date the subscription was last updated
    /// </summary>
    public DateTime? UpdatedAt { get; set; }
    
    /// <summary>
    /// Navigation property for the user who cancelled the subscription
    /// </summary>
    [ForeignKey("CancelledByUserId")]
    public virtual User? CancelledByUser { get; set; }
} 