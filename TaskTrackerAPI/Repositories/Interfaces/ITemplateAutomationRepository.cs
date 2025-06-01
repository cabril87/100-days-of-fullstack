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
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Repositories.Interfaces;

public interface ITemplateAutomationRepository
{
    // Automation Rule Management
    Task<IEnumerable<TaskAutomationRule>> GetAutomationRulesAsync(int templateId);
    Task<TaskAutomationRule?> GetAutomationRuleByIdAsync(int ruleId);
    Task<TaskAutomationRule> CreateAutomationRuleAsync(TaskAutomationRule rule);
    Task<TaskAutomationRule> UpdateAutomationRuleAsync(TaskAutomationRule rule);
    Task DeleteAutomationRuleAsync(int ruleId);
    
    // Trigger Evaluation
    Task<IEnumerable<TaskAutomationRule>> GetTriggeredRulesAsync(string triggerType);
    Task<IEnumerable<TaskAutomationRule>> GetActiveRulesAsync();
    Task UpdateRuleTriggerStatsAsync(int ruleId, bool success);
    Task RecordRuleTriggerAsync(int ruleId);
    
    // Workflow Steps
    Task<IEnumerable<WorkflowStep>> GetWorkflowStepsAsync(int templateId);
    Task<WorkflowStep?> GetWorkflowStepByIdAsync(int stepId);
    Task<WorkflowStep> CreateWorkflowStepAsync(WorkflowStep step);
    Task<WorkflowStep> UpdateWorkflowStepAsync(WorkflowStep step);
    Task DeleteWorkflowStepAsync(int stepId);
    Task<IEnumerable<WorkflowStep>> GetWorkflowStepsByOrderAsync(int templateId);
} 