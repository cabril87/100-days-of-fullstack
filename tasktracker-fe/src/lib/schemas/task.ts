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
  requiresApproval: z.boolean().optional(),
  tags: z.array(z.string()).optional()
});

/**
 * Enhanced Task Creation Schema with Template and Context Support
 * Used by TaskCreationModal component
 */
export const taskCreationSchema = z.object({
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
  requiresApproval: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  // Enhanced fields for TaskCreationModal
  taskContext: z.enum(['individual', 'family', 'template']).optional(),
  saveAsTemplate: z.boolean().optional(),
  templateName: z.string().max(100, 'Template name must be less than 100 characters').optional(),
  templateCategory: z.string().max(50, 'Template category must be less than 50 characters').optional(),
  isPublicTemplate: z.boolean().optional()
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

// === FAMILY TASK SCHEMAS (Following Checklist Rules) ===

/**
 * Schema for assigning task to family member
 */
export const taskAssignmentSchema = z.object({
  taskId: z.number().min(1, 'Valid task ID is required'),
  assignToUserId: z.number().min(1, 'Valid user ID is required'),
  requiresApproval: z.boolean().default(false)
});

/**
 * Schema for flexible task assignment (matching backend DTO)
 */
export const flexibleTaskAssignmentSchema = z.object({
  taskId: z.number().min(1, 'Valid task ID is required'),
  assignToUserId: z.union([z.number(), z.string()]).refine(
    (val) => typeof val === 'number' ? val > 0 : !isNaN(Number(val)) && Number(val) > 0,
    'Valid user ID is required'
  ),
  requiresApproval: z.boolean().default(false),
  memberId: z.union([z.number(), z.string()]).refine(
    (val) => typeof val === 'number' ? val > 0 : !isNaN(Number(val)) && Number(val) > 0,
    'Valid member ID is required'
  ),
  userId: z.union([z.number(), z.string()]).refine(
    (val) => typeof val === 'number' ? val > 0 : !isNaN(Number(val)) && Number(val) > 0,
    'Valid user ID is required'
  )
});

/**
 * Schema for task approval
 */
export const taskApprovalSchema = z.object({
  taskId: z.number().min(1, 'Valid task ID is required'),
  approvalComment: z.string().max(500, 'Approval comment must be less than 500 characters').optional()
});

/**
 * Schema for family task creation (extends regular task with family-specific fields)
 */
export const createFamilyTaskSchema = createTaskSchema.extend({
  familyId: z.number().min(1, 'Valid family ID is required'),
  assignedToUserId: z.number().min(1, 'Valid assignee user ID is required').optional(),
  requiresApproval: z.boolean().default(false)
});

/**
 * Schema for family task filters (extends regular filters)
 */
export const familyTaskFilterSchema = taskFilterSchema.extend({
  familyId: z.number().min(1, 'Valid family ID is required'),
  assignedToFamilyMemberId: z.number().optional(),
  requiresApproval: z.boolean().optional(),
  approvalStatus: z.enum(['pending', 'approved', 'not_required']).optional()
});

// === BOARD TASK SCHEMAS ===

/**
 * Schema for creating tasks in boards
 */
export const createTaskItemSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent'], {
    required_error: 'Please select a priority level'
  }),
  status: z.enum(['To Do', 'In Progress', 'Done', 'Backlog', 'Review'], {
    required_error: 'Please select a status'
  }),
  dueDate: z.string().optional(),
  points: z.number().min(0, 'Points must be at least 0').max(1000, 'Points cannot exceed 1000').optional(),
  tags: z.array(z.string()).optional(),
  boardId: z.number().min(1, 'Valid board ID is required').optional(),
  categoryId: z.number().optional(),
  estimatedTimeMinutes: z.number().min(1, 'Estimated time must be at least 1 minute').max(1440, 'Estimated time cannot exceed 24 hours').optional()
}); 