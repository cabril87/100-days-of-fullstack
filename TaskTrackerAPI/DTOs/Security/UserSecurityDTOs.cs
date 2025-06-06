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

namespace TaskTrackerAPI.DTOs.Security
{
    /// <summary>
    /// DTO for terminating a user session
    /// </summary>
    public class TerminateSessionRequestDTO
    {
        /// <summary>
        /// Session token to terminate
        /// </summary>
        [Required(ErrorMessage = "Session token is required")]
        [StringLength(255, ErrorMessage = "Session token cannot exceed 255 characters")]
        public string SessionToken { get; set; } = string.Empty;
    }

    /// <summary>
    /// DTO for updating device trust status
    /// </summary>
    public class UpdateDeviceTrustRequestDTO
    {
        /// <summary>
        /// Whether the device should be trusted
        /// </summary>
        [Required(ErrorMessage = "Trusted status is required")]
        public bool Trusted { get; set; }

        /// <summary>
        /// Optional custom device name
        /// </summary>
        [StringLength(100, ErrorMessage = "Device name cannot exceed 100 characters")]
        public string? DeviceName { get; set; }
    }

    /// <summary>
    /// DTO for user security overview information
    /// </summary>
    public class UserSecurityOverviewDTO
    {
        /// <summary>
        /// Whether multi-factor authentication is enabled
        /// </summary>
        [Required]
        public bool MfaEnabled { get; set; }

        /// <summary>
        /// Number of active sessions for the user
        /// </summary>
        [Required]
        [Range(0, int.MaxValue, ErrorMessage = "Active sessions count must be non-negative")]
        public int ActiveSessionsCount { get; set; }

        /// <summary>
        /// Number of trusted devices for the user
        /// </summary>
        [Required]
        [Range(0, int.MaxValue, ErrorMessage = "Trusted devices count must be non-negative")]
        public int TrustedDevicesCount { get; set; }

        /// <summary>
        /// Total number of devices for the user
        /// </summary>
        [Required]
        [Range(0, int.MaxValue, ErrorMessage = "Total devices count must be non-negative")]
        public int TotalDevicesCount { get; set; }

        /// <summary>
        /// Date and time of the last security scan
        /// </summary>
        [Required]
        public DateTime LastSecurityScan { get; set; }

        /// <summary>
        /// User's security score (0-100)
        /// </summary>
        [Required]
        [Range(0, 100, ErrorMessage = "Security score must be between 0 and 100")]
        public int SecurityScore { get; set; }
    }
} 