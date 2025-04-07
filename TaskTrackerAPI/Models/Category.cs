// Models/Category.cs
using System.ComponentModel.DataAnnotations;

namespace TaskTrackerAPI.Models;

public class Category
{
    public int Id { get; set; }

    [Required]
    [StringLength(50)]
    public required string Name { get; set; }

    public string? Description { get; set; }

    [Required]
    public required int UserId { get; set; }

    // Navigation properties
    public virtual User? User { get; set; }

    // In Category.cs
    public virtual ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();
}