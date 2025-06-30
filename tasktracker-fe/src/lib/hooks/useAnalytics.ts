/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { analyticsService } from '@/lib/services/analyticsService';
import {
  UseAnalyticsOptions,
  UseAnalyticsReturn,
  UserAnalyticsDashboardDTO,
  FamilyAnalyticsDashboardDTO,
  AdminAnalyticsDashboardDTO,
  SystemHealthAnalyticsDTO,
  UserEngagementAnalyticsDTO,
  PersonalizedRecommendationsDTO,
  MLInsightsDTO
} from '@/lib/types/analytics';

export function useAnalytics(options: UseAnalyticsOptions = {}): UseAnalyticsReturn {
  const {
    userId,
    familyId,
    isAdmin = false,
    initialTimeRange = '30d',
    initialMode = 'user'
  } = options;

  // Use refs for stable values that don't need to trigger re-renders
  const userIdRef = useRef(userId);
  const familyIdRef = useRef(familyId);
  const isAdminRef = useRef(isAdmin);

  // Update refs when props change
  userIdRef.current = userId;
  familyIdRef.current = familyId;
  isAdminRef.current = isAdmin;

  // State
  const [state, setState] = useState<{
    userAnalytics: UserAnalyticsDashboardDTO | null;
    familyAnalytics: FamilyAnalyticsDashboardDTO | null;
    adminAnalytics: AdminAnalyticsDashboardDTO | null;
    systemHealth: SystemHealthAnalyticsDTO | null;
    userEngagement: UserEngagementAnalyticsDTO | null;
    recommendations: PersonalizedRecommendationsDTO | null;
    mlInsights: MLInsightsDTO | null;
    loading: {
      user: boolean;
      family: boolean;
      admin: boolean;
      recommendations: boolean;
      mlInsights: boolean;
    };
    errors: {
      user: string | null;
      family: string | null;
      admin: string | null;
      recommendations: string | null;
      mlInsights: string | null;
    };
    lastUpdated: Date;
    timeRange: '7d' | '30d' | '90d' | '1y';
    dashboardMode: 'user' | 'family' | 'admin';
  }>({
    userAnalytics: null,
    familyAnalytics: null,
    adminAnalytics: null,
    systemHealth: null,
    userEngagement: null,
    recommendations: null,
    mlInsights: null,
    loading: {
      user: false,
      family: false,
      admin: false,
      recommendations: false,
      mlInsights: false
    },
    errors: {
      user: null,
      family: null,
      admin: null,
      recommendations: null,
      mlInsights: null
    },
    lastUpdated: new Date(),
    timeRange: initialTimeRange,
    dashboardMode: initialMode
  });

  // Computed values
  const dateRange = useMemo(() => {
    const endDate = new Date();
    const startDate = new Date();
    
    switch (state.timeRange) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
    }
    
    return { startDate, endDate };
  }, [state.timeRange]);

  const isLoading = useMemo(() => 
    Object.values(state.loading).some(loading => loading), 
    [state.loading]
  );

  const hasErrors = useMemo(() => 
    Object.values(state.errors).some(error => error !== null), 
    [state.errors]
  );

  // Stable data fetching functions (don't depend on reactive values)
  const fetchUserAnalytics = useCallback(async (startDate: Date, endDate: Date) => {
    const currentUserId = userIdRef.current;
    if (!currentUserId) return;
    
    setState(prev => ({
      ...prev,
      loading: { ...prev.loading, user: true },
      errors: { ...prev.errors, user: null }
    }));
    
    try {
      const data = await analyticsService.getUserDashboard(startDate, endDate);
      setState(prev => ({ ...prev, userAnalytics: data, lastUpdated: new Date() }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        errors: { ...prev.errors, user: error instanceof Error ? error.message : 'Failed to load user analytics' }
      }));
    } finally {
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, user: false }
      }));
    }
  }, []);

  const fetchFamilyAnalytics = useCallback(async (startDate: Date, endDate: Date) => {
    const currentFamilyId = familyIdRef.current;
    if (!currentFamilyId) return;
    
    setState(prev => ({
      ...prev,
      loading: { ...prev.loading, family: true },
      errors: { ...prev.errors, family: null }
    }));
    
    try {
      const data = await analyticsService.getFamilyDashboard(currentFamilyId, startDate, endDate);
      setState(prev => ({ ...prev, familyAnalytics: data, lastUpdated: new Date() }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        errors: { ...prev.errors, family: error instanceof Error ? error.message : 'Failed to load family analytics' }
      }));
    } finally {
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, family: false }
      }));
    }
  }, []);

  const fetchAdminAnalytics = useCallback(async (startDate: Date, endDate: Date) => {
    const currentIsAdmin = isAdminRef.current;
    if (!currentIsAdmin) return;
    
    setState(prev => ({
      ...prev,
      loading: { ...prev.loading, admin: true },
      errors: { ...prev.errors, admin: null }
    }));
    
    try {
      const [adminData, systemHealthData, userEngagementData] = await Promise.all([
        analyticsService.getAdminDashboard(startDate, endDate),
        analyticsService.getSystemHealthAnalytics(),
        analyticsService.getUserEngagementAnalytics(startDate, endDate)
      ]);
      
      setState(prev => ({
        ...prev,
        adminAnalytics: adminData,
        systemHealth: systemHealthData,
        userEngagement: userEngagementData,
        lastUpdated: new Date()
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        errors: { ...prev.errors, admin: error instanceof Error ? error.message : 'Failed to load admin analytics' }
      }));
    } finally {
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, admin: false }
      }));
    }
  }, []);

  const fetchRecommendations = useCallback(async () => {
    setState(prev => ({
      ...prev,
      loading: { ...prev.loading, recommendations: true },
      errors: { ...prev.errors, recommendations: null }
    }));
    
    try {
      const data = await analyticsService.getPersonalizedRecommendations();
      setState(prev => ({ ...prev, recommendations: data, lastUpdated: new Date() }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        errors: { ...prev.errors, recommendations: error instanceof Error ? error.message : 'Failed to load recommendations' }
      }));
    } finally {
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, recommendations: false }
      }));
    }
  }, []);

  const fetchMLInsights = useCallback(async () => {
    const currentUserId = userIdRef.current;
    const currentFamilyId = familyIdRef.current;
    
    setState(prev => ({
      ...prev,
      loading: { ...prev.loading, mlInsights: true },
      errors: { ...prev.errors, mlInsights: null }
    }));
    
    try {
      const data = await analyticsService.getMLInsights(currentUserId, currentFamilyId);
      setState(prev => ({ ...prev, mlInsights: data, lastUpdated: new Date() }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        errors: { ...prev.errors, mlInsights: error instanceof Error ? error.message : 'Failed to load ML insights' }
      }));
    } finally {
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, mlInsights: false }
      }));
    }
  }, []);

  // Action callbacks (stable, don't depend on state)
  const setTimeRange = useCallback((range: '7d' | '30d' | '90d' | '1y') => {
    setState(prev => ({ ...prev, timeRange: range }));
  }, []);

  const setDashboardMode = useCallback((mode: 'user' | 'family' | 'admin') => {
    setState(prev => ({ ...prev, dashboardMode: mode }));
  }, []);

  // Refresh function that uses current state values directly
  const refreshData = useCallback(async () => {
    setState(currentState => {
      const { dashboardMode } = currentState;
      const { startDate, endDate } = (() => {
        const end = new Date();
        const start = new Date();
        
        switch (currentState.timeRange) {
          case '7d':
            start.setDate(end.getDate() - 7);
            break;
          case '30d':
            start.setDate(end.getDate() - 30);
            break;
          case '90d':
            start.setDate(end.getDate() - 90);
            break;
          case '1y':
            start.setFullYear(end.getFullYear() - 1);
            break;
        }
        
        return { startDate: start, endDate: end };
      })();

      // Execute fetches based on current mode
      const promises: Promise<void>[] = [];
      
      switch (dashboardMode) {
        case 'user':
          promises.push(
            fetchUserAnalytics(startDate, endDate),
            fetchRecommendations(),
            fetchMLInsights()
          );
          break;
        case 'family':
          if (familyIdRef.current) {
            promises.push(
              fetchFamilyAnalytics(startDate, endDate),
              fetchRecommendations(),
              fetchMLInsights()
            );
          }
          break;
        case 'admin':
          if (isAdminRef.current) {
            promises.push(
              fetchAdminAnalytics(startDate, endDate),
              fetchMLInsights()
            );
          }
          break;
      }
      
      Promise.all(promises).catch(console.error);
      
      return currentState; // Return unchanged state to avoid re-render
    });
  }, [fetchUserAnalytics, fetchFamilyAnalytics, fetchAdminAnalytics, fetchRecommendations, fetchMLInsights]);

  const refreshSpecific = useCallback(async (type: 'user' | 'family' | 'admin' | 'recommendations' | 'mlInsights') => {
    switch (type) {
      case 'user':
        await fetchUserAnalytics(dateRange.startDate, dateRange.endDate);
        break;
      case 'family':
        await fetchFamilyAnalytics(dateRange.startDate, dateRange.endDate);
        break;
      case 'admin':
        await fetchAdminAnalytics(dateRange.startDate, dateRange.endDate);
        break;
      case 'recommendations':
        await fetchRecommendations();
        break;
      case 'mlInsights':
        await fetchMLInsights();
        break;
    }
  }, [fetchUserAnalytics, fetchFamilyAnalytics, fetchAdminAnalytics, fetchRecommendations, fetchMLInsights, dateRange.startDate, dateRange.endDate]);

  // Effect for initial load and when time range or dashboard mode changes
  useEffect(() => {
    refreshData();
  }, [state.timeRange, state.dashboardMode, refreshData]);

  return {
    ...state,
    setTimeRange,
    setDashboardMode,
    refreshData,
    refreshSpecific,
    isLoading,
    hasErrors,
    dateRange
  };
} 