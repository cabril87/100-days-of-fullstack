/*
 * SavedSearch Controller
 * Copyright (c) 2025 Carlos Abril Jr
 * Day 79: Advanced Search & Discovery Implementation
 */

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using TaskTrackerAPI.DTOs.Search;
using TaskTrackerAPI.Services.Interfaces;
using TaskTrackerAPI.Extensions;
using TaskTrackerAPI.Attributes;
using System.ComponentModel.DataAnnotations;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Threading.Tasks;
using TaskTrackerAPI.Models;
using System;

namespace TaskTrackerAPI.Controllers.V1;

/// <summary>
/// Controller for saved search operations
/// </summary>
[ApiController]
[Route("api/v1/saved-searches")]
[Authorize]
[RateLimit(50, 60)] // 50 requests per minute for saved search operations
public class SavedSearchController : ControllerBase
{
    private readonly ISavedSearchService _savedSearchService;
    private readonly IUnifiedSearchService _searchService;
    private readonly ILogger<SavedSearchController> _logger;

    public SavedSearchController(
        ISavedSearchService savedSearchService,
        IUnifiedSearchService searchService,
        ILogger<SavedSearchController> logger)
    {
        _savedSearchService = savedSearchService;
        _searchService = searchService;
        _logger = logger;
    }

    /// <summary>
    /// Get all saved searches for the current user
    /// </summary>
    /// <returns>List of saved searches</returns>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<SavedSearchDTO>>), 200)]
    public async Task<ActionResult<ApiResponse<IEnumerable<SavedSearchDTO>>>> GetSavedSearches()
    {
        try
        {
            // Use the safer method to get user ID
            if (!User.TryGetUserIdAsInt(out int userId))
            {
                _logger.LogWarning("Invalid or missing user authentication for saved searches request");
                return Unauthorized(ApiResponse<object>.UnauthorizedResponse("User authentication required"));
            }
            
            IEnumerable<SavedSearchDTO> savedSearches = await _savedSearchService.GetSavedSearchesAsync(userId);
            
            return Ok(ApiResponse<IEnumerable<SavedSearchDTO>>.SuccessResponse(savedSearches, "Saved searches retrieved successfully"));
        }
        catch (Exception ex)
        {
            // Try to get user ID safely for logging
            User.TryGetUserIdAsInt(out int userId);
            _logger.LogError(ex, "Error getting saved searches for user {UserId}", userId);
            return StatusCode(500, ApiResponse<object>.ServerErrorResponse("An error occurred while retrieving saved searches"));
        }
    }

    /// <summary>
    /// Get saved searches shared within a family
    /// </summary>
    /// <param name="familyId">Family ID</param>
    /// <returns>List of family saved searches</returns>
    [HttpGet("family/{familyId}")]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<SavedSearchDTO>>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 400)]
    public async Task<ActionResult<ApiResponse<IEnumerable<SavedSearchDTO>>>> GetFamilySavedSearches(int familyId)
    {
        try
        {
            if (familyId <= 0)
            {
                return BadRequest(ApiResponse<object>.BadRequestResponse("Invalid family ID"));
            }

            int userId = User.GetUserIdAsInt();
            
            IEnumerable<SavedSearchDTO> savedSearches = await _savedSearchService.GetFamilySavedSearchesAsync(familyId, userId);
            
            return Ok(ApiResponse<IEnumerable<SavedSearchDTO>>.SuccessResponse(savedSearches, "Family saved searches retrieved successfully"));
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access to family {FamilyId} saved searches by user {UserId}", familyId, User.GetUserIdAsInt());
            return Forbid();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting family {FamilyId} saved searches for user {UserId}", familyId, User.GetUserIdAsInt());
            return StatusCode(500, ApiResponse<object>.ServerErrorResponse("An error occurred while retrieving family saved searches"));
        }
    }

    /// <summary>
    /// Get a specific saved search by ID
    /// </summary>
    /// <param name="searchId">Saved search ID</param>
    /// <returns>Saved search if found and accessible</returns>
    [HttpGet("{searchId}")]
    [ProducesResponseType(typeof(ApiResponse<SavedSearchDTO>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 404)]
    public async Task<ActionResult<ApiResponse<SavedSearchDTO>>> GetSavedSearchById(int searchId)
    {
        try
        {
            int userId = User.GetUserIdAsInt();
            
            SavedSearchDTO? savedSearch = await _savedSearchService.GetSavedSearchByIdAsync(searchId, userId);
            
            if (savedSearch == null)
            {
                return NotFound(ApiResponse<object>.NotFoundResponse("Saved search not found"));
            }
            
            return Ok(ApiResponse<SavedSearchDTO>.SuccessResponse(savedSearch, "Saved search retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting saved search {SearchId} for user {UserId}", searchId, User.GetUserIdAsInt());
            return StatusCode(500, ApiResponse<object>.ServerErrorResponse("An error occurred while retrieving the saved search"));
        }
    }

    /// <summary>
    /// Create a new saved search
    /// </summary>
    /// <param name="createRequest">Create saved search request</param>
    /// <returns>Created saved search</returns>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<SavedSearchDTO>), 201)]
    [ProducesResponseType(typeof(ApiResponse<object>), 400)]
    public async Task<ActionResult<ApiResponse<SavedSearchDTO>>> CreateSavedSearch([FromBody] CreateSavedSearchDTO createRequest)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<object>.BadRequestResponse("Invalid saved search data"));
            }

            int userId = User.GetUserIdAsInt();
            
            SavedSearchDTO savedSearch = await _savedSearchService.CreateSavedSearchAsync(createRequest, userId);
            
            _logger.LogInformation("User {UserId} created saved search '{Name}'", userId, savedSearch.Name);
            
            return CreatedAtAction(nameof(GetSavedSearchById), new { searchId = savedSearch.Id }, 
                ApiResponse<SavedSearchDTO>.SuccessResponse(savedSearch, "Saved search created successfully"));
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid saved search creation request from user {UserId}", User.GetUserIdAsInt());
            return BadRequest(ApiResponse<object>.BadRequestResponse(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating saved search for user {UserId}", User.GetUserIdAsInt());
            return StatusCode(500, ApiResponse<object>.ServerErrorResponse("An error occurred while creating the saved search"));
        }
    }

    /// <summary>
    /// Update an existing saved search
    /// </summary>
    /// <param name="searchId">Saved search ID</param>
    /// <param name="updateRequest">Update request</param>
    /// <returns>Updated saved search</returns>
    [HttpPut("{searchId}")]
    [ProducesResponseType(typeof(ApiResponse<SavedSearchDTO>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 400)]
    [ProducesResponseType(typeof(ApiResponse<object>), 404)]
    public async Task<ActionResult<ApiResponse<SavedSearchDTO>>> UpdateSavedSearch(int searchId, [FromBody] CreateSavedSearchDTO updateRequest)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<object>.BadRequestResponse("Invalid saved search data"));
            }

            int userId = User.GetUserIdAsInt();
            
            SavedSearchDTO? savedSearch = await _savedSearchService.UpdateSavedSearchAsync(searchId, updateRequest, userId);
            
            if (savedSearch == null)
            {
                return NotFound(ApiResponse<object>.NotFoundResponse("Saved search not found"));
            }
            
            _logger.LogInformation("User {UserId} updated saved search {SearchId}", userId, searchId);
            
            return Ok(ApiResponse<SavedSearchDTO>.SuccessResponse(savedSearch, "Saved search updated successfully"));
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized update attempt on saved search {SearchId} by user {UserId}", searchId, User.GetUserIdAsInt());
            return Forbid();
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Saved search {SearchId} not found for user {UserId}", searchId, User.GetUserIdAsInt());
            return NotFound(ApiResponse<object>.NotFoundResponse("Saved search not found"));
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid saved search update request from user {UserId}", User.GetUserIdAsInt());
            return BadRequest(ApiResponse<object>.BadRequestResponse(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating saved search {SearchId} for user {UserId}", searchId, User.GetUserIdAsInt());
            return StatusCode(500, ApiResponse<object>.ServerErrorResponse("An error occurred while updating the saved search"));
        }
    }

    /// <summary>
    /// Delete a saved search
    /// </summary>
    /// <param name="searchId">Saved search ID</param>
    /// <returns>Success status</returns>
    [HttpDelete("{searchId}")]
    [ProducesResponseType(typeof(ApiResponse<object>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 404)]
    public async Task<ActionResult<ApiResponse<object>>> DeleteSavedSearch(int searchId)
    {
        try
        {
            int userId = User.GetUserIdAsInt();
            
            bool success = await _savedSearchService.DeleteSavedSearchAsync(searchId, userId);
            
            if (success)
            {
                _logger.LogInformation("User {UserId} deleted saved search {SearchId}", userId, searchId);
                return Ok(ApiResponse<object>.SuccessResponse(new object(), "Saved search deleted successfully"));
            }
            else
            {
                return NotFound(ApiResponse<object>.NotFoundResponse("Saved search not found"));
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting saved search {SearchId} for user {UserId}", searchId, User.GetUserIdAsInt());
            return StatusCode(500, ApiResponse<object>.ServerErrorResponse("An error occurred while deleting the saved search"));
        }
    }

    /// <summary>
    /// Execute a saved search
    /// </summary>
    /// <param name="searchId">Saved search ID</param>
    /// <param name="page">Page number for pagination</param>
    /// <param name="pageSize">Page size for pagination</param>
    /// <returns>Search results</returns>
    [HttpPost("{searchId}/execute")]
    [ProducesResponseType(typeof(ApiResponse<UnifiedSearchResponseDTO>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 404)]
    public async Task<ActionResult<ApiResponse<UnifiedSearchResponseDTO>>> ExecuteSavedSearch(
        int searchId,
        [FromQuery] [Range(1, int.MaxValue)] int page = 1,
        [FromQuery] [Range(1, 100)] int pageSize = 20)
    {
        try
        {
            int userId = User.GetUserIdAsInt();
            
            SearchPaginationDTO? pagination = new SearchPaginationDTO { Page = page, PageSize = pageSize };
            
            UnifiedSearchResponseDTO results = await _savedSearchService.ExecuteSavedSearchAsync(searchId, userId, pagination);
            
            _logger.LogInformation("User {UserId} executed saved search {SearchId} with {TotalResults} results", 
                userId, searchId, results.TotalResults);
            
            return Ok(ApiResponse<UnifiedSearchResponseDTO>.SuccessResponse(results, "Saved search executed successfully"));
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Saved search {SearchId} not found for user {UserId}", searchId, User.GetUserIdAsInt());
            return NotFound(ApiResponse<object>.NotFoundResponse("Saved search not found"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error executing saved search {SearchId} for user {UserId}", searchId, User.GetUserIdAsInt());
            return StatusCode(500, ApiResponse<object>.ServerErrorResponse("An error occurred while executing the saved search"));
        }
    }

    /// <summary>
    /// Get most used saved searches for the current user
    /// </summary>
    /// <param name="limit">Maximum number of searches to return</param>
    /// <returns>Most used saved searches</returns>
    [HttpGet("most-used")]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<SavedSearchDTO>>), 200)]
    public async Task<ActionResult<ApiResponse<IEnumerable<SavedSearchDTO>>>> GetMostUsedSavedSearches(
        [FromQuery] [Range(1, 50)] int limit = 10)
    {
        try
        {
            int userId = User.GetUserIdAsInt();
            
            IEnumerable<SavedSearchDTO> savedSearches = await _savedSearchService.GetMostUsedSavedSearchesAsync(userId, limit);
            
            return Ok(ApiResponse<IEnumerable<SavedSearchDTO>>.SuccessResponse(savedSearches, "Most used saved searches retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting most used saved searches for user {UserId}", User.GetUserIdAsInt());
            return StatusCode(500, ApiResponse<object>.ServerErrorResponse("An error occurred while retrieving most used saved searches"));
        }
    }

    /// <summary>
    /// Search within saved searches
    /// </summary>
    /// <param name="searchTerm">Term to search for</param>
    /// <returns>Matching saved searches</returns>
    [HttpGet("search")]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<SavedSearchDTO>>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 400)]
    public async Task<ActionResult<ApiResponse<IEnumerable<SavedSearchDTO>>>> SearchSavedSearches(
        [FromQuery] [Required] string searchTerm)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(searchTerm))
            {
                return BadRequest(ApiResponse<object>.BadRequestResponse("Search term is required"));
            }

            int userId = User.GetUserIdAsInt();
            
            IEnumerable<SavedSearchDTO> savedSearches = await _savedSearchService.SearchSavedSearchesAsync(userId, searchTerm);
            
            return Ok(ApiResponse<IEnumerable<SavedSearchDTO>>.SuccessResponse(savedSearches, "Saved searches search completed successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching saved searches for user {UserId}", User.GetUserIdAsInt());
            return StatusCode(500, ApiResponse<object>.ServerErrorResponse("An error occurred while searching saved searches"));
        }
    }

    /// <summary>
    /// Share a saved search with family
    /// </summary>
    /// <param name="searchId">Saved search ID</param>
    /// <param name="familyId">Family ID to share with</param>
    /// <returns>Success status</returns>
    [HttpPost("{searchId}/share/{familyId}")]
    [ProducesResponseType(typeof(ApiResponse<object>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 400)]
    [ProducesResponseType(typeof(ApiResponse<object>), 404)]
    public async Task<ActionResult<ApiResponse<object>>> ShareSavedSearchWithFamily(int searchId, int familyId)
    {
        try
        {
            if (familyId <= 0)
            {
                return BadRequest(ApiResponse<object>.BadRequestResponse("Invalid family ID"));
            }

            int userId = User.GetUserIdAsInt();
            
            bool success = await _savedSearchService.ShareSavedSearchWithFamilyAsync(searchId, userId, familyId);
            
            if (success)
            {
                _logger.LogInformation("User {UserId} shared saved search {SearchId} with family {FamilyId}", userId, searchId, familyId);
                return Ok(ApiResponse<object>.SuccessResponse(new object(), "Saved search shared with family successfully"));
            }
            else
            {
                return NotFound(ApiResponse<object>.NotFoundResponse("Saved search not found"));
            }
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized share attempt on saved search {SearchId} by user {UserId}", searchId, User.GetUserIdAsInt());
            return Forbid();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sharing saved search {SearchId} with family {FamilyId} for user {UserId}", searchId, familyId, User.GetUserIdAsInt());
            return StatusCode(500, ApiResponse<object>.ServerErrorResponse("An error occurred while sharing the saved search"));
        }
    }

    /// <summary>
    /// Unshare a saved search from family
    /// </summary>
    /// <param name="searchId">Saved search ID</param>
    /// <returns>Success status</returns>
    [HttpDelete("{searchId}/share")]
    [ProducesResponseType(typeof(ApiResponse<object>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 404)]
    public async Task<ActionResult<ApiResponse<object>>> UnshareSavedSearch(int searchId)
    {
        try
        {
            int userId = User.GetUserIdAsInt();
            
            bool success = await _savedSearchService.UnshareSavedSearchAsync(searchId, userId);
            
            if (success)
            {
                _logger.LogInformation("User {UserId} unshared saved search {SearchId}", userId, searchId);
                return Ok(ApiResponse<object>.SuccessResponse(new object(), "Saved search unshared successfully"));
            }
            else
            {
                return NotFound(ApiResponse<object>.NotFoundResponse("Saved search not found"));
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error unsharing saved search {SearchId} for user {UserId}", searchId, User.GetUserIdAsInt());
            return StatusCode(500, ApiResponse<object>.ServerErrorResponse("An error occurred while unsharing the saved search"));
        }
    }
} 