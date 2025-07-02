/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * Settings Component Props - Moved from lib/types/system/settings.ts for .cursorrules compliance
 * Following FAMILY-AUTH-IMPLEMENTATION-CHECKLIST.md enterprise standards
 */

import type { User } from '@/lib/types/auth';
import type { 
  SecurityDashboardDTO,
  ExtendedUserSessionDTO,
  UserDeviceDTO
} from '@/lib/types';

// ============================================================================
// SETTINGS CONTENT COMPONENT PROPS
// ============================================================================

export interface ProfileSettingsContentProps {
  user: User;
}

export interface SecuritySettingsContentProps {
  user: User;
  initialData: {
    securityDashboard: SecurityDashboardDTO | null;
    sessions: ExtendedUserSessionDTO[];
    devices: UserDeviceDTO[];
    mfaStatus: {
      enabled: boolean;
      setupDate: string | null;
      backupCodesRemaining: number;
    };
  };
}

export interface NotificationSettingsContentProps {
  user: User | null;
}

export interface AppearanceSettingsContentProps {
  user: User | null;
}

export interface FamilyManagementContentProps {
  user: User | null;
}

// ============================================================================
// SETTINGS NAVIGATION COMPONENT PROPS
// ============================================================================

export interface SettingsNavigationProps {
  className?: string;
  currentSection: string;
  onSectionChange: (section: string) => void;
  isMobile?: boolean;
}

export interface SettingsSectionProps {
  className?: string;
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  loading?: boolean;
  error?: string;
}

export interface SettingsFormProps {
  className?: string;
  onSubmit: (data: Record<string, unknown>) => void;
  loading?: boolean;
  error?: string;
  success?: boolean;
  children: React.ReactNode;
}

// ============================================================================
// SETTINGS LAYOUT COMPONENT PROPS
// ============================================================================

export interface SettingsLayoutProps {
  className?: string;
  currentSection: string;
  user: User | null;
  children: React.ReactNode;
  isMobile?: boolean;
} 