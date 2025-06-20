/*
 * Advanced Search & Discovery Service
 * Enterprise-grade search functionality for TaskTracker
 * Follows established API patterns from other services
 */

import { apiClient } from '../config/api-client';
import {
  UnifiedSearchRequestDTO,
  UnifiedSearchResponseDTO,
  SearchSuggestionDTO,
  SavedSearchDTO,
  CreateSavedSearchDTO,
  UpdateSavedSearchDTO,
  SearchAnalyticsDTO,
  SearchHistoryEntryDTO,
  PopularSearchTermDTO,
  SearchEntityTypeDTO,
  SearchResultGroupDTO,
  BackendSearchResponseDTO,
  BackendEntityResultsDTO,
  SearchResultItemDTO,
  TaskSearchResultDTO,
  FamilySearchResultDTO,
  AchievementSearchResultDTO,
  BoardSearchResultDTO,
  NotificationSearchResultDTO,
  ActivitySearchResultDTO,
  TagSearchResultDTO,
  CategorySearchResultDTO,
  TemplateSearchResultDTO
} from '@/lib/types/search';

/**
 * Enterprise Search Service
 * Provides comprehensive search functionality across all entities
 */
class SearchService {
  private readonly baseUrl = '/v1';

  // ================================
  // UNIFIED SEARCH OPERATIONS
  // ================================

  /**
   * Perform unified search across all entity types
   */
  async performUnifiedSearch(request: UnifiedSearchRequestDTO): Promise<UnifiedSearchResponseDTO> {
    try {
      console.log('🔍 SearchService: Performing unified search with request:', request);
      
      // Backend returns a different format than expected, so we need to map it
      const backendResponse = await apiClient.post<BackendSearchResponseDTO>(
        `${this.baseUrl}/search`,
        request
      );
      
      console.log('🔄 SearchService: Received backend response:', backendResponse);
      
      // Handle different response formats gracefully
      let mappedResponse: UnifiedSearchResponseDTO;
      
      if (this.isNewBackendFormat(backendResponse)) {
        // Handle new backend format
        mappedResponse = this.mapNewBackendResponse(backendResponse);
      } else if (this.isDirectResultsFormat(backendResponse)) {
        // Handle direct results format - cast to proper type
        mappedResponse = this.mapDirectResultsFormat(backendResponse as unknown as SearchResultItemDTO[]);
      } else {
        // Handle legacy backend format
        mappedResponse = this.mapLegacyBackendResponse(backendResponse);
      }
      
      console.log('✅ SearchService: Search response mapped:', {
        totalCount: mappedResponse.TotalCount,
        resultGroups: mappedResponse.Results?.length || 0,
        executionTime: mappedResponse.ExecutionTimeMs,
        hasMore: mappedResponse.HasMore,
        results: mappedResponse.Results?.map(group => ({
          entityType: group.EntityType,
          count: group.Results?.length || 0,
          totalCount: group.TotalCount,
          firstResult: group.Results?.[0]?.Title
        }))
      });
      
      return mappedResponse;
    } catch (error) {
      console.error('Error performing unified search:', error);
      
      // Return empty response instead of throwing to prevent UI crashes
      return {
        Results: [],
        TotalCount: 0,
        ExecutionTimeMs: 0,
        Suggestions: [],
        FacetCounts: {},
        HasMore: false,
        SearchId: ''
      };
    }
  }

  /**
   * Check if response is in new backend format
   */
  private isNewBackendFormat(response: any): boolean {
    return response && 
           typeof response === 'object' && 
           Array.isArray(response.Results) &&
           typeof response.TotalCount === 'number';
  }

  /**
   * Check if response is in direct results format
   */
  private isDirectResultsFormat(response: any): boolean {
    return response && Array.isArray(response) && response.length > 0;
  }

  /**
   * Map new backend response format
   */
  private mapNewBackendResponse(backendResponse: any): UnifiedSearchResponseDTO {
    return {
      Results: backendResponse.Results || [],
      TotalCount: backendResponse.TotalCount || 0,
      ExecutionTimeMs: backendResponse.ExecutionTimeMs || 0,
      Suggestions: backendResponse.Suggestions || [],
      FacetCounts: backendResponse.FacetCounts || {},
      HasMore: backendResponse.HasMore || false,
      SearchId: backendResponse.SearchId || ''
    };
  }

  /**
   * Map direct results format (array of results)
   */
  private mapDirectResultsFormat(results: SearchResultItemDTO[]): UnifiedSearchResponseDTO {
    // Group results by entity type
    const groupedResults = new Map<SearchEntityTypeDTO, SearchResultItemDTO[]>();
    
    results.forEach(result => {
      const entityType = result.EntityType;
      if (!groupedResults.has(entityType)) {
        groupedResults.set(entityType, []);
      }
      groupedResults.get(entityType)!.push(result);
    });

    // Convert to result groups
    const resultGroups: SearchResultGroupDTO[] = Array.from(groupedResults.entries()).map(([entityType, entityResults]) => ({
      EntityType: entityType,
      Results: entityResults,
      TotalCount: entityResults.length,
      HasMore: false
    }));

    return {
      Results: resultGroups,
      TotalCount: results.length,
      ExecutionTimeMs: 0,
      Suggestions: [],
      FacetCounts: {},
      HasMore: false,
      SearchId: ''
    };
  }

  /**
   * Map legacy backend response format
   */
  private mapLegacyBackendResponse(backendResponse: BackendSearchResponseDTO): UnifiedSearchResponseDTO {
    return {
      Results: this.mapBackendResponseToResultGroups(backendResponse),
      TotalCount: backendResponse.totalResults || 0,
      ExecutionTimeMs: backendResponse.executionTimeMs || 0,
      Suggestions: backendResponse.suggestions || [],
      FacetCounts: this.mapFacetCounts(backendResponse.facets),
      HasMore: this.checkIfHasMore(backendResponse),
      SearchId: backendResponse.searchId || ''
    };
  }

  /**
   * Map backend response format to frontend expected format
   */
  private mapBackendResponseToResultGroups(backendResponse: BackendSearchResponseDTO): SearchResultGroupDTO[] {
    const results: SearchResultGroupDTO[] = [];
    
    // Map each entity type from backend response
    const entityMappings: Array<{ 
      backendKey: keyof BackendSearchResponseDTO; 
      entityType: SearchEntityTypeDTO;
      mapper: (item: any) => SearchResultItemDTO;
    }> = [
      { 
        backendKey: 'tasks', 
        entityType: SearchEntityTypeDTO.Tasks,
        mapper: this.mapTaskResult.bind(this)
      },
      { 
        backendKey: 'families', 
        entityType: SearchEntityTypeDTO.Families,
        mapper: this.mapFamilyResult.bind(this)
      },
      { 
        backendKey: 'achievements', 
        entityType: SearchEntityTypeDTO.Achievements,
        mapper: this.mapAchievementResult.bind(this)
      },
      { 
        backendKey: 'boards', 
        entityType: SearchEntityTypeDTO.Boards,
        mapper: this.mapBoardResult.bind(this)
      },
      { 
        backendKey: 'notifications', 
        entityType: SearchEntityTypeDTO.Notifications,
        mapper: this.mapNotificationResult.bind(this)
      },
      { 
        backendKey: 'activities', 
        entityType: SearchEntityTypeDTO.Activities,
        mapper: this.mapActivityResult.bind(this)
      },
      { 
        backendKey: 'tags', 
        entityType: SearchEntityTypeDTO.Tags,
        mapper: this.mapTagResult.bind(this)
      },
      { 
        backendKey: 'categories', 
        entityType: SearchEntityTypeDTO.Categories,
        mapper: this.mapCategoryResult.bind(this)
      },
      { 
        backendKey: 'templates', 
        entityType: SearchEntityTypeDTO.Templates,
        mapper: this.mapTemplateResult.bind(this)
      }
    ];
    
    for (const mapping of entityMappings) {
      const entityData = backendResponse[mapping.backendKey] as BackendEntityResultsDTO;
      if (entityData && entityData.results && Array.isArray(entityData.results)) {
        const mappedResults = entityData.results.map(mapping.mapper).filter(Boolean);
        
        if (mappedResults.length > 0) {
          results.push({
            EntityType: mapping.entityType,
            Results: mappedResults,
            TotalCount: entityData.totalCount || mappedResults.length,
            HasMore: entityData.hasMore || false
          });
        }
      }
    }
    
    return results;
  }

  /**
   * Map TaskSearchResultDTO to SearchResultItemDTO
   */
  private mapTaskResult(task: any): SearchResultItemDTO {
    // Handle both backend formats: direct task data or wrapped task data
    const taskData = task.task || task;
    const id = taskData.Id || taskData.id || taskData.TaskId || 'unknown';
    
    return {
      Id: id.toString(),
      Title: taskData.Title || taskData.title || `Task #${id}`,
      Description: taskData.Description || taskData.description || '',
      EntityType: SearchEntityTypeDTO.Tasks,
      Score: taskData.SearchScore || taskData.searchScore || 0,
      UpdatedAt: taskData.CreatedAt || taskData.createdAt || new Date().toISOString(),
      CreatedAt: taskData.CreatedAt || taskData.createdAt || new Date().toISOString(),
      Highlights: taskData.Highlights || taskData.highlights || [],
      EntityData: {
        status: taskData.Status || taskData.status,
        priority: taskData.Priority || taskData.priority,
        dueDate: taskData.DueDate || taskData.dueDate,
        assignedTo: taskData.AssignedToUserName || taskData.assignedToUserName,
        familyName: taskData.FamilyName || taskData.familyName,
        tags: taskData.Tags || taskData.tags || [],
        category: taskData.CategoryName || taskData.categoryName
      }
    };
  }

  /**
   * Map FamilySearchResultDTO to SearchResultItemDTO
   */
  private mapFamilyResult(family: any): SearchResultItemDTO {
    const familyData = family.family || family;
    const id = familyData.Id || familyData.id || familyData.FamilyId || 'unknown';
    
    return {
      Id: id.toString(),
      Title: familyData.Name || familyData.name || `Family #${id}`,
      Description: familyData.Description || familyData.description || `${familyData.MemberCount || familyData.memberCount || 0} members`,
      EntityType: SearchEntityTypeDTO.Families,
      Score: familyData.SearchScore || familyData.searchScore || 0,
      UpdatedAt: familyData.CreatedAt || familyData.createdAt || new Date().toISOString(),
      CreatedAt: familyData.CreatedAt || familyData.createdAt || new Date().toISOString(),
      Highlights: familyData.Highlights || familyData.highlights || [],
      EntityData: {
        memberCount: familyData.MemberCount || familyData.memberCount,
        memberNames: familyData.MemberNames || familyData.memberNames || [],
        createdBy: familyData.CreatedByUserName || familyData.createdByUserName
      }
    };
  }

  /**
   * Map AchievementSearchResultDTO to SearchResultItemDTO
   */
  private mapAchievementResult(achievement: any): SearchResultItemDTO {
    const achievementData = achievement.achievement || achievement;
    const id = achievementData.Id || achievementData.id || achievementData.AchievementId || 'unknown';
    
    return {
      Id: id.toString(),
      Title: achievementData.Title || achievementData.title || `Achievement #${id}`,
      Description: achievementData.Description || achievementData.description || '',
      EntityType: SearchEntityTypeDTO.Achievements,
      Score: achievementData.SearchScore || achievementData.searchScore || 0,
      UpdatedAt: achievementData.UnlockedAt || achievementData.unlockedAt || achievementData.CreatedAt || achievementData.createdAt || new Date().toISOString(),
      CreatedAt: achievementData.CreatedAt || achievementData.createdAt || new Date().toISOString(),
      Highlights: achievementData.Highlights || achievementData.highlights || [],
      EntityData: {
        points: achievementData.Points || achievementData.points,
        isUnlocked: achievementData.IsUnlocked || achievementData.isUnlocked,
        category: achievementData.Category || achievementData.category,
        difficulty: achievementData.Difficulty || achievementData.difficulty,
        icon: achievementData.Icon || achievementData.icon
      }
    };
  }

  /**
   * Map BoardSearchResultDTO to SearchResultItemDTO
   */
  private mapBoardResult(board: any): SearchResultItemDTO {
    const boardData = board.board || board;
    const id = boardData.Id || boardData.id || boardData.BoardId || 'unknown';
    
    return {
      Id: id.toString(),
      Title: boardData.Name || boardData.name || `Board #${id}`,
      Description: boardData.Description || boardData.description || `${boardData.TaskCount || boardData.taskCount || 0} tasks`,
      EntityType: SearchEntityTypeDTO.Boards,
      Score: boardData.SearchScore || boardData.searchScore || 0,
      UpdatedAt: boardData.LastModifiedAt || boardData.lastModifiedAt || boardData.CreatedAt || boardData.createdAt || new Date().toISOString(),
      CreatedAt: boardData.CreatedAt || boardData.createdAt || new Date().toISOString(),
      Highlights: boardData.Highlights || boardData.highlights || [],
      EntityData: {
        taskCount: boardData.TaskCount || boardData.taskCount,
        familyName: boardData.FamilyName || boardData.familyName,
        template: boardData.Template || boardData.template
      }
    };
  }

  /**
   * Map NotificationSearchResultDTO to SearchResultItemDTO
   */
  private mapNotificationResult(notification: any): SearchResultItemDTO {
    const notificationData = notification.notification || notification;
    const id = notificationData.Id || notificationData.id || notificationData.NotificationId || 'unknown';
    
    return {
      Id: id.toString(),
      Title: notificationData.Title || notificationData.title || `Notification #${id}`,
      Description: notificationData.Message || notificationData.message || '',
      EntityType: SearchEntityTypeDTO.Notifications,
      Score: notificationData.SearchScore || notificationData.searchScore || 0,
      UpdatedAt: notificationData.CreatedAt || notificationData.createdAt || new Date().toISOString(),
      CreatedAt: notificationData.CreatedAt || notificationData.createdAt || new Date().toISOString(),
      Highlights: notificationData.Highlights || notificationData.highlights || [],
      EntityData: {
        type: notificationData.Type || notificationData.type,
        isRead: notificationData.IsRead || notificationData.isRead,
        relatedEntityId: notificationData.RelatedEntityId || notificationData.relatedEntityId,
        relatedEntityType: notificationData.RelatedEntityType || notificationData.relatedEntityType
      }
    };
  }

  /**
   * Map ActivitySearchResultDTO to SearchResultItemDTO
   */
  private mapActivityResult(activity: any): SearchResultItemDTO {
    const activityData = activity.activity || activity;
    const id = activityData.Id || activityData.id || activityData.ActivityId || 'unknown';
    
    return {
      Id: id.toString(),
      Title: activityData.ActivityType || activityData.activityType || `Activity #${id}`,
      Description: activityData.Description || activityData.description || '',
      EntityType: SearchEntityTypeDTO.Activities,
      Score: activityData.SearchScore || activityData.searchScore || 0,
      UpdatedAt: activityData.Timestamp || activityData.timestamp || activityData.CreatedAt || activityData.createdAt || new Date().toISOString(),
      CreatedAt: activityData.CreatedAt || activityData.createdAt || new Date().toISOString(),
      Highlights: activityData.Highlights || activityData.highlights || [],
      EntityData: {
        activityType: activityData.ActivityType || activityData.activityType,
        userName: activityData.UserName || activityData.userName,
        familyName: activityData.FamilyName || activityData.familyName,
        relatedEntityId: activityData.RelatedEntityId || activityData.relatedEntityId,
        relatedEntityType: activityData.RelatedEntityType || activityData.relatedEntityType
      }
    };
  }

  /**
   * Map Tag result to SearchResultItemDTO
   */
  private mapTagResult(tag: any): SearchResultItemDTO {
    const tagData = tag.tag || tag;
    const id = tagData.Id || tagData.id || tagData.TagId || tagData.Name || tagData.name || 'unknown';
    
    return {
      Id: id.toString(),
      Title: tagData.Name || tagData.name || tagData.Title || tagData.title || `Tag #${id}`,
      Description: tagData.Description || tagData.description || `Used in ${tagData.UsageCount || tagData.usageCount || 0} tasks`,
      EntityType: SearchEntityTypeDTO.Tags,
      Score: tagData.SearchScore || tagData.searchScore || 0,
      UpdatedAt: tagData.CreatedAt || tagData.createdAt || new Date().toISOString(),
      CreatedAt: tagData.CreatedAt || tagData.createdAt || new Date().toISOString(),
      Highlights: tagData.Highlights || tagData.highlights || [],
      EntityData: {
        usageCount: tagData.UsageCount || tagData.usageCount,
        color: tagData.Color || tagData.color
      }
    };
  }

  /**
   * Map Category result to SearchResultItemDTO
   */
  private mapCategoryResult(category: any): SearchResultItemDTO {
    const categoryData = category.category || category;
    const id = categoryData.Id || categoryData.id || categoryData.CategoryId || 'unknown';
    
    return {
      Id: id.toString(),
      Title: categoryData.Name || categoryData.name || categoryData.Title || categoryData.title || `Category #${id}`,
      Description: categoryData.Description || categoryData.description || `${categoryData.TaskCount || categoryData.taskCount || 0} tasks`,
      EntityType: SearchEntityTypeDTO.Categories,
      Score: categoryData.SearchScore || categoryData.searchScore || 0,
      UpdatedAt: categoryData.CreatedAt || categoryData.createdAt || new Date().toISOString(),
      CreatedAt: categoryData.CreatedAt || categoryData.createdAt || new Date().toISOString(),
      Highlights: categoryData.Highlights || categoryData.highlights || [],
      EntityData: {
        taskCount: categoryData.TaskCount || categoryData.taskCount,
        color: categoryData.Color || categoryData.color
      }
    };
  }

  /**
   * Map Template result to SearchResultItemDTO
   */
  private mapTemplateResult(template: any): SearchResultItemDTO {
    const templateData = template.template || template;
    const id = templateData.Id || templateData.id || templateData.TemplateId || 'unknown';
    
    return {
      Id: id.toString(),
      Title: templateData.Name || templateData.name || templateData.Title || templateData.title || `Template #${id}`,
      Description: templateData.Description || templateData.description || '',
      EntityType: SearchEntityTypeDTO.Templates,
      Score: templateData.SearchScore || templateData.searchScore || 0,
      UpdatedAt: templateData.CreatedAt || templateData.createdAt || new Date().toISOString(),
      CreatedAt: templateData.CreatedAt || templateData.createdAt || new Date().toISOString(),
      Highlights: templateData.Highlights || templateData.highlights || [],
      EntityData: {
        category: templateData.Category || templateData.category,
        isPublic: templateData.IsPublic || templateData.isPublic
      }
    };
  }

  /**
   * Check if any entity type has more results
   */
  private checkIfHasMore(backendResponse: BackendSearchResponseDTO): boolean {
    const entityKeys: Array<keyof BackendSearchResponseDTO> = ['tasks', 'families', 'achievements', 'boards', 'notifications', 'activities', 'tags', 'categories', 'templates'];
    return entityKeys.some(key => {
      const entityData = backendResponse[key] as BackendEntityResultsDTO;
      return entityData?.hasMore === true;
    });
  }

  /**
   * Get search suggestions for auto-complete
   */
  async getSearchSuggestions(
    query: string, 
    entityTypes?: SearchEntityTypeDTO[], 
    familyId?: number,
    limit: number = 10
  ): Promise<SearchSuggestionDTO[]> {
    try {
      const params = new URLSearchParams({
        query,
        limit: limit.toString()
      });
      
      if (entityTypes && entityTypes.length > 0) {
        entityTypes.forEach(type => params.append('entityTypes', type.toString()));
      }
      
      if (familyId) {
        params.set('familyId', familyId.toString());
      }

      const response = await apiClient.get<SearchSuggestionDTO[]>(
        `${this.baseUrl}/search/suggestions?${params.toString()}`
      );
      
      return response;
    } catch (error) {
      console.error('Error getting search suggestions:', error);
      // Return empty array instead of throwing for suggestions
      return [];
    }
  }

  /**
   * Get quick search results for global search modal
   */
  async quickSearch(
    query: string, 
    entityTypes?: SearchEntityTypeDTO[], 
    familyId?: number,
    limit: number = 5
  ): Promise<UnifiedSearchResponseDTO> {
    const request: UnifiedSearchRequestDTO = {
      Query: query,
      EntityTypes: entityTypes || [], // Empty array means search all entity types
      FamilyId: familyId,
      Pagination: {
        Page: 1,
        PageSize: limit
      }
    };

    return this.performUnifiedSearch(request);
  }

  // ================================
  // SAVED SEARCHES OPERATIONS
  // ================================

  /**
   * Get all saved searches for the current user
   */
  async getSavedSearches(): Promise<SavedSearchDTO[]> {
    try {
      const response = await apiClient.get<SavedSearchDTO[]>(
        `${this.baseUrl}/saved-searches`
      );
      
      return response;
    } catch (error) {
      console.error('Error getting saved searches:', error);
      throw new Error('Failed to load saved searches.');
    }
  }

  /**
   * Get saved searches shared within a family
   */
  async getFamilySavedSearches(familyId: number): Promise<SavedSearchDTO[]> {
    try {
      const response = await apiClient.get<SavedSearchDTO[]>(
        `${this.baseUrl}/saved-searches/family/${familyId}`
      );
      
      return response;
    } catch (error) {
      console.error('Error getting family saved searches:', error);
      throw new Error('Failed to load family saved searches.');
    }
  }

  /**
   * Create a new saved search
   */
  async createSavedSearch(savedSearch: CreateSavedSearchDTO): Promise<SavedSearchDTO> {
    try {
      const response = await apiClient.post<SavedSearchDTO>(
        `${this.baseUrl}/saved-searches`,
        savedSearch
      );
      
      return response;
    } catch (error) {
      console.error('Error creating saved search:', error);
      throw new Error('Failed to save search. Please try again.');
    }
  }

  /**
   * Update an existing saved search
   */
  async updateSavedSearch(id: number, updates: UpdateSavedSearchDTO): Promise<SavedSearchDTO> {
    try {
      const response = await apiClient.put<SavedSearchDTO>(
        `${this.baseUrl}/saved-searches/${id}`,
        updates
      );
      
      return response;
    } catch (error) {
      console.error('Error updating saved search:', error);
      throw new Error('Failed to update saved search. Please try again.');
    }
  }

  /**
   * Delete a saved search
   */
  async deleteSavedSearch(id: number): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/saved-searches/${id}`);
    } catch (error) {
      console.error('Error deleting saved search:', error);
      throw new Error('Failed to delete saved search. Please try again.');
    }
  }

  /**
   * Execute a saved search
   */
  async executeSavedSearch(savedSearch: SavedSearchDTO): Promise<UnifiedSearchResponseDTO> {
    return this.performUnifiedSearch(savedSearch.SearchQuery);
  }

  /**
   * Share a saved search with family
   */
  async shareSavedSearchWithFamily(id: number, familyId: number): Promise<void> {
    try {
      await apiClient.post<void>(`${this.baseUrl}/saved-searches/${id}/share/${familyId}`);
    } catch (error) {
      console.error('Error sharing saved search:', error);
      throw new Error('Failed to share search with family.');
    }
  }

  /**
   * Remove a saved search from family sharing
   */
  async unshareSavedSearchFromFamily(id: number): Promise<void> {
    try {
      await apiClient.post<void>(`${this.baseUrl}/saved-searches/${id}/unshare`);
    } catch (error) {
      console.error('Error unsharing saved search:', error);
      throw new Error('Failed to unshare search from family.');
    }
  }

  /**
   * Get most used saved searches
   */
  async getMostUsedSavedSearches(limit: number = 5): Promise<SavedSearchDTO[]> {
    try {
      const response = await apiClient.get<SavedSearchDTO[]>(
        `${this.baseUrl}/saved-searches/most-used?limit=${limit}`
      );
      
      return response;
    } catch (error) {
      console.error('Error getting most used searches:', error);
      return [];
    }
  }

  // ================================
  // SEARCH HISTORY OPERATIONS
  // ================================

  /**
   * Get search history for the current user
   */
  async getSearchHistory(limit: number = 20): Promise<SearchHistoryEntryDTO[]> {
    try {
      const response = await apiClient.get<SearchHistoryEntryDTO[]>(
        `${this.baseUrl}/search/history?limit=${limit}`
      );
      
      return response;
    } catch (error) {
      console.error('Error getting search history:', error);
      return [];
    }
  }

  /**
   * Clear all search history for the current user
   */
  async clearSearchHistory(): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/search/history`);
    } catch (error) {
      console.error('Error clearing search history:', error);
      throw new Error('Failed to clear search history.');
    }
  }

  /**
   * Delete a specific search history entry
   */
  async deleteSearchHistoryEntry(id: number): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/search/history/${id}`);
    } catch (error) {
      console.error('Error deleting search history entry:', error);
      throw new Error('Failed to delete search history entry.');
    }
  }

  // ================================
  // SEARCH ANALYTICS OPERATIONS
  // ================================

  /**
   * Get search analytics for the current user or family
   */
  async getSearchAnalytics(familyId?: number): Promise<SearchAnalyticsDTO> {
    try {
      const url = familyId 
        ? `${this.baseUrl}/search/analytics?familyId=${familyId}`
        : `${this.baseUrl}/search/analytics`;
        
      const response = await apiClient.get<SearchAnalyticsDTO>(url);
      
      return response;
    } catch (error) {
      console.error('Error getting search analytics:', error);
      throw new Error('Failed to load search analytics.');
    }
  }

  /**
   * Get popular search terms
   */
  async getPopularSearchTerms(
    familyId?: number, 
    limit: number = 10
  ): Promise<PopularSearchTermDTO[]> {
    try {
      const params = new URLSearchParams({
        limit: limit.toString()
      });
      
      if (familyId) {
        params.set('familyId', familyId.toString());
      }

      const response = await apiClient.get<PopularSearchTermDTO[]>(
        `${this.baseUrl}/search/popular-terms?${params.toString()}`
      );
      
      return response;
    } catch (error) {
      console.error('Error getting popular search terms:', error);
      return [];
    }
  }

  // ================================
  // UTILITY METHODS
  // ================================

  /**
   * Get URL for a search result entity
   */
  getSearchResultUrl(entityType: SearchEntityTypeDTO, entityId: string): string {
    switch (entityType) {
      case SearchEntityTypeDTO.Tasks:
        return `/tasks/${entityId}`;
      case SearchEntityTypeDTO.Families:
        return `/family/${entityId}`;
      case SearchEntityTypeDTO.Achievements:
        return `/gamification?achievement=${entityId}`;
      case SearchEntityTypeDTO.Boards:
        return `/boards/${entityId}`;
      case SearchEntityTypeDTO.Notifications:
        return `/notifications?highlight=${entityId}`;
      case SearchEntityTypeDTO.Activities:
        return `/dashboard?activity=${entityId}`;
      default:
        return '/dashboard';
    }
  }

  /**
   * Format search query for display
   */
  formatSearchQuery(query: string, maxLength: number = 50): string {
    if (query.length <= maxLength) {
      return query;
    }
    return query.substring(0, maxLength - 3) + '...';
  }

  /**
   * Get display name for entity type
   */
  getEntityTypeDisplayName(entityType: SearchEntityTypeDTO): string {
    switch (entityType) {
      case SearchEntityTypeDTO.Tasks:
        return 'Tasks';
      case SearchEntityTypeDTO.Families:
        return 'Families';
      case SearchEntityTypeDTO.Achievements:
        return 'Achievements';
      case SearchEntityTypeDTO.Boards:
        return 'Boards';
      case SearchEntityTypeDTO.Notifications:
        return 'Notifications';
      case SearchEntityTypeDTO.Activities:
        return 'Activities';
      case SearchEntityTypeDTO.Tags:
        return 'Tags';
      case SearchEntityTypeDTO.Categories:
        return 'Categories';
      case SearchEntityTypeDTO.Templates:
        return 'Templates';
      default:
        return 'Unknown';
    }
  }

  /**
   * Get icon for entity type
   */
  getEntityTypeIcon(entityType: SearchEntityTypeDTO): string {
    switch (entityType) {
      case SearchEntityTypeDTO.Tasks:
        return 'check-circle';
      case SearchEntityTypeDTO.Families:
        return 'users';
      case SearchEntityTypeDTO.Achievements:
        return 'trophy';
      case SearchEntityTypeDTO.Boards:
        return 'columns';
      case SearchEntityTypeDTO.Notifications:
        return 'bell';
      case SearchEntityTypeDTO.Activities:
        return 'activity';
      case SearchEntityTypeDTO.Tags:
        return 'tag';
      case SearchEntityTypeDTO.Categories:
        return 'folder';
      case SearchEntityTypeDTO.Templates:
        return 'layout-template';
      default:
        return 'help-circle';
    }
  }

  /**
   * Build a unified search request from parameters
   */
  buildSearchRequest(
    query: string,
    options: {
      entityTypes?: SearchEntityTypeDTO[];
      familyId?: number;
      pageNumber?: number;
      pageSize?: number;
      sortBy?: string;
      sortDirection?: 'Asc' | 'Desc';
      includeSuggestions?: boolean;
      includeHighlights?: boolean;
    } = {}
  ): UnifiedSearchRequestDTO {
    return {
      Query: query,
      EntityTypes: options.entityTypes || [],
      FamilyId: options.familyId,
      Pagination: {
        Page: options.pageNumber || 1,
        PageSize: options.pageSize || 20
      },
      Sort: options.sortBy ? {
        Field: options.sortBy,
        Direction: options.sortDirection || 'Desc'
      } : undefined
    };
  }

  /**
   * Map backend facets to frontend expected format
   */
  private mapFacetCounts(facets?: {
    entityTypes: { name: string; count: number }[];
    dateRanges: { name: string; count: number }[];
    families: { name: string; count: number }[];
    statuses: { name: string; count: number }[];
    priorities: { name: string; count: number }[];
  }): Record<string, number> {
    if (!facets) return {};
    
    const mappedFacets: Record<string, number> = {};
    
    // Convert array lengths to counts
    mappedFacets['entityTypes'] = facets.entityTypes?.length || 0;
    mappedFacets['dateRanges'] = facets.dateRanges?.length || 0;
    mappedFacets['families'] = facets.families?.length || 0;
    mappedFacets['statuses'] = facets.statuses?.length || 0;
    mappedFacets['priorities'] = facets.priorities?.length || 0;
    
    return mappedFacets;
  }
}

// Export singleton instance
export const searchService = new SearchService();
export default searchService; 