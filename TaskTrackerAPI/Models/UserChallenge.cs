using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskTrackerAPI.Models
{
    public class UserChallenge
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public int UserId { get; set; }
        
        [Required]
        public int ChallengeId { get; set; }
        
        [Required]
        public DateTime EnrolledAt { get; set; } = DateTime.UtcNow;
        
        public int CurrentProgress { get; set; } = 0;
        
        public bool IsCompleted { get; set; } = false;
        
        public DateTime? CompletedAt { get; set; }
        
        public bool IsRewardClaimed { get; set; } = false;
        
        // Navigation properties
        [ForeignKey("UserId")]
        public User? User { get; set; }
        
        [ForeignKey("ChallengeId")]
        public Challenge? Challenge { get; set; }
    }
} 