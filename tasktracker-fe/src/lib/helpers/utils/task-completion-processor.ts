/*
 * Enterprise Task Completion Processor
 * Copyright (c) 2025 TaskTracker Enterprise
 * 
 * Unified task completion processing with real-time gamification integration
 * Following FAMILY-AUTH-IMPLEMENTATION-CHECKLIST.md standards
 * 
 * Responsibilities:
 * 1. Process task completion with gamification
 * 2. Trigger real-time celebrations
 * 3. Broadcast family notifications via SignalR
 * 4. Update local state consistently
 * 5. Handle error scenarios gracefully
 */

import { gamificationService } from '@/lib/services/gamificationService';
import { taskService } from '@/lib/services/taskService';
import { Task } from '@/lib/types/tasks';
import { FamilyDTO } from '@/lib/types/family';

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

export interface TaskCompletionContext {
  task: Task;
  familyId?: number;
  currentFamily?: FamilyDTO | null;
  userId?: number;
}

export interface TaskCompletionResult {
  success: boolean;
  pointsEarned: number;
  newAchievements: Array<{
    id?: number;
    name: string;
    title?: string;
    description?: string;
    points?: number;
    rarity?: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
    unlockedAt?: string;
  }>;
  levelUp?: {
    oldLevel: number;
    newLevel: number;
  } | null;
  updatedTask: Task;
  error?: string;
}

export interface TaskCompletionCallbacks {
  onSuccess?: (result: TaskCompletionResult) => void;
  onError?: (error: string) => void;
  onGamificationComplete?: (result: TaskCompletionResult) => void;
  onFamilyNotification?: (achievementNames: string[], familyId?: number) => void;
}

// ============================================================================
// ENTERPRISE TASK COMPLETION PROCESSOR
// ============================================================================

export class TaskCompletionProcessor {
  /**
   * Process task completion with comprehensive gamification integration
   * 
   * @param context - Task completion context including task and family data
   * @param callbacks - Optional callbacks for different completion phases
   * @returns Promise<TaskCompletionResult> - Complete results of task completion
   */
  static async processTaskCompletion(
    context: TaskCompletionContext,
    callbacks?: TaskCompletionCallbacks
  ): Promise<TaskCompletionResult> {
    const { task, familyId, currentFamily, userId } = context;
    
    try {
      console.log(`🎮 TaskCompletionProcessor: Starting completion for task ${task.id}: ${task.title}`, {
        taskId: task.id,
        taskTitle: task.title,
        taskPoints: task.pointsValue,
        taskCategoryId: task.categoryId,
        taskCategoryName: task.categoryName,
        familyId,
        userId
      });

      // ============================================================================
      // STEP 1: Complete the task via API
      // ============================================================================
      
      await taskService.completeTask(task.id);
      console.log(`✅ TaskCompletionProcessor: Task ${task.id} completed successfully`);

      // ============================================================================
      // STEP 2: Process gamification (achievements, points, level ups)
      // ============================================================================
      
      console.log('🎮 TaskCompletionProcessor: Processing gamification...');
      
      const gamificationResult = await gamificationService.processTaskCompletion(task.id, {
        title: task.title,
        points: task.pointsValue,
        category: task.categoryName || 'General'
      });

      console.log('🏆 TaskCompletionProcessor: Gamification processing complete:', {
        pointsEarned: gamificationResult.pointsEarned,
        newAchievements: gamificationResult.newAchievements.length,
        achievementNames: gamificationResult.newAchievements.map(a => a.name),
        levelUp: gamificationResult.levelUp
      });

      // ============================================================================
      // STEP 3: Transform achievement data for celebrations
      // ============================================================================
      
      const transformedAchievements = gamificationResult.newAchievements.map(achievement => ({
        id: achievement.id,
        name: achievement.name,
        title: achievement.name,
        description: achievement.description,
        points: achievement.pointValue,
        rarity: achievement.difficulty === 'VeryEasy' ? 'Common' as const :
                achievement.difficulty === 'Easy' ? 'Uncommon' as const :
                achievement.difficulty === 'Medium' ? 'Rare' as const :
                achievement.difficulty === 'Hard' ? 'Epic' as const :
                'Legendary' as const,
        unlockedAt: achievement.unlockedAt?.toISOString()
      }));

      // ============================================================================
      // STEP 4: Update task state
      // ============================================================================
      
      const updatedTask: Task = {
        ...task,
        isCompleted: true,
        completedAt: new Date(),
        pointsEarned: gamificationResult.pointsEarned
      };

      // ============================================================================
      // STEP 5: Create completion result
      // ============================================================================
      
      const result: TaskCompletionResult = {
        success: true,
        pointsEarned: gamificationResult.pointsEarned,
        newAchievements: transformedAchievements,
        levelUp: gamificationResult.levelUp,
        updatedTask
      };

      // ============================================================================
      // STEP 6: Execute callbacks
      // ============================================================================
      
      // Notify about successful completion
      if (callbacks?.onSuccess) {
        callbacks.onSuccess(result);
      }

      // Notify about gamification completion
      if (callbacks?.onGamificationComplete) {
        callbacks.onGamificationComplete(result);
      }

      // Handle family notifications for achievement unlocks
      if (transformedAchievements.length > 0) {
        console.log('🎯 TaskCompletionProcessor: Broadcasting achievement unlocks to family members...', {
          achievements: transformedAchievements.map(a => a.name),
          familyId: currentFamily?.id || familyId
        });

        if (callbacks?.onFamilyNotification) {
          callbacks.onFamilyNotification(
            transformedAchievements.map(a => a.name),
            currentFamily?.id || familyId
          );
        }
      }

      console.log('🎉 TaskCompletionProcessor: Task completion fully processed:', {
        taskId: task.id,
        pointsEarned: result.pointsEarned,
        achievementsUnlocked: result.newAchievements.length,
        levelUpOccurred: !!result.levelUp
      });

      return result;

    } catch (error) {
      console.error('❌ TaskCompletionProcessor: Task completion failed:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to complete task';
      
      // Execute error callback
      if (callbacks?.onError) {
        callbacks.onError(errorMessage);
      }

      return {
        success: false,
        pointsEarned: 0,
        newAchievements: [],
        levelUp: null,
        updatedTask: task,
        error: errorMessage
      };
    }
  }

  /**
   * Convenience method for task completion with celebration integration
   * 
   * @param task - Task to complete
   * @param celebrateTaskCompletion - Celebration function from ToastProvider
   * @param familyContext - Optional family context
   * @returns Promise<TaskCompletionResult>
   */
  static async completeTaskWithCelebration(
    task: Task,
    celebrateTaskCompletion: (params: {
      taskTitle: string;
      pointsEarned: number;
      achievementsUnlocked?: Array<{
        id?: number;
        name: string;
        title?: string;
        description?: string;
        points?: number;
        rarity?: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
        unlockedAt?: string;
      }>;
      levelUp?: {
        oldLevel: number;
        newLevel: number;
      };
    }) => void,
    familyContext?: { familyId?: number; currentFamily?: FamilyDTO | null; userId?: number }
  ): Promise<TaskCompletionResult> {
    
    return TaskCompletionProcessor.processTaskCompletion(
      {
        task,
        familyId: familyContext?.familyId,
        currentFamily: familyContext?.currentFamily,
        userId: familyContext?.userId
      },
      {
        onGamificationComplete: (result) => {
          // Trigger celebration with real achievement data
          celebrateTaskCompletion({
            taskTitle: task.title,
            pointsEarned: result.pointsEarned,
            achievementsUnlocked: result.newAchievements,
            levelUp: result.levelUp || undefined
          });
        },
        onFamilyNotification: (achievementNames, familyId) => {
          console.log('🔔 Family notification triggered:', {
            achievements: achievementNames,
            familyId
          });
        }
      }
    );
  }

  /**
   * Validate task completion context
   * 
   * @param context - Task completion context to validate
   * @returns boolean - True if context is valid
   */
  static validateContext(context: TaskCompletionContext): boolean {
    if (!context.task) {
      console.error('TaskCompletionProcessor: Task is required');
      return false;
    }

    if (context.task.isCompleted) {
      console.warn(`TaskCompletionProcessor: Task ${context.task.id} is already completed`);
      return false;
    }

    return true;
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate achievement rarity based on difficulty
 */
export function calculateAchievementRarity(difficulty: string): 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' {
  switch (difficulty) {
    case 'VeryEasy': return 'Common';
    case 'Easy': return 'Uncommon';
    case 'Medium': return 'Rare';
    case 'Hard': return 'Epic';
    case 'VeryHard': 
    case 'Insane':
    default: 
      return 'Legendary';
  }
}

/**
 * Format achievement notification message
 */
export function formatAchievementMessage(achievement: { name: string; points?: number }): string {
  const pointsText = achievement.points ? ` (+${achievement.points} points)` : '';
  return `🏆 Achievement Unlocked: "${achievement.name}"${pointsText}`;
}

/**
 * Calculate celebration level based on points earned and achievements
 */
export function calculateCelebrationLevel(pointsEarned: number, achievementCount: number, hasLevelUp: boolean): number {
  let level = 1;
  
  // Base level from points
  if (pointsEarned >= 10) level = 2;
  if (pointsEarned >= 25) level = 3;
  if (pointsEarned >= 50) level = 4;
  if (pointsEarned >= 100) level = 5;
  
  // Boost for achievements
  if (achievementCount > 0) level = Math.min(level + achievementCount, 5);
  
  // Maximum level for level up
  if (hasLevelUp) level = 5;
  
  return level;
} 
