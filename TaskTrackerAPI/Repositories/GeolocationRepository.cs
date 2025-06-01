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
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.Data;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories.Interfaces;

namespace TaskTrackerAPI.Repositories
{
    /// <summary>
    /// Repository implementation for geolocation and IP access management
    /// </summary>
    public class GeolocationRepository : IGeolocationRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<GeolocationRepository> _logger;

        public GeolocationRepository(ApplicationDbContext context, ILogger<GeolocationRepository> logger)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<IEnumerable<SecurityAuditLog>> GetRecentIPAccessAsync(int hoursBack = 24, int limit = 50)
        {
            try
            {
                DateTime cutoffTime = DateTime.UtcNow.AddHours(-hoursBack);

                return await _context.SecurityAuditLogs
                    .Where(log => log.Timestamp >= cutoffTime && log.IpAddress != null)
                    .OrderByDescending(log => log.Timestamp)
                    .Take(limit)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving recent IP access data for last {HoursBack} hours", hoursBack);
                return Enumerable.Empty<SecurityAuditLog>();
            }
        }

        public async Task<IEnumerable<(string IpAddress, DateTime LastAccess, string Username, bool IsSuspicious)>> GetGroupedIPAccessAsync(int hoursBack = 24, int limit = 20)
        {
            try
            {
                DateTime cutoffTime = DateTime.UtcNow.AddHours(-hoursBack);

                var groupedAccess = await _context.SecurityAuditLogs
                    .Where(log => log.Timestamp >= cutoffTime && log.IpAddress != null)
                    .GroupBy(log => log.IpAddress)
                    .Select(g => new
                    {
                        IpAddress = g.Key,
                        LastAccess = g.Max(log => log.Timestamp),
                        Username = g.First().Username ?? "Unknown",
                        IsSuspicious = g.Any(log => log.IsSuspicious)
                    })
                    .OrderByDescending(g => g.LastAccess)
                    .Take(limit)
                    .ToListAsync();

                return groupedAccess.Select(g => (g.IpAddress!, g.LastAccess, g.Username, g.IsSuspicious));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving grouped IP access data for last {HoursBack} hours", hoursBack);
                return Enumerable.Empty<(string, DateTime, string, bool)>();
            }
        }

        public async Task<IEnumerable<SecurityAuditLog>> GetAuditLogsByIPAsync(string ipAddress, int hoursBack = 24)
        {
            try
            {
                DateTime cutoffTime = DateTime.UtcNow.AddHours(-hoursBack);

                return await _context.SecurityAuditLogs
                    .Where(log => log.IpAddress == ipAddress && log.Timestamp >= cutoffTime)
                    .OrderByDescending(log => log.Timestamp)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving audit logs for IP {IPAddress}", ipAddress);
                return Enumerable.Empty<SecurityAuditLog>();
            }
        }

        public async Task<IEnumerable<string>> GetUniqueIPAddressesAsync(int hoursBack = 24)
        {
            try
            {
                DateTime cutoffTime = DateTime.UtcNow.AddHours(-hoursBack);

                return await _context.SecurityAuditLogs
                    .Where(log => log.Timestamp >= cutoffTime && log.IpAddress != null)
                    .Select(log => log.IpAddress!)
                    .Distinct()
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving unique IP addresses for last {HoursBack} hours", hoursBack);
                return Enumerable.Empty<string>();
            }
        }

        public async Task<IEnumerable<string>> GetUserHistoricalIPsAsync(int userId, int daysBack = 30)
        {
            try
            {
                DateTime cutoffTime = DateTime.UtcNow.AddDays(-daysBack);

                return await _context.SecurityAuditLogs
                    .Where(log => log.UserId == userId && log.Timestamp >= cutoffTime && log.IpAddress != null)
                    .Select(log => log.IpAddress!)
                    .Distinct()
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving historical IPs for user {UserId}", userId);
                return Enumerable.Empty<string>();
            }
        }

        public async Task<IEnumerable<SecurityAuditLog>> GetUserAuditLogsAsync(int userId, int daysBack = 30)
        {
            try
            {
                DateTime cutoffTime = DateTime.UtcNow.AddDays(-daysBack);

                return await _context.SecurityAuditLogs
                    .Where(log => log.UserId == userId && log.Timestamp >= cutoffTime)
                    .OrderByDescending(log => log.Timestamp)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving audit logs for user {UserId}", userId);
                return Enumerable.Empty<SecurityAuditLog>();
            }
        }

        public async Task<int> GetUniqueIPCountAsync(int hoursBack = 24)
        {
            try
            {
                DateTime cutoffTime = DateTime.UtcNow.AddHours(-hoursBack);

                return await _context.SecurityAuditLogs
                    .Where(log => log.Timestamp >= cutoffTime && log.IpAddress != null)
                    .Select(log => log.IpAddress)
                    .Distinct()
                    .CountAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error counting unique IP addresses for last {HoursBack} hours", hoursBack);
                return 0;
            }
        }

        public async Task<int> GetSuspiciousIPCountAsync(int hoursBack = 24)
        {
            try
            {
                DateTime cutoffTime = DateTime.UtcNow.AddHours(-hoursBack);

                return await _context.SecurityAuditLogs
                    .Where(log => log.Timestamp >= cutoffTime && log.IsSuspicious && log.IpAddress != null)
                    .Select(log => log.IpAddress)
                    .Distinct()
                    .CountAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error counting suspicious IP addresses for last {HoursBack} hours", hoursBack);
                return 0;
            }
        }

        public async Task<DateTime?> GetLastAccessTimeAsync(string ipAddress)
        {
            try
            {
                return await _context.SecurityAuditLogs
                    .Where(log => log.IpAddress == ipAddress)
                    .MaxAsync(log => (DateTime?)log.Timestamp);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving last access time for IP {IPAddress}", ipAddress);
                return null;
            }
        }

        public async Task<int> GetIPAccessFrequencyAsync(string ipAddress, int hoursBack = 24)
        {
            try
            {
                DateTime cutoffTime = DateTime.UtcNow.AddHours(-hoursBack);

                return await _context.SecurityAuditLogs
                    .Where(log => log.IpAddress == ipAddress && log.Timestamp >= cutoffTime)
                    .CountAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving access frequency for IP {IPAddress}", ipAddress);
                return 0;
            }
        }

        public async Task<IEnumerable<string>> GetUsersFromIPAsync(string ipAddress, int hoursBack = 24)
        {
            try
            {
                DateTime cutoffTime = DateTime.UtcNow.AddHours(-hoursBack);

                return await _context.SecurityAuditLogs
                    .Where(log => log.IpAddress == ipAddress && log.Timestamp >= cutoffTime && log.Username != null)
                    .Select(log => log.Username!)
                    .Distinct()
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving users from IP {IPAddress}", ipAddress);
                return Enumerable.Empty<string>();
            }
        }

        public async Task<bool> HasSuspiciousActivityAsync(string ipAddress, int hoursBack = 24)
        {
            try
            {
                DateTime cutoffTime = DateTime.UtcNow.AddHours(-hoursBack);

                return await _context.SecurityAuditLogs
                    .Where(log => log.IpAddress == ipAddress && log.Timestamp >= cutoffTime)
                    .AnyAsync(log => log.IsSuspicious);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking suspicious activity for IP {IPAddress}", ipAddress);
                return false;
            }
        }

        public async Task<IEnumerable<SecurityAuditLog>> GetAuditLogsWithLocationDataAsync(int hoursBack = 24)
        {
            try
            {
                DateTime cutoffTime = DateTime.UtcNow.AddHours(-hoursBack);

                return await _context.SecurityAuditLogs
                    .Where(log => log.Timestamp >= cutoffTime && log.IpAddress != null)
                    .OrderByDescending(log => log.Timestamp)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving audit logs with location data for last {HoursBack} hours", hoursBack);
                return Enumerable.Empty<SecurityAuditLog>();
            }
        }

        public async Task<(int TotalAccess, int UniqueIPs, int SuspiciousAccess)> GetAccessStatisticsAsync(int hoursBack = 24)
        {
            try
            {
                DateTime cutoffTime = DateTime.UtcNow.AddHours(-hoursBack);

                var logs = await _context.SecurityAuditLogs
                    .Where(log => log.Timestamp >= cutoffTime && log.IpAddress != null)
                    .ToListAsync();

                int totalAccess = logs.Count;
                int uniqueIPs = logs.Select(log => log.IpAddress).Distinct().Count();
                int suspiciousAccess = logs.Count(log => log.IsSuspicious);

                return (totalAccess, uniqueIPs, suspiciousAccess);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving access statistics for last {HoursBack} hours", hoursBack);
                return (0, 0, 0);
            }
        }

        public async Task<SecurityAuditLog> CreateAuditLogAsync(SecurityAuditLog auditLog)
        {
            try
            {
                auditLog.Timestamp = DateTime.UtcNow;

                _context.SecurityAuditLogs.Add(auditLog);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Created security audit log for IP {IPAddress}", auditLog.IpAddress);
                return auditLog;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating security audit log for IP {IPAddress}", auditLog.IpAddress);
                throw;
            }
        }

        public async Task<SecurityAuditLog> UpdateAuditLogAsync(SecurityAuditLog auditLog)
        {
            try
            {
                _context.SecurityAuditLogs.Update(auditLog);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Updated security audit log {LogId}", auditLog.Id);
                return auditLog;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating security audit log {LogId}", auditLog.Id);
                throw;
            }
        }

        public async Task<IEnumerable<FailedLoginAttempt>> GetFailedLoginsFromIPAsync(string ipAddress, int hoursBack = 24)
        {
            try
            {
                DateTime cutoffTime = DateTime.UtcNow.AddHours(-hoursBack);

                return await _context.FailedLoginAttempts
                    .Where(attempt => attempt.IpAddress == ipAddress && attempt.AttemptTime >= cutoffTime)
                    .OrderByDescending(attempt => attempt.AttemptTime)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving failed logins from IP {IPAddress}", ipAddress);
                return Enumerable.Empty<FailedLoginAttempt>();
            }
        }

        public async Task<IEnumerable<UserSession>> GetSessionsFromIPAsync(string ipAddress, int hoursBack = 24)
        {
            try
            {
                DateTime cutoffTime = DateTime.UtcNow.AddHours(-hoursBack);

                return await _context.UserSessions
                    .Where(session => session.IpAddress == ipAddress && session.CreatedAt >= cutoffTime)
                    .OrderByDescending(session => session.CreatedAt)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving sessions from IP {IPAddress}", ipAddress);
                return Enumerable.Empty<UserSession>();
            }
        }
    }
} 