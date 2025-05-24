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
    
    /// Data transfer object for challenges in the gamification system
    
    public class ChallengeDTO
    {
        
        /// Unique identifier for the challenge
        
        public int Id { get; set; }

        
        /// Name of the challenge
        
        [Required]
        [StringLength(100, ErrorMessage = "Name cannot exceed 100 characters")]
        public string Name { get; set; } = string.Empty;

        
        /// Description of the challenge
        
        [Required]
        [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters")]
        public string Description { get; set; } = string.Empty;

        
        /// Start date of the challenge
        
        [Required]
        public DateTime StartDate { get; set; }

        
        /// End date of the challenge
        
        [Required]
        public DateTime EndDate { get; set; }

        
        /// Points awarded for completing the challenge
        
        [Required]
        [Range(1, 5000, ErrorMessage = "Point reward must be between 1 and 5000")]
        public int PointReward { get; set; }

        
        /// Type of challenge (e.g., "Task", "Streak", "Social")
        
        [Required]
        [StringLength(50, ErrorMessage = "Challenge type cannot exceed 50 characters")]
        public string ChallengeType { get; set; } = string.Empty;

        
        /// Target count to complete the challenge
        
        [Required]
        [Range(1, 10000, ErrorMessage = "Target count must be between 1 and 10000")]
        public int TargetCount { get; set; }

        
        /// Additional criteria for the challenge (e.g., specific task categories)
        
        [StringLength(500, ErrorMessage = "Additional criteria cannot exceed 500 characters")]
        public string? AdditionalCriteria { get; set; }

        
        /// Flag indicating if the challenge is currently active
        
        public bool IsActive { get; set; } = true;

        
        /// Difficulty level of the challenge (1-5 scale)
        
        [Required]
        [Range(1, 5, ErrorMessage = "Difficulty must be between 1 and 5")]
        public int Difficulty { get; set; } = 1;

        
        /// Minimum points required to join this challenge
        
        [Range(0, 100000, ErrorMessage = "Points required must be between 0 and 100000")]
        public int PointsRequired { get; set; } = 0;

        
        /// Reward badge ID for completing the challenge (if any)
        
        public int? RewardBadgeId { get; set; }

        
        /// Date when the challenge was created
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// Data transfer object for user's active challenges with detailed information
    /// </summary>
    public class UserActiveChallengeDTO
    {
        /// <summary>
        /// Challenge progress ID
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// Challenge ID
        /// </summary>
        public int ChallengeId { get; set; }

        /// <summary>
        /// Challenge name
        /// </summary>
        public string ChallengeName { get; set; } = string.Empty;

        /// <summary>
        /// Challenge description
        /// </summary>
        public string ChallengeDescription { get; set; } = string.Empty;

        /// <summary>
        /// Current progress value
        /// </summary>
        public int CurrentProgress { get; set; }

        /// <summary>
        /// Target progress value to complete the challenge
        /// </summary>
        public int TargetProgress { get; set; }

        /// <summary>
        /// Percentage of progress completed (0-100)
        /// </summary>
        public int ProgressPercentage { get; set; }

        /// <summary>
        /// Points reward for completing the challenge
        /// </summary>
        public int PointReward { get; set; }

        /// <summary>
        /// Challenge end date
        /// </summary>
        public DateTime? EndDate { get; set; }

        /// <summary>
        /// Date when the user enrolled in the challenge
        /// </summary>
        public DateTime EnrolledAt { get; set; }

        /// <summary>
        /// Number of days remaining to complete the challenge
        /// </summary>
        public int? DaysRemaining { get; set; }

        /// <summary>
        /// Activity type for the challenge
        /// </summary>
        public string ActivityType { get; set; } = string.Empty;

        /// <summary>
        /// Challenge difficulty level
        /// </summary>
        public int Difficulty { get; set; }
    }
} 