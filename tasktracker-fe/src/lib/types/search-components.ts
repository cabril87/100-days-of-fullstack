/*
 * Search Component Props Type Definitions
 * Copyright (c) 2025 Carlos Abril Jr
 * 
 * All search component prop interfaces following Family Auth Implementation Checklist
 * Centralized search component interface definitions for consistent typing
 */

import { SearchResultItemDTO } from './search';

// ================================
// GLOBAL SEARCH COMPONENTS
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
// SEARCH RESULTS COMPONENTS
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
// MOBILE SEARCH ENHANCEMENTS
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
// SEARCH HOOKS RETURN TYPES
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
// SEARCH CONFIGURATION TYPES
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