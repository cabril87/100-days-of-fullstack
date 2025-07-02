/*
 * Security & Session Management API Service
 * Copyright (c) 2025 Carlos Abril Jr
 */

import { 
  SecurityDashboardDTO,
  UserSessionDTO,
  ExtendedUserSessionDTO,
  UserDeviceDTO,
  SessionManagementDTO,
  SecurityEventDTO,
  SecurityRecommendationDTO,
  TerminateSessionRequestDTO,
  UpdateDeviceTrustRequestDTO,
  UserSecurityOverviewDTO,
  ConditionalSecurityService
} from '../types/auth';
import { SecuritySettingsFormData } from '../schemas/settings';
import { apiClient, ApiClientError } from '../config/api-client';

// Custom error class for security service
export class SecurityServiceError extends Error {
  constructor(
    message: string, 
    public status?: number, 
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'SecurityServiceError';
  }
}

/**
 * Security Service with conditional endpoints based on user role
 * - Regular users: /v1/user-security/* endpoints
 * - Admin users: /v1/securitymonitoring/* endpoints
 */
class SecurityService implements ConditionalSecurityService {
  public isAdminMode: boolean = false;
  public userRole: string = 'User';

  /**
   * Initialize service with current user's role
   */
  initialize(userRole: string): void {
    this.userRole = userRole;
    this.isAdminMode = userRole === 'Admin';
  }

  /**
   * Get the appropriate endpoint prefix based on user role
   */
  private getEndpointPrefix(): string {
    return this.isAdminMode ? '/v1/securitymonitoring' : '/v1/user-security';
  }

  /**
   * Get current user ID from auth context
   */
  private getCurrentUserId(): number {
    // This should be implemented to get the current user ID from auth context
    // For now, return 0 as placeholder - should be replaced with actual implementation
    const userString = localStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);
      return user.id;
    }
    return 0;
  }

  // ===== SECURITY DASHBOARD =====
  
  /**
   * Get security dashboard data (conditional based on user role)
   */
  async getSecurityDashboard(): Promise<SecurityDashboardDTO | UserSecurityOverviewDTO> {
    try {
      if (this.isAdminMode) {
        // Admin endpoint - full dashboard
        return await apiClient.get<SecurityDashboardDTO>('/v1/securitymonitoring/dashboard');
      } else {
        // User endpoint - overview only
        return await apiClient.get<UserSecurityOverviewDTO>('/v1/user-security/overview');
      }
    } catch (error) {
      // Silently handle 403 errors for admin-only endpoints - these are expected for regular users
      if (error instanceof ApiClientError && error.statusCode === 403) {
        throw error; // Re-throw without logging
      }
      console.error('Failed to fetch security dashboard:', error);
      throw error;
    }
  }

  // ===== SESSION MANAGEMENT =====
  
  /**
   * Get session management data (admin only)
   */
  async getSessionManagementData(): Promise<SessionManagementDTO> {
    try {
      if (!this.isAdminMode) {
        throw new SecurityServiceError('Session management data is only available for admin users', 403);
      }
      return await apiClient.get<SessionManagementDTO>('/v1/securitymonitoring/sessions');
    } catch (error) {
      console.error('Failed to fetch session management data:', error);
      throw error;
    }
  }

  /**
   * Get active sessions (conditional based on user role)
   */
  async getActiveSessions(userId?: number): Promise<ExtendedUserSessionDTO[]> {
    try {
      let sessions: UserSessionDTO[];

      if (this.isAdminMode) {
        // Admin endpoint - can view any user's sessions
        const url = userId 
          ? `/v1/securitymonitoring/sessions/user/${userId}?activeOnly=true`
          : '/v1/securitymonitoring/sessions/active';
        sessions = await apiClient.get<UserSessionDTO[]>(url);
      } else {
        // User endpoint - can only view own sessions
        sessions = await apiClient.get<UserSessionDTO[]>('/v1/user-security/sessions');
      }
    
      // Add isCurrentDevice flag to sessions (you could enhance this by comparing device info)
      return sessions.map((session, index) => ({
        ...session,
        isCurrentDevice: index === 0 // Simple logic, first session is current
      }));
    } catch (error) {
      // Silently handle 403 errors for admin-only endpoints - these are expected for regular users
      if (error instanceof ApiClientError && error.statusCode === 403) {
        throw error; // Re-throw without logging
      }
      console.error('Failed to fetch active sessions:', error);
      throw error;
    }
  }

  /**
   * Get user sessions (conditional based on user role)
   */
  async getUserSessions(userId: number, activeOnly: boolean = false): Promise<ExtendedUserSessionDTO[]> {
    try {
      let sessions: UserSessionDTO[];

      if (this.isAdminMode) {
        // Admin endpoint - can view any user's sessions
        sessions = await apiClient.get<UserSessionDTO[]>(
          `/v1/securitymonitoring/sessions/user/${userId}?activeOnly=${activeOnly}`
        );
      } else {
        // User endpoint - can only view own sessions (ignores userId parameter)
        sessions = await apiClient.get<UserSessionDTO[]>('/v1/user-security/sessions');
      }
    
      return sessions.map((session, index) => ({
        ...session,
        isCurrentDevice: index === 0 // Simple logic, enhance as needed
      }));
    } catch (error) {
      console.error('Failed to fetch user sessions:', error);
      throw error;
    }
  }

  /**
   * Terminate a session (conditional based on user role)
   */
  async terminateSession(sessionToken: string): Promise<void> {
    try {
      if (this.isAdminMode) {
        // Admin endpoint - can terminate any session
        await apiClient.post<void>('/v1/securitymonitoring/sessions/terminate', { sessionToken });
      } else {
        // Try user endpoint first, fallback to admin endpoint if not available
        try {
          const request: TerminateSessionRequestDTO = { sessionToken };
          await apiClient.post<void>('/v1/user-security/sessions/terminate', request);
        } catch (userEndpointError) {
          if (userEndpointError instanceof ApiClientError && userEndpointError.statusCode === 404) {
            // Fallback to admin endpoint (user security endpoint not implemented yet)
            console.warn('User security endpoint not available, falling back to admin endpoint');
            await apiClient.post<void>('/v1/securitymonitoring/sessions/terminate', { sessionToken });
          } else {
            throw userEndpointError;
          }
        }
      }
    } catch (error) {
      console.error('Failed to terminate session:', error);
      throw error;
    }
  }

  /**
   * Terminate all user sessions (admin only for other users)
   */
  async terminateAllUserSessions(userId: number, reason?: string, excludeSessionToken?: string): Promise<void> {
    try {
      if (!this.isAdminMode) {
        throw new SecurityServiceError('Terminating all user sessions is only available for admin users', 403);
      }

      await apiClient.post<void>('/v1/securitymonitoring/sessions/terminate-all', { 
        userId, 
        reason: reason || 'User terminated all sessions',
        excludeSessionToken
      });
    } catch (error) {
      console.error('Failed to terminate all sessions:', error);
      throw error;
    }
  }

  /**
   * Mark session as suspicious (admin only)
   */
  async markSessionSuspicious(sessionToken: string, reason: string): Promise<void> {
    try {
      if (!this.isAdminMode) {
        throw new SecurityServiceError('Marking sessions as suspicious is only available for admin users', 403);
      }

      await apiClient.post<void>('/v1/securitymonitoring/sessions/mark-suspicious', { 
        sessionToken, 
        reason 
      });
    } catch (error) {
      console.error('Failed to mark session as suspicious:', error);
      throw error;
    }
  }

  // ===== DEVICE MANAGEMENT =====
  
  /**
   * Get user devices (conditional based on user role)
   */
  async getUserDevices(userId?: number): Promise<UserDeviceDTO[]> {
    try {
      if (this.isAdminMode && userId) {
        // Admin endpoint - can view any user's devices
        return await apiClient.get<UserDeviceDTO[]>(`/v1/securitymonitoring/devices/user/${userId}`);
      } else {
        // User endpoint - can only view own devices
        return await apiClient.get<UserDeviceDTO[]>('/v1/user-security/devices');
      }
    } catch (error) {
      // Silently handle 403 errors for admin-only endpoints - these are expected for regular users
      if (error instanceof ApiClientError && error.statusCode === 403) {
        throw error; // Re-throw without logging
      }
      console.error('Failed to fetch user devices:', error);
      throw error;
    }
  }

  /**
   * Update device trust status (conditional based on user role)
   */
  async updateDeviceTrust(deviceId: string, trusted: boolean, deviceName?: string, userId?: number): Promise<void> {
    try {
      if (this.isAdminMode) {
        // Admin endpoint - can modify any device
        const deviceTrustData = {
          userId: userId || this.getCurrentUserId(),
          deviceId,
          trusted,
          deviceName
        };
        await apiClient.post<void>('/v1/securitymonitoring/devices/trust', deviceTrustData);
      } else {
        // User endpoint - can only modify own devices (backend verifies ownership)
        const request: UpdateDeviceTrustRequestDTO = { trusted, deviceName };
        await apiClient.put<void>(`/v1/user-security/devices/${deviceId}/trust`, request);
      }
    } catch (error) {
      console.error('Failed to update device trust:', error);
      throw error;
    }
  }

  /**
   * Remove a device (conditional based on user role)
   */
  async removeDevice(deviceId: string, userId?: number): Promise<void> {
    try {
      if (this.isAdminMode && userId) {
        // Admin endpoint - can remove any user's device
        await apiClient.delete<void>(`/v1/securitymonitoring/devices/user/${userId}/device/${deviceId}`);
      } else {
        // User endpoint - can only remove own devices
        // Note: User security endpoint doesn't exist yet for device removal
        // For now, throw error indicating feature not available
        throw new SecurityServiceError('Device removal not yet implemented for regular users', 501);
      }
    } catch (error) {
      console.error('Failed to remove device:', error);
      throw error;
    }
  }

  // ===== SECURITY SETTINGS =====

  /**
   * Get security settings (conditional based on user role)
   */
  async getSecuritySettings(userId?: number): Promise<SecuritySettingsFormData> {
    try {
      if (this.isAdminMode && userId) {
        // Admin endpoint - can view any user's settings
        return await apiClient.get<SecuritySettingsFormData>(`/v1/securitymonitoring/users/${userId}/security-settings`);
      } else {
        // User endpoint - can only view own settings
        return await apiClient.get<SecuritySettingsFormData>('/v1/user-security/settings');
      }
    } catch (error) {
      if (error instanceof ApiClientError && error.statusCode === 404) {
        // Return default settings if none exist
        return {
          mfaEnabled: false,
          sessionTimeout: 480, // 8 hours
          trustedDevicesEnabled: true,
          loginNotifications: true,
          dataExportRequest: false
        };
      }
      console.error('Failed to fetch security settings:', error);
      throw error;
    }
  }

  /**
   * Create security settings (user endpoint only)
   */
  async createSecuritySettings(settings: SecuritySettingsFormData, userId?: number): Promise<void> {
    try {
      if (this.isAdminMode && userId) {
        // Admin endpoint - can create settings for any user
        await apiClient.post<void>(`/v1/securitymonitoring/users/${userId}/security-settings`, settings);
      } else {
        // User endpoint - can only create own settings
        await apiClient.post<void>('/v1/user-security/settings', settings);
      }
    } catch (error) {
      console.error('Failed to create security settings:', error);
      throw error;
    }
  }

  /**
   * Update security settings (conditional based on user role)
   */
  async updateSecuritySettings(settings: SecuritySettingsFormData, userId?: number): Promise<void> {
    try {
      if (this.isAdminMode && userId) {
        // Admin endpoint - can update any user's settings
        await apiClient.put<void>(`/v1/securitymonitoring/users/${userId}/security-settings`, settings);
      } else {
        // User endpoint - can only update own settings
        await apiClient.put<void>('/v1/user-security/settings', settings);
      }
    } catch (error) {
      console.error('Failed to update security settings:', error);
      throw error;
    }
  }

  /**
   * Delete security settings (conditional based on user role)
   */
  async deleteSecuritySettings(userId?: number): Promise<void> {
    try {
      if (this.isAdminMode && userId) {
        // Admin endpoint - can delete any user's settings
        await apiClient.delete<void>(`/v1/securitymonitoring/users/${userId}/security-settings`);
      } else {
        // User endpoint - can only delete own settings
        await apiClient.delete<void>('/v1/user-security/settings');
      }
    } catch (error) {
      console.error('Failed to delete security settings:', error);
      throw error;
    }
  }

  // ===== ADMIN-ONLY FEATURES =====

  /**
   * Request data export (available for all users)
   */
  async requestDataExport(exportType: 'complete' | 'profile_only' | 'activity_only' | 'family_only', format: 'json' | 'csv' | 'pdf' = 'json'): Promise<void> {
    try {
      // Data export is available for all users
      await apiClient.post<void>('/v1/dataexport/simple', { 
        exportType, 
        format 
      });
    } catch (error) {
      console.error('Failed to request data export:', error);
      throw error;
    }
  }

  /**
   * Clear activity log (admin only for other users)
   */
  async clearActivityLog(userId?: number): Promise<void> {
    try {
      const targetUserId = userId || this.getCurrentUserId();
      
      if (this.isAdminMode) {
        // Admin endpoint - can clear any user's activity log
        await apiClient.delete<void>(`/v1/securitymonitoring/users/${targetUserId}/activity-log`);
      } else {
        // For regular users, this feature is not implemented yet
        throw new SecurityServiceError('Activity log clearing not yet implemented for regular users', 501);
      }
    } catch (error) {
      console.error('Failed to clear activity log:', error);
      throw error;
    }
  }

  /**
   * Delete account (admin only for other users)
   */
  async deleteAccount(currentPassword: string, reason: string, feedback?: string, userId?: number): Promise<void> {
    try {
      const targetUserId = userId || this.getCurrentUserId();
      
      if (this.isAdminMode) {
        // Admin endpoint - can delete any user's account
        await apiClient.post<void>('/v1/securitymonitoring/delete-account', { 
          userId: targetUserId, 
          currentPassword, 
          reason, 
          feedback 
        });
      } else {
        // For regular users, this feature is not implemented yet
        throw new SecurityServiceError('Account deletion not yet implemented for regular users', 501);
      }
    } catch (error) {
      console.error('Failed to delete account:', error);
      throw error;
    }
  }

  /**
   * Get security events (admin only)
   */
  async getSecurityEvents(userId?: number, limit: number = 50): Promise<SecurityEventDTO[]> {
    try {
      if (!this.isAdminMode) {
        throw new SecurityServiceError('Security events are only available for admin users', 403);
      }

      const targetUserId = userId || this.getCurrentUserId();
      return await apiClient.get<SecurityEventDTO[]>(`/v1/securitymonitoring/users/${targetUserId}/security-events?limit=${limit}`);
    } catch (error) {
      console.error('Failed to fetch security events:', error);
      throw error;
    }
  }

  /**
   * Get security recommendations (admin only)
   */
  async getSecurityRecommendations(userId?: number): Promise<SecurityRecommendationDTO[]> {
    try {
      if (!this.isAdminMode) {
        throw new SecurityServiceError('Security recommendations are only available for admin users', 403);
      }

      const targetUserId = userId || this.getCurrentUserId();
      return await apiClient.get<SecurityRecommendationDTO[]>(`/v1/securitymonitoring/users/${targetUserId}/security-recommendations`);
    } catch (error) {
      console.error('Failed to fetch security recommendations:', error);
      throw error;
    }
  }

  /**
   * Dismiss recommendation (admin only)
   */
  async dismissRecommendation(recommendationId: string): Promise<void> {
    try {
      if (!this.isAdminMode) {
        throw new SecurityServiceError('Dismissing recommendations is only available for admin users', 403);
      }

      await apiClient.post<void>('/v1/securitymonitoring/recommendations/dismiss', { recommendationId });
    } catch (error) {
      console.error('Failed to dismiss recommendation:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const securityService = new SecurityService();
