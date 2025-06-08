/*
 * Activity API Service
 * Copyright (c) 2025 Carlos Abril Jr
 */

import { FamilyActivityItem, UserProgress, BackendActivityItem, UserProgressApiResponse } from '../types/dashboard';
import { apiClient } from '../config/api-client';

// Custom error class for API errors
export class ActivityApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ActivityApiError';
  }
}

export class ActivityService {
  /**
   * Get recent family activity for dashboard
   */
  async getFamilyActivity(familyId: number, limit: number = 10): Promise<FamilyActivityItem[]> {
    // Return empty array if familyId is invalid
    if (!familyId || familyId === undefined || isNaN(familyId)) {
      return [];
    }

    try {
      const result = await apiClient.get<{ success: boolean; data: BackendActivityItem[] }>(
        `/v1/activity/family/${familyId}/recent?limit=${limit}`
      );
      
      if (result && result.data) {
        // Transform backend FamilyActivityDTO to frontend FamilyActivityItem
        return result.data.map((activity: BackendActivityItem) => {
          const actionType = activity.actionType || activity.type || 'UNKNOWN';
          const actorName = activity.actorDisplayName || activity.actor?.displayName || `User ${activity.actorId}`;
          const timestamp = activity.timestamp || activity.createdAt || new Date().toISOString();
          
          return {
            id: activity.id.toString(),
            type: this.mapBackendActionTypeToFrontend(actionType),
            memberName: actorName,
            description: activity.description || `performed ${actionType}`,
            timestamp: new Date(timestamp),
            points: this.estimatePointsFromActivity(actionType),
            taskTitle: activity.entityType === 'Task' ? activity.description : undefined,
            goalTitle: activity.entityType === 'Goal' ? activity.description : undefined
          };
        });
      }
      
      return [];
    } catch (error) {
      console.error('Failed to fetch family activity:', error);
      
      // Check if it's a 401 unauthorized error (user not member of family)
      if (error instanceof Error && error.message.includes('401')) {
        console.warn('User not authorized to view family activity, likely not a family member');
      }
      
      return [];
    }
  }

  /**
   * Get user's progress and achievements
   */
  async getUserProgress(): Promise<UserProgress> {
    try {
      const result = await apiClient.get<UserProgressApiResponse>('/v1/gamification/progress');
      
      // Transform backend UserProgressDTO to our frontend UserProgress type
      if (result && result.data) {
        const backendProgress = result.data;
        const totalExperience = backendProgress.totalPoints || 0;
        const pointsToNext = backendProgress.pointsToNextLevel || 100;
        
        return {
          currentLevel: backendProgress.currentLevel || 1,
          pointsToNextLevel: pointsToNext,
          experiencePercentage: this.calculateExperiencePercentage(totalExperience, pointsToNext),
          totalExperience: totalExperience,
          achievements: [] // Will be populated when achievements endpoint is connected
        };
      }
      
      // Return default progress for new users
      return {
        currentLevel: 1,
        pointsToNextLevel: 100,
        experiencePercentage: 0,
        totalExperience: 0,
        achievements: []
      };
    } catch (error) {
      console.error('Failed to fetch user progress:', error);
      
      // Return default progress
      return {
        currentLevel: 1,
        pointsToNextLevel: 100,
        experiencePercentage: 0,
        totalExperience: 0,
        achievements: []
      };
    }
  }

  /**
   * Calculate experience percentage for the progress bar
   */
  private calculateExperiencePercentage(totalPoints: number, pointsToNext: number): number {
    if (pointsToNext <= 0) return 100;
    const currentLevelPoints = totalPoints % (pointsToNext + totalPoints);
    return Math.min(100, Math.round((currentLevelPoints / pointsToNext) * 100));
  }

  /**
   * Get user's recent activity
   */
  async getUserActivity(limit: number = 10): Promise<FamilyActivityItem[]> {
    try {
      const result = await apiClient.get<{ success: boolean; data: BackendActivityItem[] }>(
        `/v1/activity/recent?limit=${limit}`
      );
      
      if (result && result.data) {
        // Transform backend user activity to frontend FamilyActivityItem
        return result.data.map((activity: BackendActivityItem) => {
          const actionType = activity.actionType || activity.type || 'UNKNOWN';
          const actorName = activity.actorDisplayName || activity.user?.displayName || 'You';
          const timestamp = activity.timestamp || activity.createdAt || new Date().toISOString();
          
          return {
            id: activity.id.toString(),
            type: this.mapBackendActionTypeToFrontend(actionType),
            memberName: actorName,
            description: activity.description || `performed ${actionType}`,
            timestamp: new Date(timestamp),
            points: this.estimatePointsFromActivity(actionType)
          };
        });
      }
      
      return [];
    } catch (error) {
      console.error('Failed to fetch user activity:', error);
      return [];
    }
  }

  /**
   * Map backend action types to frontend activity types
   */
  private mapBackendActionTypeToFrontend(actionType: string): 'task_completed' | 'goal_achieved' | 'member_joined' | 'points_earned' | 'family_created' | 'invitation_sent' {
    switch (actionType.toLowerCase()) {
      case 'task_completed':
      case 'completed_task':
      case 'taskcompletion':
        return 'task_completed';
      case 'goal_achieved':
      case 'achieved_goal':
      case 'goalcompletion':
        return 'goal_achieved';
      case 'member_joined':
      case 'joined_family':
      case 'familymemberadded':
        return 'member_joined';
      case 'points_earned':
      case 'earned_points':
      case 'pointsearned':
        return 'points_earned';
      case 'family_created':
      case 'created_family':
      case 'familycreated':
        return 'family_created';
      case 'invitation_sent':
      case 'sent_invitation':
      case 'invitationsent':
        return 'invitation_sent';
      default:
        return 'points_earned'; // Default fallback
    }
  }

  /**
   * Estimate points from activity type
   */
  private estimatePointsFromActivity(actionType: string): number {
    switch (actionType.toLowerCase()) {
      case 'task_completed':
      case 'completed_task':
      case 'taskcompletion':
        return 10;
      case 'goal_achieved':
      case 'achieved_goal':
      case 'goalcompletion':
        return 50;
      case 'member_joined':
      case 'joined_family':
      case 'familymemberadded':
        return 25;
      case 'family_created':
      case 'created_family':
      case 'familycreated':
        return 100;
      case 'invitation_sent':
      case 'sent_invitation':
      case 'invitationsent':
        return 5;
      default:
        return 0;
    }
  }
}

// Export singleton instance
export const activityService = new ActivityService(); 