/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 * 
 * Widget Types
 * Interfaces and types for dashboard widgets
 */

// ================================
// FAMILY GOALS WIDGET TYPES
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

/* 
 * ⚠️  FamilyGoalsWidgetProps MOVED TO: @/lib/props/components/ui.props.ts
 * .cursorrules ZERO TOLERANCE: ALL component props MUST be in lib/props/
 */

// ================================
// FAMILY LEADERBOARD WIDGET TYPES
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

/* 
 * ⚠️  FamilyLeaderboardWidgetProps MOVED TO: @/lib/props/components/ui.props.ts
 * .cursorrules ZERO TOLERANCE: ALL component props MUST be in lib/props/
 */

// ================================
// DASHBOARD WIDGET COMMON TYPES
// ================================

/* 
 * ⚠️  DashboardWidgetProps MOVED TO: @/lib/props/components/ui.props.ts
 * .cursorrules ZERO TOLERANCE: ALL component props MUST be in lib/props/
 */

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