/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * Analytics Page - Server Component
 * Following FAMILY-AUTH-IMPLEMENTATION-CHECKLIST.md enterprise standards
 * Implements URL parameter handling: ?analytics=personal&timeRange=month
 */

import { Metadata } from 'next';
import { Suspense } from 'react';
import { EnterpriseAnalyticsPage } from '@/components/analytics/EnterpriseAnalyticsPage';
import { parseAnalyticsSearchParams } from '@/lib/utils/analytics-server';
import type { AnalyticsPageServerProps } from '@/lib/types/analytics-components';
import type { AnalyticsTab } from '@/lib/types/analytics-page';

export const metadata: Metadata = {
  title: 'Analytics Dashboard | TaskTracker Enterprise',
  description: 'Advanced analytics and insights for personal productivity, family collaboration, and system performance.',
  keywords: 'analytics, dashboard, productivity, insights, family collaboration, admin metrics',
};

/**
 * Enterprise Analytics Dashboard Page
 * 
 * Features:
 * - URL Parameter Tabs: ?analytics=personal|family|admin
 * - Mobile-First Responsive Design: Swipe navigation, haptic feedback
 * - Enterprise Gamification: Points, achievements, streaks, levels
 * - User Analytics: Personal productivity metrics, gamification progress
 * - Family Analytics: Collaboration insights, family productivity trends
 * - Admin Analytics: Platform metrics, system health (Admin role only)
 * - ML Insights: Behavioral analysis, predictive recommendations
 * - Real-time Updates: SignalR integration for live data
 * - Export Capabilities: PDF, Excel, CSV export options
 * 
 * Role-based Access:
 * - Regular Users: User + Family analytics
 * - Global Admins: All analytics including platform-wide metrics
 * 
 * Mobile Features:
 * - Touch-optimized interface with gesture navigation
 * - Adaptive layouts for different screen sizes
 * - Haptic feedback for interaction confirmation
 * - Swipe to navigate between tabs
 * - Compact charts and metrics for mobile viewing
 */
export default async function AnalyticsPage({ searchParams }: AnalyticsPageServerProps) {
  // Parse search parameters on server side
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const params = parseAnalyticsSearchParams(resolvedSearchParams);
  
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        </div>
      }
    >
      <EnterpriseAnalyticsPage 
        initialTab={params.analytics as AnalyticsTab}
        timeRange={params.timeRange}
        familyId={params.familyId ? parseInt(params.familyId) : undefined}
      />
    </Suspense>
  );
} 