/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 * 
 * Enterprise Gamification Hook
 * React hook for managing family gamification features
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { enterpriseGamificationService } from '@/lib/services/enterpriseGamificationService';
import {
  FamilyGamificationProfile,
  FamilyMemberGamification,
  FamilyGoal,
  FamilyChallenge,
  FamilyLeaderboard,
  LeaderboardEntry
} from '@/lib/types/enterprise-gamification';

interface UseEnterpriseGamificationOptions {
  userId?: number;
  familyId?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface EnterpriseGamificationState {
  // Profile & Members
  familyProfile: FamilyGamificationProfile | null;
  familyMembers: FamilyMemberGamification[];
  leaderboardMembers: LeaderboardEntry[];
  
  // Goals & Challenges
  goals: FamilyGoal[];
  challenges: FamilyChallenge[];
  
  // Leaderboard
  leaderboard: FamilyLeaderboard | null;
  
  // Loading states
  isLoading: boolean;
  isLoadingGoals: boolean;
  isLoadingMembers: boolean;
  isLoadingLeaderboard: boolean;
  
  // Error states
  error: string | null;
  
  // Connection state
  isConnected: boolean;
}

export function useEnterpriseGamification(options: UseEnterpriseGamificationOptions = {}) {
  const {
    userId,
    familyId,
    autoRefresh = true,
    refreshInterval = 30000 // 30 seconds
  } = options;

  const [state, setState] = useState<EnterpriseGamificationState>({
    familyProfile: null,
    familyMembers: [],
    leaderboardMembers: [],
    goals: [],
    challenges: [],
    leaderboard: null,
    isLoading: false,
    isLoadingGoals: false,
    isLoadingMembers: false,
    isLoadingLeaderboard: false,
    error: null,
    isConnected: false
  });

  const mounted = useRef(true);
  const refreshTimer = useRef<NodeJS.Timeout | null>(null);

  // ================================
  // DATA FETCHING FUNCTIONS
  // ================================

  const fetchFamilyProfile = useCallback(async () => {
    if (!familyId || !mounted.current) return;

    try {
      const profile = await enterpriseGamificationService.getFamilyProfile(familyId);
      if (mounted.current) {
        setState(prev => ({ ...prev, familyProfile: profile }));
      }
    } catch (error) {
      console.error('Failed to fetch family profile:', error);
      if (mounted.current) {
        setState(prev => ({ ...prev, error: 'Failed to load family profile' }));
      }
    }
  }, [familyId]);

  const fetchFamilyMembers = useCallback(async () => {
    if (!familyId || !mounted.current) return;

    setState(prev => ({ ...prev, isLoadingMembers: true }));

    try {
      const members = await enterpriseGamificationService.getFamilyMembers(familyId);
      if (mounted.current) {
        setState(prev => ({ 
          ...prev, 
          familyMembers: members,
          isLoadingMembers: false
        }));
      }
    } catch (error) {
      console.error('Failed to fetch family members:', error);
      if (mounted.current) {
        setState(prev => ({ 
          ...prev, 
          error: 'Failed to load family members',
          isLoadingMembers: false
        }));
      }
    }
  }, [familyId]);

  const fetchLeaderboard = useCallback(async (
    type: 'weekly' | 'monthly' | 'all_time' = 'weekly'
  ) => {
    if (!familyId || !mounted.current) return;

    setState(prev => ({ ...prev, isLoadingLeaderboard: true }));

    try {
      const leaderboard = await enterpriseGamificationService.getFamilyLeaderboard(familyId, type);
      if (mounted.current && leaderboard) {
        // Convert to LeaderboardEntry format
        const leaderboardMembers: LeaderboardEntry[] = leaderboard.members.map(member => ({
          userId: member.userId,
          memberName: member.memberName,
          ageGroup: member.ageGroup,
          score: member.score,
          rank: member.rank,
          previousRank: member.previousRank,
          trend: member.trend,
          badge: member.badge || '🏅',
          avatar: member.avatar
        }));

        setState(prev => ({ 
          ...prev, 
          leaderboard,
          leaderboardMembers,
          isLoadingLeaderboard: false
        }));
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      if (mounted.current) {
        setState(prev => ({ 
          ...prev, 
          error: 'Failed to load leaderboard',
          isLoadingLeaderboard: false
        }));
      }
    }
  }, [familyId]);

  const fetchGoals = useCallback(async (status: 'active' | 'completed' | 'all' = 'active') => {
    if (!familyId || !mounted.current) return;

    setState(prev => ({ ...prev, isLoadingGoals: true }));

    try {
      const goals = await enterpriseGamificationService.getFamilyGoals(familyId, status);
      if (mounted.current) {
        setState(prev => ({ 
          ...prev, 
          goals,
          isLoadingGoals: false
        }));
      }
    } catch (error) {
      console.error('Failed to fetch goals:', error);
      if (mounted.current) {
        setState(prev => ({ 
          ...prev, 
          error: 'Failed to load goals',
          isLoadingGoals: false
        }));
      }
    }
  }, [familyId]);

  const fetchChallenges = useCallback(async (status: 'active' | 'completed' | 'all' = 'active') => {
    if (!familyId || !mounted.current) return;

    try {
      const challenges = await enterpriseGamificationService.getFamilyChallenges(familyId, status);
      if (mounted.current) {
        setState(prev => ({ ...prev, challenges }));
      }
    } catch (error) {
      console.error('Failed to fetch challenges:', error);
      if (mounted.current) {
        setState(prev => ({ ...prev, error: 'Failed to load challenges' }));
      }
    }
  }, [familyId]);

  // ================================
  // COMBINED REFRESH FUNCTION
  // ================================

  const refreshAllData = useCallback(async () => {
    if (!familyId || !mounted.current) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Fetch all data in parallel
      await Promise.all([
        fetchFamilyProfile(),
        fetchFamilyMembers(),
        fetchLeaderboard(),
        fetchGoals(),
        fetchChallenges()
      ]);

      if (mounted.current) {
        setState(prev => ({ ...prev, isLoading: false, isConnected: true }));
      }
    } catch (error) {
      console.error('Failed to refresh enterprise gamification data:', error);
      if (mounted.current) {
        setState(prev => ({ 
          ...prev, 
          isLoading: false,
          isConnected: false,
          error: 'Failed to refresh data'
        }));
      }
    }
  }, [familyId, fetchFamilyProfile, fetchFamilyMembers, fetchLeaderboard, fetchGoals, fetchChallenges]);

  // ================================
  // ACTION FUNCTIONS
  // ================================

  const createGoal = useCallback(async (goalData: Partial<FamilyGoal>) => {
    if (!familyId) return null;

    try {
      const newGoal = await enterpriseGamificationService.createFamilyGoal(familyId, goalData);
      if (newGoal && mounted.current) {
        setState(prev => ({ 
          ...prev, 
          goals: [...prev.goals, newGoal]
        }));
      }
      return newGoal;
    } catch (error) {
      console.error('Failed to create goal:', error);
      return null;
    }
  }, [familyId]);

  const updateGoalProgress = useCallback(async (goalId: string, progress: number) => {
    if (!familyId) return false;

    try {
      const success = await enterpriseGamificationService.updateGoalProgress(familyId, goalId, progress);
      if (success && mounted.current) {
        setState(prev => ({
          ...prev,
          goals: prev.goals.map(goal =>
            goal.id === goalId
              ? { 
                  ...goal, 
                  currentValue: progress,
                  completionPercentage: enterpriseGamificationService.calculateCompletionPercentage(progress, goal.targetValue)
                }
              : goal
          )
        }));
      }
      return success;
    } catch (error) {
      console.error('Failed to update goal progress:', error);
      return false;
    }
  }, [familyId]);

  const joinChallenge = useCallback(async (challengeId: string) => {
    if (!familyId || !userId) return false;

    try {
      const success = await enterpriseGamificationService.joinChallenge(familyId, challengeId, userId);
      if (success) {
        // Refresh challenges to get updated data
        await fetchChallenges();
      }
      return success;
    } catch (error) {
      console.error('Failed to join challenge:', error);
      return false;
    }
  }, [familyId, userId, fetchChallenges]);

  // ================================
  // EFFECTS
  // ================================

  // Initial data load
  useEffect(() => {
    if (familyId) {
      refreshAllData();
    }
  }, [familyId, refreshAllData]);

  // Auto-refresh timer
  useEffect(() => {
    if (!autoRefresh || !familyId) return;

    refreshTimer.current = setInterval(() => {
      refreshAllData();
    }, refreshInterval);

    return () => {
      if (refreshTimer.current) {
        clearInterval(refreshTimer.current);
      }
    };
  }, [autoRefresh, refreshInterval, familyId, refreshAllData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mounted.current = false;
      if (refreshTimer.current) {
        clearInterval(refreshTimer.current);
      }
    };
  }, []);

  // ================================
  // RETURN HOOK INTERFACE
  // ================================

  return {
    // State
    ...state,
    
    // Data fetching
    refreshAllData,
    fetchLeaderboard,
    fetchGoals,
    fetchChallenges,
    
    // Actions
    createGoal,
    updateGoalProgress,
    joinChallenge,
    
    // Utilities
    formatPoints: enterpriseGamificationService.formatPoints,
    calculateTimeRemaining: enterpriseGamificationService.calculateTimeRemaining,
    calculateCompletionPercentage: enterpriseGamificationService.calculateCompletionPercentage
  };
} 