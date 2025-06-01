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
using TaskTrackerAPI.Models.BackgroundServices;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace TaskTrackerAPI.Repositories.Interfaces
{
    /// <summary>
    /// Repository interface for background service status management
    /// </summary>
    public interface IBackgroundServiceStatusRepository
    {
        /// <summary>
        /// Gets all background service status records
        /// </summary>
        Task<IEnumerable<BackgroundServiceStatus>> GetAllAsync();
        
        /// <summary>
        /// Gets background service status by service name
        /// </summary>
        Task<BackgroundServiceStatus?> GetByServiceNameAsync(string serviceName);
        
        /// <summary>
        /// Creates or updates background service status
        /// </summary>
        Task<BackgroundServiceStatus> UpsertAsync(BackgroundServiceStatus status);
        
        /// <summary>
        /// Creates a service execution record
        /// </summary>
        Task<BackgroundServiceExecution> CreateExecutionAsync(BackgroundServiceExecution execution);
        
        /// <summary>
        /// Gets execution history for a service
        /// </summary>
        Task<IEnumerable<BackgroundServiceExecution>> GetExecutionHistoryAsync(string serviceName, int count = 10);
        
        /// <summary>
        /// Gets all maintenance notifications
        /// </summary>
        Task<IEnumerable<SystemMaintenanceNotification>> GetMaintenanceNotificationsAsync(bool activeOnly = true);
        
        /// <summary>
        /// Creates a maintenance notification
        /// </summary>
        Task<SystemMaintenanceNotification> CreateMaintenanceNotificationAsync(SystemMaintenanceNotification notification);
        
        /// <summary>
        /// Gets optimization recommendations
        /// </summary>
        Task<IEnumerable<SystemOptimizationRecommendation>> GetOptimizationRecommendationsAsync();
        
        /// <summary>
        /// Creates an optimization recommendation
        /// </summary>
        Task<SystemOptimizationRecommendation> CreateOptimizationRecommendationAsync(SystemOptimizationRecommendation recommendation);
        
        /// <summary>
        /// Gets execution statistics for metrics
        /// </summary>
        Task<Dictionary<string, object>> GetExecutionStatisticsAsync(DateTime? fromDate = null, DateTime? toDate = null);
    }
} 