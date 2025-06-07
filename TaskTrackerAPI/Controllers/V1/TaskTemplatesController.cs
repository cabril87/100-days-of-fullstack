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
using System.Security.Claims;
using System.Threading.Tasks;
using TaskTrackerAPI.DTOs.Tasks;
using TaskTrackerAPI.Services.Interfaces;
using System.Linq;
using TaskTrackerAPI.Controllers.V2;
using TaskTrackerAPI.Attributes;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Controllers.V1;

/// <summary>
/// Task templates controller - handles task template creation, management, and marketplace.
/// Accessible to all authenticated users (RegularUser and above).
/// Marketplace features are publicly accessible for browsing.
/// </summary>
[ApiVersion("1.0")]
[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
[Authorize]
[RequireRole(UserRole.RegularUser)] // All authenticated users can manage their templates
public class TaskTemplatesController : BaseApiController
{
    private readonly ITaskTemplateService _templateService;
    private readonly ILogger<TaskTemplatesController> _logger;

    public TaskTemplatesController(
        ITaskTemplateService templateService,
        ILogger<TaskTemplatesController> logger)
    {
        _templateService = templateService;
        _logger = logger;
    }

    // GET: api/v1/tasktemplates
    [HttpGet]
    public async Task<ActionResult<IEnumerable<TaskTemplateDTO>>> GetUserTemplates()
    {
        try
        {
            int userId = GetUserId();
            IEnumerable<TaskTemplateDTO> templates = await _templateService.GetUserTaskTemplatesAsync(userId);
            return Ok(templates);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user templates");
            return StatusCode(500, "An error occurred while retrieving templates");
        }
    }

    // GET: api/v1/tasktemplates/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<TaskTemplateDTO>> GetTemplate(int id)
    {
        try
        {
            TaskTemplateDTO? template = await _templateService.GetTaskTemplateByIdAsync(id);
            if (template == null)
            {
                return NotFound($"Template with ID {id} not found");
            }

            return Ok(template);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving template {TemplateId}", id);
            return StatusCode(500, "An error occurred while retrieving the template");
        }
    }

    // POST: api/v1/tasktemplates
    [HttpPost]
    public async Task<ActionResult<TaskTemplateDTO>> CreateTemplate([FromBody] CreateTaskTemplateDTO createDto)
    {
        try
        {
            int userId = GetUserId();
            TaskTemplateDTO? template = await _templateService.CreateTaskTemplateAsync(userId, createDto);
            
            if (template == null)
            {
                return BadRequest("Failed to create template");
            }

            return CreatedAtAction(nameof(GetTemplate), new { id = template.Id }, template);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating template");
            return StatusCode(500, "An error occurred while creating the template");
        }
    }

    // PUT: api/v1/tasktemplates/{id}
    [HttpPut("{id}")]
    public async Task<ActionResult<TaskTemplateDTO>> UpdateTemplate(int id, [FromBody] UpdateTaskTemplateDTO updateDto)
    {
        try
        {
            int userId = GetUserId();
            TaskTemplateDTO? template = await _templateService.UpdateTaskTemplateAsync(userId, id, updateDto);
            
            if (template == null)
            {
                return NotFound($"Template with ID {id} not found or not accessible");
            }

            return Ok(template);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid("You don't have permission to update this template");
        }
        catch (ArgumentException ex)
        {
            return NotFound(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating template {TemplateId}", id);
            return StatusCode(500, "An error occurred while updating the template");
        }
    }

    // DELETE: api/v1/tasktemplates/{id}
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteTemplate(int id)
    {
        try
        {
            int userId = GetUserId();
            await _templateService.DeleteTaskTemplateAsync(userId, id);
            return NoContent();
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
        catch (ArgumentException ex)
        {
            return NotFound(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting template {TemplateId}", id);
            return StatusCode(500, "An error occurred while deleting the template");
        }
    }

    // POST: api/v1/tasktemplates/{id}/apply
    [HttpPost("{id}/apply")]
    public async Task<ActionResult<TemplateApplicationResultDTO>> ApplyTemplate(int id, [FromBody] ApplyTemplateDTO applyDto)
    {
        try
        {
            int userId = GetUserId();
            TemplateApplicationResultDTO result = await _templateService.ApplyTemplateAsync(userId, id, applyDto);
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
        catch (ArgumentException ex)
        {
            return NotFound(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error applying template {TemplateId}", id);
            return StatusCode(500, "An error occurred while applying the template");
        }
    }

    // GET: api/v1/tasktemplates/system
    [HttpGet("system")]
    public async Task<ActionResult<IEnumerable<TaskTemplateDTO>>> GetSystemTemplates()
    {
        try
        {
            IEnumerable<TaskTemplateDTO> templates = await _templateService.GetSystemTaskTemplatesAsync();
            return Ok(templates);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving system templates");
            return StatusCode(500, "An error occurred while retrieving system templates");
        }
    }

    // GET: api/v1/tasktemplates/marketplace
    [HttpGet("marketplace")]
    [AllowAnonymous] // Public marketplace browsing
    public async Task<ActionResult<IEnumerable<TaskTemplateDTO>>> GetMarketplaceTemplates()
    {
        try
        {
            IEnumerable<TaskTemplateDTO> templates = await _templateService.GetTemplateMarketplaceAsync();
            return Ok(templates);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving marketplace templates");
            return StatusCode(500, "An error occurred while retrieving marketplace templates");
        }
    }

    // GET: api/v1/tasktemplates/marketplace/category/{category}
    [HttpGet("marketplace/category/{category}")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<TaskTemplateDTO>>> GetTemplatesByCategory(string category)
    {
        try
        {
            IEnumerable<TaskTemplateDTO> templates = await _templateService.GetTemplatesByCategoryAsync(category);
            return Ok(templates);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving templates by category {Category}", category);
            return StatusCode(500, "An error occurred while retrieving templates by category");
        }
    }

    // GET: api/v1/tasktemplates/marketplace/search
    [HttpGet("marketplace/search")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<TaskTemplateDTO>>> SearchTemplates([FromQuery] string searchTerm)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(searchTerm))
            {
                return BadRequest("Search term is required");
            }

            IEnumerable<TaskTemplateDTO> templates = await _templateService.SearchTemplatesAsync(searchTerm);
            return Ok(templates);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching templates with term {SearchTerm}", searchTerm);
            return StatusCode(500, "An error occurred while searching templates");
        }
    }

    // GET: api/v1/tasktemplates/marketplace/featured
    [HttpGet("marketplace/featured")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<TaskTemplateDTO>>> GetFeaturedTemplates()
    {
        try
        {
            IEnumerable<TaskTemplateDTO> templates = await _templateService.GetFeaturedTemplatesAsync();
            return Ok(templates);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving featured templates");
            return StatusCode(500, "An error occurred while retrieving featured templates");
        }
    }

    // GET: api/v1/tasktemplates/marketplace/popular
    [HttpGet("marketplace/popular")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<TaskTemplateDTO>>> GetPopularTemplates([FromQuery] int count = 10)
    {
        try
        {
            if (count <= 0 || count > 100)
            {
                return BadRequest("Count must be between 1 and 100");
            }

            IEnumerable<TaskTemplateDTO> templates = await _templateService.GetPopularTemplatesAsync(count);
            return Ok(templates);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving popular templates");
            return StatusCode(500, "An error occurred while retrieving popular templates");
        }
    }

    // POST: api/v1/tasktemplates/{id}/publish
    [HttpPost("{id}/publish")]
    public async Task<ActionResult> PublishTemplate(int id)
    {
        try
        {
            int userId = GetUserId();
            bool success = await _templateService.PublishTemplateToMarketplaceAsync(id, userId);
            
            if (!success)
            {
                return NotFound($"Template with ID {id} not found or not accessible");
            }

            return Ok(new { message = "Template published to marketplace successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error publishing template {TemplateId}", id);
            return StatusCode(500, "An error occurred while publishing the template");
        }
    }

    // POST: api/v1/tasktemplates/{id}/unpublish
    [HttpPost("{id}/unpublish")]
    public async Task<ActionResult> UnpublishTemplate(int id)
    {
        try
        {
            int userId = GetUserId();
            bool success = await _templateService.UnpublishTemplateFromMarketplaceAsync(id, userId);
            
            if (!success)
            {
                return NotFound($"Template with ID {id} not found or not accessible");
            }

            return Ok(new { message = "Template unpublished from marketplace successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error unpublishing template {TemplateId}", id);
            return StatusCode(500, "An error occurred while unpublishing the template");
        }
    }

    // POST: api/v1/tasktemplates/{id}/rate
    [HttpPost("{id}/rate")]
    public async Task<ActionResult> RateTemplate(int id, [FromBody] RateTemplateDTO rateDto)
    {
        try
        {
            if (rateDto.Rating < 1 || rateDto.Rating > 5)
            {
                return BadRequest("Rating must be between 1 and 5");
            }

            await _templateService.UpdateTemplateRatingAsync(id, rateDto.Rating);
            return Ok(new { message = "Template rated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error rating template {TemplateId}", id);
            return StatusCode(500, "An error occurred while rating the template");
        }
    }

    // POST: api/v1/tasktemplates/{id}/download
    [HttpPost("{id}/download")]
    public async Task<ActionResult<TaskTemplateDTO>> DownloadTemplate(int id)
    {
        try
        {
            TaskTemplateDTO? template = await _templateService.GetTaskTemplateByIdAsync(id);
            if (template == null)
            {
                return NotFound($"Template with ID {id} not found");
            }

            // Increment download count
            await _templateService.IncrementTemplateDownloadCountAsync(id);

            return Ok(template);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error downloading template {TemplateId}", id);
            return StatusCode(500, "An error occurred while downloading the template");
        }
    }

    // POST: api/v1/tasktemplates/{id}/usage
    [HttpPost("{id}/usage")]
    public async Task<ActionResult<TemplateUsageAnalyticsDTO>> RecordTemplateUsage(int id, [FromBody] RecordUsageDTO usageDto)
    {
        try
        {
            int userId = GetUserId();
            TemplateUsageAnalyticsDTO analytics = await _templateService.RecordTemplateUsageAsync(
                id, userId, usageDto.Success, usageDto.CompletionTimeMinutes);
            
            return Ok(analytics);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error recording template usage for {TemplateId}", id);
            return StatusCode(500, "An error occurred while recording template usage");
        }
    }

    // GET: api/v1/tasktemplates/{id}/analytics
    [HttpGet("{id}/analytics")]
    public async Task<ActionResult<TemplateAnalyticsSummaryDTO>> GetTemplateAnalytics(int id)
    {
        try
        {
            TemplateAnalyticsSummaryDTO analytics = await _templateService.GetTemplateAnalyticsSummaryAsync(id);
            return Ok(analytics);
        }
        catch (ArgumentException ex)
        {
            return NotFound(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving template analytics for {TemplateId}", id);
            return StatusCode(500, "An error occurred while retrieving template analytics");
        }
    }

    // GET: api/v1/tasktemplates/automation
    [HttpGet("automation")]
    public async Task<ActionResult<IEnumerable<TaskTemplateDTO>>> GetAutomatedTemplates()
    {
        try
        {
            IEnumerable<TaskTemplateDTO> templates = await _templateService.GetAutomatedTemplatesAsync();
            return Ok(templates);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving automated templates");
            return StatusCode(500, "An error occurred while retrieving automated templates");
        }
    }

    // GET: api/v1/tasktemplates/automation/triggers/{triggerType}
    [HttpGet("automation/triggers/{triggerType}")]
    public async Task<ActionResult<IEnumerable<TaskTemplateDTO>>> GetTemplatesWithTriggers(string triggerType)
    {
        try
        {
            IEnumerable<TaskTemplateDTO> templates = await _templateService.GetTemplatesWithTriggersAsync(triggerType);
            return Ok(templates);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving templates with triggers {TriggerType}", triggerType);
            return StatusCode(500, "An error occurred while retrieving templates with triggers");
        }
    }

    // POST: api/v1/tasktemplates/{id}/automation/generate
    [HttpPost("{id}/automation/generate")]
    public async Task<ActionResult<TaskTemplateDTO>> GenerateAutomatedTasks(int id)
    {
        try
        {
            int userId = GetUserId();
            TaskTemplateDTO template = await _templateService.GenerateAutomatedTasksAsync(id, userId);
            return Ok(template);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
        catch (ArgumentException ex)
        {
            return NotFound(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating automated tasks for template {TemplateId}", id);
            return StatusCode(500, "An error occurred while generating automated tasks");
        }
    }

    // POST: api/v1/tasktemplates/{id}/workflow/execute
    [HttpPost("{id}/workflow/execute")]
    public async Task<ActionResult<WorkflowExecutionResultDTO>> ExecuteWorkflow(int id)
    {
        try
        {
            int userId = GetUserId();
            WorkflowExecutionResultDTO result = await _templateService.ExecuteWorkflowAsync(id, userId);
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
        catch (ArgumentException ex)
        {
            return NotFound(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error executing workflow for template {TemplateId}", id);
            return StatusCode(500, "An error occurred while executing the workflow");
        }
    }

    // GET: api/v1/tasktemplates/analytics/recommendations
    [HttpGet("analytics/recommendations")]
    public async Task<ActionResult<IEnumerable<string>>> GetAIRecommendations()
    {
        try
        {
            int userId = GetUserId();
            
            // Get user's template usage patterns to generate personalized recommendations
            IEnumerable<TaskTemplateDTO> userTemplates = await _templateService.GetUserTaskTemplatesAsync(userId);
            
            // Generate AI-powered template recommendations based on user patterns
            List<string> recommendations = new List<string>();
            
            if (userTemplates.Any())
            {
                int templateCount = userTemplates.Count();
                if (templateCount < 3)
                {
                    recommendations.Add("Consider creating more templates to automate your recurring tasks");
                }
                
                // Check for common patterns
                bool hasWorkTemplates = userTemplates.Any(t => t.Name?.ToLower().Contains("work") == true);
                bool hasPersonalTemplates = userTemplates.Any(t => t.Name?.ToLower().Contains("personal") == true);
                
                if (!hasWorkTemplates)
                {
                    recommendations.Add("Create work-focused templates to boost professional productivity");
                }
                
                if (!hasPersonalTemplates)
                {
                    recommendations.Add("Add personal task templates for better work-life balance");
                }
            }
            else
            {
                recommendations.AddRange(new[]
                {
                    "Start with a 'Daily Planning' template to organize your day",
                    "Create a 'Weekly Review' template to track your progress",
                    "Consider a 'Project Kickoff' template for new initiatives"
                });
            }
            
            // Add general recommendations
            recommendations.AddRange(new[]
            {
                "Based on productivity research, morning templates tend to have higher completion rates",
                "Templates with 3-5 tasks show optimal completion rates",
                "Consider adding time estimates to your template tasks for better planning"
            });
            
            return Ok(recommendations.Take(5)); // Limit to top 5 recommendations
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating AI recommendations for user {UserId}", GetUserId());
            return StatusCode(500, "An error occurred while generating recommendations");
        }
    }
} 