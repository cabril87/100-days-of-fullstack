/*
 * Search AutoMapper Profile
 * Copyright (c) 2025 Carlos Abril Jr
 * Day 79: Advanced Search & Discovery Implementation
 */

using System;
using System.Collections.Generic;
using System.Linq;
using AutoMapper;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.DTOs.Search;
using TaskTrackerAPI.DTOs.Tasks;
using TaskTrackerAPI.DTOs.Family;
using TaskTrackerAPI.DTOs.Gamification;
using TaskTrackerAPI.DTOs.Boards;
using TaskTrackerAPI.DTOs.Notifications;
using TaskTrackerAPI.DTOs.Activity;
using TaskTrackerAPI.Models.Gamification;
using Newtonsoft.Json;

namespace TaskTrackerAPI.Profiles;

/// <summary>
/// AutoMapper profile for search-related mappings
/// </summary>
public class SearchProfile : Profile
{
    public SearchProfile()
    {
        // SavedSearch mappings
        CreateMap<SavedSearch, SavedSearchDTO>()
            .ForMember(dest => dest.EntityTypes, opt => opt.MapFrom(src => 
                DeserializeEntityTypes(src.EntityTypes)))
            .ForMember(dest => dest.Filters, opt => opt.MapFrom(src => 
                DeserializeFilters(src.Filters)))
            .ForMember(dest => dest.Sort, opt => opt.MapFrom(src => 
                DeserializeSort(src.Sort)));

        CreateMap<CreateSavedSearchDTO, SavedSearch>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.UserId, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.LastUsedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UsageCount, opt => opt.Ignore())
            .ForMember(dest => dest.User, opt => opt.Ignore())
            .ForMember(dest => dest.Family, opt => opt.Ignore())
            .ForMember(dest => dest.EntityTypes, opt => opt.MapFrom(src => 
                SerializeEntityTypes(src.EntityTypes)))
            .ForMember(dest => dest.Filters, opt => opt.MapFrom(src => 
                SerializeFilters(src.Filters)))
            .ForMember(dest => dest.Sort, opt => opt.MapFrom(src => 
                SerializeSort(src.Sort)));

        // SearchHistory mappings
        CreateMap<SearchHistory, SearchHistory>(); // For repository operations

        // Search suggestion mappings
        CreateMap<SearchHistory, SearchSuggestionDTO>()
            .ForMember(dest => dest.Term, opt => opt.MapFrom(src => src.Query))
            .ForMember(dest => dest.Type, opt => opt.MapFrom(src => SearchSuggestionTypeDTO.RecentSearch))
            .ForMember(dest => dest.Confidence, opt => opt.MapFrom(src => 0.8))
            .ForMember(dest => dest.EstimatedResults, opt => opt.MapFrom(src => src.ResultCount));

        // Popular search term mappings
        CreateMap<SearchHistory, PopularSearchTermDTO>()
            .ForMember(dest => dest.Term, opt => opt.MapFrom(src => src.Query))
            .ForMember(dest => dest.Count, opt => opt.Ignore()) // Will be calculated in repository
            .ForMember(dest => dest.LastSearched, opt => opt.MapFrom(src => src.SearchedAt))
            .ForMember(dest => dest.AverageResults, opt => opt.MapFrom(src => (double)src.ResultCount));

        // Date range mappings
        CreateMap<SearchDateRangeTypeDTO, DateTimeOffset[]>()
            .ConvertUsing(src => GetDateRangeFromType(src));

        // ===== SEARCH RESULT MAPPINGS =====
        // Entity → Search Result DTO mappings for UnifiedSearchService

        // TaskItem → TaskSearchResultDTO
        CreateMap<TaskItem, TaskSearchResultDTO>()
            .ForMember(dest => dest.Title, opt => opt.MapFrom(src => src.Title))
            .ForMember(dest => dest.Description, opt => opt.MapFrom(src => src.Description))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => (TaskItemStatusDTO)src.Status))
            .ForMember(dest => dest.Priority, opt => opt.MapFrom(src => ConvertStringPriorityToEnum(src.Priority)))
            .ForMember(dest => dest.AssignedToUserName, opt => opt.MapFrom(src => 
                src.AssignedTo != null ? src.AssignedTo.Username : 
                src.AssignedToFamilyMember != null && src.AssignedToFamilyMember.User != null ? 
                src.AssignedToFamilyMember.User.Username : null))
            .ForMember(dest => dest.AssignedToUserId, opt => opt.MapFrom(src => src.AssignedToId))
            .ForMember(dest => dest.FamilyId, opt => opt.MapFrom(src => src.FamilyId))
            .ForMember(dest => dest.FamilyName, opt => opt.MapFrom(src => 
                src.Family != null ? src.Family.Name : null))
            .ForMember(dest => dest.Tags, opt => opt.Ignore()) // Will need to be populated by service if needed
            .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => 
                src.Category != null ? src.Category.Name : null))
            .ForMember(dest => dest.Highlights, opt => opt.Ignore())
            .ForMember(dest => dest.SearchScore, opt => opt.Ignore());

        // Family → FamilySearchResultDTO
        CreateMap<Family, FamilySearchResultDTO>()
            .ForMember(dest => dest.MemberCount, opt => opt.MapFrom(src => 
                src.Members != null ? src.Members.Count : 0))
            .ForMember(dest => dest.CreatedByUserName, opt => opt.MapFrom(src => 
                src.CreatedByUser != null ? src.CreatedByUser.Username : null))
            .ForMember(dest => dest.MemberNames, opt => opt.MapFrom(src => 
                src.Members != null ? src.Members.Select(m => m.User.Username).ToList() : new List<string>()))
            .ForMember(dest => dest.Highlights, opt => opt.Ignore())
            .ForMember(dest => dest.SearchScore, opt => opt.Ignore());

        // Achievement → AchievementSearchResultDTO  
        CreateMap<Achievement, AchievementSearchResultDTO>()
            .ForMember(dest => dest.Title, opt => opt.MapFrom(src => src.Name))
            .ForMember(dest => dest.Icon, opt => opt.MapFrom(src => src.IconUrl))
            .ForMember(dest => dest.Points, opt => opt.MapFrom(src => src.PointValue))
            .ForMember(dest => dest.IsUnlocked, opt => opt.Ignore()) // Will be set by service based on user context
            .ForMember(dest => dest.UnlockedAt, opt => opt.Ignore()) // Will be set by service based on user context
            .ForMember(dest => dest.Difficulty, opt => opt.MapFrom(src => src.Difficulty.ToString()))
            .ForMember(dest => dest.Highlights, opt => opt.Ignore())
            .ForMember(dest => dest.SearchScore, opt => opt.Ignore());

        // Board → BoardSearchResultDTO
        CreateMap<Board, BoardSearchResultDTO>()
            .ForMember(dest => dest.TaskCount, opt => opt.MapFrom(src => 
                src.Tasks != null ? src.Tasks.Count : 0))
            .ForMember(dest => dest.LastModifiedAt, opt => opt.MapFrom(src => src.UpdatedAt))
            .ForMember(dest => dest.FamilyId, opt => opt.Ignore()) // Board doesn't have FamilyId property
            .ForMember(dest => dest.FamilyName, opt => opt.Ignore()) // Board doesn't have Family navigation
            .ForMember(dest => dest.Template, opt => opt.MapFrom(src => src.Template))
            .ForMember(dest => dest.Highlights, opt => opt.Ignore())
            .ForMember(dest => dest.SearchScore, opt => opt.Ignore());

        // Notification → NotificationSearchResultDTO
        CreateMap<Notification, NotificationSearchResultDTO>()
            .ForMember(dest => dest.IsRead, opt => opt.MapFrom(src => src.ReadAt.HasValue))
            .ForMember(dest => dest.RelatedEntityType, opt => opt.MapFrom(src => src.RelatedEntityType))
            .ForMember(dest => dest.RelatedEntityId, opt => opt.MapFrom(src => src.RelatedEntityId))
            .ForMember(dest => dest.Highlights, opt => opt.Ignore())
            .ForMember(dest => dest.SearchScore, opt => opt.Ignore());

        // FamilyActivity → ActivitySearchResultDTO
        CreateMap<FamilyActivity, ActivitySearchResultDTO>()
            .ForMember(dest => dest.ActivityType, opt => opt.MapFrom(src => src.ActionType))
            .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.ActorId))
            .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => 
                src.Actor != null ? src.Actor.Username : "Unknown"))
            .ForMember(dest => dest.FamilyName, opt => opt.MapFrom(src => 
                src.Family != null ? src.Family.Name : null))
            .ForMember(dest => dest.RelatedEntityId, opt => opt.MapFrom(src => src.EntityId))
            .ForMember(dest => dest.RelatedEntityType, opt => opt.MapFrom(src => src.EntityType))
            .ForMember(dest => dest.Highlights, opt => opt.Ignore())
            .ForMember(dest => dest.SearchScore, opt => opt.Ignore());
    }

    /// <summary>
    /// Convert string priority to TaskPriorityDTO enum
    /// </summary>
    private static TaskPriorityDTO ConvertStringPriorityToEnum(string priority)
    {
        if (string.IsNullOrEmpty(priority))
            return TaskPriorityDTO.Medium;
        
        // First try to parse as integer (if already stored as "0", "1", "2", "3")
        if (int.TryParse(priority, out int numericPriority))
        {
            return numericPriority switch
            {
                0 => TaskPriorityDTO.Low,
                1 => TaskPriorityDTO.Medium,
                2 => TaskPriorityDTO.High,
                3 => TaskPriorityDTO.Critical,
                _ => TaskPriorityDTO.Medium
            };
        }
        
        // Then try to parse as string
        return priority.ToLower() switch
        {
            "critical" or "urgent" or "3" => TaskPriorityDTO.Critical,
            "high" or "2" => TaskPriorityDTO.High,
            "medium" or "1" => TaskPriorityDTO.Medium,
            "low" or "0" => TaskPriorityDTO.Low,
            _ => TaskPriorityDTO.Medium
        };
    }

    /// <summary>
    /// Deserialize entity types from JSON string
    /// </summary>
    private static List<SearchEntityTypeDTO> DeserializeEntityTypes(string? json)
    {
        if (string.IsNullOrEmpty(json))
            return new List<SearchEntityTypeDTO>();
        
        try
        {
            List<SearchEntityTypeDTO>? result = JsonConvert.DeserializeObject<List<SearchEntityTypeDTO>>(json);
            return result ?? new List<SearchEntityTypeDTO>();
        }
        catch
        {
            return new List<SearchEntityTypeDTO>();
        }
    }

    /// <summary>
    /// Serialize entity types to JSON string
    /// </summary>
    private static string? SerializeEntityTypes(List<SearchEntityTypeDTO>? entityTypes)
    {
        if (entityTypes == null || !entityTypes.Any())
            return null;
        
        try
        {
            return JsonConvert.SerializeObject(entityTypes);
        }
        catch
        {
            return null;
        }
    }

    /// <summary>
    /// Deserialize filters from JSON string
    /// </summary>
    private static Dictionary<string, object>? DeserializeFilters(string? json)
    {
        if (string.IsNullOrEmpty(json))
            return null;
        
        try
        {
            Dictionary<string, object>? result = JsonConvert.DeserializeObject<Dictionary<string, object>>(json);
            return result;
        }
        catch
        {
            return null;
        }
    }

    /// <summary>
    /// Serialize filters to JSON string
    /// </summary>
    private static string? SerializeFilters(Dictionary<string, object>? filters)
    {
        if (filters == null || !filters.Any())
            return null;
        
        try
        {
            return JsonConvert.SerializeObject(filters);
        }
        catch
        {
            return null;
        }
    }

    /// <summary>
    /// Deserialize sort configuration from JSON string
    /// </summary>
    private static SearchSortDTO? DeserializeSort(string? json)
    {
        if (string.IsNullOrEmpty(json))
            return null;
        
        try
        {
            SearchSortDTO? result = JsonConvert.DeserializeObject<SearchSortDTO>(json);
            return result;
        }
        catch
        {
            return null;
        }
    }

    /// <summary>
    /// Serialize sort configuration to JSON string
    /// </summary>
    private static string? SerializeSort(SearchSortDTO? sort)
    {
        if (sort == null)
            return null;
        
        try
        {
            return JsonConvert.SerializeObject(sort);
        }
        catch
        {
            return null;
        }
    }

    /// <summary>
    /// Convert date range type to actual date range
    /// </summary>
    private static DateTimeOffset[] GetDateRangeFromType(SearchDateRangeTypeDTO rangeType)
    {
        DateTimeOffset now = DateTimeOffset.UtcNow;
        DateTimeOffset start;
        DateTimeOffset end = now;

        switch (rangeType)
        {
            case SearchDateRangeTypeDTO.Today:
                start = now.Date;
                end = start.AddDays(1).AddTicks(-1);
                break;
            case SearchDateRangeTypeDTO.Yesterday:
                start = now.Date.AddDays(-1);
                end = start.AddDays(1).AddTicks(-1);
                break;
            case SearchDateRangeTypeDTO.ThisWeek:
                int daysToSubtract = (int)now.DayOfWeek;
                start = now.Date.AddDays(-daysToSubtract);
                end = start.AddDays(7).AddTicks(-1);
                break;
            case SearchDateRangeTypeDTO.LastWeek:
                int daysToSubtractLastWeek = (int)now.DayOfWeek + 7;
                start = now.Date.AddDays(-daysToSubtractLastWeek);
                end = start.AddDays(7).AddTicks(-1);
                break;
            case SearchDateRangeTypeDTO.ThisMonth:
                start = new DateTimeOffset(now.Year, now.Month, 1, 0, 0, 0, now.Offset);
                end = start.AddMonths(1).AddTicks(-1);
                break;
            case SearchDateRangeTypeDTO.LastMonth:
                start = new DateTimeOffset(now.Year, now.Month, 1, 0, 0, 0, now.Offset).AddMonths(-1);
                end = start.AddMonths(1).AddTicks(-1);
                break;
            case SearchDateRangeTypeDTO.LastThreeMonths:
                start = new DateTimeOffset(now.Year, now.Month, 1, 0, 0, 0, now.Offset).AddMonths(-3);
                end = now;
                break;
            case SearchDateRangeTypeDTO.ThisYear:
                start = new DateTimeOffset(now.Year, 1, 1, 0, 0, 0, now.Offset);
                end = start.AddYears(1).AddTicks(-1);
                break;
            case SearchDateRangeTypeDTO.LastYear:
                start = new DateTimeOffset(now.Year - 1, 1, 1, 0, 0, 0, now.Offset);
                end = start.AddYears(1).AddTicks(-1);
                break;
            default:
                start = now.AddDays(-30);
                break;
        }

        return new[] { start, end };
    }
} 