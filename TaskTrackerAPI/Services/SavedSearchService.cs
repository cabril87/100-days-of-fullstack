/*
 * SavedSearchService.cs
 * Service implementation for saved search functionality
 * Enterprise-grade saved search management with family sharing
 */

using AutoMapper;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TaskTrackerAPI.DTOs.Search;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories.Interfaces;
using TaskTrackerAPI.Services.Interfaces;
using System.Text.Json;

namespace TaskTrackerAPI.Services;

/// <summary>
/// Service implementation for saved search management
/// </summary>
public class SavedSearchService : ISavedSearchService
{
    private readonly ISavedSearchRepository _savedSearchRepository;
    private readonly IUnifiedSearchService _unifiedSearchService;
    private readonly IMapper _mapper;
    private readonly ILogger<SavedSearchService> _logger;

    public SavedSearchService(
        ISavedSearchRepository savedSearchRepository,
        IUnifiedSearchService unifiedSearchService,
        IMapper mapper,
        ILogger<SavedSearchService> logger)
    {
        _savedSearchRepository = savedSearchRepository;
        _unifiedSearchService = unifiedSearchService;
        _mapper = mapper;
        _logger = logger;
    }

    /// <summary>
    /// Get all saved searches for a user
    /// </summary>
    /// <param name="userId">ID of the user</param>
    /// <returns>List of saved searches</returns>
    public async Task<IEnumerable<SavedSearchDTO>> GetSavedSearchesAsync(int userId)
    {
        try
        {
            IEnumerable<SavedSearch> savedSearches = await _savedSearchRepository.GetSavedSearchesAsync(userId);
            return savedSearches.Select(MapToDTO);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting saved searches for user {UserId}", userId);
            throw;
        }
    }

    /// <summary>
    /// Get shared saved searches for a family
    /// </summary>
    /// <param name="familyId">ID of the family</param>
    /// <param name="userId">ID of the requesting user</param>
    /// <returns>List of family shared searches</returns>
    public async Task<IEnumerable<SavedSearchDTO>> GetFamilySavedSearchesAsync(int familyId, int userId)
    {
        try
        {
            IEnumerable<SavedSearch> savedSearches = await _savedSearchRepository.GetFamilySavedSearchesAsync(familyId, userId);
            return savedSearches.Select(MapToDTO);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting family saved searches for family {FamilyId} and user {UserId}", familyId, userId);
            throw;
        }
    }

    /// <summary>
    /// Get a saved search by ID
    /// </summary>
    /// <param name="searchId">ID of the saved search</param>
    /// <param name="userId">ID of the requesting user</param>
    /// <returns>Saved search details</returns>
    public async Task<SavedSearchDTO?> GetSavedSearchByIdAsync(int searchId, int userId)
    {
        try
        {
            SavedSearch? savedSearch = await _savedSearchRepository.GetSavedSearchByIdAsync(searchId, userId);
            return savedSearch != null ? MapToDTO(savedSearch) : null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting saved search {SearchId} for user {UserId}", searchId, userId);
            throw;
        }
    }

    /// <summary>
    /// Create a new saved search
    /// </summary>
    /// <param name="createRequest">Saved search creation data</param>
    /// <param name="userId">ID of the user creating the search</param>
    /// <returns>Created saved search</returns>
    public async Task<SavedSearchDTO> CreateSavedSearchAsync(CreateSavedSearchDTO createRequest, int userId)
    {
        try
        {
            SavedSearch savedSearch = new SavedSearch
            {
                UserId = userId,
                Name = createRequest.Name,
                Query = createRequest.Query,
                EntityTypes = JsonSerializer.Serialize(createRequest.EntityTypes),
                Filters = createRequest.Filters != null ? JsonSerializer.Serialize(createRequest.Filters) : null,
                Sort = createRequest.Sort != null ? JsonSerializer.Serialize(createRequest.Sort) : null,
                CreatedAt = DateTime.UtcNow,
                FamilyId = createRequest.FamilyId
            };

            SavedSearch created = await _savedSearchRepository.CreateSavedSearchAsync(savedSearch);
            return MapToDTO(created);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating saved search for user {UserId}", userId);
            throw;
        }
    }

    /// <summary>
    /// Update an existing saved search
    /// </summary>
    /// <param name="searchId">ID of the saved search</param>
    /// <param name="updateRequest">Updated search data</param>
    /// <param name="userId">ID of the user updating the search</param>
    /// <returns>Updated saved search</returns>
    public async Task<SavedSearchDTO?> UpdateSavedSearchAsync(int searchId, CreateSavedSearchDTO updateRequest, int userId)
    {
        try
        {
            SavedSearch? existingSearch = await _savedSearchRepository.GetSavedSearchByIdAsync(searchId, userId);
            if (existingSearch == null)
            {
                return null;
            }

            existingSearch.Name = updateRequest.Name;
            existingSearch.Query = updateRequest.Query;
            existingSearch.EntityTypes = JsonSerializer.Serialize(updateRequest.EntityTypes);
            existingSearch.Filters = updateRequest.Filters != null ? JsonSerializer.Serialize(updateRequest.Filters) : null;
            existingSearch.Sort = updateRequest.Sort != null ? JsonSerializer.Serialize(updateRequest.Sort) : null;
            existingSearch.FamilyId = updateRequest.FamilyId;

            SavedSearch? updated = await _savedSearchRepository.UpdateSavedSearchAsync(existingSearch);
            return updated != null ? MapToDTO(updated) : null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating saved search {SearchId} for user {UserId}", searchId, userId);
            throw;
        }
    }

    /// <summary>
    /// Delete a saved search
    /// </summary>
    /// <param name="searchId">ID of the saved search</param>
    /// <param name="userId">ID of the user deleting the search</param>
    /// <returns>True if successful</returns>
    public async Task<bool> DeleteSavedSearchAsync(int searchId, int userId)
    {
        try
        {
            return await _savedSearchRepository.DeleteSavedSearchAsync(searchId, userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting saved search {SearchId} for user {UserId}", searchId, userId);
            throw;
        }
    }

    /// <summary>
    /// Execute a saved search
    /// </summary>
    /// <param name="searchId">ID of the saved search</param>
    /// <param name="userId">ID of the user executing the search</param>
    /// <param name="pagination">Optional pagination parameters</param>
    /// <returns>Search results</returns>
    public async Task<UnifiedSearchResponseDTO> ExecuteSavedSearchAsync(int searchId, int userId, SearchPaginationDTO? pagination = null)
    {
        try
        {
            SavedSearch? savedSearch = await _savedSearchRepository.GetSavedSearchByIdAsync(searchId, userId);
            if (savedSearch == null)
            {
                throw new KeyNotFoundException($"Saved search {searchId} not found");
            }

            // Update last used time
            savedSearch.LastUsedAt = DateTime.UtcNow;
            savedSearch.UsageCount++;
            await _savedSearchRepository.UpdateSavedSearchAsync(savedSearch);

            // Build search request from saved search
            UnifiedSearchRequestDTO searchRequest = new UnifiedSearchRequestDTO
            {
                Query = savedSearch.Query,
                EntityTypes = !string.IsNullOrEmpty(savedSearch.EntityTypes) 
                    ? JsonSerializer.Deserialize<List<SearchEntityTypeDTO>>(savedSearch.EntityTypes) ?? new List<SearchEntityTypeDTO>()
                    : new List<SearchEntityTypeDTO>(),
                Pagination = new SearchPaginationDTO
                {
                    Page = pagination?.Page ?? 1,
                    PageSize = pagination?.PageSize ?? 20
                }
            };

            // Parse filters and sorting if they exist
            if (!string.IsNullOrEmpty(savedSearch.Filters))
            {
                searchRequest.Filters = JsonSerializer.Deserialize<Dictionary<string, object>>(savedSearch.Filters);
            }

            if (!string.IsNullOrEmpty(savedSearch.Sort))
            {
                searchRequest.Sort = JsonSerializer.Deserialize<SearchSortDTO>(savedSearch.Sort);
            }

            return await _unifiedSearchService.SearchAsync(searchRequest, userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error executing saved search {SearchId} for user {UserId}", searchId, userId);
            throw;
        }
    }

    /// <summary>
    /// Get most used saved searches for a user
    /// </summary>
    /// <param name="userId">ID of the user</param>
    /// <param name="limit">Maximum number of searches</param>
    /// <returns>Most used saved searches</returns>
    public async Task<IEnumerable<SavedSearchDTO>> GetMostUsedSavedSearchesAsync(int userId, int limit = 10)
    {
        try
        {
            IEnumerable<SavedSearch> savedSearches = await _savedSearchRepository.GetMostUsedSavedSearchesAsync(userId, limit);
            return savedSearches.Select(MapToDTO);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting most used saved searches for user {UserId}", userId);
            throw;
        }
    }

    /// <summary>
    /// Search within saved searches
    /// </summary>
    /// <param name="userId">ID of the user</param>
    /// <param name="searchTerm">Term to search for</param>
    /// <returns>Matching saved searches</returns>
    public async Task<IEnumerable<SavedSearchDTO>> SearchSavedSearchesAsync(int userId, string searchTerm)
    {
        try
        {
            IEnumerable<SavedSearch> savedSearches = await _savedSearchRepository.SearchSavedSearchesAsync(userId, searchTerm);
            return savedSearches.Select(MapToDTO);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching saved searches for user {UserId} with term '{SearchTerm}'", userId, searchTerm);
            throw;
        }
    }

    /// <summary>
    /// Share a saved search with family
    /// </summary>
    /// <param name="searchId">ID of the saved search</param>
    /// <param name="userId">ID of the user sharing the search</param>
    /// <param name="familyId">ID of the family to share with</param>
    /// <returns>True if successful</returns>
    public async Task<bool> ShareSavedSearchWithFamilyAsync(int searchId, int userId, int familyId)
    {
        try
        {
            return await _savedSearchRepository.ShareSavedSearchWithFamilyAsync(searchId, userId, familyId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sharing saved search {SearchId} with family {FamilyId} for user {UserId}", searchId, familyId, userId);
            throw;
        }
    }

    /// <summary>
    /// Unshare a saved search from family
    /// </summary>
    /// <param name="searchId">ID of the saved search</param>
    /// <param name="userId">ID of the user unsharing the search</param>
    /// <returns>True if successful</returns>
    public async Task<bool> UnshareSavedSearchAsync(int searchId, int userId)
    {
        try
        {
            return await _savedSearchRepository.UnshareSavedSearchAsync(searchId, userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error unsharing saved search {SearchId} for user {UserId}", searchId, userId);
            throw;
        }
    }

    /// <summary>
    /// Map SavedSearch entity to DTO
    /// </summary>
    private SavedSearchDTO MapToDTO(SavedSearch savedSearch)
    {
        List<SearchEntityTypeDTO> entityTypes = new List<SearchEntityTypeDTO>();
        if (!string.IsNullOrEmpty(savedSearch.EntityTypes))
        {
            try
            {
                entityTypes = JsonSerializer.Deserialize<List<SearchEntityTypeDTO>>(savedSearch.EntityTypes) ?? new List<SearchEntityTypeDTO>();
            }
            catch
            {
                // Fallback to empty list if deserialization fails
                entityTypes = new List<SearchEntityTypeDTO>();
            }
        }

        Dictionary<string, object> filters = new Dictionary<string, object>();
        if (!string.IsNullOrEmpty(savedSearch.Filters))
        {
            try
            {
                filters = JsonSerializer.Deserialize<Dictionary<string, object>>(savedSearch.Filters) ?? new Dictionary<string, object>();
            }
            catch
            {
                // Fallback to empty dictionary if deserialization fails
                filters = new Dictionary<string, object>();
            }
        }

        SearchSortDTO? sort = null;
        if (!string.IsNullOrEmpty(savedSearch.Sort))
        {
            try
            {
                sort = JsonSerializer.Deserialize<SearchSortDTO>(savedSearch.Sort);
            }
            catch
            {
                // Fallback to null if deserialization fails
                sort = null;
            }
        }

        return new SavedSearchDTO
        {
            Id = savedSearch.Id,
            Name = savedSearch.Name,
            Query = savedSearch.Query,
            EntityTypes = entityTypes,
            Filters = filters,
            Sort = sort,
            CreatedAt = savedSearch.CreatedAt,
            LastUsedAt = savedSearch.LastUsedAt,
            UsageCount = savedSearch.UsageCount,
            IsPublic = savedSearch.IsPublic,
            FamilyId = savedSearch.FamilyId
        };
    }
} 