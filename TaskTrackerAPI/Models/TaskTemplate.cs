using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text.Json;

namespace TaskTrackerAPI.Models;

public class TaskTemplate
{
    public int Id { get; set; }
    
    [Required]
    [StringLength(100, MinimumLength = 3)]
    public string Name { get; set; } = string.Empty;
    
    [StringLength(500)]
    public string Description { get; set; } = string.Empty;
    
    // Template type to identify special board templates
    public TaskTemplateType Type { get; set; } = TaskTemplateType.Custom;
    
    // Serialized template data - can include board layout, task default settings, etc.
    public string TemplateData { get; set; } = "{}";
    
    // Flag for predefined system templates vs. user-created templates
    public bool IsSystemTemplate { get; set; } = false;
    
    // Optional icon for the template
    public string? IconUrl { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime? UpdatedAt { get; set; }
    
    // Foreign keys
    public int? UserId { get; set; } // Null for system templates
    
    // Navigation properties
    public virtual User? User { get; set; }
    
    // Helper methods to work with template data
    public T? GetTemplateData<T>() where T : class
    {
        if (string.IsNullOrEmpty(TemplateData))
            return null;
            
        return JsonSerializer.Deserialize<T>(TemplateData);
    }
    
    public void SetTemplateData<T>(T data) where T : class
    {
        TemplateData = JsonSerializer.Serialize(data);
    }
}

public enum TaskTemplateType
{
    Custom,
    Board,
    Kanban,
    Timeline,
    Calendar,
    ProjectBoard,
    Checklist,
    Scrum,
    Habit,
    Goal,
    Daily,
    Weekly,
    Monthly
} 