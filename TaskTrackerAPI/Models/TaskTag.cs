// Models/TaskTag.cs
namespace TaskTrackerAPI.Models;

public class TaskTag
{
    public int TaskId { get; set; }
    
    public int TagId { get; set; }
    
    // Navigation properties
    public virtual TaskItem? Task { get; set; }
    
    public virtual Tag? Tag { get; set; }
}