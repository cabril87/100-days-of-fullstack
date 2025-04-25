using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskTrackerAPI.Models
{
    public class UserProgress
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public int UserId { get; set; }
        
        [Required]
        public int Level { get; set; } = 1;
        
        [Required]
        public int CurrentPoints { get; set; } = 0;
        
        [Required]
        public int TotalPointsEarned { get; set; } = 0;
        
        [Required]
        public int NextLevelThreshold { get; set; } = 100;
        
        [Required]
        public int CurrentStreak { get; set; } = 0;
        
        [Required]
        public int LongestStreak { get; set; } = 0;
        
        public DateTime? LastActivityDate { get; set; }
        
        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        [Required]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation property
        [ForeignKey("UserId")]
        public User? User { get; set; }
    }
} 