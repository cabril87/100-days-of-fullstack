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
using TaskTrackerAPI.DTOs.Dashboard;

namespace TaskTrackerAPI.Services.Interfaces
{
    /// <summary>
    /// Service interface for unified dashboard data aggregation
    /// Provides comprehensive dashboard data in a single service call
    /// Designed to optimize API performance and reduce client-side requests
    /// Enterprise-grade dashboard data management
    /// </summary>
    public interface IUnifiedDashboardService
    {
        /// <summary>
        /// Gets comprehensive dashboard data for the specified user
        /// Aggregates data from multiple services to provide complete dashboard state
        /// </summary>
        /// <param name="userId">The unique identifier of the user</param>
        /// <returns>Unified dashboard response containing all necessary dashboard data</returns>
        /// <exception cref="System.ArgumentException">Thrown when userId is invalid</exception>
        /// <exception cref="System.UnauthorizedAccessException">Thrown when user access is denied</exception>
        /// <exception cref="System.Exception">Thrown when data aggregation fails</exception>
        Task<UnifiedDashboardResponseDTO> GetUnifiedDashboardDataAsync(int userId);

        /// <summary>
        /// Gets dashboard statistics only (lightweight version)
        /// Provides quick access to key metrics without full data aggregation
        /// </summary>
        /// <param name="userId">The unique identifier of the user</param>
        /// <returns>Dashboard statistics data</returns>
        Task<DashboardStatsDTO> GetDashboardStatsAsync(int userId);

        /// <summary>
        /// Gets gamification data only for targeted updates
        /// Provides access to gamification state without full dashboard refresh
        /// </summary>
        /// <param name="userId">The unique identifier of the user</param>
        /// <returns>Comprehensive gamification data</returns>
        Task<GamificationDataDTO> GetGamificationDataAsync(int userId);

        /// <summary>
        /// Gets family dashboard data only for family-focused views
        /// Provides family-specific data without full dashboard aggregation
        /// </summary>
        /// <param name="userId">The unique identifier of the user</param>
        /// <returns>Family dashboard data</returns>
        Task<FamilyDashboardDataDTO> GetFamilyDashboardDataAsync(int userId);

        /// <summary>
        /// Gets recent tasks data only for task-focused widgets
        /// Provides task-specific data without full dashboard refresh
        /// </summary>
        /// <param name="userId">The unique identifier of the user</param>
        /// <returns>Recent tasks data</returns>
        Task<RecentTasksDataDTO> GetRecentTasksDataAsync(int userId);

        /// <summary>
        /// Validates user access and permissions for dashboard data
        /// Ensures user has appropriate permissions before data aggregation
        /// </summary>
        /// <param name="userId">The unique identifier of the user</param>
        /// <returns>True if user has valid access, false otherwise</returns>
        Task<bool> ValidateUserAccessAsync(int userId);

        /// <summary>
        /// Invalidates cached dashboard data for the specified user
        /// Forces fresh data retrieval on next dashboard request
        /// </summary>
        /// <param name="userId">The unique identifier of the user</param>
        /// <returns>True if cache invalidation was successful</returns>
        Task<bool> InvalidateDashboardCacheAsync(int userId);
    }
} 