/**
 * Task related types
 */

export enum TaskStatus {
  Todo = 'todo',
  InProgress = 'in-progress',
  Done = 'done'
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
  status: string; // 'todo', 'in-progress', 'done'
  priority: string; // 'low', 'medium', 'high'
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
  version?: number; // Version for concurrency control
  categoryId?: number; // Reference to category
  templateId?: number; // If created from a template
  progressPercentage?: number; // Task completion progress (0-100)
  estimatedTimeMinutes?: number; // Estimated time to complete
  actualTimeSpentMinutes?: number; // Actual time spent from focus sessions
}

export interface TaskFormData {
  title: string;
  description?: string | null;
  status: 'todo' | 'in-progress' | 'done';
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
  status?: TaskStatus;
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
  // camelCase properties (for frontend)
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  categoryId?: number;
  boardId?: number;
  
  // PascalCase properties (for C# backend)
  Title?: string;
  Description?: string | null;
  Status?: TaskStatus | number;
  Priority?: TaskPriority | number;
  DueDate?: string | null;
  CategoryId?: number;
  BoardId?: number;
}

export interface TaskQueryParams {
  status?: TaskStatus;
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
  status?: string;
  priority?: string;
  dueDate?: string;
  categoryId?: number;
  templateId?: number;
}

export interface TaskUpdateInput {
  title?: string;
  description?: string;
  status?: string;
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
  timesUsed?: number; // Stats on template usage
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
  status: string;
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