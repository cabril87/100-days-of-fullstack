/*
 * Advanced Search & Discovery System Types
 * Enterprise-grade TypeScript definitions for comprehensive search
 * Mirrors backend DTOs exactly for seamless API communication
 */

// ================================
// SEARCH ENUMS
// ================================

export enum SearchEntityTypeDTO {
  Tasks = 0,
  Families = 1,
  Achievements = 2,
  Boards = 3,
  Notifications = 4,
  Activities = 5,
  Tags = 6,
  Categories = 7,
  Templates = 8
}

export enum SearchDatePresetDTO {
  Today = 'Today',
  Yesterday = 'Yesterday',
  ThisWeek = 'ThisWeek',
  LastWeek = 'LastWeek',
  ThisMonth = 'ThisMonth',
  LastMonth = 'LastMonth',
  ThisYear = 'ThisYear',
  LastYear = 'LastYear',
  Custom = 'Custom'
}

export enum SearchSuggestionTypeDTO {
  QueryCompletion = 'QueryCompletion',
  DidYouMean = 'DidYouMean',
  RelatedTerms = 'RelatedTerms',
  PopularSearch = 'PopularSearch',
  EntitySuggestion = 'EntitySuggestion'
}

// ================================
// CORE SEARCH INTERFACES
// ================================

export interface UnifiedSearchRequestDTO {
  Query: string;
  EntityTypes?: SearchEntityTypeDTO[];
  DateRange?: SearchDateRangeDTO;
  FamilyId?: number;
  Filters?: Record<string, unknown>;
  Sort?: SearchSortDTO;
  Pagination?: SearchPaginationDTO;
}

export interface SearchSortDTO {
  Field: string;
  Direction: 'Asc' | 'Desc';
  SecondaryField?: string;
  SecondaryDirection?: 'Asc' | 'Desc';
}

export interface SearchPaginationDTO {
  Page: number;
  PageSize: number;
}

export interface UnifiedSearchResponseDTO {
  Results: SearchResultGroupDTO[];
  TotalCount: number;
  ExecutionTimeMs: number;
  Suggestions: SearchSuggestionDTO[];
  FacetCounts: Record<string, number>;
  HasMore: boolean;
  SearchId: string;
}

// Backend response format (different from frontend expected format)
export interface BackendSearchResponseDTO {
  query: string;
  totalResults: number;
  executionTimeMs: number;
  suggestions: SearchSuggestionDTO[];
  facets: {
    entityTypes: unknown[];
    dateRanges: unknown[];
    families: unknown[];
    statuses: unknown[];
    priorities: unknown[];
  };
  searchId?: string;
  tasks: BackendEntityResultsDTO;
  families: BackendEntityResultsDTO;
  achievements: BackendEntityResultsDTO;
  boards: BackendEntityResultsDTO;
  notifications: BackendEntityResultsDTO;
  activities: BackendEntityResultsDTO;
  tags: BackendEntityResultsDTO;
  categories: BackendEntityResultsDTO;
  templates: BackendEntityResultsDTO;
}

export interface BackendEntityResultsDTO {
  results: SearchResultItemDTO[];
  totalCount: number;
  hasMore: boolean;
}

export interface SearchFiltersDTO {
  DateRange?: SearchDateRangeDTO;
  Statuses?: string[];
  Priorities?: string[];
  Categories?: string[];
  Tags?: string[];
  FamilyIds?: number[];
  UserIds?: number[];
  AssignedToUserIds?: number[];
  CreatedByUserIds?: number[];
}

export interface SearchDateRangeDTO {
  From?: string;
  To?: string;
  Preset?: SearchDatePresetDTO;
}

export interface SearchResultGroupDTO {
  EntityType: SearchEntityTypeDTO;
  Results: SearchResultItemDTO[];
  TotalCount: number;
  HasMore: boolean;
}

export interface SearchResultItemDTO {
  Id: number;
  EntityType: SearchEntityTypeDTO;
  Title: string;
  Description?: string;
  Url?: string;
  Highlights: SearchHighlightDTO[];
  Score: number;
  EntityData: Record<string, unknown>;
  CreatedAt: string;
  UpdatedAt?: string;
}

export interface SearchHighlightDTO {
  Field: string;
  Fragments: string[];
  StartPosition: number;
  EndPosition: number;
}

export interface SearchSuggestionDTO {
  Text: string;
  Type: SearchSuggestionTypeDTO;
  Score: number;
  EntityType?: SearchEntityTypeDTO;
  EntityId?: number;
  Metadata: Record<string, string>;
}

// ================================
// SAVED SEARCHES
// ================================

export interface SavedSearchDTO {
  Id: number;
  Name: string;
  Description?: string;
  SearchQuery: UnifiedSearchRequestDTO;
  IsSharedWithFamily: boolean;
  UsageCount: number;
  LastUsedAt?: string;
  CreatedAt: string;
  UpdatedAt?: string;
  CreatedByUserId: number;
  CreatedByUserName?: string;
  FamilyId?: number;
  Tags?: string[];
}

export interface CreateSavedSearchDTO {
  Name: string;
  Description?: string;
  SearchQuery: UnifiedSearchRequestDTO;
  IsSharedWithFamily: boolean;
  Tags?: string[];
}

export interface UpdateSavedSearchDTO {
  Name?: string;
  Description?: string;
  SearchQuery?: UnifiedSearchRequestDTO;
  IsSharedWithFamily?: boolean;
  Tags?: string[];
}

// ================================
// SEARCH ANALYTICS
// ================================

export interface SearchAnalyticsDTO {
  TotalSearches: number;
  UniqueUsers: number;
  AverageExecutionTime: number;
  TopSearchTerms: PopularSearchTermDTO[];
  SearchesByEntityType: Record<string, number>;
  SearchesByTimeOfDay: Record<string, number>;
  ZeroResultQueries: string[];
  PerformanceMetrics: SearchPerformanceMetricsDTO;
}

export interface PopularSearchTermDTO {
  Term: string;
  Count: number;
  AverageScore: number;
  LastSearchedAt: string;
  EntityTypes: SearchEntityTypeDTO[];
}

export interface SearchPerformanceMetricsDTO {
  AverageExecutionTimeMs: number;
  MedianExecutionTimeMs: number;
  P95ExecutionTimeMs: number;
  AverageResultCount: number;
  ZeroResultsPercentage: number;
}

export interface SearchHistoryEntryDTO {
  Id: number;
  SearchQuery: string;
  EntityTypes: SearchEntityTypeDTO[];
  ResultCount: number;
  ExecutionTimeMs: number;
  UserId: number;
  FamilyId?: number;
  CreatedAt: string;
  ClickedResults: number[];
}

// ================================
// UI COMPONENT INTERFACES
// ================================

export interface SearchUIState {
  query: string;
  entityTypes: SearchEntityTypeDTO[];
  filters: SearchFiltersDTO;
  results: SearchResultGroupDTO[];
  suggestions: SearchSuggestionDTO[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  totalCount: number;
  executionTime: number;
  selectedResultId: number | null;
  showAdvancedFilters: boolean;
  sortBy: string;
  sortDirection: 'Asc' | 'Desc';
  pageNumber: number;
  pageSize: number;
}

export interface SearchBarProps {
  onSearch: (query: string) => void;
  onSuggestionSelect: (suggestion: SearchSuggestionDTO) => void;
  placeholder?: string;
  suggestions: SearchSuggestionDTO[];
  isLoading?: boolean;
  autoFocus?: boolean;
  showEntityFilters?: boolean;
  defaultEntityTypes?: SearchEntityTypeDTO[];
  className?: string;
}

export interface SearchResultsProps {
  results: SearchResultGroupDTO[];
  onResultClick: (result: SearchResultItemDTO) => void;
  onLoadMore: (entityType: SearchEntityTypeDTO) => void;
  isLoading?: boolean;
  error?: string | null;
  totalCount: number;
  executionTime: number;
  query: string;
  className?: string;
}

export interface SearchFiltersProps {
  filters: SearchFiltersDTO;
  onFiltersChange: (filters: SearchFiltersDTO) => void;
  availableFilters: AvailableSearchFiltersDTO;
  isAdvanced?: boolean;
  onToggleAdvanced?: () => void;
  className?: string;
}

export interface AvailableSearchFiltersDTO {
  statuses: string[];
  priorities: string[];
  categories: string[];
  tags: string[];
  families: { id: number; name: string }[];
  users: { id: number; name: string }[];
}

// ================================
// HOOKS AND SERVICES
// ================================

export interface UseUnifiedSearchReturn {
  searchState: SearchUIState;
  search: (query: string, options?: Partial<UnifiedSearchRequestDTO>) => Promise<void>;
  loadMore: (entityType: SearchEntityTypeDTO) => Promise<void>;
  clearResults: () => void;
  setFilters: (filters: SearchFiltersDTO) => void;
  setEntityTypes: (types: SearchEntityTypeDTO[]) => void;
  setSorting: (sortBy: string, direction: 'Asc' | 'Desc') => void;
  getSuggestions: (query: string) => Promise<SearchSuggestionDTO[]>;
  getSearchHistory: () => Promise<SearchHistoryEntryDTO[]>;
  clearSearchHistory: () => Promise<void>;
  savedSearches: SavedSearchDTO[];
  createSavedSearch: (search: CreateSavedSearchDTO) => Promise<void>;
  updateSavedSearch: (id: number, updates: UpdateSavedSearchDTO) => Promise<void>;
  deleteSavedSearch: (id: number) => Promise<void>;
  executeSavedSearch: (savedSearch: SavedSearchDTO) => Promise<void>;
  getSearchAnalytics: (familyId?: number) => Promise<SearchAnalyticsDTO>;
}

export interface SearchServiceConfig {
  baseUrl: string;
  defaultPageSize: number;
  suggestionDebounceMs: number;
  maxSuggestions: number;
  cacheResults: boolean;
  cacheDurationMs: number;
}

// ================================
// API ERROR TYPES
// ================================

export interface ApiError {
  statusCode: number;
  status: number;
  message: string;
  errors?: Record<string, string[]>;
  timestamp?: string;
}

// ================================
// API RESPONSES
// ================================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  timestamp: string;
  executionTime: number;
}

export interface SearchSuggestionsResponse extends ApiResponse<SearchSuggestionDTO[]> {
  query: string;
  totalSuggestions: number;
}

export interface SavedSearchesResponse extends ApiResponse<SavedSearchDTO[]> {
  totalCount: number;
  familySharedCount: number;
}

export interface SearchAnalyticsResponse extends ApiResponse<SearchAnalyticsDTO> {
  dateRange: {
    from: string;
    to: string;
  };
  familyId?: number;
}

// ================================
// SPECIALIZED INTERFACES
// ================================

export interface QuickSearchModalState {
  isOpen: boolean;
  query: string;
  selectedIndex: number;
  results: SearchResultItemDTO[];
  suggestions: SearchSuggestionDTO[];
  isLoading: boolean;
  error: string | null;
}

export interface SearchContextType {
  searchState: SearchUIState;
  recentSearches: string[];
  savedSearches: SavedSearchDTO[];
  searchActions: {
    performSearch: (query: string, options?: Partial<UnifiedSearchRequestDTO>) => Promise<void>;
    saveSearch: (name: string, description?: string) => Promise<void>;
    clearHistory: () => Promise<void>;
    setGlobalFilters: (filters: SearchFiltersDTO) => void;
  };
}

export interface SearchKeyboardShortcuts {
  globalSearch: string;
  focusSearch: string;
  clearSearch: string;
  selectNext: string;
  selectPrevious: string;
  executeSearch: string;
  openAdvanced: string;
}

export interface SearchAccessibilityOptions {
  announceResults: boolean;
  announceCount: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  screenReaderOptimized: boolean;
}

export interface MobileSearchConfig {
  enableVoiceSearch: boolean;
  showKeyboardShortcuts: boolean;
  compactResults: boolean;
  gestureNavigation: boolean;
  hapticFeedback: boolean;
} 