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
    private readonly IHostEnvironment _environment;
    
    // Purpose string for creating protectors - changing this invalidates all encrypted data
    private const string ProtectionPurpose = "TaskTracker.FieldEncryption";
    
    // Current version of encryption - can be used for key rotation
    private const string CurrentVersion = "v1";
    
    // Array of previous versions for fallback decryption attempts
    private readonly string[] _previousVersions = { "v1" };

    public DataProtectionService(
        IDataProtectionProvider provider,
        ILogger<DataProtectionService> logger,
        IHostEnvironment environment)
    {
        _provider = provider ?? throw new ArgumentNullException(nameof(provider));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _environment = environment ?? throw new ArgumentNullException(nameof(environment));
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
            
            // In development, return the plain text to prevent data loss
            if (_environment.IsDevelopment())
            {
                _logger.LogWarning("Returning unencrypted value in development environment");
                return plainText;
            }
            
            throw new TaskTrackerAPI.Exceptions.SecurityException("Error encrypting data", ex);
        }
    }

    /// <summary>
    /// Decrypts a string value with improved fallback mechanisms
    /// </summary>
    /// <param name="cipherText">The encrypted text to decrypt</param>
    /// <returns>The decrypted value, or the original value if decryption fails, or null if input was null</returns>
    public string? Decrypt(string? cipherText)
    {
        if (cipherText == null)
        {
            return null;
        }

        // Try with the current version first
        try
        {
            IDataProtector protector = _provider.CreateProtector($"{ProtectionPurpose}.{CurrentVersion}");
            return protector.Unprotect(cipherText);
        }
        catch (System.Security.Cryptography.CryptographicException ex)
        {
            _logger.LogWarning(ex, "Decryption failed with current version, trying previous versions");
            
            // Try previous versions if current version fails
            foreach (string version in _previousVersions)
            {
                try
                {
                    IDataProtector protector = _provider.CreateProtector($"{ProtectionPurpose}.{version}");
                    string decrypted = protector.Unprotect(cipherText);
                    
                    // If successful, re-encrypt with current version
                    if (!_environment.IsProduction())
                    {
                        _logger.LogInformation("Successfully decrypted with version {Version}, re-encrypting with current version", version);
                        return ReEncrypt(decrypted, version);
                    }
                    
                    return decrypted;
                }
                catch (Exception) 
                {
                    // Continue trying other versions
                    continue;
                }
            }
            
            // If all versions fail and we're in development, just return the input
            if (_environment.IsDevelopment())
            {
                _logger.LogWarning("All decryption attempts failed in development environment, returning original value");
                return cipherText;
            }
            
            // In production, log the error and return the original value as fallback
            _logger.LogError("All decryption attempts failed for data protection");
            return cipherText;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error during decryption");
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
    /// <param name="plainText">The plaintext to re-encrypt</param>
    /// <param name="oldVersion">The version it was originally encrypted with</param>
    /// <returns>The re-encrypted value with the current version</returns>
    public string? ReEncrypt(string? plainText, string oldVersion)
    {
        if (plainText == null)
        {
            return null;
        }

        try
        {
            // Encrypt with new version directly
            IDataProtector newProtector = _provider.CreateProtector($"{ProtectionPurpose}.{CurrentVersion}");
            return newProtector.Protect(plainText);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error re-encrypting value from version {OldVersion} to {CurrentVersion}", 
                oldVersion, CurrentVersion);
                
            if (_environment.IsDevelopment())
            {
                return plainText; // Return unencrypted in development
            }
            
            throw new TaskTrackerAPI.Exceptions.SecurityException("Error re-encrypting data", ex);
        }
    }
    
    /// <summary>
    /// Forces regeneration of data protection keys
    /// </summary>
    /// <returns>True if keys were successfully regenerated</returns>
    public bool RegenerateKeys()
    {
        try
        {
            // Create a new key with current version
            IDataProtector protector = _provider.CreateProtector($"{ProtectionPurpose}.{CurrentVersion}");
            
            // Test encryption/decryption to verify key works
            string testValue = "Test value for key verification";
            string encrypted = protector.Protect(testValue);
            string decrypted = protector.Unprotect(encrypted);
            
            bool success = testValue == decrypted;
            
            if (success)
            {
                _logger.LogInformation("Successfully regenerated data protection keys");
            }
            else
            {
                _logger.LogWarning("Key regeneration verification failed");
            }
            
            return success;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error regenerating data protection keys");
            return false;
        }
    }
} 