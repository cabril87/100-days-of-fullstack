using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskTrackerAPI.Models
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
        
        
        /// Target value required to unlock the achievement
        
        [Required]
        public int TargetValue { get; set; }
        
        
        /// URI to the achievement's icon
        
        [StringLength(255)]
        public string IconUrl { get; set; } = string.Empty;
        
        
        /// Date when the achievement was created
        
        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        
        /// Date when the achievement was last updated
        
        public DateTime? UpdatedAt { get; set; }
        
        
        /// Flag indicating if the achievement is active
        
        [Required]
        public bool IsActive { get; set; } = true;
        
        
        /// Difficulty level of the achievement (1-5 scale)
        
        [Required]
        public int Difficulty { get; set; } = 1;
        
        // Navigation property
        public ICollection<UserAchievement>? UserAchievements { get; set; }
    }
} 