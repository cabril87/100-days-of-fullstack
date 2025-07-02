/*
 * Enhanced Family Experience Interfaces - Moved from lib/types/enhanced-family.ts for .cursorrules compliance
 * lib/interfaces/family/enhanced-family.interface.ts
 * Copyright (c) 2025 Carlos Abril Jr
 */

import { FamilyMemberDTO, FamilyRoleDTO, FamilyRelationshipType } from '@/lib/types/family';
import { FamilyMemberAgeGroup } from '@/lib/types/auth';

// === ENHANCED INVITATION SYSTEM INTERFACES ===

export interface InvitationWizardState {
  step: 'basic' | 'relationship' | 'permissions' | 'preview' | 'sending' | 'success';
  currentStep: number;
  totalSteps: number;
  canGoBack: boolean;
  canProceed: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface InvitationPreviewData {
  recipientInfo: InvitationRecipientInfo;
  invitationText: string;
  roleAssignment: RoleAssignmentPreview;
  familyImpact: FamilyImpactAnalysis;
  sendingOptions: InvitationSendingOptions;
}

export interface InvitationRecipientInfo {
  email: string;
  name: string;
  estimatedAge: number | null;
  relationship: FamilyRelationshipType;
  relationshipDescription: string;
  profilePicture: string | null;
  previousInteractions: PreviousInteraction[];
}

export interface RoleAssignmentPreview {
  recommendedRole: FamilyRoleDTO;
  alternativeRoles: FamilyRoleDTO[];
  permissionsPreview: PermissionPreview[];
  ageAppropriate: boolean;
  conflictWarnings: string[];
}

export interface PermissionPreview {
  permission: string;
  granted: boolean;
  description: string;
  category: string;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface FamilyImpactAnalysis {
  currentSize: number;
  newSize: number;
  maxSize: number;
  compositionChange: CompositionChange;
  dynamicsImpact: DynamicsImpact;
  securityImpact: SecurityImpact;
}

export interface CompositionChange {
  adultsCount: number;
  teensCount: number;
  childrenCount: number;
  adminCount: number;
  beforeAfter: {
    before: FamilyComposition;
    after: FamilyComposition;
  };
}

export interface FamilyComposition {
  adults: number;
  teens: number;
  children: number;
  admins: number;
  totalMembers: number;
}

export interface DynamicsImpact {
  balanceScore: number; // 0-100
  relationshipComplexity: 'simple' | 'moderate' | 'complex';
  potentialConflicts: string[];
  recommendations: string[];
}

export interface SecurityImpact {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  concerns: SecurityConcern[];
  mitigations: SecurityMitigation[];
  requiresApproval: boolean;
}

export interface SecurityConcern {
  type: 'age_gap' | 'permission_escalation' | 'external_access' | 'data_exposure';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedMembers: number[];
}

export interface SecurityMitigation {
  concern: string;
  action: string;
  automatic: boolean;
  requiresConsent: boolean;
}

export interface InvitationSendingOptions {
  method: 'email' | 'sms' | 'in_app' | 'qr_code';
  scheduledFor: string | null;
  includeQr: boolean;
  customMessage: string | null;
  followUpReminders: boolean;
  expirationDays: number;
}

export interface PreviousInteraction {
  type: 'invitation_sent' | 'invitation_accepted' | 'invitation_declined' | 'family_member';
  date: string;
  familyId: number;
  familyName: string;
  outcome: string;
}

// === ADVANCED ROLE ASSIGNMENT INTERFACES ===

export interface RoleAssignmentWizardState {
  currentMember: FamilyMemberDTO | null;
  availableRoles: ExtendedRoleInfo[];
  permissionMatrix: PermissionMatrix;
  impactAnalysis: RoleChangeImpact;
  conflictResolution: ConflictResolution[];
  isLoading: boolean;
  error: string | null;
}

export interface ExtendedRoleInfo extends FamilyRoleDTO {
  memberCount: number;
  ageRequirements: AgeRequirement;
  permissionSummary: PermissionSummary;
  recommendationScore: number;
  warnings: string[];
  benefits: string[];
}

export interface AgeRequirement {
  minimumAge: number | null;
  maximumAge: number | null;
  ageGroups: FamilyMemberAgeGroup[];
  exceptions: AgeException[];
}

export interface AgeException {
  condition: string;
  allowedWith: string;
  requiresApproval: boolean;
}

export interface PermissionSummary {
  total: number;
  byCategory: Record<string, number>;
  highRisk: number;
  newPermissions: string[];
  revokedPermissions: string[];
}

export interface PermissionMatrix {
  memberId: number;
  currentPermissions: EffectivePermission[];
  proposedPermissions: EffectivePermission[];
  changes: PermissionChange[];
  conflicts: PermissionConflict[];
}

export interface EffectivePermission {
  permission: string;
  granted: boolean;
  source: 'role' | 'custom' | 'inherited' | 'age_restricted';
  canModify: boolean;
  description: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface PermissionChange {
  permission: string;
  action: 'grant' | 'revoke' | 'modify';
  reason: string;
  impact: 'low' | 'medium' | 'high';
  requiresConfirmation: boolean;
}

export interface PermissionConflict {
  permission: string;
  conflictType: 'age_restriction' | 'role_hierarchy' | 'family_policy' | 'security_concern';
  description: string;
  suggestedResolution: string;
  canAutoResolve: boolean;
}

export interface RoleChangeImpact {
  memberImpact: MemberImpact;
  familyImpact: FamilyImpact;
  securityImpact: SecurityImpact;
  taskImpact: TaskImpact;
}

export interface MemberImpact {
  permissionsGained: number;
  permissionsLost: number;
  accessLevelChange: 'increase' | 'decrease' | 'same';
  newCapabilities: string[];
  lostCapabilities: string[];
}

export interface FamilyImpact {
  adminBalance: AdminBalance;
  memberHierarchy: HierarchyChange;
  workflowChanges: WorkflowChange[];
}

export interface AdminBalance {
  currentAdmins: number;
  proposedAdmins: number;
  isBalanced: boolean;
  recommendations: string[];
}

export interface HierarchyChange {
  currentLevel: number;
  proposedLevel: number;
  affectedRelationships: string[];
  newReportingStructure: ReportingStructure[];
}

export interface ReportingStructure {
  memberId: number;
  memberName: string;
  reportsTo: number[];
  canManage: number[];
}

export interface WorkflowChange {
  workflow: string;
  impact: 'improved' | 'degraded' | 'blocked' | 'enhanced';
  description: string;
  adaptation: string | null;
}

export interface TaskImpact {
  canAssignTasks: boolean;
  canReceiveTasks: boolean;
  taskApprovalRequired: boolean;
  pointsManagement: PointsManagementImpact;
}

export interface PointsManagementImpact {
  canAwardPoints: boolean;
  canDeductPoints: boolean;
  maxPointsPerTask: number;
  requiresApproval: boolean;
}

export interface ConflictResolution {
  conflictId: string;
  type: 'automatic' | 'manual' | 'skip';
  action: string;
  confirmation: boolean;
  consequences: string[];
}

// === FAMILY PRIVACY INTERFACES ===

export interface FamilyPrivacySettings {
  familyId: number;
  visibility: FamilyVisibility;
  dataSharing: DataSharingSettings;
  memberPrivacy: MemberPrivacySettings[];
  childProtection: ChildProtectionSettings;
  externalIntegrations: ExternalIntegrationSettings[];
  auditLog: PrivacyAuditEntry[];
}

export interface FamilyVisibility {
  profileVisibility: 'public' | 'family_only' | 'admin_only' | 'private';
  taskVisibility: 'all_members' | 'age_appropriate' | 'role_based' | 'custom';
  achievementVisibility: 'public' | 'family_only' | 'private';
  activityVisibility: 'all_members' | 'parents_only' | 'admin_only';
  searchable: boolean;
  showInDirectory: boolean;
}

export interface DataSharingSettings {
  shareWithPartners: boolean;
  analyticsOptIn: boolean;
  marketingOptIn: boolean;
  researchParticipation: boolean;
  dataRetentionPeriod: number; // days
  automaticDeletion: boolean;
  exportOptions: DataExportOption[];
}

export interface DataExportOption {
  format: 'json' | 'csv' | 'pdf' | 'xml';
  scope: 'all' | 'personal' | 'family' | 'tasks' | 'achievements';
  available: boolean;
  estimatedSize: string;
}

export interface MemberPrivacySettings {
  memberId: number;
  memberName: string;
  profileVisibility: ProfileVisibility;
  taskVisibility: TaskVisibility;
  communicationPreferences: CommunicationPreferences;
  parentalControls: ParentalControlSettings;
}

export interface ProfileVisibility {
  showRealName: boolean;
  showAge: boolean;
  showAchievements: boolean;
  showTaskHistory: boolean;
  showOnlineStatus: boolean;
  customFields: CustomFieldVisibility[];
}

export interface CustomFieldVisibility {
  field: string;
  visible: boolean;
  visibleTo: 'all' | 'family' | 'parents' | 'admins' | 'self';
}

export interface TaskVisibility {
  showAssignedTasks: boolean;
  showCompletedTasks: boolean;
  showPointsEarned: boolean;
  showTaskComments: boolean;
  allowTaskSharing: boolean;
}

export interface CommunicationPreferences {
  allowDirectMessages: boolean;
  allowGroupMessages: boolean;
  allowNotifications: boolean;
  allowEmailContact: boolean;
  allowPhoneContact: boolean;
  preferredContactMethod: 'app' | 'email' | 'sms' | 'none';
}

export interface ParentalControlSettings {
  requireApprovalFor: ApprovalRequirement[];
  timeRestrictions: TimeRestriction[];
  contentFiltering: ContentFiltering;
  contactRestrictions: ContactRestriction[];
}

export interface ApprovalRequirement {
  action: string;
  required: boolean;
  approvers: number[];
  autoApprovalRules: AutoApprovalRule[];
}

export interface AutoApprovalRule {
  condition: string;
  maxValue: number | null;
  timeWindow: string | null;
  exceptions: string[];
}

export interface TimeRestriction {
  type: 'daily' | 'weekly' | 'date_range';
  startTime: string;
  endTime: string;
  daysOfWeek: number[];
  exceptions: TimeException[];
}

export interface TimeException {
  date: string;
  reason: string;
  extendedHours: boolean;
}

export interface ContentFiltering {
  enableFilter: boolean;
  filterLevel: 'strict' | 'moderate' | 'basic' | 'off';
  blockedCategories: string[];
  allowedDomains: string[];
  blockedKeywords: string[];
}

export interface ContactRestriction {
  type: 'block' | 'limit' | 'monitor';
  targetType: 'user' | 'role' | 'external';
  targetId: string;
  reason: string;
  expiresAt: string | null;
}

export interface ChildProtectionSettings {
  enableProtection: boolean;
  ageVerificationRequired: boolean;
  parentalConsentRequired: boolean;
  dataMinimization: boolean;
  automaticDeletion: AutomaticDeletion;
  reportingSettings: ReportingSettings;
}

export interface AutomaticDeletion {
  enabled: boolean;
  retentionPeriod: number; // days
  exemptions: string[];
  notificationBeforeDeletion: boolean;
}

export interface ReportingSettings {
  enableReporting: boolean;
  reportableActions: string[];
  notificationRecipients: number[];
  escalationRules: EscalationRule[];
}

export interface EscalationRule {
  trigger: string;
  action: string;
  delay: number; // minutes
  recipients: number[];
}

export interface ExternalIntegrationSettings {
  service: string;
  enabled: boolean;
  dataSharing: string[];
  permissions: string[];
  lastSync: string | null;
  syncFrequency: string;
}

export interface PrivacyAuditEntry {
  id: string;
  timestamp: string;
  action: string;
  actor: number;
  target: string;
  details: Record<string, unknown>;
  ipAddress: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface ComplianceStandard {
  name: string;
  description: string;
  required: boolean;
  compliant: boolean;
  lastChecked: string;
  actions: ComplianceAction[];
}

export interface ComplianceAction {
  action: string;
  required: boolean;
  completed: boolean;
  dueDate: string | null;
}

export interface RoleAssignment {
  memberId: number;
  roleId: number;
  customPermissions: string[];
  reason: string;
} 
