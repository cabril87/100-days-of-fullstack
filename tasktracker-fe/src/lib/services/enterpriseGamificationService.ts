/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 * 
 * Enterprise Gamification Service
 * Service for managing family gamification features with backend integration
 */

import { apiClient } from '@/lib/config/api-client';
import {
  FamilyGamificationProfile,
  FamilyMemberGamification,
  FamilyGoal,
  FamilyChallenge,
  FamilyLeaderboard,
  FamilyRanking,
  PersonalAchievement,
  PersonalBadge,
  GamificationApiResponse
} from '@/lib/types/enterprise-gamification';

export class EnterpriseGamificationService {
  private apiClient = apiClient;

  // ================================
  // FAMILY PROFILE & MEMBERS
  // ================================

  /**
   * Get family gamification profile
   */
  async getFamilyProfile(familyId: number): Promise<FamilyGamificationProfile | null> {
    try {
      const response = await this.apiClient.get<GamificationApiResponse<FamilyGamificationProfile>>(
        `/v1/families/${familyId}/gamification/profile`
      );
      return response.data || null;
    } catch (error) {
      console.error('Failed to fetch family gamification profile:', error);
      return null;
    }
  }

  /**
   * Get family members with gamification data
   */
  async getFamilyMembers(familyId: number): Promise<FamilyMemberGamification[]> {
    try {
      const response = await this.apiClient.get<GamificationApiResponse<FamilyMemberGamification[]>>(
        `/v1/families/${familyId}/gamification/members`
      );
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch family members gamification data:', error);
      return [];
    }
  }

  /**
   * Get member gamification data
   */
  async getMemberGamification(userId: number, familyId: number): Promise<FamilyMemberGamification | null> {
    try {
      const response = await this.apiClient.get<GamificationApiResponse<FamilyMemberGamification>>(
        `/v1/families/${familyId}/members/${userId}/gamification`
      );
      return response.data || null;
    } catch (error) {
      console.error('Failed to fetch member gamification data:', error);
      return null;
    }
  }

  // ================================
  // GOALS & CHALLENGES
  // ================================

  /**
   * Get family goals
   */
  async getFamilyGoals(familyId: number, status?: 'active' | 'completed' | 'paused'): Promise<FamilyGoal[]> {
    try {
      const endpoint = status 
        ? `/v1/families/${familyId}/gamification/goals?status=${status}`
        : `/v1/families/${familyId}/gamification/goals`;
      const response = await this.apiClient.get<GamificationApiResponse<FamilyGoal[]>>(endpoint);
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch family goals:', error);
      return [];
    }
  }

  /**
   * Get family challenges
   */
  async getFamilyChallenges(familyId: number, status?: 'active' | 'upcoming' | 'completed'): Promise<FamilyChallenge[]> {
    try {
      const endpoint = status 
        ? `/v1/families/${familyId}/gamification/challenges?status=${status}`
        : `/v1/families/${familyId}/gamification/challenges`;
      const response = await this.apiClient.get<GamificationApiResponse<FamilyChallenge[]>>(endpoint);
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch family challenges:', error);
      return [];
    }
  }

  /**
   * Create a new family goal
   */
  async createFamilyGoal(familyId: number, goalData: Partial<FamilyGoal>): Promise<FamilyGoal | null> {
    try {
      const response = await this.apiClient.post<GamificationApiResponse<FamilyGoal>>(
        `/v1/families/${familyId}/gamification/goals`,
        goalData
      );
      return response.data || null;
    } catch (error) {
      console.error('Failed to create family goal:', error);
      return null;
    }
  }

  /**
   * Update goal progress
   */
  async updateGoalProgress(familyId: number, goalId: string, progress: number): Promise<boolean> {
    try {
      await this.apiClient.put(
        `/v1/families/${familyId}/gamification/goals/${goalId}/progress`,
        { progress }
      );
      return true;
    } catch (error) {
      console.error('Failed to update goal progress:', error);
      return false;
    }
  }

  /**
   * Join a family challenge
   */
  async joinChallenge(familyId: number, challengeId: string, userId: number): Promise<boolean> {
    try {
      await this.apiClient.post(
        `/v1/families/${familyId}/gamification/challenges/${challengeId}/join`,
        { userId }
      );
      return true;
    } catch (error) {
      console.error('Failed to join challenge:', error);
      return false;
    }
  }

  // ================================
  // LEADERBOARDS & RANKINGS
  // ================================

  /**
   * Get family leaderboard
   */
  async getFamilyLeaderboard(
    familyId: number, 
    type: 'weekly' | 'monthly' | 'all_time' = 'weekly',
    category: 'points' | 'tasks' | 'streak' | 'achievements' = 'points'
  ): Promise<FamilyLeaderboard | null> {
    try {
      const endpoint = `/v1/families/${familyId}/gamification/leaderboard?type=${type}&category=${category}`;
      const response = await this.apiClient.get<GamificationApiResponse<FamilyLeaderboard>>(endpoint);
      return response.data || null;
    } catch (error) {
      console.error('Failed to fetch family leaderboard:', error);
      return null;
    }
  }

  /**
   * Get family ranking
   */
  async getFamilyRanking(familyId: number): Promise<FamilyRanking | null> {
    try {
      const response = await this.apiClient.get<GamificationApiResponse<FamilyRanking>>(
        `/v1/families/${familyId}/gamification/ranking`
      );
      return response.data || null;
    } catch (error) {
      console.error('Failed to fetch family ranking:', error);
      return null;
    }
  }

  // ================================
  // ACHIEVEMENTS & BADGES
  // ================================

  /**
   * Get personal achievements for a user
   */
  async getPersonalAchievements(userId: number, familyId: number): Promise<PersonalAchievement[]> {
    try {
      const response = await this.apiClient.get<GamificationApiResponse<PersonalAchievement[]>>(
        `/v1/families/${familyId}/members/${userId}/achievements`
      );
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch personal achievements:', error);
      return [];
    }
  }

  /**
   * Get personal badges for a user
   */
  async getPersonalBadges(userId: number, familyId: number): Promise<PersonalBadge[]> {
    try {
      const response = await this.apiClient.get<GamificationApiResponse<PersonalBadge[]>>(
        `/v1/families/${familyId}/members/${userId}/badges`
      );
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch personal badges:', error);
      return [];
    }
  }

  // ================================
  // PREFERENCES & SETTINGS
  // ================================

  /**
   * Update member gamification preferences
   */
  async updateMemberPreferences(
    userId: number, 
    familyId: number, 
    preferences: Record<string, unknown>
  ): Promise<boolean> {
    try {
      await this.apiClient.put(
        `/v1/families/${familyId}/members/${userId}/gamification/preferences`,
        preferences
      );
      return true;
    } catch (error) {
      console.error('Failed to update member preferences:', error);
      return false;
    }
  }

  /**
   * Update family gamification settings
   */
  async updateFamilySettings(
    familyId: number, 
    settings: Record<string, unknown>
  ): Promise<boolean> {
    try {
      await this.apiClient.put(
        `/v1/families/${familyId}/gamification/settings`,
        settings
      );
      return true;
    } catch (error) {
      console.error('Failed to update family settings:', error);
      return false;
    }
  }

  // ================================
  // UTILITY METHODS
  // ================================

  /**
   * Calculate time remaining for a goal or challenge
   */
  calculateTimeRemaining(endDate: Date): string {
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days} day${days !== 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    } else {
      return 'Less than 1 hour';
    }
  }

  /**
   * Calculate completion percentage
   */
  calculateCompletionPercentage(current: number, target: number): number {
    if (target <= 0) return 0;
    return Math.min(Math.round((current / target) * 100), 100);
  }

  /**
   * Format points with appropriate suffixes
   */
  formatPoints(points: number): string {
    if (points >= 1000000) {
      return `${(points / 1000000).toFixed(1)}M`;
    } else if (points >= 1000) {
      return `${(points / 1000).toFixed(1)}K`;
    }
    return points.toString();
  }
}

// Export singleton instance
export const enterpriseGamificationService = new EnterpriseGamificationService(); 