/*
 * Customer Support Types
 * Copyright (c) 2025 Carlos Abril Jr
 */

// Types based on backend CustomerSupportController responses
export interface UserSearchResult {
  userId: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  userRole: string;
  createdAt: string;
  isActive: boolean;
  mfaEnabled: boolean;
  ageGroup: string;
  accountStatus: string;
}

export interface UserAccountInfo {
  userId: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
  userRole: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  ageGroup: string;
  mfaEnabled: boolean;
  mfaSetupDate?: string;
  deviceCount: number;
  accountStatus: string;
}

export interface MFADisableResult {
  success: boolean;
  message: string;
  userId: number;
  userEmail: string;
  disabledBy: string;
  reason: string;
  timestamp: string;
}

export interface MFADisableRequest {
  reason: string;
}

export interface CustomerSupportAuditAction {
  id: string;
  supportUserId: string;
  targetUserId: number;
  action: CustomerSupportActionType;
  reason: string;
  timestamp: string;
  success: boolean;
  details?: Record<string, string | number | boolean>;
}

// Enums
export enum CustomerSupportActionType {
  USER_SEARCH = 'user_search',
  MFA_DISABLE = 'mfa_disable',
  PASSWORD_RESET = 'password_reset',
  ACCOUNT_UNLOCK = 'account_unlock',
  VIEW_ACCOUNT_INFO = 'view_account_info'
}

// Form data types for customer support operations
export interface UserSearchFormData {
  searchTerm: string;
  searchType: 'email' | 'username' | 'id';
}

export interface MFADisableFormData {
  reason: string;
  notifyUser: boolean;
} 