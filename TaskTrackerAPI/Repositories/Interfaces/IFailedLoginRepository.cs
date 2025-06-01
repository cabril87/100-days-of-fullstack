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
    /// Repository interface for failed login attempt management
    /// </summary>
    public interface IFailedLoginRepository
    {
        /// <summary>
        /// Creates a new failed login attempt record
        /// </summary>
        /// <param name="failedAttempt">Failed login attempt to create</param>
        /// <returns>Created failed login attempt</returns>
        Task<FailedLoginAttempt> CreateFailedLoginAttemptAsync(FailedLoginAttempt failedAttempt);

        /// <summary>
        /// Gets recent failed login attempts for a specific user/email
        /// </summary>
        /// <param name="emailOrUsername">Email or username to search for</param>
        /// <param name="minutesBack">Number of minutes to look back</param>
        /// <returns>Collection of recent failed attempts</returns>
        Task<IEnumerable<FailedLoginAttempt>> GetRecentFailedAttemptsAsync(string emailOrUsername, int minutesBack = 15);

        /// <summary>
        /// Counts failed login attempts for a user within a time window
        /// </summary>
        /// <param name="emailOrUsername">Email or username to search for</param>
        /// <param name="minutesBack">Number of minutes to look back</param>
        /// <returns>Count of failed attempts</returns>
        Task<int> GetFailedAttemptCountAsync(string emailOrUsername, int minutesBack = 15);

        /// <summary>
        /// Gets failed login attempts within a date range
        /// </summary>
        /// <param name="from">Start date</param>
        /// <param name="to">End date</param>
        /// <returns>Collection of failed login attempts</returns>
        Task<IEnumerable<FailedLoginAttempt>> GetFailedAttemptsInRangeAsync(DateTime from, DateTime to);

        /// <summary>
        /// Gets paginated failed login attempts
        /// </summary>
        /// <param name="page">Page number (1-based)</param>
        /// <param name="pageSize">Number of records per page</param>
        /// <returns>Collection of failed login attempts</returns>
        Task<IEnumerable<FailedLoginAttempt>> GetFailedAttemptsPagedAsync(int page = 1, int pageSize = 50);

        /// <summary>
        /// Gets failed login attempts from a specific IP address
        /// </summary>
        /// <param name="ipAddress">IP address to filter by</param>
        /// <param name="hoursBack">Number of hours to look back</param>
        /// <returns>Collection of failed attempts from the IP</returns>
        Task<IEnumerable<FailedLoginAttempt>> GetFailedAttemptsByIPAsync(string ipAddress, int hoursBack = 24);

        /// <summary>
        /// Gets suspicious failed login attempts
        /// </summary>
        /// <param name="hoursBack">Number of hours to look back</param>
        /// <returns>Collection of suspicious failed attempts</returns>
        Task<IEnumerable<FailedLoginAttempt>> GetSuspiciousAttemptsAsync(int hoursBack = 24);

        /// <summary>
        /// Gets top targeted accounts (most failed login attempts)
        /// </summary>
        /// <param name="hoursBack">Number of hours to look back</param>
        /// <param name="limit">Maximum number of accounts to return</param>
        /// <returns>Collection of account names with attempt counts</returns>
        Task<IEnumerable<(string EmailOrUsername, int AttemptCount)>> GetTopTargetedAccountsAsync(int hoursBack = 24, int limit = 5);

        /// <summary>
        /// Gets top attacking IP addresses (most failed login attempts)
        /// </summary>
        /// <param name="hoursBack">Number of hours to look back</param>
        /// <param name="limit">Maximum number of IPs to return</param>
        /// <returns>Collection of IP addresses with attempt counts</returns>
        Task<IEnumerable<(string IpAddress, int AttemptCount)>> GetTopAttackingIPsAsync(int hoursBack = 24, int limit = 5);

        /// <summary>
        /// Gets unique IP addresses from failed login attempts
        /// </summary>
        /// <param name="hoursBack">Number of hours to look back</param>
        /// <returns>Collection of unique IP addresses</returns>
        Task<IEnumerable<string>> GetUniqueIPAddressesAsync(int hoursBack = 24);

        /// <summary>
        /// Counts unique IP addresses from failed login attempts
        /// </summary>
        /// <param name="hoursBack">Number of hours to look back</param>
        /// <returns>Count of unique IP addresses</returns>
        Task<int> GetUniqueIPCountAsync(int hoursBack = 24);

        /// <summary>
        /// Counts total failed login attempts
        /// </summary>
        /// <param name="hoursBack">Number of hours to look back</param>
        /// <returns>Total count of failed attempts</returns>
        Task<int> GetTotalAttemptCountAsync(int hoursBack = 24);

        /// <summary>
        /// Counts suspicious failed login attempts
        /// </summary>
        /// <param name="hoursBack">Number of hours to look back</param>
        /// <returns>Count of suspicious attempts</returns>
        Task<int> GetSuspiciousAttemptCountAsync(int hoursBack = 24);

        /// <summary>
        /// Gets recent failed login attempts for summary
        /// </summary>
        /// <param name="limit">Maximum number of recent attempts to return</param>
        /// <returns>Collection of recent attempts</returns>
        Task<IEnumerable<FailedLoginAttempt>> GetRecentAttemptsAsync(int limit = 10);

        /// <summary>
        /// Removes failed login attempts for a user (account unlock)
        /// </summary>
        /// <param name="emailOrUsername">Email or username to clear attempts for</param>
        /// <param name="minutesBack">Number of minutes to clear back</param>
        /// <returns>Number of records removed</returns>
        Task<int> RemoveRecentAttemptsAsync(string emailOrUsername, int minutesBack = 15);

        /// <summary>
        /// Gets failed login attempts from multiple accounts targeted by the same IP
        /// </summary>
        /// <param name="ipAddress">IP address to analyze</param>
        /// <param name="hoursBack">Number of hours to look back</param>
        /// <returns>Collection of unique account names targeted</returns>
        Task<IEnumerable<string>> GetAccountsTargetedByIPAsync(string ipAddress, int hoursBack = 1);

        /// <summary>
        /// Gets failed login attempts with rapid succession patterns
        /// </summary>
        /// <param name="emailOrUsername">Email or username to check</param>
        /// <param name="minutesBack">Number of minutes to look back</param>
        /// <param name="minimumAttempts">Minimum attempts to consider rapid</param>
        /// <returns>Count of attempts in the time window</returns>
        Task<int> GetRapidAttemptsCountAsync(string emailOrUsername, int minutesBack = 1, int minimumAttempts = 3);

        /// <summary>
        /// Checks if an IP address has exceeded suspicious thresholds
        /// </summary>
        /// <param name="ipAddress">IP address to check</param>
        /// <param name="hoursBack">Number of hours to look back</param>
        /// <param name="suspiciousThreshold">Threshold for suspicious activity</param>
        /// <returns>True if IP exceeds threshold</returns>
        Task<bool> IsIPSuspiciousAsync(string ipAddress, int hoursBack = 24, int suspiciousThreshold = 10);

        /// <summary>
        /// Gets geographical distribution of failed login attempts
        /// </summary>
        /// <param name="hoursBack">Number of hours to look back</param>
        /// <returns>Collection of country/city combinations with attempt counts</returns>
        Task<IEnumerable<(string Country, string City, int AttemptCount)>> GetGeographicalDistributionAsync(int hoursBack = 24);

        /// <summary>
        /// Gets failed login statistics for analysis
        /// </summary>
        /// <param name="hoursBack">Number of hours to look back</param>
        /// <returns>Statistics summary</returns>
        Task<(int TotalAttempts, int UniqueIPs, int SuspiciousAttempts, int UniqueTargets)> GetFailedLoginStatisticsAsync(int hoursBack = 24);
    }
} 