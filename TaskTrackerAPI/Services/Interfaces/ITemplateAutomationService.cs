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
using System.Collections.Generic;
using System.Threading.Tasks;
using TaskTrackerAPI.DTOs.Tasks;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Services.Interfaces;

public interface ITemplateAutomationService
{
    // Automation Rule Management
    Task<IEnumerable<AutomationRuleDTO>> GetAutomationRulesAsync(int templateId);
    Task<AutomationRuleDTO?> GetAutomationRuleByIdAsync(int ruleId);
    Task<AutomationRuleDTO> CreateAutomationRuleAsync(CreateAutomationRuleDTO ruleDto);
    Task<AutomationRuleDTO> UpdateAutomationRuleAsync(int ruleId, UpdateAutomationRuleDTO ruleDto);
    Task DeleteAutomationRuleAsync(int ruleId);
    
    // Trigger Evaluation and Execution
    Task<IEnumerable<AutomationRuleDTO>> EvaluateAutomationTriggersAsync(string triggerType);
    Task<AutomationExecutionResultDTO> ExecuteAutomationActionsAsync(int ruleId, Dictionary<string, object> context);
    Task<IEnumerable<TaskTemplateDTO>> ScheduleAutomatedTasksAsync(int userId);
    Task<WorkflowExecutionResultDTO> ProcessWorkflowStepsAsync(int templateId, int userId);
    
    // Pattern Recognition and Smart Automation
    Task<IEnumerable<AutomationSuggestionDTO>> AnalyzeUserPatternsAsync(int userId);
    Task<AutomationRuleDTO> CreateSmartAutomationRuleAsync(int userId, PatternAnalysisDTO pattern);
    Task<IEnumerable<AutomationInsightDTO>> GetAutomationInsightsAsync(int userId);
    
    // Workflow Management
    Task<IEnumerable<WorkflowStepDTO>> GetWorkflowStepsAsync(int templateId);
    Task<WorkflowStepDTO> CreateWorkflowStepAsync(CreateWorkflowStepDTO stepDto);
    Task<WorkflowStepDTO> UpdateWorkflowStepAsync(int stepId, UpdateWorkflowStepDTO stepDto);
    Task DeleteWorkflowStepAsync(int stepId);
    Task<WorkflowValidationResultDTO> ValidateWorkflowAsync(int templateId);
} 