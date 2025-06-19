/*
 * Settings & Security Validation Schemas - React Hook Form + Zod
 * Copyright (c) 2025 Carlos Abril Jr
 */

import { z } from 'zod';

// Email validation regex
const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// Security settings schema
export const securitySettingsSchema = z.object({
  mfaEnabled: z.boolean({
    required_error: 'MFA setting is required'
  }),
  
  sessionTimeout: z
    .number({
      required_error: 'Session timeout is required',
      invalid_type_error: 'Session timeout must be a number'
    })
    .min(15, 'Session timeout must be at least 15 minutes')
    .max(1440, 'Session timeout cannot exceed 24 hours (1440 minutes)')
    .int('Session timeout must be a whole number'),
  
  trustedDevicesEnabled: z.boolean({
    required_error: 'Trusted devices setting is required'
  }),
  
  loginNotifications: z.boolean({
    required_error: 'Login notifications setting is required'
  }),
  
  dataExportRequest: z.boolean({
    required_error: 'Data export request setting is required'
  })
});

// Notification preferences schema
export const notificationPreferencesSchema = z.object({
  emailNotifications: z.object({
    taskReminders: z.boolean(),
    achievementAlerts: z.boolean(),
    familyActivity: z.boolean(),
    securityAlerts: z.boolean(),
    weeklyDigest: z.boolean(),
    marketingEmails: z.boolean()
  }),
  
  pushNotifications: z.object({
    taskReminders: z.boolean(),
    achievementAlerts: z.boolean(),
    familyActivity: z.boolean(),
    securityAlerts: z.boolean(),
    immediateAlerts: z.boolean()
  }),
  
  notificationSchedule: z.object({
    startTime: z
      .string()
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Start time must be in HH:mm format'),
    
    endTime: z
      .string()
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'End time must be in HH:mm format'),
    
    timezone: z
      .string()
      .min(1, 'Timezone is required')
  })
}).refine((data) => {
  const [startHour, startMin] = data.notificationSchedule.startTime.split(':').map(Number);
  const [endHour, endMin] = data.notificationSchedule.endTime.split(':').map(Number);
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  return startMinutes < endMinutes;
}, {
  message: 'End time must be after start time',
  path: ['notificationSchedule', 'endTime']
});

// Privacy settings schema
export const privacySettingsSchema = z.object({
  profileVisibility: z
    .enum(['public', 'family', 'private'], {
      required_error: 'Profile visibility setting is required'
    })
    .default('family'),
  
  showProgressToFamily: z.boolean().default(true),
  showAchievementsToFamily: z.boolean().default(true),
  showLastActive: z.boolean().default(false),
  allowFamilyInvites: z.boolean().default(true),
  shareDataForImprovement: z.boolean().default(false),
  
  dataRetentionDays: z
    .number({
      required_error: 'Data retention period is required'
    })
    .min(30, 'Data retention must be at least 30 days')
    .max(2555, 'Data retention cannot exceed 7 years')
    .int('Data retention must be a whole number')
    .default(365)
});

// Contact preferences schema
export const contactPreferencesSchema = z.object({
  preferredContactMethod: z
    .enum(['email', 'sms', 'push'], {
      required_error: 'Preferred contact method is required'
    })
    .default('email'),
  
  contactEmail: z
    .string()
    .email('Please enter a valid email address')
    .regex(emailRegex, 'Please enter a valid email address')
    .max(100, 'Email cannot exceed 100 characters'),
  
  contactPhone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number')
    .optional()
    .or(z.literal('')),
  
  emergencyContact: z
    .string()
    .email('Emergency contact must be a valid email address')
    .optional()
    .or(z.literal(''))
});

// Session management schema
export const sessionManagementSchema = z.object({
  terminateOtherSessions: z.boolean().default(false),
  deviceId: z.string().optional(),
  sessionId: z.string().optional()
});

// Device trust schema
export const deviceTrustSchema = z.object({
  deviceId: z
    .string({
      required_error: 'Device ID is required'
    })
    .min(1, 'Device ID cannot be empty'),
  
  trusted: z.boolean({
    required_error: 'Trust status is required'
  }),
  
  deviceName: z
    .string()
    .max(100, 'Device name cannot exceed 100 characters')
    .optional()
});

// Bulk device action schema
export const bulkDeviceActionSchema = z.object({
  deviceIds: z
    .array(z.string().min(1, 'Device ID cannot be empty'))
    .min(1, 'At least one device must be selected')
    .max(20, 'Cannot process more than 20 devices at once'),
  
  action: z
    .enum(['trust', 'untrust', 'remove'], {
      required_error: 'Action is required'
    })
});

// Account deletion schema
export const accountDeletionSchema = z.object({
  confirmationText: z
    .string({
      required_error: 'Confirmation text is required'
    })
    .refine((text) => text === 'DELETE MY ACCOUNT', {
      message: 'Please type "DELETE MY ACCOUNT" to confirm'
    }),
  
  deleteReason: z
    .enum([
      'no_longer_needed',
      'privacy_concerns', 
      'technical_issues',
      'switching_services',
      'other'
    ], {
      required_error: 'Please select a reason for deletion'
    }),
  
  feedback: z
    .string()
    .max(500, 'Feedback cannot exceed 500 characters')
    .optional()
    .or(z.literal('')),
  
  currentPassword: z
    .string({
      required_error: 'Current password is required to delete account'
    })
    .min(1, 'Current password cannot be empty')
});

// Data export request schema
export const dataExportRequestSchema = z.object({
  exportType: z
    .enum(['complete', 'profile_only', 'activity_only', 'family_only'], {
      required_error: 'Export type is required'
    })
    .default('complete'),
  
  format: z
    .enum(['json', 'csv', 'pdf'], {
      required_error: 'Export format is required'
    })
    .default('json'),
  
  includeDeletedData: z.boolean().default(false),
  
  requestReason: z
    .string()
    .max(500, 'Request reason cannot exceed 500 characters')
    .optional()
    .or(z.literal(''))
});

// Form data types for TypeScript
export type SecuritySettingsFormData = z.infer<typeof securitySettingsSchema>;
export type NotificationPreferencesFormData = z.infer<typeof notificationPreferencesSchema>;
export type PrivacySettingsFormData = z.infer<typeof privacySettingsSchema>;
export type ContactPreferencesFormData = z.infer<typeof contactPreferencesSchema>;
export type SessionManagementFormData = z.infer<typeof sessionManagementSchema>;
export type DeviceTrustFormData = z.infer<typeof deviceTrustSchema>;
export type BulkDeviceActionFormData = z.infer<typeof bulkDeviceActionSchema>;
export type AccountDeletionFormData = z.infer<typeof accountDeletionSchema>;
export type DataExportRequestFormData = z.infer<typeof dataExportRequestSchema>;

// Additional combined schemas for settings pages
export const notificationSettingsFormSchema = notificationPreferencesSchema;
export const privacySettingsFormSchema = privacySettingsSchema;

// Appearance settings schema
export const appearanceSettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system', 'auto']),
  colorScheme: z.enum(['default', 'blue', 'green', 'purple', 'orange', 'red', 'custom']),
  fontSize: z.enum(['small', 'medium', 'large', 'extra_large']),
  animations: z.object({
    enableAnimations: z.boolean(),
    reducedMotion: z.boolean(),
    animationSpeed: z.enum(['slow', 'normal', 'fast']),
    particleEffects: z.boolean(),
    spriteAnimations: z.boolean(),
    characterAnimations: z.boolean(),
  }),
  accessibility: z.object({
    highContrast: z.boolean(),
    focusIndicators: z.boolean(),
    screenReaderOptimized: z.boolean(),
    keyboardNavigation: z.boolean(),
    audioFeedback: z.boolean(),
  }),
  gamification: z.object({
    showAchievementAnimations: z.boolean(),
    enableLevelUpEffects: z.boolean(),
    showProgressBars: z.boolean(),
    compactMode: z.boolean(),
    ageAppropriateThemes: z.boolean(),
  }),
});

export type AppearanceSettingsFormData = z.infer<typeof appearanceSettingsSchema>; 