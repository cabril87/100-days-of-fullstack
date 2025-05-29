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
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using AutoMapper;
using TaskTrackerAPI.Data;
using TaskTrackerAPI.DTOs.Security;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Services.Interfaces;
using System.Threading.Tasks;
using System;
using System.Linq;
using System.Collections.Generic;

namespace TaskTrackerAPI.Services
{
    public class FailedLoginService : IFailedLoginService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<FailedLoginService> _logger;
        private readonly IMapper _mapper;
        private readonly IGeolocationService _geolocationService;

        // Configuration constants
        private const int MAX_FAILED_ATTEMPTS = 5;
        private const int LOCKOUT_DURATION_MINUTES = 30;
        private const int SUSPICIOUS_THRESHOLD = 10;
        private const int TIME_WINDOW_MINUTES = 15;

        public FailedLoginService(
            ApplicationDbContext context,
            ILogger<FailedLoginService> logger,
            IMapper mapper,
            IGeolocationService geolocationService)
        {
            _context = context;
            _logger = logger;
            _mapper = mapper;
            _geolocationService = geolocationService;
        }

        public async Task LogFailedLoginAttemptAsync(string emailOrUsername, string ipAddress, string? userAgent, string? failureReason)
        {
            try
            {
                // Get geolocation data
                var geolocation = await _geolocationService.GetLocationAsync(ipAddress);
                
                // Assess risk factors
                var riskFactors = await AssessRiskFactorsAsync(emailOrUsername, ipAddress, userAgent);
                bool isSuspicious = await DetermineIfSuspiciousAsync(emailOrUsername, ipAddress, riskFactors);

                var failedAttempt = new FailedLoginAttempt
                {
                    EmailOrUsername = emailOrUsername,
                    IpAddress = ipAddress,
                    UserAgent = userAgent,
                    AttemptTime = DateTime.UtcNow,
                    FailureReason = failureReason,
                    Country = geolocation?.Country,
                    City = geolocation?.City,
                    CountryCode = geolocation?.CountryCode,
                    Latitude = geolocation?.Latitude,
                    Longitude = geolocation?.Longitude,
                    IsSuspicious = isSuspicious,
                    RiskFactors = string.Join(", ", riskFactors)
                };

                _context.FailedLoginAttempts.Add(failedAttempt);
                await _context.SaveChangesAsync();

                // Log security audit
                _logger.LogWarning($"Failed login attempt logged for {emailOrUsername} from {ipAddress}. Suspicious: {isSuspicious}");

                // Check if account should be locked
                if (await ShouldLockAccountAsync(emailOrUsername))
                {
                    await LockAccountAsync(emailOrUsername, "Exceeded maximum failed login attempts");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error logging failed login attempt for {emailOrUsername}");
                throw;
            }
        }

        public async Task<bool> IsAccountLockedAsync(string emailOrUsername)
        {
            try
            {
                var lockoutStatus = await GetAccountLockoutStatusAsync(emailOrUsername);
                return lockoutStatus.IsLocked;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error checking if account is locked for {emailOrUsername}");
                return false;
            }
        }

        public async Task<AccountLockoutStatusDTO> GetAccountLockoutStatusAsync(string emailOrUsername)
        {
            try
            {
                var cutoffTime = DateTime.UtcNow.AddMinutes(-TIME_WINDOW_MINUTES);
                
                var recentAttempts = await _context.FailedLoginAttempts
                    .Where(f => f.EmailOrUsername == emailOrUsername && f.AttemptTime >= cutoffTime)
                    .OrderByDescending(f => f.AttemptTime)
                    .ToListAsync();

                int failedAttempts = recentAttempts.Count();
                var lastAttempt = recentAttempts.FirstOrDefault()?.AttemptTime;
                
                bool isLocked = failedAttempts >= MAX_FAILED_ATTEMPTS;
                DateTime? lockoutUntil = null;
                
                if (isLocked && lastAttempt.HasValue)
                {
                    lockoutUntil = lastAttempt.Value.AddMinutes(LOCKOUT_DURATION_MINUTES);
                    // Check if lockout has expired
                    if (lockoutUntil <= DateTime.UtcNow)
                    {
                        isLocked = false;
                        lockoutUntil = null;
                    }
                }

                return new AccountLockoutStatusDTO
                {
                    EmailOrUsername = emailOrUsername,
                    IsLocked = isLocked,
                    LockoutUntil = lockoutUntil,
                    FailedAttempts = failedAttempts,
                    MaxAttempts = MAX_FAILED_ATTEMPTS,
                    LockoutDuration = TimeSpan.FromMinutes(LOCKOUT_DURATION_MINUTES),
                    LastAttempt = lastAttempt
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting account lockout status for {emailOrUsername}");
                throw;
            }
        }

        public async Task<FailedLoginSummaryDTO> GetFailedLoginSummaryAsync(DateTime? from = null, DateTime? to = null)
        {
            try
            {
                from ??= DateTime.UtcNow.AddDays(-1);
                to ??= DateTime.UtcNow;

                var attempts = await _context.FailedLoginAttempts
                    .Where(f => f.AttemptTime >= from && f.AttemptTime <= to)
                    .ToListAsync();

                var recentAttempts = attempts
                    .OrderByDescending(f => f.AttemptTime)
                    .Take(10)
                    .ToList();

                var topTargetedAccounts = attempts
                    .GroupBy(f => f.EmailOrUsername)
                    .OrderByDescending(g => g.Count())
                    .Take(5)
                    .Select(g => $"{g.Key} ({g.Count()} attempts)")
                    .ToList();

                var topAttackingIPs = attempts
                    .GroupBy(f => f.IpAddress)
                    .OrderByDescending(g => g.Count())
                    .Take(5)
                    .Select(g => $"{g.Key} ({g.Count()} attempts)")
                    .ToList();

                return new FailedLoginSummaryDTO
                {
                    TotalAttempts = attempts.Count(),
                    UniqueIPs = attempts.Select(f => f.IpAddress).Distinct().Count(),
                    SuspiciousAttempts = attempts.Count(f => f.IsSuspicious),
                    TopTargetedAccounts = topTargetedAccounts,
                    TopAttackingIPs = topAttackingIPs,
                    RecentAttempts = _mapper.Map<List<FailedLoginAttemptDTO>>(recentAttempts)
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting failed login summary");
                throw;
            }
        }

        public async Task<List<FailedLoginAttemptDTO>> GetFailedLoginAttemptsAsync(int page = 1, int pageSize = 50)
        {
            try
            {
                var attempts = await _context.FailedLoginAttempts
                    .OrderByDescending(f => f.AttemptTime)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                return _mapper.Map<List<FailedLoginAttemptDTO>>(attempts);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting failed login attempts");
                throw;
            }
        }

        public async Task UnlockAccountAsync(string emailOrUsername, string unlockedBy)
        {
            try
            {
                // Clear recent failed attempts to unlock the account
                var cutoffTime = DateTime.UtcNow.AddMinutes(-TIME_WINDOW_MINUTES);
                var recentAttempts = await _context.FailedLoginAttempts
                    .Where(f => f.EmailOrUsername == emailOrUsername && f.AttemptTime >= cutoffTime)
                    .ToListAsync();

                _context.FailedLoginAttempts.RemoveRange(recentAttempts);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Account {emailOrUsername} unlocked by {unlockedBy}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error unlocking account {emailOrUsername}");
                throw;
            }
        }

        public async Task<bool> ShouldLockAccountAsync(string emailOrUsername)
        {
            try
            {
                var cutoffTime = DateTime.UtcNow.AddMinutes(-TIME_WINDOW_MINUTES);
                
                int recentFailedAttempts = await _context.FailedLoginAttempts
                    .Where(f => f.EmailOrUsername == emailOrUsername && f.AttemptTime >= cutoffTime)
                    .CountAsync();

                return recentFailedAttempts >= MAX_FAILED_ATTEMPTS;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error checking if account should be locked for {emailOrUsername}");
                return false;
            }
        }

        public Task LockAccountAsync(string emailOrUsername, string reason)
        {
            try
            {
                _logger.LogWarning($"Account {emailOrUsername} locked. Reason: {reason}");
                return Task.CompletedTask;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error locking account {emailOrUsername}");
                throw;
            }
        }

        public async Task<List<string>> GetSuspiciousIPsAsync(int limit = 10)
        {
            try
            {
                var cutoffTime = DateTime.UtcNow.AddHours(-24);
                
                var suspiciousIPs = await _context.FailedLoginAttempts
                    .Where(f => f.AttemptTime >= cutoffTime)
                    .GroupBy(f => f.IpAddress)
                    .Where(g => g.Count() >= SUSPICIOUS_THRESHOLD || g.Any(f => f.IsSuspicious))
                    .OrderByDescending(g => g.Count())
                    .Take(limit)
                    .Select(g => g.Key)
                    .ToListAsync();

                return suspiciousIPs;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting suspicious IPs");
                return new List<string>();
            }
        }

        public async Task<bool> IsIPSuspiciousAsync(string ipAddress)
        {
            try
            {
                var cutoffTime = DateTime.UtcNow.AddHours(-24);
                
                int recentAttempts = await _context.FailedLoginAttempts
                    .Where(f => f.IpAddress == ipAddress && f.AttemptTime >= cutoffTime)
                    .CountAsync();

                bool hasSuspiciousAttempts = await _context.FailedLoginAttempts
                    .Where(f => f.IpAddress == ipAddress && f.AttemptTime >= cutoffTime)
                    .AnyAsync(f => f.IsSuspicious);

                return recentAttempts >= SUSPICIOUS_THRESHOLD || hasSuspiciousAttempts;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error checking if IP is suspicious: {ipAddress}");
                return false;
            }
        }

        public Task BlockIPAsync(string ipAddress, string reason, string blockedBy)
        {
            try
            {
                _logger.LogWarning($"IP {ipAddress} blocked by {blockedBy}. Reason: {reason}");
                return Task.CompletedTask;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error blocking IP {ipAddress}");
                throw;
            }
        }

        public Task UnblockIPAsync(string ipAddress, string unblockedBy)
        {
            try
            {
                _logger.LogInformation($"IP {ipAddress} unblocked by {unblockedBy}");
                return Task.CompletedTask;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error unblocking IP {ipAddress}");
                throw;
            }
        }

        private async Task<List<string>> AssessRiskFactorsAsync(string emailOrUsername, string ipAddress, string? userAgent)
        {
            var riskFactors = new List<string>();

            try
            {
                // Check for rapid successive attempts
                var lastMinute = DateTime.UtcNow.AddMinutes(-1);
                int recentAttempts = await _context.FailedLoginAttempts
                    .Where(f => f.EmailOrUsername == emailOrUsername && f.AttemptTime >= lastMinute)
                    .CountAsync();

                if (recentAttempts >= 3)
                    riskFactors.Add("Rapid successive attempts");

                // Check for multiple accounts from same IP
                var lastHour = DateTime.UtcNow.AddHours(-1);
                int uniqueAccounts = await _context.FailedLoginAttempts
                    .Where(f => f.IpAddress == ipAddress && f.AttemptTime >= lastHour)
                    .Select(f => f.EmailOrUsername)
                    .Distinct()
                    .CountAsync();

                if (uniqueAccounts >= 5)
                    riskFactors.Add("Multiple accounts targeted from same IP");

                // Check for suspicious geolocation
                bool isSuspiciousLocation = await _geolocationService.IsLocationSuspiciousAsync(ipAddress);
                if (isSuspiciousLocation)
                    riskFactors.Add("Suspicious geolocation");

                // Check for VPN/Proxy
                bool isVPNOrProxy = await _geolocationService.IsVPNOrProxyAsync(ipAddress);
                if (isVPNOrProxy)
                    riskFactors.Add("VPN or Proxy detected");

                // Check for unusual user agent
                if (string.IsNullOrEmpty(userAgent) || userAgent.Length < 10)
                    riskFactors.Add("Unusual or missing user agent");

                return riskFactors;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error assessing risk factors");
                return riskFactors;
            }
        }

        private async Task<bool> DetermineIfSuspiciousAsync(string emailOrUsername, string ipAddress, List<string> riskFactors)
        {
            try
            {
                // Consider suspicious if multiple risk factors or high-risk single factor
                if (riskFactors.Count >= 2)
                    return true;

                if (riskFactors.Any(rf => rf.Contains("Multiple accounts") || rf.Contains("VPN") || rf.Contains("Proxy")))
                    return true;

                // Check historical patterns
                var last24Hours = DateTime.UtcNow.AddHours(-24);
                int totalAttemptsFromIP = await _context.FailedLoginAttempts
                    .Where(f => f.IpAddress == ipAddress && f.AttemptTime >= last24Hours)
                    .CountAsync();

                return totalAttemptsFromIP >= SUSPICIOUS_THRESHOLD;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error determining if attempt is suspicious");
                return false;
            }
        }
    }
} 