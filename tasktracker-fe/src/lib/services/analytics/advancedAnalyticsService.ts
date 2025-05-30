/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 */

import { apiRequest } from '../apiClient';
import type {
  AdvancedAnalytics,
  TaskTrend,
  ProductivityMetrics,
  FamilyAnalytics,
  TimeAnalysis,
  CategoryBreakdown,
  ComparativeAnalytics
} from '../../types/analytics';

/**
 * Service for advanced analytics operations
 */
export class AdvancedAnalyticsService {
  private readonly baseUrl = '/v1/analytics/advanced';

  /**
   * Get comprehensive advanced analytics data
   */
  async getAdvancedAnalytics(
    startDate?: Date,
    endDate?: Date
  ): Promise<AdvancedAnalytics> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate.toISOString());
    if (endDate) params.append('endDate', endDate.toISOString());

    const response = await apiRequest<AdvancedAnalytics>(
      `${this.baseUrl}${params.toString() ? `?${params.toString()}` : ''}`,
      'GET',
      undefined,
      { requiresAuth: true }
    );
    
    if (response.error) {
      if (response.error.includes('Not Found') || response.error.includes('404')) {
        return {
          taskTrends: [],
          productivityMetrics: {
            dailyAverage: 0,
            weeklyTrends: [],
            peakHours: Array(24).fill(0),
            efficiencyScore: 0
          },
          timeAnalysis: {
            averageCompletionTime: 0,
            mostProductiveHour: 0,
            mostProductiveDay: 'Monday',
            totalTimeSpent: 0,
            timeDistribution: Array.from({ length: 24 }, (_, hour) => ({
              hour,
              taskCount: 0,
              completionRate: 0
            }))
          },
          categoryBreakdown: []
        };
      }
      throw new Error(response.error);
    }
    
    return response.data || {
      taskTrends: [],
      productivityMetrics: {
        dailyAverage: 0,
        weeklyTrends: [],
        peakHours: Array(24).fill(0),
        efficiencyScore: 0
      },
      timeAnalysis: {
        averageCompletionTime: 0,
        mostProductiveHour: 0,
        mostProductiveDay: 'Monday',
        totalTimeSpent: 0,
        timeDistribution: Array.from({ length: 24 }, (_, hour) => ({
          hour,
          taskCount: 0,
          completionRate: 0
        }))
      },
      categoryBreakdown: []
    };
  }

  /**
   * Get task trends over time
   */
  async getTaskTrends(
    startDate: Date,
    endDate: Date
  ): Promise<TaskTrend[]> {
    const params = new URLSearchParams({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });

    const response = await apiRequest<TaskTrend[]>(
      `${this.baseUrl}/task-trends?${params.toString()}`,
      'GET',
      undefined,
      { requiresAuth: true }
    );
    
    if (response.error) {
      if (response.error.includes('Not Found') || response.error.includes('404')) {
        return [];
      }
      throw new Error(response.error);
    }
    
    return response.data || [];
  }

  /**
   * Get productivity metrics
   */
  async getProductivityMetrics(
    startDate: Date,
    endDate: Date
  ): Promise<ProductivityMetrics> {
    const params = new URLSearchParams({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });

    const response = await apiRequest<ProductivityMetrics>(
      `${this.baseUrl}/productivity-metrics?${params.toString()}`,
      'GET',
      undefined,
      { requiresAuth: true }
    );
    
    if (response.error) {
      if (response.error.includes('Not Found') || response.error.includes('404')) {
        return {
          dailyAverage: 0,
          weeklyTrends: [],
          peakHours: Array(24).fill(0),
          efficiencyScore: 0
        };
      }
      throw new Error(response.error);
    }
    
    return response.data || {
      dailyAverage: 0,
      weeklyTrends: [],
      peakHours: Array(24).fill(0),
      efficiencyScore: 0
    };
  }

  /**
   * Get family analytics data
   */
  async getFamilyAnalytics(
    startDate?: Date,
    endDate?: Date
  ): Promise<FamilyAnalytics> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate.toISOString());
    if (endDate) params.append('endDate', endDate.toISOString());

    const response = await apiRequest<FamilyAnalytics>(
      `${this.baseUrl}/family-analytics${params.toString() ? `?${params.toString()}` : ''}`,
      'GET',
      undefined,
      { requiresAuth: true }
    );
    
    if (response.error) {
      if (response.error.includes('Not Found') || response.error.includes('404')) {
        return {
          familyProductivity: {
            totalTasks: 0,
            completedTasks: 0,
            familyCompletionRate: 0,
            averageTasksPerMember: 0
          },
          memberComparisons: [],
          collaborationMetrics: {
            sharedTasks: 0,
            collaborativeCompletionRate: 0,
            mostActiveCollaborators: [],
            teamEfficiencyScore: 0
          }
        };
      }
      throw new Error(response.error);
    }
    
    return response.data || {
      familyProductivity: {
        totalTasks: 0,
        completedTasks: 0,
        familyCompletionRate: 0,
        averageTasksPerMember: 0
      },
      memberComparisons: [],
      collaborationMetrics: {
        sharedTasks: 0,
        collaborativeCompletionRate: 0,
        mostActiveCollaborators: [],
        teamEfficiencyScore: 0
      }
    };
  }

  /**
   * Get time analysis data
   */
  async getTimeAnalysis(
    startDate: Date,
    endDate: Date
  ): Promise<TimeAnalysis> {
    const params = new URLSearchParams({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });

    const response = await apiRequest<TimeAnalysis>(
      `${this.baseUrl}/time-analysis?${params.toString()}`,
      'GET',
      undefined,
      { requiresAuth: true }
    );
    
    if (response.error) {
      if (response.error.includes('Not Found') || response.error.includes('404')) {
        return {
          averageCompletionTime: 0,
          mostProductiveHour: 0,
          mostProductiveDay: 'Monday',
          totalTimeSpent: 0,
          timeDistribution: Array.from({ length: 24 }, (_, hour) => ({
            hour,
            taskCount: 0,
            completionRate: 0
          }))
        };
      }
      throw new Error(response.error);
    }
    
    return response.data || {
      averageCompletionTime: 0,
      mostProductiveHour: 0,
      mostProductiveDay: 'Monday',
      totalTimeSpent: 0,
      timeDistribution: Array.from({ length: 24 }, (_, hour) => ({
        hour,
        taskCount: 0,
        completionRate: 0
      }))
    };
  }

  /**
   * Get category breakdown data
   */
  async getCategoryBreakdown(
    startDate: Date,
    endDate: Date
  ): Promise<CategoryBreakdown[]> {
    const params = new URLSearchParams({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });

    const response = await apiRequest<CategoryBreakdown[]>(
      `${this.baseUrl}/category-breakdown?${params.toString()}`,
      'GET',
      undefined,
      { requiresAuth: true }
    );
    
    if (response.error) {
      if (response.error.includes('Not Found') || response.error.includes('404')) {
        return [];
      }
      throw new Error(response.error);
    }
    
    return response.data || [];
  }

  /**
   * Get comparative analytics between users/periods
   */
  async getComparativeAnalytics(
    compareWith: 'users' | 'periods',
    startDate: Date,
    endDate: Date,
    compareStartDate?: Date,
    compareEndDate?: Date,
    userIds?: number[]
  ): Promise<ComparativeAnalytics> {
    const params = new URLSearchParams({
      compareWith,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });

    if (compareStartDate) {
      params.append('compareStartDate', compareStartDate.toISOString());
    }
    if (compareEndDate) {
      params.append('compareEndDate', compareEndDate.toISOString());
    }
    if (userIds && userIds.length > 0) {
      params.append('userIds', userIds.join(','));
    }

    const response = await apiRequest<ComparativeAnalytics>(
      `${this.baseUrl}/comparative?${params.toString()}`,
      'GET',
      undefined,
      { requiresAuth: true }
    );
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data!;
  }

  /**
   * Get analytics for a specific time range with custom grouping
   */
  async getTimeRangeAnalytics(
    startDate: Date,
    endDate: Date,
    groupBy: 'day' | 'week' | 'month' = 'day'
  ): Promise<any> {
    const params = new URLSearchParams({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      groupBy
    });

    const response = await apiRequest(
      `${this.baseUrl}/time-range?${params.toString()}`,
      'GET',
      undefined,
      { requiresAuth: true }
    );
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data;
  }

  /**
   * Get analytics summary for dashboard
   */
  async getAnalyticsSummary(period: 'today' | 'week' | 'month' | 'year' = 'week'): Promise<any> {
    const response = await apiRequest(
      `${this.baseUrl}/summary?period=${period}`,
      'GET',
      undefined,
      { requiresAuth: true }
    );
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data;
  }

  /**
   * Get real-time analytics data
   */
  async getRealTimeAnalytics(): Promise<any> {
    const response = await apiRequest(
      `${this.baseUrl}/realtime`,
      'GET',
      undefined,
      { requiresAuth: true }
    );
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data;
  }

  /**
   * Export analytics data
   */
  async exportAnalytics(
    format: 'json' | 'csv' | 'pdf',
    startDate: Date,
    endDate: Date,
    includeCharts: boolean = false
  ): Promise<Blob> {
    const params = new URLSearchParams({
      format,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      includeCharts: includeCharts.toString()
    });

    const response = await apiRequest<Blob>(
      `${this.baseUrl}/export?${params.toString()}`,
      'GET',
      undefined,
      { requiresAuth: true }
    );
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data!;
  }
}

// Create and export singleton instance
export const advancedAnalyticsService = new AdvancedAnalyticsService(); 