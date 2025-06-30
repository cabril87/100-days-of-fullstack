// Calendar Form Validation Schemas
// Following Enterprise Standards - Zod validation for calendar forms
// Copyright (c) 2025 TaskTracker Enterprise

import { z } from 'zod';

// ============================================================================
// EVENT FORM VALIDATION SCHEMA
// ============================================================================

export const eventFormSchema = z.object({
  title: z.string().min(1, 'Event title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endDate: z.string().min(1, 'End date is required'),
  endTime: z.string().min(1, 'End time is required'),
  color: z.string().min(1, 'Color is required'),
  location: z.string().optional(),
  isAllDay: z.boolean(),
  isRecurring: z.boolean(),
  recurringPattern: z.enum(['weekly', 'monthly', 'yearly']).optional(),
}).refine((data) => {
  // Validate that end date/time is after start date/time
  const startDateTime = new Date(`${data.startDate}T${data.startTime}`);
  const endDateTime = new Date(`${data.endDate}T${data.endTime}`);
  return endDateTime > startDateTime;
}, {
  message: 'End date and time must be after start date and time',
  path: ['endDate']
});

// ============================================================================
// TASK FORM VALIDATION SCHEMA
// ============================================================================

export const taskFormSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().optional(),
  dueDate: z.string().min(1, 'Due date is required')
    .refine((date) => {
      // Prevent past dates for tasks (following established pattern)
      const taskDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of today
      return taskDate >= today;
    }, 'Tasks cannot be scheduled for past dates'),
  dueTime: z.string().min(1, 'Due time is required'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  estimatedHours: z.number().min(0.5, 'Minimum 0.5 hours').max(24, 'Maximum 24 hours'),
  pointsValue: z.number().min(1, 'Minimum 1 point').max(100, 'Maximum 100 points'),
  taskType: z.enum(['personal', 'family']),
  selectedFamilyId: z.number().optional(),
  assignedToUserId: z.number().optional(),
});

// ============================================================================
// INFERRED TYPES FOR COMPONENTS
// ============================================================================

export type EventFormData = z.infer<typeof eventFormSchema>;
export type TaskFormData = z.infer<typeof taskFormSchema>; 