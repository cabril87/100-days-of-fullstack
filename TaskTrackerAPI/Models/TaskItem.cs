// Models/TaskItem.cs (formerly Task.cs)
using System.ComponentModel.DataAnnotations;

namespace TaskTrackerAPI.Models;

public class TaskItem // Changed from Task to TaskItem
{
    public int Id { get; set; }
    
    [Required]
    [StringLength(100, MinimumLength = 3)]
    public required string Title { get; set; }
    
    [StringLength(500)]
    public string? Description { get; set; }
    
    [Required]
    public TaskItemStatus Status { get; set; } = TaskItemStatus.ToDo; // Changed from TaskStatus to TaskItemStatuss   
    public DateTime? DueDate { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime? UpdatedAt { get; set; }
    
    public int Priority { get; set; } = 0;
    
    // Foreign keys
    [Required]
    public required int UserId { get; set; }
    
    public int? CategoryId { get; set; }
    
    // Navigation properties
    public virtual User? User { get; set; }
    
    public virtual Category? Category { get; set; }
}

// The enum can stay the same
public enum TaskItemStatus // Changed from TaskStatus to TaskItemStatus
{
    ToDo,
    InProgress,
    OnHold,
    Completed,
    Cancelled
}