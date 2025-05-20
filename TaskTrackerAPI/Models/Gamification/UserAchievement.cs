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

namespace TaskTrackerAPI.Models.Gamification
{
    
    /// Represents a user's progress towards an achievement
    
    public class UserAchievement
    {
        
        /// Unique identifier for the user achievement
        
        [Key]
        public int Id { get; set; }
        
        
        /// User ID
        
        [Required]
        public int UserId { get; set; } = 0;
        
        
        /// Achievement ID
        
        [Required]
        public int AchievementId { get; set; }
        
        
        /// Progress towards completing the achievement (0-100)
        
        [Required]
        [Range(0, 100)]
        public int Progress { get; set; } = 0;
        
        
        /// Flag indicating if the achievement is completed
        
        [Required]
        public bool IsCompleted { get; set; } = false;
        
        
        /// Date when the user started working on the achievement
        
        public DateTime? StartedAt { get; set; }
        
        
        /// Date when the achievement was completed
        
        public DateTime? CompletedAt { get; set; }
        
        // Navigation properties
        [ForeignKey("UserId")]
        public virtual User? User { get; set; }
        
        [ForeignKey("AchievementId")]
        public virtual Achievement? Achievement { get; set; }
    }
} 