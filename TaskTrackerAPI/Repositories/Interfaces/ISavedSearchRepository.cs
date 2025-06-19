/*
 * ISavedSearchRepository.cs
 * Repository interface for saved search operations
 * Enterprise-grade saved search repository with family sharing capabilities
 */

using System.Collections.Generic;
using System.Threading.Tasks;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Repositories.Interfaces;

/// <summary>
/// Repository interface for saved search operations
/// </summary>
public interface ISavedSearchRepository
{
    /// <summary>
    /// Get all saved searches for a user
    /// </summary>
    /// <param name="userId">ID of the user</param>
    /// <returns>List of saved searches</returns>
    Task<IEnumerable<SavedSearch>> GetSavedSearchesAsync(int userId);

    /// <summary>
    /// Get shared saved searches for a family
    /// </summary>
    /// <param name="familyId">ID of the family</param>
    /// <param name="userId">ID of the requesting user for permission check</param>
    /// <returns>List of family shared searches</returns>
    Task<IEnumerable<SavedSearch>> GetFamilySavedSearchesAsync(int familyId, int userId);

    /// <summary>
    /// Get a saved search by ID
    /// </summary>
    /// <param name="searchId">ID of the saved search</param>
    /// <param name="userId">ID of the requesting user for ownership verification</param>
    /// <returns>Saved search entity</returns>
    Task<SavedSearch?> GetSavedSearchByIdAsync(int searchId, int userId);

    /// <summary>
    /// Create a new saved search
    /// </summary>
    /// <param name="savedSearch">Saved search entity to create</param>
    /// <returns>Created saved search entity</returns>
    Task<SavedSearch> CreateSavedSearchAsync(SavedSearch savedSearch);

    /// <summary>
    /// Update an existing saved search
    /// </summary>
    /// <param name="savedSearch">Saved search entity to update</param>
    /// <returns>Updated saved search entity</returns>
    Task<SavedSearch?> UpdateSavedSearchAsync(SavedSearch savedSearch);

    /// <summary>
    /// Delete a saved search
    /// </summary>
    /// <param name="searchId">ID of the saved search</param>
    /// <param name="userId">ID of the user for ownership verification</param>
    /// <returns>True if successful</returns>
    Task<bool> DeleteSavedSearchAsync(int searchId, int userId);

    /// <summary>
    /// Get most used saved searches for a user
    /// </summary>
    /// <param name="userId">ID of the user</param>
    /// <param name="limit">Maximum number of searches</param>
    /// <returns>Most used saved searches</returns>
    Task<IEnumerable<SavedSearch>> GetMostUsedSavedSearchesAsync(int userId, int limit = 10);

    /// <summary>
    /// Search within saved searches by name or query
    /// </summary>
    /// <param name="userId">ID of the user</param>
    /// <param name="searchTerm">Term to search for</param>
    /// <returns>Matching saved searches</returns>
    Task<IEnumerable<SavedSearch>> SearchSavedSearchesAsync(int userId, string searchTerm);

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

    /// <summary>
    /// Increment usage count for a saved search
    /// </summary>
    /// <param name="searchId">ID of the saved search</param>
    /// <param name="userId">ID of the user executing the search</param>
    /// <returns>True if successful</returns>
    Task<bool> IncrementUsageCountAsync(int searchId, int userId);

    /// <summary>
    /// Check if user has permission to access a saved search
    /// </summary>
    /// <param name="searchId">ID of the saved search</param>
    /// <param name="userId">ID of the user</param>
    /// <returns>True if user has access</returns>
    Task<bool> CanUserAccessSavedSearchAsync(int searchId, int userId);
} 