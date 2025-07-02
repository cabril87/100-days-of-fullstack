/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 * 
 * Analytics Types Index
 * Selective exports to avoid conflicts
 * .cursorrules compliant
 */

// ============================================================================
// ANALYTICS TYPES INDEX - .cursorrules compliant
// ============================================================================

export * from './analytics';
export * from './analytics-page';
export * from './analytics-components';

// Page configuration types (non-component)
export type {
  AnalyticsTab,
  AnalyticsPageParams,
  AnalyticsTabConfig,
  ResponsiveAnalyticsConfig,
  GamificationTheme,
  AnalyticsMetricCard
} from './analytics-page';

// Chart data types (non-component)
export type {
  ChartDataPoint,
  ExportData
} from './analytics-components';

// Component props are in @/lib/props/components/analytics.props 