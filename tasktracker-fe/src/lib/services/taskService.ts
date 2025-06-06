/*
 * Task API Service
 * Copyright (c) 2025 Carlos Abril Jr
 */

import { Task, CreateTaskDTO, UpdateTaskDTO, TaskStats, ApiResponse, BackendTaskStatsResponse } from '../types/task';
import { apiClient } from '../config/api-client';

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



export class TaskService {

  /**
   * Get user's task statistics for dashboard
   */
  async getUserTaskStats(): Promise<TaskStats> {
    try {
      const result = await apiClient.get<ApiResponse<BackendTaskStatsResponse>>('/api/v1/taskitems/statistics');
      
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
      
      // Return default values instead of mock data
      return {
        tasksCompleted: 0,
        tasksCompletedThisWeek: 0,
        activeGoals: 0,
        focusTimeToday: 0,
        streakDays: 0,
        totalPoints: 0
      };
    }
  }

  /**
   * Get user's recent tasks
   */
  async getRecentTasks(limit: number = 10): Promise<Task[]> {
    try {
      const result = await apiClient.get<Task[]>(`/api/v1/taskitems?limit=${limit}`);
      return result || [];
    } catch (error) {
      console.error('Failed to fetch recent tasks:', error);
      return [];
    }
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
    try {
      const result = await apiClient.get<{
        totalTasks: number;
        completedTasks: number;
        totalPoints: number;
        memberStats: { memberId: number; memberName: string; tasksCompleted: number; pointsEarned: number; }[];
      }>(`/api/v1/taskitems/family/${familyId}/stats`);

      return result || {
        totalTasks: 0,
        completedTasks: 0,
        totalPoints: 0,
        memberStats: []
      };
    } catch (error) {
      console.error('Failed to fetch family task stats:', error);
      return {
        totalTasks: 0,
        completedTasks: 0,
        totalPoints: 0,
        memberStats: []
      };
    }
  }

  /**
   * Create a new task
   */
  async createTask(taskData: CreateTaskDTO): Promise<Task> {
    try {
      const result = await apiClient.post<Task>('/api/v1/taskitems', taskData);
      if (!result) {
        throw new TaskApiError('Failed to create task', 500);
      }
      return result;
    } catch (error) {
      console.error('Failed to create task:', error);
      throw error instanceof TaskApiError ? error : new TaskApiError('Failed to create task', 500);
    }
  }

  /**
   * Update a task
   */
  async updateTask(taskId: number, taskData: UpdateTaskDTO): Promise<Task> {
    try {
      const result = await apiClient.put<Task>(`/api/v1/taskitems/${taskId}`, taskData);
      if (!result) {
        throw new TaskApiError('Failed to update task', 500);
      }
      return result;
    } catch (error) {
      console.error('Failed to update task:', error);
      throw error instanceof TaskApiError ? error : new TaskApiError('Failed to update task', 500);
    }
  }

  /**
   * Complete a task
   */
  async completeTask(taskId: number): Promise<Task> {
    try {
      const result = await apiClient.post<Task>(`/api/v1/taskitems/${taskId}/complete`);
      if (!result) {
        throw new TaskApiError('Failed to complete task', 500);
      }
      return result;
    } catch (error) {
      console.error('Failed to complete task:', error);
      throw error instanceof TaskApiError ? error : new TaskApiError('Failed to complete task', 500);
    }
  }

  /**
   * Delete a task
   */
  async deleteTask(taskId: number): Promise<void> {
    try {
      await apiClient.delete<void>(`/api/v1/taskitems/${taskId}`);
    } catch (error) {
      console.error('Failed to delete task:', error);
      throw error instanceof TaskApiError ? error : new TaskApiError('Failed to delete task', 500);
    }
  }
}

// Export singleton instance
export const taskService = new TaskService(); 