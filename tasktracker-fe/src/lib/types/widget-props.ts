'use client';

/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 * 
 * Widget Component Props
 * Comprehensive prop type definitions for all dashboard widgets
 */

import { SharedGamificationProps, SharedConnectionProps } from './gamification';
import { User } from './auth';
import { FamilyDTO } from './family-invitation';
import { Task } from './task';

// ================================
// DASHBOARD DATA TYPES
// ================================

export interface DashboardStats {
  tasksCompleted: number;
  activeGoals: number;
  focusTime: number;
  totalPoints: number;
  streakDays: number;
  familyMembers: number;
  familyTasks: number;
  familyPoints: number;
  totalFamilies: number;
}

export interface DashboardInitialData {
  stats: DashboardStats;
  family: FamilyDTO | null;
  recentTasks: Task[];
}

// ================================
// DASHBOARD WIDGET PROPS
// ================================

export interface LivePointsWidgetProps extends SharedGamificationProps {
  userId?: number;
  className?: string;
}

export interface StreakCounterProps extends SharedGamificationProps {
  userId?: number;
  className?: string;
}

export interface RecentAchievementsProps extends SharedGamificationProps {
  userId?: number;
  maxDisplay?: number;
  className?: string;
}

export interface FamilyActivityStreamProps extends SharedConnectionProps {
  userId?: number;
  familyId?: number;
  maxDisplay?: number;
  className?: string;
}

export interface NotificationStreamProps extends SharedConnectionProps {
  maxDisplay?: number;
  className?: string;
}

// ================================
// DASHBOARD MAIN PROPS
// ================================

export interface DashboardProps {
  user: User | null;
  initialData?: DashboardInitialData;
}

// ================================
// RE-EXPORT SHARED TYPES
// ================================

export type {
  UseGamificationEventsReturn,
  SharedGamificationProps,
  SharedConnectionProps
} from './gamification'; 