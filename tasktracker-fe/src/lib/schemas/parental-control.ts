/*
 * Parental Control Validation Schemas - React Hook Form + Zod
 * Copyright (c) 2025 Carlos Abril Jr
 */

import { z } from 'zod';
import { PermissionRequestTypes, PermissionRequestType } from '../types/parental-control';

// Time validation helpers
const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
const isValidTime = (time: string) => timeRegex.test(time);

// Main parental control settings schema
export const parentalControlSchema = z.object({
  screenTimeEnabled: z.boolean({
    required_error: 'Screen time setting is required'
  }),
  
  dailyTimeLimitHours: z
    .number({
      required_error: 'Daily time limit is required',
      invalid_type_error: 'Daily time limit must be a number'
    })
    .min(0.5, 'Daily time limit must be at least 30 minutes')
    .max(24, 'Daily time limit cannot exceed 24 hours')
    .step(0.5, 'Daily time limit must be in 30-minute increments'),
  
  taskApprovalRequired: z.boolean({
    required_error: 'Task approval setting is required'
  }),
  
  pointSpendingApprovalRequired: z.boolean({
    required_error: 'Point spending approval setting is required'
  }),
  
  blockedFeatures: z
    .array(z.string().min(1, 'Feature name cannot be empty'))
    .default([])
    .refine((features) => features.every(f => f.trim().length > 0), {
      message: 'All blocked features must have valid names'
    }),
  
  chatMonitoringEnabled: z.boolean({
    required_error: 'Chat monitoring setting is required'
  }),
  
  maxPointsWithoutApproval: z
    .number({
      required_error: 'Max points without approval is required',
      invalid_type_error: 'Max points must be a number'
    })
    .min(0, 'Max points cannot be negative')
    .max(1000, 'Max points cannot exceed 1000')
    .int('Max points must be a whole number'),
  
  canInviteOthers: z.boolean({
    required_error: 'Invite others setting is required'
  }),
  
  canViewOtherMembers: z.boolean({
    required_error: 'View other members setting is required'
  }),
  
  allowedHours: z
    .array(z.object({
      startTime: z
        .string({
          required_error: 'Start time is required'
        })
        .regex(timeRegex, 'Start time must be in HH:mm format (e.g., 09:00)')
        .refine(isValidTime, 'Invalid start time format'),
      
      endTime: z
        .string({
          required_error: 'End time is required'
        })
        .regex(timeRegex, 'End time must be in HH:mm format (e.g., 17:00)')
        .refine(isValidTime, 'Invalid end time format'),
      
      dayOfWeek: z
        .number({
          required_error: 'Day of week is required',
          invalid_type_error: 'Day of week must be a number'
        })
        .min(0, 'Day of week must be between 0 (Sunday) and 6 (Saturday)')
        .max(6, 'Day of week must be between 0 (Sunday) and 6 (Saturday)')
        .int('Day of week must be a whole number'),
      
      isActive: z.boolean().default(true)
    }))
    .default([])
    .refine((hours) => {
      // Validate that start time is before end time for each entry
      return hours.every(({ startTime, endTime }) => {
        const [startHour, startMin] = startTime.split(':').map(Number);
        const [endHour, endMin] = endTime.split(':').map(Number);
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;
        return startMinutes < endMinutes;
      });
    }, {
      message: 'End time must be after start time for all time ranges'
    })
    .refine((hours) => {
      // Check for overlapping time ranges on the same day
      const dayGroups = hours.reduce((acc, hour) => {
        if (!acc[hour.dayOfWeek]) acc[hour.dayOfWeek] = [];
        acc[hour.dayOfWeek].push(hour);
        return acc;
      }, {} as Record<number, typeof hours>);
      
      for (const dayHours of Object.values(dayGroups)) {
        for (let i = 0; i < dayHours.length; i++) {
          for (let j = i + 1; j < dayHours.length; j++) {
            const hour1 = dayHours[i];
            const hour2 = dayHours[j];
            
            const [start1Hour, start1Min] = hour1.startTime.split(':').map(Number);
            const [end1Hour, end1Min] = hour1.endTime.split(':').map(Number);
            const [start2Hour, start2Min] = hour2.startTime.split(':').map(Number);
            const [end2Hour, end2Min] = hour2.endTime.split(':').map(Number);
            
            const start1 = start1Hour * 60 + start1Min;
            const end1 = end1Hour * 60 + end1Min;
            const start2 = start2Hour * 60 + start2Min;
            const end2 = end2Hour * 60 + end2Min;
            
            // Check for overlap
            if (!(end1 <= start2 || end2 <= start1)) {
              return false;
            }
          }
        }
      }
      return true;
    }, {
      message: 'Time ranges cannot overlap on the same day'
    })
});

// Permission request schema
export const permissionRequestSchema = z.object({
  requestType: z
    .string({
      required_error: 'Request type is required'
    })
    .min(1, 'Request type cannot be empty')
    .refine((type) => Object.values(PermissionRequestTypes).includes(type as PermissionRequestType), {
      message: 'Invalid request type'
    }),
  
  description: z
    .string({
      required_error: 'Description is required'
    })
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description cannot exceed 500 characters')
    .refine((desc) => desc.trim().length >= 10, {
      message: 'Description must contain at least 10 meaningful characters'
    }),
  
  expiresAt: z
    .string()
    .datetime({ message: 'Invalid expiration date format' })
    .optional()
    .refine((date) => {
      if (!date) return true;
      const expiryDate = new Date(date);
      const now = new Date();
      const maxExpiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
      return expiryDate > now && expiryDate <= maxExpiry;
    }, {
      message: 'Expiration date must be between now and 30 days from now'
    })
});

// Permission response schema  
export const permissionResponseSchema = z.object({
  approved: z.boolean({
    required_error: 'Approval decision is required'
  }),
  
  responseMessage: z
    .string()
    .max(500, 'Response message cannot exceed 500 characters')
    .optional()
    .refine((msg) => {
      if (!msg) return true;
      return msg.trim().length > 0;
    }, {
      message: 'Response message cannot be empty if provided'
    })
});

// Bulk permission response schema
export const bulkPermissionResponseSchema = z.object({
  requestIds: z
    .array(z.number().positive('Request ID must be positive'))
    .min(1, 'At least one request must be selected')
    .max(50, 'Cannot process more than 50 requests at once'),
  
  approved: z.boolean({
    required_error: 'Approval decision is required'
  }),
  
  responseMessage: z
    .string()
    .max(500, 'Response message cannot exceed 500 characters')
    .optional()
});

// Time range creation schema
export const timeRangeSchema = z.object({
  startTime: z
    .string({
      required_error: 'Start time is required'
    })
    .regex(timeRegex, 'Start time must be in HH:mm format'),
  
  endTime: z
    .string({
      required_error: 'End time is required'  
    })
    .regex(timeRegex, 'End time must be in HH:mm format'),
  
  dayOfWeek: z
    .number({
      required_error: 'Day of week is required'
    })
    .min(0)
    .max(6)
    .int(),
  
  isActive: z.boolean().default(true)
}).refine((data) => {
  const [startHour, startMin] = data.startTime.split(':').map(Number);
  const [endHour, endMin] = data.endTime.split(':').map(Number);
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  return startMinutes < endMinutes;
}, {
  message: 'End time must be after start time',
  path: ['endTime']
});

// Export types inferred from schemas
export type ParentalControlFormData = z.infer<typeof parentalControlSchema>;
export type PermissionRequestFormData = z.infer<typeof permissionRequestSchema>;
export type PermissionResponseFormData = z.infer<typeof permissionResponseSchema>;
export type BulkPermissionResponseFormData = z.infer<typeof bulkPermissionResponseSchema>;
export type TimeRangeFormData = z.infer<typeof timeRangeSchema>; 