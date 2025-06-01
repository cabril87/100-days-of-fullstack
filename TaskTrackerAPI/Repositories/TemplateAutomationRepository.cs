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
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TaskTrackerAPI.Data;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories.Interfaces;

namespace TaskTrackerAPI.Repositories;

public class TemplateAutomationRepository : ITemplateAutomationRepository
{
    private readonly ApplicationDbContext _context;

    public TemplateAutomationRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    // Automation Rule Management
    public async Task<IEnumerable<TaskAutomationRule>> GetAutomationRulesAsync(int templateId)
    {
        return await _context.TaskAutomationRules
            .Where(r => r.TemplateId == templateId)
            .OrderBy(r => r.Priority)
            .ThenBy(r => r.Name)
            .ToListAsync();
    }

    public async Task<TaskAutomationRule?> GetAutomationRuleByIdAsync(int ruleId)
    {
        return await _context.TaskAutomationRules
            .Include(r => r.Template)
            .FirstOrDefaultAsync(r => r.Id == ruleId);
    }

    public async Task<TaskAutomationRule> CreateAutomationRuleAsync(TaskAutomationRule rule)
    {
        rule.CreatedAt = DateTime.UtcNow;
        _context.TaskAutomationRules.Add(rule);
        await _context.SaveChangesAsync();
        return rule;
    }

    public async Task<TaskAutomationRule> UpdateAutomationRuleAsync(TaskAutomationRule rule)
    {
        rule.UpdatedAt = DateTime.UtcNow;
        _context.TaskAutomationRules.Update(rule);
        await _context.SaveChangesAsync();
        return rule;
    }

    public async Task DeleteAutomationRuleAsync(int ruleId)
    {
        TaskAutomationRule? rule = await _context.TaskAutomationRules.FindAsync(ruleId);
        if (rule != null)
        {
            _context.TaskAutomationRules.Remove(rule);
            await _context.SaveChangesAsync();
        }
    }

    // Trigger Evaluation
    public async Task<IEnumerable<TaskAutomationRule>> GetTriggeredRulesAsync(string triggerType)
    {
        return await _context.TaskAutomationRules
            .Where(r => r.IsActive && r.TriggerType == triggerType)
            .OrderBy(r => r.Priority)
            .ToListAsync();
    }

    public async Task<IEnumerable<TaskAutomationRule>> GetActiveRulesAsync()
    {
        return await _context.TaskAutomationRules
            .Where(r => r.IsActive)
            .Include(r => r.Template)
            .OrderBy(r => r.Priority)
            .ThenBy(r => r.Name)
            .ToListAsync();
    }

    public async Task UpdateRuleTriggerStatsAsync(int ruleId, bool success)
    {
        TaskAutomationRule? rule = await _context.TaskAutomationRules.FindAsync(ruleId);
        if (rule != null)
        {
            rule.TriggerCount++;
            rule.LastTriggered = DateTime.UtcNow;
            
            // Update success rate
            decimal currentSuccessRate = rule.SuccessRate;
            int totalTriggers = rule.TriggerCount;
            int successfulTriggers = (int)(currentSuccessRate / 100 * (totalTriggers - 1)) + (success ? 1 : 0);
            rule.SuccessRate = totalTriggers > 0 ? (decimal)successfulTriggers / totalTriggers * 100 : 0;
            
            await _context.SaveChangesAsync();
        }
    }

    public async Task RecordRuleTriggerAsync(int ruleId)
    {
        TaskAutomationRule? rule = await _context.TaskAutomationRules.FindAsync(ruleId);
        if (rule != null)
        {
            rule.TriggerCount++;
            rule.LastTriggered = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }

    // Workflow Steps
    public async Task<IEnumerable<WorkflowStep>> GetWorkflowStepsAsync(int templateId)
    {
        return await _context.WorkflowSteps
            .Where(s => s.TemplateId == templateId)
            .OrderBy(s => s.StepOrder)
            .ToListAsync();
    }

    public async Task<WorkflowStep?> GetWorkflowStepByIdAsync(int stepId)
    {
        return await _context.WorkflowSteps
            .Include(s => s.Template)
            .FirstOrDefaultAsync(s => s.Id == stepId);
    }

    public async Task<WorkflowStep> CreateWorkflowStepAsync(WorkflowStep step)
    {
        step.CreatedAt = DateTime.UtcNow;
        _context.WorkflowSteps.Add(step);
        await _context.SaveChangesAsync();
        return step;
    }

    public async Task<WorkflowStep> UpdateWorkflowStepAsync(WorkflowStep step)
    {
        step.UpdatedAt = DateTime.UtcNow;
        _context.WorkflowSteps.Update(step);
        await _context.SaveChangesAsync();
        return step;
    }

    public async Task DeleteWorkflowStepAsync(int stepId)
    {
        WorkflowStep? step = await _context.WorkflowSteps.FindAsync(stepId);
        if (step != null)
        {
            _context.WorkflowSteps.Remove(step);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<IEnumerable<WorkflowStep>> GetWorkflowStepsByOrderAsync(int templateId)
    {
        return await _context.WorkflowSteps
            .Where(s => s.TemplateId == templateId && s.IsActive)
            .OrderBy(s => s.StepOrder)
            .ThenBy(s => s.Name)
            .ToListAsync();
    }
} 