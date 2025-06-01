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
using TaskTrackerAPI.DTOs.Boards;
using System;
using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;

namespace TaskTrackerAPI.Services.Background
{
    /// <summary>
    /// Background service for template marketplace analytics and maintenance
    /// Processes template statistics, trending calculations, and marketplace health
    /// </summary>
    public class TemplateMarketplaceService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<TemplateMarketplaceService> _logger;
        private readonly IHubContext<TemplateMarketplaceHub> _marketplaceHubContext;
        private readonly TimeSpan _processingInterval = TimeSpan.FromHours(1); // Process every hour

        public TemplateMarketplaceService(
            IServiceProvider serviceProvider,
            ILogger<TemplateMarketplaceService> logger,
            IHubContext<TemplateMarketplaceHub> marketplaceHubContext)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
            _marketplaceHubContext = marketplaceHubContext;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Template Marketplace Service started");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await ProcessMarketplaceAnalyticsAsync();
                    await Task.Delay(_processingInterval, stoppingToken);
                }
                catch (OperationCanceledException)
                {
                    _logger.LogInformation("Template Marketplace Service is stopping");
                    break;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error in Template Marketplace Service");
                    await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken); // Wait before retrying
                }
            }

            _logger.LogInformation("Template Marketplace Service stopped");
        }

        /// <summary>
        /// Process marketplace analytics and maintenance tasks
        /// </summary>
        private async Task ProcessMarketplaceAnalyticsAsync()
        {
            using var scope = _serviceProvider.CreateScope();
            IBoardTemplateService templateService = scope.ServiceProvider.GetRequiredService<IBoardTemplateService>();

            try
            {
                _logger.LogInformation("Starting marketplace analytics processing");

                // Calculate trending templates
                await CalculateTrendingTemplatesAsync(templateService);

                // Update template statistics
                await UpdateTemplateStatisticsAsync(templateService);

                // Clean up old data
                await CleanupOldDataAsync(templateService);

                // Send marketplace analytics update
                await NotifyMarketplaceAnalyticsAsync(templateService);

                _logger.LogInformation("Completed marketplace analytics processing");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during marketplace analytics processing");
            }
        }

        /// <summary>
        /// Calculate trending templates based on recent activity
        /// </summary>
        private async Task CalculateTrendingTemplatesAsync(IBoardTemplateService templateService)
        {
            try
            {
                _logger.LogDebug("Calculating trending templates");

                // Get all public templates
                IEnumerable<BoardTemplateDTO> publicTemplates = await templateService.GetPublicTemplatesAsync();
                List<dynamic> trendingTemplates = new List<dynamic>();

                foreach (var template in publicTemplates)
                {
                    try
                    {
                        // Get template statistics
                        TemplateStatisticsDTO stats = await templateService.GetTemplateStatisticsAsync(template.Id, 0); // System user

                        // Calculate trending score based on recent activity
                        double trendingScore = CalculateTrendingScore(stats);

                        trendingTemplates.Add(new
                        {
                            TemplateId = template.Id,
                            Name = template.Name,
                            Category = template.Category,
                            TrendingScore = trendingScore,
                            RecentUsage = CalculateRecentUsage(stats), // Calculate from available data
                            AverageRating = stats.AverageRating,
                            TotalUsage = stats.UsageCount
                        });
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, $"Error calculating trending score for template {template.Id}");
                    }
                }

                // Sort by trending score and take top templates
                var topTrending = trendingTemplates
                    .OrderByDescending(t => t.TrendingScore)
                    .Take(20)
                    .ToList();

                _logger.LogInformation($"Calculated trending scores for {trendingTemplates.Count} templates, top {topTrending.Count} identified");

                // Store trending data (would need implementation in repository)
                // await StoreeTrendingDataAsync(topTrending);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating trending templates");
            }
        }

        /// <summary>
        /// Calculate trending score for a template
        /// </summary>
        private double CalculateTrendingScore(TemplateStatisticsDTO stats)
        {
            try
            {
                int recentUsage = CalculateRecentUsage(stats);
                int totalUsage = stats.UsageCount;
                double averageRating = (double)(stats.AverageRating ?? 0);
                int ratingCount = stats.RatingCount;

                // Weighted formula for trending score
                double usageWeight = 0.4;
                double recentUsageWeight = 0.3;
                double ratingWeight = 0.2;
                double popularityWeight = 0.1;

                double usageScore = Math.Min(totalUsage / 100.0, 1.0); // Normalize to 0-1
                double recentUsageScore = Math.Min(recentUsage / 20.0, 1.0); // Normalize to 0-1
                double ratingScore = averageRating / 5.0; // Convert to 0-1
                double popularityScore = Math.Min(ratingCount / 50.0, 1.0); // Normalize to 0-1

                double trendingScore = (usageScore * usageWeight) +
                                  (recentUsageScore * recentUsageWeight) +
                                  (ratingScore * ratingWeight) +
                                  (popularityScore * popularityWeight);

                return trendingScore * 100; // Convert to 0-100 scale
            }
            catch
            {
                return 0.0;
            }
        }

        /// <summary>
        /// Calculate recent usage from available data
        /// </summary>
        private int CalculateRecentUsage(TemplateStatisticsDTO stats)
        {
            try
            {
                // If LastUsed is within the last 30 days, consider it recent usage
                if (stats.LastUsed.HasValue && stats.LastUsed.Value > DateTime.UtcNow.AddDays(-30))
                {
                    // Estimate recent usage based on total usage and recency
                    double daysSinceLastUsed = (DateTime.UtcNow - stats.LastUsed.Value).TotalDays;
                    double recencyFactor = Math.Max(0, 1 - (daysSinceLastUsed / 30.0));
                    return (int)(stats.UsageCount * recencyFactor * 0.3); // Estimate 30% of usage as recent
                }
                return 0;
            }
            catch
            {
                return 0;
            }
        }

        /// <summary>
        /// Update template statistics and metrics
        /// </summary>
        private async Task UpdateTemplateStatisticsAsync(IBoardTemplateService templateService)
        {
            try
            {
                _logger.LogDebug("Updating template statistics");

                IEnumerable<BoardTemplateDTO> publicTemplates = await templateService.GetPublicTemplatesAsync();
                int updatedCount = 0;

                foreach (BoardTemplateDTO template in publicTemplates)
                {
                    try
                    {
                        // Get current statistics
                        TemplateStatisticsDTO stats = await templateService.GetTemplateStatisticsAsync(template.Id, 0);

                        // Update derived metrics
                        await UpdateTemplateMetricsAsync(template.Id, stats);
                        updatedCount++;
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, $"Error updating statistics for template {template.Id}");
                    }
                }

                _logger.LogInformation($"Updated statistics for {updatedCount} templates");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating template statistics");
            }
        }

        /// <summary>
        /// Update derived metrics for a template
        /// </summary>
        private async Task UpdateTemplateMetricsAsync(int templateId, TemplateStatisticsDTO stats)
        {
            try
            {
                // Calculate quality score
                double qualityScore = CalculateQualityScore(stats);

                // Calculate popularity rank
                int popularityRank = CalculatePopularityRank(stats);

                // Log the calculated metrics for monitoring
                _logger.LogDebug($"Updated metrics for template {templateId}: Quality={qualityScore:F2}, Popularity={popularityRank}, " +
                                $"Rating={stats.AverageRating:F1}, Usage={stats.UsageCount}, RatingCount={stats.RatingCount}");

                // Store metrics in cache or database table for quick access
                // This could be expanded to update a TemplateMetrics table
                await Task.CompletedTask; // Placeholder for actual database update
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, $"Error updating metrics for template {templateId}");
            }
        }

        /// <summary>
        /// Calculate quality score for a template
        /// </summary>
        private double CalculateQualityScore(TemplateStatisticsDTO stats)
        {
            try
            {
                double averageRating = (double)(stats.AverageRating ?? 0);
                int ratingCount = stats.RatingCount;
                int usageCount = stats.UsageCount;

                // Quality score based on ratings and usage
                double ratingScore = averageRating / 5.0;
                double reliabilityScore = Math.Min(ratingCount / 10.0, 1.0); // More ratings = more reliable
                double adoptionScore = Math.Min(usageCount / 50.0, 1.0); // More usage = better quality

                return (ratingScore * 0.5) + (reliabilityScore * 0.3) + (adoptionScore * 0.2);
            }
            catch
            {
                return 0.0;
            }
        }

        /// <summary>
        /// Calculate popularity rank for a template
        /// </summary>
        private int CalculatePopularityRank(TemplateStatisticsDTO stats)
        {
            try
            {
                int usageCount = stats.UsageCount;
                int recentUsage = CalculateRecentUsage(stats);

                // Simple popularity calculation
                return (usageCount * 2) + (recentUsage * 5);
            }
            catch
            {
                return 0;
            }
        }

        /// <summary>
        /// Clean up old marketplace data
        /// </summary>
        private async Task CleanupOldDataAsync(IBoardTemplateService templateService)
        {
            try
            {
                _logger.LogDebug("Cleaning up old marketplace data");

                // Clean up templates that haven't been used in 6 months and have no ratings
                DateTime cutoffDate = DateTime.UtcNow.AddMonths(-6);
                int cleanupCount = 0;

                IEnumerable<BoardTemplateDTO> publicTemplates = await templateService.GetPublicTemplatesAsync();
                
                foreach (BoardTemplateDTO template in publicTemplates)
                {
                    try
                    {
                        TemplateStatisticsDTO stats = await templateService.GetTemplateStatisticsAsync(template.Id, 0);
                        
                        // Criteria for cleanup: no usage, no ratings, and old enough
                        bool shouldCleanup = stats.UsageCount == 0 && 
                                          stats.RatingCount == 0 && 
                                          template.CreatedAt < cutoffDate;

                        if (shouldCleanup)
                        {
                            _logger.LogInformation($"Template {template.Id} ({template.Name}) marked for cleanup - no activity since {template.CreatedAt:yyyy-MM-dd}");
                            cleanupCount++;
                            
                            // In a real implementation, you might:
                            // - Move to archive instead of delete
                            // - Notify template authors
                            // - Create cleanup reports
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, $"Error evaluating template {template.Id} for cleanup");
                    }
                }

                // Clean up old trending data (older than 30 days)
                DateTime trendingCutoff = DateTime.UtcNow.AddDays(-30);
                _logger.LogDebug($"Would clean up trending data older than {trendingCutoff:yyyy-MM-dd}");

                // Clean up old analytics snapshots (older than 90 days)
                DateTime analyticsCutoff = DateTime.UtcNow.AddDays(-90);
                _logger.LogDebug($"Would clean up analytics snapshots older than {analyticsCutoff:yyyy-MM-dd}");

                _logger.LogInformation($"Marketplace cleanup completed: {cleanupCount} templates identified for cleanup");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during marketplace data cleanup");
            }
        }

        /// <summary>
        /// Send marketplace analytics update via SignalR
        /// </summary>
        private async Task NotifyMarketplaceAnalyticsAsync(IBoardTemplateService templateService)
        {
            try
            {
                // Get marketplace analytics
                TemplateMarketplaceAnalyticsDTO analytics = await templateService.GetMarketplaceAnalyticsAsync(0); // System user

                // Send to all marketplace subscribers
                await _marketplaceHubContext.Clients.Group("TemplateMarketplace").SendAsync("MarketplaceAnalyticsUpdated", new
                {
                    Analytics = analytics,
                    UpdatedAt = DateTime.UtcNow,
                    ProcessedBy = "BackgroundService"
                });

                _logger.LogDebug("Sent marketplace analytics update via SignalR");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending marketplace analytics update");
            }
        }

        /// <summary>
        /// Process template health checks
        /// </summary>
        private async Task ProcessTemplateHealthChecksAsync(IBoardTemplateService templateService)
        {
            try
            {
                _logger.LogDebug("Processing template health checks");

                IEnumerable<BoardTemplateDTO> publicTemplates = await templateService.GetPublicTemplatesAsync();
                List<dynamic> healthIssues = new List<dynamic>();

                foreach (var template in publicTemplates)
                {
                    try
                    {
                        TemplateStatisticsDTO stats = await templateService.GetTemplateStatisticsAsync(template.Id, 0);
                        double healthScore = CalculateTemplateHealthScore(stats);

                        if (healthScore < 0.5) // Health threshold
                        {
                            healthIssues.Add(new
                            {
                                TemplateId = template.Id,
                                Name = template.Name,
                                HealthScore = healthScore,
                                Issues = IdentifyHealthIssues(stats)
                            });
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, $"Error checking health for template {template.Id}");
                    }
                }

                if (healthIssues.Any())
                {
                    _logger.LogWarning($"Found {healthIssues.Count} templates with health issues");
                    
                    // Notify administrators about health issues
                    await _marketplaceHubContext.Clients.Group("Administrators").SendAsync("TemplateHealthIssues", new
                    {
                        Issues = healthIssues,
                        DetectedAt = DateTime.UtcNow
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing template health checks");
            }
        }

        /// <summary>
        /// Calculate template health score
        /// </summary>
        private double CalculateTemplateHealthScore(TemplateStatisticsDTO stats)
        {
            try
            {
                double averageRating = (double)(stats.AverageRating ?? 0);
                int usageCount = stats.UsageCount;
                int recentUsage = CalculateRecentUsage(stats);

                // Health factors
                double ratingHealth = averageRating / 5.0;
                double usageHealth = usageCount > 0 ? 1.0 : 0.0;
                double activityHealth = recentUsage > 0 ? 1.0 : 0.5; // Recent activity is good but not required

                return (ratingHealth * 0.4) + (usageHealth * 0.4) + (activityHealth * 0.2);
            }
            catch
            {
                return 0.0;
            }
        }

        /// <summary>
        /// Identify specific health issues for a template
        /// </summary>
        private List<string> IdentifyHealthIssues(TemplateStatisticsDTO stats)
        {
            List<string> issues = new List<string>();

            try
            {
                double averageRating = (double)(stats.AverageRating ?? 0);
                int usageCount = stats.UsageCount;
                int recentUsage = CalculateRecentUsage(stats);
                int ratingCount = stats.RatingCount;

                if (averageRating < 2.0)
                    issues.Add("Low average rating");

                if (usageCount == 0)
                    issues.Add("No usage recorded");

                if (recentUsage == 0 && usageCount > 0)
                    issues.Add("No recent activity");

                if (ratingCount < 3 && usageCount > 10)
                    issues.Add("Low rating participation");
            }
            catch (Exception ex)
            {
                issues.Add($"Error analyzing health: {ex.Message}");
            }

            return issues;
        }
    }
} 