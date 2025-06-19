/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 */

import type { FamilyDTO, FamilyMemberDTO } from '@/lib/types/family-invitation';
import type { User } from '@/lib/types/auth';
import type { FamilyPrivacySettings } from '@/lib/types/enhanced-family';

/**
 * Props for FamilyPrivacyDashboard component
 */
export interface FamilyPrivacyDashboardProps {
  familyId: number;
  isAdmin: boolean;
  onSettingsChanged: (settings: FamilyPrivacySettings) => void;
  showChildProtection?: boolean;
  allowExport?: boolean;
}

/**
 * Props for FamilyTaskDashboard component
 */
export interface FamilyTaskDashboardProps {
  user: User;
  family: FamilyDTO;
  familyMembers: FamilyMemberDTO[];
}

/**
 * Props for FamilyManagement component
 */
export interface FamilyManagementProps {
  user: User;
  familyId?: number;
}

/**
 * Props for family member components
 */
export interface FamilyMemberProps {
  member: FamilyMemberDTO;
  isCurrentUser?: boolean;
  showActions?: boolean;
  onMemberUpdate?: (member: FamilyMemberDTO) => void;
} 