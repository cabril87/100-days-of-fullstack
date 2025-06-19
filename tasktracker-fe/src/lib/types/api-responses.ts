/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 */

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  timestamp?: string;
}

/**
 * User progress API response
 */
export interface UserProgressApiResponse {
  totalPointsEarned?: number;
  currentPoints?: number;
  currentLevel?: number;
  currentStreak?: number;
  totalAchievements?: number;
  totalBadges?: number;
  lastUpdated?: string;
}

/**
 * Achievement API response
 */
export interface AchievementApiResponse {
  id?: number;
  achievementId?: number;
  name?: string;
  achievementName?: string;
  description?: string;
  category?: string;
  pointValue?: number;
  points?: number;
  iconUrl?: string;
  difficulty?: string;
  unlockedAt?: string;
  createdAt?: string;
}

/**
 * Badge API response
 */
export interface BadgeApiResponse {
  id?: number;
  badgeId?: number;
  name?: string;
  badgeName?: string;
  description?: string;
  rarity?: string;
  iconUrl?: string;
  pointValue?: number;
  points?: number;
  earnedAt?: string;
  createdAt?: string;
}

/**
 * Task statistics API response
 */
export interface TaskStatsApiResponse {
  tasksCompleted: number;
  activeGoals: number;
  focusTimeToday: number;
  totalPoints: number;
  streakDays: number;
}

/**
 * Family task statistics API response
 */
export interface FamilyTaskStatsApiResponse {
  totalTasks: number;
  completedTasks: number;
  familyScore: number;
  weeklyProgress: number;
  memberStats: Array<{
    memberId: number;
    tasksCompleted: number;
    points: number;
  }>;
} 