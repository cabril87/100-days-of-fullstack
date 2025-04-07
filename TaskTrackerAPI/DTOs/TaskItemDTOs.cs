using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.DTOs;

public class TaskItemDTO
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public TaskItemStatus Status { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public int Priority { get; set; }
    public int UserId { get; set; }
    public int? CategoryId { get; set; }
    public string? CategoryName { get; set; }
    public List<TagDTO> Tags { get; set; } = new List<TagDTO>();
}

public class TaskItemCreateDTO
{
    [Required]
    [StringLength(100, MinimumLength = 3)]
    public string Title { get; set; } = string.Empty;
    
    [StringLength(500)]
    public string? Description { get; set; }
    
    public TaskItemStatus Status { get; set; } = TaskItemStatus.ToDo;
    
    public DateTime? DueDate { get; set; }
    
    public int Priority { get; set; } = 0;
    
    public int? CategoryId { get; set; }
    
    public List<int> TagIds { get; set; } = new List<int>();
}

public class TaskItemUpdateDTO
{
    [StringLength(100, MinimumLength = 3)]
    public string? Title { get; set; }
    
    [StringLength(500)]
    public string? Description { get; set; }
    
    public TaskItemStatus? Status { get; set; }
    
    public DateTime? DueDate { get; set; }
    
    public int? Priority { get; set; }
    
    public int? CategoryId { get; set; }
    
    public List<int>? TagIds { get; set; }
}