/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * Analytics Server Utilities
 * Following FAMILY-AUTH-IMPLEMENTATION-CHECKLIST.md enterprise standards
 * Server-side utilities for analytics functionality
 */

import type { AnalyticsTab, AnalyticsPageParams } from '@/lib/types/analytics/analytics-page';

/**
 * Server-side URL parameter parser for analytics page
 * Use in Server Components to get initial state from search parameters
 * 
 * @param searchParams - Next.js search params object
 * @returns Parsed analytics parameters with defaults
 */
export function parseAnalyticsSearchParams(
  searchParams: Record<string, string | string[] | undefined>
): AnalyticsPageParams {
  const analytics = Array.isArray(searchParams.analytics) 
    ? searchParams.analytics[0] 
    : searchParams.analytics;
  
  const timeRange = Array.isArray(searchParams.timeRange) 
    ? searchParams.timeRange[0] 
    : searchParams.timeRange;
    
  const familyId = Array.isArray(searchParams.familyId) 
    ? searchParams.familyId[0] 
    : searchParams.familyId;

  return {
    analytics: (analytics as AnalyticsTab) || 'personal',
    timeRange: (timeRange as 'week' | 'month' | 'quarter' | 'year') || 'month',
    familyId: familyId || undefined,
  };
} 