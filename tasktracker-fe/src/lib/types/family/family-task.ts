/*
 * Family Task Management Type Definitions
 * Copyright (c) 2025 Carlos Abril Jr
 * 
 * All family task-related interfaces following Family Auth Implementation Checklist
 * Centralized type definitions for family task collaboration features
 */

// ===== FAMILY TASK DASHBOARD TYPES =====

export interface FamilyTaskStats {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  weeklyProgress: number;
  familyScore: number;
  memberStats: MemberTaskStats[];
  recentAchievements: FamilyAchievement[];
  sharedGoals: SharedGoal[];
}

export interface MemberTaskStats {
  memberId: string;
  name: string;
  avatar?: string;
  role: string;
  tasksCompleted: number;
  tasksTotal: number;
  points: number;
  streak: number;
  completionRate: number;
  level: number;
}

export interface FamilyAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  unlockedBy: string;
  points: number;
}

export interface SharedGoal {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  deadline?: Date;
  participants: string[];
  reward: number;
}

// ===== FAMILY TASK COLLABORATION TYPES =====

export interface FamilyTaskAssignment {
  taskId: string;
  assignedTo: string[];
  assignedBy: string;
  assignedAt: Date;
  dueDate?: Date;
  approvalRequired: boolean;
  approvedBy?: string[];
  status: 'pending' | 'in_progress' | 'completed' | 'approved' | 'rejected';
}

export interface FamilyTaskCollaborationMetrics {
  weeklyCollaborations: number;
  totalAssignments: number;
  completionRate: number;
  avgResponseTime: number;
  topCollaborator: string;
  familyEfficiencyScore: number;
}

// ===== FAMILY TASK ACTIVITY TYPES =====

export interface FamilyTaskActivity {
  id: string;
  taskId: string;
  taskTitle: string;
  memberId: string;
  memberName: string;
  action: 'created' | 'assigned' | 'completed' | 'approved' | 'commented';
  timestamp: Date;
  details?: string;
  pointsAwarded?: number;
}

export interface FamilyTaskLeaderboard {
  period: 'daily' | 'weekly' | 'monthly' | 'all_time';
  rankings: FamilyMemberRanking[];
  lastUpdated: Date;
}

export interface FamilyMemberRanking {
  memberId: string;
  memberName: string;
  avatar?: string;
  position: number;
  points: number;
  tasksCompleted: number;
  completionRate: number;
  streak: number;
  level: number;
  badges: string[];
}

// ===== FAMILY GOAL TYPES =====

export interface FamilyGoalProgress {
  goalId: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  progressPercentage: number;
  participants: string[];
  createdBy: string;
  deadline?: Date;
  reward: {
    points: number;
    badge?: string;
    description: string;
  };
  status: 'active' | 'completed' | 'expired' | 'paused';
}

export interface FamilyMilestone {
  id: string;
  title: string;
  description: string;
  achievedAt: Date;
  achievedBy: string[];
  pointsAwarded: number;
  celebrationLevel: 'small' | 'medium' | 'large' | 'epic';
}

// ===== TAB NAVIGATION TYPES =====

export type FamilyDashboardTab = 'overview' | 'leaderboard' | 'goals' | 'achievements'; 