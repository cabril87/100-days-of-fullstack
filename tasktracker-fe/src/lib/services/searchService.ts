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
  BackendEntityResultsDTO
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
   * Perform unified search across multiple entities
   */
  async performUnifiedSearch(request: UnifiedSearchRequestDTO): Promise<UnifiedSearchResponseDTO> {
    try {
      console.log('🔍 SearchService: Performing unified search with request:', request);
      
      // Backend returns a different format than expected, so we need to map it
      const backendResponse = await apiClient.post<BackendSearchResponseDTO>(
        `${this.baseUrl}/search`,
        request
      );
      
      console.log('🔄 SearchService: Mapping backend response to expected format...');
      
      // Map backend response to expected frontend format
      const mappedResponse: UnifiedSearchResponseDTO = {
        Results: this.mapBackendResponseToResultGroups(backendResponse),
        TotalCount: backendResponse.totalResults || 0,
        ExecutionTimeMs: backendResponse.executionTimeMs || 0,
        Suggestions: backendResponse.suggestions || [],
        FacetCounts: this.mapFacetCounts(backendResponse.facets),
        HasMore: this.checkIfHasMore(backendResponse),
        SearchId: backendResponse.searchId || ''
      };
      
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
      throw new Error('Failed to perform search. Please try again.');
    }
  }

  /**
   * Map backend response format to frontend expected format
   */
  private mapBackendResponseToResultGroups(backendResponse: BackendSearchResponseDTO): SearchResultGroupDTO[] {
    const results: SearchResultGroupDTO[] = [];
    
    // Map each entity type from backend response
    const entityMappings: Array<{ backendKey: keyof BackendSearchResponseDTO; entityType: SearchEntityTypeDTO }> = [
      { backendKey: 'tasks', entityType: SearchEntityTypeDTO.Tasks },
      { backendKey: 'families', entityType: SearchEntityTypeDTO.Families },
      { backendKey: 'achievements', entityType: SearchEntityTypeDTO.Achievements },
      { backendKey: 'boards', entityType: SearchEntityTypeDTO.Boards },
      { backendKey: 'notifications', entityType: SearchEntityTypeDTO.Notifications },
      { backendKey: 'activities', entityType: SearchEntityTypeDTO.Activities },
      { backendKey: 'tags', entityType: SearchEntityTypeDTO.Tags },
      { backendKey: 'categories', entityType: SearchEntityTypeDTO.Categories },
      { backendKey: 'templates', entityType: SearchEntityTypeDTO.Templates }
    ];
    
    for (const mapping of entityMappings) {
      const entityData = backendResponse[mapping.backendKey] as BackendEntityResultsDTO;
      if (entityData) {
        results.push({
          EntityType: mapping.entityType,
          Results: entityData.results || [],
          TotalCount: entityData.totalCount || 0,
          HasMore: entityData.hasMore || false
        });
      }
    }
    
    return results;
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
    entityTypes: unknown[];
    dateRanges: unknown[];
    families: unknown[];
    statuses: unknown[];
    priorities: unknown[];
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