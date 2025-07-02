/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * Search Component Props - Moved from lib/types/search/ for .cursorrules compliance
 * Following FAMILY-AUTH-IMPLEMENTATION-CHECKLIST.md enterprise standards
 */

import React, { ReactNode } from 'react';

// ============================================================================
// SEARCH BAR COMPONENT PROPS
// ============================================================================

export interface SearchBarProps {
  className?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (query: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onClear?: () => void;
  disabled?: boolean;
  loading?: boolean;
  showClearButton?: boolean;
  showSearchButton?: boolean;
  autoFocus?: boolean;
  debounceMs?: number;
  maxLength?: number;
}

export interface SearchResultsProps {
  className?: string;
  results: Array<Record<string, unknown>>;
  query: string;
  onResultClick?: (result: Record<string, unknown>) => void;
  onResultHover?: (result: Record<string, unknown>) => void;
  loading?: boolean;
  error?: string;
  emptyMessage?: string;
  showCategories?: boolean;
  showHighlights?: boolean;
  maxResults?: number;
  groupBy?: string;
}

export interface SearchFiltersProps {
  className?: string;
  filters: Array<Record<string, unknown>>;
  activeFilters: Array<string>;
  onFilterChange?: (filterId: string, active: boolean) => void;
  onFiltersReset?: () => void;
  onFiltersApply?: (filters: Array<string>) => void;
  showCounts?: boolean;
  showResetButton?: boolean;
  showApplyButton?: boolean;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

// ============================================================================
// GLOBAL SEARCH COMPONENT PROPS
// ============================================================================

export interface GlobalSearchTriggerProps {
  className?: string;
  variant?: 'button' | 'input-style' | 'icon-only';
  size?: 'sm' | 'md' | 'lg';
}

export interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch?: (query: string) => void;
  onResultSelect?: (result: Record<string, unknown>) => void;
  className?: string;
  showRecentSearches?: boolean;
  showSavedSearches?: boolean;
  showCategories?: boolean;
  maxRecentSearches?: number;
  searchPlaceholder?: string;
}

export interface QuickResultProps {
  className?: string;
  result: Record<string, unknown>;
  onClick?: () => void;
  onHover?: () => void;
  showIcon?: boolean;
  showCategory?: boolean;
  showDescription?: boolean;
  highlightQuery?: string;
  variant?: 'default' | 'compact' | 'detailed';
}

export interface RecentSearchesProps {
  className?: string;
  searches: Array<string>;
  onSearchClick?: (query: string) => void;
  onSearchRemove?: (query: string) => void;
  onClearAll?: () => void;
  maxVisible?: number;
  showClearAll?: boolean;
}

export interface SavedSearchesProps {
  className?: string;
  searches: Array<Record<string, unknown>>;
  onSearchClick?: (search: Record<string, unknown>) => void;
  onSearchEdit?: (search: Record<string, unknown>) => void;
  onSearchRemove?: (searchId: string) => void;
  onSearchSave?: (query: string, name: string) => void;
  maxVisible?: number;
  showManageButton?: boolean;
}

export interface SearchResultItemProps {
  id: string;
  title: string;
  description?: string;
  type: 'task' | 'family' | 'user' | 'achievement' | 'calendar' | 'other';
  url?: string;
  metadata?: {
    priority?: string;
    dueDate?: string;
    familyName?: string;
    assignee?: string;
    status?: string;
    points?: number;
    category?: string;
  };
  icon?: ReactNode;
  thumbnail?: string;
  highlighted?: boolean;
  onSelect: (item: SearchResultItemProps) => void;
  className?: string;
}

export interface SearchResultGroupProps {
  title: string;
  type: 'task' | 'family' | 'user' | 'achievement' | 'calendar' | 'recent' | 'suggested';
  items: SearchResultItemProps[];
  onViewAll?: () => void;
  maxVisible?: number;
  showCount?: boolean;
  className?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

// ============================================================================
// MOBILE SEARCH COMPONENT PROPS
// ============================================================================

export interface MobileSearchEnhancementsProps {
  className?: string;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onPullToRefresh?: () => void;
  onVoiceSearch?: (transcript: string) => void;
  showVoiceSearch?: boolean;
  showSwipeHints?: boolean;
  showPullToRefresh?: boolean;
  enableHapticFeedback?: boolean;
  children: React.ReactNode;
}

export interface VoiceSearchButtonProps {
  className?: string;
  onTranscript?: (text: string) => void;
  onError?: (error: Error) => void;
  onStart?: () => void;
  onEnd?: () => void;
  disabled?: boolean;
  language?: string;
  continuous?: boolean;
}

export interface MobileSearchToolbarProps {
  className?: string;
  showBack?: boolean;
  showVoice?: boolean;
  showFilters?: boolean;
  onBack?: () => void;
  onVoice?: () => void;
  onFilters?: () => void;
  title?: string;
  filterCount?: number;
  variant?: 'default' | 'compact' | 'extended';
}

// ============================================================================
// SEARCH SUGGESTIONS COMPONENT PROPS
// ============================================================================

export interface SearchSuggestionsProps {
  suggestions: Array<{
    id: string;
    text: string;
    type: 'recent' | 'popular' | 'completion';
    icon?: ReactNode;
    metadata?: Record<string, unknown>;
  }>;
  onSuggestionSelect: (suggestion: string) => void;
  query?: string;
  maxVisible?: number;
  className?: string;
  showTypes?: boolean;
}

export interface SearchAutoCompleteProps {
  className?: string;
  value: string;
  onChange: (value: string) => void;
  onSelect?: (value: string) => void;
  suggestions: Array<string>;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  minQueryLength?: number;
  debounceMs?: number;
  maxSuggestions?: number;
}

export interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
  results: SearchResultGroupProps[];
  isLoading?: boolean;
  placeholder?: string;
  recentSearches?: string[];
  suggestions?: string[];
  className?: string;
}

export interface UnifiedSearchProps {
  className?: string;
  placeholder?: string;
  onResultSelect?: (result: SearchResultItemProps) => void;
  scope?: 'all' | 'tasks' | 'family' | 'users';
  filters?: {
    family?: number;
    priority?: string;
    status?: string;
    dateRange?: { start: Date; end: Date };
  };
  maxResults?: number;
  showRecentSearches?: boolean;
  enableKeyboardNavigation?: boolean;
}

export interface SearchHistoryProps {
  searches: Array<{
    id: string;
    query: string;
    timestamp: Date;
    resultsCount: number;
    filters?: Record<string, unknown>;
  }>;
  onSearchSelect: (query: string, filters?: Record<string, unknown>) => void;
  onSearchDelete: (searchId: string) => void;
  onClearHistory: () => void;
  maxVisible?: number;
  className?: string;
} 