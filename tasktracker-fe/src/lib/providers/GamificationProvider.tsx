'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { gamificationService } from '../services/gamificationService';
import type {
  UserProgress,
  UserAchievement,
  UserBadge,
  LeaderboardEntry,
  GamificationStats,
  GamificationSuggestion,
  DailyLoginStatus,
  FamilyAchievement,
  FamilyLeaderboard
} from '../types/gamification';

interface GamificationContextType {
  // State
  userProgress: UserProgress | null;
  achievements: UserAchievement[];
  badges: UserBadge[];
  leaderboard: LeaderboardEntry[];
  stats: GamificationStats | null;
  suggestions: GamificationSuggestion[];
  dailyLoginStatus: DailyLoginStatus | null;
  familyAchievements: FamilyAchievement[];
  familyLeaderboard: FamilyLeaderboard[];
  
  // Loading states
  isLoading: boolean;
  isLoadingProgress: boolean;
  isLoadingAchievements: boolean;
  isLoadingBadges: boolean;
  isLoadingLeaderboard: boolean;
  isLoadingStats: boolean;
  
  // Error state
  error: string | null;
  
  // Actions
  refreshUserProgress: () => Promise<void>;
  refreshAchievements: () => Promise<void>;
  refreshBadges: () => Promise<void>;
  refreshLeaderboard: (category?: string, limit?: number) => Promise<void>;
  refreshStats: () => Promise<void>;
  refreshSuggestions: () => Promise<void>;
  refreshDailyLoginStatus: () => Promise<void>;
  refreshFamilyAchievements: (familyId: number) => Promise<void>;
  refreshFamilyLeaderboard: () => Promise<void>;
  
  // Utility functions
  formatPoints: (points: number) => string;
  getProgressPercentage: (current: number, max: number) => number;
  claimDailyReward: () => Promise<void>;
  toggleBadgeDisplay: (badgeId: number, isDisplayed: boolean) => Promise<void>;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export function GamificationProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  
  // State
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [stats, setStats] = useState<GamificationStats | null>(null);
  const [suggestions, setSuggestions] = useState<GamificationSuggestion[]>([]);
  const [dailyLoginStatus, setDailyLoginStatus] = useState<DailyLoginStatus | null>(null);
  const [familyAchievements, setFamilyAchievements] = useState<FamilyAchievement[]>([]);
  const [familyLeaderboard, setFamilyLeaderboard] = useState<FamilyLeaderboard[]>([]);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);
  const [isLoadingAchievements, setIsLoadingAchievements] = useState(false);
  const [isLoadingBadges, setIsLoadingBadges] = useState(false);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  
  // Error state
  const [error, setError] = useState<string | null>(null);

  // Refresh functions
  const refreshUserProgress = async () => {
    if (!isAuthenticated) return;
    
    setIsLoadingProgress(true);
    setError(null);
    try {
      const progress = await gamificationService.getUserProgress();
      setUserProgress(progress);
    } catch (err) {
      console.error('Failed to fetch user progress:', err);
      setError('Failed to fetch user progress');
    } finally {
      setIsLoadingProgress(false);
    }
  };

  const refreshAchievements = async () => {
    if (!isAuthenticated) return;
    
    setIsLoadingAchievements(true);
    setError(null);
    try {
      const userAchievements = await gamificationService.getUserAchievements();
      setAchievements(userAchievements);
    } catch (err) {
      console.error('Failed to fetch achievements:', err);
      setError('Failed to fetch achievements');
    } finally {
      setIsLoadingAchievements(false);
    }
  };

  const refreshBadges = async () => {
    if (!isAuthenticated) return;
    
    setIsLoadingBadges(true);
    setError(null);
    try {
      const userBadges = await gamificationService.getUserBadges();
      setBadges(userBadges);
    } catch (err) {
      console.error('Failed to fetch badges:', err);
      setError('Failed to fetch badges');
    } finally {
      setIsLoadingBadges(false);
    }
  };

  const refreshLeaderboard = async (category: string = 'all', limit: number = 10) => {
    if (!isAuthenticated) return;
    
    setIsLoadingLeaderboard(true);
    setError(null);
    try {
      const leaderboardData = await gamificationService.getLeaderboard(category, limit);
      setLeaderboard(leaderboardData);
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
      setError('Failed to fetch leaderboard');
    } finally {
      setIsLoadingLeaderboard(false);
    }
  };

  const refreshStats = async () => {
    if (!isAuthenticated) return;
    
    setIsLoadingStats(true);
    setError(null);
    try {
      const statsData = await gamificationService.getGamificationStats();
      setStats(statsData);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      setError('Failed to fetch stats');
    } finally {
      setIsLoadingStats(false);
    }
  };

  const refreshSuggestions = async () => {
    if (!isAuthenticated) return;
    
    setError(null);
    try {
      const suggestionsData = await gamificationService.getSuggestions();
      setSuggestions(suggestionsData);
    } catch (err) {
      console.error('Failed to fetch suggestions:', err);
      setError('Failed to fetch suggestions');
    }
  };

  const refreshDailyLoginStatus = async () => {
    if (!isAuthenticated) return;
    
    setError(null);
    try {
      const status = await gamificationService.getDailyLoginStatus();
      setDailyLoginStatus(status);
    } catch (err) {
      console.error('Failed to fetch daily login status:', err);
      setError('Failed to fetch daily login status');
    }
  };

  const refreshFamilyAchievements = async (familyId: number) => {
    if (!isAuthenticated) return;
    
    setError(null);
    try {
      const familyAchievementsData = await gamificationService.getFamilyAchievements(familyId);
      setFamilyAchievements(familyAchievementsData);
    } catch (err) {
      console.error('Failed to fetch family achievements:', err);
      setError('Failed to fetch family achievements');
    }
  };

  const refreshFamilyLeaderboard = async () => {
    if (!isAuthenticated) return;
    
    setError(null);
    try {
      const familyLeaderboardData = await gamificationService.getFamilyLeaderboard();
      setFamilyLeaderboard(familyLeaderboardData);
    } catch (err) {
      console.error('Failed to fetch family leaderboard:', err);
      setError('Failed to fetch family leaderboard');
    }
  };

  // Action functions
  const claimDailyReward = async () => {
    if (!isAuthenticated) return;
    
    setError(null);
    try {
      await gamificationService.claimDailyLoginReward();
      await refreshUserProgress();
      await refreshDailyLoginStatus();
    } catch (err) {
      console.error('Failed to claim daily reward:', err);
      setError('Failed to claim daily reward');
    }
  };

  const toggleBadgeDisplay = async (badgeId: number, isDisplayed: boolean) => {
    if (!isAuthenticated) return;
    
    setError(null);
    try {
      await gamificationService.toggleBadgeDisplay({ badgeId, isDisplayed });
      await refreshBadges();
    } catch (err) {
      console.error('Failed to toggle badge display:', err);
      setError('Failed to toggle badge display');
    }
  };

  // Utility functions
  const formatPoints = (points: number): string => {
    if (points >= 1000000) {
      return `${(points / 1000000).toFixed(1)}M`;
    } else if (points >= 1000) {
      return `${(points / 1000).toFixed(1)}K`;
    }
    return points.toString();
  };

  const getProgressPercentage = (current: number, max: number): number => {
    if (max === 0) return 0;
    return Math.min((current / max) * 100, 100);
  };

  // Reset data when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      setUserProgress(null);
      setAchievements([]);
      setBadges([]);
      setLeaderboard([]);
      setStats(null);
      setSuggestions([]);
      setDailyLoginStatus(null);
      setFamilyAchievements([]);
      setFamilyLeaderboard([]);
      setError(null);
    }
  }, [isAuthenticated]);

  // Load data when user logs in
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          refreshUserProgress(),
          refreshAchievements(),
          refreshBadges(),
          refreshLeaderboard(),
          refreshStats(),
          refreshSuggestions(),
          refreshDailyLoginStatus()
        ]);
      } catch (err) {
        console.error('Failed to load initial gamification data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [isAuthenticated, user]);

  const contextValue: GamificationContextType = {
    // State
    userProgress,
    achievements,
    badges,
    leaderboard,
    stats,
    suggestions,
    dailyLoginStatus,
    familyAchievements,
    familyLeaderboard,
    
    // Loading states
    isLoading,
    isLoadingProgress,
    isLoadingAchievements,
    isLoadingBadges,
    isLoadingLeaderboard,
    isLoadingStats,
    
    // Error state
    error,
    
    // Actions
    refreshUserProgress,
    refreshAchievements,
    refreshBadges,
    refreshLeaderboard,
    refreshStats,
    refreshSuggestions,
    refreshDailyLoginStatus,
    refreshFamilyAchievements,
    refreshFamilyLeaderboard,
    
    // Utility functions
    formatPoints,
    getProgressPercentage,
    claimDailyReward,
    toggleBadgeDisplay
  };

  return (
    <GamificationContext.Provider value={contextValue}>
      {children}
    </GamificationContext.Provider>
  );
}

export function useGamification() {
  const context = useContext(GamificationContext);
  if (context === undefined) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
} 