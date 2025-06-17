'use client';

import { taskService } from './taskService';
import { TaskItemStatus } from '@/lib/types/task';
import type { TaskCompletionResult, TaskCompletionEvent } from '@/lib/types/celebrations';

export class TaskCompletionService {
  private static instance: TaskCompletionService;
  private celebrationQueue: TaskCompletionEvent[] = [];
  private isProcessingCelebrations = false;

  private constructor() {
    // Use the existing taskService instance
  }

  public static getInstance(): TaskCompletionService {
    if (!TaskCompletionService.instance) {
      TaskCompletionService.instance = new TaskCompletionService();
    }
    return TaskCompletionService.instance;
  }

  /**
   * Complete a task with full real-time integration
   */
  public async completeTaskWithCelebration(
    taskId: number, 
    userId: number, 
    familyId?: number
  ): Promise<TaskCompletionResult> {
    try {
      // Get task details before completion - simplified for existing infrastructure
      const tasks = await taskService.getRecentTasks(100);
      const taskDetails = tasks.find(t => t.id === taskId);
      if (!taskDetails) {
        return { success: false, error: 'Task not found' };
      }

      // Mark task as completed
      const completedTask = await taskService.completeTask(taskId);
      if (!completedTask) {
        return { success: false, error: 'Failed to complete task' };
      }

      // Calculate points based on task properties
      const pointsEarned = this.calculatePointsForTask(taskDetails);

      // Simplified achievements - mock for now since we don't have gamificationService
      const achievementsResult = { newAchievements: [] };
      const levelResult = { levelUp: undefined };

      // Create celebration event
      const celebrationEvent: TaskCompletionEvent = {
        taskId,
        userId,
        familyId,
        taskTitle: taskDetails.title,
        pointsEarned,
        completedAt: new Date().toISOString(),
        achievementsUnlocked: achievementsResult.newAchievements || [],
        levelUp: levelResult.levelUp || undefined
      };

      // Add to celebration queue for real-time processing
      this.celebrationQueue.push(celebrationEvent);
      this.processCelebrationQueue();

      // Broadcast to SignalR if available
      this.broadcastTaskCompletion(celebrationEvent);

      return {
        success: true,
        task: {
          ...completedTask,
          status: TaskItemStatus.Completed.toString(),
          dueDate: completedTask.dueDate?.toISOString()
        },
        pointsEarned,
        achievementsUnlocked: achievementsResult.newAchievements || [],
        levelUp: levelResult.levelUp,
        celebration: {
          confetti: pointsEarned >= 25,
          sound: true,
          message: this.generateCelebrationMessage(pointsEarned, achievementsResult.newAchievements?.length || 0)
        }
      };

    } catch (error) {
      console.error('Error completing task with celebration:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  /**
   * Calculate points for a completed task based on priority, difficulty, and time factors
   */
  private calculatePointsForTask(task: { priority?: string; dueDate?: Date | string; familyId?: number; description?: string }): number {
    let basePoints = 10; // Base points for any completed task

    // Priority bonus
    switch (task.priority?.toLowerCase()) {
      case 'high':
        basePoints += 15;
        break;
      case 'medium':
        basePoints += 10;
        break;
      case 'low':
        basePoints += 5;
        break;
    }

    // Due date bonus (completed on time)
    if (task.dueDate) {
      const dueDate = new Date(task.dueDate);
      const now = new Date();
      if (now <= dueDate) {
        basePoints += 5; // On-time bonus
      }
      
      // Early completion bonus
      const hoursEarly = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      if (hoursEarly > 24) {
        basePoints += 10; // Early bird bonus
      }
    }

    // Family task bonus
    if (task.familyId) {
      basePoints += 5;
    }

    // Difficulty/complexity bonus (based on description length as proxy)
    if (task.description && task.description.length > 100) {
      basePoints += 5;
    }

    return Math.min(basePoints, 50); // Cap at 50 points per task
  }

  /**
   * Generate celebration message based on points and achievements
   */
  private generateCelebrationMessage(points: number, achievementCount: number): string {
    const messages = [
      `Awesome! You earned ${points} points!`,
      `Great job! ${points} points added to your score!`,
      `Task completed! +${points} points!`,
      `Well done! You're on fire with ${points} points!`,
      `Fantastic! ${points} more points toward your next level!`
    ];

    if (achievementCount > 0) {
      return `Amazing! You earned ${points} points and unlocked ${achievementCount} achievement${achievementCount > 1 ? 's' : ''}!`;
    }

    return messages[Math.floor(Math.random() * messages.length)];
  }

  /**
   * Process celebration queue for real-time effects
   */
  private async processCelebrationQueue(): Promise<void> {
    if (this.isProcessingCelebrations || this.celebrationQueue.length === 0) {
      return;
    }

    this.isProcessingCelebrations = true;

    try {
      while (this.celebrationQueue.length > 0) {
        const celebration = this.celebrationQueue.shift();
        if (celebration) {
          await this.processSingleCelebration(celebration);
          // Add delay between celebrations to prevent overwhelming UI
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    } finally {
      this.isProcessingCelebrations = false;
    }
  }

  /**
   * Process a single celebration event
   */
  private async processSingleCelebration(event: TaskCompletionEvent): Promise<void> {
    try {
      // Trigger confetti animation for high-point tasks
      if (event.pointsEarned >= 25) {
        this.triggerConfettiAnimation();
      }

      // Play celebration sound
      this.playCelebrationSound(event.pointsEarned);

      // Show toast notification
      this.showToastNotification(event);

      // Update family activity feed
      if (event.familyId) {
        this.broadcastFamilyActivity(event);
      }

    } catch (error) {
      console.error('Error processing celebration:', error);
    }
  }

  /**
   * Trigger confetti animation
   */
  private triggerConfettiAnimation(): void {
    // This would integrate with a confetti library or custom animation
    if (typeof window !== 'undefined') {
      // Dispatch custom event for confetti animation
      window.dispatchEvent(new CustomEvent('taskCompletionCelebration', {
        detail: { type: 'confetti' }
      }));
    }
  }

  /**
   * Play celebration sound based on points earned
   */
  private playCelebrationSound(points: number): void {
    if (typeof window !== 'undefined') {
      // Different sounds for different point values
      const soundType = points >= 25 ? 'high-achievement' : 
                       points >= 15 ? 'medium-achievement' : 'task-complete';
      
      window.dispatchEvent(new CustomEvent('taskCompletionCelebration', {
        detail: { type: 'sound', soundType }
      }));
    }
  }

  /**
   * Show toast notification for task completion
   */
  private showToastNotification(event: TaskCompletionEvent): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('showToast', {
        detail: {
          type: 'success',
          title: 'Task Completed! 🎉',
          message: `"${event.taskTitle}" completed! +${event.pointsEarned} points`,
          duration: 4000,
          achievementsUnlocked: event.achievementsUnlocked
        }
      }));
    }
  }

  /**
   * Broadcast task completion to SignalR (if connected)
   */
  private broadcastTaskCompletion(event: TaskCompletionEvent): void {
    if (typeof window !== 'undefined') {
      // Dispatch event that SignalR hooks can listen to
      window.dispatchEvent(new CustomEvent('signalrBroadcast', {
        detail: {
          type: 'TaskCompleted',
          data: event
        }
      }));
    }
  }

  /**
   * Broadcast family activity update
   */
  private broadcastFamilyActivity(event: TaskCompletionEvent): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('familyActivityUpdate', {
        detail: {
          type: 'task_completed',
          userId: event.userId,
          userName: 'You', // Will be updated by the receiving component
          title: 'Task Completed',
          description: `Completed "${event.taskTitle}" and earned ${event.pointsEarned} points`,
          points: event.pointsEarned,
          timestamp: new Date(event.completedAt),
          familyId: event.familyId
        }
      }));
    }
  }

  /**
   * Batch complete multiple tasks
   */
  public async completeMultipleTasks(
    taskIds: number[], 
    userId: number, 
    familyId?: number
  ): Promise<TaskCompletionResult[]> {
    const results: TaskCompletionResult[] = [];
    
    for (const taskId of taskIds) {
      const result = await this.completeTaskWithCelebration(taskId, userId, familyId);
      results.push(result);
      
      // Add small delay between batch completions
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    return results;
  }

  /**
   * Get completion statistics for dashboard
   */
  public async getCompletionStats(userId: number, period: 'day' | 'week' | 'month' = 'week'): Promise<{
    tasksCompleted: number;
    pointsEarned: number;
    achievementsUnlocked: number;
    currentStreak: number;
  }> {
    console.log(`Getting completion stats for user ${userId} for period ${period}`); // Use the period parameter
    try {
      // This would integrate with your existing analytics/stats system
      const stats = await taskService.getUserTaskStats();
      return {
        tasksCompleted: stats?.completedTasks || 0,
        pointsEarned: stats?.totalPoints || 0,
        achievementsUnlocked: 0, // Not available in current TaskStats
        currentStreak: stats?.streakDays || 0
      };
    } catch (error) {
      console.error('Error getting completion stats:', error);
      return {
        tasksCompleted: 0,
        pointsEarned: 0,
        achievementsUnlocked: 0,
        currentStreak: 0
      };
    }
  }
}

export default TaskCompletionService; 