/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * Task Component Props - Moved from lib/types/tasks/ for .cursorrules compliance
 * Following FAMILY-AUTH-IMPLEMENTATION-CHECKLIST.md enterprise standards
 */

import React from 'react';
import type { 
  Task,
  TaskCategory,
  TaskFilter,
  TaskStats,
  CreateTaskDTO,
  UpdateTaskDTO,
  TaskItemStatus
} from '@/lib/types/tasks';
import type { FamilyMemberDTO } from '@/lib/types/family';

// ============================================================================
// TASK PAGE COMPONENT PROPS
// ============================================================================

export interface TasksPageContentProps {
  className?: string;
  initialTasks?: Task[];
  initialCategories?: TaskCategory[];
  familyId?: number;
  userId?: number;
  showCompleted?: boolean;
  defaultView?: 'list' | 'board' | 'calendar';
}

export interface TaskDetailProps {
  taskId: number;
  onClose?: () => void;
  onUpdate?: (task: Task) => void;
  onDelete?: () => void;
  className?: string;
  mode?: 'view' | 'edit';
  showActions?: boolean;
}

export interface EnterpriseTaskManagerProps {
  className?: string;
  familyId?: number;
  userId?: number;
  initialFilters?: TaskFilter[];
  enableBulkActions?: boolean;
  enableAdvancedFilters?: boolean;
  showAnalytics?: boolean;
  compactMode?: boolean;
}

// ============================================================================
// TASK LIST COMPONENT PROPS
// ============================================================================

export interface TaskListProps {
  tasks: Task[];
  onTaskUpdate: (task: Task) => void;
  onTaskDelete: (taskId: number) => void;
  onTaskComplete: (taskId: number) => void;
  className?: string;
  showCategories?: boolean;
  showPriority?: boolean;
  showAssignee?: boolean;
  compact?: boolean;
  loading?: boolean;
}

export interface TaskCardProps {
  task: Task;
  onUpdate: (task: Task) => void;
  onDelete: () => void;
  onComplete: () => void;
  className?: string;
  variant?: 'default' | 'compact' | 'detailed';
  showActions?: boolean;
  draggable?: boolean;
}

export interface TaskFormProps {
  task?: Task;
  categories: TaskCategory[];
  onSubmit: (task: CreateTaskDTO | UpdateTaskDTO) => void;
  onCancel: () => void;
  className?: string;
  mode?: 'create' | 'edit';
  loading?: boolean;
  error?: string;
}

// ============================================================================
// TASK FILTER COMPONENT PROPS
// ============================================================================

export interface TaskFiltersProps {
  filters: TaskFilter[];
  categories: TaskCategory[];
  onFiltersChange: (filters: TaskFilter[]) => void;
  className?: string;
  showAdvanced?: boolean;
  compact?: boolean;
}

export interface TaskSortProps {
  sortColumn: string;
  sortDirection: 'asc' | 'desc';
  onSortChange: (column: string, direction: 'asc' | 'desc') => void;
  className?: string;
  compact?: boolean;
}

// ============================================================================
// TASK ANALYTICS COMPONENT PROPS
// ============================================================================

export interface TaskAnalyticsProps {
  tasks: Task[];
  stats?: TaskStats;
  timeRange?: 'week' | 'month' | 'quarter' | 'year';
  className?: string;
  showCharts?: boolean;
  showMetrics?: boolean;
  compact?: boolean;
}

export interface TaskProgressProps {
  completed: number;
  total: number;
  className?: string;
  showPercentage?: boolean;
  variant?: 'bar' | 'circle' | 'minimal';
  size?: 'small' | 'medium' | 'large';
}

// ============================================================================
// ENTERPRISE TASK TABLE PROPS
// ============================================================================

export type TableViewMode = 'compact' | 'comfortable' | 'spacious';
export type TableDensity = 'tight' | 'normal' | 'loose';
export type SortDirection = 'asc' | 'desc' | null;
export type ColumnKey = 'title' | 'status' | 'priority' | 'assignee' | 'family' | 'dueDate' | 'createdAt' | 'points' | 'tags' | 'category' | 'actions';

export interface TableColumn {
  key: ColumnKey;
  label: string;
  icon: React.ReactNode;
  sortable: boolean;
  filterable: boolean;
  width?: string;
  minWidth?: string;
  hiddenOn?: 'mobile' | 'tablet' | 'desktop';
  sticky?: boolean;
  align?: 'left' | 'center' | 'right';
}

export interface TableFilter {
  column: ColumnKey;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'in' | 'between' | 'greaterThan' | 'lessThan';
  value: string | number | string[] | Date | boolean;
  label: string;
}

export interface EnterpriseTaskTableProps {
  tasks: Task[];
  familyMembers: FamilyMemberDTO[];
  isLoading?: boolean;
  enableBatchOperations?: boolean;
  enableKanbanSync?: boolean;
  enableAdvancedFilters?: boolean;
  enableColumnCustomization?: boolean;
  enableExportImport?: boolean;
  enableRealTimeUpdates?: boolean;
  enableDragAndDrop?: boolean;
  onTaskSelect?: (task: Task) => void;
  onTaskEdit?: (task: Task) => void;
  onTaskDelete?: (taskId: number) => void;
  onTaskStatusChange?: (taskId: number, status: TaskItemStatus) => void;
  onTaskUpdate?: (taskId: number, updates: Partial<Task>) => void;
  onTaskReorder?: (tasks: Task[]) => void;
  onBatchOperation?: (operation: string, taskIds: number[]) => void;
  onExport?: (format: 'csv' | 'excel' | 'json') => void;
  onImport?: (file: File) => void;
  onColumnReorder?: (columns: ColumnKey[]) => void;
  onFilterChange?: (filters: TableFilter[]) => void;
  onSortChange?: (column: ColumnKey, direction: SortDirection) => void;
  className?: string;
}

export interface SortableTableRowProps {
  task: Task;
  isSelected: boolean;
  viewMode: TableViewMode;
  density: TableDensity;
  activeColumns: TableColumn[];
  enableBatchOperations: boolean;
  enableKanbanSync: boolean;
  enableDragAndDrop: boolean;
  onTaskSelect?: (task: Task) => void;
  onTaskEdit?: (task: Task) => void;
  onTaskDelete?: (taskId: number) => void;
  onTaskStatusChange?: (taskId: number, status: TaskItemStatus) => void;
  onSelectTask: (taskId: number, checked: boolean) => void;
  renderCellContent: (task: Task, columnKey: ColumnKey) => React.ReactNode;
} 