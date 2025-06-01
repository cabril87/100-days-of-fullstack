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
    /// Repository implementation for failed login attempt management
    /// </summary>
    public class FailedLoginRepository : IFailedLoginRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<FailedLoginRepository> _logger;

        public FailedLoginRepository(ApplicationDbContext context, ILogger<FailedLoginRepository> logger)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<FailedLoginAttempt> CreateFailedLoginAttemptAsync(FailedLoginAttempt failedAttempt)
        {
            try
            {
                failedAttempt.CreatedAt = DateTime.UtcNow;

                _context.FailedLoginAttempts.Add(failedAttempt);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Created failed login attempt record for {EmailOrUsername} from IP {IPAddress}", 
                    failedAttempt.EmailOrUsername, failedAttempt.IpAddress);
                return failedAttempt;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating failed login attempt for {EmailOrUsername}", failedAttempt.EmailOrUsername);
                throw;
            }
        }

        public async Task<IEnumerable<FailedLoginAttempt>> GetRecentFailedAttemptsAsync(string emailOrUsername, int minutesBack = 15)
        {
            try
            {
                DateTime cutoffTime = DateTime.UtcNow.AddMinutes(-minutesBack);

                return await _context.FailedLoginAttempts
                    .Where(f => f.EmailOrUsername == emailOrUsername && f.AttemptTime >= cutoffTime)
                    .OrderByDescending(f => f.AttemptTime)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving recent failed attempts for {EmailOrUsername}", emailOrUsername);
                return Enumerable.Empty<FailedLoginAttempt>();
            }
        }

        public async Task<int> GetFailedAttemptCountAsync(string emailOrUsername, int minutesBack = 15)
        {
            try
            {
                DateTime cutoffTime = DateTime.UtcNow.AddMinutes(-minutesBack);

                return await _context.FailedLoginAttempts
                    .Where(f => f.EmailOrUsername == emailOrUsername && f.AttemptTime >= cutoffTime)
                    .CountAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error counting failed attempts for {EmailOrUsername}", emailOrUsername);
                return 0;
            }
        }

        public async Task<IEnumerable<FailedLoginAttempt>> GetFailedAttemptsInRangeAsync(DateTime from, DateTime to)
        {
            try
            {
                return await _context.FailedLoginAttempts
                    .Where(f => f.AttemptTime >= from && f.AttemptTime <= to)
                    .OrderByDescending(f => f.AttemptTime)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving failed attempts in range {From} to {To}", from, to);
                return Enumerable.Empty<FailedLoginAttempt>();
            }
        }

        public async Task<IEnumerable<FailedLoginAttempt>> GetFailedAttemptsPagedAsync(int page = 1, int pageSize = 50)
        {
            try
            {
                int skip = (page - 1) * pageSize;

                return await _context.FailedLoginAttempts
                    .OrderByDescending(f => f.AttemptTime)
                    .Skip(skip)
                    .Take(pageSize)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving paged failed attempts (page {Page}, size {PageSize})", page, pageSize);
                return Enumerable.Empty<FailedLoginAttempt>();
            }
        }

        public async Task<IEnumerable<FailedLoginAttempt>> GetFailedAttemptsByIPAsync(string ipAddress, int hoursBack = 24)
        {
            try
            {
                DateTime cutoffTime = DateTime.UtcNow.AddHours(-hoursBack);

                return await _context.FailedLoginAttempts
                    .Where(f => f.IpAddress == ipAddress && f.AttemptTime >= cutoffTime)
                    .OrderByDescending(f => f.AttemptTime)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving failed attempts by IP {IPAddress}", ipAddress);
                return Enumerable.Empty<FailedLoginAttempt>();
            }
        }

        public async Task<IEnumerable<FailedLoginAttempt>> GetSuspiciousAttemptsAsync(int hoursBack = 24)
        {
            try
            {
                DateTime cutoffTime = DateTime.UtcNow.AddHours(-hoursBack);

                return await _context.FailedLoginAttempts
                    .Where(f => f.IsSuspicious && f.AttemptTime >= cutoffTime)
                    .OrderByDescending(f => f.AttemptTime)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving suspicious failed attempts");
                return Enumerable.Empty<FailedLoginAttempt>();
            }
        }

        public async Task<IEnumerable<(string EmailOrUsername, int AttemptCount)>> GetTopTargetedAccountsAsync(int hoursBack = 24, int limit = 5)
        {
            try
            {
                DateTime cutoffTime = DateTime.UtcNow.AddHours(-hoursBack);

                var topAccounts = await _context.FailedLoginAttempts
                    .Where(f => f.AttemptTime >= cutoffTime)
                    .GroupBy(f => f.EmailOrUsername)
                    .Select(g => new { EmailOrUsername = g.Key, AttemptCount = g.Count() })
                    .OrderByDescending(g => g.AttemptCount)
                    .Take(limit)
                    .ToListAsync();

                return topAccounts.Select(a => (a.EmailOrUsername, a.AttemptCount));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving top targeted accounts");
                return Enumerable.Empty<(string, int)>();
            }
        }

        public async Task<IEnumerable<(string IpAddress, int AttemptCount)>> GetTopAttackingIPsAsync(int hoursBack = 24, int limit = 5)
        {
            try
            {
                DateTime cutoffTime = DateTime.UtcNow.AddHours(-hoursBack);

                var topIPs = await _context.FailedLoginAttempts
                    .Where(f => f.AttemptTime >= cutoffTime)
                    .GroupBy(f => f.IpAddress)
                    .Select(g => new { IpAddress = g.Key, AttemptCount = g.Count() })
                    .OrderByDescending(g => g.AttemptCount)
                    .Take(limit)
                    .ToListAsync();

                return topIPs.Select(ip => (ip.IpAddress, ip.AttemptCount));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving top attacking IPs");
                return Enumerable.Empty<(string, int)>();
            }
        }

        public async Task<IEnumerable<string>> GetUniqueIPAddressesAsync(int hoursBack = 24)
        {
            try
            {
                DateTime cutoffTime = DateTime.UtcNow.AddHours(-hoursBack);

                return await _context.FailedLoginAttempts
                    .Where(f => f.AttemptTime >= cutoffTime)
                    .Select(f => f.IpAddress)
                    .Distinct()
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving unique IP addresses");
                return Enumerable.Empty<string>();
            }
        }

        public async Task<int> GetUniqueIPCountAsync(int hoursBack = 24)
        {
            try
            {
                DateTime cutoffTime = DateTime.UtcNow.AddHours(-hoursBack);

                return await _context.FailedLoginAttempts
                    .Where(f => f.AttemptTime >= cutoffTime)
                    .Select(f => f.IpAddress)
                    .Distinct()
                    .CountAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error counting unique IP addresses");
                return 0;
            }
        }

        public async Task<int> GetTotalAttemptCountAsync(int hoursBack = 24)
        {
            try
            {
                DateTime cutoffTime = DateTime.UtcNow.AddHours(-hoursBack);

                return await _context.FailedLoginAttempts
                    .Where(f => f.AttemptTime >= cutoffTime)
                    .CountAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error counting total failed attempts");
                return 0;
            }
        }

        public async Task<int> GetSuspiciousAttemptCountAsync(int hoursBack = 24)
        {
            try
            {
                DateTime cutoffTime = DateTime.UtcNow.AddHours(-hoursBack);

                return await _context.FailedLoginAttempts
                    .Where(f => f.IsSuspicious && f.AttemptTime >= cutoffTime)
                    .CountAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error counting suspicious failed attempts");
                return 0;
            }
        }

        public async Task<IEnumerable<FailedLoginAttempt>> GetRecentAttemptsAsync(int limit = 10)
        {
            try
            {
                return await _context.FailedLoginAttempts
                    .OrderByDescending(f => f.AttemptTime)
                    .Take(limit)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving recent failed attempts");
                return Enumerable.Empty<FailedLoginAttempt>();
            }
        }

        public async Task<int> RemoveRecentAttemptsAsync(string emailOrUsername, int minutesBack = 15)
        {
            try
            {
                DateTime cutoffTime = DateTime.UtcNow.AddMinutes(-minutesBack);

                var recentAttempts = await _context.FailedLoginAttempts
                    .Where(f => f.EmailOrUsername == emailOrUsername && f.AttemptTime >= cutoffTime)
                    .ToListAsync();

                _context.FailedLoginAttempts.RemoveRange(recentAttempts);
                await _context.SaveChangesAsync();

                int removedCount = recentAttempts.Count;
                _logger.LogInformation("Removed {Count} recent failed attempts for {EmailOrUsername}", removedCount, emailOrUsername);
                return removedCount;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing recent attempts for {EmailOrUsername}", emailOrUsername);
                return 0;
            }
        }

        public async Task<IEnumerable<string>> GetAccountsTargetedByIPAsync(string ipAddress, int hoursBack = 1)
        {
            try
            {
                DateTime cutoffTime = DateTime.UtcNow.AddHours(-hoursBack);

                return await _context.FailedLoginAttempts
                    .Where(f => f.IpAddress == ipAddress && f.AttemptTime >= cutoffTime)
                    .Select(f => f.EmailOrUsername)
                    .Distinct()
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving accounts targeted by IP {IPAddress}", ipAddress);
                return Enumerable.Empty<string>();
            }
        }

        public async Task<int> GetRapidAttemptsCountAsync(string emailOrUsername, int minutesBack = 1, int minimumAttempts = 3)
        {
            try
            {
                DateTime cutoffTime = DateTime.UtcNow.AddMinutes(-minutesBack);

                return await _context.FailedLoginAttempts
                    .Where(f => f.EmailOrUsername == emailOrUsername && f.AttemptTime >= cutoffTime)
                    .CountAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error counting rapid attempts for {EmailOrUsername}", emailOrUsername);
                return 0;
            }
        }

        public async Task<bool> IsIPSuspiciousAsync(string ipAddress, int hoursBack = 24, int suspiciousThreshold = 10)
        {
            try
            {
                DateTime cutoffTime = DateTime.UtcNow.AddHours(-hoursBack);

                int recentAttempts = await _context.FailedLoginAttempts
                    .Where(f => f.IpAddress == ipAddress && f.AttemptTime >= cutoffTime)
                    .CountAsync();

                bool hasSuspiciousAttempts = await _context.FailedLoginAttempts
                    .Where(f => f.IpAddress == ipAddress && f.AttemptTime >= cutoffTime)
                    .AnyAsync(f => f.IsSuspicious);

                return recentAttempts >= suspiciousThreshold || hasSuspiciousAttempts;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking if IP is suspicious: {IPAddress}", ipAddress);
                return false;
            }
        }

        public async Task<IEnumerable<(string Country, string City, int AttemptCount)>> GetGeographicalDistributionAsync(int hoursBack = 24)
        {
            try
            {
                DateTime cutoffTime = DateTime.UtcNow.AddHours(-hoursBack);

                var distribution = await _context.FailedLoginAttempts
                    .Where(f => f.AttemptTime >= cutoffTime && f.Country != null && f.City != null)
                    .GroupBy(f => new { f.Country, f.City })
                    .Select(g => new { Country = g.Key.Country!, City = g.Key.City!, AttemptCount = g.Count() })
                    .OrderByDescending(g => g.AttemptCount)
                    .ToListAsync();

                return distribution.Select(d => (d.Country, d.City, d.AttemptCount));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving geographical distribution of failed attempts");
                return Enumerable.Empty<(string, string, int)>();
            }
        }

        public async Task<(int TotalAttempts, int UniqueIPs, int SuspiciousAttempts, int UniqueTargets)> GetFailedLoginStatisticsAsync(int hoursBack = 24)
        {
            try
            {
                DateTime cutoffTime = DateTime.UtcNow.AddHours(-hoursBack);

                var attempts = await _context.FailedLoginAttempts
                    .Where(f => f.AttemptTime >= cutoffTime)
                    .ToListAsync();

                int totalAttempts = attempts.Count;
                int uniqueIPs = attempts.Select(f => f.IpAddress).Distinct().Count();
                int suspiciousAttempts = attempts.Count(f => f.IsSuspicious);
                int uniqueTargets = attempts.Select(f => f.EmailOrUsername).Distinct().Count();

                return (totalAttempts, uniqueIPs, suspiciousAttempts, uniqueTargets);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving failed login statistics");
                return (0, 0, 0, 0);
            }
        }
    }
} 