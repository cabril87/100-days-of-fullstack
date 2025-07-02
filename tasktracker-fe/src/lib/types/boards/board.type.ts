/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * Board Types - Enterprise Compliance
 * 
 * ? CURSORRULES COMPLIANT: All interfaces moved to lib/interfaces/
 * ? All props moved to lib/props/
 * ? Only types, enums, and unions remain here per .cursorrules standards
 */

import { TaskItemStatus } from '../tasks/task.type';

// ================================
// RE-EXPORTS FROM PROPER LOCATIONS
// ================================

// API/DTO Interfaces from lib/interfaces/api/
export type {
  BoardDTO,
  BoardColumnDTO,
  BoardDetailDTO,
  CreateBoardDTO,
  BoardColumnCreateDTO,
  UpdateBoardDTO,
  BoardColumnUpdateDTO,
  TaskReorderDTO,
  BoardTemplate,
  ColumnConfiguration,
  StatusMappingConfig,
  CoreStatusValidation
} from '@/lib/interfaces/api/board.interface';

// Component Interfaces from lib/interfaces/components/
export type {
  DragEndEvent,
  DroppableColumnData,
  DraggableTaskData,
  DragState,
  DropValidation,
  DragAnimationConfig,
  ColumnGamificationStyle,
  TaskCardGamificationStyle
} from '@/lib/interfaces/components/board.interface';

// Component Props from lib/props/
export type {
  BoardPageProps,
  KanbanBoardProps,
  BoardColumnProps,
  TaskCardProps,
  CreateTaskModalProps,
  EditBoardModalProps,
  CreateBoardModalProps
} from '@/lib/props/boards/board.props';

// Service Interfaces from lib/interfaces/services/
export type {
  DragDropService,
  StatusMappingUtilities
} from '@/lib/interfaces/services/board.service.interface';

// ================================
// BOARD-SPECIFIC TYPES (REMAIN HERE)
// ================================

/**
 * Board Theme Variants Type
 */
export type BoardTheme = 'default' | 'neon' | 'glass' | 'gradient';

/**
 * Board Template Category Type
 */
export type BoardTemplateCategory = 'basic' | 'family' | 'education' | 'health' | 'events' | 'financial' | 'seasonal';

/**
 * Board Template Difficulty Type
 */
export type BoardTemplateDifficulty = 'beginner' | 'intermediate' | 'advanced';

/**
 * Drag Animation State Type
 */
export type DragAnimationState = 'idle' | 'dragging' | 'dropping' | 'success' | 'error';

/**
 * Droppable Element Type
 */
export type DroppableElementType = 'column' | 'task';

/**
 * Board Column Form Data Type (extends DTO with form-specific fields)
 */
export type ColumnFormData = {
  id: number;
  name: string;
  order: number;
  color?: string;
  status: TaskItemStatus;
  alias?: string;
  description?: string;
  isCore?: boolean;
  isDefault: boolean;
};

// ================================
// BOARD-SPECIFIC ENUMS
// ================================

/**
 * Board Animation Types Enum
 */
export enum BoardAnimationType {
  SLIDE = 'slide',
  FADE = 'fade',
  SCALE = 'scale',
  BOUNCE = 'bounce'
}

/**
 * Board Layout Modes Enum
 */
export enum BoardLayoutMode {
  COMPACT = 'compact',
  COMFORTABLE = 'comfortable',
  SPACIOUS = 'spacious'
}

/**
 * Board Gamification Levels Enum
 */
export enum BoardGamificationLevel {
  NONE = 0,
  MINIMAL = 1,
  MODERATE = 2,
  FULL = 3,
  MAXIMUM = 4
}

// ================================
// BOARD CONFIGURATION CONSTANTS
// ================================

/**
 * Task Style Presets for Board Theming
 */
export const TASK_STYLE_PRESETS = {
  default: {
    baseGradient: 'from-white to-slate-50 dark:from-slate-800 dark:to-slate-900',
    hoverGradient: 'from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800',
    dragGradient: 'from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20',
    borderColor: 'border-slate-200 dark:border-slate-700',
    shadowColor: 'shadow-slate-500/20',
    priorityColors: {
      Low: 'border-l-emerald-500 hover:shadow-emerald-500/20',
      Medium: 'border-l-yellow-500 hover:shadow-yellow-500/20',
      High: 'border-l-orange-500 hover:shadow-orange-500/20',
      Urgent: 'border-l-red-500 hover:shadow-red-500/20'
    },
    statusIndicator: 'bg-gradient-to-r from-slate-400 to-slate-500'
  },
  neon: {
    baseGradient: 'from-purple-900 to-blue-900',
    hoverGradient: 'from-purple-800 to-blue-800',
    dragGradient: 'from-cyan-500/20 to-purple-500/20',
    borderColor: 'border-cyan-400',
    shadowColor: 'shadow-cyan-400/50',
    priorityColors: {
      Low: 'border-l-green-400 hover:shadow-green-400/50',
      Medium: 'border-l-yellow-400 hover:shadow-yellow-400/50',
      High: 'border-l-orange-400 hover:shadow-orange-400/50',
      Urgent: 'border-l-red-400 hover:shadow-red-400/50'
    },
    statusIndicator: 'bg-gradient-to-r from-cyan-400 to-purple-400'
  },
  glass: {
    baseGradient: 'from-white/80 to-white/60 dark:from-slate-800/80 dark:to-slate-900/60',
    hoverGradient: 'from-white/90 to-white/70 dark:from-slate-700/90 dark:to-slate-800/70',
    dragGradient: 'from-blue-100/80 to-purple-100/80 dark:from-blue-900/40 dark:to-purple-900/40',
    borderColor: 'border-white/30 dark:border-slate-600/30',
    shadowColor: 'shadow-black/10 dark:shadow-white/10',
    priorityColors: {
      Low: 'border-l-emerald-400/70 hover:shadow-emerald-400/30',
      Medium: 'border-l-yellow-400/70 hover:shadow-yellow-400/30',
      High: 'border-l-orange-400/70 hover:shadow-orange-400/30',
      Urgent: 'border-l-red-400/70 hover:shadow-red-400/30'
    },
    statusIndicator: 'bg-gradient-to-r from-slate-400/70 to-slate-500/70'
  },
  gradient: {
    baseGradient: 'from-gradient-to-br from-purple-100 via-blue-100 to-cyan-100 dark:from-purple-900/30 dark:via-blue-900/30 dark:to-cyan-900/30',
    hoverGradient: 'from-purple-200 via-blue-200 to-cyan-200 dark:from-purple-800/40 dark:via-blue-800/40 dark:to-cyan-800/40',
    dragGradient: 'from-purple-300/80 via-blue-300/80 to-cyan-300/80 dark:from-purple-700/50 dark:via-blue-700/50 dark:to-cyan-700/50',
    borderColor: 'border-purple-300 dark:border-purple-600',
    shadowColor: 'shadow-purple-500/30',
    priorityColors: {
      Low: 'border-l-emerald-500 hover:shadow-emerald-500/40',
      Medium: 'border-l-yellow-500 hover:shadow-yellow-500/40',
      High: 'border-l-orange-500 hover:shadow-orange-500/40',
      Urgent: 'border-l-red-500 hover:shadow-red-500/40'
    },
    statusIndicator: 'bg-gradient-to-r from-purple-500 to-cyan-500'
  }
} as const;

/**
 * Board Templates Configuration
 */
export const BOARD_TEMPLATES = [
  {
    name: 'Personal Task Board',
    description: 'A simple three-column board for personal productivity',
    category: 'basic' as BoardTemplateCategory,
    difficulty: 'beginner' as BoardTemplateDifficulty,
    estimatedSetupTime: 2,
    tags: ['personal', 'productivity', 'simple'],
    recommendedFor: ['individuals', 'freelancers', 'students'],
    columns: [
      {
        Name: 'To Do',
        Order: 0,
        Color: '#ef4444',
        Status: TaskItemStatus.NotStarted,
        Alias: 'To Do',
        Description: 'Tasks that need to be started',
        IsCore: true
      },
      {
        Name: 'In Progress',
        Order: 1,
        Color: '#f59e0b',
        Status: TaskItemStatus.Pending,
        Alias: 'In Progress',
        Description: 'Tasks currently being worked on',
        IsCore: true
      },
      {
        Name: 'Completed',
        Order: 2,
        Color: '#10b981',
        Status: TaskItemStatus.Completed,
        Alias: 'Done',
        Description: 'Tasks that have been completed',
        IsCore: true
      }
    ]
  },
  {
    name: 'Family Chore Board',
    description: 'Organize household tasks and chores for the whole family',
    category: 'family' as BoardTemplateCategory,
    difficulty: 'beginner' as BoardTemplateDifficulty,
    estimatedSetupTime: 3,
    tags: ['family', 'chores', 'household'],
    recommendedFor: ['families', 'parents', 'households'],
    columns: [
      {
        Name: 'Chore List',
        Order: 0,
        Color: '#6366f1',
        Status: TaskItemStatus.NotStarted,
        Alias: 'Chore List',
        Description: 'Household chores that need to be done',
        IsCore: true
      },
      {
        Name: 'In Progress',
        Order: 1,
        Color: '#f59e0b',
        Status: TaskItemStatus.Pending,
        Alias: 'Doing Now',
        Description: 'Chores currently being worked on',
        IsCore: true
      },
      {
        Name: 'Completed',
        Order: 2,
        Color: '#10b981',
        Status: TaskItemStatus.Completed,
        Alias: 'All Done!',
        Description: 'Completed chores',
        IsCore: true
      }
    ]
  }
];
