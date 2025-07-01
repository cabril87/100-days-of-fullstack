/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * Analytics Component Props Types
 * Following FAMILY-AUTH-IMPLEMENTATION-CHECKLIST.md enterprise standards
 */

import type { AnalyticsTab } from './analytics-page';

// ============================================================================
// CHART DATA TYPES - Replacing forbidden 'unknown' types
// ============================================================================

export interface ChartDataPoint {
  label: string;
  value: number;
  category?: string;
  date?: string;
  metadata?: Record<string, string | number>;
}

export interface ExportData {
  type: 'user' | 'family' | 'admin';
  data: Record<string, string | number | boolean>;
  generatedAt: string;
  format: string;
}

// ============================================================================
// ANALYTICS PAGE COMPONENT PROPS
// ============================================================================

export interface AnalyticsPageServerProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export interface EnterpriseAnalyticsPageProps {
  className?: string;
  initialTab?: AnalyticsTab;
  timeRange?: 'week' | 'month' | 'quarter' | 'year';
  familyId?: number;
}

export interface AnalyticsTabSelectorProps {
  className?: string;
  currentTab: AnalyticsTab;
  availableTabs: AnalyticsTab[];
  onTabChange: (tab: AnalyticsTab) => void;
  userRole?: string;
  hasFamily?: boolean;
  isMobile?: boolean;
}

export interface TimeRangeSelectorProps {
  className?: string;
  timeRange: 'week' | 'month' | 'quarter' | 'year';
  onTimeRangeChange: (range: 'week' | 'month' | 'quarter' | 'year') => void;
  disabled?: boolean;
  showLabels?: boolean;
}

export interface AnalyticsHeaderProps {
  className?: string;
  title: string;
  description?: string;
  currentTab: AnalyticsTab;
  timeRange: string;
  onExport?: () => void;
  showExport?: boolean;
  isMobile?: boolean;
}

// ============================================================================
// ANALYTICS WIDGET COMPONENT PROPS
// ============================================================================

export interface AnalyticsDashboardWrapperProps {
  className?: string;
  userId?: number;
  familyId?: number;
  showPersonalData?: boolean;
  showFamilyData?: boolean;
  showAdminData?: boolean;
  timeRange?: 'week' | 'month' | 'quarter' | 'year';
}

// ============================================================================
// ANALYTICS WIDGET COMPONENT PROPS
// ============================================================================

export interface UserAnalyticsDashboardProps {
  className?: string;
  isCompact?: boolean;
  timeRange?: 'week' | 'month' | 'quarter' | 'year';
  showCharts?: boolean;
  showMetrics?: boolean;
}

export interface FamilyAnalyticsDashboardProps {
  className?: string;
  familyId: number;
  isCompact?: boolean;
  timeRange?: 'week' | 'month' | 'quarter' | 'year';
  showCollaboration?: boolean;
  showLeaderboard?: boolean;
}

export interface AdminAnalyticsDashboardProps {
  className?: string;
  isCompact?: boolean;
  timeRange?: 'week' | 'month' | 'quarter' | 'year';
  showPlatformMetrics?: boolean;
  showSystemHealth?: boolean;
}

// ============================================================================
// ANALYTICS CHART COMPONENT PROPS
// ============================================================================

export interface AnalyticsChartProps {
  className?: string;
  data: ChartDataPoint[];
  chartType: 'line' | 'bar' | 'pie' | 'area' | 'donut';
  height?: number;
  title?: string;
  description?: string;
  isLoading?: boolean;
  showLegend?: boolean;
  responsive?: boolean;
}

export interface AnalyticsCardProps {
  className?: string;
  title: string;
  value: string | number;
  description?: string;
  trend?: 'up' | 'down' | 'stable';
  icon?: React.ReactNode;
  onClick?: () => void;
  loading?: boolean;
  error?: string;
}

export interface AnalyticsSkeletonProps {
  className?: string;
  variant: 'card' | 'chart' | 'table' | 'full';
  count?: number;
}

export interface AnalyticsErrorProps {
  className?: string;
  title?: string;
  message: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

export interface AnalyticsLoadingProps {
  className?: string;
  message?: string;
  variant?: 'spinner' | 'skeleton' | 'progress';
}

export interface AnalyticsMetricDisplayProps {
  className?: string;
  metrics: Record<string, string | number>;
  layout?: 'grid' | 'list' | 'inline';
  showTrends?: boolean;
}

export interface AnalyticsTimelineProps {
  className?: string;
  events: Array<{
    id: string;
    title: string;
    description?: string;
    timestamp: string;
    type: 'achievement' | 'task' | 'milestone' | 'event';
  }>;
  maxItems?: number;
  showTimestamps?: boolean;
}

export interface AnalyticsInsightsProps {
  className?: string;
  insights: Array<{
    id: string;
    title: string;
    description: string;
    type: 'improvement' | 'warning' | 'success' | 'info';
    actionable?: boolean;
    action?: () => void;
  }>;
  maxItems?: number;
}

// ============================================================================
// MOBILE ANALYTICS COMPONENT PROPS
// ============================================================================

export interface MobileAnalyticsHeaderProps {
  className?: string;
  title: string;
  description?: string;
  currentTab: AnalyticsTab;
  availableTabs: Array<{ id: AnalyticsTab; label: string; description: string }>;
  onBack?: () => void;
  onSettings?: () => void;
}

export interface MobileAnalyticsTabsProps {
  className?: string;
  currentTab: AnalyticsTab;
  availableTabs: Array<{ 
    id: AnalyticsTab; 
    label: string; 
    icon: React.ComponentType<{ className?: string }>;
    disabled?: boolean;
  }>;
  onTabChange: (tab: AnalyticsTab) => void;
  responsive: {
    isMobile: boolean;
    isLandscape: boolean;
  };
}

export interface MobileSwipeIndicatorProps {
  className?: string;
  tabs: Array<{ id: AnalyticsTab; active: boolean }>;
  showText?: boolean;
}

// ============================================================================
// ANALYTICS EXPORT COMPONENT PROPS
// ============================================================================

export interface AnalyticsExportProps {
  className?: string;
  data: ExportData;
  filename?: string;
  formats?: Array<'pdf' | 'excel' | 'csv' | 'json'>;
  onExport?: (format: string, data: ExportData) => void;
  isExporting?: boolean;
} 