using System;
using System.ComponentModel.DataAnnotations;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.DTOs.User;

namespace TaskTrackerAPI.DTOs.Family;

public class FamilyMemberDTO
{
    public int Id { get; set; }
    public int FamilyId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? AvatarUrl { get; set; }
    public FamilyRelationship Relationship { get; set; }
    public UserDTO User { get; set; } = null!;
    public FamilyRoleDTO Role { get; set; } = null!;
    public DateTime JoinedAt { get; set; }
}

public class FamilyMemberCreateDTO
{
    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string Name { get; set; } = string.Empty;
    
    [EmailAddress]
    public string? Email { get; set; }
    
    public string? AvatarUrl { get; set; }
    
    public FamilyRelationship Relationship { get; set; } = FamilyRelationship.Other;
    
    [Required]
    public int RoleId { get; set; }
    
    [Required]
    public int FamilyId { get; set; }
}

public class FamilyMemberUpdateDTO
{
    [StringLength(100, MinimumLength = 2)]
    public string? Name { get; set; }
    
    [EmailAddress]
    public string? Email { get; set; }
    
    public string? AvatarUrl { get; set; }
    
    public FamilyRelationship? Relationship { get; set; }
    
    public int? RoleId { get; set; }
} 