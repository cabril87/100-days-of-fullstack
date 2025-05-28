/**
 * Admin Service
 * 
 * Service for admin-specific API operations including user management and system settings
 */

import { apiClient } from './apiClient';
import { ApiResponse } from '@/lib/types/api';

// User Management Types
export interface AdminUser {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  role: string;
  createdAt: string;
  isActive?: boolean;
  lastLogin?: string;
  taskCount?: number;
  familyId?: number;
}

export interface UserRoleUpdateRequest {
  role: string;
}

export interface AdminPasswordChangeRequest {
  userId: number;
  newPassword: string;
  confirmPassword: string;
}

// System Settings Types
export interface SystemSettings {
  security: {
    enableTwoFactor: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
    passwordMinLength: number;
    requirePasswordComplexity: boolean;
  };
  notifications: {
    enableEmailNotifications: boolean;
    enablePushNotifications: boolean;
    enableSMSNotifications: boolean;
    notificationFrequency: string;
  };
  system: {
    maintenanceMode: boolean;
    debugMode: boolean;
    logLevel: string;
    backupFrequency: string;
    maxFileUploadSize: number;
  };
  api: {
    rateLimitEnabled: boolean;
    requestsPerMinute: number;
    enableCors: boolean;
    apiVersion: string;
  };
}

class AdminService {
  private baseUrl = '/v1';

  /**
   * User Management Methods
   */

  /**
   * Get all users (Admin only)
   */
  async getAllUsers(): Promise<ApiResponse<AdminUser[]>> {
    try {
      const response = await apiClient.get<AdminUser[]>(`${this.baseUrl}/auth/users`);
      
      if (response.data) {
        // Transform the data to include additional fields that might be missing
        const transformedUsers = response.data.map(user => ({
          ...user,
          isActive: true, // Default to active if not provided
          lastLogin: user.lastLogin || new Date().toISOString(),
          taskCount: user.taskCount || 0,
          displayName: user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username
        }));
        
        return {
          data: transformedUsers,
          status: response.status
        };
      }
      
      return response;
    } catch (error) {
      console.error('Error fetching users:', error);
      return {
        error: 'Failed to fetch users',
        status: 500
      };
    }
  }

  /**
   * Update user role (Admin only)
   */
  async updateUserRole(userId: number, role: string): Promise<ApiResponse<void>> {
    try {
      return await apiClient.put<void>(`${this.baseUrl}/auth/users/${userId}/role`, role, {
        extraHeaders: {
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      return {
        error: 'Failed to update user role',
        status: 500
      };
    }
  }

  /**
   * Delete user (Admin only)
   */
  async deleteUser(userId: number): Promise<ApiResponse<void>> {
    try {
      return await apiClient.delete<void>(`${this.baseUrl}/auth/users/${userId}`);
    } catch (error) {
      console.error('Error deleting user:', error);
      return {
        error: 'Failed to delete user',
        status: 500
      };
    }
  }

  /**
   * Admin change user password (Admin only)
   */
  async adminChangePassword(request: AdminPasswordChangeRequest): Promise<ApiResponse<void>> {
    try {
      return await apiClient.post<void>(`${this.baseUrl}/auth/users/change-password`, request);
    } catch (error) {
      console.error('Error changing user password:', error);
      return {
        error: 'Failed to change user password',
        status: 500
      };
    }
  }

  /**
   * System Settings Methods
   */

  /**
   * Get system settings (Admin only)
   */
  async getSystemSettings(): Promise<ApiResponse<SystemSettings>> {
    try {
      // Since there's no specific system settings endpoint yet, we'll construct from available data
      // This would typically come from a dedicated settings endpoint
      const defaultSettings: SystemSettings = {
        security: {
          enableTwoFactor: true,
          sessionTimeout: 30,
          maxLoginAttempts: 5,
          passwordMinLength: 8,
          requirePasswordComplexity: true,
        },
        notifications: {
          enableEmailNotifications: true,
          enablePushNotifications: false,
          enableSMSNotifications: false,
          notificationFrequency: 'immediate',
        },
        system: {
          maintenanceMode: false,
          debugMode: false,
          logLevel: 'info',
          backupFrequency: 'daily',
          maxFileUploadSize: 10,
        },
        api: {
          rateLimitEnabled: true,
          requestsPerMinute: 100,
          enableCors: true,
          apiVersion: 'v1',
        },
      };

      // TODO: Replace with actual API call when backend endpoint is available
      // const response = await apiClient.get<SystemSettings>(`${this.baseUrl}/admin/settings`);
      
      return {
        data: defaultSettings,
        status: 200
      };
    } catch (error) {
      console.error('Error fetching system settings:', error);
      return {
        error: 'Failed to fetch system settings',
        status: 500
      };
    }
  }

  /**
   * Update system settings (Admin only)
   */
  async updateSystemSettings(settings: SystemSettings): Promise<ApiResponse<void>> {
    try {
      // TODO: Replace with actual API call when backend endpoint is available
      // return await apiClient.put<void>(`${this.baseUrl}/admin/settings`, settings);
      
      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        status: 200
      };
    } catch (error) {
      console.error('Error updating system settings:', error);
      return {
        error: 'Failed to update system settings',
        status: 500
      };
    }
  }

  /**
   * Get system status (Admin only)
   */
  async getSystemStatus(): Promise<ApiResponse<any>> {
    try {
      // Get system health from security monitoring endpoint
      const response = await apiClient.get<any>(`${this.baseUrl}/security/system-health`);
      return response;
    } catch (error) {
      console.error('Error fetching system status:', error);
      return {
        error: 'Failed to fetch system status',
        status: 500
      };
    }
  }
}

export const adminService = new AdminService(); 