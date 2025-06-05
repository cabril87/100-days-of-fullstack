/*
 * Parental Control Types - Exactly matching backend DTOs
 * Copyright (c) 2025 Carlos Abril Jr
 */

import { User } from './auth';

// Base interfaces matching backend DTOs exactly
export interface ParentalControlDTO {
  id: number;
  parentUserId: number;
  childUserId: number;
  screenTimeEnabled: boolean;
  dailyTimeLimit: string; // TimeSpan as string "HH:mm:ss"
  allowedHours: TimeRangeDTO[];
  taskApprovalRequired: boolean;
  pointSpendingApprovalRequired: boolean;
  blockedFeatures: string[];
  chatMonitoringEnabled: boolean;
  maxPointsWithoutApproval: number;
  canInviteOthers: boolean;
  canViewOtherMembers: boolean;
  createdAt: string;
  updatedAt: string;
  parent?: User;
  child?: User;
}

export interface ParentalControlCreateUpdateDTO {
  childUserId: number;
  screenTimeEnabled: boolean;
  dailyTimeLimitHours: number; // Backend expects hours as double
  allowedHours: TimeRangeCreateDTO[];
  taskApprovalRequired: boolean;
  pointSpendingApprovalRequired: boolean;
  blockedFeatures: string[];
  chatMonitoringEnabled: boolean;
  maxPointsWithoutApproval: number;
  canInviteOthers: boolean;
  canViewOtherMembers: boolean;
}

export interface TimeRangeDTO {
  startTime: string; // TimeSpan as string "HH:mm:ss"
  endTime: string; // TimeSpan as string "HH:mm:ss"
  dayOfWeek: DayOfWeek;
  isActive: boolean;
}

export interface TimeRangeCreateDTO {
  startTime: string; // HH:mm format for creation
  endTime: string; // HH:mm format for creation
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  isActive: boolean;
}

export interface PermissionRequestDTO {
  id: number;
  childUserId: number;
  parentUserId: number;
  requestType: string;
  description: string;
  status: PermissionRequestStatus;
  requestedAt: string;
  respondedAt: string | null;
  responseMessage: string | null;
  expiresAt: string | null;
  child?: User;
  parent?: User;
}

export interface PermissionRequestCreateDTO {
  requestType: string;
  description: string;
  expiresAt?: string;
}

export interface PermissionRequestResponseDTO {
  approved: boolean;
  responseMessage?: string;
}

export interface BulkPermissionRequestResponseDTO {
  requestIds: number[];
  approved: boolean;
  responseMessage?: string;
}

export interface ParentalControlSummaryDTO {
  child: User;
  settings: ParentalControlDTO | null;
  pendingRequestsCount: number;
  todayScreenTimeMinutes: number;
  remainingScreenTimeMinutes: number;
  isWithinAllowedHours: boolean;
  recentRequests: PermissionRequestDTO[];
}

// Enums matching backend exactly
export enum PermissionRequestStatus {
  Pending = 'Pending',
  Approved = 'Approved', 
  Denied = 'Denied',
  Expired = 'Expired'
}

export enum DayOfWeek {
  Sunday = 0,
  Monday = 1,
  Tuesday = 2,
  Wednesday = 3,
  Thursday = 4,
  Friday = 5,
  Saturday = 6
}

// Permission request types as constants (matching backend)
export const PermissionRequestTypes = {
  SpendPoints: 'SpendPoints',
  CreateTask: 'CreateTask', 
  ModifyTask: 'ModifyTask',
  InviteFamilyMember: 'InviteFamilyMember',
  ChangeProfile: 'ChangeProfile',
  AccessFeature: 'AccessFeature',
  ExtendScreenTime: 'ExtendScreenTime',
  ChatWithOthers: 'ChatWithOthers'
} as const;

export type PermissionRequestType = typeof PermissionRequestTypes[keyof typeof PermissionRequestTypes];

// Form data types for React Hook Form
export interface ParentalControlFormData {
  screenTimeEnabled: boolean;
  dailyTimeLimitHours: number;
  taskApprovalRequired: boolean;
  pointSpendingApprovalRequired: boolean;
  blockedFeatures: string[];
  chatMonitoringEnabled: boolean;
  maxPointsWithoutApproval: number;
  canInviteOthers: boolean;
  canViewOtherMembers: boolean;
  allowedHours: {
    startTime: string;
    endTime: string;
    dayOfWeek: number;
    isActive: boolean;
  }[];
}

export interface PermissionRequestFormData {
  requestType: string;
  description: string;
  expiresAt?: string;
}

export interface PermissionResponseFormData {
  approved: boolean;
  responseMessage?: string;
} 