/*
 * Customer Support Service
 * Copyright (c) 2025 Carlos Abril Jr
 */

import { apiClient, ApiClientError } from '../config/api-client';
import { 
  UserSearchResult, 
  UserAccountInfo, 
  MFADisableResult
} from '../types/system';

class CustomerSupportServiceError extends Error {
  constructor(
    message: string,
    public status?: number,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'CustomerSupportServiceError';
  }
}

class CustomerSupportService {
  private readonly baseEndpoint = '/v1/support';

  /**
   * Search for a user by email address
   */
  async searchUserByEmail(email: string): Promise<UserSearchResult> {
    try {
      if (!email || !email.trim()) {
        throw new CustomerSupportServiceError('Email is required', 400);
      }

      return await apiClient.get<UserSearchResult>(`${this.baseEndpoint}/users/search?email=${encodeURIComponent(email)}`);
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw new CustomerSupportServiceError(error.message, error.statusCode, error.errors);
      }
      throw new CustomerSupportServiceError('Network error occurred while searching for user');
    }
  }

  /**
   * Get detailed account information for a user
   */
  async getUserAccountInfo(userId: number): Promise<UserAccountInfo> {
    try {
      if (!userId || userId <= 0) {
        throw new CustomerSupportServiceError('Valid user ID is required', 400);
      }

      return await apiClient.get<UserAccountInfo>(`${this.baseEndpoint}/users/${userId}/account-info`);
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw new CustomerSupportServiceError(error.message, error.statusCode, error.errors);
      }
      throw new CustomerSupportServiceError('Network error occurred while fetching account info');
    }
  }

  /**
   * Emergency disable MFA for a user (Customer Support function)
   */
  async emergencyDisableMFA(userId: number, reason: string): Promise<MFADisableResult> {
    try {
      if (!userId || userId <= 0) {
        throw new CustomerSupportServiceError('Valid user ID is required', 400);
      }

      if (!reason || !reason.trim()) {
        throw new CustomerSupportServiceError('Reason is required for MFA disable action', 400);
      }

      return await apiClient.post<MFADisableResult>(`${this.baseEndpoint}/users/${userId}/disable-mfa`, reason);
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw new CustomerSupportServiceError(error.message, error.statusCode, error.errors);
      }
      throw new CustomerSupportServiceError('Network error occurred while disabling MFA');
    }
  }

  /**
   * Validate if current user has customer support permissions
   */
  async validateSupportAccess(): Promise<boolean> {
    try {
      // Try to access a simple endpoint that requires customer support role
      await apiClient.get(`${this.baseEndpoint}/users/search?email=test@example.com`);
      return true;
    } catch (error) {
      if (error instanceof ApiClientError && (error.statusCode === 403 || error.statusCode === 401)) {
        return false;
      }
      // Other errors (like 404 for user not found) indicate access is working
      return true;
    }
  }
}

// Export singleton instance
export const customerSupportService = new CustomerSupportService();
export { CustomerSupportServiceError }; 
