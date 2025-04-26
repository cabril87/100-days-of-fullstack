using System.ComponentModel.DataAnnotations;

namespace TaskTrackerAPI.Models
{
    public class PrincipleDefinition
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;
        
        [MaxLength(100)]
        public string? Icon { get; set; }
    }
} 