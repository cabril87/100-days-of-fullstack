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
using System;

namespace TaskTrackerAPI.Attributes;

/// <summary>
/// Attribute used to mark properties that should be encrypted
/// when stored in the database. Only applicable to string properties.
/// </summary>
[AttributeUsage(AttributeTargets.Property, AllowMultiple = false, Inherited = true)]
public class EncryptAttribute : Attribute
{
    /// <summary>
    /// Gets or sets whether this field is highly sensitive (e.g., credit card info)
    /// and requires additional protection.
    /// </summary>
    public bool IsHighlySensitive { get; set; } = false;
    
    /// <summary>
    /// Gets or sets the purpose of this encryption, which can be used
    /// for auditing or key management.
    /// </summary>
    public string? Purpose { get; set; }
    
    public EncryptAttribute()
    {
    }
    
    public EncryptAttribute(string purpose)
    {
        Purpose = purpose;
    }
    
    public EncryptAttribute(bool isHighlySensitive)
    {
        IsHighlySensitive = isHighlySensitive;
    }
    
    public EncryptAttribute(string purpose, bool isHighlySensitive)
    {
        Purpose = purpose;
        IsHighlySensitive = isHighlySensitive;
    }
} 