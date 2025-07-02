/*
 * Board Component Props
 * Copyright (c) 2025 Carlos Abril Jr
 * 
 * All board component prop interfaces following .cursorrules standards
 * Extracted from lib/types/ and properly organized in lib/props/
 */

import { BoardColumnDTO, BoardDTO } from '@/lib/types/boards';
import { TaskItemResponseDTO } from '@/lib/types/tasks';
import React from 'react';

// ================================
// BASIC BOARD COLUMN COMPONENTS
// ================================

export interface BoardColumnProps {
  column: BoardColumnDTO;
  tasks: TaskItemResponseDTO[];
  onCreateTask?: (columnId: string) => void;
  className?: string;
}

// ================================
// ENHANCED KANBAN BOARD COMPONENTS
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
// ================================

export interface EnhancedSortableColumnItemProps {
  column: BoardColumnDTO;
  index: number;
  onMove: (dragIndex: number, hoverIndex: number) => void;
  onUpdate: (column: BoardColumnDTO) => void;
  onDelete: (columnId: string) => void;
  className?: string;
}

// ================================
// MOBILE KANBAN COMPONENTS
// ================================

export interface MobileKanbanProps {
  columns: Array<{
    id: string;
    name: string;
    color?: string;
    order: number;
    isCollapsed?: boolean;
    customColor?: string;
    taskCount?: number;
    completionRate?: number;
  }>;
  tasks: Array<{
    id: number;
    title: string;
    description?: string;
    priority?: string;
    dueDate?: string;
    assignedToUserId?: number;
    pointsValue?: number;
    completedAt?: string;
    isExpanded?: boolean;
    isDragging?: boolean;
    attachmentCount?: number;
    commentCount?: number;
    subtaskCount?: number;
    completedSubtasks?: number;
  }>;
  familyMembers: Array<{
    id: number;
    userId: number;
    user: {
      firstName?: string;
      username?: string;
    };
  }>;
  isLoading?: boolean;
  enableTouchGestures?: boolean;
  enableColumnCollapse?: boolean;
  enableQuickActions?: boolean;
  enableBatchOperations?: boolean;
  enableOfflineSync?: boolean;
  maxColumnsVisible?: number;
  onTaskMove?: (taskId: number, fromColumn: string, toColumn: string, position: number) => void;
  onColumnReorder?: (columnIds: string[]) => void;
  onTaskCreate?: (columnId: string) => void;
  onTaskEdit?: (task: unknown) => void;
  onTaskDelete?: (taskId: number) => void;
  onColumnEdit?: (column: unknown) => void;
  onBatchOperation?: (operation: string, taskIds: number[]) => void;
  onViewModeChange?: (mode: 'columns' | 'swimlanes' | 'cards' | 'compact') => void;
  className?: string;
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
  onSettingsUpdate: (settings: Record<string, unknown>) => void;
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
  onPermissionUpdate: (userId: string, permissions: Record<string, unknown>) => void;
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
  destination: {
    droppableId: string;
    index: number;
  };
  source: {
    droppableId: string;
    index: number;
  };
  type: 'task' | 'column';
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
  onFiltersChange: (filters: Record<string, unknown>) => void;
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

// ================================
// ADDITIONAL BOARD TYPES
// ================================

export interface ColumnFormData extends BoardColumnDTO {
  tempId?: string;
}

export interface CustomColumn {
  id: string;
  name: string;
  color: string;
  order: number;
  isDefault: boolean;
}

export interface SortableColumnProps extends EnhancedBoardColumnProps {
  isDragging?: boolean;
  dragOverlay?: boolean;
}

export interface DuplicateTaskInfo {
  id: number;
  title: string;
  boardName: string;
  columnName: string;
}

export interface EnhancedTemplate {
  name: string;
  description: string;
  category: 'basic' | 'family' | 'education' | 'health' | 'events' | 'financial' | 'seasonal';
  tags: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  estimatedSetupTime?: string;
  recommendedFor: string[];
  isPopular?: boolean;
}

// ============================================================================
// BOARD TAB COMPONENT PROPS
// ============================================================================

export interface BoardTabsProps {
  boardId: number;
  initialTab?: string;
  className?: string;
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  tabs?: Array<{ id: string; label: string; icon?: React.ReactNode }>;
  showBadges?: boolean;
  disabled?: boolean;
}

export interface BoardTabContentProps {
  board?: BoardDTO;
  onBoardUpdate?: () => Promise<void>;
  onBoardDelete?: () => void;
  className?: string;
  tabId?: string;
  isActive?: boolean;
  children?: React.ReactNode;
  loading?: boolean;
  error?: string;
}

export interface SettingsTabContentProps {
  className?: string;
  boardId: number;
  settings: Record<string, unknown>;
  onSettingsChange: (settings: Record<string, unknown>) => void;
  showAdvanced?: boolean;
  readOnly?: boolean;
}

export interface ColumnsTabContentProps {
  className?: string;
  boardId: number;
  columns: Array<Record<string, unknown>>;
  onColumnAdd: (column: Record<string, unknown>) => void;
  onColumnEdit: (columnId: number, column: Record<string, unknown>) => void;
  onColumnDelete: (columnId: number) => void;
  onColumnReorder: (fromIndex: number, toIndex: number) => void;
  maxColumns?: number;
}

export interface TabNavigationProps {
  className?: string;
  tabs: Array<{ id: string; label: string; badge?: string | number }>;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  orientation?: 'horizontal' | 'vertical';
  variant?: 'default' | 'pills' | 'underline';
}

export interface MobileTabBarProps {
  className?: string;
  tabs: Array<{ id: string; label: string; icon?: React.ReactNode }>;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  position?: 'top' | 'bottom';
  showLabels?: boolean;
}

// ============================================================================
// BOARD LAYOUT COMPONENT PROPS
// ============================================================================

export interface BoardLayoutProps {
  className?: string;
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  showSidebar?: boolean;
  sidebarCollapsed?: boolean;
  onSidebarToggle?: () => void;
}

export interface BoardHeaderProps {
  className?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  showBackButton?: boolean;
  onBack?: () => void;
}

export interface BoardSidebarProps {
  className?: string;
  children: React.ReactNode;
  collapsed?: boolean;
  onToggle?: () => void;
  width?: number;
  position?: 'left' | 'right';
}

// ============================================================================
// BOARD CONTENT COMPONENT PROPS
// ============================================================================

export interface BoardContentProps {
  className?: string;
  boardId: number;
  view: 'kanban' | 'table' | 'calendar' | 'timeline';
  onViewChange: (view: string) => void;
  filters?: Record<string, unknown>;
  onFiltersChange?: (filters: Record<string, unknown>) => void;
  showFilters?: boolean;
  showSearch?: boolean;
}

export interface KanbanViewProps {
  className?: string;
  boardId: number;
  columns: Array<Record<string, unknown>>;
  tasks: Array<Record<string, unknown>>;
  onTaskMove: (taskId: number, columnId: number, position: number) => void;
  onTaskClick?: (task: Record<string, unknown>) => void;
  onColumnEdit?: (column: Record<string, unknown>) => void;
  enableDragDrop?: boolean;
}

export interface TableViewProps {
  className?: string;
  boardId: number;
  tasks: Array<Record<string, unknown>>;
  columns: Array<{ key: string; label: string; sortable?: boolean }>;
  onTaskClick?: (task: Record<string, unknown>) => void;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  selectable?: boolean;
  onSelectionChange?: (selectedIds: number[]) => void;
} 
