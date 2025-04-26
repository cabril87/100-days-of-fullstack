using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace TaskTrackerAPI.Models
{
    public class Achievement
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
        public string Criteria { get; set; } = string.Empty;
        
        [Required]
        public int PointValue { get; set; } = 50;
        
        [MaxLength(250)]
        public string? IconPath { get; set; }
        
        [Required]
        public bool IsHidden { get; set; } = false;
        
        [Required]
        public int Difficulty { get; set; } = 1;
        
        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation property
        public ICollection<UserAchievement>? UserAchievements { get; set; }
    }
} 