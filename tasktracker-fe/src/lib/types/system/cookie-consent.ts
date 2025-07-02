/*
 * Cookie Consent Types
 * Copyright (c) 2025 Carlos Abril Jr
 * 
 * Cookie consent and compliance types following .cursorrules standards
 * All types properly organized in lib/types/system/ subdirectory
 */

// ================================
// COOKIE CONSENT STATE
// ================================

export interface CookieConsentState {
  hasConsented: boolean;
  consentDate?: Date;
  timestamp?: string;
  preferences: CookieConsentPreferences;
  version: string;
  isRequired: boolean;
  expiresAt?: Date;
  lastUpdated?: Date;
}

// ================================
// COOKIE CONSENT PREFERENCES
// ================================

export interface CookieConsentPreferences {
  necessary: boolean; // Always true, cannot be disabled
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
  performance: boolean;
  personalization: boolean;
}

// ================================
// COOKIE COMPLIANCE SETTINGS
// ================================

export interface CookieComplianceSettings {
  enabled: boolean;
  enableGDPR: boolean;
  enableCCPA: boolean;
  requireExplicitConsent: boolean;
  showDeclineButton: boolean;
  consentExpiryDays: number;
  enableAuditLogging: boolean;
  autoDetectRegion: boolean;
  defaultPreferences: CookieConsentPreferences;
}

// ================================
// COOKIE AUDIT LOG
// ================================

export interface CookieAuditLog {
  id: string;
  userId?: string;
  sessionId: string;
  action: CookieAuditAction;
  preferences: CookieConsentPreferences;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  consentVersion: string;
}

export type CookieAuditAction = 
  | 'consent_given'
  | 'consent_withdrawn'
  | 'preferences_updated'
  | 'cookies_cleared'
  | 'banner_shown'
  | 'banner_dismissed'
  | 'settings_viewed';

// ================================
// COOKIE CATEGORY DEFINITIONS
// ================================

export interface CookieCategory {
  id: keyof CookieConsentPreferences;
  name: string;
  description: string;
  required: boolean;
  cookies: CookieDef[];
  purposes: string[];
  retention: string;
  thirdParties?: string[];
}

export interface CookieDef {
  name: string;
  purpose: string;
  duration: string;
  type: 'session' | 'persistent' | 'secure' | 'httpOnly';
  domain: string;
  provider: string;
}

// ================================
// GDPR COMPLIANCE
// ================================

export interface GDPRConsentRecord {
  userId?: number;
  sessionId: string;
  consentString: string;
  timestamp: Date;
  ipAddress: string;
  legalBasis: 'consent' | 'legitimate_interest' | 'contract' | 'legal_obligation';
  withdrawalMethod?: string;
  dataProcessing: string[];
  retentionPeriod: number;
}

// ================================
// CONSENT MANAGEMENT
// ================================

export interface ConsentManager {
  getCurrentConsent: () => CookieConsentState;
  updatePreferences: (preferences: Partial<CookieConsentPreferences>) => Promise<void>;
  withdrawConsent: () => Promise<void>;
  resetConsent: () => Promise<void>;
  getAuditLog: () => CookieAuditLog[];
  checkCompliance: () => ComplianceStatus;
}

export interface ComplianceStatus {
  isCompliant: boolean;
  missingConsent: Array<keyof CookieConsentPreferences>;
  expiredConsent: boolean;
  requiresUpdate: boolean;
  lastCheck: Date;
} 