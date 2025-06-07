/*
 * Notification Service - API integration for notifications and preferences
 * Copyright (c) 2025 Carlos Abril Jr
 */

import {
  NotificationDTO,
  NotificationCountDTO,
  NotificationPreferenceDTO,
  UpdateNotificationPreferenceDTO,
  NotificationPreferenceSummaryDTO,
  NotificationFilterDTO,
  CreateNotificationDTO,
  NotificationStats,
  NotificationSettingsDTO
} from '../types/notifications';
import { apiClient } from '../config/api-client';

// Custom error class for API errors
export class NotificationApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'NotificationApiError';
  }
}

// Notification Service Class
export class NotificationService {
  // === NOTIFICATION MANAGEMENT ===

  /**
   * Get all notifications for current user
   */
  async getAllNotifications(): Promise<NotificationDTO[]> {
    try {
      const result = await apiClient.get<{ data: NotificationDTO[] }>('/api/v1/notifications');
      return result.data;
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      return [];
    }
  }

  /**
   * Get notification by ID
   */
  async getNotificationById(id: number): Promise<NotificationDTO> {
    try {
      const result = await apiClient.get<{ data: NotificationDTO }>(`/api/v1/notifications/${id}`);
      return result.data;
    } catch (error) {
      console.error('Failed to fetch notification by ID:', error);
      throw error;
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<number> {
    try {
      const result = await apiClient.get<{ data: number }>('/api/v1/notifications/unread-count');
      return result.data;
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
      return 0;
    }
  }

  /**
   * Get notification counts by type
   */
  async getNotificationCounts(): Promise<NotificationCountDTO> {
    try {
      const result = await apiClient.get<{ data: NotificationCountDTO }>('/api/v1/notifications/counts');
      return result.data;
    } catch (error) {
      console.error('Failed to fetch notification counts:', error);
      return {
        totalCount: 0,
        unreadCount: 0,
        importantCount: 0,
        countsByType: {}
      };
    }
  }

  /**
   * Get filtered notifications based on criteria
   */
  async getFilteredNotifications(filter: NotificationFilterDTO): Promise<NotificationDTO[]> {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
      
      const result = await apiClient.get<{ data: NotificationDTO[] }>(`/api/v1/notifications/filter?${queryParams.toString()}`);
      return result.data;
    } catch (error) {
      console.error('Failed to fetch filtered notifications:', error);
      return [];
    }
  }

  /**
   * Create a new notification
   */
  async createNotification(notification: CreateNotificationDTO): Promise<NotificationDTO> {
    try {
      const result = await apiClient.post<{ data: NotificationDTO }>('/api/v1/notifications', notification);
      return result.data;
    } catch (error) {
      console.error('Failed to create notification:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(id: number): Promise<NotificationDTO> {
    try {
      const result = await apiClient.post<{ data: NotificationDTO }>(`/api/v1/notifications/${id}/mark-read`);
      return result.data;
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<number> {
    try {
      const result = await apiClient.post<{ data: { updatedCount: number } }>('/api/v1/notifications/mark-all-read');
      return result.data.updatedCount;
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      return 0;
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(id: number): Promise<boolean> {
    try {
      await apiClient.delete<void>(`/api/v1/notifications/${id}`);
      return true;
    } catch (error) {
      console.error('Failed to delete notification:', error);
      return false;
    }
  }

  /**
   * Delete all notifications
   */
  async deleteAllNotifications(): Promise<boolean> {
    try {
      await apiClient.delete<void>('/api/v1/notifications');
      return true;
    } catch (error) {
      console.error('Failed to delete all notifications:', error);
      return false;
    }
  }

  // === NOTIFICATION PREFERENCES ===

  /**
   * Get all notification preferences
   */
  async getAllPreferences(): Promise<NotificationPreferenceDTO[]> {
    try {
      const result = await apiClient.get<{ data: NotificationPreferenceDTO[] }>('/api/v1/notifications/preferences');
      return result.data;
    } catch (error) {
      console.error('Failed to fetch notification preferences:', error);
      return [];
    }
  }

  /**
   * Get family-specific notification preferences
   */
  async getFamilyPreferences(familyId: number): Promise<NotificationPreferenceDTO[]> {
    try {
      const result = await apiClient.get<{ data: NotificationPreferenceDTO[] }>(`/api/v1/notifications/preferences/family/${familyId}`);
      return result.data;
    } catch (error) {
      console.error('Failed to fetch family notification preferences:', error);
      return [];
    }
  }

  /**
   * Get preference summary (overview of all notification settings)
   */
  async getPreferenceSummary(): Promise<NotificationPreferenceSummaryDTO> {
    try {
      const result = await apiClient.get<{ data: NotificationPreferenceSummaryDTO }>('/api/v1/notifications/preferences/summary');
      return result.data;
    } catch (error) {
      console.error('Failed to fetch notification preference summary:', error);
      return {
        enableGlobalNotifications: true,
        enableTaskNotifications: true,
        enableFamilyNotifications: true,
        enableSystemNotifications: true,
        enableEmailNotifications: true,
        enablePushNotifications: true
      };
    }
  }

  /**
   * Get notification preference by ID
   */
  async getPreferenceById(id: number): Promise<NotificationPreferenceDTO> {
    try {
      const result = await apiClient.get<{ data: NotificationPreferenceDTO }>(`/api/v1/notifications/preferences/${id}`);
      return result.data;
    } catch (error) {
      console.error('Failed to fetch notification preference by ID:', error);
      throw error;
    }
  }

  /**
   * Create new notification preference
   */
  async createPreference(preference: UpdateNotificationPreferenceDTO): Promise<NotificationPreferenceDTO> {
    try {
      const result = await apiClient.post<{ data: NotificationPreferenceDTO }>('/api/v1/notifications/preferences', preference);
      return result.data;
    } catch (error) {
      console.error('Failed to create notification preference:', error);
      throw error;
    }
  }

  /**
   * Update notification preference
   */
  async updatePreference(id: number, preference: UpdateNotificationPreferenceDTO): Promise<NotificationPreferenceDTO> {
    try {
      const result = await apiClient.put<{ data: NotificationPreferenceDTO }>(`/api/v1/notifications/preferences/${id}`, preference);
      return result.data;
    } catch (error) {
      console.error('Failed to update notification preference:', error);
      throw error;
    }
  }

  /**
   * Delete notification preference
   */
  async deletePreference(id: number): Promise<boolean> {
    try {
      await apiClient.delete<void>(`/api/v1/notifications/preferences/${id}`);
      return true;
    } catch (error) {
      console.error('Failed to delete notification preference:', error);
      return false;
    }
  }

  /**
   * Enable/disable email notifications globally
   */
  async setEmailPreference(enabled: boolean): Promise<boolean> {
    try {
      await apiClient.post<void>('/api/v1/notifications/preferences/email', { enabled });
      return true;
    } catch (error) {
      console.error('Failed to set email preference:', error);
      return false;
    }
  }

  /**
   * Enable/disable push notifications globally
   */
  async setPushPreference(enabled: boolean): Promise<boolean> {
    try {
      await apiClient.post<void>('/api/v1/notifications/preferences/push', { enabled });
      return true;
    } catch (error) {
      console.error('Failed to set push preference:', error);
      return false;
    }
  }

  /**
   * Initialize default notification preferences for new user
   */
  async initializePreferences(): Promise<boolean> {
    try {
      await apiClient.post<void>('/api/v1/notifications/preferences/initialize');
      return true;
    } catch (error) {
      console.error('Failed to initialize notification preferences:', error);
      return false;
    }
  }

  // === NOTIFICATION SETTINGS ===

  /**
   * Get comprehensive notification settings
   */
  async getSettings(): Promise<NotificationSettingsDTO> {
    try {
      const result = await apiClient.get<NotificationSettingsDTO>('/api/v1/notifications/settings');
      return result;
    } catch (error) {
      console.error('Failed to fetch notification settings:', error);
      
      // Return default settings
      return {
        emailNotifications: {
          taskReminders: true,
          achievementAlerts: true,
          familyActivity: true,
          securityAlerts: true,
          weeklyDigest: true,
          marketingEmails: false,
          systemUpdates: true
        },
        pushNotifications: {
          taskReminders: true,
          achievementAlerts: true,
          familyActivity: true,
          securityAlerts: true,
          immediateAlerts: true,
          quietHours: false
        },
        notificationSchedule: {
          startTime: '09:00',
          endTime: '22:00',
          timezone: 'UTC',
          weekendsOnly: false,
          customDays: []
        },
        familyNotifications: {
          childTaskUpdates: true,
          permissionRequests: true,
          achievementSharing: true,
          emergencyAlerts: true,
          parentalControlChanges: true
        }
      };
    }
  }

  /**
   * Update notification settings
   */
  async updateSettings(settings: NotificationSettingsDTO): Promise<void> {
    try {
      await apiClient.put<void>('/api/v1/notifications/settings', settings);
    } catch (error) {
      console.error('Failed to update notification settings:', error);
      throw error;
    }
  }

  // === STATISTICS & ANALYTICS ===

  /**
   * Get notification statistics
   */
  async getStats(): Promise<NotificationStats> {
    try {
      const result = await apiClient.get<NotificationStats>('/api/v1/notifications/stats');
      return result;
    } catch (error) {
      console.error('Failed to fetch notification stats:', error);
      return {
        totalSent: 0,
        unreadCount: 0,
        thisWeek: 0,
        deliveryRate: 0
      };
    }
  }

  // === TEST & UTILITY ===

  /**
   * Send test notification (Admin-only functionality)
   * Removed per Family Auth Implementation Checklist rules
   */
  async sendTestNotification(): Promise<void> {
    throw new NotificationApiError('Test notifications require administrator privileges', 403);
  }

  /**
   * Clear all notifications (alias for deleteAllNotifications)
   */
  async clearAllNotifications(): Promise<boolean> {
    return this.deleteAllNotifications();
  }
}

// Export singleton instance
export const notificationService = new NotificationService(); 