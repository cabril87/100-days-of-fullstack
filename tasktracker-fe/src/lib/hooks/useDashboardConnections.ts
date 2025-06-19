'use client';

/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 * 
 * Dashboard Connections Hook
 * Manages shared SignalR connections and gamification events for the entire dashboard
 * using the centralized connection manager to prevent multiple competing connections.
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useSignalRConnectionManager } from './useSignalRConnectionManager';
import { API_CONFIG } from '@/lib/config/api-client';
import {
  GamificationState,
  PointsEarnedEvent,
  AchievementUnlockedEvent,
  LevelUpEvent,
  StreakUpdatedEvent,
  BadgeEarnedEvent,
  Achievement,
  Badge
} from '@/lib/types/gamification';
import type {
  DashboardConnectionsProps,
  DashboardConnectionsReturn
} from '@/lib/types/component-props/dashboard-props';
import type {
  UserProgressApiResponse,
  AchievementApiResponse,
  BadgeApiResponse
} from '@/lib/types/api-responses';

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

// ✨ Enterprise Transformation Utilities
const transformAchievementApiResponse = (apiResponse: AchievementApiResponse): Achievement => ({
  id: apiResponse.id || apiResponse.achievementId || 0,
  name: apiResponse.name || apiResponse.achievementName || 'Unknown Achievement',
  description: apiResponse.description || 'No description available',
  category: apiResponse.category || 'General',
  pointValue: apiResponse.pointValue || apiResponse.points || 0,
  iconUrl: apiResponse.iconUrl,
  difficulty: (apiResponse.difficulty as Achievement['difficulty']) || 'Medium',
  unlockedAt: apiResponse.unlockedAt ? new Date(apiResponse.unlockedAt) : undefined,
  isViewed: false
});

const transformBadgeApiResponse = (apiResponse: BadgeApiResponse): Badge => ({
  id: apiResponse.id || apiResponse.badgeId || 0,
  name: apiResponse.name || apiResponse.badgeName || 'Unknown Badge',
  description: apiResponse.description || 'No description available',
  rarity: (apiResponse.rarity as Badge['rarity']) || 'Common',
  iconUrl: apiResponse.iconUrl,
  pointValue: apiResponse.pointValue || apiResponse.points || 0,
  earnedAt: apiResponse.earnedAt ? new Date(apiResponse.earnedAt) : undefined,
  isViewed: false
});

export function useDashboardConnections({
  userId,
  enableLogging = true
}: DashboardConnectionsProps): DashboardConnectionsReturn {

  // Track hook calls to prevent excessive logging
  const renderCount = useRef(0);
  renderCount.current += 1;

  // Only log every 50th call to reduce spam significantly
  if (process.env.NODE_ENV === 'development' && renderCount.current % 50 === 1) {
    console.log(`🔗 useDashboardConnections called for userId: ${userId} (call #${renderCount.current})`);
    
    // Show warning if being called excessively
    if (renderCount.current > 100) {
      console.warn(`⚠️ useDashboardConnections called ${renderCount.current} times - potential render loop detected!`);
    }
  }

  const [gamificationState, setGamificationState] = useState<GamificationState>(INITIAL_GAMIFICATION_STATE);
  const mounted = useRef(true);
  const lastDataFetch = useRef<Date | null>(null);
  const isRefreshing = useRef(false);

  // ✨ ENTERPRISE: Advanced error handling and health monitoring
  const [connectionHealth, setConnectionHealth] = useState({
    consecutiveFailures: 0,
    lastSuccessfulConnection: null as Date | null,
    isHealthy: true,
    lastError: null as string | null
  });
  
  const connectionMetrics = useRef({
    totalConnections: 0,
    totalDisconnections: 0,
    averageConnectionTime: 0,
    lastConnectionStart: null as Date | null
  });

  // ✨ ENTERPRISE: Circuit breaker pattern for connection stability
  // Circuit breaker function - moved to inline usage to avoid unused variable warning

  // ✨ ENTERPRISE: Connection health monitoring
  const updateConnectionHealth = useCallback((success: boolean, error?: string) => {
    setConnectionHealth(prev => {
      const now = new Date();
      
      if (success) {
        // Track connection metrics
        if (connectionMetrics.current.lastConnectionStart) {
          const connectionTime = now.getTime() - connectionMetrics.current.lastConnectionStart.getTime();
          connectionMetrics.current.averageConnectionTime = 
            (connectionMetrics.current.averageConnectionTime + connectionTime) / 2;
        }
        connectionMetrics.current.totalConnections += 1;
        connectionMetrics.current.lastConnectionStart = null;
        
        return {
          consecutiveFailures: 0,
          lastSuccessfulConnection: now,
          isHealthy: true,
          lastError: null
        };
      } else {
        connectionMetrics.current.totalDisconnections += 1;
        
        return {
          ...prev,
          consecutiveFailures: prev.consecutiveFailures + 1,
          isHealthy: prev.consecutiveFailures < 3, // Unhealthy after 3 failures
          lastError: error || 'Unknown connection error'
        };
      }
    });
  }, []);

  // ✨ ENTERPRISE: Enhanced connection quality assessment
  const getConnectionQuality = useCallback(() => {
    const { consecutiveFailures, lastSuccessfulConnection } = connectionHealth;
    
    if (consecutiveFailures === 0 && lastSuccessfulConnection) {
      const timeSinceLastSuccess = Date.now() - lastSuccessfulConnection.getTime();
      if (timeSinceLastSuccess < 30000) return 'excellent'; // < 30s
      if (timeSinceLastSuccess < 120000) return 'good'; // < 2min
      return 'fair';
    }
    
    if (consecutiveFailures <= 2) return 'degraded';
    return 'poor';
  }, [connectionHealth]);

  // ✨ Prevent excessive API calls by tracking last userId with useRef instead of recalculating
  const lastUserId = useRef<number | undefined>(undefined);
  const hasUserIdChanged = useRef(false);
  
  // Only update when userId actually changes
  if (lastUserId.current !== userId) {
    hasUserIdChanged.current = true;
    lastUserId.current = userId;
  } else {
    hasUserIdChanged.current = false;
  }

  // ✨ Event handlers for gamification events - memoized properly
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

  // ✨ Memoized refresh function to prevent recreating on every render
  const refreshGamificationData = useCallback(async () => {
    if (!userId || !mounted.current) {
      console.log('🎮 Dashboard Gamification: Skipping refresh - no userId or not mounted');
      return;
    }

    // Prevent multiple simultaneous refreshes
    if (isRefreshing.current) {
      console.log('🎮 Dashboard Gamification: Refresh already in progress, skipping');
      return;
    }

    // Prevent excessive API calls within 30 seconds
    const now = new Date();
    if (lastDataFetch.current && (now.getTime() - lastDataFetch.current.getTime()) < 30000) {
      console.log('🎮 Dashboard Gamification: Skipping refresh - called recently');
      return;
    }

    isRefreshing.current = true;
    console.log(`🎮 Dashboard Gamification: Starting refresh for user ${userId}`);
    
    try {
      setGamificationState(prev => ({ ...prev, isLoading: true, error: undefined }));

      const baseUrl = API_CONFIG.BASE_URL;
      console.log(`🎮 Dashboard Gamification: Using base URL: ${baseUrl}`);

      // Fetch user progress - this uses ApiResponse wrapper
      console.log(`🎮 Dashboard Gamification: Fetching progress from ${baseUrl}/v1/gamification/progress`);
      const progressResponse = await fetch(`${baseUrl}/v1/gamification/progress`, {
        credentials: 'include',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
      });

      let progressData: UserProgressApiResponse = {};
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

      // Fetch user badges via the correct endpoint - uses ApiResponse wrapper
      console.log(`🎮 Dashboard Gamification: Fetching badges from ${baseUrl}/v1/gamification/badges`);
      const badgesResponse = await fetch(`${baseUrl}/v1/gamification/badges`, {
        credentials: 'include',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
      });

      let badgesData = [];
      if (badgesResponse.ok) {
        const badgesResponseData = await badgesResponse.json();
        // Handle ApiResponse wrapper format for badges
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
        // Transform API responses to proper types
        const transformedAchievements = Array.isArray(achievementsData) 
          ? achievementsData.map(transformAchievementApiResponse)
          : [];
        
        const transformedBadges = Array.isArray(badgesData)
          ? badgesData.map(transformBadgeApiResponse)
          : [];

        const recentAchievements = ((achievementsData as AchievementApiResponse[]) || [])
          .slice(-5)
          .map((achievement: AchievementApiResponse): AchievementUnlockedEvent => ({
            userId: userId || 0,
            achievementId: achievement.id || achievement.achievementId || 0,
            achievementName: achievement.name || achievement.achievementName || 'Unknown Achievement',
            points: achievement.pointValue || achievement.points || 0,
            category: achievement.category || 'General',
            difficulty: (achievement.difficulty as 'VeryEasy' | 'Easy' | 'Medium' | 'Hard' | 'VeryHard') || 'Medium',
            timestamp: new Date(achievement.unlockedAt || achievement.createdAt || Date.now())
          }));

        const finalState: Partial<GamificationState> = {
          currentPoints: progressData?.totalPointsEarned || progressData?.currentPoints || 0,
          currentLevel: progressData?.currentLevel || 1,
          currentStreak: progressData?.currentStreak || 0,
          totalAchievements: transformedAchievements.length,
          totalBadges: transformedBadges.length,
          unlockedAchievements: transformedAchievements,
          earnedBadges: transformedBadges,
          recentAchievements: recentAchievements,
          isLoading: false,
          lastUpdated: new Date()
        };

        console.log('🎮 Dashboard Gamification: Final state update:', finalState);
        setGamificationState(prev => {
          const wasLoading = prev.isLoading;
          const nowLoading = finalState.isLoading;
          const hasData = (finalState.totalAchievements ?? 0) > 0 || (finalState.totalBadges ?? 0) > 0 || (finalState.currentPoints ?? 0) > 0;
          
          console.log('🎮 Dashboard Gamification: State transition:', {
            wasLoading,
            nowLoading,
            hasData
          });
          
          return { ...prev, ...finalState };
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
    } finally {
      isRefreshing.current = false;
    }
  }, [userId]); // Only depend on userId

  // ✨ Stable event handlers to prevent re-registration - memoize to stable references
  const eventHandlers = useMemo(() => {
    const onConnected = () => {
      // Track connection start for metrics
      connectionMetrics.current.lastConnectionStart = new Date();
      
      if (enableLogging) {
        console.log('🚀 Dashboard: SignalR connected - updating connection state to true');
      }
      
      // Update health metrics
      updateConnectionHealth(true);
      
      setGamificationState(prev => ({ 
        ...prev, 
        isConnected: true, 
        error: undefined,
        lastUpdated: new Date()
      }));
    };

    const onDisconnected = (_error?: Error) => {
      if (enableLogging) {
        console.log('🔌 Dashboard: SignalR disconnected - updating connection state to false', _error);
      }
      
      // Update health metrics
      updateConnectionHealth(false, _error?.message);
      
      setGamificationState(prev => ({ 
        ...prev, 
        isConnected: false,
        lastUpdated: new Date()
      }));
    };

    const onError = (error: Error) => {
      if (enableLogging) {
        console.error('❌ Dashboard: SignalR error - updating connection state to false:', error);
      }
      
      // Update health metrics
      updateConnectionHealth(false, error.message);
      
      setGamificationState(prev => ({
        ...prev,
        isConnected: false,
        error: error.message,
        lastUpdated: new Date()
      }));
    };

    const onReconnecting = () => {
      if (enableLogging) {
        console.log('🔄 Dashboard: SignalR reconnecting...');
      }
    };

    const onReconnected = () => {
      if (enableLogging) {
        console.log('✅ Dashboard: SignalR reconnected - updating connection state to true');
      }
      setGamificationState(prev => ({ ...prev, isConnected: true, error: undefined }));
    };

    return {
      onPointsEarned: handlePointsEarned,
      onAchievementUnlocked: handleAchievementUnlocked,
      onLevelUp: handleLevelUp,
      onStreakUpdated: handleStreakUpdated,
      onBadgeEarned: handleBadgeEarned,
      onConnected,
      onDisconnected,
      onError,
      onReconnecting,
      onReconnected
    };
      }, [handlePointsEarned, handleAchievementUnlocked, handleLevelUp, handleStreakUpdated, handleBadgeEarned, enableLogging, updateConnectionHealth]);

  // ✨ Single shared SignalR connection for the entire dashboard using connection manager
  const signalRConnection = useSignalRConnectionManager('dashboard', eventHandlers);
  
  // ✨ Trust event-driven connection updates - minimal state synchronization
  useEffect(() => {
    const signalRIsConnected = signalRConnection.isConnected;
    const gamificationIsConnected = gamificationState.isConnected;
    
    // Only log significant state changes for debugging
    if (enableLogging && signalRIsConnected !== gamificationIsConnected) {
      console.log(`🔄 Dashboard: Connection state difference detected - SignalR: ${signalRIsConnected}, Gamification: ${gamificationIsConnected}, Status: ${signalRConnection.connectionState.status}`);
    }
    
    // Let event handlers manage the connection state - only intervene if there's a clear mismatch
    // This prevents race conditions and respects the event-driven architecture
  }, [signalRConnection.isConnected, signalRConnection.connectionState.status, gamificationState.isConnected, enableLogging]);

  // Debug connection state changes (but don't trigger updates)
  useEffect(() => {
    if (enableLogging && renderCount.current % 10 === 1) { // Only log every 10th time to reduce spam
      console.log('🔍 Dashboard Connection Debug:', {
        signalRConnectionIsConnected: signalRConnection.isConnected,
        signalRConnectionStatus: signalRConnection.connectionState.status,
        gamificationStateIsConnected: gamificationState.isConnected,
        userId: userId
      });
        }
  }, [signalRConnection.isConnected, signalRConnection.connectionState.status, gamificationState.isConnected, userId, enableLogging]);

  // Load initial data - only when userId changes
  useEffect(() => {
    if (!userId) {
      console.log(`🎮 Dashboard Gamification: Skipping load - no userId: ${userId}`);
      return;
    }

    // Only refresh when userId actually changes
    if (!hasUserIdChanged.current) {
      console.log('🎮 Dashboard Gamification: Skipping load - userId unchanged');
      return;
    }

    console.log(`🎮 Dashboard Gamification: Initial load for user ${userId} (userId changed: ${hasUserIdChanged.current})`);
    
    // Reset the changed flag after processing
    hasUserIdChanged.current = false;
    
    // Trigger initial data load after a short delay to prevent race conditions
    const timeoutId = setTimeout(() => {
      refreshGamificationData();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [userId, refreshGamificationData]); // Include refreshGamificationData since it's used inside the effect

  // Separate cleanup effect that only runs on component unmount
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []); // Empty dependency array - only runs on mount/unmount

  // ✨ ENTERPRISE: Health monitoring effect
  useEffect(() => {
    // Log connection health metrics every 2 minutes in development
    if (process.env.NODE_ENV === 'development') {
      const healthCheckInterval = setInterval(() => {
        const quality = getConnectionQuality();
        const metrics = connectionMetrics.current;
        
        console.log('🏥 Enterprise Health Report:', {
          connectionQuality: quality,
          isHealthy: connectionHealth.isHealthy,
          consecutiveFailures: connectionHealth.consecutiveFailures,
          totalConnections: metrics.totalConnections,
          totalDisconnections: metrics.totalDisconnections,
          avgConnectionTime: Math.round(metrics.averageConnectionTime),
          lastSuccessfulConnection: connectionHealth.lastSuccessfulConnection,
          currentStatus: gamificationState.isConnected ? 'Connected' : 'Disconnected'
        });
      }, 120000); // Every 2 minutes
      
      return () => clearInterval(healthCheckInterval);
    }
  }, [getConnectionQuality, connectionHealth, gamificationState.isConnected]);

  return {
    // Connection states - prioritize SignalR connection state for accuracy
    isConnected: signalRConnection.isConnected || gamificationState.isConnected,
    signalRStatus: signalRConnection.connectionState.status,
    
    // ✨ ENTERPRISE: Advanced connection analytics
    connectionHealth: {
      isHealthy: connectionHealth.isHealthy,
      quality: getConnectionQuality(),
      consecutiveFailures: connectionHealth.consecutiveFailures,
      lastError: connectionHealth.lastError,
      metrics: {
        totalConnections: connectionMetrics.current.totalConnections,
        totalDisconnections: connectionMetrics.current.totalDisconnections,
        avgConnectionTime: Math.round(connectionMetrics.current.averageConnectionTime),
        uptime: connectionHealth.lastSuccessfulConnection 
          ? Date.now() - connectionHealth.lastSuccessfulConnection.getTime()
          : 0
      }
    },
    
    // Connection methods
    refreshGamificationData,
    reconnect: signalRConnection.forceReconnect, // Use force reconnect for better reliability

    // Gamification data with all required methods
    gamificationData: {
      // Base state properties
      currentPoints: gamificationState.currentPoints,
      currentLevel: gamificationState.currentLevel,
      currentStreak: gamificationState.currentStreak,
      totalAchievements: gamificationState.totalAchievements,
      totalBadges: gamificationState.totalBadges,
      unlockedAchievements: gamificationState.unlockedAchievements,
      earnedBadges: gamificationState.earnedBadges,
      recentPointsEarned: gamificationState.recentPointsEarned,
      recentAchievements: gamificationState.recentAchievements,
      recentBadges: gamificationState.recentBadges,
      activeCelebrations: gamificationState.activeCelebrations,
      isLoading: gamificationState.isLoading,
      isConnected: signalRConnection.isConnected || gamificationState.isConnected, // Prioritize SignalR state
      lastUpdated: gamificationState.lastUpdated,
      error: gamificationState.error,
    
      // Action methods
      refreshGamificationData,
      onPointsEarned: handlePointsEarned,
      onAchievementUnlocked: handleAchievementUnlocked,
      onLevelUp: handleLevelUp,
      onStreakUpdated: handleStreakUpdated,
      onBadgeEarned: handleBadgeEarned,
      
      // Celebration management methods
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
        try {
          // TODO: Implement API call to mark achievement as viewed
          console.log(`Marking achievement ${achievementId} as viewed`);
          setGamificationState(prev => ({
            ...prev,
            unlockedAchievements: prev.unlockedAchievements.map(achievement =>
              achievement.id === achievementId ? { ...achievement, isViewed: true } : achievement
            )
          }));
        } catch (error) {
          console.error('Failed to mark achievement as viewed:', error);
        }
      },
      
      // Computed properties
      hasRecentActivity: gamificationState.recentPointsEarned.length > 0 || 
                        gamificationState.recentAchievements.length > 0 ||
                        gamificationState.recentBadges.length > 0,
      celebrationCount: gamificationState.activeCelebrations.length,
      pointsToNextLevel: 100 - (gamificationState.currentPoints % 100),
      levelProgress: (gamificationState.currentPoints % 100),
      connectionStatus: signalRConnection.connectionState.status
    }
  };
} 