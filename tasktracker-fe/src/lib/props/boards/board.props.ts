/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 * 
 * Board Component Props - Enterprise Compliance
 * Extracted from lib/types/board.ts for .cursorrules compliance
 * Following FAMILY-AUTH-IMPLEMENTATION-CHECKLIST.md standards
 */

import { TaskItemStatus, TaskItemResponseDTO } from '@/lib/types/tasks';
import { BoardDTO, BoardColumnDTO } from '@/lib/interfaces/api/board.interface';
import { 
  DragState, 
  DragAnimationConfig, 
  ColumnGamificationStyle, 
  TaskCardGamificationStyle 
} from '@/lib/interfaces/components/board.interface';

/**
 * Board Page Component Props
 */

export interface BoardPageProps {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Kanban Board Component Props
 */

export interface KanbanBoardProps {
  boardId: number;
  className?: string;
  enableAnimations?: boolean;
  enableGamification?: boolean;
  enableSoundEffects?: boolean;
  theme?: 'default' | 'neon' | 'glass' | 'gradient';
}

/**
 * Board Column Component Props
 */

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

/**
 * Task Card Component Props
 */

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

/**
 * Modal Component Props
 */

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
