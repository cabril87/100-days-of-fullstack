/*
 * Board Zod Validation Schemas
 * Copyright (c) 2025 Carlos Abril Jr
 */

import { z } from 'zod';

/**
 * Schema for creating a new board
 */
export const createBoardSchema = z.object({
  name: z.string().min(1, 'Board name is required').max(100, 'Board name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
});

/**
 * Schema for updating a board
 */
export const updateBoardSchema = z.object({
  name: z.string().min(1, 'Board name is required').max(100, 'Board name must be less than 100 characters').optional(),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
});

/**
 * Schema for creating board columns
 */
export const createBoardColumnSchema = z.object({
  name: z.string().min(1, 'Column name is required').max(50, 'Column name must be less than 50 characters'),
  order: z.number().min(0, 'Order must be at least 0'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color').optional(),
  status: z.enum(['To Do', 'In Progress', 'Done', 'Backlog', 'Review'], {
    required_error: 'Please select a status'
  })
});

/**
 * Schema for updating board columns
 */
export const updateBoardColumnSchema = z.object({
  id: z.number().min(1, 'Valid column ID is required').optional(),
  name: z.string().min(1, 'Column name is required').max(50, 'Column name must be less than 50 characters').optional(),
  order: z.number().min(0, 'Order must be at least 0').optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color').optional(),
  status: z.enum(['To Do', 'In Progress', 'Done', 'Backlog', 'Review']).optional()
});

/**
 * Schema for task reordering in boards
 */
export const taskReorderSchema = z.object({
  taskId: z.number().min(1, 'Valid task ID is required'),
  newStatus: z.enum(['To Do', 'In Progress', 'Done', 'Backlog', 'Review'], {
    required_error: 'Please select a status'
  }),
  newOrder: z.number().min(0, 'Order must be at least 0'),
  boardId: z.number().min(1, 'Valid board ID is required')
}); 