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
  SecurityRecommendationDTO
} from '../types/session-management';
import { SecuritySettingsFormData } from '../schemas/settings';

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const API_VERSION = 'v1';

// Helper function to get auth headers
const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

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

// Helper function to handle API responses
async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new SecurityServiceError(
      errorData.message || `HTTP error! status: ${response.status}`,
      response.status,
      errorData.errors
    );
  }
  const result = await response.json();
  return result.data || result;
}

class SecurityService {
  
  // ===== SECURITY DASHBOARD =====
  
  /**
   * Get security dashboard data
   */
  async getSecurityDashboard(): Promise<SecurityDashboardDTO> {
    const response = await fetch(`${API_BASE_URL}/api/${API_VERSION}/securitymonitoring/dashboard`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    return handleApiResponse<SecurityDashboardDTO>(response);
  }

  // ===== SESSION MANAGEMENT =====
  
  /**
   * Get session management data
   */
  async getSessionManagementData(): Promise<SessionManagementDTO> {
    const response = await fetch(`${API_BASE_URL}/api/${API_VERSION}/securitymonitoring/sessions`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    return handleApiResponse<SessionManagementDTO>(response);
  }

  /**
   * Get active sessions for current user
   */
  async getActiveSessions(userId?: number): Promise<ExtendedUserSessionDTO[]> {
    const url = userId 
      ? `${API_BASE_URL}/api/${API_VERSION}/securitymonitoring/sessions/user/${userId}?activeOnly=true`
      : `${API_BASE_URL}/api/${API_VERSION}/securitymonitoring/sessions/active`;
      
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    const sessions = await handleApiResponse<UserSessionDTO[]>(response);
    
    // Add isCurrentDevice flag to sessions (you could enhance this by comparing device info)
    return sessions.map((session, index) => ({
      ...session,
      isCurrentDevice: index === 0 // Simple logic, first session is current
    }));
  }

  /**
   * Get user sessions (active and historical)
   */
  async getUserSessions(userId: number, activeOnly: boolean = false): Promise<ExtendedUserSessionDTO[]> {
    const response = await fetch(
      `${API_BASE_URL}/api/${API_VERSION}/securitymonitoring/sessions/user/${userId}?activeOnly=${activeOnly}`, 
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );
    
    const sessions = await handleApiResponse<UserSessionDTO[]>(response);
    
    return sessions.map((session, index) => ({
      ...session,
      isCurrentDevice: index === 0 // Simple logic, enhance as needed
    }));
  }

  /**
   * Terminate a session
   */
  async terminateSession(sessionToken: string, reason?: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/${API_VERSION}/securitymonitoring/sessions/terminate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ 
        sessionToken, 
        reason: reason || 'User terminated session'
      }),
    });
    
    await handleApiResponse<void>(response);
  }

  /**
   * Terminate all user sessions
   */
  async terminateAllUserSessions(userId: number, reason?: string, excludeSessionToken?: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/${API_VERSION}/securitymonitoring/sessions/terminate-all`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ 
        userId, 
        reason: reason || 'User terminated all sessions',
        excludeSessionToken
      }),
    });
    
    await handleApiResponse<void>(response);
  }

  /**
   * Mark session as suspicious
   */
  async markSessionSuspicious(sessionToken: string, reason: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/${API_VERSION}/securitymonitoring/sessions/mark-suspicious`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ sessionToken, reason }),
    });
    
    await handleApiResponse<void>(response);
  }

  // ===== DEVICE MANAGEMENT =====
  
  /**
   * Get user devices (trusted and untrusted)
   */
  async getUserDevices(userId: number): Promise<UserDeviceDTO[]> {
    const response = await fetch(`${API_BASE_URL}/api/${API_VERSION}/securitymonitoring/devices/user/${userId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    return handleApiResponse<UserDeviceDTO[]>(response);
  }

  /**
   * Update device trust status
   */
  async updateDeviceTrust(userId: number, deviceId: string, trusted: boolean, deviceName?: string): Promise<void> {
    const deviceTrustData = {
      userId,
      deviceId,
      trusted,
      deviceName
    };

    const response = await fetch(`${API_BASE_URL}/api/${API_VERSION}/securitymonitoring/devices/trust`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(deviceTrustData),
    });
    
    await handleApiResponse<void>(response);
  }

  /**
   * Remove/untrust a device
   */
  async removeDevice(userId: number, deviceId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/${API_VERSION}/securitymonitoring/devices/user/${userId}/device/${deviceId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    await handleApiResponse<void>(response);
  }

  // ===== SECURITY SETTINGS =====
  
  /**
   * Get user security settings
   */
  async getSecuritySettings(userId: number): Promise<SecuritySettingsFormData> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/${API_VERSION}/securitymonitoring/users/${userId}/security-settings`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      return handleApiResponse<SecuritySettingsFormData>(response);
    } catch (error) {
      // If any error occurs, create default settings via backend
      console.debug('Security settings not found, creating defaults via backend:', error);
      
      try {
        // Try to create default settings first
        const defaultSettings = {
          mfaEnabled: false,
          sessionTimeout: 480, // 8 hours
          trustedDevicesEnabled: true,
          loginNotifications: true,
          dataExportRequest: false,
        };
        
        await this.createSecuritySettings(userId, defaultSettings);
        return defaultSettings;
      } catch (createError) {
        console.warn('Failed to create default security settings:', createError);
        // Return default settings as fallback
        return {
          mfaEnabled: false,
          sessionTimeout: 480, // 8 hours
          trustedDevicesEnabled: true,
          loginNotifications: true,
          dataExportRequest: false,
        };
      }
    }
  }

  /**
   * Create user security settings
   */
  async createSecuritySettings(userId: number, settings: SecuritySettingsFormData): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/${API_VERSION}/securitymonitoring/users/${userId}/security-settings`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(settings),
    });
    
    await handleApiResponse<void>(response);
  }

  /**
   * Update user security settings
   */
  async updateSecuritySettings(userId: number, settings: SecuritySettingsFormData): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/${API_VERSION}/securitymonitoring/users/${userId}/security-settings`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(settings),
    });
    
    await handleApiResponse<void>(response);
  }

  /**
   * Delete user security settings
   */
  async deleteSecuritySettings(userId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/${API_VERSION}/securitymonitoring/users/${userId}/security-settings`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    await handleApiResponse<void>(response);
  }

  // ===== DATA EXPORT & PRIVACY =====
  
  /**
   * Request data export
   */
  async requestDataExport(exportType: 'complete' | 'profile_only' | 'activity_only' | 'family_only', format: 'json' | 'csv' | 'pdf' = 'json'): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/${API_VERSION}/dataexport`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ exportType, format }),
    });
    
    await handleApiResponse<void>(response);
  }

  /**
   * Clear activity log
   */
  async clearActivityLog(userId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/${API_VERSION}/securitymonitoring/users/${userId}/activity-log`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    await handleApiResponse<void>(response);
  }

  /**
   * Delete user account
   */
  async deleteAccount(userId: number, currentPassword: string, reason: string, feedback?: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/${API_VERSION}/securitymonitoring/users/${userId}/delete-account`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      body: JSON.stringify({ 
        currentPassword, 
        reason, 
        feedback 
      }),
    });
    
    await handleApiResponse<void>(response);
  }

  // ===== SECURITY EVENTS & AUDIT =====
  
  /**
   * Get security events for user
   */
  async getSecurityEvents(userId: number, limit: number = 50): Promise<SecurityEventDTO[]> {
    const response = await fetch(
      `${API_BASE_URL}/api/${API_VERSION}/securitymonitoring/events/user/${userId}?limit=${limit}`, 
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );
    
    return handleApiResponse<SecurityEventDTO[]>(response);
  }

  /**
   * Get security recommendations for user
   */
  async getSecurityRecommendations(userId: number): Promise<SecurityRecommendationDTO[]> {
    const response = await fetch(`${API_BASE_URL}/api/${API_VERSION}/securitymonitoring/recommendations/user/${userId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    return handleApiResponse<SecurityRecommendationDTO[]>(response);
  }

  /**
   * Dismiss security recommendation
   */
  async dismissRecommendation(recommendationId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/${API_VERSION}/securitymonitoring/recommendations/${recommendationId}/dismiss`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    
    await handleApiResponse<void>(response);
  }
}

// Export singleton instance
export const securityService = new SecurityService();
export default securityService; 