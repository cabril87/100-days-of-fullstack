/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 *
 * This file may not be used, copied, modified, or distributed except in
 * accordance with the terms contained in the LICENSE file.
 */

import { TaskItemStatus } from './task';
import { TaskItemResponseDTO } from './task';

/**
 * Board types matching backend DTOs exactly
 */

export interface BoardDTO {
  id: number;
  name: string;
  description?: string;
  userId: number;
  columns: BoardColumnDTO[];
  createdAt: string;
  updatedAt?: string;
  taskCount: number;
  isTemplate?: boolean; // Whether this board was created from a template
  templateId?: string; // ID of the original template if created from template
  templateCategory?: string; // Category of the template used
  isCustom?: boolean; // Whether this is a custom user-created board
}

export interface BoardColumnDTO {
  id: number;
  name: string;
  order: number;
  color?: string;
  status: TaskItemStatus;
  alias?: string; // Custom display name for the status
  description?: string; // Tooltip description
  isCore?: boolean; // Whether this is a core column (NotStarted, Pending, Completed)
}

export interface BoardDetailDTO {
  board: BoardDTO;
  tasksByColumn: Record<string, TaskItemResponseDTO[]>;
  tasks: TaskItemResponseDTO[];
  taskCount: number;
}

export interface CreateBoardDTO {
  Name: string;
  Description?: string;
  Columns?: BoardColumnCreateDTO[];
}

export interface BoardColumnCreateDTO {
  Name: string;
  Order: number;
  Color?: string;
  Status: TaskItemStatus;
  Alias?: string; // Custom display name for the status
  Description?: string; // Tooltip description
  IsCore?: boolean; // Whether this is a core column
}

export interface UpdateBoardDTO {
  name?: string;
  description?: string;
  columns?: BoardColumnUpdateDTO[];
}

export interface BoardColumnUpdateDTO {
  id?: number;
  name?: string;
  order?: number;
  color?: string;
  status?: TaskItemStatus;
  alias?: string;
  description?: string;
  isCore?: boolean;
}

export interface TaskReorderDTO {
  taskId: number;
  newStatus: TaskItemStatus;
  newOrder: number;
  boardId: number;
}

/**
 * Enhanced UI-specific types for enterprise drag and drop
 */

export interface DragEndEvent {
  active: {
    id: string;
    data: {
      current?: {
        taskId: number;
        columnId: number;
        status: TaskItemStatus;
        type: 'task';
      };
    };
  };
  over: {
    id: string;
    data: {
      current?: {
        columnId: number;
        status: TaskItemStatus;
        type: 'column' | 'task';
        accepts?: TaskItemStatus[];
      };
    };
  } | null;
}

export interface DroppableColumnData {
  columnId: number;
  status: TaskItemStatus;
  type: 'column';
  accepts?: TaskItemStatus[];
  maxTasks?: number;
  currentTaskCount?: number;
}

export interface DraggableTaskData {
  taskId: number;
  columnId: number;
  status: TaskItemStatus;
  type: 'task';
  priority?: string;
  isBlocked?: boolean;
}

/**
 * Gamification and Animation Types
 */

export interface DragAnimationConfig {
  duration: number;
  easing: string;
  scale: number;
  rotation: number;
  opacity: number;
}

export interface ColumnGamificationStyle {
  gradient: string;
  hoverGradient: string;
  borderGradient: string;
  shadowColor: string;
  glowColor: string;
  iconColor: string;
  textColor: string;
  badgeColor: string;
}

export interface TaskCardGamificationStyle {
  baseGradient: string;
  hoverGradient: string;
  dragGradient: string;
  borderColor: string;
  shadowColor: string;
  priorityColors: Record<string, string>;
  statusIndicator: string;
}

/**
 * Drag and Drop State Management
 */

export interface DragState {
  isDragging: boolean;
  draggedTask: TaskItemResponseDTO | null;
  draggedFrom: BoardColumnDTO | null;
  draggedOver: BoardColumnDTO | null;
  canDrop: boolean;
  dropPreview: boolean;
  animationState: 'idle' | 'dragging' | 'dropping' | 'success' | 'error';
}

export interface DropValidation {
  isValid: boolean;
  reason?: string;
  suggestions?: string[];
  alternativeColumns?: BoardColumnDTO[];
}

/**
 * Enhanced Component Props with Gamification
 */

export interface BoardPageProps {
  params: Promise<{
    id: string;
  }>;
}

export interface KanbanBoardProps {
  boardId: number;
  className?: string;
  enableAnimations?: boolean;
  enableGamification?: boolean;
  enableSoundEffects?: boolean;
  theme?: 'default' | 'neon' | 'glass' | 'gradient';
}

export interface BoardColumnProps {
  column: BoardColumnDTO;
  tasks: TaskItemResponseDTO[];
  onCreateTask: () => void;
  className?: string;
  dragState?: DragState;
  gamificationStyle?: ColumnGamificationStyle;
  enableDropPreview?: boolean;
  maxTasks?: number;
  isHighlighted?: boolean;
  animationConfig?: DragAnimationConfig;
}

export interface TaskCardProps {
  task: TaskItemResponseDTO;
  columnColor?: string;
  isDragging?: boolean;
  className?: string;
  onEdit?: (task: TaskItemResponseDTO) => void;
  onDelete?: (task: TaskItemResponseDTO) => void;
  onView?: (task: TaskItemResponseDTO) => void;
  gamificationStyle?: TaskCardGamificationStyle;
  dragState?: DragState;
  enableAnimations?: boolean;
  showPriorityGlow?: boolean;
  showStatusIndicator?: boolean;
  // Batch selection props
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onSelect?: (selected: boolean) => void;
}

export interface CreateTaskModalProps {
  open: boolean;
  onClose: () => void;
  onTaskCreated: () => void;
  defaultStatus?: TaskItemStatus;
  boardId?: number;
  suggestedColumn?: BoardColumnDTO;
}

export interface EditBoardModalProps {
  open: boolean;
  onClose: () => void;
  onBoardUpdated: () => void;
  onBoardDeleted?: () => void;
  board: BoardDTO;
}

export interface CreateBoardModalProps {
  open: boolean;
  onClose: () => void;
  onBoardCreated: () => void;
}

/**
 * Drag and Drop Service Types
 */

export interface DragDropService {
  validateDrop: (task: TaskItemResponseDTO, targetColumn: BoardColumnDTO) => DropValidation;
  executeMove: (taskId: number, fromColumn: BoardColumnDTO, toColumn: BoardColumnDTO) => Promise<boolean>;
  getDropAnimation: (fromColumn: BoardColumnDTO, toColumn: BoardColumnDTO) => DragAnimationConfig;
  playMoveSound: (success: boolean) => void;
  showMoveNotification: (task: TaskItemResponseDTO, fromColumn: BoardColumnDTO, toColumn: BoardColumnDTO) => void;
}

/**
 * Template and Column Configuration
 */

export interface ColumnConfiguration {
  allowedTransitions: TaskItemStatus[];
  maxTasks?: number;
  autoAssign?: boolean;
  requiresApproval?: boolean;
  notificationSettings?: {
    onTaskEnter?: boolean;
    onTaskExit?: boolean;
    onOverflow?: boolean;
  };
}

export interface BoardTemplate {
  name: string;
  description: string;
  columns: BoardColumnCreateDTO[];
  category: 'basic' | 'family' | 'education' | 'health' | 'events' | 'financial' | 'seasonal';
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedSetupTime: number; // in minutes
  recommendedFor: string[];
  columnConfigurations?: Record<string, ColumnConfiguration>;
  statusMapping?: StatusMappingConfig; // Custom status aliases for this template
}

/**
 * Enterprise Status Mapping System
 */

export interface StatusMappingConfig {
  notStartedAlias: string; // e.g., "Meal Ideas", "To Do", "Backlog"
  pendingAlias: string; // e.g., "In Progress", "Cooking", "Active"
  completedAlias: string; // e.g., "Served", "Done", "Completed"
  descriptions: {
    notStarted: string; // Tooltip for first column
    pending: string; // Tooltip for middle columns
    completed: string; // Tooltip for last column
  };
}

export interface CoreStatusValidation {
  hasNotStarted: boolean;
  hasPending: boolean;
  hasCompleted: boolean;
  missingStatuses: TaskItemStatus[];
  suggestions: string[];
}

export interface StatusMappingUtilities {
  validateCoreStatuses: (columns: BoardColumnDTO[]) => CoreStatusValidation;
  mapColumnToStatus: (column: BoardColumnDTO) => TaskItemStatus;
  getStatusAlias: (status: TaskItemStatus, mapping?: StatusMappingConfig) => string;
  getStatusDescription: (status: TaskItemStatus, mapping?: StatusMappingConfig) => string;
  ensureCoreColumns: (columns: BoardColumnCreateDTO[]) => BoardColumnCreateDTO[];
  generateStatusGuidance: (currentColumns: BoardColumnDTO[]) => string[];
}

/**
 * Default board columns for new boards - ENTERPRISE STATUS MAPPING
 * ✅ STANDARD: NotStarted → Pending → Completed
 */
export const DEFAULT_BOARD_COLUMNS: BoardColumnCreateDTO[] = [
  {
    Name: 'To Do',
    Order: 0,
    Color: '#EF4444',
    Status: TaskItemStatus.NotStarted,
    Alias: 'To Do',
    Description: 'Tasks that haven\'t been started yet',
    IsCore: true
  },
  {
    Name: 'In Progress',
    Order: 1,
    Color: '#F59E0B',
    Status: TaskItemStatus.Pending,
    Alias: 'In Progress',
    Description: 'Tasks currently being worked on',
    IsCore: false
  },
  {
    Name: 'Review',
    Order: 2,
    Color: '#3B82F6',
    Status: TaskItemStatus.Pending,
    Alias: 'Review',
    Description: 'Tasks waiting for review or approval',
    IsCore: false
  },
  {
    Name: 'Done',
    Order: 3,
    Color: '#10B981',
    Status: TaskItemStatus.Completed,
    Alias: 'Done',
    Description: 'Tasks that have been finished',
    IsCore: true
  }
];

/**
 * Gamification Style Presets
 */
export const COLUMN_STYLE_PRESETS: Record<string, ColumnGamificationStyle> = {
  default: {
    gradient: 'from-slate-50 to-slate-100',
    hoverGradient: 'from-slate-100 to-slate-200',
    borderGradient: 'from-slate-200 to-slate-300',
    shadowColor: 'shadow-slate-200/50',
    glowColor: 'shadow-slate-400/30',
    iconColor: 'text-slate-600',
    textColor: 'text-slate-900',
    badgeColor: 'bg-slate-100'
  },
  neon: {
    gradient: 'from-purple-900/20 to-pink-900/20',
    hoverGradient: 'from-purple-800/30 to-pink-800/30',
    borderGradient: 'from-purple-500 to-pink-500',
    shadowColor: 'shadow-purple-500/25',
    glowColor: 'shadow-purple-400/50',
    iconColor: 'text-purple-400',
    textColor: 'text-purple-100',
    badgeColor: 'bg-purple-500/20'
  },
  glass: {
    gradient: 'from-white/10 to-white/5',
    hoverGradient: 'from-white/20 to-white/10',
    borderGradient: 'from-white/30 to-white/10',
    shadowColor: 'shadow-black/10',
    glowColor: 'shadow-white/20',
    iconColor: 'text-white/80',
    textColor: 'text-white/90',
    badgeColor: 'bg-white/10'
  },
  gradient: {
    gradient: 'from-emerald-50 to-teal-50',
    hoverGradient: 'from-emerald-100 to-teal-100',
    borderGradient: 'from-emerald-300 to-teal-300',
    shadowColor: 'shadow-emerald-200/50',
    glowColor: 'shadow-emerald-400/30',
    iconColor: 'text-emerald-600',
    textColor: 'text-emerald-900',
    badgeColor: 'bg-emerald-100'
  }
};

export const TASK_STYLE_PRESETS: Record<string, TaskCardGamificationStyle> = {
  default: {
    baseGradient: 'from-white to-slate-50',
    hoverGradient: 'from-slate-50 to-slate-100',
    dragGradient: 'from-blue-50 to-indigo-50',
    borderColor: 'border-slate-200',
    shadowColor: 'shadow-slate-200/50',
    priorityColors: {
      Low: 'text-green-600',
      Medium: 'text-yellow-600',
      High: 'text-orange-600',
      Urgent: 'text-red-600'
    },
    statusIndicator: 'bg-slate-400'
  },
  neon: {
    baseGradient: 'from-slate-900 to-slate-800',
    hoverGradient: 'from-slate-800 to-slate-700',
    dragGradient: 'from-purple-900 to-pink-900',
    borderColor: 'border-purple-500/50',
    shadowColor: 'shadow-purple-500/25',
    priorityColors: {
      Low: 'text-green-400',
      Medium: 'text-yellow-400',
      High: 'text-orange-400',
      Urgent: 'text-red-400'
    },
    statusIndicator: 'bg-purple-500'
  },
  glass: {
    baseGradient: 'from-white/10 to-white/5',
    hoverGradient: 'from-white/20 to-white/10',
    dragGradient: 'from-blue-500/20 to-indigo-500/20',
    borderColor: 'border-white/20',
    shadowColor: 'shadow-black/10',
    priorityColors: {
      Low: 'text-green-300',
      Medium: 'text-yellow-300',
      High: 'text-orange-300',
      Urgent: 'text-red-300'
    },
    statusIndicator: 'bg-white/30'
  },
  gradient: {
    baseGradient: 'from-emerald-50 to-teal-50',
    hoverGradient: 'from-emerald-100 to-teal-100',
    dragGradient: 'from-emerald-200 to-teal-200',
    borderColor: 'border-emerald-200',
    shadowColor: 'shadow-emerald-200/50',
    priorityColors: {
      Low: 'text-emerald-600',
      Medium: 'text-teal-600',
      High: 'text-orange-600',
      Urgent: 'text-red-600'
    },
    statusIndicator: 'bg-emerald-500'
  }
};

/**
 * Board templates for quick setup with enhanced metadata
 */
export const BOARD_TEMPLATES: BoardTemplate[] = [
  // 1. Basic Templates
  {
    name: 'Basic Kanban',
    description: 'Simple 3-column board for basic task management',
    category: 'basic',
    tags: ['simple', 'beginner', 'kanban'],
    difficulty: 'beginner',
    estimatedSetupTime: 2,
    recommendedFor: ['individuals', 'small teams', 'beginners'],
    columns: [
      { Name: 'To Do', Order: 0, Color: '#6B7280', Status: TaskItemStatus.NotStarted, Alias: 'To Do', Description: 'Tasks that haven\'t been started yet', IsCore: true },
      { Name: 'In Progress', Order: 1, Color: '#3B82F6', Status: TaskItemStatus.Pending, Alias: 'In Progress', Description: 'Tasks currently being worked on', IsCore: true },
      { Name: 'Done', Order: 2, Color: '#10B981', Status: TaskItemStatus.Completed, Alias: 'Done', Description: 'Tasks that have been finished', IsCore: true }
    ],
    statusMapping: {
      notStartedAlias: 'To Do',
      pendingAlias: 'In Progress',
      completedAlias: 'Done',
      descriptions: {
        notStarted: 'Tasks that haven\'t been started yet',
        pending: 'Tasks currently being worked on',
        completed: 'Tasks that have been finished'
      }
    }
  },
  {
    name: 'Simple To-Do',
    description: 'Basic task tracking with minimal columns',
    category: 'basic',
    tags: ['minimal', 'simple', 'todo'],
    difficulty: 'beginner',
    estimatedSetupTime: 1,
    recommendedFor: ['individuals', 'personal use'],
    columns: [
      { Name: 'Tasks', Order: 0, Color: '#8B5CF6', Status: TaskItemStatus.NotStarted, Alias: 'To Do', Description: 'Tasks that haven\'t been started yet', IsCore: true },
      { Name: 'In Progress', Order: 1, Color: '#3B82F6', Status: TaskItemStatus.InProgress, Alias: 'Doing', Description: 'Tasks currently being worked on', IsCore: false },
      { Name: 'Completed', Order: 2, Color: '#10B981', Status: TaskItemStatus.Completed, Alias: 'Done', Description: 'Tasks that have been finished', IsCore: true }
    ],
    statusMapping: {
      notStartedAlias: 'To Do',
      pendingAlias: 'Doing',
      completedAlias: 'Done',
      descriptions: {
        notStarted: 'Tasks that haven\'t been started yet',
        pending: 'Tasks currently being worked on',
        completed: 'Tasks that have been finished'
      }
    }
  },
  {
    name: 'Software Development',
    description: 'Agile development board with bug tracking and code review columns',
    category: 'basic',
    tags: ['agile', 'development', 'software', 'scrum'],
    difficulty: 'intermediate',
    estimatedSetupTime: 8,
    recommendedFor: ['developers', 'software teams', 'agile workflows'],
    columns: [
      { Name: 'Backlog', Order: 0, Color: '#6B7280', Status: TaskItemStatus.NotStarted, Alias: 'Backlog', Description: 'Feature requests and bug reports', IsCore: true },
      { Name: 'In Development', Order: 1, Color: '#F59E0B', Status: TaskItemStatus.InProgress, Alias: 'Development', Description: 'Features being coded', IsCore: false },
      { Name: 'Code Review', Order: 2, Color: '#8B5CF6', Status: TaskItemStatus.Pending, Alias: 'Review', Description: 'Code awaiting review', IsCore: false },
      { Name: 'Testing', Order: 3, Color: '#EF4444', Status: TaskItemStatus.Pending, Alias: 'Testing', Description: 'Features being tested', IsCore: false },
      { Name: 'Deployment', Order: 4, Color: '#06B6D4', Status: TaskItemStatus.Pending, Alias: 'Deploy', Description: 'Ready for deployment', IsCore: false },
      { Name: 'Done', Order: 5, Color: '#10B981', Status: TaskItemStatus.Completed, Alias: 'Done', Description: 'Completed and deployed', IsCore: true }
    ],
    statusMapping: {
      notStartedAlias: 'Backlog',
      pendingAlias: 'Development',
      completedAlias: 'Done',
      descriptions: {
        notStarted: 'Feature requests and bug reports',
        pending: 'Features being developed, reviewed, tested, or deployed',
        completed: 'Completed and deployed features'
      }
    }
  },
  {
    name: 'Content Creation',
    description: 'Board designed for content creators with ideation, writing, and publishing phases',
    category: 'basic',
    tags: ['content', 'writing', 'marketing', 'creative'],
    difficulty: 'intermediate',
    estimatedSetupTime: 6,
    recommendedFor: ['content creators', 'writers', 'marketers'],
    columns: [
      { Name: 'Ideas', Order: 0, Color: '#F59E0B', Status: TaskItemStatus.NotStarted, Alias: 'Ideas', Description: 'Content ideas and concepts', IsCore: true },
      { Name: 'Research', Order: 1, Color: '#3B82F6', Status: TaskItemStatus.InProgress, Alias: 'Research', Description: 'Researching and gathering information', IsCore: false },
      { Name: 'Writing', Order: 2, Color: '#8B5CF6', Status: TaskItemStatus.InProgress, Alias: 'Writing', Description: 'Content being written', IsCore: false },
      { Name: 'Review', Order: 3, Color: '#EF4444', Status: TaskItemStatus.Pending, Alias: 'Review', Description: 'Content awaiting review', IsCore: false },
      { Name: 'Published', Order: 4, Color: '#10B981', Status: TaskItemStatus.Completed, Alias: 'Published', Description: 'Published content', IsCore: true }
    ],
    statusMapping: {
      notStartedAlias: 'Ideas',
      pendingAlias: 'Writing',
      completedAlias: 'Published',
      descriptions: {
        notStarted: 'Content ideas and concepts',
        pending: 'Content being researched, written, or reviewed',
        completed: 'Published content'
      }
    }
  },
  {
    name: 'Project Management',
    description: 'Comprehensive project management board with detailed workflow stages',
    category: 'basic',
    tags: ['project', 'management', 'business', 'workflow'],
    difficulty: 'advanced',
    estimatedSetupTime: 10,
    recommendedFor: ['project managers', 'business teams', 'complex workflows'],
    columns: [
      { Name: 'Planning', Order: 0, Color: '#6B7280', Status: TaskItemStatus.NotStarted, Alias: 'Planning', Description: 'Project planning and requirements', IsCore: true },
      { Name: 'In Progress', Order: 1, Color: '#3B82F6', Status: TaskItemStatus.InProgress, Alias: 'In Progress', Description: 'Tasks currently being worked on', IsCore: false },
      { Name: 'Review', Order: 2, Color: '#F59E0B', Status: TaskItemStatus.Pending, Alias: 'Review', Description: 'Tasks awaiting review', IsCore: false },
      { Name: 'Testing', Order: 3, Color: '#8B5CF6', Status: TaskItemStatus.Pending, Alias: 'Testing', Description: 'Tasks being tested', IsCore: false },
      { Name: 'Approved', Order: 4, Color: '#06B6D4', Status: TaskItemStatus.Pending, Alias: 'Approved', Description: 'Tasks approved for completion', IsCore: false },
      { Name: 'Completed', Order: 5, Color: '#10B981', Status: TaskItemStatus.Completed, Alias: 'Completed', Description: 'Completed project tasks', IsCore: true }
    ],
    statusMapping: {
      notStartedAlias: 'Planning',
      pendingAlias: 'In Progress',
      completedAlias: 'Completed',
      descriptions: {
        notStarted: 'Project planning and requirements',
        pending: 'Tasks being worked on, reviewed, tested, or approved',
        completed: 'Completed project tasks'
      }
    }
  },
  {
    name: 'Personal Tasks',
    description: 'Simple personal productivity board for daily task management',
    category: 'basic',
    tags: ['personal', 'productivity', 'daily', 'tasks'],
    difficulty: 'beginner',
    estimatedSetupTime: 3,
    recommendedFor: ['individuals', 'personal productivity', 'daily planning'],
    columns: [
      { Name: 'Today', Order: 0, Color: '#6B7280', Status: TaskItemStatus.NotStarted, Alias: 'Today', Description: 'Tasks for today', IsCore: true },
      { Name: 'This Week', Order: 1, Color: '#3B82F6', Status: TaskItemStatus.InProgress, Alias: 'This Week', Description: 'Tasks for this week', IsCore: false },
      { Name: 'Completed', Order: 2, Color: '#10B981', Status: TaskItemStatus.Completed, Alias: 'Completed', Description: 'Completed tasks', IsCore: true }
    ],
    statusMapping: {
      notStartedAlias: 'Today',
      pendingAlias: 'This Week',
      completedAlias: 'Completed',
      descriptions: {
        notStarted: 'Tasks for today',
        pending: 'Tasks for this week',
        completed: 'Completed tasks'
      }
    }
  },
  {
    name: 'Marketing Campaign',
    description: 'Track marketing campaigns from ideation to launch and analysis',
    category: 'basic',
    tags: ['marketing', 'campaign', 'social', 'advertising'],
    difficulty: 'intermediate',
    estimatedSetupTime: 8,
    recommendedFor: ['marketers', 'campaign managers', 'social media teams'],
    columns: [
      { Name: 'Ideation', Order: 0, Color: '#8B5CF6', Status: TaskItemStatus.NotStarted, Alias: 'Ideation', Description: 'Campaign ideas and concepts', IsCore: true },
      { Name: 'Planning', Order: 1, Color: '#3B82F6', Status: TaskItemStatus.InProgress, Alias: 'Planning', Description: 'Campaign planning and strategy', IsCore: false },
      { Name: 'Creation', Order: 2, Color: '#F59E0B', Status: TaskItemStatus.InProgress, Alias: 'Creation', Description: 'Creating campaign assets', IsCore: false },
      { Name: 'Launch', Order: 3, Color: '#EF4444', Status: TaskItemStatus.Pending, Alias: 'Launch', Description: 'Campaign launch and execution', IsCore: false },
      { Name: 'Analysis', Order: 4, Color: '#10B981', Status: TaskItemStatus.Completed, Alias: 'Analysis', Description: 'Campaign analysis and results', IsCore: true }
    ],
    statusMapping: {
      notStartedAlias: 'Ideation',
      pendingAlias: 'Planning',
      completedAlias: 'Analysis',
      descriptions: {
        notStarted: 'Campaign ideas and concepts',
        pending: 'Campaign planning, creation, and launch',
        completed: 'Campaign analysis and results'
      }
    }
  },
  {
    name: 'Bug Tracking',
    description: 'Dedicated board for tracking and resolving software bugs',
    category: 'basic',
    tags: ['bugs', 'testing', 'qa', 'development'],
    difficulty: 'intermediate',
    estimatedSetupTime: 6,
    recommendedFor: ['qa teams', 'developers', 'bug tracking'],
    columns: [
      { Name: 'Reported', Order: 0, Color: '#EF4444', Status: TaskItemStatus.NotStarted, Alias: 'Reported', Description: 'Newly reported bugs', IsCore: true },
      { Name: 'Investigating', Order: 1, Color: '#F59E0B', Status: TaskItemStatus.InProgress, Alias: 'Investigating', Description: 'Bugs being investigated', IsCore: false },
      { Name: 'Fixing', Order: 2, Color: '#3B82F6', Status: TaskItemStatus.InProgress, Alias: 'Fixing', Description: 'Bugs being fixed', IsCore: false },
      { Name: 'Testing', Order: 3, Color: '#8B5CF6', Status: TaskItemStatus.Pending, Alias: 'Testing', Description: 'Bug fixes being tested', IsCore: false },
      { Name: 'Resolved', Order: 4, Color: '#10B981', Status: TaskItemStatus.Completed, Alias: 'Resolved', Description: 'Resolved bugs', IsCore: true }
    ],
    statusMapping: {
      notStartedAlias: 'Reported',
      pendingAlias: 'Investigating',
      completedAlias: 'Resolved',
      descriptions: {
        notStarted: 'Newly reported bugs',
        pending: 'Bugs being investigated, fixed, or tested',
        completed: 'Resolved bugs'
      }
    }
  },

  // 2. Family & Household Templates
  {
    name: 'Family Chores',
    description: 'Perfect for organizing household tasks and chores',
    category: 'family',
    tags: ['household', 'chores', 'family', 'cleaning'],
    difficulty: 'beginner',
    estimatedSetupTime: 3,
    recommendedFor: ['families', 'households', 'roommates'],
    columns: [
      { Name: 'Assigned', Order: 0, Color: '#6366F1', Status: TaskItemStatus.NotStarted, Alias: 'Assigned', Description: 'Chores assigned to family members', IsCore: true },
      { Name: 'In Progress', Order: 1, Color: '#F59E0B', Status: TaskItemStatus.Pending, Alias: 'Doing', Description: 'Chores currently being done', IsCore: false },
      { Name: 'Needs Review', Order: 2, Color: '#8B5CF6', Status: TaskItemStatus.Pending, Alias: 'Review', Description: 'Chores waiting for approval', IsCore: false },
      { Name: 'Complete', Order: 3, Color: '#10B981', Status: TaskItemStatus.Completed, Alias: 'Complete', Description: 'Chores that have been finished', IsCore: true }
    ],
    statusMapping: {
      notStartedAlias: 'Assigned',
      pendingAlias: 'In Progress',
      completedAlias: 'Complete',
      descriptions: {
        notStarted: 'Chores assigned to family members',
        pending: 'Chores currently being worked on',
        completed: 'Chores that have been finished'
      }
    }
  },
  {
    name: 'Weekly Cleaning',
    description: 'Organize weekly cleaning tasks by room and priority',
    category: 'family',
    tags: ['cleaning', 'weekly', 'household', 'maintenance'],
    difficulty: 'beginner',
    estimatedSetupTime: 5,
    recommendedFor: ['families', 'households', 'cleaning schedules'],
    columns: [
      { Name: 'This Week', Order: 0, Color: '#DC2626', Status: TaskItemStatus.NotStarted, Alias: 'Assigned', Description: 'Cleaning tasks assigned for this week', IsCore: true },
      { Name: 'In Progress', Order: 1, Color: '#EA580C', Status: TaskItemStatus.InProgress, Alias: 'Cleaning', Description: 'Cleaning tasks currently being done', IsCore: false },
      { Name: 'Done', Order: 2, Color: '#10B981', Status: TaskItemStatus.Completed, Alias: 'Complete', Description: 'Cleaning tasks that have been finished', IsCore: true }
    ],
    statusMapping: {
      notStartedAlias: 'Assigned',
      pendingAlias: 'Cleaning',
      completedAlias: 'Complete',
      descriptions: {
        notStarted: 'Cleaning tasks assigned for this week',
        pending: 'Cleaning tasks currently being done',
        completed: 'Cleaning tasks that have been finished'
      }
    }
  },
  {
    name: 'Meal Planning',
    description: 'Plan meals, shopping, and cooking tasks',
    category: 'family',
    tags: ['meals', 'cooking', 'shopping', 'planning'],
    difficulty: 'intermediate',
    estimatedSetupTime: 7,
    recommendedFor: ['families', 'meal planners', 'cooks'],
    columns: [
      { Name: 'Meal Ideas', Order: 0, Color: '#F59E0B', Status: TaskItemStatus.NotStarted, Alias: 'Meal Ideas', Description: 'Meal ideas and recipes to try', IsCore: true },
      { Name: 'Shopping List', Order: 1, Color: '#3B82F6', Status: TaskItemStatus.Pending, Alias: 'Shopping', Description: 'Ingredients to buy', IsCore: false },
      { Name: 'Prep & Cook', Order: 2, Color: '#8B5CF6', Status: TaskItemStatus.Pending, Alias: 'Cooking', Description: 'Meals currently being prepared', IsCore: false },
      { Name: 'Served', Order: 3, Color: '#10B981', Status: TaskItemStatus.Completed, Alias: 'Served', Description: 'Meals that have been served', IsCore: true }
    ],
    statusMapping: {
      notStartedAlias: 'Meal Ideas',
      pendingAlias: 'Cooking',
      completedAlias: 'Served',
      descriptions: {
        notStarted: 'Meal ideas and recipes to try',
        pending: 'Meals currently being prepared or shopped for',
        completed: 'Meals that have been served'
      }
    }
  },
  {
    name: 'Home Maintenance',
    description: 'Track home repairs and maintenance tasks',
    category: 'family',
    tags: ['maintenance', 'repairs', 'home', 'diy'],
    difficulty: 'intermediate',
    estimatedSetupTime: 5,
    recommendedFor: ['homeowners', 'maintenance teams', 'diy enthusiasts'],
    columns: [
      { Name: 'Needs Attention', Order: 0, Color: '#EF4444', Status: TaskItemStatus.NotStarted, Alias: 'Needs Attention', Description: 'Items that need maintenance or repair', IsCore: true },
      { Name: 'Planning', Order: 1, Color: '#F59E0B', Status: TaskItemStatus.Pending, Alias: 'Planning', Description: 'Maintenance tasks being planned', IsCore: false },
      { Name: 'Working On', Order: 2, Color: '#3B82F6', Status: TaskItemStatus.InProgress, Alias: 'Working On', Description: 'Maintenance tasks currently being worked on', IsCore: false },
      { Name: 'Completed', Order: 3, Color: '#10B981', Status: TaskItemStatus.Completed, Alias: 'Fixed', Description: 'Items that have been fixed or maintained', IsCore: true }
    ],
    statusMapping: {
      notStartedAlias: 'Needs Attention',
      pendingAlias: 'Working On',
      completedAlias: 'Fixed',
      descriptions: {
        notStarted: 'Items that need maintenance or repair',
        pending: 'Maintenance tasks being planned or worked on',
        completed: 'Items that have been fixed or maintained'
      }
    }
  },

  // 3. Kids & Education Templates
  {
    name: 'School Projects',
    description: 'Organize homework and school assignments',
    category: 'education',
    tags: ['school', 'homework', 'education', 'students'],
    difficulty: 'beginner',
    estimatedSetupTime: 4,
    recommendedFor: ['students', 'parents', 'teachers'],
    columns: [
      { Name: 'Homework', Order: 0, Color: '#DC2626', Status: TaskItemStatus.NotStarted, Alias: 'Homework', Description: 'Assignments that need to be started', IsCore: true },
      { Name: 'Working On', Order: 1, Color: '#EA580C', Status: TaskItemStatus.InProgress, Alias: 'Working On', Description: 'Assignments currently being worked on', IsCore: false },
      { Name: 'Review & Submit', Order: 2, Color: '#9333EA', Status: TaskItemStatus.Pending, Alias: 'Review', Description: 'Assignments ready for review and submission', IsCore: false },
      { Name: 'Submitted', Order: 3, Color: '#059669', Status: TaskItemStatus.Completed, Alias: 'Submitted', Description: 'Assignments that have been submitted', IsCore: true }
    ],
    statusMapping: {
      notStartedAlias: 'Homework',
      pendingAlias: 'Working On',
      completedAlias: 'Submitted',
      descriptions: {
        notStarted: 'Assignments that need to be started',
        pending: 'Assignments currently being worked on or reviewed',
        completed: 'Assignments that have been submitted'
      }
    }
  },
  {
    name: 'Kids Activities',
    description: 'Track children\'s activities and commitments',
    category: 'education',
    tags: ['kids', 'activities', 'schedule', 'extracurricular'],
    difficulty: 'beginner',
    estimatedSetupTime: 3,
    recommendedFor: ['parents', 'families with children'],
    columns: [
      { Name: 'Upcoming', Order: 0, Color: '#6366F1', Status: TaskItemStatus.NotStarted, Alias: 'Upcoming', Description: 'Activities scheduled for the future', IsCore: true },
      { Name: 'Today', Order: 1, Color: '#F59E0B', Status: TaskItemStatus.InProgress, Alias: 'Today', Description: 'Activities happening today', IsCore: false },
      { Name: 'Completed', Order: 2, Color: '#10B981', Status: TaskItemStatus.Completed, Alias: 'Completed', Description: 'Activities that have been completed', IsCore: true }
    ],
    statusMapping: {
      notStartedAlias: 'Upcoming',
      pendingAlias: 'Today',
      completedAlias: 'Completed',
      descriptions: {
        notStarted: 'Activities scheduled for the future',
        pending: 'Activities happening today',
        completed: 'Activities that have been completed'
      }
    }
  },
  {
    name: 'Reading Goals',
    description: 'Track family reading goals and book lists',
    category: 'education',
    tags: ['reading', 'books', 'education', 'goals'],
    difficulty: 'beginner',
    estimatedSetupTime: 3,
    recommendedFor: ['families', 'book clubs', 'students'],
    columns: [
      { Name: 'Want to Read', Order: 0, Color: '#8B5CF6', Status: TaskItemStatus.NotStarted, Alias: 'Want to Read', Description: 'Books on the reading wishlist', IsCore: true },
      { Name: 'Currently Reading', Order: 1, Color: '#3B82F6', Status: TaskItemStatus.InProgress, Alias: 'Currently Reading', Description: 'Books currently being read', IsCore: false },
      { Name: 'Finished', Order: 2, Color: '#10B981', Status: TaskItemStatus.Completed, Alias: 'Finished', Description: 'Books that have been completed', IsCore: true }
    ],
    statusMapping: {
      notStartedAlias: 'Want to Read',
      pendingAlias: 'Currently Reading',
      completedAlias: 'Finished',
      descriptions: {
        notStarted: 'Books on the reading wishlist',
        pending: 'Books currently being read',
        completed: 'Books that have been completed'
      }
    }
  },

  // 4. Health & Wellness Templates
  {
    name: 'Family Health',
    description: 'Track appointments, medications, and health goals',
    category: 'health',
    tags: ['health', 'medical', 'appointments', 'wellness'],
    difficulty: 'intermediate',
    estimatedSetupTime: 6,
    recommendedFor: ['families', 'caregivers', 'health-conscious individuals'],
    columns: [
      { Name: 'Schedule', Order: 0, Color: '#EF4444', Status: TaskItemStatus.NotStarted, Alias: 'Schedule', Description: 'Health appointments and tasks to schedule', IsCore: true },
      { Name: 'Upcoming', Order: 1, Color: '#F59E0B', Status: TaskItemStatus.Pending, Alias: 'Upcoming', Description: 'Scheduled health appointments and tasks', IsCore: false },
      { Name: 'Completed', Order: 2, Color: '#10B981', Status: TaskItemStatus.Completed, Alias: 'Completed', Description: 'Completed health appointments and tasks', IsCore: true }
    ],
    statusMapping: {
      notStartedAlias: 'Schedule',
      pendingAlias: 'Upcoming',
      completedAlias: 'Completed',
      descriptions: {
        notStarted: 'Health appointments and tasks to schedule',
        pending: 'Scheduled health appointments and tasks',
        completed: 'Completed health appointments and tasks'
      }
    }
  },
  {
    name: 'Fitness Goals',
    description: 'Track family fitness activities and goals',
    category: 'health',
    tags: ['fitness', 'exercise', 'health', 'goals'],
    difficulty: 'beginner',
    estimatedSetupTime: 4,
    recommendedFor: ['fitness enthusiasts', 'families', 'health goals'],
    columns: [
      { Name: 'Goals', Order: 0, Color: '#6366F1', Status: TaskItemStatus.NotStarted, Alias: 'Goals', Description: 'Fitness goals to start working on', IsCore: true },
      { Name: 'Active', Order: 1, Color: '#F59E0B', Status: TaskItemStatus.InProgress, Alias: 'Active', Description: 'Fitness goals currently being worked on', IsCore: false },
      { Name: 'Achieved', Order: 2, Color: '#10B981', Status: TaskItemStatus.Completed, Alias: 'Achieved', Description: 'Fitness goals that have been achieved', IsCore: true }
    ],
    statusMapping: {
      notStartedAlias: 'Goals',
      pendingAlias: 'Active',
      completedAlias: 'Achieved',
      descriptions: {
        notStarted: 'Fitness goals to start working on',
        pending: 'Fitness goals currently being worked on',
        completed: 'Fitness goals that have been achieved'
      }
    }
  },

  // 5. Special Events & Planning Templates
  {
    name: 'Birthday Planning',
    description: 'Plan birthday parties and celebrations',
    category: 'events',
    tags: ['birthday', 'party', 'celebration', 'planning'],
    difficulty: 'intermediate',
    estimatedSetupTime: 8,
    recommendedFor: ['party planners', 'families', 'event organizers'],
    columns: [
      { Name: 'Ideas', Order: 0, Color: '#F59E0B', Status: TaskItemStatus.NotStarted, Alias: 'Ideas', Description: 'Birthday party ideas and concepts', IsCore: true },
      { Name: 'Planning', Order: 1, Color: '#3B82F6', Status: TaskItemStatus.Pending, Alias: 'Planning', Description: 'Birthday party tasks being planned', IsCore: false },
      { Name: 'Preparing', Order: 2, Color: '#8B5CF6', Status: TaskItemStatus.InProgress, Alias: 'Preparing', Description: 'Birthday party preparations in progress', IsCore: false },
      { Name: 'Done', Order: 3, Color: '#10B981', Status: TaskItemStatus.Completed, Alias: 'Celebrated', Description: 'Birthday party tasks completed', IsCore: true }
    ],
    statusMapping: {
      notStartedAlias: 'Ideas',
      pendingAlias: 'Planning',
      completedAlias: 'Celebrated',
      descriptions: {
        notStarted: 'Birthday party ideas and concepts',
        pending: 'Birthday party tasks being planned or prepared',
        completed: 'Birthday party tasks completed'
      }
    }
  },
  {
    name: 'Holiday Planning',
    description: 'Organize holiday preparations and traditions',
    category: 'events',
    tags: ['holiday', 'traditions', 'celebration', 'seasonal'],
    difficulty: 'intermediate',
    estimatedSetupTime: 10,
    recommendedFor: ['families', 'holiday enthusiasts', 'tradition keepers'],
    columns: [
      { Name: 'Traditions', Order: 0, Color: '#DC2626', Status: TaskItemStatus.NotStarted, Alias: 'Traditions', Description: 'Holiday traditions and ideas to plan', IsCore: true },
      { Name: 'Shopping', Order: 1, Color: '#F59E0B', Status: TaskItemStatus.Pending, Alias: 'Shopping', Description: 'Holiday shopping and preparation tasks', IsCore: false },
      { Name: 'Preparing', Order: 2, Color: '#3B82F6', Status: TaskItemStatus.InProgress, Alias: 'Preparing', Description: 'Holiday preparations in progress', IsCore: false },
      { Name: 'Celebrated', Order: 3, Color: '#10B981', Status: TaskItemStatus.Completed, Alias: 'Celebrated', Description: 'Holiday traditions completed and celebrated', IsCore: true }
    ],
    statusMapping: {
      notStartedAlias: 'Traditions',
      pendingAlias: 'Shopping',
      completedAlias: 'Celebrated',
      descriptions: {
        notStarted: 'Holiday traditions and ideas to plan',
        pending: 'Holiday shopping and preparations in progress',
        completed: 'Holiday traditions completed and celebrated'
      }
    }
  },
  {
    name: 'Vacation Planning',
    description: 'Plan family trips and vacations',
    category: 'events',
    tags: ['vacation', 'travel', 'planning', 'family'],
    difficulty: 'advanced',
    estimatedSetupTime: 15,
    recommendedFor: ['travelers', 'families', 'vacation planners'],
    columns: [
      { Name: 'Research', Order: 0, Color: '#6366F1', Status: TaskItemStatus.NotStarted, Alias: 'Research', Description: 'Vacation destinations and activities to research', IsCore: true },
      { Name: 'Booking', Order: 1, Color: '#F59E0B', Status: TaskItemStatus.Pending, Alias: 'Booking', Description: 'Vacation bookings and reservations to make', IsCore: false },
      { Name: 'Preparing', Order: 2, Color: '#8B5CF6', Status: TaskItemStatus.InProgress, Alias: 'Preparing', Description: 'Vacation preparations in progress', IsCore: false },
      { Name: 'Enjoyed', Order: 3, Color: '#10B981', Status: TaskItemStatus.Completed, Alias: 'Enjoyed', Description: 'Vacation activities completed and enjoyed', IsCore: true }
    ],
    statusMapping: {
      notStartedAlias: 'Research',
      pendingAlias: 'Booking',
      completedAlias: 'Enjoyed',
      descriptions: {
        notStarted: 'Vacation destinations and activities to research',
        pending: 'Vacation bookings and preparations in progress',
        completed: 'Vacation activities completed and enjoyed'
      }
    }
  },

  // 6. Financial & Budget Templates
  {
    name: 'Family Budget',
    description: 'Track family expenses and financial goals',
    category: 'financial',
    tags: ['budget', 'finance', 'money', 'expenses'],
    difficulty: 'intermediate',
    estimatedSetupTime: 12,
    recommendedFor: ['families', 'budget planners', 'financial goals'],
    columns: [
      { Name: 'Planned', Order: 0, Color: '#3B82F6', Status: TaskItemStatus.NotStarted, Alias: 'Planned', Description: 'Expenses and financial goals to plan', IsCore: true },
      { Name: 'Pending', Order: 1, Color: '#F59E0B', Status: TaskItemStatus.Pending, Alias: 'Pending', Description: 'Expenses pending payment or approval', IsCore: false },
      { Name: 'Paid', Order: 2, Color: '#10B981', Status: TaskItemStatus.Completed, Alias: 'Paid', Description: 'Expenses that have been paid', IsCore: true }
    ],
    statusMapping: {
      notStartedAlias: 'Planned',
      pendingAlias: 'Pending',
      completedAlias: 'Paid',
      descriptions: {
        notStarted: 'Expenses and financial goals to plan',
        pending: 'Expenses pending payment or approval',
        completed: 'Expenses that have been paid'
      }
    }
  },

  // 7. Seasonal & Garden Templates
  {
    name: 'Garden Planning',
    description: 'Plan and track gardening activities',
    category: 'seasonal',
    tags: ['garden', 'plants', 'seasonal', 'outdoor'],
    difficulty: 'intermediate',
    estimatedSetupTime: 8,
    recommendedFor: ['gardeners', 'plant enthusiasts', 'outdoor lovers'],
    columns: [
      { Name: 'Planning', Order: 0, Color: '#059669', Status: TaskItemStatus.NotStarted, Alias: 'Planning', Description: 'Garden plans and ideas to develop', IsCore: true },
      { Name: 'Planting', Order: 1, Color: '#10B981', Status: TaskItemStatus.InProgress, Alias: 'Planting', Description: 'Seeds and plants being planted', IsCore: false },
      { Name: 'Growing', Order: 2, Color: '#22C55E', Status: TaskItemStatus.Pending, Alias: 'Growing', Description: 'Plants currently growing and being tended', IsCore: false },
      { Name: 'Harvested', Order: 3, Color: '#16A34A', Status: TaskItemStatus.Completed, Alias: 'Harvested', Description: 'Plants that have been harvested or completed', IsCore: true }
    ],
    statusMapping: {
      notStartedAlias: 'Planning',
      pendingAlias: 'Planting',
      completedAlias: 'Harvested',
      descriptions: {
        notStarted: 'Garden plans and ideas to develop',
        pending: 'Seeds being planted or plants growing',
        completed: 'Plants that have been harvested or completed'
      }
    }
  }
]; 