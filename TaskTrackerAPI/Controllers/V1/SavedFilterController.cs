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
using TaskTrackerAPI.DTOs.Analytics;
using TaskTrackerAPI.Services.Interfaces;
using TaskTrackerAPI.Attributes;
using Microsoft.Extensions.Logging;
using System.Threading.Tasks;
using System;
using System.Collections.Generic;
using TaskTrackerAPI.Controllers.V2;

namespace TaskTrackerAPI.Controllers.V1
{
    [ApiVersion("1.0")]
    [Authorize]
    [ApiController]
    [Route("api/v{version:apiVersion}/saved-filters")]
    [SecurityRequirements(SecurityRequirementLevel.Authenticated)]
    public class SavedFilterController : BaseApiController
    {
        private readonly ISavedFilterService _savedFilterService;
        private readonly ILogger<SavedFilterController> _logger;

        public SavedFilterController(
            ISavedFilterService savedFilterService,
            ILogger<SavedFilterController> logger)
        {
            _savedFilterService = savedFilterService;
            _logger = logger;
        }

        /// <summary>
        /// Get all saved filters for the current user
        /// </summary>
        /// <returns>List of saved filters</returns>
        [HttpGet]
        public async Task<IActionResult> GetUserFilters()
        {
            try
            {
                int userId = GetUserIdFromClaims();
                IEnumerable<SavedFilterDTO> filters = await _savedFilterService.GetUserFiltersAsync(userId);
                return Ok(filters);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user filters");
                return StatusCode(500, "An error occurred while retrieving saved filters.");
            }
        }

        /// <summary>
        /// Get a specific saved filter by ID
        /// </summary>
        /// <param name="id">Filter ID</param>
        /// <returns>Saved filter details</returns>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetFilterById(int id)
        {
            try
            {
                int userId = GetUserIdFromClaims();
                SavedFilterDTO? filter = await _savedFilterService.GetFilterByIdAsync(id, userId);
                
                if (filter == null)
                {
                    return NotFound("Filter not found or access denied.");
                }

                return Ok(filter);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting filter {FilterId}", id);
                return StatusCode(500, "An error occurred while retrieving the filter.");
            }
        }

        /// <summary>
        /// Create a new saved filter
        /// </summary>
        /// <param name="createDto">Filter creation data</param>
        /// <returns>Created filter</returns>
        [HttpPost]
        public async Task<IActionResult> CreateFilter([FromBody] CreateSavedFilterDTO createDto)
        {
            try
            {
                int userId = GetUserIdFromClaims();
                SavedFilterDTO filter = await _savedFilterService.CreateFilterAsync(createDto, userId);
                return CreatedAtAction(nameof(GetFilterById), new { id = filter.Id }, filter);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating filter");
                return StatusCode(500, "An error occurred while creating the filter.");
            }
        }

        /// <summary>
        /// Update an existing saved filter
        /// </summary>
        /// <param name="id">Filter ID</param>
        /// <param name="updateDto">Filter update data</param>
        /// <returns>Updated filter</returns>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateFilter(int id, [FromBody] UpdateSavedFilterDTO updateDto)
        {
            try
            {
                int userId = GetUserIdFromClaims();
                SavedFilterDTO? filter = await _savedFilterService.UpdateFilterAsync(id, updateDto, userId);
                
                if (filter == null)
                {
                    return NotFound("Filter not found or access denied.");
                }

                return Ok(filter);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating filter {FilterId}", id);
                return StatusCode(500, "An error occurred while updating the filter.");
            }
        }

        /// <summary>
        /// Delete a saved filter
        /// </summary>
        /// <param name="id">Filter ID</param>
        /// <returns>Success status</returns>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFilter(int id)
        {
            try
            {
                int userId = GetUserIdFromClaims();
                bool success = await _savedFilterService.DeleteFilterAsync(id, userId);
                
                if (!success)
                {
                    return NotFound("Filter not found or access denied.");
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting filter {FilterId}", id);
                return StatusCode(500, "An error occurred while deleting the filter.");
            }
        }

        /// <summary>
        /// Get public saved filters
        /// </summary>
        /// <returns>List of public filters</returns>
        [HttpGet("public")]
        public async Task<IActionResult> GetPublicFilters()
        {
            try
            {
                IEnumerable<SavedFilterDTO> filters = await _savedFilterService.GetPublicFiltersAsync();
                return Ok(filters);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting public filters");
                return StatusCode(500, "An error occurred while retrieving public filters.");
            }
        }

        /// <summary>
        /// Get shared filters for the current user
        /// </summary>
        /// <returns>List of shared filters</returns>
        [HttpGet("shared")]
        public async Task<IActionResult> GetSharedFilters()
        {
            try
            {
                int userId = GetUserIdFromClaims();
                IEnumerable<SavedFilterDTO> filters = await _savedFilterService.GetSharedFiltersAsync(userId);
                return Ok(filters);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting shared filters");
                return StatusCode(500, "An error occurred while retrieving shared filters.");
            }
        }

        /// <summary>
        /// Execute a saved filter and return analytics data
        /// </summary>
        /// <param name="id">Filter ID</param>
        /// <returns>Analytics data based on filter</returns>
        [HttpPost("{id}/execute")]
        public async Task<IActionResult> ExecuteFilter(int id)
        {
            try
            {
                int userId = GetUserIdFromClaims();
                object result = await _savedFilterService.ExecuteFilterAsync(id, userId);
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing filter {FilterId}", id);
                return StatusCode(500, "An error occurred while executing the filter.");
            }
        }

        /// <summary>
        /// Validate filter criteria JSON
        /// </summary>
        /// <param name="criteria">Filter criteria JSON</param>
        /// <returns>Validation result</returns>
        [HttpPost("validate")]
        public async Task<IActionResult> ValidateFilterCriteria([FromBody] string criteria)
        {
            try
            {
                bool isValid = await _savedFilterService.ValidateFilterCriteriaAsync(criteria);
                return Ok(new { IsValid = isValid });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating filter criteria");
                return StatusCode(500, "An error occurred while validating filter criteria.");
            }
        }
    }
} 