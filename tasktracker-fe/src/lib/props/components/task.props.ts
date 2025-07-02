/*
 * Task Component Props - Moved from lib/types/task.ts for .cursorrules compliance
 * lib/props/components/task.props.ts
 * Copyright (c) 2025 Carlos Abril Jr
 */

import { User } from '@/lib/types/auth';
import { FamilyMemberDTO } from '@/lib/types/family';
import { BoardColumnDTO } from '@/lib/types/boards';
import type { 
  Task, 
  TaskStats, 
  TaskCategory 
} from '@/lib/interfaces/api/task.interface';

// === TASK COMPONENT PROPS ===

export interface TasksPageContentProps {
  user: User | null;
  initialData: {
    tasks: Task[];
    categories: TaskCategory[];
    stats: TaskStats;
  };
}

export interface TaskDetailProps {
  taskId: number;
  user: User;
  onTaskUpdated?: (task: Task) => void;
  onTaskDeleted?: (taskId: number) => void;
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
  onTaskStatusChange?: (taskId: number, status: import('@/lib/types/tasks').TaskItemStatus) => void;
  onTaskMove?: (taskId: number, fromColumn: string, toColumn: string, position: number) => void;
  onBatchOperation?: (operation: string, taskIds: number[]) => void;
  onExport?: (format: 'csv' | 'excel' | 'json' | 'pdf') => void;
  onImport?: (file: File) => void;
  onViewModeChange?: (mode: import('@/lib/interfaces/components/task-management.interface').ViewMode) => void;
  onRefresh?: () => void;
  className?: string;
} 
