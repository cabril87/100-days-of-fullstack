/*
 * UI Component Types & Interfaces
 * Copyright (c) 2025 Carlos Abril Jr
 */

import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';
import { User } from './auth';

// Stats Card Types
export interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  variant?: 'blue' | 'emerald' | 'amber' | 'purple' | 'red' | 'green';
  gradient?: boolean;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
}

export interface ProgressCardProps {
  title: string;
  current: number;
  total: number;
  unit?: string;
  icon?: LucideIcon;
  variant?: 'blue' | 'emerald' | 'amber' | 'purple' | 'red' | 'green';
}

// Gamification Types
export interface GamificationBadgesProps {
  user: User;
  streakDays: number;
  achievements: number;
}

export interface GamificationCardProps {
  title: string;
  children: ReactNode;
  className?: string;
  icon?: LucideIcon;
  variant?: 'default' | 'premium' | 'achievement';
}

// Layout Types
export interface AppLayoutProps {
  children: ReactNode;
}

export interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export interface NavbarProps {
  onMenuToggle: () => void;
  isSidebarOpen: boolean;
}

// Theme Types
export interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface ThemePreviewCardProps {
  theme: {
    id: string;
    name: string;
    description: string;
    price: number;
    preview: string;
    isOwned: boolean;
    isActive: boolean;
  };
  onSelect: (themeId: string) => void;
  onPurchase: (themeId: string) => void;
}

export interface ThemeCardProps {
  theme: {
    id: string;
    name: string;
    description: string;
    price: number;
    preview: string;
    colors: {
      primary: string;
      secondary: string;
      accent: string;
    };
    isOwned: boolean;
    isActive: boolean;
  };
  onSelect: (themeId: string) => void;
  onPurchase: (themeId: string) => void;
}

// Form Types
export interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
}

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export interface DecorativeLinesProps {
  className?: string;
  variant?: 'default' | 'gradient' | 'dashed';
}

export interface DateTimePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

// Protected Route Types
export interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string;
  fallback?: ReactNode;
} 