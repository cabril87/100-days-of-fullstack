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
using TaskTrackerAPI.Services.Interfaces;
using TaskTrackerAPI.Hubs;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;
using TaskTrackerAPI.DTOs.Boards;

namespace TaskTrackerAPI.Services.Background
{
    /// <summary>
    /// Background service for processing enhanced board analytics
    /// Calculates board metrics, WIP limit violations, and performance insights
    /// </summary>
    public class EnhancedBoardAnalyticsService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<EnhancedBoardAnalyticsService> _logger;
        private readonly IHubContext<EnhancedBoardHub> _boardHubContext;
        private readonly TimeSpan _processingInterval = TimeSpan.FromMinutes(5); // Process every 5 minutes

        public EnhancedBoardAnalyticsService(
            IServiceProvider serviceProvider,
            ILogger<EnhancedBoardAnalyticsService> logger,
            IHubContext<EnhancedBoardHub> boardHubContext)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
            _boardHubContext = boardHubContext;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Enhanced Board Analytics Service started");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await ProcessBoardAnalyticsAsync();
                    await Task.Delay(_processingInterval, stoppingToken);
                }
                catch (OperationCanceledException)
                {
                    _logger.LogInformation("Enhanced Board Analytics Service is stopping");
                    break;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error in Enhanced Board Analytics Service");
                    await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken); // Wait before retrying
                }
            }

            _logger.LogInformation("Enhanced Board Analytics Service stopped");
        }

        /// <summary>
        /// Process analytics for all active boards
        /// </summary>
        private async Task ProcessBoardAnalyticsAsync()
        {
            using var scope = _serviceProvider.CreateScope();
            IBoardService boardService = scope.ServiceProvider.GetRequiredService<IBoardService>();
            IBoardColumnService boardColumnService = scope.ServiceProvider.GetRequiredService<IBoardColumnService>();
            ITaskService taskService = scope.ServiceProvider.GetRequiredService<ITaskService>();

            try
            {
                _logger.LogInformation("Starting board analytics processing");

                // Get all active boards (this would need to be implemented in IBoardService)
                var boards = await GetActiveBoardsAsync(boardService);
                
                foreach (var board in boards)
                {
                    try
                    {
                        await ProcessBoardAnalyticsAsync(board.Id, boardService, boardColumnService, taskService);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, $"Error processing analytics for board {board.Id}");
                    }
                }

                _logger.LogInformation($"Completed analytics processing for {boards.Count} boards");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during board analytics processing");
            }
        }

        /// <summary>
        /// Process analytics for a specific board
        /// </summary>
        private async Task ProcessBoardAnalyticsAsync(
            int boardId, 
            IBoardService boardService, 
            IBoardColumnService boardColumnService,
            ITaskService taskService)
        {
            try
            {
                // Get board columns
                IEnumerable<EnhancedBoardColumnDTO> columns = await boardColumnService.GetBoardColumnsAsync(boardId, 0); // Use system user (0) for background processing
                
                // Calculate WIP limit violations
                List<dynamic> wipViolations = new List<dynamic>();
                List<dynamic> wipStatuses = new List<dynamic>();
                
                foreach (EnhancedBoardColumnDTO column in columns)
                {
                    WipLimitStatusDTO wipStatus = await boardColumnService.GetWipLimitStatusAsync(column.Id, 0);
                    wipStatuses.Add(wipStatus);
                    
                    if (wipStatus.IsOverLimit)
                    {
                        wipViolations.Add(new
                        {
                            BoardId = boardId,
                            ColumnId = column.Id,
                            ColumnName = column.Name,
                            CurrentCount = wipStatus.CurrentTaskCount,
                            WipLimit = wipStatus.WipLimit ?? 0, // Handle nullable int
                            ViolationSeverity = CalculateWipViolationSeverity(wipStatus.CurrentTaskCount, wipStatus.WipLimit ?? 0),
                            DetectedAt = DateTime.UtcNow
                        });
                    }
                }

                // Calculate board performance metrics
                dynamic boardMetrics = await CalculateBoardMetricsAsync(boardId, columns, taskService, boardColumnService);

                // Send real-time updates if there are significant changes
                await NotifyBoardAnalyticsUpdatesAsync(boardId, boardMetrics, wipViolations, wipStatuses);

                // Check for performance alerts
                await CheckPerformanceAlertsAsync(boardId, boardMetrics, wipViolations);

                _logger.LogDebug($"Processed analytics for board {boardId}: {wipViolations.Count} WIP violations detected");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error processing analytics for board {boardId}");
            }
        }

        /// <summary>
        /// Calculate comprehensive board performance metrics
        /// </summary>
        private async Task<dynamic> CalculateBoardMetricsAsync(int boardId, IEnumerable<dynamic> columns, ITaskService taskService, IBoardColumnService boardColumnService)
        {
            try
            {
                // This would need proper implementation based on actual data models
                int totalTasks = 0;
                int completedTasks = 0;
                int inProgressTasks = 0;
                int overdueTasks = 0;
                double averageCycleTime = 0.0;
                double throughput = 0.0;

                // Calculate metrics per column
                List<dynamic> columnMetrics = new List<dynamic>();
                foreach (dynamic column in columns)
                {
                    dynamic columnStats = await boardColumnService.GetColumnStatisticsAsync(column.Id, 0);
                    columnMetrics.Add(new
                    {
                        ColumnId = column.Id,
                        ColumnName = column.Name,
                        TaskCount = columnStats.TotalTasks,
                        CompletedTasks = columnStats.CompletedTasks,
                        AverageTimeInColumn = columnStats.AverageTimeInColumn,
                        Throughput = columnStats.Throughput,
                        WipUtilization = columnStats.WipLimitUtilization
                    });

                    totalTasks += columnStats.TotalTasks;
                    completedTasks += columnStats.CompletedTasks;
                }

                // Calculate board-level metrics
                double completionRate = totalTasks > 0 ? (double)completedTasks / totalTasks * 100 : 0;
                double efficiency = CalculateBoardEfficiency(columnMetrics);
                List<dynamic> bottlenecks = IdentifyBottlenecks(columnMetrics);

                return new
                {
                    BoardId = boardId,
                    TotalTasks = totalTasks,
                    CompletedTasks = completedTasks,
                    InProgressTasks = inProgressTasks,
                    OverdueTasks = overdueTasks,
                    CompletionRate = completionRate,
                    AverageCycleTime = averageCycleTime,
                    Throughput = throughput,
                    Efficiency = efficiency,
                    ColumnMetrics = columnMetrics,
                    Bottlenecks = bottlenecks,
                    CalculatedAt = DateTime.UtcNow
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error calculating metrics for board {boardId}");
                return new { BoardId = boardId, Error = "Failed to calculate metrics" };
            }
        }

        /// <summary>
        /// Calculate WIP violation severity
        /// </summary>
        private string CalculateWipViolationSeverity(int currentCount, int wipLimit)
        {
            if (wipLimit == 0) return "None";
            
            double violationPercentage = (double)(currentCount - wipLimit) / wipLimit * 100;
            
            return violationPercentage switch
            {
                <= 20 => "Low",
                <= 50 => "Medium",
                <= 100 => "High",
                _ => "Critical"
            };
        }

        /// <summary>
        /// Calculate overall board efficiency
        /// </summary>
        private double CalculateBoardEfficiency(List<dynamic> columnMetrics)
        {
            try
            {
                if (!columnMetrics.Any()) return 0.0;

                double totalEfficiency = 0.0;
                int validColumns = 0;

                foreach (dynamic column in columnMetrics)
                {
                    int taskCount = (int)column.TaskCount;
                    int completedTasks = (int)column.CompletedTasks;
                    double wipUtilization = (double)column.WipUtilization;

                    if (taskCount > 0)
                    {
                        double completionRate = (double)completedTasks / taskCount;
                        double efficiency = (completionRate * 0.7) + (wipUtilization / 100.0 * 0.3); // Weighted formula
                        totalEfficiency += efficiency;
                        validColumns++;
                    }
                }

                return validColumns > 0 ? totalEfficiency / validColumns * 100 : 0.0;
            }
            catch
            {
                return 0.0;
            }
        }

        /// <summary>
        /// Identify bottleneck columns
        /// </summary>
        private List<dynamic> IdentifyBottlenecks(List<dynamic> columnMetrics)
        {
            List<dynamic> bottlenecks = new List<dynamic>();

            try
            {
                foreach (dynamic column in columnMetrics)
                {
                    double averageTime = (double)column.AverageTimeInColumn;
                    double wipUtilization = (double)column.WipUtilization;
                    double throughput = (double)column.Throughput;

                    // Define bottleneck criteria
                    bool isBottleneck = false;
                    List<string> reasons = new List<string>();

                    if (averageTime > 480) // More than 8 hours
                    {
                        isBottleneck = true;
                        reasons.Add("High average time in column");
                    }

                    if (wipUtilization > 90)
                    {
                        isBottleneck = true;
                        reasons.Add("High WIP utilization");
                    }

                    if (throughput < 0.5) // Less than 0.5 tasks per day
                    {
                        isBottleneck = true;
                        reasons.Add("Low throughput");
                    }

                    if (isBottleneck)
                    {
                        bottlenecks.Add(new
                        {
                            ColumnId = column.ColumnId,
                            ColumnName = column.ColumnName,
                            Reasons = reasons,
                            Severity = DetermineBottleneckSeverity(reasons.Count, averageTime, wipUtilization)
                        });
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error identifying bottlenecks");
            }

            return bottlenecks;
        }

        /// <summary>
        /// Determine bottleneck severity
        /// </summary>
        private string DetermineBottleneckSeverity(int reasonCount, double averageTime, double wipUtilization)
        {
            if (reasonCount >= 3 || averageTime > 1440 || wipUtilization > 95) // 24 hours
                return "Critical";
            else if (reasonCount >= 2 || averageTime > 720 || wipUtilization > 85) // 12 hours
                return "High";
            else
                return "Medium";
        }

        /// <summary>
        /// Send real-time analytics updates via SignalR
        /// </summary>
        private async Task NotifyBoardAnalyticsUpdatesAsync(int boardId, dynamic metrics, List<dynamic> wipViolations, List<dynamic> wipStatuses)
        {
            try
            {
                string groupName = $"Board_{boardId}";
                
                // Send analytics update
                await _boardHubContext.Clients.Group(groupName).SendAsync("AnalyticsUpdated", new
                {
                    BoardId = boardId,
                    Metrics = metrics,
                    WipStatuses = wipStatuses,
                    UpdatedAt = DateTime.UtcNow
                });

                // Send WIP violations if any
                if (wipViolations.Any())
                {
                    await _boardHubContext.Clients.Group(groupName).SendAsync("WipViolationsDetected", new
                    {
                        BoardId = boardId,
                        Violations = wipViolations,
                        DetectedAt = DateTime.UtcNow
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error sending analytics updates for board {boardId}");
            }
        }

        /// <summary>
        /// Check for performance alerts and notifications
        /// </summary>
        private async Task CheckPerformanceAlertsAsync(int boardId, dynamic metrics, List<dynamic> wipViolations)
        {
            try
            {
                List<dynamic> alerts = new List<dynamic>();

                // Check completion rate
                double completionRate = (double)metrics.CompletionRate;
                if (completionRate < 50)
                {
                    alerts.Add(new
                    {
                        Type = "LowCompletionRate",
                        Severity = "Medium",
                        Message = $"Board completion rate is low: {completionRate:F1}%",
                        BoardId = boardId
                    });
                }

                // Check efficiency
                double efficiency = (double)metrics.Efficiency;
                if (efficiency < 60)
                {
                    alerts.Add(new
                    {
                        Type = "LowEfficiency",
                        Severity = "Medium",
                        Message = $"Board efficiency is below optimal: {efficiency:F1}%",
                        BoardId = boardId
                    });
                }

                // Check bottlenecks
                List<dynamic> bottlenecks = (List<dynamic>)metrics.Bottlenecks;
                if (bottlenecks.Any())
                {
                    alerts.Add(new
                    {
                        Type = "BottlenecksDetected",
                        Severity = "High",
                        Message = $"{bottlenecks.Count} bottleneck(s) detected in board",
                        BoardId = boardId,
                        Details = bottlenecks
                    });
                }

                // Send alerts if any
                if (alerts.Any())
                {
                    string groupName = $"Board_{boardId}";
                    await _boardHubContext.Clients.Group(groupName).SendAsync("PerformanceAlerts", new
                    {
                        BoardId = boardId,
                        Alerts = alerts,
                        GeneratedAt = DateTime.UtcNow
                    });

                    _logger.LogInformation($"Generated {alerts.Count} performance alerts for board {boardId}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error checking performance alerts for board {boardId}");
            }
        }

        /// <summary>
        /// Get active boards (placeholder - would need proper implementation)
        /// </summary>
        private async Task<List<dynamic>> GetActiveBoardsAsync(IBoardService boardService)
        {
            try
            {
                // Get all boards for active users (using system user ID 0 for background processing)
                // In a real implementation, you might want to get all boards or filter by activity
                List<dynamic> activeBoards = new List<dynamic>();
                
                // For now, we'll get a sample of boards to process
                // This could be improved to get boards with recent activity
                IEnumerable<BoardDTO> boards = await boardService.GetAllBoardsAsync(0); // System user to get all boards
                
                foreach (BoardDTO board in boards)
                {
                    activeBoards.Add(new
                    {
                        Id = board.Id,
                        Name = board.Name,
                        UserId = board.UserId,
                        LastActivity = DateTime.UtcNow // Would need actual last activity tracking
                    });
                }
                
                _logger.LogDebug($"Found {activeBoards.Count} active boards for analytics processing");
                return activeBoards;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting active boards");
                return new List<dynamic>();
            }
        }
    }
} 