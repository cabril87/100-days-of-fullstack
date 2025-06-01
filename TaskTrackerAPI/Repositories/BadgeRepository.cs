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
using TaskTrackerAPI.Models.Gamification;
using TaskTrackerAPI.Repositories.Interfaces;

namespace TaskTrackerAPI.Repositories
{
    /// <summary>
    /// Repository implementation for badge and user badge management
    /// </summary>
    public class BadgeRepository : IBadgeRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<BadgeRepository> _logger;

        public BadgeRepository(ApplicationDbContext context, ILogger<BadgeRepository> logger)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<IEnumerable<Badge>> GetAllBadgesAsync()
        {
            try
            {
                return await _context.Badges
                    .Where(b => b.IsActive)
                    .OrderBy(b => b.DisplayOrder)
                    .ThenBy(b => b.Name)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all badges");
                return Enumerable.Empty<Badge>();
            }
        }

        public async Task<IEnumerable<UserBadge>> GetUserBadgesAsync(int userId)
        {
            try
            {
                return await _context.UserBadges
                    .Include(ub => ub.Badge)
                    .Where(ub => ub.UserId == userId)
                    .OrderByDescending(ub => ub.AwardedAt)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user badges for user {UserId}", userId);
                return Enumerable.Empty<UserBadge>();
            }
        }

        public async Task<UserBadge?> GetUserBadgeAsync(int userId, int badgeId)
        {
            try
            {
                return await _context.UserBadges
                    .Include(ub => ub.Badge)
                    .FirstOrDefaultAsync(ub => ub.UserId == userId && ub.BadgeId == badgeId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user badge for user {UserId} and badge {BadgeId}", userId, badgeId);
                return null;
            }
        }

        public async Task<UserBadge> AwardBadgeAsync(int userId, int badgeId)
        {
            try
            {
                // Check if user already has this badge
                UserBadge? existingBadge = await GetUserBadgeAsync(userId, badgeId);
                if (existingBadge != null)
                {
                    throw new InvalidOperationException($"User {userId} already has badge {badgeId}");
                }

                // Verify badge exists
                Badge? badge = await GetBadgeByIdAsync(badgeId);
                if (badge == null)
                {
                    throw new ArgumentException($"Badge {badgeId} not found", nameof(badgeId));
                }

                UserBadge userBadge = new UserBadge
                {
                    UserId = userId,
                    BadgeId = badgeId,
                    AwardedAt = DateTime.UtcNow,
                    IsDisplayed = true,
                    IsFeatured = false
                };

                _context.UserBadges.Add(userBadge);
                await _context.SaveChangesAsync();

                // Load the badge details
                await _context.Entry(userBadge)
                    .Reference(ub => ub.Badge)
                    .LoadAsync();

                _logger.LogInformation("Badge {BadgeId} awarded to user {UserId}", badgeId, userId);
                return userBadge;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error awarding badge {BadgeId} to user {UserId}", badgeId, userId);
                throw;
            }
        }

        public async Task<IEnumerable<Badge>> GetEligibleBadgesAsync(int userId)
        {
            try
            {
                List<int> earnedBadgeIds = await _context.UserBadges
                    .Where(ub => ub.UserId == userId)
                    .Select(ub => ub.BadgeId)
                    .ToListAsync();

                return await _context.Badges
                    .Where(b => b.IsActive && !earnedBadgeIds.Contains(b.Id))
                    .OrderBy(b => b.DisplayOrder)
                    .ThenBy(b => b.Name)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving eligible badges for user {UserId}", userId);
                return Enumerable.Empty<Badge>();
            }
        }

        public async Task<Badge?> GetBadgeByIdAsync(int badgeId)
        {
            try
            {
                return await _context.Badges.FindAsync(badgeId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving badge {BadgeId}", badgeId);
                return null;
            }
        }

        public async Task<bool> HasUserEarnedBadgeAsync(int userId, int badgeId)
        {
            try
            {
                return await _context.UserBadges
                    .AnyAsync(ub => ub.UserId == userId && ub.BadgeId == badgeId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking if user {UserId} has earned badge {BadgeId}", userId, badgeId);
                return false;
            }
        }

        public async Task<IEnumerable<Badge>> GetBadgesByCategoryAsync(string category)
        {
            try
            {
                return await _context.Badges
                    .Where(b => b.IsActive && b.Category == category)
                    .OrderBy(b => b.DisplayOrder)
                    .ThenBy(b => b.Name)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving badges by category {Category}", category);
                return Enumerable.Empty<Badge>();
            }
        }

        public async Task<IEnumerable<UserBadge>> GetRecentlyEarnedBadgesAsync(int userId, int days = 7)
        {
            try
            {
                DateTime cutoffDate = DateTime.UtcNow.AddDays(-days);

                return await _context.UserBadges
                    .Include(ub => ub.Badge)
                    .Where(ub => ub.UserId == userId && ub.AwardedAt >= cutoffDate)
                    .OrderByDescending(ub => ub.AwardedAt)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving recently earned badges for user {UserId}", userId);
                return Enumerable.Empty<UserBadge>();
            }
        }

        public async Task<bool> RevokeBadgeAsync(int userId, int badgeId)
        {
            try
            {
                UserBadge? userBadge = await _context.UserBadges
                    .FirstOrDefaultAsync(ub => ub.UserId == userId && ub.BadgeId == badgeId);

                if (userBadge == null)
                {
                    return false;
                }

                _context.UserBadges.Remove(userBadge);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Badge {BadgeId} revoked from user {UserId}", badgeId, userId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error revoking badge {BadgeId} from user {UserId}", badgeId, userId);
                return false;
            }
        }

        public async Task<BadgeStatistics> GetUserBadgeStatisticsAsync(int userId)
        {
            try
            {
                List<UserBadge> userBadges = await _context.UserBadges
                    .Include(ub => ub.Badge)
                    .Where(ub => ub.UserId == userId)
                    .ToListAsync();

                int totalBadgesAvailable = await _context.Badges
                    .CountAsync(b => b.IsActive);

                BadgeStatistics statistics = new BadgeStatistics
                {
                    TotalBadgesEarned = userBadges.Count,
                    TotalBadgesAvailable = totalBadgesAvailable,
                    DisplayedBadges = userBadges.Count(ub => ub.IsDisplayed),
                    FeaturedBadges = userBadges.Count(ub => ub.IsFeatured),
                    MostRecentBadge = userBadges.OrderByDescending(ub => ub.AwardedAt).FirstOrDefault(),
                    TotalPointsFromBadges = userBadges.Sum(ub => ub.Badge?.PointValue ?? 0),
                    FirstBadgeEarnedAt = userBadges.OrderBy(ub => ub.AwardedAt).FirstOrDefault()?.AwardedAt,
                    LastBadgeEarnedAt = userBadges.OrderByDescending(ub => ub.AwardedAt).FirstOrDefault()?.AwardedAt
                };

                // Calculate badges earned this month
                DateTime thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);
                statistics.BadgesEarnedThisMonth = userBadges.Count(ub => ub.AwardedAt >= thirtyDaysAgo);

                // Group by rarity
                statistics.BadgesByRarity = userBadges
                    .Where(ub => ub.Badge != null)
                    .GroupBy(ub => ub.Badge!.Rarity)
                    .ToDictionary(g => g.Key, g => g.Count());

                // Group by category
                statistics.BadgesByCategory = userBadges
                    .Where(ub => ub.Badge != null)
                    .GroupBy(ub => ub.Badge!.Category)
                    .ToDictionary(g => g.Key, g => g.Count());

                // Group by tier
                statistics.BadgesByTier = userBadges
                    .Where(ub => ub.Badge != null)
                    .GroupBy(ub => ub.Badge!.Tier)
                    .ToDictionary(g => g.Key, g => g.Count());

                return statistics;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving badge statistics for user {UserId}", userId);
                return new BadgeStatistics();
            }
        }

        public async Task<IEnumerable<Badge>> GetBadgesByTierAsync(string tier)
        {
            try
            {
                return await _context.Badges
                    .Where(b => b.IsActive && b.Tier == tier)
                    .OrderBy(b => b.DisplayOrder)
                    .ThenBy(b => b.Name)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving badges by tier {Tier}", tier);
                return Enumerable.Empty<Badge>();
            }
        }

        public async Task<IEnumerable<Badge>> GetBadgesBySeriesAsync(string seriesName)
        {
            try
            {
                // Assuming badges in a series have similar names or categories
                // This could be enhanced with a dedicated Series field in the Badge model
                return await _context.Badges
                    .Where(b => b.IsActive && 
                               (b.Name.Contains(seriesName) || b.Category.Contains(seriesName)))
                    .OrderBy(b => b.DisplayOrder)
                    .ThenBy(b => b.Name)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving badges by series {SeriesName}", seriesName);
                return Enumerable.Empty<Badge>();
            }
        }

        public async Task<bool> UpdateBadgeDisplayStatusAsync(int userId, int userBadgeId, bool isDisplayed)
        {
            try
            {
                UserBadge? userBadge = await _context.UserBadges
                    .FirstOrDefaultAsync(ub => ub.Id == userBadgeId && ub.UserId == userId);

                if (userBadge == null)
                {
                    _logger.LogWarning("User badge {UserBadgeId} not found for user {UserId}", userBadgeId, userId);
                    return false;
                }

                userBadge.IsDisplayed = isDisplayed;
                await _context.SaveChangesAsync();

                _logger.LogInformation("Badge display status updated for user {UserId}, badge {UserBadgeId}: {IsDisplayed}", userId, userBadgeId, isDisplayed);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating display status for user badge {UserBadgeId}", userBadgeId);
                return false;
            }
        }

        public async Task<bool> SetBadgeAsFeaturedAsync(int userId, int userBadgeId, bool isFeatured)
        {
            try
            {
                UserBadge? userBadge = await _context.UserBadges
                    .FirstOrDefaultAsync(ub => ub.Id == userBadgeId && ub.UserId == userId);

                if (userBadge == null)
                {
                    _logger.LogWarning("User badge {UserBadgeId} not found for user {UserId}", userBadgeId, userId);
                    return false;
                }

                // If setting as featured, ensure only one badge is featured per user
                if (isFeatured)
                {
                    // Unfeatured all other badges for this user
                    List<UserBadge> otherFeaturedBadges = await _context.UserBadges
                        .Where(ub => ub.UserId == userId && ub.IsFeatured && ub.Id != userBadgeId)
                        .ToListAsync();

                    foreach (UserBadge badge in otherFeaturedBadges)
                    {
                        badge.IsFeatured = false;
                    }
                }

                userBadge.IsFeatured = isFeatured;
                await _context.SaveChangesAsync();

                _logger.LogInformation("Badge featured status updated for user {UserId}, badge {UserBadgeId}: {IsFeatured}", userId, userBadgeId, isFeatured);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error setting featured status for user badge {UserBadgeId}", userBadgeId);
                return false;
            }
        }
    }
} 