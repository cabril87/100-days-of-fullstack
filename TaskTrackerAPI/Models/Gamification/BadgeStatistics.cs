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

namespace TaskTrackerAPI.Models.Gamification
{
    /// <summary>
    /// Statistics about a user's badge collection
    /// </summary>
    public class BadgeStatistics
    {
        /// <summary>
        /// Total number of badges earned by the user
        /// </summary>
        public int TotalBadgesEarned { get; set; }

        /// <summary>
        /// Total number of badges available in the system
        /// </summary>
        public int TotalBadgesAvailable { get; set; }

        /// <summary>
        /// Percentage of badges earned (0-100)
        /// </summary>
        public double CompletionPercentage => TotalBadgesAvailable > 0 
            ? Math.Round((double)TotalBadgesEarned / TotalBadgesAvailable * 100, 2) 
            : 0;

        /// <summary>
        /// Number of badges displayed on the user's profile
        /// </summary>
        public int DisplayedBadges { get; set; }

        /// <summary>
        /// Number of featured badges on the user's profile
        /// </summary>
        public int FeaturedBadges { get; set; }

        /// <summary>
        /// Most recently earned badge
        /// </summary>
        public UserBadge? MostRecentBadge { get; set; }

        /// <summary>
        /// Breakdown by rarity
        /// </summary>
        public Dictionary<string, int> BadgesByRarity { get; set; } = new Dictionary<string, int>();

        /// <summary>
        /// Breakdown by category
        /// </summary>
        public Dictionary<string, int> BadgesByCategory { get; set; } = new Dictionary<string, int>();

        /// <summary>
        /// Breakdown by tier
        /// </summary>
        public Dictionary<string, int> BadgesByTier { get; set; } = new Dictionary<string, int>();

        /// <summary>
        /// Total points earned from badges
        /// </summary>
        public int TotalPointsFromBadges { get; set; }

        /// <summary>
        /// Date of the first badge earned
        /// </summary>
        public DateTime? FirstBadgeEarnedAt { get; set; }

        /// <summary>
        /// Date of the most recent badge earned
        /// </summary>
        public DateTime? LastBadgeEarnedAt { get; set; }

        /// <summary>
        /// Number of badges earned in the last 30 days
        /// </summary>
        public int BadgesEarnedThisMonth { get; set; }

        /// <summary>
        /// Longest badge earning streak (consecutive days)
        /// </summary>
        public int LongestBadgeStreak { get; set; }

        /// <summary>
        /// Current badge earning streak (consecutive days)
        /// </summary>
        public int CurrentBadgeStreak { get; set; }
    }
} 