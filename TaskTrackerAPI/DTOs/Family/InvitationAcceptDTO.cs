using System.ComponentModel.DataAnnotations;

namespace TaskTrackerAPI.DTOs.Family;

public class InvitationAcceptDTO
{
    [Required]
    public string Token { get; set; } = string.Empty;
} 