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

namespace TaskTrackerAPI.DTOs.Gamification
{
    
    /// Data transfer object for level definitions in the gamification system
    
    public class LevelDTO
    {
        
        /// Unique identifier for the level
        
        public int Id { get; set; }

        
        /// Level number (e.g., 1, 2, 3...)
        
        [Required]
        [Range(1, 100, ErrorMessage = "Level number must be between 1 and 100")]
        public int LevelNumber { get; set; }

        
        /// Title of the level (e.g., "Beginner", "Expert")
        
        [Required]
        [StringLength(50, ErrorMessage = "Level title cannot exceed 50 characters")]
        public string Title { get; set; } = string.Empty;

        
        /// Description of the level
        
        [StringLength(200, ErrorMessage = "Level description cannot exceed 200 characters")]
        public string Description { get; set; } = string.Empty;

        
        /// URL to the badge image for this level
        
        [StringLength(255, ErrorMessage = "Image URL cannot exceed 255 characters")]
        public string ImageUrl { get; set; } = string.Empty;

        
        /// Points required to reach this level
        
        [Required]
        [Range(0, int.MaxValue, ErrorMessage = "Required points cannot be negative")]
        public int PointsRequired { get; set; }

        
        /// Points required to reach the next level
        
        [Range(0, int.MaxValue, ErrorMessage = "Points to next level cannot be negative")]
        public int PointsToNextLevel { get; set; }

        
        /// Rewards or benefits unlocked at this level
        
        [StringLength(200, ErrorMessage = "Rewards description cannot exceed 200 characters")]
        public string Rewards { get; set; } = string.Empty;
    }
} 