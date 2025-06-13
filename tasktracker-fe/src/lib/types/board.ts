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
}

export interface BoardColumnDTO {
  id: number;
  name: string;
  order: number;
  color?: string;
  status: TaskItemStatus;
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
}

/**
 * Default board columns for new boards
 */
export const DEFAULT_BOARD_COLUMNS: BoardColumnCreateDTO[] = [
  {
    Name: 'To Do',
    Order: 0,
    Color: '#EF4444',
    Status: TaskItemStatus.NotStarted
  },
  {
    Name: 'In Progress',
    Order: 1,
    Color: '#F59E0B',
    Status: TaskItemStatus.InProgress
  },
  {
    Name: 'Review',
    Order: 2,
    Color: '#3B82F6',
    Status: TaskItemStatus.OnHold
  },
  {
    Name: 'Done',
    Order: 3,
    Color: '#10B981',
    Status: TaskItemStatus.Completed
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
      { Name: 'To Do', Order: 0, Color: '#6B7280', Status: TaskItemStatus.NotStarted },
      { Name: 'In Progress', Order: 1, Color: '#3B82F6', Status: TaskItemStatus.InProgress },
      { Name: 'Done', Order: 2, Color: '#10B981', Status: TaskItemStatus.Completed }
    ]
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
      { Name: 'Tasks', Order: 0, Color: '#8B5CF6', Status: TaskItemStatus.NotStarted },
      { Name: 'Completed', Order: 1, Color: '#10B981', Status: TaskItemStatus.Completed }
    ]
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
      { Name: 'Assigned', Order: 0, Color: '#6366F1', Status: TaskItemStatus.NotStarted },
      { Name: 'In Progress', Order: 1, Color: '#F59E0B', Status: TaskItemStatus.InProgress },
      { Name: 'Needs Review', Order: 2, Color: '#8B5CF6', Status: TaskItemStatus.OnHold },
      { Name: 'Complete', Order: 3, Color: '#10B981', Status: TaskItemStatus.Completed }
    ]
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
      { Name: 'This Week', Order: 0, Color: '#DC2626', Status: TaskItemStatus.NotStarted },
      { Name: 'In Progress', Order: 1, Color: '#EA580C', Status: TaskItemStatus.InProgress },
      { Name: 'Done', Order: 2, Color: '#10B981', Status: TaskItemStatus.Completed }
    ]
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
      { Name: 'Meal Ideas', Order: 0, Color: '#F59E0B', Status: TaskItemStatus.NotStarted },
      { Name: 'Shopping List', Order: 1, Color: '#3B82F6', Status: TaskItemStatus.Pending },
      { Name: 'Prep & Cook', Order: 2, Color: '#8B5CF6', Status: TaskItemStatus.InProgress },
      { Name: 'Served', Order: 3, Color: '#10B981', Status: TaskItemStatus.Completed }
    ]
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
      { Name: 'Needs Attention', Order: 0, Color: '#EF4444', Status: TaskItemStatus.NotStarted },
      { Name: 'Planning', Order: 1, Color: '#F59E0B', Status: TaskItemStatus.Pending },
      { Name: 'Working On', Order: 2, Color: '#3B82F6', Status: TaskItemStatus.InProgress },
      { Name: 'Completed', Order: 3, Color: '#10B981', Status: TaskItemStatus.Completed }
    ]
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
      { Name: 'Homework', Order: 0, Color: '#DC2626', Status: TaskItemStatus.NotStarted },
      { Name: 'Working On', Order: 1, Color: '#EA580C', Status: TaskItemStatus.InProgress },
      { Name: 'Review & Submit', Order: 2, Color: '#9333EA', Status: TaskItemStatus.OnHold },
      { Name: 'Submitted', Order: 3, Color: '#059669', Status: TaskItemStatus.Completed }
    ]
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
      { Name: 'Upcoming', Order: 0, Color: '#6366F1', Status: TaskItemStatus.NotStarted },
      { Name: 'Today', Order: 1, Color: '#F59E0B', Status: TaskItemStatus.InProgress },
      { Name: 'Completed', Order: 2, Color: '#10B981', Status: TaskItemStatus.Completed }
    ]
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
      { Name: 'Want to Read', Order: 0, Color: '#8B5CF6', Status: TaskItemStatus.NotStarted },
      { Name: 'Currently Reading', Order: 1, Color: '#3B82F6', Status: TaskItemStatus.InProgress },
      { Name: 'Finished', Order: 2, Color: '#10B981', Status: TaskItemStatus.Completed }
    ]
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
      { Name: 'Schedule', Order: 0, Color: '#EF4444', Status: TaskItemStatus.NotStarted },
      { Name: 'Upcoming', Order: 1, Color: '#F59E0B', Status: TaskItemStatus.Pending },
      { Name: 'Completed', Order: 2, Color: '#10B981', Status: TaskItemStatus.Completed }
    ]
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
      { Name: 'Goals', Order: 0, Color: '#6366F1', Status: TaskItemStatus.NotStarted },
      { Name: 'Active', Order: 1, Color: '#F59E0B', Status: TaskItemStatus.InProgress },
      { Name: 'Achieved', Order: 2, Color: '#10B981', Status: TaskItemStatus.Completed }
    ]
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
      { Name: 'Ideas', Order: 0, Color: '#F59E0B', Status: TaskItemStatus.NotStarted },
      { Name: 'Planning', Order: 1, Color: '#3B82F6', Status: TaskItemStatus.Pending },
      { Name: 'Preparing', Order: 2, Color: '#8B5CF6', Status: TaskItemStatus.InProgress },
      { Name: 'Done', Order: 3, Color: '#10B981', Status: TaskItemStatus.Completed }
    ]
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
      { Name: 'Traditions', Order: 0, Color: '#DC2626', Status: TaskItemStatus.NotStarted },
      { Name: 'Shopping', Order: 1, Color: '#F59E0B', Status: TaskItemStatus.Pending },
      { Name: 'Preparing', Order: 2, Color: '#3B82F6', Status: TaskItemStatus.InProgress },
      { Name: 'Celebrated', Order: 3, Color: '#10B981', Status: TaskItemStatus.Completed }
    ]
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
      { Name: 'Research', Order: 0, Color: '#6366F1', Status: TaskItemStatus.NotStarted },
      { Name: 'Booking', Order: 1, Color: '#F59E0B', Status: TaskItemStatus.Pending },
      { Name: 'Preparing', Order: 2, Color: '#8B5CF6', Status: TaskItemStatus.InProgress },
      { Name: 'Enjoyed', Order: 3, Color: '#10B981', Status: TaskItemStatus.Completed }
    ]
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
      { Name: 'Planned', Order: 0, Color: '#3B82F6', Status: TaskItemStatus.NotStarted },
      { Name: 'Pending', Order: 1, Color: '#F59E0B', Status: TaskItemStatus.Pending },
      { Name: 'Paid', Order: 2, Color: '#10B981', Status: TaskItemStatus.Completed }
    ]
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
      { Name: 'Planning', Order: 0, Color: '#059669', Status: TaskItemStatus.NotStarted },
      { Name: 'Planting', Order: 1, Color: '#10B981', Status: TaskItemStatus.InProgress },
      { Name: 'Growing', Order: 2, Color: '#22C55E', Status: TaskItemStatus.OnHold },
      { Name: 'Harvested', Order: 3, Color: '#16A34A', Status: TaskItemStatus.Completed }
    ]
  }
]; 