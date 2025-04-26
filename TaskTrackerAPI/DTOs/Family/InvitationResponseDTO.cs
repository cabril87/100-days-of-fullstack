using System;

namespace TaskTrackerAPI.DTOs.Family;

public class InvitationResponseDTO
{
    public string Token { get; set; } = string.Empty;
    public string FamilyName { get; set; } = string.Empty;
    public string RoleName { get; set; } = string.Empty;
    public string InvitedBy { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public bool IsExpired => DateTime.UtcNow > ExpiresAt;
} 