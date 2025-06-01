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
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using TaskTrackerAPI.Controllers.V2;
using TaskTrackerAPI.DTOs.Tasks;
using TaskTrackerAPI.Services.Interfaces;

namespace TaskTrackerAPI.Controllers.V1;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class TemplateAutomationController : BaseApiController
{
    private readonly ITemplateAutomationService _automationService;
    private readonly ILogger<TemplateAutomationController> _logger;

    public TemplateAutomationController(
        ITemplateAutomationService automationService,
        ILogger<TemplateAutomationController> logger)
    {
        _automationService = automationService ?? throw new ArgumentNullException(nameof(automationService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    // GET: api/v1/templateautomation/templates/{templateId}/rules
    [HttpGet("templates/{templateId}/rules")]
    public async Task<ActionResult<IEnumerable<AutomationRuleDTO>>> GetAutomationRules(int templateId)
    {
        try
        {
            IEnumerable<AutomationRuleDTO> rules = await _automationService.GetAutomationRulesAsync(templateId);
            return Ok(rules);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving automation rules for template {TemplateId}", templateId);
            return StatusCode(500, "An error occurred while retrieving automation rules");
        }
    }

    // GET: api/v1/templateautomation/rules/{ruleId}
    [HttpGet("rules/{ruleId}")]
    public async Task<ActionResult<AutomationRuleDTO>> GetAutomationRule(int ruleId)
    {
        try
        {
            AutomationRuleDTO? rule = await _automationService.GetAutomationRuleByIdAsync(ruleId);
            if (rule == null)
            {
                return NotFound($"Automation rule with ID {ruleId} not found");
            }
            return Ok(rule);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving automation rule {RuleId}", ruleId);
            return StatusCode(500, "An error occurred while retrieving the automation rule");
        }
    }

    // POST: api/v1/templateautomation/rules
    [HttpPost("rules")]
    public async Task<ActionResult<AutomationRuleDTO>> CreateAutomationRule([FromBody] CreateAutomationRuleDTO createDto)
    {
        try
        {
            AutomationRuleDTO rule = await _automationService.CreateAutomationRuleAsync(createDto);
            return CreatedAtAction(nameof(GetAutomationRule), new { ruleId = rule.Id }, rule);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating automation rule");
            return StatusCode(500, "An error occurred while creating the automation rule");
        }
    }

    // PUT: api/v1/templateautomation/rules/{ruleId}
    [HttpPut("rules/{ruleId}")]
    public async Task<ActionResult<AutomationRuleDTO>> UpdateAutomationRule(int ruleId, [FromBody] UpdateAutomationRuleDTO updateDto)
    {
        try
        {
            AutomationRuleDTO rule = await _automationService.UpdateAutomationRuleAsync(ruleId, updateDto);
            return Ok(rule);
        }
        catch (ArgumentException ex)
        {
            return NotFound(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating automation rule {RuleId}", ruleId);
            return StatusCode(500, "An error occurred while updating the automation rule");
        }
    }

    // DELETE: api/v1/templateautomation/rules/{ruleId}
    [HttpDelete("rules/{ruleId}")]
    public async Task<ActionResult> DeleteAutomationRule(int ruleId)
    {
        try
        {
            await _automationService.DeleteAutomationRuleAsync(ruleId);
            return NoContent();
        }
        catch (ArgumentException ex)
        {
            return NotFound(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting automation rule {RuleId}", ruleId);
            return StatusCode(500, "An error occurred while deleting the automation rule");
        }
    }

    // POST: api/v1/templateautomation/evaluate/{triggerType}
    [HttpPost("evaluate/{triggerType}")]
    public async Task<ActionResult<IEnumerable<AutomationRuleDTO>>> EvaluateAutomationTriggers(string triggerType)
    {
        try
        {
            IEnumerable<AutomationRuleDTO> triggeredRules = await _automationService.EvaluateAutomationTriggersAsync(triggerType);
            return Ok(triggeredRules);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error evaluating automation triggers for type {TriggerType}", triggerType);
            return StatusCode(500, "An error occurred while evaluating automation triggers");
        }
    }

    // POST: api/v1/templateautomation/rules/{ruleId}/execute
    [HttpPost("rules/{ruleId}/execute")]
    public async Task<ActionResult<AutomationExecutionResultDTO>> ExecuteAutomationActions(int ruleId, [FromBody] ExecuteAutomationDTO executeDto)
    {
        try
        {
            AutomationExecutionResultDTO result = await _automationService.ExecuteAutomationActionsAsync(ruleId, executeDto.Context);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error executing automation actions for rule {RuleId}", ruleId);
            return StatusCode(500, "An error occurred while executing automation actions");
        }
    }

    // POST: api/v1/templateautomation/schedule
    [HttpPost("schedule")]
    public async Task<ActionResult<IEnumerable<TaskTemplateDTO>>> ScheduleAutomatedTasks()
    {
        try
        {
            int userId = GetCurrentUserId();
            IEnumerable<TaskTemplateDTO> scheduledTemplates = await _automationService.ScheduleAutomatedTasksAsync(userId);
            return Ok(scheduledTemplates);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error scheduling automated tasks for user {UserId}", GetCurrentUserId());
            return StatusCode(500, "An error occurred while scheduling automated tasks");
        }
    }

    // POST: api/v1/templateautomation/templates/{templateId}/workflow/process
    [HttpPost("templates/{templateId}/workflow/process")]
    public async Task<ActionResult<WorkflowExecutionResultDTO>> ProcessWorkflowSteps(int templateId)
    {
        try
        {
            int userId = GetCurrentUserId();
            WorkflowExecutionResultDTO result = await _automationService.ProcessWorkflowStepsAsync(templateId, userId);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing workflow steps for template {TemplateId}", templateId);
            return StatusCode(500, "An error occurred while processing workflow steps");
        }
    }

    // GET: api/v1/templateautomation/patterns/analyze
    [HttpGet("patterns/analyze")]
    public async Task<ActionResult<IEnumerable<AutomationSuggestionDTO>>> AnalyzeUserPatterns()
    {
        try
        {
            int userId = GetCurrentUserId();
            IEnumerable<AutomationSuggestionDTO> suggestions = await _automationService.AnalyzeUserPatternsAsync(userId);
            return Ok(suggestions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error analyzing user patterns for user {UserId}", GetCurrentUserId());
            return StatusCode(500, "An error occurred while analyzing user patterns");
        }
    }

    // POST: api/v1/templateautomation/patterns/smart-rule
    [HttpPost("patterns/smart-rule")]
    public async Task<ActionResult<AutomationRuleDTO>> CreateSmartAutomationRule([FromBody] PatternAnalysisDTO pattern)
    {
        try
        {
            int userId = GetCurrentUserId();
            AutomationRuleDTO rule = await _automationService.CreateSmartAutomationRuleAsync(userId, pattern);
            return CreatedAtAction(nameof(GetAutomationRule), new { ruleId = rule.Id }, rule);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating smart automation rule for user {UserId}", GetCurrentUserId());
            return StatusCode(500, "An error occurred while creating the smart automation rule");
        }
    }

    // GET: api/v1/templateautomation/insights
    [HttpGet("insights")]
    public async Task<ActionResult<IEnumerable<AutomationInsightDTO>>> GetAutomationInsights()
    {
        try
        {
            int userId = GetCurrentUserId();
            IEnumerable<AutomationInsightDTO> insights = await _automationService.GetAutomationInsightsAsync(userId);
            return Ok(insights);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving automation insights for user {UserId}", GetCurrentUserId());
            return StatusCode(500, "An error occurred while retrieving automation insights");
        }
    }

    // GET: api/v1/templateautomation/templates/{templateId}/workflow/steps
    [HttpGet("templates/{templateId}/workflow/steps")]
    public async Task<ActionResult<IEnumerable<WorkflowStepDTO>>> GetWorkflowSteps(int templateId)
    {
        try
        {
            IEnumerable<WorkflowStepDTO> steps = await _automationService.GetWorkflowStepsAsync(templateId);
            return Ok(steps);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving workflow steps for template {TemplateId}", templateId);
            return StatusCode(500, "An error occurred while retrieving workflow steps");
        }
    }

    // POST: api/v1/templateautomation/workflow/steps
    [HttpPost("workflow/steps")]
    public async Task<ActionResult<WorkflowStepDTO>> CreateWorkflowStep([FromBody] CreateWorkflowStepDTO createDto)
    {
        try
        {
            WorkflowStepDTO step = await _automationService.CreateWorkflowStepAsync(createDto);
            return CreatedAtAction(nameof(GetWorkflowSteps), new { templateId = step.TemplateId }, step);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating workflow step");
            return StatusCode(500, "An error occurred while creating the workflow step");
        }
    }

    // PUT: api/v1/templateautomation/workflow/steps/{stepId}
    [HttpPut("workflow/steps/{stepId}")]
    public async Task<ActionResult<WorkflowStepDTO>> UpdateWorkflowStep(int stepId, [FromBody] UpdateWorkflowStepDTO updateDto)
    {
        try
        {
            WorkflowStepDTO step = await _automationService.UpdateWorkflowStepAsync(stepId, updateDto);
            return Ok(step);
        }
        catch (ArgumentException ex)
        {
            return NotFound(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating workflow step {StepId}", stepId);
            return StatusCode(500, "An error occurred while updating the workflow step");
        }
    }

    // DELETE: api/v1/templateautomation/workflow/steps/{stepId}
    [HttpDelete("workflow/steps/{stepId}")]
    public async Task<ActionResult> DeleteWorkflowStep(int stepId)
    {
        try
        {
            await _automationService.DeleteWorkflowStepAsync(stepId);
            return NoContent();
        }
        catch (ArgumentException ex)
        {
            return NotFound(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting workflow step {StepId}", stepId);
            return StatusCode(500, "An error occurred while deleting the workflow step");
        }
    }

    // POST: api/v1/templateautomation/templates/{templateId}/workflow/validate
    [HttpPost("templates/{templateId}/workflow/validate")]
    public async Task<ActionResult<WorkflowValidationResultDTO>> ValidateWorkflow(int templateId)
    {
        try
        {
            WorkflowValidationResultDTO result = await _automationService.ValidateWorkflowAsync(templateId);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating workflow for template {TemplateId}", templateId);
            return StatusCode(500, "An error occurred while validating the workflow");
        }
    }

    // GET: api/v1/templateautomation/health
    [HttpGet("health")]
    [AllowAnonymous]
    public async Task<ActionResult<AutomationHealthDTO>> GetAutomationHealth()
    {
        try
        {
            // Get actual automation system metrics
            IEnumerable<AutomationRuleDTO> activeRules = await _automationService.EvaluateAutomationTriggersAsync("HealthCheck");
            
            // Basic health check for automation system
            AutomationHealthDTO health = new AutomationHealthDTO
            {
                Status = "Healthy",
                Timestamp = DateTime.UtcNow,
                ActiveRulesCount = activeRules?.Count() ?? 0,
                TriggersProcessedToday = 0, // Would be calculated from metrics service
                SystemLoad = "Normal"
            };

            return Ok(health);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking automation health");
            return StatusCode(500, "An error occurred while checking automation health");
        }
    }

    // POST: api/v1/templateautomation/bulk-evaluate
    [HttpPost("bulk-evaluate")]
    public async Task<ActionResult<BulkEvaluationResultDTO>> BulkEvaluateAutomationTriggers([FromBody] BulkEvaluationRequestDTO request)
    {
        try
        {
            BulkEvaluationResultDTO result = new BulkEvaluationResultDTO
            {
                ProcessedRules = 0,
                TriggeredRules = 0,
                Errors = new List<string>(),
                StartTime = DateTime.UtcNow
            };

            foreach (string triggerType in request.TriggerTypes)
            {
                try
                {
                    IEnumerable<AutomationRuleDTO> triggered = await _automationService.EvaluateAutomationTriggersAsync(triggerType);
                    result.ProcessedRules++;
                    result.TriggeredRules += triggered.Count();
                }
                catch (Exception ex)
                {
                    result.Errors.Add($"Error evaluating trigger type {triggerType}: {ex.Message}");
                }
            }

            result.EndTime = DateTime.UtcNow;
            result.Success = result.Errors.Count == 0;

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error performing bulk evaluation");
            return StatusCode(500, "An error occurred during bulk evaluation");
        }
    }

    private int GetCurrentUserId()
    {
        string? userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
        {
            throw new UnauthorizedAccessException("User ID not found or invalid");
        }
        return userId;
    }
} 