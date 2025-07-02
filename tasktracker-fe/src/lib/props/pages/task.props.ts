/*
 * Task Page Component Props
 * Copyright (c) 2025 Carlos Abril Jr
 * 
 * All task page prop interfaces following .cursorrules standards
 * Extracted from lib/types/ and properly organized in lib/props/
 */

import { User } from '@/lib/types/auth';
import { Task, TaskStats, ViewMode } from '@/lib/types/tasks';
import { FamilyMemberDTO } from '@/lib/types/family';
import { BoardDTO, BoardColumnDTO } from '@/lib/types/boards';

import { TaskItemStatus } from '@/lib/types/tasks';

// ================================
// TASK PAGE PROPS
// ================================

export interface TasksPageContentProps {
  user: User | null;
  tasks: Task[];
  familyMembers: FamilyMemberDTO[];
  boards: BoardDTO[];
  stats: {
    totalTasks: number;
    completedTasks: number;
    activeTasks: number;
    overdueTasks: number;
  };
  isLoading?: boolean;
  onTaskCreate?: (task: Task) => void;
  onTaskUpdate?: (task: Task) => void;
  onTaskDelete?: (taskId: number) => void;
  onTaskMove?: (taskId: number, columnId: number) => void;
  onBoardChange?: (boardId: number) => void;
  onViewChange?: (view: ViewMode) => void;
  selectedBoard?: number;
  viewMode?: ViewMode;
  enableRealTime?: boolean;
  enableOfflineMode?: boolean;
  enableAnalytics?: boolean;
  enableGamification?: boolean;
  enableMobileOptimizations?: boolean;
  className?: string;
}

export interface TaskDetailProps {
  task: Task;
  onUpdate: (task: Task) => void;
  onDelete: (taskId: number) => void;
  onClose: () => void;
  familyMembers?: FamilyMemberDTO[];
  boards?: BoardDTO[];
  isEditing?: boolean;
  enableComments?: boolean;
  enableSubtasks?: boolean;
  enableTimeTracking?: boolean;
  enableFileAttachments?: boolean;
  className?: string;
}

export interface EnterpriseTaskManagerProps {
  tasks: Task[];
  columns: BoardColumnDTO[];
  familyMembers: FamilyMemberDTO[];
  stats: TaskStats;
  isLoading?: boolean;
  enableAdvancedFeatures?: boolean;
  enableBatchOperations?: boolean;
  enableRealTimeSync?: boolean;
  enableOfflineMode?: boolean;
  enableAnalytics?: boolean;
  onTaskCreate?: (columnId?: string) => void;
  onTaskEdit?: (task: Task) => void;
  onTaskDelete?: (taskId: number) => void;
  onTaskStatusChange?: (taskId: number, status: TaskItemStatus) => void;
  onTaskMove?: (taskId: number, fromColumn: string, toColumn: string, position: number) => void;
  onBatchOperation?: (operation: string, taskIds: number[]) => void;
  onExport?: (format: 'csv' | 'excel' | 'json' | 'pdf') => void;
  onImport?: (file: File) => void;
  onViewModeChange?: (mode: ViewMode) => void;
  onRefresh?: () => void;
  className?: string;
} 
