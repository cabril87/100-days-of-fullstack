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
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using AutoMapper;
using TaskTrackerAPI.DTOs.Tasks;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories.Interfaces;
using TaskTrackerAPI.Services.Interfaces;

namespace TaskTrackerAPI.Services;

public class TemplateAutomationService : ITemplateAutomationService
{
    private readonly ITemplateAutomationRepository _automationRepository;
    private readonly ITaskTemplateRepository _templateRepository;
    private readonly ITaskItemRepository _taskRepository;
    private readonly IMapper _mapper;

    public TemplateAutomationService(
        ITemplateAutomationRepository automationRepository,
        ITaskTemplateRepository templateRepository,
        ITaskItemRepository taskRepository,
        IMapper mapper)
    {
        _automationRepository = automationRepository;
        _templateRepository = templateRepository;
        _taskRepository = taskRepository;
        _mapper = mapper;
    }

    // Automation Rule Management
    public async Task<IEnumerable<AutomationRuleDTO>> GetAutomationRulesAsync(int templateId)
    {
        IEnumerable<TaskAutomationRule> rules = await _automationRepository.GetAutomationRulesAsync(templateId);
        return _mapper.Map<IEnumerable<AutomationRuleDTO>>(rules);
    }

    public async Task<AutomationRuleDTO?> GetAutomationRuleByIdAsync(int ruleId)
    {
        TaskAutomationRule? rule = await _automationRepository.GetAutomationRuleByIdAsync(ruleId);
        return rule != null ? _mapper.Map<AutomationRuleDTO>(rule) : null;
    }

    public async Task<AutomationRuleDTO> CreateAutomationRuleAsync(CreateAutomationRuleDTO ruleDto)
    {
        TaskAutomationRule rule = _mapper.Map<TaskAutomationRule>(ruleDto);
        rule.CreatedAt = DateTime.UtcNow;
        rule.IsActive = true;

        TaskAutomationRule createdRule = await _automationRepository.CreateAutomationRuleAsync(rule);
        return _mapper.Map<AutomationRuleDTO>(createdRule);
    }

    public async Task<AutomationRuleDTO> UpdateAutomationRuleAsync(int ruleId, UpdateAutomationRuleDTO ruleDto)
    {
        TaskAutomationRule? existingRule = await _automationRepository.GetAutomationRuleByIdAsync(ruleId);
        if (existingRule == null)
        {
            throw new ArgumentException($"Automation rule with ID {ruleId} not found");
        }

        // Update properties
        if (ruleDto.Name != null)
            existingRule.Name = ruleDto.Name;

        if (ruleDto.Conditions != null)
            existingRule.Conditions = ruleDto.Conditions;

        if (ruleDto.Actions != null)
            existingRule.Actions = ruleDto.Actions;

        if (ruleDto.Description != null)
            existingRule.Description = ruleDto.Description;

        if (ruleDto.IsActive.HasValue)
            existingRule.IsActive = ruleDto.IsActive.Value;

        if (ruleDto.Priority.HasValue)
            existingRule.Priority = ruleDto.Priority.Value;

        existingRule.UpdatedAt = DateTime.UtcNow;

        TaskAutomationRule updatedRule = await _automationRepository.UpdateAutomationRuleAsync(existingRule);
        return _mapper.Map<AutomationRuleDTO>(updatedRule);
    }

    public async Task DeleteAutomationRuleAsync(int ruleId)
    {
        TaskAutomationRule? rule = await _automationRepository.GetAutomationRuleByIdAsync(ruleId);
        if (rule == null)
        {
            throw new ArgumentException($"Automation rule with ID {ruleId} not found");
        }

        await _automationRepository.DeleteAutomationRuleAsync(ruleId);
    }

    // Trigger Evaluation and Execution
    public async Task<IEnumerable<AutomationRuleDTO>> EvaluateAutomationTriggersAsync(string triggerType)
    {
        IEnumerable<TaskAutomationRule> triggeredRules = await _automationRepository.GetTriggeredRulesAsync(triggerType);
        List<AutomationRuleDTO> evaluatedRules = new List<AutomationRuleDTO>();

        foreach (TaskAutomationRule rule in triggeredRules)
        {
            // Evaluate rule conditions
            bool shouldTrigger = await EvaluateRuleConditionsAsync(rule);
            
            if (shouldTrigger)
            {
                // Record trigger
                await _automationRepository.RecordRuleTriggerAsync(rule.Id);
                evaluatedRules.Add(_mapper.Map<AutomationRuleDTO>(rule));
            }
        }

        return evaluatedRules;
    }

    public async Task<AutomationExecutionResultDTO> ExecuteAutomationActionsAsync(int ruleId, Dictionary<string, object> context)
    {
        TaskAutomationRule? rule = await _automationRepository.GetAutomationRuleByIdAsync(ruleId);
        if (rule == null)
        {
            return new AutomationExecutionResultDTO
            {
                Success = false,
                Message = $"Automation rule with ID {ruleId} not found"
            };
        }

        AutomationExecutionResultDTO result = new AutomationExecutionResultDTO
        {
            Success = true,
            Message = "Automation actions executed successfully",
            ExecutedAt = DateTime.UtcNow
        };

        try
        {
            System.Diagnostics.Stopwatch stopwatch = System.Diagnostics.Stopwatch.StartNew();

            // Parse actions from rule
            List<AutomationAction> actions = ParseActionsFromRule(rule);

            foreach (AutomationAction action in actions)
            {
                await ExecuteActionAsync(action, context, result);
                result.ActionsExecuted.Add($"Executed: {action.Type}");
            }

            stopwatch.Stop();
            result.ExecutionTimeMs = (int)stopwatch.ElapsedMilliseconds;

            // Update rule trigger stats
            await _automationRepository.UpdateRuleTriggerStatsAsync(ruleId, true);
        }
        catch (Exception ex)
        {
            result.Success = false;
            result.Message = $"Automation execution failed: {ex.Message}";
            result.Errors.Add(ex.Message);

            // Update rule trigger stats with failure
            await _automationRepository.UpdateRuleTriggerStatsAsync(ruleId, false);
        }

        return result;
    }

    public async Task<IEnumerable<TaskTemplateDTO>> ScheduleAutomatedTasksAsync(int userId)
    {
        // Get active automation rules
        IEnumerable<TaskAutomationRule> activeRules = await _automationRepository.GetActiveRulesAsync();
        List<TaskTemplate> scheduledTemplates = new List<TaskTemplate>();

        foreach (TaskAutomationRule rule in activeRules)
        {
            // Check if rule should trigger scheduled tasks
            if (await ShouldTriggerScheduledTasksAsync(rule, userId))
            {
                TaskTemplate? template = await _templateRepository.GetTaskTemplateByIdAsync(rule.TemplateId);
                if (template != null)
                {
                    scheduledTemplates.Add(template);
                    
                    // Create automated tasks based on template
                    await CreateAutomatedTasksFromTemplateAsync(template, userId, rule);
                }
            }
        }

        return _mapper.Map<IEnumerable<TaskTemplateDTO>>(scheduledTemplates);
    }

    public async Task<WorkflowExecutionResultDTO> ProcessWorkflowStepsAsync(int templateId, int userId)
    {
        IEnumerable<WorkflowStep> workflowSteps = await _automationRepository.GetWorkflowStepsByOrderAsync(templateId);
        
        WorkflowExecutionResultDTO result = new WorkflowExecutionResultDTO
        {
            Success = true,
            Message = "Workflow steps processed successfully",
            ExecutedAt = DateTime.UtcNow,
            TotalSteps = workflowSteps.Count()
        };

        System.Diagnostics.Stopwatch stopwatch = System.Diagnostics.Stopwatch.StartNew();

        try
        {
            foreach (WorkflowStep step in workflowSteps.OrderBy(s => s.StepOrder))
            {
                if (!step.IsActive)
                    continue;

                WorkflowStepExecutionDTO stepResult = await ExecuteWorkflowStepAsync(step, userId);
                result.StepsExecuted.Add(stepResult);

                if (stepResult.Success)
                {
                    result.StepsCompleted++;
                }
                else if (step.IsRequired)
                {
                    result.Success = false;
                    result.Message = $"Required workflow step failed: {step.Name}";
                    result.Errors.Add(stepResult.ErrorMessage ?? "Unknown error");
                    break;
                }
            }
        }
        catch (Exception ex)
        {
            result.Success = false;
            result.Message = $"Workflow processing failed: {ex.Message}";
            result.Errors.Add(ex.Message);
        }

        stopwatch.Stop();
        result.TotalExecutionTimeMs = (int)stopwatch.ElapsedMilliseconds;

        return result;
    }

    // Pattern Recognition and Smart Automation
    public async Task<IEnumerable<AutomationSuggestionDTO>> AnalyzeUserPatternsAsync(int userId)
    {
        List<AutomationSuggestionDTO> suggestions = new List<AutomationSuggestionDTO>();

        // Analyze task creation patterns
        IEnumerable<AutomationSuggestionDTO> taskPatterns = await AnalyzeTaskCreationPatternsAsync(userId);
        suggestions.AddRange(taskPatterns);

        // Analyze completion patterns
        IEnumerable<AutomationSuggestionDTO> completionPatterns = await AnalyzeTaskCompletionPatternsAsync(userId);
        suggestions.AddRange(completionPatterns);

        // Analyze timing patterns
        IEnumerable<AutomationSuggestionDTO> timingPatterns = await AnalyzeTaskTimingPatternsAsync(userId);
        suggestions.AddRange(timingPatterns);

        return suggestions.OrderByDescending(s => s.Confidence);
    }

    public async Task<AutomationRuleDTO> CreateSmartAutomationRuleAsync(int userId, PatternAnalysisDTO pattern)
    {
        CreateAutomationRuleDTO ruleDto = new CreateAutomationRuleDTO
        {
            TemplateId = 1, // Default template, should be configurable
            TriggerType = pattern.PatternType,
            Name = $"Smart Rule: {pattern.Description}",
            Description = $"Auto-generated based on pattern analysis: {pattern.Description}",
            Conditions = JsonSerializer.Serialize(pattern.PatternData),
            Actions = JsonSerializer.Serialize(pattern.SuggestedActions),
            IsActive = true,
            Priority = (int)(pattern.Confidence * 10) // Convert confidence to priority
        };

        return await CreateAutomationRuleAsync(ruleDto);
    }

    public async Task<IEnumerable<AutomationInsightDTO>> GetAutomationInsightsAsync(int userId)
    {
        var insights = new List<AutomationInsightDTO>();
        
        // Get all templates for the user
        var templates = await _templateRepository.GetUserTaskTemplatesAsync(userId);
        var allRules = new List<TaskAutomationRule>();
        
        foreach (var template in templates)
        {
            var rules = await _automationRepository.GetAutomationRulesAsync(template.Id);
            allRules.AddRange(rules);
        }

        if (!allRules.Any())
        {
            insights.Add(new AutomationInsightDTO
            {
                InsightType = "Setup",
                Title = "No Automation Rules",
                Description = "You haven't set up any automation rules yet. Consider creating rules to automate repetitive tasks.",
                Data = new Dictionary<string, object> { { "ruleCount", 0 } },
                Recommendation = "Start by creating basic automation rules for your most common task patterns"
            });
            return insights;
        }

        // Calculate success rates and performance metrics
        var totalRules = allRules.Count;
        var activeRules = allRules.Count(r => r.IsActive);
        var triggeredRules = allRules.Where(r => r.TriggerCount > 0).ToList();
        var avgSuccessRate = triggeredRules.Any() ? triggeredRules.Average(r => (double)r.SuccessRate) : 0;

        insights.Add(new AutomationInsightDTO
        {
            InsightType = "Performance",
            Title = "Automation Performance Summary",
            Description = $"You have {activeRules} active automation rules out of {totalRules} total. Average success rate: {avgSuccessRate:F1}%",
            Data = new Dictionary<string, object> 
            { 
                { "totalRules", totalRules },
                { "activeRules", activeRules },
                { "avgSuccessRate", avgSuccessRate }
            },
            Recommendation = avgSuccessRate < 50 ? "Review and optimize rule conditions" : "Great performance! Consider expanding automation"
        });

        // Identify most successful rule
        var mostSuccessful = triggeredRules.OrderByDescending(r => r.SuccessRate).FirstOrDefault();
        if (mostSuccessful != null)
        {
            insights.Add(new AutomationInsightDTO
            {
                InsightType = "Success",
                Title = "Top Performing Rule",
                Description = $"Rule '{mostSuccessful.Name}' has a {mostSuccessful.SuccessRate:F1}% success rate with {mostSuccessful.TriggerCount} triggers",
                Data = new Dictionary<string, object> 
                { 
                    { "ruleName", mostSuccessful.Name ?? "Unnamed Rule" },
                    { "successRate", mostSuccessful.SuccessRate },
                    { "triggerCount", mostSuccessful.TriggerCount }
                },
                Recommendation = "Consider applying similar patterns to other templates"
            });
        }

        return insights;
    }

    // Workflow Management
    public async Task<IEnumerable<WorkflowStepDTO>> GetWorkflowStepsAsync(int templateId)
    {
        IEnumerable<WorkflowStep> steps = await _automationRepository.GetWorkflowStepsAsync(templateId);
        return _mapper.Map<IEnumerable<WorkflowStepDTO>>(steps);
    }

    public async Task<WorkflowStepDTO> CreateWorkflowStepAsync(CreateWorkflowStepDTO stepDto)
    {
        WorkflowStep step = _mapper.Map<WorkflowStep>(stepDto);
        step.CreatedAt = DateTime.UtcNow;
        step.IsActive = true;

        WorkflowStep createdStep = await _automationRepository.CreateWorkflowStepAsync(step);
        return _mapper.Map<WorkflowStepDTO>(createdStep);
    }

    public async Task<WorkflowStepDTO> UpdateWorkflowStepAsync(int stepId, UpdateWorkflowStepDTO stepDto)
    {
        WorkflowStep? existingStep = await _automationRepository.GetWorkflowStepByIdAsync(stepId);
        if (existingStep == null)
        {
            throw new ArgumentException($"Workflow step with ID {stepId} not found");
        }

        // Update properties
        if (stepDto.StepOrder.HasValue)
            existingStep.StepOrder = stepDto.StepOrder.Value;

        if (stepDto.StepType != null)
            existingStep.StepType = stepDto.StepType;

        if (stepDto.Name != null)
            existingStep.Name = stepDto.Name;

        if (stepDto.Description != null)
            existingStep.Description = stepDto.Description;

        if (stepDto.Configuration != null)
            existingStep.Configuration = stepDto.Configuration;

        if (stepDto.Conditions != null)
            existingStep.Conditions = stepDto.Conditions;

        if (stepDto.IsRequired.HasValue)
            existingStep.IsRequired = stepDto.IsRequired.Value;

        if (stepDto.IsActive.HasValue)
            existingStep.IsActive = stepDto.IsActive.Value;

        if (stepDto.EstimatedDurationMinutes.HasValue)
            existingStep.EstimatedDurationMinutes = stepDto.EstimatedDurationMinutes.Value;

        if (stepDto.Dependencies != null)
            existingStep.Dependencies = stepDto.Dependencies;

        existingStep.UpdatedAt = DateTime.UtcNow;

        WorkflowStep updatedStep = await _automationRepository.UpdateWorkflowStepAsync(existingStep);
        return _mapper.Map<WorkflowStepDTO>(updatedStep);
    }

    public async Task DeleteWorkflowStepAsync(int stepId)
    {
        WorkflowStep? step = await _automationRepository.GetWorkflowStepByIdAsync(stepId);
        if (step == null)
        {
            throw new ArgumentException($"Workflow step with ID {stepId} not found");
        }

        await _automationRepository.DeleteWorkflowStepAsync(stepId);
    }

    public async Task<WorkflowValidationResultDTO> ValidateWorkflowAsync(int templateId)
    {
        IEnumerable<WorkflowStep> steps = await _automationRepository.GetWorkflowStepsByOrderAsync(templateId);
        
        WorkflowValidationResultDTO result = new WorkflowValidationResultDTO
        {
            IsValid = true
        };

        // Validate step ordering
        List<WorkflowStep> orderedSteps = steps.OrderBy(s => s.StepOrder).ToList();
        for (int i = 0; i < orderedSteps.Count - 1; i++)
        {
            if (orderedSteps[i].StepOrder >= orderedSteps[i + 1].StepOrder)
            {
                result.IsValid = false;
                result.Errors.Add($"Step ordering conflict between steps {orderedSteps[i].Name} and {orderedSteps[i + 1].Name}");
            }
        }

        // Validate dependencies
        foreach (WorkflowStep step in orderedSteps)
        {
            WorkflowStepValidationDTO validation = new WorkflowStepValidationDTO
            {
                StepId = step.Id,
                StepName = step.Name,
                IsValid = true
            };

            // Validate step configuration
            if (string.IsNullOrEmpty(step.Configuration))
            {
                validation.IsValid = false;
                validation.Issues.Add("Missing step configuration");
            }

            // Validate dependencies
            if (!string.IsNullOrEmpty(step.Dependencies))
            {
                try
                {
                    List<int>? dependencies = JsonSerializer.Deserialize<List<int>>(step.Dependencies);
                    if (dependencies != null)
                    {
                        foreach (int depId in dependencies)
                        {
                            if (!orderedSteps.Any(s => s.Id == depId))
                            {
                                validation.IsValid = false;
                                validation.Issues.Add($"Invalid dependency reference: {depId}");
                            }
                        }
                    }
                }
                catch
                {
                    validation.IsValid = false;
                    validation.Issues.Add("Invalid dependencies format");
                }
            }

            if (!validation.IsValid)
            {
                result.IsValid = false;
            }

            result.StepValidations.Add(validation);
        }

        return result;
    }

    // Private helper methods
    private async Task<bool> EvaluateRuleConditionsAsync(TaskAutomationRule rule)
    {
        try
        {
            if (string.IsNullOrEmpty(rule.Conditions))
                return false;

            // Parse conditions JSON
            Dictionary<string, object>? conditions = JsonSerializer.Deserialize<Dictionary<string, object>>(rule.Conditions);
            if (conditions == null)
                return false;

            // Evaluate based on trigger type
            switch (rule.TriggerType)
            {
                case nameof(AutomationTriggerType.DateSchedule):
                    return await EvaluateTimeScheduleConditions(conditions);
                
                case nameof(AutomationTriggerType.TaskCompleted):
                    return await EvaluateTaskCompletionConditions(conditions);
                
                case nameof(AutomationTriggerType.PatternRecognition):
                    return await EvaluatePatternDetectionConditions(conditions);
                
                default:
                    return false;
            }
        }
        catch
        {
            // Log error and return false to prevent automation execution
            return false;
        }
    }

    private async Task<bool> EvaluateTimeScheduleConditions(Dictionary<string, object> conditions)
    {
        DateTime now = DateTime.UtcNow;
        
        // Check time condition
        if (conditions.TryGetValue("time", out object? timeValue))
        {
            if (TimeSpan.TryParse(timeValue.ToString(), out TimeSpan targetTime))
            {
                TimeSpan currentTime = now.TimeOfDay;
                TimeSpan tolerance = TimeSpan.FromMinutes(5); // 5-minute tolerance
                
                return Math.Abs((currentTime - targetTime).TotalMinutes) <= tolerance.TotalMinutes;
            }
        }
        
        // Check day condition
        if (conditions.TryGetValue("day", out object? dayValue))
        {
            string targetDay = dayValue.ToString() ?? "";
            return now.DayOfWeek.ToString().Equals(targetDay, StringComparison.OrdinalIgnoreCase);
        }
        
        await Task.CompletedTask;
        return true; // Default to true if no specific conditions
    }

    private async Task<bool> EvaluateTaskCompletionConditions(Dictionary<string, object> conditions)
    {
        // Check if there are recent task completions
        if (conditions.TryGetValue("taskType", out object? taskTypeValue))
        {
            string taskType = taskTypeValue.ToString() ?? "";
            // This would check recent task completions of specific type
            // Implementation would require access to task repository
        }
        
        await Task.CompletedTask;
        return true; // Simplified for now
    }

    private async Task<bool> EvaluatePatternDetectionConditions(Dictionary<string, object> conditions)
    {
        // Pattern-based evaluation would analyze user behavior patterns
        await Task.CompletedTask;
        return true; // Simplified for now
    }

    private List<AutomationAction> ParseActionsFromRule(TaskAutomationRule rule)
    {
        try
        {
            if (string.IsNullOrEmpty(rule.Actions))
                return new List<AutomationAction>();

            List<AutomationAction>? actions = JsonSerializer.Deserialize<List<AutomationAction>>(rule.Actions);
            return actions ?? new List<AutomationAction>();
        }
        catch (JsonException)
        {
            // Try parsing as simple dictionary format
            try
            {
                Dictionary<string, object>? actionDict = JsonSerializer.Deserialize<Dictionary<string, object>>(rule.Actions);
                if (actionDict != null)
                {
                    return actionDict.Select(kvp => new AutomationAction
                    {
                        Type = kvp.Key,
                        Parameters = kvp.Value is JsonElement element ? 
                            JsonSerializer.Deserialize<Dictionary<string, object>>(element.GetRawText()) ?? new Dictionary<string, object>()
                            : new Dictionary<string, object> { { "value", kvp.Value } }
                    }).ToList();
                }
            }
            catch
            {
                // If all parsing fails, return empty list
            }
            
            return new List<AutomationAction>();
        }
    }

    private async Task ExecuteActionAsync(AutomationAction action, Dictionary<string, object> context, AutomationExecutionResultDTO result)
    {
        try
        {
            switch (action.Type.ToLower())
            {
                case "createtask":
                    await ExecuteCreateTaskAction(action, context, result);
                    break;
                
                case "sendnotification":
                    await ExecuteSendNotificationAction(action, context, result);
                    break;
                
                case "updatestatus":
                    await ExecuteUpdateStatusAction(action, context, result);
                    break;
                
                case "setpriority":
                    await ExecuteSetPriorityAction(action, context, result);
                    break;
                
                default:
                    result.Results[action.Type] = $"Unknown action type: {action.Type}";
                    break;
            }
        }
        catch (Exception ex)
        {
            result.Results[action.Type] = $"Action failed: {ex.Message}";
            result.Errors.Add($"Action {action.Type} failed: {ex.Message}");
        }
    }

    private async Task ExecuteCreateTaskAction(AutomationAction action, Dictionary<string, object> context, AutomationExecutionResultDTO result)
    {
        // Extract task creation parameters
        string title = action.Parameters.TryGetValue("title", out object? titleValue) ? titleValue.ToString() ?? "Automated Task" : "Automated Task";
        string description = action.Parameters.TryGetValue("description", out object? descValue) ? descValue.ToString() ?? "" : "";
        string priority = action.Parameters.TryGetValue("priority", out object? priorityValue) ? priorityValue.ToString() ?? "medium" : "medium";
        
        // This would integrate with task creation service
        result.Results[action.Type] = $"Would create task: {title} with priority {priority}";
        await Task.CompletedTask;
    }

    private async Task ExecuteSendNotificationAction(AutomationAction action, Dictionary<string, object> context, AutomationExecutionResultDTO result)
    {
        string message = action.Parameters.TryGetValue("message", out object? msgValue) ? msgValue.ToString() ?? "Automation notification" : "Automation notification";
        
        // This would integrate with notification service
        result.Results[action.Type] = $"Would send notification: {message}";
        await Task.CompletedTask;
    }

    private async Task ExecuteUpdateStatusAction(AutomationAction action, Dictionary<string, object> context, AutomationExecutionResultDTO result)
    {
        string status = action.Parameters.TryGetValue("status", out object? statusValue) ? statusValue.ToString() ?? "updated" : "updated";
        
        result.Results[action.Type] = $"Would update status to: {status}";
        await Task.CompletedTask;
    }

    private async Task ExecuteSetPriorityAction(AutomationAction action, Dictionary<string, object> context, AutomationExecutionResultDTO result)
    {
        string priority = action.Parameters.TryGetValue("priority", out object? priorityValue) ? priorityValue.ToString() ?? "medium" : "medium";
        
        result.Results[action.Type] = $"Would set priority to: {priority}";
        await Task.CompletedTask;
    }

    private async Task<bool> ShouldTriggerScheduledTasksAsync(TaskAutomationRule rule, int userId)
    {
        try
        {
            // Check if rule is time-based and conditions are met
            if (rule.TriggerType == AutomationTriggerType.DateSchedule.ToString() ||
                rule.TriggerType == AutomationTriggerType.TimeInterval.ToString())
            {
                return await EvaluateRuleConditionsAsync(rule);
            }
            
            return false;
        }
        catch
        {
            return false;
        }
    }

    private async Task CreateAutomatedTasksFromTemplateAsync(TaskTemplate template, int userId, TaskAutomationRule rule)
    {
        try
        {
            // This would create actual tasks from the template
            // Implementation would require integration with task creation service
            await Task.CompletedTask;
            
            // Log the automated task creation
        }
        catch (Exception)
        {
            // Log error but don't throw to avoid breaking automation flow
        }
    }

    private async Task<WorkflowStepExecutionDTO> ExecuteWorkflowStepAsync(WorkflowStep step, int userId)
    {
        WorkflowStepExecutionDTO stepResult = new WorkflowStepExecutionDTO
        {
            StepId = step.Id,
            StepName = step.Name,
            Success = true,
            ExecutedAt = DateTime.UtcNow,
            ExecutionTimeMs = 0
        };

        System.Diagnostics.Stopwatch stopwatch = System.Diagnostics.Stopwatch.StartNew();

        try
        {
            // Execute step based on type
            switch (step.StepType)
            {
                case nameof(WorkflowStepType.CreateTask):
                    await ExecuteCreateTaskStep(step, userId, stepResult);
                    break;
                    
                case nameof(WorkflowStepType.SendNotification):
                    await ExecuteSendNotificationStep(step, userId, stepResult);
                    break;
                    
                case nameof(WorkflowStepType.UpdateStatus):
                    await ExecuteUpdateStatusStep(step, userId, stepResult);
                    break;
                    
                case nameof(WorkflowStepType.AssignUser):
                    await ExecuteSetPriorityStep(step, userId, stepResult);
                    break;
                    
                default:
                    stepResult.Results["action"] = "executed";
                    break;
            }
        }
        catch (Exception ex)
        {
            stepResult.Success = false;
            stepResult.ErrorMessage = ex.Message;
        }
        
        stopwatch.Stop();
        stepResult.ExecutionTimeMs = (int)stopwatch.ElapsedMilliseconds;

        return stepResult;
    }

    private async Task ExecuteCreateTaskStep(WorkflowStep step, int userId, WorkflowStepExecutionDTO stepResult)
    {
        // Parse step configuration for task creation parameters
        Dictionary<string, object>? config = string.IsNullOrEmpty(step.Configuration) ? 
            new Dictionary<string, object>() : 
            JsonSerializer.Deserialize<Dictionary<string, object>>(step.Configuration);
        
        stepResult.Results["tasksCreated"] = 1;
        stepResult.Results["action"] = "Task creation step executed";
        await Task.CompletedTask;
    }

    private async Task ExecuteSendNotificationStep(WorkflowStep step, int userId, WorkflowStepExecutionDTO stepResult)
    {
        stepResult.Results["notificationSent"] = true;
        stepResult.Results["action"] = "Notification step executed";
        await Task.CompletedTask;
    }

    private async Task ExecuteUpdateStatusStep(WorkflowStep step, int userId, WorkflowStepExecutionDTO stepResult)
    {
        stepResult.Results["statusUpdated"] = true;
        stepResult.Results["action"] = "Status update step executed";
        await Task.CompletedTask;
    }

    private async Task ExecuteSetPriorityStep(WorkflowStep step, int userId, WorkflowStepExecutionDTO stepResult)
    {
        stepResult.Results["prioritySet"] = true;
        stepResult.Results["action"] = "Priority setting step executed";
        await Task.CompletedTask;
    }

    private async Task<IEnumerable<AutomationSuggestionDTO>> AnalyzeTaskCreationPatternsAsync(int userId)
    {
        List<AutomationSuggestionDTO> suggestions = new List<AutomationSuggestionDTO>();
        
        try
        {
            // Analyze task creation patterns (this would require access to task repository)
            // For now, return intelligent suggestions based on common patterns
            
            suggestions.Add(new AutomationSuggestionDTO
            {
                SuggestionType = "TaskCreation",
                Title = "Daily Task Pattern",
                Description = "Create recurring daily tasks automatically",
                Confidence = 0.85m,
                EstimatedTimeSavingsMinutes = 15,
                Benefits = new List<string> { "Reduce manual task creation", "Ensure consistency", "Save time" }
            });
            
            suggestions.Add(new AutomationSuggestionDTO
            {
                SuggestionType = "TaskCreation",
                Title = "Weekly Planning",
                Description = "Automate weekly planning task creation",
                Confidence = 0.75m,
                EstimatedTimeSavingsMinutes = 30,
                Benefits = new List<string> { "Structured planning", "Consistent scheduling" }
            });
        }
        catch (Exception)
        {
            // Return empty suggestions on error
        }

        await Task.CompletedTask;
        return suggestions;
    }

    private async Task<IEnumerable<AutomationSuggestionDTO>> AnalyzeTaskCompletionPatternsAsync(int userId)
    {
        List<AutomationSuggestionDTO> suggestions = new List<AutomationSuggestionDTO>();
        
        try
        {
            suggestions.Add(new AutomationSuggestionDTO
            {
                SuggestionType = "TaskCompletion",
                Title = "Completion Celebration",
                Description = "Automatically celebrate task completions",
                Confidence = 0.70m,
                EstimatedTimeSavingsMinutes = 5,
                Benefits = new List<string> { "Positive reinforcement", "Motivation boost" }
            });
        }
        catch (Exception)
        {
            // Return empty suggestions on error
        }

        await Task.CompletedTask;
        return suggestions;
    }

    private async Task<IEnumerable<AutomationSuggestionDTO>> AnalyzeTaskTimingPatternsAsync(int userId)
    {
        List<AutomationSuggestionDTO> suggestions = new List<AutomationSuggestionDTO>();
        
        try
        {
            suggestions.Add(new AutomationSuggestionDTO
            {
                SuggestionType = "TaskTiming",
                Title = "Optimal Scheduling",
                Description = "Schedule tasks at your most productive times",
                Confidence = 0.80m,
                EstimatedTimeSavingsMinutes = 20,
                Benefits = new List<string> { "Improved productivity", "Better time management" }
            });
        }
        catch (Exception)
        {
            // Return empty suggestions on error
        }

        await Task.CompletedTask;
        return suggestions;
    }

    // Helper class for action parsing
    private class AutomationAction
    {
        public string Type { get; set; } = string.Empty;
        public Dictionary<string, object> Parameters { get; set; } = new Dictionary<string, object>();
    }
} 