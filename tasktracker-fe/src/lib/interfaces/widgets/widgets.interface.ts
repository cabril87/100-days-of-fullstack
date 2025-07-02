/*
 * Widget Interfaces - Moved from lib/types/widgets.ts for .cursorrules compliance  
 * lib/interfaces/widgets/widgets.interface.ts
 * Copyright (c) 2025 Carlos Abril Jr
 */

// ================================
// FAMILY GOALS WIDGET INTERFACES
// ================================

export interface FamilyGoal {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  type: 'individual' | 'collaborative' | 'family';
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  participantNames?: string[];
  completionPercentage: number;
  timeRemaining?: string;
  rewards: Array<{
    type: string;
    value: number | string;
    description: string;
    icon: string;
  }>;
}

export interface FamilyChallenge {
  id: string;
  title: string;
  description: string;
  type: 'weekly' | 'monthly' | 'seasonal' | 'custom';
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  icon: string;
  targetPoints: number;
  currentProgress: number;
  status: 'upcoming' | 'active' | 'completed' | 'failed';
  isOptional: boolean;
  participantNames?: string[];
  progressPercentage: number;
  timeRemaining?: string;
  rewards: Array<{
    type: string;
    value: number | string;
    description: string;
    icon: string;
  }>;
}

export interface FamilyGoalsWidgetProps {
  familyId?: number;
  userId?: number;
  goals?: FamilyGoal[];
  challenges?: FamilyChallenge[];
  className?: string;
  isCompact?: boolean;
  showRewards?: boolean;
  showProgress?: boolean;
  enableInteraction?: boolean;
  theme?: string;
  animationsEnabled?: boolean;
  realTimeUpdates?: boolean;
}

// ================================
// FAMILY LEADERBOARD WIDGET INTERFACES
// ================================

export interface LeaderboardMember {
  userId: number;
  memberName: string;
  ageGroup: 'child' | 'teen' | 'adult';
  score: number;
  rank: number;
  previousRank?: number;
  trend: 'up' | 'down' | 'same';
  avatar?: string;
  badge?: string;
  weeklyGrowth: number;
  achievements: number;
  streak: number;
}

export interface FamilyLeaderboardWidgetProps {
  familyId?: number;
  userId?: number;
  familyMembers?: LeaderboardMember[];
  currentUserId?: number;
  className?: string;
  isCompact?: boolean;
  showTrends?: boolean;
  showAchievements?: boolean;
  enableCelebrations?: boolean;
  theme?: string;
  animationsEnabled?: boolean;
  realTimeUpdates?: boolean;
}

// ================================
// DASHBOARD WIDGET COMMON INTERFACES
// ================================

export interface DashboardWidgetProps {
  className?: string;
  isCompact?: boolean;
  theme?: string;
  animationsEnabled?: boolean;
  realTimeUpdates?: boolean;
}

export interface WidgetStats {
  active: number;
  completed: number;
  averageProgress: number;
}

export interface CelebrationConfig {
  enabled: boolean;
  duration: number;
  effects: string[];
} 