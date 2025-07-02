/*
 * Boards Collection Types
 * Copyright (c) 2025 Carlos Abril Jr
 * 
 * Board collection and management types following .cursorrules standards
 */

import { BoardType, BoardVisibility, BoardStatus, BoardTemplate, BoardFilterType, BoardSortType } from './board';

// ================================
// BOARD COLLECTION TYPES
// ================================

export type BoardsView = 'grid' | 'list' | 'kanban_preview';

export type BoardsGrouping = 'none' | 'type' | 'family' | 'status' | 'template';

// ================================
// BOARD SEARCH TYPES
// ================================

export interface BoardSearchFilters {
  type?: BoardType[];
  visibility?: BoardVisibility[];
  status?: BoardStatus[];
  template?: BoardTemplate[];
  familyId?: number[];
  hasActiveTasks?: boolean;
  createdAfter?: Date;
  createdBefore?: Date;
  updatedAfter?: Date;
  updatedBefore?: Date;
}

export interface BoardSearchOptions {
  query?: string;
  filters?: BoardSearchFilters;
  sort?: BoardSortType;
  sortDirection?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  includeArchived?: boolean;
}

// ================================
// BOARD BULK OPERATIONS
// ================================

export type BoardsBulkOperation = 
  | 'archive'
  | 'unarchive'
  | 'delete'
  | 'duplicate'
  | 'change_visibility'
  | 'assign_family'
  | 'export';

export interface BoardsBulkOperationPayload {
  operation: BoardsBulkOperation;
  boardIds: number[];
  options?: {
    newVisibility?: BoardVisibility;
    targetFamilyId?: number;
    exportFormat?: 'json' | 'csv' | 'pdf';
    includeCompletedTasks?: boolean;
  };
}

// ================================
// BOARD ANALYTICS COLLECTION
// ================================

export interface BoardsAnalytics {
  totalBoards: number;
  activeBoards: number;
  archivedBoards: number;
  boardsByType: Record<BoardType, number>;
  boardsByTemplate: Record<BoardTemplate, number>;
  averageTasksPerBoard: number;
  completionRateByBoard: Record<number, number>;
  mostActiveBoards: Array<{
    boardId: number;
    boardName: string;
    activityScore: number;
  }>;
}

// ================================
// BOARD MANAGEMENT TYPES
// ================================

export interface BoardsManagerState {
  boards: any[]; // Will be properly typed when Board interface is available
  loading: boolean;
  error: string | null;
  selectedBoards: number[];
  view: BoardsView;
  grouping: BoardsGrouping;
  filters: BoardSearchFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
} 