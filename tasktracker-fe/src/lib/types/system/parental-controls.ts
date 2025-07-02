/*
 * Parental Control Types
 * Copyright (c) 2025 Carlos Abril Jr
 * 
 * Parental control and permission management types following .cursorrules standards
 * All types properly organized in lib/types/system/ subdirectory
 */

// ================================
// PARENTAL CONTROL DTOs
// ================================

export interface ParentalControlDTO {
  id: number;
  familyId: number;
  childUserId: number;
  parentUserId: number;
  settings: ParentalControlSettingsDTO;
  timeRestrictions: TimeRestrictionDTO[];
  contentFilters: ContentFilterDTO[];
  approvalRules: ApprovalRuleDTO[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ParentalControlCreateUpdateDTO {
  familyId: number;
  childUserId: number;
  settings: ParentalControlSettingsDTO;
  timeRestrictions?: TimeRestrictionDTO[];
  contentFilters?: ContentFilterDTO[];
  approvalRules?: ApprovalRuleDTO[];
  isActive?: boolean;
}

export interface ParentalControlSummaryDTO {
  totalChildren: number;
  activeControls: number;
  pendingApprovals: number;
  restrictedActivities: number;
  lastUpdated: string;
  healthStatus: 'good' | 'warning' | 'attention_needed';
}

// ================================
// PERMISSION REQUEST DTOs
// ================================

export interface PermissionRequestDTO {
  id: number;
  childUserId: number;
  parentUserId: number;
  familyId: number;
  requestType: PermissionRequestType;
  resourceId?: number;
  resourceType?: string;
  reason: string;
  requestedAt: string;
  status: PermissionRequestStatus;
  approvedAt?: string;
  deniedAt?: string;
  approverComment?: string;
  expiresAt?: string;
}

export interface PermissionRequestCreateDTO {
  requestType: PermissionRequestType;
  resourceId?: number;
  resourceType?: string;
  reason: string;
  expiresAt?: string;
}

export interface PermissionRequestResponseDTO {
  approved: boolean;
  comment?: string;
  conditions?: PermissionConditionDTO[];
}

export interface BulkPermissionRequestResponseDTO {
  responses: Array<{
    requestId: number;
    approved: boolean;
    comment?: string;
  }>;
  globalComment?: string;
}

// ================================
// PERMISSION TYPES
// ================================

export type PermissionRequestType = 
  | 'task_assignment'
  | 'family_event'
  | 'external_contact'
  | 'screen_time_extension'
  | 'app_installation'
  | 'purchase_request'
  | 'location_sharing'
  | 'privacy_change'
  | 'account_modification';

export type PermissionRequestStatus = 
  | 'pending'
  | 'approved'
  | 'denied'
  | 'expired'
  | 'withdrawn';

// ================================
// PARENTAL CONTROL SETTINGS
// ================================

export interface ParentalControlSettingsDTO {
  requireApprovalFor: PermissionRequestType[];
  defaultApprovalTimeout: number; // hours
  allowEmergencyOverride: boolean;
  notifyOnActivity: boolean;
  strictMode: boolean;
  ageAppropriateContent: boolean;
  allowDataExport: boolean;
}

// ================================
// TIME RESTRICTION DTOs
// ================================

export interface TimeRestrictionDTO {
  id?: number;
  type: 'daily' | 'weekly' | 'date_range' | 'bedtime';
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  daysOfWeek?: number[]; // 0-6, 0 = Sunday
  startDate?: string; // ISO date
  endDate?: string; // ISO date
  isActive: boolean;
  allowedApps?: string[];
  blockedApps?: string[];
}

// ================================
// CONTENT FILTER DTOs
// ================================

export interface ContentFilterDTO {
  id?: number;
  type: 'keyword' | 'category' | 'url' | 'age_rating';
  value: string;
  action: 'block' | 'warn' | 'monitor';
  isActive: boolean;
  expiresAt?: string;
}

// ================================
// APPROVAL RULE DTOs
// ================================

export interface ApprovalRuleDTO {
  id?: number;
  condition: string;
  autoApprove: boolean;
  requiresParent: boolean;
  maxValue?: number;
  timeWindow?: number; // minutes
  isActive: boolean;
}

// ================================
// PERMISSION CONDITIONS
// ================================

export interface PermissionConditionDTO {
  type: 'time_limit' | 'location_required' | 'supervision_required' | 'reporting_required';
  value: string;
  description: string;
} 