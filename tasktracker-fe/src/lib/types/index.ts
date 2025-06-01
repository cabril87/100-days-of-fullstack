/**
 * Central export file for all types
 * Organized by domain for better maintainability
 */

// Core types
export * from './api';
export * from './auth';
export * from './user';

// Task management types
export * from './task';
export * from './batch';
export * from './search';

// Family and social types
export * from './family';
export * from './activity';
export * from './calendar';

// Feature-specific types
export * from './focus';
export * from './notification';
export * from './gamification';
export * from './analytics';

// Technical types
export * from './signalr';
export * from './pwa';
export * from './security';

// Central type exports
export * from './auth';
export * from './task';
export * from './gamification';
export * from './analytics';
export * from './focus';
export * from './security';
export * from './signalr';
export * from './notification';
export * from './search';
export * from './batch';
export * from './api';
export * from './user';
export * from './pwa';
export * from './activity';

// Family types - export specific types to avoid conflicts
export type {
  Family,
  FamilyMember,
  CreateFamilyInput,
  UpdateFamilyInput,
  FamilyDTO
} from './family';

// Calendar types - export specific types to avoid conflicts  
export type {
  FamilyCalendarEvent,
  EventAttendee,
  EventReminder,
  CreateFamilyCalendarEvent,
  UpdateFamilyCalendarEvent,
  UpdateAttendeeResponse,
  MemberAvailability,
  CreateMemberAvailability,
  UpdateMemberAvailability
} from './calendar';

// Template types - export specific types to avoid conflicts
export type { 
  TaskTemplate as TemplateTaskTemplate,
  MarketplaceTemplate,
  TemplateAnalytics,
  TemplateReview,
  TemplateRatingSubmission,
  TemplateRatingModalProps,
  CreateTaskTemplateDTO,
  UpdateTaskTemplateDTO,
  TemplateCategory,
  AutomationRule,
  WorkflowStep,
  TemplateMarketplace,
  TemplateFilters,
  TemplateShare,
  TemplatePermission
} from './template';

// Common utility types
export type ID = string | number;
export type Timestamp = string;
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// API Response wrapper
export interface ApiResponse<T = unknown> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
  status?: number;
} 