// Repositories/Interfaces/IUserRepository.cs
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Repositories.Interfaces;

public interface IUserRepository
{
    // User management
    Task<User?> GetUserByIdAsync(int id);
    Task<User?> GetUserByEmailAsync(string email);
    Task<User?> GetUserByUsernameAsync(string username);
    Task<bool> UserExistsByEmailAsync(string email);
    Task<bool> UserExistsByUsernameAsync(string username);
    Task<IEnumerable<User>> GetAllUsersAsync();
    Task<User> CreateUserAsync(User user);
    Task UpdateUserAsync(User user);
    Task DeleteUserAsync(int userId);
    // Password management
    Task<bool> CheckPasswordAsync(User user, string password);
    Task ChangePasswordAsync(User user, string newPassword);
    
    // Refresh token management
    Task<RefreshToken> CreateRefreshTokenAsync(RefreshToken refreshToken);
    Task<RefreshToken?> GetRefreshTokenAsync(string token);
    Task RevokeRefreshTokenAsync(RefreshToken refreshToken, string ipAddress);
    Task RevokeAllUserRefreshTokensAsync(int userId, string ipAddress);
    
    // Authentication helper methods
    Task<bool> IsValidUserCredentialsAsync(string email, string password);
    Task<User?> GetByIdAsync(int id);
}