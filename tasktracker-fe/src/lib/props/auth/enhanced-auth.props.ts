/*
 * Enhanced Authentication Component Props
 * Copyright (c) 2025 Carlos Abril Jr
 * 
 * CURSORRULES COMPLIANT: All auth component props extracted from lib/types/
 */

import { 
  LoginAttemptResult, 
  AccountLockoutStatus,
  AuthPermissionMatrix 
} from '../../interfaces/auth/enhanced-auth.interface';

// === ENHANCED AUTH COMPONENT PROPS ===

export interface EnhancedLoginFormProps {
  onLoginSuccess: (result: LoginAttemptResult) => void;
  onMfaRequired: (userId: number) => void;
  onAccountLocked: (lockoutInfo: AccountLockoutStatus) => void;
  showDeviceRecognition: boolean;
  rememberDevice: boolean;
}

export interface SessionManagementPanelProps {
  userId: number;
  isAdminView: boolean;
  onSessionTerminated: (sessionId: number) => void;
  onDeviceTrusted: (deviceId: string) => void;
}

export interface PasswordResetWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  showSecurityQuestions: boolean;
  allowMfaBypass: boolean;
}

export interface AccountLockoutDialogProps {
  isOpen: boolean;
  lockoutInfo: AccountLockoutStatus;
  onUnlockRequested: (method: string) => void;
  onClose: () => void;
}

export interface AuthPermissionMatrixViewerProps {
  userId: number;
  permissionMatrix: AuthPermissionMatrix;
  familyId?: number;
  editable: boolean;
  onPermissionChanged: (permission: string, granted: boolean) => void;
  showInherited: boolean;
} 