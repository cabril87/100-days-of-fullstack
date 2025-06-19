'use client';

/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 * 
 * Gamification Service
 * Frontend service connecting to backend gamification endpoints
 */

import { apiClient } from '@/lib/config/api-client';
import type { 
  Achievement, 
  Badge, 
  GamificationState
} from '@/lib/types/gamification';

// Frontend UserProgress interface
interface UserProgress {
  userId: number;
  totalPoints: number;
  currentLevel: number;
  pointsToNextLevel: number;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate?: Date;
  joinedAt: Date;
  updatedAt: Date;
}

// Backend DTO interfaces that match your API responses
interface UserProgressDTO {
  userId: number;
  totalPoints: number;
  currentLevel: number;
  pointsToNextLevel: number;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate?: string;
  joinedAt: string;
  updatedAt: string;
}

interface AchievementDTO {
  id: number;
  name: string;
  description: string;
  category: string;
  pointValue: number;
  iconUrl?: string;
  difficulty: 'VeryEasy' | 'Easy' | 'Medium' | 'Hard' | 'VeryHard';
  criteria?: string;
  createdAt: string;
}

interface UserAchievementDTO {
  id: number;
  userId: number;
  achievementId: number;
  progress: number;
  isCompleted: boolean;
  startedAt: string;
  completedAt?: string;
  achievement: AchievementDTO;
}

interface UserBadgeDTO {
  id: number;
  userId: number;
  badgeId: number;
  earnedAt: string;
  isDisplayed: boolean;
  badge: {
    id: number;
    name: string;
    description: string;
    iconUrl?: string;
    rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
    pointValue: number;
  };
}

export class GamificationService {
  private static instance: GamificationService;

  private constructor() {}

  public static getInstance(): GamificationService {
    if (!GamificationService.instance) {
      GamificationService.instance = new GamificationService();
    }
    return GamificationService.instance;
  }

  // ================================
  // USER PROGRESS
  // ================================

  /**
   * Get current user progress from backend
   */
  async getUserProgress(): Promise<UserProgress | null> {
    try {
      const dto = await apiClient.get<UserProgressDTO>('/v1/gamification/progress');
      
      if (!dto) return null;
      
      return {
        userId: dto.userId,
        totalPoints: dto.totalPoints,
        currentLevel: dto.currentLevel,
        pointsToNextLevel: dto.pointsToNextLevel,
        currentStreak: dto.currentStreak,
        longestStreak: dto.longestStreak,
        lastActivityDate: dto.lastActivityDate ? new Date(dto.lastActivityDate) : undefined,
        joinedAt: new Date(dto.joinedAt),
        updatedAt: new Date(dto.updatedAt)
      };
    } catch (error) {
      console.error('Failed to fetch user progress:', error);
      return null;
    }
  }

  // ================================
  // ACHIEVEMENTS
  // ================================

  /**
   * Get user's unlocked achievements
   */
  async getUserAchievements(): Promise<Achievement[]> {
    try {
      const data = await apiClient.get<UserAchievementDTO[]>('/v1/gamification/achievements');
      
      if (!data) return [];
      
      return data.map((dto: UserAchievementDTO) => ({
        id: dto.achievement.id,
        name: dto.achievement.name,
        description: dto.achievement.description,
        category: dto.achievement.category,
        pointValue: dto.achievement.pointValue,
        iconUrl: dto.achievement.iconUrl,
        difficulty: dto.achievement.difficulty,
        unlockedAt: dto.completedAt ? new Date(dto.completedAt) : undefined,
        isViewed: false // Will be managed separately
      }));
    } catch (error) {
      console.error('Failed to fetch user achievements:', error);
      return [];
    }
  }

  /**
   * Get available achievements that can be unlocked
   */
  async getAvailableAchievements(): Promise<Achievement[]> {
    try {
      const data = await apiClient.get<AchievementDTO[]>('/v1/gamification/achievements/available');
      
      if (!data) return [];
      
      return data.map((dto: AchievementDTO) => ({
        id: dto.id,
        name: dto.name,
        description: dto.description,
        category: dto.category,
        pointValue: dto.pointValue,
        iconUrl: dto.iconUrl,
        difficulty: dto.difficulty,
        unlockedAt: undefined,
        isViewed: false
      }));
    } catch (error) {
      console.error('Failed to fetch available achievements:', error);
      return [];
    }
  }

  // ================================
  // BADGES
  // ================================

  /**
   * Get user's earned badges
   */
  async getUserBadges(): Promise<Badge[]> {
    try {
      const data = await apiClient.get<UserBadgeDTO[]>('/v1/gamification/badges');
      
      if (!data) return [];
      
      return data.map((dto: UserBadgeDTO) => ({
        id: dto.badge.id,
        name: dto.badge.name,
        description: dto.badge.description,
        iconUrl: dto.badge.iconUrl,
        rarity: dto.badge.rarity,
        pointValue: dto.badge.pointValue,
        earnedAt: new Date(dto.earnedAt),
        isDisplayed: dto.isDisplayed
      }));
    } catch (error) {
      console.error('Failed to fetch user badges:', error);
      return [];
    }
  }

  // ================================
  // TASK COMPLETION INTEGRATION
  // ================================

  /**
   * Process task completion and check for new achievements
   * This is called by TaskCompletionService to get real achievement unlocks
   */
  async processTaskCompletion(taskId: number, taskDetails: { title?: string; points?: number; category?: string }): Promise<{
    newAchievements: Achievement[];
    pointsEarned: number;
    levelUp?: { oldLevel: number; newLevel: number };
  }> {
    try {
      // The backend automatically processes achievements when tasks are completed
      // We just need to fetch the updated data
      const [, achievements] = await Promise.all([
        this.getUserProgress(),
        this.getUserAchievements()
      ]);

      // Calculate if there are new achievements (simplified - would need better tracking)
      const newAchievements = achievements.filter(achievement => 
        achievement.unlockedAt && 
        achievement.unlockedAt > new Date(Date.now() - 5000) // Last 5 seconds
      );

      // Calculate points earned (simplified - real implementation would track previous state)
      const pointsEarned = this.calculateTaskPoints(taskDetails);

      return {
        newAchievements,
        pointsEarned,
        levelUp: undefined // Would compare previous vs current level
      };
    } catch (error) {
      console.error('Failed to process task completion gamification:', error);
      return {
        newAchievements: [],
        pointsEarned: this.calculateTaskPoints(taskDetails)
      };
    }
  }

  /**
   * Calculate points for task completion (matches backend logic)
   */
  private calculateTaskPoints(taskDetails: unknown): number {
    if (!taskDetails || typeof taskDetails !== 'object') return 10;
    
    const task = taskDetails as Record<string, unknown>;
    const basePoints = (task.pointsValue as number) || 10;
    
    // Priority multiplier
    const priorityMultipliers: Record<string, number> = {
      'Low': 1.0,
      'Medium': 1.2,
      'High': 1.5,
      'Urgent': 2.0
    };
    const priorityMultiplier = priorityMultipliers[task.priority as string] || 1.0;

    // Due date bonus (if completed on time)
    let dueDateBonus = 1.0;
    if (task.dueDate) {
      const dueDate = new Date(task.dueDate as string);
      const now = new Date();
      if (now <= dueDate) {
        dueDateBonus = 1.3; // 30% bonus for on-time completion
      }
    }

    return Math.round(basePoints * priorityMultiplier * dueDateBonus);
  }

  // ================================
  // COMPREHENSIVE GAMIFICATION STATE
  // ================================

  /**
   * Get complete gamification state for dashboard
   */
  async getGamificationState(): Promise<Partial<GamificationState>> {
    try {
      const [userProgress, achievements, badges] = await Promise.all([
        this.getUserProgress(),
        this.getUserAchievements(),
        this.getUserBadges()
      ]);

      return {
        currentPoints: userProgress?.totalPoints || 0,
        currentLevel: userProgress?.currentLevel || 1,
        currentStreak: userProgress?.currentStreak || 0,
        totalAchievements: achievements.length,
        totalBadges: badges.length,
        unlockedAchievements: achievements,
        earnedBadges: badges,
        recentPointsEarned: [], // Would need separate endpoint for recent activity
        recentAchievements: [], // Would need separate endpoint for recent activity
        recentBadges: [], // Would need separate endpoint for recent activity
        activeCelebrations: [],
        isLoading: false,
        isConnected: true,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Failed to fetch gamification state:', error);
      return {
        currentPoints: 0,
        currentLevel: 1,
        currentStreak: 0,
        totalAchievements: 0,
        totalBadges: 0,
        unlockedAchievements: [],
        earnedBadges: [],
        recentPointsEarned: [],
        recentAchievements: [],
        recentBadges: [],
        activeCelebrations: [],
        isLoading: false,
        isConnected: false,
        error: 'Failed to load gamification data'
      };
    }
  }
}

// Export singleton instance
export const gamificationService = GamificationService.getInstance(); 