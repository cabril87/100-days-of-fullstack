/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 */

import {
  UserAnalyticsDashboardDTO,
  FamilyAnalyticsDashboardDTO,
  AdminAnalyticsDashboardDTO,
  SystemHealthAnalyticsDTO,
  UserEngagementAnalyticsDTO,
  PersonalizedRecommendationsDTO,
  MLInsightsDTO,
  AnalyticsExportRequestDTO,
  AnalyticsExportDTO,
  UserProductivityInsightsDTO,
  UserBoardAnalyticsDTO,
  FamilyCollaborationAnalyticsDTO,
  PlatformUsageAnalyticsDTO,
  BackgroundServiceAnalyticsDTO,
  MarketplaceAnalyticsDTO,
  BehavioralAnalysisDTO,
  PredictiveAnalyticsDTO,
  FamilyProductivityInsightsDTO,
  DataVisualizationDTO
} from '@/lib/types/analytics';
import { FocusSessionAnalytics } from '@/lib/types/focus';

// ============================================================================
// ANALYTICS SERVICE ERROR CLASS
// ============================================================================

export class AnalyticsServiceError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'AnalyticsServiceError';
  }
}

// ============================================================================
// ANALYTICS SERVICE CLASS
// ============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export class AnalyticsService {
  private static instance: AnalyticsService;
  
  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  private async fetchWithAuth<T>(url: string, options?: RequestInit): Promise<T> {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(url, {
        ...options,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new AnalyticsServiceError(
          `Analytics API error: ${response.status} - ${errorText}`,
          response.status
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof AnalyticsServiceError) {
        throw error;
      }
      throw new AnalyticsServiceError(
        `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private buildQueryParams(params: Record<string, unknown>): string {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
    return searchParams.toString();
  }

  // ============================================================================
  // USER ANALYTICS METHODS
  // ============================================================================

  async getUserDashboard(
    startDate?: Date,
    endDate?: Date
  ): Promise<UserAnalyticsDashboardDTO> {
    const params = this.buildQueryParams({
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
    });
    
    const url = `${API_BASE_URL}/v1/UnifiedAnalytics/user/dashboard${params ? `?${params}` : ''}`;
    return this.fetchWithAuth<UserAnalyticsDashboardDTO>(url);
  }

  async getUserProductivityInsights(): Promise<UserProductivityInsightsDTO> {
    const url = `${API_BASE_URL}/v1/UnifiedAnalytics/user/productivity-insights`;
    return this.fetchWithAuth<UserProductivityInsightsDTO>(url);
  }

  async getUserBoardAnalytics(boardId?: number): Promise<UserBoardAnalyticsDTO> {
    const params = this.buildQueryParams({ boardId });
    const url = `${API_BASE_URL}/v1/UnifiedAnalytics/user/board-analytics${params ? `?${params}` : ''}`;
    return this.fetchWithAuth<UserBoardAnalyticsDTO>(url);
  }

  async getPersonalizedRecommendations(): Promise<PersonalizedRecommendationsDTO> {
    const url = `${API_BASE_URL}/v1/UnifiedAnalytics/user/recommendations`;
    return this.fetchWithAuth<PersonalizedRecommendationsDTO>(url);
  }

  // ============================================================================
  // FAMILY ANALYTICS METHODS
  // ============================================================================

  async getFamilyDashboard(
    familyId: number,
    startDate?: Date,
    endDate?: Date
  ): Promise<FamilyAnalyticsDashboardDTO> {
    const params = this.buildQueryParams({
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
    });
    
    const url = `${API_BASE_URL}/v1/UnifiedAnalytics/family/${familyId}/dashboard${params ? `?${params}` : ''}`;
    return this.fetchWithAuth<FamilyAnalyticsDashboardDTO>(url);
  }

  async getFamilyProductivityInsights(familyId: number): Promise<FamilyProductivityInsightsDTO> {
    const url = `${API_BASE_URL}/v1/UnifiedAnalytics/family/${familyId}/productivity-insights`;
    return this.fetchWithAuth<FamilyProductivityInsightsDTO>(url);
  }

  async getFamilyCollaborationAnalytics(familyId: number): Promise<FamilyCollaborationAnalyticsDTO> {
    const url = `${API_BASE_URL}/v1/UnifiedAnalytics/family/${familyId}/collaboration`;
    return this.fetchWithAuth<FamilyCollaborationAnalyticsDTO>(url);
  }

  // ============================================================================
  // ADMIN ANALYTICS METHODS (Requires Admin Role)
  // ============================================================================

  async getAdminDashboard(
    startDate?: Date,
    endDate?: Date
  ): Promise<AdminAnalyticsDashboardDTO> {
    const params = this.buildQueryParams({
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
    });
    
    const url = `${API_BASE_URL}/v1/UnifiedAnalytics/admin/dashboard${params ? `?${params}` : ''}`;
    return this.fetchWithAuth<AdminAnalyticsDashboardDTO>(url);
  }

  async getPlatformUsageAnalytics(
    startDate?: Date,
    endDate?: Date
  ): Promise<PlatformUsageAnalyticsDTO> {
    const params = this.buildQueryParams({
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
    });
    
    const url = `${API_BASE_URL}/v1/UnifiedAnalytics/admin/platform-usage${params ? `?${params}` : ''}`;
    return this.fetchWithAuth<PlatformUsageAnalyticsDTO>(url);
  }

  async getSystemHealthAnalytics(): Promise<SystemHealthAnalyticsDTO> {
    const url = `${API_BASE_URL}/v1/UnifiedAnalytics/admin/system-health`;
    return this.fetchWithAuth<SystemHealthAnalyticsDTO>(url);
  }

  async getBackgroundServiceAnalytics(): Promise<BackgroundServiceAnalyticsDTO> {
    const url = `${API_BASE_URL}/v1/UnifiedAnalytics/admin/background-services`;
    return this.fetchWithAuth<BackgroundServiceAnalyticsDTO>(url);
  }

  async getMarketplaceAnalytics(): Promise<MarketplaceAnalyticsDTO> {
    const url = `${API_BASE_URL}/v1/UnifiedAnalytics/admin/marketplace`;
    return this.fetchWithAuth<MarketplaceAnalyticsDTO>(url);
  }

  async getUserEngagementAnalytics(
    startDate?: Date,
    endDate?: Date
  ): Promise<UserEngagementAnalyticsDTO> {
    const params = this.buildQueryParams({
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
    });
    
    const url = `${API_BASE_URL}/v1/UnifiedAnalytics/admin/user-engagement${params ? `?${params}` : ''}`;
    return this.fetchWithAuth<UserEngagementAnalyticsDTO>(url);
  }

  // ============================================================================
  // ML & INSIGHTS METHODS
  // ============================================================================

  async getMLInsights(userId?: number, familyId?: number): Promise<MLInsightsDTO> {
    const params = this.buildQueryParams({ userId, familyId });
    const url = `${API_BASE_URL}/v1/UnifiedAnalytics/ml/insights${params ? `?${params}` : ''}`;
    return this.fetchWithAuth<MLInsightsDTO>(url);
  }

  async getBehavioralAnalysis(): Promise<BehavioralAnalysisDTO> {
    const url = `${API_BASE_URL}/v1/UnifiedAnalytics/ml/behavioral-analysis`;
    return this.fetchWithAuth<BehavioralAnalysisDTO>(url);
  }

  async getPredictiveAnalytics(): Promise<PredictiveAnalyticsDTO> {
    const url = `${API_BASE_URL}/v1/UnifiedAnalytics/ml/predictive-analytics`;
    return this.fetchWithAuth<PredictiveAnalyticsDTO>(url);
  }

  // ============================================================================
  // EXPORT & VISUALIZATION METHODS
  // ============================================================================

  async exportAnalytics(request: AnalyticsExportRequestDTO): Promise<AnalyticsExportDTO> {
    const url = `${API_BASE_URL}/v1/UnifiedAnalytics/export`;
    return this.fetchWithAuth<AnalyticsExportDTO>(url, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getDataVisualization(
    visualizationType: string,
    parameters: Record<string, unknown>
  ): Promise<DataVisualizationDTO> {
    const params = this.buildQueryParams(parameters);
    const url = `${API_BASE_URL}/v1/UnifiedAnalytics/visualization/${visualizationType}${params ? `?${params}` : ''}`;
    return this.fetchWithAuth<DataVisualizationDTO>(url);
  }

  // ============================================================================
  // CACHE MANAGEMENT METHODS
  // ============================================================================

  async refreshAnalyticsCache(): Promise<void> {
    const url = `${API_BASE_URL}/v1/UnifiedAnalytics/cache/refresh`;
    await this.fetchWithAuth<void>(url, { method: 'POST' });
  }

  async refreshFamilyAnalyticsCache(familyId: number): Promise<void> {
    const url = `${API_BASE_URL}/v1/UnifiedAnalytics/cache/refresh/family/${familyId}`;
    await this.fetchWithAuth<void>(url, { method: 'POST' });
  }

  // ============================================================================
  // FOCUS ANALYTICS METHODS
  // ============================================================================

  async getFocusAnalytics(userId: number, timeRange: string): Promise<FocusSessionAnalytics> {
    try {
      console.log('📊 AnalyticsService: Fetching focus analytics for user:', userId, 'timeRange:', timeRange);
      
      // Since focus analytics endpoint doesn't exist yet, return mock data
      // In production, this would call: /v1/UnifiedAnalytics/user/focus-analytics
      return {
        weeklyTrend: [
          { week: 'Week 1', sessions: 5, totalMinutes: 125, averageLength: 25 },
          { week: 'Week 2', sessions: 7, totalMinutes: 175, averageLength: 25 },
          { week: 'Week 3', sessions: 4, totalMinutes: 100, averageLength: 25 },
          { week: 'Week 4', sessions: 6, totalMinutes: 150, averageLength: 25 },
        ],
        hourlyDistribution: [
          { hour: 9, sessions: 3, totalMinutes: 75, productivityScore: 85 },
          { hour: 10, sessions: 5, totalMinutes: 125, productivityScore: 92 },
          { hour: 11, sessions: 4, totalMinutes: 100, productivityScore: 88 },
          { hour: 14, sessions: 2, totalMinutes: 50, productivityScore: 78 },
        ],
        categoryBreakdown: [
          { category: 'Development', sessions: 8, totalMinutes: 200, averageLength: 25, completionRate: 90 },
          { category: 'Research', sessions: 4, totalMinutes: 100, averageLength: 25, completionRate: 85 },
          { category: 'Planning', sessions: 3, totalMinutes: 75, averageLength: 25, completionRate: 95 },
        ],
        productivityScore: 87,
        improvementSuggestions: [
          'Try focusing during your peak hours (10-11 AM)',
          'Consider extending session length for development tasks',
          'Take breaks between sessions to maintain high productivity',
        ],
        achievements: [
          {
            id: 'focus-streak-7',
            title: '7-Day Focus Streak',
            description: 'Completed focus sessions for 7 consecutive days',
            icon: '🔥',
            unlockedAt: new Date(),
            category: 'streak',
          },
        ],
      };
    } catch (error) {
      console.error('❌ AnalyticsService: Failed to fetch focus analytics:', error);
      throw new AnalyticsServiceError(
        `Failed to fetch focus analytics: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}

// ============================================================================
// SERVICE INSTANCE
// ============================================================================

export const analyticsService = AnalyticsService.getInstance(); 