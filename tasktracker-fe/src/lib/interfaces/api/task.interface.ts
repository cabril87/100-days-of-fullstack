/*
 * Task API Interfaces - Moved from lib/types/task.ts for .cursorrules compliance
 * lib/interfaces/api/task.interface.ts
 * Copyright (c) 2025 Carlos Abril Jr
 */

import { User } from '@/lib/types/auth';
import { FamilyDTO, FamilyMemberDTO } from '@/lib/types/family';

// === TASK ENUMS (Re-exported for convenience) ===
import { TaskPriority, TaskItemStatus } from '@/lib/types/tasks';

// === TASK DTO INTERFACES ===

export interface TaskItemResponseDTO {
  id: number;
  title: string;
  description?: string;
  status: string;
  priority: TaskPriority;
  dueDate?: string; // ISO date string
  createdAt: string; // ISO date string
  updatedAt?: string; // ISO date string
  completedAt?: string; // ISO date string
  categoryId?: number;
  categoryName?: string;
  userId: number;
  tags?: TagDto[];
  estimatedMinutes?: number;
  actualMinutes?: number;
  isStarred?: boolean;
  isRecurring?: boolean;
  recurrencePattern?: string;
  boardPosition?: number;
  boardColumn?: string;
  boardId?: number;
  assignedToUserId?: number;
  assignedToUserName?: string;
  // Board-specific properties
  points?: number;
  pointsValue?: number;
  pointsEarned?: number;
  // Task source tracking for quest selection
  taskSource?: 'individual' | 'family' | 'assigned';
}

export interface CreateTaskItemDTO {
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskItemStatus;
  dueDate?: string; // ISO date string
  points?: number;
  tags?: string[];
  boardId?: number;
  categoryId?: number;
  estimatedTimeMinutes?: number;
  familyId?: number;
  assignedToUserId?: number;
}

export interface TagDto {
  id: number;
  name: string;
  color: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: TaskItemStatus;
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
  tags?: TagDto[];
  version?: number; // For optimistic concurrency control
}

// === FAMILY TASK DTO INTERFACES ===

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

export interface TaskAssignmentDTO {
  taskId: number;
  assignToUserId: number;
  requiresApproval: boolean;
}

export interface FlexibleTaskAssignmentDTO {
  taskId: number;
  assignToUserId: number | string;
  requiresApproval: boolean;
  memberId: number | string;
  userId: number | string;
}

export interface TaskApprovalDTO {
  taskId: number;
  approvalComment?: string;
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
  version?: number; // For optimistic concurrency control
  boardId?: number; // Board assignment field
  status?: TaskItemStatus; // Task status field for board assignment
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

export interface TaskServiceCacheEntry {
  data: Task[] | TaskStats | FamilyTaskItemDTO[] | unknown;
  timestamp: number;
}

export interface FlexibleApiResponse {
  data?: Task[];
  items?: Task[];
  tasks?: Task[];
  [key: string]: unknown;
}

export interface ChecklistItem {
  id: number;
  taskId: number;
  title: string;
  description?: string;
  isCompleted: boolean;
  order: number;
  createdAt: Date;
  updatedAt?: Date;
  completedAt?: Date;
}

export interface CreateChecklistItem {
  title: string;
  description?: string;
  isCompleted: boolean;
  order: number;
}

export interface TaskTimeTracking {
  taskId: number;
  estimatedTimeMinutes: number;
  actualTimeMinutes: number;
  timeSpent: number;
  timeRemaining: number;
  sessions: TimeTrackingSession[];
  startedAt?: Date;
  pausedAt?: Date;
  isPaused: boolean;
  totalBreakTime: number;
}

export interface TimeTrackingSession {
  id: number;
  taskId: number;
  startTime: Date;
  endTime?: Date;
  duration: number; // in minutes
  description?: string;
  createdAt: Date;
}

export interface TaskProgressUpdate {
  progressPercentage: number;
  notes?: string;
  milestones?: string[];
  blockers?: string[];
}

export interface BatchTaskOperation {
  operation: 'create' | 'update' | 'delete' | 'complete' | 'assign';
  tasks?: Task[];
  taskIds?: number[];
  data?: Record<string, unknown>;
}

export interface BatchTaskResult {
  success: boolean;
  message: string;
  created?: Task[];
  updated?: Task[];
  deleted?: number[];
  completed?: number[];
  failed?: BatchTaskError[];
}

export interface BatchTaskError {
  index: number;
  task: Partial<Task> | CreateTaskDTO;
  error: string;
}

export interface TaskDetailData {
  task: Task;
  checklist: ChecklistItem[];
  timeTracking: TaskTimeTracking | null;
  tags: TagDto[];
  isLoading: boolean;
  error?: string;
}

export type TaskApiResponseType = ApiResponse<Task[]> | Task[] | FlexibleApiResponse; 
