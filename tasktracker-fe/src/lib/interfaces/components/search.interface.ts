/*
 * Search Component Interfaces - Moved from lib/types/search-components.ts for .cursorrules compliance
 * lib/interfaces/components/search.interface.ts
 */

import React from 'react';
import { SearchResultItemDTO } from '@/lib/types/search';

// ================================
// GLOBAL SEARCH COMPONENT INTERFACES
// ================================

export interface GlobalSearchTriggerProps {
  className?: string;
  placeholder?: string;
  showShortcut?: boolean;
  variant?: 'default' | 'minimal' | 'compact';
}

export interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
  placeholder?: string;
  showRecentSearches?: boolean;
  showSavedSearches?: boolean;
  maxResults?: number;
}

export interface QuickResultProps {
  result: SearchResultItemDTO;
  onSelect: (result: SearchResultItemDTO) => void;
  isSelected: boolean;
  isHighlighted: boolean;
}

export interface RecentSearchesProps {
  onSearchSelect: (query: string) => void;
  maxItems?: number;
}

export interface SavedSearchesProps {
  onSavedSearchSelect: (query: string) => void;
  onSearchSave?: (query: string, name: string) => void;
  onSearchDelete?: (searchId: string) => void;
  maxItems?: number;
}

// ================================
// SEARCH RESULTS COMPONENT INTERFACES
// ================================

export interface SearchResultItemProps {
  result: SearchResultItemDTO;
  onClick: (result: SearchResultItemDTO) => void;
  isHighlighted?: boolean;
  showEntityBadge?: boolean;
  showPreview?: boolean;
}

export interface SearchResultGroupProps {
  title: string;
  results: SearchResultItemDTO[];
  onResultClick: (result: SearchResultItemDTO) => void;
  maxItems?: number;
  showViewAll?: boolean;
  onViewAll?: () => void;
}

// ================================
// MOBILE SEARCH ENHANCEMENT INTERFACES
// ================================

export interface MobileSearchEnhancementsProps {
  onVoiceSearch?: (transcript: string) => void;
  onGestureNavigation?: (direction: 'up' | 'down' | 'left' | 'right') => void;
  enableHapticFeedback?: boolean;
  enableVoiceSearch?: boolean;
  enableGestureNavigation?: boolean;
  className?: string;
}

export interface VoiceSearchButtonProps {
  onVoiceResult: (transcript: string) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export interface MobileSearchToolbarProps {
  onVoiceSearch?: (transcript: string) => void;
  onHapticToggle?: (enabled: boolean) => void;
  enableVoice?: boolean;
  enableHaptic?: boolean;
  className?: string;
}

// ================================
// SEARCH HOOK RETURN INTERFACES
// ================================

export interface VoiceSearchHookReturn {
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
}

export interface TouchGesturesHookReturn {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
}

// ================================
// SEARCH CONFIGURATION INTERFACES
// ================================

export interface SearchFilterConfig {
  entityTypes?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  sortBy?: 'relevance' | 'date' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchPreferences {
  enableVoiceSearch: boolean;
  enableHapticFeedback: boolean;
  enableGestureNavigation: boolean;
  defaultFilters: SearchFilterConfig;
  maxRecentSearches: number;
  maxSavedSearches: number;
}

// ================================
// SEARCH RESULT INTERFACES
// ================================

export interface SearchResult {
  id: string;
  type: 'task' | 'family' | 'user' | 'board' | 'calendar' | 'achievement' | 'page';
  title: string;
  description?: string;
  url?: string;
  metadata?: {
    status?: string;
    priority?: string;
    dueDate?: Date;
    points?: number;
    tags?: string[];
    category?: string;
    familyName?: string;
    memberCount?: number;
  };
  relevanceScore?: number;
  highlights?: string[];
  icon?: React.ReactNode;
  actions?: SearchResultAction[];
}

export interface SearchResultAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  primary?: boolean;
}

export interface SearchFiltersProps {
  filters: SearchFilter[];
  onFilterChange: (filters: SearchFilter[]) => void;
  onClearAll?: () => void;
  availableFilters?: Array<{
    type: SearchFilter['type'];
    label: string;
    options?: Array<{ label: string; value: string | number }>;
  }>;
  compact?: boolean;
  className?: string;
}

// ================================
// SEARCH FILTER INTERFACES
// ================================

export interface SearchFilter {
  id: string;
  type: 'category' | 'date' | 'status' | 'priority' | 'family' | 'user' | 'tag';
  label: string;
  value: string | number | Date | string[];
  operator?: 'equals' | 'contains' | 'before' | 'after' | 'in';
  isActive: boolean;
}

// ================================
// ADVANCED SEARCH INTERFACES
// ================================

export interface AdvancedSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: SearchQuery) => void;
  initialQuery?: SearchQuery;
  availableFields?: SearchField[];
  className?: string;
}

export interface SearchQuery {
  text?: string;
  filters: SearchFilter[];
  sortBy?: 'relevance' | 'date' | 'title' | 'priority';
  sortDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface SearchField {
  id: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'number' | 'boolean';
  options?: Array<{ label: string; value: string | number }>;
  placeholder?: string;
  required?: boolean;
}

// ================================
// SEARCH STATE INTERFACES
// ================================

export interface SearchState {
  query: string;
  filters: SearchFilter[];
  results: SearchResult[];
  isLoading: boolean;
  hasMore: boolean;
  totalCount: number;
  recentSearches: string[];
  suggestions: string[];
  error?: string;
}

export interface SearchHistory {
  id: string;
  query: string;
  filters: SearchFilter[];
  timestamp: Date;
  resultCount: number;
}

export interface SearchSuggestion {
  text: string;
  type: 'query' | 'filter' | 'category';
  count?: number;
  confidence?: number;
}

// ================================
// SEARCH ANALYTICS INTERFACES
// ================================

export interface SearchAnalytics {
  totalSearches: number;
  popularQueries: Array<{
    query: string;
    count: number;
    avgResultCount: number;
  }>;
  searchTrends: Array<{
    date: Date;
    searchCount: number;
    avgResponseTime: number;
  }>;
  resultClickRates: Array<{
    type: SearchResult['type'];
    clickRate: number;
    avgPosition: number;
  }>;
}

export interface SearchAnalyticsProps {
  analytics: SearchAnalytics;
  timeframe?: 'day' | 'week' | 'month' | 'year';
  onTimeframeChange?: (timeframe: string) => void;
  className?: string;
}

// ================================
// SEARCH CONFIGURATION INTERFACES
// ================================

export interface SearchConfig {
  maxResults: number;
  debounceMs: number;
  minQueryLength: number;
  enableFuzzySearch: boolean;
  enableHighlighting: boolean;
  enableSuggestions: boolean;
  enableHistory: boolean;
  enableAnalytics: boolean;
  searchFields: string[];
  resultTypes: SearchResult['type'][];
  filters: SearchFilter[];
}

export interface SearchProviderProps {
  config: SearchConfig;
  children: React.ReactNode;
} 