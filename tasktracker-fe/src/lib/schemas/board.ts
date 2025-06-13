/*
 * Board Zod Validation Schemas
 * Copyright (c) 2025 Carlos Abril Jr
 */

import { z } from 'zod';
import { TaskItemStatus } from '../types/task';

/**
 * Schema for creating a new board
 */
export const createBoardSchema = z.object({
  name: z.string().min(1, 'Board name is required').max(100, 'Board name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  template: z.string().optional(),
  enableAnimations: z.boolean().default(true),
  enableGamification: z.boolean().default(true),
  enableSoundEffects: z.boolean().default(false),
  theme: z.enum(['default', 'neon', 'glass', 'gradient']).default('default'),
});

/**
 * Schema for updating a board
 */
export const updateBoardSchema = z.object({
  name: z.string().min(1, 'Board name is required').max(100, 'Board name must be less than 100 characters').optional(),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  enableAnimations: z.boolean().optional(),
  enableGamification: z.boolean().optional(),
  enableSoundEffects: z.boolean().optional(),
  theme: z.enum(['default', 'neon', 'glass', 'gradient']).optional(),
});

/**
 * Schema for creating board columns
 */
export const createBoardColumnSchema = z.object({
  name: z.string().min(1, 'Column name is required').max(50, 'Column name must be less than 50 characters'),
  order: z.number().min(0, 'Order must be at least 0'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color').optional(),
  status: z.nativeEnum(TaskItemStatus, {
    required_error: 'Please select a valid status'
  }),
  maxTasks: z.number().min(1, 'Max tasks must be at least 1').optional(),
  allowedTransitions: z.array(z.nativeEnum(TaskItemStatus)).optional(),
  requiresApproval: z.boolean().default(false),
  autoAssign: z.boolean().default(false),
});

/**
 * Schema for updating board columns
 */
export const updateBoardColumnSchema = z.object({
  id: z.number().min(1, 'Valid column ID is required').optional(),
  name: z.string().min(1, 'Column name is required').max(50, 'Column name must be less than 50 characters').optional(),
  order: z.number().min(0, 'Order must be at least 0').optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color').optional(),
  status: z.nativeEnum(TaskItemStatus).optional(),
  maxTasks: z.number().min(1, 'Max tasks must be at least 1').optional(),
  allowedTransitions: z.array(z.nativeEnum(TaskItemStatus)).optional(),
  requiresApproval: z.boolean().optional(),
  autoAssign: z.boolean().optional(),
});

/**
 * Schema for task reordering in boards
 */
export const taskReorderSchema = z.object({
  taskId: z.number().min(1, 'Valid task ID is required'),
  newStatus: z.nativeEnum(TaskItemStatus, {
    required_error: 'Please select a valid status'
  }),
  newOrder: z.number().min(0, 'Order must be at least 0'),
  boardId: z.number().min(1, 'Valid board ID is required'),
  fromColumnId: z.number().min(1, 'Valid source column ID is required'),
  toColumnId: z.number().min(1, 'Valid target column ID is required'),
});

/**
 * Schema for drag and drop validation
 */
export const dragDropValidationSchema = z.object({
  taskId: z.number().min(1, 'Valid task ID is required'),
  sourceColumnId: z.number().min(1, 'Valid source column ID is required'),
  targetColumnId: z.number().min(1, 'Valid target column ID is required'),
  targetStatus: z.nativeEnum(TaskItemStatus),
  validateTransition: z.boolean().default(true),
  checkMaxTasks: z.boolean().default(true),
  requireApproval: z.boolean().default(false),
});

/**
 * Schema for board template selection
 */
export const boardTemplateSchema = z.object({
  templateName: z.string().min(1, 'Template name is required'),
  category: z.enum(['basic', 'family', 'education', 'health', 'events', 'financial', 'seasonal']),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  customizations: z.object({
    boardName: z.string().min(1, 'Board name is required').max(100),
    boardDescription: z.string().max(500).optional(),
    columnCustomizations: z.array(z.object({
      columnName: z.string().min(1).max(50),
      color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
      maxTasks: z.number().min(1).optional(),
    })).optional(),
  }),
});

/**
 * Schema for gamification settings
 */
export const gamificationSettingsSchema = z.object({
  enableAnimations: z.boolean().default(true),
  enableSoundEffects: z.boolean().default(false),
  enableParticleEffects: z.boolean().default(true),
  enableHapticFeedback: z.boolean().default(false),
  animationSpeed: z.enum(['slow', 'normal', 'fast']).default('normal'),
  theme: z.enum(['default', 'neon', 'glass', 'gradient']).default('default'),
  showProgressIndicators: z.boolean().default(true),
  showAchievementNotifications: z.boolean().default(true),
});

/**
 * Schema for column configuration
 */
export const columnConfigurationSchema = z.object({
  allowedTransitions: z.array(z.nativeEnum(TaskItemStatus)).min(1, 'At least one transition must be allowed'),
  maxTasks: z.number().min(1, 'Max tasks must be at least 1').optional(),
  autoAssign: z.boolean().default(false),
  requiresApproval: z.boolean().default(false),
  notificationSettings: z.object({
    onTaskEnter: z.boolean().default(false),
    onTaskExit: z.boolean().default(false),
    onOverflow: z.boolean().default(true),
  }).optional(),
  workflowRules: z.array(z.object({
    condition: z.string(),
    action: z.string(),
    enabled: z.boolean().default(true),
  })).optional(),
});

/**
 * Schema for board analytics and metrics
 */
export const boardAnalyticsSchema = z.object({
  boardId: z.number().min(1, 'Valid board ID is required'),
  dateRange: z.object({
    startDate: z.date(),
    endDate: z.date(),
  }),
  metrics: z.array(z.enum([
    'task_completion_rate',
    'average_task_duration',
    'column_throughput',
    'bottleneck_analysis',
    'team_productivity',
    'workflow_efficiency'
  ])).min(1, 'At least one metric must be selected'),
  groupBy: z.enum(['day', 'week', 'month', 'quarter']).default('week'),
  includeArchived: z.boolean().default(false),
});

/**
 * Form data types derived from schemas
 */
export type CreateBoardFormData = z.infer<typeof createBoardSchema>;
export type UpdateBoardFormData = z.infer<typeof updateBoardSchema>;
export type CreateBoardColumnFormData = z.infer<typeof createBoardColumnSchema>;
export type UpdateBoardColumnFormData = z.infer<typeof updateBoardColumnSchema>;
export type TaskReorderFormData = z.infer<typeof taskReorderSchema>;
export type DragDropValidationFormData = z.infer<typeof dragDropValidationSchema>;
export type BoardTemplateFormData = z.infer<typeof boardTemplateSchema>;
export type GamificationSettingsFormData = z.infer<typeof gamificationSettingsSchema>;
export type ColumnConfigurationFormData = z.infer<typeof columnConfigurationSchema>;
export type BoardAnalyticsFormData = z.infer<typeof boardAnalyticsSchema>; 