// Services/Interfaces/IAuthService.cs
using System.Security.Claims;
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Services.Interfaces;

public interface IAuthService
{
    // Authentication methods
    Task<UserDTO> RegisterUserAsync(UserCreateDTO userDto);
    Task<TokensResponseDTO> LoginAsync(UserLoginDTO loginDto, string ipAddress);
    Task<TokensResponseDTO> RefreshTokenAsync(string refreshToken, string ipAddress);

    // User profile methods
    Task<UserDTO> GetUserProfileAsync(int userId);
    Task UpdateUserProfileAsync(int userId, UserProfileUpdateDTO updateDto);
    Task DeleteUserAsync(int userId, int currentUserId);
    Task ChangePasswordAsync(int userId, ChangePasswordDTO changePasswordDto, string ipAddress);

    // Admin operations
    Task<IEnumerable<UserDTO>> GetAllUsersAsync();
    Task UpdateUserRoleAsync(int userId, string role, int adminId);

    // Token generation
    string GenerateAccessToken(User user);
    string GenerateRefreshToken();
    ClaimsPrincipal? GetPrincipalFromExpiredToken(string token);
}