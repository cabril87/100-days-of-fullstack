using System;
using System.ComponentModel.DataAnnotations;

namespace TaskTrackerAPI.DTOs.Gamification
{
    public class UserChallengeProgressDTO
    {
        public int Id { get; set; }
        
        [Required]
        public int UserId { get; set; }
        
        [Required]
        public int ChallengeId { get; set; }
        
        public string ChallengeTitle { get; set; } = string.Empty;
        
        public int CurrentProgress { get; set; }
        
        public int RequiredProgress { get; set; }
        
        public bool IsCompleted { get; set; }
        
        public DateTime StartedAt { get; set; }
        
        public DateTime? CompletedAt { get; set; }
    }
} 