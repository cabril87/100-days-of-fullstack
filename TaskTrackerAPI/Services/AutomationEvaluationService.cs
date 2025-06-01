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
    /// Background service that evaluates automation triggers and processes automated task generation
    /// </summary>
    public class AutomationEvaluationService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<AutomationEvaluationService> _logger;
        private readonly TimeSpan _checkInterval = TimeSpan.FromMinutes(5); // Check every 5 minutes

        public AutomationEvaluationService(
            IServiceProvider serviceProvider,
            ILogger<AutomationEvaluationService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Automation Evaluation Service is starting");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await EvaluateAutomationTriggersAsync();
                    await ProcessSmartSchedulingAsync();
                    await AnalyzeUserPatternsAsync();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred during automation evaluation cycle");
                }

                await Task.Delay(_checkInterval, stoppingToken);
            }

            _logger.LogInformation("Automation Evaluation Service is stopping");
        }

        private async Task EvaluateAutomationTriggersAsync()
        {
            try
            {
                using IServiceScope scope = _serviceProvider.CreateScope();
                ITemplateAutomationService automationService = scope.ServiceProvider
                    .GetRequiredService<ITemplateAutomationService>();

                // Evaluate different trigger types
                List<string> triggerTypes = new List<string>
                {
                    "DateSchedule",
                    "TaskCompleted", 
                    "PatternRecognition",
                    "UserAction",
                    "TimeInterval"
                };

                foreach (string triggerType in triggerTypes)
                {
                    IEnumerable<AutomationRuleDTO> triggeredRules = await automationService
                        .EvaluateAutomationTriggersAsync(triggerType);

                    foreach (AutomationRuleDTO rule in triggeredRules)
                    {
                        // Execute automation actions
                        Dictionary<string, object> context = new Dictionary<string, object>
                        {
                            { "triggerType", triggerType },
                            { "evaluationTime", DateTime.UtcNow },
                            { "source", "AutomationEvaluationService" }
                        };

                        AutomationExecutionResultDTO result = await automationService
                            .ExecuteAutomationActionsAsync(rule.Id, context);

                        if (result.Success)
                        {
                            _logger.LogInformation("Successfully executed automation rule {RuleId} of type {TriggerType}", 
                                rule.Id, triggerType);
                        }
                        else
                        {
                            _logger.LogWarning("Failed to execute automation rule {RuleId}: {Message}", 
                                rule.Id, result.Message);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error evaluating automation triggers");
            }
        }

        private async Task ProcessSmartSchedulingAsync()
        {
            try
            {
                using IServiceScope scope = _serviceProvider.CreateScope();
                ITemplateAutomationService automationService = scope.ServiceProvider
                    .GetRequiredService<ITemplateAutomationService>();
                ITaskTemplateService templateService = scope.ServiceProvider
                    .GetRequiredService<ITaskTemplateService>();

                // Get users who have automation-enabled templates
                IEnumerable<TaskTemplateDTO> automatedTemplates = await templateService.GetAutomatedTemplatesAsync();
                List<int> activeUserIds = automatedTemplates
                    .Where(t => t.CreatedByUserId.HasValue)
                    .Select(t => t.CreatedByUserId!.Value)
                    .Distinct()
                    .ToList();

                foreach (int userId in activeUserIds)
                {
                    try
                    {
                        IEnumerable<TaskTemplateDTO> scheduledTemplates = await automationService
                            .ScheduleAutomatedTasksAsync(userId);

                        if (scheduledTemplates.Any())
                        {
                            _logger.LogInformation("Scheduled {Count} automated tasks for user {UserId}", 
                                scheduledTemplates.Count(), userId);
                        }
                    }
                    catch (Exception userEx)
                    {
                        _logger.LogWarning(userEx, "Failed to schedule tasks for user {UserId}", userId);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing smart scheduling");
            }
        }

        private async Task AnalyzeUserPatternsAsync()
        {
            try
            {
                using IServiceScope scope = _serviceProvider.CreateScope();
                ITemplateAutomationService automationService = scope.ServiceProvider
                    .GetRequiredService<ITemplateAutomationService>();
                ITaskTemplateService templateService = scope.ServiceProvider
                    .GetRequiredService<ITaskTemplateService>();

                // Get users who have created templates (indicating active usage)
                IEnumerable<TaskTemplateDTO> userTemplates = await templateService.GetAllTaskTemplatesAsync();
                List<int> activeUserIds = userTemplates
                    .Where(t => t.CreatedByUserId.HasValue)
                    .Select(t => t.CreatedByUserId!.Value)
                    .Distinct()
                    .Take(10) // Limit to 10 users per cycle to avoid overload
                    .ToList();

                foreach (int userId in activeUserIds)
                {
                    try
                    {
                        IEnumerable<AutomationSuggestionDTO> suggestions = await automationService
                            .AnalyzeUserPatternsAsync(userId);

                        // For high-confidence suggestions, create smart automation rules
                        foreach (AutomationSuggestionDTO suggestion in suggestions.Where(s => s.Confidence > 0.8m))
                        {
                            PatternAnalysisDTO pattern = new PatternAnalysisDTO
                            {
                                UserId = userId,
                                PatternType = suggestion.SuggestionType,
                                Description = suggestion.Description,
                                Confidence = suggestion.Confidence,
                                PatternData = suggestion.Configuration,
                                SuggestedActions = new List<string> { "CreateTask", "SendNotification" }
                            };

                            AutomationRuleDTO newRule = await automationService
                                .CreateSmartAutomationRuleAsync(userId, pattern);

                            _logger.LogInformation("Created smart automation rule {RuleId} for user {UserId} based on pattern analysis", 
                                newRule.Id, userId);
                        }
                    }
                    catch (Exception userEx)
                    {
                        _logger.LogWarning(userEx, "Failed to analyze patterns for user {UserId}", userId);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error analyzing user patterns");
            }
        }
    }
} 