/*
 * ISavedSearchService.cs
 * Interface for saved search functionality
 * Enterprise-grade saved search management with family sharing
 */

using System.Collections.Generic;
using System.Threading.Tasks;
using TaskTrackerAPI.DTOs.Search;

namespace TaskTrackerAPI.Services.Interfaces;

/// <summary>
/// Service interface for saved search management
/// </summary>
public interface ISavedSearchService
{
    /// <summary>
    /// Get all saved searches for a user
    /// </summary>
    /// <param name="userId">ID of the user</param>
    /// <returns>List of saved searches</returns>
    Task<IEnumerable<SavedSearchDTO>> GetSavedSearchesAsync(int userId);

    /// <summary>
    /// Get shared saved searches for a family
    /// </summary>
    /// <param name="familyId">ID of the family</param>
    /// <param name="userId">ID of the requesting user</param>
    /// <returns>List of family shared searches</returns>
    Task<IEnumerable<SavedSearchDTO>> GetFamilySavedSearchesAsync(int familyId, int userId);

    /// <summary>
    /// Get a saved search by ID
    /// </summary>
    /// <param name="searchId">ID of the saved search</param>
    /// <param name="userId">ID of the requesting user</param>
    /// <returns>Saved search details</returns>
    Task<SavedSearchDTO?> GetSavedSearchByIdAsync(int searchId, int userId);

    /// <summary>
    /// Create a new saved search
    /// </summary>
    /// <param name="createRequest">Saved search creation data</param>
    /// <param name="userId">ID of the user creating the search</param>
    /// <returns>Created saved search</returns>
    Task<SavedSearchDTO> CreateSavedSearchAsync(CreateSavedSearchDTO createRequest, int userId);

    /// <summary>
    /// Update an existing saved search
    /// </summary>
    /// <param name="searchId">ID of the saved search</param>
    /// <param name="updateRequest">Updated search data</param>
    /// <param name="userId">ID of the user updating the search</param>
    /// <returns>Updated saved search</returns>
    Task<SavedSearchDTO?> UpdateSavedSearchAsync(int searchId, CreateSavedSearchDTO updateRequest, int userId);

    /// <summary>
    /// Delete a saved search
    /// </summary>
    /// <param name="searchId">ID of the saved search</param>
    /// <param name="userId">ID of the user deleting the search</param>
    /// <returns>True if successful</returns>
    Task<bool> DeleteSavedSearchAsync(int searchId, int userId);

    /// <summary>
    /// Execute a saved search
    /// </summary>
    /// <param name="searchId">ID of the saved search</param>
    /// <param name="userId">ID of the user executing the search</param>
    /// <param name="pagination">Optional pagination parameters</param>
    /// <returns>Search results</returns>
    Task<UnifiedSearchResponseDTO> ExecuteSavedSearchAsync(int searchId, int userId, SearchPaginationDTO? pagination = null);

    /// <summary>
    /// Get most used saved searches for a user
    /// </summary>
    /// <param name="userId">ID of the user</param>
    /// <param name="limit">Maximum number of searches</param>
    /// <returns>Most used saved searches</returns>
    Task<IEnumerable<SavedSearchDTO>> GetMostUsedSavedSearchesAsync(int userId, int limit = 10);

    /// <summary>
    /// Search within saved searches
    /// </summary>
    /// <param name="userId">ID of the user</param>
    /// <param name="searchTerm">Term to search for</param>
    /// <returns>Matching saved searches</returns>
    Task<IEnumerable<SavedSearchDTO>> SearchSavedSearchesAsync(int userId, string searchTerm);

    /// <summary>
    /// Share a saved search with family
    /// </summary>
    /// <param name="searchId">ID of the saved search</param>
    /// <param name="userId">ID of the user sharing the search</param>
    /// <param name="familyId">ID of the family to share with</param>
    /// <returns>True if successful</returns>
    Task<bool> ShareSavedSearchWithFamilyAsync(int searchId, int userId, int familyId);

    /// <summary>
    /// Unshare a saved search from family
    /// </summary>
    /// <param name="searchId">ID of the saved search</param>
    /// <param name="userId">ID of the user unsharing the search</param>
    /// <returns>True if successful</returns>
    Task<bool> UnshareSavedSearchAsync(int searchId, int userId);
} 