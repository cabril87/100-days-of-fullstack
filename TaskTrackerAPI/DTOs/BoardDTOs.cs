using System;
using System.ComponentModel.DataAnnotations;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.DTOs;

public class BoardDTO
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Template { get; set; } = string.Empty;
    public string? CustomLayout { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public int TaskCount { get; set; }
}

public class BoardDetailDTO : BoardDTO
{
    public IEnumerable<TaskItemDTO> Tasks { get; set; } = new List<TaskItemDTO>();
}

public class CreateBoardDTO
{
    [Required]
    [StringLength(100, MinimumLength = 3)]
    public string Name { get; set; } = string.Empty;
    
    [StringLength(500)]
    public string Description { get; set; } = string.Empty;
    
    public string Template { get; set; } = "default";
    
    public string? CustomLayout { get; set; }
}

public class UpdateBoardDTO
{
    [StringLength(100, MinimumLength = 3)]
    public string? Name { get; set; }
    
    [StringLength(500)]
    public string? Description { get; set; }
    
    public string? Template { get; set; }
    
    public string? CustomLayout { get; set; }
}

public class TaskReorderDTO
{
    [Required]
    public int TaskId { get; set; }
    
    public int? PositionX { get; set; }
    
    public int? PositionY { get; set; }
    
    public int? BoardOrder { get; set; }
} 