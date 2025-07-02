/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * Auth Component Props - Moved from lib/types/auth/ for .cursorrules compliance
 * Following FAMILY-AUTH-IMPLEMENTATION-CHECKLIST.md enterprise standards
 */

import React, { ReactNode } from 'react';
import { User } from '@/lib/types/auth/auth';

// ============================================================================
// MFA COMPONENT PROPS (FROM TYPES/AUTH/AUTH.TS)
// ============================================================================

export interface MFASetupWizardProps {
  className?: string;
  onComplete?: (codes: string[]) => void;
  onCancel?: () => void;
  showSkipOption?: boolean;
  enforced?: boolean;
}

export interface MFAStatusCardProps {
  className?: string;
  isEnabled: boolean;
  onEnable?: () => void;
  onDisable?: () => void;
  onViewBackupCodes?: () => void;
  showActions?: boolean;
}

export interface MFADisableDialogProps {
  className?: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => Promise<void>;
  loading?: boolean;
  error?: string;
}

export interface MFABackupCodesDialogProps {
  className?: string;
  isOpen: boolean;
  onClose: () => void;
  codes: string[];
  onDownload?: () => void;
  onPrint?: () => void;
  onRegenerate?: () => Promise<void>;
}

export interface MFAVerificationFormProps {
  className?: string;
  onSubmit: (code: string) => Promise<void>;
  onResend?: () => Promise<void>;
  onUseBackupCode?: () => void;
  loading?: boolean;
  error?: string;
  showBackupOption?: boolean;
  timeRemaining?: number;
  maxAttempts?: number;
  attemptsRemaining?: number;
  resendCooldown?: number;
  autoFocus?: boolean;
  digits?: number;
}

// ============================================================================
// PASSWORD RESET COMPONENT PROPS (FROM TYPES/AUTH/AUTH.TS)
// ============================================================================

export interface ResetPasswordContentProps {
  className?: string;
  token?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  showStrengthIndicator?: boolean;
}

// ============================================================================
// FAMILY DETAIL COMPONENT PROPS (FROM TYPES/AUTH/AUTH.TS)
// ============================================================================

export interface FamilyDetailPageProps {
  familyId: number;
  className?: string;
}

export interface FamilyDetailContentProps {
  className?: string;
  familyId: number;
  initialData?: Record<string, unknown>;
  onUpdate?: () => void;
  showEditOptions?: boolean;
  showMemberManagement?: boolean;
  showInviteOptions?: boolean;
}

// ============================================================================
// CUSTOMER SUPPORT COMPONENT PROPS (FROM TYPES/AUTH/AUTH.TS)
// ============================================================================

export interface CustomerSupportContentProps {
  user: User;
  className?: string;
  userId?: number;
  ticketId?: string;
  showUserSearch?: boolean;
  showTicketHistory?: boolean;
  onUserSelect?: (userId: number) => void;
  onTicketCreate?: (ticket: Record<string, unknown>) => void;
  adminMode?: boolean;
}

// ============================================================================
// LOGIN & REGISTRATION COMPONENT PROPS
// ============================================================================

export interface LoginFormProps {
  className?: string;
  onSubmit: (credentials: { email: string; password: string }) => Promise<void>;
  onForgotPassword?: () => void;
  onRegister?: () => void;
  loading?: boolean;
  error?: string;
  showRememberMe?: boolean;
  showSocialLogin?: boolean;
  redirectTo?: string;
}

export interface RegisterFormProps {
  className?: string;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  onLogin?: () => void;
  loading?: boolean;
  error?: string;
  showTermsAcceptance?: boolean;
  showAgeVerification?: boolean;
  requireEmailVerification?: boolean;
}

export interface ForgotPasswordFormProps {
  className?: string;
  onSubmit: (email: string) => Promise<void>;
  onBack?: () => void;
  loading?: boolean;
  error?: string;
  successMessage?: string;
}

// ============================================================================
// AUTH LAYOUT COMPONENT PROPS
// ============================================================================

export interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showLogo?: boolean;
  showBackButton?: boolean;
  onBack?: () => void;
  className?: string;
  backgroundVariant?: 'default' | 'gradient' | 'pattern';
}

export interface AuthFormWrapperProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  footer?: ReactNode;
  className?: string;
  showLogo?: boolean;
  centered?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg';
}

// ============================================================================
// PROFILE COMPONENT PROPS
// ============================================================================

export interface ProfileHeaderProps {
  className?: string;
  user: Record<string, unknown>;
  onAvatarChange?: (file: File) => Promise<void>;
  onEdit?: () => void;
  showEditButton?: boolean;
  showStats?: boolean;
  showBadges?: boolean;
  isEditable?: boolean;
}

export interface ProfileFormProps {
  user: {
    id: number;
    email: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    avatar?: string;
    bio?: string;
    timezone?: string;
    preferences?: Record<string, unknown>;
  };
  onUpdate: (updates: Record<string, unknown>) => void;
  onError?: (error: string) => void;
  isLoading?: boolean;
  className?: string;
  showAvatar?: boolean;
  showBio?: boolean;
  showTimezone?: boolean;
  showPreferences?: boolean;
}

// ============================================================================
// SECURITY COMPONENT PROPS
// ============================================================================

export interface SecurityDashboardProps {
  className?: string;
  user: Record<string, unknown>;
  securityMetrics: Record<string, unknown>;
  onRefresh?: () => void;
  showDevices?: boolean;
  showSessions?: boolean;
  showSecurityLog?: boolean;
}

export interface DeviceManagementProps {
  className?: string;
  devices: Array<Record<string, unknown>>;
  onDeviceRevoke?: (deviceId: string) => Promise<void>;
  onDeviceRename?: (deviceId: string, name: string) => Promise<void>;
  showCurrentDevice?: boolean;
  allowRevokeAll?: boolean;
}

export interface SessionManagementProps {
  className?: string;
  sessions: Array<Record<string, unknown>>;
  onSessionRevoke?: (sessionId: string) => Promise<void>;
  onRevokeAllOthers?: () => Promise<void>;
  showCurrentSession?: boolean;
  showGeoLocation?: boolean;
}

// ============================================================================
// AUTH CORE PROPS
// ============================================================================

export interface LoginProps {
  onSuccess?: (user: unknown) => void;
  onError?: (error: string) => void;
  redirectTo?: string;
  className?: string;
  showSignupLink?: boolean;
  showForgotPassword?: boolean;
  mode?: 'modal' | 'page';
}

export interface SignupProps {
  onSuccess?: (user: unknown) => void;
  onError?: (error: string) => void;
  redirectTo?: string;
  className?: string;
  showLoginLink?: boolean;
  requireEmailVerification?: boolean;
  mode?: 'modal' | 'page';
}

export interface ForgotPasswordProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  onBackToLogin?: () => void;
  className?: string;
  mode?: 'modal' | 'page';
}

export interface ResetPasswordProps {
  token: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

export interface EmailVerificationProps {
  token?: string;
  email?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  onResend?: () => void;
  className?: string;
}

// ============================================================================
// AUTH FORM PROPS
// ============================================================================

export interface AuthInputProps {
  name: string;
  type: 'text' | 'email' | 'password' | 'tel';
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  autoComplete?: string;
  className?: string;
  showPasswordToggle?: boolean;
}

export interface AuthButtonProps {
  type?: 'submit' | 'button';
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

export interface SocialAuthProps {
  providers: Array<{
    id: string;
    name: string;
    icon: ReactNode;
    color: string;
  }>;
  onProviderClick: (providerId: string) => void;
  className?: string;
  loading?: boolean;
  disabled?: boolean;
}

// ============================================================================
// AUTH PROTECTION PROPS
// ============================================================================

export interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string;
  fallback?: ReactNode;
  requireAuth?: boolean;
  requiredRoles?: string[];
  fallbackComponent?: ReactNode;
  redirectTo?: string;
  onUnauthorized?: () => void;
  className?: string;
}

export interface AuthGuardProps {
  children: ReactNode;
  condition: (user: unknown) => boolean;
  fallback: ReactNode;
  loading?: ReactNode;
  className?: string;
}

export interface RoleBasedAccessProps {
  children: ReactNode;
  allowedRoles: string[];
  userRole?: string;
  fallback?: ReactNode;
  strict?: boolean;
  className?: string;
}

// ============================================================================
// MFA PROPS
// ============================================================================

export interface MFASetupProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  onError?: (error: string) => void;
  method?: 'totp' | 'sms' | 'email';
  className?: string;
}

export interface MFAVerificationProps {
  onSuccess?: (token: string) => void;
  onError?: (error: string) => void;
  onResend?: () => void;
  method: 'totp' | 'sms' | 'email';
  identifier?: string;
  className?: string;
  autoSubmit?: boolean;
}

export interface TOTPCodeInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  error?: string;
  className?: string;
  autoFocus?: boolean;
  onComplete?: (code: string) => void;
}

// ============================================================================
// PROFILE MANAGEMENT PROPS
// ============================================================================

export interface PasswordChangeFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  requireCurrentPassword?: boolean;
  isLoading?: boolean;
  className?: string;
}

export interface AccountSettingsProps {
  user: unknown;
  onUpdate: (updates: Record<string, unknown>) => void;
  onDeactivate?: () => void;
  onDelete?: () => void;
  className?: string;
  showDangerZone?: boolean;
  showSecuritySettings?: boolean;
  showPrivacySettings?: boolean;
}

// ============================================================================
// SESSION MANAGEMENT PROPS
// ============================================================================

export interface SessionListProps {
  sessions: Array<{
    id: string;
    deviceName: string;
    deviceType: 'desktop' | 'mobile' | 'tablet';
    ipAddress: string;
    location?: string;
    lastActive: Date;
    isCurrent: boolean;
  }>;
  onRevoke: (sessionId: string) => void;
  onRevokeAll: () => void;
  className?: string;
}

export interface DeviceInfoProps {
  device: {
    name: string;
    type: 'desktop' | 'mobile' | 'tablet';
    os?: string;
    browser?: string;
    ipAddress: string;
    location?: string;
    lastActive: Date;
    isCurrent: boolean;
  };
  onRevoke?: () => void;
  compact?: boolean;
  className?: string;
} 