/*
 * Task Management Interfaces - Moved from lib/types/task.ts for .cursorrules compliance
 * lib/interfaces/components/task-management.interface.ts
 * Copyright (c) 2025 Carlos Abril Jr
 */

// Removed unused TaskItemStatus import to comply with .cursorrules

// === TASK MANAGEMENT INTERFACES ===

export interface TaskFilter {
  id: string;
  type: 'status' | 'priority' | 'assignee' | 'dueDate' | 'tags' | 'category' | 'custom';
  label: string;
  value: string | number | string[] | Date;
  operator?: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan' | 'between' | 'in';
  isActive: boolean;
}

export type ViewMode = 'table' | 'kanban' | 'calendar' | 'timeline' | 'dashboard';
export type LayoutMode = 'standard' | 'compact' | 'comfortable' | 'spacious';
export type FilterPreset = 'all' | 'active' | 'completed' | 'overdue' | 'assigned' | 'unassigned' | 'high-priority';

export interface TaskManagerState {
  viewMode: ViewMode;
  layoutMode: LayoutMode;
  selectedTasks: Set<number>;
  filters: TaskFilter[];
  sortColumn: string;
  sortDirection: 'asc' | 'desc';
  searchQuery: string;
  filterPreset: FilterPreset;
  showCompletedTasks: boolean;
  groupBy: 'none' | 'status' | 'priority' | 'assignee' | 'dueDate';
}

export type ColumnKey = 'title' | 'status' | 'priority' | 'assignee' | 'dueDate' | 'xp' | 'createdAt' | 'tags';
export type SortDirection = 'asc' | 'desc';

export interface TableFilter {
  id: string;
  type: 'status' | 'priority' | 'assignee' | 'dueDate' | 'tags' | 'category';
  label: string;
  value: string | number | string[];
  operator: 'equals' | 'contains' | 'in' | 'greaterThan' | 'lessThan';
  isActive: boolean;
} 
