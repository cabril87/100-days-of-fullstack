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
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TaskTrackerAPI.Data;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories.Interfaces;
using TaskTrackerAPI.DTOs.Security;

namespace TaskTrackerAPI.Repositories
{
    public class SecurityMonitoringRepository : ISecurityMonitoringRepository
    {
        private readonly ApplicationDbContext _context;

        public SecurityMonitoringRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        // Failed Login Monitoring
        public async Task<IEnumerable<FailedLoginAttempt>> GetFailedLoginsAsync(string? emailOrUsername = null, DateTime? startDate = null, DateTime? endDate = null)
        {
            IQueryable<FailedLoginAttempt> query = _context.FailedLoginAttempts.AsQueryable();

            if (!string.IsNullOrEmpty(emailOrUsername))
                query = query.Where(f => f.EmailOrUsername == emailOrUsername);

            if (startDate.HasValue)
                query = query.Where(f => f.AttemptTime >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(f => f.AttemptTime <= endDate.Value);

            return await query.OrderByDescending(f => f.AttemptTime).ToListAsync();
        }

        public async Task<int> GetFailedLoginCountAsync(string emailOrUsername, DateTime sinceDate)
        {
            return await _context.FailedLoginAttempts
                .Where(f => f.EmailOrUsername == emailOrUsername && f.AttemptTime >= sinceDate)
                .CountAsync();
        }

        public async Task<FailedLoginAttempt> CreateFailedLoginAttemptAsync(FailedLoginAttempt attempt)
        {
            _context.FailedLoginAttempts.Add(attempt);
            await _context.SaveChangesAsync();
            return attempt;
        }

        // Security Audit Events
        public async Task<IEnumerable<SecurityAuditLog>> GetSecurityEventsAsync(DateTime? startDate = null, DateTime? endDate = null)
        {
                IQueryable<SecurityAuditLog> query = _context.SecurityAuditLogs.AsQueryable();

            if (startDate.HasValue)
                query = query.Where(s => s.Timestamp >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(s => s.Timestamp <= endDate.Value);

            return await query.OrderByDescending(s => s.Timestamp).ToListAsync();
        }

        public async Task<IEnumerable<SecurityAuditLog>> GetUserSecurityEventsAsync(int userId, DateTime? startDate = null, DateTime? endDate = null)
        {
            IQueryable<SecurityAuditLog> query = _context.SecurityAuditLogs.Where(s => s.UserId == userId);

            if (startDate.HasValue)
                query = query.Where(s => s.Timestamp >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(s => s.Timestamp <= endDate.Value);

            return await query.OrderByDescending(s => s.Timestamp).ToListAsync();
        }

        public async Task<SecurityAuditLog> CreateSecurityEventAsync(SecurityAuditLog securityEvent)
        {
            _context.SecurityAuditLogs.Add(securityEvent);
            await _context.SaveChangesAsync();
            return securityEvent;
        }

        public async Task<int> GetSecurityEventCountAsync(string eventType, DateTime sinceDate)
        {
            return await _context.SecurityAuditLogs
                .Where(s => s.EventType == eventType && s.Timestamp >= sinceDate)
                .CountAsync();
        }

        // IP Address Monitoring
        public async Task<IEnumerable<string>> GetFailedLoginIPAddressesAsync(DateTime? sinceDate = null)
        {
            IQueryable<FailedLoginAttempt> query = _context.FailedLoginAttempts.AsQueryable();

            if (sinceDate.HasValue)
                query = query.Where(f => f.AttemptTime >= sinceDate.Value);

            return await query.Select(f => f.IpAddress).Distinct().ToListAsync();
        }

        public async Task<IEnumerable<FailedLoginAttempt>> GetLoginsFromIPAsync(string ipAddress, DateTime? sinceDate = null)
        {
            IQueryable<FailedLoginAttempt> query = _context.FailedLoginAttempts.Where(f => f.IpAddress == ipAddress);

            if (sinceDate.HasValue)
                query = query.Where(f => f.AttemptTime >= sinceDate.Value);

            return await query.OrderByDescending(f => f.AttemptTime).ToListAsync();
        }

        public async Task<bool> IsIPAddressBlockedAsync(string ipAddress)
        {
            // This would need to be implemented based on your blocking logic
            // For now, return false as placeholder
            return await Task.FromResult(false);
        }

        // Device Monitoring
        public async Task<IEnumerable<UserDevice>> GetUserDevicesAsync(int userId)
        {
            return await _context.UserDevices
                .Where(d => d.UserId == userId)
                .ToListAsync();
        }

        public async Task<UserDevice?> GetUserDeviceAsync(int userId, string deviceId)
        {
            return await _context.UserDevices
                .FirstOrDefaultAsync(d => d.UserId == userId && d.DeviceId == deviceId);
        }

        // Suspicious Activity
        public async Task<IEnumerable<FailedLoginAttempt>> GetSuspiciousLoginsAsync(DateTime? sinceDate = null)
        {
            IQueryable<FailedLoginAttempt> query = _context.FailedLoginAttempts.Where(f => f.IsSuspicious);

            if (sinceDate.HasValue)
                query = query.Where(f => f.AttemptTime >= sinceDate.Value);

            return await query.OrderByDescending(f => f.AttemptTime).ToListAsync();
        }

        public async Task<IEnumerable<SecurityAuditLog>> GetHighRiskEventsAsync(DateTime? sinceDate = null)
        {
            IQueryable<SecurityAuditLog> query = _context.SecurityAuditLogs.Where(s => s.Severity == "High" || s.Severity == "Critical");

            if (sinceDate.HasValue)
                query = query.Where(s => s.Timestamp >= sinceDate.Value);

            return await query.OrderByDescending(s => s.Timestamp).ToListAsync();
        }

        public async Task<bool> HasSuspiciousActivityAsync(string identifier, DateTime sinceDate)
        {
            return await _context.FailedLoginAttempts
                .AnyAsync(f => f.EmailOrUsername == identifier && f.IsSuspicious && f.AttemptTime >= sinceDate) ||
                await _context.SecurityAuditLogs
                .AnyAsync(s => s.Username == identifier && s.IsSuspicious && s.Timestamp >= sinceDate);
        }

        // Rate Limiting - These would need actual implementation based on your rate limiting strategy
        public Task<int> GetRequestCountAsync(string identifier, DateTime sinceDate)
        {
            return Task.FromResult(0);
        }

        public Task<DateTime?> GetLastRequestTimeAsync(string identifier)
        {
            return Task.FromResult<DateTime?>(null);
        }

        public Task RecordRequestAsync(string identifier, string endpoint, string method)
        {
            return Task.CompletedTask;
        }

        // Geographic Analytics
        public async Task<Dictionary<string, int>> GetLoginsByLocationAsync(DateTime? startDate = null, DateTime? endDate = null)
        {
            IQueryable<FailedLoginAttempt> query = _context.FailedLoginAttempts.AsQueryable();

            if (startDate.HasValue)
                query = query.Where(f => f.AttemptTime >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(f => f.AttemptTime <= endDate.Value);

            return await query
                .Where(f => !string.IsNullOrEmpty(f.Country))
                .GroupBy(f => f.Country!)
                .ToDictionaryAsync(g => g.Key, g => g.Count());
        }

        public async Task<IEnumerable<FailedLoginAttempt>> GetLoginsFromUnusualLocationsAsync(string emailOrUsername)
        {
            return await _context.FailedLoginAttempts
                .Where(f => f.EmailOrUsername == emailOrUsername && f.IsSuspicious)
                .OrderByDescending(f => f.AttemptTime)
                .ToListAsync();
        }

        // Session Management
        public async Task<IEnumerable<UserSession>> GetActiveSessionsAsync(int userId)
        {
            return await _context.UserSessions
                .Where(s => s.UserId == userId && s.IsActive)
                .ToListAsync();
        }

        public async Task<UserSession?> GetSessionAsync(string sessionId)
        {
            return await _context.UserSessions
                .FirstOrDefaultAsync(s => s.SessionToken == sessionId);
        }

        public async Task<UserSession> CreateSessionAsync(UserSession session)
        {
            _context.UserSessions.Add(session);
            await _context.SaveChangesAsync();
            return session;
        }

        public async Task UpdateSessionAsync(UserSession session)
        {
            _context.UserSessions.Update(session);
            await _context.SaveChangesAsync();
        }

        public async Task InvalidateSessionAsync(string sessionId)
        {
            UserSession? session = await GetSessionAsync(sessionId);
            if (session != null)
            {
                session.IsActive = false;
                session.TerminatedAt = DateTime.UtcNow;
                session.TerminationReason = "Manual Invalidation";
                await UpdateSessionAsync(session);
            }
        }

        public async Task InvalidateUserSessionsAsync(int userId, string? excludeSessionId = null)
        {
            IEnumerable<UserSession> sessions = await _context.UserSessions
                .Where(s => s.UserId == userId && s.IsActive && s.SessionToken != excludeSessionId)
                .ToListAsync();

            foreach (UserSession session in sessions)
            {
                session.IsActive = false;
                session.TerminatedAt = DateTime.UtcNow;
                session.TerminationReason = "Bulk Invalidation";
            }

            await _context.SaveChangesAsync();
        }

        // Security Monitoring Service specific methods
        public async Task<List<SecurityAuditLog>> GetSecurityAuditLogsAsync(DateTime startDate, DateTime endDate)
        {
            return await _context.SecurityAuditLogs
                .Where(log => log.Timestamp >= startDate && log.Timestamp <= endDate)
                .OrderByDescending(log => log.Timestamp)
                .ToListAsync();
        }

        public async Task<int> GetActiveUsersAsync(DateTime since)
        {
            return await _context.Users
                .Where(u => u.UpdatedAt >= since)
                .CountAsync();
        }

        public async Task<List<RateLimitTierConfig>> GetRateLimitTierConfigsAsync()
        {
            return await _context.RateLimitTierConfigs
                .Include(c => c.SubscriptionTier)
                .ToListAsync();
        }

        public async Task<int> GetBlockedRequestsAsync(DateTime since, string? contains = null)
        {
            IQueryable<SecurityAuditLog> query = _context.SecurityAuditLogs
                .Where(log => log.Timestamp >= since && !log.IsSuccessful);

            if (!string.IsNullOrEmpty(contains))
            {
                query = query.Where(log => log.Details != null && log.Details.Contains(contains));
            }

            return await query.CountAsync();
        }

        public async Task<List<UserQuotaStatusDTO>> GetUserActivityAsync(DateTime since, string? filter = null)
        {
            List<SecurityAuditLog> auditLogs = await _context.SecurityAuditLogs
                .Where(log => log.Timestamp >= since && log.UserId.HasValue)
                .GroupBy(log => log.UserId.Value )
                .Select(g => g.OrderByDescending(log => log.Timestamp).First())
                .ToListAsync();

            return auditLogs.Select(log => new UserQuotaStatusDTO
            {
                UserId = log.UserId!.Value,
                Username = log.Username ?? "Unknown",
                SubscriptionTier = "Free",
                ApiCallsUsedToday = 1,
                MaxDailyApiCalls = 1000,
                UsagePercentage = 0.1,
                LastActivity = log.Timestamp,
                IsNearLimit = false,
                IsExempt = false
            }).ToList();
        }

        public async Task<List<SystemHealthMetrics>> GetSystemHealthMetricsAsync(DateTime since)
        {
            return await _context.SystemHealthMetrics
                .Where(m => m.Timestamp >= since)
                .OrderByDescending(m => m.Timestamp)
                .ToListAsync();
        }

        public async Task<List<SecurityMetrics>> GetSecurityMetricsAsync(DateTime? from = null, DateTime? to = null)
        {
            IQueryable<SecurityMetrics> query = _context.SecurityMetrics;

            if (from.HasValue)
                query = query.Where(m => m.Timestamp >= from.Value);

            if (to.HasValue)
                query = query.Where(m => m.Timestamp <= to.Value);

            return await query.OrderByDescending(m => m.Timestamp).ToListAsync();
        }

        public async Task<IQueryable<SecurityAuditLog>> GetSecurityAuditLogsAsync()
        {
            return await Task.FromResult(_context.SecurityAuditLogs.AsQueryable());
        }

        public async Task<List<IGrouping<string, SecurityAuditLog>>> GetRecentSuspiciousGroupsAsync(DateTime since)
        {
            List<SecurityAuditLog> suspiciousLogs = await _context.SecurityAuditLogs
                .Where(log => log.Timestamp >= since && log.IsSuspicious)
                .ToListAsync();

            return suspiciousLogs.GroupBy(log => log.EventType).ToList();
        }

        public async Task<List<SecurityAuditLog>> GetAllSecurityAuditLogsAsync(DateTime since)
        {
            return await _context.SecurityAuditLogs
                .Where(log => log.Timestamp >= since)
                .OrderByDescending(log => log.Timestamp)
                .ToListAsync();
        }

        public async Task<List<SecurityAuditLog>> GetApiAuditLogsAsync(DateTime since)
        {
            return await _context.SecurityAuditLogs
                .Where(log => log.Timestamp >= since && 
                            log.Resource != null && 
                            !log.Resource.Contains("/hubs/") && 
                            !log.Resource.Contains("websocket"))
                .OrderByDescending(log => log.Timestamp)
                .ToListAsync();
        }

        public async Task<int> GetRecentActivityAsync(DateTime since, int? userId = null, string? ipAddress = null)
        {
            IQueryable<SecurityAuditLog> query = _context.SecurityAuditLogs
                .Where(log => log.Timestamp >= since);

            if (userId.HasValue)
                query = query.Where(log => log.UserId == userId.Value);

            if (!string.IsNullOrEmpty(ipAddress))
                query = query.Where(log => log.IpAddress == ipAddress);

            return await query.CountAsync();
        }

        public async Task<List<UserActivityDTO>> GetSuspiciousUsersAsync(DateTime since, int limit)
        {
            List<SecurityAuditLog> suspiciousLogs = await _context.SecurityAuditLogs
                .Where(log => log.Timestamp >= since && log.IsSuspicious && log.UserId.HasValue)
                .GroupBy(log => log.UserId.Value)
                .Select(g => g.OrderByDescending(log => log.Timestamp).First())
                .Take(limit)
                .ToListAsync();

            return suspiciousLogs.Select(log => new UserActivityDTO
            {
                UserId = log.UserId!.Value,
                Username = log.Username ?? "Unknown",
                RequestCount = 1,
                LastActivity = log.Timestamp,
                IsSuspicious = true
            }).ToList();
        }

        public async Task<List<SecurityAuditLog>> GetResponseTimeAuditLogsAsync(DateTime since)
        {
            return await _context.SecurityAuditLogs
                .Where(log => log.Timestamp >= since && 
                            log.Details != null && 
                            log.Details.Contains("Elapsed:") &&
                            log.Resource != null && 
                            !log.Resource.Contains("/hubs/"))
                .OrderByDescending(log => log.Timestamp)
                .ToListAsync();
        }

        public async Task<List<SecurityAuditLog>> GetTopEndpointsAuditLogsAsync(DateTime since)
        {
            return await _context.SecurityAuditLogs
                .Where(log => log.Timestamp >= since && 
                            log.Resource != null && 
                            !log.Resource.Contains("/hubs/") && 
                            !log.Resource.Contains("websocket"))
                .OrderByDescending(log => log.Timestamp)
                .ToListAsync();
        }

        public async Task<List<UserActivityDTO>> GetTopUsersAsync(DateTime since, int limit)
        {
            List<UserActivityDTO> result = new List<UserActivityDTO>();
            
            IEnumerable<IGrouping<int, SecurityAuditLog>> userGroups = await _context.SecurityAuditLogs
                .Where(log => log.Timestamp >= since && log.UserId.HasValue)
                .GroupBy(log => log.UserId.Value)
                .OrderByDescending(g => g.Count())
                .Take(limit)
                .ToListAsync();

            foreach (IGrouping<int, SecurityAuditLog> group in userGroups)
            {
                SecurityAuditLog firstLog = group.First();
                result.Add(new UserActivityDTO
                {
                    UserId = group.Key,
                    Username = firstLog.Username ?? "Unknown",
                    RequestCount = group.Count(),
                    LastActivity = group.Max(x => x.Timestamp),
                    IsSuspicious = false
                });
            }

            return result;
        }

        public async Task<List<SecurityAuditLog>> GetStatusCodeAuditLogsAsync(DateTime since)
        {
            return await _context.SecurityAuditLogs
                .Where(log => log.Timestamp >= since && 
                            log.Details != null && 
                            log.Details.Contains("Response:"))
                .OrderByDescending(log => log.Timestamp)
                .ToListAsync();
        }

        // Data persistence methods
        public async Task AddSecurityMetricAsync(SecurityMetrics metric)
        {
            _context.SecurityMetrics.Add(metric);
            await _context.SaveChangesAsync();
        }

        public async Task AddSecurityAuditLogAsync(SecurityAuditLog auditLog)
        {
            _context.SecurityAuditLogs.Add(auditLog);
            await _context.SaveChangesAsync();
        }

        public async Task AddSystemHealthMetricAsync(SystemHealthMetrics healthMetric)
        {
            _context.SystemHealthMetrics.Add(healthMetric);
            await _context.SaveChangesAsync();
        }

        public async Task<List<SecurityAuditLog>> GetSecurityAuditLogsAsync(DateTime? olderThan)
        {
            IQueryable<SecurityAuditLog> query = _context.SecurityAuditLogs;
            
            if (olderThan.HasValue)
                query = query.Where(log => log.Timestamp < olderThan.Value);
            
            return await query.ToListAsync();
        }

        public async Task RemoveSecurityAuditLogs(List<SecurityAuditLog> logsToDelete)
        {
            _context.SecurityAuditLogs.RemoveRange(logsToDelete);
            await Task.CompletedTask;
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }

        public async Task<List<SecurityMetrics>> GetSecurityMetricsAsync(DateTime? olderThan)
        {
            IQueryable<SecurityMetrics> query = _context.SecurityMetrics;
            
            if (olderThan.HasValue)
                query = query.Where(m => m.Timestamp < olderThan.Value);
            
            return await query.ToListAsync();
        }

        public async Task RemoveSecurityMetrics(List<SecurityMetrics> metricsToDelete)
        {
            _context.SecurityMetrics.RemoveRange(metricsToDelete);
            await Task.CompletedTask;
        }

        public async Task<int> GetSecurityAuditLogsCountAsync()
        {
            return await _context.SecurityAuditLogs.CountAsync();
        }

        public async Task<int> GetSecurityMetricsCountAsync()
        {
            return await _context.SecurityMetrics.CountAsync();
        }

        public async Task<int> GetSystemHealthMetricsCountAsync()
        {
            return await _context.SystemHealthMetrics.CountAsync();
        }

        public async Task RemoveAllSecurityLogs()
        {
            _context.SecurityAuditLogs.RemoveRange(_context.SecurityAuditLogs);
            _context.SecurityMetrics.RemoveRange(_context.SecurityMetrics);
            _context.SystemHealthMetrics.RemoveRange(_context.SystemHealthMetrics);
            await Task.CompletedTask;
        }

        public async Task<int> GetRecentActivityAsync(DateTime since)
        {
            return await _context.SecurityAuditLogs
                .Where(log => log.Timestamp >= since)
                .CountAsync();
        }
    }
} 