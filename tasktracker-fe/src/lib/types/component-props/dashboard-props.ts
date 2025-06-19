/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 */

import type { User } from '@/lib/types/auth';
import type { FamilyDTO } from '@/lib/types/family-invitation';
import type { Task } from '@/lib/types/task';
import type { UseGamificationEventsReturn } from '@/lib/types/gamification';


/**
 * Dashboard statistics data
 */
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

/**
 * Initial data for dashboard
 */
export interface DashboardInitialData {
  stats?: DashboardStats;
  family?: FamilyDTO | null;
  recentTasks?: Task[];
  taskStats?: Record<string, unknown>;
}

/**
 * Props for Dashboard component
 */
export interface DashboardProps {
  user: User | null;
  initialData?: DashboardInitialData;
}

/**
 * Props for age-specific dashboard content
 */
export interface DashboardContentProps {
  user: User | null;
  initialData?: DashboardInitialData;
}

/**
 * Props for dashboard connections hook
 */
export interface DashboardConnectionsProps {
  userId?: number;
  enableLogging?: boolean;
}

/**
 * Return type for dashboard connections hook
 */
export interface DashboardConnectionsReturn {
  isConnected: boolean;
  signalRStatus: string;
  connectionHealth: {
    isHealthy: boolean;
    quality: string;
    consecutiveFailures: number;
    lastError: string | null;
    metrics: {
      totalConnections: number;
      totalDisconnections: number;
      avgConnectionTime: number;
      uptime: number;
    };
  };
  refreshGamificationData: () => Promise<void>;
  reconnect: () => Promise<void>;
  gamificationData: UseGamificationEventsReturn;
}

/**
 * Props for gamification widgets
 */
export interface GamificationWidgetProps {
  userId?: number;
  className?: string;
  isConnected?: boolean;
  gamificationData?: UseGamificationEventsReturn;
} 