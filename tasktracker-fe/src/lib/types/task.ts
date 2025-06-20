/*
 * Task Types & Interfaces
 * Copyright (c) 2025 Carlos Abril Jr
 */

import { User } from './auth';
import { FamilyDTO, FamilyMemberDTO } from './family-invitation';
import { BoardColumnDTO } from './board';

// Export enum types for board components
export enum TaskPriority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Urgent = 'Urgent'
}

export enum TaskItemStatus {
  NotStarted = 0,
  InProgress = 1,
  OnHold = 2,
  Pending = 3,
  Completed = 4,
  Cancelled = 5
}

/**
 * Task Filter Interface for Enterprise Task Manager
 */
export interface TaskFilter {
  id: string;
  type: 'status' | 'priority' | 'assignee' | 'dueDate' | 'tags' | 'category' | 'custom';
  label: string;
  value: string | number | string[] | Date;
  operator?: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan' | 'between' | 'in';
  isActive: boolean;
}

/**
 * Enterprise Task Manager View Modes
 */
export type ViewMode = 'table' | 'kanban' | 'calendar' | 'timeline' | 'dashboard';
export type LayoutMode = 'standard' | 'compact' | 'comfortable' | 'spacious';
export type FilterPreset = 'all' | 'active' | 'completed' | 'overdue' | 'assigned' | 'unassigned' | 'high-priority';

/**
 * Task Manager State Interface
 */
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

/**
 * Task Item Response DTO - matches backend TaskItemResponseDTO
 */
export interface TaskItemResponseDTO {
  id: number;
  title: string;
  description?: string;
  status: string;
  priority: TaskPriority;
  dueDate?: string; // ISO date string
  createdAt: string; // ISO date string
  updatedAt?: string; // ISO date string
  completedAt?: string; // ISO date string
  categoryId?: number;
  categoryName?: string;
  userId: number;
  tags?: TagDto[];
  estimatedMinutes?: number;
  actualMinutes?: number;
  isStarred?: boolean;
  isRecurring?: boolean;
  recurrencePattern?: string;
  boardPosition?: number;
  boardColumn?: string;
  boardId?: number;
  assignedToUserId?: number;
  assignedToUserName?: string;
  // Board-specific properties
  points?: number;
  pointsValue?: number;
  pointsEarned?: number;
  // Task source tracking for quest selection
  taskSource?: 'individual' | 'family' | 'assigned';
}

/**
 * Create Task Item DTO - for creating new tasks in boards
 */
export interface CreateTaskItemDTO {
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskItemStatus;
  dueDate?: string; // ISO date string
  points?: number;
  tags?: string[];
  boardId?: number;
  categoryId?: number;
  estimatedTimeMinutes?: number;
  familyId?: number;
  assignedToUserId?: number;
}

export interface TagDto {
  id: number;
  name: string;
  color: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: TaskItemStatus;
  isCompleted: boolean;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  dueDate?: Date;
  categoryId?: number;
  categoryName?: string;
  estimatedTimeMinutes?: number;
  actualTimeMinutes?: number;
  pointsEarned: number;
  pointsValue: number;
  userId: number;
  familyId?: number;
  assignedToUserId?: number;
  assignedToUserName?: string;
  createdAt: Date;
  updatedAt?: Date;
  completedAt?: Date;
  tags?: TagDto[];
  version?: number; // For optimistic concurrency control
}

// === FAMILY TASK TYPES (Matching Backend DTOs Exactly) ===

/**
 * Family Task Item DTO - matches backend FamilyTaskItemDTO
 */
export interface FamilyTaskItemDTO {
  id: number;
  title: string;
  description?: string;
  status: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  dueDate?: string; // ISO date string from backend
  isCompleted: boolean;
  pointsValue: number;
  pointsEarned: number;
  estimatedTimeMinutes?: number;
  actualTimeMinutes?: number;
  userId: number;
  familyId: number;
  assignedToFamilyMemberId?: number;
  assignedByUserId?: number;
  requiresApproval: boolean;
  approvedByUserId?: number;
  approvedAt?: string; // ISO date string
  createdAt: string; // ISO date string
  updatedAt?: string; // ISO date string
  completedAt?: string; // ISO date string
  // Navigation properties
  assignedToFamilyMember?: FamilyMemberDTO;
  assignedByUser?: User;
  approvedByUser?: User;
  family?: FamilyDTO;
}

/**
 * Task Assignment DTO - matches backend TaskAssignmentDTO
 */
export interface TaskAssignmentDTO {
  taskId: number;
  assignToUserId: number;
  requiresApproval: boolean;
}

/**
 * Flexible Task Assignment DTO - matches backend FlexibleTaskAssignmentDTO
 */
export interface FlexibleTaskAssignmentDTO {
  taskId: number;
  assignToUserId: number | string;
  requiresApproval: boolean;
  memberId: number | string;
  userId: number | string;
}

/**
 * Task Approval DTO - matches backend TaskApprovalDTO
 */
export interface TaskApprovalDTO {
  taskId: number;
  approvalComment?: string;
}

// FamilyTaskStats moved to lib/types/family-task.ts following checklist rules

// === EXISTING TYPES (UNCHANGED) ===

export interface CreateTaskDTO {
  title: string;
  description?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  dueDate?: string; // ISO date string
  categoryId?: number;
  estimatedTimeMinutes?: number;
  pointsValue?: number;
  familyId?: number;
  assignedToUserId?: number;
  tags?: string[];
}

export interface UpdateTaskDTO {
  title?: string;
  description?: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Urgent';
  dueDate?: string; // ISO date string
  categoryId?: number;
  estimatedTimeMinutes?: number;
  pointsValue?: number;
  assignedToUserId?: number;
  tags?: string[];
  version?: number; // For optimistic concurrency control
  boardId?: number; // Board assignment field
  status?: TaskItemStatus; // Task status field for board assignment
}

export interface TaskStats {
  totalTasks: number;
  completedTasks: number;
  activeTasks: number;
  overdueTasks: number;
  // Extended properties for dashboard use
  tasksCompleted: number;
  tasksCompletedThisWeek: number;
  activeGoals: number;
  focusTimeToday: number;
  streakDays: number;
  totalPoints: number;
}

export interface TaskCategory {
  id: number;
  name: string;
  color: string;
  icon?: string;
  description?: string;
  userId: number;
  isDefault: boolean;
  taskCount: number;
  createdAt: Date;
}

export interface Goal {
  id: number;
  title: string;
  description?: string;
  targetValue: number;
  currentValue: number;
  metric: 'tasks_completed' | 'points_earned' | 'focus_time' | 'custom';
  period: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  startDate: Date;
  endDate?: Date;
  isCompleted: boolean;
  userId: number;
  familyId?: number;
  pointsReward: number;
  createdAt: Date;
  updatedAt?: Date;
  completedAt?: Date;
}

export interface CreateGoalDTO {
  title: string;
  description?: string;
  targetValue: number;
  metric: 'tasks_completed' | 'points_earned' | 'focus_time' | 'custom';
  period: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  startDate: string; // ISO date string
  endDate?: string; // ISO date string
  familyId?: number;
  pointsReward?: number;
}

export interface UpdateGoalDTO {
  title?: string;
  description?: string;
  targetValue?: number;
  endDate?: string; // ISO date string
  pointsReward?: number;
}

// Backend API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface BackendTaskStatsResponse {
  completedTasks?: number;
  completedTasksThisWeek?: number;
  activeGoals?: number;
  focusTimeToday?: number;
  streakDays?: number;
  totalPoints?: number;
}

export interface BackendUserProgressResponse {
  id: number;
  userId: number;
  totalPoints: number;
  currentLevel: number;
  pointsToNextLevel: number;
  tasksCompleted: number;
  badgesEarned: number;
  currentStreak: number;
  highestStreak: number;
  lastActivityDate: string;
  lastUpdated: string;
}

export interface TasksPageContentProps {
  user: User | null;
  initialData: {
    tasks: Task[];
    categories: TaskCategory[];
    stats: TaskStats;
  };
}

// Form data types (inferred from Zod schemas)
export interface CreateTaskFormData {
  title: string;
  description?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  dueDate?: string;
  categoryId?: number;
  estimatedTimeMinutes?: number;
  pointsValue?: number;
  familyId?: number;
  assignedToUserId?: number;
  requiresApproval?: boolean;
  tags?: string[];
  // Enhanced fields for TaskCreationModal
  taskContext?: 'individual' | 'family' | 'template';
  saveAsTemplate?: boolean;
  templateName?: string;
  templateCategory?: string;
  isPublicTemplate?: boolean;
}

export interface UpdateTaskFormData {
  title?: string;
  description?: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Urgent';
  dueDate?: string;
  categoryId?: number;
  estimatedTimeMinutes?: number;
  pointsValue?: number;
  assignedToUserId?: number;
  tags?: string[];
}

export interface CompleteTaskFormData {
  taskId: number;
  actualTimeMinutes?: number;
  completionNotes?: string;
}

export interface CreateTaskCategoryFormData {
  name: string;
  color: string;
  icon?: string;
  description?: string;
}

export interface TaskFilterFormData {
  priority?: 'Low' | 'Medium' | 'High' | 'Urgent';
  isCompleted?: boolean;
  categoryId?: number;
  assignedToUserId?: number;
  dueBefore?: string;
  dueAfter?: string;
  tags?: string[];
  search?: string;
}

// TaskCreationModalProps moved to lib/types/component-props.ts following Family Auth Implementation Checklist rules

// === CACHE & API TYPES ===

/**
 * Cache entry structure for TaskService
 */
export interface TaskServiceCacheEntry {
  data: Task[] | TaskStats | FamilyTaskItemDTO[] | unknown;
  timestamp: number;
}

/**
 * Generic API response that can contain tasks in various formats
 */
export interface FlexibleApiResponse {
  data?: Task[];
  items?: Task[];
  tasks?: Task[];
  [key: string]: unknown;
}

// === TASK DETAIL TYPES ===

/**
 * Checklist Item - for task sub-tasks and progress tracking
 */
export interface ChecklistItem {
  id: number;
  taskId: number;
  title: string;
  description?: string;
  isCompleted: boolean;
  order: number;
  createdAt: Date;
  updatedAt?: Date;
  completedAt?: Date;
}

/**
 * Create Checklist Item - for creating new checklist items
 */
export interface CreateChecklistItem {
  title: string;
  description?: string;
  isCompleted: boolean;
  order: number;
}

/**
 * Task Time Tracking - for detailed time management
 */
export interface TaskTimeTracking {
  taskId: number;
  estimatedTimeMinutes: number;
  actualTimeMinutes: number;
  timeSpent: number;
  timeRemaining: number;
  sessions: TimeTrackingSession[];
  startedAt?: Date;
  pausedAt?: Date;
  isPaused: boolean;
  totalBreakTime: number;
}

export interface TimeTrackingSession {
  id: number;
  taskId: number;
  startTime: Date;
  endTime?: Date;
  duration: number; // in minutes
  description?: string;
  createdAt: Date;
}

/**
 * Task Progress Update - for progress tracking
 */
export interface TaskProgressUpdate {
  progressPercentage: number;
  notes?: string;
  milestones?: string[];
  blockers?: string[];
}

// === BATCH OPERATION TYPES ===

/**
 * Batch Task Operation - for bulk operations
 */
export interface BatchTaskOperation {
  operation: 'create' | 'update' | 'delete' | 'complete' | 'assign';
  tasks?: Task[];
  taskIds?: number[];
  data?: Record<string, unknown>;
}

/**
 * Batch Task Result - response from batch operations
 */
export interface BatchTaskResult {
  success: boolean;
  message: string;
  created?: Task[];
  updated?: Task[];
  deleted?: number[];
  completed?: number[];
  failed?: BatchTaskError[];
}

export interface BatchTaskError {
  index: number;
  task: Partial<Task> | CreateTaskDTO;
  error: string;
}

// === TASK DETAIL PAGE TYPES ===

/**
 * Task Detail Props - for task detail page
 */
export interface TaskDetailProps {
  taskId: number;
  user: User;
  onTaskUpdated?: (task: Task) => void;
  onTaskDeleted?: (taskId: number) => void;
}

/**
 * Task Detail Data - complete task information for detail view
 */
export interface TaskDetailData {
  task: Task;
  checklist: ChecklistItem[];
  timeTracking: TaskTimeTracking | null;
  tags: TagDto[];
  isLoading: boolean;
  error?: string;
}

export type TaskApiResponseType = ApiResponse<Task[]> | Task[] | FlexibleApiResponse;

/**
 * Enterprise Task Manager Props Interface - Following CLEAN ARCHITECTURE PRINCIPLES
 * All component props interfaces must be in lib/types directory
 */
export interface EnterpriseTaskManagerProps {
  tasks: Task[];
  columns: BoardColumnDTO[];
  familyMembers: FamilyMemberDTO[];
  stats: TaskStats;
  isLoading?: boolean;
  enableAdvancedFeatures?: boolean;
  enableBatchOperations?: boolean;
  enableRealTimeSync?: boolean;
  enableOfflineMode?: boolean;
  enableAnalytics?: boolean;
  onTaskCreate?: (columnId?: string) => void;
  onTaskEdit?: (task: Task) => void;
  onTaskDelete?: (taskId: number) => void;
  onTaskStatusChange?: (taskId: number, status: TaskItemStatus) => void;
  onTaskMove?: (taskId: number, fromColumn: string, toColumn: string, position: number) => void;
  onBatchOperation?: (operation: string, taskIds: number[]) => void;
  onExport?: (format: 'csv' | 'excel' | 'json' | 'pdf') => void;
  onImport?: (file: File) => void;
  onViewModeChange?: (mode: ViewMode) => void;
  onRefresh?: () => void;
  className?: string;
}

/**
 * Enterprise Task Table Types
 */
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

// Mobile Kanban types are defined in components/boards/MobileKanbanEnhancements.tsx
// Import them from there to avoid duplication

// BoardColumnDTO is imported from board types - no need to duplicate

/**
 * Type Conversion Utilities - Following CLEAN ARCHITECTURE PRINCIPLES
 * These utilities ensure proper type safety when converting between different task representations
 */

/**
 * Create mobile kanban columns from board columns with task counts
 */
export const createMobileKanbanColumns = (
  tasks: Task[], 
  columns: BoardColumnDTO[]
) => {
  return columns.map(column => ({
    ...column,
    taskCount: tasks.filter(task => task.status === column.status).length,
    completionRate: 0,
    isCollapsed: false
  }));
};

/**
 * Get task status from isCompleted boolean (backward compatibility)
 */
export const getTaskStatus = (task: { isCompleted: boolean; status?: TaskItemStatus }): TaskItemStatus => {
  if (task.status !== undefined) {
    return task.status;
  }
  return task.isCompleted ? TaskItemStatus.Completed : TaskItemStatus.NotStarted;
};

/**
 * Convert TableFilter to TaskFilter with proper type safety
 */
export const tableFilterToTaskFilter = (tableFilter: TableFilter): TaskFilter => ({
  id: `table-${tableFilter.id}`,
  type: tableFilter.type as TaskFilter['type'],
  label: tableFilter.label,
  value: tableFilter.value,
  operator: tableFilter.operator,
  isActive: tableFilter.isActive
}); 