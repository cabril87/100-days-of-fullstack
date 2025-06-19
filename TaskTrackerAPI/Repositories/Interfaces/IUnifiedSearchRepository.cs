/*
 * IUnifiedSearchRepository.cs
 * Repository interface for unified search operations
 * Enterprise-grade search repository with advanced querying capabilities
 */

using System.Collections.Generic;
using System.Threading.Tasks;
using TaskTrackerAPI.DTOs.Search;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Repositories.Interfaces;

/// <summary>
/// Repository interface for unified search operations across all entities
/// </summary>
public interface IUnifiedSearchRepository
{
    /// <summary>
    /// Search across multiple entity types with comprehensive filtering
    /// </summary>
    /// <param name="request">Search request with query and filters</param>
    /// <param name="userId">ID of the user performing the search</param>
    /// <returns>Comprehensive search results</returns>
    Task<UnifiedSearchResponseDTO> SearchAsync(UnifiedSearchRequestDTO request, int userId);

    /// <summary>
    /// Search tasks with text highlighting
    /// </summary>
    /// <param name="query">Search query</param>
    /// <param name="userId">ID of the user</param>
    /// <param name="filters">Optional search filters</param>
    /// <returns>Task search results with highlights</returns>
    Task<List<TaskSearchResultDTO>> SearchTasksAsync(string query, int userId, SearchFiltersDTO? filters = null);

    /// <summary>
    /// Search families with text highlighting
    /// </summary>
    /// <param name="query">Search query</param>
    /// <param name="userId">ID of the user</param>
    /// <param name="filters">Optional search filters</param>
    /// <returns>Family search results with highlights</returns>
    Task<List<FamilySearchResultDTO>> SearchFamiliesAsync(string query, int userId, SearchFiltersDTO? filters = null);

    /// <summary>
    /// Search achievements with text highlighting
    /// </summary>
    /// <param name="query">Search query</param>
    /// <param name="userId">ID of the user</param>
    /// <param name="filters">Optional search filters</param>
    /// <returns>Achievement search results with highlights</returns>
    Task<List<AchievementSearchResultDTO>> SearchAchievementsAsync(string query, int userId, SearchFiltersDTO? filters = null);

    /// <summary>
    /// Search boards with text highlighting
    /// </summary>
    /// <param name="query">Search query</param>
    /// <param name="userId">ID of the user</param>
    /// <param name="filters">Optional search filters</param>
    /// <returns>Board search results with highlights</returns>
    Task<List<BoardSearchResultDTO>> SearchBoardsAsync(string query, int userId, SearchFiltersDTO? filters = null);

    /// <summary>
    /// Search notifications with text highlighting
    /// </summary>
    /// <param name="query">Search query</param>
    /// <param name="userId">ID of the user</param>
    /// <param name="filters">Optional search filters</param>
    /// <returns>Notification search results with highlights</returns>
    Task<List<NotificationSearchResultDTO>> SearchNotificationsAsync(string query, int userId, SearchFiltersDTO? filters = null);

    /// <summary>
    /// Search activities with text highlighting
    /// </summary>
    /// <param name="query">Search query</param>
    /// <param name="userId">ID of the user</param>
    /// <param name="filters">Optional search filters</param>
    /// <returns>Activity search results with highlights</returns>
    Task<List<ActivitySearchResultDTO>> SearchActivitiesAsync(string query, int userId, SearchFiltersDTO? filters = null);

    /// <summary>
    /// Get search suggestions based on query and user history
    /// </summary>
    /// <param name="query">Partial search query</param>
    /// <param name="userId">ID of the user</param>
    /// <param name="limit">Maximum number of suggestions</param>
    /// <returns>Search suggestions with confidence scores</returns>
    Task<List<SearchSuggestionDTO>> GetSearchSuggestionsAsync(string query, int userId, int limit = 10);

    /// <summary>
    /// Get available search facets for filtering
    /// </summary>
    /// <param name="query">Search query</param>
    /// <param name="userId">ID of the user</param>
    /// <param name="familyId">Optional family context</param>
    /// <returns>Available search facets with counts</returns>
    Task<SearchFacetsDTO> GetSearchFacetsAsync(string query, int userId, int? familyId = null);

    /// <summary>
    /// Record search history entry
    /// </summary>
    /// <param name="userId">ID of the user</param>
    /// <param name="query">Search query</param>
    /// <param name="entityTypes">Entity types searched</param>
    /// <param name="resultCount">Number of results returned</param>
    /// <param name="executionTimeMs">Search execution time in milliseconds</param>
    /// <returns>Created search history entry</returns>
    Task<SearchHistory> RecordSearchHistoryAsync(int userId, string query, List<SearchEntityType> entityTypes, int resultCount, double executionTimeMs);

    /// <summary>
    /// Get user's search history
    /// </summary>
    /// <param name="userId">ID of the user</param>
    /// <param name="limit">Maximum number of entries</param>
    /// <returns>Search history entries</returns>
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
    /// <param name="userId">ID of the user for ownership verification</param>
    /// <returns>True if successful</returns>
    Task<bool> DeleteSearchHistoryEntryAsync(int historyId, int userId);

    /// <summary>
    /// Get search analytics for user or family
    /// </summary>
    /// <param name="userId">ID of the user</param>
    /// <param name="familyId">Optional family ID</param>
    /// <param name="timePeriod">Optional time period</param>
    /// <returns>Search analytics with performance metrics</returns>
    Task<SearchAnalyticsDTO> GetSearchAnalyticsAsync(int userId, int? familyId = null, SearchDateRangeDTO? timePeriod = null);

    /// <summary>
    /// Get popular search terms
    /// </summary>
    /// <param name="userId">ID of the user</param>
    /// <param name="familyId">Optional family ID</param>
    /// <param name="limit">Maximum number of terms</param>
    /// <returns>Popular search terms with usage counts</returns>
    Task<List<PopularSearchTermDTO>> GetPopularSearchTermsAsync(int userId, int? familyId = null, int limit = 10);
} 