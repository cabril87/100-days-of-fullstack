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

export interface Task {
  id: number;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  dueDate?: string;
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
  priority?: 'low' | 'medium' | 'high';
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  categoryId?: number;
  boardId?: number;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  categoryId?: number;
  boardId?: number;
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