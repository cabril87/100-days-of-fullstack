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

namespace TaskTrackerAPI.Services.Interfaces;

/// <summary>
/// Interface for encrypting and decrypting sensitive data
/// </summary>
public interface IDataProtectionService
{
    /// <summary>
    /// Encrypts a string value
    /// </summary>
    /// <param name="plainText">The plain text to encrypt</param>
    /// <returns>The encrypted value, or null if input was null</returns>
    string? Encrypt(string? plainText);
    
    /// <summary>
    /// Decrypts a string value
    /// </summary>
    /// <param name="cipherText">The encrypted text to decrypt</param>
    /// <returns>The decrypted value, or null if input was null</returns>
    string? Decrypt(string? cipherText);
    
    /// <summary>
    /// Creates a new encryption key for rotation purposes
    /// </summary>
    /// <param name="newVersion">The new version identifier</param>
    /// <returns>True if key was successfully created</returns>
    bool CreateNewEncryptionKey(string newVersion);
    
    /// <summary>
    /// Re-encrypts a value with the current encryption key version
    /// </summary>
    /// <param name="cipherText">The encrypted text to re-encrypt</param>
    /// <param name="oldVersion">The version it was originally encrypted with</param>
    /// <returns>The re-encrypted value with the current version</returns>
    string? ReEncrypt(string? cipherText, string oldVersion);
} 