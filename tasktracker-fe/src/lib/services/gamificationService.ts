import { apiClient } from './apiClient';
import type {
  UserProgress,
  UserAchievement,
  Achievement,
  UserBadge,
  Reward,
  UserReward,
  Challenge,
  UserChallenge,
  PointTransaction,
  LeaderboardEntry,
  GamificationStats,
  GamificationSuggestion,
  DailyLoginStatus,
  FamilyAchievement,
  FamilyLeaderboard,
  AddPointsDTO,
  BadgeToggleDTO,
  UseRewardDTO,
  CharacterProgress,
  FocusCompletionReward,
  TierProgress,
  Badge,
  UserActiveChallenge
} from '../types/gamification';
import { ApiResponse } from '../types/api';

class GamificationService {
  private baseUrl = '/v1/gamification';
  private familyBaseUrl = '/v1/familyachievements';

  private handleAuthError(error: any): never {
    if (error?.status === 401) {
      const message = 'Please log in to access gamification features';
      console.error('Gamification Auth Error:', message);
      throw new Error(message);
    }
    throw error;
  }

  private async handleResponse<T>(
    responsePromise: Promise<ApiResponse<T>>, 
    errorMessage: string = 'Request failed'
  ): Promise<T> {
    try {
      const response = await responsePromise;
      
      if (response.error) {
        if (response.status === 401) {
          throw new Error('Authentication required. Please log in.');
        }
        throw new Error(response.error);
      }
      
      if (!response.data) {
        throw new Error(errorMessage);
      }
      
      return response.data;
    } catch (error: any) {
      this.handleAuthError(error);
    }
  }

  // User Progress
  async getUserProgress(): Promise<UserProgress> {
    return this.handleResponse(
      apiClient.get<UserProgress>(`${this.baseUrl}/progress`),
      'Failed to fetch user progress'
    );
  }

  async addPoints(dto: AddPointsDTO): Promise<PointTransaction> {
    return this.handleResponse(
      apiClient.post<PointTransaction>(`${this.baseUrl}/points`, dto),
      'Failed to add points'
    );
  }

  // Achievements
  async getUserAchievements(): Promise<UserAchievement[]> {
    const response = await apiClient.get<UserAchievement[]>(`${this.baseUrl}/achievements`);
    return response.data || [];
  }

  async getAvailableAchievements(): Promise<Achievement[]> {
    const response = await apiClient.get<Achievement[]>(`${this.baseUrl}/achievements/available`);
    return response.data || [];
  }

  // Badges
  async getUserBadges(): Promise<UserBadge[]> {
    const response = await apiClient.get<UserBadge[]>(`${this.baseUrl}/badges`);
    return response.data || [];
  }

  async toggleBadgeDisplay(dto: BadgeToggleDTO): Promise<boolean> {
    const response = await apiClient.post<boolean>(`${this.baseUrl}/badges/toggle`, dto);
    return response.data ?? false;
  }

  // Rewards
  async getAvailableRewards(): Promise<Reward[]> {
    return this.handleResponse(
      apiClient.get<Reward[]>(`${this.baseUrl}/rewards`),
      'Failed to fetch available rewards'
    );
  }

  async claimReward(rewardId: number): Promise<Reward> {
    return this.handleResponse(
      apiClient.post<Reward>(`${this.baseUrl}/rewards/claim/${rewardId}`),
      'Failed to redeem reward'
    );
    }

  async redeemReward(rewardId: number): Promise<Reward> {
    return this.handleResponse(
      apiClient.post<Reward>(`${this.baseUrl}/rewards/claim/${rewardId}`),
      'Failed to redeem reward'
    );
  }

  async useReward(dto: UseRewardDTO): Promise<boolean> {
    const response = await apiClient.post<boolean>(`${this.baseUrl}/rewards/use`, dto);
    if (response.error) {
      if (response.status === 401) {
        throw new Error('Authentication required. Please log in.');
      }
      throw new Error(response.error);
    }
    return response.data ?? false;
  }

  // Challenges
  async getActiveChallenges(): Promise<Challenge[]> {
    return this.handleResponse(
      apiClient.get<Challenge[]>(`${this.baseUrl}/challenges`),
      'Failed to fetch active challenges'
    );
  }

  async getUserActiveChallenges(): Promise<UserActiveChallenge[]> {
    console.log('API: Calling getUserActiveChallenges');
    return this.handleResponse(
      apiClient.get<UserActiveChallenge[]>(`${this.baseUrl}/challenges/active`),
      'Failed to fetch user active challenges'
    );
  }

  async enrollInChallenge(challengeId: number): Promise<UserChallenge> {
    return this.handleResponse(
      apiClient.post<UserChallenge>(`${this.baseUrl}/challenges/${challengeId}/enroll`),
      'Failed to join challenge'
    );
  }

  async leaveChallenge(challengeId: number): Promise<boolean> {
    const response = await apiClient.post<boolean>(`${this.baseUrl}/challenges/${challengeId}/leave`);
    if (response.error) {
      if (response.status === 401) {
        throw new Error('Authentication required. Please log in.');
      }
      throw new Error(response.error);
    }
    return response.data ?? false;
  }

  async getCurrentChallenge(): Promise<Challenge> {
    const response = await apiClient.get<Challenge>(`${this.baseUrl}/challenges/current`);
    if (!response.data) {
      throw new Error('No current challenge found');
    }
    return response.data;
  }

  // Daily Login
  async getDailyLoginStatus(): Promise<DailyLoginStatus> {
    const response = await apiClient.get<DailyLoginStatus>(`${this.baseUrl}/login/status`);
    if (!response.data) {
      throw new Error('Failed to fetch daily login status');
    }
    return response.data;
  }

  async claimDailyLoginReward(): Promise<PointTransaction> {
    const response = await apiClient.post<PointTransaction>(`${this.baseUrl}/login/claim`);
    
    // Check for API error response
    if (response.error) {
      throw new Error(response.error);
    }
    
    if (!response.data) {
      throw new Error('Failed to claim daily login reward');
    }
    return response.data;
  }

  // Statistics
  async getGamificationStats(): Promise<GamificationStats> {
    const response = await apiClient.get<GamificationStats>(`${this.baseUrl}/stats`);
    if (!response.data) {
      throw new Error('Failed to fetch gamification stats');
    }
    return response.data;
  }

  async getSuggestions(): Promise<GamificationSuggestion[]> {
    const response = await apiClient.get<GamificationSuggestion[]>(`${this.baseUrl}/suggestions`);
    return response.data || [];
  }

  // Leaderboard
  async getLeaderboard(timeFrame: string = 'all', limit: number = 10): Promise<LeaderboardEntry[]> {
    const response = await apiClient.get<LeaderboardEntry[]>(
      `${this.baseUrl}/leaderboard?timeFrame=${timeFrame}&limit=${limit}`
    );
    return response.data || [];
  }

  // Global leaderboard (all users) - new method for getting truly global data
  async getGlobalLeaderboard(category: string = 'points', limit: number = 10): Promise<LeaderboardEntry[]> {
    const response = await apiClient.get<LeaderboardEntry[]>(
      `${this.baseUrl}/leaderboard/global?category=${category}&limit=${limit}`
    );
    return response.data || [];
  }

  // Family members leaderboard (specific method for family members only)
  async getFamilyMembersLeaderboard(category: string = 'points', limit: number = 10): Promise<LeaderboardEntry[]> {
    const response = await apiClient.get<LeaderboardEntry[]>(
      `${this.baseUrl}/leaderboard?timeFrame=${category}&limit=${limit}`
    );
    return response.data || [];
  }

  // Get leaderboard for a specific family only
  async getSpecificFamilyLeaderboard(familyId: number, category: string = 'points', limit: number = 10): Promise<LeaderboardEntry[]> {
    const response = await apiClient.get<LeaderboardEntry[]>(
      `${this.baseUrl}/leaderboard/family/${familyId}?category=${category}&limit=${limit}`
    );
    return response.data || [];
  }

  // Get list of families the user belongs to
  async getUserFamilies(): Promise<any[]> {
    const response = await apiClient.get<any[]>('/v1/family');
    return response.data || [];
  }

  // Family Achievements
  async getFamilyAchievements(familyId: number): Promise<FamilyAchievement[]> {
    const response = await apiClient.get<FamilyAchievement[]>(`${this.familyBaseUrl}/family/${familyId}`);
    return response.data || [];
  }

  async getCompletedFamilyAchievements(familyId: number): Promise<FamilyAchievement[]> {
    const response = await apiClient.get<FamilyAchievement[]>(`${this.familyBaseUrl}/family/${familyId}/completed`);
    return response.data || [];
  }

  async getInProgressFamilyAchievements(familyId: number): Promise<FamilyAchievement[]> {
    const response = await apiClient.get<FamilyAchievement[]>(`${this.familyBaseUrl}/family/${familyId}/in-progress`);
    return response.data || [];
  }

  async getFamilyLeaderboard(limit: number = 10): Promise<FamilyLeaderboard[]> {
    const response = await apiClient.get<FamilyLeaderboard[]>(`${this.familyBaseUrl}/leaderboard?limit=${limit}`);
    return response.data || [];
  }

  async getFamilyStats(familyId: number): Promise<FamilyLeaderboard> {
    const response = await apiClient.get<FamilyLeaderboard>(`${this.familyBaseUrl}/family/${familyId}/stats`);
    if (!response.data) {
      throw new Error('Failed to fetch family stats');
    }
    return response.data;
  }

  // Task completion tracking for achievements
  async trackTaskCompletion(taskId: number): Promise<void> {
    await apiClient.post(`${this.familyBaseUrl}/task/${taskId}/complete`, { taskId });
  }

  // Character System
  async getCharacterProgress(): Promise<CharacterProgress> {
    const response = await apiClient.get<CharacterProgress>('/Gamification/character');
    if (!response.data) {
      throw new Error('Failed to get character progress');
    }
    return response.data;
  }

  async switchCharacterClass(characterClass: string): Promise<boolean> {
    const response = await apiClient.post<boolean>('/Gamification/character/switch', {
      characterClass
    });
    return response.data ?? false;
  }

  async unlockCharacterClass(characterClass: string): Promise<boolean> {
    const response = await apiClient.post<boolean>('/Gamification/character/unlock', {
      characterClass
    });
    return response.data ?? false;
  }

  // Focus Mode Integration
  async completeFocusSession(sessionId: number, durationMinutes: number, wasCompleted: boolean = true): Promise<FocusCompletionReward> {
    const response = await apiClient.post<FocusCompletionReward>('/Gamification/focus/complete', {
      sessionId,
      durationMinutes,
      wasCompleted
    });
    if (!response.data) {
      throw new Error('Failed to process focus session completion');
    }
    return response.data;
  }

  // Tier System
  async getTierProgress(): Promise<TierProgress> {
    const response = await apiClient.get<TierProgress>('/Gamification/tier/progress');
    if (!response.data) {
      throw new Error('Failed to get tier progress');
    }
    return response.data;
  }

  // Badge System - Enhanced
  async getBadgesByTier(tier: string): Promise<Badge[]> {
    const response = await apiClient.get<Badge[]>(`/Badges/tier/${tier}`);
    return response.data ?? [];
  }

  async getBadgesByRarity(rarity: string): Promise<Badge[]> {
    const response = await apiClient.get<Badge[]>(`/Badges/rarity/${rarity}`);
    return response.data ?? [];
  }
}

export const gamificationService = new GamificationService(); 