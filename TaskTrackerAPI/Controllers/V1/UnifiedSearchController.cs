/*
 * UnifiedSearch Controller
 * Copyright (c) 2025 Carlos Abril Jr
 * Day 79: Advanced Search & Discovery Implementation
 */

using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.Attributes;
using TaskTrackerAPI.DTOs.Search;
using TaskTrackerAPI.Services.Interfaces;
using TaskTrackerAPI.Extensions;
using TaskTrackerAPI.Models;
using System.ComponentModel.DataAnnotations;

namespace TaskTrackerAPI.Controllers.V1;

/// <summary>
/// Controller for unified search operations across all entities
/// </summary>
[ApiController]
[Route("api/v1/search")]
[Authorize]
[RateLimit(100, 60)] // 100 requests per minute for search operations
public class UnifiedSearchController : ControllerBase
{
    private readonly IUnifiedSearchService _searchService;
    private readonly ISavedSearchService _savedSearchService;
    private readonly ILogger<UnifiedSearchController> _logger;

    public UnifiedSearchController(
        IUnifiedSearchService searchService,
        ISavedSearchService savedSearchService,
        ILogger<UnifiedSearchController> logger)
    {
        _searchService = searchService;
        _savedSearchService = savedSearchService;
        _logger = logger;
    }

    /// <summary>
    /// Perform unified search across all entities
    /// </summary>
    /// <param name="request">Search request parameters</param>
    /// <returns>Unified search results</returns>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<UnifiedSearchResponseDTO>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 400)]
    [ProducesResponseType(typeof(ApiResponse<object>), 500)]
    public async Task<ActionResult<ApiResponse<UnifiedSearchResponseDTO>>> Search([FromBody] UnifiedSearchRequestDTO request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<object>.BadRequestResponse("Invalid search request"));
            }

            int userId = User.GetUserIdAsInt();
            
            UnifiedSearchResponseDTO results = await _searchService.SearchAsync(request, userId);
            
            _logger.LogInformation("User {UserId} performed search for '{Query}' with {TotalResults} results", 
                userId, request.Query, results.TotalResults);

            return Ok(ApiResponse<UnifiedSearchResponseDTO>.SuccessResponse(results, "Search completed successfully"));
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid search request from user {UserId}", User.GetUserIdAsInt());
            return BadRequest(ApiResponse<object>.BadRequestResponse(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error performing unified search for user {UserId}", User.GetUserIdAsInt());
            return StatusCode(500, ApiResponse<object>.ServerErrorResponse("An error occurred while performing the search"));
        }
    }

    /// <summary>
    /// Get search suggestions based on partial query
    /// </summary>
    /// <param name="query">Partial search query</param>
    /// <param name="limit">Maximum number of suggestions</param>
    /// <returns>Search suggestions</returns>
    [HttpGet("suggestions")]
    [ProducesResponseType(typeof(ApiResponse<List<SearchSuggestionDTO>>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 400)]
    public async Task<ActionResult<ApiResponse<List<SearchSuggestionDTO>>>> GetSearchSuggestions(
        [FromQuery] [Required] string query,
        [FromQuery] [Range(1, 50)] int limit = 10)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(query))
            {
                return BadRequest(ApiResponse<object>.BadRequestResponse("Search query is required"));
            }

            int userId = User.GetUserIdAsInt();
            
            List<SearchSuggestionDTO> suggestions = await _searchService.GetSearchSuggestionsAsync(query, userId, limit);
            
            return Ok(ApiResponse<List<SearchSuggestionDTO>>.SuccessResponse(suggestions, "Search suggestions retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting search suggestions for user {UserId}", User.GetUserIdAsInt());
            return StatusCode(500, ApiResponse<object>.ServerErrorResponse("An error occurred while getting search suggestions"));
        }
    }

    /// <summary>
    /// Get search facets for filtering
    /// </summary>
    /// <param name="query">Search query</param>
    /// <param name="familyId">Optional family context</param>
    /// <returns>Available search facets</returns>
    [HttpGet("facets")]
    [ProducesResponseType(typeof(ApiResponse<SearchFacetsDTO>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 400)]
    public async Task<ActionResult<ApiResponse<SearchFacetsDTO>>> GetSearchFacets(
        [FromQuery] [Required] string query,
        [FromQuery] int? familyId = null)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(query))
            {
                return BadRequest(ApiResponse<object>.BadRequestResponse("Search query is required"));
            }

            int userId = User.GetUserIdAsInt();
            
            SearchFacetsDTO facets = await _searchService.GetSearchFacetsAsync(query, userId, familyId);
            
            return Ok(ApiResponse<SearchFacetsDTO>.SuccessResponse(facets, "Search facets retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting search facets for user {UserId}", User.GetUserIdAsInt());
            return StatusCode(500, ApiResponse<object>.ServerErrorResponse("An error occurred while getting search facets"));
        }
    }

    /// <summary>
    /// Get user's search history
    /// </summary>
    /// <param name="limit">Maximum number of entries</param>
    /// <returns>Search history entries</returns>
    [HttpGet("history")]
    [ProducesResponseType(typeof(ApiResponse<List<SearchHistory>>), 200)]
    public async Task<ActionResult<ApiResponse<List<SearchHistory>>>> GetSearchHistory(
        [FromQuery] [Range(1, 100)] int limit = 50)
    {
        try
        {
            int userId = User.GetUserIdAsInt();
            
            List<SearchHistory> history = await _searchService.GetSearchHistoryAsync(userId, limit);
            
            return Ok(ApiResponse<List<SearchHistory>>.SuccessResponse(history, "Search history retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting search history for user {UserId}", User.GetUserIdAsInt());
            return StatusCode(500, ApiResponse<object>.ServerErrorResponse("An error occurred while getting search history"));
        }
    }

    /// <summary>
    /// Clear user's search history
    /// </summary>
    /// <returns>Success status</returns>
    [HttpDelete("history")]
    [ProducesResponseType(typeof(ApiResponse<object>), 200)]
    public async Task<ActionResult<ApiResponse<object>>> ClearSearchHistory()
    {
        try
        {
            int userId = User.GetUserIdAsInt();
            
            bool success = await _searchService.ClearSearchHistoryAsync(userId);
            
            if (success)
            {
                return Ok(ApiResponse<object>.SuccessResponse(new object(), "Search history cleared successfully"));
            }
            else
            {
                return StatusCode(500, ApiResponse<object>.ServerErrorResponse("Failed to clear search history"));
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error clearing search history for user {UserId}", User.GetUserIdAsInt());
            return StatusCode(500, ApiResponse<object>.ServerErrorResponse("An error occurred while clearing search history"));
        }
    }

    /// <summary>
    /// Delete specific search history entry
    /// </summary>
    /// <param name="historyId">Search history entry ID</param>
    /// <returns>Success status</returns>
    [HttpDelete("history/{historyId}")]
    [ProducesResponseType(typeof(ApiResponse<object>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 404)]
    public async Task<ActionResult<ApiResponse<object>>> DeleteSearchHistoryEntry(int historyId)
    {
        try
        {
            int userId = User.GetUserIdAsInt();
            
            bool success = await _searchService.DeleteSearchHistoryEntryAsync(historyId, userId);
            
            if (success)
            {
                return Ok(ApiResponse<object>.SuccessResponse(new object(), "Search history entry deleted successfully"));
            }
            else
            {
                return NotFound(ApiResponse<object>.NotFoundResponse("Search history entry not found"));
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting search history entry {HistoryId} for user {UserId}", historyId, User.GetUserIdAsInt());
            return StatusCode(500, ApiResponse<object>.ServerErrorResponse("An error occurred while deleting search history entry"));
        }
    }

    /// <summary>
    /// Get search analytics for user or family
    /// </summary>
    /// <param name="familyId">Optional family ID</param>
    /// <param name="startDate">Optional start date for analytics period</param>
    /// <param name="endDate">Optional end date for analytics period</param>
    /// <returns>Search analytics</returns>
    [HttpGet("analytics")]
    [ProducesResponseType(typeof(ApiResponse<SearchAnalyticsDTO>), 200)]
    public async Task<ActionResult<ApiResponse<SearchAnalyticsDTO>>> GetSearchAnalytics(
        [FromQuery] int? familyId = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        try
        {
            int userId = User.GetUserIdAsInt();
            
            SearchDateRangeDTO? timePeriod = null;
            if (startDate.HasValue || endDate.HasValue)
            {
                timePeriod = new SearchDateRangeDTO
                {
                    StartDate = startDate,
                    EndDate = endDate
                };
            }
            
            SearchAnalyticsDTO analytics = await _searchService.GetSearchAnalyticsAsync(userId, familyId, timePeriod);
            
            return Ok(ApiResponse<SearchAnalyticsDTO>.SuccessResponse(analytics, "Search analytics retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting search analytics for user {UserId}", User.GetUserIdAsInt());
            return StatusCode(500, ApiResponse<object>.ServerErrorResponse("An error occurred while getting search analytics"));
        }
    }

    /// <summary>
    /// Get popular search terms
    /// </summary>
    /// <param name="familyId">Optional family ID for family-specific results</param>
    /// <param name="limit">Maximum number of terms</param>
    /// <returns>Popular search terms</returns>
    [HttpGet("popular-terms")]
    [ProducesResponseType(typeof(ApiResponse<List<PopularSearchTermDTO>>), 200)]
    public async Task<ActionResult<ApiResponse<List<PopularSearchTermDTO>>>> GetPopularSearchTerms(
        [FromQuery] int? familyId = null,
        [FromQuery] [Range(1, 50)] int limit = 10)
    {
        try
        {
            int userId = User.GetUserIdAsInt();
            
            List<PopularSearchTermDTO> popularTerms = await _searchService.GetPopularSearchTermsAsync(userId, familyId, limit);
            
            return Ok(ApiResponse<List<PopularSearchTermDTO>>.SuccessResponse(popularTerms, "Popular search terms retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting popular search terms for user {UserId}", User.GetUserIdAsInt());
            return StatusCode(500, ApiResponse<object>.ServerErrorResponse("An error occurred while getting popular search terms"));
        }
    }
} 