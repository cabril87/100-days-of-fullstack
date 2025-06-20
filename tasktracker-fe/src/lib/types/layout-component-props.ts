/*
 * Layout Component Props Type Definitions
 * Copyright (c) 2025 Carlos Abril Jr
 * 
 * All layout component prop interfaces following Family Auth Implementation Checklist
 * Centralized layout component interface definitions for consistent typing
 */

import { ReactNode } from 'react';
import { User } from './auth';

// ================================
// NAVIGATION COMPONENTS
// ================================

export interface NavbarProps {
  user?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    avatar?: string;
  };
  onMenuClick?: () => void;
  showMenuButton?: boolean;
  className?: string;
  showSearch?: boolean;
  showNotifications?: boolean;
  showUserMenu?: boolean;
}

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User;
  className?: string;
  variant?: 'default' | 'compact' | 'minimal';
}

// ================================
// DASHBOARD LAYOUT COMPONENTS
// ================================

export interface DashboardLayoutProps {
  children: ReactNode;
  user: User;
  showSidebar?: boolean;
  sidebarCollapsed?: boolean;
  onSidebarToggle?: () => void;
  className?: string;
}

export interface DashboardHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
  className?: string;
}

export interface DashboardContentProps {
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

// ================================
// MODAL COMPONENTS
// ================================

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  preventClickOutside?: boolean;
  className?: string;
}

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info' | 'success';
  isLoading?: boolean;
}

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  position?: 'left' | 'right' | 'top' | 'bottom';
  size?: 'sm' | 'md' | 'lg';
  title?: string;
  children: ReactNode;
  className?: string;
}

// ================================
// CONTAINER COMPONENTS
// ================================

export interface ContainerProps {
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

export interface SectionProps {
  children: ReactNode;
  title?: string;
  description?: string;
  headerActions?: ReactNode;
  className?: string;
  variant?: 'default' | 'card' | 'bordered';
}

export interface GridProps {
  children: ReactNode;
  columns?: number | { sm?: number; md?: number; lg?: number; xl?: number };
  gap?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

// ================================
// PAGE LAYOUT COMPONENTS
// ================================

export interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
  actions?: ReactNode;
  sidebar?: ReactNode;
  className?: string;
}

export interface AuthLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  showLogo?: boolean;
  backgroundVariant?: 'default' | 'gradient' | 'pattern';
  className?: string;
}

export interface ErrorLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  showBackButton?: boolean;
  showHomeButton?: boolean;
  className?: string;
}

// ================================
// RESPONSIVE COMPONENTS
// ================================

export interface ResponsiveContainerProps {
  children: ReactNode;
  breakpoints?: {
    sm?: ReactNode;
    md?: ReactNode;
    lg?: ReactNode;
    xl?: ReactNode;
  };
  className?: string;
}

export interface MobileOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
}

export interface DesktopOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
} 