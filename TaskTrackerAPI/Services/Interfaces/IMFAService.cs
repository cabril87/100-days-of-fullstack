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
// Services/Interfaces/IMFAService.cs
using System.Threading.Tasks;
using TaskTrackerAPI.DTOs.Auth;

namespace TaskTrackerAPI.Services.Interfaces;

/// <summary>
/// Interface for Multi-Factor Authentication (MFA) service operations
/// </summary>
public interface IMFAService
{
    /// <summary>
    /// Initiates MFA setup for a user by generating secret and QR code
    /// </summary>
    /// <param name="userId">User identifier</param>
    /// <returns>MFA setup data including secret and QR code</returns>
    Task<MFASetupInitiateDTO> InitiateMFASetupAsync(int userId);

    /// <summary>
    /// Completes MFA setup by verifying the first TOTP code
    /// </summary>
    /// <param name="userId">User identifier</param>
    /// <param name="completeDto">MFA setup completion data</param>
    /// <returns>Backup codes for the user</returns>
    Task<MFABackupCodesDTO> CompleteMFASetupAsync(int userId, MFASetupCompleteDTO completeDto);

    /// <summary>
    /// Verifies a TOTP code during login
    /// </summary>
    /// <param name="userId">User identifier</param>
    /// <param name="verificationDto">MFA verification data</param>
    /// <returns>True if code is valid</returns>
    Task<bool> VerifyMFACodeAsync(int userId, MFAVerificationDTO verificationDto);

    /// <summary>
    /// Verifies a backup code during login
    /// </summary>
    /// <param name="userId">User identifier</param>
    /// <param name="backupCodeDto">Backup code data</param>
    /// <returns>True if backup code is valid and unused</returns>
    Task<bool> VerifyBackupCodeAsync(int userId, MFABackupCodeDTO backupCodeDto);

    /// <summary>
    /// Disables MFA for a user after password verification
    /// </summary>
    /// <param name="userId">User identifier</param>
    /// <param name="disableDto">MFA disable request data</param>
    /// <returns>Task representing the async operation</returns>
    Task DisableMFAAsync(int userId, MFADisableDTO disableDto);

    /// <summary>
    /// Generates new backup codes for a user
    /// </summary>
    /// <param name="userId">User identifier</param>
    /// <returns>New backup codes</returns>
    Task<MFABackupCodesDTO> GenerateNewBackupCodesAsync(int userId);

    /// <summary>
    /// Gets MFA status for a user
    /// </summary>
    /// <param name="userId">User identifier</param>
    /// <returns>MFA status information</returns>
    Task<MFAStatusDTO> GetMFAStatusAsync(int userId);

    /// <summary>
    /// Checks if MFA is enabled for a user
    /// </summary>
    /// <param name="userId">User identifier</param>
    /// <returns>True if MFA is enabled</returns>
    Task<bool> IsMFAEnabledAsync(int userId);
} 