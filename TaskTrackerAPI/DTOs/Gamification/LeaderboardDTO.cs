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
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace TaskTrackerAPI.DTOs.Gamification
{
    
    /// Data transfer object for leaderboard entries
    
    public class LeaderboardEntryDTO
    {
        
        /// User identifier
        
        [Required]
        public int UserId { get; set; }

        
        /// Username for display
        
        [Required]
        [StringLength(50)]
        public string Username { get; set; } = string.Empty;

        
        /// Avatar URL or path
        
        [StringLength(255)]
        public string? AvatarUrl { get; set; }

        
        /// The value being ranked (points, tasks completed, etc.)
        
        public int Value { get; set; }

        
        /// The user's rank position
        
        public int Rank { get; set; }
    }

    
    /// Data transfer object for a complete leaderboard
    
    public class LeaderboardDTO
    {
        
        /// Title of the leaderboard
        
        [Required]
        [StringLength(100)]
        public string Title { get; set; } = string.Empty;

        
        /// Description of what's being measured
        
        [StringLength(200)]
        public string Description { get; set; } = string.Empty;

        
        /// The type of metric being ranked
        
        [Required]
        [StringLength(50)]
        public string MetricType { get; set; } = string.Empty;

        
        /// Time period covered (e.g., "Daily", "Weekly", "All Time")
        
        [Required]
        [StringLength(20)]
        public string TimePeriod { get; set; } = string.Empty;

        
        /// The entries in the leaderboard
        
        public List<LeaderboardEntryDTO> Entries { get; set; } = new List<LeaderboardEntryDTO>();
        
        
        /// The current user's rank (if they're not in the top entries)
        
        public LeaderboardEntryDTO? CurrentUserRank { get; set; }
    }

    /// <summary>
    /// Data transfer object for user task count data
    /// </summary>
    public class UserTaskCountDTO
    {
        /// <summary>
        /// User identifier
        /// </summary>
        public int UserId { get; set; }

        /// <summary>
        /// Number of completed tasks
        /// </summary>
        public int Count { get; set; }
    }

    /// <summary>
    /// Data transfer object for user summary information
    /// </summary>
    public class UserSummaryDTO
    {
        /// <summary>
        /// User identifier
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// Username for display
        /// </summary>
        public string Username { get; set; } = string.Empty;
    }

    /// <summary>
    /// Data transfer object for user progress data with points
    /// </summary>
    public class UserProgressDataDTO
    {
        /// <summary>
        /// User identifier
        /// </summary>
        public int UserId { get; set; }

        /// <summary>
        /// Total points earned by the user
        /// </summary>
        public int TotalPointsEarned { get; set; }
    }

    /// <summary>
    /// Data transfer object for user progress data with streak
    /// </summary>
    public class UserStreakDataDTO
    {
        /// <summary>
        /// User identifier
        /// </summary>
        public int UserId { get; set; }

        /// <summary>
        /// Current streak days
        /// </summary>
        public int CurrentStreak { get; set; }
    }

    /// <summary>
    /// Data transfer object for general user task count data (allows nullable UserId)
    /// </summary>
    public class GeneralUserTaskCountDTO
    {
        /// <summary>
        /// User identifier (nullable for general queries)
        /// </summary>
        public int? UserId { get; set; }

        /// <summary>
        /// Number of completed tasks
        /// </summary>
        public int Count { get; set; }
    }
} 