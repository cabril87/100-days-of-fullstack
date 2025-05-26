import { apiClient } from './apiClient';
import { ApiResponse } from '@/lib/types/api';
import { 
  notificationSignalRService,
  onNewNotification as onNewNotificationSignalR,
  onNotificationRead as onNotificationReadSignalR,
  onNotificationDeleted as onNotificationDeletedSignalR,
  onUnreadCountUpdated as onUnreadCountUpdatedSignalR,
  initializeNotificationSignalR
} from './notificationSignalRService';
import { 
  Notification, 
  NotificationPreferenceSummary, 
  NotificationPreference 
} from '@/lib/types/notification';

// Enhanced notification methods

/**
 * Initialize real-time notifications by connecting to SignalR
 */
export async function initializeRealTimeNotifications(): Promise<void> {
  try {
    await initializeNotificationSignalR();
  } catch (error) {
    // Silently handle connection failures since SignalR may not be enabled
  }
}

/**
 * Register a callback for new notifications
 */
export function onNewNotification(callback: (notification: any) => void): () => void {
  return onNewNotificationSignalR(callback);
}

/**
 * Register a callback for notification read events
 */
export function onNotificationRead(callback: (notificationId: string) => void): () => void {
  return onNotificationReadSignalR(callback);
}

/**
 * Register a callback for notification deleted events
 */
export function onNotificationDeleted(callback: (notificationId: string) => void): () => void {
  return onNotificationDeletedSignalR(callback);
}

/**
 * Register a callback for unread count updates
 */
export function onUnreadCountUpdated(callback: (count: number) => void): () => void {
  return onUnreadCountUpdatedSignalR(callback);
}

/**
 * Join a family notification group
 */
export async function joinFamilyNotificationGroup(familyId: number): Promise<void> {
  if (notificationSignalRService.isConnected()) {
    await notificationSignalRService.joinFamilyNotificationGroup(familyId);
  }
}

/**
 * Leave a family notification group
 */
export async function leaveFamilyNotificationGroup(familyId: number): Promise<void> {
  if (notificationSignalRService.isConnected()) {
    await notificationSignalRService.leaveFamilyNotificationGroup(familyId);
  }
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(notificationId: number): Promise<boolean> {
  try {
    const response = await apiClient.put(`/v1/notifications/${notificationId}/read`);
    return response.status === 200;
  } catch (error) {
    console.error(`Error marking notification ${notificationId} as read:`, error);
    return false;
  }
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: number): Promise<boolean> {
  try {
    const response = await apiClient.delete(`/v1/notifications/${notificationId}`);
    return response.status === 200;
  } catch (error) {
    console.error(`Error deleting notification ${notificationId}:`, error);
    return false;
  }
}

// Mock data removed - using real API data only

export const notificationService = {
  async getNotifications(): Promise<ApiResponse<Notification[]>> {
    console.log('[notificationService] Getting notifications');
    try {
      const response = await apiClient.get<Notification[]>('/v1/notifications');
      
      // Ensure we always return an array, even if the API returns null/undefined
      const notifications = Array.isArray(response.data) ? response.data : [];
      
      return { 
        data: notifications,
        status: response.status
      };
    } catch (error) {
      console.error('[notificationService] Error getting notifications:', error);
      
      // Return empty array instead of error to prevent UI crashes
      return {
        data: [],
        status: 200,
        error: error instanceof Error ? error.message : 'Failed to get notifications'
      };
    }
  },
  
  async markAsRead(id: string): Promise<ApiResponse<void>> {
    console.log(`[notificationService] Marking notification ${id} as read`);
    try {
      // Use PUT instead of PATCH to match the API controller
      const response = await apiClient.put(`/v1/notifications/${id}/read`);
      
      return { 
        status: response.status 
      };
    } catch (error) {
      console.error(`[notificationService] Error marking notification ${id} as read:`, error);
      return {
        error: error instanceof Error ? error.message : 'Failed to mark notification as read',
        status: 500
      };
    }
  },
  
  async acceptInvitation(token: string): Promise<ApiResponse<void>> {
    console.log(`[notificationService] Accepting invitation with token: ${token}`);
    try {
      const response = await apiClient.post('/v1/invitation/accept', { token });
      
      if (response.error) {
        return { error: response.error, status: response.status };
      }
      
      return { status: 200 };
    } catch (error) {
      console.error(`[notificationService] Error accepting invitation:`, error);
      return {
        error: error instanceof Error ? error.message : 'Failed to accept invitation',
        status: 500
      };
    }
  },
  
  async declineInvitation(token: string): Promise<ApiResponse<void>> {
    console.log(`[notificationService] Declining invitation with token: ${token}`);
    try {
      const response = await apiClient.post('/v1/invitation/decline', { token });
      
      if (response.error) {
        return { error: response.error, status: response.status };
      }
      
      return { status: 200 };
    } catch (error) {
      console.error(`[notificationService] Error declining invitation:`, error);
      return {
        error: error instanceof Error ? error.message : 'Failed to decline invitation',
        status: 500
      };
    }
  },
  
  // Notification Preferences APIs
  
  async getPreferenceSummary(): Promise<ApiResponse<NotificationPreferenceSummary>> {
    console.log('[notificationService] Getting preference summary');
    try {
      const response = await apiClient.get<NotificationPreferenceSummary>('/v1/notifications/preferences/summary');
      
      return { 
        data: response.data,
        status: response.status
      };
    } catch (error) {
      console.error('[notificationService] Error getting preference summary:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to get notification preferences',
        status: 500
      };
    }
  },
  
  async getFamilyPreferenceSummary(familyId: string): Promise<ApiResponse<NotificationPreferenceSummary>> {
    console.log(`[notificationService] Getting family preference summary for family ${familyId}`);
    try {
      const response = await apiClient.get<NotificationPreferenceSummary>(
        `/v1/notifications/preferences/family/${familyId}/summary`
      );
      
      return { 
        data: response.data,
        status: response.status
      };
    } catch (error) {
      console.error(`[notificationService] Error getting family preference summary:`, error);
      return {
        error: error instanceof Error ? error.message : 'Failed to get family notification preferences',
        status: 500
      };
    }
  },
  
  async getAllPreferences(): Promise<ApiResponse<NotificationPreference[]>> {
    console.log('[notificationService] Getting all preferences');
    try {
      const response = await apiClient.get<NotificationPreference[]>('/v1/notifications/preferences');
      
      return { 
        data: response.data,
        status: response.status
      };
    } catch (error) {
      console.error('[notificationService] Error getting all preferences:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to get notification preferences',
        status: 500
      };
    }
  },
  
  async getFamilyPreferences(familyId: number): Promise<ApiResponse<NotificationPreference[]>> {
    console.log(`[notificationService] Getting family preferences for family ${familyId}`);
    try {
      const response = await apiClient.get<NotificationPreference[]>(`/v1/notifications/preferences/family/${familyId}`);
      
      return { 
        data: response.data,
        status: response.status
      };
    } catch (error) {
      console.error(`[notificationService] Error getting family preferences for family ${familyId}:`, error);
      return {
        error: error instanceof Error ? error.message : 'Failed to get family notification preferences',
        status: 500
      };
    }
  },
  
  async setEmailPreference(enabled: boolean): Promise<ApiResponse<void>> {
    console.log(`[notificationService] Setting email preference to ${enabled}`);
    try {
      const response = await apiClient.put(`/v1/notifications/preferences/email/${enabled}`);
      
      return { status: response.status };
    } catch (error) {
      console.error(`[notificationService] Error setting email preference:`, error);
      return {
        error: error instanceof Error ? error.message : 'Failed to set email preference',
        status: 500
      };
    }
  },
  
  async setFamilyEmailPreference(familyId: string, enabled: boolean): Promise<ApiResponse<void>> {
    console.log(`[notificationService] Setting family email preference to ${enabled} for family ${familyId}`);
    try {
      const response = await apiClient.put(`/v1/notifications/preferences/family/${familyId}/email/${enabled}`);
      
      return { status: response.status };
    } catch (error) {
      console.error(`[notificationService] Error setting family email preference:`, error);
      return {
        error: error instanceof Error ? error.message : 'Failed to set family email preference',
        status: 500
      };
    }
  },
  
  async setPushPreference(enabled: boolean): Promise<ApiResponse<void>> {
    console.log(`[notificationService] Setting push preference to ${enabled}`);
    try {
      const response = await apiClient.put(`/v1/notifications/preferences/push/${enabled}`);
      
      return { status: response.status };
    } catch (error) {
      console.error(`[notificationService] Error setting push preference:`, error);
      return {
        error: error instanceof Error ? error.message : 'Failed to set push preference',
        status: 500
      };
    }
  },
  
  async setFamilyPushPreference(familyId: string, enabled: boolean): Promise<ApiResponse<void>> {
    console.log(`[notificationService] Setting family push preference to ${enabled} for family ${familyId}`);
    try {
      const response = await apiClient.put(`/v1/notifications/preferences/family/${familyId}/push/${enabled}`);
      
      return { status: response.status };
    } catch (error) {
      console.error(`[notificationService] Error setting family push preference:`, error);
      return {
        error: error instanceof Error ? error.message : 'Failed to set family push preference',
        status: 500
      };
    }
  },
  
  async initializePreferences(): Promise<ApiResponse<void>> {
    console.log(`[notificationService] Initializing default preferences`);
    try {
      const response = await apiClient.post(`/v1/notifications/preferences/initialize`);
      
      return { status: response.status };
    } catch (error) {
      console.error(`[notificationService] Error initializing preferences:`, error);
      return {
        error: error instanceof Error ? error.message : 'Failed to initialize notification preferences',
        status: 500
      };
    }
  }
}; 