/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * System Component Props - Moved from lib/types/system/ for .cursorrules compliance
 * Following FAMILY-AUTH-IMPLEMENTATION-CHECKLIST.md enterprise standards
 */

import React from 'react';
import { User } from '@/lib/types/auth/auth';
import { AdminStats, AdminActivityItem, AdminSystemMetrics } from '@/lib/types/system/admin';

// ============================================================================
// PROVIDER COMPONENT PROPS
// ============================================================================

export interface ThemeProviderProps {
  children: React.ReactNode;
  attribute?: 'class' | 'data-theme';
  defaultTheme?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
  storageKey?: string;
  themes?: string[];
  forcedTheme?: string;
  value?: Record<string, string>;
}

export interface SidebarProviderProps {
  children: React.ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export interface AuthProviderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
}

export interface UserContextProviderProps {
  children: React.ReactNode;
  initialUser?: Record<string, unknown> | null;
  onUserChange?: (user: Record<string, unknown> | null) => void;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
}

// ============================================================================
// DASHBOARD COMPONENT PROPS
// ============================================================================

// DashboardContentProps moved to lib/props/components/dashboard.props.ts
// export interface DashboardContentProps {
  className?: string;
  userId: number;
  familyId: number;
  widgets: Array<Record<string, unknown>>;
  layout: 'grid' | 'masonry' | 'list';
  onLayoutChange?: (layout: string) => void;
  onWidgetAdd?: (widget: Record<string, unknown>) => void;
  onWidgetRemove?: (widgetId: string) => void;
  onWidgetReorder?: (widgets: Array<Record<string, unknown>>) => void;
  isCustomizable?: boolean;
  showAddWidget?: boolean;
}

export interface DashboardConnectionsProps {
  className?: string;
  familyId: number;
  userId: number;
  onConnectionStatusChange?: (status: string) => void;
  onError?: (error: Error) => void;
  autoConnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

// ============================================================================
// ADMIN COMPONENT PROPS
// ============================================================================

export interface AdminDashboardContentProps {
  user: User;
  initialData: {
    stats: AdminStats;
    recentActivity?: AdminActivityItem[];
    systemMetrics?: AdminSystemMetrics;
  };
  className?: string;
  adminLevel?: 'super' | 'family' | 'organization';
  permissions?: string[];
  onPermissionRequest?: (permission: string) => void;
  onActionExecute?: (action: string, data: Record<string, unknown>) => void;
  showSystemHealth?: boolean;
  showUserManagement?: boolean;
  showFamilyManagement?: boolean;
  showAuditLogs?: boolean;
  refreshInterval?: number;
}

// ============================================================================
// ACTIVITY COMPONENT PROPS  
// ============================================================================

export interface FamilyActivityStreamProps {
  className?: string;
  familyId: number;
  activities: Array<Record<string, unknown>>;
  onActivityClick?: (activity: Record<string, unknown>) => void;
  onLoadMore?: () => void;
  onRefresh?: () => void;
  showFilters?: boolean;
  showGrouping?: boolean;
  showLiveUpdates?: boolean;
  maxVisible?: number;
  groupBy?: 'date' | 'member' | 'type' | 'category';
  filterBy?: Array<string>;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

// ============================================================================
// LAYOUT COMPONENT PROPS
// ============================================================================

export interface MainLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  sidebarOpen?: boolean;
  onSidebarToggle?: () => void;
  showBreadcrumbs?: boolean;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  isolate?: boolean;
  resetKeys?: Array<unknown>;
  resetOnPropsChange?: boolean;
} 