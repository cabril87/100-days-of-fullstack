/*
 * Boards Component Interfaces
 * Centralized interface definitions for board-related components
 * Extracted from components/boards/ for .cursorrules compliance
 */

import { BoardColumnDTO } from '@/lib/types/boards';
import { Task, TaskItemResponseDTO } from '@/lib/types/tasks';
import { FamilyMemberDTO } from '@/lib/types/family';

// ================================
// MAIN BOARD INTERFACES
// ================================

export interface KanbanBoardProps {
  boardId: number;
  columns: BoardColumnDTO[];
  tasks: TaskItemResponseDTO[];
  onTaskMove?: (taskId: number, fromColumnId: number, toColumnId: number, newIndex: number) => void;
  onTaskCreate?: (columnId: number, task: Partial<Task>) => void;
  onTaskUpdate?: (taskId: number, updates: Partial<TaskItemResponseDTO>) => void;
  onTaskDelete?: (taskId: number) => void;
  onColumnUpdate?: (columnId: number, updates: Partial<BoardColumnDTO>) => void;
  familyMembers?: FamilyMemberDTO[];
  readOnly?: boolean;
  className?: string;
}

export interface BoardColumnProps {
  column: BoardColumnDTO;
  tasks: TaskItemResponseDTO[];
  onTaskCreate?: (task: Partial<TaskItemResponseDTO>) => void;
  onTaskUpdate?: (taskId: number, updates: Partial<TaskItemResponseDTO>) => void;
  onTaskDelete?: (taskId: number) => void;
  onColumnUpdate?: (updates: Partial<BoardColumnDTO>) => void;
  familyMembers?: FamilyMemberDTO[];
  dragOverlay?: boolean;
  className?: string;
}

export interface EnhancedBoardColumnProps extends BoardColumnProps {
  wipLimit?: number;
  wipStatus?: {
    current: number;
    limit: number;
    isOverLimit: boolean;
  };
  showWipWarning?: boolean;
  columnTemplates?: unknown[];
}

export interface SortableColumnProps extends EnhancedBoardColumnProps {
  id: string;
  index: number;
  isDragging?: boolean;
}

export interface TaskCardProps {
  task: TaskItemResponseDTO;
  onUpdate?: (updates: Partial<TaskItemResponseDTO>) => void;
  onDelete?: () => void;
  familyMembers?: FamilyMemberDTO[];
  showDetails?: boolean;
  compact?: boolean;
  dragOverlay?: boolean;
  className?: string;
}

export interface EnhancedTaskCardProps extends TaskCardProps {
  showPriority?: boolean;
  showAssignee?: boolean;
  showDueDate?: boolean;
  showTags?: boolean;
  showProgress?: boolean;
  showActions?: boolean;
  onClick?: () => void;
}

// ================================
// BOARD MANAGEMENT INTERFACES
// ================================

export interface EditBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardId?: number;
  onBoardUpdated?: (board: unknown) => void;
  mode?: 'edit' | 'create';
  className?: string;
}

export interface EnhancedSortableColumnItemProps {
  column: BoardColumnDTO;
  index: number;
  onEdit: (column: BoardColumnDTO) => void;
  onDelete: (columnId: number) => void;
  onMove: (fromIndex: number, toIndex: number) => void;
  isDragging?: boolean;
  className?: string;
}

export interface DeleteConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  type: 'board' | 'column' | 'task';
  loading?: boolean;
  className?: string;
}

export interface CreateCustomBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBoardCreated?: (board: unknown) => void;
  familyId?: number;
  templateId?: number;
  className?: string;
}

// ================================
// MOBILE BOARD INTERFACES
// ================================

export interface MobileKanbanProps {
  boardId: number;
  columns: BoardColumnDTO[];
  tasks: TaskItemResponseDTO[];
  viewMode: 'columns' | 'swimlanes' | 'cards' | 'compact';
  onViewModeChange: (mode: string) => void;
  onTaskMove?: (taskId: number, fromColumnId: number, toColumnId: number) => void;
  enableGestures?: boolean;
  enableHaptic?: boolean;
  className?: string;
}

export interface MobileKanbanEnhancementsProps {
  boardData: {
    columns: BoardColumnDTO[];
    tasks: TaskItemResponseDTO[];
  };
  viewMode: 'columns' | 'swimlanes' | 'cards' | 'compact';
  onViewModeChange: (mode: string) => void;
  gestureConfig?: {
    swipeThreshold: number;
    longPressTimeout: number;
    enableHaptic: boolean;
  };
  className?: string;
}

// ================================
// BOARD TEMPLATES INTERFACES
// ================================

export interface BoardTemplateProps {
  template: {
    id: number;
    name: string;
    description: string;
    columns: unknown[];
    tags: string[];
    category: string;
    isPublic: boolean;
    createdBy?: string;
  };
  onSelect?: (templateId: number) => void;
  onPreview?: (templateId: number) => void;
  showActions?: boolean;
  compact?: boolean;
  className?: string;
}

export interface TemplateCategoryProps {
  category: string;
  templates: unknown[];
  onTemplateSelect?: (templateId: number) => void;
  showAll?: boolean;
  maxVisible?: number;
  className?: string;
}

// ================================
// QUEST & GAMIFICATION INTERFACES
// ================================

export interface QuestSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuestSelect: (questId: number) => void;
  availableQuests: Array<{
    id: number;
    title: string;
    description: string;
    difficulty: string;
    estimatedTime: string;
    rewards: number;
    category?: string;
    prerequisites?: number[];
  }>;
  currentLevel?: number;
  className?: string;
}

export interface QuestProgressProps {
  quest: {
    id: number;
    title: string;
    description: string;
    progress: number;
    total: number;
    rewards: number;
    timeLimit?: Date;
  };
  onQuestComplete?: (questId: number) => void;
  onQuestAbandon?: (questId: number) => void;
  showActions?: boolean;
  className?: string;
}

// ================================
// BOARD TABS INTERFACES
// ================================

export interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabs: Array<{
    id: string;
    label: string;
    icon?: React.ReactNode;
    disabled?: boolean;
    badge?: string | number;
  }>;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export interface MobileTabBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabs: Array<{
    id: string;
    label: string;
    icon?: React.ReactNode;
    disabled?: boolean;
  }>;
  showLabels?: boolean;
  enableSwipe?: boolean;
  className?: string;
}

// ================================
// BOARD SETTINGS INTERFACES
// ================================

export interface BoardSettingsProps {
  boardId: number;
  settings: {
    isPublic: boolean;
    allowComments: boolean;
    enableNotifications: boolean;
    autoArchive: boolean;
    wipLimits: Record<string, number>;
  };
  onSettingsUpdate: (settings: unknown) => void;
  className?: string;
}

export interface ColumnSettingsProps {
  column: BoardColumnDTO;
  onUpdate: (updates: Partial<BoardColumnDTO>) => void;
  availableStatuses?: string[];
  className?: string;
} 
