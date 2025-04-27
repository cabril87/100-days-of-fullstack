using System;
using System.ComponentModel.DataAnnotations;

namespace TaskTrackerAPI.DTOs.Tags
{
    
    /// Data transfer object for tags
    
    public class TagDTO
    {
        
        /// Unique identifier for the tag
        
        public int Id { get; set; }

        
        /// Name of the tag
        
        [Required]
        [StringLength(30, ErrorMessage = "Name cannot exceed 30 characters")]
        public string Name { get; set; } = string.Empty;

        
        /// Color for the tag (hex code)
        
        [StringLength(7)]
        public string? Color { get; set; }

        
        /// User ID who owns this tag
        
        public int UserId { get; set; }

        
        /// Date when the tag was created
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        
        /// Number of tasks using this tag
        
        public int UsageCount { get; set; } = 0;
    }

    
    /// DTO for creating a tag
    
    public class TagCreateDTO
    {
        
        /// Name of the tag
        
        [Required]
        [StringLength(30)]
        public string Name { get; set; } = string.Empty;

        
        /// Color for the tag (hex code)
        
        [StringLength(7)]
        public string? Color { get; set; }
    }

    
    /// DTO for updating a tag
    
    public class TagUpdateDTO
    {
        
        /// Name of the tag
        
        [StringLength(30)]
        public string? Name { get; set; }

        
        /// Color for the tag (hex code)
        
        [StringLength(7)]
        public string? Color { get; set; }
    }
} 