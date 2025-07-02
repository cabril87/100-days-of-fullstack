/*
 * Main Component Props
 * Copyright (c) 2025 Carlos Abril Jr
 * 
 * All main component prop interfaces following .cursorrules standards
 * Extracted from lib/types/ and properly organized in lib/props/
 */

import { ReactNode } from 'react';
import { User } from '@/lib/types/auth';
import { FamilyDTO, FamilyMemberDTO } from '@/lib/types/family';
import { Task } from '@/lib/types/tasks';
import { 
  SessionDetailView,
  SecurityAlert,
  TrustedDeviceInfo
} from '@/lib/interfaces/auth/enhanced-auth.interface';
import { UserFamilyWithPrimary } from '@/lib/types/family';

// ================================
// PAGE CONTENT COMPONENT PROPS
// ================================

export interface FamiliesContentProps {
  user: User | null;
}

export interface GamificationContentProps {
  user: User;
}

export interface FamilySeedingPageContentProps {
  user: User | null;
}

export interface UserCreationPageContentProps {
  user: User | null;
}

export interface StageLandingPageProps {
  stage: 'development' | 'alpha' | 'beta' | 'staging' | 'production';
}

// ================================
// FAMILY COMPONENT PROPS
// ================================

export interface FamilyTaskDashboardProps {
  user: User;
  family?: FamilyDTO;
  familyMembers?: FamilyMemberDTO[];
}

export interface FamilyTaskManagementProps {
  user: User;
  family: FamilyDTO;
  familyMembers: FamilyMemberDTO[];
}

export interface FamilyTaskManagementPageProps {
  user: User;
  familyId: number;
}

export interface FamilySeedingPanelProps {
  user: User;
}

export interface PrimaryFamilySelectorProps {
  families: UserFamilyWithPrimary[];
  onSelectPrimary: (familyId: number) => Promise<void>;
  isLoading?: boolean;
  className?: string;
  showRoleInfo?: boolean;
}

export interface PrimaryFamilyBadgeProps {
  familyName: string;
  className?: string;
  variant?: 'default' | 'compact';
}

// ================================
// TASK COMPONENT PROPS
// ================================

export interface TaskCreationModalProps {
  user: User;
  family?: FamilyDTO | null;
  families?: FamilyDTO[];
  onTaskCreated?: (task?: Task) => void;
  trigger?: ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  editingTask?: Task | null;
  defaultContext?: 'individual' | 'family' | 'template';
  defaultFamilyId?: number;
  showTemplateOptions?: boolean;
}

export interface TaskEditFormProps {
  task: Task;
  onSave: (task: Task) => void;
  onCancel: () => void;
}

export interface TaskDetailsSheetContentProps {
  task: Task;
  isEditing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: (task: Task) => void;
  onClose: () => void;
  familyMembers: FamilyMemberDTO[];
}

// ================================
// AUTHENTICATION COMPONENT PROPS
// ================================

export interface MFASetupWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSetupComplete: (result: unknown) => void;
  preferredMethod?: 'email' | 'sms' | 'app' | 'hardware';
  skipBackupCodes?: boolean;
}

export interface MFAStatusCardContainerProps {
  user: User;
}

export interface EnhancedPasswordResetFormProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
  showSecurityQuestions?: boolean;
  allowMfaBypass?: boolean;
}

export interface SecuritySettingsProps {
  userId: number;
  onSecurityUpdate?: (type: string, success: boolean) => void;
  showAdvancedOptions?: boolean;
  allowDeviceManagement?: boolean;
}

export interface DeviceManagementProps {
  userId: number;
  devices: TrustedDeviceInfo[];
  onDeviceRevoked: (deviceId: string) => void;
  onDeviceTrusted: (deviceId: string, trusted: boolean) => void;
  allowBulkOperations?: boolean;
}

export interface SessionManagementProps {
  userId: number;
  sessions: SessionDetailView[];
  onSessionTerminated: (sessionId: string) => void;
  showLocationInfo?: boolean;
  allowBulkTermination?: boolean;
}

export interface SecurityAuditLogProps {
  userId: number;
  logs: unknown[];
  showDetails?: boolean;
  allowExport?: boolean;
  maxEntries?: number;
}

export interface SecurityAlertsProps {
  alerts: SecurityAlert[];
  onAlertDismissed: (alertId: string) => void;
  onAlertAction: (alertId: string, action: string) => void;
  maxAlertsToShow?: number;
  autoRefresh?: boolean;
}

// ================================
// INVITATION & FAMILY MANAGEMENT PROPS
// ================================

export interface SmartInvitationWizardProps {
  familyId: number;
  isOpen: boolean;
  onClose: () => void;
  onInvitationSent: (invitation: unknown) => void;
  showAdvancedOptions?: boolean;
  allowBulkInvitations?: boolean;
}

export interface FamilyInvitationManagerProps {
  familyId: number;
  onInvitationSent: (invitation: unknown) => void;
  onInvitationCancelled: (invitationId: number) => void;
  showPendingInvitations?: boolean;
  allowBulkOperations?: boolean;
}

export interface EnhancedFamilyManagementProps {
  familyId: number;
  isAdmin: boolean;
  onFamilyUpdated: (family: unknown) => void;
  onMemberRoleChanged: (memberId: number, newRole: string) => void;
  showAdvancedSettings?: boolean;
  allowMemberManagement?: boolean;
}

export interface FamilySecurityDashboardProps {
  familyId: number;
  isParent: boolean;
  onSecuritySettingChanged: (setting: string, value: unknown) => void;
  showChildProtectionFeatures?: boolean;
  allowParentalControls?: boolean;
}

export interface FamilyPrivacySettingsProps {
  familyId: number;
  currentSettings: unknown;
  onSettingsUpdated: (settings: unknown) => void;
  showAdvancedPrivacy?: boolean;
  allowDataExport?: boolean;
}

export interface RoleAssignmentWizardProps {
  familyId: number;
  memberId: number;
  currentRole: string;
  onRoleAssigned: (newRole: string) => void;
  showRolePermissions?: boolean;
  allowCustomPermissions?: boolean;
}

// ================================
// UNIFIED DASHBOARD PROPS
// ================================

export interface DashboardStats {
  tasksCompleted: number;
  activeGoals: number;
  focusTime: number;
  totalPoints: number;
  streakDays: number;
  familyMembers: number;
  familyTasks: number;
  familyPoints: number;
  totalFamilies: number;
}

export interface DashboardInitialData {
  recentTasks: Task[];
  stats: DashboardStats;
  family: FamilyDTO | null;
  taskStats?: {
    totalTasks: number;
    completedTasks: number;
    activeTasks: number;
    overdueTasks: number;
    pendingTasks: number;
    completionRate: number;
    averageCompletionTime: number;
    streakDays: number;
    longestStreak: number;
    pointsEarned: number;
  };
}

export interface DashboardProps {
  user: User | null;
  mode: 'simple' | 'advanced';
  initialData?: DashboardInitialData;
  onTaskCreated?: () => void;
  onModeChange?: (mode: 'simple' | 'advanced') => void;
}

// Legacy interfaces for backwards compatibility
export interface SimpleDashboardProps extends Omit<DashboardProps, 'mode' | 'onModeChange'> {
  mode?: 'simple';
}

export interface AdvancedDashboardProps extends Omit<DashboardProps, 'mode'> {
  mode: 'advanced';
}

// ================================
// PERMISSION & QUEST PROPS
// ================================

export interface PermissionRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequest: (permission: string, reason: string) => void;
  permissionType: 'notification' | 'camera' | 'microphone' | 'location';
}

// ================================
// CELEBRATION & GAMIFICATION PROPS
// ================================

export interface EnhancedCelebrationSystemProps {
  userId?: number;
  familyId?: number;
  className?: string;
  onCelebrationComplete?: () => void;
  enableConfetti?: boolean;
  enableSound?: boolean;
  enableToasts?: boolean;
  enableCelebrationCards?: boolean;
  enableSoundEffects?: boolean;
  celebrationType?: 'achievement' | 'level-up' | 'task-complete' | 'streak' | 'milestone';
  celebrationIntensity?: 'low' | 'medium' | 'high' | 'epic' | 'minimal' | 'moderate' | 'maximum' | 'full';
  familyMemberAgeGroup?: 'kid' | 'teen' | 'adult' | 'Adult';
  intensity?: 'low' | 'medium' | 'high' | 'epic';
  duration?: number;
  familyFriendly?: boolean;
  ageGroup?: 'kid' | 'teen' | 'adult';
  autoTrigger?: boolean;
}


