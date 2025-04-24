using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace TaskTrackerAPI.DTOs.Family;

public class FamilyRoleDTO
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public List<string> Permissions { get; set; } = new();
    public bool IsDefault { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class FamilyRoleCreateDTO
{
    [Required]
    [StringLength(50)]
    public string Name { get; set; } = string.Empty;
    
    [StringLength(200)]
    public string Description { get; set; } = string.Empty;
    
    public List<string> Permissions { get; set; } = new();
    
    public bool IsDefault { get; set; } = false;
}

public class FamilyRoleUpdateDTO
{
    [StringLength(50)]
    public string? Name { get; set; }
    
    [StringLength(200)]
    public string? Description { get; set; }
    
    public List<string>? Permissions { get; set; }
    
    public bool? IsDefault { get; set; }
} 