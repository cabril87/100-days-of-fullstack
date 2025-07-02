/*
 * Board Component Props
 * Copyright (c) 2025 Carlos Abril Jr
 * 
 * CURSORRULES COMPLIANT: Board component props extracted from lib/types/board.ts
 * Contains all board-related component prop interfaces
 */

import { TaskItemStatus, TaskItemResponseDTO } from '../../types/tasks';
import { 
  BoardDTO, 
  BoardColumnDTO 
} from '../../interfaces/api/board.interface';
import { 
  DragState, 
  DragAnimationConfig, 
  ColumnGamificationStyle, 
  TaskCardGamificationStyle 
} from '../../interfaces/components/board.interface';

// ================================
// PAGE & CONTAINER PROPS
// ================================

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

// ================================
// BOARD COMPONENT PROPS
// ================================

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

// ================================
// MODAL COMPONENT PROPS
// ================================

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