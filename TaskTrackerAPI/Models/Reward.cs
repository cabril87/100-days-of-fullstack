using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace TaskTrackerAPI.Models
{
    public class Reward
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
        public int PointCost { get; set; }
        
        [Required]
        public int MinimumLevel { get; set; } = 1;
        
        [MaxLength(250)]
        public string? IconPath { get; set; }
        
        [Required]
        public bool IsActive { get; set; } = true;
        
        public int? Quantity { get; set; }
        
        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? ExpirationDate { get; set; }
        
        // Navigation property
        public ICollection<UserReward>? UserRewards { get; set; }
    }
} 