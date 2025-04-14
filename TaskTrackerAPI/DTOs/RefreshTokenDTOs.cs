// DTOs/RefreshTokenDTOs.cs
using System.ComponentModel.DataAnnotations;

namespace TaskTrackerAPI.DTOs;

public class RefreshTokenRequestDTO
{
    [Required]
    public string RefreshToken { get; set; } = string.Empty;
}

public class TokensResponseDTO
{
    public string AccessToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public DateTime Expiration { get; set; }
    public UserDTO User { get; set; } = null!;
}