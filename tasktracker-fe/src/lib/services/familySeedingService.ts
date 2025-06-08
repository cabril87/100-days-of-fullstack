// Family Seeding Service (Admin Only)
import { apiClient } from '../config/api-client';
import {
  FamilySeedingRequest,
  FamilySeedingResponse,
  FamilyScenarioInfo,
  FamilySeedingHealthCheck,
  FamilyScenario,
} from '../types/familySeeding';
import { FamilyDTO } from '../types/family-invitation';

// Define API error response interface matching backend
interface ApiErrorResponse {
  response?: {
    status: number;
    data?: {
      message?: string;
      error?: string;
    };
  };
  message?: string;
}

// Type guard to check if error is ApiErrorResponse
function isApiError(error: unknown): error is ApiErrorResponse {
  return (
    typeof error === 'object' &&
    error !== null &&
    ('response' in error || 'message' in error)
  );
}

export class FamilySeedingService {
  private readonly baseUrl = '/v1/admin/family-seeding';

  /**
   * Get available family scenarios for seeding
   */
  async getScenarios(): Promise<FamilyScenarioInfo[]> {
    try {
      const response = await apiClient.get<FamilyScenarioInfo[]>(`${this.baseUrl}/scenarios`);
      return response;
    } catch (error: unknown) {
      if (isApiError(error) && error.response?.status === 403) {
        throw new Error('Only global admins can access family seeding functionality');
      }
      if (isApiError(error) && error.response?.status === 404) {
        console.debug('Family seeding scenarios endpoint not available yet');
        return []; // Return empty array for graceful degradation
      }
      const message = isApiError(error) ? 
        error.response?.data?.message || error.message || 'Failed to get family scenarios' :
        'Failed to get family scenarios';
      throw new Error(message);
    }
  }

  /**
   * Seed a family with test data
   */
  async seedFamily(request: FamilySeedingRequest): Promise<FamilySeedingResponse> {
    try {
      const response = await apiClient.post<FamilySeedingResponse>(`${this.baseUrl}/seed`, request);
      return response;
    } catch (error: unknown) {
      if (isApiError(error) && error.response?.status === 403) {
        throw new Error('Only global admins can seed family data');
      }
      if (isApiError(error) && error.response?.status === 404) {
        throw new Error('Family seeding feature is not yet available on this server');
      }
      const message = isApiError(error) ? 
        error.response?.data?.message || error.message || 'Failed to seed family data' :
        'Failed to seed family data';
      throw new Error(message);
    }
  }

  /**
   * Quick seed a specific scenario
   */
  async quickSeed(scenario: FamilyScenario, memberCount?: number): Promise<FamilySeedingResponse> {
    try {
      const url = `${this.baseUrl}/quick-seed/${scenario}${memberCount ? `?memberCount=${memberCount}` : ''}`;
      const response = await apiClient.post<FamilySeedingResponse>(url);
      return response;
    } catch (error: unknown) {
      if (isApiError(error) && error.response?.status === 403) {
        throw new Error('Only global admins can seed family data');
      }
      if (isApiError(error) && error.response?.status === 404) {
        throw new Error('Family seeding feature is not yet available on this server');
      }
      const message = isApiError(error) ? 
        error.response?.data?.message || error.message || 'Failed to quick seed family data' :
        'Failed to quick seed family data';
      throw new Error(message);
    }
  }

  /**
   * Clear all test family data
   */
  async clearTestFamilies(): Promise<{ success: boolean; message: string; familiesCleared: number }> {
    try {
      const response = await apiClient.delete<{ success: boolean; message: string; familiesCleared: number }>(`${this.baseUrl}/clear`);
      return response;
    } catch (error: unknown) {
      if (isApiError(error) && error.response?.status === 403) {
        throw new Error('Only global admins can clear test family data');
      }
      if (isApiError(error) && error.response?.status === 404) {
        throw new Error('Family seeding feature is not yet available on this server');
      }
      const message = isApiError(error) ? 
        error.response?.data?.message || error.message || 'Failed to clear test families' :
        'Failed to clear test families';
      throw new Error(message);
    }
  }

  /**
   * Get list of test families created by seeding
   */
  async getTestFamilies(): Promise<FamilyDTO[]> {
    try {
      const response = await apiClient.get<FamilyDTO[]>(`${this.baseUrl}/test-families`);
      return response;
    } catch (error: unknown) {
      if (isApiError(error) && error.response?.status === 403) {
        throw new Error('Only global admins can view test families');
      }
      if (isApiError(error) && error.response?.status === 404) {
        console.debug('Family seeding test families endpoint not available yet');
        return []; // Return empty array for graceful degradation
      }
      const message = isApiError(error) ? 
        error.response?.data?.message || error.message || 'Failed to get test families' :
        'Failed to get test families';
      throw new Error(message);
    }
  }

  /**
   * Check health of family seeding service
   */
  async healthCheck(): Promise<FamilySeedingHealthCheck> {
    try {
      const response = await apiClient.get<FamilySeedingHealthCheck>(`${this.baseUrl}/health`);
      return response;
    } catch (error: unknown) {
      if (isApiError(error) && error.response?.status === 403) {
        throw new Error('Only global admins can check seeding service health');
      }
      if (isApiError(error) && error.response?.status === 404) {
        // Return a default health check response for graceful degradation
        console.debug('Family seeding health endpoint not available yet');
        return {
          status: 'service_unavailable',
          scenariosAvailable: 0,
          testFamiliesExists: 0,
          timestamp: new Date().toISOString()
        };
      }
      const message = isApiError(error) ? 
        error.response?.data?.message || error.message || 'Failed to check service health' :
        'Failed to check service health';
      throw new Error(message);
    }
  }
}

export const familySeedingService = new FamilySeedingService(); 