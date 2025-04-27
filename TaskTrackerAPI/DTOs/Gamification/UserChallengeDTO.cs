using System;
using System.ComponentModel.DataAnnotations;

namespace TaskTrackerAPI.DTOs.Gamification
{
    
    /// Data transfer object for user-enrolled challenges
    
    public class UserChallengeDTO
    {
        
        /// Unique identifier for the user-challenge relationship
        
        public int Id { get; set; }

        
        /// User identifier
        
        [Required]
        public int UserId { get; set; }

        
        /// Challenge identifier
        
        [Required]
        public int ChallengeId { get; set; }

        
        /// The associated challenge
        
        public ChallengeDTO Challenge { get; set; } = null!;

        
        /// Date when the user enrolled in the challenge
        
        public DateTime EnrolledAt { get; set; } = DateTime.UtcNow;

        
        /// Current progress toward completing the challenge
        
        public int CurrentProgress { get; set; } = 0;

        
        /// Whether the challenge has been completed
        
        public bool IsComplete { get; set; } = false;

        
        /// Date when the challenge was completed
        
        public DateTime? CompletedAt { get; set; }

        
        /// Whether the reward for completing the challenge has been claimed
        
        public bool IsRewardClaimed { get; set; } = false;

        
        /// Date when the reward was claimed
        
        public DateTime? RewardClaimedAt { get; set; }
    }

    
    /// DTO for enrolling in a challenge
    
    public class EnrollChallengeDTO
    {
        
        /// Challenge ID to enroll in
        
        [Required]
        public int ChallengeId { get; set; }
    }

    
    /// DTO for updating challenge progress
    
    public class ChallengeProgressDTO
    {
        
        /// Type of activity that contributes to the challenge
        
        [Required]
        [StringLength(50, ErrorMessage = "Activity type cannot exceed 50 characters")]
        public string ActivityType { get; set; } = string.Empty;

        
        /// ID of the related entity (e.g., task ID for task-related activities)
        
        public int? RelatedEntityId { get; set; }
        
        
        /// Custom progress value (if applicable)
        
        public int? ProgressValue { get; set; }
    }
} 