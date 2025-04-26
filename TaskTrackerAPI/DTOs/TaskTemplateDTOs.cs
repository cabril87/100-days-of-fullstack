using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.DTOs;

public class TaskTemplateDTO
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public TaskTemplateType Type { get; set; }
    public string TemplateData { get; set; } = string.Empty;
    public bool IsSystemTemplate { get; set; }
    public string? IconUrl { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class CreateTaskTemplateDTO
{
    [Required]
    [StringLength(100, MinimumLength = 3)]
    public string Name { get; set; } = string.Empty;
    
    [StringLength(500)]
    public string Description { get; set; } = string.Empty;
    
    public TaskTemplateType Type { get; set; } = TaskTemplateType.Custom;
    
    public string TemplateData { get; set; } = "{}";
    
    public string? IconUrl { get; set; }
}

public class UpdateTaskTemplateDTO
{
    [StringLength(100, MinimumLength = 3)]
    public string? Name { get; set; }
    
    [StringLength(500)]
    public string? Description { get; set; }
    
    public TaskTemplateType? Type { get; set; }
    
    public string? TemplateData { get; set; }
    
    public string? IconUrl { get; set; }
}

public class ApplyTemplateDTO
{
    // Optional parameters to customize the template application
    public string? CustomName { get; set; }
    
    public int? BoardId { get; set; }
    
    public int? CategoryId { get; set; }
    
    public DateTime? StartDate { get; set; }
    
    public Dictionary<string, string>? CustomParameters { get; set; }
}

public class TemplateApplicationResultDTO
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public List<TaskItemDTO> CreatedTasks { get; set; } = new List<TaskItemDTO>();
    public BoardDTO? CreatedBoard { get; set; }
    public int CreatedItemsCount { get; set; }
} 