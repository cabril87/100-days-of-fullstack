/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * Analytics Page Component Types
 * Following FAMILY-AUTH-IMPLEMENTATION-CHECKLIST.md enterprise standards
 */

// Import analytics types - they will be re-exported below

// ============================================================================
// ANALYTICS TAB TYPES
// ============================================================================

export type AnalyticsTab = 'personal' | 'family' | 'admin';

export interface AnalyticsTabConfig {
  id: AnalyticsTab;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  requiresRole?: string[];
  requiresFamily?: boolean;
}

// ============================================================================
// URL PARAMETER TYPES
// ============================================================================

export interface AnalyticsPageParams {
  analytics?: AnalyticsTab;
  timeRange?: 'week' | 'month' | 'quarter' | 'year';
  familyId?: string;
}

// ============================================================================
// MOBILE ANALYTICS CONFIGURATION TYPES
// ============================================================================

export interface ResponsiveAnalyticsConfig {
  mobile: {
    chartHeight: number;
    cardPadding: string;
    fontSize: string;
    hideDetails: boolean;
  };
  tablet: {
    chartHeight: number;
    cardPadding: string;
    fontSize: string;
    hideDetails: boolean;
  };
  desktop: {
    chartHeight: number;
    cardPadding: string;
    fontSize: string;
    hideDetails: boolean;
  };
}

// ============================================================================
// ENTERPRISE GAMIFICATION STYLES
// ============================================================================

export interface GamificationTheme {
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    danger: string;
    achievement: string;
    badge: string;
    points: string;
    streak: string;
  };
  animations: {
    celebration: string;
    pointsGain: string;
    levelUp: string;
    achievement: string;
  };
  effects: {
    confetti: boolean;
    sparkles: boolean;
    hapticFeedback: boolean;
    soundEffects: boolean;
  };
}

export interface AnalyticsMetricCard {
  id: string;
  title: string;
  value: string | number;
  description: string;
  trend: 'up' | 'down' | 'stable';
  icon: React.ComponentType<{ className?: string }>;
  gamificationLevel?: 'bronze' | 'silver' | 'gold' | 'platinum';
  isAchievement?: boolean;
}

// ============================================================================
// EXPORT ALL TYPES
// ============================================================================

export type {
  UserAnalyticsDashboardDTO,
  FamilyAnalyticsDashboardDTO
} from './analytics'; 