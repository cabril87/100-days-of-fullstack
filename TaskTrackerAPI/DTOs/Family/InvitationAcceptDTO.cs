using System.ComponentModel.DataAnnotations;

namespace TaskTrackerAPI.DTOs.Family
{
    public class InvitationAcceptDTO
    {
        [Required]
        public required string Token { get; set; }
    }
} 