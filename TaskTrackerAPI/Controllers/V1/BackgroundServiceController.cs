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
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.Controllers.V2;
using TaskTrackerAPI.DTOs.BackgroundServices;
using TaskTrackerAPI.Services.Interfaces;
using TaskTrackerAPI.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TaskTrackerAPI.Attributes;

namespace TaskTrackerAPI.Controllers.V1
{
    /// <summary>
    /// Controller for background service status and monitoring
    /// </summary>
    [ApiController]
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/[controller]")]
    public class BackgroundServiceController : BaseApiController
    {
        private readonly IBackgroundServiceStatusService _backgroundServiceStatusService;
        private readonly ILogger<BackgroundServiceController> _logger;

        public BackgroundServiceController(
            IBackgroundServiceStatusService backgroundServiceStatusService,
            ILogger<BackgroundServiceController> logger)
        {
            _backgroundServiceStatusService = backgroundServiceStatusService;
            _logger = logger;
        }

        /// <summary>
        /// Gets the status of all background services (Admin only)
        /// </summary>
        [HttpGet("status")]
        [Authorize(Roles = "Admin")]
        [RateLimit(30, 60)]
        public async Task<ActionResult<ApiResponse<IEnumerable<BackgroundServiceStatusDTO>>>> GetAllServiceStatus()
        {
            try
            {
                IEnumerable<BackgroundServiceStatusDTO> statuses = await _backgroundServiceStatusService.GetAllServiceStatusAsync();
                return ApiOk(statuses, "Background service statuses retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving background service statuses");
                return ApiServerError<IEnumerable<BackgroundServiceStatusDTO>>("An error occurred while retrieving service statuses");
            }
        }

        /// <summary>
        /// Gets the status of a specific background service (Admin only)
        /// </summary>
        [HttpGet("status/{serviceName}")]
        [Authorize(Roles = "Admin")]
        [RateLimit(30, 60)]
        public async Task<ActionResult<ApiResponse<BackgroundServiceStatusDTO>>> GetServiceStatus(string serviceName)
        {
            try
            {
                BackgroundServiceStatusDTO? status = await _backgroundServiceStatusService.GetServiceStatusAsync(serviceName);

                if (status == null)
                {
                    return ApiNotFound<BackgroundServiceStatusDTO>($"Service '{serviceName}' not found");
                }

                return ApiOk(status, "Service status retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving service status for {ServiceName}", serviceName);
                return ApiServerError<BackgroundServiceStatusDTO>("An error occurred while retrieving service status");
            }
        }

        /// <summary>
        /// Gets execution history for a specific service (Admin only)
        /// </summary>
        [HttpGet("history/{serviceName}")]
        [Authorize(Roles = "Admin")]
        [RateLimit(20, 60)]
        public async Task<ActionResult<ApiResponse<IEnumerable<BackgroundServiceExecutionDTO>>>> GetServiceExecutionHistory(
            string serviceName,
            [FromQuery] int count = 10)
        {
            try
            {
                if (count <= 0 || count > 100)
                {
                    return ApiBadRequest<IEnumerable<BackgroundServiceExecutionDTO>>("Count must be between 1 and 100");
                }

                IEnumerable<BackgroundServiceExecutionDTO> history = await _backgroundServiceStatusService.GetServiceExecutionHistoryAsync(serviceName, count);
                return ApiOk(history, "Service execution history retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving execution history for {ServiceName}", serviceName);
                return ApiServerError<IEnumerable<BackgroundServiceExecutionDTO>>("An error occurred while retrieving execution history");
            }
        }

        /// <summary>
        /// Gets system maintenance notifications
        /// </summary>
        [HttpGet("maintenance")]
        [RateLimit(30, 60)]
        public async Task<ActionResult<ApiResponse<IEnumerable<SystemMaintenanceNotificationDTO>>>> GetMaintenanceNotifications(
            [FromQuery] bool activeOnly = true)
        {
            try
            {
                IEnumerable<SystemMaintenanceNotificationDTO> notifications = await _backgroundServiceStatusService.GetMaintenanceNotificationsAsync(activeOnly);
                return ApiOk(notifications, "Maintenance notifications retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving maintenance notifications");
                return ApiServerError<IEnumerable<SystemMaintenanceNotificationDTO>>("An error occurred while retrieving maintenance notifications");
            }
        }

        /// <summary>
        /// Creates a system maintenance notification (Admin only)
        /// </summary>
        [HttpPost("maintenance")]
        [Authorize(Roles = "Admin")]
        [RateLimit(10, 60)]
        public async Task<ActionResult<ApiResponse<SystemMaintenanceNotificationDTO>>> CreateMaintenanceNotification(
            [FromBody] CreateMaintenanceNotificationDTO dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return ApiBadRequest<SystemMaintenanceNotificationDTO>("Invalid maintenance notification data");
                }

                SystemMaintenanceNotificationDTO notification = await _backgroundServiceStatusService.CreateMaintenanceNotificationAsync(dto);
                return ApiCreated(notification, message: "Maintenance notification created successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating maintenance notification");
                return ApiServerError<SystemMaintenanceNotificationDTO>("An error occurred while creating maintenance notification");
            }
        }

        /// <summary>
        /// Gets automated system optimization recommendations (Admin only)
        /// </summary>
        [HttpGet("recommendations")]
        [Authorize(Roles = "Admin")]
        [RateLimit(20, 60)]
        public async Task<ActionResult<ApiResponse<IEnumerable<SystemOptimizationRecommendationDTO>>>> GetOptimizationRecommendations()
        {
            try
            {
                IEnumerable<SystemOptimizationRecommendationDTO> recommendations = await _backgroundServiceStatusService.GetOptimizationRecommendationsAsync();
                return ApiOk(recommendations, "Optimization recommendations retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving optimization recommendations");
                return ApiServerError<IEnumerable<SystemOptimizationRecommendationDTO>>("An error occurred while retrieving optimization recommendations");
            }
        }

        /// <summary>
        /// Gets background service metrics summary (Admin only)
        /// </summary>
        [HttpGet("metrics")]
        [Authorize(Roles = "Admin")]
        [RateLimit(20, 60)]
        public async Task<ActionResult<ApiResponse<BackgroundServiceMetricsDTO>>> GetServiceMetrics(
            [FromQuery] DateTime? fromDate = null,
            [FromQuery] DateTime? toDate = null)
        {
            try
            {
                if (fromDate.HasValue && toDate.HasValue && fromDate > toDate)
                {
                    return ApiBadRequest<BackgroundServiceMetricsDTO>("From date cannot be later than to date");
                }

                BackgroundServiceMetricsDTO metrics = await _backgroundServiceStatusService.GetServiceMetricsAsync(fromDate, toDate);
                return ApiOk(metrics, "Service metrics retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving service metrics");
                return ApiServerError<BackgroundServiceMetricsDTO>("An error occurred while retrieving service metrics");
            }
        }

        /// <summary>
        /// Gets the current health status of all background services for dashboard display
        /// </summary>
        [HttpGet("health")]
        [RateLimit(50, 60)]
        public async Task<ActionResult<ApiResponse<object>>> GetServiceHealth()
        {
            try
            {
                IEnumerable<BackgroundServiceStatusDTO> statuses = await _backgroundServiceStatusService.GetAllServiceStatusAsync();

                int totalServices = 0;
                int healthyServices = 0;
                int errorServices = 0;
                string overallHealth = "Healthy";

                foreach (BackgroundServiceStatusDTO status in statuses)
                {
                    totalServices++;
                    if (status.IsHealthy)
                    {
                        healthyServices++;
                    }
                    else
                    {
                        errorServices++;
                    }
                }

                if (errorServices > 0)
                {
                    overallHealth = errorServices >= totalServices / 2 ? "Critical" : "Degraded";
                }

                object healthSummary = new
                {
                    OverallHealth = overallHealth,
                    TotalServices = totalServices,
                    HealthyServices = healthyServices,
                    ErrorServices = errorServices,
                    Services = statuses
                };

                return ApiOk(healthSummary, "Service health retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving service health");
                return ApiServerError<object>("An error occurred while retrieving service health");
            }
        }
    }
}