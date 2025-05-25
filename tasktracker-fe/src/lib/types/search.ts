/**
 * Advanced search and filtering types
 */

// Simple search filter for UI components
export interface SearchFilter {
  id: string;
  field: string;
  operator: string;
  value: string | number | boolean | string[];
  label: string;
}

// Advanced search filter for backend
export interface AdvancedSearchFilter {
  id: string;
  name: string;
  description?: string;
  criteria: SearchCriteria;
  isPublic: boolean;
  createdAt: string;
  updatedAt?: string;
  usageCount?: number;
}

export interface SearchCriteria {
  query?: string;
  status?: string[];
  priority?: string[];
  categoryIds?: number[];
  tags?: string[];
  assignedTo?: string[];
  dueDateRange?: {
    start?: string;
    end?: string;
  };
  createdDateRange?: {
    start?: string;
    end?: string;
  };
  completedDateRange?: {
    start?: string;
    end?: string;
  };
  hasDescription?: boolean;
  isOverdue?: boolean;
  requiresApproval?: boolean;
}

export interface SearchResult<T = unknown> {
  items: T[];
  totalCount: number;
  searchTime: number;
  suggestions?: string[];
  facets?: SearchFacet[];
}

export interface SearchFacet {
  field: string;
  values: Array<{
    value: string;
    count: number;
    selected?: boolean;
  }>;
}

export interface SavedSearch {
  id: string;
  name: string;
  description?: string;
  filters: SearchFilter[];
  sortBy: string;
  sortOrder: string;
  createdAt: string;
  lastUsed?: string;
  useCount: number;
  isFavorite: boolean;
}

export interface SearchHistory {
  id: string;
  query: string;
  criteria: SearchCriteria;
  resultCount: number;
  searchedAt: string;
}

export interface SearchSuggestion {
  text: string;
  type: 'query' | 'filter' | 'tag' | 'category';
  count?: number;
}

export interface SearchAnalytics {
  totalSearches: number;
  popularQueries: Array<{
    query: string;
    count: number;
  }>;
  popularFilters: Array<{
    filter: string;
    count: number;
  }>;
  averageResultCount: number;
  searchTrends: Array<{
    date: string;
    searchCount: number;
  }>;
} 