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
    
    /// Data transfer object for tracking user progress in the gamification system
    
    public class UserProgressDTO
    {
        
        /// Unique identifier for the user progress record
        
        public int Id { get; set; }

        
        /// User ID associated with this progress record
        
        [Required]
        public int UserId { get; set; }

        
        /// Total points earned by the user
        
        public int TotalPoints { get; set; } = 0;

        
        /// Current level of the user
        
        public int CurrentLevel { get; set; } = 1;

        
        /// Points required to reach the next level
        
        public int PointsToNextLevel { get; set; } = 100;

        
        /// Total number of tasks completed by the user
        
        public int TasksCompleted { get; set; } = 0;

        
        /// Total number of badges earned by the user
        
        public int BadgesEarned { get; set; } = 0;

        
        /// Current streak of consecutive days with activity
        
        public int CurrentStreak { get; set; } = 0;

        
        /// Highest streak achieved by the user
        
        public int HighestStreak { get; set; } = 0;

        
        /// Date of the last user activity (for streak calculation)
        
        public DateTime LastActivityDate { get; set; } = DateTime.UtcNow;

        
        /// Date when the progress was last updated
        
        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
    }
} 