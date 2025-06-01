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
    /// Repository interface for points and user progress management
    /// </summary>
    public interface IPointsRepository
    {
        /// <summary>
        /// Gets the user progress record for a user
        /// </summary>
        /// <param name="userId">ID of the user</param>
        /// <returns>User progress if found</returns>
        Task<UserProgress?> GetUserProgressAsync(int userId);

        /// <summary>
        /// Creates a new user progress record
        /// </summary>
        /// <param name="userProgress">User progress to create</param>
        /// <returns>Created user progress</returns>
        Task<UserProgress> CreateUserProgressAsync(UserProgress userProgress);

        /// <summary>
        /// Updates an existing user progress record
        /// </summary>
        /// <param name="userProgress">User progress to update</param>
        /// <returns>Updated user progress</returns>
        Task<UserProgress> UpdateUserProgressAsync(UserProgress userProgress);

        /// <summary>
        /// Adds points to a user and creates a transaction record
        /// </summary>
        /// <param name="userId">ID of the user</param>
        /// <param name="points">Number of points to add</param>
        /// <param name="transactionType">Type of transaction</param>
        /// <param name="description">Description of the transaction</param>
        /// <param name="taskId">Optional related task ID</param>
        /// <param name="templateId">Optional related template ID</param>
        /// <returns>Created point transaction</returns>
        Task<PointTransaction> AddPointsAsync(int userId, int points, string transactionType, string description, int? taskId = null, int? templateId = null);

        /// <summary>
        /// Deducts points from a user and creates a transaction record
        /// </summary>
        /// <param name="userId">ID of the user</param>
        /// <param name="points">Number of points to deduct</param>
        /// <param name="transactionType">Type of transaction</param>
        /// <param name="description">Description of the transaction</param>
        /// <param name="taskId">Optional related task ID</param>
        /// <param name="templateId">Optional related template ID</param>
        /// <returns>Created point transaction</returns>
        Task<PointTransaction> DeductPointsAsync(int userId, int points, string transactionType, string description, int? taskId = null, int? templateId = null);

        /// <summary>
        /// Gets the current points balance for a user
        /// </summary>
        /// <param name="userId">ID of the user</param>
        /// <returns>Current points balance</returns>
        Task<int> GetUserPointsAsync(int userId);

        /// <summary>
        /// Checks if a user has sufficient points for a transaction
        /// </summary>
        /// <param name="userId">ID of the user</param>
        /// <param name="requiredPoints">Number of points required</param>
        /// <returns>True if the user has sufficient points</returns>
        Task<bool> HasSufficientPointsAsync(int userId, int requiredPoints);

        /// <summary>
        /// Gets point transaction history for a user
        /// </summary>
        /// <param name="userId">ID of the user</param>
        /// <param name="limit">Maximum number of transactions to return</param>
        /// <returns>Collection of point transactions</returns>
        Task<IEnumerable<PointTransaction>> GetTransactionHistoryAsync(int userId, int limit = 50);

        /// <summary>
        /// Gets point transactions for a specific date range
        /// </summary>
        /// <param name="userId">ID of the user</param>
        /// <param name="fromDate">Start date</param>
        /// <param name="toDate">End date</param>
        /// <returns>Collection of point transactions</returns>
        Task<IEnumerable<PointTransaction>> GetTransactionsByDateRangeAsync(int userId, DateTime fromDate, DateTime toDate);

        /// <summary>
        /// Gets point transactions by transaction type
        /// </summary>
        /// <param name="userId">ID of the user</param>
        /// <param name="transactionType">Type of transaction</param>
        /// <returns>Collection of point transactions</returns>
        Task<IEnumerable<PointTransaction>> GetTransactionsByTypeAsync(int userId, string transactionType);

        /// <summary>
        /// Gets a specific point transaction by ID
        /// </summary>
        /// <param name="transactionId">ID of the transaction</param>
        /// <returns>Point transaction if found</returns>
        Task<PointTransaction?> GetTransactionByIdAsync(int transactionId);

        /// <summary>
        /// Gets total points earned by a user (lifetime)
        /// </summary>
        /// <param name="userId">ID of the user</param>
        /// <returns>Total points earned</returns>
        Task<int> GetTotalPointsEarnedAsync(int userId);

        /// <summary>
        /// Gets total points spent by a user (lifetime)
        /// </summary>
        /// <param name="userId">ID of the user</param>
        /// <returns>Total points spent</returns>
        Task<int> GetTotalPointsSpentAsync(int userId);

        /// <summary>
        /// Gets points earned in the last 30 days
        /// </summary>
        /// <param name="userId">ID of the user</param>
        /// <returns>Points earned this month</returns>
        Task<int> GetPointsEarnedThisMonthAsync(int userId);

        /// <summary>
        /// Gets the leaderboard of top users by current points
        /// </summary>
        /// <param name="limit">Number of top users to return</param>
        /// <returns>Collection of user progress records</returns>
        Task<IEnumerable<UserProgress>> GetPointsLeaderboardAsync(int limit = 10);

        /// <summary>
        /// Gets the leaderboard of top users by total points earned
        /// </summary>
        /// <param name="limit">Number of top users to return</param>
        /// <returns>Collection of user progress records</returns>
        Task<IEnumerable<UserProgress>> GetTotalPointsLeaderboardAsync(int limit = 10);

        /// <summary>
        /// Checks if a user has logged in today (has a daily login transaction)
        /// </summary>
        /// <param name="userId">ID of the user</param>
        /// <param name="date">Date to check</param>
        /// <returns>True if the user has logged in on the specified date</returns>
        Task<bool> HasDailyLoginTransactionAsync(int userId, DateTime date);

        /// <summary>
        /// Updates the user's activity streak
        /// </summary>
        /// <param name="userId">ID of the user</param>
        /// <returns>Updated user progress</returns>
        Task<UserProgress> UpdateActivityStreakAsync(int userId);

        /// <summary>
        /// Gets user statistics including points breakdown
        /// </summary>
        /// <param name="userId">ID of the user</param>
        /// <returns>User points statistics</returns>
        Task<UserPointsStatistics> GetUserPointsStatisticsAsync(int userId);
    }
} 