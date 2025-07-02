/*
 * Family Component Interfaces  
 * Centralized interface definitions for family-related components
 * Extracted from components/family/ for .cursorrules compliance
 */

import { FamilyDTO, FamilyMemberDTO } from '@/lib/types/family';
import { FamilyTaskStats, FamilyDashboardTab } from '@/lib/types/family/family-task';

// ================================
// FAMILY DETAIL INTERFACES
// ================================

export interface FamilyActionsProps {
  family: FamilyDTO;
  currentUser: {
    id: number;
    role?: string;
  };
  onLeaveFamily?: () => void;
  onDeleteFamily?: () => void;
  onEditFamily?: () => void;
  className?: string;
}

export interface FamilyLeaderboardProps {
  familyId: number;
  members: FamilyMemberDTO[];
  timeframe?: 'week' | 'month' | 'year' | 'all';
  showTopOnly?: number;
  className?: string;
}

export interface FamilyMembersListProps {
  members: FamilyMemberDTO[];
  currentUserId: number;
  onMemberAction?: (memberId: number, action: string) => void;
  showRoles?: boolean;
  showStats?: boolean;
  className?: string;
}

export interface StatisticsCardsProps {
  stats: {
    totalMembers: number;
    activeTasks: number;
    completedTasks: number;
    totalPoints: number;
    averageCompletion?: number;
    streak?: number;
  };
  loading?: boolean;
  className?: string;
}

export interface FamilyHeaderProps {
  family: FamilyDTO;
  memberCount: number;
  showActions?: boolean;
  className?: string;
}

export interface DetailTabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  className?: string;
}

export interface PrimaryFamilyBadgeProps {
  family: FamilyDTO;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  className?: string;
}

// ================================
// TASK MANAGEMENT INTERFACES
// ================================

export interface TaskFiltersProps {
  onFilterChange: (filters: unknown) => void;
  familyMembers: FamilyMemberDTO[];
  className?: string;
}

export interface BatchActionsProps {
  selectedTasks: number[];
  onBatchAction: (action: string, taskIds: number[]) => void;
  disabled?: boolean;
  className?: string;
}

export interface TaskManagementHeaderProps {
  family: FamilyDTO;
  taskCount: number;
  onCreateTask?: () => void;
  onRefresh?: () => void;
  showFilters?: boolean;
  className?: string;
}

export interface TaskListProps {
  tasks: unknown[];
  members: FamilyMemberDTO[];
  onTaskUpdate?: (taskId: number, updates: unknown) => void;
  onTaskDelete?: (taskId: number) => void;
  selectable?: boolean;
  onSelectionChange?: (selectedIds: number[]) => void;
  className?: string;
}

export interface TaskStatsCardsProps {
  stats: FamilyTaskStats;
  loading?: boolean;
  onStatClick?: (statKey: string) => void;
  className?: string;
}

// ================================
// FAMILY DASHBOARD INTERFACES
// ================================

export interface MobileControlBarProps {
  enableHaptic: boolean;
  setEnableHaptic: (enabled: boolean) => void;
  enableAnimations: boolean;
  setEnableAnimations: (enabled: boolean) => void;
  className?: string;
}

export interface DashboardHeaderProps {
  family: FamilyDTO;
  stats?: FamilyTaskStats;
  className?: string;
}

export interface LeaderboardTabProps {
  familyStats: FamilyTaskStats;
  familyMembers: FamilyMemberDTO[];
  className?: string;
}

export interface GoalsTabProps {
  familyStats: FamilyTaskStats;
  familyMembers: FamilyMemberDTO[];
  className?: string;
}

export interface AchievementsTabProps {
  familyStats: FamilyTaskStats;
  familyMembers: FamilyMemberDTO[];
  className?: string;
}

export interface OverviewTabProps {
  familyStats: FamilyTaskStats;
  familyMembers: FamilyMemberDTO[];
  enableHaptic: boolean;
  enableAnimations: boolean;
  className?: string;
}

export interface TabNavigationProps {
  activeTab: FamilyDashboardTab;
  onTabChange: (tab: FamilyDashboardTab) => void;
  isMobile?: boolean;
  className?: string;
}

export interface StatsGridProps {
  familyStats: FamilyTaskStats;
  enableAnimations: boolean;
  className?: string;
}

// ================================
// COLLABORATION INTERFACES
// ================================

export interface FamilyCollaborationProps {
  family: FamilyDTO;
  members: FamilyMemberDTO[];
  currentUser: {
    id: number;
    role?: string;
  };
  onInviteMember?: () => void;
  onAssignTask?: (taskId: number, memberId: number) => void;
  className?: string;
}

export interface FamilyInvitationProps {
  familyId: number;
  onInvitationSent?: (email: string) => void;
  maxInvitations?: number;
  className?: string;
}

export interface MemberPermissionsProps {
  member: FamilyMemberDTO;
  currentUserRole: string;
  onPermissionChange?: (memberId: number, permission: string, enabled: boolean) => void;
  className?: string;
} 
