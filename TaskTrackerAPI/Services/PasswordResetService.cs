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
using System.Security.Cryptography;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using TaskTrackerAPI.Services.Interfaces;
using TaskTrackerAPI.Repositories.Interfaces;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Services
{
    public class PasswordResetService : IPasswordResetService
    {
        private readonly ILogger<PasswordResetService> _logger;
        private readonly IUserRepository _userRepository;
        private readonly IPasswordResetTokenRepository _passwordResetTokenRepository;
        private readonly IEmailService _emailService;
        private readonly IConfiguration _configuration;

        public PasswordResetService(
            ILogger<PasswordResetService> logger,
            IUserRepository userRepository,
            IPasswordResetTokenRepository passwordResetTokenRepository,
            IEmailService emailService,
            IConfiguration configuration)
        {
            _logger = logger;
            _userRepository = userRepository;
            _passwordResetTokenRepository = passwordResetTokenRepository;
            _emailService = emailService;
            _configuration = configuration;
        }

        public async Task<bool> SendPasswordResetEmailAsync(string email)
        {
            try
            {
                // Check if user exists (but don't reveal if they don't for security)
                var user = await _userRepository.GetUserByEmailAsync(email);
                if (user == null)
                {
                    _logger.LogInformation("Password reset requested for non-existent email: {Email}", email);
                    return true; // Return true to prevent email enumeration
                }

                // Check if there's already an active token for this email (prevent spam)
                var existingToken = await _passwordResetTokenRepository.GetActiveTokenByEmailAsync(email);
                if (existingToken != null)
                {
                    _logger.LogInformation("Active password reset token already exists for email: {Email}", email);
                    // Still send the existing token email to prevent enumeration
                    await _emailService.SendPasswordResetEmailAsync(
                        email, 
                        existingToken.Token, 
                        GetUserDisplayName(user)
                    );
                    return true;
                }

                // Generate reset token
                var resetToken = GenerateResetToken();
                var expirationTime = DateTime.UtcNow.AddHours(24); // 24 hour expiration

                // Create token entity
                var tokenEntity = new PasswordResetToken
                {
                    Email = email,
                    UserId = user.Id,
                    Token = resetToken,
                    ExpirationTime = expirationTime,
                    IsUsed = false,
                    CreatedAt = DateTime.UtcNow
                };

                // Save to repository
                await _passwordResetTokenRepository.CreateAsync(tokenEntity);

                // Clean up expired tokens (background cleanup)
                _ = Task.Run(async () => {
                    try
                    {
                        await _passwordResetTokenRepository.DeleteExpiredTokensAsync();
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Error during background cleanup of expired tokens");
                    }
                });

                // Send email
                var emailSent = await _emailService.SendPasswordResetEmailAsync(
                    email, 
                    resetToken, 
                    GetUserDisplayName(user)
                );

                if (emailSent)
                {
                    _logger.LogInformation("Password reset email sent successfully to {Email}", email);
                }
                else
                {
                    _logger.LogWarning("Failed to send password reset email to {Email}", email);
                    // Delete token if email failed
                    await _passwordResetTokenRepository.DeleteAsync(tokenEntity);
                }

                return emailSent;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending password reset email to {Email}", email);
                return false;
            }
        }

        public async Task<bool> ResetPasswordAsync(string token, string newPassword)
        {
            try
            {
                // Get token from repository
                var resetToken = await _passwordResetTokenRepository.GetByTokenAsync(token);
                if (resetToken == null)
                {
                    _logger.LogWarning("Invalid password reset token attempted: {Token}", token);
                    return false;
                }

                // Check if token is expired
                if (DateTime.UtcNow > resetToken.ExpirationTime)
                {
                    _logger.LogWarning("Expired password reset token attempted: {Token}", token);
                    await _passwordResetTokenRepository.DeleteAsync(resetToken);
                    return false;
                }

                // Check if token is already used
                if (resetToken.IsUsed)
                {
                    _logger.LogWarning("Already used password reset token attempted: {Token}", token);
                    return false;
                }

                // Get user using the proper repository method
                var user = await _userRepository.GetByIdAsync(resetToken.UserId);
                if (user == null)
                {
                    _logger.LogError("User not found for password reset token: {UserId}", resetToken.UserId);
                    await _passwordResetTokenRepository.DeleteAsync(resetToken);
                    return false;
                }

                // Update password using the repository method
                await _userRepository.ChangePasswordAsync(user, newPassword);

                // Mark token as used
                resetToken.IsUsed = true;
                resetToken.UsedAt = DateTime.UtcNow;
                await _passwordResetTokenRepository.UpdateAsync(resetToken);

                // Invalidate all other active tokens for this user for security
                await _passwordResetTokenRepository.InvalidateAllTokensForUserAsync(resetToken.UserId);

                _logger.LogInformation("Password reset successfully for user {UserId}", resetToken.UserId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error resetting password with token {Token}", token);
                return false;
            }
        }

        public async Task<bool> ValidateResetTokenAsync(string token)
        {
            try
            {
                var resetToken = await _passwordResetTokenRepository.GetByTokenAsync(token);
                if (resetToken == null)
                {
                    return false;
                }

                // Check if token is expired or used
                bool isValid = DateTime.UtcNow <= resetToken.ExpirationTime && !resetToken.IsUsed;

                return isValid;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating reset token {Token}", token);
                return false;
            }
        }

        private string GenerateResetToken()
        {
            using var rng = RandomNumberGenerator.Create();
            var tokenBytes = new byte[32];
            rng.GetBytes(tokenBytes);
            return Convert.ToBase64String(tokenBytes).Replace("+", "-").Replace("/", "_").Replace("=", "");
        }

        private string GetUserDisplayName(User user)
        {
            return user.FirstName ?? user.Username ?? "User";
        }
    }
} 