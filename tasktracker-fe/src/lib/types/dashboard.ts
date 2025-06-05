/*
 * Dashboard Types & Interfaces
 * Copyright (c) 2025 Carlos Abril Jr
 */

export interface DashboardStats {
  tasksCompleted: number;
  activeGoals: number;
  focusTime: number;
  totalPoints: number;
  familyMembers: number;
  familyTasks: number;
  familyPoints: number;
  streakDays: number;
}

export interface FamilyActivityItem {
  id: string;
  type: 'task_completed' | 'goal_achieved' | 'member_joined' | 'points_earned' | 'family_created' | 'invitation_sent';
  memberName: string;
  memberAvatarUrl?: string;
  description: string;
  timestamp: Date;
  points?: number;
  taskTitle?: string;
  goalTitle?: string;
}

export interface UserProgress {
  currentLevel: number;
  pointsToNextLevel: number;
  experiencePercentage: number;
  totalExperience: number;
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconUrl?: string;
  pointsRewarded: number;
  unlockedAt: Date;
  category: 'productivity' | 'family' | 'consistency' | 'milestone';
} 