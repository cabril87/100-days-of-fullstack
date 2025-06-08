/*
 * Task Zod Validation Schemas
 * Copyright (c) 2025 Carlos Abril Jr
 */

import { z } from 'zod';

/**
 * Schema for creating a new task
 */
export const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().optional(),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent'], {
    required_error: 'Please select a priority level'
  }),
  dueDate: z.string().optional(),
  categoryId: z.number().optional(),
  estimatedTimeMinutes: z.number().min(1, 'Estimated time must be at least 1 minute').max(1440, 'Estimated time cannot exceed 24 hours').optional(),
  pointsValue: z.number().min(1, 'Points must be at least 1').max(1000, 'Points cannot exceed 1000').optional(),
  familyId: z.number().optional(),
  assignedToUserId: z.number().optional(),
  tags: z.array(z.string()).optional()
});

/**
 * Schema for updating an existing task
 */
export const updateTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(200, 'Title must be less than 200 characters').optional(),
  description: z.string().optional(),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']).optional(),
  dueDate: z.string().optional(),
  categoryId: z.number().optional(),
  estimatedTimeMinutes: z.number().min(1, 'Estimated time must be at least 1 minute').max(1440, 'Estimated time cannot exceed 24 hours').optional(),
  pointsValue: z.number().min(1, 'Points must be at least 1').max(1000, 'Points cannot exceed 1000').optional(),
  assignedToUserId: z.number().optional(),
  tags: z.array(z.string()).optional()
});

/**
 * Schema for task completion
 */
export const completeTaskSchema = z.object({
  taskId: z.number().min(1, 'Valid task ID is required'),
  actualTimeMinutes: z.number().min(1, 'Actual time must be at least 1 minute').optional(),
  completionNotes: z.string().max(500, 'Completion notes must be less than 500 characters').optional()
});

/**
 * Schema for creating a task category
 */
export const createTaskCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(50, 'Category name must be less than 50 characters'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color'),
  icon: z.string().max(50, 'Icon name must be less than 50 characters').optional(),
  description: z.string().max(200, 'Description must be less than 200 characters').optional()
});

/**
 * Schema for task filters
 */
export const taskFilterSchema = z.object({
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']).optional(),
  isCompleted: z.boolean().optional(),
  categoryId: z.number().optional(),
  assignedToUserId: z.number().optional(),
  dueBefore: z.string().optional(),
  dueAfter: z.string().optional(),
  tags: z.array(z.string()).optional(),
  search: z.string().max(100, 'Search term must be less than 100 characters').optional()
}); 