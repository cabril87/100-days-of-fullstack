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
using TaskTrackerAPI.Repositories.Interfaces;
using System.Threading.Tasks;
using System;
using System.Linq;
using System.Collections.Generic;

namespace TaskTrackerAPI.Services
{
    public class FailedLoginService : IFailedLoginService
    {
        private readonly IFailedLoginRepository _failedLoginRepository;
        private readonly ILogger<FailedLoginService> _logger;
        private readonly IMapper _mapper;
        private readonly IGeolocationService _geolocationService;

        // Configuration constants
        private const int MAX_FAILED_ATTEMPTS = 5;
        private const int LOCKOUT_DURATION_MINUTES = 30;
        private const int SUSPICIOUS_THRESHOLD = 10;
        private const int TIME_WINDOW_MINUTES = 15;

        public FailedLoginService(
            IFailedLoginRepository failedLoginRepository,
            ILogger<FailedLoginService> logger,
            IMapper mapper,
            IGeolocationService geolocationService)
        {
            _failedLoginRepository = failedLoginRepository;
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

                await _failedLoginRepository.CreateFailedLoginAttemptAsync(failedAttempt);

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
                var recentAttempts = await _failedLoginRepository.GetRecentFailedAttemptsAsync(emailOrUsername, TIME_WINDOW_MINUTES);

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

                var attempts = await _failedLoginRepository.GetFailedAttemptsInRangeAsync(from.Value, to.Value);

                var recentAttempts = attempts
                    .OrderByDescending(f => f.AttemptTime)
                    .Take(10)
                    .ToList();

                var topTargetedAccounts = await _failedLoginRepository.GetTopTargetedAccountsAsync(24, 5);
                var topAttackingIPs = await _failedLoginRepository.GetTopAttackingIPsAsync(24, 5);

                return new FailedLoginSummaryDTO
                {
                    TotalAttempts = attempts.Count(),
                    UniqueIPs = attempts.Select(f => f.IpAddress).Distinct().Count(),
                    SuspiciousAttempts = attempts.Count(f => f.IsSuspicious),
                    TopTargetedAccounts = topTargetedAccounts.Select(t => $"{t.EmailOrUsername} ({t.AttemptCount} attempts)").ToList(),
                    TopAttackingIPs = topAttackingIPs.Select(t => $"{t.IpAddress} ({t.AttemptCount} attempts)").ToList(),
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
                var attempts = await _failedLoginRepository.GetFailedAttemptsPagedAsync(page, pageSize);
                return _mapper.Map<List<FailedLoginAttemptDTO>>(attempts.ToList());
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
                await _failedLoginRepository.RemoveRecentAttemptsAsync(emailOrUsername, TIME_WINDOW_MINUTES);
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
                int recentFailedAttempts = await _failedLoginRepository.GetFailedAttemptCountAsync(emailOrUsername, TIME_WINDOW_MINUTES);
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
                var suspiciousIPs = await _failedLoginRepository.GetUniqueIPAddressesAsync(24);
                var result = new List<string>();

                foreach (var ip in suspiciousIPs)
                {
                    if (await _failedLoginRepository.IsIPSuspiciousAsync(ip, 24, SUSPICIOUS_THRESHOLD))
                    {
                        result.Add(ip);
                        if (result.Count >= limit)
                            break;
                    }
                }

                return result;
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
                return await _failedLoginRepository.IsIPSuspiciousAsync(ipAddress, 24, SUSPICIOUS_THRESHOLD);
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
                int recentAttempts = await _failedLoginRepository.GetRapidAttemptsCountAsync(emailOrUsername, 1, 3);
                if (recentAttempts >= 3)
                    riskFactors.Add("Rapid successive attempts");

                // Check for multiple accounts from same IP
                var uniqueAccounts = await _failedLoginRepository.GetAccountsTargetedByIPAsync(ipAddress, 1);
                if (uniqueAccounts.Count() >= 5)
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

                // Check historical patterns using repository
                bool isIPSuspicious = await _failedLoginRepository.IsIPSuspiciousAsync(ipAddress, 24, SUSPICIOUS_THRESHOLD);
                return isIPSuspicious;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error determining if suspicious");
                return false;
            }
        }
    }
} 