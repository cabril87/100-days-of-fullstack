/*
 * Tasks Component Interfaces
 * Centralized interface definitions for task-related components
 * Extracted from components/tasks/ for .cursorrules compliance
 */

import { Task, TaskItemStatus, CreateTaskDTO, FamilyTaskItemDTO } from '@/lib/types/tasks';
import { FamilyMemberDTO } from '@/lib/types/family';

// ================================
// TASK CREATION INTERFACES
// ================================

export interface TaskCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated?: (task: Task) => void;
  familyMembers?: FamilyMemberDTO[];
  defaultFamily?: number;
  defaultAssignee?: number;
  prefilledData?: Partial<CreateTaskDTO>;
  mode?: 'individual' | 'family' | 'template';
  className?: string;
}

export interface CreateTaskFormProps {
  onSubmit: (data: CreateTaskDTO) => void;
  onCancel?: () => void;
  familyMembers?: FamilyMemberDTO[];
  isLoading?: boolean;
  errors?: Record<string, string>;
  defaultValues?: Partial<CreateTaskDTO>;
  showFamilyFields?: boolean;
  showAdvancedOptions?: boolean;
  className?: string;
}

// ================================
// TASK DETAIL INTERFACES
// ================================

export interface TaskDetailsProps {
  taskId: number;
  task?: Task;
  onTaskUpdate?: (task: Task) => void;
  onTaskDelete?: (taskId: number) => void;
  onTaskComplete?: (taskId: number) => void;
  familyMembers?: FamilyMemberDTO[];
  showFamilyInfo?: boolean;
  showTimeTracking?: boolean;
  className?: string;
}

export interface TaskEditFormProps {
  task: Task;
  onSave: (updates: Partial<Task>) => void;
  onCancel: () => void;
  familyMembers?: FamilyMemberDTO[];
  isLoading?: boolean;
  errors?: Record<string, string>;
  className?: string;
}

// ================================
// TASK TABLE INTERFACES
// ================================

export interface TaskTableProps {
  tasks: Task[];
  familyMembers?: FamilyMemberDTO[];
  onTaskSelect?: (task: Task) => void;
  onTaskEdit?: (task: Task) => void;
  onTaskDelete?: (taskId: number) => void;
  onTaskStatusChange?: (taskId: number, status: TaskItemStatus) => void;
  onTaskComplete?: (taskId: number) => void;
  selectable?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  columns?: string[];
  className?: string;
}

export interface TaskRowProps {
  task: Task;
  familyMembers?: FamilyMemberDTO[];
  onSelect?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onStatusChange?: (status: TaskItemStatus) => void;
  isSelected?: boolean;
  showActions?: boolean;
  compact?: boolean;
  className?: string;
}

// ================================
// TASK CARD INTERFACES
// ================================

export interface TaskCardProps {
  task: Task;
  onUpdate?: (updates: Partial<Task>) => void;
  onDelete?: () => void;
  onComplete?: () => void;
  onAssign?: (userId: number) => void;
  familyMembers?: FamilyMemberDTO[];
  variant?: 'default' | 'compact' | 'detailed' | 'kanban';
  showActions?: boolean;
  showFamily?: boolean;
  showProgress?: boolean;
  draggable?: boolean;
  className?: string;
}

export interface TaskCardActionsProps {
  task: Task;
  onEdit?: () => void;
  onDelete?: () => void;
  onComplete?: () => void;
  onDuplicate?: () => void;
  onAssign?: () => void;
  disabled?: boolean;
  compact?: boolean;
  className?: string;
}

// ================================
// TASK ASSIGNMENT INTERFACES
// ================================

export interface TaskAssignmentProps {
  task: Task;
  familyMembers: FamilyMemberDTO[];
  onAssign: (userId: number, requiresApproval?: boolean) => void;
  onUnassign?: () => void;
  currentUserId: number;
  showApprovalOption?: boolean;
  className?: string;
}

export interface BulkTaskAssignmentProps {
  tasks: Task[];
  familyMembers: FamilyMemberDTO[];
  onAssign: (taskIds: number[], userId: number, requiresApproval?: boolean) => void;
  onClose: () => void;
  isOpen: boolean;
  className?: string;
}

// ================================
// TASK FILTERING INTERFACES
// ================================

export interface TaskFiltersProps {
  onFilterChange: (filters: TaskFilter[]) => void;
  onClearFilters?: () => void;
  familyMembers?: FamilyMemberDTO[];
  availableCategories?: Array<{ id: number; name: string }>;
  activeFilters?: TaskFilter[];
  showAdvanced?: boolean;
  className?: string;
}

export interface TaskFilter {
  id: string;
  type: 'status' | 'priority' | 'assignee' | 'dueDate' | 'category' | 'family' | 'tags';
  label: string;
  value: string | number | Date | string[];
  operator?: 'equals' | 'contains' | 'before' | 'after' | 'in';
  isActive: boolean;
}

export interface TaskSortProps {
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  onSortChange: (field: string, direction: 'asc' | 'desc') => void;
  availableFields: Array<{
    key: string;
    label: string;
    sortable: boolean;
  }>;
  className?: string;
}

// ================================
// TASK COMPLETION INTERFACES
// ================================

export interface TaskCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  onComplete: (data: TaskCompletionData) => void;
  showTimeTracking?: boolean;
  showNotes?: boolean;
  showAchievements?: boolean;
  className?: string;
}

export interface TaskCompletionData {
  taskId: number;
  actualTimeMinutes?: number;
  completionNotes?: string;
  achievement?: {
    name: string;
    points: number;
    icon: string;
  };
}

export interface TaskProgressProps {
  task: Task;
  onProgressUpdate?: (percentage: number, notes?: string) => void;
  showPercentage?: boolean;
  showNotes?: boolean;
  editable?: boolean;
  className?: string;
}

// ================================
// BATCH OPERATIONS INTERFACES
// ================================

export interface BatchTaskOperationsProps {
  selectedTasks: Task[];
  onOperation: (operation: string, taskIds: number[], data?: unknown) => void;
  onClearSelection?: () => void;
  familyMembers?: FamilyMemberDTO[];
  availableOperations?: string[];
  className?: string;
}

export interface BulkTaskEditorProps {
  tasks: Task[];
  onSave: (updates: Partial<Task>) => void;
  onCancel: () => void;
  familyMembers?: FamilyMemberDTO[];
  editableFields?: string[];
  className?: string;
}

// ================================
// TASK TEMPLATES INTERFACES
// ================================

export interface TaskTemplateProps {
  template: {
    id: number;
    name: string;
    description: string;
    tasks: Partial<CreateTaskDTO>[];
    category: string;
    isPublic: boolean;
  };
  onUseTemplate?: (templateId: number) => void;
  onEditTemplate?: (templateId: number) => void;
  onDeleteTemplate?: (templateId: number) => void;
  showActions?: boolean;
  className?: string;
}

export interface TaskTemplateCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: TaskTemplate) => void;
  existingTemplate?: TaskTemplate;
  className?: string;
}

export interface TaskTemplate {
  id?: number;
  name: string;
  description: string;
  category: string;
  tasks: Partial<CreateTaskDTO>[];
  isPublic: boolean;
  tags: string[];
}

// ================================
// TASK COLLABORATION INTERFACES
// ================================

export interface FamilyTaskManagementProps {
  familyId: number;
  tasks: FamilyTaskItemDTO[];
  familyMembers: FamilyMemberDTO[];
  onTaskUpdate?: (taskId: number, updates: Partial<FamilyTaskItemDTO>) => void;
  onTaskAssign?: (taskId: number, memberId: number) => void;
  onTaskApprove?: (taskId: number) => void;
  onTaskCreate?: (task: CreateTaskDTO) => void;
  currentUserId: number;
  className?: string;
}

export interface TaskApprovalProps {
  task: FamilyTaskItemDTO;
  onApprove: () => void;
  onReject?: (reason?: string) => void;
  showNotes?: boolean;
  className?: string;
}

// ================================
// TASK ANALYTICS INTERFACES
// ================================

export interface TaskAnalyticsProps {
  tasks: Task[];
  timeframe?: 'day' | 'week' | 'month' | 'year';
  metrics?: Array<{
    key: string;
    label: string;
    value: number;
    change?: number;
    trend?: 'up' | 'down' | 'stable';
  }>;
  onTimeframeChange?: (timeframe: string) => void;
  className?: string;
}

export interface TaskDistributionProps {
  tasks: Task[];
  groupBy: 'status' | 'priority' | 'assignee' | 'category' | 'family';
  chartType?: 'pie' | 'bar' | 'doughnut';
  showPercentages?: boolean;
  className?: string;
} 
