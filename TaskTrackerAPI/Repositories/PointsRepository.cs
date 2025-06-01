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
    /// Repository implementation for points and user progress management
    /// </summary>
    public class PointsRepository : IPointsRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<PointsRepository> _logger;

        public PointsRepository(ApplicationDbContext context, ILogger<PointsRepository> logger)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<UserProgress?> GetUserProgressAsync(int userId)
        {
            try
            {
                return await _context.UserProgresses
                    .FirstOrDefaultAsync(up => up.UserId == userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user progress for user {UserId}", userId);
                return null;
            }
        }

        public async Task<UserProgress> CreateUserProgressAsync(UserProgress userProgress)
        {
            try
            {
                _context.UserProgresses.Add(userProgress);
                await _context.SaveChangesAsync();
                
                _logger.LogInformation("User progress created for user {UserId}", userProgress.UserId);
                return userProgress;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating user progress for user {UserId}", userProgress.UserId);
                throw;
            }
        }

        public async Task<UserProgress> UpdateUserProgressAsync(UserProgress userProgress)
        {
            try
            {
                userProgress.UpdatedAt = DateTime.UtcNow;
                _context.UserProgresses.Update(userProgress);
                await _context.SaveChangesAsync();
                
                return userProgress;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user progress for user {UserId}", userProgress.UserId);
                throw;
            }
        }

        public async Task<PointTransaction> AddPointsAsync(int userId, int points, string transactionType, string description, int? taskId = null, int? templateId = null)
        {
            try
            {
                // Get or create user progress
                UserProgress? userProgress = await GetUserProgressAsync(userId);
                if (userProgress == null)
                {
                    userProgress = new UserProgress
                    {
                        UserId = userId,
                        Level = 1,
                        CurrentPoints = 0,
                        TotalPointsEarned = 0,
                        NextLevelThreshold = 100,
                        CurrentStreak = 0,
                        LongestStreak = 0,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    userProgress = await CreateUserProgressAsync(userProgress);
                }

                // Update user progress
                userProgress.CurrentPoints += points;
                userProgress.TotalPointsEarned += points;
                userProgress.UpdatedAt = DateTime.UtcNow;

                // Check for level up
                while (userProgress.CurrentPoints >= userProgress.NextLevelThreshold)
                {
                    userProgress.Level++;
                    userProgress.CurrentPoints -= userProgress.NextLevelThreshold;
                    userProgress.NextLevelThreshold = CalculateNextLevelThreshold(userProgress.Level);
                }

                await UpdateUserProgressAsync(userProgress);

                // Create transaction record
                PointTransaction transaction = new PointTransaction
                {
                    UserId = userId,
                    Points = points,
                    TransactionType = transactionType,
                    Description = description,
                    TaskId = taskId,
                    TemplateId = templateId,
                    CreatedAt = DateTime.UtcNow
                };

                _context.PointTransactions.Add(transaction);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Added {Points} points to user {UserId} via {TransactionType}", points, userId, transactionType);
                return transaction;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding {Points} points to user {UserId}", points, userId);
                throw;
            }
        }

        public async Task<PointTransaction> DeductPointsAsync(int userId, int points, string transactionType, string description, int? taskId = null, int? templateId = null)
        {
            try
            {
                // Check if user has sufficient points
                bool hasSufficientPoints = await HasSufficientPointsAsync(userId, points);
                if (!hasSufficientPoints)
                {
                    throw new InvalidOperationException($"User {userId} does not have sufficient points ({points} required)");
                }

                // Get user progress
                UserProgress? userProgress = await GetUserProgressAsync(userId);
                if (userProgress == null)
                {
                    throw new InvalidOperationException($"User progress not found for user {userId}");
                }

                // Update user progress
                userProgress.CurrentPoints -= points;
                userProgress.UpdatedAt = DateTime.UtcNow;
                await UpdateUserProgressAsync(userProgress);

                // Create transaction record (negative points for deduction)
                PointTransaction transaction = new PointTransaction
                {
                    UserId = userId,
                    Points = -points,
                    TransactionType = transactionType,
                    Description = description,
                    TaskId = taskId,
                    TemplateId = templateId,
                    CreatedAt = DateTime.UtcNow
                };

                _context.PointTransactions.Add(transaction);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Deducted {Points} points from user {UserId} via {TransactionType}", points, userId, transactionType);
                return transaction;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deducting {Points} points from user {UserId}", points, userId);
                throw;
            }
        }

        public async Task<int> GetUserPointsAsync(int userId)
        {
            try
            {
                UserProgress? userProgress = await GetUserProgressAsync(userId);
                return userProgress?.CurrentPoints ?? 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving points for user {UserId}", userId);
                return 0;
            }
        }

        public async Task<bool> HasSufficientPointsAsync(int userId, int requiredPoints)
        {
            try
            {
                int currentPoints = await GetUserPointsAsync(userId);
                return currentPoints >= requiredPoints;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking sufficient points for user {UserId}", userId);
                return false;
            }
        }

        public async Task<IEnumerable<PointTransaction>> GetTransactionHistoryAsync(int userId, int limit = 50)
        {
            try
            {
                return await _context.PointTransactions
                    .Where(pt => pt.UserId == userId)
                    .OrderByDescending(pt => pt.CreatedAt)
                    .Take(limit)
                    .Include(pt => pt.Task)
                    .Include(pt => pt.Template)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving transaction history for user {UserId}", userId);
                return Enumerable.Empty<PointTransaction>();
            }
        }

        public async Task<IEnumerable<PointTransaction>> GetTransactionsByDateRangeAsync(int userId, DateTime fromDate, DateTime toDate)
        {
            try
            {
                return await _context.PointTransactions
                    .Where(pt => pt.UserId == userId && 
                                pt.CreatedAt >= fromDate && 
                                pt.CreatedAt <= toDate)
                    .OrderByDescending(pt => pt.CreatedAt)
                    .Include(pt => pt.Task)
                    .Include(pt => pt.Template)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving transactions by date range for user {UserId}", userId);
                return Enumerable.Empty<PointTransaction>();
            }
        }

        public async Task<IEnumerable<PointTransaction>> GetTransactionsByTypeAsync(int userId, string transactionType)
        {
            try
            {
                return await _context.PointTransactions
                    .Where(pt => pt.UserId == userId && pt.TransactionType == transactionType)
                    .OrderByDescending(pt => pt.CreatedAt)
                    .Include(pt => pt.Task)
                    .Include(pt => pt.Template)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving transactions by type {TransactionType} for user {UserId}", transactionType, userId);
                return Enumerable.Empty<PointTransaction>();
            }
        }

        public async Task<PointTransaction?> GetTransactionByIdAsync(int transactionId)
        {
            try
            {
                return await _context.PointTransactions
                    .Include(pt => pt.Task)
                    .Include(pt => pt.Template)
                    .FirstOrDefaultAsync(pt => pt.Id == transactionId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving transaction {TransactionId}", transactionId);
                return null;
            }
        }

        public async Task<int> GetTotalPointsEarnedAsync(int userId)
        {
            try
            {
                UserProgress? userProgress = await GetUserProgressAsync(userId);
                return userProgress?.TotalPointsEarned ?? 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving total points earned for user {UserId}", userId);
                return 0;
            }
        }

        public async Task<int> GetTotalPointsSpentAsync(int userId)
        {
            try
            {
                int totalSpent = await _context.PointTransactions
                    .Where(pt => pt.UserId == userId && pt.Points < 0)
                    .SumAsync(pt => Math.Abs(pt.Points));
                
                return totalSpent;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving total points spent for user {UserId}", userId);
                return 0;
            }
        }

        public async Task<int> GetPointsEarnedThisMonthAsync(int userId)
        {
            try
            {
                DateTime thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);
                
                int pointsThisMonth = await _context.PointTransactions
                    .Where(pt => pt.UserId == userId && 
                                pt.Points > 0 && 
                                pt.CreatedAt >= thirtyDaysAgo)
                    .SumAsync(pt => pt.Points);
                
                return pointsThisMonth;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving points earned this month for user {UserId}", userId);
                return 0;
            }
        }

        public async Task<IEnumerable<UserProgress>> GetPointsLeaderboardAsync(int limit = 10)
        {
            try
            {
                return await _context.UserProgresses
                    .OrderByDescending(up => up.CurrentPoints)
                    .Take(limit)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving points leaderboard");
                return Enumerable.Empty<UserProgress>();
            }
        }

        public async Task<IEnumerable<UserProgress>> GetTotalPointsLeaderboardAsync(int limit = 10)
        {
            try
            {
                return await _context.UserProgresses
                    .OrderByDescending(up => up.TotalPointsEarned)
                    .Take(limit)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving total points leaderboard");
                return Enumerable.Empty<UserProgress>();
            }
        }

        public async Task<bool> HasDailyLoginTransactionAsync(int userId, DateTime date)
        {
            try
            {
                DateTime startOfDay = date.Date;
                DateTime endOfDay = startOfDay.AddDays(1);

                return await _context.PointTransactions
                    .AnyAsync(pt => pt.UserId == userId && 
                                   pt.TransactionType == "daily_login" &&
                                   pt.CreatedAt >= startOfDay && 
                                   pt.CreatedAt < endOfDay);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking daily login transaction for user {UserId} on {Date}", userId, date);
                return false;
            }
        }

        public async Task<UserProgress> UpdateActivityStreakAsync(int userId)
        {
            try
            {
                UserProgress? userProgress = await GetUserProgressAsync(userId);
                if (userProgress == null)
                {
                    throw new InvalidOperationException($"User progress not found for user {userId}");
                }

                DateTime today = DateTime.UtcNow.Date;
                DateTime yesterday = today.AddDays(-1);

                bool hasActivityToday = await HasDailyLoginTransactionAsync(userId, today);
                bool hasActivityYesterday = await HasDailyLoginTransactionAsync(userId, yesterday);

                if (hasActivityToday)
                {
                    if (hasActivityYesterday || userProgress.CurrentStreak == 0)
                    {
                        // Continue or start streak
                        userProgress.CurrentStreak++;
                        userProgress.LastActivityDate = DateTime.UtcNow;
                        
                        // Update longest streak if necessary
                        if (userProgress.CurrentStreak > userProgress.LongestStreak)
                        {
                            userProgress.LongestStreak = userProgress.CurrentStreak;
                        }
                    }
                }
                else if (!hasActivityYesterday && userProgress.LastActivityDate?.Date < yesterday)
                {
                    // Streak broken
                    userProgress.CurrentStreak = 0;
                }

                return await UpdateUserProgressAsync(userProgress);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating activity streak for user {UserId}", userId);
                throw;
            }
        }

        public async Task<UserPointsStatistics> GetUserPointsStatisticsAsync(int userId)
        {
            try
            {
                UserProgress? userProgress = await GetUserProgressAsync(userId);
                if (userProgress == null)
                {
                    return new UserPointsStatistics();
                }

                List<PointTransaction> allTransactions = await _context.PointTransactions
                    .Where(pt => pt.UserId == userId)
                    .OrderBy(pt => pt.CreatedAt)
                    .ToListAsync();

                int totalPointsSpent = await GetTotalPointsSpentAsync(userId);
                int pointsEarnedThisMonth = await GetPointsEarnedThisMonthAsync(userId);

                DateTime thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);
                int pointsSpentThisMonth = allTransactions
                    .Where(pt => pt.Points < 0 && pt.CreatedAt >= thirtyDaysAgo)
                    .Sum(pt => Math.Abs(pt.Points));

                // Calculate rankings
                List<UserProgress> allUserProgresses = await _context.UserProgresses.ToListAsync();
                int currentPointsRank = allUserProgresses
                    .Where(up => up.CurrentPoints > userProgress.CurrentPoints)
                    .Count() + 1;
                
                int totalPointsRank = allUserProgresses
                    .Where(up => up.TotalPointsEarned > userProgress.TotalPointsEarned)
                    .Count() + 1;

                // Group transactions by type
                Dictionary<string, int> pointsByType = allTransactions
                    .Where(pt => pt.Points > 0)
                    .GroupBy(pt => pt.TransactionType)
                    .ToDictionary(g => g.Key, g => g.Sum(pt => pt.Points));

                UserPointsStatistics statistics = new UserPointsStatistics
                {
                    CurrentPoints = userProgress.CurrentPoints,
                    TotalPointsEarned = userProgress.TotalPointsEarned,
                    TotalPointsSpent = totalPointsSpent,
                    PointsEarnedThisMonth = pointsEarnedThisMonth,
                    PointsSpentThisMonth = pointsSpentThisMonth,
                    CurrentLevel = userProgress.Level,
                    CurrentStreak = userProgress.CurrentStreak,
                    LongestStreak = userProgress.LongestStreak,
                    UserTier = userProgress.UserTier,
                    TotalTransactions = allTransactions.Count,
                    PointsByTransactionType = pointsByType,
                    AveragePointsPerDay = pointsEarnedThisMonth / 30.0,
                    FirstTransactionDate = allTransactions.FirstOrDefault()?.CreatedAt,
                    LastTransactionDate = allTransactions.LastOrDefault()?.CreatedAt,
                    CurrentPointsRank = currentPointsRank,
                    TotalPointsRank = totalPointsRank,
                    IsRecentlyActive = userProgress.LastActivityDate >= DateTime.UtcNow.AddDays(-7),
                    DaysSinceLastActivity = userProgress.LastActivityDate.HasValue 
                        ? (int)(DateTime.UtcNow - userProgress.LastActivityDate.Value).TotalDays 
                        : int.MaxValue
                };

                return statistics;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving points statistics for user {UserId}", userId);
                return new UserPointsStatistics();
            }
        }

        /// <summary>
        /// Calculates the points threshold for the next level
        /// </summary>
        private int CalculateNextLevelThreshold(int level)
        {
            // Progressive level system: each level requires more points
            return 100 + (level - 1) * 50; // Level 1: 100, Level 2: 150, Level 3: 200, etc.
        }
    }
} 