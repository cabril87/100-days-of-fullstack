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
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Data.SeedData;

/// <summary>
/// Seeds subscription tier data into the database
/// </summary>
public static class SubscriptionTierSeed
{
    /// <summary>
    /// Seeds default subscription tiers
    /// </summary>
    /// <param name="context">Database context</param>
    /// <param name="logger">Logger</param>
    public static async Task SeedSubscriptionTiersAsync(ApplicationDbContext context, ILogger logger)
    {
        try
        {
            // Only seed if no tiers exist
            if (await context.SubscriptionTiers.AnyAsync())
            {
                logger.LogInformation("Skipping subscription tier seeding - data already exists");
                return;
            }

            logger.LogInformation("Seeding subscription tiers...");

            // Create default subscription tiers
            var tiers = new List<SubscriptionTier>
            {
                // Free tier
                new SubscriptionTier
                {
                    Name = "Free",
                    Description = "Basic functionality with limited API usage",
                    DefaultRateLimit = 30,
                    DefaultTimeWindowSeconds = 60,
                    DailyApiQuota = 500,
                    MaxConcurrentConnections = 3,
                    BypassStandardRateLimits = false,
                    Priority = 0,
                    IsSystemTier = false,
                    MonthlyCost = 0,
                    CreatedAt = DateTime.UtcNow
                },
                
                // Premium tier
                new SubscriptionTier
                {
                    Name = "Premium",
                    Description = "Enhanced functionality with increased API limits",
                    DefaultRateLimit = 100,
                    DefaultTimeWindowSeconds = 60,
                    DailyApiQuota = 5000,
                    MaxConcurrentConnections = 10,
                    BypassStandardRateLimits = false,
                    Priority = 1,
                    IsSystemTier = false,
                    MonthlyCost = 9.99m,
                    CreatedAt = DateTime.UtcNow
                },
                
                // Enterprise tier
                new SubscriptionTier
                {
                    Name = "Enterprise",
                    Description = "Full functionality with high API limits and priority support",
                    DefaultRateLimit = 300,
                    DefaultTimeWindowSeconds = 60,
                    DailyApiQuota = 50000,
                    MaxConcurrentConnections = 50,
                    BypassStandardRateLimits = true,
                    Priority = 2,
                    IsSystemTier = false,
                    MonthlyCost = 49.99m,
                    CreatedAt = DateTime.UtcNow
                },
                
                // System tier - For internal system accounts
                new SubscriptionTier
                {
                    Name = "System",
                    Description = "Internal system accounts with unlimited access",
                    DefaultRateLimit = int.MaxValue,
                    DefaultTimeWindowSeconds = 60,
                    DailyApiQuota = int.MaxValue,
                    MaxConcurrentConnections = 100,
                    BypassStandardRateLimits = true,
                    Priority = 10,
                    IsSystemTier = true,
                    MonthlyCost = 0,
                    CreatedAt = DateTime.UtcNow
                }
            };

            // Add tiers to database
            await context.SubscriptionTiers.AddRangeAsync(tiers);
            await context.SaveChangesAsync();
            
            // Get the system tier ID for later use
            var systemTier = await context.SubscriptionTiers
                .FirstOrDefaultAsync(t => t.Name == "System");
                
            var freeTier = await context.SubscriptionTiers
                .FirstOrDefaultAsync(t => t.Name == "Free");
                
            var premiumTier = await context.SubscriptionTiers
                .FirstOrDefaultAsync(t => t.Name == "Premium");
                
            var enterpriseTier = await context.SubscriptionTiers
                .FirstOrDefaultAsync(t => t.Name == "Enterprise");

            // Create default rate limit configurations
            if (freeTier != null && premiumTier != null && enterpriseTier != null && systemTier != null)
            {
                var configs = new List<RateLimitTierConfig>
                {
                    // Free tier - Authentication limits
                    new RateLimitTierConfig
                    {
                        SubscriptionTierId = freeTier.Id,
                        EndpointPattern = "/api/auth/*",
                        HttpMethod = "*",
                        RateLimit = 3,
                        TimeWindowSeconds = 60,
                        IsCriticalEndpoint = true,
                        ExemptSystemAccounts = true,
                        MatchPriority = 100,
                        CreatedAt = DateTime.UtcNow,
                        IsAdaptive = true,
                        HighLoadReductionPercent = 50
                    },
                    
                    // Free tier - Task endpoints
                    new RateLimitTierConfig
                    {
                        SubscriptionTierId = freeTier.Id,
                        EndpointPattern = "/api/tasks*",
                        HttpMethod = "*",
                        RateLimit = 20,
                        TimeWindowSeconds = 30,
                        IsCriticalEndpoint = false,
                        ExemptSystemAccounts = true,
                        MatchPriority = 50,
                        CreatedAt = DateTime.UtcNow,
                        IsAdaptive = true,
                        HighLoadReductionPercent = 50
                    },
                    
                    // Premium tier - Authentication limits
                    new RateLimitTierConfig
                    {
                        SubscriptionTierId = premiumTier.Id,
                        EndpointPattern = "/api/auth/*",
                        HttpMethod = "*",
                        RateLimit = 5,
                        TimeWindowSeconds = 60,
                        IsCriticalEndpoint = true,
                        ExemptSystemAccounts = true,
                        MatchPriority = 100,
                        CreatedAt = DateTime.UtcNow,
                        IsAdaptive = true,
                        HighLoadReductionPercent = 30
                    },
                    
                    // Premium tier - Task endpoints
                    new RateLimitTierConfig
                    {
                        SubscriptionTierId = premiumTier.Id,
                        EndpointPattern = "/api/tasks*",
                        HttpMethod = "*",
                        RateLimit = 60,
                        TimeWindowSeconds = 30,
                        IsCriticalEndpoint = false,
                        ExemptSystemAccounts = true,
                        MatchPriority = 50,
                        CreatedAt = DateTime.UtcNow,
                        IsAdaptive = true,
                        HighLoadReductionPercent = 30
                    },
                    
                    // Enterprise tier - Authentication limits
                    new RateLimitTierConfig
                    {
                        SubscriptionTierId = enterpriseTier.Id,
                        EndpointPattern = "/api/auth/*",
                        HttpMethod = "*",
                        RateLimit = 10,
                        TimeWindowSeconds = 60,
                        IsCriticalEndpoint = true,
                        ExemptSystemAccounts = true,
                        MatchPriority = 100,
                        CreatedAt = DateTime.UtcNow,
                        IsAdaptive = false
                    },
                    
                    // Enterprise tier - Task endpoints
                    new RateLimitTierConfig
                    {
                        SubscriptionTierId = enterpriseTier.Id,
                        EndpointPattern = "/api/tasks*",
                        HttpMethod = "*",
                        RateLimit = 200,
                        TimeWindowSeconds = 30,
                        IsCriticalEndpoint = false,
                        ExemptSystemAccounts = true,
                        MatchPriority = 50,
                        CreatedAt = DateTime.UtcNow,
                        IsAdaptive = true,
                        HighLoadReductionPercent = 20
                    }
                };

                // Add configs to database
                await context.RateLimitTierConfigs.AddRangeAsync(configs);
                await context.SaveChangesAsync();
            }

            logger.LogInformation("Successfully seeded subscription tiers and rate limit configurations");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error seeding subscription tiers");
            throw;
        }
    }
} 