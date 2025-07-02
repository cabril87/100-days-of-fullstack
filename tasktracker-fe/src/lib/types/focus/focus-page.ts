/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * Focus Page Types - Enterprise Focus Management
 * Following FAMILY-AUTH-IMPLEMENTATION-CHECKLIST.md enterprise standards
 */

import { LucideIcon } from 'lucide-react';

// ============================================================================
// FOCUS PAGE CONFIGURATION TYPES
// ============================================================================

export interface FocusTabConfig {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  requiresSession: boolean;
}

export interface ResponsiveFocusConfig {
  mobile: FocusResponsiveSettings;
  tablet: FocusResponsiveSettings;
  desktop: FocusResponsiveSettings;
}

export interface FocusResponsiveSettings {
  timerSize: 'small' | 'medium' | 'large' | 'extra-large';
  cardPadding: string;
  fontSize: string;
  hideDetails: boolean;
  showCompactView: boolean;
}

// ============================================================================
// FOCUS GAMIFICATION TYPES
// ============================================================================

export interface FocusGamificationTheme {
  colors: {
    focus: string;
    productivity: string;
    streak: string;
    achievement: string;
    celebration: string;
  };
  animations: {
    sessionStart: string;
    sessionComplete: string;
    achievement: string;
    streak: string;
  };
  effects: {
    confetti: boolean;
    hapticFeedback: boolean;
    soundEffects: boolean;
    visualFeedback: boolean;
  };
}

export interface FocusMetricCard {
  id: string;
  title: string;
  value: string | number;
  description: string;
  trend: 'up' | 'down' | 'stable';
  icon: LucideIcon;
  color: string;
}

// ============================================================================
// FOCUS SESSION ANALYTICS TYPES
// ============================================================================

export interface FocusSessionStats {
  totalSessions: number;
  totalMinutes: number;
  averageSessionLength: number;
  currentStreak: number;
  longestStreak: number;
  thisWeekSessions: number;
  thisMonthSessions: number;
  completionRate: number;
  mostProductiveHour: number;
  favoriteTaskCategory: string;
}

export interface FocusSessionAnalytics {
  weeklyTrend: FocusWeeklyData[];
  hourlyDistribution: FocusHourlyData[];
  categoryBreakdown: FocusCategoryData[];
  productivityScore: number;
  improvementSuggestions: string[];
  achievements: FocusAchievement[];
}

export interface FocusWeeklyData {
  week: string;
  sessions: number;
  totalMinutes: number;
  averageLength: number;
}

export interface FocusHourlyData {
  hour: number;
  sessions: number;
  totalMinutes: number;
  productivityScore: number;
}

export interface FocusCategoryData {
  category: string;
  sessions: number;
  totalMinutes: number;
  averageLength: number;
  completionRate: number;
}

export interface FocusAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  category: 'focus' | 'productivity' | 'streak' | 'milestone';
} 