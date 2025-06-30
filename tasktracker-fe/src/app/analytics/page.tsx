/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 */

import { Metadata } from 'next';
import { AnalyticsDashboardWrapper } from '@/components/analytics/AnalyticsDashboardWrapper';

export const metadata: Metadata = {
  title: 'Analytics Dashboard | TaskTracker Enterprise',
  description: 'Advanced analytics and insights for personal productivity, family collaboration, and system performance.',
  keywords: 'analytics, dashboard, productivity, insights, family collaboration, admin metrics',
};

/**
 * Analytics Dashboard Page
 * 
 * Features:
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
 */
export default function AnalyticsPage() {
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Analytics Dashboard
        </h1>
        <p className="text-muted-foreground">
          Comprehensive insights into productivity, collaboration, and performance metrics
        </p>
      </div>

      {/* Analytics Dashboard */}
      <AnalyticsDashboardWrapper />
    </div>
  );
} 