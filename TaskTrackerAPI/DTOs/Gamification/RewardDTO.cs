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
    
    /// Data transfer object for rewards in the gamification system
    
    public class RewardDTO
    {
        
        /// Unique identifier for the reward
        
        public int Id { get; set; }

        
        /// Name of the reward
        
        [Required]
        [StringLength(100, ErrorMessage = "Name cannot exceed 100 characters")]
        public string Name { get; set; } = string.Empty;

        
        /// Description of the reward
        
        [Required]
        [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters")]
        public string Description { get; set; } = string.Empty;

        
        /// Category of the reward (e.g., "Custom", "Digital", "Physical")
        
        [Required]
        [StringLength(50, ErrorMessage = "Category cannot exceed 50 characters")]
        public string Category { get; set; } = string.Empty;

        
        /// Point cost to redeem this reward
        
        [Required]
        [Range(1, 10000, ErrorMessage = "Point cost must be between 1 and 10000")]
        public int PointCost { get; set; }

        
        /// Minimum user level required to redeem this reward
        
        [Required]
        [Range(1, 100, ErrorMessage = "Minimum level must be between 1 and 100")]
        public int MinimumLevel { get; set; } = 1;

        
        /// URL to the reward's icon
        
        [StringLength(255, ErrorMessage = "Icon URL cannot exceed 255 characters")]
        public string IconUrl { get; set; } = string.Empty;

        
        /// Flag indicating if the reward is currently active
        
        public bool IsActive { get; set; } = true;

        
        /// Available quantity of the reward (null for unlimited)
        
        public int? Quantity { get; set; }

        
        /// Expiration date of the reward (null for no expiration)
        
        public DateTime? ExpirationDate { get; set; }
        
        
        /// Date when the reward was created
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        /// Whether this reward is available to the current user (based on level)
        
        public bool IsAvailable { get; set; } = true;
        
        /// Current user's level (for frontend to display lock state)
        
        public int UserLevel { get; set; }
        
        /// Current user's points (for frontend to show if they can afford it)
        
        public int UserPoints { get; set; }
    }
} 