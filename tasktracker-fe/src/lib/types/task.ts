/**
 * Task related types
 */

export enum TaskStatus {
  Todo = 'todo',
  InProgress = 'in-progress',
  Done = 'done'
}

export enum TaskPriority {
  Low = 'low',
  Medium = 'medium',
  High = 'high'
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

export interface Task {
  id: number;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  dueDate?: string;
  dueTime?: string;
  priority?: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface TaskFormData {
  title: string;
  description?: string | null;
  status: 'todo' | 'in-progress' | 'done';
  dueDate?: string | null;
  dueTime?: string | null;
  priority?: 'low' | 'medium' | 'high';
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