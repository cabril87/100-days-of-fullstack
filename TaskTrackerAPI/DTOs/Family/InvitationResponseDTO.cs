using System;

namespace TaskTrackerAPI.DTOs.Family
{
    public class InvitationResponseDTO
    {
        public required string Token { get; set; }
        public required string FamilyName { get; set; }
        public required string RoleName { get; set; }
        public required string InvitedBy { get; set; }
        public DateTime ExpiresAt { get; set; }
        public bool IsExpired => DateTime.UtcNow > ExpiresAt;
    }
} 