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
} 