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
  totalFamilies: number;
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

// Backend API interfaces for activity service
export interface BackendActivityItem {
  id: number;
  actionType?: string;
  type?: string; // Alternative field name for actionType
  actorDisplayName?: string;
  actor?: { displayName: string };
  user?: { displayName: string }; // Alternative field name for actor
  actorId: number;
  description?: string;
  timestamp?: string;
  createdAt?: string; // Alternative field name for timestamp
  entityType?: string;
}

export interface BackendUserProgress {
  currentLevel: number;
  totalPoints: number;
  pointsToNextLevel: number;
}

export interface UserProgressApiResponse {
  success: boolean;
  data: BackendUserProgress;
} 