'use client';

/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 * 
 * Gamification Events Hook
 * Manages real-time gamification events, achievement celebrations, and state management.
 * Connects to the backend's comprehensive 175+ achievement system.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useMainHubConnection } from './useSignalRConnection';
import {
  PointsEarnedEvent,
  AchievementUnlockedEvent,
  LevelUpEvent,
  StreakUpdatedEvent,
  BadgeEarnedEvent
} from '@/lib/types/signalr';

// ================================
// TYPES AND INTERFACES
// ================================

export interface GamificationState {
  // Current user stats
  currentPoints: number;
  currentLevel: number;
  currentStreak: number;
  totalAchievements: number;
  totalBadges: number;
  
  // Recent activity
  recentPointsEarned: PointsEarnedEvent[];
  recentAchievements: AchievementUnlockedEvent[];
  recentBadges: BadgeEarnedEvent[];
  
  // Active celebrations
  activeCelebrations: CelebrationEvent[];
  
  // Loading states
  isLoading: boolean;
  lastUpdated?: Date;
}

export interface CelebrationEvent {
  id: string;
  type: 'points' | 'achievement' | 'levelup' | 'badge' | 'streak';
  title: string;
  message: string;
  points?: number;
  timestamp: Date;
  duration: number; // in milliseconds
  priority: 'low' | 'medium' | 'high';
}

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
}

// ================================
// INITIAL STATE
// ================================

const INITIAL_STATE: GamificationState = {
  currentPoints: 0,
  currentLevel: 1,
  currentStreak: 0,
  totalAchievements: 0,
  totalBadges: 0,
  recentPointsEarned: [],
  recentAchievements: [],
  recentBadges: [],
  activeCelebrations: [],
  isLoading: true
};

// ================================
// CUSTOM HOOK
// ================================

export function useGamificationEvents(userId?: number) {
  const [state, setState] = useState<GamificationState>(INITIAL_STATE);
  const celebrationIdRef = useRef(0);
  
  // Generate unique celebration ID
  const generateCelebrationId = useCallback(() => {
    return `celebration-${++celebrationIdRef.current}-${Date.now()}`;
  }, []);

  // ================================
  // CELEBRATION HELPERS
  // ================================

  const playConfettiAnimation = useCallback(() => {
    if (typeof window !== 'undefined') {
      console.log('🎉 Playing confetti animation');
      // Confetti animation logic would go here
    }
  }, []);

  const playPulseAnimation = useCallback(() => {
    if (typeof window !== 'undefined') {
      console.log('💫 Playing pulse animation');
      // Pulse animation logic would go here
    }
  }, []);

  const playGlowAnimation = useCallback(() => {
    if (typeof window !== 'undefined') {
      console.log('✨ Playing glow animation');
      // Glow animation logic would go here
    }
  }, []);

  const playCelebrationSound = useCallback((type: string) => {
    if (typeof window !== 'undefined') {
      console.log(`🔊 Playing ${type} sound`);
      // Sound playing logic would go here
    }
  }, []);

  // ================================
  // CELEBRATION MANAGEMENT
  // ================================

  const addCelebration = useCallback((celebration: Omit<CelebrationEvent, 'id' | 'timestamp'>) => {
    const newCelebration: CelebrationEvent = {
      ...celebration,
      id: generateCelebrationId(),
      timestamp: new Date()
    };

    setState(prev => ({
      ...prev,
      activeCelebrations: [...prev.activeCelebrations, newCelebration]
    }));

    // Auto-dismiss celebration after duration
    setTimeout(() => {
      // Use functional state update to avoid dependency on dismissCelebration
      setState(prev => ({
        ...prev,
        activeCelebrations: prev.activeCelebrations.filter(c => c.id !== newCelebration.id)
      }));
    }, celebration.duration);

    // Play celebration sound/animation based on priority
    if (typeof window !== 'undefined') {
      switch (celebration.priority) {
        case 'high':
          playConfettiAnimation();
          playCelebrationSound('achievement');
          break;
        case 'medium':
          playPulseAnimation();
          playCelebrationSound('levelup');
          break;
        case 'low':
          playGlowAnimation();
          playCelebrationSound('points');
          break;
      }
    }
  }, [generateCelebrationId, playConfettiAnimation, playPulseAnimation, playGlowAnimation, playCelebrationSound]);

  const dismissCelebration = useCallback((celebrationId: string) => {
    setState(prev => ({
      ...prev,
      activeCelebrations: prev.activeCelebrations.filter(c => c.id !== celebrationId)
    }));
  }, []);

  const dismissAllCelebrations = useCallback(() => {
    setState(prev => ({
      ...prev,
      activeCelebrations: []
    }));
  }, []);

  // ================================
  // EVENT HANDLERS
  // ================================

  const handlePointsEarned = useCallback((event: PointsEarnedEvent) => {
    setState(prev => ({
      ...prev,
      currentPoints: prev.currentPoints + event.points,
      recentPointsEarned: [event, ...prev.recentPointsEarned.slice(0, 9)], // Keep last 10
      lastUpdated: new Date()
    }));

    // Add celebration for significant point gains
    if (event.points >= 20) {
      addCelebration({
        type: 'points',
        title: 'Great Work!',
        message: `You earned ${event.points} points for ${event.reason}`,
        points: event.points,
        duration: 3000,
        priority: event.points >= 50 ? 'high' : 'medium'
      });
    }

    console.log(`🎉 Points earned: +${event.points} for ${event.reason}`);
  }, [addCelebration]);

  const handleAchievementUnlocked = useCallback((event: AchievementUnlockedEvent) => {
    setState(prev => ({
      ...prev,
      totalAchievements: prev.totalAchievements + 1,
      currentPoints: prev.currentPoints + event.points,
      recentAchievements: [event, ...prev.recentAchievements.slice(0, 4)], // Keep last 5
      lastUpdated: new Date()
    }));

    // Always celebrate achievements with high priority
    addCelebration({
      type: 'achievement',
      title: '🏆 Achievement Unlocked!',
      message: `${event.achievementName} (+${event.points} points)`,
      points: event.points,
      duration: 5000,
      priority: 'high'
    });

    console.log(`🏆 Achievement unlocked: ${event.achievementName} (+${event.points} points)`);
  }, [addCelebration]);

  const handleLevelUp = useCallback((event: LevelUpEvent) => {
    setState(prev => ({
      ...prev,
      currentLevel: event.newLevel,
      lastUpdated: new Date()
    }));

    // Level up gets highest priority celebration
    addCelebration({
      type: 'levelup',
      title: '🚀 Level Up!',
      message: `Congratulations! You reached Level ${event.newLevel}`,
      duration: 6000,
      priority: 'high'
    });

    console.log(`🚀 Level up: ${event.oldLevel} → ${event.newLevel}`);
  }, [addCelebration]);

  const handleStreakUpdated = useCallback((event: StreakUpdatedEvent) => {
    setState(prev => ({
      ...prev,
      currentStreak: event.currentStreak,
      lastUpdated: new Date()
    }));

    // Celebrate new streak records or significant milestones
    if (event.isNewRecord || event.currentStreak % 7 === 0) {
      addCelebration({
        type: 'streak',
        title: event.isNewRecord ? '🔥 New Streak Record!' : '🔥 Streak Milestone!',
        message: `${event.currentStreak} day productivity streak!`,
        duration: 4000,
        priority: event.isNewRecord ? 'high' : 'medium'
      });
    }

    console.log(`🔥 Streak updated: ${event.currentStreak} days (Record: ${event.isNewRecord})`);
  }, [addCelebration]);

  const handleBadgeEarned = useCallback((event: BadgeEarnedEvent) => {
    setState(prev => ({
      ...prev,
      totalBadges: prev.totalBadges + 1,
      recentBadges: [event, ...prev.recentBadges.slice(0, 4)], // Keep last 5
      lastUpdated: new Date()
    }));

    // Badge rarity determines celebration priority
    const priority = event.rarity.toLowerCase() === 'legendary' ? 'high' :
                    event.rarity.toLowerCase() === 'epic' ? 'medium' : 'low';

    addCelebration({
      type: 'badge',
      title: '🎖️ Badge Earned!',
      message: `${event.badgeName} (${event.rarity})`,
      duration: 4000,
      priority
    });

    console.log(`🎖️ Badge earned: ${event.badgeName} (${event.rarity})`);
  }, [addCelebration]);

  // ================================
  // DATA FETCHING
  // ================================

  const fetchGamificationData = useCallback(async () => {
    if (!userId) return;

    try {
      setState(prev => ({ ...prev, isLoading: true }));

      // Fetch current user progress from API
      const response = await fetch(`http://localhost:5000/api/v1/gamification/progress`, {
        credentials: 'include'
      });

      if (response.ok) {
        const responseData = await response.json();
        const data = responseData.data || responseData; // Handle ApiResponse wrapper
        
        // Fetch achievements count
        const achievementsResponse = await fetch(`http://localhost:5000/api/v1/gamification/achievements`, {
          credentials: 'include'
        });
        
        const achievementsResponseData = achievementsResponse.ok ? await achievementsResponse.json() : [];
        const achievementsData = achievementsResponseData.data || achievementsResponseData; // Handle ApiResponse wrapper

        setState(prev => ({
          ...prev,
          currentPoints: data.currentPoints || 0,
          currentLevel: data.level || 1,
          currentStreak: data.currentStreak || 0,
          totalAchievements: Array.isArray(achievementsData) ? achievementsData.length : 0,
          totalBadges: data.totalBadges || 0,
          isLoading: false,
          lastUpdated: new Date()
        }));

        console.log('📊 Gamification data loaded:', {
          points: data.currentPoints,
          level: data.level,
          streak: data.currentStreak,
          achievements: Array.isArray(achievementsData) ? achievementsData.length : 0
        });
      }
    } catch (error) {
      console.error('❌ Failed to fetch gamification data:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [userId]);

  // ================================
  // SIGNALR CONNECTION
  // ================================

  const { isConnected, connectionState } = useMainHubConnection({
    onPointsEarned: handlePointsEarned,
    onAchievementUnlocked: handleAchievementUnlocked,
    onLevelUp: handleLevelUp,
    onStreakUpdated: handleStreakUpdated,
    onBadgeEarned: handleBadgeEarned,
    
    onConnected: () => {
      console.log('🔗 Gamification real-time connection established');
      fetchGamificationData();
    },
    
    onDisconnected: () => {
      console.log('🔌 Gamification real-time connection lost');
    },
    
    onError: (error) => {
      console.error('❌ Gamification connection error:', error);
    }
  });

  // ================================
  // EFFECTS
  // ================================

  useEffect(() => {
    // Initial data fetch when userId changes or component mounts
    if (userId) {
      fetchGamificationData();
    }
  }, [userId, fetchGamificationData]);



  // ================================
  // PUBLIC API
  // ================================

  const actions: GamificationActions = {
    onPointsEarned: handlePointsEarned,
    onAchievementUnlocked: handleAchievementUnlocked,
    onLevelUp: handleLevelUp,
    onStreakUpdated: handleStreakUpdated,
    onBadgeEarned: handleBadgeEarned,
    dismissCelebration,
    dismissAllCelebrations,
    refreshGamificationData: fetchGamificationData
  };

  return {
    // State
    ...state,
    
    // Connection status
    isConnected,
    connectionStatus: connectionState.status,
    
    // Actions
    ...actions,
    
    // Helper functions
    addCelebration,
    
    // Computed values
    hasRecentActivity: state.recentPointsEarned.length > 0 || 
                     state.recentAchievements.length > 0 || 
                     state.recentBadges.length > 0,
    
    celebrationCount: state.activeCelebrations.length
  };
} 