using System.ComponentModel.DataAnnotations;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.DTOs.Family;

public class CompleteProfileDTO
{
    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
    
    [Required]
    public FamilyRelationship Relationship { get; set; }
    
    [Required]
    [Range(1, 120)]
    public int Age { get; set; }
    
    public string? AvatarUrl { get; set; }
    
    [StringLength(500)]
    public string? Bio { get; set; }
    
    [Required]
    public bool AcceptTerms { get; set; }
}

public class RejectMemberDTO
{
    [Required]
    [StringLength(500)]
    public string Reason { get; set; } = string.Empty;
} 