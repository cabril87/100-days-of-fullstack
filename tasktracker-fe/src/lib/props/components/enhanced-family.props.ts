/*
 * Enhanced Family Component Props - Moved from lib/types/enhanced-family.ts for .cursorrules compliance
 * lib/props/components/enhanced-family.props.ts
 * Copyright (c) 2025 Carlos Abril Jr
 */

import { InvitationDTO, FamilyRoleDTO } from '@/lib/types/family';
import type { 
  FamilyPrivacySettings,
  RoleAssignment,
  ComplianceStandard
} from '@/lib/interfaces/family/enhanced-family.interface';

// ================================
// ENHANCED FAMILY COMPONENT PROPS
// ================================

export interface EnhancedInvitationWizardProps {
  familyId: number;
  isOpen: boolean;
  onClose: () => void;
  onInvitationSent: (invitation: InvitationDTO) => void;
  showAdvancedOptions: boolean;
  allowBulkInvitations: boolean;
}

export interface RoleAssignmentPanelProps {
  memberId: number;
  familyId: number;
  currentRole: FamilyRoleDTO;
  onRoleChanged: (newRole: FamilyRoleDTO) => void;
  showImpactAnalysis: boolean;
  allowCustomPermissions: boolean;
}

export interface FamilyPrivacyDashboardProps {
  familyId: number;
  isAdmin: boolean;
  onSettingsChanged: (settings: FamilyPrivacySettings) => void;
  showChildProtection: boolean;
  allowExport: boolean;
}

export interface MultiUserRoleAssignmentProps {
  familyId: number;
  memberIds: number[];
  onBulkRoleChange: (assignments: RoleAssignment[]) => void;
  showConflictResolution: boolean;
}

export interface PrivacyComplianceViewProps {
  familyId: number;
  complianceStandards: ComplianceStandard[];
  onComplianceUpdated: (standard: string, compliant: boolean) => void;
} 
