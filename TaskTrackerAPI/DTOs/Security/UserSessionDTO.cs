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
using System.Collections.Generic;

namespace TaskTrackerAPI.DTOs.Security
{
    public class UserSessionDTO
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public string SessionToken { get; set; } = string.Empty;
        
        // Frontend compatibility fields
        public string DeviceId { get; set; } = string.Empty;
        public string? DeviceName { get; set; }
        public string? Location { get; set; }
        public bool IsTrusted { get; set; }
        public string CreatedAt { get; set; } = string.Empty;
        public string LastActivityAt { get; set; } = string.Empty;
        public string ExpiresAt { get; set; } = string.Empty;
        
        // Original security fields - keep ALL of these!
        public string IpAddress { get; set; } = string.Empty;
        public string? UserAgent { get; set; }
        public bool IsActive { get; set; }
        public string? Country { get; set; }
        public string? City { get; set; }
        public string? CountryCode { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public string? DeviceType { get; set; }
        public string? Browser { get; set; }
        public string? OperatingSystem { get; set; }
        public bool IsSuspicious { get; set; }
        public string? SecurityNotes { get; set; }
        public bool IsCurrentSession { get; set; }
        public TimeSpan SessionDuration { get; set; }
    }

    public class SessionManagementDTO
    {
        public int TotalActiveSessions { get; set; }
        public int MaxConcurrentSessions { get; set; }
        public TimeSpan DefaultSessionTimeout { get; set; }
        public List<UserSessionDTO> ActiveSessions { get; set; } = new();
        public List<UserSessionDTO> RecentSessions { get; set; } = new();
        public SessionSecuritySummaryDTO SecuritySummary { get; set; } = new();
    }

    public class SessionSecuritySummaryDTO
    {
        public int SuspiciousSessions { get; set; }
        public int UniqueLocations { get; set; }
        public int ExpiredSessions { get; set; }
        public List<string> UnusualLocations { get; set; } = new();
        public List<string> NewDevices { get; set; } = new();
    }

    public class GeolocationDTO
    {
        public string? Country { get; set; }
        public string? City { get; set; }
        public string? CountryCode { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public string? Timezone { get; set; }
        public bool IsVPN { get; set; }
        public bool IsProxy { get; set; }
        public string? ISP { get; set; }
        public string? Organization { get; set; }
    }

    public class IPGeolocationSummaryDTO
    {
        public int TotalUniqueIPs { get; set; }
        public int SuspiciousIPs { get; set; }
        public int BlockedCountriesCount { get; set; }
        public List<string> AllowedCountries { get; set; } = new();
        public List<string> BlockedCountries { get; set; } = new();
        public List<GeolocationAccessDTO> RecentAccess { get; set; } = new();
    }

    public class GeolocationAccessDTO
    {
        public string IpAddress { get; set; } = string.Empty;
        public string? Country { get; set; }
        public string? City { get; set; }
        public DateTime AccessTime { get; set; }
        public string? Username { get; set; }
        public bool IsAllowed { get; set; }
        public bool IsSuspicious { get; set; }
        public string? RiskFactors { get; set; }
    }
} 