/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 */

import type { GamificationState } from '@/lib/types/gamification';

/**
 * Base props for all dashboard widgets
 */
export interface BaseWidgetProps {
  userId?: number;
  className?: string;
  isConnected?: boolean;
}

/**
 * Props for widgets that use gamification data
 */
export interface GamificationWidgetProps extends BaseWidgetProps {
  gamificationData?: GamificationState;
}

/**
 * Props for LivePointsWidget
 */
export interface LivePointsWidgetProps extends GamificationWidgetProps {
  showLevel?: boolean;
  showProgress?: boolean;
}

/**
 * Props for StreakCounter widget
 */
export interface StreakCounterProps extends GamificationWidgetProps {
  showIcon?: boolean;
  compactMode?: boolean;
}

/**
 * Props for RecentAchievements widget
 */
export interface RecentAchievementsProps extends GamificationWidgetProps {
  maxDisplay?: number;
  showIcons?: boolean;
}

/**
 * Props for FamilyActivityStream widget
 */
export interface FamilyActivityStreamProps extends BaseWidgetProps {
  familyId?: number;
  maxDisplay?: number;
  showTimestamps?: boolean;
}

/**
 * Props for NotificationStream widget
 */
export interface NotificationStreamProps extends BaseWidgetProps {
  maxDisplay?: number;
  showMarkAsRead?: boolean;
} 