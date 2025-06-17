/*
 * Family Invitation Types - Exactly matching backend DTOs
 * Copyright (c) 2025 Carlos Abril Jr
 */

import { User, FamilyMemberAgeGroup } from './auth';

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
  familyRoleId: number;
  message?: string;
  relationship?: FamilyRelationshipType;
  suggestedName?: string;
  dateOfBirth?: string;
  notes?: string;
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

// FamilyMemberAgeGroup is imported from './auth'

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
  canManageFamily: boolean;
  canInviteMembers: boolean;
  canRemoveMembers: boolean;
  canUpdateRoles: boolean;
  canTransferOwnership: boolean;
  isGlobalAdmin: boolean;
  isFamilyAdmin: boolean;
  maxFamilySize: number;
  ageGroup: FamilyMemberAgeGroup;
  ageRestrictions: string[];
}

// Family relationship types
export interface UserFamilyRelationships {
  adminFamilies: FamilyDTO[];        // Families user is admin of
  memberFamilies: FamilyDTO[];       // Families user is just a member of
  managementFamilies: FamilyDTO[];   // Families user has management privileges for
  permissions: FamilyManagementPermissions;
}

// === SMART INVITATION TYPES (MATCHING BACKEND EXACTLY) ===

/**
 * Smart family invitation request with relationship context.
 * Matches SmartInvitationRequestDTO exactly.
 */
export interface SmartInvitationRequest {
  email: string;
  name: string;
  relationshipToAdmin: FamilyRelationshipType;
  dateOfBirth: string;
  personalMessage?: string;
  relatedToMemberId?: number;
  relationshipToMember?: FamilyRelationshipType;
  wantsAdminRole: boolean;
  notes?: string;
}

/**
 * Smart invitation validation results.
 * Matches SmartInvitationValidationDTO exactly.
 */
export interface SmartInvitationValidation {
  isValid: boolean;
  warnings: string[];
  errors: string[];
  recommendedRole: string;
  recommendationReasoning: string;
  ageGroup: FamilyMemberAgeGroup;
  relationshipDisplayName: string;
  willExceedFamilyLimit: boolean;
  currentFamilySize: number;
  maxFamilySize: number;
}

/**
 * Smart invitation preview information.
 * Matches SmartInvitationPreviewDTO exactly.
 */
export interface SmartInvitationPreview {
  validation: SmartInvitationValidation;
  emailPreview: string;
  familyCompositionPreview: FamilyCompositionPreview[];
  acceptanceProbability: number;
  improvementSuggestions: string[];
}

/**
 * Family composition preview after invitation acceptance.
 * Matches FamilyCompositionPreviewDTO exactly.
 */
export interface FamilyCompositionPreview {
  name: string;
  roleName: string;
  relationshipToAdmin: FamilyRelationshipType;
  ageGroup: FamilyMemberAgeGroup;
  isNewMember: boolean;
  hasAdminPrivileges: boolean;
}

/**
 * Smart invitation response from the API.
 * Matches SmartInvitationResponseDTO exactly.
 */
export interface SmartInvitationResponse {
  success: boolean;
  invitationId?: number;
  invitationToken?: string;
  qrCodeUrl?: string;
  assignedRole: string;
  usedSmartRecommendation: boolean;
  warnings: string[];
  message: string;
  validationResult?: SmartInvitationValidation;
}

/**
 * Bulk smart invitation request.
 * Matches BulkSmartInvitationRequestDTO exactly.
 */
export interface BulkSmartInvitationRequest {
  invitations: SmartInvitationRequest[];
  skipValidationErrors: boolean;
  sharedMessage?: string;
}

/**
 * Bulk smart invitation response.
 * Matches BulkSmartInvitationResponseDTO exactly.
 */
export interface BulkSmartInvitationResponse {
  successfulInvitations: number;
  failedInvitations: number;
  successfulResults: SmartInvitationResponse[];
  failedResults: FailedInvitation[];
  message: string;
}

/**
 * Failed invitation details.
 * Matches FailedInvitationDTO exactly.
 */
export interface FailedInvitation {
  email: string;
  name: string;
  errors: string[];
  validationResult?: SmartInvitationValidation;
}

/**
 * Relationship type information for UI.
 * Matches RelationshipTypeDTO exactly.
 */
export interface RelationshipType {
  type: FamilyRelationshipType;
  displayName: string;
  category: string;
  recommendedRoleForAdults: string;
  recommendedRoleForChildren: string;
  isCommon: boolean;
}

// Legacy interfaces for backward compatibility
export interface InvitationValidationResult extends SmartInvitationValidation {
  suggestedRole: string;
  suggestedRoleId: number;
  familySizeWarning?: string;
}

// === SMART RELATIONSHIP CONTEXT TYPES ===

/**
 * Context information for relationship mapping based on user role and permissions
 */
export interface RelationshipContext {
  currentUserId: number;
  currentUserRole: string;
  isFamilyAdmin: boolean;
  isGlobalAdmin: boolean;
  familyId?: number;
  mappingStrategy: 'self-relative' | 'admin-relative' | 'family-relative';
}

/**
 * Smart relationship mapping configuration for different user contexts
 */
export interface SmartRelationshipMapping {
  relationshipLabel: string;
  relationshipDescription: string;
  contextualPrompt: string;
  mappingStrategy: 'self-relative' | 'admin-relative' | 'family-relative';
}

/**
 * Form data structure for smart relationship context
 */
export interface SmartRelationshipFormData {
  email: string;
  name: string;
  relationship: FamilyRelationshipType;
  dateOfBirth: string;
  personalMessage?: string;
  notes?: string;
  wantsAdminRole?: boolean;
}

/**
 * User data structure for relationship context determination
 */
export interface UserContextData {
  id: number;
  globalRole: string;
  familyRole?: string;
  isFamilyAdmin?: boolean;
  relationshipToAdmin?: FamilyRelationshipType;
}

// Family relationship types (matching backend exactly)
export enum FamilyRelationshipType {
  // Other or unspecified relationship
  Other = 0,

  // === CORE FAMILY ===
  Parent = 1,
  Child = 2,
  Spouse = 3,
  Partner = 4,
  Sibling = 5,

  // === EXTENDED FAMILY ===
  Grandparent = 6,
  Grandchild = 7,
  Aunt = 8,
  Uncle = 9,
  Cousin = 10,
  Nephew = 11,
  Niece = 12,

  // === STEP/BLENDED FAMILY ===
  Stepparent = 13,
  Stepchild = 14,
  Stepsister = 15,
  Stepbrother = 16,
  HalfSister = 17,
  HalfBrother = 18,

  // === IN-LAWS ===
  MotherInLaw = 19,
  FatherInLaw = 20,
  SisterInLaw = 21,
  BrotherInLaw = 22,
  DaughterInLaw = 23,
  SonInLaw = 24,

  // === CAREGIVERS & GUARDIANS ===
  Guardian = 25,
  Caregiver = 26,
  FosterParent = 27,
  FosterChild = 28,

  // === EXTENDED RELATIONSHIPS ===
  FamilyFriend = 29,
  Godparent = 30,
  Godchild = 31,
  Self = 32
}

// Helper functions for relationship display
export const getRelationshipDisplayName = (relationship: FamilyRelationshipType): string => {
  const relationships = {
    [FamilyRelationshipType.Other]: "Other",
    [FamilyRelationshipType.Parent]: "Parent",
    [FamilyRelationshipType.Child]: "Child", 
    [FamilyRelationshipType.Spouse]: "Spouse",
    [FamilyRelationshipType.Partner]: "Partner",
    [FamilyRelationshipType.Sibling]: "Sibling",
    [FamilyRelationshipType.Grandparent]: "Grandparent",
    [FamilyRelationshipType.Grandchild]: "Grandchild",
    [FamilyRelationshipType.Aunt]: "Aunt",
    [FamilyRelationshipType.Uncle]: "Uncle",
    [FamilyRelationshipType.Cousin]: "Cousin",
    [FamilyRelationshipType.Nephew]: "Nephew",
    [FamilyRelationshipType.Niece]: "Niece",
    [FamilyRelationshipType.Stepparent]: "Stepparent",
    [FamilyRelationshipType.Stepchild]: "Stepchild",
    [FamilyRelationshipType.Stepsister]: "Stepsister",
    [FamilyRelationshipType.Stepbrother]: "Stepbrother",
    [FamilyRelationshipType.HalfSister]: "Half-sister",
    [FamilyRelationshipType.HalfBrother]: "Half-brother",
    [FamilyRelationshipType.MotherInLaw]: "Mother-in-law",
    [FamilyRelationshipType.FatherInLaw]: "Father-in-law",
    [FamilyRelationshipType.SisterInLaw]: "Sister-in-law",
    [FamilyRelationshipType.BrotherInLaw]: "Brother-in-law",
    [FamilyRelationshipType.DaughterInLaw]: "Daughter-in-law",
    [FamilyRelationshipType.SonInLaw]: "Son-in-law",
    [FamilyRelationshipType.Guardian]: "Guardian",
    [FamilyRelationshipType.Caregiver]: "Caregiver",
    [FamilyRelationshipType.FosterParent]: "Foster Parent",
    [FamilyRelationshipType.FosterChild]: "Foster Child",
    [FamilyRelationshipType.FamilyFriend]: "Family Friend",
    [FamilyRelationshipType.Godparent]: "Godparent",
    [FamilyRelationshipType.Godchild]: "Godchild",
    [FamilyRelationshipType.Self]: "Self"
  };
  return relationships[relationship] || "Unknown";
};

// Get relationships appropriate for invitations (exclude Self)
export const getInvitableRelationships = (): Array<{ value: FamilyRelationshipType; label: string; category: string }> => {
  return [
    // Immediate Family
    { value: FamilyRelationshipType.Parent, label: "Parent", category: "Immediate Family" },
    { value: FamilyRelationshipType.Child, label: "Child", category: "Immediate Family" },
    { value: FamilyRelationshipType.Spouse, label: "Spouse", category: "Immediate Family" },
    { value: FamilyRelationshipType.Partner, label: "Partner", category: "Immediate Family" },
    { value: FamilyRelationshipType.Sibling, label: "Sibling", category: "Immediate Family" },
    
    // Extended Family
    { value: FamilyRelationshipType.Grandparent, label: "Grandparent", category: "Extended Family" },
    { value: FamilyRelationshipType.Grandchild, label: "Grandchild", category: "Extended Family" },
    { value: FamilyRelationshipType.Aunt, label: "Aunt", category: "Extended Family" },
    { value: FamilyRelationshipType.Uncle, label: "Uncle", category: "Extended Family" },
    { value: FamilyRelationshipType.Cousin, label: "Cousin", category: "Extended Family" },
    { value: FamilyRelationshipType.Nephew, label: "Nephew", category: "Extended Family" },
    { value: FamilyRelationshipType.Niece, label: "Niece", category: "Extended Family" },
    
    // Step & Blended Family
    { value: FamilyRelationshipType.Stepparent, label: "Stepparent", category: "Step & Blended" },
    { value: FamilyRelationshipType.Stepchild, label: "Stepchild", category: "Step & Blended" },
    { value: FamilyRelationshipType.Stepsister, label: "Stepsister", category: "Step & Blended" },
    { value: FamilyRelationshipType.Stepbrother, label: "Stepbrother", category: "Step & Blended" },
    { value: FamilyRelationshipType.HalfSister, label: "Half-sister", category: "Step & Blended" },
    { value: FamilyRelationshipType.HalfBrother, label: "Half-brother", category: "Step & Blended" },
    
    // In-Laws
    { value: FamilyRelationshipType.MotherInLaw, label: "Mother-in-law", category: "In-Laws" },
    { value: FamilyRelationshipType.FatherInLaw, label: "Father-in-law", category: "In-Laws" },
    { value: FamilyRelationshipType.SisterInLaw, label: "Sister-in-law", category: "In-Laws" },
    { value: FamilyRelationshipType.BrotherInLaw, label: "Brother-in-law", category: "In-Laws" },
    { value: FamilyRelationshipType.DaughterInLaw, label: "Daughter-in-law", category: "In-Laws" },
    { value: FamilyRelationshipType.SonInLaw, label: "Son-in-law", category: "In-Laws" },
    
    // Caregivers & Guardians
    { value: FamilyRelationshipType.Guardian, label: "Guardian", category: "Caregivers" },
    { value: FamilyRelationshipType.Caregiver, label: "Caregiver", category: "Caregivers" },
    { value: FamilyRelationshipType.FosterParent, label: "Foster Parent", category: "Caregivers" },
    { value: FamilyRelationshipType.FosterChild, label: "Foster Child", category: "Caregivers" },
    
    // Extended Relationships
    { value: FamilyRelationshipType.FamilyFriend, label: "Family Friend", category: "Extended" },
    { value: FamilyRelationshipType.Godparent, label: "Godparent", category: "Extended" },
    { value: FamilyRelationshipType.Godchild, label: "Godchild", category: "Extended" },
    { value: FamilyRelationshipType.Other, label: "Other", category: "Extended" },
  ];
};

// Extended family interfaces for enhanced views
export interface FamilyWithMembers extends FamilyDTO {
  members: FamilyMemberDTO[];
  myRole: string;
  memberCount: number;
} 

// === PRIMARY FAMILY TYPES ===

/**
 * Primary family status response DTO
 */
export interface PrimaryFamilyStatusDTO {
  hasPrimaryFamily: boolean;
  primaryFamily: FamilyDTO | null;
  allFamilies: FamilyDTO[];
  canSetPrimary: boolean;
}

/**
 * Set primary family request DTO
 */
export interface SetPrimaryFamilyRequest {
  familyId: number;
}

/**
 * Enhanced family list with primary family indication
 */
export interface UserFamilyWithPrimary extends FamilyDTO {
  isPrimary: boolean;
  memberRole: string;
  joinedAt: string;
  canSetAsPrimary: boolean;
}

/**
 * Primary family change notification
 */
export interface PrimaryFamilyChangeNotification {
  previousPrimaryFamily: FamilyDTO | null;
  newPrimaryFamily: FamilyDTO;
  timestamp: string;
  reason: 'user_action' | 'family_left' | 'family_deleted' | 'auto_assignment';
} 