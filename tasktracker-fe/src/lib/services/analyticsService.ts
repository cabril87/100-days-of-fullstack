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

export class AnalyticsService {
  private baseUrl = '/api/v1/UnifiedAnalytics';

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  private async fetchWithAuth<T>(url: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        credentials: 'include',
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
    
    const url = `${this.baseUrl}/user/dashboard${params ? `?${params}` : ''}`;
    return this.fetchWithAuth<UserAnalyticsDashboardDTO>(url);
  }

  async getUserProductivityInsights(): Promise<UserProductivityInsightsDTO> {
    const url = `${this.baseUrl}/user/productivity-insights`;
    return this.fetchWithAuth<UserProductivityInsightsDTO>(url);
  }

  async getUserBoardAnalytics(boardId?: number): Promise<UserBoardAnalyticsDTO> {
    const params = this.buildQueryParams({ boardId });
    const url = `${this.baseUrl}/user/board-analytics${params ? `?${params}` : ''}`;
    return this.fetchWithAuth<UserBoardAnalyticsDTO>(url);
  }

  async getPersonalizedRecommendations(): Promise<PersonalizedRecommendationsDTO> {
    const url = `${this.baseUrl}/user/recommendations`;
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
    
    const url = `${this.baseUrl}/family/${familyId}/dashboard${params ? `?${params}` : ''}`;
    return this.fetchWithAuth<FamilyAnalyticsDashboardDTO>(url);
  }

  async getFamilyProductivityInsights(familyId: number): Promise<FamilyProductivityInsightsDTO> {
    const url = `${this.baseUrl}/family/${familyId}/productivity-insights`;
    return this.fetchWithAuth<FamilyProductivityInsightsDTO>(url);
  }

  async getFamilyCollaborationAnalytics(familyId: number): Promise<FamilyCollaborationAnalyticsDTO> {
    const url = `${this.baseUrl}/family/${familyId}/collaboration`;
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
    
    const url = `${this.baseUrl}/admin/dashboard${params ? `?${params}` : ''}`;
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
    
    const url = `${this.baseUrl}/admin/platform-usage${params ? `?${params}` : ''}`;
    return this.fetchWithAuth<PlatformUsageAnalyticsDTO>(url);
  }

  async getSystemHealthAnalytics(): Promise<SystemHealthAnalyticsDTO> {
    const url = `${this.baseUrl}/admin/system-health`;
    return this.fetchWithAuth<SystemHealthAnalyticsDTO>(url);
  }

  async getBackgroundServiceAnalytics(): Promise<BackgroundServiceAnalyticsDTO> {
    const url = `${this.baseUrl}/admin/background-services`;
    return this.fetchWithAuth<BackgroundServiceAnalyticsDTO>(url);
  }

  async getMarketplaceAnalytics(): Promise<MarketplaceAnalyticsDTO> {
    const url = `${this.baseUrl}/admin/marketplace`;
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
    
    const url = `${this.baseUrl}/admin/user-engagement${params ? `?${params}` : ''}`;
    return this.fetchWithAuth<UserEngagementAnalyticsDTO>(url);
  }

  // ============================================================================
  // ML & INSIGHTS METHODS
  // ============================================================================

  async getMLInsights(userId?: number, familyId?: number): Promise<MLInsightsDTO> {
    const params = this.buildQueryParams({ userId, familyId });
    const url = `${this.baseUrl}/ml/insights${params ? `?${params}` : ''}`;
    return this.fetchWithAuth<MLInsightsDTO>(url);
  }

  async getBehavioralAnalysis(): Promise<BehavioralAnalysisDTO> {
    const url = `${this.baseUrl}/ml/behavioral-analysis`;
    return this.fetchWithAuth<BehavioralAnalysisDTO>(url);
  }

  async getPredictiveAnalytics(): Promise<PredictiveAnalyticsDTO> {
    const url = `${this.baseUrl}/ml/predictive-analytics`;
    return this.fetchWithAuth<PredictiveAnalyticsDTO>(url);
  }

  // ============================================================================
  // EXPORT & VISUALIZATION METHODS
  // ============================================================================

  async exportAnalytics(request: AnalyticsExportRequestDTO): Promise<AnalyticsExportDTO> {
    const url = `${this.baseUrl}/export`;
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
    const url = `${this.baseUrl}/visualization/${visualizationType}${params ? `?${params}` : ''}`;
    return this.fetchWithAuth<DataVisualizationDTO>(url);
  }

  // ============================================================================
  // CACHE MANAGEMENT METHODS
  // ============================================================================

  async refreshAnalyticsCache(): Promise<void> {
    const url = `${this.baseUrl}/cache/refresh`;
    await this.fetchWithAuth<void>(url, { method: 'POST' });
  }

  async refreshFamilyAnalyticsCache(familyId: number): Promise<void> {
    const url = `${this.baseUrl}/cache/refresh/family/${familyId}`;
    await this.fetchWithAuth<void>(url, { method: 'POST' });
  }
}

// ============================================================================
// SERVICE INSTANCE
// ============================================================================

export const analyticsService = new AnalyticsService(); 