/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 */

/**
 * Privacy settings types matching backend structure
 * MATCHES: TaskTrackerAPI.DTOs.Security.UserSecuritySettingsDTO
 */

export interface FamilyPrivacySettings {
  // Profile visibility
  profileVisibility: 'public' | 'family' | 'private';
  showRealName: boolean;
  showAvatar: boolean;
  showLocation: boolean;
  
  // Activity visibility
  showActivityStatus: boolean;
  showTaskProgress: boolean;
  showAchievements: boolean;
  showPointsEarned: boolean;
  showStreaks: boolean;
  
  // Family sharing
  allowFamilyTaskAssignment: boolean;
  allowFamilyViewTasks: boolean;
  allowFamilyComments: boolean;
  shareCompletionCelebrations: boolean;
  
  // Notifications
  allowActivityNotifications: boolean;
  allowAchievementNotifications: boolean;
  allowTaskReminders: boolean;
  allowFamilyUpdates: boolean;
  
  // Data sharing
  allowDataAnalytics: boolean;
  allowPerformanceTracking: boolean;
  allowUsageStatistics: boolean;
  
  // Communication
  allowDirectMessages: boolean;
  allowFamilyChat: boolean;
  allowMentions: boolean;
}

/**
 * User security settings matching backend DTO
 * MATCHES: TaskTrackerAPI.DTOs.Security.UserSecuritySettingsDTO
 */
export interface UserSecuritySettingsDTO {
  id: number;
  userId: number;
  mfaEnabled: boolean;
  sessionTimeout: number;
  trustedDevicesEnabled: boolean;
  loginNotifications: boolean;
  dataExportRequest: boolean;
  dataExportRequestDate?: Date;
  accountDeletionRequest: boolean;
  accountDeletionRequestDate?: Date;
  privacySettings?: string; // JSON string containing FamilyPrivacySettings
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create security settings DTO
 * MATCHES: TaskTrackerAPI.DTOs.Security.UserSecuritySettingsCreateDTO
 */
export interface UserSecuritySettingsCreateDTO {
  mfaEnabled?: boolean;
  sessionTimeout?: number;
  trustedDevicesEnabled?: boolean;
  loginNotifications?: boolean;
  dataExportRequest?: boolean;
  privacySettings?: string;
}

/**
 * Update security settings DTO
 * MATCHES: TaskTrackerAPI.DTOs.Security.UserSecuritySettingsUpdateDTO
 */
export interface UserSecuritySettingsUpdateDTO {
  mfaEnabled?: boolean;
  sessionTimeout?: number;
  trustedDevicesEnabled?: boolean;
  loginNotifications?: boolean;
  dataExportRequest?: boolean;
  privacySettings?: string;
}

/**
 * Default privacy settings
 */
export const DEFAULT_PRIVACY_SETTINGS: FamilyPrivacySettings = {
  // Profile visibility - Conservative defaults
  profileVisibility: 'family',
  showRealName: true,
  showAvatar: true,
  showLocation: false,
  
  // Activity visibility - Balanced defaults
  showActivityStatus: true,
  showTaskProgress: true,
  showAchievements: true,
  showPointsEarned: true,
  showStreaks: true,
  
  // Family sharing - Collaborative defaults
  allowFamilyTaskAssignment: true,
  allowFamilyViewTasks: true,
  allowFamilyComments: true,
  shareCompletionCelebrations: true,
  
  // Notifications - Moderate defaults
  allowActivityNotifications: true,
  allowAchievementNotifications: true,
  allowTaskReminders: true,
  allowFamilyUpdates: true,
  
  // Data sharing - Privacy-focused defaults
  allowDataAnalytics: false,
  allowPerformanceTracking: true,
  allowUsageStatistics: false,
  
  // Communication - Open defaults
  allowDirectMessages: true,
  allowFamilyChat: true,
  allowMentions: true,
};


export interface PrivacySettingsFormData {
  settings: FamilyPrivacySettings;
  isDirty: boolean;
  isSubmitting: boolean;
  errors: Record<string, string>;
}

