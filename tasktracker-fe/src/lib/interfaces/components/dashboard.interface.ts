/*
 * Dashboard Component Interfaces
 * Centralized interface definitions for dashboard-related components
 * Extracted from components/dashboard/ for .cursorrules compliance
 */

import { FamilyMemberAgeGroup } from '@/lib/types/auth';
import { DashboardContentProps } from '@/lib/props/widgets/main.props';

// ================================
// AGE-SPECIFIC DASHBOARD INTERFACES
// ================================

export interface KidDashboardProps extends DashboardContentProps {
  parentalControls?: {
    timeLimit?: number;
    allowedFeatures?: string[];
    requireApproval?: boolean;
  };
  className?: string;
}

export interface TeenDashboardProps extends DashboardContentProps {
  freedomLevel?: 'restricted' | 'moderate' | 'high';
  allowedActivities?: string[];
  className?: string;
}

export interface AdultDashboardProps extends DashboardContentProps {
  adminFeatures?: boolean;
  familyManagement?: boolean;
  className?: string;
}

// ================================
// PERMISSION INTERFACES
// ================================

export interface PermissionRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequest: (permission: string, reason: string) => void;
  permissionType: 'screen_time' | 'task_creation' | 'family_invite' | 'points_spending';
  currentUser: {
    id: number;
    ageGroup: FamilyMemberAgeGroup;
  };
  parentalContact?: {
    name: string;
    email: string;
  };
  className?: string;
}

// ================================
// WIDGET INTERFACES
// ================================

export interface DashboardWidgetProps {
  title: string;
  isLoading?: boolean;
  error?: string;
  onRefresh?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export interface FocusModeDashboardWidgetProps {
  onStartFocus?: () => void;
  currentSession?: {
    id: string;
    startTime: Date;
    plannedDuration: number;
    isActive: boolean;
  };
  recentSessions?: Array<{
    id: string;
    duration: number;
    completed: boolean;
    date: Date;
  }>;
  className?: string;
}

export interface AnalyticsDashboardWidgetProps {
  timeframe?: 'day' | 'week' | 'month' | 'year';
  metrics?: Array<{
    label: string;
    value: number;
    change?: number;
    trend?: 'up' | 'down' | 'stable';
  }>;
  onTimeframeChange?: (timeframe: string) => void;
  className?: string;
}

// ================================
// NAVIGATION INTERFACES
// ================================

export interface DashboardNavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  userRole: string;
  availableSections: Array<{
    id: string;
    label: string;
    icon?: React.ReactNode;
    disabled?: boolean;
  }>;
  className?: string;
}

export interface QuickActionsProps {
  actions: Array<{
    id: string;
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
    badge?: string | number;
  }>;
  maxVisible?: number;
  className?: string;
}

// ================================
// STATS & METRICS INTERFACES
// ================================

export interface DashboardStatsProps {
  stats: {
    tasksCompleted: number;
    activeGoals: number;
    focusTime: number;
    totalPoints: number;
    streakDays: number;
    familyMembers: number;
    familyTasks: number;
    familyPoints: number;
  };
  timeframe?: 'today' | 'week' | 'month';
  showComparisons?: boolean;
  className?: string;
}

export interface ProgressOverviewProps {
  progress: Array<{
    label: string;
    current: number;
    total: number;
    color?: string;
  }>;
  showPercentages?: boolean;
  layout?: 'horizontal' | 'vertical' | 'grid';
  className?: string;
}

// ================================
// NOTIFICATION INTERFACES
// ================================

export interface DashboardNotificationsProps {
  notifications: Array<{
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
    actions?: Array<{
      label: string;
      onClick: () => void;
    }>;
  }>;
  maxVisible?: number;
  onMarkAsRead?: (notificationId: string) => void;
  onMarkAllAsRead?: () => void;
  className?: string;
}

// ================================
// LAYOUT INTERFACES
// ================================

export interface DashboardLayoutProps {
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  sidebarCollapsed?: boolean;
  onSidebarToggle?: () => void;
  className?: string;
}

export interface DashboardGridProps {
  widgets: Array<{
    id: string;
    component: React.ReactNode;
    gridArea?: string;
    minWidth?: number;
    minHeight?: number;
  }>;
  columns?: number;
  gap?: number;
  responsive?: boolean;
  className?: string;
} 