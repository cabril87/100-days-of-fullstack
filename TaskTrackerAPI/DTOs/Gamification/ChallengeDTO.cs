using System;
using System.ComponentModel.DataAnnotations;

namespace TaskTrackerAPI.DTOs.Gamification
{
    
    /// Data transfer object for challenges in the gamification system
    
    public class ChallengeDTO
    {
        
        /// Unique identifier for the challenge
        
        public int Id { get; set; }

        
        /// Name of the challenge
        
        [Required]
        [StringLength(100, ErrorMessage = "Name cannot exceed 100 characters")]
        public string Name { get; set; } = string.Empty;

        
        /// Description of the challenge
        
        [Required]
        [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters")]
        public string Description { get; set; } = string.Empty;

        
        /// Start date of the challenge
        
        [Required]
        public DateTime StartDate { get; set; }

        
        /// End date of the challenge
        
        [Required]
        public DateTime EndDate { get; set; }

        
        /// Points awarded for completing the challenge
        
        [Required]
        [Range(1, 5000, ErrorMessage = "Point reward must be between 1 and 5000")]
        public int PointReward { get; set; }

        
        /// Type of challenge (e.g., "Task", "Streak", "Social")
        
        [Required]
        [StringLength(50, ErrorMessage = "Challenge type cannot exceed 50 characters")]
        public string ChallengeType { get; set; } = string.Empty;

        
        /// Target count to complete the challenge
        
        [Required]
        [Range(1, 10000, ErrorMessage = "Target count must be between 1 and 10000")]
        public int TargetCount { get; set; }

        
        /// Additional criteria for the challenge (e.g., specific task categories)
        
        [StringLength(500, ErrorMessage = "Additional criteria cannot exceed 500 characters")]
        public string? AdditionalCriteria { get; set; }

        
        /// Flag indicating if the challenge is currently active
        
        public bool IsActive { get; set; } = true;

        
        /// Difficulty level of the challenge (1-5 scale)
        
        [Required]
        [Range(1, 5, ErrorMessage = "Difficulty must be between 1 and 5")]
        public int Difficulty { get; set; } = 1;

        
        /// Reward badge ID for completing the challenge (if any)
        
        public int? RewardBadgeId { get; set; }

        
        /// Date when the challenge was created
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
} 