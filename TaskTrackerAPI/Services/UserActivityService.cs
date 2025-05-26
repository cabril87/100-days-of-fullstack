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
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.DTOs.Activity;
using TaskTrackerAPI.Services.Interfaces;

namespace TaskTrackerAPI.Services
{
    /// <summary>
    /// Service for managing user activity tracking and analytics
    /// </summary>
    public class UserActivityService : IUserActivityService
    {
        private readonly IGamificationService _gamificationService;
        private readonly ILogger<UserActivityService> _logger;

        public UserActivityService(
            IGamificationService gamificationService,
            ILogger<UserActivityService> logger)
        {
            _gamificationService = gamificationService;
            _logger = logger;
        }

        /// <inheritdoc />
        public async Task<UserActivityPagedResultDTO> GetRecentActivitiesAsync(int userId, UserActivityFilterDTO filter)
        {
            try
            {
                _logger.LogInformation("Getting recent activities for user {UserId} with filter", userId);

                // Get point transactions as the base for activity
                var transactions = await _gamificationService.GetUserPointTransactionsAsync(userId, filter.Limit + filter.Offset);

                // Convert transactions to activity items
                var activities = transactions.Skip(filter.Offset).Take(filter.Limit).Select(t => new UserActivityDTO
                {
                    Id = t.Id.ToString(),
                    Type = MapTransactionTypeToActivityType(t.TransactionType),
                    Title = GetActivityTitle(t.TransactionType, t.Points),
                    Description = t.Description,
                    Points = t.Points,
                    Timestamp = t.CreatedAt,
                    Data = new UserActivityDataDTO
                    {
                        TaskId = t.RelatedEntityId?.ToString(),
                        TransactionType = t.TransactionType
                    }
                }).ToList();

                // Apply type filter
                if (!string.IsNullOrEmpty(filter.Type) && filter.Type != "all")
                {
                    activities = activities.Where(a => a.Type == filter.Type).ToList();
                }

                // Apply search filter
                if (!string.IsNullOrEmpty(filter.Search))
                {
                    activities = activities.Where(a =>
                        a.Title.Contains(filter.Search, StringComparison.OrdinalIgnoreCase) ||
                        a.Description.Contains(filter.Search, StringComparison.OrdinalIgnoreCase)
                    ).ToList();
                }

                // Apply date filtering
                activities = ApplyDateFilter(activities, filter);

                return new UserActivityPagedResultDTO
                {
                    Activities = activities,
                    Total = activities.Count(),
                    HasMore = transactions.Count() > filter.Offset + filter.Limit,
                    Offset = filter.Offset,
                    Limit = filter.Limit
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving recent activities for user {UserId}", userId);
                throw;
            }
        }

        /// <inheritdoc />
        public async Task<UserActivityStatsDTO> GetActivityStatsAsync(int userId)
        {
            try
            {
                _logger.LogInformation("Getting activity stats for user {UserId}", userId);

                // Get user progress for basic stats
                var userProgress = await _gamificationService.GetUserProgressAsync(userId);
                var transactions = await _gamificationService.GetUserPointTransactionsAsync(userId, 1000);

                var today = DateTime.UtcNow.Date;
                var todayTransactions = transactions.Where(t => t.CreatedAt.Date == today).ToList();

                return new UserActivityStatsDTO
                {
                    TotalActivities = transactions.Count(),
                    TotalPoints = userProgress.TotalPoints,
                    ActivitiesToday = todayTransactions.Count(),
                    PointsToday = todayTransactions.Sum(t => t.Points),
                    CurrentStreak = userProgress.CurrentStreak,
                    LongestStreak = userProgress.HighestStreak
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving activity stats for user {UserId}", userId);
                throw;
            }
        }

        /// <inheritdoc />
        public async Task<UserActivityTimelineDTO> GetActivityTimelineAsync(int userId, string dateRange = "month", string groupBy = "day")
        {
            try
            {
                _logger.LogInformation("Getting activity timeline for user {UserId} with range {DateRange}", userId, dateRange);

                var transactions = await _gamificationService.GetUserPointTransactionsAsync(userId, 1000);

                // Group transactions by date
                var grouped = transactions
                    .GroupBy(t => t.CreatedAt.Date)
                    .OrderBy(g => g.Key)
                    .Select(g => new
                    {
                        Date = g.Key.ToString("yyyy-MM-dd"),
                        Count = g.Count(),
                        Points = g.Sum(t => t.Points)
                    })
                    .ToList();

                return new UserActivityTimelineDTO
                {
                    Labels = grouped.Select(g => g.Date).ToArray(),
                    Data = grouped.Select(g => g.Count).ToArray(),
                    PointsData = grouped.Select(g => g.Points).ToArray()
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving activity timeline for user {UserId}", userId);
                throw;
            }
        }

        #region Private Helper Methods

        /// <summary>
        /// Maps transaction type to activity type
        /// </summary>
        private static string MapTransactionTypeToActivityType(string transactionType)
        {
            return transactionType.ToLower() switch
            {
                "task_completion" or "task_complete" => "task_completion",
                "achievement_unlock" or "achievement" => "achievement",
                "level_up" => "level_up",
                "badge_earned" or "badge" => "badge",
                "reward_claimed" or "reward" => "reward",
                "challenge_complete" or "challenge" => "challenge",
                "daily_login" or "login" => "login",
                "streak_bonus" or "streak" => "streak",
                "family_bonus" or "family" => "family",
                _ => "points"
            };
        }

        /// <summary>
        /// Gets display title for activity based on transaction type
        /// </summary>
        private static string GetActivityTitle(string transactionType, int points)
        {
            return transactionType.ToLower() switch
            {
                "task_completion" or "task_complete" => "Task completed",
                "achievement_unlock" or "achievement" => "Achievement unlocked",
                "level_up" => "Level up!",
                "badge_earned" or "badge" => "Badge earned",
                "reward_claimed" or "reward" => "Reward claimed",
                "challenge_complete" or "challenge" => "Challenge completed",
                "daily_login" or "login" => "Daily check-in",
                "streak_bonus" or "streak" => "Streak bonus",
                "family_bonus" or "family" => "Family activity",
                _ => points > 0 ? "Points earned" : "Points spent"
            };
        }

        /// <summary>
        /// Applies date filtering to activities
        /// </summary>
        private static List<UserActivityDTO> ApplyDateFilter(List<UserActivityDTO> activities, UserActivityFilterDTO filter)
        {
            if (string.IsNullOrEmpty(filter.DateRange) || filter.DateRange == "all")
            {
                return activities;
            }

            var now = DateTime.UtcNow;
            DateTime filterDate = filter.DateRange switch
            {
                "today" => now.Date,
                "week" => now.AddDays(-7),
                "month" => now.AddMonths(-1),
                _ => DateTime.MinValue
            };

            if (filterDate != DateTime.MinValue)
            {
                activities = activities.Where(a => a.Timestamp >= filterDate).ToList();
            }

            // Apply custom date range if provided
            if (filter.StartDate.HasValue)
            {
                activities = activities.Where(a => a.Timestamp >= filter.StartDate.Value).ToList();
            }

            if (filter.EndDate.HasValue)
            {
                activities = activities.Where(a => a.Timestamp <= filter.EndDate.Value).ToList();
            }

            return activities;
        }

        #endregion
    }
} 