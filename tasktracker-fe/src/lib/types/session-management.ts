/*
 * Session Management Types - TypeScript interfaces matching backend DTOs
 * Copyright (c) 2025 Carlos Abril Jr
 */

// Session DTOs matching backend exactly
export interface UserSessionDTO {
  id: number;
  userId: number;
  username: string;
  sessionToken: string;
  deviceId: string;
  deviceName: string | null;
  deviceType: string;
  ipAddress: string;
  userAgent: string;
  location: string | null;
  isActive: boolean;
  isTrusted: boolean;
  createdAt: string;
  lastActivityAt: string;
  expiresAt: string;
}

// Extended session interface for UI components
export interface ExtendedUserSessionDTO extends UserSessionDTO {
  isCurrentDevice?: boolean;
}

export interface SessionManagementDTO {
  activeSessions: UserSessionDTO[];
  totalSessions: number;
  trustedDevicesCount: number;
  suspiciousActivityCount: number;
}

export interface UserDeviceDTO {
  id: string;
  name: string | null;
  type: string;
  operatingSystem: string | null;
  browser: string | null;
  ipAddress: string;
  location: string | null;
  isTrusted: boolean;
  isCurrentDevice: boolean;
  firstSeenAt: string;
  lastSeenAt: string;
  sessionCount: number;
}

export interface SecurityEventDTO {
  id: number;
  userId: number;
  eventType: SecurityEventType;
  description: string;
  ipAddress: string;
  deviceId: string | null;
  location: string | null;
  isResolved: boolean;
  createdAt: string;
  resolvedAt: string | null;
  metadata: Record<string, unknown> | null;
}

export interface SecurityDashboardDTO {
  securityScore: number;
  securityLevel: SecurityLevel;
  activeSessions: UserSessionDTO[];
  trustedDevices: UserDeviceDTO[];
  recentEvents: SecurityEventDTO[];
  recommendations: SecurityRecommendationDTO[];
  lastSecurityScan: string;
}

export interface SecurityRecommendationDTO {
  id: string;
  type: SecurityRecommendationType;
  priority: SecurityPriority;
  title: string;
  description: string;
  actionRequired: boolean;
  actionUrl: string | null;
  dismissible: boolean;
  createdAt: string;
}

// Enums
export enum SecurityEventType {
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILED = 'login_failed',
  PASSWORD_CHANGED = 'password_changed',
  MFA_ENABLED = 'mfa_enabled',
  MFA_DISABLED = 'mfa_disabled',
  DEVICE_TRUSTED = 'device_trusted',
  DEVICE_UNTRUSTED = 'device_untrusted',
  SESSION_TERMINATED = 'session_terminated',
  SUSPICIOUS_LOGIN = 'suspicious_login',
  DATA_EXPORT_REQUESTED = 'data_export_requested',
  ACCOUNT_LOCKED = 'account_locked',
  PERMISSION_GRANTED = 'permission_granted',
  PERMISSION_DENIED = 'permission_denied'
}

export enum SecurityLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum SecurityRecommendationType {
  ENABLE_MFA = 'enable_mfa',
  UPDATE_PASSWORD = 'update_password',
  REVIEW_SESSIONS = 'review_sessions',
  TRUST_DEVICE = 'trust_device',
  REMOVE_DEVICE = 'remove_device',
  REVIEW_PERMISSIONS = 'review_permissions',
  UPDATE_RECOVERY_INFO = 'update_recovery_info'
}

export enum SecurityPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Session action DTOs
export interface SessionTerminateDTO {
  sessionId: number;
  reason?: string;
}

export interface DeviceTrustDTO {
  deviceId: string;
  trusted: boolean;
  name?: string;
}

export interface SecuritySettingsUpdateDTO {
  mfaEnabled?: boolean;
  sessionTimeoutMinutes?: number;
  trustedDevicesEnabled?: boolean;
  loginNotificationsEnabled?: boolean;
}

// Security analytics DTOs
export interface SecurityAnalyticsDTO {
  loginAttempts: LoginAttemptStats[];
  deviceActivity: DeviceActivityStats[];
  securityTrends: SecurityTrendData[];
  riskFactors: SecurityRiskFactor[];
}

export interface LoginAttemptStats {
  date: string;
  successfulLogins: number;
  failedLogins: number;
  uniqueDevices: number;
  suspiciousAttempts: number;
}

export interface DeviceActivityStats {
  deviceId: string;
  deviceName: string;
  sessionCount: number;
  totalDuration: number;
  lastActivity: string;
  riskScore: number;
}

export interface SecurityTrendData {
  metric: string;
  timeframe: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

export interface SecurityRiskFactor {
  factor: string;
  severity: SecurityPriority;
  description: string;
  recommendation: string;
  affectsSecurityScore: boolean;
}

// Family security DTOs (for parental oversight)
export interface FamilySecurityOverviewDTO {
  familyId: number;
  totalMembers: number;
  securityCompliantMembers: number;
  averageSecurityScore: number;
  memberSecuritySummaries: MemberSecuritySummaryDTO[];
  familySecurityEvents: SecurityEventDTO[];
}

export interface MemberSecuritySummaryDTO {
  userId: number;
  username: string;
  displayName: string;
  securityScore: number;
  securityLevel: SecurityLevel;
  mfaEnabled: boolean;
  trustedDevicesCount: number;
  lastLogin: string;
  riskFactors: string[];
}

// ===== USER SECURITY TYPES (for regular users, non-admin endpoints) =====

/**
 * DTO for terminating a user session - User Security endpoint
 */
export interface TerminateSessionRequestDTO {
  sessionToken: string;
}

/**
 * DTO for updating device trust status - User Security endpoint
 */
export interface UpdateDeviceTrustRequestDTO {
  trusted: boolean;
  deviceName?: string;
}

/**
 * DTO for user security overview information - User Security endpoint
 */
export interface UserSecurityOverviewDTO {
  mfaEnabled: boolean;
  activeSessionsCount: number;
  trustedDevicesCount: number;
  totalDevicesCount: number;
  lastSecurityScan: string;
  securityScore: number;
}

// ===== CONDITIONAL SERVICE TYPES =====

/**
 * Types for conditional service usage based on user role
 */
export interface ConditionalSecurityService {
  isAdminMode: boolean;
  userRole: string;
}

/**
 * Security service method signatures that work for both admin and user endpoints
 */
export interface SecurityServiceMethods {
  getSecurityDashboard(): Promise<SecurityDashboardDTO | UserSecurityOverviewDTO>;
  getActiveSessions(): Promise<ExtendedUserSessionDTO[]>;
  getUserDevices(): Promise<UserDeviceDTO[]>;
  terminateSession(sessionToken: string): Promise<void>;
  updateDeviceTrust(deviceId: string, trusted: boolean, deviceName?: string): Promise<void>;
} 