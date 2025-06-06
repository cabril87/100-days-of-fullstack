/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 *
 * This file may not be used, copied, modified, or distributed except in
 * accordance with the terms contained in the LICENSE file.
 */
// Repositories/UserRepository.cs
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
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
        if (string.IsNullOrEmpty(email))
            return null;
            
        return await _context.Users
            .AsNoTracking()
            .ToListAsync()
            .ContinueWith(t => t.Result.FirstOrDefault(u => 
                string.Equals(u.Email, email, StringComparison.OrdinalIgnoreCase)));
    }

    public async Task<User?> GetUserByUsernameAsync(string username)
    {
        if (string.IsNullOrEmpty(username))
            return null;
            
        return await _context.Users
            .AsNoTracking()
            .ToListAsync()
            .ContinueWith(t => t.Result.FirstOrDefault(u => 
                string.Equals(u.Username, username, StringComparison.OrdinalIgnoreCase)));
    }

    public async Task<bool> UserExistsByEmailAsync(string email)
    {
        if (string.IsNullOrEmpty(email))
            return false;
            
        return await _context.Users
            .AsNoTracking()
            .ToListAsync()
            .ContinueWith(t => t.Result.Any(u => 
                string.Equals(u.Email, email, StringComparison.OrdinalIgnoreCase)));
    }

    public async Task<bool> UserExistsByUsernameAsync(string username)
    {
        if (string.IsNullOrEmpty(username))
            return false;
            
        return await _context.Users
            .AsNoTracking()
            .ToListAsync()
            .ContinueWith(t => t.Result.Any(u => 
                string.Equals(u.Username, username, StringComparison.OrdinalIgnoreCase)));
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
        refreshToken.RevokedDate = DateTime.UtcNow;
        refreshToken.ReasonRevoked = "Replaced by new token";
        _context.RefreshTokens.Update(refreshToken);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateRefreshTokenAsync(RefreshToken refreshToken)
    {
        _context.RefreshTokens.Update(refreshToken);
        await _context.SaveChangesAsync();
    }

    public async Task RevokeRefreshTokenFamilyAsync(int userId, string ipAddress, string? reason = null)
    {
        // Get all active tokens for this user with the same family
        IEnumerable<RefreshToken> userTokens = await _context.RefreshTokens
            .Where(r => r.UserId == userId && r.RevokedByIp == null)
            .ToListAsync();

        // If we have a token family structure, use it
        IEnumerable<IGrouping<string?, RefreshToken>> tokenFamilies = userTokens
            .Where(t => !string.IsNullOrEmpty(t.TokenFamily))
            .GroupBy(t => t.TokenFamily)
            .ToList();

        foreach (IGrouping<string?, RefreshToken> tokenFamily in tokenFamilies)
        {
            foreach (RefreshToken token in tokenFamily)
            {
                token.RevokedByIp = ipAddress;
                token.RevokedDate = DateTime.UtcNow;
                token.ReasonRevoked = reason ?? "Security violation detected";
            }
        }

        // Also revoke any tokens without family (legacy tokens)
        foreach (RefreshToken token in userTokens.Where(t => string.IsNullOrEmpty(t.TokenFamily)))
        {
            token.RevokedByIp = ipAddress;
            token.RevokedDate = DateTime.UtcNow;
            token.ReasonRevoked = reason ?? "Security violation detected";
        }

        await _context.SaveChangesAsync();
    }

    public async Task<IEnumerable<RefreshToken>> GetRefreshTokensByFamilyAsync(string tokenFamily)
    {
        if (string.IsNullOrEmpty(tokenFamily))
            return new List<RefreshToken>();

        return await _context.RefreshTokens
            .Where(r => r.TokenFamily == tokenFamily)
            .OrderByDescending(r => r.CreatedDate)
            .ToListAsync();
    }

    public async Task<bool> IsValidUserCredentialsAsync(string email, string password)
    {
        User? user = await GetUserByEmailAsync(email);

        if (user == null)
            return false;

        return await CheckPasswordAsync(user, password);
    }

    public async Task<User?> GetByIdAsync(int id)
    {
        return await _context.Users
            .FirstOrDefaultAsync(u => u.Id == id);
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
            token.RevokedDate = DateTime.UtcNow;
            token.ReasonRevoked = "Logged out";
        }

        await _context.SaveChangesAsync();
    }

    #region MFA Methods

    /// <summary>
    /// Checks if MFA is enabled for a user
    /// </summary>
    public async Task<bool> IsMFAEnabledAsync(int userId)
    {
        User? user = await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == userId && u.IsActive);
        
        return user?.MFAEnabled == true;
    }

    /// <summary>
    /// Gets the MFA secret for a user
    /// </summary>
    public async Task<string?> GetMFASecretAsync(int userId)
    {
        User? user = await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == userId && u.IsActive);
        
        return user?.MFASecret;
    }

    /// <summary>
    /// Updates the MFA secret for a user (during setup)
    /// </summary>
    public async Task UpdateMFASecretAsync(int userId, string secret)
    {
        User? user = await _context.Users.FindAsync(userId);
        if (user != null && user.IsActive)
        {
            user.MFASecret = secret;
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }

    /// <summary>
    /// Enables MFA for a user with secret and backup codes
    /// </summary>
    public async Task EnableMFAAsync(int userId, string secret, string backupCodes)
    {
        User? user = await _context.Users.FindAsync(userId);
        if (user != null && user.IsActive)
        {
            user.MFAEnabled = true;
            user.MFASecret = secret;
            user.BackupCodes = backupCodes;
            user.MFASetupDate = DateTime.UtcNow;
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }

    /// <summary>
    /// Disables MFA for a user
    /// </summary>
    public async Task DisableMFAAsync(int userId)
    {
        User? user = await _context.Users.FindAsync(userId);
        if (user != null && user.IsActive)
        {
            user.MFAEnabled = false;
            user.MFASecret = null;
            user.BackupCodes = null;
            user.MFASetupDate = null;
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }

    /// <summary>
    /// Updates backup codes for a user
    /// </summary>
    public async Task UpdateBackupCodesAsync(int userId, string backupCodes)
    {
        User? user = await _context.Users.FindAsync(userId);
        if (user != null && user.IsActive)
        {
            user.BackupCodes = backupCodes;
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }

    #endregion
}