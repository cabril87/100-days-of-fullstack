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
    
    /// Data transfer object for user gamification statistics
    
    public class GamificationStatsDTO
    {
        
        /// User progress information
        
        public UserProgressDTO Progress { get; set; } = null!;

        
        /// Total tasks completed by the user
        
        public int CompletedTasks { get; set; }

        
        /// Total achievements unlocked by the user
        
        public int AchievementsUnlocked { get; set; }

        
        /// Total badges earned by the user
        
        public int BadgesEarned { get; set; }

        
        /// Total rewards redeemed by the user
        
        public int RewardsRedeemed { get; set; }

        
        /// Consistency score (0-100) based on user activity patterns
        
        public double ConsistencyScore { get; set; }

        
        /// Statistics by category (e.g., task types completed)
        
        public Dictionary<string, int> CategoryStats { get; set; } = new Dictionary<string, int>();

        
        /// Top users on the leaderboard (for comparison)
        
        public List<LeaderboardEntryDTO> TopUsers { get; set; } = new List<LeaderboardEntryDTO>();
    }

    
    /// Data transfer object for gamification suggestions
    
    public class GamificationSuggestionDTO
    {
        
        /// Title of the suggestion
        
        [Required]
        [StringLength(100, ErrorMessage = "Title cannot exceed 100 characters")]
        public string Title { get; set; } = string.Empty;

        
        /// Description of the suggestion
        
        [Required]
        [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters")]
        public string Description { get; set; } = string.Empty;

        
        /// Type of suggestion (e.g., "Challenge", "Achievement", "Task")
        
        [Required]
        [StringLength(50, ErrorMessage = "Type cannot exceed 50 characters")]
        public string Type { get; set; } = string.Empty;

        
        /// ID of the relevant entity (e.g., challenge ID)
        
        public int? RelevantId { get; set; }

        
        /// Potential points that could be earned
        
        public int PotentialPoints { get; set; }

        
        /// Relevance score (0-1) indicating how relevant this suggestion is to the user
        
        [Range(0, 1, ErrorMessage = "Relevance score must be between 0 and 1")]
        public double RelevanceScore { get; set; }
    }

    
    /// Data transfer object for daily login status
    
    public class LoginStatusDTO
    {
        
        /// Whether the user has claimed their daily reward today
        
        public bool HasClaimedToday { get; set; }

        
        /// Current login streak
        
        public int CurrentStreak { get; set; }

        
        /// Potential points that can be earned by logging in today
        
        public int PotentialPoints { get; set; }
    }

    /// <summary>
    /// Data transfer object for gamification reset statistics - Admin testing only
    /// </summary>
    public class GamificationResetStatsDTO
    {
        /// <summary>
        /// User ID being reset
        /// </summary>
        public int UserId { get; set; }

        /// <summary>
        /// Current user level before reset
        /// </summary>
        public int CurrentLevel { get; set; }

        /// <summary>
        /// Current points before reset
        /// </summary>
        public int CurrentPoints { get; set; }

        /// <summary>
        /// Total points earned before reset
        /// </summary>
        public int TotalPointsEarned { get; set; }

        /// <summary>
        /// Current streak before reset
        /// </summary>
        public int CurrentStreak { get; set; }

        /// <summary>
        /// Longest streak before reset
        /// </summary>
        public int LongestStreak { get; set; }

        /// <summary>
        /// Current tier before reset
        /// </summary>
        public string CurrentTier { get; set; } = string.Empty;

        /// <summary>
        /// Number of point transactions to be deleted
        /// </summary>
        public int PointTransactionCount { get; set; }

        /// <summary>
        /// Number of achievements to be removed
        /// </summary>
        public int AchievementCount { get; set; }

        /// <summary>
        /// Number of badges to be removed
        /// </summary>
        public int BadgeCount { get; set; }

        /// <summary>
        /// Number of rewards to be removed
        /// </summary>
        public int RewardCount { get; set; }

        /// <summary>
        /// Number of challenge progresses to be removed
        /// </summary>
        public int ChallengeProgressCount { get; set; }

        /// <summary>
        /// Character level before reset
        /// </summary>
        public int CharacterLevel { get; set; }

        /// <summary>
        /// Character XP before reset
        /// </summary>
        public int CharacterXP { get; set; }

        /// <summary>
        /// Unlocked characters before reset
        /// </summary>
        public string[] UnlockedCharacters { get; set; } = new string[0];
    }
} 