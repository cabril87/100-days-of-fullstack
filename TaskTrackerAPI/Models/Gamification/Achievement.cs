using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskTrackerAPI.Models.Gamification
{
    
    /// Represents an achievement in the system
    
    public class Achievement
    {
        
        /// Unique identifier for the achievement
        
        [Key]
        public int Id { get; set; }
        
        
        /// Name of the achievement
        
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;
        
        
        /// Description of the achievement
        
        [Required]
        [StringLength(500)]
        public string Description { get; set; } = string.Empty;
        
        
        /// Points awarded when the achievement is unlocked
        
        [Required]
        public int PointValue { get; set; } = 50;
        
        
        /// Category of the achievement (e.g., "Task", "Streak", "Login")
        
        [Required]
        [StringLength(50)]
        public string Category { get; set; } = string.Empty;
        
        
        /// Criteria for achieving this achievement (JSON or string format)
        
        [StringLength(1000)]
        public string Criteria { get; set; } = string.Empty;
        
        
        /// URI to the achievement's icon
        
        [StringLength(255)]
        public string IconUrl { get; set; } = string.Empty;
        
        
        /// Date when the achievement was created
        
        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        
        /// Date when the achievement was last updated
        
        public DateTime? UpdatedAt { get; set; }
        
        
        /// Flag indicating if the achievement is soft deleted
        
        [Required]
        public bool IsDeleted { get; set; } = false;
        
        
        /// Difficulty level of the achievement
        
        [Required]
        public AchievementDifficulty Difficulty { get; set; } = AchievementDifficulty.Easy;
        
        // Navigation property
        public virtual ICollection<UserAchievement>? UserAchievements { get; set; }
    }
    
    
    /// Enum representing the difficulty level of achievements
    
    public enum AchievementDifficulty
    {
        VeryEasy = 0,
        Easy = 1,
        Medium = 2,
        Hard = 3,
        VeryHard = 4
    }
} 