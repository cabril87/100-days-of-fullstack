/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * Analytics Component Props - Moved from lib/types/ for .cursorrules compliance
 * Following FAMILY-AUTH-IMPLEMENTATION-CHECKLIST.md enterprise standards
 */

import React, { ReactNode } from 'react';
import type { 
  ProductivityMetricsDTO,
  TaskAnalyticsSummaryDTO,
  GamificationAnalyticsDTO,
  FamilyAnalyticsDashboardDTO
} from '@/lib/interfaces/analytics/analytics.interface';
import type { AnalyticsTab } from '@/lib/types/analytics';
import { UseAnalyticsReturn } from '@/lib/interfaces';

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

export interface UserAnalyticsDashboardProps {
  analytics: UseAnalyticsReturn;
  mode?: string;
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
  analytics: UseAnalyticsReturn;
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
  data: Array<{
    label: string;
    value: number;
    category?: string;
    date?: string;
    metadata?: Record<string, string | number>;
  }>;
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
  data: {
    type: 'user' | 'family' | 'admin';
    data: Record<string, string | number | boolean>;
    generatedAt: string;
    format: string;
  };
  filename?: string;
  formats?: Array<'pdf' | 'excel' | 'csv' | 'json'>;
  onExport?: (format: string, data: Record<string, string | number | boolean>) => void;
  isExporting?: boolean;
}

// ============================================================================
// SPECIFIC CHART COMPONENT PROPS
// ============================================================================

export interface ProductivityChartProps {
  data: ProductivityMetricsDTO;
  timeRange: string;
  className?: string;
}

export interface TaskCompletionChartProps {
  data: TaskAnalyticsSummaryDTO;
  timeRange: string;
  className?: string;
}

export interface GamificationChartProps {
  data: GamificationAnalyticsDTO;
  timeRange: string;
  className?: string;
}

export interface FamilyCollaborationChartProps {
  familyData: FamilyAnalyticsDashboardDTO;
  timeRange: string;
  className?: string;
}

// ============================================================================
// ADDITIONAL ANALYTICS PAGE PROPS (moved from analytics-page.ts)
// ============================================================================

export interface AnalyticsPageProps {
  className?: string;
  initialTab?: AnalyticsTab;
  searchParams?: Record<string, string>;
}

export interface MobileAnalyticsProps {
  isCompact?: boolean;
  showMiniCharts?: boolean;
  enableSwipeNavigation?: boolean;
  enableHapticFeedback?: boolean;
}

// ============================================================================
// ANALYTICS CORE PROPS
// ============================================================================

export interface AnalyticsPageProps {
  userId: number;
  familyId?: number;
  initialData?: {
    stats: unknown;
    charts: unknown;
    trends: unknown;
  };
  timeRange?: 'day' | 'week' | 'month' | 'quarter' | 'year';
  onTimeRangeChange?: (range: string) => void;
  className?: string;
  showExportOptions?: boolean;
  enableRealTime?: boolean;
}

export interface AnalyticsDashboardProps {
  data: {
    totalTasks: number;
    completedTasks: number;
    totalPoints: number;
    currentStreak: number;
    weeklyProgress: Array<{
      day: string;
      completed: number;
      total: number;
    }>;
    categoryBreakdown: Array<{
      category: string;
      count: number;
      percentage: number;
    }>;
    achievements: Array<{
      id: number;
      name: string;
      unlockedAt: Date;
      points: number;
    }>;
  };
  timeRange: 'week' | 'month' | 'quarter' | 'year';
  onTimeRangeChange: (range: string) => void;
  isLoading?: boolean;
  className?: string;
}

// ============================================================================
// CHART COMPONENT PROPS
// ============================================================================

export interface TaskProgressChartProps {
  data: Array<{
    date: string;
    completed: number;
    total: number;
    points: number;
  }>;
  timeRange: 'week' | 'month' | 'quarter' | 'year';
  height?: number;
  showPoints?: boolean;
  showTrendLine?: boolean;
  className?: string;
}

export interface ProductivityHeatmapProps {
  data: Array<{
    hour: number;
    productivity: number;
    tasksCompleted: number;
  }>;
  showAverage?: boolean;
  highlightPeakHours?: boolean;
  className?: string;
}

export interface CategoryDistributionChartProps {
  data: Array<{
    category: string;
    count: number;
    percentage: number;
    color: string;
  }>;
  chartType?: 'pie' | 'donut' | 'bar';
  showLabels?: boolean;
  showLegend?: boolean;
  className?: string;
}

export interface StreakVisualizationProps {
  streakData: Array<{
    date: string;
    hasActivity: boolean;
    tasksCompleted: number;
    points: number;
  }>;
  currentStreak: number;
  longestStreak: number;
  showTooltips?: boolean;
  compact?: boolean;
  className?: string;
}

// ============================================================================
// STATS CARD PROPS
// ============================================================================

export interface AnalyticsStatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    period: string;
    trend: 'up' | 'down' | 'neutral';
  };
  icon?: ReactNode;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';
  className?: string;
  loading?: boolean;
}

export interface MetricsGridProps {
  metrics: Array<{
    id: string;
    title: string;
    value: string | number;
    change?: {
      value: number;
      period: string;
      trend: 'up' | 'down' | 'neutral';
    };
    icon?: ReactNode;
    color?: string;
  }>;
  columns?: 2 | 3 | 4;
  className?: string;
  loading?: boolean;
}

// ============================================================================
// COMPARISON PROPS
// ============================================================================

export interface FamilyComparisonProps {
  familyId: number;
  members: Array<{
    id: number;
    name: string;
    avatar?: string;
    stats: {
      tasksCompleted: number;
      points: number;
      achievements: number;
      streak: number;
    };
  }>;
  metric: 'tasks' | 'points' | 'achievements' | 'streak';
  timeRange: 'week' | 'month' | 'quarter' | 'year';
  onMetricChange: (metric: string) => void;
  className?: string;
}

export interface PeerComparisonProps {
  userStats: {
    tasksCompleted: number;
    points: number;
    achievements: number;
    rank: number;
  };
  peerAverages: {
    tasksCompleted: number;
    points: number;
    achievements: number;
  };
  ageGroup: string;
  className?: string;
}

// ============================================================================
// INSIGHTS PROPS
// ============================================================================

export interface InsightsWidgetProps {
  insights: Array<{
    id: string;
    type: 'trend' | 'pattern' | 'recommendation' | 'achievement';
    title: string;
    description: string;
    confidence: number;
    actionable?: boolean;
    action?: {
      label: string;
      onClick: () => void;
    };
  }>;
  maxVisible?: number;
  onInsightDismiss?: (insightId: string) => void;
  className?: string;
}

export interface TrendAnalysisProps {
  trends: Array<{
    metric: string;
    direction: 'increasing' | 'decreasing' | 'stable';
    magnitude: number;
    significance: 'high' | 'medium' | 'low';
    description: string;
  }>;
  timeRange: string;
  className?: string;
}

// ============================================================================
// EXPORT/REPORT PROPS
// ============================================================================

export interface ExportOptionsProps {
  onExport: (format: 'pdf' | 'csv' | 'excel' | 'json') => void;
  availableFormats: Array<'pdf' | 'csv' | 'excel' | 'json'>;
  isExporting?: boolean;
  className?: string;
}

export interface ReportGeneratorProps {
  userId: number;
  familyId?: number;
  reportType: 'personal' | 'family' | 'comparison';
  timeRange: {
    start: Date;
    end: Date;
  };
  sections: Array<{
    id: string;
    name: string;
    enabled: boolean;
  }>;
  onGenerate: (config: unknown) => void;
  onSectionToggle: (sectionId: string, enabled: boolean) => void;
  className?: string;
}

// ============================================================================
// FILTER PROPS
// ============================================================================

export interface AnalyticsFiltersProps {
  filters: {
    timeRange: string;
    categories: string[];
    priorities: string[];
    members: number[];
    completionStatus: 'all' | 'completed' | 'incomplete';
  };
  onFiltersChange: (filters: unknown) => void;
  availableCategories: Array<{ id: string; name: string }>;
  availableMembers: Array<{ id: number; name: string }>;
  className?: string;
  collapsible?: boolean;
}

export interface TimeRangeSelectorProps {
  value: 'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
  onChange: (range: string) => void;
  customRange?: {
    start: Date;
    end: Date;
  };
  onCustomRangeChange?: (range: { start: Date; end: Date }) => void;
  className?: string;
  showPresets?: boolean;
  maxRange?: number; // in days
} 