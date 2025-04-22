using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskTrackerAPI.Models;

public class Notification
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    public int UserId { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string Title { get; set; }
    
    [Required]
    [MaxLength(500)]
    public string Message { get; set; }
    
    [Required]
    [MaxLength(50)]
    public string NotificationType { get; set; }
    
    [Required]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    [Required]
    public bool IsRead { get; set; } = false;
    
    public int? RelatedEntityId { get; set; }
    
    [MaxLength(50)]
    public string RelatedEntityType { get; set; }
    
    public int? CreatedByUserId { get; set; }
    
    // Navigation properties
    [ForeignKey("UserId")]
    public User User { get; set; }
    
    [ForeignKey("CreatedByUserId")]
    public User CreatedBy { get; set; }
}

public enum NotificationType
{
    Info,
    Success,
    Warning,
    Error,
    TaskDue,
    TaskCompleted,
    TaskReminder,
    BoardInvite,
    FamilyAssignment,
    SystemUpdate
} 