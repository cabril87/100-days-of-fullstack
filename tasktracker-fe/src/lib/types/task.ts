/*
 * Task Types & Interfaces
 * Copyright (c) 2025 Carlos Abril Jr
 */

import { User } from './auth';

export interface Task {
  id: number;
  title: string;
  description?: string;
  isCompleted: boolean;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  dueDate?: Date;
  categoryId?: number;
  categoryName?: string;
  estimatedTimeMinutes?: number;
  actualTimeMinutes?: number;
  pointsEarned: number;
  pointsValue: number;
  userId: number;
  familyId?: number;
  assignedToUserId?: number;
  assignedToUserName?: string;
  createdAt: Date;
  updatedAt?: Date;
  completedAt?: Date;
  tags?: string[];
}

export interface CreateTaskDTO {
  title: string;
  description?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  dueDate?: string; // ISO date string
  categoryId?: number;
  estimatedTimeMinutes?: number;
  pointsValue?: number;
  familyId?: number;
  assignedToUserId?: number;
  tags?: string[];
}

export interface UpdateTaskDTO {
  title?: string;
  description?: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Urgent';
  dueDate?: string; // ISO date string
  categoryId?: number;
  estimatedTimeMinutes?: number;
  pointsValue?: number;
  assignedToUserId?: number;
  tags?: string[];
}

export interface TaskStats {
  totalTasks: number;
  completedTasks: number;
  activeTasks: number;
  overdueTasks: number;
  // Extended properties for dashboard use
  tasksCompleted: number;
  tasksCompletedThisWeek: number;
  activeGoals: number;
  focusTimeToday: number;
  streakDays: number;
  totalPoints: number;
}

export interface TaskCategory {
  id: number;
  name: string;
  color: string;
  icon?: string;
  description?: string;
  userId: number;
  isDefault: boolean;
  taskCount: number;
  createdAt: Date;
}

export interface Goal {
  id: number;
  title: string;
  description?: string;
  targetValue: number;
  currentValue: number;
  metric: 'tasks_completed' | 'points_earned' | 'focus_time' | 'custom';
  period: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  startDate: Date;
  endDate?: Date;
  isCompleted: boolean;
  userId: number;
  familyId?: number;
  pointsReward: number;
  createdAt: Date;
  updatedAt?: Date;
  completedAt?: Date;
}

export interface CreateGoalDTO {
  title: string;
  description?: string;
  targetValue: number;
  metric: 'tasks_completed' | 'points_earned' | 'focus_time' | 'custom';
  period: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  startDate: string; // ISO date string
  endDate?: string; // ISO date string
  familyId?: number;
  pointsReward?: number;
}

export interface UpdateGoalDTO {
  title?: string;
  description?: string;
  targetValue?: number;
  endDate?: string; // ISO date string
  pointsReward?: number;
}

// Backend API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface BackendTaskStatsResponse {
  completedTasks?: number;
  completedTasksThisWeek?: number;
  activeGoals?: number;
  focusTimeToday?: number;
  streakDays?: number;
  totalPoints?: number;
}

export interface BackendUserProgressResponse {
  id: number;
  userId: number;
  totalPoints: number;
  currentLevel: number;
  pointsToNextLevel: number;
  tasksCompleted: number;
  badgesEarned: number;
  currentStreak: number;
  highestStreak: number;
  lastActivityDate: string;
  lastUpdated: string;
}

export interface TasksPageContentProps {
  user: User;
  initialData: {
    tasks: Task[];
    categories: TaskCategory[];
    stats: TaskStats;
  };
} 