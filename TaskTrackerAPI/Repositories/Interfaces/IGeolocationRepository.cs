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

namespace TaskTrackerAPI.Repositories.Interfaces
{
    /// <summary>
    /// Repository interface for geolocation and IP access management
    /// </summary>
    public interface IGeolocationRepository
    {
        /// <summary>
        /// Gets recent IP access data from security audit logs
        /// </summary>
        /// <param name="hoursBack">Number of hours to look back</param>
        /// <param name="limit">Maximum number of records to return</param>
        /// <returns>Collection of recent IP access records</returns>
        Task<IEnumerable<SecurityAuditLog>> GetRecentIPAccessAsync(int hoursBack = 24, int limit = 50);

        /// <summary>
        /// Gets security audit logs grouped by IP address
        /// </summary>
        /// <param name="hoursBack">Number of hours to look back</param>
        /// <param name="limit">Maximum number of unique IPs to return</param>
        /// <returns>Collection of IP access summary data</returns>
        Task<IEnumerable<(string IpAddress, DateTime LastAccess, string Username, bool IsSuspicious)>> GetGroupedIPAccessAsync(int hoursBack = 24, int limit = 20);

        /// <summary>
        /// Gets security audit logs for a specific IP address
        /// </summary>
        /// <param name="ipAddress">IP address to filter by</param>
        /// <param name="hoursBack">Number of hours to look back</param>
        /// <returns>Collection of audit logs for the IP</returns>
        Task<IEnumerable<SecurityAuditLog>> GetAuditLogsByIPAsync(string ipAddress, int hoursBack = 24);

        /// <summary>
        /// Gets distinct IP addresses from recent security audit logs
        /// </summary>
        /// <param name="hoursBack">Number of hours to look back</param>
        /// <returns>Collection of unique IP addresses</returns>
        Task<IEnumerable<string>> GetUniqueIPAddressesAsync(int hoursBack = 24);

        /// <summary>
        /// Gets historical IP addresses for a specific user
        /// </summary>
        /// <param name="userId">ID of the user</param>
        /// <param name="daysBack">Number of days to look back</param>
        /// <returns>Collection of unique IP addresses used by the user</returns>
        Task<IEnumerable<string>> GetUserHistoricalIPsAsync(int userId, int daysBack = 30);

        /// <summary>
        /// Gets security audit logs for a specific user
        /// </summary>
        /// <param name="userId">ID of the user</param>
        /// <param name="daysBack">Number of days to look back</param>
        /// <returns>Collection of user's audit logs</returns>
        Task<IEnumerable<SecurityAuditLog>> GetUserAuditLogsAsync(int userId, int daysBack = 30);

        /// <summary>
        /// Counts unique IP addresses in recent audit logs
        /// </summary>
        /// <param name="hoursBack">Number of hours to look back</param>
        /// <returns>Count of unique IP addresses</returns>
        Task<int> GetUniqueIPCountAsync(int hoursBack = 24);

        /// <summary>
        /// Counts suspicious IP access attempts
        /// </summary>
        /// <param name="hoursBack">Number of hours to look back</param>
        /// <returns>Count of suspicious access attempts</returns>
        Task<int> GetSuspiciousIPCountAsync(int hoursBack = 24);

        /// <summary>
        /// Gets the most recent access time for an IP address
        /// </summary>
        /// <param name="ipAddress">IP address to check</param>
        /// <returns>Most recent access time or null if not found</returns>
        Task<DateTime?> GetLastAccessTimeAsync(string ipAddress);

        /// <summary>
        /// Gets access frequency for an IP address
        /// </summary>
        /// <param name="ipAddress">IP address to analyze</param>
        /// <param name="hoursBack">Number of hours to look back</param>
        /// <returns>Number of access attempts</returns>
        Task<int> GetIPAccessFrequencyAsync(string ipAddress, int hoursBack = 24);

        /// <summary>
        /// Gets users accessed from a specific IP address
        /// </summary>
        /// <param name="ipAddress">IP address to analyze</param>
        /// <param name="hoursBack">Number of hours to look back</param>
        /// <returns>Collection of unique usernames</returns>
        Task<IEnumerable<string>> GetUsersFromIPAsync(string ipAddress, int hoursBack = 24);

        /// <summary>
        /// Checks if an IP has suspicious activity patterns
        /// </summary>
        /// <param name="ipAddress">IP address to check</param>
        /// <param name="hoursBack">Number of hours to look back</param>
        /// <returns>True if the IP has suspicious patterns</returns>
        Task<bool> HasSuspiciousActivityAsync(string ipAddress, int hoursBack = 24);

        /// <summary>
        /// Gets geographical data from security audit logs
        /// </summary>
        /// <param name="hoursBack">Number of hours to look back</param>
        /// <returns>Collection of audit logs with geographical information</returns>
        Task<IEnumerable<SecurityAuditLog>> GetAuditLogsWithLocationDataAsync(int hoursBack = 24);

        /// <summary>
        /// Gets access summary statistics
        /// </summary>
        /// <param name="hoursBack">Number of hours to look back</param>
        /// <returns>Access statistics summary</returns>
        Task<(int TotalAccess, int UniqueIPs, int SuspiciousAccess)> GetAccessStatisticsAsync(int hoursBack = 24);

        /// <summary>
        /// Creates a new security audit log entry
        /// </summary>
        /// <param name="auditLog">Audit log to create</param>
        /// <returns>Created audit log</returns>
        Task<SecurityAuditLog> CreateAuditLogAsync(SecurityAuditLog auditLog);

        /// <summary>
        /// Updates an existing security audit log
        /// </summary>
        /// <param name="auditLog">Audit log to update</param>
        /// <returns>Updated audit log</returns>
        Task<SecurityAuditLog> UpdateAuditLogAsync(SecurityAuditLog auditLog);

        /// <summary>
        /// Gets failed login attempts from a specific IP
        /// </summary>
        /// <param name="ipAddress">IP address to check</param>
        /// <param name="hoursBack">Number of hours to look back</param>
        /// <returns>Collection of failed login attempts</returns>
        Task<IEnumerable<FailedLoginAttempt>> GetFailedLoginsFromIPAsync(string ipAddress, int hoursBack = 24);

        /// <summary>
        /// Gets user sessions from a specific IP
        /// </summary>
        /// <param name="ipAddress">IP address to check</param>
        /// <param name="hoursBack">Number of hours to look back</param>
        /// <returns>Collection of user sessions</returns>
        Task<IEnumerable<UserSession>> GetSessionsFromIPAsync(string ipAddress, int hoursBack = 24);
    }
} 