using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Models;

public class FamilyMember
{
    public int Id { get; set; }

    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string Name { get; set; } = string.Empty;

    [EmailAddress]
    public string? Email { get; set; }

    public string? AvatarUrl { get; set; }

    public FamilyRelationship Relationship { get; set; } = FamilyRelationship.Other;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    [Required]
    public int UserId { get; set; }

    [Required]
    public int FamilyId { get; set; }
    
    [Required]
    public int RoleId { get; set; }
    
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
    public bool IsPending { get; set; } = true;
    public bool ProfileCompleted { get; set; } = false;
    public DateTime? ApprovedAt { get; set; }

    // Navigation properties
    public virtual User User { get; set; } = null!;
    public virtual Family Family { get; set; } = null!;
    public virtual FamilyRole Role { get; set; } = null!;
    public virtual ICollection<TaskItem> AssignedTasks { get; set; } = new List<TaskItem>();
}