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
    /// Repository implementation for user subscription and quota management
    /// </summary>
    public class UserSubscriptionRepository : IUserSubscriptionRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<UserSubscriptionRepository> _logger;

        public UserSubscriptionRepository(ApplicationDbContext context, ILogger<UserSubscriptionRepository> logger)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<SubscriptionTier?> GetSubscriptionTierByIdAsync(int tierId)
        {
            try
            {
                return await _context.SubscriptionTiers
                    .FirstOrDefaultAsync(st => st.Id == tierId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving subscription tier by ID {TierId}", tierId);
                return null;
            }
        }

        public async Task<SubscriptionTier?> GetSubscriptionTierByNameAsync(string tierName, bool isSystemTier = false)
        {
            try
            {
                return await _context.SubscriptionTiers
                    .FirstOrDefaultAsync(st => st.Name == tierName && st.IsSystemTier == isSystemTier);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving subscription tier by name {TierName}", tierName);
                return null;
            }
        }

        public async Task<IEnumerable<SubscriptionTier>> GetAllSubscriptionTiersAsync()
        {
            try
            {
                return await _context.SubscriptionTiers
                    .OrderBy(st => st.Priority)
                    .ThenBy(st => st.Name)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all subscription tiers");
                return Enumerable.Empty<SubscriptionTier>();
            }
        }

        public async Task<SubscriptionTier?> GetDefaultFreeTierAsync()
        {
            try
            {
                return await _context.SubscriptionTiers
                    .FirstOrDefaultAsync(st => st.Name == "Free" && !st.IsSystemTier);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving default free tier");
                return null;
            }
        }

        public async Task<SubscriptionTier?> GetSystemTierAsync()
        {
            try
            {
                return await _context.SubscriptionTiers
                    .FirstOrDefaultAsync(st => st.Name == "System" && st.IsSystemTier);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving system tier");
                return null;
            }
        }

        public async Task<UserApiQuota?> GetUserApiQuotaAsync(int userId)
        {
            try
            {
                return await _context.UserApiQuotas
                    .Include(uaq => uaq.SubscriptionTier)
                    .FirstOrDefaultAsync(uaq => uaq.UserId == userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user API quota for user {UserId}", userId);
                return null;
            }
        }

        public async Task<UserApiQuota> CreateOrUpdateUserApiQuotaAsync(UserApiQuota userApiQuota)
        {
            try
            {
                UserApiQuota? existingQuota = await _context.UserApiQuotas
                    .FirstOrDefaultAsync(uaq => uaq.UserId == userApiQuota.UserId);

                if (existingQuota != null)
                {
                    // Update existing quota
                    existingQuota.SubscriptionTierId = userApiQuota.SubscriptionTierId;
                    existingQuota.MaxDailyApiCalls = userApiQuota.MaxDailyApiCalls;
                    existingQuota.ApiCallsUsedToday = userApiQuota.ApiCallsUsedToday;
                    existingQuota.LastResetTime = userApiQuota.LastResetTime;
                    existingQuota.LastUpdatedTime = DateTime.UtcNow;
                    
                    await _context.SaveChangesAsync();
                    return existingQuota;
                }
                else
                {
                    // Create new quota
                    userApiQuota.LastUpdatedTime = DateTime.UtcNow;
                    
                    _context.UserApiQuotas.Add(userApiQuota);
                    await _context.SaveChangesAsync();
                    return userApiQuota;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating or updating user API quota for user {UserId}", userApiQuota.UserId);
                throw;
            }
        }

        public async Task<bool> IncrementUserApiUsageAsync(int userId, int incrementBy = 1)
        {
            try
            {
                UserApiQuota? userQuota = await _context.UserApiQuotas
                    .FirstOrDefaultAsync(uaq => uaq.UserId == userId);

                if (userQuota == null)
                {
                    _logger.LogWarning("User API quota not found for user {UserId}", userId);
                    return false;
                }

                userQuota.ApiCallsUsedToday += incrementBy;
                userQuota.LastUpdatedTime = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error incrementing user API usage for user {UserId}", userId);
                return false;
            }
        }

        public async Task<bool> ResetUserDailyUsageAsync(int userId)
        {
            try
            {
                UserApiQuota? userQuota = await _context.UserApiQuotas
                    .FirstOrDefaultAsync(uaq => uaq.UserId == userId);

                if (userQuota == null)
                {
                    _logger.LogWarning("User API quota not found for user {UserId}", userId);
                    return false;
                }

                userQuota.ApiCallsUsedToday = 0;
                userQuota.LastResetTime = DateTime.UtcNow;
                userQuota.LastUpdatedTime = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error resetting user daily usage for user {UserId}", userId);
                return false;
            }
        }

        public async Task<(int UsageCount, DateTime LastReset, DateTime LastCall)> GetUserUsageStatisticsAsync(int userId)
        {
            try
            {
                UserApiQuota? userQuota = await _context.UserApiQuotas
                    .FirstOrDefaultAsync(uaq => uaq.UserId == userId);

                if (userQuota == null)
                {
                    return (0, DateTime.MinValue, DateTime.MinValue);
                }

                return (userQuota.ApiCallsUsedToday, userQuota.LastResetTime, userQuota.LastUpdatedTime);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user usage statistics for user {UserId}", userId);
                return (0, DateTime.MinValue, DateTime.MinValue);
            }
        }

        public async Task<IEnumerable<RateLimitTierConfig>> GetRateLimitConfigsForTierAsync(int tierId)
        {
            try
            {
                return await _context.RateLimitTierConfigs
                    .Where(rltc => rltc.SubscriptionTierId == tierId)
                    .OrderByDescending(rltc => rltc.MatchPriority)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving rate limit configs for tier {TierId}", tierId);
                return Enumerable.Empty<RateLimitTierConfig>();
            }
        }

        public async Task<RateLimitTierConfig?> GetRateLimitConfigAsync(int tierId, string endpointPattern)
        {
            try
            {
                return await _context.RateLimitTierConfigs
                    .FirstOrDefaultAsync(rltc => rltc.SubscriptionTierId == tierId && rltc.EndpointPattern == endpointPattern);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving rate limit config for tier {TierId} and endpoint {EndpointPattern}", tierId, endpointPattern);
                return null;
            }
        }

        public async Task<RateLimitTierConfig> CreateOrUpdateRateLimitConfigAsync(RateLimitTierConfig rateLimitConfig)
        {
            try
            {
                RateLimitTierConfig? existingConfig = await _context.RateLimitTierConfigs
                    .FirstOrDefaultAsync(rltc => rltc.SubscriptionTierId == rateLimitConfig.SubscriptionTierId && 
                                                rltc.EndpointPattern == rateLimitConfig.EndpointPattern);

                if (existingConfig != null)
                {
                    // Update existing config
                    existingConfig.RateLimit = rateLimitConfig.RateLimit;
                    existingConfig.TimeWindowSeconds = rateLimitConfig.TimeWindowSeconds;
                    existingConfig.MatchPriority = rateLimitConfig.MatchPriority;
                    existingConfig.UpdatedAt = DateTime.UtcNow;
                    
                    await _context.SaveChangesAsync();
                    return existingConfig;
                }
                else
                {
                    // Create new config
                    rateLimitConfig.CreatedAt = DateTime.UtcNow;
                    rateLimitConfig.UpdatedAt = DateTime.UtcNow;
                    
                    _context.RateLimitTierConfigs.Add(rateLimitConfig);
                    await _context.SaveChangesAsync();
                    return rateLimitConfig;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating or updating rate limit config for tier {TierId}", rateLimitConfig.SubscriptionTierId);
                throw;
            }
        }

        public async Task<IEnumerable<RateLimitTierConfig>> GetAllRateLimitConfigsAsync()
        {
            try
            {
                return await _context.RateLimitTierConfigs
                    .OrderBy(rltc => rltc.SubscriptionTierId)
                    .ThenByDescending(rltc => rltc.MatchPriority)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all rate limit configs");
                return Enumerable.Empty<RateLimitTierConfig>();
            }
        }

        public async Task<bool> UpdateUserSubscriptionTierAsync(int userId, int newTierId)
        {
            try
            {
                UserApiQuota? userQuota = await _context.UserApiQuotas
                    .FirstOrDefaultAsync(uaq => uaq.UserId == userId);

                if (userQuota == null)
                {
                    // Create new quota if it doesn't exist
                    SubscriptionTier? tier = await GetSubscriptionTierByIdAsync(newTierId);
                    if (tier == null)
                    {
                        _logger.LogWarning("Subscription tier {TierId} not found", newTierId);
                        return false;
                    }

                    UserApiQuota newQuota = new UserApiQuota
                    {
                        UserId = userId,
                        SubscriptionTierId = newTierId,
                        MaxDailyApiCalls = tier.DailyApiQuota,
                        ApiCallsUsedToday = 0,
                        LastResetTime = DateTime.UtcNow,
                        LastUpdatedTime = DateTime.UtcNow
                    };

                    _context.UserApiQuotas.Add(newQuota);
                }
                else
                {
                    userQuota.SubscriptionTierId = newTierId;
                    userQuota.LastUpdatedTime = DateTime.UtcNow;
                    
                    // Update daily quota based on new tier
                    SubscriptionTier? newTier = await GetSubscriptionTierByIdAsync(newTierId);
                    if (newTier != null)
                    {
                        userQuota.MaxDailyApiCalls = newTier.DailyApiQuota;
                    }
                }

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating subscription tier for user {UserId} to tier {TierId}", userId, newTierId);
                return false;
            }
        }

        public async Task<IEnumerable<UserApiQuota>> GetUsersBySubscriptionTierAsync(int tierId, int limit = 100)
        {
            try
            {
                return await _context.UserApiQuotas
                    .Include(uaq => uaq.SubscriptionTier)
                    .Where(uaq => uaq.SubscriptionTierId == tierId)
                    .OrderByDescending(uaq => uaq.LastUpdatedTime)
                    .Take(limit)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving users by subscription tier {TierId}", tierId);
                return Enumerable.Empty<UserApiQuota>();
            }
        }

        public async Task<bool> IsUserTrustedSystemAccountAsync(int userId)
        {
            try
            {
                UserApiQuota? userQuota = await _context.UserApiQuotas
                    .Include(uaq => uaq.SubscriptionTier)
                    .FirstOrDefaultAsync(uaq => uaq.UserId == userId);

                return userQuota?.SubscriptionTier?.IsSystemTier == true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking if user {UserId} is trusted system account", userId);
                return false;
            }
        }

        public async Task<IEnumerable<(int UserId, string Username, int ApiCalls, string TierName)>> GetUsageStatisticsAsync(DateTime from, DateTime to, int limit = 100)
        {
            try
            {
                var statistics = await _context.UserApiQuotas
                    .Include(uaq => uaq.SubscriptionTier)
                    .Include(uaq => uaq.User)
                    .Where(uaq => uaq.LastUpdatedTime >= from && uaq.LastUpdatedTime <= to)
                    .OrderByDescending(uaq => uaq.ApiCallsUsedToday)
                    .Take(limit)
                    .Select(uaq => new { uaq.UserId, uaq.User!.Username, uaq.ApiCallsUsedToday, uaq.SubscriptionTier!.Name })
                    .ToListAsync();

                return statistics.Select(x => (x.UserId, x.Username, x.ApiCallsUsedToday, x.Name));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving usage statistics between {From} and {To}", from, to);
                return Enumerable.Empty<(int, string, int, string)>();
            }
        }

        public async Task<IEnumerable<(string TierName, int UserCount, long TotalApiCalls)>> GetSubscriptionTierStatisticsAsync(DateTime from, DateTime to)
        {
            try
            {
                var statistics = await _context.UserApiQuotas
                    .Include(uaq => uaq.SubscriptionTier)
                    .Where(uaq => uaq.LastUpdatedTime >= from && uaq.LastUpdatedTime <= to)
                    .GroupBy(uaq => uaq.SubscriptionTier!.Name)
                    .Select(g => new 
                    { 
                        TierName = g.Key,
                        UserCount = g.Count(),
                        TotalApiCalls = g.Sum(uaq => (long)uaq.ApiCallsUsedToday)
                    })
                    .OrderByDescending(x => x.TotalApiCalls)
                    .ToListAsync();

                return statistics.Select(x => (x.TierName, x.UserCount, x.TotalApiCalls));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving subscription tier statistics between {From} and {To}", from, to);
                return Enumerable.Empty<(string, int, long)>();
            }
        }

        public async Task<int> CleanupOldUsageDataAsync(int daysToRetain = 90)
        {
            DateTime cutoffDate = DateTime.UtcNow.AddDays(-daysToRetain);
            
            // This would remove old usage tracking data if we had such tables
            // For now, return 0 as no cleanup is needed for the current UserApiQuota model
            return await Task.FromResult(0);
        }
        
        /// <summary>
        /// Cleans up old API quota tracking records
        /// </summary>
        /// <param name="daysOld">Number of days old to be considered for cleanup</param>
        /// <returns>Number of records cleaned up</returns>
        public async Task<int> CleanupOldQuotaRecordsAsync(int daysOld = 30)
        {
            DateTime cutoffDate = DateTime.UtcNow.AddDays(-daysOld);
            
            List<UserApiQuota> oldQuotas = await _context.UserApiQuotas
                .Where(q => q.LastUpdatedTime < cutoffDate && q.ApiCallsUsedToday == 0)
                .ToListAsync();
                
            if (oldQuotas.Any())
            {
                _context.UserApiQuotas.RemoveRange(oldQuotas);
                await _context.SaveChangesAsync();
            }
            
            return oldQuotas.Count;
        }
        
        /// <summary>
        /// Gets user API quotas with related data for monitoring
        /// </summary>
        /// <param name="limit">Maximum number of quotas to return</param>
        /// <returns>List of user API quotas with related data</returns>
        public async Task<List<UserApiQuota>> GetUserApiQuotasAsync(int limit = 10)
        {
            return await _context.UserApiQuotas
                .Include(q => q.User)
                .Include(q => q.SubscriptionTier)
                .OrderByDescending(q => q.ApiCallsUsedToday)
                .Take(limit)
                .ToListAsync();
        }
    }
} 