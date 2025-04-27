using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskTrackerAPI.Models.Gamification
{
    
    /// Represents a user's progress towards an achievement
    
    public class UserAchievement
    {
        
        /// Unique identifier for the user achievement
        
        [Key]
        public int Id { get; set; }
        
        
        /// User ID
        
        [Required]
        public string UserId { get; set; } = string.Empty;
        
        
        /// Achievement ID
        
        [Required]
        public int AchievementId { get; set; }
        
        
        /// Progress towards completing the achievement (0-100)
        
        [Required]
        [Range(0, 100)]
        public int Progress { get; set; } = 0;
        
        
        /// Flag indicating if the achievement is completed
        
        [Required]
        public bool IsCompleted { get; set; } = false;
        
        
        /// Date when the user started working on the achievement
        
        public DateTime? StartedAt { get; set; }
        
        
        /// Date when the achievement was completed
        
        public DateTime? CompletedAt { get; set; }
        
        // Navigation properties
        [ForeignKey("AchievementId")]
        public virtual Achievement? Achievement { get; set; }
    }
} 