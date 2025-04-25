using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskTrackerAPI.Models
{
    public class UserBadge
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public int UserId { get; set; }
        
        [Required]
        public int BadgeId { get; set; }
        
        [Required]
        public DateTime AwardedAt { get; set; } = DateTime.UtcNow;
        
        [Required]
        public bool IsDisplayed { get; set; } = true;
        
        // Navigation properties
        [ForeignKey("UserId")]
        public User? User { get; set; }
        
        [ForeignKey("BadgeId")]
        public Badge? Badge { get; set; }
    }
} 