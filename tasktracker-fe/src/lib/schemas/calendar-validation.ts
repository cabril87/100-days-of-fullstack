// Enhanced Calendar Validation Schemas for Enterprise TaskTracker System
// Following FAMILY-AUTH-IMPLEMENTATION-CHECKLIST.md - Zod Validation Standards
// Copyright (c) 2025 TaskTracker Enterprise

import { z } from 'zod';

// ============================================================================
// ENHANCED EVENT VALIDATION SCHEMAS
// ============================================================================

export const enhancedEventFormSchema = z.object({
  title: z.string().min(1, 'Event title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endDate: z.string().min(1, 'End date is required'),
  endTime: z.string().min(1, 'End time is required'),
  isAllDay: z.boolean().default(false),
  location: z.string().optional(),
  color: z.string().min(1, 'Event color is required'),
  // Enhanced validation for competitive features
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  category: z.enum(['meeting', 'personal', 'family', 'work', 'health', 'education', 'social']).default('meeting'),
  reminderMinutes: z.number().min(0).max(10080).optional(), // Max 1 week
  allowConflicts: z.boolean().default(false),
  requiresPreparation: z.boolean().default(false),
  estimatedTravelTime: z.number().min(0).max(480).optional(), // Max 8 hours in minutes
  familyMembersRequired: z.array(z.number()).optional(),
  familyMembersOptional: z.array(z.number()).optional(),
}).refine((data) => {
  // Enhanced validation: end time must be after start time
  const startDateTime = new Date(`${data.startDate}T${data.startTime}`);
  const endDateTime = new Date(`${data.endDate}T${data.endTime}`);
  return endDateTime > startDateTime;
}, {
  message: "End time must be after start time",
  path: ["endTime"]
}).refine((data) => {
  // Enhanced validation: all-day events must be on same date or consecutive dates
  if (data.isAllDay) {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    const dayDifference = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return dayDifference <= 7; // Max 1 week for all-day events
  }
  return true;
}, {
  message: "All-day events cannot span more than 7 days",
  path: ["endDate"]
});

// ============================================================================
// CONFLICT DETECTION VALIDATION
// ============================================================================

export const conflictDetectionSchema = z.object({
  eventId: z.number().optional(),
  startTime: z.date(),
  endTime: z.date(),
  familyMembers: z.array(z.number()),
  location: z.string().optional(),
  travelTimeMinutes: z.number().min(0).max(480).default(0),
  bufferTimeMinutes: z.number().min(0).max(120).default(15),
  checkResourceConflicts: z.boolean().default(true),
  checkFamilyAvailability: z.boolean().default(true),
});

export const conflictResolutionSchema = z.object({
  originalEventId: z.number(),
  resolutionType: z.enum(['reschedule', 'shorten', 'split', 'cancel', 'ignore']),
  newStartTime: z.date().optional(),
  newEndTime: z.date().optional(),
  reason: z.string().min(1, 'Resolution reason is required'),
  notifyFamilyMembers: z.boolean().default(true),
});

// ============================================================================
// SMART SUGGESTIONS VALIDATION
// ============================================================================

export const smartSuggestionSchema = z.object({
  eventType: z.string().min(1, 'Event type is required'),
  currentTitle: z.string().optional(),
  currentDuration: z.number().min(15).max(480).optional(), // 15 minutes to 8 hours
  currentLocation: z.string().optional(),
  familyMembers: z.array(z.number()).optional(),
  timeOfDay: z.enum(['morning', 'afternoon', 'evening', 'late']).optional(),
  dayOfWeek: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']).optional(),
  learningContext: z.object({
    userPatterns: z.boolean().default(true),
    familyPatterns: z.boolean().default(true),
    aiAnalysis: z.boolean().default(true),
    commonPractices: z.boolean().default(true),
  }).default({}),
});

export const durationPresetSchema = z.object({
  label: z.string().min(1).max(20),
  minutes: z.number().min(15).max(480),
  icon: z.string().min(1),
  isCustom: z.boolean().default(false),
  category: z.enum(['meeting', 'call', 'break', 'travel', 'meal', 'exercise', 'study']).optional(),
});

// ============================================================================
// MOBILE ENHANCEMENT VALIDATION
// ============================================================================

export const mobileGestureConfigSchema = z.object({
  swipeNavigation: z.boolean().default(true),
  hapticFeedback: z.boolean().default(true),
  pullToRefresh: z.boolean().default(true),
  pinchZoom: z.boolean().default(true),
  longPress: z.boolean().default(true),
  minimumSwipeDistance: z.number().min(20).max(200).default(50),
  longPressDuration: z.number().min(300).max(2000).default(500),
  hapticIntensity: z.enum(['light', 'medium', 'heavy']).default('medium'),
  touchTargetSize: z.number().min(32).max(64).default(44),
});

export const pullToRefreshConfigSchema = z.object({
  isEnabled: z.boolean().default(true),
  refreshThreshold: z.number().min(40).max(120).default(60),
  maxPullDistance: z.number().min(80).max(200).default(120),
  animationDuration: z.number().min(200).max(1000).default(300),
  hapticOnTrigger: z.boolean().default(true),
});

// ============================================================================
// FAMILY COLLABORATION VALIDATION
// ============================================================================

export const familyEventVotingSchema = z.object({
  eventTitle: z.string().min(1, 'Event title is required'),
  eventDescription: z.string().optional(),
  proposedTimeSlots: z.array(z.object({
    startTime: z.date(),
    endTime: z.date(),
    label: z.string().optional(),
  })).min(2, 'At least 2 time slots required').max(10, 'Maximum 10 time slots allowed'),
  votingDeadline: z.date().refine((date) => date > new Date(), {
    message: "Voting deadline must be in the future"
  }),
  requiredParticipants: z.array(z.number()).min(1, 'At least one required participant'),
  optionalParticipants: z.array(z.number()).optional(),
  allowComments: z.boolean().default(true),
  requireConsensus: z.boolean().default(false),
});

export const familyVoteSchema = z.object({
  eventVotingId: z.number(),
  timeSlotId: z.string(),
  preference: z.enum(['preferred', 'acceptable', 'unavailable']),
  comment: z.string().max(200).optional(),
  priority: z.number().min(1).max(5).default(3),
});

export const familyMilestoneSchema = z.object({
  title: z.string().min(1, 'Milestone title is required').max(100),
  description: z.string().max(500).optional(),
  targetDate: z.date(),
  category: z.enum(['birthday', 'anniversary', 'achievement', 'holiday', 'custom']),
  familyMembers: z.array(z.number()).min(1, 'At least one family member required'),
  isRecurring: z.boolean().default(false),
  recurrencePattern: z.enum(['yearly', 'monthly', 'custom']).optional(),
  reminderDays: z.array(z.number().min(0).max(365)).optional(),
  celebrationPlanned: z.boolean().default(false),
  notificationSettings: z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(true),
    sms: z.boolean().default(false),
  }).optional(),
});

// ============================================================================
// ACCESSIBILITY VALIDATION
// ============================================================================

export const accessibilitySettingsSchema = z.object({
  highContrast: z.boolean().default(false),
  largeText: z.boolean().default(false),
  reducedMotion: z.boolean().default(false),
  screenReader: z.boolean().default(false),
  keyboardNavigation: z.boolean().default(false),
  voiceControl: z.boolean().default(false),
  colorBlindnessSupport: z.enum(['none', 'deuteranopia', 'protanopia', 'tritanopia']).default('none'),
  fontSize: z.number().min(12).max(24).default(16),
  animationSpeed: z.enum(['slow', 'normal', 'fast', 'none']).default('normal'),
});

// ============================================================================
// PERFORMANCE VALIDATION
// ============================================================================

export const performanceConfigSchema = z.object({
  enableVirtualScrolling: z.boolean().default(true),
  maxCachedEvents: z.number().min(100).max(10000).default(1000),
  cacheExpirationHours: z.number().min(1).max(168).default(24),
  enableOfflineMode: z.boolean().default(true),
  preloadDays: z.number().min(7).max(90).default(30),
  maxConcurrentRequests: z.number().min(1).max(10).default(3),
  debounceMs: z.number().min(100).max(1000).default(300),
});

// ============================================================================
// EXPORT FORM DATA TYPES
// ============================================================================

export type EnhancedEventFormData = z.infer<typeof enhancedEventFormSchema>;
export type ConflictDetectionData = z.infer<typeof conflictDetectionSchema>;
export type ConflictResolutionData = z.infer<typeof conflictResolutionSchema>;
export type SmartSuggestionData = z.infer<typeof smartSuggestionSchema>;
export type DurationPresetData = z.infer<typeof durationPresetSchema>;
export type MobileGestureConfigData = z.infer<typeof mobileGestureConfigSchema>;
export type PullToRefreshConfigData = z.infer<typeof pullToRefreshConfigSchema>;
export type FamilyEventVotingData = z.infer<typeof familyEventVotingSchema>;
export type FamilyVoteData = z.infer<typeof familyVoteSchema>;
export type FamilyMilestoneData = z.infer<typeof familyMilestoneSchema>;
export type AccessibilitySettingsData = z.infer<typeof accessibilitySettingsSchema>;
export type PerformanceConfigData = z.infer<typeof performanceConfigSchema>; 