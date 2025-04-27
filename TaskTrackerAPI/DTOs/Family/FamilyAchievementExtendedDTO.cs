using System.ComponentModel.DataAnnotations;

namespace TaskTrackerAPI.DTOs.Family
{
    
    /// DTO for updating progress on an achievement
    
    public class ProgressUpdateDTO
    {
        
        /// The amount to increase the progress by. Defaults to 1.
        
        [Required]
        [Range(1, 100, ErrorMessage = "Progress increase must be between 1 and 100")]
        public int ProgressIncrease { get; set; } = 1;

        
        /// The ID of the family member associated with this progress update
        
        [Required]
        public int MemberId { get; set; }
    }

    
    /// DTO for tracking task completion for an achievement
    
    public class TaskCompletionDTO
    {
        
        /// The ID of the family member who completed the task
        
        [Required]
        public int MemberId { get; set; }
    }
} 