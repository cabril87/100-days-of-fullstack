/*
 * Parental Control API Service
 * Copyright (c) 2025 Carlos Abril Jr
 */

import { 
  ParentalControlDTO,
  ParentalControlCreateUpdateDTO,
  PermissionRequestDTO,
  PermissionRequestCreateDTO,
  PermissionRequestResponseDTO,
  BulkPermissionRequestResponseDTO,
  ParentalControlSummaryDTO 
} from '../types/system';
import { apiClient } from '../config/api-client';

// Custom error class for API errors
export class ParentalControlApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ParentalControlApiError';
  }
}

// Parental Control Service Class
export class ParentalControlService {
  // === PARENTAL CONTROL SETTINGS ===

  /**
   * Get parental control settings for a specific child
   */
  async getParentalControlByChildId(childUserId: number): Promise<ParentalControlDTO | null> {
    try {
      return await apiClient.get<ParentalControlDTO>(`/v1/parental-controls/child/${childUserId}`);
    } catch {
      // Return null if not found
      console.debug('No parental controls found for child:', childUserId);
      return null;
    }
  }

  /**
   * Get all children under parental control for the current parent
   */
  async getParentalControlsByParent(): Promise<ParentalControlDTO[]> {
    try {
      return await apiClient.get<ParentalControlDTO[]>('/v1/parental-controls/parent');
    } catch (error) {
      console.error('Failed to fetch parental controls by parent:', error);
      return [];
    }
  }

  /**
   * Create or update parental control settings
   */
  async createOrUpdateParentalControl(
    childUserId: number, 
    settings: ParentalControlCreateUpdateDTO
  ): Promise<ParentalControlDTO> {
    try {
      return await apiClient.put<ParentalControlDTO>(`/v1/parental-controls/${childUserId}`, settings);
    } catch (error) {
      console.error('Failed to create/update parental control:', error);
      throw error;
    }
  }

  /**
   * Delete parental control settings for a child
   */
  async deleteParentalControl(childUserId: number): Promise<void> {
    try {
      await apiClient.delete<void>(`/v1/parental-controls/${childUserId}`);
    } catch (error) {
      console.error('Failed to delete parental control:', error);
      throw error;
    }
  }

  /**
   * Get parental control summary for a child (includes stats and recent requests)
   */
  async getParentalControlSummary(childUserId: number): Promise<ParentalControlSummaryDTO> {
    try {
      return await apiClient.get<ParentalControlSummaryDTO>(`/v1/parental-controls/${childUserId}/summary`);
    } catch (error) {
      console.error('Failed to fetch parental control summary:', error);
      throw error;
    }
  }

  // === PERMISSION REQUESTS ===

  /**
   * Create a new permission request (called by child)
   */
  async createPermissionRequest(request: PermissionRequestCreateDTO): Promise<PermissionRequestDTO> {
    try {
      return await apiClient.post<PermissionRequestDTO>('/v1/parental-controls/permission-requests', request);
    } catch (error) {
      console.error('Failed to create permission request:', error);
      throw error;
    }
  }

  /**
   * Get permission requests by child ID
   */
  async getPermissionRequestsByChild(childUserId: number): Promise<PermissionRequestDTO[]> {
    try {
      return await apiClient.get<PermissionRequestDTO[]>(`/v1/parental-controls/permission-requests/child/${childUserId}`);
    } catch (error) {
      console.error('Failed to fetch permission requests by child:', error);
      return [];
    }
  }

  /**
   * Get pending permission requests for the current parent
   */
  async getPendingPermissionRequests(): Promise<PermissionRequestDTO[]> {
    try {
      return await apiClient.get<PermissionRequestDTO[]>('/v1/parental-controls/permission-requests/pending');
    } catch (error) {
      console.error('Failed to fetch pending permission requests:', error);
      return [];
    }
  }

  /**
   * Respond to a permission request (approve/deny)
   */
  async respondToPermissionRequest(
    requestId: number, 
    response: PermissionRequestResponseDTO
  ): Promise<PermissionRequestDTO> {
    try {
      return await apiClient.post<PermissionRequestDTO>(`/v1/parental-controls/permission-requests/${requestId}/respond`, response);
    } catch (error) {
      console.error('Failed to respond to permission request:', error);
      throw error;
    }
  }

  /**
   * Respond to multiple permission requests at once
   */
  async bulkRespondToPermissionRequests(
    bulkResponse: BulkPermissionRequestResponseDTO
  ): Promise<PermissionRequestDTO[]> {
    try {
      return await apiClient.post<PermissionRequestDTO[]>('/v1/parental-controls/permission-requests/bulk-respond', bulkResponse);
    } catch (error) {
      console.error('Failed to bulk respond to permission requests:', error);
      throw error;
    }
  }

  /**
   * Delete a permission request
   */
  async deletePermissionRequest(requestId: number): Promise<void> {
    try {
      await apiClient.delete<void>(`/v1/parental-controls/permission-requests/${requestId}`);
    } catch (error) {
      console.error('Failed to delete permission request:', error);
      throw error;
    }
  }

  // === SCREEN TIME TRACKING ===

  /**
   * Record screen time for a child
   */
  async recordScreenTime(childUserId: number, sessionDurationMinutes: number): Promise<void> {
    try {
      await apiClient.post<void>(`/v1/parental-controls/${childUserId}/screen-time`, {
        sessionDurationMinutes
      });
    } catch (error) {
      console.error('Failed to record screen time:', error);
      throw error;
    }
  }

  /**
   * Get total screen time for a child on a specific date
   */
  async getScreenTimeForDate(childUserId: number, date: Date): Promise<number> {
    try {
      const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      const result = await apiClient.get<{ totalMinutes: number }>(`/v1/parental-controls/${childUserId}/screen-time?date=${dateStr}`);
      return result.totalMinutes || 0;
    } catch (error) {
      console.error('Failed to fetch screen time for date:', error);
      return 0;
    }
  }

  /**
   * Get remaining screen time for today
   */
  async getRemainingScreenTime(childUserId: number): Promise<number> {
    try {
      const result = await apiClient.get<{ remainingMinutes: number }>(`/v1/parental-controls/${childUserId}/screen-time/remaining`);
      return result.remainingMinutes || 0;
    } catch (error) {
      console.error('Failed to fetch remaining screen time:', error);
      return 0;
    }
  }

  /**
   * Check if current time is within allowed hours for the child
   */
  async isWithinAllowedHours(childUserId: number): Promise<boolean> {
    try {
      const result = await apiClient.get<{ isAllowed: boolean }>(`/v1/parental-controls/${childUserId}/allowed-hours/check`);
      return result.isAllowed || false;
    } catch (error) {
      console.error('Failed to check allowed hours:', error);
      return false;
    }
  }

  // === VALIDATION & AUTHORIZATION ===

  /**
   * Validate that the current user has permission to manage a child's parental controls
   */
  async validateParentPermission(childUserId: number): Promise<boolean> {
    try {
      const result = await apiClient.get<{ hasPermission: boolean }>(`/v1/parental-controls/validate-permission/${childUserId}`);
      return result.hasPermission || false;
    } catch (error) {
      console.error('Failed to validate parent permission:', error);
      return false;
    }
  }

  /**
   * Check if a specific action requires parent approval for a child
   */
  async requiresParentApproval(childUserId: number, actionType: string): Promise<boolean> {
    try {
      const result = await apiClient.get<{ requiresApproval: boolean }>(`/v1/parental-controls/${childUserId}/requires-approval?actionType=${encodeURIComponent(actionType)}`);
      return result.requiresApproval || false;
    } catch (error) {
      console.error('Failed to check if action requires approval:', error);
      return false;
    }
  }
}

// Export singleton instance
export const parentalControlService = new ParentalControlService(); 
