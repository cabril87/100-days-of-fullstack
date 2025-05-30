/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  AdvancedAnalytics, 
  TaskTrend, 
  ProductivityMetrics, 
  FamilyAnalytics,
  FilterCriteria 
} from '@/lib/types/analytics';
import { advancedAnalyticsService } from '@/lib/services/analytics';

interface UseAdvancedAnalyticsProps {
  startDate?: Date;
  endDate?: Date;
  filters?: FilterCriteria;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseAdvancedAnalyticsReturn {
  // Data
  analytics: AdvancedAnalytics | null;
  taskTrends: TaskTrend[];
  productivityMetrics: ProductivityMetrics | null;
  familyAnalytics: FamilyAnalytics | null;
  
  // State
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastUpdated: Date | null;
  
  // Actions
  refresh: () => Promise<void>;
  refetch: () => Promise<void>;
  clearError: () => void;
  setFilters: (filters: FilterCriteria) => void;
  setDateRange: (startDate: Date, endDate: Date) => void;
}

export function useAdvancedAnalytics({
  startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
  endDate = new Date(),
  filters = {},
  autoRefresh = false,
  refreshInterval = 300000 // 5 minutes
}: UseAdvancedAnalyticsProps = {}): UseAdvancedAnalyticsReturn {
  
  // State
  const [analytics, setAnalytics] = useState<AdvancedAnalytics | null>(null);
  const [taskTrends, setTaskTrends] = useState<TaskTrend[]>([]);
  const [productivityMetrics, setProductivityMetrics] = useState<ProductivityMetrics | null>(null);
  const [familyAnalytics, setFamilyAnalytics] = useState<FamilyAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [currentFilters, setCurrentFilters] = useState<FilterCriteria>(filters);
  const [currentStartDate, setCurrentStartDate] = useState(startDate);
  const [currentEndDate, setCurrentEndDate] = useState(endDate);

  // Fetch analytics data
  const fetchAnalytics = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      // Fetch all analytics data in parallel
      const [trendsData, productivityData, familyData] = await Promise.all([
        advancedAnalyticsService.getTaskTrends(currentStartDate, currentEndDate),
        advancedAnalyticsService.getProductivityMetrics(currentStartDate, currentEndDate),
        advancedAnalyticsService.getFamilyAnalytics(currentStartDate, currentEndDate)
      ]);

      // Combine into analytics object
      const analyticsData: AdvancedAnalytics = {
        taskTrends: trendsData,
        productivityMetrics: productivityData,
        timeAnalysis: {
          averageCompletionTime: productivityData.dailyAverage,
          mostProductiveHour: Math.max(...productivityData.peakHours),
          mostProductiveDay: 'Monday', // This would come from the API
          totalTimeSpent: productivityData.dailyAverage * 30,
          timeDistribution: productivityData.peakHours.map((count, hour) => ({
            hour,
            taskCount: count,
            completionRate: 0.8 // This would come from the API
          }))
        },
        categoryBreakdown: [] // This would come from the API
      };

      setAnalytics(analyticsData);
      setTaskTrends(trendsData);
      setProductivityMetrics(productivityData);
      setFamilyAnalytics(familyData);
      setLastUpdated(new Date());

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch analytics data';
      setError(errorMessage);
      console.error('Analytics fetch error:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [currentStartDate, currentEndDate, currentFilters]);

  // Initial fetch
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchAnalytics(true);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchAnalytics]);

  // Actions
  const refresh = useCallback(async () => {
    await fetchAnalytics(true);
  }, [fetchAnalytics]);

  const refetch = useCallback(async () => {
    await fetchAnalytics(false);
  }, [fetchAnalytics]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const setFilters = useCallback((newFilters: FilterCriteria) => {
    setCurrentFilters(newFilters);
  }, []);

  const setDateRange = useCallback((newStartDate: Date, newEndDate: Date) => {
    setCurrentStartDate(newStartDate);
    setCurrentEndDate(newEndDate);
  }, []);

  return {
    analytics,
    taskTrends,
    productivityMetrics,
    familyAnalytics,
    isLoading,
    isRefreshing,
    error,
    lastUpdated,
    refresh,
    refetch,
    clearError,
    setFilters,
    setDateRange,
  };
} 