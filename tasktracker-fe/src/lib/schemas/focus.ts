/*
 * Focus Sessions Validation Schemas
 * Enterprise Zod validation schemas for forms and data validation
 * Copyright (c) 2025 TaskTracker Enterprise
 * Following FAMILY-AUTH-IMPLEMENTATION-CHECKLIST.md standards
 */

import { z } from 'zod';
import { DISTRACTION_CATEGORIES } from '@/lib/types/focus';

// ================================
// BASE VALIDATION SCHEMAS
// ================================

/**
 * Focus session status validation
 */
export const focusSessionStatusSchema = z.enum(['InProgress', 'Completed', 'Interrupted', 'Paused']);

/**
 * Distraction category validation
 */
export const distractionCategorySchema = z.enum(DISTRACTION_CATEGORIES);

/**
 * Session quality rating validation (1-5 stars)
 */
export const sessionQualityRatingSchema = z.number()
  .min(1, 'Rating must be at least 1 star')
  .max(5, 'Rating cannot exceed 5 stars')
  .int('Rating must be a whole number');

/**
 * Progress percentage validation (0-100)
 */
export const progressPercentageSchema = z.number()
  .min(0, 'Progress cannot be negative')
  .max(100, 'Progress cannot exceed 100%')
  .int('Progress must be a whole number');

/**
 * Duration in minutes validation
 */
export const durationMinutesSchema = z.number()
  .min(1, 'Duration must be at least 1 minute')
  .max(480, 'Duration cannot exceed 8 hours') // 8 hours max
  .int('Duration must be a whole number');

// ================================
// CREATE FOCUS SESSION SCHEMA
// ================================

export const createFocusSessionSchema = z.object({
  taskId: z.number({
    required_error: 'Task is required',
    invalid_type_error: 'Task ID must be a number'
  }).positive('Task ID must be positive'),
  
  durationMinutes: durationMinutesSchema.optional().default(25),
  
  notes: z.string()
    .max(500, 'Notes cannot exceed 500 characters')
    .optional(),
    
  forceStart: z.boolean()
    .optional()
    .default(false)
});

export type CreateFocusSessionFormData = z.infer<typeof createFocusSessionSchema>;

// ================================
// COMPLETE FOCUS SESSION SCHEMA
// ================================

export const completeFocusSessionSchema = z.object({
  sessionQualityRating: sessionQualityRatingSchema,
  
  completionNotes: z.string()
    .max(1000, 'Completion notes cannot exceed 1000 characters')
    .optional(),
    
  taskProgressAfter: progressPercentageSchema,
  
  taskCompletedDuringSession: z.boolean()
});

export type CompleteFocusSessionFormData = z.infer<typeof completeFocusSessionSchema>;

// ================================
// DISTRACTION RECORDING SCHEMA
// ================================

export const createDistractionSchema = z.object({
  sessionId: z.number({
    required_error: 'Session ID is required',
    invalid_type_error: 'Session ID must be a number'
  }).positive('Session ID must be positive'),
  
  description: z.string({
    required_error: 'Description is required'
  })
    .min(1, 'Description cannot be empty')
    .max(200, 'Description cannot exceed 200 characters')
    .trim(),
    
  category: distractionCategorySchema
});

export type CreateDistractionFormData = z.infer<typeof createDistractionSchema>;

// ================================
// TASK SELECTION SCHEMA
// ================================

export const taskSelectionSchema = z.object({
  taskId: z.number({
    required_error: 'Task selection is required'
  }).positive('Task ID must be positive'),
  
  notes: z.string()
    .max(500, 'Session notes cannot exceed 500 characters')
    .optional(),
    
  estimatedDuration: durationMinutesSchema.optional().default(25)
});

export type TaskSelectionFormData = z.infer<typeof taskSelectionSchema>;

// ================================
// FOCUS ANALYTICS FILTER SCHEMA
// ================================

export const focusAnalyticsFilterSchema = z.object({
  startDate: z.date({
    required_error: 'Start date is required',
    invalid_type_error: 'Start date must be a valid date'
  }),
  
  endDate: z.date({
    required_error: 'End date is required',
    invalid_type_error: 'End date must be a valid date'
  }),
  
  includeDistractions: z.boolean().optional().default(true),
  
  minSessionDuration: z.number()
    .min(1, 'Minimum duration must be at least 1 minute')
    .optional(),
    
  maxSessionDuration: z.number()
    .max(480, 'Maximum duration cannot exceed 8 hours')
    .optional(),
    
  qualityRating: z.array(sessionQualityRatingSchema).optional(),
  
  status: z.array(focusSessionStatusSchema).optional()
}).refine(
  (data) => data.startDate <= data.endDate,
  {
    message: 'End date must be after start date',
    path: ['endDate']
  }
).refine(
  (data) => !data.minSessionDuration || !data.maxSessionDuration || data.minSessionDuration <= data.maxSessionDuration,
  {
    message: 'Maximum duration must be greater than minimum duration',
    path: ['maxSessionDuration']
  }
);

export type FocusAnalyticsFilterFormData = z.infer<typeof focusAnalyticsFilterSchema>;

// ================================
// MOBILE FOCUS SETTINGS SCHEMA
// ================================

export const mobileFocusSettingsSchema = z.object({
  hapticFeedback: z.boolean().default(true),
  
  voiceCommands: z.boolean().default(false),
  
  gestureControls: z.boolean().default(true),
  
  orientationLock: z.boolean().default(false),
  
  preventSleep: z.boolean().default(true),
  
  notificationsDuringSession: z.boolean().default(false),
  
  autoBreakReminders: z.boolean().default(true),
  
  breakReminderInterval: z.number()
    .min(15, 'Break reminder interval must be at least 15 minutes')
    .max(120, 'Break reminder interval cannot exceed 2 hours')
    .default(25)
});

export type MobileFocusSettingsFormData = z.infer<typeof mobileFocusSettingsSchema>;

// ================================
// FOCUS PREFERENCES SCHEMA
// ================================

export const focusPreferencesSchema = z.object({
  defaultSessionDuration: durationMinutesSchema.default(25),
  
  autoStartBreaks: z.boolean().default(false),
  
  breakDuration: z.number()
    .min(1, 'Break duration must be at least 1 minute')
    .max(30, 'Break duration cannot exceed 30 minutes')
    .default(5),
    
  longBreakInterval: z.number()
    .min(2, 'Long break interval must be at least 2 sessions')
    .max(10, 'Long break interval cannot exceed 10 sessions')
    .default(4),
    
  longBreakDuration: z.number()
    .min(10, 'Long break duration must be at least 10 minutes')
    .max(60, 'Long break duration cannot exceed 1 hour')
    .default(15),
    
  soundNotifications: z.boolean().default(true),
  
  visualNotifications: z.boolean().default(true),
  
  showTaskProgress: z.boolean().default(true),
  
  autoCompleteTasksAt100: z.boolean().default(false),
  
  trackDistractions: z.boolean().default(true),
  
  requireCompletionNotes: z.boolean().default(false),
  
  minimumQualityRating: sessionQualityRatingSchema.optional(),
  
  weeklyFocusGoal: z.number()
    .min(60, 'Weekly focus goal must be at least 1 hour')
    .max(2400, 'Weekly focus goal cannot exceed 40 hours')
    .default(300) // 5 hours default
});

export type FocusPreferencesFormData = z.infer<typeof focusPreferencesSchema>;

// ================================
// FOCUS SESSION SEARCH SCHEMA
// ================================

export const focusSessionSearchSchema = z.object({
  query: z.string()
    .max(100, 'Search query cannot exceed 100 characters')
    .optional(),
    
  filters: z.object({
    dateRange: z.object({
      start: z.date(),
      end: z.date()
    }).optional(),
    
    taskId: z.number().positive().optional(),
    
    status: z.array(focusSessionStatusSchema).optional(),
    
    minDuration: z.number().min(1).optional(),
    
    maxDuration: z.number().max(480).optional(),
    
    qualityRating: z.array(sessionQualityRatingSchema).optional(),
    
    hasDistractions: z.boolean().optional(),
    
    completedTask: z.boolean().optional()
  }).optional(),
  
  sortBy: z.enum(['startTime', 'duration', 'qualityRating', 'taskTitle'])
    .default('startTime'),
    
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  
  limit: z.number()
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .default(20),
    
  offset: z.number()
    .min(0, 'Offset cannot be negative')
    .default(0)
});

export type FocusSessionSearchFormData = z.infer<typeof focusSessionSearchSchema>;

// ================================
// VALIDATION HELPER FUNCTIONS
// ================================

/**
 * Validate session duration based on preferences
 */
export const validateSessionDuration = (duration: number, preferences?: FocusPreferencesFormData) => {
  const schema = preferences?.defaultSessionDuration 
    ? durationMinutesSchema.max(preferences.defaultSessionDuration * 3, `Duration cannot exceed 3x your default session length (${preferences.defaultSessionDuration * 3} minutes)`)
    : durationMinutesSchema;
    
  return schema.safeParse(duration);
};

/**
 * Validate task progress update
 */
export const validateProgressUpdate = (currentProgress: number, newProgress: number) => {
  if (newProgress < currentProgress) {
    return {
      success: false,
      error: { message: 'Progress cannot decrease during a focus session' }
    } as const;
  }
  
  return progressPercentageSchema.safeParse(newProgress);
};

/**
 * Validate session completion requirements
 */
export const validateSessionCompletion = (
  session: { durationMinutes: number; status: string },
  completion: CompleteFocusSessionFormData,
  preferences?: FocusPreferencesFormData
) => {
  const errors: string[] = [];
  
  // Check minimum session duration (at least 1 minute)
  if (session.durationMinutes < 1) {
    errors.push('Session must be at least 1 minute long to complete');
  }
  
  // Check minimum quality rating if set in preferences
  if (preferences?.minimumQualityRating && completion.sessionQualityRating < preferences.minimumQualityRating) {
    errors.push(`Quality rating must be at least ${preferences.minimumQualityRating} stars based on your preferences`);
  }
  
  // Check completion notes requirement
  if (preferences?.requireCompletionNotes && !completion.completionNotes?.trim()) {
    errors.push('Completion notes are required based on your preferences');
  }
  
  return {
    success: errors.length === 0,
    errors
  };
}; 