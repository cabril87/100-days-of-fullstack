using System;
using System.ComponentModel.DataAnnotations;
using TaskTrackerAPI.DTOs;

namespace TaskTrackerAPI.DTOs.Family;

public class InvitationDTO
{
    public int Id { get; set; }
    public string Token { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public FamilyDTO Family { get; set; } = null!;
    public FamilyRoleDTO FamilyRole { get; set; } = null!;
    public UserDTO CreatedBy { get; set; } = null!;
    public string? Message { get; set; }
    public bool IsAccepted { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime ExpiresAt { get; set; }
    public string? QRCodeData { get; set; }
}

public class InvitationCreateDTO
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
    
    [Required]
    public int FamilyId { get; set; }
    
    [Required]
    public int FamilyRoleId { get; set; }
    
    public string? Message { get; set; }
}