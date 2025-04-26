using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace TaskTrackerAPI.Models;

public class Board
{
    public int Id { get; set; }
    
    [Required]
    [StringLength(100, MinimumLength = 3)]
    public string Name { get; set; } = string.Empty;
    
    [StringLength(500)]
    public string Description { get; set; } = string.Empty;
    
    public string Template { get; set; } = "default";
    
    public string? CustomLayout { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime? UpdatedAt { get; set; }
    
    // Foreign key property
    [Required]
    public int UserId { get; set; }
    
    // Navigation properties
    public virtual User? User { get; set; }
    
    public virtual ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();
} 