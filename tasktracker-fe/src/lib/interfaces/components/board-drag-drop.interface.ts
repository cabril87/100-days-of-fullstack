/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 * 
 * Board Drag & Drop Component Interfaces - Enterprise Compliance
 * Extracted from lib/types/board.ts for .cursorrules compliance
 * Following FAMILY-AUTH-IMPLEMENTATION-CHECKLIST.md standards
 */

import { TaskItemStatus, TaskItemResponseDTO } from '@/lib/types/tasks';
import { BoardColumnDTO } from '@/lib/interfaces/api/board.interface';

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
