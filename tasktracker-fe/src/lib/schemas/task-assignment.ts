/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 */

import { z } from 'zod';

/**
 * Task assignment type enum schema
 */
export const TaskAssignmentTypeSchema = z.enum(['Individual', 'FamilyMember', 'FamilyGroup']);

/**
 * Task assignment status enum schema
 */
export const TaskAssignmentStatusSchema = z.enum(['Pending', 'Accepted', 'Declined', 'Completed', 'Approved', 'Rejected']);

/**
 * Create task assignment schema
 */
export const createTaskAssignmentSchema = z.object({
  taskId: z.number().positive('Task ID must be a positive number'),
  assignedToUserId: z.number().positive('Assigned user ID must be a positive number'),
  notes: z.string().max(1000, 'Notes cannot exceed 1000 characters').optional(),
  requiresApproval: z.boolean().default(false),
  familyId: z.number().positive().optional(),
  familyMemberId: z.number().positive().optional(),
  assignmentType: TaskAssignmentTypeSchema.default('Individual')
});

/**
 * Batch assignment schema
 */
export const batchAssignmentSchema = z.object({
  taskIds: z.array(z.number().positive()).min(1, 'At least one task ID is required'),
  assignedToUserId: z.number().positive('Assigned user ID must be a positive number'),
  notes: z.string().max(1000, 'Notes cannot exceed 1000 characters').optional(),
  requiresApproval: z.boolean().default(false),
  familyId: z.number().positive().optional(),
  familyMemberId: z.number().positive().optional(),
  assignmentType: TaskAssignmentTypeSchema.default('Individual')
});

/**
 * Task assignment schema
 */
export const taskAssignmentSchema = z.object({
  id: z.number().positive(),
  taskId: z.number().positive(),
  assignedToUserId: z.number().positive(),
  assignedByUserId: z.number().positive(),
  assignedAt: z.string().datetime(),
  notes: z.string().max(1000).optional(),
  isAccepted: z.boolean(),
  acceptedAt: z.string().datetime().optional(),
  familyId: z.number().positive().optional(),
  familyMemberId: z.number().positive().optional(),
  assignedToUserName: z.string().optional(),
  assignedByUserName: z.string().optional(),
  taskTitle: z.string().optional(),
  taskDescription: z.string().optional(),
  taskDueDate: z.string().datetime().optional(),
  taskPriority: z.string().optional(),
  requiresApproval: z.boolean(),
  approvedByUserId: z.number().positive().optional(),
  approvedAt: z.string().datetime().optional(),
  approvalNotes: z.string().max(500).optional(),
  assignmentType: TaskAssignmentTypeSchema,
  status: TaskAssignmentStatusSchema
});

// Type exports
export type CreateTaskAssignmentFormData = z.infer<typeof createTaskAssignmentSchema>;
export type BatchAssignmentFormData = z.infer<typeof batchAssignmentSchema>;
export type TaskAssignmentFormData = z.infer<typeof taskAssignmentSchema>; 