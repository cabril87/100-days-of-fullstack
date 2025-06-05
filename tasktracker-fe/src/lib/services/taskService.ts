/*
 * Task API Service
 * Copyright (c) 2025 Carlos Abril Jr
 */

import { Task, CreateTaskDTO, UpdateTaskDTO, TaskStats, ApiResponse, BackendTaskStatsResponse } from '../types/task';

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const API_VERSION = 'v1';

// Helper function to get auth headers
const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

// Custom error class for API errors
export class TaskApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'TaskApiError';
  }
}

// Helper function to handle API responses
async function handleApiResponse<T>(response: Response, allowNotFound: boolean = false): Promise<T | null> {
  if (!response.ok) {
    if (response.status === 404 && allowNotFound) {
      return null;
    }
    
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new TaskApiError(
      errorData.message || `HTTP ${response.status}`,
      response.status,
      errorData.code,
      errorData.errors
    );
  }
  
  return response.json();
}

export class TaskService {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/api/${API_VERSION}`;
  }

  /**
   * Get user's task statistics for dashboard
   */
  async getUserTaskStats(): Promise<TaskStats> {
        try {
        const response = await fetch(
          `${this.baseUrl}/taskitems/statistics`,
        {
          method: 'GET',
          headers: getAuthHeaders(),
        }
      );

      const result = await handleApiResponse<ApiResponse<BackendTaskStatsResponse>>(response, true);
      
      if (result && result.data) {
        const backendData = result.data;
        return {
          tasksCompleted: backendData.completedTasks || 0,
          tasksCompletedThisWeek: backendData.completedTasksThisWeek || 0,
          activeGoals: backendData.activeGoals || 0,
          focusTimeToday: backendData.focusTimeToday || 0,
          streakDays: backendData.streakDays || 0,
          totalPoints: backendData.totalPoints || 0
        };
      }
      
      return {
        tasksCompleted: 0,
        tasksCompletedThisWeek: 0,
        activeGoals: 0,
        focusTimeToday: 0,
        streakDays: 0,
        totalPoints: 0
      };
    } catch (error) {
      console.error('Failed to fetch user task stats:', error);
      // Return mock data for development
      return {
        tasksCompleted: 12,
        tasksCompletedThisWeek: 5,
        activeGoals: 0,
        focusTimeToday: 0,
        streakDays: 3,
        totalPoints: 340
      };
    }
  }

  /**
   * Get user's recent tasks
   */
  async getRecentTasks(limit: number = 10): Promise<Task[]> {
    const response = await fetch(
      `${this.baseUrl}/taskitems?limit=${limit}`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    const result = await handleApiResponse<Task[]>(response, true);
    return result || [];
  }

  /**
   * Get family task statistics
   */
  async getFamilyTaskStats(familyId: number): Promise<{
    totalTasks: number;
    completedTasks: number;
    totalPoints: number;
    memberStats: { memberId: number; memberName: string; tasksCompleted: number; pointsEarned: number; }[];
  }> {
    const response = await fetch(
      `${this.baseUrl}/taskitems/family/${familyId}/stats`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    const result = await handleApiResponse<{
      totalTasks: number;
      completedTasks: number;
      totalPoints: number;
      memberStats: { memberId: number; memberName: string; tasksCompleted: number; pointsEarned: number; }[];
    }>(response, true);

    return result || {
      totalTasks: 0,
      completedTasks: 0,
      totalPoints: 0,
      memberStats: []
    };
  }

  /**
   * Create a new task
   */
  async createTask(taskData: CreateTaskDTO): Promise<Task> {
    const response = await fetch(
      `${this.baseUrl}/taskitems`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(taskData),
      }
    );

    const result = await handleApiResponse<Task>(response);
    if (!result) {
      throw new TaskApiError('Failed to create task', 500);
    }
    return result;
  }

  /**
   * Update a task
   */
  async updateTask(taskId: number, taskData: UpdateTaskDTO): Promise<Task> {
    const response = await fetch(
      `${this.baseUrl}/taskitems/${taskId}`,
      {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(taskData),
      }
    );

    const result = await handleApiResponse<Task>(response);
    if (!result) {
      throw new TaskApiError('Failed to update task', 500);
    }
    return result;
  }

  /**
   * Complete a task
   */
  async completeTask(taskId: number): Promise<Task> {
    const response = await fetch(
      `${this.baseUrl}/taskitems/${taskId}/complete`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
      }
    );

    const result = await handleApiResponse<Task>(response);
    if (!result) {
      throw new TaskApiError('Failed to complete task', 500);
    }
    return result;
  }

  /**
   * Delete a task
   */
  async deleteTask(taskId: number): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/taskitems/${taskId}`,
      {
        method: 'DELETE',
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new TaskApiError('Failed to delete task', response.status);
    }
  }
}

// Export singleton instance
export const taskService = new TaskService(); 