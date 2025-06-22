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
  Filters?: Record<string, string | number | boolean | string[] | number[]>;
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
    entityTypes: { name: string; count: number }[];
    dateRanges: { name: string; count: number }[];
    families: { name: string; count: number }[];
    statuses: { name: string; count: number }[];
    priorities: { name: string; count: number }[];
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
  results: (TaskSearchResultDTO | FamilySearchResultDTO | AchievementSearchResultDTO | 
           BoardSearchResultDTO | NotificationSearchResultDTO | ActivitySearchResultDTO |
           TagSearchResultDTO | CategorySearchResultDTO | TemplateSearchResultDTO)[];
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
  Id: string;
  EntityType: SearchEntityTypeDTO;
  Title: string;
  Description?: string;
  Url?: string;
  Highlights: SearchHighlightDTO[];
  Score: number;
  EntityData: Record<string, string | number | boolean | string[] | undefined | null>;
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

// ================================
// BACKEND ENTITY DTO INTERFACES
// ================================

export interface TaskSearchResultDTO {
  Id: number;
  Title: string;
  Description?: string;
  Status: string;
  Priority: string;
  DueDate?: string;
  CreatedAt: string;
  AssignedToUserId?: number;
  AssignedToUserName?: string;
  FamilyId?: number;
  FamilyName?: string;
  Tags: string[];
  CategoryName?: string;
  Highlights: SearchHighlightDTO[];
  SearchScore: number;
}

export interface FamilySearchResultDTO {
  Id: number;
  Name: string;
  Description?: string;
  MemberCount: number;
  CreatedAt: string;
  CreatedByUserName?: string;
  MemberNames: string[];
  Highlights: SearchHighlightDTO[];
  SearchScore: number;
}

export interface AchievementSearchResultDTO {
  Id: number;
  Title: string;
  Description: string;
  Icon?: string;
  Points: number;
  IsUnlocked: boolean;
  UnlockedAt?: string;
  CreatedAt?: string;
  Category?: string;
  Difficulty?: string;
  Highlights: SearchHighlightDTO[];
  SearchScore: number;
}

export interface BoardSearchResultDTO {
  Id: number;
  Name: string;
  Description?: string;
  TaskCount: number;
  CreatedAt: string;
  LastModifiedAt?: string;
  FamilyId?: number;
  FamilyName?: string;
  Template?: string;
  Highlights: SearchHighlightDTO[];
  SearchScore: number;
}

export interface NotificationSearchResultDTO {
  Id: number;
  Title: string;
  Message: string;
  Type: string;
  IsRead: boolean;
  CreatedAt: string;
  RelatedEntityId?: number;
  RelatedEntityType?: string;
  Highlights: SearchHighlightDTO[];
  SearchScore: number;
}

export interface ActivitySearchResultDTO {
  Id: number;
  Description: string;
  ActivityType: string;
  Timestamp: string;
  CreatedAt?: string;
  UserId: number;
  UserName: string;
  FamilyId?: number;
  FamilyName?: string;
  RelatedEntityId?: number;
  RelatedEntityType?: string;
  Highlights: SearchHighlightDTO[];
  SearchScore: number;
}

export interface TagSearchResultDTO {
  Id?: number;
  Name: string;
  Title?: string;
  Description?: string;
  UsageCount?: number;
  Color?: string;
  CreatedAt?: string;
  Highlights?: SearchHighlightDTO[];
  SearchScore?: number;
}

export interface CategorySearchResultDTO {
  Id: number;
  Name: string;
  Title?: string;
  Description?: string;
  TaskCount?: number;
  Color?: string;
  CreatedAt?: string;
  Highlights?: SearchHighlightDTO[];
  SearchScore?: number;
}

export interface TemplateSearchResultDTO {
  Id: number;
  Name: string;
  Title?: string;
  Description?: string;
  Category?: string;
  IsPublic?: boolean;
  CreatedAt?: string;
  Highlights?: SearchHighlightDTO[];
  SearchScore?: number;
}

// Backend response type definitions for search service
export interface BackendTaskSearchResult {
  Id?: number;
  id?: number;
  TaskId?: number;
  Title?: string;
  title?: string;
  Description?: string;
  description?: string;
  Status?: string;
  status?: string;
  Priority?: string;
  priority?: string;
  DueDate?: string;
  dueDate?: string;
  AssignedToUserName?: string;
  assignedToUserName?: string;
  FamilyName?: string;
  familyName?: string;
  Tags?: string[];
  tags?: string[];
  CategoryName?: string;
  categoryName?: string;
  SearchScore?: number;
  searchScore?: number;
  CreatedAt?: string;
  createdAt?: string;
  Highlights?: string[];
  highlights?: string[];
  task?: BackendTaskSearchResult; // For wrapped responses
}

export interface BackendFamilySearchResult {
  Id?: number;
  id?: number;
  FamilyId?: number;
  Name?: string;
  name?: string;
  Description?: string;
  description?: string;
  MemberCount?: number;
  memberCount?: number;
  SearchScore?: number;
  searchScore?: number;
  CreatedAt?: string;
  createdAt?: string;
  Highlights?: string[];
  highlights?: string[];
  family?: BackendFamilySearchResult; // For wrapped responses
}

export interface BackendAchievementSearchResult {
  Id?: number;
  id?: number;
  AchievementId?: number;
  Title?: string;
  title?: string;
  Description?: string;
  description?: string;
  PointsValue?: number;
  pointsValue?: number;
  Category?: string;
  category?: string;
  SearchScore?: number;
  searchScore?: number;
  CreatedAt?: string;
  createdAt?: string;
  Highlights?: string[];
  highlights?: string[];
  achievement?: BackendAchievementSearchResult; // For wrapped responses
}

export interface BackendBoardSearchResult {
  Id?: number;
  id?: number;
  BoardId?: number;
  Name?: string;
  name?: string;
  Description?: string;
  description?: string;
  TaskCount?: number;
  taskCount?: number;
  FamilyName?: string;
  familyName?: string;
  Template?: string;
  template?: string;
  SearchScore?: number;
  searchScore?: number;
  CreatedAt?: string;
  createdAt?: string;
  LastModifiedAt?: string;
  lastModifiedAt?: string;
  Highlights?: string[];
  highlights?: string[];
  board?: BackendBoardSearchResult; // For wrapped responses
}

export interface BackendNotificationSearchResult {
  Id?: number;
  id?: number;
  NotificationId?: number;
  Title?: string;
  title?: string;
  Message?: string;
  message?: string;
  Type?: string;
  type?: string;
  IsRead?: boolean;
  isRead?: boolean;
  RelatedEntityId?: number;
  relatedEntityId?: number;
  RelatedEntityType?: string;
  relatedEntityType?: string;
  SearchScore?: number;
  searchScore?: number;
  CreatedAt?: string;
  createdAt?: string;
  Highlights?: string[];
  highlights?: string[];
  notification?: BackendNotificationSearchResult; // For wrapped responses
}

export interface BackendActivitySearchResult {
  Id?: number;
  id?: number;
  ActivityId?: number;
  Description?: string;
  description?: string;
  ActivityType?: string;
  activityType?: string;
  Timestamp?: string;
  timestamp?: string;
  UserId?: number;
  userId?: number;
  UserName?: string;
  userName?: string;
  FamilyName?: string;
  familyName?: string;
  RelatedEntityId?: number;
  relatedEntityId?: number;
  RelatedEntityType?: string;
  relatedEntityType?: string;
  SearchScore?: number;
  searchScore?: number;
  CreatedAt?: string;
  createdAt?: string;
  Highlights?: string[];
  highlights?: string[];
  activity?: BackendActivitySearchResult; // For wrapped responses
}

export interface BackendTagSearchResult {
  Id?: number;
  id?: number;
  TagId?: number;
  Name?: string;
  name?: string;
  Title?: string;
  title?: string;
  Description?: string;
  description?: string;
  UsageCount?: number;
  usageCount?: number;
  Color?: string;
  color?: string;
  SearchScore?: number;
  searchScore?: number;
  CreatedAt?: string;
  createdAt?: string;
  Highlights?: string[];
  highlights?: string[];
  tag?: BackendTagSearchResult; // For wrapped responses
}

export interface BackendCategorySearchResult {
  Id?: number;
  id?: number;
  CategoryId?: number;
  Name?: string;
  name?: string;
  Title?: string;
  title?: string;
  Description?: string;
  description?: string;
  TaskCount?: number;
  taskCount?: number;
  Color?: string;
  color?: string;
  SearchScore?: number;
  searchScore?: number;
  CreatedAt?: string;
  createdAt?: string;
  Highlights?: string[];
  highlights?: string[];
  category?: BackendCategorySearchResult; // For wrapped responses
}

export interface BackendTemplateSearchResult {
  Id?: number;
  id?: number;
  TemplateId?: number;
  Name?: string;
  name?: string;
  Title?: string;
  title?: string;
  Description?: string;
  description?: string;
  Category?: string;
  category?: string;
  IsPublic?: boolean;
  isPublic?: boolean;
  SearchScore?: number;
  searchScore?: number;
  CreatedAt?: string;
  createdAt?: string;
  Highlights?: string[];
  highlights?: string[];
  template?: BackendTemplateSearchResult; // For wrapped responses
}

// Union type for all backend search results - EXPLICIT TYPES ONLY
export type BackendSearchResult = 
  | BackendTaskSearchResult 
  | BackendFamilySearchResult 
  | BackendAchievementSearchResult
  | BackendBoardSearchResult
  | BackendNotificationSearchResult
  | BackendActivitySearchResult
  | BackendTagSearchResult
  | BackendCategorySearchResult
  | BackendTemplateSearchResult; 