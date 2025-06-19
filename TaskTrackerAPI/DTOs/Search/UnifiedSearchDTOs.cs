/*
 * Unified Search DTOs
 * Copyright (c) 2025 Carlos Abril Jr
 * Day 79: Advanced Search & Discovery Implementation
 */

using TaskTrackerAPI.DTOs.Tasks;
using TaskTrackerAPI.DTOs.Family;
using TaskTrackerAPI.DTOs.Gamification;
using TaskTrackerAPI.DTOs.Boards;
using TaskTrackerAPI.DTOs.Notifications;
using TaskTrackerAPI.DTOs.Activity;
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;
using System;

namespace TaskTrackerAPI.DTOs.Search;

/// <summary>
/// Unified search request DTO for cross-entity searching
/// </summary>
public class UnifiedSearchRequestDTO
{
    /// <summary>
    /// Search query string
    /// </summary>
    [Required]
    [StringLength(500, MinimumLength = 1)]
    public required string Query { get; set; }

    /// <summary>
    /// Entity types to search (if empty, searches all)
    /// </summary>
    public List<SearchEntityTypeDTO> EntityTypes { get; set; } = new();

    /// <summary>
    /// Date range filter
    /// </summary>
    public SearchDateRangeDTO? DateRange { get; set; }

    /// <summary>
    /// Family context for family-scoped searches
    /// </summary>
    public int? FamilyId { get; set; }

    /// <summary>
    /// Advanced filters
    /// </summary>
    public Dictionary<string, object>? Filters { get; set; }

    /// <summary>
    /// Sort options
    /// </summary>
    public SearchSortDTO? Sort { get; set; }

    /// <summary>
    /// Pagination options
    /// </summary>
    public SearchPaginationDTO? Pagination { get; set; }
}

/// <summary>
/// Unified search response DTO containing all matching results
/// </summary>
public class UnifiedSearchResponseDTO
{
    /// <summary>
    /// Search query that was executed
    /// </summary>
    public required string Query { get; set; }

    /// <summary>
    /// Total number of results across all entities
    /// </summary>
    public int TotalResults { get; set; }

    /// <summary>
    /// Execution time in milliseconds
    /// </summary>
    public long ExecutionTimeMs { get; set; }

    /// <summary>
    /// Task search results
    /// </summary>
    public SearchResultGroupDTO<TaskSearchResultDTO> Tasks { get; set; } = new();

    /// <summary>
    /// Family search results
    /// </summary>
    public SearchResultGroupDTO<FamilySearchResultDTO> Families { get; set; } = new();

    /// <summary>
    /// Achievement search results
    /// </summary>
    public SearchResultGroupDTO<AchievementSearchResultDTO> Achievements { get; set; } = new();

    /// <summary>
    /// Board search results
    /// </summary>
    public SearchResultGroupDTO<BoardSearchResultDTO> Boards { get; set; } = new();

    /// <summary>
    /// Notification search results
    /// </summary>
    public SearchResultGroupDTO<NotificationSearchResultDTO> Notifications { get; set; } = new();

    /// <summary>
    /// Activity search results
    /// </summary>
    public SearchResultGroupDTO<ActivitySearchResultDTO> Activities { get; set; } = new();

    /// <summary>
    /// Search suggestions for improved results
    /// </summary>
    public List<SearchSuggestionDTO> Suggestions { get; set; } = new();

    /// <summary>
    /// Faceted search filters available
    /// </summary>
    public SearchFacetsDTO Facets { get; set; } = new();
}

/// <summary>
/// Generic search result group container
/// </summary>
public class SearchResultGroupDTO<T> where T : class
{
    /// <summary>
    /// Results in this group
    /// </summary>
    public List<T> Results { get; set; } = new();

    /// <summary>
    /// Total count in this group (may be larger than Results if paginated)
    /// </summary>
    public int TotalCount { get; set; }

    /// <summary>
    /// Whether there are more results available
    /// </summary>
    public bool HasMore { get; set; }
}

/// <summary>
/// Search entity types enumeration
/// </summary>
public enum SearchEntityTypeDTO
{
    Tasks,
    Families,
    Achievements,
    Boards,
    Notifications,
    Activities,
    Tags,
    Categories,
    Templates
}

/// <summary>
/// Date range filter for searches
/// </summary>
public class SearchDateRangeDTO
{
    /// <summary>
    /// Start date (inclusive)
    /// </summary>
    public DateTime? StartDate { get; set; }

    /// <summary>
    /// End date (inclusive)
    /// </summary>
    public DateTime? EndDate { get; set; }

    /// <summary>
    /// Predefined range options
    /// </summary>
    public SearchDateRangeTypeDTO? RangeType { get; set; }
}

/// <summary>
/// Predefined date range types
/// </summary>
public enum SearchDateRangeTypeDTO
{
    Today,
    Yesterday,
    ThisWeek,
    LastWeek,
    ThisMonth,
    LastMonth,
    LastThreeMonths,
    ThisYear,
    LastYear
}

/// <summary>
/// Search sorting options
/// </summary>
public class SearchSortDTO
{
    /// <summary>
    /// Field to sort by
    /// </summary>
    [Required]
    public required string Field { get; set; }

    /// <summary>
    /// Sort direction
    /// </summary>
    public SearchSortDirectionDTO Direction { get; set; } = SearchSortDirectionDTO.Desc;

    /// <summary>
    /// Secondary sort field
    /// </summary>
    public string? SecondaryField { get; set; }

    /// <summary>
    /// Secondary sort direction
    /// </summary>
    public SearchSortDirectionDTO SecondaryDirection { get; set; } = SearchSortDirectionDTO.Asc;
}

/// <summary>
/// Search sort direction
/// </summary>
public enum SearchSortDirectionDTO
{
    Asc,
    Desc
}

/// <summary>
/// Search pagination options
/// </summary>
public class SearchPaginationDTO
{
    /// <summary>
    /// Page number (1-based)
    /// </summary>
    [Range(1, int.MaxValue)]
    public int Page { get; set; } = 1;

    /// <summary>
    /// Results per page
    /// </summary>
    [Range(1, 100)]
    public int PageSize { get; set; } = 20;

    /// <summary>
    /// Skip count for offset-based pagination
    /// </summary>
    public int Skip => (Page - 1) * PageSize;
}

/// <summary>
/// Task search result DTO
/// </summary>
public class TaskSearchResultDTO
{
    public int Id { get; set; }
    public required string Title { get; set; }
    public string? Description { get; set; }
    public TaskItemStatusDTO Status { get; set; }
    public TaskPriorityDTO Priority { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public int? AssignedToUserId { get; set; }
    public string? AssignedToUserName { get; set; }
    public int? FamilyId { get; set; }
    public string? FamilyName { get; set; }
    public List<string> Tags { get; set; } = new();
    public string? CategoryName { get; set; }
    public List<SearchHighlightDTO> Highlights { get; set; } = new();
    public double SearchScore { get; set; }
}

/// <summary>
/// Family search result DTO
/// </summary>
public class FamilySearchResultDTO
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }
    public int MemberCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? CreatedByUserName { get; set; }
    public List<string> MemberNames { get; set; } = new();
    public List<SearchHighlightDTO> Highlights { get; set; } = new();
    public double SearchScore { get; set; }
}

/// <summary>
/// Achievement search result DTO
/// </summary>
public class AchievementSearchResultDTO
{
    public int Id { get; set; }
    public required string Title { get; set; }
    public required string Description { get; set; }
    public string? Icon { get; set; }
    public int Points { get; set; }
    public bool IsUnlocked { get; set; }
    public DateTime? UnlockedAt { get; set; }
    public string? Category { get; set; }
    public string? Difficulty { get; set; }
    public List<SearchHighlightDTO> Highlights { get; set; } = new();
    public double SearchScore { get; set; }
}

/// <summary>
/// Board search result DTO
/// </summary>
public class BoardSearchResultDTO
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }
    public int TaskCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? LastModifiedAt { get; set; }
    public int? FamilyId { get; set; }
    public string? FamilyName { get; set; }
    public string? Template { get; set; }
    public List<SearchHighlightDTO> Highlights { get; set; } = new();
    public double SearchScore { get; set; }
}

/// <summary>
/// Notification search result DTO
/// </summary>
public class NotificationSearchResultDTO
{
    public int Id { get; set; }
    public required string Title { get; set; }
    public required string Message { get; set; }
    public NotificationTypeDTO Type { get; set; }
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }
    public int? RelatedEntityId { get; set; }
    public string? RelatedEntityType { get; set; }
    public List<SearchHighlightDTO> Highlights { get; set; } = new();
    public double SearchScore { get; set; }
}

/// <summary>
/// Activity search result DTO
/// </summary>
public class ActivitySearchResultDTO
{
    public int Id { get; set; }
    public required string Description { get; set; }
    public required string ActivityType { get; set; }
    public DateTime Timestamp { get; set; }
    public int UserId { get; set; }
    public required string UserName { get; set; }
    public int? FamilyId { get; set; }
    public string? FamilyName { get; set; }
    public int? RelatedEntityId { get; set; }
    public string? RelatedEntityType { get; set; }
    public List<SearchHighlightDTO> Highlights { get; set; } = new();
    public double SearchScore { get; set; }
}

/// <summary>
/// Search text highlighting information
/// </summary>
public class SearchHighlightDTO
{
    /// <summary>
    /// Field name that contains the highlight
    /// </summary>
    public required string Field { get; set; }

    /// <summary>
    /// Highlighted text with markup
    /// </summary>
    public required string HighlightedText { get; set; }

    /// <summary>
    /// Original text without markup
    /// </summary>
    public required string OriginalText { get; set; }

    /// <summary>
    /// Start position of highlight in original text
    /// </summary>
    public int StartPosition { get; set; }

    /// <summary>
    /// Length of highlighted text
    /// </summary>
    public int Length { get; set; }
}

/// <summary>
/// Search suggestion DTO
/// </summary>
public class SearchSuggestionDTO
{
    /// <summary>
    /// Suggested search term
    /// </summary>
    public required string Term { get; set; }

    /// <summary>
    /// Type of suggestion
    /// </summary>
    public SearchSuggestionTypeDTO Type { get; set; }

    /// <summary>
    /// Confidence score (0-1)
    /// </summary>
    public double Confidence { get; set; }

    /// <summary>
    /// Estimated result count
    /// </summary>
    public int EstimatedResults { get; set; }
}

/// <summary>
/// Search suggestion types
/// </summary>
public enum SearchSuggestionTypeDTO
{
    Autocomplete,
    DidYouMean,
    RelatedTerm,
    PopularSearch,
    RecentSearch
}

/// <summary>
/// Search facets for filtering
/// </summary>
public class SearchFacetsDTO
{
    /// <summary>
    /// Available entity type filters
    /// </summary>
    public List<SearchFacetDTO> EntityTypes { get; set; } = new();

    /// <summary>
    /// Available date range filters
    /// </summary>
    public List<SearchFacetDTO> DateRanges { get; set; } = new();

    /// <summary>
    /// Available family filters
    /// </summary>
    public List<SearchFacetDTO> Families { get; set; } = new();

    /// <summary>
    /// Available status filters
    /// </summary>
    public List<SearchFacetDTO> Statuses { get; set; } = new();

    /// <summary>
    /// Available priority filters
    /// </summary>
    public List<SearchFacetDTO> Priorities { get; set; } = new();

    /// <summary>
    /// Available tag filters
    /// </summary>
    public List<SearchFacetDTO> Tags { get; set; } = new();

    /// <summary>
    /// Available category filters
    /// </summary>
    public List<SearchFacetDTO> Categories { get; set; } = new();
}

/// <summary>
/// Individual search facet
/// </summary>
public class SearchFacetDTO
{
    /// <summary>
    /// Facet value
    /// </summary>
    public required string Value { get; set; }

    /// <summary>
    /// Display label
    /// </summary>
    public required string Label { get; set; }

    /// <summary>
    /// Number of results for this facet
    /// </summary>
    public int Count { get; set; }

    /// <summary>
    /// Whether this facet is currently selected
    /// </summary>
    public bool IsSelected { get; set; }
}

/// <summary>
/// Saved search DTO
/// </summary>
public class SavedSearchDTO
{
    public int Id { get; set; }
    
    [Required]
    [StringLength(100)]
    public required string Name { get; set; }
    
    [Required]
    [StringLength(500)]
    public required string Query { get; set; }
    
    public List<SearchEntityTypeDTO> EntityTypes { get; set; } = new();
    
    public Dictionary<string, object>? Filters { get; set; }
    
    public SearchSortDTO? Sort { get; set; }
    
    public DateTime CreatedAt { get; set; }
    
    public DateTime? LastUsedAt { get; set; }
    
    public int UsageCount { get; set; }
    
    public bool IsPublic { get; set; }
    
    public int? FamilyId { get; set; }
}

/// <summary>
/// Create saved search request DTO
/// </summary>
public class CreateSavedSearchDTO
{
    [Required]
    [StringLength(100)]
    public required string Name { get; set; }
    
    [Required]
    [StringLength(500)]
    public required string Query { get; set; }
    
    public List<SearchEntityTypeDTO> EntityTypes { get; set; } = new();
    
    public Dictionary<string, object>? Filters { get; set; }
    
    public SearchSortDTO? Sort { get; set; }
    
    public bool IsPublic { get; set; }
    
    public int? FamilyId { get; set; }
}

/// <summary>
/// Search analytics DTO
/// </summary>
public class SearchAnalyticsDTO
{
    /// <summary>
    /// Total searches performed
    /// </summary>
    public int TotalSearches { get; set; }

    /// <summary>
    /// Most popular search terms
    /// </summary>
    public List<PopularSearchTermDTO> PopularTerms { get; set; } = new();

    /// <summary>
    /// Search performance metrics
    /// </summary>
    public SearchPerformanceMetricsDTO Performance { get; set; } = new();

    /// <summary>
    /// Entity type usage statistics
    /// </summary>
    public Dictionary<SearchEntityTypeDTO, int> EntityTypeUsage { get; set; } = new();

    /// <summary>
    /// Time period for analytics
    /// </summary>
    public SearchDateRangeDTO? TimePeriod { get; set; }
}

/// <summary>
/// Popular search term DTO
/// </summary>
public class PopularSearchTermDTO
{
    public required string Term { get; set; }
    public int Count { get; set; }
    public DateTime LastSearched { get; set; }
    public double AverageResults { get; set; }
}

/// <summary>
/// Search performance metrics DTO
/// </summary>
public class SearchPerformanceMetricsDTO
{
    public double AverageExecutionTimeMs { get; set; }
    public double MedianExecutionTimeMs { get; set; }
    public double P95ExecutionTimeMs { get; set; }
    public double AverageResultCount { get; set; }
    public double ZeroResultsPercentage { get; set; }
}

/// <summary>
/// Search filters DTO for advanced filtering
/// </summary>
public class SearchFiltersDTO
{
    /// <summary>
    /// Date range filter
    /// </summary>
    public SearchDateRangeDTO? DateRange { get; set; }

    /// <summary>
    /// Entity status filters
    /// </summary>
    public List<string>? Statuses { get; set; }

    /// <summary>
    /// Priority filters
    /// </summary>
    public List<string>? Priorities { get; set; }

    /// <summary>
    /// Tag filters
    /// </summary>
    public List<string>? Tags { get; set; }

    /// <summary>
    /// Category filters
    /// </summary>
    public List<string>? Categories { get; set; }

    /// <summary>
    /// Family context filters
    /// </summary>
    public List<int>? FamilyIds { get; set; }

    /// <summary>
    /// User assignment filters
    /// </summary>
    public List<int>? AssignedToUserIds { get; set; }

    /// <summary>
    /// Custom field filters
    /// </summary>
    public Dictionary<string, object>? CustomFilters { get; set; }
}

/// <summary>
/// Search entity type enum (non-DTO version for internal use)
/// </summary>
public enum SearchEntityType
{
    Tasks,
    Families,
    Achievements,
    Boards,
    Notifications,
    Activities,
    Tags,
    Categories,
    Templates
} 