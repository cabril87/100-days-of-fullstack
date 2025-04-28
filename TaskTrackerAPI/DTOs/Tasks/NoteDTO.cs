using System;
using System.ComponentModel.DataAnnotations;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.DTOs.Tasks
{
    public class NoteDTO
    {
        public int Id { get; set; }
        
        public string Title { get; set; } = string.Empty;
        
        public string Content { get; set; } = string.Empty;
        
        public string Category { get; set; } = "General";
        
        public string Format { get; set; } = "PlainText";
        
        public bool IsPinned { get; set; } = false;
        
        public bool IsArchived { get; set; } = false;
        
        public DateTime CreatedAt { get; set; }
        
        public DateTime? UpdatedAt { get; set; }
        
        public int UserId { get; set; }
        
        public string Username { get; set; } = string.Empty;
        
        public int? TaskItemId { get; set; }
    }

    public class NoteCreateDTO
    {
        [Required]
        [StringLength(200, MinimumLength = 1)]
        public string Title { get; set; } = string.Empty;
        
        [Required]
        public string Content { get; set; } = string.Empty;
        
        public string Category { get; set; } = "General";
        
        public string Format { get; set; } = "PlainText";
        
        public bool IsPinned { get; set; } = false;
        
        public int? TaskItemId { get; set; }
    }

    public class NoteUpdateDTO
    {
        [StringLength(200, MinimumLength = 1)]
        public string? Title { get; set; }
        
        public string? Content { get; set; }
        
        public string? Category { get; set; }
        
        public string? Format { get; set; }
        
        public bool? IsPinned { get; set; }
        
        public bool? IsArchived { get; set; }
    }
} 