/**
 * Task Service
 * 
 * Handles interactions with task-related API endpoints
 */

import { apiService, ApiResponse } from './api';

// Task types
export enum TaskStatus {
  NotStarted = 'NotStarted',
  InProgress = 'InProgress',
  Completed = 'Completed',
  OnHold = 'OnHold',
  Cancelled = 'Cancelled'
}

export enum TaskPriority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Critical = 'Critical'
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  categoryId?: number;
  categoryName?: string;
  boardId?: number;
  boardName?: string;
  createdAt: string;
  updatedAt?: string;
  completedAt?: string;
  tags?: string[];
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

/**
 * Service for managing tasks
 */
class TaskService {
  /**
   * Get all tasks with optional filtering
   */
  async getTasks(params?: TaskQueryParams): Promise<ApiResponse<Task[]>> {
    // Convert params to query string
    let queryString = '';
    if (params) {
      const searchParams = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => searchParams.append(`${key}[]`, v));
          } else {
            searchParams.append(key, value.toString());
          }
        }
      });
      
      queryString = searchParams.toString();
    }
    
    return apiService.get<Task[]>(`/v1/taskitems${queryString ? `?${queryString}` : ''}`);
  }
  
  /**
   * Get a single task by ID
   */
  async getTask(id: number): Promise<ApiResponse<Task>> {
    return apiService.get<Task>(`/v1/taskitems/${id}`);
  }
  
  /**
   * Create a new task
   */
  async createTask(task: CreateTaskRequest): Promise<ApiResponse<Task>> {
    return apiService.post<Task>('/v1/taskitems', task);
  }
  
  /**
   * Update an existing task
   */
  async updateTask(id: number, task: UpdateTaskRequest): Promise<ApiResponse<Task>> {
    return apiService.put<Task>(`/v1/taskitems/${id}`, task);
  }
  
  /**
   * Delete a task
   */
  async deleteTask(id: number): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`/v1/taskitems/${id}`);
  }
  
  /**
   * Mark a task as complete
   */
  async completeTask(id: number): Promise<ApiResponse<Task>> {
    return apiService.patch<Task>(`/v1/taskitems/${id}/complete`, {});
  }
  
  /**
   * Get upcoming/due tasks
   */
  async getDueTasks(): Promise<ApiResponse<Task[]>> {
    return apiService.get<Task[]>('/v1/taskitems?due=today');
  }
  
  /**
   * Get task statistics
   */
  async getTaskStatistics(): Promise<ApiResponse<any>> {
    return apiService.get<any>('/v1/taskstatistics/summary');
  }
}

// Export singleton instance
export const taskService = new TaskService(); 