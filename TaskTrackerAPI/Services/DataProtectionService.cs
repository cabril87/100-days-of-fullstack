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
using Microsoft.AspNetCore.DataProtection;
using System;
using System.Text;
using TaskTrackerAPI.Services.Interfaces;

namespace TaskTrackerAPI.Services;

/// <summary>
/// Service for encrypting and decrypting sensitive data
/// using ASP.NET Core's Data Protection API
/// </summary>
public class DataProtectionService : IDataProtectionService
{
    private readonly IDataProtectionProvider _provider;
    private readonly ILogger<DataProtectionService> _logger;
    
    // Purpose string for creating protectors - changing this invalidates all encrypted data
    private const string ProtectionPurpose = "TaskTracker.FieldEncryption";
    
    // Current version of encryption - can be used for key rotation
    private const string CurrentVersion = "v1";

    public DataProtectionService(
        IDataProtectionProvider provider,
        ILogger<DataProtectionService> logger)
    {
        _provider = provider ?? throw new ArgumentNullException(nameof(provider));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <summary>
    /// Encrypts a string value
    /// </summary>
    /// <param name="plainText">The plain text to encrypt</param>
    /// <returns>The encrypted value, or null if input was null</returns>
    public string? Encrypt(string? plainText)
    {
        if (plainText == null)
        {
            return null;
        }

        try
        {
            // Create a protector with the current version
            IDataProtector protector = _provider.CreateProtector($"{ProtectionPurpose}.{CurrentVersion}");
            
            // Encrypt the value
            return protector.Protect(plainText);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error encrypting value");
            throw new TaskTrackerAPI.Exceptions.SecurityException("Error encrypting data", ex);
        }
    }

    /// <summary>
    /// Decrypts a string value
    /// </summary>
    /// <param name="cipherText">The encrypted text to decrypt</param>
    /// <returns>The decrypted value, or the original value if decryption fails, or null if input was null</returns>
    public string? Decrypt(string? cipherText)
    {
        if (cipherText == null)
        {
            return null;
        }

        try
        {
            // Create a protector with the current version
            IDataProtector protector = _provider.CreateProtector($"{ProtectionPurpose}.{CurrentVersion}");
            
            // Decrypt the value
            return protector.Unprotect(cipherText);
        }
        catch (System.Security.Cryptography.CryptographicException ex)
        {
            _logger.LogWarning(ex, "Decryption failed, returning original value as fallback");
            // Return the original value as a fallback when keys don't match
            // This allows the application to continue functioning with encrypted data
            return cipherText;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error decrypting value");
            // Return the original value as a fallback
            return cipherText;
        }
    }
    
    /// <summary>
    /// Creates a new encryption key for rotation purposes
    /// </summary>
    /// <param name="newVersion">The new version identifier</param>
    /// <returns>True if key was successfully created</returns>
    public bool CreateNewEncryptionKey(string newVersion)
    {
        try
        {
            // This will generate a new key but not activate it yet
            _provider.CreateProtector($"{ProtectionPurpose}.{newVersion}");
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating new encryption key for version {Version}", newVersion);
            return false;
        }
    }
    
    /// <summary>
    /// Re-encrypts a value with the current encryption key version
    /// </summary>
    /// <param name="cipherText">The encrypted text to re-encrypt</param>
    /// <param name="oldVersion">The version it was originally encrypted with</param>
    /// <returns>The re-encrypted value with the current version</returns>
    public string? ReEncrypt(string? cipherText, string oldVersion)
    {
        if (cipherText == null)
        {
            return null;
        }

        try
        {
            // Decrypt with old version
            IDataProtector oldProtector = _provider.CreateProtector($"{ProtectionPurpose}.{oldVersion}");
            string plainText = oldProtector.Unprotect(cipherText);
            
            // Encrypt with new version
            IDataProtector newProtector = _provider.CreateProtector($"{ProtectionPurpose}.{CurrentVersion}");
            return newProtector.Protect(plainText);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error re-encrypting value from version {OldVersion} to {CurrentVersion}", 
                oldVersion, CurrentVersion);
            throw new TaskTrackerAPI.Exceptions.SecurityException("Error re-encrypting data", ex);
        }
    }
} 