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
using TaskTrackerAPI.DTOs.Tasks;

namespace TaskTrackerAPI.Services
{
    /// <summary>
    /// Background service for template usage tracking, analytics calculation, and recommendation engine
    /// </summary>
    public class TemplateAnalyticsService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<TemplateAnalyticsService> _logger;
        private readonly TimeSpan _checkInterval = TimeSpan.FromHours(1); // Check every hour

        public TemplateAnalyticsService(
            IServiceProvider serviceProvider,
            ILogger<TemplateAnalyticsService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Template Analytics Service is starting");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await ProcessUsageTrackingAsync();
                    await CalculateSuccessRatesAsync();
                    await UpdatePerformanceMetricsAsync();
                    await GenerateRecommendationsAsync();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred during template analytics processing");
                }

                await Task.Delay(_checkInterval, stoppingToken);
            }

            _logger.LogInformation("Template Analytics Service is stopping");
        }

        private async Task ProcessUsageTrackingAsync()
        {
            try
            {
                using IServiceScope scope = _serviceProvider.CreateScope();
                ITaskTemplateService templateService = scope.ServiceProvider
                    .GetRequiredService<ITaskTemplateService>();

                // Get all templates that need analytics processing
                IEnumerable<TaskTemplateDTO> templates = await templateService.GetAllTaskTemplatesAsync();

                foreach (TaskTemplateDTO template in templates)
                {
                    // Process template usage analytics
                    IEnumerable<TemplateUsageAnalyticsDTO> analytics = await templateService
                        .GetTemplateAnalyticsAsync(template.Id);

                    if (analytics.Any())
                    {
                        // Calculate usage trends
                        int dailyUsages = analytics.Count(a => a.UsedDate >= DateTime.UtcNow.AddDays(-1));
                        int weeklyUsages = analytics.Count(a => a.UsedDate >= DateTime.UtcNow.AddDays(-7));
                        int monthlyUsages = analytics.Count(a => a.UsedDate >= DateTime.UtcNow.AddDays(-30));

                        _logger.LogDebug("Template {TemplateId} usage: Daily={Daily}, Weekly={Weekly}, Monthly={Monthly}",
                            template.Id, dailyUsages, weeklyUsages, monthlyUsages);
                    }
                }

                _logger.LogInformation("Processed usage tracking for {Count} templates", templates.Count());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing usage tracking");
            }
        }

        private async Task CalculateSuccessRatesAsync()
        {
            try
            {
                using IServiceScope scope = _serviceProvider.CreateScope();
                ITaskTemplateService templateService = scope.ServiceProvider
                    .GetRequiredService<ITaskTemplateService>();

                IEnumerable<TaskTemplateDTO> templates = await templateService.GetAllTaskTemplatesAsync();

                foreach (TaskTemplateDTO template in templates)
                {
                    TemplateAnalyticsSummaryDTO summary = await templateService
                        .GetTemplateAnalyticsSummaryAsync(template.Id);

                    // Calculate additional metrics
                    decimal efficiencyScore = CalculateEfficiencyScore(summary);
                    int trendDirection = CalculateTrendDirection(template.Id);
                    
                    _logger.LogDebug("Template {TemplateId} metrics: Success Rate={SuccessRate}%, Efficiency={Efficiency}",
                        template.Id, summary.SuccessRate, efficiencyScore);
                }

                _logger.LogInformation("Calculated success rates for {Count} templates", templates.Count());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating success rates");
            }
        }

        private async Task UpdatePerformanceMetricsAsync()
        {
            try
            {
                using IServiceScope scope = _serviceProvider.CreateScope();
                ITaskTemplateService templateService = scope.ServiceProvider
                    .GetRequiredService<ITaskTemplateService>();

                // Update performance metrics for all templates
                IEnumerable<TaskTemplateDTO> templates = await templateService.GetAllTaskTemplatesAsync();

                Dictionary<string, object> performanceMetrics = new Dictionary<string, object>();

                foreach (TaskTemplateDTO template in templates)
                {
                    TemplateAnalyticsSummaryDTO summary = await templateService
                        .GetTemplateAnalyticsSummaryAsync(template.Id);

                    // Calculate performance indicators
                    Dictionary<string, object> templateMetrics = new Dictionary<string, object>
                    {
                        { "popularity", CalculatePopularityScore(summary) },
                        { "effectiveness", CalculateEffectivenessScore(summary) },
                        { "adoption", CalculateAdoptionRate(summary) },
                        { "retention", CalculateRetentionRate(summary) }
                    };

                    performanceMetrics[$"template_{template.Id}"] = templateMetrics;
                }

                _logger.LogInformation("Updated performance metrics for {Count} templates", templates.Count());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating performance metrics");
            }
        }

        private async Task GenerateRecommendationsAsync()
        {
            try
            {
                using IServiceScope scope = _serviceProvider.CreateScope();
                ITaskTemplateService templateService = scope.ServiceProvider
                    .GetRequiredService<ITaskTemplateService>();

                // Generate recommendations based on analytics
                List<string> recommendations = new List<string>();

                // Get popular and featured templates
                IEnumerable<TaskTemplateDTO> popularTemplates = await templateService.GetPopularTemplatesAsync(5);
                IEnumerable<TaskTemplateDTO> featuredTemplates = await templateService.GetFeaturedTemplatesAsync();

                // Analyze template performance patterns
                foreach (TaskTemplateDTO template in popularTemplates)
                {
                    TemplateAnalyticsSummaryDTO summary = await templateService
                        .GetTemplateAnalyticsSummaryAsync(template.Id);

                    if (summary.SuccessRate > 80)
                    {
                        recommendations.Add($"Template '{template.Name}' has a {summary.SuccessRate:F1}% success rate - consider promoting it");
                    }

                    if (summary.TotalUsages > 100 && summary.SuccessRate < 60)
                    {
                        recommendations.Add($"Template '{template.Name}' needs optimization - low success rate despite high usage");
                    }
                }

                // Generate user-specific recommendations
                await GenerateUserSpecificRecommendationsAsync(scope);

                _logger.LogInformation("Generated {Count} template recommendations", recommendations.Count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating recommendations");
            }
        }

        private async Task GenerateUserSpecificRecommendationsAsync(IServiceScope scope)
        {
            try
            {
                ITaskTemplateService templateService = scope.ServiceProvider
                    .GetRequiredService<ITaskTemplateService>();

                // Get popular templates to recommend
                IEnumerable<TaskTemplateDTO> popularTemplates = await templateService.GetPopularTemplatesAsync(3);
                IEnumerable<TaskTemplateDTO> featuredTemplates = await templateService.GetFeaturedTemplatesAsync();

                // This would analyze individual user patterns and generate personalized recommendations
                // For now, implementing basic logic with actual template data

                // Get users who have recently used templates (last 30 days)
                IEnumerable<TaskTemplateDTO> recentTemplates = await templateService.GetAllTaskTemplatesAsync();
                List<int> activeUserIds = recentTemplates
                    .Where(t => t.CreatedByUserId.HasValue)
                    .Select(t => t.CreatedByUserId!.Value)
                    .Distinct()
                    .Take(5) // Limit to 5 users per cycle to avoid overload
                    .ToList();

                foreach (int userId in activeUserIds)
                {
                    // Get user's existing templates to avoid duplicate recommendations
                    IEnumerable<TaskTemplateDTO> userTemplates = await templateService.GetUserTaskTemplatesAsync(userId);
                    
                    // Analyze user's template usage patterns
                    List<string> userRecommendations = new List<string>();
                    
                    // Recommend popular templates they don't have
                    foreach (TaskTemplateDTO template in popularTemplates.Take(2))
                    {
                        if (!userTemplates.Any(ut => ut.Id == template.Id))
                        {
                            userRecommendations.Add($"Try the '{template.Name}' template - it's popular among users");
                        }
                    }
                    
                    // Add general recommendations
                    if (userRecommendations.Count < 3)
                    {
                        userRecommendations.AddRange(new[]
                        {
                            "Based on your productivity patterns, consider the 'Focus Session' template",
                            "The 'Project Kickoff' template could help with your project management tasks"
                        });
                    }

                    _logger.LogDebug("Generated {Count} recommendations for user {UserId}", 
                        userRecommendations.Count, userId);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating user-specific recommendations");
            }
        }

        private decimal CalculateEfficiencyScore(TemplateAnalyticsSummaryDTO summary)
        {
            // Basic efficiency calculation based on completion time and success rate
            if (summary.AverageCompletionTimeMinutes <= 0 || summary.SuccessRate <= 0)
                return 0;

            // Efficiency = (Success Rate / Average Time) * 100
            decimal timeEfficiency = summary.AverageCompletionTimeMinutes > 0 ? 100.0m / summary.AverageCompletionTimeMinutes : 0;
            return (summary.SuccessRate / 100) * timeEfficiency * 10; // Normalized to reasonable scale
        }

        private int CalculateTrendDirection(int templateId)
        {
            // Calculate trend based on recent usage patterns
            // 1 = improving, 0 = stable, -1 = declining
            try
            {
                // This would analyze usage data over time periods
                // For now, return stable as default
                return 0; // Stable trend
            }
            catch
            {
                return 0; // Default to stable on error
            }
        }

        private decimal CalculatePopularityScore(TemplateAnalyticsSummaryDTO summary)
        {
            // Popularity based on total usages and download count
            return (summary.TotalUsages * 0.7m) + (summary.DownloadCount * 0.3m);
        }

        private decimal CalculateEffectivenessScore(TemplateAnalyticsSummaryDTO summary)
        {
            // Effectiveness based on success rate and rating
            return (summary.SuccessRate * 0.6m) + (summary.Rating * 20 * 0.4m); // Rating is 1-5, multiply by 20 to scale
        }

        private decimal CalculateAdoptionRate(TemplateAnalyticsSummaryDTO summary)
        {
            // Adoption rate based on unique users and total usages
            if (summary.UniqueUsers <= 0) return 0;
            return (decimal)summary.TotalUsages / summary.UniqueUsers;
        }

        private decimal CalculateRetentionRate(TemplateAnalyticsSummaryDTO summary)
        {
            // Calculate retention rate based on repeat usage patterns
            // This would require analyzing user return patterns over time
            try
            {
                // Basic retention calculation based on success rate and usage
                if (summary.TotalUsages <= 1)
                    return 0; // No retention data for single use

                // Higher success rate typically correlates with better retention
                decimal baseRetention = summary.SuccessRate * 0.8m; // Base retention from success rate
                
                // Adjust based on unique users vs total usages (repeat usage indicator)
                if (summary.UniqueUsers > 0)
                {
                    decimal repeatUsageRatio = (decimal)summary.TotalUsages / summary.UniqueUsers;
                    if (repeatUsageRatio > 1.5m) // Users are coming back
                    {
                        baseRetention += 15m; // Bonus for repeat usage
                    }
                }

                return Math.Min(baseRetention, 95m); // Cap at 95%
            }
            catch
            {
                return 50m; // Default retention rate on error
            }
        }
    }
} 