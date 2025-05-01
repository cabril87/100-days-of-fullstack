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

namespace TaskTrackerAPI.Models
{
    public class GamificationStats
    {
        public UserProgress Progress { get; set; } = null!;
        public int CompletedTasks { get; set; }
        public int AchievementsUnlocked { get; set; }
        public int BadgesEarned { get; set; }
        public int RewardsRedeemed { get; set; }
        public double ConsistencyScore { get; set; }
        public Dictionary<string, int> CategoryStats { get; set; } = new Dictionary<string, int>();
        public List<LeaderboardEntry> TopUsers { get; set; } = new List<LeaderboardEntry>();
    }
} 