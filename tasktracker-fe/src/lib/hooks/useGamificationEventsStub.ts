'use client';

/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 * 
 * Gamification Events Stub Hook
 * Returns empty gamification data without creating SignalR connections.
 * Used by widgets when shared data is provided to prevent duplicate connections.
 */

import { GamificationState } from '@/lib/types/gamification';

// ================================
// INITIAL EMPTY STATE
// ================================

const EMPTY_GAMIFICATION_STATE: GamificationState = {
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
  isConnected: false
};

// ================================
// STUB HOOK - NO CONNECTIONS
// ================================

export function useGamificationEventsStub() {
  // Return empty state with no-op functions
  return {
    ...EMPTY_GAMIFICATION_STATE,
    // No-op action methods
    onPointsEarned: () => {},
    onAchievementUnlocked: () => {},
    onLevelUp: () => {},
    onStreakUpdated: () => {},
    onBadgeEarned: () => {},
    // No-op celebration management
    dismissCelebration: () => {},
    dismissAllCelebrations: () => {},
    markAchievementAsViewed: async () => {},
    // Empty computed properties
    hasRecentActivity: false,
    celebrationCount: 0,
    pointsToNextLevel: 100,
    levelProgress: 0,
    connectionStatus: 'Disconnected'
  };
} 