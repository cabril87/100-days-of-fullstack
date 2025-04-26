namespace TaskTrackerAPI.Models
{
    public class LoginStatus
    {
        public bool HasClaimedToday { get; set; }
        public int CurrentStreak { get; set; }
        public int PotentialPoints { get; set; }
    }
} 