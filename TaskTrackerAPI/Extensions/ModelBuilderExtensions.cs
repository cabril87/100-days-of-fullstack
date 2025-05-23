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
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Reflection;
using TaskTrackerAPI.Attributes;
using TaskTrackerAPI.Data.Converters;
using TaskTrackerAPI.Services.Interfaces;

namespace TaskTrackerAPI.Extensions;

/// <summary>
/// Extension methods for EntityFrameworkCore ModelBuilder
/// </summary>
public static class ModelBuilderExtensions
{
    /// <summary>
    /// Applies encryption to all properties marked with the [Encrypt] attribute
    /// </summary>
    /// <param name="modelBuilder">The model builder instance</param>
    /// <param name="dataProtectionService">The data protection service</param>
    /// <returns>The model builder for chaining</returns>
    public static ModelBuilder ApplyEncryption(
        this ModelBuilder modelBuilder, 
        IDataProtectionService dataProtectionService)
    {
        if (dataProtectionService == null)
        {
            throw new ArgumentNullException(nameof(dataProtectionService));
        }

        // Create converter instance once
        EncryptedStringConverter converter = new EncryptedStringConverter(dataProtectionService);
        
        // Find all entity types in the model
        foreach (IEntityType entityType in modelBuilder.Model.GetEntityTypes())
        {
            // Find all properties that should be encrypted
            foreach (PropertyInfo property in entityType.ClrType.GetProperties(BindingFlags.Public | BindingFlags.Instance))
            {
                // Check if property has the [Encrypt] attribute
                EncryptAttribute? encryptAttribute = property.GetCustomAttribute<EncryptAttribute>();
                if (encryptAttribute != null)
                {
                    // Only string properties can be encrypted
                    if (property.PropertyType != typeof(string))
                    {
                        throw new InvalidOperationException(
                            $"Property {property.Name} on {entityType.Name} is marked with [Encrypt] " +
                            $"but is not a string. Only string properties can be encrypted.");
                    }
                    
                    // Find the corresponding property in the entity model
                    IProperty? modelProperty = entityType.FindProperty(property.Name);
                    if (modelProperty != null)
                    {
                        // Create comment for the database schema
                        string comment = "Encrypted field";
                        if (encryptAttribute.IsHighlySensitive)
                        {
                            comment += " (highly sensitive)";
                        }
                        if (encryptAttribute.Purpose != null)
                        {
                            comment += $" - {encryptAttribute.Purpose}";
                        }
                        
                        // Apply converter and comment through the ModelBuilder API
                        modelBuilder.Entity(entityType.ClrType)
                            .Property(property.Name)
                            .HasConversion(converter)
                            .HasComment(comment);
                    }
                }
            }
        }
        
        return modelBuilder;
    }
} 