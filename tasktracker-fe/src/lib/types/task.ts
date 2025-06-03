/**
 * Task related types
 */

// Predefined task statuses (for backward compatibility)
export enum TaskStatus {
  Todo = 'todo',
  InProgress = 'in-progress',
  Done = 'done'
}

// Extended status type that supports custom statuses
export type TaskStatusType = TaskStatus | string;

// Status category type for custom statuses
export type TaskStatusCategory = 'pending' | 'active' | 'completed' | 'blocked' | 'custom';

// Custom status definition
export interface CustomTaskStatus {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  color: string;
  icon?: string;
  category: TaskStatusCategory;
  isSystemDefault: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

// Status group for organizing statuses
export interface StatusGroup {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  color: string;
  order: number;
  statuses: CustomTaskStatus[];
}

// Default status configurations
export const DEFAULT_STATUS_CONFIGURATIONS: CustomTaskStatus[] = [
  {
    id: 'todo',
    name: 'todo',
    displayName: 'To Do',
    description: 'Tasks that are not yet started',
    color: '#6B7280',
    icon: 'circle',
    category: 'pending',
    isSystemDefault: true,
    order: 0
  },
  {
    id: 'in-progress',
    name: 'in-progress',
    displayName: 'In Progress',
    description: 'Tasks that are currently being worked on',
    color: '#3B82F6',
    icon: 'play',
    category: 'active',
    isSystemDefault: true,
    order: 1
  },
  {
    id: 'done',
    name: 'done',
    displayName: 'Done',
    description: 'Tasks that have been completed',
    color: '#10B981',
    icon: 'check',
    category: 'completed',
    isSystemDefault: true,
    order: 2
  }
];

// Extended default status templates for different workflows
export const WORKFLOW_STATUS_TEMPLATES = {
  'software-development': [
    { id: 'backlog', name: 'backlog', displayName: 'Backlog', color: '#9CA3AF', category: 'pending' as const, order: 0 },
    { id: 'todo', name: 'todo', displayName: 'To Do', color: '#6B7280', category: 'pending' as const, order: 1 },
    { id: 'in-progress', name: 'in-progress', displayName: 'In Progress', color: '#3B82F6', category: 'active' as const, order: 2 },
    { id: 'code-review', name: 'code-review', displayName: 'Code Review', color: '#F59E0B', category: 'active' as const, order: 3 },
    { id: 'testing', name: 'testing', displayName: 'Testing', color: '#8B5CF6', category: 'active' as const, order: 4 },
    { id: 'done', name: 'done', displayName: 'Done', color: '#10B981', category: 'completed' as const, order: 5 }
  ],
  'marketing-campaign': [
    { id: 'ideas', name: 'ideas', displayName: 'Ideas', color: '#EC4899', category: 'pending' as const, order: 0 },
    { id: 'planning', name: 'planning', displayName: 'Planning', color: '#F59E0B', category: 'active' as const, order: 1 },
    { id: 'content-creation', name: 'content-creation', displayName: 'Content Creation', color: '#3B82F6', category: 'active' as const, order: 2 },
    { id: 'review', name: 'review', displayName: 'Review', color: '#8B5CF6', category: 'active' as const, order: 3 },
    { id: 'scheduled', name: 'scheduled', displayName: 'Scheduled', color: '#06B6D4', category: 'active' as const, order: 4 },
    { id: 'published', name: 'published', displayName: 'Published', color: '#10B981', category: 'completed' as const, order: 5 }
  ],
  'customer-support': [
    { id: 'new', name: 'new', displayName: 'New', color: '#EF4444', category: 'pending' as const, order: 0 },
    { id: 'assigned', name: 'assigned', displayName: 'Assigned', color: '#F59E0B', category: 'active' as const, order: 1 },
    { id: 'in-progress', name: 'in-progress', displayName: 'In Progress', color: '#3B82F6', category: 'active' as const, order: 2 },
    { id: 'waiting-customer', name: 'waiting-customer', displayName: 'Waiting for Customer', color: '#8B5CF6', category: 'blocked' as const, order: 3 },
    { id: 'escalated', name: 'escalated', displayName: 'Escalated', color: '#DC2626', category: 'blocked' as const, order: 4 },
    { id: 'resolved', name: 'resolved', displayName: 'Resolved', color: '#10B981', category: 'completed' as const, order: 5 }
  ],
  'project-management': [
    { id: 'not-started', name: 'not-started', displayName: 'Not Started', color: '#9CA3AF', category: 'pending' as const, order: 0 },
    { id: 'planning', name: 'planning', displayName: 'Planning', color: '#F59E0B', category: 'active' as const, order: 1 },
    { id: 'in-progress', name: 'in-progress', displayName: 'In Progress', color: '#3B82F6', category: 'active' as const, order: 2 },
    { id: 'on-hold', name: 'on-hold', displayName: 'On Hold', color: '#8B5CF6', category: 'blocked' as const, order: 3 },
    { id: 'review', name: 'review', displayName: 'Review', color: '#06B6D4', category: 'active' as const, order: 4 },
    { id: 'completed', name: 'completed', displayName: 'Completed', color: '#10B981', category: 'completed' as const, order: 5 }
  ]
};

// Status management interfaces
export interface CreateCustomStatusRequest {
  name: string;
  displayName: string;
  description?: string;
  color: string;
  icon?: string;
  category: TaskStatusCategory;
  order?: number;
}

export interface UpdateCustomStatusRequest {
  displayName?: string;
  description?: string;
  color?: string;
  icon?: string;
  category?: TaskStatusCategory;
  order?: number;
}

export interface StatusTransitionRule {
  id: string;
  fromStatus: string;
  toStatus: string;
  isAllowed: boolean;
  requiresPermission?: string;
  autoTransitionConditions?: string[];
}

export enum TaskPriority {
  Low = 0,
  Medium = 1,
  High = 2,
  Critical = 3
}

// String-based priority enum for frontend display
export enum TaskPriorityString {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
  Critical = 'critical'
}

// Backend API uses different numeric values for priority
export enum ApiTaskPriority {
  Low = 0,
  Medium = 1,
  High = 2
}

export enum ApiTaskStatus {
  NotStarted = 0,
  InProgress = 1,
  Completed = 2
}

// Task Categories for organizing tasks
export interface TaskCategory {
  id: number;
  name: string;
  description?: string;
  color?: string; // hex color code for UI display
  icon?: string; // icon name/identifier
  parentId?: number; // For hierarchical categories
  createdAt?: string;
  updatedAt?: string;
}

// Task Template for creating reusable tasks
export interface TaskTemplate {
  id: number;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  estimatedDuration?: number; // in minutes
  categoryId?: number;
  tags?: string[];
  createdBy?: string;
  isPublic?: boolean; // whether template is available to all users
  isDefault?: boolean; // whether it's a system default template
  createdAt?: string;
  updatedAt?: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: TaskStatusType;
  priority: string;
  dueDate?: string;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
  assignedTo?: string;
  assignedToName?: string;
  assignedAt?: string;
  requiresApproval?: boolean;
  approvedBy?: string;
  approvedAt?: string;
  completedAt?: string;
  tags?: string[];
  version?: number;
  categoryId?: number;
  templateId?: number;
  progressPercentage?: number;
  estimatedTimeMinutes?: number;
  actualTimeSpentMinutes?: number;
}

export interface TaskFormData {
  title: string;
  description?: string | null;
  status: TaskStatusType;
  dueDate?: string | null;
  dueTime?: string | null;
  priority?: number;
  categoryId?: number;
  templateId?: number;
}

// For frontend use
export interface CreateTaskRequest {
  title: string;
  description?: string;
  status?: TaskStatusType;
  priority?: TaskPriority;
  dueDate?: string;
  categoryId?: number;
  boardId?: number;
  templateId?: number;
}

// For API use - matches the API's expected capitalization and types
export interface ApiCreateTaskRequest {
  Title: string;
  Description?: string | null;
  Status: number;
  Priority: number;
  DueDate?: string | null;
  DueTime?: string | null;
  IsRecurring?: boolean;
  CategoryId?: number;
  BoardId?: number;
  TemplateId?: number;
}

// Quick task DTO for the API, with minimal fields
export interface QuickTaskDTO {
  Title: string;
  Description?: string | null;
  DueDate?: string | null;
  Priority?: number;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatusType;
  priority?: TaskPriority;
  dueDate?: string;
  categoryId?: number;
  boardId?: number;
  
  Title?: string;
  Description?: string | null;
  Status?: TaskStatusType | number;
  Priority?: TaskPriority | number;
  DueDate?: string | null;
  CategoryId?: number;
  BoardId?: number;
}

export interface TaskQueryParams {
  status?: TaskStatusType;
  priority?: TaskPriority;
  categoryId?: number;
  boardId?: number;
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  due?: 'today' | 'week' | 'overdue';
  tags?: string[];
}

export interface TaskCreateInput {
  title: string;
  description?: string;
  status?: TaskStatusType;
  priority?: string;
  dueDate?: string;
  categoryId?: number;
  templateId?: number;
}

export interface TaskUpdateInput {
  title?: string;
  description?: string;
  status?: TaskStatusType;
  priority?: string;
  dueDate?: string;
  categoryId?: number;
}

export interface TaskHistoryItem {
  id: number;
  taskId: number;
  action: string;
  timestamp: string;
  performedBy: string;
  performedByName?: string;
  previousValue?: string;
  newValue?: string;
}

// Create template from existing task
export interface SaveAsTemplateInput {
  taskId?: number;
  title: string;
  description?: string;
  categoryId?: number;
  isPublic?: boolean;
}

// Interface for creating a new template directly
export interface CreateTemplateInput {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  estimatedDuration?: number;
  categoryId?: number;
  tags?: string[];
  isPublic?: boolean;
}

export interface TemplateSummary {
  id: number;
  title: string;
  categoryId?: number;
  categoryName?: string;
  isPublic: boolean;
  isDefault: boolean;
  timesUsed?: number;
}

// Task Priority Management Types
export interface PriorityAdjustment {
  taskId: number;
  taskTitle: string;
  previousPriority: TaskPriority;
  newPriority: TaskPriority;
  adjustmentReason: string;
}

export interface PriorityAdjustmentSummary {
  totalTasksEvaluated: number;
  tasksAdjusted: number;
  upgradedTasks: number;
  downgradedTasks: number;
  adjustmentTimestamp: string;
  adjustments: PriorityAdjustment[];
}

export interface PrioritizedTask {
  id: number;
  title: string;
  description?: string;
  priority: string;
  dueDate?: string;
  status: TaskStatusType;
  priorityScore: number;
}

// Task Assignment and Approval Types
export interface TaskAssignmentDTO {
  taskId: number;
  assignToUserId: string;
  requiresApproval: boolean;
}

export interface TaskApprovalDTO {
  taskId: number;
  approved: boolean;
  feedback: string;
} 