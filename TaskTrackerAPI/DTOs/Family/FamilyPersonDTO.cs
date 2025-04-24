using System;
using System.ComponentModel.DataAnnotations;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.DTOs;

namespace TaskTrackerAPI.DTOs.Family;

public class FamilyPersonDTO
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? AvatarUrl { get; set; }
    public FamilyRelationship Relationship { get; set; }
    public int FamilyId { get; set; }
    public string FamilyName { get; set; } = string.Empty;
}

public class FamilyPersonDetailDTO : FamilyPersonDTO
{
    public UserDTO? User { get; set; }
    public DateTime JoinedAt { get; set; }
    public int? UserId { get; set; }
    public List<string>? Permissions { get; set; }
}

public class CreateFamilyPersonDTO
{
    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string Name { get; set; } = string.Empty;
    
    [EmailAddress]
    public string? Email { get; set; }
    
    public string? AvatarUrl { get; set; }
    
    public FamilyRelationship Relationship { get; set; } = FamilyRelationship.Other;
    
    [Required]
    public int FamilyId { get; set; }
    
    public int? UserId { get; set; }
}

public class UpdateFamilyPersonDTO
{
    [StringLength(100, MinimumLength = 2)]
    public string? Name { get; set; }
    
    [EmailAddress]
    public string? Email { get; set; }
    
    public string? AvatarUrl { get; set; }
    
    public FamilyRelationship? Relationship { get; set; }
    
    public int? UserId { get; set; }
} 