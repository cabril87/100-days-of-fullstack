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
using TaskTrackerAPI.Models;
using System.Linq;
using TaskTrackerAPI.DTOs.Security;

namespace TaskTrackerAPI.Repositories.Interfaces
{
    public interface ISecurityMonitoringRepository
    {
        // Failed Login Monitoring
        Task<IEnumerable<FailedLoginAttempt>> GetFailedLoginsAsync(string? emailOrUsername = null, DateTime? startDate = null, DateTime? endDate = null);
        Task<int> GetFailedLoginCountAsync(string emailOrUsername, DateTime sinceDate);
        Task<FailedLoginAttempt> CreateFailedLoginAttemptAsync(FailedLoginAttempt attempt);

        // Security Audit Events
        Task<IEnumerable<SecurityAuditLog>> GetSecurityEventsAsync(DateTime? startDate = null, DateTime? endDate = null);
        Task<IEnumerable<SecurityAuditLog>> GetUserSecurityEventsAsync(int userId, DateTime? startDate = null, DateTime? endDate = null);
        Task<SecurityAuditLog> CreateSecurityEventAsync(SecurityAuditLog securityEvent);
        Task<int> GetSecurityEventCountAsync(string eventType, DateTime sinceDate);

        // IP Address Monitoring
        Task<IEnumerable<string>> GetFailedLoginIPAddressesAsync(DateTime? sinceDate = null);
        Task<IEnumerable<FailedLoginAttempt>> GetLoginsFromIPAsync(string ipAddress, DateTime? sinceDate = null);
        Task<bool> IsIPAddressBlockedAsync(string ipAddress);

        // Device Monitoring
        Task<IEnumerable<UserDevice>> GetUserDevicesAsync(int userId);
        Task<UserDevice?> GetUserDeviceAsync(int userId, string deviceId);
        Task UpdateUserDeviceAsync(UserDevice device);
        Task DeleteUserDeviceAsync(int deviceId);

        // Suspicious Activity
        Task<IEnumerable<FailedLoginAttempt>> GetSuspiciousLoginsAsync(DateTime? sinceDate = null);
        Task<IEnumerable<SecurityAuditLog>> GetHighRiskEventsAsync(DateTime? sinceDate = null);
        Task<bool> HasSuspiciousActivityAsync(string identifier, DateTime sinceDate);

        // Rate Limiting
        Task<int> GetRequestCountAsync(string identifier, DateTime sinceDate);
        Task<DateTime?> GetLastRequestTimeAsync(string identifier);
        Task RecordRequestAsync(string identifier, string endpoint, string method);

        // Geographic Analytics
        Task<Dictionary<string, int>> GetLoginsByLocationAsync(DateTime? startDate = null, DateTime? endDate = null);
        Task<IEnumerable<FailedLoginAttempt>> GetLoginsFromUnusualLocationsAsync(string emailOrUsername);

        // Session Management
        Task<IEnumerable<UserSession>> GetActiveSessionsAsync(int userId);
        Task<UserSession?> GetSessionAsync(string sessionId);
        Task<UserSession> CreateSessionAsync(UserSession session);
        Task UpdateSessionAsync(UserSession session);
        Task InvalidateSessionAsync(string sessionId);
        Task InvalidateUserSessionsAsync(int userId, string? excludeSessionId = null);

        // Security Monitoring Service specific methods
        Task<List<SecurityAuditLog>> GetSecurityAuditLogsAsync(DateTime startDate, DateTime endDate);
        Task<int> GetActiveUsersAsync(DateTime since);
        Task<List<RateLimitTierConfig>> GetRateLimitTierConfigsAsync();
        Task<int> GetBlockedRequestsAsync(DateTime since, string? contains = null);
        Task<List<UserQuotaStatusDTO>> GetUserActivityAsync(DateTime since, string? filter = null);
        Task<List<SystemHealthMetrics>> GetSystemHealthMetricsAsync(DateTime since);
        Task<List<SecurityMetrics>> GetSecurityMetricsAsync(DateTime? from = null, DateTime? to = null);
        Task<IQueryable<SecurityAuditLog>> GetSecurityAuditLogsAsync();
        Task<List<IGrouping<string, SecurityAuditLog>>> GetRecentSuspiciousGroupsAsync(DateTime since);
        Task<List<SecurityAuditLog>> GetAllSecurityAuditLogsAsync(DateTime since);
        Task<List<SecurityAuditLog>> GetApiAuditLogsAsync(DateTime since);
        Task<int> GetRecentActivityAsync(DateTime since, int? userId = null, string? ipAddress = null);
        Task<List<UserActivityDTO>> GetSuspiciousUsersAsync(DateTime since, int limit);
        Task<List<SecurityAuditLog>> GetResponseTimeAuditLogsAsync(DateTime since);
        Task<List<SecurityAuditLog>> GetTopEndpointsAuditLogsAsync(DateTime since);
        Task<List<UserActivityDTO>> GetTopUsersAsync(DateTime since, int limit);
        Task<List<SecurityAuditLog>> GetStatusCodeAuditLogsAsync(DateTime since);

        // Data persistence methods
        Task AddSecurityMetricAsync(SecurityMetrics metric);
        Task AddSecurityAuditLogAsync(SecurityAuditLog auditLog);
        Task AddSystemHealthMetricAsync(SystemHealthMetrics healthMetric);
        Task<List<SecurityAuditLog>> GetSecurityAuditLogsAsync(DateTime? olderThan);
        Task RemoveSecurityAuditLogs(List<SecurityAuditLog> logsToDelete);
        Task SaveChangesAsync();
        Task<List<SecurityMetrics>> GetSecurityMetricsAsync(DateTime? olderThan);
        Task RemoveSecurityMetrics(List<SecurityMetrics> metricsToDelete);
        Task<int> GetSecurityAuditLogsCountAsync();
        Task<int> GetSecurityMetricsCountAsync();
        Task<int> GetSystemHealthMetricsCountAsync();
        Task RemoveAllSecurityLogs();
        Task<int> GetRecentActivityAsync(DateTime since);
        
        // User Activity Log methods
        Task<bool> DeleteUserActivityLogAsync(int userId);
    }
}