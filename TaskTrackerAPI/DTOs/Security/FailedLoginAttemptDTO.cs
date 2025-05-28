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
    public class FailedLoginAttemptDTO
    {
        public int Id { get; set; }
        public string EmailOrUsername { get; set; } = string.Empty;
        public string IpAddress { get; set; } = string.Empty;
        public string? UserAgent { get; set; }
        public DateTime AttemptTime { get; set; }
        public string? FailureReason { get; set; }
        public string? Country { get; set; }
        public string? City { get; set; }
        public string? CountryCode { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public bool IsSuspicious { get; set; }
        public string? RiskFactors { get; set; }
    }

    public class FailedLoginSummaryDTO
    {
        public int TotalAttempts { get; set; }
        public int UniqueIPs { get; set; }
        public int SuspiciousAttempts { get; set; }
        public List<string> TopTargetedAccounts { get; set; } = new();
        public List<string> TopAttackingIPs { get; set; } = new();
        public List<FailedLoginAttemptDTO> RecentAttempts { get; set; } = new();
    }

    public class AccountLockoutStatusDTO
    {
        public string EmailOrUsername { get; set; } = string.Empty;
        public bool IsLocked { get; set; }
        public DateTime? LockoutUntil { get; set; }
        public int FailedAttempts { get; set; }
        public int MaxAttempts { get; set; }
        public TimeSpan LockoutDuration { get; set; }
        public DateTime? LastAttempt { get; set; }
    }
} 