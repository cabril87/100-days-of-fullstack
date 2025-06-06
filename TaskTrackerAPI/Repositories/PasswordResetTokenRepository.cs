/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 */

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.Data;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories.Interfaces;

namespace TaskTrackerAPI.Repositories
{
    public class PasswordResetTokenRepository : IPasswordResetTokenRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<PasswordResetTokenRepository> _logger;

        public PasswordResetTokenRepository(ApplicationDbContext context, ILogger<PasswordResetTokenRepository> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<PasswordResetToken?> GetByTokenAsync(string token)
        {
            try
            {
                return await _context.PasswordResetTokens
                    .Include(t => t.User)
                    .FirstOrDefaultAsync(t => t.Token == token);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting password reset token: {Token}", token);
                throw;
            }
        }

        public async Task<PasswordResetToken?> GetActiveTokenByEmailAsync(string email)
        {
            try
            {
                return await _context.PasswordResetTokens
                    .Include(t => t.User)
                    .Where(t => t.Email == email && 
                               !t.IsUsed && 
                               t.ExpirationTime > DateTime.UtcNow)
                    .OrderByDescending(t => t.CreatedAt)
                    .FirstOrDefaultAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting active password reset token for email: {Email}", email);
                throw;
            }
        }

        public async Task<PasswordResetToken> CreateAsync(PasswordResetToken token)
        {
            try
            {
                _context.PasswordResetTokens.Add(token);
                await _context.SaveChangesAsync();
                _logger.LogInformation("Created password reset token for user {UserId}", token.UserId);
                return token;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating password reset token for user {UserId}", token.UserId);
                throw;
            }
        }

        public async Task UpdateAsync(PasswordResetToken token)
        {
            try
            {
                _context.PasswordResetTokens.Update(token);
                await _context.SaveChangesAsync();
                _logger.LogInformation("Updated password reset token {TokenId}", token.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating password reset token {TokenId}", token.Id);
                throw;
            }
        }

        public async Task DeleteAsync(PasswordResetToken token)
        {
            try
            {
                _context.PasswordResetTokens.Remove(token);
                await _context.SaveChangesAsync();
                _logger.LogInformation("Deleted password reset token {TokenId}", token.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting password reset token {TokenId}", token.Id);
                throw;
            }
        }

        public async Task DeleteExpiredTokensAsync()
        {
            try
            {
                IQueryable<PasswordResetToken> expiredTokens = _context.PasswordResetTokens
                    .Where(t => t.ExpirationTime <= DateTime.UtcNow);

                int count = await expiredTokens.CountAsync();
                if (count > 0)
                {
                    _context.PasswordResetTokens.RemoveRange(expiredTokens);
                    await _context.SaveChangesAsync();
                    _logger.LogInformation("Deleted {Count} expired password reset tokens", count);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting expired password reset tokens");
                throw;
            }
        }

        public async Task<bool> ExistsActiveTokenForEmailAsync(string email)
        {
            try
            {
                return await _context.PasswordResetTokens
                    .AnyAsync(t => t.Email == email && 
                                  !t.IsUsed && 
                                  t.ExpirationTime > DateTime.UtcNow);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking for active password reset token for email: {Email}", email);
                throw;
            }
        }

        public async Task InvalidateAllTokensForUserAsync(int userId)
        {
            try
            {
                List<PasswordResetToken> activeTokens = await _context.PasswordResetTokens
                    .Where(t => t.UserId == userId && !t.IsUsed)
                    .ToListAsync();

                foreach (PasswordResetToken token in activeTokens)
                {
                    token.IsUsed = true;
                    token.UsedAt = DateTime.UtcNow;
                }

                if (activeTokens.Count > 0)
                {
                    await _context.SaveChangesAsync();
                    _logger.LogInformation("Invalidated {Count} active password reset tokens for user {UserId}", 
                        activeTokens.Count, userId);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error invalidating password reset tokens for user {UserId}", userId);
                throw;
            }
        }
    }
} 