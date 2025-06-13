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
  TaskServiceCacheEntry,
  FlexibleApiResponse,
  TaskApiResponseType,
  ChecklistItem,
  TaskTimeTracking,
  TaskProgressUpdate,
  BatchTaskResult,
  CreateChecklistItem
} from '../types/task';
import { FamilyTaskStats } from '../types/family-task';
import { apiClient } from '../config/api-client';
import { convertTaskDataForBackend } from '../utils/priorityMapping';
import { tagService } from './tagService';

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
  // Simplified: Only cache static/expensive data, not dynamic task lists
  private cache = new Map<string, TaskServiceCacheEntry>();
  private CACHE_TTL = 120000; // 2 minutes for static data only

  /**
   * Invalidate specific cache entries (selective invalidation)
   */
  private invalidateCache(keys?: string[]): void {
    if (keys) {
      keys.forEach(key => this.cache.delete(key));
      console.log(`🧹 Invalidated cache keys: ${keys.join(', ')}`);
    } else {
      this.cache.clear();
      console.log('🧹 Invalidated all cache');
    }
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
      // Note: The backend endpoint /v1/family/{familyId}/stats returns basic family stats
      // but doesn't include detailed task statistics yet
      const result = await apiClient.get<{
        MemberCount?: number;
        AdminCount?: number;
        AdultCount?: number;
        ChildCount?: number;
        TotalTasks?: number;
        CompletedTasks?: number;
        PendingTasks?: number;
        LastActivity?: string;
      }>(`/v1/family/${familyId}/stats`);

      // Transform backend PascalCase to frontend camelCase and provide defaults
      return {
        totalTasks: result?.TotalTasks || 0,
        completedTasks: result?.CompletedTasks || 0,
        totalPoints: 0, // Not provided by this endpoint
        memberStats: [] // Not provided by this endpoint - will be populated from members data
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
      
      // Convert tag names to IDs (enterprise solution)
      let tagIds: number[] = [];
      if (taskData.tags && taskData.tags.length > 0) {
        tagIds = await tagService.convertTagNamesToIds(taskData.tags);
      }
      
      // Convert priority from string to integer for backend compatibility
      const backendData = await convertTaskDataForBackend(taskData, tagIds);
      console.log('🔧 Converted data for backend:', backendData);
      
      const result = await apiClient.post<Task>('/v1/taskitems', backendData);
      if (!result) {
        throw new TaskApiError('Failed to create task', 500);
      }
      console.log('✅ Task created successfully:', result);
      
      // Associate tags after creation if provided (enterprise solution)
      if (tagIds.length > 0 && result.id) {
        console.log(`🏷️ Associating tags with new task ${result.id}:`, tagIds);
        const tagUpdateSuccess = await tagService.associateTagsWithTask(result.id, tagIds);
        if (tagUpdateSuccess) {
          console.log(`✅ Tags associated successfully with task ${result.id}`);
          // Fetch the updated task to get the tags included
          const updatedTask = await this.getTaskById(result.id);
          return updatedTask || result;
        } else {
          console.warn(`⚠️ Failed to associate tags with task ${result.id}`);
        }
      }
      
      return result;
    } catch (error) {
      console.error('Failed to create task:', error);
      throw error instanceof TaskApiError ? error : new TaskApiError('Failed to create task', 500);
    }
    // No cache invalidation needed - API client handles freshness
  }

  /**
   * Update a task
   */
  async updateTask(taskId: number, taskData: UpdateTaskDTO): Promise<Task> {
    try {
      console.log(`🔄 Updating task ${taskId}:`, taskData);
      
      // Convert tag names to IDs (enterprise solution)
      let tagIds: number[] = [];
      if (taskData.tags && taskData.tags.length > 0) {
        tagIds = await tagService.convertTagNamesToIds(taskData.tags);
      }
      
      // Convert priority from string to integer for backend compatibility
      const backendData = await convertTaskDataForBackend(taskData, tagIds);
      console.log('🔧 Converted data for backend:', backendData);
      console.log('🔍 Original taskData:', taskData);
      console.log('🔍 backendData keys:', Object.keys(backendData));
      console.log('🔍 backendData.Title:', backendData.Title);
      console.log('🔍 backendData.EstimatedTimeMinutes:', backendData.EstimatedTimeMinutes);
      console.log('🔍 backendData.PointsValue:', backendData.PointsValue);
      console.log('🔍 Original tags:', taskData.tags);
      
      // Call the backend update endpoint directly (no wrapper)
      await apiClient.put(`/v1/taskitems/${taskId}`, backendData);
      
      // Update tags separately if provided (enterprise solution)
      if (tagIds.length > 0) {
        console.log(`🏷️ Updating tags for task ${taskId}:`, tagIds);
        const tagUpdateSuccess = await tagService.associateTagsWithTask(taskId, tagIds);
        if (tagUpdateSuccess) {
          console.log(`✅ Tags updated successfully for task ${taskId}`);
        } else {
          console.warn(`⚠️ Failed to update tags for task ${taskId}`);
        }
      }
      
      // Backend returns NoContent (204), so fetch the updated task
      const updatedTask = await this.getTaskById(taskId);
      
      if (!updatedTask) {
        throw new Error('Task update succeeded but failed to retrieve updated task');
      }
      
      console.log(`✅ Task ${taskId} updated successfully`);
      return updatedTask;
    } catch (error) {
      console.error(`❌ Failed to update task ${taskId}:`, error);
      throw new TaskApiError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        500
      );
    }
    // No cache invalidation needed - API client handles freshness
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
      
      return result;
    } catch (error) {
      console.error('Failed to complete task:', error);
      throw error instanceof TaskApiError ? error : new TaskApiError('Failed to complete task', 500);
    }
    // No cache invalidation needed - API client handles freshness
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
    // No cache invalidation needed - API client handles freshness
  }

  // === FAMILY TASK METHODS (Extending Existing Service) ===

  /**
   * Get all family tasks for a specific family
   */
  async getFamilyTasks(familyId: number): Promise<FamilyTaskItemDTO[]> {
    try {
      console.log('🔍 TaskService: Calling getFamilyTasks for familyId:', familyId);
      
      const result = await apiClient.get<ApiResponse<FamilyTaskItemDTO[]>>(`/v1/family/${familyId}/tasks`);
      
      console.log('📡 TaskService: getFamilyTasks raw API response:', {
        result,
        hasResult: !!result,
        resultType: typeof result,
        resultKeys: result ? Object.keys(result) : 'no result',
        hasData: result && 'data' in result,
        dataType: result && 'data' in result ? typeof result.data : 'no data',
        dataLength: result && 'data' in result && Array.isArray(result.data) ? result.data.length : 'not array',
        isResultArray: Array.isArray(result),
        resultLength: Array.isArray(result) ? result.length : 'not array',
        firstFewKeys: result ? JSON.stringify(result).substring(0, 200) : 'no result'
      });
      
      // Handle both wrapped and direct array responses
      if (result && 'data' in result && Array.isArray(result.data)) {
        console.log('✅ TaskService: Using wrapped response (result.data)');
        return result.data;
      } else if (Array.isArray(result)) {
        console.log('✅ TaskService: Using direct array response');
        return result;
      } else {
        console.log('⚠️ TaskService: Unexpected response format, returning empty array');
        return [];
      }
    } catch (error) {
      console.error('❌ TaskService: Failed to fetch family tasks:', error);
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
      console.log('🔗 TaskService: Making family task assignment API call:', {
        url: `/v1/family/${familyId}/tasks/assign`,
        familyId,
        assignmentData,
        fullUrl: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/v1/family/${familyId}/tasks/assign`
      });
      
      const result = await apiClient.post<ApiResponse<FamilyTaskItemDTO>>(`/v1/family/${familyId}/tasks/assign`, assignmentData);
      
      console.log('📡 TaskService: Family task assignment API response:', {
        result,
        hasData: !!result?.data,
        dataType: typeof result?.data,
        resultKeys: result ? Object.keys(result) : 'no result',
        resultType: typeof result,
        isResultArray: Array.isArray(result),
        resultStringified: JSON.stringify(result, null, 2).substring(0, 500)
      });
      
      // Handle both wrapped and direct responses
      if (result?.data) {
        return result.data;
      } else if (result && typeof result === 'object' && 'id' in result && 'title' in result) {
        // Direct response (not wrapped in data property)
        console.log('✅ TaskService: Using direct response as FamilyTaskItemDTO');
        return result as unknown as FamilyTaskItemDTO;
      }
      console.log('⚠️ TaskService: No valid response data found');
      return null;
    } catch (error) {
      console.error('🚨 TaskService: Family task assignment failed:', {
        error: error instanceof Error ? error.message : String(error),
        assignmentData,
        familyId,
        isApiClientError: error instanceof Error && error.name === 'ApiClientError',
        statusCode: error instanceof Error && 'statusCode' in error ? (error as Error & {statusCode?: number}).statusCode : undefined,
        networkError: error instanceof TypeError && error.message.includes('fetch')
      });
      
      // Don't throw error, return null to allow graceful handling
      return null;
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
        overdueTasks: 0,
        weeklyProgress: 0,
        familyScore: 0,
        memberStats: [],
        recentAchievements: [],
        sharedGoals: []
      };
    } catch (error) {
      console.error('Failed to fetch enhanced family task stats:', error);
      return {
        totalTasks: 0,
        completedTasks: 0,
        overdueTasks: 0,
        weeklyProgress: 0,
        familyScore: 0,
        memberStats: [],
        recentAchievements: [],
        sharedGoals: []
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

  /**
   * BATCH OPERATIONS
   */

  /**
   * Create multiple tasks in one operation
   */
  async batchCreateTasks(tasks: CreateTaskDTO[]): Promise<BatchTaskResult> {
    try {
      console.log(`🚀 Batch creating ${tasks.length} tasks`);
      const result = await apiClient.post<ApiResponse<Task[]>>('/v1/batchoperations/tasks', tasks);
      
      this.invalidateCache();
      
      return {
        success: true,
        created: result.data || [],
        failed: [],
        message: `Successfully created ${result.data?.length || 0} tasks`
      };
    } catch (error) {
      console.error('❌ Batch create failed:', error);
      return {
        success: false,
        created: [],
        failed: tasks.map((task, index) => ({ 
          index, 
          task, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        })),
        message: 'Batch creation failed'
      };
    }
  }

  /**
   * Update multiple tasks in one operation
   */
  async batchUpdateTasks(tasks: Task[]): Promise<BatchTaskResult> {
    try {
      console.log(`🔄 Batch updating ${tasks.length} tasks`);
      const result = await apiClient.put<ApiResponse<Task[]>>('/v1/batchoperations/tasks', tasks);
      
      this.invalidateCache();
      
      return {
        success: true,
        updated: result.data || [],
        failed: [],
        message: `Successfully updated ${result.data?.length || 0} tasks`
      };
    } catch (error) {
      console.error('❌ Batch update failed:', error);
      return {
        success: false,
        updated: [],
        failed: tasks.map((task, index) => ({ 
          index, 
          task, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        })),
        message: 'Batch update failed'
      };
    }
  }

  /**
   * Delete multiple tasks in one operation
   */
  async batchDeleteTasks(taskIds: number[]): Promise<BatchTaskResult> {
    try {
      console.log(`🗑️ Batch deleting ${taskIds.length} tasks:`, taskIds);
      const idsString = taskIds.join(',');
      await apiClient.delete(`/v1/batchoperations/tasks?ids=${idsString}`);
      
      this.invalidateCache();
      
      return {
        success: true,
        deleted: taskIds,
        failed: [],
        message: `Successfully deleted ${taskIds.length} tasks`
      };
    } catch (error) {
      console.error('❌ Batch delete failed:', error);
      return {
        success: false,
        deleted: [],
        failed: taskIds.map((id, index) => ({ 
          index, 
          task: { id } as Task, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        })),
        message: 'Batch deletion failed'
      };
    }
  }

  /**
   * Complete multiple tasks in one operation
   */
  async batchCompleteTasks(taskIds: number[]): Promise<BatchTaskResult> {
    try {
      console.log(`✅ Batch completing ${taskIds.length} tasks:`, taskIds);
      await apiClient.post('/v1/taskitems/complete-batch', taskIds);
      
      this.invalidateCache();
      
      return {
        success: true,
        completed: taskIds,
        failed: [],
        message: `Successfully completed ${taskIds.length} tasks`
      };
    } catch (error) {
      console.error('❌ Batch complete failed:', error);
      return {
        success: false,
        completed: [],
        failed: taskIds.map((id, index) => ({ 
          index, 
          task: { id } as Task, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        })),
        message: 'Batch completion failed'
      };
    }
  }

  /**
   * TASK DETAIL FEATURES
   */

  /**
   * Get task checklist items
   */
  async getTaskChecklist(taskId: number): Promise<ChecklistItem[]> {
    try {
      const result = await apiClient.get<ApiResponse<ChecklistItem[]>>(`/v1/taskitems/${taskId}/checklist`);
      return result.data || [];
    } catch (error) {
      console.error(`Failed to fetch checklist for task ${taskId}:`, error);
      return [];
    }
  }

  /**
   * Add checklist item to task
   */
  async addChecklistItem(taskId: number, item: CreateChecklistItem): Promise<ChecklistItem | null> {
    try {
      const result = await apiClient.post<ApiResponse<ChecklistItem>>(`/v1/taskitems/${taskId}/checklist`, item);
      return result.data || null;
    } catch (error) {
      console.error(`Failed to add checklist item to task ${taskId}:`, error);
      return null;
    }
  }

  /**
   * Update checklist item
   */
  async updateChecklistItem(taskId: number, itemId: number, item: Partial<ChecklistItem>): Promise<boolean> {
    try {
      await apiClient.put(`/v1/taskitems/${taskId}/checklist/${itemId}`, item);
      return true;
    } catch (error) {
      console.error(`Failed to update checklist item ${itemId}:`, error);
      return false;
    }
  }

  /**
   * Delete checklist item
   */
  async deleteChecklistItem(taskId: number, itemId: number): Promise<boolean> {
    try {
      await apiClient.delete(`/v1/taskitems/${taskId}/checklist/${itemId}`);
      return true;
    } catch (error) {
      console.error(`Failed to delete checklist item ${itemId}:`, error);
      return false;
    }
  }

  /**
   * Get task time tracking data
   */
  async getTaskTimeTracking(taskId: number): Promise<TaskTimeTracking | null> {
    try {
      const result = await apiClient.get<ApiResponse<TaskTimeTracking>>(`/v1/taskitems/${taskId}/time-tracking`);
      return result.data || null;
    } catch (error) {
      console.error(`Failed to fetch time tracking for task ${taskId}:`, error);
      return null;
    }
  }

  /**
   * Update task progress
   */
  async updateTaskProgress(taskId: number, progress: TaskProgressUpdate): Promise<boolean> {
    try {
      await apiClient.put(`/v1/taskitems/${taskId}/progress`, progress);
      this.invalidateCache();
      return true;
    } catch (error) {
      console.error(`Failed to update progress for task ${taskId}:`, error);
      return false;
    }
  }

  /**
   * Get task tags
   */
  async getTaskTags(taskId: number): Promise<string[]> {
    try {
      const result = await apiClient.get<ApiResponse<{ name: string }[]>>(`/v1/taskitems/${taskId}/tags`);
      return result.data?.map(tag => tag.name) || [];
    } catch (error) {
      console.error(`Failed to fetch tags for task ${taskId}:`, error);
      return [];
    }
  }

  /**
   * Update task tags
   */
  async updateTaskTags(taskId: number, tagIds: number[]): Promise<boolean> {
    try {
      await apiClient.put(`/v1/taskitems/${taskId}/tags`, tagIds);
      return true;
    } catch (error) {
      console.error(`Failed to update tags for task ${taskId}:`, error);
      return false;
    }
  }

  /**
   * Update task status (for board drag-and-drop)
   */
  async updateTaskStatus(taskId: number, status: string): Promise<boolean> {
    try {
      await apiClient.put(`/v1/taskitems/${taskId}/status`, { status });
      this.invalidateCache([`task-${taskId}`]);
      return true;
    } catch (error) {
      console.error('Failed to update task status:', error);
      return false;
    }
  }
}

// Export singleton instance
export const taskService = new TaskService(); 