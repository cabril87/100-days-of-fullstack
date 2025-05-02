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

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await CheckForUpcomingDeadlinesAsync();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred while checking for upcoming deadlines");
                }

                // Wait for the next check interval
                await Task.Delay(_checkInterval, stoppingToken);
            }

            _logger.LogInformation("Deadline Notification Service is stopping");
        }

        private async Task CheckForUpcomingDeadlinesAsync()
        {
            _logger.LogInformation("Checking for upcoming task deadlines");

            using (IServiceScope scope = _serviceProvider.CreateScope())
            {
                INotificationService notificationService = scope.ServiceProvider.GetRequiredService<INotificationService>();

                // Generate notifications for tasks due in the next 24 hours
                IEnumerable<NotificationDTO>? notifications = await notificationService.GenerateUpcomingDeadlineNotificationsAsync(24);

                int count = notifications?.Count() ?? 0;
                if (count > 0)
                {
                    _logger.LogInformation("Created {Count} deadline notifications", count);
                }
                else
                {
                    _logger.LogInformation("No upcoming deadlines found requiring notifications");
                }
            }
        }
    }
} 