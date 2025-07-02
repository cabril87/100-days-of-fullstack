/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * Search Component Types - .cursorrules Compliance Update
 * Following FAMILY-AUTH-IMPLEMENTATION-CHECKLIST.md enterprise standards
 */

// ============================================================================
// SEARCH CONFIGURATION TYPES (NOT PROPS)
// ============================================================================

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

// ============================================================================
// SEARCH HOOKS RETURN TYPES (NOT PROPS)
// ============================================================================

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

// ============================================================================
// SEARCH STATE TYPES
// ============================================================================

export type SearchStatus = 'idle' | 'searching' | 'success' | 'error';
export type SearchSortOrder = 'asc' | 'desc';
export type SearchSortBy = 'relevance' | 'date' | 'title' | 'score';

export interface SearchState {
  status: SearchStatus;
  query: string;
  results: unknown[];
  totalCount: number;
  hasMore: boolean;
  error?: string;
}

export interface SearchMetrics {
  executionTime: number;
  resultCount: number;
  queryTimestamp: Date;
  cacheHit: boolean;
} 