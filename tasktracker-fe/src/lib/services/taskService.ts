/*
 * Task API Service
 * Copyright (c) 2025 Carlos Abril Jr
 */

import { 
  Task, 
  CreateTaskDTO, 
  UpdateTaskDTO, 
  TaskStats, 
  ApiResponse, 
  BackendTaskStatsResponse, 
  FamilyTaskItemDTO, 
  FlexibleTaskAssignmentDTO, 
  TaskApprovalDTO, 
  FamilyTaskStats,
  TaskServiceCacheEntry,
  FlexibleApiResponse,
  TaskApiResponseType
} from '../types/task';
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
  private cache = new Map<string, TaskServiceCacheEntry>();
  private CACHE_TTL = 30000; // 30 seconds

  /**
   * Invalidate all cached data
   */
  private invalidateCache(): void {
    console.log('🧹 Cache invalidated - fresh data on next requests');
    this.cache.clear();
  }

  /**
   * Get user's task statistics for dashboard
   */
  async getUserTaskStats(): Promise<TaskStats> {
    try {
      const result = await apiClient.get<ApiResponse<BackendTaskStatsResponse>>('/v1/taskitems/statistics');
      
      if (result && result.data) {
        const backendData = result.data;
        return {
          // Basic stats
          totalTasks: 0,
          completedTasks: backendData.completedTasks || 0,
          activeTasks: 0,
          overdueTasks: 0,
          // Extended dashboard properties
          tasksCompleted: backendData.completedTasks || 0,
          tasksCompletedThisWeek: backendData.completedTasksThisWeek || 0,
          activeGoals: backendData.activeGoals || 0,
          focusTimeToday: backendData.focusTimeToday || 0,
          streakDays: backendData.streakDays || 0,
          totalPoints: backendData.totalPoints || 0
        };
      }
      
      return {
        totalTasks: 0,
        completedTasks: 0,
        activeTasks: 0,
        overdueTasks: 0,
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
        totalTasks: 0,
        completedTasks: 0,
        activeTasks: 0,
        overdueTasks: 0,
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
      console.log(`🔍 Fetching recent tasks with limit: ${limit}`);
      const result = await apiClient.get<TaskApiResponseType>(`/v1/taskitems?pageSize=${limit}`);
      console.log('📋 Raw API response for getRecentTasks:', result);
      
      // Comprehensive response handling with proper type safety
      let tasks: Task[] = [];
      
      if (Array.isArray(result)) {
        // Direct array response (unwrapped)
        tasks = result;
        console.log('📋 Using unwrapped array response');
      } else if (result && typeof result === 'object') {
        // Check for wrapped response patterns with type safety
        const flexibleResponse = result as FlexibleApiResponse;
        
        if ('data' in result && Array.isArray(result.data)) {
          tasks = result.data as Task[];
          console.log('📋 Using wrapped response (.data property)');
        } else if (flexibleResponse.items && Array.isArray(flexibleResponse.items)) {
          tasks = flexibleResponse.items;
          console.log('📋 Using wrapped response (.items property)');
        } else if (flexibleResponse.tasks && Array.isArray(flexibleResponse.tasks)) {
          tasks = flexibleResponse.tasks;
          console.log('📋 Using wrapped response (.tasks property)');
        } else {
          // If it's an object but no recognizable array property, log and return empty
          console.log('📋 Object response with no recognizable array property:', Object.keys(result));
          tasks = [];
        }
      } else {
        console.log('📋 Unexpected response type:', typeof result);
        tasks = [];
      }
      
      console.log(`📋 Final tasks count: ${tasks.length}`);
      console.log('📋 Task IDs:', tasks.map(t => t.id));
      
      return tasks;
    } catch (error) {
      console.error('Failed to fetch recent tasks:', error);
      return [];
    }
  }

  /**
   * Get tasks due today
   */
  async getDueTodayTasks(): Promise<Task[]> {
    try {
      const result = await apiClient.get<ApiResponse<Task[]>>('/v1/taskitems/due-today');
      return result?.data || [];
    } catch (error) {
      console.error('Failed to fetch due today tasks:', error);
      return [];
    }
  }

  /**
   * Get overdue tasks
   */
  async getOverdueTasks(): Promise<Task[]> {
    try {
      const result = await apiClient.get<ApiResponse<Task[]>>('/v1/taskitems/overdue');
      return result?.data || [];
    } catch (error) {
      console.error('Failed to fetch overdue tasks:', error);
      return [];
    }
  }

  /**
   * Get a specific task by ID
   */
  async getTaskById(taskId: number): Promise<Task | null> {
    try {
      console.log(`🔍 Fetching task by ID: ${taskId}`);
      const result = await apiClient.get<ApiResponse<Task>>(`/v1/taskitems/${taskId}`);
      console.log('📋 Raw API response for getTaskById:', result);
      
      if (result && typeof result === 'object' && 'data' in result) {
        return result.data as Task;
      } else if (result && typeof result === 'object' && 'id' in result) {
        // Direct task object response
        return result as Task;
      }
      
      return null;
    } catch (error) {
      console.error(`Failed to fetch task ${taskId}:`, error);
      return null;
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
      }>(`/v1/taskitems/family/${familyId}/stats`);

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
      console.log('📝 Creating new task:', taskData);
      const result = await apiClient.post<Task>('/v1/taskitems', taskData);
      if (!result) {
        throw new TaskApiError('Failed to create task', 500);
      }
      console.log('✅ Task created successfully:', result);
      
      // Invalidate cache to ensure fresh data on next load
      this.invalidateCache();
      
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
      const result = await apiClient.put<Task>(`/v1/taskitems/${taskId}`, taskData);
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
      const result = await apiClient.post<Task>(`/v1/taskitems/${taskId}/complete`);
      if (!result) {
        throw new TaskApiError('Failed to complete task', 500);
      }
      
      // Invalidate cache for fresh data
      this.invalidateCache();
      
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
      console.log(`🗑️ TaskService: Attempting to delete task: ${taskId}`);
      console.log('🍪 Current cookies available:', document.cookie.length > 0 ? 'YES' : 'NO');
      
      const response = await apiClient.delete<void>(`/v1/taskitems/${taskId}`);
      console.log(`✅ TaskService: DELETE API call completed for task ${taskId}`);
      console.log('📊 API Response:', response);
      
      // Note: For DELETE operations, response is typically empty (204 No Content)
      // The absence of an error means the operation should have succeeded
      
      // Invalidate cache for fresh data on next load
      this.invalidateCache();
      
    } catch (error) {
      console.error(`❌ TaskService: Failed to delete task ${taskId}:`, error);
      
      // Additional debugging for 401 errors
      if (error instanceof Error && error.message.includes('401')) {
        console.log('🔍 401 Unauthorized Debug:');
        console.log('🍪 All cookies:', document.cookie);
        console.log('🔑 Access token cookie check:', {
          hasAccessToken: document.cookie.includes('access_token'),
          hasAuthCookie: document.cookie.includes('auth'),
          cookieLength: document.cookie.length
        });
        
        // Check if we should try to refresh the session
        console.log('💡 Suggestion: Try refreshing the page to re-authenticate');
      }
      
      throw error instanceof TaskApiError ? error : new TaskApiError('Failed to delete task', 500);
    }
  }

  // === FAMILY TASK METHODS (Extending Existing Service) ===

  /**
   * Get all family tasks for a specific family
   */
  async getFamilyTasks(familyId: number): Promise<FamilyTaskItemDTO[]> {
    try {
      const result = await apiClient.get<ApiResponse<FamilyTaskItemDTO[]>>(`/v1/family/${familyId}/tasks`);
      return result?.data || [];
    } catch (error) {
      console.error('Failed to fetch family tasks:', error);
      return [];
    }
  }

  /**
   * Get a specific family task by ID
   */
  async getFamilyTaskById(familyId: number, taskId: number): Promise<FamilyTaskItemDTO | null> {
    try {
      const result = await apiClient.get<ApiResponse<FamilyTaskItemDTO>>(`/v1/family/${familyId}/tasks/${taskId}`);
      return result?.data || null;
    } catch (error) {
      console.error('Failed to fetch family task:', error);
      return null;
    }
  }

  /**
   * Assign task to family member
   */
  async assignTaskToFamilyMember(familyId: number, assignmentData: FlexibleTaskAssignmentDTO): Promise<FamilyTaskItemDTO | null> {
    try {
      const result = await apiClient.post<ApiResponse<FamilyTaskItemDTO>>(`/v1/family/${familyId}/tasks/assign`, assignmentData);
      return result?.data || null;
    } catch (error) {
      console.error('Failed to assign task to family member:', error);
      throw error instanceof TaskApiError ? error : new TaskApiError('Failed to assign task', 500);
    }
  }

  /**
   * Unassign task from family member
   */
  async unassignTask(familyId: number, taskId: number): Promise<boolean> {
    try {
      const result = await apiClient.delete<ApiResponse<boolean>>(`/v1/family/${familyId}/tasks/${taskId}/unassign`);
      return result?.data || false;
    } catch (error) {
      console.error('Failed to unassign task:', error);
      return false;
    }
  }

  /**
   * Approve a completed family task
   */
  async approveTask(familyId: number, taskId: number, approvalData: TaskApprovalDTO): Promise<boolean> {
    try {
      const result = await apiClient.post<ApiResponse<boolean>>(`/v1/family/${familyId}/tasks/${taskId}/approve`, approvalData);
      return result?.data || false;
    } catch (error) {
      console.error('Failed to approve task:', error);
      return false;
    }
  }

  /**
   * Get tasks assigned to a specific family member
   */
  async getTasksAssignedToMember(familyId: number, familyMemberId: number): Promise<FamilyTaskItemDTO[]> {
    try {
      const result = await apiClient.get<ApiResponse<FamilyTaskItemDTO[]>>(`/v1/family/${familyId}/member/${familyMemberId}/tasks`);
      return result?.data || [];
    } catch (error) {
      console.error('Failed to fetch member tasks:', error);
      return [];
    }
  }

  /**
   * Get enhanced family task statistics with member breakdown
   */
  async getEnhancedFamilyTaskStats(familyId: number): Promise<FamilyTaskStats> {
    try {
      const result = await apiClient.get<ApiResponse<FamilyTaskStats>>(`/v1/family/${familyId}/tasks/stats`);
      return result?.data || {
        totalTasks: 0,
        completedTasks: 0,
        totalPoints: 0,
        memberStats: []
      };
    } catch (error) {
      console.error('Failed to fetch enhanced family task stats:', error);
      return {
        totalTasks: 0,
        completedTasks: 0,
        totalPoints: 0,
        memberStats: []
      };
    }
  }

  /**
   * Unassign all tasks from a family member (for member removal)
   */
  async unassignAllTasksFromMember(familyId: number, familyMemberId: number): Promise<number> {
    try {
      const result = await apiClient.delete<ApiResponse<number>>(`/v1/family/${familyId}/member/${familyMemberId}/unassign-all`);
      return result?.data || 0;
    } catch (error) {
      console.error('Failed to unassign all tasks from member:', error);
      return 0;
    }
  }
}

// Export singleton instance
export const taskService = new TaskService(); 