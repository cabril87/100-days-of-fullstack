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
using System.ComponentModel.DataAnnotations;

namespace TaskTrackerAPI.DTOs.Gamification
{
    
    /// Data transfer object for achievement information
    
    public class AchievementDTO
    {
        
        /// Unique identifier for the achievement
        
        public int Id { get; set; }

        
        /// Name of the achievement
        
        [Required]
        [StringLength(100, ErrorMessage = "Name cannot exceed 100 characters")]
        public string Name { get; set; } = string.Empty;

        
        /// Description of the achievement
        
        [Required]
        [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters")]
        public string Description { get; set; } = string.Empty;

        
        /// Points awarded when the achievement is unlocked
        
        [Range(0, 1000, ErrorMessage = "Points value must be between 0 and 1000")]
        public int PointValue { get; set; }

        
        /// Category of the achievement (e.g., "Task", "Streak", "Login")
        
        [StringLength(50, ErrorMessage = "Category cannot exceed 50 characters")]
        public string Category { get; set; } = string.Empty;

        
        /// Target value required to unlock the achievement
        
        [Required]
        public int TargetValue { get; set; }

        
        /// URI to the achievement's icon
        
        [StringLength(255, ErrorMessage = "Icon URL cannot exceed 255 characters")]
        public string IconUrl { get; set; } = string.Empty;

        
        /// Date when the achievement was created
        
        public DateTime CreatedAt { get; set; }

        
        /// Date when the achievement was last updated
        
        public DateTime? UpdatedAt { get; set; }

        
        /// Flag indicating if the achievement is active
        
        public bool IsActive { get; set; } = true;

        
        /// Difficulty level of the achievement (e.g., "Easy", "Medium", "Hard")
        
        [StringLength(50, ErrorMessage = "Difficulty cannot exceed 50 characters")]
        public string Difficulty { get; set; } = string.Empty;

        
        /// Current progress toward unlocking the achievement (for user-specific instances)
        
        public int CurrentProgress { get; set; }

        
        /// Whether the achievement has been unlocked by the user
        
        public bool IsUnlocked { get; set; }

        
        /// Date and time when the achievement was unlocked
        
        public DateTime? UnlockedAt { get; set; }

        
        /// Criteria needed to unlock the achievement, stored as serialized JSON
        
        public string UnlockCriteria { get; set; } = string.Empty;

        
        /// Whether the achievement is visible to users before they unlock it
        
        public bool IsHidden { get; set; }

        
        /// Whether this is a secret achievement that's not listed until unlocked
        
        public bool IsSecret { get; set; }

        
        /// Related achievements that may be part of a series or progression
        
        public ICollection<int> RelatedAchievementIds { get; set; } = new List<int>();

        
        /// Optional congratulatory message to show when unlocked
        
        [StringLength(200, ErrorMessage = "Unlock message cannot exceed 200 characters")]
        public string UnlockMessage { get; set; } = string.Empty;
    }
} 