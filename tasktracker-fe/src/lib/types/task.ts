/*
 * Task Types & Interfaces
 * Copyright (c) 2025 Carlos Abril Jr
 */

import { User } from './auth';
import { FamilyDTO, FamilyMemberDTO } from './family-invitation';

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

// === FAMILY TASK TYPES (Matching Backend DTOs Exactly) ===

/**
 * Family Task Item DTO - matches backend FamilyTaskItemDTO
 */
export interface FamilyTaskItemDTO {
  id: number;
  title: string;
  description?: string;
  status: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  dueDate?: string; // ISO date string from backend
  isCompleted: boolean;
  pointsValue: number;
  pointsEarned: number;
  estimatedTimeMinutes?: number;
  actualTimeMinutes?: number;
  userId: number;
  familyId: number;
  assignedToFamilyMemberId?: number;
  assignedByUserId?: number;
  requiresApproval: boolean;
  approvedByUserId?: number;
  approvedAt?: string; // ISO date string
  createdAt: string; // ISO date string
  updatedAt?: string; // ISO date string
  completedAt?: string; // ISO date string
  // Navigation properties
  assignedToFamilyMember?: FamilyMemberDTO;
  assignedByUser?: User;
  approvedByUser?: User;
  family?: FamilyDTO;
}

/**
 * Task Assignment DTO - matches backend TaskAssignmentDTO
 */
export interface TaskAssignmentDTO {
  taskId: number;
  assignToUserId: number;
  requiresApproval: boolean;
}

/**
 * Flexible Task Assignment DTO - matches backend FlexibleTaskAssignmentDTO
 */
export interface FlexibleTaskAssignmentDTO {
  taskId: number;
  assignToUserId: number | string;
  requiresApproval: boolean;
  memberId: number | string;
  userId: number | string;
}

/**
 * Task Approval DTO - matches backend TaskApprovalDTO
 */
export interface TaskApprovalDTO {
  taskId: number;
  approvalComment?: string;
}

/**
 * Family Task Statistics
 */
export interface FamilyTaskStats {
  totalTasks: number;
  completedTasks: number;
  totalPoints: number;
  memberStats: FamilyMemberTaskStats[];
}

export interface FamilyMemberTaskStats {
  memberId: number;
  memberName: string;
  tasksCompleted: number;
  pointsEarned: number;
  tasksAssigned: number;
  completionRate: number;
}

// === EXISTING TYPES (UNCHANGED) ===

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
  user: User | null;
  initialData: {
    tasks: Task[];
    categories: TaskCategory[];
    stats: TaskStats;
  };
}

// Form data types (inferred from Zod schemas)
export interface CreateTaskFormData {
  title: string;
  description?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  dueDate?: string;
  categoryId?: number;
  estimatedTimeMinutes?: number;
  pointsValue?: number;
  familyId?: number;
  assignedToUserId?: number;
  requiresApproval?: boolean;
  tags?: string[];
}

export interface UpdateTaskFormData {
  title?: string;
  description?: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Urgent';
  dueDate?: string;
  categoryId?: number;
  estimatedTimeMinutes?: number;
  pointsValue?: number;
  assignedToUserId?: number;
  tags?: string[];
}

export interface CompleteTaskFormData {
  taskId: number;
  actualTimeMinutes?: number;
  completionNotes?: string;
}

export interface CreateTaskCategoryFormData {
  name: string;
  color: string;
  icon?: string;
  description?: string;
}

export interface TaskFilterFormData {
  priority?: 'Low' | 'Medium' | 'High' | 'Urgent';
  isCompleted?: boolean;
  categoryId?: number;
  assignedToUserId?: number;
  dueBefore?: string;
  dueAfter?: string;
  tags?: string[];
  search?: string;
}

export interface TaskCreationModalProps {
  user: User;
  family?: FamilyDTO | null;
  onTaskCreated?: (task: Task) => void;
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

// === CACHE & API TYPES ===

/**
 * Cache entry structure for TaskService
 */
export interface TaskServiceCacheEntry {
  data: Task[] | TaskStats | FamilyTaskItemDTO[] | FamilyTaskStats | unknown;
  timestamp: number;
}

/**
 * Generic API response that can contain tasks in various formats
 */
export interface FlexibleApiResponse {
  data?: Task[];
  items?: Task[];
  tasks?: Task[];
  [key: string]: unknown;
}

/**
 * Type-safe response handler for task API responses
 */
export type TaskApiResponseType = ApiResponse<Task[]> | Task[] | FlexibleApiResponse; 