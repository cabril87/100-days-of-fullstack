/*
 * Auth Component Interfaces
 * Centralized interface definitions for authentication-related components
 * Extracted from components/auth/ for .cursorrules compliance
 */

import { FamilyMemberAgeGroup } from '@/lib/types/auth/auth';

// ================================
// MAIN AUTH INTERFACES
// ================================

export interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  requiredAgeGroup?: FamilyMemberAgeGroup;
  redirectTo?: string;
  fallback?: React.ReactNode;
  className?: string;
}

export interface MFASetupWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSetupComplete?: () => void;
  currentStep?: number;
  skipable?: boolean;
  enforced?: boolean;
  className?: string;
}

export interface SecurityQuestionSetupFormProps {
  onComplete: (questions: Array<{
    question: string;
    answer: string;
  }>) => void;
  onCancel?: () => void;
  requiredQuestions?: number;
  availableQuestions?: string[];
  isLoading?: boolean;
  className?: string;
}

// ================================
// MFA INTERFACES
// ================================

export interface MFAStatusCardContainerProps {
  showSetupWizard?: boolean;
  onSetupComplete?: () => void;
  compact?: boolean;
  className?: string;
}

export interface MFAVerificationFormProps {
  method: 'app' | 'sms' | 'email' | 'backup';
  onVerificationComplete: (code: string) => void;
  onResendCode?: () => void;
  onChangeMethod?: (method: string) => void;
  isLoading?: boolean;
  error?: string;
  className?: string;
}

export interface MFABackupCodesProps {
  codes: string[];
  onCodeUsed?: (code: string) => void;
  onRegenerateCodes?: () => void;
  showUsed?: boolean;
  className?: string;
}

export interface MFADeviceManagementProps {
  devices: Array<{
    id: string;
    name: string;
    type: 'app' | 'sms' | 'email';
    lastUsed?: Date;
    isActive: boolean;
  }>;
  onDeviceRemove?: (deviceId: string) => void;
  onDeviceRename?: (deviceId: string, newName: string) => void;
  onAddDevice?: () => void;
  className?: string;
}

// ================================
// LOGIN & REGISTRATION INTERFACES
// ================================

export interface LoginFormProps {
  onLogin: (credentials: {
    emailOrUsername: string;
    password: string;
    rememberMe?: boolean;
  }) => void;
  onForgotPassword?: () => void;
  onRegister?: () => void;
  isLoading?: boolean;
  error?: string;
  allowSocialLogin?: boolean;
  className?: string;
}

export interface RegisterFormProps {
  onRegister: (data: {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    ageGroup: FamilyMemberAgeGroup;
  }) => void;
  onLogin?: () => void;
  isLoading?: boolean;
  error?: string;
  requireEmailVerification?: boolean;
  className?: string;
}

export interface ForgotPasswordFormProps {
  onSubmit: (email: string) => void;
  onBackToLogin?: () => void;
  isLoading?: boolean;
  error?: string;
  success?: boolean;
  className?: string;
}

export interface ResetPasswordFormProps {
  token: string;
  onSubmit: (data: {
    password: string;
    confirmPassword: string;
  }) => void;
  isLoading?: boolean;
  error?: string;
  success?: boolean;
  className?: string;
}

// ================================
// SECURITY INTERFACES
// ================================

export interface SecuritySettingsProps {
  currentSettings: {
    mfaEnabled: boolean;
    securityQuestionsSet: boolean;
    sessionTimeout: number;
    loginNotifications: boolean;
    suspiciousActivityAlerts: boolean;
  };
  onSettingsUpdate: (settings: unknown) => void;
  onChangePassword?: () => void;
  onDownloadBackupCodes?: () => void;
  className?: string;
}

export interface PasswordStrengthIndicatorProps {
  password: string;
  showRequirements?: boolean;
  minLength?: number;
  requireNumbers?: boolean;
  requireSpecialChars?: boolean;
  requireUppercase?: boolean;
  className?: string;
}

export interface SessionManagementProps {
  sessions: Array<{
    id: string;
    device: string;
    location?: string;
    lastActive: Date;
    isCurrent: boolean;
    ipAddress?: string;
  }>;
  onTerminateSession?: (sessionId: string) => void;
  onTerminateAllOther?: () => void;
  onRefresh?: () => void;
  className?: string;
}

// ================================
// VERIFICATION INTERFACES
// ================================

export interface EmailVerificationProps {
  email: string;
  onResendVerification?: () => void;
  onChangeEmail?: () => void;
  isLoading?: boolean;
  className?: string;
}

export interface PhoneVerificationProps {
  phoneNumber: string;
  onVerificationComplete: (code: string) => void;
  onResendCode?: () => void;
  onChangeNumber?: () => void;
  isLoading?: boolean;
  error?: string;
  className?: string;
}

// ================================
// SOCIAL AUTH INTERFACES
// ================================

export interface SocialLoginButtonProps {
  provider: 'google' | 'github' | 'microsoft' | 'apple';
  onLogin: (provider: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'minimal';
  className?: string;
}

export interface SocialAccountLinkingProps {
  linkedAccounts: Array<{
    provider: string;
    email: string;
    linkedAt: Date;
    isVerified: boolean;
  }>;
  onLinkAccount?: (provider: string) => void;
  onUnlinkAccount?: (provider: string) => void;
  onVerifyAccount?: (provider: string) => void;
  className?: string;
} 