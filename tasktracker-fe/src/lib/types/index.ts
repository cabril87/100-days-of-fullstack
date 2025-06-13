/*
 * Centralized Type Exports
 * Copyright (c) 2025 Carlos Abril Jr
 * 
 * All type definitions properly organized following Family Auth Implementation Checklist
 */

// Core Domain Types
export * from './auth';
export * from './task';
export * from './dashboard';
export * from './family-invitation';
export * from './family-task';
export * from './parental-control';
export * from './session-management';
export * from './customer-support';
export * from './admin';
// TODO: Fix familySeeding type conflicts - temporarily disabled
export type { 
  FamilyScenario,
  FamilySeedingAgeGroup,
  CustomFamilyMember,
  FamilySeedingRequest,
  SeededMemberInfo,
  FamilySeedingResponse,
  FamilyScenarioInfo,
  FamilySeedingHealthCheck
} from './familySeeding';
export * from './notifications';
export * from './settings';

// Infrastructure Types
export type {
  // Family & Task Component Props (non-conflicting)
  FamiliesContentProps,
  GamificationContentProps,
  FamilySeedingPageContentProps,
  UserCreationPageContentProps,
  FamilyTaskDashboardProps,
  FamilyTaskManagementProps,
  SmartInvitationWizardProps,
  FamilySeedingPanelProps,
  MFAStatusCardContainerProps,
  
  // Modal Component Props (non-conflicting)
  ConfirmationModalProps,
  CompletionModalProps,
  
  // Skeleton Component Props (non-conflicting)
  SkeletonWrapperProps,
  WithSkeletonProps,
  SkeletonContainerProps,
  InvitationAcceptanceFlowSkeletonProps,
  GameStatsGridSkeletonProps,
  AchievementGridSkeletonProps,
  MFASetupStepsSkeletonProps,
  
  // Form Type Helpers (non-conflicting)
  SetupStep
} from './component-props';
export * from './ui';
export * from './forms';
export * from './providers';
export * from './skeleton';
export * from './cookie-consent';
export * from './board'; 