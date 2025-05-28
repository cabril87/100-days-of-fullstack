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
using System.Collections.Generic;
using System.Threading.Tasks;
using TaskTrackerAPI.DTOs.Security;

namespace TaskTrackerAPI.Services.Interfaces
{
    public interface ISessionManagementService
    {
        Task<string> CreateSessionAsync(int userId, string ipAddress, string? userAgent);
        Task<bool> ValidateSessionAsync(string sessionToken);
        Task UpdateSessionActivityAsync(string sessionToken);
        Task TerminateSessionAsync(string sessionToken, string reason);
        Task TerminateAllUserSessionsAsync(int userId, string reason, string? excludeSessionToken = null);
        Task<SessionManagementDTO> GetSessionManagementDataAsync();
        Task<List<UserSessionDTO>> GetActiveSessionsAsync(int? userId = null);
        Task<List<UserSessionDTO>> GetUserSessionsAsync(int userId, bool activeOnly = false);
        Task<bool> IsSessionLimitExceededAsync(int userId);
        Task CleanupExpiredSessionsAsync();
        Task<UserSessionDTO?> GetSessionByTokenAsync(string sessionToken);
        Task<int> GetActiveSessionCountAsync(int userId);
        Task<bool> IsSuspiciousSessionAsync(string sessionToken);
        Task MarkSessionSuspiciousAsync(string sessionToken, string reason);
    }
} 