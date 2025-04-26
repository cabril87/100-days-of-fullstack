using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskTrackerAPI.Models
{
    public class UserReward
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public int UserId { get; set; }
        
        [Required]
        public int RewardId { get; set; }
        
        [Required]
        public DateTime RedeemedAt { get; set; } = DateTime.UtcNow;
        
        [Required]
        public bool IsUsed { get; set; } = false;
        
        public DateTime? UsedAt { get; set; }
        
        // Navigation properties
        [ForeignKey("UserId")]
        public User? User { get; set; }
        
        [ForeignKey("RewardId")]
        public Reward? Reward { get; set; }
    }
} 