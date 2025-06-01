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
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories.Interfaces;
using TaskTrackerAPI.Services.Interfaces;

namespace TaskTrackerAPI.Services;

/// <summary>
/// Service that manages user subscription tiers and associated rate limits
/// </summary>
public class UserSubscriptionService : IUserSubscriptionService
{
    private readonly IUserSubscriptionRepository _userSubscriptionRepository;
    private readonly IMemoryCache _cache;
    private readonly ILogger<UserSubscriptionService> _logger;
    private readonly IConfiguration _configuration;
    
    // Cache keys
    private const string UserTierCacheKey = "UserTier_{0}"; // {0} = userId
    private const string RateLimitConfigCacheKey = "RateLimitConfig_{0}_{1}"; // {0} = tierId, {1} = endpoint
    
    // Cache durations
    private readonly TimeSpan _tierCacheDuration = TimeSpan.FromMinutes(15);
    private readonly TimeSpan _configCacheDuration = TimeSpan.FromMinutes(30);
    
    // Default free tier ID if no subscription is found
    private readonly int _defaultFreeTierId;
    
    // Default system tier ID for trusted system accounts
    private readonly int _systemTierId;
    
    // Trusted account IDs that bypass rate limits for essential operations
    private readonly HashSet<int> _trustedSystemAccountIds = new();

    public UserSubscriptionService(
        IUserSubscriptionRepository userSubscriptionRepository,
        IMemoryCache cache,
        ILogger<UserSubscriptionService> logger,
        IConfiguration configuration)
    {
        _userSubscriptionRepository = userSubscriptionRepository ?? throw new ArgumentNullException(nameof(userSubscriptionRepository));
        _cache = cache ?? throw new ArgumentNullException(nameof(cache));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
        
        // Load the default tier IDs, but these will be looked up by name if not found
        _defaultFreeTierId = _configuration.GetValue<int>("Subscriptions:DefaultFreeTierId", 0);
        _systemTierId = _configuration.GetValue<int>("Subscriptions:SystemTierId", 0);
        
        // Load trusted account IDs from configuration
        int[] trustedAccounts = _configuration.GetSection("Subscriptions:TrustedSystemAccounts")
                                            .Get<int[]>() ?? Array.Empty<int>();
        _trustedSystemAccountIds = new HashSet<int>(trustedAccounts);
    }

    /// <inheritdoc />
    public async Task<SubscriptionTier> GetUserSubscriptionTierAsync(int userId)
    {
        string cacheKey = string.Format(UserTierCacheKey, userId);
        
        // Try to get from cache first
        if (_cache.TryGetValue(cacheKey, out SubscriptionTier? cachedTier) && cachedTier != null)
        {
            return cachedTier;
        }
        
        // Check if user is a trusted system account
        if (await IsTrustedSystemAccountAsync(userId))
        {
            // Get the system tier for trusted accounts
            SubscriptionTier? systemTier = null;
            
            if (_systemTierId > 0)
            {
                systemTier = await _userSubscriptionRepository.GetSubscriptionTierByIdAsync(_systemTierId);
            }
            
            // If we don't have a valid system tier ID or couldn't find it, look it up by name
            if (systemTier == null)
            {
                systemTier = await _userSubscriptionRepository.GetSystemTierAsync();
            }
                
            if (systemTier != null)
            {
                _cache.Set(cacheKey, systemTier, _tierCacheDuration);
                return systemTier;
            }
        }
        
        // Get user's subscription tier from repository
        UserApiQuota? userQuota = await _userSubscriptionRepository.GetUserApiQuotaAsync(userId);
        
        if (userQuota?.SubscriptionTier != null)
        {
            _cache.Set(cacheKey, userQuota.SubscriptionTier, _tierCacheDuration);
            return userQuota.SubscriptionTier;
        }
        
        // If no subscription tier found, get the default free tier
        SubscriptionTier? freeTier = null;
        
        if (_defaultFreeTierId > 0)
        {
            freeTier = await _userSubscriptionRepository.GetSubscriptionTierByIdAsync(_defaultFreeTierId);
        }
        
        // If we don't have a valid free tier ID or couldn't find it, look it up by name
        if (freeTier == null)
        {
            freeTier = await _userSubscriptionRepository.GetDefaultFreeTierAsync();
        }
            
        if (freeTier == null)
        {
            _logger.LogError("Default free tier not found");
            throw new InvalidOperationException("Default subscription tier not configured correctly");
        }
        
        _cache.Set(cacheKey, freeTier, _tierCacheDuration);
        return freeTier;
    }

    /// <inheritdoc />
    public async Task<(int Limit, int TimeWindowSeconds)> GetRateLimitForUserAndEndpointAsync(int userId, string endpoint)
    {
        try
        {
            SubscriptionTier tier = await GetUserSubscriptionTierAsync(userId);
            
            // Cache key includes tier ID and endpoint for specific configuration
            string cacheKey = string.Format(RateLimitConfigCacheKey, tier.Id, endpoint);
            
            // Try to get from cache first
            if (_cache.TryGetValue(cacheKey, out (int limit, int timeWindow) cachedLimit))
            {
                return cachedLimit;
            }
            
            // Get all configs for this tier ordered by priority
            IEnumerable<RateLimitTierConfig> tierConfigs = await _userSubscriptionRepository.GetRateLimitConfigsForTierAsync(tier.Id);
            List<RateLimitTierConfig> tierConfigsList = tierConfigs.ToList();
            
            // Find the most specific matching configuration
            RateLimitTierConfig? matchingConfig = null;
            
            foreach (RateLimitTierConfig config in tierConfigsList)
            {
                // Check if the endpoint pattern matches
                if (IsEndpointMatch(endpoint, config.EndpointPattern))
                {
                    matchingConfig = config;
                    break; // We have them ordered by priority, so first match is best
                }
            }
            
            // Use specific config if found, otherwise use tier defaults
            int limit = matchingConfig?.RateLimit ?? tier.DefaultRateLimit;
            int timeWindow = matchingConfig?.TimeWindowSeconds ?? tier.DefaultTimeWindowSeconds;
            
            // Cache the result
            (int, int) result = (limit, timeWindow);
            _cache.Set(cacheKey, result, _configCacheDuration);
            
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting rate limit for user {UserId} and endpoint {Endpoint}", userId, endpoint);
            
            // Return a conservative default in case of error
            return (100, 3600); // 100 requests per hour
        }
    }

    /// <inheritdoc />
    public async Task<bool> HasUserExceededDailyQuotaAsync(int userId)
    {
        try
        {
            // System accounts are exempt from quotas
            if (await IsTrustedSystemAccountAsync(userId))
            {
                return false;
            }
            
            UserApiQuota? quota = await _userSubscriptionRepository.GetUserApiQuotaAsync(userId);
            
            if (quota == null)
            {
                // Create quota for new user
                UserApiQuota newQuota = await GetOrCreateUserQuotaAsync(userId);
                quota = newQuota;
            }
            
            // Reset if it's a new day
            if (quota.LastResetTime.Date < DateTime.UtcNow.Date)
            {
                await _userSubscriptionRepository.ResetUserDailyUsageAsync(userId);
                return false;
            }
            
            return quota.ApiCallsUsedToday >= quota.MaxDailyApiCalls;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking daily quota for user {UserId}", userId);
            return false; // Allow access on error to avoid blocking legitimate requests
        }
    }

    /// <inheritdoc />
    public async Task IncrementUserApiUsageAsync(int userId, int count = 1)
    {
        try
        {
            // System accounts don't track usage
            if (await IsTrustedSystemAccountAsync(userId))
            {
                return;
            }
            
            // Use repository method to increment usage
            bool success = await _userSubscriptionRepository.IncrementUserApiUsageAsync(userId, count);
            
            if (!success)
            {
                // User quota doesn't exist, create it first
                await GetOrCreateUserQuotaAsync(userId);
                await _userSubscriptionRepository.IncrementUserApiUsageAsync(userId, count);
            }
            
            // Check for quota warning (this logic might need to be moved to repository)
            UserApiQuota? quota = await _userSubscriptionRepository.GetUserApiQuotaAsync(userId);
            if (quota != null && quota.ApiCallsUsedToday >= (quota.MaxDailyApiCalls * 0.8)) // 80% threshold
            {
                // TODO: Trigger quota warning notification
                _logger.LogInformation("User {UserId} has used {UsedCalls}/{MaxCalls} API calls ({Percent}%)", 
                    userId, quota.ApiCallsUsedToday, quota.MaxDailyApiCalls, 
                    (quota.ApiCallsUsedToday * 100 / quota.MaxDailyApiCalls));
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error incrementing API usage for user {UserId}", userId);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<(int RemainingCalls, DateTime ResetTime)> GetRemainingQuotaAsync(int userId)
    {
        // System accounts have unlimited quota
        if (await IsTrustedSystemAccountAsync(userId))
        {
            return (int.MaxValue, DateTime.MaxValue);
        }
        
        // Get the user's quota record
        UserApiQuota quota = await GetOrCreateUserQuotaAsync(userId);
        
        // Reset if it's a new day
        if (quota.LastResetTime.Date < DateTime.UtcNow.Date)
        {
            quota.ApiCallsUsedToday = 0;
            quota.LastResetTime = DateTime.UtcNow.Date;
        }
        
        // Calculate remaining calls
        int remaining = Math.Max(0, quota.MaxDailyApiCalls - quota.ApiCallsUsedToday);
        
        // Calculate when the quota will reset (next day at 00:00 UTC)
        DateTime resetTime = quota.LastResetTime.Date.AddDays(1);
        
        return (remaining, resetTime);
    }

    /// <inheritdoc />
    public async Task<bool> IsTrustedSystemAccountAsync(int userId)
    {
        // Check from pre-loaded trusted accounts list
        if (_trustedSystemAccountIds.Contains(userId))
        {
            return true;
        }
        
        // If not in the pre-loaded list, check from repository
        return await _userSubscriptionRepository.IsUserTrustedSystemAccountAsync(userId);
    }
    
    /// <summary>
    /// Gets or creates a user API quota record
    /// </summary>
    private async Task<UserApiQuota> GetOrCreateUserQuotaAsync(int userId)
    {
        // Find existing quota
        UserApiQuota? quota = await _userSubscriptionRepository.GetUserApiQuotaAsync(userId);
            
        if (quota != null)
        {
            return quota;
        }
        
        // Create new quota with default tier
        SubscriptionTier tier = await GetUserSubscriptionTierAsync(userId);
        
        UserApiQuota newQuota = new UserApiQuota
        {
            UserId = userId,
            SubscriptionTierId = tier.Id,
            ApiCallsUsedToday = 0,
            MaxDailyApiCalls = tier.DailyApiQuota,
            LastResetTime = DateTime.UtcNow.Date,
            LastUpdatedTime = DateTime.UtcNow,
            IsExemptFromQuota = tier.IsSystemTier
        };
        
        return await _userSubscriptionRepository.CreateOrUpdateUserApiQuotaAsync(newQuota);
    }
    
    /// <summary>
    /// Checks if an endpoint matches a given pattern
    /// </summary>
    private static bool IsEndpointMatch(string endpoint, string pattern)
    {
        try
        {
            // Convert pattern wildcards to regex
            string regexPattern = pattern
                .Replace("*", ".*") // Convert wildcard to regex
                .Replace("/", "\\/"); // Escape slashes
                
            return Regex.IsMatch(endpoint, $"^{regexPattern}$", RegexOptions.IgnoreCase);
        }
        catch
        {
            // If pattern is invalid, fall back to exact match
            return endpoint.Equals(pattern, StringComparison.OrdinalIgnoreCase);
        }
    }
} 