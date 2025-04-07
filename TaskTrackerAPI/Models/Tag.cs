// Models/Tag.cs
using System.ComponentModel.DataAnnotations;

namespace TaskTrackerAPI.Models;

public class Tag
{
    public int Id { get; set; }
    
    [Required]
    [StringLength(30)]
    public required string Name { get; set; }
    
    [Required]
    public required int UserId { get; set; }
    
    // Navigation properties
    public virtual User? User { get; set; }
    
    public virtual ICollection<TaskTag> TaskTags { get; set; } = new List<TaskTag>();
}