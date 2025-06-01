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

namespace TaskTrackerAPI.Models
{
    /// <summary>
    /// Statistics about a user's points and activity
    /// </summary>
    public class UserPointsStatistics
    {
        /// <summary>
        /// Current points balance
        /// </summary>
        public int CurrentPoints { get; set; }

        /// <summary>
        /// Total points earned (lifetime)
        /// </summary>
        public int TotalPointsEarned { get; set; }

        /// <summary>
        /// Total points spent (lifetime)
        /// </summary>
        public int TotalPointsSpent { get; set; }

        /// <summary>
        /// Points earned in the last 30 days
        /// </summary>
        public int PointsEarnedThisMonth { get; set; }

        /// <summary>
        /// Points spent in the last 30 days
        /// </summary>
        public int PointsSpentThisMonth { get; set; }

        /// <summary>
        /// Current user level
        /// </summary>
        public int CurrentLevel { get; set; }

        /// <summary>
        /// Current activity streak
        /// </summary>
        public int CurrentStreak { get; set; }

        /// <summary>
        /// Longest activity streak achieved
        /// </summary>
        public int LongestStreak { get; set; }

        /// <summary>
        /// User's current tier
        /// </summary>
        public string UserTier { get; set; } = "bronze";

        /// <summary>
        /// Total number of transactions
        /// </summary>
        public int TotalTransactions { get; set; }

        /// <summary>
        /// Breakdown by transaction type
        /// </summary>
        public Dictionary<string, int> PointsByTransactionType { get; set; } = new Dictionary<string, int>();

        /// <summary>
        /// Average points earned per day (over last 30 days)
        /// </summary>
        public double AveragePointsPerDay { get; set; }

        /// <summary>
        /// Date of first point transaction
        /// </summary>
        public DateTime? FirstTransactionDate { get; set; }

        /// <summary>
        /// Date of most recent point transaction
        /// </summary>
        public DateTime? LastTransactionDate { get; set; }

        /// <summary>
        /// Rank among all users by current points
        /// </summary>
        public int CurrentPointsRank { get; set; }

        /// <summary>
        /// Rank among all users by total points earned
        /// </summary>
        public int TotalPointsRank { get; set; }

        /// <summary>
        /// Net points (total earned - total spent)
        /// </summary>
        public int NetPoints => TotalPointsEarned - TotalPointsSpent;

        /// <summary>
        /// Spending rate (percentage of earned points that have been spent)
        /// </summary>
        public double SpendingRate => TotalPointsEarned > 0 
            ? Math.Round((double)TotalPointsSpent / TotalPointsEarned * 100, 2) 
            : 0;

        /// <summary>
        /// Whether the user has been active in the last 7 days
        /// </summary>
        public bool IsRecentlyActive { get; set; }

        /// <summary>
        /// Number of days since last activity
        /// </summary>
        public int DaysSinceLastActivity { get; set; }
    }
} 