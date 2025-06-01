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
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using TaskTrackerAPI.Services.Interfaces;
using System.Collections.Generic;
using TaskTrackerAPI.DTOs.Notifications;

namespace TaskTrackerAPI.Services
{
    /// <summary>
    /// Background service that checks for upcoming task deadlines and creates notifications
    /// </summary>
    public class DeadlineNotificationService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<DeadlineNotificationService> _logger;
        private readonly TimeSpan _checkInterval = TimeSpan.FromMinutes(30); // Check every 30 minutes
        private const string ServiceName = "DeadlineNotificationService";

        public DeadlineNotificationService(
            IServiceProvider serviceProvider,
            ILogger<DeadlineNotificationService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Deadline Notification Service is starting");

            // Update service status to Running
            await UpdateServiceStatusAsync("Running", "Service started successfully");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await CheckForUpcomingDeadlinesAsync();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred while checking for upcoming deadlines");
                    await UpdateServiceStatusAsync("Error", $"Error during execution: {ex.Message}");
                    await RecordExecutionAsync(false, $"Error: {ex.Message}");
                }

                // Wait for the next check interval
                await Task.Delay(_checkInterval, stoppingToken);
            }

            _logger.LogInformation("Deadline Notification Service is stopping");
            await UpdateServiceStatusAsync("Stopped", "Service stopped");
        }

        private async Task CheckForUpcomingDeadlinesAsync()
        {
            _logger.LogInformation("Checking for upcoming task deadlines");
            DateTime startTime = DateTime.UtcNow;
            int notificationsCreated = 0;

            try
            {
                using (IServiceScope scope = _serviceProvider.CreateScope())
                {
                    INotificationService notificationService = scope.ServiceProvider.GetRequiredService<INotificationService>();

                    // Generate notifications for tasks due in the next 24 hours
                    IEnumerable<NotificationDTO>? notifications = await notificationService.GenerateUpcomingDeadlineNotificationsAsync(24);

                    notificationsCreated = notifications?.Count() ?? 0;
                    
                    if (notificationsCreated > 0)
                    {
                        _logger.LogInformation("Created {Count} deadline notifications", notificationsCreated);
                    }
                    else
                    {
                        _logger.LogInformation("No upcoming deadlines found requiring notifications");
                    }

                    // Update service status and record successful execution
                    await UpdateServiceStatusAsync("Running", $"Last run: {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC", DateTime.UtcNow);
                    await RecordExecutionAsync(true, $"Successfully processed notifications. Created {notificationsCreated} notifications.", notificationsCreated);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during deadline notification check");
                await UpdateServiceStatusAsync("Error", $"Error during execution: {ex.Message}");
                await RecordExecutionAsync(false, $"Error: {ex.Message}");
                throw;
            }
        }

        private async Task UpdateServiceStatusAsync(string status, string? message = null, DateTime? lastRun = null)
        {
            try
            {
                using (IServiceScope scope = _serviceProvider.CreateScope())
                {
                    IBackgroundServiceStatusService statusService = scope.ServiceProvider.GetRequiredService<IBackgroundServiceStatusService>();
                    await statusService.UpdateServiceStatusAsync(ServiceName, status, message, lastRun);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to update service status for {ServiceName}", ServiceName);
                // Don't rethrow as this is not critical to the main functionality
            }
        }

        private async Task RecordExecutionAsync(bool success, string? details = null, int? recordsProcessed = null)
        {
            try
            {
                using (IServiceScope scope = _serviceProvider.CreateScope())
                {
                    IBackgroundServiceStatusService statusService = scope.ServiceProvider.GetRequiredService<IBackgroundServiceStatusService>();
                    await statusService.RecordServiceExecutionAsync(ServiceName, success, details, recordsProcessed);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to record execution for {ServiceName}", ServiceName);
                // Don't rethrow as this is not critical to the main functionality
            }
        }
    }
} 