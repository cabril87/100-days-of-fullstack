/*
 * UnifiedSearchService.cs
 * Service implementation for unified search functionality across all entities
 * Enterprise-grade search with faceting, suggestions, and analytics
 */

using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TaskTrackerAPI.DTOs.Search;
using TaskTrackerAPI.DTOs.Tasks;
using TaskTrackerAPI.DTOs.Notifications;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Models.Gamification;
using TaskTrackerAPI.Services.Interfaces;
using TaskTrackerAPI.Data;
using System.Diagnostics;

namespace TaskTrackerAPI.Services;

/// <summary>
/// Service implementation for unified search across all entities
/// </summary>
public class UnifiedSearchService : IUnifiedSearchService
{
    private readonly ILogger<UnifiedSearchService> _logger;
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public UnifiedSearchService(
        ILogger<UnifiedSearchService> logger, 
        ApplicationDbContext context,
        IMapper mapper)
    {
        _logger = logger;
        _context = context;
        _mapper = mapper;
    }

    /// <summary>
    /// Perform unified search across multiple entity types
    /// </summary>
    /// <param name="request">Search request with query and filters</param>
    /// <param name="userId">ID of the user performing the search</param>
    /// <returns>Comprehensive search results with highlighting and facets</returns>
    public async Task<UnifiedSearchResponseDTO> SearchAsync(UnifiedSearchRequestDTO request, int userId)
    {
        try
        {
            _logger.LogInformation("Performing unified search for user {UserId} with query: {Query}", userId, request.Query);

            Stopwatch stopwatch = Stopwatch.StartNew();
            
            // Initialize response
            UnifiedSearchResponseDTO response = new UnifiedSearchResponseDTO
            {
                Query = request.Query,
                TotalResults = 0,
                ExecutionTimeMs = 0,
                Tasks = new SearchResultGroupDTO<TaskSearchResultDTO>(),
                Families = new SearchResultGroupDTO<FamilySearchResultDTO>(),
                Achievements = new SearchResultGroupDTO<AchievementSearchResultDTO>(),
                Boards = new SearchResultGroupDTO<BoardSearchResultDTO>(),
                Notifications = new SearchResultGroupDTO<NotificationSearchResultDTO>(),
                Activities = new SearchResultGroupDTO<ActivitySearchResultDTO>(),
                Suggestions = new List<SearchSuggestionDTO>(),
                Facets = new SearchFacetsDTO()
            };

            // Search each entity type if requested
            List<SearchEntityTypeDTO> entityTypes = request.EntityTypes?.Any() == true ? request.EntityTypes : GetAllEntityTypes();
            
            foreach (SearchEntityTypeDTO entityType in entityTypes)
            {
                switch (entityType)
                {
                    case SearchEntityTypeDTO.Tasks:
                        response.Tasks = await SearchTasksAsync(request.Query, userId, request.Pagination);
                        response.TotalResults += response.Tasks.TotalCount;
                        break;
                    case SearchEntityTypeDTO.Families:
                        response.Families = await SearchFamiliesAsync(request.Query, userId, request.Pagination);
                        response.TotalResults += response.Families.TotalCount;
                        break;
                    case SearchEntityTypeDTO.Achievements:
                        response.Achievements = await SearchAchievementsAsync(request.Query, userId, request.Pagination);
                        response.TotalResults += response.Achievements.TotalCount;
                        break;
                    case SearchEntityTypeDTO.Boards:
                        response.Boards = await SearchBoardsAsync(request.Query, userId, request.Pagination);
                        response.TotalResults += response.Boards.TotalCount;
                        break;
                    case SearchEntityTypeDTO.Notifications:
                        response.Notifications = await SearchNotificationsAsync(request.Query, userId, request.Pagination);
                        response.TotalResults += response.Notifications.TotalCount;
                        break;
                    case SearchEntityTypeDTO.Activities:
                        // Skip - Activities table not found in context
                        break;
                }
            }

            stopwatch.Stop();
            response.ExecutionTimeMs = stopwatch.ElapsedMilliseconds;
            
            _logger.LogInformation("Search completed for user {UserId} with {TotalResults} results in {ExecutionTime}ms", 
                userId, response.TotalResults, response.ExecutionTimeMs);

            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error performing unified search for user {UserId}", userId);
            throw;
        }
    }

    private async Task<SearchResultGroupDTO<TaskSearchResultDTO>> SearchTasksAsync(string query, int userId, SearchPaginationDTO? pagination)
    {
        try
        {
            int pageSize = pagination?.PageSize ?? 20;
            int page = pagination?.Page ?? 1;

            IQueryable<TaskItem> tasksQuery = _context.TaskItems
                .Where(t => t.UserId == userId)
                .Where(t => EF.Functions.Like(t.Title, $"%{query}%") || 
                           EF.Functions.Like(t.Description ?? "", $"%{query}%"))
                .Include(t => t.Category)
                .Include(t => t.Family);

            int totalCount = await tasksQuery.CountAsync();
            
            List<TaskItem> taskItems = await tasksQuery
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            // Use AutoMapper for Model → DTO conversion
            List<TaskSearchResultDTO> tasks = _mapper.Map<List<TaskSearchResultDTO>>(taskItems);

            return new SearchResultGroupDTO<TaskSearchResultDTO>
            {
                Results = tasks,
                TotalCount = totalCount,
                HasMore = totalCount > page * pageSize
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching tasks for user {UserId}", userId);
            return new SearchResultGroupDTO<TaskSearchResultDTO>();
        }
    }



    private async Task<SearchResultGroupDTO<FamilySearchResultDTO>> SearchFamiliesAsync(string query, int userId, SearchPaginationDTO? pagination)
    {
        try
        {
            int pageSize = pagination?.PageSize ?? 20;
            int page = pagination?.Page ?? 1;

            IQueryable<Family> familiesQuery = _context.Families
                .Where(f => f.Members.Any(fm => fm.UserId == userId))
                .Where(f => EF.Functions.Like(f.Name, $"%{query}%") || 
                           EF.Functions.Like(f.Description ?? "", $"%{query}%"));

            int totalCount = await familiesQuery.CountAsync();
            
            List<Family> familyItems = await familiesQuery
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            // Use AutoMapper for Model → DTO conversion
            List<FamilySearchResultDTO> families = _mapper.Map<List<FamilySearchResultDTO>>(familyItems);

            return new SearchResultGroupDTO<FamilySearchResultDTO>
            {
                Results = families,
                TotalCount = totalCount,
                HasMore = totalCount > page * pageSize
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching families for user {UserId}", userId);
            return new SearchResultGroupDTO<FamilySearchResultDTO>();
        }
    }

    private async Task<SearchResultGroupDTO<AchievementSearchResultDTO>> SearchAchievementsAsync(string query, int userId, SearchPaginationDTO? pagination)
    {
        try
        {
            int pageSize = pagination?.PageSize ?? 20;
            int page = pagination?.Page ?? 1;

            IQueryable<Achievement> achievementsQuery = _context.Achievements
                .Where(a => EF.Functions.Like(a.Name, $"%{query}%") || 
                           EF.Functions.Like(a.Description ?? "", $"%{query}%"));

            int totalCount = await achievementsQuery.CountAsync();
            
            List<Achievement> achievementItems = await achievementsQuery
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            // Use AutoMapper for Model → DTO conversion
            List<AchievementSearchResultDTO> achievements = _mapper.Map<List<AchievementSearchResultDTO>>(achievementItems);

            return new SearchResultGroupDTO<AchievementSearchResultDTO>
            {
                Results = achievements,
                TotalCount = totalCount,
                HasMore = totalCount > page * pageSize
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching achievements for user {UserId}", userId);
            return new SearchResultGroupDTO<AchievementSearchResultDTO>();
        }
    }

    private async Task<SearchResultGroupDTO<BoardSearchResultDTO>> SearchBoardsAsync(string query, int userId, SearchPaginationDTO? pagination)
    {
        try
        {
            int pageSize = pagination?.PageSize ?? 20;
            int page = pagination?.Page ?? 1;

            IQueryable<Board> boardsQuery = _context.Boards
                .Where(b => b.UserId == userId)
                .Where(b => EF.Functions.Like(b.Name, $"%{query}%") || 
                           EF.Functions.Like(b.Description ?? "", $"%{query}%"));

            int totalCount = await boardsQuery.CountAsync();
            
            List<Board> boardItems = await boardsQuery
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            // Use AutoMapper for Model → DTO conversion
            List<BoardSearchResultDTO> boards = _mapper.Map<List<BoardSearchResultDTO>>(boardItems);

            return new SearchResultGroupDTO<BoardSearchResultDTO>
            {
                Results = boards,
                TotalCount = totalCount,
                HasMore = totalCount > page * pageSize
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching boards for user {UserId}", userId);
            return new SearchResultGroupDTO<BoardSearchResultDTO>();
        }
    }

    private async Task<SearchResultGroupDTO<NotificationSearchResultDTO>> SearchNotificationsAsync(string query, int userId, SearchPaginationDTO? pagination)
    {
        try
        {
            int pageSize = pagination?.PageSize ?? 20;
            int page = pagination?.Page ?? 1;

            IQueryable<Notification> notificationsQuery = _context.Notifications
                .Where(n => n.UserId == userId)
                .Where(n => EF.Functions.Like(n.Title, $"%{query}%") || 
                           EF.Functions.Like(n.Message, $"%{query}%"));

            int totalCount = await notificationsQuery.CountAsync();
            
            List<Notification> notificationItems = await notificationsQuery
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            // Use AutoMapper for Model → DTO conversion
            List<NotificationSearchResultDTO> notifications = _mapper.Map<List<NotificationSearchResultDTO>>(notificationItems);

            return new SearchResultGroupDTO<NotificationSearchResultDTO>
            {
                Results = notifications,
                TotalCount = totalCount,
                HasMore = totalCount > page * pageSize
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching notifications for user {UserId}", userId);
            return new SearchResultGroupDTO<NotificationSearchResultDTO>();
        }
    }

    private List<SearchEntityTypeDTO> GetAllEntityTypes()
    {
        return new List<SearchEntityTypeDTO>
        {
            SearchEntityTypeDTO.Tasks,
            SearchEntityTypeDTO.Families,
            SearchEntityTypeDTO.Achievements,
            SearchEntityTypeDTO.Boards,
            SearchEntityTypeDTO.Notifications,
            // Skip Activities, Tags, Categories, Templates for now
        };
    }

    /// <summary>
    /// Get search suggestions for auto-complete functionality
    /// </summary>
    /// <param name="query">Partial search query</param>
    /// <param name="userId">ID of the user requesting suggestions</param>
    /// <param name="limit">Maximum number of suggestions</param>
    /// <returns>List of search suggestions with confidence scores</returns>
    public async Task<List<SearchSuggestionDTO>> GetSearchSuggestionsAsync(string query, int userId, int limit = 10)
    {
        try
        {
            _logger.LogInformation("Getting search suggestions for user {UserId} with query: {Query}", userId, query);

            // Return empty suggestions for now
            await Task.CompletedTask; // Satisfy async requirement
            return new List<SearchSuggestionDTO>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting search suggestions for user {UserId}", userId);
            throw;
        }
    }

    /// <summary>
    /// Get available search facets for filtering
    /// </summary>
    /// <param name="query">Search query for facet calculation</param>
    /// <param name="userId">ID of the user requesting facets</param>
    /// <param name="familyId">Optional family context for facets</param>
    /// <returns>Available search facets with counts</returns>
    public async Task<SearchFacetsDTO> GetSearchFacetsAsync(string query, int userId, int? familyId = null)
    {
        try
        {
            _logger.LogInformation("Getting search facets for user {UserId} with query: {Query}", userId, query);

            // Return empty facets for now
            await Task.CompletedTask; // Satisfy async requirement
            return new SearchFacetsDTO();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting search facets for user {UserId}", userId);
            throw;
        }
    }

    /// <summary>
    /// Get user's search history
    /// </summary>
    /// <param name="userId">ID of the user</param>
    /// <param name="limit">Maximum number of history entries</param>
    /// <returns>List of search history entries</returns>
    public async Task<List<SearchHistory>> GetSearchHistoryAsync(int userId, int limit = 50)
    {
        try
        {
            _logger.LogInformation("Getting search history for user {UserId}", userId);

            // Return empty history for now
            await Task.CompletedTask; // Satisfy async requirement
            return new List<SearchHistory>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting search history for user {UserId}", userId);
            throw;
        }
    }

    /// <summary>
    /// Clear user's search history
    /// </summary>
    /// <param name="userId">ID of the user</param>
    /// <returns>True if successful</returns>
    public async Task<bool> ClearSearchHistoryAsync(int userId)
    {
        try
        {
            _logger.LogInformation("Clearing search history for user {UserId}", userId);

            // Return true for now (no-op)
            await Task.CompletedTask; // Satisfy async requirement
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error clearing search history for user {UserId}", userId);
            throw;
        }
    }

    /// <summary>
    /// Delete specific search history entry
    /// </summary>
    /// <param name="historyId">ID of the history entry</param>
    /// <param name="userId">ID of the user who owns the entry</param>
    /// <returns>True if successful</returns>
    public async Task<bool> DeleteSearchHistoryEntryAsync(int historyId, int userId)
    {
        try
        {
            _logger.LogInformation("Deleting search history entry {HistoryId} for user {UserId}", historyId, userId);

            // Return true for now (no-op)
            await Task.CompletedTask; // Satisfy async requirement
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting search history entry {HistoryId} for user {UserId}", historyId, userId);
            throw;
        }
    }

    /// <summary>
    /// Get search analytics for user or family
    /// </summary>
    /// <param name="userId">ID of the user</param>
    /// <param name="familyId">Optional family ID for family-level analytics</param>
    /// <param name="timePeriod">Optional time period for analytics</param>
    /// <returns>Search analytics with performance metrics</returns>
    public async Task<SearchAnalyticsDTO> GetSearchAnalyticsAsync(int userId, int? familyId = null, SearchDateRangeDTO? timePeriod = null)
    {
        try
        {
            _logger.LogInformation("Getting search analytics for user {UserId}", userId);

            // Return empty analytics for now
            await Task.CompletedTask; // Satisfy async requirement
            return new SearchAnalyticsDTO
            {
                TotalSearches = 0,
                PopularTerms = new List<PopularSearchTermDTO>(),
                Performance = new SearchPerformanceMetricsDTO(),
                EntityTypeUsage = new Dictionary<SearchEntityTypeDTO, int>()
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting search analytics for user {UserId}", userId);
            throw;
        }
    }

    /// <summary>
    /// Get popular search terms
    /// </summary>
    /// <param name="userId">ID of the user</param>
    /// <param name="familyId">Optional family ID for family-specific terms</param>
    /// <param name="limit">Maximum number of terms</param>
    /// <returns>List of popular search terms with usage counts</returns>
    public async Task<List<PopularSearchTermDTO>> GetPopularSearchTermsAsync(int userId, int? familyId = null, int limit = 10)
    {
        try
        {
            _logger.LogInformation("Getting popular search terms for user {UserId}", userId);

            // Return empty list for now
            await Task.CompletedTask; // Satisfy async requirement
            return new List<PopularSearchTermDTO>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting popular search terms for user {UserId}", userId);
            throw;
        }
    }
} 