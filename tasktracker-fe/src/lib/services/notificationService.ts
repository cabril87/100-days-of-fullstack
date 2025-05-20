import { apiClient } from './apiClient';
import { ApiResponse } from '@/lib/types/api';

export interface Notification {
  id: string;
  type: 'invitation' | 'role_change' | 'task_assignment' | 'task_completion' | 'family_update';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  data?: {
    invitationId?: string;
    familyId?: string;
    familyName?: string;
    memberId?: string;
    taskId?: string;
    token?: string;
    invitedBy?: string;
  };
}

export interface NotificationPreferenceSummary {
  enableGlobalNotifications: boolean;
  enableTaskNotifications: boolean;
  enableFamilyNotifications: boolean;
  enableSystemNotifications: boolean;
  enableEmailNotifications: boolean;
  enablePushNotifications: boolean;
}

export interface NotificationPreference {
  id: number;
  notificationType: string;
  enabled: boolean;
  priority: 'Low' | 'Normal' | 'High' | 'Urgent';
  familyId?: number;
  familyName?: string;
  enableEmailNotifications: boolean;
  enablePushNotifications: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'invitation',
    title: 'Family Invitation',
    message: 'You have been invited to join the Smith Family',
    isRead: false,
    createdAt: new Date().toISOString(),
    data: {
      invitationId: '123',
      familyId: '1',
      familyName: 'Smith Family',
      token: 'abc123',
      invitedBy: 'john_smith'
    }
  },
  {
    id: '2',
    type: 'task_assignment',
    title: 'New Task Assigned',
    message: 'You have been assigned a new task: Clean the garage',
    isRead: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    data: {
      taskId: '456',
      familyId: '1',
      familyName: 'Smith Family'
    }
  }
];

export const notificationService = {
  async getNotifications(): Promise<ApiResponse<Notification[]>> {
    console.log('[notificationService] Getting notifications');
    try {
      // Use real API instead of mock data
      const response = await apiClient.get<Notification[]>('/v1/notifications');
      
      return { 
        data: response.data,
        status: response.status
      };
    } catch (error) {
      console.error('[notificationService] Error getting notifications:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to get notifications',
        status: 500
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