using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace TaskTrackerAPI.Models
{
    public class Challenge
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;
        
        [Required]
        public DateTime StartDate { get; set; }
        
        public DateTime? EndDate { get; set; }
        
        [Required]
        public int PointReward { get; set; }
        
        [Required]
        [MaxLength(50)]
        public string ActivityType { get; set; } = string.Empty;
        
        [Required]
        public int TargetCount { get; set; }
        
        public int? TargetEntityId { get; set; }
        
        public int? RewardBadgeId { get; set; }
        
        [MaxLength(200)]
        public string? AdditionalCriteria { get; set; }
        
        public bool IsActive { get; set; } = true;
        
        [Required]
        public int Difficulty { get; set; } = 1;
        
        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation property
        public ICollection<ChallengeProgress>? ChallengeProgresses { get; set; }
    }
} 