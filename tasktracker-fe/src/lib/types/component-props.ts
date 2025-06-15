/*
 * Component Props Type Definitions
 * Copyright (c) 2025 Carlos Abril Jr
 * 
 * All component prop interfaces following Family Auth Implementation Checklist
 * Centralized component interface definitions for consistent typing
 */

import { User } from './auth';
import { FamilyDTO, FamilyMemberDTO } from './family-invitation';
import { Task } from './task';

// Page Content Component Props
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

// ===== FAMILY COMPONENT PROPS =====
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

// ===== TASK COMPONENT PROPS =====
export interface TaskCreationModalProps {
  user: User;
  family?: FamilyDTO | null;
  families?: FamilyDTO[];
  onTaskCreated?: (task?: Task) => void;
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  editingTask?: Task | null;
  defaultContext?: 'individual' | 'family' | 'template';
  defaultFamilyId?: number;
  showTemplateOptions?: boolean;
}

export interface SmartInvitationWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export interface FamilySeedingPanelProps {
  user: User;
}

// ===== AUTHENTICATION COMPONENT PROPS =====
export interface MFASetupWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export interface MFAStatusCardContainerProps {
  user: User;
}

export interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

// ===== LAYOUT COMPONENT PROPS =====
export interface NavbarProps {
  user: User | null;
  onLogout: () => void;
}

export interface SidebarProps {
  user: User | null;
}

// ===== UI COMPONENT PROPS =====
export interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose?: () => void;
}

export interface SpinnerProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: 'blue' | 'emerald' | 'amber' | 'purple' | 'red' | 'green';
  gradient?: boolean;
  description?: string;
  trend?: {
    value: number;
    isIncreasing: boolean;
  };
  className?: string;
}

export interface ProgressCardProps {
  title: string;
  progress: number;
  total: number;
  color?: string;
  icon?: React.ReactNode;
  className?: string;
}

export interface GamificationCardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  badge?: {
    text: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  children?: React.ReactNode;
}

export interface DateTimePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export interface DecorativeLinesProps {
  variant?: 'horizontal' | 'vertical' | 'diagonal';
  count?: number;
  className?: string;
}

// ===== THEME COMPONENT PROPS =====
export interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onThemeSelect?: (themeId: string) => void;
}

export interface ThemePreviewCardProps {
  theme: {
    id: string;
    name: string;
    preview: string;
    isPremium: boolean;
    price?: number;
  };
  onSelect: (themeId: string) => void;
  isSelected?: boolean;
}

export interface ThemeCardProps {
  theme: {
    id: string;
    name: string;
    preview: string;
    description: string;
    price: number;
    isPremium: boolean;
    tags: string[];
  };
  onPurchase: (themeId: string) => void;
  isPurchased?: boolean;
}

// ===== MODAL COMPONENT PROPS =====
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

export interface CompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  variant?: 'success' | 'info' | 'warning';
}

// ===== SKELETON COMPONENT PROPS =====
export interface SkeletonWrapperProps {
  isLoading: boolean;
  children: React.ReactNode;
  fallback: React.ReactNode;
  className?: string;
}

export interface WithSkeletonProps {
  loading: boolean;
  children: React.ReactNode;
}

export interface SkeletonContainerProps {
  className?: string;
  children: React.ReactNode;
}

export interface InvitationAcceptanceFlowSkeletonProps {
  showAvatar?: boolean;
  showBadges?: boolean;
  showDescription?: boolean;
  className?: string;
}

export interface GameStatsGridSkeletonProps {
  itemCount?: number;
  showTrends?: boolean;
  showIcons?: boolean;
  columns?: number;
  className?: string;
}

export interface AchievementGridSkeletonProps {
  itemCount?: number;
  showBadges?: boolean;
  showProgress?: boolean;
  columns?: number;
  className?: string;
}

export interface MFASetupStepsSkeletonProps {
  stepCount?: number;
  showIcons?: boolean;
  showProgress?: boolean;
  className?: string;
}

// ===== FORM COMPONENT TYPE HELPERS =====
export type FormFieldContextValue<
  TFieldValues extends Record<string, unknown> = Record<string, unknown>,
  TName extends keyof TFieldValues = keyof TFieldValues
> = {
  name: TName;
};

export type FormItemContextValue = {
  id: string;
};

export type ChartContextProps = {
  config: Record<string, unknown>;
};

export type SetupStep = 'instructions' | 'qr-code' | 'verification' | 'backup-codes' | 'complete';

// ===== PROGRESSIVE FORM PROPS =====
export interface FormStep {
  id: string;
  title: string;
  description?: string;
  fields: React.ReactNode;
  validation?: () => boolean;
}

export interface ProgressiveFormProps {
  steps: FormStep[];
  onComplete: (data: Record<string, unknown>) => void;
  className?: string;
}

export interface FamilyTaskManagementPageProps {
  user: User;
  familyId: number;
} 