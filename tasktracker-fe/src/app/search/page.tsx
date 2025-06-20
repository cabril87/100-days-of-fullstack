/*
 * Search Results Page
 * Enterprise-grade search experience with comprehensive result handling
 * Supports all entity types with proper navigation and actions
 */

'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/providers/AuthProvider';
import { useUnifiedSearch } from '@/lib/hooks/useUnifiedSearch';
import { SearchBar } from '@/components/search/SearchBar';
import { SearchResults } from '@/components/search/SearchResults';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  ArrowLeft, 
  Filter, 
  Grid, 
  List,
  BookmarkPlus,
  Clock,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils/utils';
import {
  SearchEntityTypeDTO,
  SearchResultItemDTO,
  SearchSuggestionDTO,
  UnifiedSearchRequestDTO
} from '@/lib/types/search';
import { MobileSearchEnhancements } from '@/components/search/MobileSearchEnhancements';

/**
 * Search Results Content Component
 */
function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  
  // Get initial query from URL
  const initialQuery = searchParams?.get('q') || '';
  const [currentQuery, setCurrentQuery] = useState(initialQuery);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  // Initialize search hook
  const {
    searchState,
    search,
    getSuggestions,
    loadMore,
    clearResults,
    savedSearches,
    createSavedSearch
  } = useUnifiedSearch(undefined, false, 300);

  // ================================
  // SEARCH HANDLERS
  // ================================

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) return;
    
    setCurrentQuery(query);
    
    // Update URL without triggering navigation
    const url = new URL(window.location.href);
    url.searchParams.set('q', query);
    window.history.replaceState({}, '', url.toString());
    
    // Perform search
    await search(query);
  }, [search]);

  const handleSuggestionSelect = useCallback(async (suggestion: SearchSuggestionDTO) => {
    await handleSearch(suggestion.Text);
  }, [handleSearch]);

  // ================================
  // RESULT NAVIGATION HANDLERS
  // ================================

  const handleResultClick = useCallback((result: SearchResultItemDTO) => {
    // Enterprise-quality navigation based on entity type
    switch (result.EntityType) {
      case SearchEntityTypeDTO.Tasks:
        router.push(`/tasks/${result.Id}`);
        break;
      case SearchEntityTypeDTO.Families:
        router.push(`/family/${result.Id}`);
        break;
      case SearchEntityTypeDTO.Achievements:
        router.push(`/gamification?achievement=${result.Id}`);
        break;
      case SearchEntityTypeDTO.Boards:
        router.push(`/boards/${result.Id}`);
        break;
      case SearchEntityTypeDTO.Notifications:
        router.push(`/notifications?highlight=${result.Id}`);
        break;
      case SearchEntityTypeDTO.Activities:
        router.push(`/dashboard?activity=${result.Id}`);
        break;
      case SearchEntityTypeDTO.Tags:
        router.push(`/tasks?tag=${encodeURIComponent(result.Title)}`);
        break;
      case SearchEntityTypeDTO.Categories:
        router.push(`/tasks?category=${encodeURIComponent(result.Title)}`);
        break;
      case SearchEntityTypeDTO.Templates:
        router.push(`/boards?template=${result.Id}`);
        break;
      default:
        console.warn('Unhandled entity type for navigation:', result.EntityType);
        break;
    }
  }, [router]);

  const handleActionClick = useCallback((result: SearchResultItemDTO, action: string) => {
    switch (action) {
      case 'View':
        handleResultClick(result);
        break;
      case 'Edit':
        if (result.EntityType === SearchEntityTypeDTO.Tasks) {
          router.push(`/tasks/${result.Id}?edit=true`);
        } else if (result.EntityType === SearchEntityTypeDTO.Boards) {
          router.push(`/boards/${result.Id}?edit=true`);
        }
        break;
      case 'Complete':
        if (result.EntityType === SearchEntityTypeDTO.Tasks) {
          // Handle task completion (would need task service integration)
          console.log('Complete task:', result.Id);
        }
        break;
      case 'Open in New Tab':
        const route = getRouteForEntity(result);
        if (route) {
          window.open(route, '_blank');
        }
        break;
      default:
        console.log('Action clicked:', action, 'for result:', result);
    }
  }, [handleResultClick, router]);

  // ================================
  // HELPER FUNCTIONS
  // ================================

  const getRouteForEntity = (result: SearchResultItemDTO): string | null => {
    switch (result.EntityType) {
      case SearchEntityTypeDTO.Tasks:
        return `/tasks/${result.Id}`;
      case SearchEntityTypeDTO.Families:
        return `/family/${result.Id}`;
      case SearchEntityTypeDTO.Achievements:
        return `/gamification?achievement=${result.Id}`;
      case SearchEntityTypeDTO.Boards:
        return `/boards/${result.Id}`;
      case SearchEntityTypeDTO.Notifications:
        return `/notifications?highlight=${result.Id}`;
      case SearchEntityTypeDTO.Activities:
        return `/dashboard?activity=${result.Id}`;
      case SearchEntityTypeDTO.Tags:
        return `/tasks?tag=${encodeURIComponent(result.Title)}`;
      case SearchEntityTypeDTO.Categories:
        return `/tasks?category=${encodeURIComponent(result.Title)}`;
      case SearchEntityTypeDTO.Templates:
        return `/boards?template=${result.Id}`;
      default:
        return null;
    }
  };

  const handleSaveSearch = useCallback(async () => {
    if (!currentQuery.trim() || !isAuthenticated) return;
    
    try {
      await createSavedSearch({
        Name: `Search: ${currentQuery}`,
        Description: `Search results for "${currentQuery}"`,
        IsSharedWithFamily: false,
        SearchQuery: {
          Query: currentQuery,
          EntityTypes: searchState.entityTypes,
          Filters: searchState.filters as Record<string, string | number | boolean | string[] | number[]>
        }
      });
      
      // Success feedback could be added here
      console.log('Search saved successfully');
    } catch (error) {
      console.error('Failed to save search:', error);
    }
  }, [currentQuery, isAuthenticated, createSavedSearch, searchState]);

  // ================================
  // EFFECTS
  // ================================

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery, handleSearch]);

  // ================================
  // RENDER
  // ================================

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔐</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Authentication Required
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Please log in to access the search feature.
            </p>
            <Button onClick={() => router.push('/auth/login')}>
              Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              
              <div className="flex items-center space-x-2">
                <Search className="w-6 h-6 text-blue-500" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  🔍 Quest Search
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* View Mode Toggle */}
              <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg p-1">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="px-3 py-1 h-auto"
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="px-3 py-1 h-auto"
                >
                  <Grid className="w-4 h-4" />
                </Button>
              </div>

              {/* Save Search */}
              {currentQuery && isAuthenticated && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveSearch}
                  className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  <BookmarkPlus className="w-4 h-4 mr-2" />
                  Save Search
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Search Enhancements */}
          <MobileSearchEnhancements
            onVoiceSearch={handleSearch}
            enableVoiceSearch={true}
            enableHapticFeedback={true}
            enableGestureNavigation={true}
            className="mb-4"
          />

          {/* Search Bar */}
          <SearchBar
            onSearch={handleSearch}
            onSuggestionSelect={handleSuggestionSelect}
            placeholder="🔍 Search tasks, families, achievements, boards, and more..."
            suggestions={[]} // We'll load suggestions dynamically
            isLoading={searchState.isLoading}
            className="w-full"
            autoFocus={!initialQuery}
          />
        </div>

        {/* Search Status */}
        {currentQuery && (
          <div className="mb-6">
            <Card>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-blue-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Search results for
                    </span>
                    <Badge variant="secondary" className="font-medium">
                      "{currentQuery}"
                    </Badge>
                  </div>
                  
                  {searchState.totalCount > 0 && (
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{searchState.executionTime}ms</span>
                      </div>
                      <Badge variant="outline">
                        {searchState.totalCount.toLocaleString()} results
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Results */}
        <div className={cn(
          "transition-all duration-300",
          viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-6'
        )}>
          <SearchResults
            results={searchState.results}
            onResultClick={handleResultClick}
            onLoadMore={loadMore}
            isLoading={searchState.isLoading}
            executionTime={searchState.executionTime}
            totalCount={searchState.totalCount}
            query={currentQuery}
            className={viewMode === 'grid' ? 'col-span-full' : ''}
          />
        </div>

        {/* Empty State */}
        {!currentQuery && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Discover Your Quests
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Search across tasks, families, achievements, boards, and more to find exactly what you need.
            </p>
            
            {/* Quick Search Suggestions */}
            {savedSearches.length > 0 && (
              <div className="max-w-md mx-auto">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  💾 Your Saved Searches
                </h3>
                <div className="space-y-2">
                  {savedSearches.slice(0, 5).map((savedSearch) => (
                    <Button
                      key={savedSearch.Id}
                      variant="outline"
                      onClick={() => handleSearch(savedSearch.SearchQuery.Query)}
                      className="w-full justify-start"
                    >
                      <BookmarkPlus className="w-4 h-4 mr-2" />
                      {savedSearch.Name}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Main Search Page Component with Suspense
 */
export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading search...</p>
          </div>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
} 