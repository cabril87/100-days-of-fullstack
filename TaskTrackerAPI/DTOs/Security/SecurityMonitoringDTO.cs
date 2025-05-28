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

namespace TaskTrackerAPI.DTOs.Security;

public class SecurityMonitoringSummaryDTO
{
    public int TotalEvents { get; set; }
    public int CriticalEvents { get; set; }
    public int HighRiskEvents { get; set; }
    public int ResolvedEvents { get; set; }
    public string AverageResolutionTime { get; set; } = "00:00:00"; // TimeSpan as string
    public List<SecurityEventTypeStatDTO> EventsByType { get; set; } = new();
    public List<SecurityEventSeverityStatDTO> EventsBySeverity { get; set; } = new();
    public List<SecurityMonitoringEventDTO> RecentEvents { get; set; } = new();
}

public class SecurityMonitoringEventDTO
{
    public int Id { get; set; }
    public string EventType { get; set; } = string.Empty;
    public string Severity { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Source { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
    public int? UserId { get; set; }
    public string? Username { get; set; }
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public string? Metadata { get; set; }
    public bool IsResolved { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public string? ResolvedBy { get; set; }
}

public class SecurityEventTypeStatDTO
{
    public string EventType { get; set; } = string.Empty;
    public int Count { get; set; }
    public double Percentage { get; set; }
}

public class SecurityEventSeverityStatDTO
{
    public string Severity { get; set; } = string.Empty;
    public int Count { get; set; }
    public double Percentage { get; set; }
} 