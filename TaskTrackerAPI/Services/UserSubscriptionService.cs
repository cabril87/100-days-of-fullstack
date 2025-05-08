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
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using TaskTrackerAPI.Data;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Services.Interfaces;

namespace TaskTrackerAPI.Services;

/// <summary>
/// Service that manages user subscription tiers and associated rate limits
/// </summary>
public class UserSubscriptionService : IUserSubscriptionService
{
    private readonly ApplicationDbContext _context;
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
        ApplicationDbContext context,
        IMemoryCache cache,
        ILogger<UserSubscriptionService> logger,
        IConfiguration configuration)
    {
        _context = context;
        _cache = cache;
        _logger = logger;
        _configuration = configuration;
        
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
                systemTier = await _context.SubscriptionTiers
                    .FirstOrDefaultAsync(t => t.Id == _systemTierId);
            }
            
            // If we don't have a valid system tier ID or couldn't find it, look it up by name
            if (systemTier == null)
            {
                systemTier = await _context.SubscriptionTiers
                    .FirstOrDefaultAsync(t => t.Name == "System" && t.IsSystemTier);
            }
                
            if (systemTier != null)
            {
                _cache.Set(cacheKey, systemTier, _tierCacheDuration);
                return systemTier;
            }
        }
        
        // Get user's subscription tier from database
        UserApiQuota? userQuota = await _context.UserApiQuotas
            .Include(q => q.SubscriptionTier)
            .FirstOrDefaultAsync(q => q.UserId == userId);
        
        if (userQuota?.SubscriptionTier != null)
        {
            _cache.Set(cacheKey, userQuota.SubscriptionTier, _tierCacheDuration);
            return userQuota.SubscriptionTier;
        }
        
        // If no subscription tier found, get the default free tier
        SubscriptionTier? freeTier = null;
        
        if (_defaultFreeTierId > 0)
        {
            freeTier = await _context.SubscriptionTiers
                .FirstOrDefaultAsync(t => t.Id == _defaultFreeTierId);
        }
        
        // If we don't have a valid free tier ID or couldn't find it, look it up by name
        if (freeTier == null)
        {
            freeTier = await _context.SubscriptionTiers
                .FirstOrDefaultAsync(t => t.Name == "Free" && !t.IsSystemTier);
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
        // Get user's subscription tier
        SubscriptionTier tier = await GetUserSubscriptionTierAsync(userId);
        
        // Trusted system accounts with bypass enabled get maximum limits
        if (tier.IsSystemTier && tier.BypassStandardRateLimits)
        {
            return (int.MaxValue, 60);
        }
        
        // Try to find a specific rate limit configuration for this endpoint and tier
        string cacheKey = string.Format(RateLimitConfigCacheKey, tier.Id, endpoint);
        
        if (!_cache.TryGetValue(cacheKey, out RateLimitTierConfig? cachedConfig))
        {
            // Get all configs for this tier ordered by priority
            List<RateLimitTierConfig> tierConfigs = await _context.RateLimitTierConfigs
                .Where(c => c.SubscriptionTierId == tier.Id)
                .OrderByDescending(c => c.MatchPriority)
                .ToListAsync();
            
            // Find the most specific matching configuration
            RateLimitTierConfig? matchingConfig = null;
            foreach (RateLimitTierConfig config in tierConfigs)
            {
                string pattern = config.EndpointPattern
                    .Replace("*", ".*") // Convert wildcard to regex
                    .Replace("/", "\\/"); // Escape slashes
                    
                if (Regex.IsMatch(endpoint, $"^{pattern}$", RegexOptions.IgnoreCase))
                {
                    matchingConfig = config;
                    break;
                }
            }
            
            if (matchingConfig != null)
            {
                cachedConfig = matchingConfig;
                _cache.Set(cacheKey, cachedConfig, _configCacheDuration);
            }
        }
        
        // If we found a specific configuration, use it
        if (cachedConfig != null)
        {
            return (cachedConfig.RateLimit, cachedConfig.TimeWindowSeconds);
        }
        
        // Otherwise fall back to the tier's default limits
        return (tier.DefaultRateLimit, tier.DefaultTimeWindowSeconds);
    }

    /// <inheritdoc />
    public async Task<bool> HasUserExceededDailyQuotaAsync(int userId)
    {
        // System accounts are exempt from quotas
        if (await IsTrustedSystemAccountAsync(userId))
        {
            return false;
        }
        
        // Get the user's quota record
        UserApiQuota? quota = await GetOrCreateUserQuotaAsync(userId);
        
        // Check if quota is reset daily
        if (quota.LastResetTime.Date < DateTime.UtcNow.Date)
        {
            // Reset the counter for a new day
            quota.ApiCallsUsedToday = 0;
            quota.LastResetTime = DateTime.UtcNow.Date;
            quota.HasReceivedQuotaWarning = false;
            
            await _context.SaveChangesAsync();
            return false;
        }
        
        // Exempt accounts never exceed quota
        if (quota.IsExemptFromQuota)
        {
            return false;
        }
        
        // Check if user has exceeded their daily quota
        return quota.ApiCallsUsedToday >= quota.MaxDailyApiCalls;
    }

    /// <inheritdoc />
    public async Task IncrementUserApiUsageAsync(int userId, int count = 1)
    {
        // System accounts don't track usage
        if (await IsTrustedSystemAccountAsync(userId))
        {
            return;
        }
        
        // Get the user's quota record
        UserApiQuota quota = await GetOrCreateUserQuotaAsync(userId);
        
        // Reset if it's a new day
        if (quota.LastResetTime.Date < DateTime.UtcNow.Date)
        {
            quota.ApiCallsUsedToday = count;
            quota.LastResetTime = DateTime.UtcNow.Date;
            quota.HasReceivedQuotaWarning = false;
        }
        else
        {
            quota.ApiCallsUsedToday += count;
            
            // Check if we should trigger a quota warning
            if (!quota.HasReceivedQuotaWarning && 
                quota.ApiCallsUsedToday >= (quota.MaxDailyApiCalls * quota.QuotaWarningThresholdPercent / 100))
            {
                quota.HasReceivedQuotaWarning = true;
                // TODO: Trigger quota warning notification
                _logger.LogInformation("User {UserId} has used {UsedCalls}/{MaxCalls} API calls ({Percent}%)", 
                    userId, quota.ApiCallsUsedToday, quota.MaxDailyApiCalls, 
                    (quota.ApiCallsUsedToday * 100 / quota.MaxDailyApiCalls));
            }
        }
        
        quota.LastUpdatedTime = DateTime.UtcNow;
        
        await _context.SaveChangesAsync();
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
            quota.HasReceivedQuotaWarning = false;
            await _context.SaveChangesAsync();
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
        
        // If not in the pre-loaded list, check from database
        UserApiQuota? quota = await _context.UserApiQuotas
            .FirstOrDefaultAsync(q => q.UserId == userId && q.SubscriptionTier!.IsSystemTier);
            
        return quota != null;
    }
    
    /// <summary>
    /// Gets or creates a user API quota record
    /// </summary>
    private async Task<UserApiQuota> GetOrCreateUserQuotaAsync(int userId)
    {
        // Find existing quota
        UserApiQuota? quota = await _context.UserApiQuotas
            .Include(q => q.SubscriptionTier)
            .FirstOrDefaultAsync(q => q.UserId == userId);
            
        if (quota != null)
        {
            return quota;
        }
        
        // Create new quota with default tier
        SubscriptionTier tier = await GetUserSubscriptionTierAsync(userId);
        
        quota = new UserApiQuota
        {
            UserId = userId,
            SubscriptionTierId = tier.Id,
            ApiCallsUsedToday = 0,
            MaxDailyApiCalls = tier.DailyApiQuota,
            LastResetTime = DateTime.UtcNow.Date,
            LastUpdatedTime = DateTime.UtcNow,
            IsExemptFromQuota = tier.IsSystemTier,
            HasReceivedQuotaWarning = false
        };
        
        _context.UserApiQuotas.Add(quota);
        await _context.SaveChangesAsync();
        
        return quota;
    }
} 