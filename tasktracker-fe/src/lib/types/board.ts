/**
 * Enhanced Board Types
 * Matches backend DTOs for comprehensive Kanban board functionality
 */

import { Task } from './task';
import { TaskStatus, TaskStatusType, CustomTaskStatus } from './task';

// Import related user types
import { User } from './user';

// ==================== CORE BOARD TYPES ====================

export interface Board {
  id: number;
  name: string;
  description?: string;
  template: string;
  customLayout?: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
  columns: BoardColumn[];
  settings?: BoardSettings;
  tasks: Task[];
  isFavorite?: boolean;
  memberCount?: number;
}

export interface BoardDetail extends Board {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  completionRate: number;
  lastActivity?: string;
  collaborators?: BoardCollaborator[];
}

export interface BoardCollaborator {
  userId: number;
  username: string;
  displayName?: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  lastActiveAt?: string;
}

export interface BoardColumn {
  id: number;
  boardId: number;
  name: string;
  description?: string;
  order: number;
  color: string;
  icon?: string;
  mappedStatus: TaskStatusType;
  taskLimit?: number;
  isCollapsible: boolean;
  isDoneColumn: boolean;
  isVisible: boolean;
  taskCount: number;
  wipLimitReached: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface BoardSettings {
  id: number;
  boardId: number;
  theme: string;
  backgroundColor?: string;
  headerColor?: string;
  enableWipLimits: boolean;
  enableColumnCollapse: boolean;
  enableTaskCounting: boolean;
  enableDueDateWarnings: boolean;
  enablePriorityColors: boolean;
  autoMoveCompletedTasks: boolean;
  showColumnIcons: boolean;
  showTaskLabels: boolean;
  showTaskAssignees: boolean;
  showTaskDueDates: boolean;
  showTaskPriorities: boolean;
  defaultTaskPriority: number;
  defaultColumnColor: string;
  maxTasksPerColumn?: number;
  enableRealTimeUpdates: boolean;
  enableNotifications: boolean;
  enableKeyboardShortcuts: boolean;
  enableDragAndDrop: boolean;
  enableColumnReordering: boolean;
  enableTaskFiltering: boolean;
  enableSearchFunction: boolean;
  enableBulkOperations: boolean;
  enableTimeTracking: boolean;
  enableProgressTracking: boolean;
  createdAt: string;
  updatedAt?: string;
  isCustomized: boolean;
}

// ==================== BOARD TEMPLATE TYPES ====================

export interface BoardTemplate {
  id: number;
  name: string;
  description?: string;
  createdByUserId?: number;
  createdByUsername?: string;
  isPublic: boolean;
  isDefault: boolean;
  category?: string;
  tags?: string;
  layoutConfiguration: string;
  usageCount: number;
  averageRating?: number;
  ratingCount: number;
  previewImageUrl?: string;
  defaultColumns: BoardTemplateColumn[];
  createdAt: string;
  updatedAt?: string;
}

export interface BoardTemplateColumn {
  id: number;
  boardTemplateId: number;
  name: string;
  description?: string;
  order: number;
  color: string;
  icon?: string;
  mappedStatus: TaskStatusType;
  taskLimit?: number;
  isCollapsible: boolean;
  isDoneColumn: boolean;
}

// ==================== DTOs FOR API OPERATIONS ====================

export interface CreateBoard {
  name: string;
  description?: string;
}

export interface UpdateBoard {
  name?: string;
  description?: string;
  isFavorite?: boolean;
}

export interface CreateBoardColumn {
  name: string;
  description?: string;
  order: number;
  color: string;
  icon?: string;
  mappedStatus: TaskStatusType;
  taskLimit?: number;
  isCollapsible?: boolean;
  isDoneColumn?: boolean;
}

export interface UpdateBoardColumn {
  name?: string;
  description?: string;
  order?: number;
  color?: string;
  icon?: string;
  mappedStatus?: TaskStatusType;
  taskLimit?: number;
  isCollapsible?: boolean;
  isDoneColumn?: boolean;
  isVisible?: boolean;
}

export interface UpdateBoardSettings {
  theme?: string;
  backgroundColor?: string;
  headerColor?: string;
  enableWipLimits?: boolean;
  enableColumnCollapse?: boolean;
  enableTaskCounting?: boolean;
  enableDueDateWarnings?: boolean;
  enablePriorityColors?: boolean;
  autoMoveCompletedTasks?: boolean;
  showColumnIcons?: boolean;
  showTaskLabels?: boolean;
  showTaskAssignees?: boolean;
  showTaskDueDates?: boolean;
  showTaskPriorities?: boolean;
  defaultTaskPriority?: number;
  defaultColumnColor?: string;
  maxTasksPerColumn?: number;
  enableRealTimeUpdates?: boolean;
  enableNotifications?: boolean;
  enableKeyboardShortcuts?: boolean;
  enableDragAndDrop?: boolean;
  enableColumnReordering?: boolean;
  enableTaskFiltering?: boolean;
  enableSearchFunction?: boolean;
  enableBulkOperations?: boolean;
  enableTimeTracking?: boolean;
  enableProgressTracking?: boolean;
}

export interface CreateBoardTemplate {
  name: string;
  description?: string;
  isPublic?: boolean;
  category?: string;
  tags?: string;
  layoutConfiguration?: string;
  previewImageUrl?: string;
  defaultColumns?: CreateBoardTemplateColumn[];
}

export interface CreateBoardTemplateColumn {
  name: string;
  description?: string;
  order: number;
  color: string;
  icon?: string;
  mappedStatus: TaskStatusType;
  taskLimit?: number;
  isCollapsible?: boolean;
  isDoneColumn?: boolean;
}

export interface TaskReorder {
  taskId: number;
  sourceColumnId: number;
  destinationColumnId: number;
  sourceIndex: number;
  destinationIndex: number;
  positionX?: number;
  positionY?: number;
  boardOrder?: number;
}

export interface ColumnOrder {
  columnId: number;
  order: number;
}

export interface BoardFilter {
  assignee?: string;
  priority?: string;
  dueDate?: string;
  tags?: string[];
  search?: string;
  status?: TaskStatusType[];
}

export interface CreateBoardFromTemplateDTO {
  boardName: string;
  boardDescription?: string;
}

export interface UpdateBoardSettingsDTO {
  theme?: string;
  backgroundColor?: string;
  headerColor?: string;
  enableWipLimits?: boolean;
  enableColumnCollapse?: boolean;
  enableTaskCounting?: boolean;
  enableDueDateWarnings?: boolean;
  enablePriorityColors?: boolean;
  autoMoveCompletedTasks?: boolean;
  showColumnIcons?: boolean;
  showTaskLabels?: boolean;
  showTaskAssignees?: boolean;
  showTaskDueDates?: boolean;
  showTaskPriorities?: boolean;
  defaultTaskPriority?: number;
  defaultColumnColor?: string;
  maxTasksPerColumn?: number;
  enableRealTimeUpdates?: boolean;
  enableNotifications?: boolean;
  enableKeyboardShortcuts?: boolean;
  enableDragAndDrop?: boolean;
  enableColumnReordering?: boolean;
  enableTaskFiltering?: boolean;
  enableSearchFunction?: boolean;
  enableBulkOperations?: boolean;
  enableTimeTracking?: boolean;
  enableProgressTracking?: boolean;
}

// ==================== ANALYTICS & STATISTICS ====================

export interface ColumnStatistics {
  columnId: number;
  columnName: string;
  totalTasks: number;
  completedTasks: number;
  averageTimeInColumn: number;
  wipLimitUtilization: number;
  throughput: number;
}

export interface WipLimitStatus {
  columnId: number;
  columnName: string;
  currentTaskCount: number;
  wipLimit?: number;
  isAtLimit: boolean;
  isOverLimit: boolean;
  utilizationPercentage: number;
}

export interface BoardAnalytics {
  boardId: number;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  completionRate: number;
  averageCycleTime: number;
  columnStatistics: ColumnStatistics[];
  wipLimitStatuses: WipLimitStatus[];
  throughputData: ThroughputData[];
}

export interface ThroughputData {
  date: string;
  tasksCompleted: number;
  tasksStarted: number;
}

// ==================== MARKETPLACE TYPES ====================

export interface TemplateMarketplaceFilter {
  category?: string;
  tags?: string[];
  minRating?: number;
  isDefault?: boolean;
  searchTerm?: string;
}

export interface TemplateStatistics {
  templateId: number;
  usageCount: number;
  averageRating: number;
  ratingCount: number;
  popularityRank: number;
}

export interface TemplateMarketplaceAnalytics {
  totalTemplates: number;
  totalDownloads: number;
  averageRating: number;
  mostPopularCategory: string;
  topTemplates: BoardTemplate[];
  categoryStatistics: CategoryStatistics[];
}

export interface CategoryStatistics {
  category: string;
  templateCount: number;
  totalUsage: number;
  averageRating: number;
}

// ==================== UI STATE TYPES ====================

export interface BoardViewState {
  selectedBoardId?: number;
  activeColumnId?: number;
  selectedTaskIds: number[];
  filterBy: TaskFilter;
  sortBy: TaskSort;
  searchQuery: string;
  showSettings: boolean;
  showTemplateSelector: boolean;
  showAnalytics: boolean;
  showCollaboration: boolean;
  isLoading: boolean;
  error?: string;
}

export interface TaskFilter {
  status?: TaskStatusType[];
  priority?: number;
  assignee?: string;
  dueDate?: {
    from?: string;
    to?: string;
  };
  tags?: string[];
  category?: string;
}

export interface TaskSort {
  field: 'dueDate' | 'priority' | 'createdAt' | 'title' | 'status';
  direction: 'asc' | 'desc';
}

// ==================== DRAG AND DROP TYPES ====================

export interface DragEndResult {
  taskId: number;
  sourceColumnId: number;
  destinationColumnId: number;
  sourceIndex: number;
  destinationIndex: number;
}

export interface ColumnReorderResult {
  columnId: number;
  newOrder: number;
  oldOrder: number;
}

// ==================== VALIDATION TYPES ====================

export interface BoardValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
}

// ==================== EXPORT TYPES ====================

export interface BoardExportData {
  board: Board;
  settings: BoardSettings;
  columns: BoardColumn[];
  tasks: Task[];
  exportedAt: string;
  version: string;
}

export interface BoardImportResult {
  success: boolean;
  boardId?: number;
  errors: string[];
  warnings: string[];
}

// ==================== REAL-TIME TYPES ====================

export interface BoardUpdate {
  type: 'TASK_MOVED' | 'TASK_CREATED' | 'TASK_UPDATED' | 'TASK_DELETED' | 'COLUMN_UPDATED' | 'SETTINGS_UPDATED';
  boardId: number;
  data: any;
  timestamp: string;
  userId: number;
}

export interface BoardSubscription {
  boardId: number;
  userId: number;
  connectionId: string;
  subscribedAt: string;
}

// ==================== ENUM TYPES ====================

export enum BoardTheme {
  DEFAULT = 'default',
  DARK = 'dark',
  LIGHT = 'light',
  MINIMAL = 'minimal',
  PROFESSIONAL = 'professional',
  CREATIVE = 'creative',
  DEVELOPER = 'developer'
}

export enum ColumnIcon {
  CLIPBOARD = 'clipboard',
  PLAY = 'play',
  CHECK = 'check',
  CODE = 'code',
  BUG = 'bug',
  LIGHTBULB = 'lightbulb',
  SEARCH = 'search',
  EDIT = 'edit',
  EYE = 'eye',
  UPLOAD = 'upload',
  CALENDAR = 'calendar',
  CLOCK = 'clock',
  ROCKET = 'rocket',
  CHART = 'chart',
  WRENCH = 'wrench',
  SHIELD = 'shield',
  TROPHY = 'trophy',
  SETTINGS = 'settings',
  MAIL = 'mail',
  GLOBE = 'globe'
}

export enum BoardEvent {
  BOARD_CREATED = 'board_created',
  BOARD_UPDATED = 'board_updated',
  BOARD_DELETED = 'board_deleted',
  COLUMN_CREATED = 'column_created',
  COLUMN_UPDATED = 'column_updated',
  COLUMN_DELETED = 'column_deleted',
  TASK_MOVED = 'task_moved',
  SETTINGS_UPDATED = 'settings_updated',
  TEMPLATE_APPLIED = 'template_applied'
}

// Board-level custom status management
export interface BoardCustomStatus {
  id: string;
  boardId: number;
  statusConfig: CustomTaskStatus;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateBoardCustomStatus {
  boardId: number;
  name: string;
  displayName: string;
  description?: string;
  color: string;
  icon?: string;
  category: 'pending' | 'active' | 'completed' | 'blocked' | 'custom';
  order?: number;
}

export interface UpdateBoardCustomStatus {
  displayName?: string;
  description?: string;
  color?: string;
  icon?: string;
  category?: 'pending' | 'active' | 'completed' | 'blocked' | 'custom';
  order?: number;
  isActive?: boolean;
}

// Board status workflow configuration
export interface BoardStatusWorkflow {
  id: number;
  boardId: number;
  name: string;
  description?: string;
  workflowType: 'linear' | 'flexible' | 'custom';
  statuses: BoardCustomStatus[];
  transitionRules?: StatusTransitionRule[];
  isDefault: boolean;
  createdAt: string;
  updatedAt?: string;
}

// Status transition rule for board workflows
export interface StatusTransitionRule {
  id: string;
  fromStatusId: string;
  toStatusId: string;
  isAllowed: boolean;
  requiresPermission?: string;
  autoTransitionConditions?: string[];
  workflowId?: number;
}

// Workflow template for easy setup
export interface StatusWorkflowTemplate {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: string;
  statuses: Omit<CustomTaskStatus, 'id' | 'createdAt' | 'updatedAt'>[];
  transitionRules?: Omit<StatusTransitionRule, 'id' | 'workflowId'>[];
  isPopular: boolean;
  usageCount: number;
} 