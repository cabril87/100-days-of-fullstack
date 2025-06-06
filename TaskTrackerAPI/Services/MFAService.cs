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
// Services/MFAService.cs
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using OtpNet;
using QRCoder;
using TaskTrackerAPI.Services.Interfaces;
using TaskTrackerAPI.Repositories.Interfaces;
using TaskTrackerAPI.DTOs.Auth;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Helpers;

namespace TaskTrackerAPI.Services;

/// <summary>
/// Service for Multi-Factor Authentication (MFA) operations using TOTP
/// </summary>
public class MFAService : IMFAService
{
    private readonly ILogger<MFAService> _logger;
    private readonly IUserRepository _userRepository;
    private readonly IConfiguration _configuration;
    private readonly AuthHelper _authHelper;
    private const string ISSUER = "Family TaskTracker";
    private const int BACKUP_CODES_COUNT = 10;
    private const int BACKUP_CODE_LENGTH = 8;

    /// <summary>
    /// Initializes a new instance of the MFAService
    /// </summary>
    public MFAService(
        ILogger<MFAService> logger,
        IUserRepository userRepository,
        IConfiguration configuration,
        AuthHelper authHelper)
    {
        _logger = logger;
        _userRepository = userRepository;
        _configuration = configuration;
        _authHelper = authHelper;
    }

    /// <summary>
    /// Initiates MFA setup for a user by generating secret and QR code
    /// </summary>
    public async Task<MFASetupInitiateDTO> InitiateMFASetupAsync(int userId)
    {
        try
        {
            User? user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                throw new ArgumentException("User not found");
            }

            if (user.MFAEnabled)
            {
                throw new InvalidOperationException("MFA is already enabled for this user");
            }

            // Generate secret key
            byte[] secretBytes = new byte[20]; // 160 bits for strong security
            using (RandomNumberGenerator rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(secretBytes);
            }

            string secret = Base32Encoding.ToString(secretBytes);

            // Create setup URI for QR code
            string setupUri = $"otpauth://totp/{ISSUER}:{user.Email}?secret={secret}&issuer={ISSUER}";

            // Generate QR code
            string qrCodeBase64 = GenerateQRCode(setupUri);

            // Format secret for manual entry (groups of 4 characters)
            string manualEntryKey = FormatSecretForManualEntry(secret);

            // Store temporary secret (not yet activated)
            await _userRepository.UpdateMFASecretAsync(userId, secret);

            _logger.LogInformation("MFA setup initiated for user {UserId}", userId);

            return new MFASetupInitiateDTO
            {
                Secret = secret,
                QRCode = qrCodeBase64,
                ManualEntryKey = manualEntryKey
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error initiating MFA setup for user {UserId}", userId);
            throw;
        }
    }

    /// <summary>
    /// Completes MFA setup by verifying the first TOTP code
    /// </summary>
    public async Task<MFABackupCodesDTO> CompleteMFASetupAsync(int userId, MFASetupCompleteDTO completeDto)
    {
        try
        {
            User? user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                throw new ArgumentException("User not found");
            }

            if (user.MFAEnabled)
            {
                throw new InvalidOperationException("MFA is already enabled for this user");
            }

            if (string.IsNullOrEmpty(user.MFASecret))
            {
                throw new InvalidOperationException("MFA setup not initiated. Call InitiateMFASetup first.");
            }

            // Verify the TOTP code
            if (!VerifyTOTPCode(user.MFASecret, completeDto.Code))
            {
                throw new UnauthorizedAccessException("Invalid verification code");
            }

            // Generate backup codes
            List<string> backupCodes = GenerateBackupCodes();
            string backupCodesJson = JsonConvert.SerializeObject(backupCodes);

            // Enable MFA
            await _userRepository.EnableMFAAsync(userId, user.MFASecret, backupCodesJson);

            _logger.LogInformation("MFA setup completed for user {UserId}", userId);

            return new MFABackupCodesDTO
            {
                BackupCodes = backupCodes,
                GeneratedAt = DateTime.UtcNow
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error completing MFA setup for user {UserId}", userId);
            throw;
        }
    }

    /// <summary>
    /// Verifies a TOTP code during login
    /// </summary>
    public async Task<bool> VerifyMFACodeAsync(int userId, MFAVerificationDTO verificationDto)
    {
        try
        {
            bool isMFAEnabled = await _userRepository.IsMFAEnabledAsync(userId);
            if (!isMFAEnabled)
            {
                _logger.LogWarning("MFA verification attempted for user {UserId} without MFA enabled", userId);
                return false;
            }

            string? secret = await _userRepository.GetMFASecretAsync(userId);
            if (string.IsNullOrEmpty(secret))
            {
                _logger.LogWarning("MFA verification attempted for user {UserId} but no secret found", userId);
                return false;
            }

            bool isValid = VerifyTOTPCode(secret, verificationDto.Code);

            if (isValid)
            {
                _logger.LogInformation("Successful MFA verification for user {UserId}", userId);
            }
            else
            {
                _logger.LogWarning("Failed MFA verification for user {UserId}", userId);
            }

            return isValid;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error verifying MFA code for user {UserId}", userId);
            return false;
        }
    }

    /// <summary>
    /// Verifies a backup code during login
    /// </summary>
    public async Task<bool> VerifyBackupCodeAsync(int userId, MFABackupCodeDTO backupCodeDto)
    {
        try
        {
            User? user = await _userRepository.GetByIdAsync(userId);
            if (user == null || !user.MFAEnabled || string.IsNullOrEmpty(user.BackupCodes))
            {
                _logger.LogWarning("Backup code verification attempted for user {UserId} without MFA enabled", userId);
                return false;
            }

            List<string>? backupCodes = JsonConvert.DeserializeObject<List<string>>(user.BackupCodes);
            if (backupCodes == null)
            {
                _logger.LogError("Failed to deserialize backup codes for user {UserId}", userId);
                return false;
            }

            // Check if backup code exists and remove it (single use)
            if (backupCodes.Remove(backupCodeDto.BackupCode))
            {
                // Update user with remaining backup codes
                string updatedBackupCodesJson = JsonConvert.SerializeObject(backupCodes);
                await _userRepository.UpdateBackupCodesAsync(userId, updatedBackupCodesJson);

                _logger.LogInformation("Successful backup code verification for user {UserId}", userId);
                return true;
            }

            _logger.LogWarning("Invalid backup code attempted for user {UserId}", userId);
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error verifying backup code for user {UserId}", userId);
            return false;
        }
    }

    /// <summary>
    /// Disables MFA for a user after password verification
    /// </summary>
    public async Task DisableMFAAsync(int userId, MFADisableDTO disableDto)
    {
        try
        {
            User? user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                throw new ArgumentException("User not found");
            }

            bool isMFAEnabled = await _userRepository.IsMFAEnabledAsync(userId);
            if (!isMFAEnabled)
            {
                throw new InvalidOperationException("MFA is not enabled for this user");
            }

            // Verify password
            bool isPasswordValid = await _userRepository.CheckPasswordAsync(user, disableDto.Password);
            if (!isPasswordValid)
            {
                throw new UnauthorizedAccessException("Invalid password");
            }

            // If TOTP code provided, verify it as additional security
            if (!string.IsNullOrEmpty(disableDto.Code))
            {
                if (!VerifyTOTPCode(user.MFASecret!, disableDto.Code))
                {
                    throw new UnauthorizedAccessException("Invalid verification code");
                }
            }

            // Disable MFA
            await _userRepository.DisableMFAAsync(userId);

            _logger.LogInformation("MFA disabled for user {UserId}", userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error disabling MFA for user {UserId}", userId);
            throw;
        }
    }

    /// <summary>
    /// Generates new backup codes for a user
    /// </summary>
    public async Task<MFABackupCodesDTO> GenerateNewBackupCodesAsync(int userId)
    {
        try
        {
            bool isMFAEnabled = await _userRepository.IsMFAEnabledAsync(userId);
            if (!isMFAEnabled)
            {
                throw new InvalidOperationException("MFA is not enabled for this user");
            }

            // Generate new backup codes
            List<string> backupCodes = GenerateBackupCodes();
            string backupCodesJson = JsonConvert.SerializeObject(backupCodes);

            // Update user
            await _userRepository.UpdateBackupCodesAsync(userId, backupCodesJson);

            _logger.LogInformation("New backup codes generated for user {UserId}", userId);

            return new MFABackupCodesDTO
            {
                BackupCodes = backupCodes,
                GeneratedAt = DateTime.UtcNow
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating new backup codes for user {UserId}", userId);
            throw;
        }
    }

    /// <summary>
    /// Gets MFA status for a user
    /// </summary>
    public async Task<MFAStatusDTO> GetMFAStatusAsync(int userId)
    {
        try
        {
            User? user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                throw new ArgumentException("User not found");
            }

            int backupCodesRemaining = 0;
            if (!string.IsNullOrEmpty(user.BackupCodes))
            {
                List<string>? backupCodes = JsonConvert.DeserializeObject<List<string>>(user.BackupCodes);
                backupCodesRemaining = backupCodes?.Count ?? 0;
            }

            return new MFAStatusDTO
            {
                IsEnabled = user.MFAEnabled,
                SetupDate = user.MFASetupDate,
                BackupCodesRemaining = backupCodesRemaining
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting MFA status for user {UserId}", userId);
            throw;
        }
    }

    /// <summary>
    /// Checks if MFA is enabled for a user
    /// </summary>
    public async Task<bool> IsMFAEnabledAsync(int userId)
    {
        try
        {
            return await _userRepository.IsMFAEnabledAsync(userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking MFA status for user {UserId}", userId);
            return false;
        }
    }

    #region Private Helper Methods

    /// <summary>
    /// Verifies a TOTP code against the user's secret
    /// </summary>
    private bool VerifyTOTPCode(string secret, string code)
    {
        try
        {
            byte[] secretBytes = Base32Encoding.ToBytes(secret);
            Totp totp = new Totp(secretBytes);
            
            // Verify with tolerance for clock skew (±30 seconds)
            return totp.VerifyTotp(code, out long timeStepMatched, VerificationWindow.RfcSpecifiedNetworkDelay);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error verifying TOTP code");
            return false;
        }
    }

    /// <summary>
    /// Generates a QR code as base64 string
    /// </summary>
    private string GenerateQRCode(string text)
    {
        using QRCodeGenerator qrGenerator = new QRCodeGenerator();
        using QRCodeData qrCodeData = qrGenerator.CreateQrCode(text, QRCodeGenerator.ECCLevel.Q);
        using PngByteQRCode qrCode = new PngByteQRCode(qrCodeData);
        
        byte[] qrCodeBytes = qrCode.GetGraphic(20);
        return Convert.ToBase64String(qrCodeBytes);
    }

    /// <summary>
    /// Formats secret for manual entry (groups of 4 characters)
    /// </summary>
    private string FormatSecretForManualEntry(string secret)
    {
        StringBuilder formatted = new StringBuilder();
        for (int i = 0; i < secret.Length; i += 4)
        {
            if (i > 0) formatted.Append(' ');
            formatted.Append(secret.Substring(i, Math.Min(4, secret.Length - i)));
        }
        return formatted.ToString();
    }

    /// <summary>
    /// Generates secure backup codes
    /// </summary>
    private List<string> GenerateBackupCodes()
    {
        List<string> codes = new List<string>();
        using RandomNumberGenerator rng = RandomNumberGenerator.Create();
        
        for (int i = 0; i < BACKUP_CODES_COUNT; i++)
        {
            byte[] bytes = new byte[BACKUP_CODE_LENGTH / 2];
            rng.GetBytes(bytes);
            
            string code = Convert.ToHexString(bytes).ToLower();
            codes.Add(code);
        }
        
        return codes;
    }

    #endregion
} 