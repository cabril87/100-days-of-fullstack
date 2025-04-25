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