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
using TaskTrackerAPI.DTOs.Activity;

namespace TaskTrackerAPI.Services.Interfaces
{
    /// <summary>
    /// Interface for user activity tracking and analytics
    /// </summary>
    public interface IUserActivityService
    {
        /// <summary>
        /// Gets recent activities for a user with filtering and pagination
        /// </summary>
        /// <param name="userId">User ID</param>
        /// <param name="filter">Filter criteria</param>
        /// <returns>Paginated activity results</returns>
        Task<UserActivityPagedResultDTO> GetRecentActivitiesAsync(int userId, UserActivityFilterDTO filter);

        /// <summary>
        /// Gets activity statistics for a user
        /// </summary>
        /// <param name="userId">User ID</param>
        /// <returns>Activity statistics</returns>
        Task<UserActivityStatsDTO> GetActivityStatsAsync(int userId);

        /// <summary>
        /// Gets activity timeline data for charts
        /// </summary>
        /// <param name="userId">User ID</param>
        /// <param name="dateRange">Date range for the timeline (month, week, etc.)</param>
        /// <param name="groupBy">How to group the data (day, week, etc.)</param>
        /// <returns>Timeline data</returns>
        Task<UserActivityTimelineDTO> GetActivityTimelineAsync(int userId, string dateRange = "month", string groupBy = "day");
    }
} 