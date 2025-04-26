using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace TaskTrackerAPI.Models
{
    public class Badge
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
        [MaxLength(50)]
        public string Category { get; set; } = string.Empty;
        
        [Required]
        public int PointValue { get; set; } = 100;
        
        [Required]
        [MaxLength(250)]
        public string IconPath { get; set; } = string.Empty;
        
        public int? RequiredAchievementId { get; set; }
        
        [Required]
        public bool IsSpecial { get; set; } = false;
        
        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation property
        public ICollection<UserBadge>? UserBadges { get; set; }
    }
} 