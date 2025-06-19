/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 * 
 * Main Types Index
 * Central export point for all type definitions
 */

// Core types
export * from './auth';
export * from './task';
export * from './family-invitation';
export * from './family-task';
export * from './enhanced-family';
export * from './widget-props';
export * from './dashboard';
export * from './cookie-consent';
export * from './board';

// Gamification types (specific exports to avoid conflicts)
export type {
  GamificationState,
  Achievement,
  Badge,
  UseGamificationEventsReturn
} from './gamification';

// ✨ NEW: Organized Enterprise Types
// Task Assignment Types
export type {
  TaskAssignmentType,
  TaskAssignmentStatus,
  TaskAssignmentDTO,
  CreateTaskAssignmentDTO,
  BatchAssignmentRequestDTO
} from './task-assignment';

// Family Event Types
export type {
  FamilyActivityEventDTO,
  FamilyMilestoneEventDTO,
  TaskCompletionEventDTO
} from './family-events';

// API Response Types
export type {
  ApiResponse,
  UserProgressApiResponse,
  AchievementApiResponse,
  BadgeApiResponse,
  TaskStatsApiResponse,
  FamilyTaskStatsApiResponse
} from './api-responses';

// Component Props Types - import from specific files
export type {
  DashboardConnectionsProps,
  DashboardConnectionsReturn,
  DashboardProps,
  DashboardStats,
  DashboardInitialData,
  DashboardContentProps
} from './component-props/dashboard-props';

export type {
  BaseWidgetProps,
  GamificationWidgetProps,
  LivePointsWidgetProps,
  StreakCounterProps,
  RecentAchievementsProps,
  FamilyActivityStreamProps,
  NotificationStreamProps
} from './component-props/widget-props';

export type {
  FamilyPrivacyDashboardProps,
  FamilyTaskDashboardProps,
  FamilyManagementProps,
  FamilyMemberProps
} from './component-props/family-props';

// Enterprise Celebrations
export type {
  EnterpriseCelebrationNotification,
  EnterpriseFamilyContext,
  EnterpriseSoundEffect,
  EnterpriseCelebrationConfig,
  EnterpriseConfettiSettings,
  EnterpriseCelebrationIntensity,
  FamilyMemberAgeGroup,
  EnterpriseCelebrationType,
  EnterpriseCelebrationPriority,
  EnterpriseCelebrationLevel,
  CreateEnterpriseCelebrationParams,
  EnterpriseCelebrationResult,
  AgeAppropriateConfig,
  IntensityConfigAdjustments
} from './enterprise-celebrations';

// Enterprise Celebration Props
export type {
  EnhancedCelebrationSystemProps,
  CelebrationCardProps,
  ConfettiTriggerProps,
  CelebrationToastProps,
  CelebrationEventHandlerProps
} from './component-props/enterprise-celebration-props';

// Legacy celebration types (deprecated - use enterprise types)
export type {
  CelebrationNotification,
  CelebrationConfettiType
} from './component-props/celebration-props';

// Task Status Types
export type {
  TaskStatusUpdateRequestDTO,
  TaskStatusUpdateResponseDTO,
  BatchCompleteRequestDTO,
  BatchStatusUpdateRequestDTO,
  TaskStatusUpdateDTO,
  BulkStatusUpdateDTO
} from './task-status';

// SignalR Event Types
export type {
  SignalREventHandlers,
  SignalRConnectionState
} from './signalr-events';

// Backend SignalR Event Types
export type {
  BackendGamificationEventDTO,
  BackendTaskCompletionEventDTO,
  BackendFamilyActivityEventDTO,
  BackendFamilyMilestoneEventDTO,
  BackendNotificationEventDTO,
  ParsedGamificationEvents,
  parseGamificationEvent,
  parseTaskCompletionEvent,
  parseFamilyActivityEvent,
  parseFamilyMilestoneEvent
} from './backend-signalr-events'; 