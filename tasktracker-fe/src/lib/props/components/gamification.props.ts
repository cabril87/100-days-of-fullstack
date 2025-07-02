/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 * 
 * Gamification Component Props - .cursorrules compliant
 * 
 * MANDATORY: ALL component props interfaces MUST be in lib/props/
 * NO EXCEPTIONS - ZERO TOLERANCE POLICY
 */

import { ReactNode } from 'react';
import type { UseGamificationEventsReturn } from '@/lib/types/gamification';
import type { 
  WidgetConfiguration,
  DashboardCustomization
} from '@/lib/interfaces/gamification/enterprise-gamification.interface';

// ============================================================================
// GAMIFICATION CORE PROPS
// ============================================================================

export interface GamificationProps {
  user: { 
    id: number; 
    username: string; 
    email: string; 
  };
  gamificationData: UseGamificationEventsReturn;
  isConnected: boolean;
}

// ============================================================================
// CELEBRATION TEST PROPS
// ============================================================================

export interface SimulatedEvent {
  id: string;
  type: 'achievement' | 'level_up' | 'streak' | 'task_completion';
  title: string;
  description: string;
  points?: number;
  level?: number;
  streakCount?: number;
}

export interface DeviceTestResult {
  deviceType: string;
  userAgent: string;
  screenSize: string;
  supportedFeatures: string[];
  performanceScore?: number;
}

export interface TestMetrics {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  averageResponseTime: number;
}

export interface TouchTestResult {
  gesture: string;
  success: boolean;
  responseTime: number;
  accuracy?: number;
}

// ================================
// GAMIFICATION WIDGET PROPS
// ================================

export interface EnterpriseGamificationWidgetProps {
  familyId?: number;
  userId?: number;
  className?: string;
  isCompact?: boolean;
  showFamilyData?: boolean;
  showPersonalData?: boolean;
  theme?: 'light' | 'dark' | 'colorful' | 'minimal';
  animationsEnabled?: boolean;
  realTimeUpdates?: boolean;
}

export interface FamilyDashboardProps extends EnterpriseGamificationWidgetProps {
  layout: 'grid' | 'list' | 'cards';
  widgetConfiguration: WidgetConfiguration[];
  customization: DashboardCustomization;
}

// ================================
// DASHBOARD CONNECTION PROPS (FROM TYPES/GAMIFICATION/GAMIFICATION.TS)
// ================================

export interface SharedGamificationProps {
  isConnected: boolean;
  gamificationData: Record<string, unknown>;
  className?: string;
  theme?: 'light' | 'dark' | 'auto';
}

export interface SharedConnectionProps {
  isConnected: boolean;
  connectionStatus: 'connected' | 'connecting' | 'disconnected' | 'error';
  lastUpdated?: Date;
  onReconnect?: () => void;
  showStatus?: boolean;
  className?: string;
}

// ================================
// ACHIEVEMENT & PROGRESS PROPS
// ================================

export interface AchievementDisplayProps {
  className?: string;
  achievement: Record<string, unknown>;
  onUnlock?: (achievementId: number) => void;
  showProgress?: boolean;
  showDescription?: boolean;
  animateOnUnlock?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface ProgressIndicatorProps {
  className?: string;
  current: number;
  total: number;
  label?: string;
  showPercentage?: boolean;
  showNumbers?: boolean;
  animated?: boolean;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

export interface LeaderboardProps {
  className?: string;
  entries: Array<Record<string, unknown>>;
  currentUserId?: number;
  onUserClick?: (userId: number) => void;
  showAvatars?: boolean;
  showRanks?: boolean;
  showScores?: boolean;
  maxEntries?: number;
  timeframe?: 'daily' | 'weekly' | 'monthly' | 'all';
}

// ================================
// CELEBRATION & FEEDBACK PROPS
// ================================

export interface CelebrationModalProps {
  className?: string;
  isOpen: boolean;
  onClose: () => void;
  achievement?: Record<string, unknown>;
  points?: number;
  level?: number;
  celebrationType?: 'achievement' | 'level' | 'points' | 'streak';
  autoClose?: boolean;
  duration?: number;
}

export interface StreakCounterProps {
  className?: string;
  currentStreak: number;
  bestStreak?: number;
  onStreakClick?: () => void;
  showBest?: boolean;
  showIcon?: boolean;
  animated?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export interface PointsDisplayProps {
  className?: string;
  points: number;
  onPointsClick?: () => void;
  showLabel?: boolean;
  showIcon?: boolean;
  animated?: boolean;
  increment?: number;
  size?: 'sm' | 'md' | 'lg';
}

// ============================================================================
// GAMIFICATION COMPONENT PROPS
// ============================================================================

export interface GamificationPageContentProps {
  className?: string;
  initialData?: {
    achievements: Array<Record<string, unknown>>;
    badges: Array<Record<string, unknown>>;
    leaderboard: Array<Record<string, unknown>>;
  };
  showPersonalization?: boolean;
  onAchievementClick?: (achievement: Record<string, unknown>) => void;
  onBadgeClick?: (badge: Record<string, unknown>) => void;
} 