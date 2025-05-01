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
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.DTOs.Tasks;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Services.Interfaces
{
    public interface ITaskStatisticsService
    {
        Task<TaskStatisticsDTO> GetTaskStatisticsAsync(int userId);
        Task<ProductivityAnalyticsDTO> GetProductivityAnalyticsAsync(int userId, DateTime? startDate = null, DateTime? endDate = null);
        Task<double> GetTaskCompletionRateAsync(int userId);
        Task<Dictionary<TaskItemStatus, int>> GetTasksByStatusDistributionAsync(int userId);
        Task<TimeSpan> GetTaskCompletionTimeAverageAsync(int userId);
        Task<Dictionary<int, int>> GetTasksByPriorityDistributionAsync(int userId);
        Task<List<CategoryActivityDTO>> GetMostActiveCategoriesAsync(int userId, int limit);
        Task ValidateUserAccess(int taskId, int userId);
    }
} 