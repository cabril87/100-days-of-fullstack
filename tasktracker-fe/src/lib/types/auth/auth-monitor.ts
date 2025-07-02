/*
 * Auth Monitor Types
 * Copyright (c) 2025 Carlos Abril Jr
 * 
 * Authentication monitoring types following .cursorrules standards
 * All interfaces properly organized in lib/types/auth/ subdirectory
 */

import type { User } from './auth';

// ============================================================================
// AUTH MONITOR TYPES
// According to .cursorrules: All types must be in lib/types/ subdirectories
// ============================================================================

// ================================
// HEALTH STATUS TYPES
// ================================

export type HealthStatusLevel = 
  | 'healthy'
  | 'warning'
  | 'critical'
  | 'unknown'
  | 'initializing'
  | 'error';

// ================================
// AUTH HEALTH STATUS
// ================================

export interface AuthHealthStatus {
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitializing: boolean;
  isInitialized: boolean;
  isReady: boolean;
  user: any | null; // Will be typed properly when User interface is available
  level: HealthStatusLevel;
  lastCheck: Date | null;
  errorMessage?: string;
}

// ================================
// AUTH MONITOR CONFIG
// ================================

export interface AuthMonitorConfig {
  checkInterval: number;
  retryAttempts: number;
  timeout: number;
  enableLogging: boolean;
  healthCheckEndpoint: string;
}

// ================================
// AUTH MONITOR STATE
// ================================

export interface AuthMonitorState {
  status: HealthStatusLevel;
  isMonitoring: boolean;
  lastUpdate: Date | null;
  consecutiveFailures: number;
  metrics: AuthMetrics;
}

// ================================
// AUTH METRICS
// ================================

export interface AuthMetrics {
  totalChecks: number;
  successfulChecks: number;
  failedChecks: number;
  averageResponseTime: number;
  lastResponseTime: number;
  uptime: number;
}

// ================================
// ADDITIONAL AUTH MONITORING TYPES
// ================================

export interface AuthMonitoringStatus {
  level: HealthStatusLevel;
  message: string;
  timestamp: Date;
  details?: Record<string, unknown>;
}

// ================================
// AUTH SESSION MONITORING
// ================================

export interface AuthSessionStatus {
  isActive: boolean;
  expiresAt?: Date;
  lastActivity?: Date;
  sessionId?: string;
  deviceInfo?: {
    userAgent: string;
    ip: string;
    location?: string;
  };
}

// ================================
// AUTH ERROR MONITORING
// ================================

export interface AuthErrorEvent {
  type: 'login_failed' | 'token_expired' | 'session_invalid' | 'permission_denied';
  message: string;
  timestamp: Date;
  userId?: number;
  details?: Record<string, unknown>;
} 