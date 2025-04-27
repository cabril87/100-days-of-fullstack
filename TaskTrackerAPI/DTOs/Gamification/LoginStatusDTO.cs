using System;
using System.ComponentModel.DataAnnotations;

namespace TaskTrackerAPI.DTOs.Gamification
{
    public class DailyLoginStatusDetailDTO
    {
        public int UserId { get; set; }
        
        public bool HasLoggedInToday { get; set; }
        
        public int ConsecutiveDays { get; set; }
        
        public int TotalLogins { get; set; }
        
        public DateTime? LastLoginDate { get; set; }
        
        public int CurrentStreakPoints { get; set; }
        
        public bool RewardClaimed { get; set; }
    }
} 