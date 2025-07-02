/*
 * Cookie Consent Management Types
 * Copyright (c) 2025 Carlos Abril Jr
 * GDPR/CCPA compliant cookie consent system
 */

export interface CookieConsentPreferences {
  necessary: boolean;     // Always true - required for basic functionality
  functional: boolean;    // Device tracking, user preferences, trusted devices
  analytics: boolean;     // Usage analytics, performance monitoring
  marketing: boolean;     // Cross-device tracking, personalized ads
}

export interface CookieConsentState {
  hasChoiceMade: boolean;
  timestamp: string;
  version: string;        // For consent versioning (GDPR requirement)
  preferences: CookieConsentPreferences;
  ipAddress?: string;     // For compliance audit trail
  userAgent?: string;     // For compliance audit trail
}

export interface CookieBannerConfig {
  showOnFirstVisit: boolean;
  showDetailedOptions: boolean;
  position: 'top' | 'bottom' | 'center';
  theme: 'light' | 'dark' | 'auto';
  companyName: string;
  privacyPolicyUrl: string;
  cookiePolicyUrl: string;
}

export interface CookieCategory {
  id: keyof CookieConsentPreferences;
  name: string;
  description: string;
  examples: string[];
  required: boolean;
  defaultEnabled: boolean;
}

export interface CookieConsentManager {
  getConsent(): CookieConsentState | null;
  setConsent(preferences: CookieConsentPreferences): void;
  hasConsent(category: keyof CookieConsentPreferences): boolean;
  resetConsent(): void;
  needsConsent(): boolean;
  getConsentBanner(): React.ComponentType | null;
}

// Enterprise compliance features
export interface CookieAuditLog {
  timestamp: string;
  action: 'consent_given' | 'consent_updated' | 'consent_withdrawn' | 'consent_expired';
  preferences: CookieConsentPreferences;
  userAgent: string;
  ipAddress?: string;
  version: string;
}

export interface CookieComplianceSettings {
  enableGDPR: boolean;
  enableCCPA: boolean;
  consentExpiryDays: number;
  requireExplicitConsent: boolean;
  enableAuditLogging: boolean;
  enableConsentWithdrawal: boolean;
} 