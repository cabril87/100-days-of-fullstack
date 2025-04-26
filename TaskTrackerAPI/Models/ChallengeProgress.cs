using System;
using System.ComponentModel.DataAnnotations;

namespace TaskTrackerAPI.Models
{
    public class ChallengeProgress
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public int UserId { get; set; }
        
        [Required]
        public int ChallengeId { get; set; }
        
        [Required]
        public int CurrentProgress { get; set; }
        
        [Required]
        public bool IsCompleted { get; set; }
        
        [Required]
        public DateTime EnrolledAt { get; set; }
        
        public DateTime? CompletedAt { get; set; }
        
        // Additional stats tracking
        public int TasksCompleted { get; set; }
        
        public int PointsEarned { get; set; }
        
        // Navigation properties
        public User? User { get; set; }
        
        public Challenge? Challenge { get; set; }
    }
} 