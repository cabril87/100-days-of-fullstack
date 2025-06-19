/*
 * IUnifiedSearchService.cs
 * Interface for unified search functionality across all entities
 * Enterprise-grade search with faceting, suggestions, and analytics
 */

using System.Collections.Generic;
using System.Threading.Tasks;
using TaskTrackerAPI.DTOs.Search;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Services.Interfaces;

/// <summary>
/// Service interface for unified search across all entities
/// </summary>
public interface IUnifiedSearchService
{
    /// <summary>
    /// Perform unified search across multiple entity types
    /// </summary>
    /// <param name="request">Search request with query and filters</param>
    /// <param name="userId">ID of the user performing the search</param>
    /// <returns>Comprehensive search results with highlighting and facets</returns>
    Task<UnifiedSearchResponseDTO> SearchAsync(UnifiedSearchRequestDTO request, int userId);

    /// <summary>
    /// Get search suggestions for auto-complete functionality
    /// </summary>
    /// <param name="query">Partial search query</param>
    /// <param name="userId">ID of the user requesting suggestions</param>
    /// <param name="limit">Maximum number of suggestions</param>
    /// <returns>List of search suggestions with confidence scores</returns>
    Task<List<SearchSuggestionDTO>> GetSearchSuggestionsAsync(string query, int userId, int limit = 10);

    /// <summary>
    /// Get available search facets for filtering
    /// </summary>
    /// <param name="query">Search query for facet calculation</param>
    /// <param name="userId">ID of the user requesting facets</param>
    /// <param name="familyId">Optional family context for facets</param>
    /// <returns>Available search facets with counts</returns>
    Task<SearchFacetsDTO> GetSearchFacetsAsync(string query, int userId, int? familyId = null);

    /// <summary>
    /// Get user's search history
    /// </summary>
    /// <param name="userId">ID of the user</param>
    /// <param name="limit">Maximum number of history entries</param>
    /// <returns>List of search history entries</returns>
    Task<List<SearchHistory>> GetSearchHistoryAsync(int userId, int limit = 50);

    /// <summary>
    /// Clear user's search history
    /// </summary>
    /// <param name="userId">ID of the user</param>
    /// <returns>True if successful</returns>
    Task<bool> ClearSearchHistoryAsync(int userId);

    /// <summary>
    /// Delete specific search history entry
    /// </summary>
    /// <param name="historyId">ID of the history entry</param>
    /// <param name="userId">ID of the user who owns the entry</param>
    /// <returns>True if successful</returns>
    Task<bool> DeleteSearchHistoryEntryAsync(int historyId, int userId);

    /// <summary>
    /// Get search analytics for user or family
    /// </summary>
    /// <param name="userId">ID of the user</param>
    /// <param name="familyId">Optional family ID for family-level analytics</param>
    /// <param name="timePeriod">Optional time period for analytics</param>
    /// <returns>Search analytics with performance metrics</returns>
    Task<SearchAnalyticsDTO> GetSearchAnalyticsAsync(int userId, int? familyId = null, SearchDateRangeDTO? timePeriod = null);

    /// <summary>
    /// Get popular search terms
    /// </summary>
    /// <param name="userId">ID of the user</param>
    /// <param name="familyId">Optional family ID for family-specific terms</param>
    /// <param name="limit">Maximum number of terms</param>
    /// <returns>List of popular search terms with usage counts</returns>
    Task<List<PopularSearchTermDTO>> GetPopularSearchTermsAsync(int userId, int? familyId = null, int limit = 10);
} 