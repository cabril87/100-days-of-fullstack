/*
 * Board Schemas - Centralized board form validation schemas
 * Copyright (c) 2025 Carlos Abril Jr
 */

import { z } from 'zod';

// === BOARD MANAGEMENT SCHEMAS ===

export const editBoardSchema = z.object({
  name: z.string().min(1, 'Board name is required'),
  description: z.string().optional(),
  isPublic: z.boolean(),
  tags: z.array(z.string()),
});

export const columnEditSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, 'Column name is required'),
  description: z.string().optional(),
  position: z.number(),
  color: z.string().optional(),
  isDefault: z.boolean(),
});

export const createCustomBoardSchema = z.object({
  name: z.string().min(1, 'Board name is required'),
  description: z.string().optional(),
  columns: z.array(z.string().min(1, 'Column name is required')).min(1, 'At least one column is required'),
  isPublic: z.boolean(),
  tags: z.array(z.string()),
});

export const createBoardTaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  dueDate: z.string().optional(),
  assignedToId: z.number().optional(),
  boardId: z.number(),
  columnId: z.number(),
  tags: z.array(z.string()),
  estimatedHours: z.number().min(0).optional(),
  pointsValue: z.number().min(0).optional(),
});

// === DERIVED TYPES ===

export type EditBoardFormData = z.infer<typeof editBoardSchema>;
export type ColumnEditFormData = z.infer<typeof columnEditSchema>;
export type CreateCustomBoardFormData = z.infer<typeof createCustomBoardSchema>;
export type CreateBoardTaskFormData = z.infer<typeof createBoardTaskSchema>;