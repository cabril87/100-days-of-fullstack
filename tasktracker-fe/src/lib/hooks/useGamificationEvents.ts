'use client';

/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 * 
 * Enterprise Gamification Events Hook
 * Provides comprehensive real-time gamification management with celebration framework,
 * state persistence, and seamless integration with the backend's 175+ achievement system.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useMainHubConnection } from './useSignalRConnection';
import { SignalREventHandlers } from '@/lib/types/signalr';
import {
  PointsEarnedEvent,
  AchievementUnlockedEvent,
  LevelUpEvent,
  StreakUpdatedEvent,
  BadgeEarnedEvent,
  GamificationState,
  GamificationActions,
  CelebrationEvent
} from '@/lib/types/gamification';
import { API_CONFIG } from '@/lib/config/api-client';

// ================================
// ALL TYPES IMPORTED FROM GAMIFICATION
// ================================

// ================================
// INITIAL STATE
// ================================

const INITIAL_STATE: GamificationState = {
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
  isLoading: true,
  isConnected: false
};

// ================================
// ENTERPRISE GAMIFICATION HOOK
// ================================

export function useGamificationEvents(userId?: number) {
  const [state, setState] = useState<GamificationState>(INITIAL_STATE);
  const celebrationIdRef = useRef(0);
  const lastDataFetch = useRef<Date | null>(null);
  const mounted = useRef(true);
  
  // Generate unique celebration ID
  const generateCelebrationId = useCallback(() => {
    return `celebration-${++celebrationIdRef.current}-${Date.now()}`;
  }, []);

  // ================================
  // REAL-TIME CONNECTION MANAGEMENT
  // ================================

  // Only create SignalR connection if userId is provided
  const connectionConfig: SignalREventHandlers = userId ? {
    onPointsEarned: (event: PointsEarnedEvent) => {
      if (mounted.current && event.userId === userId) {
        handlePointsEarned(event);
      }
    },
    
    onAchievementUnlocked: (event: AchievementUnlockedEvent) => {
      if (mounted.current && event.userId === userId) {
        handleAchievementUnlocked(event);
      }
    },
    
    onLevelUp: (event: LevelUpEvent) => {
      if (mounted.current && event.userId === userId) {
        handleLevelUp(event);
      }
    },
    
    onStreakUpdated: (event: StreakUpdatedEvent) => {
      if (mounted.current && event.userId === userId) {
        handleStreakUpdated(event);
      }
    },
    
    onBadgeEarned: (event: BadgeEarnedEvent) => {
      if (mounted.current && event.userId === userId) {
        handleBadgeEarned(event);
      }
    },

    onConnected: () => {
      if (mounted.current) {
        setState(prev => ({ ...prev, isConnected: true, error: undefined }));
        // Refresh data when connection is established
        refreshGamificationData();
      }
    },

    onDisconnected: (error?: Error) => {
      if (mounted.current) {
        setState(prev => ({ ...prev, isConnected: false }));
      } else {
        console.log('Disconnected from SignalR', error);
      }
    },

    onError: (error: Error) => {
      if (mounted.current) {
        setState(prev => ({ 
          ...prev, 
          isConnected: false, 
          error: error.message 
        }));
      }
    }
  } : {};

  const { isConnected, connectionState } = useMainHubConnection(connectionConfig);

  // ================================
  // DATA FETCHING AND STATE MANAGEMENT
  // ================================

  const refreshGamificationData = useCallback(async () => {
    if (!userId || !mounted.current) return;

    try {
      setState(prev => ({ ...prev, isLoading: true, error: undefined }));

      // Use the correct backend URL from API_CONFIG
      const baseUrl = API_CONFIG.BASE_URL;

      // Fetch current user progress - this uses ApiResponse wrapper
      const progressResponse = await fetch(`${baseUrl}/v1/gamification/progress`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!progressResponse.ok) {
        throw new Error(`Failed to fetch user progress: ${progressResponse.status} ${progressResponse.statusText}`);
      }

      const progressResponseData = await progressResponse.json();
      // Handle ApiResponse wrapper format
      const progressData = progressResponseData.data || progressResponseData;
      
      console.log('🎮 Progress API Response:', {
        status: progressResponse.status,
        hasData: !!progressResponseData,
        isWrapped: !!progressResponseData.data,
        progressData: progressData
      });

      // Fetch user achievements via the correct endpoint - returns direct array
      const achievementsResponse = await fetch(`${baseUrl}/v1/gamification/achievements`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      let achievementsData = [];
      if (achievementsResponse.ok) {
        achievementsData = await achievementsResponse.json();
        console.log('🏆 Achievements API Response:', {
          status: achievementsResponse.status,
          dataType: typeof achievementsData,
          isArray: Array.isArray(achievementsData),
          length: Array.isArray(achievementsData) ? achievementsData.length : 'not array',
          firstFew: Array.isArray(achievementsData) ? achievementsData.slice(0, 2) : achievementsData
        });
      } else {
        console.warn(`Failed to fetch achievements: ${achievementsResponse.status} ${achievementsResponse.statusText}`);
      }

      // Fetch user badges - this uses ApiResponse wrapper
      const badgesResponse = await fetch(`${baseUrl}/v1/gamification/badges`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      let badgesData = [];
      if (badgesResponse.ok) {
        const badgesResponseData = await badgesResponse.json();
        // Handle ApiResponse wrapper format
        badgesData = badgesResponseData.data || badgesResponseData;
      } else {
        console.warn(`Failed to fetch badges: ${badgesResponse.status} ${badgesResponse.statusText}`);
      }

      if (mounted.current) {
        // Create recent achievements from the data (last 5 for display)
        const recentAchievements = (achievementsData || [])
          .slice(-5)
          .map((achievement: any) => ({
            achievementId: achievement.id || achievement.achievementId,
            achievementName: achievement.name || achievement.achievementName || 'Unknown Achievement',
            points: achievement.pointValue || achievement.points || 0,
            timestamp: new Date(achievement.unlockedAt || achievement.createdAt || Date.now()),
            userId: userId
          }));

        setState(prev => ({
          ...prev,
          // Extract data with safe fallbacks
          currentPoints: progressData?.totalPointsEarned || progressData?.currentPoints || 0,
          currentLevel: progressData?.currentLevel || 1,
          currentStreak: progressData?.currentStreak || 0,
          totalAchievements: Array.isArray(achievementsData) ? achievementsData.length : 0,
          totalBadges: Array.isArray(badgesData) ? badgesData.length : 0,
          unlockedAchievements: achievementsData || [],
          earnedBadges: badgesData || [],
          recentAchievements: recentAchievements,
          isLoading: false,
          isConnected,
          lastUpdated: new Date()
        }));

        lastDataFetch.current = new Date();
      }
    } catch (err) {
      console.error('❌ Failed to initialize gamification data:', err);
      if (mounted.current) {
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: err instanceof Error ? err.message : 'Failed to load gamification data'
        }));
      }
    }
  }, [userId, isConnected]);

  // ================================
  // CELEBRATION FRAMEWORK
  // ================================

  const playConfettiAnimation = useCallback(() => {
    if (typeof window !== 'undefined') {
      // Trigger confetti animation
      const event = new CustomEvent('celebrate', { 
        detail: { type: 'confetti', intensity: 'high' } 
      });
      window.dispatchEvent(event);
    }
  }, []);

  const playPulseAnimation = useCallback(() => {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('celebrate', { 
        detail: { type: 'pulse', intensity: 'medium' } 
      });
      window.dispatchEvent(event);
    }
  }, []);

  const playGlowAnimation = useCallback(() => {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('celebrate', { 
        detail: { type: 'glow', intensity: 'low' } 
      });
      window.dispatchEvent(event);
    }
  }, []);

  const playCelebrationSound = useCallback((type: string) => {
    if (typeof window !== 'undefined') {
      try {
        const audio = new Audio(`/sounds/celebration-${type}.mp3`);
        audio.volume = 0.3;
        audio.play().catch(() => {
          // Ignore audio play errors (user might not have interacted with page yet)
        });
      } catch {
        console.error('Failed to play celebration sound');
        // Ignore audio errors
      }
    }
  }, []);

  const addCelebration = useCallback((celebration: Omit<CelebrationEvent, 'id' | 'timestamp'>) => {
    if (!mounted.current) return;

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
      if (mounted.current) {
        setState(prev => ({
          ...prev,
          activeCelebrations: prev.activeCelebrations.filter(c => c.id !== newCelebration.id)
        }));
      }
    }, celebration.duration);

    // Play celebration effects based on priority
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
  }, [generateCelebrationId, playConfettiAnimation, playPulseAnimation, playGlowAnimation, playCelebrationSound]);

  const dismissCelebration = useCallback((celebrationId: string) => {
    if (!mounted.current) return;
    
    setState(prev => ({
      ...prev,
      activeCelebrations: prev.activeCelebrations.filter(c => c.id !== celebrationId)
    }));
  }, []);

  const dismissAllCelebrations = useCallback(() => {
    if (!mounted.current) return;
    
    setState(prev => ({
      ...prev,
      activeCelebrations: []
    }));
  }, []);

  // ================================
  // REAL-TIME EVENT HANDLERS
  // ================================

  const handlePointsEarned = useCallback((event: PointsEarnedEvent) => {
    if (!mounted.current) return;

    setState(prev => ({
      ...prev,
      currentPoints: prev.currentPoints + event.points,
      recentPointsEarned: [event, ...prev.recentPointsEarned.slice(0, 9)] // Keep last 10
    }));

    // Add celebration for significant point gains
    if (event.points >= 15) {
      addCelebration({
        type: 'points',
        title: `+${event.points} Points!`,
        message: event.reason || 'Great job!',
        points: event.points,
        duration: 3000,
        priority: event.points >= 50 ? 'high' : event.points >= 25 ? 'medium' : 'low',
        data: event
      });
    }
  }, [addCelebration]);

  const handleAchievementUnlocked = useCallback((event: AchievementUnlockedEvent) => {
    if (!mounted.current) return;

    setState(prev => ({
      ...prev,
      totalAchievements: prev.totalAchievements + 1,
      currentPoints: prev.currentPoints + event.points,
      recentAchievements: [event, ...prev.recentAchievements.slice(0, 4)] // Keep last 5
    }));

    // Add high-priority celebration for achievements
    addCelebration({
      type: 'achievement',
      title: 'Achievement Unlocked!',
      message: event.achievementName,
      points: event.points,
      duration: 5000,
      priority: 'high',
      data: event
    });

    // Refresh achievement data to get full details
    setTimeout(() => {
      if (mounted.current) {
        refreshGamificationData();
      }
    }, 1000);
  }, [addCelebration, refreshGamificationData]);

  const handleLevelUp = useCallback((event: LevelUpEvent) => {
    if (!mounted.current) return;

    setState(prev => ({
      ...prev,
      currentLevel: event.newLevel
    }));

    // Add high-priority celebration for level ups
    addCelebration({
      type: 'levelup',
      title: 'Level Up!',
      message: `You reached level ${event.newLevel}!`,
      duration: 5000,
      priority: 'high',
      data: event
    });
  }, [addCelebration]);

  const handleStreakUpdated = useCallback((event: StreakUpdatedEvent) => {
    if (!mounted.current) return;

    setState(prev => ({
      ...prev,
      currentStreak: event.currentStreak
    }));

    // Add celebration for significant streaks or new records
    if (event.isNewRecord || event.currentStreak % 7 === 0) {
      addCelebration({
        type: 'streak',
        title: event.isNewRecord ? 'New Streak Record!' : 'Streak Milestone!',
        message: `${event.currentStreak} day${event.currentStreak !== 1 ? 's' : ''} strong!`,
        duration: 4000,
        priority: event.isNewRecord ? 'high' : 'medium',
        data: event
      });
    }
  }, [addCelebration]);

  const handleBadgeEarned = useCallback((event: BadgeEarnedEvent) => {
    if (!mounted.current) return;

    setState(prev => ({
      ...prev,
      totalBadges: prev.totalBadges + 1,
      recentBadges: [event, ...prev.recentBadges.slice(0, 4)] // Keep last 5
    }));

    // Add celebration for badges
    addCelebration({
      type: 'badge',
      title: 'Badge Earned!',
      message: event.badgeName,
      duration: 4000,
      priority: event.rarity === 'Legendary' || event.rarity === 'Epic' ? 'high' : 'medium',
      data: event
    });

    // Refresh badge data to get full details
    setTimeout(() => {
      if (mounted.current) {
        refreshGamificationData();
      }
    }, 1000);
  }, [addCelebration, refreshGamificationData]);

  // ================================
  // UTILITY METHODS
  // ================================

  const markAchievementAsViewed = useCallback(async (achievementId: number) => {
    if (!userId) return;

    try {
      await fetch(`/api/v1/gamification/achievements/${achievementId}/viewed`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
      });
    } catch (error) {
      console.error('Failed to mark achievement as viewed:', error);
    }
  }, [userId]);

  // ================================
  // LIFECYCLE MANAGEMENT
  // ================================

  // Initial data load and periodic refresh
  useEffect(() => {
    mounted.current = true;

    if (userId) {
      console.log(`🎮 Gamification: Starting data load for user ${userId}`);
      refreshGamificationData();

      // Set up periodic refresh (every 5 minutes)
      const refreshInterval = setInterval(() => {
        if (mounted.current && lastDataFetch.current) {
          const timeSinceLastFetch = Date.now() - lastDataFetch.current.getTime();
          if (timeSinceLastFetch > 5 * 60 * 1000) { // 5 minutes
            refreshGamificationData();
          }
        }
      }, 60000); // Check every minute

      return () => {
        clearInterval(refreshInterval);
      };
    } else {
      // No userId provided - set loading to false immediately to prevent stuck loading state
      console.log('🎮 Gamification: No userId provided, setting loading to false');
      setState(prev => ({ ...prev, isLoading: false }));
    }

    return () => {
      mounted.current = false;
    };
  }, [userId, refreshGamificationData]);

  // Update connection state
  useEffect(() => {
    if (mounted.current) {
      setState(prev => ({ 
        ...prev, 
        isConnected: connectionState.status === 'Connected' 
      }));
    }
  }, [connectionState.status]);

  // ================================
  // ENTERPRISE API RETURN
  // ================================

  const actions: GamificationActions = {
    onPointsEarned: handlePointsEarned,
    onAchievementUnlocked: handleAchievementUnlocked,
    onLevelUp: handleLevelUp,
    onStreakUpdated: handleStreakUpdated,
    onBadgeEarned: handleBadgeEarned,
    dismissCelebration,
    dismissAllCelebrations,
    refreshGamificationData,
    markAchievementAsViewed
  };

  return {
    // State
    ...state,
    
    // Actions
    ...actions,
    
    // Computed properties
    hasRecentActivity: state.recentPointsEarned.length > 0 || 
                      state.recentAchievements.length > 0 || 
                      state.recentBadges.length > 0,
    
    celebrationCount: state.activeCelebrations.length,
    
    // Progress calculations
    pointsToNextLevel: Math.max(0, (state.currentLevel * 100) - state.currentPoints),
    levelProgress: Math.min(100, (state.currentPoints % 100)),
    
    // Connection status
    connectionStatus: connectionState.status
  };
} 