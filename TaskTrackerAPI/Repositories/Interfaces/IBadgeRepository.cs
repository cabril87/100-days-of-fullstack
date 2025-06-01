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
using TaskTrackerAPI.Models.Gamification;

namespace TaskTrackerAPI.Repositories.Interfaces
{
    /// <summary>
    /// Repository interface for badge and user badge management
    /// </summary>
    public interface IBadgeRepository
    {
        /// <summary>
        /// Gets all available badges in the system
        /// </summary>
        /// <returns>Collection of all badges</returns>
        Task<IEnumerable<Badge>> GetAllBadgesAsync();

        /// <summary>
        /// Gets all badges earned by a specific user
        /// </summary>
        /// <param name="userId">ID of the user</param>
        /// <returns>Collection of user badges</returns>
        Task<IEnumerable<UserBadge>> GetUserBadgesAsync(int userId);

        /// <summary>
        /// Gets a specific user badge
        /// </summary>
        /// <param name="userId">ID of the user</param>
        /// <param name="badgeId">ID of the badge</param>
        /// <returns>User badge if found</returns>
        Task<UserBadge?> GetUserBadgeAsync(int userId, int badgeId);

        /// <summary>
        /// Awards a badge to a user
        /// </summary>
        /// <param name="userId">ID of the user</param>
        /// <param name="badgeId">ID of the badge to award</param>
        /// <returns>Created user badge</returns>
        Task<UserBadge> AwardBadgeAsync(int userId, int badgeId);

        /// <summary>
        /// Gets badges that are eligible to be earned by a user (not yet earned)
        /// </summary>
        /// <param name="userId">ID of the user</param>
        /// <returns>Collection of eligible badges</returns>
        Task<IEnumerable<Badge>> GetEligibleBadgesAsync(int userId);

        /// <summary>
        /// Gets a specific badge by ID
        /// </summary>
        /// <param name="badgeId">ID of the badge</param>
        /// <returns>Badge if found</returns>
        Task<Badge?> GetBadgeByIdAsync(int badgeId);

        /// <summary>
        /// Checks if a user has earned a specific badge
        /// </summary>
        /// <param name="userId">ID of the user</param>
        /// <param name="badgeId">ID of the badge</param>
        /// <returns>True if the user has earned the badge</returns>
        Task<bool> HasUserEarnedBadgeAsync(int userId, int badgeId);

        /// <summary>
        /// Gets badges by category
        /// </summary>
        /// <param name="category">Badge category</param>
        /// <returns>Collection of badges in the category</returns>
        Task<IEnumerable<Badge>> GetBadgesByCategoryAsync(string category);

        /// <summary>
        /// Gets recently earned badges for a user
        /// </summary>
        /// <param name="userId">ID of the user</param>
        /// <param name="days">Number of days to look back</param>
        /// <returns>Collection of recently earned badges</returns>
        Task<IEnumerable<UserBadge>> GetRecentlyEarnedBadgesAsync(int userId, int days = 7);

        /// <summary>
        /// Revokes a badge from a user
        /// </summary>
        /// <param name="userId">ID of the user</param>
        /// <param name="badgeId">ID of the badge</param>
        /// <returns>True if the badge was revoked</returns>
        Task<bool> RevokeBadgeAsync(int userId, int badgeId);

        /// <summary>
        /// Gets badge statistics for a user
        /// </summary>
        /// <param name="userId">ID of the user</param>
        /// <returns>Badge statistics</returns>
        Task<BadgeStatistics> GetUserBadgeStatisticsAsync(int userId);

        /// <summary>
        /// Gets badges by tier/rarity
        /// </summary>
        /// <param name="tier">Badge tier (Common, Rare, Epic, Legendary)</param>
        /// <returns>Collection of badges in the tier</returns>
        Task<IEnumerable<Badge>> GetBadgesByTierAsync(string tier);

        /// <summary>
        /// Gets badges that are part of a series or collection
        /// </summary>
        /// <param name="seriesName">Name of the badge series</param>
        /// <returns>Collection of badges in the series</returns>
        Task<IEnumerable<Badge>> GetBadgesBySeriesAsync(string seriesName);

        /// <summary>
        /// Updates the display status of a user badge
        /// </summary>
        /// <param name="userId">ID of the user</param>
        /// <param name="userBadgeId">ID of the user badge</param>
        /// <param name="isDisplayed">New display status</param>
        /// <returns>True if the update was successful</returns>
        Task<bool> UpdateBadgeDisplayStatusAsync(int userId, int userBadgeId, bool isDisplayed);

        /// <summary>
        /// Sets a user badge as featured or unfeatured
        /// </summary>
        /// <param name="userId">ID of the user</param>
        /// <param name="userBadgeId">ID of the user badge</param>
        /// <param name="isFeatured">Whether the badge should be featured</param>
        /// <returns>True if the update was successful</returns>
        Task<bool> SetBadgeAsFeaturedAsync(int userId, int userBadgeId, bool isFeatured);
    }
} 