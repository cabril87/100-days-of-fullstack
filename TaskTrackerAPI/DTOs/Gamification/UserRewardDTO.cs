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

namespace TaskTrackerAPI.DTOs.Gamification
{
    
    /// Data transfer object for user-redeemed rewards
    
    public class UserRewardDTO
    {
        
        /// Unique identifier for the user-reward relationship
        
        public int Id { get; set; }

        
        /// User identifier
        
        [Required]
        public int UserId { get; set; }

        
        /// Reward identifier
        
        [Required]
        public int RewardId { get; set; }

        
        /// The associated reward
        
        public RewardDTO Reward { get; set; } = null!;

        
        /// Date when the reward was redeemed
        
        public DateTime RedeemedAt { get; set; } = DateTime.UtcNow;

        
        /// Whether the reward has been used
        
        public bool IsUsed { get; set; } = false;

        
        /// Date when the reward was used
        
        public DateTime? UsedAt { get; set; }

        
        /// Optional code or identifier for redemption tracking
        
        [StringLength(50)]
        public string? RedemptionCode { get; set; }

        
        /// Optional notes about the redemption
        
        [StringLength(500)]
        public string? Notes { get; set; }
    }

    
    /// DTO for redeeming a reward
    
    public class RedeemRewardDTO
    {
        
        /// Reward ID to redeem
        
        [Required]
        public int RewardId { get; set; }
    }

    
    /// DTO for marking a reward as used
    
    public class UseRewardDTO
    {
        
        /// User reward ID to mark as used
        
        [Required]
        public int UserRewardId { get; set; }
        
        
        /// Optional notes about how the reward was used
        
        [StringLength(500)]
        public string? Notes { get; set; }
    }
} 