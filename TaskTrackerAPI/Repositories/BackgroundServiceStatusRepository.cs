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
using TaskTrackerAPI.Data;
using TaskTrackerAPI.Models.BackgroundServices;
using TaskTrackerAPI.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TaskTrackerAPI.Repositories
{
    /// <summary>
    /// Repository for background service status management
    /// </summary>
    public class BackgroundServiceStatusRepository : IBackgroundServiceStatusRepository
    {
        private readonly ApplicationDbContext _context;

        public BackgroundServiceStatusRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Gets all background service status records
        /// </summary>
        public async Task<IEnumerable<BackgroundServiceStatus>> GetAllAsync()
        {
            return await _context.BackgroundServiceStatuses
                .OrderBy(s => s.ServiceName)
                .ToListAsync();
        }

        /// <summary>
        /// Gets background service status by service name
        /// </summary>
        public async Task<BackgroundServiceStatus?> GetByServiceNameAsync(string serviceName)
        {
            return await _context.BackgroundServiceStatuses
                .FirstOrDefaultAsync(s => s.ServiceName == serviceName);
        }

        /// <summary>
        /// Creates or updates background service status
        /// </summary>
        public async Task<BackgroundServiceStatus> UpsertAsync(BackgroundServiceStatus status)
        {
            BackgroundServiceStatus? existingStatus = await GetByServiceNameAsync(status.ServiceName);
            
            if (existingStatus != null)
            {
                // Update existing status
                existingStatus.Status = status.Status;
                existingStatus.Message = status.Message;
                existingStatus.LastRun = status.LastRun;
                existingStatus.NextRun = status.NextRun;
                existingStatus.IsHealthy = status.IsHealthy;
                existingStatus.ExecutionCount = status.ExecutionCount;
                existingStatus.SuccessCount = status.SuccessCount;
                existingStatus.ErrorCount = status.ErrorCount;
                existingStatus.SuccessRate = status.SuccessRate;
                existingStatus.UpdatedAt = DateTime.UtcNow;
                
                _context.BackgroundServiceStatuses.Update(existingStatus);
                await _context.SaveChangesAsync();
                return existingStatus;
            }
            else
            {
                // Create new status
                status.CreatedAt = DateTime.UtcNow;
                status.UpdatedAt = DateTime.UtcNow;
                
                _context.BackgroundServiceStatuses.Add(status);
                await _context.SaveChangesAsync();
                return status;
            }
        }

        /// <summary>
        /// Creates a service execution record
        /// </summary>
        public async Task<BackgroundServiceExecution> CreateExecutionAsync(BackgroundServiceExecution execution)
        {
            execution.ExecutionTime = DateTime.UtcNow;
            
            _context.BackgroundServiceExecutions.Add(execution);
            await _context.SaveChangesAsync();
            return execution;
        }

        /// <summary>
        /// Gets execution history for a service
        /// </summary>
        public async Task<IEnumerable<BackgroundServiceExecution>> GetExecutionHistoryAsync(string serviceName, int count = 10)
        {
            return await _context.BackgroundServiceExecutions
                .Where(e => e.ServiceName == serviceName)
                .OrderByDescending(e => e.ExecutionTime)
                .Take(count)
                .ToListAsync();
        }

        /// <summary>
        /// Gets all maintenance notifications
        /// </summary>
        public async Task<IEnumerable<SystemMaintenanceNotification>> GetMaintenanceNotificationsAsync(bool activeOnly = true)
        {
            IQueryable<SystemMaintenanceNotification> query = _context.SystemMaintenanceNotifications;
            
            if (activeOnly)
            {
                query = query.Where(n => n.IsActive);
            }
            
            return await query
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();
        }

        /// <summary>
        /// Creates a maintenance notification
        /// </summary>
        public async Task<SystemMaintenanceNotification> CreateMaintenanceNotificationAsync(SystemMaintenanceNotification notification)
        {
            notification.CreatedAt = DateTime.UtcNow;
            
            _context.SystemMaintenanceNotifications.Add(notification);
            await _context.SaveChangesAsync();
            return notification;
        }

        /// <summary>
        /// Gets optimization recommendations
        /// </summary>
        public async Task<IEnumerable<SystemOptimizationRecommendation>> GetOptimizationRecommendationsAsync()
        {
            return await _context.SystemOptimizationRecommendations
                .Where(r => !r.IsImplemented)
                .OrderByDescending(r => r.Priority)
                .ThenByDescending(r => r.CreatedAt)
                .ToListAsync();
        }

        /// <summary>
        /// Creates an optimization recommendation
        /// </summary>
        public async Task<SystemOptimizationRecommendation> CreateOptimizationRecommendationAsync(SystemOptimizationRecommendation recommendation)
        {
            recommendation.CreatedAt = DateTime.UtcNow;
            
            _context.SystemOptimizationRecommendations.Add(recommendation);
            await _context.SaveChangesAsync();
            return recommendation;
        }

        /// <summary>
        /// Gets execution statistics for metrics
        /// </summary>
        public async Task<Dictionary<string, object>> GetExecutionStatisticsAsync(DateTime? fromDate = null, DateTime? toDate = null)
        {
            DateTime startDate = fromDate ?? DateTime.UtcNow.AddDays(-30);
            DateTime endDate = toDate ?? DateTime.UtcNow;
            
            List<BackgroundServiceExecution> executions = await _context.BackgroundServiceExecutions
                .Where(e => e.ExecutionTime >= startDate && e.ExecutionTime <= endDate)
                .ToListAsync();
            
            List<BackgroundServiceStatus> statuses = await _context.BackgroundServiceStatuses.ToListAsync();
            
            int totalExecutions = executions.Count;
            int successfulExecutions = executions.Count(e => e.Success);
            int failedExecutions = totalExecutions - successfulExecutions;
            double overallSuccessRate = totalExecutions > 0 ? (double)successfulExecutions / totalExecutions * 100 : 0;
            
            DateTime? lastExecutionTime = executions.Count > 0 ? executions.Max(e => e.ExecutionTime) : default;
            
            Dictionary<string, object> stats = new Dictionary<string, object>
            {
                ["TotalServices"] = statuses.Count,
                ["RunningServices"] = statuses.Count(s => s.Status == "Running"),
                ["ErrorServices"] = statuses.Count(s => s.Status == "Error"),
                ["IdleServices"] = statuses.Count(s => s.Status == "Idle"),
                ["TotalExecutions"] = totalExecutions,
                ["SuccessfulExecutions"] = successfulExecutions,
                ["FailedExecutions"] = failedExecutions,
                ["OverallSuccessRate"] = overallSuccessRate,
                ["LastExecutionTime"] = lastExecutionTime
            };
            
            return stats;
        }
    }
} 