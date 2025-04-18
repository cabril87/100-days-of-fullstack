using System.ComponentModel.DataAnnotations;

namespace TaskTrackerAPI.IntegrationTests.DTOs
{
    public class CategoryUpdateDTO
    {
        [Required]
        [StringLength(50)]
        public string Name { get; set; } = string.Empty;
        
        public string? Description { get; set; }
    }
} 