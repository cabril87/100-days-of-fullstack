using System.ComponentModel.DataAnnotations;

namespace TaskTrackerAPI.Models
{
    public class PriorityMultiplier
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        [MaxLength(50)]
        public string Priority { get; set; } = string.Empty;
        
        [Required]
        public double Multiplier { get; set; } = 1.0;
    }
} 