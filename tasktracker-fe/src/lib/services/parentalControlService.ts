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
} from '../types/parental-control';

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:5001';
const API_VERSION = 'v1';

// Helper function to get auth headers
const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

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

// Helper function to handle API responses
async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new ParentalControlApiError(
      errorData.message || `HTTP ${response.status}`,
      response.status,
      errorData.code,
      errorData.errors
    );
  }
  
  return response.json();
}

// Parental Control Service Class
export class ParentalControlService {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/api/${API_VERSION}`;
  }

  // === PARENTAL CONTROL SETTINGS ===

  /**
   * Get parental control settings for a specific child
   */
  async getParentalControlByChildId(childUserId: number): Promise<ParentalControlDTO | null> {
    const response = await fetch(
      `${this.baseUrl}/parental-controls/child/${childUserId}`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    if (response.status === 404) {
      return null; // No parental controls set for this child
    }

    return handleApiResponse<ParentalControlDTO>(response);
  }

  /**
   * Get all children under parental control for the current parent
   */
  async getParentalControlsByParent(): Promise<ParentalControlDTO[]> {
    const response = await fetch(
      `${this.baseUrl}/parental-controls/parent`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    return handleApiResponse<ParentalControlDTO[]>(response);
  }

  /**
   * Create or update parental control settings
   */
  async createOrUpdateParentalControl(
    childUserId: number, 
    settings: ParentalControlCreateUpdateDTO
  ): Promise<ParentalControlDTO> {
    const response = await fetch(
      `${this.baseUrl}/parental-controls/${childUserId}`,
      {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(settings),
      }
    );

    return handleApiResponse<ParentalControlDTO>(response);
  }

  /**
   * Delete parental control settings for a child
   */
  async deleteParentalControl(childUserId: number): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/parental-controls/${childUserId}`,
      {
        method: 'DELETE',
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new ParentalControlApiError(
        'Failed to delete parental controls',
        response.status
      );
    }
  }

  /**
   * Get parental control summary for a child (includes stats and recent requests)
   */
  async getParentalControlSummary(childUserId: number): Promise<ParentalControlSummaryDTO> {
    const response = await fetch(
      `${this.baseUrl}/parental-controls/${childUserId}/summary`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    return handleApiResponse<ParentalControlSummaryDTO>(response);
  }

  // === PERMISSION REQUESTS ===

  /**
   * Create a new permission request (called by child)
   */
  async createPermissionRequest(request: PermissionRequestCreateDTO): Promise<PermissionRequestDTO> {
    const response = await fetch(
      `${this.baseUrl}/parental-controls/permission-requests`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(request),
      }
    );

    return handleApiResponse<PermissionRequestDTO>(response);
  }

  /**
   * Get permission requests by child ID
   */
  async getPermissionRequestsByChild(childUserId: number): Promise<PermissionRequestDTO[]> {
    const response = await fetch(
      `${this.baseUrl}/parental-controls/permission-requests/child/${childUserId}`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    return handleApiResponse<PermissionRequestDTO[]>(response);
  }

  /**
   * Get pending permission requests for the current parent
   */
  async getPendingPermissionRequests(): Promise<PermissionRequestDTO[]> {
    const response = await fetch(
      `${this.baseUrl}/parental-controls/permission-requests/pending`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    return handleApiResponse<PermissionRequestDTO[]>(response);
  }

  /**
   * Respond to a permission request (approve/deny)
   */
  async respondToPermissionRequest(
    requestId: number, 
    response: PermissionRequestResponseDTO
  ): Promise<PermissionRequestDTO> {
    const httpResponse = await fetch(
      `${this.baseUrl}/parental-controls/permission-requests/${requestId}/respond`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(response),
      }
    );

    return handleApiResponse<PermissionRequestDTO>(httpResponse);
  }

  /**
   * Bulk respond to multiple permission requests
   */
  async bulkRespondToPermissionRequests(
    bulkResponse: BulkPermissionRequestResponseDTO
  ): Promise<PermissionRequestDTO[]> {
    const response = await fetch(
      `${this.baseUrl}/parental-controls/permission-requests/bulk-respond`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(bulkResponse),
      }
    );

    return handleApiResponse<PermissionRequestDTO[]>(response);
  }

  /**
   * Delete a permission request
   */
  async deletePermissionRequest(requestId: number): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/parental-controls/permission-requests/${requestId}`,
      {
        method: 'DELETE',
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new ParentalControlApiError(
        'Failed to delete permission request',
        response.status
      );
    }
  }

  // === SCREEN TIME TRACKING ===

  /**
   * Record screen time session for a child
   */
  async recordScreenTime(childUserId: number, sessionDurationMinutes: number): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/parental-controls/${childUserId}/screen-time`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ 
          sessionDurationMinutes,
          sessionDate: new Date().toISOString()
        }),
      }
    );

    if (!response.ok) {
      throw new ParentalControlApiError(
        'Failed to record screen time',
        response.status
      );
    }
  }

  /**
   * Get screen time for a specific date
   */
  async getScreenTimeForDate(childUserId: number, date: Date): Promise<number> {
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format
    const response = await fetch(
      `${this.baseUrl}/parental-controls/${childUserId}/screen-time/${dateStr}`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    const result = await handleApiResponse<{ totalMinutes: number }>(response);
    return result.totalMinutes;
  }

  /**
   * Get remaining screen time for today
   */
  async getRemainingScreenTime(childUserId: number): Promise<number> {
    const response = await fetch(
      `${this.baseUrl}/parental-controls/${childUserId}/screen-time/remaining`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    const result = await handleApiResponse<{ remainingMinutes: number }>(response);
    return result.remainingMinutes;
  }

  /**
   * Check if child is currently within allowed hours
   */
  async isWithinAllowedHours(childUserId: number): Promise<boolean> {
    const response = await fetch(
      `${this.baseUrl}/parental-controls/${childUserId}/allowed-hours/check`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    const result = await handleApiResponse<{ isAllowed: boolean }>(response);
    return result.isAllowed;
  }

  // === VALIDATION HELPERS ===

  /**
   * Validate if parent has permission to manage a child's controls
   */
  async validateParentPermission(childUserId: number): Promise<boolean> {
    const response = await fetch(
      `${this.baseUrl}/parental-controls/validate-permission/${childUserId}`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    if (response.status === 403) {
      return false;
    }

    const result = await handleApiResponse<{ hasPermission: boolean }>(response);
    return result.hasPermission;
  }

  /**
   * Check if an action requires parent approval
   */
  async requiresParentApproval(childUserId: number, actionType: string): Promise<boolean> {
    const response = await fetch(
      `${this.baseUrl}/parental-controls/${childUserId}/requires-approval/${actionType}`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    const result = await handleApiResponse<{ requiresApproval: boolean }>(response);
    return result.requiresApproval;
  }
}

// Export singleton instance
export const parentalControlService = new ParentalControlService(); 