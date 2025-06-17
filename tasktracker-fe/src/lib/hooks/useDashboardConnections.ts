'use client';

/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 * 
 * Dashboard Connections Hook
 * Manages shared SignalR connections and gamification events for the entire dashboard
 * using the centralized connection manager to prevent multiple competing connections.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useSignalRConnectionManager } from './useSignalRConnectionManager';
import { API_CONFIG } from '@/lib/config/api-client';
import { 
  DashboardConnectionsProps, 
  DashboardConnectionsReturn,
  GamificationState,
  PointsEarnedEvent,
  AchievementUnlockedEvent,
  LevelUpEvent,
  StreakUpdatedEvent,
  BadgeEarnedEvent
} from '@/lib/types/gamification';

// ================================
// INITIAL STATE
// ================================

const INITIAL_GAMIFICATION_STATE: GamificationState = {
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
  isLoading: false, // Start with false to prevent stuck loading states
  isConnected: false
};

export function useDashboardConnections({ 
  userId, 
  enableLogging = true 
}: DashboardConnectionsProps): DashboardConnectionsReturn {
  
  // Track hook calls to prevent excessive logging
  const renderCount = useRef(0);
  renderCount.current += 1;
  
  // Only log every 5th call to reduce spam
  if (process.env.NODE_ENV === 'development' && renderCount.current % 5 === 1) {
    console.log(`🔗 useDashboardConnections called for userId: ${userId} (call #${renderCount.current})`);
  }
  
  const [gamificationState, setGamificationState] = useState<GamificationState>(INITIAL_GAMIFICATION_STATE);
  const mounted = useRef(true);
  const lastDataFetch = useRef<Date | null>(null);

  // ✨ Event handlers for gamification events
  const handlePointsEarned = useCallback((event: PointsEarnedEvent) => {
    if (!mounted.current || event.userId !== userId) return;
    
    setGamificationState(prev => ({
      ...prev,
      currentPoints: prev.currentPoints + event.points,
      recentPointsEarned: [event, ...prev.recentPointsEarned.slice(0, 9)] // Keep last 10
    }));

    if (enableLogging) {
      console.log(`🎯 Dashboard: Points earned - ${event.points} for ${event.reason}`);
    }
  }, [userId, enableLogging]);

  const handleAchievementUnlocked = useCallback((event: AchievementUnlockedEvent) => {
    if (!mounted.current || event.userId !== userId) return;
    
    setGamificationState(prev => ({
      ...prev,
      currentPoints: prev.currentPoints + event.points,
      totalAchievements: prev.totalAchievements + 1,
      recentAchievements: [event, ...prev.recentAchievements.slice(0, 4)] // Keep last 5
    }));

    if (enableLogging) {
      console.log(`🏆 Dashboard: Achievement unlocked - ${event.achievementName}`);
    }
  }, [userId, enableLogging]);

  const handleLevelUp = useCallback((event: LevelUpEvent) => {
    if (!mounted.current || event.userId !== userId) return;
    
    setGamificationState(prev => ({
      ...prev,
      currentLevel: event.newLevel,
      currentPoints: prev.currentPoints + (event.bonusPoints || 0)
    }));

    if (enableLogging) {
      console.log(`⭐ Dashboard: Level up - Level ${event.newLevel}`);
    }
  }, [userId, enableLogging]);

  const handleStreakUpdated = useCallback((event: StreakUpdatedEvent) => {
    if (!mounted.current || event.userId !== userId) return;
    
    setGamificationState(prev => ({
      ...prev,
      currentStreak: event.currentStreak
    }));

    if (enableLogging) {
      console.log(`🔥 Dashboard: Streak updated - ${event.currentStreak} days`);
    }
  }, [userId, enableLogging]);

  const handleBadgeEarned = useCallback((event: BadgeEarnedEvent) => {
    if (!mounted.current || event.userId !== userId) return;
    
    setGamificationState(prev => ({
      ...prev,
      totalBadges: prev.totalBadges + 1,
      recentBadges: [event, ...prev.recentBadges.slice(0, 4)] // Keep last 5
    }));

    if (enableLogging) {
      console.log(`🎖️ Dashboard: Badge earned - ${event.badgeName}`);
    }
  }, [userId, enableLogging]);

  // ✨ Single shared SignalR connection for the entire dashboard using connection manager
  const signalRConnection = useSignalRConnectionManager('dashboard', {
    onPointsEarned: handlePointsEarned,
    onAchievementUnlocked: handleAchievementUnlocked,
    onLevelUp: handleLevelUp,
    onStreakUpdated: handleStreakUpdated,
    onBadgeEarned: handleBadgeEarned,
    onConnected: () => {
      if (enableLogging) {
        console.log('🚀 Dashboard: SignalR connected');
      }
      setGamificationState(prev => ({ ...prev, isConnected: true, error: undefined }));
      refreshGamificationData();
    },
    onDisconnected: (error?: Error) => {
      if (enableLogging) {
        console.log('🔌 Dashboard: SignalR disconnected');
      }
      setGamificationState(prev => ({ ...prev, isConnected: false }));
    },
    onError: (error: Error) => {
      if (enableLogging) {
        console.error('❌ Dashboard: SignalR error:', error);
      }
      setGamificationState(prev => ({ 
        ...prev, 
        isConnected: false, 
        error: error.message 
      }));
    },
    onReconnecting: () => {
      if (enableLogging) {
        console.log('🔄 Dashboard: SignalR reconnecting...');
      }
    },
    onReconnected: () => {
      if (enableLogging) {
        console.log('✅ Dashboard: SignalR reconnected');
      }
      setGamificationState(prev => ({ ...prev, isConnected: true, error: undefined }));
    }
  });

  // Fetch gamification data from API
  const refreshGamificationData = useCallback(async () => {
    if (!userId || !mounted.current) {
      console.log('🎮 Dashboard Gamification: Skipping refresh - no userId or not mounted', {
        userId,
        mounted: mounted.current,
        userIdType: typeof userId,
        userIdTruthy: !!userId
      });
      return;
    }

    console.log(`🎮 Dashboard Gamification: Starting refresh for user ${userId}`);
    try {
      // Don't set isLoading here - it's already set in useEffect to prevent race conditions
      setGamificationState(prev => ({ ...prev, error: undefined }));

      const baseUrl = API_CONFIG.BASE_URL;
      console.log(`🎮 Dashboard Gamification: Using base URL: ${baseUrl}`);

      // Fetch user progress - this uses ApiResponse wrapper
      console.log(`🎮 Dashboard Gamification: Fetching progress from ${baseUrl}/v1/gamification/progress`);
      const progressResponse = await fetch(`${baseUrl}/v1/gamification/progress`, {
        credentials: 'include',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
      });

      let progressData: any = {};
      if (progressResponse.ok) {
        const progressResponseData = await progressResponse.json();
        // Handle ApiResponse wrapper format
        progressData = progressResponseData.data || progressResponseData;
        console.log('🎮 Dashboard Gamification: Progress response:', {
          status: progressResponse.status,
          hasData: !!progressResponseData,
          isWrapped: !!progressResponseData.data,
          progressData: progressData
        });
      } else {
        console.warn(`🎮 Dashboard Gamification: Failed to fetch progress: ${progressResponse.status} ${progressResponse.statusText}`);
      }

      // Fetch user achievements via the correct endpoint - returns direct array
      console.log(`🎮 Dashboard Gamification: Fetching achievements from ${baseUrl}/v1/gamification/achievements`);
      const achievementsResponse = await fetch(`${baseUrl}/v1/gamification/achievements`, {
        credentials: 'include',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
      });

      let achievementsData = [];
      if (achievementsResponse.ok) {
        achievementsData = await achievementsResponse.json();
        console.log('🎮 Dashboard Gamification: Achievements response:', {
          status: achievementsResponse.status,
          dataType: typeof achievementsData,
          isArray: Array.isArray(achievementsData),
          length: Array.isArray(achievementsData) ? achievementsData.length : 'not array',
          firstFew: Array.isArray(achievementsData) ? achievementsData.slice(0, 2) : achievementsData
        });
      } else {
        console.warn(`🎮 Dashboard Gamification: Failed to fetch achievements: ${achievementsResponse.status} ${achievementsResponse.statusText}`);
      }

      // Fetch user badges - this uses ApiResponse wrapper
      console.log(`🎮 Dashboard Gamification: Fetching badges from ${baseUrl}/v1/gamification/badges`);
      const badgesResponse = await fetch(`${baseUrl}/v1/gamification/badges`, {
        credentials: 'include',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
      });

      let badgesData = [];
      if (badgesResponse.ok) {
        const badgesResponseData = await badgesResponse.json();
        // Handle ApiResponse wrapper format
        badgesData = badgesResponseData.data || badgesResponseData;
        console.log('🎮 Dashboard Gamification: Badges response:', {
          status: badgesResponse.status,
          hasData: !!badgesResponseData,
          isWrapped: !!badgesResponseData.data,
          badgesData: badgesData
        });
      } else {
        console.warn(`🎮 Dashboard Gamification: Failed to fetch badges: ${badgesResponse.status} ${badgesResponse.statusText}`);
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

        const finalState = {
          currentPoints: progressData?.totalPointsEarned || progressData?.currentPoints || 0,
          currentLevel: progressData?.currentLevel || 1,
          currentStreak: progressData?.currentStreak || 0,
          totalAchievements: Array.isArray(achievementsData) ? achievementsData.length : 0,
          totalBadges: Array.isArray(badgesData) ? badgesData.length : 0,
          unlockedAchievements: achievementsData || [],
          earnedBadges: badgesData || [],
          recentAchievements: recentAchievements,
          isLoading: false,
          isConnected: signalRConnection.isConnected,
          lastUpdated: new Date()
        };
        
        console.log('🎮 Dashboard Gamification: Final state update:', finalState);
        
        setGamificationState(prev => {
          const newState = { ...prev, ...finalState };
          console.log('🎮 Dashboard Gamification: State transition:', {
            wasLoading: prev.isLoading,
            nowLoading: newState.isLoading,
            hasData: newState.currentPoints !== undefined
          });
          return newState;
        });

        lastDataFetch.current = new Date();
      }
    } catch (err) {
      console.error('Failed to load gamification data:', err);
      if (mounted.current) {
        setGamificationState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: err instanceof Error ? err.message : 'Failed to load gamification data'
        }));
      }
    }
  }, [userId, signalRConnection.isConnected]);

  // Load initial data - only when userId changes
  useEffect(() => {
    if (userId) {
      console.log(`🎮 Dashboard Gamification: Initial load for user ${userId}`);
      setGamificationState(prev => ({ ...prev, isLoading: true }));
      
      // Call refreshGamificationData directly to avoid dependency issues
      const loadData = async () => {
        if (!userId || !mounted.current) {
          console.log('🎮 Dashboard Gamification: Skipping refresh - no userId or not mounted');
          return;
        }

        console.log(`🎮 Dashboard Gamification: Starting refresh for user ${userId}`, {
          mounted: mounted.current,
          userId: userId
        });
        try {
          setGamificationState(prev => ({ ...prev, error: undefined }));

          const baseUrl = API_CONFIG.BASE_URL;
          console.log(`🎮 Dashboard Gamification: Using base URL: ${baseUrl}`);

          // Fetch user progress
          const progressResponse = await fetch(`${baseUrl}/v1/gamification/progress`, {
            credentials: 'include',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
          });

          let progressData: any = {};
          if (progressResponse.ok) {
            const progressResponseData = await progressResponse.json();
            progressData = progressResponseData.data || progressResponseData;
            console.log('🎮 Dashboard Gamification: Progress loaded successfully', {
              points: progressData?.currentPoints || progressData?.totalPointsEarned,
              level: progressData?.currentLevel,
              streak: progressData?.currentStreak
            });
          } else {
            console.warn(`🎮 Dashboard Gamification: Progress API failed: ${progressResponse.status}`);
          }

          // Fetch user achievements
          const achievementsResponse = await fetch(`${baseUrl}/v1/gamification/achievements`, {
            credentials: 'include',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
          });

          let achievementsData = [];
          if (achievementsResponse.ok) {
            achievementsData = await achievementsResponse.json();
            console.log('🎮 Dashboard Gamification: Achievements loaded successfully', {
              count: Array.isArray(achievementsData) ? achievementsData.length : 'not array'
            });
          } else {
            console.warn(`🎮 Dashboard Gamification: Achievements API failed: ${achievementsResponse.status}`);
          }

          // Fetch user badges
          const badgesResponse = await fetch(`${baseUrl}/v1/gamification/badges`, {
            credentials: 'include',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
          });

          let badgesData = [];
          if (badgesResponse.ok) {
            const badgesResponseData = await badgesResponse.json();
            badgesData = badgesResponseData.data || badgesResponseData;
            console.log('🎮 Dashboard Gamification: Badges loaded successfully', {
              count: Array.isArray(badgesData) ? badgesData.length : 'not array'
            });
          } else {
            console.warn(`🎮 Dashboard Gamification: Badges API failed: ${badgesResponse.status}`);
          }

          if (mounted.current) {
            const recentAchievements = (achievementsData || [])
              .slice(-5)
              .map((achievement: any) => ({
                achievementId: achievement.id || achievement.achievementId,
                achievementName: achievement.name || achievement.achievementName || 'Unknown Achievement',
                points: achievement.pointValue || achievement.points || 0,
                timestamp: new Date(achievement.unlockedAt || achievement.createdAt || Date.now()),
                userId: userId
              }));

            const finalState = {
              currentPoints: progressData?.totalPointsEarned || progressData?.currentPoints || 0,
              currentLevel: progressData?.currentLevel || 1,
              currentStreak: progressData?.currentStreak || 0,
              totalAchievements: Array.isArray(achievementsData) ? achievementsData.length : 0,
              totalBadges: Array.isArray(badgesData) ? badgesData.length : 0,
              unlockedAchievements: achievementsData || [],
              earnedBadges: badgesData || [],
              recentAchievements: recentAchievements,
              isLoading: false,
              isConnected: signalRConnection.isConnected,
              lastUpdated: new Date()
            };
            
            console.log('🎮 Dashboard Gamification: Setting final state with isLoading: false');
            setGamificationState(prev => ({ ...prev, ...finalState }));
            lastDataFetch.current = new Date();
          }
        } catch (err) {
          console.error('Failed to load gamification data:', err);
          if (mounted.current) {
            setGamificationState(prev => ({ 
              ...prev, 
              isLoading: false, 
              error: err instanceof Error ? err.message : 'Failed to load gamification data'
            }));
          }
        }
      };

      loadData();
    } else {
      console.log('🎮 Dashboard Gamification: No userId - keeping loading false');
      setGamificationState(prev => ({ ...prev, isLoading: false }));
    }
    
    // No cleanup needed here - the mounted ref should persist across re-renders
  }, [userId]);

  // Separate cleanup effect that only runs on component unmount
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []); // Empty dependency array - only runs on mount/unmount

  // Manual reconnection method
  const reconnect = useCallback(async () => {
    try {
      if (enableLogging) {
        console.log('🔄 Dashboard: Manual reconnection requested');
      }
      await refreshGamificationData();
    } catch (error) {
      if (enableLogging) {
        console.error('❌ Dashboard: Manual reconnection failed:', error);
      }
    }
  }, [refreshGamificationData, enableLogging]);

  return {
    // Connection states
    isConnected: signalRConnection.isConnected,
    signalRStatus: signalRConnection.connectionState.status,
    
    // Gamification data with all required methods
    gamificationData: {
      ...gamificationState,
      refreshGamificationData,
      // Add required action methods (these are handled by the event handlers above)
      onPointsEarned: handlePointsEarned,
      onAchievementUnlocked: handleAchievementUnlocked,
      onLevelUp: handleLevelUp,
      onStreakUpdated: handleStreakUpdated,
      onBadgeEarned: handleBadgeEarned,
      // Add missing celebration management methods
      dismissCelebration: (celebrationId: string) => {
        setGamificationState(prev => ({
          ...prev,
          activeCelebrations: prev.activeCelebrations.filter(c => c.id !== celebrationId)
        }));
      },
      dismissAllCelebrations: () => {
        setGamificationState(prev => ({
          ...prev,
          activeCelebrations: []
        }));
      },
      markAchievementAsViewed: async (achievementId: number) => {
        // Implementation for marking achievement as viewed
        console.log(`Marking achievement ${achievementId} as viewed`);
      },
      // Add computed properties
      hasRecentActivity: gamificationState.recentPointsEarned.length > 0 || 
                        gamificationState.recentAchievements.length > 0 || 
                        gamificationState.recentBadges.length > 0,
      celebrationCount: gamificationState.activeCelebrations.length,
      pointsToNextLevel: 100 - (gamificationState.currentPoints % 100),
      levelProgress: (gamificationState.currentPoints % 100),
      connectionStatus: signalRConnection.connectionState.status
    },
    
    // Connection methods
    reconnect: signalRConnection.connect
  };
} 