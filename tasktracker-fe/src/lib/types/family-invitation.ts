/*
 * Family Invitation Types - Exactly matching backend DTOs
 * Copyright (c) 2025 Carlos Abril Jr
 */

import { User } from './auth';

// Core invitation interfaces matching backend DTOs exactly
export interface InvitationDTO {
  id: number;
  token: string;
  email: string;
  familyId: number;
  roleId: number;
  createdById: number;
  message?: string;
  isAccepted: boolean;
  createdAt: string;
  expiresAt: string;
  family: FamilyDTO;
  role: FamilyRoleDTO;
  createdBy: User;
}

export interface FamilyDTO {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
  createdById: number;
  createdByUser?: User;
  memberCount?: number;
}

export interface FamilyRoleDTO {
  id: number;
  name: string;
  description: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt?: string;
  permissions?: FamilyRolePermissionDTO[];
}

export interface FamilyRolePermissionDTO {
  id: number;
  roleId: number;
  permission: string;
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  createdAt: string;
}

export interface FamilyMemberDTO {
  id: number;
  familyId: number;
  userId: number;
  roleId: number;
  joinedAt: string;
  isActive: boolean;
  user: User;
  role: FamilyRoleDTO;
  family: FamilyDTO;
}

// Request/Response DTOs for API calls
export interface InvitationCreateDTO {
  email: string;
  familyId: number;
  roleId: number;
  message?: string;
}

export interface InvitationAcceptDTO {
  token: string;
}

export interface InvitationResponseDTO {
  id: number;
  success: boolean;
  message: string;
  invitation?: InvitationDTO;
}

export interface PendingInvitationsResponseDTO {
  invitations: InvitationDTO[];
  count: number;
}

// Family creation/update DTOs
export interface FamilyCreateDTO {
  name: string;
  description?: string;
}

export interface FamilyUpdateDTO {
  name?: string;
  description?: string;
}

export interface TransferOwnershipDTO {
  familyId: number;
  newOwnerId: number;
  reason?: string;
}

// Family permissions enum
export enum FamilyPermission {
  ViewAllTasks = 'ViewAllTasks',
  AssignTasks = 'AssignTasks',
  ManagePoints = 'ManagePoints',
  ManageRewards = 'ManageRewards',
  ViewReports = 'ViewReports',
  ManageFamily = 'ManageFamily',
  ModerateChat = 'ModerateChat',
  ApproveSpending = 'ApproveSpending',
  InviteMembers = 'InviteMembers',
  ManageRoles = 'ManageRoles'
}

// Form data types for React Hook Form
export interface InvitationFormData {
  email: string;
  roleId: number;
  message?: string;
}

export interface FamilyFormData {
  name: string;
  description?: string;
}

// Extended invitation info for UI
export interface InvitationWithStatus extends InvitationDTO {
  daysUntilExpiry: number;
  isExpired: boolean;
  canResend: boolean;
}

// Family member with extended info for UI
export interface FamilyMemberWithStats extends FamilyMemberDTO {
  taskCount?: number;
  pointsBalance?: number;
  lastActive?: string;
  isOnline?: boolean;
}

// Age-based management types
export interface FamilyManagementPermissions {
  canCreateFamily: boolean;
  canTransferOwnership: boolean;
  canManageMembers: boolean;
  canInviteMembers: boolean;
  canManageCurrentFamily: boolean;
  maxFamilySize?: number; // For teens
  ageGroup: string;
}

// Family relationship types
export interface UserFamilyRelationships {
  adminFamilies: FamilyDTO[];        // Families user is admin of
  memberFamilies: FamilyDTO[];       // Families user is just a member of
  managementFamilies: FamilyDTO[];   // Families user has management privileges for
  permissions: FamilyManagementPermissions;
} 