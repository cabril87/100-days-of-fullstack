/*
 * Board Component Props Type Definitions
 * Copyright (c) 2025 Carlos Abril Jr
 * 
 * All board component prop interfaces following Family Auth Implementation Checklist
 * Centralized board component interface definitions for consistent typing
 */

import { ReactNode } from 'react';
import { BoardColumnDTO } from './board';
import { TaskItemResponseDTO } from './task';
import { User } from './auth';

// ================================
// ENHANCED KANBAN BOARD COMPONENTS
// Note: Base KanbanBoardProps and BoardColumnProps are in board.ts
// ================================

export interface EnhancedBoardColumnProps {
  column: BoardColumnDTO;
  tasks: TaskItemResponseDTO[];
  onTaskMove: (taskId: string, newIndex: number) => void;
  onTaskClick: (task: TaskItemResponseDTO) => void;
  onColumnUpdate: (column: BoardColumnDTO) => void;
  onTaskUpdate: (task: TaskItemResponseDTO) => void;
  className?: string;
  isDragOver?: boolean;
  canDrop?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export interface SortableColumnProps extends EnhancedBoardColumnProps {
  index: number;
  onColumnMove: (dragIndex: number, hoverIndex: number) => void;
}

// ================================
// ENHANCED TASK CARD COMPONENTS
// Note: Base TaskCardProps is already defined in board.ts
// ================================

export interface EnhancedTaskCardProps {
  task: TaskItemResponseDTO;
  onClick: (task: TaskItemResponseDTO) => void;
  onUpdate: (task: TaskItemResponseDTO) => void;
  isDragging?: boolean;
  className?: string;
  showAssignees?: boolean;
  showDueDate?: boolean;
  showPriority?: boolean;
  showTags?: boolean;
  isSelected?: boolean;
  showQuickActions?: boolean;
  onQuickComplete?: () => void;
  onQuickEdit?: () => void;
  onQuickDelete?: () => void;
}

// ================================
// BOARD EDITING COMPONENTS
// Note: EditBoardModalProps is already defined in board.ts
// ================================

export interface EnhancedSortableColumnItemProps {
  column: BoardColumnDTO;
  index: number;
  onMove: (dragIndex: number, hoverIndex: number) => void;
  onUpdate: (column: BoardColumnDTO) => void;
  onDelete: (columnId: string) => void;
  className?: string;
}

export interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  itemName?: string;
  isLoading?: boolean;
}

// ================================
// QUEST SELECTION COMPONENTS
// ================================

export interface QuestSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuestSelect: (questId: string) => void;
  availableQuests: Array<{
    id: string;
    title: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard' | 'epic';
    estimatedTime: number;
    rewards: {
      points: number;
      badges?: string[];
    };
  }>;
  userLevel?: number;
  className?: string;
}

// ================================
// BOARD TEMPLATE COMPONENTS
// ================================

export interface BoardTemplateProps {
  template: {
    id: string;
    name: string;
    description: string;
    columns: Array<{
      name: string;
      color: string;
      order: number;
    }>;
    category: string;
    isPopular?: boolean;
    isPremium?: boolean;
  };
  onSelect: (templateId: string) => void;
  isSelected?: boolean;
  className?: string;
}

export interface BoardTemplateGridProps {
  templates: Array<{
    id: string;
    name: string;
    description: string;
    columns: Array<{
      name: string;
      color: string;
      order: number;
    }>;
    category: string;
    isPopular?: boolean;
    isPremium?: boolean;
  }>;
  onTemplateSelect: (templateId: string) => void;
  selectedTemplateId?: string;
  filterCategory?: string;
  className?: string;
}

// ================================
// BOARD SETTINGS COMPONENTS
// ================================

export interface BoardSettingsProps {
  boardId: string;
  settings: {
    allowGuestAccess: boolean;
    autoArchiveCompleted: boolean;
    notificationSettings: {
      taskAssigned: boolean;
      taskCompleted: boolean;
      dueDateReminders: boolean;
    };
    appearance: {
      theme: string;
      showBackgroundImage: boolean;
      backgroundImageUrl?: string;
    };
  };
  onSettingsUpdate: (settings: any) => void;
  className?: string;
}

export interface BoardPermissionsProps {
  boardId: string;
  permissions: Array<{
    userId: string;
    userName: string;
    userEmail: string;
    role: 'owner' | 'admin' | 'member' | 'viewer';
    canEdit: boolean;
    canDelete: boolean;
    canInvite: boolean;
  }>;
  onPermissionUpdate: (userId: string, permissions: any) => void;
  onUserRemove: (userId: string) => void;
  className?: string;
}

// ================================
// DRAG AND DROP TYPES
// ================================

export interface DragItem {
  type: 'task' | 'column';
  id: string;
  index: number;
  sourceColumnId?: string;
}

export interface DropResult {
  draggedId: string;
  targetId: string;
  targetIndex: number;
  sourceColumnId?: string;
  targetColumnId?: string;
}

// ================================
// BOARD FILTERS AND SEARCH
// ================================

export interface BoardFiltersProps {
  filters: {
    assignees: string[];
    priorities: string[];
    tags: string[];
    dueDateRange?: {
      start: Date;
      end: Date;
    };
    completionStatus: 'all' | 'completed' | 'incomplete';
  };
  onFiltersChange: (filters: any) => void;
  availableAssignees: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
  availableTags: string[];
  className?: string;
}

export interface BoardSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchResults: TaskItemResponseDTO[];
  onResultClick: (task: TaskItemResponseDTO) => void;
  isSearching?: boolean;
  className?: string;
} 