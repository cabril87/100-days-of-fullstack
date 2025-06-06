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
// Repositories/Interfaces/IUserRepository.cs
using System.Collections.Generic;
using System.Threading.Tasks;
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
    Task UpdateRefreshTokenAsync(RefreshToken refreshToken);
    Task RevokeRefreshTokenFamilyAsync(int userId, string ipAddress, string? reason = null);
    Task<IEnumerable<RefreshToken>> GetRefreshTokensByFamilyAsync(string tokenFamily);
    
    // Authentication helper methods
    Task<bool> IsValidUserCredentialsAsync(string email, string password);
    Task<User?> GetByIdAsync(int id);
    
    // MFA methods
    Task<bool> IsMFAEnabledAsync(int userId);
    Task<string?> GetMFASecretAsync(int userId);
    Task UpdateMFASecretAsync(int userId, string secret);
    Task EnableMFAAsync(int userId, string secret, string backupCodes);
    Task DisableMFAAsync(int userId);
    Task UpdateBackupCodesAsync(int userId, string backupCodes);
}