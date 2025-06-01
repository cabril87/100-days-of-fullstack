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
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.DTOs.Boards;
using TaskTrackerAPI.Services.Interfaces;

namespace TaskTrackerAPI.Controllers.V1;

/// <summary>
/// API controller for board template management and marketplace
/// Supports template creation, marketplace browsing, rating system, and board creation from templates
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/board-templates")]
[Authorize]
public class BoardTemplatesController : ControllerBase
{
    private readonly IBoardTemplateService _boardTemplateService;
    private readonly IUserAccessor _userAccessor;
    private readonly ILogger<BoardTemplatesController> _logger;

    public BoardTemplatesController(
        IBoardTemplateService boardTemplateService,
        IUserAccessor userAccessor,
        ILogger<BoardTemplatesController> logger)
    {
        _boardTemplateService = boardTemplateService ?? throw new ArgumentNullException(nameof(boardTemplateService));
        _userAccessor = userAccessor ?? throw new ArgumentNullException(nameof(userAccessor));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <summary>
    /// Get all public templates (marketplace)
    /// </summary>
    /// <param name="category">Filter by category</param>
    /// <param name="tags">Filter by tags (comma-separated)</param>
    /// <param name="searchTerm">Search in name and description</param>
    /// <param name="sortBy">Sort by: usage, rating, created, name</param>
    /// <param name="limit">Maximum number of templates to return</param>
    /// <returns>List of public templates</returns>
    [HttpGet("marketplace")]
    [ProducesResponseType(typeof(IEnumerable<BoardTemplateDTO>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<BoardTemplateDTO>>> GetMarketplaceTemplates(
        [FromQuery] string? category = null,
        [FromQuery] string? tags = null,
        [FromQuery] string? searchTerm = null,
        [FromQuery] string sortBy = "usage",
        [FromQuery] int limit = 50)
    {
        try
        {
            int userId = int.Parse(_userAccessor.GetCurrentUserId());
            
            IEnumerable<BoardTemplateDTO> templates;
            
            if (!string.IsNullOrEmpty(searchTerm))
            {
                templates = await _boardTemplateService.SearchTemplatesAsync(searchTerm);
            }
            else if (!string.IsNullOrEmpty(tags))
            {
                templates = await _boardTemplateService.GetTemplatesByTagsAsync(tags);
            }
            else if (!string.IsNullOrEmpty(category))
            {
                templates = await _boardTemplateService.GetTemplatesByCategoryAsync(category);
            }
            else
            {
                templates = await _boardTemplateService.GetPublicTemplatesAsync();
            }

            return Ok(templates);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting marketplace templates");
            return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while retrieving marketplace templates");
        }
    }

    /// <summary>
    /// Get user's own templates
    /// </summary>
    /// <returns>List of user's templates</returns>
    [HttpGet("my-templates")]
    [ProducesResponseType(typeof(IEnumerable<BoardTemplateDTO>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<BoardTemplateDTO>>> GetMyTemplates()
    {
        try
        {
            int userId = int.Parse(_userAccessor.GetCurrentUserId());
            
            IEnumerable<BoardTemplateDTO> templates = await _boardTemplateService.GetUserTemplatesAsync(userId);

            return Ok(templates);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user templates for user {UserId}", _userAccessor.GetCurrentUserId());
            return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while retrieving your templates");
        }
    }

    /// <summary>
    /// Get default system templates
    /// </summary>
    /// <returns>List of default templates</returns>
    [HttpGet("defaults")]
    [ProducesResponseType(typeof(IEnumerable<BoardTemplateDTO>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<BoardTemplateDTO>>> GetDefaultTemplates()
    {
        try
        {
            // For now, return public templates as defaults
            IEnumerable<BoardTemplateDTO> templates = await _boardTemplateService.GetPublicTemplatesAsync();

            return Ok(templates);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting default templates");
            return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while retrieving default templates");
        }
    }

    /// <summary>
    /// Get popular templates
    /// </summary>
    /// <param name="limit">Maximum number of templates to return</param>
    /// <returns>List of popular templates</returns>
    [HttpGet("popular")]
    [ProducesResponseType(typeof(IEnumerable<BoardTemplateDTO>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<BoardTemplateDTO>>> GetPopularTemplates([FromQuery] int limit = 10)
    {
        try
        {
            IEnumerable<BoardTemplateDTO> templates = await _boardTemplateService.GetPopularTemplatesAsync(limit);

            return Ok(templates);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting popular templates");
            return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while retrieving popular templates");
        }
    }

    /// <summary>
    /// Get top-rated templates
    /// </summary>
    /// <param name="limit">Maximum number of templates to return</param>
    /// <returns>List of top-rated templates</returns>
    [HttpGet("top-rated")]
    [ProducesResponseType(typeof(IEnumerable<BoardTemplateDTO>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<BoardTemplateDTO>>> GetTopRatedTemplates([FromQuery] int limit = 10)
    {
        try
        {
            IEnumerable<BoardTemplateDTO> templates = await _boardTemplateService.GetTopRatedTemplatesAsync(limit);

            return Ok(templates);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting top-rated templates");
            return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while retrieving top-rated templates");
        }
    }

    /// <summary>
    /// Get template by ID
    /// </summary>
    /// <param name="templateId">Template ID</param>
    /// <returns>Template details</returns>
    [HttpGet("{templateId:int}")]
    [ProducesResponseType(typeof(BoardTemplateDTO), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<BoardTemplateDTO>> GetTemplate(int templateId)
    {
        try
        {
            int userId = int.Parse(_userAccessor.GetCurrentUserId());
            
            BoardTemplateDTO? template = await _boardTemplateService.GetTemplateByIdAsync(templateId, userId);
            if (template == null)
            {
                return NotFound($"Template {templateId} not found");
            }

            return Ok(template);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access to template {TemplateId}", templateId);
            return Forbid();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting template {TemplateId}", templateId);
            return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while retrieving the template");
        }
    }

    /// <summary>
    /// Create a new template
    /// </summary>
    /// <param name="createDto">Template creation data</param>
    /// <returns>Created template</returns>
    [HttpPost]
    [ProducesResponseType(typeof(BoardTemplateDTO), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<BoardTemplateDTO>> CreateTemplate([FromBody] DTOs.Boards.CreateBoardTemplateDTO createDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            int userId = int.Parse(_userAccessor.GetCurrentUserId());
            
            BoardTemplateDTO createdTemplate = await _boardTemplateService.CreateTemplateAsync(createDto, userId);
            
            return CreatedAtAction(
                nameof(GetTemplate), 
                new { templateId = createdTemplate.Id }, 
                createdTemplate);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Invalid operation creating template");
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating template");
            return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while creating the template");
        }
    }

    /// <summary>
    /// Update an existing template
    /// </summary>
    /// <param name="templateId">Template ID</param>
    /// <param name="updateDto">Template update data</param>
    /// <returns>Updated template</returns>
    [HttpPut("{templateId:int}")]
    [ProducesResponseType(typeof(BoardTemplateDTO), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<BoardTemplateDTO>> UpdateTemplate(
        int templateId, 
        [FromBody] UpdateBoardTemplateDTO updateDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            int userId = int.Parse(_userAccessor.GetCurrentUserId());
            
            BoardTemplateDTO updatedTemplate = await _boardTemplateService.UpdateTemplateAsync(templateId, updateDto, userId);
            
            return Ok(updatedTemplate);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access to update template {TemplateId}", templateId);
            return Forbid();
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("not found"))
        {
            _logger.LogWarning(ex, "Template {TemplateId} not found", templateId);
            return NotFound($"Template {templateId} not found");
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Invalid operation updating template {TemplateId}", templateId);
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating template {TemplateId}", templateId);
            return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while updating the template");
        }
    }

    /// <summary>
    /// Delete a template
    /// </summary>
    /// <param name="templateId">Template ID</param>
    /// <returns>Success status</returns>
    [HttpDelete("{templateId:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteTemplate(int templateId)
    {
        try
        {
            int userId = int.Parse(_userAccessor.GetCurrentUserId());
            
            bool success = await _boardTemplateService.DeleteTemplateAsync(templateId, userId);
            if (!success)
            {
                return NotFound($"Template {templateId} not found");
            }

            return NoContent();
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access to delete template {TemplateId}", templateId);
            return Forbid();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting template {TemplateId}", templateId);
            return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while deleting the template");
        }
    }

    /// <summary>
    /// Create a board from a template
    /// </summary>
    /// <param name="templateId">Template ID</param>
    /// <param name="createDto">Board creation data</param>
    /// <returns>Created board</returns>
    [HttpPost("{templateId:int}/create-board")]
    [ProducesResponseType(typeof(BoardDTO), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<BoardDTO>> CreateBoardFromTemplate(
        int templateId, 
        [FromBody] CreateBoardFromTemplateDTO createDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            int userId = int.Parse(_userAccessor.GetCurrentUserId());
            
            BoardDTO createdBoard = await _boardTemplateService.CreateBoardFromTemplateAsync(
                templateId, createDto.BoardName, createDto.BoardDescription, userId);
            
            return CreatedAtAction(
                "GetBoard", 
                "Boards",
                new { boardId = createdBoard.Id }, 
                createdBoard);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access to create board from template {TemplateId}", templateId);
            return Forbid();
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("not found"))
        {
            _logger.LogWarning(ex, "Template {TemplateId} not found", templateId);
            return NotFound($"Template {templateId} not found");
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Invalid operation creating board from template {TemplateId}", templateId);
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating board from template {TemplateId}", templateId);
            return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while creating the board");
        }
    }

    /// <summary>
    /// Save a board as a template
    /// </summary>
    /// <param name="boardId">Board ID to save as template</param>
    /// <param name="saveDto">Template save data</param>
    /// <returns>Created template</returns>
    [HttpPost("save-board/{boardId:int}")]
    [ProducesResponseType(typeof(BoardTemplateDTO), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<BoardTemplateDTO>> SaveBoardAsTemplate(
        int boardId, 
        [FromBody] SaveBoardAsTemplateDTO saveDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            int userId = int.Parse(_userAccessor.GetCurrentUserId());
            
            BoardTemplateDTO createdTemplate = await _boardTemplateService.SaveBoardAsTemplateAsync(
                boardId, saveDto.Name, saveDto.Description, saveDto.IsPublic, 
                saveDto.Category, saveDto.Tags, userId);
            
            return CreatedAtAction(
                nameof(GetTemplate), 
                new { templateId = createdTemplate.Id }, 
                createdTemplate);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access to save board {BoardId} as template", boardId);
            return Forbid();
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("not found"))
        {
            _logger.LogWarning(ex, "Board {BoardId} not found", boardId);
            return NotFound($"Board {boardId} not found");
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Invalid operation saving board {BoardId} as template", boardId);
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving board {BoardId} as template", boardId);
            return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while saving the board as template");
        }
    }

    /// <summary>
    /// Duplicate a template
    /// </summary>
    /// <param name="templateId">Template ID to duplicate</param>
    /// <param name="newName">Name for the duplicate template</param>
    /// <returns>Duplicated template</returns>
    [HttpPost("{templateId:int}/duplicate")]
    [ProducesResponseType(typeof(BoardTemplateDTO), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<BoardTemplateDTO>> DuplicateTemplate(
        int templateId, 
        [FromBody] string newName)
    {
        if (string.IsNullOrWhiteSpace(newName))
        {
            return BadRequest("Template name is required");
        }

        try
        {
            int userId = int.Parse(_userAccessor.GetCurrentUserId());
            
            BoardTemplateDTO duplicatedTemplate = await _boardTemplateService.DuplicateTemplateAsync(templateId, newName, userId);
            
            return CreatedAtAction(
                nameof(GetTemplate), 
                new { templateId = duplicatedTemplate.Id }, 
                duplicatedTemplate);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access to duplicate template {TemplateId}", templateId);
            return Forbid();
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("not found"))
        {
            _logger.LogWarning(ex, "Template {TemplateId} not found", templateId);
            return NotFound($"Template {templateId} not found");
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Invalid operation duplicating template {TemplateId}", templateId);
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error duplicating template {TemplateId}", templateId);
            return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while duplicating the template");
        }
    }

    /// <summary>
    /// Rate a template
    /// </summary>
    /// <param name="templateId">Template ID</param>
    /// <param name="rating">Rating value (1-5)</param>
    /// <returns>Success status</returns>
    [HttpPost("{templateId:int}/rate")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RateTemplate(int templateId, [FromBody] decimal rating)
    {
        if (rating < 1 || rating > 5)
        {
            return BadRequest("Rating must be between 1 and 5");
        }

        try
        {
            int userId = int.Parse(_userAccessor.GetCurrentUserId());
            
            bool success = await _boardTemplateService.RateTemplateAsync(templateId, rating, userId);
            if (!success)
            {
                return BadRequest("Failed to rate template");
            }

            return Ok(new { message = "Template rated successfully" });
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access to rate template {TemplateId}", templateId);
            return Forbid();
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("not found"))
        {
            _logger.LogWarning(ex, "Template {TemplateId} not found", templateId);
            return NotFound($"Template {templateId} not found");
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Invalid operation rating template {TemplateId}", templateId);
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error rating template {TemplateId}", templateId);
            return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while rating the template");
        }
    }

    /// <summary>
    /// Get template statistics
    /// </summary>
    /// <param name="templateId">Template ID</param>
    /// <returns>Template statistics</returns>
    [HttpGet("{templateId:int}/statistics")]
    [ProducesResponseType(typeof(TemplateStatisticsDTO), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TemplateStatisticsDTO>> GetTemplateStatistics(int templateId)
    {
        try
        {
            int userId = int.Parse(_userAccessor.GetCurrentUserId());
            
            TemplateStatisticsDTO statistics = await _boardTemplateService.GetTemplateStatisticsAsync(templateId, userId);
            
            return Ok(statistics);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access to statistics for template {TemplateId}", templateId);
            return Forbid();
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("not found"))
        {
            _logger.LogWarning(ex, "Template {TemplateId} not found", templateId);
            return NotFound($"Template {templateId} not found");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting statistics for template {TemplateId}", templateId);
            return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while retrieving template statistics");
        }
    }

    /// <summary>
    /// Get marketplace analytics
    /// </summary>
    /// <returns>Marketplace analytics</returns>
    [HttpGet("marketplace/analytics")]
    [ProducesResponseType(typeof(TemplateMarketplaceAnalyticsDTO), StatusCodes.Status200OK)]
    public async Task<ActionResult<TemplateMarketplaceAnalyticsDTO>> GetMarketplaceAnalytics()
    {
        try
        {
            int userId = int.Parse(_userAccessor.GetCurrentUserId());
            
            TemplateMarketplaceAnalyticsDTO analytics = await _boardTemplateService.GetMarketplaceAnalyticsAsync(userId);
            
            return Ok(analytics);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting marketplace analytics");
            return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while retrieving marketplace analytics");
        }
    }

    /// <summary>
    /// Get available template categories
    /// </summary>
    /// <returns>List of categories</returns>
    [HttpGet("categories")]
    [ProducesResponseType(typeof(IEnumerable<string>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<string>>> GetCategories()
    {
        try
        {
            IEnumerable<string> categories = await _boardTemplateService.GetCategoriesAsync();
            
            return Ok(categories);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting template categories");
            return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while retrieving categories");
        }
    }

    /// <summary>
    /// Report a template for inappropriate content
    /// </summary>
    /// <param name="templateId">Template ID</param>
    /// <param name="reason">Reason for reporting</param>
    /// <returns>Success status</returns>
    [HttpPost("{templateId:int}/report")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ReportTemplate(int templateId, [FromBody] string reason)
    {
        if (string.IsNullOrWhiteSpace(reason))
        {
            return BadRequest("Reason for reporting is required");
        }

        try
        {
            int userId = int.Parse(_userAccessor.GetCurrentUserId());
            
            bool success = await _boardTemplateService.ReportTemplateAsync(templateId, reason, userId);
            if (!success)
            {
                return BadRequest("Failed to report template");
            }

            return Ok(new { message = "Template reported successfully" });
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("not found"))
        {
            _logger.LogWarning(ex, "Template {TemplateId} not found", templateId);
            return NotFound($"Template {templateId} not found");
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Invalid operation reporting template {TemplateId}", templateId);
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error reporting template {TemplateId}", templateId);
            return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while reporting the template");
        }
    }
} 