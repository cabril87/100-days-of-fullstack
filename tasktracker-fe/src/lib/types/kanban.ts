/**
 * Kanban Board Implementation Types
 * Clean, focused types for the new Kanban board implementation
 */

import { Task, TaskStatusType } from './task';
import { Board, BoardColumn, BoardSettings, WipLimitStatus } from './board';
import { UserProgress, Achievement, UserBadge, GamificationStats } from './gamification';

// ==================== CORE KANBAN TYPES ====================

export interface KanbanBoardProps {
  boardId?: number;
  className?: string;
  showGamification?: boolean;
  enableRealtime?: boolean;
}

export interface KanbanColumnProps {
  column: BoardColumn;
  tasks: Task[];
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: number) => void;
  onTaskMove: (taskId: number, newColumnId: number) => void;
  boardSettings?: BoardSettings;
  wipStatus?: WipLimitStatus;
  showGamification?: boolean;
}

export interface KanbanTaskCardProps {
  task: Task;
  isDragging?: boolean;
  isSelected?: boolean;
  onEdit: (task: Task) => void;
  onDelete: (taskId: number) => void;
  onSelect?: (taskId: number) => void;
  boardSettings?: BoardSettings;
  showGamification?: boolean;
}

// ==================== DRAG AND DROP TYPES ====================

export interface DragDropResult {
  taskId: number;
  sourceColumnId: number;
  destinationColumnId: number;
  sourceIndex: number;
  destinationIndex: number;
}

export interface ColumnDropResult {
  columnId: number;
  newPosition: number;
  oldPosition: number;
}

export interface DragState {
  isDragging: boolean;
  draggedTask: Task | null;
  sourceColumn: BoardColumn | null;
  hoveredColumn: BoardColumn | null;
}

// ==================== BOARD STATE TYPES ====================

export interface KanbanBoardState {
  // Core data
  currentBoard: Board | null;
  columns: BoardColumn[];
  tasksByColumn: Record<number, Task[]>;
  settings: BoardSettings | null;
  
  // UI state
  isLoading: boolean;
  isCreatingTask: boolean;
  isCreatingColumn: boolean;
  selectedTaskIds: number[];
  
  // Modal states
  showTaskModal: boolean;
  showColumnModal: boolean;
  showSettingsModal: boolean;
  editingTask: Task | null;
  editingColumn: BoardColumn | null;
  activeColumnForNewTask: BoardColumn | null;
  
  // Drag state
  dragState: DragState;
  
  // Error state
  error: string | null;
  
  // Gamification state
  userProgress: UserProgress | null;
  recentAchievements: Achievement[];
  gamificationStats: GamificationStats | null;
  
  // Filter and sort state
  filter: KanbanFilter;
  sort: KanbanSort;
}

export type KanbanBoardAction =
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_BOARD'; board: Board }
  | { type: 'SET_COLUMNS'; columns: BoardColumn[] }
  | { type: 'SET_TASKS_BY_COLUMN'; tasksByColumn: Record<number, Task[]> }
  | { type: 'SET_SETTINGS'; settings: BoardSettings }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'SET_SELECTED_TASKS'; taskIds: number[] }
  | { type: 'SET_TASK_MODAL'; show: boolean; task?: Task | null }
  | { type: 'SET_COLUMN_MODAL'; show: boolean; column?: BoardColumn | null }
  | { type: 'SET_SETTINGS_MODAL'; show: boolean }
  | { type: 'SET_ACTIVE_COLUMN_FOR_NEW_TASK'; column: BoardColumn | null }
  | { type: 'SET_DRAG_STATE'; dragState: Partial<DragState> }
  | { type: 'ADD_TASK'; columnId: number; task: Task }
  | { type: 'UPDATE_TASK'; task: Task }
  | { type: 'DELETE_TASK'; taskId: number }
  | { type: 'MOVE_TASK'; result: DragDropResult }
  | { type: 'ADD_COLUMN'; column: BoardColumn }
  | { type: 'UPDATE_COLUMN'; column: BoardColumn }
  | { type: 'DELETE_COLUMN'; columnId: number }
  | { type: 'REORDER_COLUMNS'; columns: BoardColumn[] }
  | { type: 'SET_GAMIFICATION_DATA'; data: { 
      userProgress?: UserProgress; 
      stats?: GamificationStats; 
      achievements?: Achievement[] 
    } }
  | { type: 'SET_FILTER'; filter: KanbanFilter }
  | { type: 'SET_SORT'; sort: KanbanSort };

// ==================== GAMIFICATION INTEGRATION TYPES ====================

export interface KanbanGamificationProps {
  userProgress: UserProgress;
  recentAchievements: Achievement[];
  stats: GamificationStats | null;
  className?: string;
}

export interface TaskCompletionReward {
  pointsEarned: number;
  achievementsUnlocked: Achievement[];
  badgesEarned: UserBadge[];
  streakBonus?: number;
  levelUp?: {
    oldLevel: number;
    newLevel: number;
    bonusPoints: number;
  };
}

export interface ColumnGamificationData {
  columnId: number;
  tasksCompleted: number;
  pointsFromColumn: number;
  efficiency: number;
  wipUtilization: number;
}

// ==================== MODAL AND FORM TYPES ====================

export interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
  columnId?: number;
  onSave: (taskData: TaskFormData) => Promise<void>;
  onDelete?: (taskId: number) => Promise<void>;
}

export interface ColumnModalProps {
  isOpen: boolean;
  onClose: () => void;
  column?: BoardColumn | null;
  boardId: number;
  onSave: (columnData: ColumnFormData) => Promise<void>;
  onDelete?: (columnId: number) => Promise<void>;
}

export interface TaskFormData {
  title: string;
  description?: string;
  status: TaskStatusType;
  priority: string;
  dueDate?: string;
  assignedTo?: string;
  categoryId?: number;
}

export interface ColumnFormData {
  name: string;
  description?: string;
  color: string;
  icon?: string;
  mappedStatus: TaskStatusType;
  taskLimit?: number;
  isCollapsible: boolean;
  isDoneColumn: boolean;
}

// ==================== FILTER AND SEARCH TYPES ====================

export interface KanbanFilter {
  status?: TaskStatusType[];
  priority?: string[];
  assignee?: string[];
  dueDate?: {
    from?: string;
    to?: string;
  };
  tags?: string[];
  searchQuery?: string;
}

export interface KanbanSort {
  field: 'dueDate' | 'priority' | 'createdAt' | 'title';
  direction: 'asc' | 'desc';
}

// ==================== PERFORMANCE AND ANALYTICS TYPES ====================

export interface KanbanMetrics {
  totalTasks: number;
  completedTasks: number;
  averageTasksPerColumn: number;
  wipUtilization: Record<number, number>;
  cycleTime: number;
  throughput: number;
  blockedTasks: number;
  overdueTasksCount: number;
}

export interface ColumnPerformance {
  columnId: number;
  columnName: string;
  taskCount: number;
  averageTimeInColumn: number;
  throughput: number;
  wipUtilization: number;
  blockedTasks: number;
}

// ==================== REAL-TIME UPDATE TYPES ====================

export interface BoardUpdateEvent {
  type: 'TASK_ADDED' | 'TASK_UPDATED' | 'TASK_DELETED' | 'TASK_MOVED' | 
        'COLUMN_ADDED' | 'COLUMN_UPDATED' | 'COLUMN_DELETED' | 'COLUMN_REORDERED' |
        'SETTINGS_UPDATED' | 'USER_JOINED' | 'USER_LEFT';
  boardId: number;
  userId: number;
  timestamp: string;
  data: unknown;
}

export interface BoardSubscription {
  boardId: number;
  userId: number;
  connectionId: string;
  isActive: boolean;
}

// ==================== UTILITY TYPES ====================

export interface BoardValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface TaskValidation {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface ColumnValidation {
  isValid: boolean;
  errors: Record<string, string>;
}

// ==================== EXPORT TYPES ====================

export interface KanbanExportData {
  board: Board;
  columns: BoardColumn[];
  tasks: Task[];
  settings: BoardSettings;
  exportedAt: string;
  version: string;
} 