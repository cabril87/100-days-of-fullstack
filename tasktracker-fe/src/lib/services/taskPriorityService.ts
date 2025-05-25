/*
 * Task Priority Service
 * Handles task priority management, auto-adjustment, and prioritization
 */

import { apiService } from './apiService';
import { ApiResponse } from '@/lib/types/api';
import { 
  TaskPriority,
  PriorityAdjustment,
  PriorityAdjustmentSummary,
  PrioritizedTask
} from '@/lib/types/task';

class TaskPriorityService {
  private baseUrl = '/v1/task-priority';

  /**
   * Automatically adjusts task priorities based on due dates and other factors
   */
  async autoAdjustPriorities(): Promise<ApiResponse<PriorityAdjustmentSummary>> {
    try {
      const response = await apiService.post<PriorityAdjustmentSummary>(
        `${this.baseUrl}/auto-adjust`,
        {}
      );
      return response;
    } catch (error) {
      console.error('Error auto-adjusting priorities:', error);
      throw error;
    }
  }

  /**
   * Gets the highest priority task for the current user
   */
  async getHighestPriorityTask(): Promise<ApiResponse<PrioritizedTask>> {
    try {
      const response = await apiService.get<PrioritizedTask>(
        `${this.baseUrl}/highest-priority`
      );
      return response;
    } catch (error) {
      console.error('Error getting highest priority task:', error);
      throw error;
    }
  }

  /**
   * Gets a list of prioritized tasks for the current user
   */
  async getPrioritizedTasks(count: number = 10): Promise<ApiResponse<PrioritizedTask[]>> {
    try {
      const response = await apiService.get<PrioritizedTask[]>(
        `${this.baseUrl}/prioritized?count=${count}`
      );
      return response;
    } catch (error) {
      console.error('Error getting prioritized tasks:', error);
      throw error;
    }
  }

  /**
   * Manually adjust a task's priority
   */
  async manuallyAdjustTaskPriority(
    taskId: number, 
    newPriority: TaskPriority,
    reason?: string
  ): Promise<ApiResponse<void>> {
    try {
      const response = await apiService.put<void>(
        `/v1/taskitems/${taskId}`,
        {
          priority: newPriority,
          adjustmentReason: reason || 'Manual priority adjustment'
        }
      );
      return response;
    } catch (error) {
      console.error('Error manually adjusting task priority:', error);
      throw error;
    }
  }

  /**
   * Get priority adjustment history for a task
   */
  async getPriorityHistory(taskId: number): Promise<ApiResponse<PriorityAdjustment[]>> {
    try {
      // This would need a new backend endpoint, for now return empty
      return {
        data: [],
        status: 200
      };
    } catch (error) {
      console.error('Error getting priority history:', error);
      throw error;
    }
  }

  /**
   * Calculate priority score for a task (client-side estimation)
   */
  calculatePriorityScore(task: {
    priority: string;
    dueDate?: string;
    status: string;
  }): number {
    let score = 0;

    // Priority factor
    switch (task.priority?.toLowerCase()) {
      case 'critical': score += 4; break;
      case 'high': score += 3; break;
      case 'medium': score += 2; break;
      case 'low': score += 1; break;
      default: score += 0; break;
    }

    // Due date factor
    if (task.dueDate) {
      const dueDate = new Date(task.dueDate);
      const now = new Date();
      const hoursUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (hoursUntilDue < 0) {
        score += 5; // Overdue
      } else if (hoursUntilDue < 24) {
        score += 4; // Due today
      } else if (hoursUntilDue < 72) {
        score += 3; // Due within 3 days
      } else if (hoursUntilDue < 168) {
        score += 2; // Due within a week
      } else if (hoursUntilDue < 336) {
        score += 1; // Due within two weeks
      }
    }

    // Status factor
    if (task.status === 'in-progress') {
      score += 1;
    }

    return score;
  }

  /**
   * Get recommended priority for a task
   */
  getRecommendedPriority(task: {
    priority: string;
    dueDate?: string;
    status: string;
  }): { priority: TaskPriority; reason: string } {
    if (!task.dueDate) {
      return {
        priority: this.stringToTaskPriority(task.priority),
        reason: 'No due date set'
      };
    }

    const dueDate = new Date(task.dueDate);
    const now = new Date();
    const daysUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

    if (daysUntilDue < 0) {
      return {
        priority: TaskPriority.High,
        reason: 'Task is overdue'
      };
    } else if (daysUntilDue < 1) {
      return {
        priority: TaskPriority.High,
        reason: 'Task is due today or tomorrow'
      };
    } else if (daysUntilDue < 3) {
      return {
        priority: TaskPriority.Medium,
        reason: 'Task is due within 3 days'
      };
    } else if (daysUntilDue > 14) {
      return {
        priority: TaskPriority.Low,
        reason: 'Task due date is far in the future'
      };
    }

    return {
      priority: this.stringToTaskPriority(task.priority),
      reason: 'Current priority is appropriate'
    };
  }

  /**
   * Convert string priority to TaskPriority enum
   */
  private stringToTaskPriority(priority: string): TaskPriority {
    switch (priority?.toLowerCase()) {
      case 'critical': return TaskPriority.Critical;
      case 'high': return TaskPriority.High;
      case 'medium': return TaskPriority.Medium;
      case 'low': return TaskPriority.Low;
      default: return TaskPriority.Medium;
    }
  }

  /**
   * Convert TaskPriority enum to string
   */
  taskPriorityToString(priority: TaskPriority): string {
    switch (priority) {
      case TaskPriority.Critical: return 'Critical';
      case TaskPriority.High: return 'High';
      case TaskPriority.Medium: return 'Medium';
      case TaskPriority.Low: return 'Low';
      default: return 'Medium';
    }
  }

  /**
   * Get priority color for UI display
   */
  getPriorityColor(priority: string | TaskPriority): string {
    const priorityStr = typeof priority === 'number' 
      ? this.taskPriorityToString(priority)
      : priority;

    switch (priorityStr?.toLowerCase()) {
      case 'critical': return '#dc2626'; // red-600
      case 'high': return '#ea580c'; // orange-600
      case 'medium': return '#ca8a04'; // yellow-600
      case 'low': return '#16a34a'; // green-600
      default: return '#6b7280'; // gray-500
    }
  }

  /**
   * Get priority icon for UI display
   */
  getPriorityIcon(priority: string | TaskPriority): string {
    const priorityStr = typeof priority === 'number' 
      ? this.taskPriorityToString(priority)
      : priority;

    switch (priorityStr?.toLowerCase()) {
      case 'critical': return '🔴';
      case 'high': return '🟠';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚫';
    }
  }
}

export const taskPriorityService = new TaskPriorityService();
export default taskPriorityService; 