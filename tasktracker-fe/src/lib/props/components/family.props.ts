/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * Family Component Props - Moved from lib/types/family/ for .cursorrules compliance
 * Following FAMILY-AUTH-IMPLEMENTATION-CHECKLIST.md enterprise standards
 */

import React, { ReactNode } from 'react';
import type { 
  FamilyDTO, 
  FamilyMemberDTO,
  FamilyTaskItemDTO,
  FamilyTaskStats,
  FamilyWithMembers
} from '@/lib/types';
import type { Task } from '@/lib/types/tasks';

// ============================================================================
// FAMILY INVITATION COMPONENT PROPS
// ============================================================================

export interface EnhancedInvitationWizardProps {
  className?: string;
  onComplete?: (data: Record<string, unknown>) => void;
  onCancel?: () => void;
  familyId?: number;
  preselectedRole?: string;
  showRoleSelection?: boolean;
  showPrivacyOptions?: boolean;
}

export interface RoleAssignmentPanelProps {
  className?: string;
  availableRoles: Array<{ id: string; name: string; permissions: string[] }>;
  selectedRole?: string;
  onRoleSelect: (roleId: string) => void;
  showPermissions?: boolean;
  disabled?: boolean;
}

export interface FamilyPrivacyDashboardProps {
  className?: string;
  familyId: number;
  privacySettings: Record<string, unknown>;
  onSettingsChange: (settings: Record<string, unknown>) => void;
  showAdvancedOptions?: boolean;
  readOnly?: boolean;
}

export interface MultiUserRoleAssignmentProps {
  className?: string;
  familyMembers: Array<Record<string, unknown>>;
  availableRoles: Array<{ id: string; name: string; permissions: string[] }>;
  currentAssignments: Record<number, string>;
  onAssignmentChange: (userId: number, roleId: string) => void;
  showBulkActions?: boolean;
  disabled?: boolean;
}

export interface PrivacyComplianceViewProps {
  className?: string;
  familyId: number;
  complianceData: Record<string, unknown>;
  onRefresh?: () => void;
  showDetails?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

// ============================================================================
// FAMILY DASHBOARD COMPONENT PROPS
// ============================================================================

export interface FamilyOverviewProps {
  className?: string;
  familyId: number;
  members: Array<Record<string, unknown>>;
  stats: Record<string, unknown>;
  onMemberClick?: (memberId: number) => void;
  showActions?: boolean;
  compact?: boolean;
}

export interface FamilyMemberCardProps {
  className?: string;
  member: Record<string, unknown>;
  onClick?: () => void;
  showRole?: boolean;
  showStatus?: boolean;
  showActions?: boolean;
  actionMenu?: React.ReactNode;
}

export interface FamilyInvitationListProps {
  className?: string;
  invitations: Array<Record<string, unknown>>;
  onInvite?: () => void;
  onResend?: (invitationId: number) => void;
  onCancel?: (invitationId: number) => void;
  showActions?: boolean;
  maxVisible?: number;
}

// ============================================================================
// FAMILY SETTINGS COMPONENT PROPS
// ============================================================================

export interface FamilySettingsProps {
  className?: string;
  familyId: number;
  settings: Record<string, unknown>;
  onSettingsChange: (settings: Record<string, unknown>) => void;
  sections?: Array<{ id: string; title: string; component: React.ComponentType }>;
  defaultSection?: string;
}

export interface FamilyPermissionsProps {
  className?: string;
  familyId: number;
  permissions: Record<string, unknown>;
  onPermissionChange: (permission: string, value: boolean) => void;
  groupedByCategory?: boolean;
  showDescriptions?: boolean;
}

// ============================================================================
// FAMILY CORE PROPS
// ============================================================================

export interface FamiliesContentProps {
  user: { 
    id: number; 
    username: string; 
    email: string; 
  };
}

export interface FamilyHeaderProps {
  family: FamilyDTO;
  userRole: string;
  onEdit?: () => void;
  onLeave?: () => void;
  onManageMembers?: () => void;
  className?: string;
}

export interface FamilyMembersListProps {
  members: FamilyMemberDTO[];
  currentUserRole?: string;
  onMemberAction?: (memberId: number, action: 'edit' | 'remove' | 'promote') => void;
  className?: string;
}

export interface FamilyActionsProps {
  family: FamilyDTO;
  userRole: string;
  onEdit: () => void;
  onLeave: () => void;
  onInviteMembers: () => void;
  onManageSettings: () => void;
  onViewStats: () => void;
  isLoading?: boolean;
  className?: string;
}

export interface FamilyLeaderboardProps {
  familyId: number;
  members: FamilyMemberDTO[];
  timeRange?: 'week' | 'month' | 'quarter' | 'year';
  metric?: 'points' | 'tasks' | 'achievements';
  className?: string;
}

// ============================================================================
// FAMILY TASK MANAGEMENT PROPS
// ============================================================================

export interface TaskManagementHeaderProps {
  family: FamilyDTO;
  isLoading: boolean;
  isBatchMode: boolean;
  onCreateTask: () => void;
  onRefreshTasks: () => void;
  onToggleBatchMode: () => void;
}

export interface FamilyTaskListProps {
  filteredTasks: FamilyTaskItemDTO[];
  isBatchMode: boolean;
  selectedTasks: Set<number>;
  familyMembers: FamilyMemberDTO[];
  onSelectTask: (taskId: number, checked: boolean) => void;
  getPriorityColor: (priority: string) => string;
  getPriorityIcon: (priority: string) => React.ReactNode;
  getMemberAvatar: (memberId: number) => FamilyMemberDTO | undefined;
  formatTaskTitle: (title: string) => string;
}

export interface TaskStatsCardsProps {
  stats: FamilyTaskStats;
  familyMembers: FamilyMemberDTO[];
  timeRange?: 'week' | 'month' | 'quarter';
  className?: string;
}

export interface FamilyTaskFiltersProps {
  onFilterChange: (filters: {
    status?: string;
    assignee?: number;
    priority?: string;
    dueDate?: string;
  }) => void;
  familyMembers: FamilyMemberDTO[];
  className?: string;
}

export interface BatchActionsProps {
  isBatchMode: boolean;
  selectedTasks: Set<number>;
  filteredTasks: FamilyTaskItemDTO[];
  isSelectAllChecked: boolean;
  onSelectAll: (checked: boolean) => void;
  onBatchComplete: () => void;
  onBatchDelete: () => void;
}

// ============================================================================
// FAMILY DASHBOARD PROPS
// ============================================================================

export interface DashboardHeaderProps {
  family: FamilyDTO;
  stats: FamilyTaskStats;
  onRefresh: () => void;
  className?: string;
}

export interface FamilyTabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabs: Array<{ id: string; label: string; count?: number }>;
  className?: string;
}

export interface OverviewTabProps {
  family: FamilyDTO;
  stats: FamilyTaskStats;
  recentTasks: FamilyTaskItemDTO[];
  familyMembers: FamilyMemberDTO[];
  onTaskAction: (action: string, taskId: number) => void;
  className?: string;
}

export interface StatsGridProps {
  stats: FamilyTaskStats;
  timeRange?: 'week' | 'month' | 'quarter';
  className?: string;
}

export interface FamilyMobileControlBarProps {
  onFilterToggle: () => void;
  onSortToggle: () => void;
  onCreateTask: () => void;
  filterCount?: number;
  className?: string;
}

export interface LeaderboardTabProps {
  familyId: number;
  members: FamilyMemberDTO[];
  timeRange: 'week' | 'month' | 'quarter';
  metric: 'points' | 'tasks' | 'achievements';
}

export interface GoalsTabProps {
  familyId: number;
  goals: Array<{
    id: number;
    title: string;
    progress: number;
    target: number;
    dueDate?: Date;
  }>;
}

export interface AchievementsTabProps {
  familyId: number;
  achievements: Array<{
    id: number;
    name: string;
    description: string;
    icon: string;
    unlockedBy?: string[];
    unlockedAt?: Date;
  }>;
}

// ============================================================================
// FAMILY DETAILS PROPS
// ============================================================================

export interface DetailTabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabs: Array<{ id: string; label: string; icon?: ReactNode }>;
  className?: string;
}

export interface StatisticsCardsProps {
  family: FamilyDTO;
  stats: FamilyTaskStats;
  timeRange?: 'week' | 'month' | 'quarter';
  className?: string;
}

// ============================================================================
// FAMILY BADGE PROPS
// ============================================================================

export interface PrimaryFamilyBadgeProps {
  family: FamilyDTO;
  size?: 'sm' | 'md' | 'lg';
  showMembers?: boolean;
  className?: string;
} 