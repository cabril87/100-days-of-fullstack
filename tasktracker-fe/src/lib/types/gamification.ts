'use client';


/*
* Copyright (c) 2025 Carlos Abril Jr
* All rights reserved.
* 
* Gamification Type Definitions
* Comprehensive type system for the real-time gamification features
*/

import { HubConnectionStatus } from "./signalr";
// ================================
// BASE GAMIFICATION ENTITIES
// ================================

export interface Achievement {
  id: number;
  name: string;
  description: string;
  category: string;
  pointValue: number;
  iconUrl?: string;
  difficulty: 'VeryEasy' | 'Easy' | 'Medium' | 'Hard' | 'VeryHard';
  unlockedAt?: Date;
  isViewed?: boolean;
}

export interface Badge {
  id: number;
  name: string;
  description: string;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
  iconUrl?: string;
  pointValue: number;
  earnedAt?: Date;
  isViewed?: boolean;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  streakGoal: number;
  streakHistory: StreakHistoryEntry[];
  lastStreakDate?: Date;
}

export interface StreakHistoryEntry {
  date: Date;
  streakCount: number;
  isNewRecord: boolean;
}

// ================================
// EVENT TYPES
// ================================

export interface PointsEarnedEvent {
  userId: number;
  points: number;
  reason: string;
  taskId?: number;
  categoryId?: number;
  timestamp: Date;
  multiplier?: number;
}

export interface AchievementUnlockedEvent {
  userId: number;
  achievementId: number;
  achievementName: string;
  points: number;
  category: string;
  difficulty: Achievement['difficulty'];
  timestamp: Date;
}

export interface LevelUpEvent {
  userId: number;
  previousLevel: number;
  newLevel: number;
  pointsRequired: number;
  bonusPoints?: number;
  timestamp: Date;
}

export interface StreakUpdatedEvent {
  userId: number;
  currentStreak: number;
  previousStreak: number;
  isNewRecord: boolean;
  timestamp: Date;
}

export interface BadgeEarnedEvent {
  userId: number;
  badgeId: number;
  badgeName: string;
  rarity: Badge['rarity'];
  points: number;
  timestamp: Date;
}

// ================================
// CELEBRATION SYSTEM
// ================================

export interface CelebrationEvent {
  id: string;
  type: 'points' | 'achievement' | 'levelup' | 'badge' | 'streak';
  title: string;
  message: string;
  points?: number;
  timestamp: Date;
  duration: number; // in milliseconds
  priority: 'low' | 'medium' | 'high';
  data?: PointsEarnedEvent | AchievementUnlockedEvent | LevelUpEvent | StreakUpdatedEvent | BadgeEarnedEvent;
}

// ================================
// GAMIFICATION STATE
// ================================

export interface GamificationState {
  // Current user stats
  currentPoints: number;
  currentLevel: number;
  currentStreak: number;
  totalAchievements: number;
  totalBadges: number;
  unlockedAchievements: Achievement[];
  earnedBadges: Badge[];
  
  // Recent activity (last 24 hours)
  recentPointsEarned: PointsEarnedEvent[];
  recentAchievements: AchievementUnlockedEvent[];
  recentBadges: BadgeEarnedEvent[];
  
  // Active celebrations and UI state
  activeCelebrations: CelebrationEvent[];
  
  // Loading and connection state
  isLoading: boolean;
  isConnected: boolean;
  lastUpdated?: Date;
  error?: string;
}

// ================================
// GAMIFICATION ACTIONS
// ================================

export interface GamificationActions {
  // Event handlers
  onPointsEarned: (event: PointsEarnedEvent) => void;
  onAchievementUnlocked: (event: AchievementUnlockedEvent) => void;
  onLevelUp: (event: LevelUpEvent) => void;
  onStreakUpdated: (event: StreakUpdatedEvent) => void;
  onBadgeEarned: (event: BadgeEarnedEvent) => void;
  
  // Celebration management
  dismissCelebration: (celebrationId: string) => void;
  dismissAllCelebrations: () => void;
  
  // Data refresh
  refreshGamificationData: () => Promise<void>;
  markAchievementAsViewed: (achievementId: number) => Promise<void>;
}

// ================================
// HOOK RETURN TYPES
// ================================

export interface UseGamificationEventsReturn extends GamificationState, GamificationActions {
  // Computed properties
  hasRecentActivity: boolean;
  celebrationCount: number;
  pointsToNextLevel: number;
  levelProgress: number;
  connectionStatus: HubConnectionStatus;
}

// ================================
// DASHBOARD CONNECTION TYPES
// ================================

export interface DashboardConnectionsProps {
  userId?: number;
  enableLogging?: boolean;
}

export interface DashboardConnectionsReturn {
  // Connection states
  isConnected: boolean;
  signalRStatus: string;
  
  // Gamification data
  gamificationData: UseGamificationEventsReturn;
  
  // Connection methods
  reconnect: () => Promise<void>;
}

// ================================
// WIDGET PROP TYPES
// ================================

export interface SharedGamificationProps {
  isConnected?: boolean;
  gamificationData?: UseGamificationEventsReturn;
}

export interface SharedConnectionProps {
  isConnected?: boolean;
} 