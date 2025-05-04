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
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using TaskTrackerAPI.Services.Interfaces;

namespace TaskTrackerAPI.Data.Converters;

/// <summary>
/// Value converter for Entity Framework Core that automatically encrypts/decrypts 
/// string properties when reading from or writing to the database
/// </summary>
public class EncryptedStringConverter : ValueConverter<string?, string?>
{
    /// <summary>
    /// Creates a new instance of the EncryptedStringConverter
    /// </summary>
    /// <param name="dataProtectionService">The service used for encryption/decryption</param>
    public EncryptedStringConverter(IDataProtectionService dataProtectionService) 
        : base(
            // Convert model value (string) to database value (encrypted string)
            modelValue => modelValue == null 
                ? null 
                : dataProtectionService.Encrypt(modelValue),
                
            // Convert database value (encrypted string) to model value (decrypted string)
            databaseValue => databaseValue == null 
                ? null 
                : dataProtectionService.Decrypt(databaseValue),
                
            // Converter mapping hints
            new ConverterMappingHints(size: 1024) // Encrypted values may be larger
        )
    {
    }
} 