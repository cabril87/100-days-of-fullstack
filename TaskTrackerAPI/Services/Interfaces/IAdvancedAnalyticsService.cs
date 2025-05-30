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
using TaskTrackerAPI.DTOs.Analytics;

namespace TaskTrackerAPI.Services.Interfaces
{
    /// <summary>
    /// Interface for advanced analytics service
    /// </summary>
    public interface IAdvancedAnalyticsService
    {
        /// <summary>
        /// Get comprehensive analytics data for a user
        /// </summary>
        /// <param name="userId">User ID</param>
        /// <param name="startDate">Start date for analysis</param>
        /// <param name="endDate">End date for analysis</param>
        /// <returns>Advanced analytics data</returns>
        Task<AdvancedAnalyticsDTO> GetAdvancedAnalyticsAsync(int userId, DateTime? startDate = null, DateTime? endDate = null);

        /// <summary>
        /// Get task trends over time
        /// </summary>
        /// <param name="userId">User ID</param>
        /// <param name="startDate">Start date</param>
        /// <param name="endDate">End date</param>
        /// <param name="granularity">Data granularity (daily, weekly, monthly)</param>
        /// <returns>Task trend data</returns>
        Task<List<TaskTrendDTO>> GetTaskTrendsAsync(int userId, DateTime startDate, DateTime endDate, string granularity = "daily");

        /// <summary>
        /// Get productivity metrics for a user
        /// </summary>
        /// <param name="userId">User ID</param>
        /// <param name="startDate">Start date</param>
        /// <param name="endDate">End date</param>
        /// <returns>Productivity metrics</returns>
        Task<ProductivityMetricsDTO> GetProductivityMetricsAsync(int userId, DateTime startDate, DateTime endDate);

        /// <summary>
        /// Get family analytics data
        /// </summary>
        /// <param name="familyId">Family ID</param>
        /// <param name="startDate">Start date</param>
        /// <param name="endDate">End date</param>
        /// <returns>Family analytics data</returns>
        Task<FamilyAnalyticsDTO> GetFamilyAnalyticsAsync(int familyId, DateTime startDate, DateTime endDate);

        /// <summary>
        /// Get comparative analytics between users or time periods
        /// </summary>
        /// <param name="userId">User ID</param>
        /// <param name="compareUserIds">User IDs to compare with</param>
        /// <param name="startDate">Start date</param>
        /// <param name="endDate">End date</param>
        /// <param name="compareStartDate">Comparison period start date</param>
        /// <param name="compareEndDate">Comparison period end date</param>
        /// <returns>Comparative analytics data</returns>
        Task<object> GetComparativeAnalyticsAsync(int userId, List<int>? compareUserIds = null, 
            DateTime? startDate = null, DateTime? endDate = null, 
            DateTime? compareStartDate = null, DateTime? compareEndDate = null);

        /// <summary>
        /// Get time-range specific analytics
        /// </summary>
        /// <param name="userId">User ID</param>
        /// <param name="timeRange">Time range (7d, 30d, 90d, 1y)</param>
        /// <returns>Time-range analytics data</returns>
        Task<AdvancedAnalyticsDTO> GetTimeRangeAnalyticsAsync(int userId, string timeRange);

        /// <summary>
        /// Get time analysis data
        /// </summary>
        /// <param name="userId">User ID</param>
        /// <param name="startDate">Start date</param>
        /// <param name="endDate">End date</param>
        /// <returns>Time analysis data</returns>
        Task<TimeAnalysisDTO> GetTimeAnalysisAsync(int userId, DateTime startDate, DateTime endDate);

        /// <summary>
        /// Get category breakdown analytics
        /// </summary>
        /// <param name="userId">User ID</param>
        /// <param name="startDate">Start date</param>
        /// <param name="endDate">End date</param>
        /// <returns>Category breakdown data</returns>
        Task<List<CategoryBreakdownDTO>> GetCategoryBreakdownAsync(int userId, DateTime startDate, DateTime endDate);
    }
} 