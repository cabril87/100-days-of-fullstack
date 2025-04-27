using System;
using System.ComponentModel.DataAnnotations;

namespace TaskTrackerAPI.DTOs.Gamification
{
    
    /// Data transfer object for user-specific achievement data
    
    public class UserAchievementDTO
    {
        
        /// Unique identifier for the user-achievement relationship
        
        public int Id { get; set; }

        
        /// User identifier
        
        [Required]
        public int UserId { get; set; }

        
        /// Achievement identifier
        
        [Required]
        public int AchievementId { get; set; }
        
        
        /// Name of the achievement
        
        public string Name { get; set; } = string.Empty;
        
        
        /// Description of the achievement
        
        public string Description { get; set; } = string.Empty;
        
        
        /// Category of the achievement
        
        public string Category { get; set; } = string.Empty;
        
        
        /// Points awarded for this achievement
        
        public int PointValue { get; set; }
        
        
        /// URL to the achievement's icon
        
        public string IconUrl { get; set; } = string.Empty;
        
        
        /// Difficulty level of the achievement (as a string for display)
        
        public string Difficulty { get; set; } = string.Empty;

        
        /// Current progress value toward the achievement
        
        public int CurrentProgress { get; set; }
        
        
        /// Target progress required to complete the achievement
        
        public int TargetProgress { get; set; }

        
        /// Whether the user has unlocked this achievement
        
        public bool IsCompleted { get; set; }

        
        /// Date and time when the achievement was unlocked
        
        public DateTime? CompletedAt { get; set; }

        
        /// Date and time when progress was last updated
        
        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;

        
        /// Reference to the full achievement details (optional)
        
        public AchievementDTO? Achievement { get; set; }
    }
} 