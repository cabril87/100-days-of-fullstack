/*
 * Activity API Service
 * Copyright (c) 2025 Carlos Abril Jr
 */

import { FamilyActivityItem, UserProgress } from '../types/dashboard';
import { ApiResponse, BackendUserProgressResponse } from '../types/task';

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const API_VERSION = 'v1';

// Helper function to get auth headers
const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

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

// Helper function to handle API responses
async function handleApiResponse<T>(response: Response, allowNotFound: boolean = false): Promise<T | null> {
  if (!response.ok) {
    if (response.status === 404 && allowNotFound) {
      return null;
    }
    
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new ActivityApiError(
      errorData.message || `HTTP ${response.status}`,
      response.status,
      errorData.code,
      errorData.errors
    );
  }
  
  return response.json();
}

export class ActivityService {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/api/${API_VERSION}`;
  }

  /**
   * Get recent family activity for dashboard
   */
  async getFamilyActivity(familyId: number, limit: number = 10): Promise<FamilyActivityItem[]> {
    const response = await fetch(
      `${this.baseUrl}/activity/family/${familyId}/recent?limit=${limit}`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    const result = await handleApiResponse<FamilyActivityItem[]>(response, true);
    
    // Return mock data for now until backend implements activity tracking
    if (!result) {
      return this.getMockFamilyActivity();
    }

    return result;
  }

  /**
   * Get user's progress and achievements
   */
     async getUserProgress(): Promise<UserProgress> {
     const response = await fetch(
       `${this.baseUrl}/gamification/progress`,
       {
         method: 'GET',
         headers: getAuthHeaders(),
       }
     );

     const result = await handleApiResponse<ApiResponse<BackendUserProgressResponse>>(response, true);
     
     // Transform backend UserProgressDTO to our frontend UserProgress type
     if (result && result.data) {
       const backendProgress = result.data;
       return {
         currentLevel: backendProgress.currentLevel || 1,
         pointsToNextLevel: backendProgress.pointsToNextLevel || 100,
         experiencePercentage: this.calculateExperiencePercentage(
           backendProgress.totalPoints || 0, 
           backendProgress.pointsToNextLevel || 100
         ),
         totalExperience: backendProgress.totalPoints || 0,
         achievements: [] // Will be populated when achievements endpoint is connected
       };
     }
     
     // Return mock data for development
     return this.getMockUserProgress();
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
    const response = await fetch(
      `${this.baseUrl}/activity/recent?limit=${limit}`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    const result = await handleApiResponse<FamilyActivityItem[]>(response, true);
    
    // Return mock data for now until backend implements activity tracking
    if (!result) {
      return this.getMockUserActivity();
    }

    return result;
  }

  /**
   * Mock family activity data for development
   */
  private getMockFamilyActivity(): FamilyActivityItem[] {
    const now = new Date();
    return [
      {
        id: '1',
        type: 'task_completed',
        memberName: 'Sarah Johnson',
        description: 'completed "Clean the kitchen"',
        timestamp: new Date(now.getTime() - 30 * 60 * 1000), // 30 minutes ago
        points: 25,
        taskTitle: 'Clean the kitchen'
      },
      {
        id: '2',
        type: 'member_joined',
        memberName: 'Mike Johnson',
        description: 'joined the family',
        timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
        points: 50
      },
      {
        id: '3',
        type: 'goal_achieved',
        memberName: 'Emma Johnson',
        description: 'achieved "Complete 5 tasks this week"',
        timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000), // 4 hours ago
        points: 100,
        goalTitle: 'Complete 5 tasks this week'
      },
      {
        id: '4',
        type: 'points_earned',
        memberName: 'Dad',
        description: 'earned 15 points from "Take out trash"',
        timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000), // 6 hours ago
        points: 15
      }
    ];
  }

  /**
   * Mock user progress data for development
   */
  private getMockUserProgress(): UserProgress {
    return {
      currentLevel: 5,
      pointsToNextLevel: 150,
      experiencePercentage: 75,
      totalExperience: 850,
      achievements: [
        {
          id: 'first_task',
          title: 'First Steps',
          description: 'Complete your first task',
          pointsRewarded: 25,
          unlockedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
          category: 'productivity'
        },
        {
          id: 'team_player',
          title: 'Team Player',
          description: 'Join a family',
          pointsRewarded: 50,
          unlockedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
          category: 'family'
        }
      ]
    };
  }

  /**
   * Mock user activity data for development
   */
  private getMockUserActivity(): FamilyActivityItem[] {
    const now = new Date();
    return [
      {
        id: '1',
        type: 'task_completed',
        memberName: 'You',
        description: 'completed "Review family budget"',
        timestamp: new Date(now.getTime() - 45 * 60 * 1000), // 45 minutes ago
        points: 30,
        taskTitle: 'Review family budget'
      },
      {
        id: '2',
        type: 'family_created',
        memberName: 'You',
        description: 'created the Johnson Family',
        timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        points: 100
      }
    ];
  }
}

// Export singleton instance
export const activityService = new ActivityService(); 