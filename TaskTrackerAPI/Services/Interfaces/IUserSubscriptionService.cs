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
using System.Threading.Tasks;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Services.Interfaces;

/// <summary>
/// Service to manage user subscription tiers and rate limits
/// </summary>
public interface IUserSubscriptionService
{
    /// <summary>
    /// Gets the subscription tier for a user
    /// </summary>
    /// <param name="userId">The ID of the user</param>
    /// <returns>The subscription tier details</returns>
    Task<SubscriptionTier> GetUserSubscriptionTierAsync(int userId);

    /// <summary>
    /// Gets the rate limit for a specific endpoint based on the user's subscription tier
    /// </summary>
    /// <param name="userId">The ID of the user</param>
    /// <param name="endpoint">The endpoint path</param>
    /// <returns>Rate limit and time window</returns>
    Task<(int Limit, int TimeWindowSeconds)> GetRateLimitForUserAndEndpointAsync(int userId, string endpoint);

    /// <summary>
    /// Checks if a user has exceeded their daily quota
    /// </summary>
    /// <param name="userId">The ID of the user</param>
    /// <returns>True if quota exceeded, false otherwise</returns>
    Task<bool> HasUserExceededDailyQuotaAsync(int userId);

    /// <summary>
    /// Increments the user's API usage count
    /// </summary>
    /// <param name="userId">The ID of the user</param>
    /// <param name="count">Number of API calls to add (default: 1)</param>
    Task IncrementUserApiUsageAsync(int userId, int count = 1);

    /// <summary>
    /// Gets the remaining API quota for the user
    /// </summary>
    /// <param name="userId">The ID of the user</param>
    /// <returns>Remaining API calls and reset time</returns>
    Task<(int RemainingCalls, DateTime ResetTime)> GetRemainingQuotaAsync(int userId);

    /// <summary>
    /// Checks if a user is a trusted system account that can bypass rate limits
    /// </summary>
    /// <param name="userId">The ID of the user</param>
    /// <returns>True if trusted, false otherwise</returns>
    Task<bool> IsTrustedSystemAccountAsync(int userId);
} 