/*
 * Enhanced Authentication Interfaces - Advanced UX Features
 * Copyright (c) 2025 Carlos Abril Jr
 * 
 * CURSORRULES COMPLIANT: All auth interfaces extracted from lib/types/
 */

// Import base types directly from session-management until interface is created
import { SecurityLevel } from '@/lib/types/auth';

// Temporary interface definitions until session-management interfaces are extracted
export interface SecurityEventDTO {
  id: string;
  type: string;
  timestamp: string;
  severity: SecurityLevel;
  description: string;
}

export interface UserSessionDTO {
  id: string;
  userId: number;
  deviceInfo: string;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
  createdAt: string;
  lastActivity: string;
}

// === ENHANCED PASSWORD RESET INTERFACES ===

export interface PasswordResetFlowState {
  step: 'request' | 'verification' | 'reset' | 'success';
  email: string | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  expiresAt: string | null;
  attemptsRemaining: number;
}

export interface PasswordResetMetrics {
  timeToReset: number;
  securityQuestionsUsed: boolean;
  mfaRequired: boolean;
  deviceTrusted: boolean;
}

export interface PasswordStrengthIndicator {
  score: number; // 0-100
  level: 'weak' | 'fair' | 'good' | 'strong' | 'excellent';
  suggestions: string[];
  requirements: PasswordRequirement[];
}

export interface PasswordRequirement {
  rule: string;
  met: boolean;
  description: string;
}

// === ACCOUNT LOCKOUT & SECURITY INTERFACES ===

export interface AccountLockoutStatus {
  isLocked: boolean;
  lockReason: LockReason;
  lockExpiry: string | null;
  attemptsRemaining: number;
  canUnlock: boolean;
  unlockMethods: UnlockMethod[];
  securityContact: string | null;
}

export enum LockReason {
  FAILED_LOGIN = 'failed_login',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  ADMIN_ACTION = 'admin_action',
  POLICY_VIOLATION = 'policy_violation',
  MFA_FAILURES = 'mfa_failures'
}

export interface UnlockMethod {
  method: 'email_verification' | 'admin_approval' | 'security_questions' | 'time_based';
  available: boolean;
  description: string;
  estimatedTime: string;
}

// === ENHANCED SESSION MANAGEMENT INTERFACES ===

export interface SessionDetailView extends UserSessionDTO {
  riskScore: number;
  trustScore: number;
  activitySummary: SessionActivity[];
  geoLocation: GeoLocationInfo;
  securityEvents: SecurityEventDTO[];
  canTerminate: boolean;
  canTrust: boolean;
}

export interface SessionActivity {
  timestamp: string;
  action: string;
  endpoint: string;
  success: boolean;
  riskLevel: SecurityLevel;
}

export interface GeoLocationInfo {
  city: string | null;
  country: string | null;
  coordinates: [number, number] | null;
  timezone: string | null;
  isp: string | null;
  isVpn: boolean;
  riskLevel: SecurityLevel;
}

export interface SessionManagementDashboard {
  overview: SessionOverview;
  activeSessions: SessionDetailView[];
  recentActivity: SessionActivity[];
  securityRecommendations: SessionSecurityRecommendation[];
  trustedDevices: TrustedDeviceInfo[];
}

export interface SessionOverview {
  totalActiveSessions: number;
  trustedSessions: number;
  suspiciousSessions: number;
  averageSessionDuration: number;
  lastSecurityScan: string;
  overallRiskScore: number;
}

export interface SessionSecurityRecommendation {
  id: string;
  type: 'terminate_session' | 'enable_mfa' | 'trust_device' | 'review_activity';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  actionRequired: boolean;
  canAutoFix: boolean;
}

export interface TrustedDeviceInfo {
  deviceId: string;
  name: string;
  type: string;
  trustLevel: number;
  lastVerified: string;
  trustExpiry: string;
  canRevoke: boolean;
  location: GeoLocationInfo;
}

// === ENHANCED LOGIN EXPERIENCE INTERFACES ===

export interface LoginAttemptResult {
  success: boolean;
  requiresMfa: boolean;
  requiresVerification: boolean;
  lockoutInfo: AccountLockoutStatus | null;
  securityAlert: SecurityAlert | null;
  redirectTo: string | null;
  sessionCreated: boolean;
}

export interface SecurityAlert {
  type: 'new_device' | 'new_location' | 'suspicious_activity' | 'policy_change';
  severity: SecurityLevel;
  message: string;
  dismissible: boolean;
  actionRequired: boolean;
  actionUrl: string | null;
}

export interface DeviceRecognition {
  isRecognized: boolean;
  deviceFingerprint: string;
  lastSeenLocation: string | null;
  lastSeenAt: string | null;
  riskScore: number;
  requiresVerification: boolean;
}

// === ROLE-BASED PERMISSION ENHANCEMENT INTERFACES ===
// NOTE: These are AUTH-SPECIFIC permission interfaces, distinct from family permission interfaces

export interface AuthPermissionMatrix {
  userId: number;
  globalRole: string;
  familyPermissions: AuthFamilyPermissionSet[];
  effectivePermissions: AuthEffectivePermission[];
  inheritedPermissions: AuthInheritedPermission[];
  permissionConflicts: AuthPermissionConflict[];
}

export interface AuthFamilyPermissionSet {
  familyId: number;
  familyName: string;
  role: string;
  permissions: string[];
  inherited: boolean;
  customizations: AuthPermissionCustomization[];
}

export interface AuthEffectivePermission {
  permission: string;
  granted: boolean;
  source: 'global' | 'family' | 'inherited' | 'custom';
  familyId: number | null;
  canOverride: boolean;
}

export interface AuthInheritedPermission {
  permission: string;
  inheritedFrom: string;
  familyId: number;
  canRevoke: boolean;
}

export interface AuthPermissionConflict {
  permission: string;
  conflictType: 'role_mismatch' | 'family_override' | 'age_restriction';
  description: string;
  resolution: string;
  autoResolvable: boolean;
}

export interface AuthPermissionCustomization {
  permission: string;
  granted: boolean;
  reason: string;
  grantedBy: number;
  grantedAt: string;
  expiresAt: string | null;
} 
