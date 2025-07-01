'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import type { AnalyticsTab, AnalyticsPageParams } from '@/lib/types/analytics-page';

// ============================================================================
// ANALYTICS URL PARAMETER MANAGEMENT HOOK
// Following FAMILY-AUTH-IMPLEMENTATION-CHECKLIST.md Enterprise Standards
// ============================================================================

export interface UseAnalyticsParamsReturn {
  // Current state
  currentTab: AnalyticsTab;
  timeRange: 'week' | 'month' | 'quarter' | 'year';
  familyId: string | null;
  
  // URL manipulation
  setTab: (tab: AnalyticsTab) => void;
  setTimeRange: (range: 'week' | 'month' | 'quarter' | 'year') => void;
  setFamilyId: (familyId: string | null) => void;
  updateParams: (params: Partial<AnalyticsPageParams>) => void;
  
  // Utilities
  getTabUrl: (tab: AnalyticsTab) => string;
  isTabActive: (tab: AnalyticsTab) => boolean;
  
  // Raw params
  searchParams: URLSearchParams;
}

/**
 * Enterprise URL parameter management for analytics page
 * Handles ?analytics=personal&timeRange=month&familyId=123 type URLs
 */
export function useAnalyticsParams(): UseAnalyticsParamsReturn {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Parse current parameters with defaults
  const currentParams = useMemo((): AnalyticsPageParams => ({
    analytics: (searchParams.get('analytics') as AnalyticsTab) || 'personal',
    timeRange: (searchParams.get('timeRange') as 'week' | 'month' | 'quarter' | 'year') || 'month',
    familyId: searchParams.get('familyId') || undefined,
  }), [searchParams]);

  // Update URL with new parameters
  const updateParams = useCallback((updates: Partial<AnalyticsPageParams>) => {
    const newParams = new URLSearchParams(searchParams.toString());
    
    // Apply updates
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === undefined) {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });

    // Navigate to new URL
    const newUrl = `${pathname}${newParams.toString() ? `?${newParams.toString()}` : ''}`;
    router.push(newUrl);
  }, [router, pathname, searchParams]);

  // Specific parameter setters
  const setTab = useCallback((tab: AnalyticsTab) => {
    updateParams({ analytics: tab });
  }, [updateParams]);

  const setTimeRange = useCallback((range: 'week' | 'month' | 'quarter' | 'year') => {
    updateParams({ timeRange: range });
  }, [updateParams]);

  const setFamilyId = useCallback((familyId: string | null) => {
    updateParams({ familyId: familyId || undefined });
  }, [updateParams]);

  // Utility functions
  const getTabUrl = useCallback((tab: AnalyticsTab): string => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('analytics', tab);
    return `${pathname}?${newParams.toString()}`;
  }, [pathname, searchParams]);

  const isTabActive = useCallback((tab: AnalyticsTab): boolean => {
    return currentParams.analytics === tab;
  }, [currentParams.analytics]);

  return {
    // Current state
    currentTab: currentParams.analytics || 'personal',
    timeRange: currentParams.timeRange || 'month',
    familyId: currentParams.familyId || null,
    
    // URL manipulation
    setTab,
    setTimeRange,
    setFamilyId,
    updateParams,
    
    // Utilities
    getTabUrl,
    isTabActive,
    
    // Raw params
    searchParams,
  };
}

