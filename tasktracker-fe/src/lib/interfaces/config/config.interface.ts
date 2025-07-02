/*
 * Configuration Interfaces
 * Copyright (c) 2025 Carlos Abril Jr
 * 
 * All configuration-related interfaces following .cursorrules standards
 */

// ================================
// APPLICATION CONFIGURATION
// ================================

export interface AppConfig {
  apiUrl: string;
  appName: string;
  version: string;
  environment: 'development' | 'staging' | 'production';
  features: FeatureFlags;
  signalr: SignalRConfig;
  auth: AuthConfig;
  analytics: AnalyticsConfig;
}

// ================================
// FEATURE FLAGS
// ================================

export interface FeatureFlags {
  enableGamification: boolean;
  enablePWA: boolean;
  enableOfflineMode: boolean;
  enablePushNotifications: boolean;
  enableAnalytics: boolean;
  enableMobileGestures: boolean;
  enableFamilyFeatures: boolean;
  enableAdvancedSearch: boolean;
  enableDarkMode: boolean;
  betaFeatures: boolean;
}

// ================================
// SIGNALR CONFIGURATION
// ================================

export interface SignalRConfig {
  hubUrl: string;
  automaticReconnect: boolean;
  reconnectIntervals: number[];
  connectionTimeout: number;
  keepAliveInterval: number;
  logLevel: 'none' | 'critical' | 'error' | 'warning' | 'information' | 'debug' | 'trace';
}

// ================================
// AUTHENTICATION CONFIGURATION
// ================================

export interface AuthConfig {
  tokenStorageKey: string;
  refreshTokenKey: string;
  sessionTimeout: number;
  rememberMeTimeout: number;
  mfaRequired: boolean;
  passwordPolicy: PasswordPolicyConfig;
}

export interface PasswordPolicyConfig {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  maxAge: number;
  preventReuse: number;
}

// ================================
// ANALYTICS CONFIGURATION
// ================================

export interface AnalyticsConfig {
  enabled: boolean;
  trackingId?: string;
  anonymizeIp: boolean;
  cookieConsent: boolean;
  batchSize: number;
  flushInterval: number;
  enableDebugMode: boolean;
}

// ================================
// THEME CONFIGURATION
// ================================

export interface ThemeConfig {
  defaultTheme: 'light' | 'dark' | 'system';
  availableThemes: string[];
  customColors: Record<string, string>;
  fontFamily: string;
  borderRadius: string;
  animations: boolean;
}

// ================================
// NOTIFICATION CONFIGURATION
// ================================

export interface NotificationConfig {
  enablePush: boolean;
  enableEmail: boolean;
  enableInApp: boolean;
  vapidPublicKey?: string;
  defaultSettings: NotificationSettings;
}

export interface NotificationSettings {
  achievements: boolean;
  familyUpdates: boolean;
  taskReminders: boolean;
  weeklyReports: boolean;
  systemAlerts: boolean;
} 