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
using TaskTrackerAPI.Models.BackgroundServices;
using TaskTrackerAPI.Repositories.Interfaces;
using TaskTrackerAPI.Services.Interfaces;
using AutoMapper;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TaskTrackerAPI.Services
{
    /// <summary>
    /// Service for managing background service status and monitoring
    /// </summary>
    public class BackgroundServiceStatusService : IBackgroundServiceStatusService
    {
        private readonly IBackgroundServiceStatusRepository _repository;
        private readonly IMapper _mapper;
        private readonly ILogger<BackgroundServiceStatusService> _logger;

        public BackgroundServiceStatusService(
            IBackgroundServiceStatusRepository repository,
            IMapper mapper,
            ILogger<BackgroundServiceStatusService> logger)
        {
            _repository = repository;
            _mapper = mapper;
            _logger = logger;
        }

        /// <summary>
        /// Gets the status of all background services
        /// </summary>
        public async Task<IEnumerable<BackgroundServiceStatusDTO>> GetAllServiceStatusAsync()
        {
            try
            {
                IEnumerable<BackgroundServiceStatus> statuses = await _repository.GetAllAsync();
                return _mapper.Map<IEnumerable<BackgroundServiceStatusDTO>>(statuses);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all service status");
                throw;
            }
        }

        /// <summary>
        /// Gets the status of a specific background service
        /// </summary>
        public async Task<BackgroundServiceStatusDTO?> GetServiceStatusAsync(string serviceName)
        {
            try
            {
                BackgroundServiceStatus? status = await _repository.GetByServiceNameAsync(serviceName);
                return status != null ? _mapper.Map<BackgroundServiceStatusDTO>(status) : null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting service status for {ServiceName}", serviceName);
                throw;
            }
        }

        /// <summary>
        /// Updates the status of a background service
        /// </summary>
        public async Task UpdateServiceStatusAsync(string serviceName, string status, string? message = null, DateTime? lastRun = null)
        {
            try
            {
                BackgroundServiceStatus? existingStatus = await _repository.GetByServiceNameAsync(serviceName);
                
                BackgroundServiceStatus serviceStatus;
                if (existingStatus != null)
                {
                    // Update existing status
                    existingStatus.Status = status;
                    existingStatus.Message = message;
                    existingStatus.LastRun = lastRun ?? DateTime.UtcNow;
                    existingStatus.IsHealthy = status != "Error";
                    existingStatus.UpdatedAt = DateTime.UtcNow;
                    serviceStatus = existingStatus;
                }
                else
                {
                    // Create new status
                    serviceStatus = new BackgroundServiceStatus
                    {
                        ServiceName = serviceName,
                        Status = status,
                        Message = message,
                        LastRun = lastRun ?? DateTime.UtcNow,
                        IsHealthy = status != "Error",
                        ExecutionCount = 0,
                        SuccessCount = 0,
                        ErrorCount = 0,
                        SuccessRate = 0m
                    };
                }
                
                await _repository.UpsertAsync(serviceStatus);
                _logger.LogInformation("Updated service status for {ServiceName}: {Status}", serviceName, status);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating service status for {ServiceName}", serviceName);
                throw;
            }
        }

        /// <summary>
        /// Records a background service execution result
        /// </summary>
        public async Task RecordServiceExecutionAsync(string serviceName, bool success, string? details = null, int? recordsProcessed = null)
        {
            try
            {
                // Create execution record
                BackgroundServiceExecution execution = new BackgroundServiceExecution
                {
                    ServiceName = serviceName,
                    Success = success,
                    Details = details,
                    RecordsProcessed = recordsProcessed,
                    ErrorMessage = success ? null : details,
                    ExecutionTime = DateTime.UtcNow
                };
                
                await _repository.CreateExecutionAsync(execution);
                
                // Update service status statistics
                BackgroundServiceStatus? serviceStatus = await _repository.GetByServiceNameAsync(serviceName);
                if (serviceStatus != null)
                {
                    serviceStatus.ExecutionCount++;
                    if (success)
                    {
                        serviceStatus.SuccessCount++;
                    }
                    else
                    {
                        serviceStatus.ErrorCount++;
                    }
                    
                    // Calculate success rate
                    serviceStatus.SuccessRate = serviceStatus.ExecutionCount > 0 
                        ? (decimal)serviceStatus.SuccessCount / serviceStatus.ExecutionCount * 100m 
                        : 0m;
                    
                    serviceStatus.IsHealthy = serviceStatus.SuccessRate >= 80m; // 80% threshold for healthy
                    serviceStatus.LastRun = DateTime.UtcNow;
                    serviceStatus.Status = success ? "Running" : "Error";
                    
                    await _repository.UpsertAsync(serviceStatus);
                }
                
                _logger.LogInformation("Recorded execution for {ServiceName}: Success={Success}, Records={Records}", 
                    serviceName, success, recordsProcessed);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error recording service execution for {ServiceName}", serviceName);
                throw;
            }
        }

        /// <summary>
        /// Gets execution history for a service
        /// </summary>
        public async Task<IEnumerable<BackgroundServiceExecutionDTO>> GetServiceExecutionHistoryAsync(string serviceName, int count = 10)
        {
            try
            {
                IEnumerable<BackgroundServiceExecution> executions = await _repository.GetExecutionHistoryAsync(serviceName, count);
                return _mapper.Map<IEnumerable<BackgroundServiceExecutionDTO>>(executions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting execution history for {ServiceName}", serviceName);
                throw;
            }
        }

        /// <summary>
        /// Gets system maintenance notifications
        /// </summary>
        public async Task<IEnumerable<SystemMaintenanceNotificationDTO>> GetMaintenanceNotificationsAsync(bool activeOnly = true)
        {
            try
            {
                IEnumerable<SystemMaintenanceNotification> notifications = await _repository.GetMaintenanceNotificationsAsync(activeOnly);
                return _mapper.Map<IEnumerable<SystemMaintenanceNotificationDTO>>(notifications);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting maintenance notifications");
                throw;
            }
        }

        /// <summary>
        /// Creates a system maintenance notification
        /// </summary>
        public async Task<SystemMaintenanceNotificationDTO> CreateMaintenanceNotificationAsync(CreateMaintenanceNotificationDTO dto)
        {
            try
            {
                SystemMaintenanceNotification notification = _mapper.Map<SystemMaintenanceNotification>(dto);
                SystemMaintenanceNotification createdNotification = await _repository.CreateMaintenanceNotificationAsync(notification);
                
                _logger.LogInformation("Created maintenance notification: {Title}", dto.Title);
                return _mapper.Map<SystemMaintenanceNotificationDTO>(createdNotification);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating maintenance notification");
                throw;
            }
        }

        /// <summary>
        /// Gets automated system optimization recommendations
        /// </summary>
        public async Task<IEnumerable<SystemOptimizationRecommendationDTO>> GetOptimizationRecommendationsAsync()
        {
            try
            {
                IEnumerable<SystemOptimizationRecommendation> recommendations = await _repository.GetOptimizationRecommendationsAsync();
                return _mapper.Map<IEnumerable<SystemOptimizationRecommendationDTO>>(recommendations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting optimization recommendations");
                throw;
            }
        }

        /// <summary>
        /// Gets background service metrics summary
        /// </summary>
        public async Task<BackgroundServiceMetricsDTO> GetServiceMetricsAsync(DateTime? fromDate = null, DateTime? toDate = null)
        {
            try
            {
                Dictionary<string, object> stats = await _repository.GetExecutionStatisticsAsync(fromDate, toDate);
                IEnumerable<BackgroundServiceStatus> allStatuses = await _repository.GetAllAsync();
                
                BackgroundServiceMetricsDTO metrics = new BackgroundServiceMetricsDTO
                {
                    TotalServices = (int)stats["TotalServices"],
                    RunningServices = (int)stats["RunningServices"],
                    ErrorServices = (int)stats["ErrorServices"],
                    IdleServices = (int)stats["IdleServices"],
                    TotalExecutions = (int)stats["TotalExecutions"],
                    SuccessfulExecutions = (int)stats["SuccessfulExecutions"],
                    FailedExecutions = (int)stats["FailedExecutions"],
                    OverallSuccessRate = (double)stats["OverallSuccessRate"],
                    LastExecutionTime = stats["LastExecutionTime"] as DateTime?,
                    GeneratedAt = DateTime.UtcNow
                };
                
                // Add individual service metrics
                foreach (BackgroundServiceStatus status in allStatuses)
                {
                    ServiceMetricDTO serviceMetric = new ServiceMetricDTO
                    {
                        ServiceName = status.ServiceName,
                        ExecutionCount = status.ExecutionCount,
                        SuccessCount = status.SuccessCount,
                        ErrorCount = status.ErrorCount,
                        SuccessRate = (double)status.SuccessRate,
                        LastExecution = status.LastRun,
                        Status = status.Status
                    };
                    
                    metrics.ServiceMetrics.Add(serviceMetric);
                }
                
                return metrics;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting service metrics");
                throw;
            }
        }
    }
} 