// Repositories/UserRepository.cs
using Microsoft.EntityFrameworkCore;
using TaskTrackerAPI.Data;
using TaskTrackerAPI.Helpers;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories.Interfaces;

namespace TaskTrackerAPI.Repositories;

public class UserRepository : IUserRepository
{
    private readonly ApplicationDbContext _context;
    private readonly AuthHelper _authHelper;

    public UserRepository(ApplicationDbContext context, AuthHelper authHelper)
    {
        _context = context;
        _authHelper = authHelper;
    }

    public async Task<User?> GetUserByIdAsync(int id)
    {
        return await _context.Users
                .FirstOrDefaultAsync(u => u.Id == id && u.IsActive);
    }

    public async Task<User?> GetUserByEmailAsync(string email)
    {
        return await _context.Users
            .FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());
    }

    public async Task<User?> GetUserByUsernameAsync(string username)
    {
        return await _context.Users
            .FirstOrDefaultAsync(u => u.Username.ToLower() == username.ToLower());
    }

    public async Task<bool> UserExistsByEmailAsync(string email)
    {
        return await _context.Users
            .AnyAsync(u => u.Email.ToLower() == email.ToLower());
    }

    public async Task<bool> UserExistsByUsernameAsync(string username)
    {
        return await _context.Users
            .AnyAsync(u => u.Username.ToLower() == username.ToLower());
    }

    public async Task<IEnumerable<User>> GetAllUsersAsync()
    {
        return await _context.Users.Where(u => u.IsActive).ToListAsync();
    }

    public async Task<User> CreateUserAsync(User user)
    {
        await _context.Users.AddAsync(user);
        await _context.SaveChangesAsync();
        return user;
    }

    public async Task UpdateUserAsync(User user)
    {
        _context.Users.Update(user);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteUserAsync(int userId)
    {
        User? user = await _context.Users.FindAsync(userId);
        if (user != null)
        {
            user.IsActive = false;
            user.UpdatedAt = DateTime.Now;
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
        }
    }

    public Task<bool> CheckPasswordAsync(User user, string password)
    {
        try
        {
            bool result = _authHelper.VerifyPasswordHash(password, user.PasswordHash, user.Salt);
            return Task.FromResult(result);
        }
        catch (Exception ex)
        {
            // Log the error but don't expose the specifics in the exception
            Console.WriteLine($"Error verifying password hash: {ex.Message}");
            // Return false in case of any crypto errors
            return Task.FromResult(false);
        }
    }

    public async Task ChangePasswordAsync(User user, string newPassword)
    {
        _authHelper.CreatePasswordHash(newPassword, out string passwordHash, out string salt);
        user.PasswordHash = passwordHash;
        user.Salt = salt;
        user.UpdatedAt = DateTime.Now;
        await UpdateUserAsync(user);
    }

    public async Task<RefreshToken> CreateRefreshTokenAsync(RefreshToken refreshToken)
    {
        await _context.RefreshTokens.AddAsync(refreshToken);
        await _context.SaveChangesAsync();
        return refreshToken;
    }

    public async Task<RefreshToken?> GetRefreshTokenAsync(string token)
    {
        return await _context.RefreshTokens
            .Include(r => r.User)
            .FirstOrDefaultAsync(r => r.Token == token);
    }

    public async Task RevokeRefreshTokenAsync(RefreshToken refreshToken, string ipAddress)
    {
        refreshToken.RevokedByIp = ipAddress;
        _context.RefreshTokens.Update(refreshToken);
        await _context.SaveChangesAsync();
    }

    public async Task RevokeAllUserRefreshTokensAsync(int userId, string ipAddress)
    {
        // Instead of using IsActive property, check expiry and revoked directly
        List<RefreshToken> activeTokens = await _context.RefreshTokens
            .Where(r => r.UserId == userId &&
                   r.ExpiryDate > DateTime.Now &&
                   r.RevokedByIp == null)
            .ToListAsync();

        foreach (RefreshToken token in activeTokens)
        {
            token.RevokedByIp = ipAddress;
        }

        await _context.SaveChangesAsync();
    }

    public async Task<bool> IsValidUserCredentialsAsync(string email, string password)
    {
        User? user = await GetUserByEmailAsync(email);

        if (user == null)
            return false;

        return await CheckPasswordAsync(user, password);
    }
}