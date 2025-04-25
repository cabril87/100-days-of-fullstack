namespace TaskTrackerAPI.Models
{
    public class LeaderboardEntry
    {
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public int Value { get; set; }
        public int Rank { get; set; }
    }
} 