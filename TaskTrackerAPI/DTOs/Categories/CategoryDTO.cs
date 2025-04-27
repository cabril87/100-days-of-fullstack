using System;
using System.ComponentModel.DataAnnotations;

namespace TaskTrackerAPI.DTOs.Categories
{
    
    /// Data transfer object for categories
    
    public class CategoryDTO
    {
        
        /// Unique identifier for the category
        
        public int Id { get; set; }

        
        /// Name of the category
        
        [Required]
        [StringLength(50, ErrorMessage = "Name cannot exceed 50 characters")]
        public string Name { get; set; } = string.Empty;

        
        /// Description of the category
        
        [StringLength(200, ErrorMessage = "Description cannot exceed 200 characters")]
        public string? Description { get; set; }

        
        /// Color for the category (hex code)
        
        [StringLength(7)]
        public string? Color { get; set; }

        
        /// Icon name or URL
        
        [StringLength(100)]
        public string? Icon { get; set; }

        
        /// User ID who owns this category
        
        public int UserId { get; set; }

        
        /// Date when the category was created
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        
        /// Task count in this category
        
        public int TaskCount { get; set; } = 0;
    }

    
    /// DTO for creating a category
    
    public class CategoryCreateDTO
    {
        
        /// Name of the category
        
        [Required]
        [StringLength(50)]
        public string Name { get; set; } = string.Empty;

        
        /// Description of the category
        
        [StringLength(200)]
        public string? Description { get; set; }

        
        /// Color for the category (hex code)
        
        [StringLength(7)]
        public string? Color { get; set; }

        
        /// Icon name or URL
        
        [StringLength(100)]
        public string? Icon { get; set; }
    }

    
    /// DTO for updating a category
    
    public class CategoryUpdateDTO
    {
        
        /// Name of the category
        
        [StringLength(50)]
        public string? Name { get; set; }

        
        /// Description of the category
        
        [StringLength(200)]
        public string? Description { get; set; }

        
        /// Color for the category (hex code)
        
        [StringLength(7)]
        public string? Color { get; set; }

        
        /// Icon name or URL
        
        [StringLength(100)]
        public string? Icon { get; set; }
    }
} 