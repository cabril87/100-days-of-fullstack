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
    /// Repository interface for user subscription and quota management
    /// </summary>
    public interface IUserSubscriptionRepository
    {
        // Subscription tier management
        
        /// <summary>
        /// Gets a subscription tier by ID
        /// </summary>
        Task<SubscriptionTier?> GetSubscriptionTierByIdAsync(int tierId);
        
        /// <summary>
        /// Gets a subscription tier by name
        /// </summary>
        Task<SubscriptionTier?> GetSubscriptionTierByNameAsync(string tierName, bool isSystemTier = false);
        
        /// <summary>
        /// Gets all available subscription tiers
        /// </summary>
        Task<IEnumerable<SubscriptionTier>> GetAllSubscriptionTiersAsync();
        
        /// <summary>
        /// Gets the default free subscription tier
        /// </summary>
        Task<SubscriptionTier?> GetDefaultFreeTierAsync();
        
        /// <summary>
        /// Gets the system tier for trusted accounts
        /// </summary>
        Task<SubscriptionTier?> GetSystemTierAsync();
        
        // User quota management
        
        /// <summary>
        /// Gets user's API quota information including subscription tier
        /// </summary>
        Task<UserApiQuota?> GetUserApiQuotaAsync(int userId);
        
        /// <summary>
        /// Creates or updates user's API quota
        /// </summary>
        Task<UserApiQuota> CreateOrUpdateUserApiQuotaAsync(UserApiQuota userApiQuota);
        
        /// <summary>
        /// Increments user's API usage count
        /// </summary>
        Task<bool> IncrementUserApiUsageAsync(int userId, int incrementBy = 1);
        
        /// <summary>
        /// Resets user's daily API usage
        /// </summary>
        Task<bool> ResetUserDailyUsageAsync(int userId);
        
        /// <summary>
        /// Gets user's current usage statistics
        /// </summary>
        Task<(int UsageCount, DateTime LastReset, DateTime LastCall)> GetUserUsageStatisticsAsync(int userId);
        
        // Rate limit configuration management
        
        /// <summary>
        /// Gets rate limit configurations for a subscription tier
        /// </summary>
        Task<IEnumerable<RateLimitTierConfig>> GetRateLimitConfigsForTierAsync(int tierId);
        
        /// <summary>
        /// Gets a specific rate limit configuration by endpoint pattern and tier
        /// </summary>
        Task<RateLimitTierConfig?> GetRateLimitConfigAsync(int tierId, string endpointPattern);
        
        /// <summary>
        /// Creates or updates a rate limit configuration
        /// </summary>
        Task<RateLimitTierConfig> CreateOrUpdateRateLimitConfigAsync(RateLimitTierConfig rateLimitConfig);
        
        /// <summary>
        /// Gets all rate limit configurations ordered by priority
        /// </summary>
        Task<IEnumerable<RateLimitTierConfig>> GetAllRateLimitConfigsAsync();
        
        // User subscription management
        
        /// <summary>
        /// Updates user's subscription tier
        /// </summary>
        Task<bool> UpdateUserSubscriptionTierAsync(int userId, int newTierId);
        
        /// <summary>
        /// Gets users by subscription tier
        /// </summary>
        Task<IEnumerable<UserApiQuota>> GetUsersBySubscriptionTierAsync(int tierId, int limit = 100);
        
        /// <summary>
        /// Checks if a user is a trusted system account
        /// </summary>
        Task<bool> IsUserTrustedSystemAccountAsync(int userId);
        
        /// <summary>
        /// Gets usage statistics for all users in a time period
        /// </summary>
        Task<IEnumerable<(int UserId, string Username, int ApiCalls, string TierName)>> GetUsageStatisticsAsync(DateTime from, DateTime to, int limit = 100);
        
        /// <summary>
        /// Gets subscription tier statistics
        /// </summary>
        Task<IEnumerable<(string TierName, int UserCount, long TotalApiCalls)>> GetSubscriptionTierStatisticsAsync(DateTime from, DateTime to);
        
        /// <summary>
        /// Cleans up old usage data beyond retention period
        /// </summary>
        Task<int> CleanupOldUsageDataAsync(int daysToRetain = 90);
        
        /// <summary>
        /// Cleans up old API quota tracking records
        /// </summary>
        /// <param name="daysOld">Number of days old to be considered for cleanup</param>
        /// <returns>Number of records cleaned up</returns>
        Task<int> CleanupOldQuotaRecordsAsync(int daysOld = 30);
        
        /// <summary>
        /// Gets user API quotas with related data for monitoring
        /// </summary>
        /// <param name="limit">Maximum number of quotas to return</param>
        /// <returns>List of user API quotas with related data</returns>
        Task<List<UserApiQuota>> GetUserApiQuotasAsync(int limit = 10);
    }
} 