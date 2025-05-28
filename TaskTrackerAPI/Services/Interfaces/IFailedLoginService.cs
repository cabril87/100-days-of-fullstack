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
using System.Threading.Tasks;
using TaskTrackerAPI.DTOs.Security;

namespace TaskTrackerAPI.Services.Interfaces
{
    public interface IFailedLoginService
    {
        Task LogFailedLoginAttemptAsync(string emailOrUsername, string ipAddress, string? userAgent, string? failureReason);
        Task<bool> IsAccountLockedAsync(string emailOrUsername);
        Task<AccountLockoutStatusDTO> GetAccountLockoutStatusAsync(string emailOrUsername);
        Task<FailedLoginSummaryDTO> GetFailedLoginSummaryAsync(DateTime? from = null, DateTime? to = null);
        Task<List<FailedLoginAttemptDTO>> GetFailedLoginAttemptsAsync(int page = 1, int pageSize = 50);
        Task UnlockAccountAsync(string emailOrUsername, string unlockedBy);
        Task<bool> ShouldLockAccountAsync(string emailOrUsername);
        Task LockAccountAsync(string emailOrUsername, string reason);
        Task<List<string>> GetSuspiciousIPsAsync(int limit = 10);
        Task<bool> IsIPSuspiciousAsync(string ipAddress);
        Task BlockIPAsync(string ipAddress, string reason, string blockedBy);
        Task UnblockIPAsync(string ipAddress, string unblockedBy);
    }
} 