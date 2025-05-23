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
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.DTOs.Tags;
using TaskTrackerAPI.DTOs.Tasks;
using TaskTrackerAPI.Services.Interfaces;

namespace TaskTrackerAPI.Controllers.V1;

[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
[Route("api/[controller]")]
[ApiController]
[Authorize]
public class TagsController : ControllerBase
{
    private readonly ITagService _tagService;
    private readonly ILogger<TagsController> _logger;

    public TagsController(ITagService tagService, ILogger<TagsController> logger)
    {
        _tagService = tagService;
        _logger = logger;
    }

    // GET: api/Tags
    [HttpGet]
    public async Task<ActionResult<IEnumerable<TagDTO>>> GetTags()
    {
        try
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            
            IEnumerable<TagDTO> tags = await _tagService.GetAllTagsAsync(userId);
            
            return Ok(tags);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving tags");
            return StatusCode(500, "An error occurred while retrieving tags.");
        }
    }

    // GET: api/Tags/5
    [HttpGet("{id}")]
    public async Task<ActionResult<TagDTO>> GetTag(int id)
    {
        try
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            
            TagDTO? tag = await _tagService.GetTagByIdAsync(id, userId);
            
            if (tag == null)
            {
                return NotFound($"Tag with ID {id} not found");
            }
            
            return Ok(tag);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving tag with ID {TagId}", id);
            return StatusCode(500, "An error occurred while retrieving the tag.");
        }
    }

    // POST: api/Tags
    [HttpPost]
    public async Task<ActionResult<TagDTO>> CreateTag(TagCreateDTO createDto)
    {
        try
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            
            TagDTO tag = await _tagService.CreateTagAsync(userId, createDto);
            
            return CreatedAtAction(nameof(GetTag), new { id = tag.Id }, tag);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating tag");
            return StatusCode(500, "An error occurred while creating the tag.");
        }
    }

    // PUT: api/Tags/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTag(int id, TagUpdateDTO updateDto)
    {
        try
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            
            TagDTO? tag = await _tagService.UpdateTagAsync(id, userId, updateDto);
            
            if (tag == null)
            {
                return NotFound($"Tag with ID {id} not found");
            }
            
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating tag with ID {TagId}", id);
            return StatusCode(500, "An error occurred while updating the tag.");
        }
    }

    // DELETE: api/Tags/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTag(int id)
    {
        try
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            
            bool success = await _tagService.DeleteTagAsync(id, userId);
            
            if (!success)
            {
                return NotFound($"Tag with ID {id} not found");
            }
            
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting tag with ID {TagId}", id);
            return StatusCode(500, "An error occurred while deleting the tag.");
        }
    }
    
    // GET: api/Tags/search
    [HttpGet("search")]
    public async Task<ActionResult<IEnumerable<TagDTO>>> SearchTags([FromQuery] string term)
    {
        try
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            
            IEnumerable<TagDTO> tags = await _tagService.SearchTagsAsync(userId, term);
            
            return Ok(tags);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching tags");
            return StatusCode(500, "An error occurred while searching tags.");
        }
    }
    
    // GET: api/Tags/5/tasks
    [HttpGet("{id}/tasks")]
    public async Task<ActionResult<IEnumerable<TaskItemDTO>>> GetTasksByTag(int id)
    {
        try
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            
            IEnumerable<TaskItemDTO> tasks = await _tagService.GetTasksByTagAsync(id, userId);
            
            return Ok(tasks);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving tasks for tag with ID {TagId}", id);
            return StatusCode(500, "An error occurred while retrieving tasks.");
        }
    }
    
    // GET: api/Tags/5/usage-count
    [HttpGet("{id}/usage-count")]
    public async Task<ActionResult<int>> GetTagUsageCount(int id)
    {
        try
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            
            int count = await _tagService.GetTagUsageCountAsync(id, userId);
            
            return Ok(count);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting usage count for tag with ID {TagId}", id);
            return StatusCode(500, "An error occurred while getting the usage count.");
        }
    }
    
    // GET: api/Tags/statistics
    [HttpGet("statistics")]
    public async Task<ActionResult<Dictionary<string, int>>> GetTagStatistics()
    {
        try
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            
            Dictionary<string, int> statistics = await _tagService.GetTagStatisticsAsync(userId);
            
            return Ok(statistics);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving tag statistics");
            return StatusCode(500, "An error occurred while retrieving tag statistics.");
        }
    }
} 