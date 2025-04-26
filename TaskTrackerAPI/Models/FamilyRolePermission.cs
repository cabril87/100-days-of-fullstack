using System;

namespace TaskTrackerAPI.Models;

public class FamilyRolePermission
{
    public int Id { get; set; }
    public int RoleId { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation property
    public FamilyRole Role { get; set; } = null!;
} 