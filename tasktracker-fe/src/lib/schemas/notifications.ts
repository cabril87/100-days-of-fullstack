/*
 * Notification Schemas - Zod validation schemas for notification forms
 * Copyright (c) 2025 Carlos Abril Jr
 */

import { z } from 'zod';

// Notification creation schema
export const createNotificationSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be 200 characters or less'),
  message: z.string()
    .min(1, 'Message is required')
    .max(1000, 'Message must be 1000 characters or less'),
  notificationType: z.string()
    .min(1, 'Notification type is required'),
  isImportant: z.boolean().optional(),
  relatedEntityId: z.number().optional(),
  relatedEntityType: z.string().optional()
});

// Notification preferences schema
export const notificationPreferenceSchema = z.object({
  notificationType: z.string()
    .min(1, 'Notification type is required'),
  enabled: z.boolean(),
  priority: z.enum(['Low', 'Normal', 'High', 'Critical']),
  familyId: z.number().optional(),
  enableEmailNotifications: z.boolean(),
  enablePushNotifications: z.boolean()
});

// Email notification settings schema
export const emailNotificationSettingsSchema = z.object({
  taskReminders: z.boolean(),
  achievementAlerts: z.boolean(),
  familyActivity: z.boolean(),
  securityAlerts: z.boolean(),
  weeklyDigest: z.boolean(),
  marketingEmails: z.boolean(),
  systemUpdates: z.boolean()
});

// Push notification settings schema
export const pushNotificationSettingsSchema = z.object({
  taskReminders: z.boolean(),
  achievementAlerts: z.boolean(),
  familyActivity: z.boolean(),
  securityAlerts: z.boolean(),
  immediateAlerts: z.boolean(),
  quietHours: z.boolean()
});

// Notification schedule schema
export const notificationScheduleSchema = z.object({
  startTime: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Start time must be in HH:mm format'),
  endTime: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'End time must be in HH:mm format'),
  timezone: z.string()
    .min(1, 'Timezone is required'),
  weekendsOnly: z.boolean(),
  customDays: z.array(z.number().min(0).max(6))
}).refine((data) => {
  // Validate that start time is before end time
  const [startHour, startMin] = data.startTime.split(':').map(Number);
  const [endHour, endMin] = data.endTime.split(':').map(Number);
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  return startMinutes < endMinutes;
}, {
  message: 'Start time must be before end time',
  path: ['endTime']
});

// Family notification settings schema
export const familyNotificationSettingsSchema = z.object({
  childTaskUpdates: z.boolean(),
  permissionRequests: z.boolean(),
  achievementSharing: z.boolean(),
  emergencyAlerts: z.boolean(),
  parentalControlChanges: z.boolean()
});

// Complete notification settings schema
export const notificationSettingsSchema = z.object({
  emailNotifications: emailNotificationSettingsSchema,
  pushNotifications: pushNotificationSettingsSchema,
  notificationSchedule: notificationScheduleSchema,
  familyNotifications: familyNotificationSettingsSchema
});

// Notification filter schema
export const notificationFilterSchema = z.object({
  isRead: z.boolean().optional(),
  isImportant: z.boolean().optional(),
  type: z.string().optional(),
  relatedEntityType: z.string().optional(),
  relatedEntityId: z.number().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  searchTerm: z.string().optional()
});

// Test notification schema
export const testNotificationSchema = z.object({
  notificationType: z.enum(['email', 'push'], {
    errorMap: () => ({ message: 'Notification type must be either email or push' })
  })
});

// Batch notification operation schema
export const batchNotificationSchema = z.object({
  notificationIds: z.array(z.number())
    .min(1, 'At least one notification must be selected'),
  action: z.enum(['markRead', 'markUnread', 'delete'], {
    errorMap: () => ({ message: 'Action must be markRead, markUnread, or delete' })
  })
});

// Export type inference helpers
export type CreateNotificationFormData = z.infer<typeof createNotificationSchema>;
export type NotificationPreferenceFormData = z.infer<typeof notificationPreferenceSchema>;
export type NotificationSettingsFormData = z.infer<typeof notificationSettingsSchema>;
export type NotificationFilterFormData = z.infer<typeof notificationFilterSchema>;
export type TestNotificationFormData = z.infer<typeof testNotificationSchema>;
export type BatchNotificationFormData = z.infer<typeof batchNotificationSchema>; 