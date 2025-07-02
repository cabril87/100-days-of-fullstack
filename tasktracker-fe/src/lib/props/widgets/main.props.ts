/*
 * Main Widget Component Props
 * Copyright (c) 2025 Carlos Abril Jr
 * 
 * All widget component prop interfaces following .cursorrules standards
 * Extracted from lib/types/ and properly organized in lib/props/
 */

import { ReactNode } from 'react';
import { UseGamificationEventsReturn } from '@/lib/types/gamification';
import { User } from '@/lib/types/auth';
import { FamilyDTO } from '@/lib/types/family';
import { Task } from '@/lib/types/tasks';
import { GamificationState } from '@/lib/types/gamification';

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

/**
 * Initial data for dashboard
 */
export interface DashboardInitialData {
  stats?: DashboardStats;
  family?: FamilyDTO | null;
  recentTasks?: Task[];
  taskStats?: {
    totalTasks: number;
    completedTasks: number;
    activeTasks: number;
    overdueTasks: number;
    pendingTasks: number;
    completionRate: number;
    averageCompletionTime: number;
    streakDays: number;
    longestStreak: number;
    pointsEarned: number;
  };
}

// ================================
// SHARED PROPS FOR CONSISTENCY
// ================================

export interface SharedGamificationProps {
  isConnected: boolean;
  gamificationData: UseGamificationEventsReturn;
}

export interface SharedConnectionProps {
  isConnected: boolean;
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
  showTimestamps?: boolean;
}

export interface NotificationStreamProps extends SharedConnectionProps {
  maxDisplay?: number;
  className?: string;
  showMarkAsRead?: boolean;
}

/**
 * Props for Dashboard component (unified interface)
 */
export interface DashboardProps {
  user: User | null;
  mode?: 'simple' | 'advanced';
  initialData?: DashboardInitialData;
  onTaskCreated?: () => void;
  onModeChange?: (mode: 'simple' | 'advanced') => void;
}

export interface DashboardWidgetProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  isLoading?: boolean;
  error?: string;
  onRefresh?: () => void;
}

// ================================
// DASHBOARD CARD PROPS
// ================================

export interface DashboardCardProps {
  title: string;
  description?: string;
  value?: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
  onClick?: () => void;
  actions?: Array<{ label: string; onClick: () => void }>;
}

// ================================
// STATISTICS WIDGET PROPS
// ================================

export interface StatisticsWidgetProps {
  title: string;
  metrics: Array<{
    label: string;
    value: string | number;
    unit?: string;
    color?: string;
  }>;
  chartData?: unknown[];
  chartType?: 'line' | 'bar' | 'pie' | 'donut';
}

// ================================
// ACTIVITY FEED PROPS
// ================================

export interface ActivityFeedProps {
  activities: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    user?: string;
    metadata?: Record<string, unknown>;
  }>;
  maxItems?: number;
  showTimestamp?: boolean;
  allowFiltering?: boolean;
}

// ================================
// FAMILY WIDGET PROPS
// ================================

export interface FamilyGoal {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline: string;
  participants: Array<{
    id: string;
    name: string;
    avatar?: string;
    contribution: number;
  }>;
  category: 'health' | 'productivity' | 'learning' | 'fun' | 'chores';
  difficulty: 'easy' | 'medium' | 'hard';
  rewards: {
    individual: number;
    family: number;
  };
}

export interface FamilyChallenge {
  id: string;
  title: string;
  description: string;
  type: 'weekly' | 'monthly' | 'special';
  startDate: string;
  endDate: string;
  progress: number;
  totalSteps: number;
  participants: number;
  rewards: {
    points: number;
    badges?: string[];
  };
  status: 'active' | 'completed' | 'failed';
}

export interface FamilyGoalsWidgetProps {
  goals: FamilyGoal[];
  onGoalClick?: (goalId: string) => void;
  onCreateGoal?: () => void;
  className?: string;
  maxDisplay?: number;
  showProgress?: boolean;
  allowCreation?: boolean;
}

export interface LeaderboardMember {
  id: string;
  name: string;
  avatar?: string;
  points: number;
  level: number;
  rank: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
}

export interface FamilyLeaderboardWidgetProps {
  members: LeaderboardMember[];
  currentUserId?: string;
  timeframe: 'daily' | 'weekly' | 'monthly' | 'all-time';
  onTimeframeChange?: (timeframe: string) => void;
  onMemberClick?: (memberId: string) => void;
  className?: string;
  maxDisplay?: number;
  showTrends?: boolean;
}

// ================================
// WIDGET CONFIGURATION
// ================================

export interface WidgetStats {
  views: number;
  interactions: number;
  lastUpdated: string;
}

export interface CelebrationConfig {
  enabled: boolean;
  sound: boolean;
  animation: 'confetti' | 'fireworks' | 'sparkles' | 'none';
  duration: number;
}

// ================================
// DASHBOARD PROPS (Moved from forbidden types/component-props/)
// ================================

/**
 * Props for age-specific dashboard content
 */
// DashboardContentProps moved to lib/props/components/dashboard.props.ts
// export interface DashboardContentProps {
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
 * Props for widgets that use gamification data (alternative definition)
 */
export interface GamificationWidgetPropsAlt {
  userId?: number;
  className?: string;
  isConnected?: boolean;
  gamificationData?: UseGamificationEventsReturn;
} 
