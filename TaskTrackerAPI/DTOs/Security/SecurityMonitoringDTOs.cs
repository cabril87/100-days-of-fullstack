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

namespace TaskTrackerAPI.DTOs.Security
{
    // Request DTOs
    public class CreateSecurityAlertRequest
    {
        public string Type { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Severity { get; set; } = string.Empty;
        public string? Source { get; set; }
        public string? RecommendedAction { get; set; }
    }

    public class LogSecurityMetricRequest
    {
        public string MetricType { get; set; } = string.Empty;
        public string MetricName { get; set; } = string.Empty;
        public double Value { get; set; }
        public string? Description { get; set; }
        public string? Source { get; set; }
        public string? Severity { get; set; }
    }

    public class ClearLogsResultDTO
    {
        public int ClearedCount { get; set; }
        public DateTime ClearedDate { get; set; }
        public string Message { get; set; } = string.Empty;
    }

    // Enhanced Security Request DTOs
    public class UnlockAccountRequest
    {
        public string EmailOrUsername { get; set; } = string.Empty;
    }

    public class TerminateSessionRequest
    {
        public string SessionToken { get; set; } = string.Empty;
    }

    public class TerminateAllSessionsRequest
    {
        public int UserId { get; set; }
        public string Reason { get; set; } = string.Empty;
        public string? ExcludeSessionToken { get; set; }
    }

    public class MarkSessionSuspiciousRequest
    {
        public string SessionToken { get; set; } = string.Empty;
        public string Reason { get; set; } = string.Empty;
    }

    public class UpdateDeviceTrustRequest
    {
        public int UserId { get; set; }
        public string DeviceId { get; set; } = string.Empty;
        public bool Trusted { get; set; }
        public string? DeviceName { get; set; }
    }

    // User Security Settings DTOs
    public class UserSecuritySettingsDTO
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public bool MFAEnabled { get; set; }
        public int SessionTimeout { get; set; }
        public bool TrustedDevicesEnabled { get; set; }
        public bool LoginNotifications { get; set; }
        public bool DataExportRequest { get; set; }
        public DateTime? DataExportRequestDate { get; set; }
        public bool AccountDeletionRequest { get; set; }
        public DateTime? AccountDeletionRequestDate { get; set; }
        public string? PrivacySettings { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class UserSecuritySettingsCreateDTO
    {
        public bool MFAEnabled { get; set; } = false;
        public int SessionTimeout { get; set; } = 480;
        public bool TrustedDevicesEnabled { get; set; } = true;
        public bool LoginNotifications { get; set; } = true;
        public bool DataExportRequest { get; set; } = false;
        public string? PrivacySettings { get; set; }
    }

    public class UserSecuritySettingsUpdateDTO
    {
        public bool? MFAEnabled { get; set; }
        public int? SessionTimeout { get; set; }
        public bool? TrustedDevicesEnabled { get; set; }
        public bool? LoginNotifications { get; set; }
        public bool? DataExportRequest { get; set; }
        public string? PrivacySettings { get; set; }
    }
} 