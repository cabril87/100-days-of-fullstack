/*
 * useUnifiedSearch Hook
 * Enterprise-grade search state management
 * Handles unified search, suggestions, saved searches, and analytics
 */

'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useAuth } from '@/lib/providers/AuthProvider';
import { useDebounce } from './useDebounce';
import { searchService } from '@/lib/services/searchService';
import {
  UnifiedSearchRequestDTO,
  SearchEntityTypeDTO,
  SearchSuggestionDTO,
  SearchFiltersDTO,
  SearchUIState,
  UseUnifiedSearchReturn,
  SavedSearchDTO,
  CreateSavedSearchDTO,
  UpdateSavedSearchDTO,
  SearchHistoryEntryDTO,
  SearchAnalyticsDTO,
  ApiError
} from '@/lib/types/search';

const DEFAULT_SEARCH_STATE: SearchUIState = {
  query: '',
  entityTypes: [
    SearchEntityTypeDTO.Tasks,
    SearchEntityTypeDTO.Families,
    SearchEntityTypeDTO.Achievements,
    SearchEntityTypeDTO.Boards,
    SearchEntityTypeDTO.Notifications,
    SearchEntityTypeDTO.Activities,
    SearchEntityTypeDTO.Tags,
    SearchEntityTypeDTO.Categories,
    SearchEntityTypeDTO.Templates
  ],
  filters: {},
  results: [],
  suggestions: [],
  isLoading: false,
  error: null,
  hasMore: false,
  totalCount: 0,
  executionTime: 0,
  selectedResultId: null,
  showAdvancedFilters: false,
  sortBy: 'relevance',
  sortDirection: 'Desc',
  pageNumber: 1,
  pageSize: 20
};

/**
 * Unified Search Hook
 * Comprehensive search state management with debouncing and caching
 */
export function useUnifiedSearch(
  familyId?: number,
  autoSearch = false,
  debounceMs = 300
): UseUnifiedSearchReturn {
  const { isAuthenticated, isReady } = useAuth();

  // Core search state
  const [searchState, setSearchState] = useState<SearchUIState>(DEFAULT_SEARCH_STATE);

  // Saved searches state
  const [savedSearches, setSavedSearches] = useState<SavedSearchDTO[]>([]);

  // Debounced query for auto-search
  const debouncedQuery = useDebounce(searchState.query, debounceMs);

  // ================================
  // CORE SEARCH OPERATIONS
  // ================================

  /**
   * Perform unified search
   */
  const search = useCallback(async (
    query: string,
    options: Partial<UnifiedSearchRequestDTO> = {}
  ): Promise<void> => {
    if (!query.trim()) {
      setSearchState(prev => ({
        ...prev,
        results: [],
        suggestions: [],
        totalCount: 0,
        executionTime: 0,
        error: null
      }));
      return;
    }

    setSearchState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const entityTypes = options.EntityTypes || searchState.entityTypes;
      
      const searchRequest: UnifiedSearchRequestDTO = {
        Query: query,
        EntityTypes: entityTypes,
        FamilyId: options.FamilyId || familyId,
        Pagination: {
          Page: options.Pagination?.Page || 1,
          PageSize: options.Pagination?.PageSize || searchState.pageSize
        },
        Sort: searchState.sortBy ? {
          Field: searchState.sortBy,
          Direction: searchState.sortDirection
        } : undefined,
        Filters: (options.Filters || searchState.filters) as Record<string, unknown>
      };
      
      console.log('🔍 useUnifiedSearch: Building search request:', {
        query,
        entityTypesFromOptions: options.EntityTypes,
        entityTypesFromState: searchState.entityTypes,
        finalEntityTypes: entityTypes,
        searchRequest
      });

      const response = await searchService.performUnifiedSearch(searchRequest);

      setSearchState(prev => ({
        ...prev,
        query,
        results: response.Results || [],
        suggestions: response.Suggestions || [],
        totalCount: response.TotalCount || 0,
        executionTime: response.ExecutionTimeMs || 0,
        hasMore: response.HasMore || false,
        pageNumber: searchRequest.Pagination?.Page || 1,
        isLoading: false,
        error: null
      }));
    } catch (error) {
      console.error('Search error:', error);
      setSearchState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Search failed'
      }));
    }
  }, [searchState.entityTypes, searchState.filters, searchState.sortBy, searchState.sortDirection, searchState.pageSize, familyId]);

  /**
   * Load more results for a specific entity type
   */
  const loadMore = useCallback(async (entityType: SearchEntityTypeDTO): Promise<void> => {
    if (!searchState.query || searchState.isLoading) return;

    setSearchState(prev => ({ ...prev, isLoading: true }));

    try {
      const searchRequest: UnifiedSearchRequestDTO = {
        Query: searchState.query,
        EntityTypes: [entityType],
        FamilyId: familyId,
        Pagination: {
          Page: searchState.pageNumber + 1,
          PageSize: searchState.pageSize
        },
        Sort: searchState.sortBy ? {
          Field: searchState.sortBy,
          Direction: searchState.sortDirection
        } : undefined,
        Filters: searchState.filters as Record<string, unknown>
      };

      const response = await searchService.performUnifiedSearch(searchRequest);

      setSearchState(prev => {
        const updatedResults = (prev.results || []).map(group => {
          if (group.EntityType === entityType) {
            return {
              ...group,
              Results: [...(group.Results || []), ...(response.Results?.[0]?.Results || [])],
              HasMore: response.HasMore || false
            };
          }
          return group;
        });

        return {
          ...prev,
          results: updatedResults,
          pageNumber: prev.pageNumber + 1,
          isLoading: false
        };
      });
    } catch (error) {
      console.error('Load more error:', error);
      setSearchState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load more results'
      }));
    }
  }, [searchState.query, searchState.filters, searchState.sortBy, searchState.sortDirection, searchState.pageSize, searchState.pageNumber, familyId, searchState.isLoading]);

  /**
   * Clear search results
   */
  const clearResults = useCallback((): void => {
    setSearchState(DEFAULT_SEARCH_STATE);
  }, []);

  /**
   * Set search filters
   */
  const setFilters = useCallback((filters: SearchFiltersDTO): void => {
    setSearchState(prev => ({ ...prev, filters, pageNumber: 1 }));
  }, []);

  /**
   * Set entity types
   */
  const setEntityTypes = useCallback((types: SearchEntityTypeDTO[]): void => {
    setSearchState(prev => ({ ...prev, entityTypes: types, pageNumber: 1 }));
  }, []);

  /**
   * Set sorting
   */
  const setSorting = useCallback((sortBy: string, direction: 'Asc' | 'Desc'): void => {
    setSearchState(prev => ({ ...prev, sortBy, sortDirection: direction, pageNumber: 1 }));
  }, []);

  // ================================
  // SEARCH SUGGESTIONS
  // ================================

  /**
   * Get search suggestions
   */
  const getSuggestions = useCallback(async (query: string): Promise<SearchSuggestionDTO[]> => {
    if (!query.trim() || query.length < 2) return [];

    try {
      return await searchService.getSearchSuggestions(
        query,
        searchState.entityTypes,
        familyId,
        10
      );
    } catch (error) {
      console.error('Error getting suggestions:', error);
      return [];
    }
  }, [searchState.entityTypes, familyId]);

  // ================================
  // SEARCH HISTORY
  // ================================

  /**
   * Get search history
   */
  const getSearchHistory = useCallback(async (): Promise<SearchHistoryEntryDTO[]> => {
    try {
      return await searchService.getSearchHistory(20);
    } catch (error) {
      console.error('Error getting search history:', error);
      return [];
    }
  }, []);

  /**
   * Clear search history
   */
  const clearSearchHistory = useCallback(async (): Promise<void> => {
    try {
      await searchService.clearSearchHistory();
    } catch (error) {
      console.error('Error clearing search history:', error);
      throw error;
    }
  }, []);

  // ================================
  // SAVED SEARCHES
  // ================================

  /**
   * Load saved searches
   */
  const loadSavedSearches = useCallback(async (): Promise<void> => {
    try {
      const searches = await searchService.getSavedSearches();
      setSavedSearches(searches);
    } catch (error) {
      // Check if it's an authentication error
      const apiError = error as ApiError;
      if (apiError?.statusCode === 401 || apiError?.status === 401) {
        console.debug('User not authenticated for saved searches - this is expected');
      } else {
        console.error('Error loading saved searches:', error);
      }
      // Don't set an error state - just keep empty saved searches
      // This is expected when user is not authenticated (e.g., on landing page)
      setSavedSearches([]);
    }
  }, []);

  /**
   * Create saved search
   */
  const createSavedSearch = useCallback(async (search: CreateSavedSearchDTO): Promise<void> => {
    try {
      const newSearch = await searchService.createSavedSearch(search);
      setSavedSearches(prev => [newSearch, ...prev]);
    } catch (error) {
      console.error('Error creating saved search:', error);
      throw error;
    }
  }, []);

  /**
   * Update saved search
   */
  const updateSavedSearch = useCallback(async (id: number, updates: UpdateSavedSearchDTO): Promise<void> => {
    try {
      const updatedSearch = await searchService.updateSavedSearch(id, updates);
      setSavedSearches(prev =>
        prev.map(search => search.Id === id ? updatedSearch : search)
      );
    } catch (error) {
      console.error('Error updating saved search:', error);
      throw error;
    }
  }, []);

  /**
   * Delete saved search
   */
  const deleteSavedSearch = useCallback(async (id: number): Promise<void> => {
    try {
      await searchService.deleteSavedSearch(id);
      setSavedSearches(prev => prev.filter(search => search.Id !== id));
    } catch (error) {
      console.error('Error deleting saved search:', error);
      throw error;
    }
  }, []);

  /**
   * Execute saved search
   */
  const executeSavedSearch = useCallback(async (savedSearch: SavedSearchDTO): Promise<void> => {
    const { SearchQuery } = savedSearch;

    // Update state to match saved search parameters
    setSearchState(prev => ({
      ...prev,
      query: SearchQuery.Query,
      entityTypes: SearchQuery.EntityTypes || [],
      filters: SearchQuery.Filters || {},
      sortBy: SearchQuery.Sort?.Field || 'relevance',
      sortDirection: SearchQuery.Sort?.Direction || 'Desc',
      pageSize: SearchQuery.Pagination?.PageSize || 20,
      pageNumber: 1
    }));

    // Execute the search
    await search(SearchQuery.Query, SearchQuery);
  }, [search]);

  // ================================
  // ANALYTICS
  // ================================

  /**
   * Get search analytics
   */
  const getSearchAnalytics = useCallback(async (familyId?: number): Promise<SearchAnalyticsDTO> => {
    try {
      return await searchService.getSearchAnalytics(familyId);
    } catch (error) {
      console.error('Error getting search analytics:', error);
      throw error;
    }
  }, []);

  // ================================
  // AUTO-SEARCH EFFECT
  // ================================

  useEffect(() => {
    if (autoSearch && debouncedQuery && debouncedQuery.length >= 2) {
      search(debouncedQuery);
    }
  }, [debouncedQuery, autoSearch, search]);

  // ================================
  // LOAD SAVED SEARCHES ON MOUNT
  // ================================

  useEffect(() => {
    // Only load saved searches if user is authenticated and auth is ready
    // Also ensure we're not on a public page where authentication might not be required
    if (isAuthenticated && isReady) {
      loadSavedSearches();
    } else {
      // Clear saved searches when not authenticated
      setSavedSearches([]);
    }
  }, [loadSavedSearches, isAuthenticated, isReady]);

  // ================================
  // MEMOIZED RETURN VALUE
  // ================================

  return useMemo((): UseUnifiedSearchReturn => ({
    // State
    searchState,

    // Core Actions
    search,
    loadMore,
    clearResults,
    setFilters,
    setEntityTypes,
    setSorting,

    // Suggestions
    getSuggestions,

    // History
    getSearchHistory,
    clearSearchHistory,

    // Saved Searches
    savedSearches,
    createSavedSearch,
    updateSavedSearch,
    deleteSavedSearch,
    executeSavedSearch,

    // Analytics
    getSearchAnalytics
  }), [
    searchState,
    search,
    loadMore,
    clearResults,
    setFilters,
    setEntityTypes,
    setSorting,
    getSuggestions,
    getSearchHistory,
    clearSearchHistory,
    savedSearches,
    createSavedSearch,
    updateSavedSearch,
    deleteSavedSearch,
    executeSavedSearch,
    getSearchAnalytics
  ]);
}

export default useUnifiedSearch; 