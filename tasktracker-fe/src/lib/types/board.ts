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
 * UI-specific types for drag and drop
 */

export interface DragEndEvent {
  active: {
    id: string;
    data: {
      current?: {
        taskId: number;
        columnId: number;
        status: TaskItemStatus;
      };
    };
  };
  over: {
    id: string;
    data: {
      current?: {
        columnId: number;
        status: TaskItemStatus;
      };
    };
  } | null;
}

export interface DroppableColumnData {
  columnId: number;
  status: TaskItemStatus;
}

export interface DraggableTaskData {
  taskId: number;
  columnId: number;
  status: TaskItemStatus;
}

/**
 * Component props interfaces
 */
export interface BoardPageProps {
  params: Promise<{
    id: string;
  }>;
}

export interface KanbanBoardProps {
  boardId: number;
  className?: string;
}

export interface BoardColumnProps {
  column: BoardColumnDTO;
  tasks: TaskItemResponseDTO[];
  onCreateTask: () => void;
  className?: string;
}

export interface TaskCardProps {
  task: TaskItemResponseDTO;
  columnColor?: string;
  isDragging?: boolean;
  className?: string;
  onEdit?: (task: TaskItemResponseDTO) => void;
  onDelete?: (task: TaskItemResponseDTO) => void;
  onView?: (task: TaskItemResponseDTO) => void;
}

export interface CreateTaskModalProps {
  open: boolean;
  onClose: () => void;
  onTaskCreated: () => void;
  defaultStatus?: TaskItemStatus;
  boardId?: number;
}

export interface EditBoardModalProps {
  open: boolean;
  onClose: () => void;
  onBoardUpdated: () => void;
  board: BoardDTO;
}

export interface CreateBoardModalProps {
  open: boolean;
  onClose: () => void;
  onBoardCreated: () => void;
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
 * Board templates for quick setup
 */
export interface BoardTemplate {
  name: string;
  description: string;
  columns: BoardColumnCreateDTO[];
}

export const BOARD_TEMPLATES: BoardTemplate[] = [
  {
    name: 'Basic Kanban',
    description: 'Simple 3-column board for basic task management',
    columns: [
      { Name: 'To Do', Order: 0, Color: '#EF4444', Status: TaskItemStatus.NotStarted },
      { Name: 'In Progress', Order: 1, Color: '#F59E0B', Status: TaskItemStatus.InProgress },
      { Name: 'Done', Order: 2, Color: '#10B981', Status: TaskItemStatus.Completed }
    ]
  },
  {
    name: 'Family Chores',
    description: 'Perfect for organizing household tasks',
    columns: [
      { Name: 'Assigned', Order: 0, Color: '#6366F1', Status: TaskItemStatus.NotStarted },
      { Name: 'In Progress', Order: 1, Color: '#F59E0B', Status: TaskItemStatus.InProgress },
      { Name: 'Needs Review', Order: 2, Color: '#8B5CF6', Status: TaskItemStatus.OnHold },
      { Name: 'Complete', Order: 3, Color: '#10B981', Status: TaskItemStatus.Completed }
    ]
  },
  {
    name: 'School Projects',
    description: 'Organize homework and school assignments',
    columns: [
      { Name: 'Homework', Order: 0, Color: '#DC2626', Status: TaskItemStatus.NotStarted },
      { Name: 'Working On', Order: 1, Color: '#EA580C', Status: TaskItemStatus.InProgress },
      { Name: 'Review & Submit', Order: 2, Color: '#9333EA', Status: TaskItemStatus.Pending },
      { Name: 'Submitted', Order: 3, Color: '#059669', Status: TaskItemStatus.Completed }
    ]
  }
]; 