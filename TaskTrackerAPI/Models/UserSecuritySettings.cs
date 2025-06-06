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
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskTrackerAPI.Models;

/// <summary>
/// Represents user-specific security and privacy settings
/// </summary>
public class UserSecuritySettings
{
    /// <summary>
    /// Primary key
    /// </summary>
    [Key]
    public int Id { get; set; }

    /// <summary>
    /// Foreign key to User
    /// </summary>
    [Required]
    public int UserId { get; set; }

    /// <summary>
    /// Navigation property to User
    /// </summary>
    [ForeignKey("UserId")]
    public virtual User User { get; set; } = null!;

    /// <summary>
    /// Whether Multi-Factor Authentication is enabled
    /// </summary>
    public bool MFAEnabled { get; set; } = false;

    /// <summary>
    /// Session timeout in minutes (default: 8 hours = 480 minutes)
    /// </summary>
    [Range(15, 43200)] // 15 minutes to 30 days
    public int SessionTimeout { get; set; } = 480;

    /// <summary>
    /// Whether trusted devices feature is enabled
    /// </summary>
    public bool TrustedDevicesEnabled { get; set; } = true;

    /// <summary>
    /// Whether to send notifications for new logins
    /// </summary>
    public bool LoginNotifications { get; set; } = true;

    /// <summary>
    /// Whether user has requested data export
    /// </summary>
    public bool DataExportRequest { get; set; } = false;

    /// <summary>
    /// Date when data export was last requested
    /// </summary>
    public DateTime? DataExportRequestDate { get; set; }

    /// <summary>
    /// Whether account deletion is requested
    /// </summary>
    public bool AccountDeletionRequest { get; set; } = false;

    /// <summary>
    /// Date when account deletion was requested
    /// </summary>
    public DateTime? AccountDeletionRequestDate { get; set; }

    /// <summary>
    /// Additional privacy settings (JSON)
    /// </summary>
    public string? PrivacySettings { get; set; }

    /// <summary>
    /// When the settings were created
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// When the settings were last updated
    /// </summary>
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
} 