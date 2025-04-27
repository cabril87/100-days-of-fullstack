using System.ComponentModel.DataAnnotations;

namespace TaskTrackerAPI.DTOs.Gamification
{
    
    /// DTO for creating or updating an Achievement
    
    public class AchievementCreateUpdateDTO
    {
        
        /// Name of the achievement
        
        [Required]
        [StringLength(100, ErrorMessage = "Name cannot exceed 100 characters")]
        public string Name { get; set; } = string.Empty;

        
        /// Description of the achievement
        
        [Required]
        [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters")]
        public string Description { get; set; } = string.Empty;

        
        /// Category of the achievement (e.g., "Task", "Streak", "Login")
        
        [Required]
        [StringLength(50, ErrorMessage = "Category cannot exceed 50 characters")]
        public string Category { get; set; } = string.Empty;

        
        /// Points awarded when the achievement is unlocked
        
        [Required]
        [Range(1, 1000, ErrorMessage = "Point value must be between 1 and 1000")]
        public int PointValue { get; set; } 

        
        /// URI to the achievement's icon
        
        [StringLength(255, ErrorMessage = "Icon URL cannot exceed 255 characters")]
        public string IconUrl { get; set; } = string.Empty;

        
        /// Difficulty level of the achievement (1-5 scale)
        
        [Required]
        [Range(0, 4, ErrorMessage = "Difficulty must be between 0 and 4, representing VeryEasy to VeryHard")]
        public int Difficulty { get; set; }

        
        /// Target value required to unlock the achievement
        
        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Target value must be greater than 0")]
        public int TargetValue { get; set; }
    }
} 