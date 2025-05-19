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
  }
}; 