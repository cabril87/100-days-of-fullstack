/*
 * Settings Types - TypeScript interfaces for settings components
 * Copyright (c) 2025 Carlos Abril Jr
 */

// Settings overview types
export interface SettingsOverviewDTO {
  user: UserSummary;
  securityScore: number;
  familyMemberCount: number;
  pendingNotifications: number;
  lastPasswordChange: string;
  mfaEnabled: boolean;
  trustedDevicesCount: number;
  recentActivity: SettingsActivity[];
}

export interface UserSummary {
  id: number;
  username: string;
  displayName: string;
  email: string;
  role: string;
  profileCompleteness: number;
  lastLogin: string;
}

export interface SettingsActivity {
  id: string;
  type: SettingsActivityType;
  description: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export enum SettingsActivityType {
  PROFILE_UPDATED = 'profile_updated',
  PASSWORD_CHANGED = 'password_changed',
  MFA_ENABLED = 'mfa_enabled',
  MFA_DISABLED = 'mfa_disabled',
  FAMILY_MEMBER_ADDED = 'family_member_added',
  NOTIFICATION_SETTINGS_CHANGED = 'notification_settings_changed',
  PRIVACY_SETTINGS_CHANGED = 'privacy_settings_changed',
  DEVICE_TRUSTED = 'device_trusted',
  DEVICE_REMOVED = 'device_removed'
}

// Notification settings types - importing from dedicated notifications module
import {
  NotificationSettingsDTO,
  EmailNotificationSettings,
  PushNotificationSettings,
  NotificationSchedule,
  FamilyNotificationSettings,
  NotificationSettingsFormData
} from './notifications';

// Re-export for backward compatibility
export type {
  NotificationSettingsDTO,
  EmailNotificationSettings,
  PushNotificationSettings,
  NotificationSchedule,
  FamilyNotificationSettings,
  NotificationSettingsFormData
};

// Privacy settings types
export interface PrivacySettingsDTO {
  profileVisibility: ProfileVisibility;
  dataSharing: DataSharingSettings;
  familySettings: FamilyPrivacySettings;
  accountSettings: AccountPrivacySettings;
}

export enum ProfileVisibility {
  PUBLIC = 'public',
  FAMILY = 'family',
  PRIVATE = 'private'
}

export interface DataSharingSettings {
  shareProgressWithFamily: boolean;
  shareAchievementsWithFamily: boolean;
  showLastActiveStatus: boolean;
  allowDataAnalytics: boolean;
  shareDataForImprovement: boolean;
  anonymousUsageStatistics: boolean;
}

export interface FamilyPrivacySettings {
  allowFamilyInvites: boolean;
  showFamilyMemberProgress: boolean;
  allowCrossMatchFamilies: boolean;
  requireApprovalForSharing: boolean;
}

export interface AccountPrivacySettings {
  dataRetentionDays: number;
  autoDeleteInactiveData: boolean;
  requirePasswordForSensitiveActions: boolean;
  logSecurityEvents: boolean;
}

// Appearance/Theme settings types
export interface AppearanceSettingsDTO {
  theme: ThemePreference;
  colorScheme: ColorScheme;
  fontSize: FontSize;
  animations: AnimationSettings;
  accessibility: AccessibilitySettings;
  gamification: GamificationAppearance;
}

export enum ThemePreference {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system',
  AUTO = 'auto'
}

export enum ColorScheme {
  DEFAULT = 'default',
  BLUE = 'blue',
  GREEN = 'green',
  PURPLE = 'purple',
  ORANGE = 'orange',
  RED = 'red',
  CUSTOM = 'custom'
}

export enum FontSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
  EXTRA_LARGE = 'extra_large'
}

export interface AnimationSettings {
  enableAnimations: boolean;
  reducedMotion: boolean;
  animationSpeed: 'slow' | 'normal' | 'fast';
  particleEffects: boolean;
}

export interface AccessibilitySettings {
  highContrast: boolean;
  focusIndicators: boolean;
  screenReaderOptimized: boolean;
  keyboardNavigation: boolean;
  audioFeedback: boolean;
}

export interface GamificationAppearance {
  showAchievementAnimations: boolean;
  enableLevelUpEffects: boolean;
  showProgressBars: boolean;
  compactMode: boolean;
  ageAppropriateThemes: boolean;
}

// Settings navigation types
export interface SettingsSection {
  id: string;
  title: string;
  description: string;
  icon: string;
  path: string;
  adminOnly?: boolean;
  badge?: string | number;
  subsections?: SettingsSubsection[];
}

export interface SettingsSubsection {
  id: string;
  title: string;
  path: string;
  description?: string;
}

// Settings update types
export interface SettingsUpdateRequest {
  section: SettingsSectionType;
  settings: Record<string, unknown>;
}

export enum SettingsSectionType {
  PROFILE = 'profile',
  NOTIFICATIONS = 'notifications',
  PRIVACY = 'privacy',
  SECURITY = 'security',
  APPEARANCE = 'appearance',
  FAMILY = 'family'
}

export interface PrivacySettingsFormData {
  profileVisibility: ProfileVisibility;
  dataSharing: DataSharingSettings;
  familySettings: FamilyPrivacySettings;
  accountSettings: AccountPrivacySettings;
}

export interface AppearanceSettingsFormData {
  theme: ThemePreference;
  colorScheme: ColorScheme;
  fontSize: FontSize;
  animations: AnimationSettings;
  accessibility: AccessibilitySettings;
  gamification: GamificationAppearance;
} 