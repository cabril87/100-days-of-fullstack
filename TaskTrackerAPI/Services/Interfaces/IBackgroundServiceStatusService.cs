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
using TaskTrackerAPI.DTOs.BackgroundServices;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace TaskTrackerAPI.Services.Interfaces
{
    /// <summary>
    /// Service for managing background service status and monitoring
    /// </summary>
    public interface IBackgroundServiceStatusService
    {
        /// <summary>
        /// Gets the status of all background services
        /// </summary>
        Task<IEnumerable<BackgroundServiceStatusDTO>> GetAllServiceStatusAsync();
        
        /// <summary>
        /// Gets the status of a specific background service
        /// </summary>
        Task<BackgroundServiceStatusDTO?> GetServiceStatusAsync(string serviceName);
        
        /// <summary>
        /// Updates the status of a background service
        /// </summary>
        Task UpdateServiceStatusAsync(string serviceName, string status, string? message = null, DateTime? lastRun = null);
        
        /// <summary>
        /// Records a background service execution result
        /// </summary>
        Task RecordServiceExecutionAsync(string serviceName, bool success, string? details = null, int? recordsProcessed = null);
        
        /// <summary>
        /// Gets execution history for a service
        /// </summary>
        Task<IEnumerable<BackgroundServiceExecutionDTO>> GetServiceExecutionHistoryAsync(string serviceName, int count = 10);
        
        /// <summary>
        /// Gets system maintenance notifications
        /// </summary>
        Task<IEnumerable<SystemMaintenanceNotificationDTO>> GetMaintenanceNotificationsAsync(bool activeOnly = true);
        
        /// <summary>
        /// Creates a system maintenance notification
        /// </summary>
        Task<SystemMaintenanceNotificationDTO> CreateMaintenanceNotificationAsync(CreateMaintenanceNotificationDTO dto);
        
        /// <summary>
        /// Gets automated system optimization recommendations
        /// </summary>
        Task<IEnumerable<SystemOptimizationRecommendationDTO>> GetOptimizationRecommendationsAsync();
        
        /// <summary>
        /// Gets background service metrics summary
        /// </summary>
        Task<BackgroundServiceMetricsDTO> GetServiceMetricsAsync(DateTime? fromDate = null, DateTime? toDate = null);
    }
} 