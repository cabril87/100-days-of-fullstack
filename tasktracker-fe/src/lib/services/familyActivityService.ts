import { apiRequest } from '@/lib/services/apiClient';
import { ApiResponse } from '@/lib/types/api';
import {
  FamilyActivityDTO,
  FamilyActivityFilterDTO,
  FamilyActivityPagedResultDTO
} from '@/lib/types/activity';

export const familyActivityService = {
  /**
   * Get all activities for a family with pagination
   */
  getAll: async (familyId: number, pageNumber = 1, pageSize = 20): Promise<FamilyActivityPagedResultDTO> => {
    const response = await apiRequest<FamilyActivityPagedResultDTO>(
      `/v1/family/${familyId}/activity?pageNumber=${pageNumber}&pageSize=${pageSize}`,
      'GET'
    );
    if (!response.data) throw new Error('Failed to fetch activities');
    return response.data;
  },

  /**
   * Get a specific activity by ID
   */
  getById: async (familyId: number, activityId: number): Promise<FamilyActivityDTO> => {
    const response = await apiRequest<FamilyActivityDTO>(
      `/v1/family/${familyId}/activity/${activityId}`,
      'GET'
    );
    if (!response.data) throw new Error('Failed to fetch activity');
    return response.data;
  },

  /**
   * Search activities by term
   */
  search: async (familyId: number, term: string, pageNumber = 1, pageSize = 20): Promise<FamilyActivityPagedResultDTO> => {
    const response = await apiRequest<FamilyActivityPagedResultDTO>(
      `/v1/family/${familyId}/activity/search?term=${encodeURIComponent(term)}&pageNumber=${pageNumber}&pageSize=${pageSize}`,
      'GET'
    );
    if (!response.data) throw new Error('Failed to search activities');
    return response.data;
  },

  /**
   * Filter activities
   */
  filter: async (familyId: number, filter: FamilyActivityFilterDTO): Promise<FamilyActivityPagedResultDTO> => {
    const response = await apiRequest<FamilyActivityPagedResultDTO>(
      `/v1/family/${familyId}/activity/filter`,
      'POST',
      filter
    );
    if (!response.data) throw new Error('Failed to filter activities');
    return response.data;
  },

  /**
   * Get activities by actor
   */
  getByActor: async (familyId: number, actorId: number, pageNumber = 1, pageSize = 20): Promise<FamilyActivityPagedResultDTO> => {
    const response = await apiRequest<FamilyActivityPagedResultDTO>(
      `/v1/family/${familyId}/activity/by-actor/${actorId}?pageNumber=${pageNumber}&pageSize=${pageSize}`,
      'GET'
    );
    if (!response.data) throw new Error('Failed to fetch actor activities');
    return response.data;
  },

  /**
   * Get activities by target
   */
  getByTarget: async (familyId: number, targetId: number, pageNumber = 1, pageSize = 20): Promise<FamilyActivityPagedResultDTO> => {
    const response = await apiRequest<FamilyActivityPagedResultDTO>(
      `/v1/family/${familyId}/activity/by-target/${targetId}?pageNumber=${pageNumber}&pageSize=${pageSize}`,
      'GET'
    );
    if (!response.data) throw new Error('Failed to fetch target activities');
    return response.data;
  },

  /**
   * Get activities by action type
   */
  getByActionType: async (familyId: number, actionType: string, pageNumber = 1, pageSize = 20): Promise<FamilyActivityPagedResultDTO> => {
    const response = await apiRequest<FamilyActivityPagedResultDTO>(
      `/v1/family/${familyId}/activity/by-action/${actionType}?pageNumber=${pageNumber}&pageSize=${pageSize}`,
      'GET'
    );
    if (!response.data) throw new Error('Failed to fetch activities by action type');
    return response.data;
  },

  /**
   * Get activities by entity
   */
  getByEntity: async (familyId: number, entityType: string, entityId: number, pageNumber = 1, pageSize = 20): Promise<FamilyActivityPagedResultDTO> => {
    const response = await apiRequest<FamilyActivityPagedResultDTO>(
      `/v1/family/${familyId}/activity/by-entity/${entityType}/${entityId}?pageNumber=${pageNumber}&pageSize=${pageSize}`,
      'GET'
    );
    if (!response.data) throw new Error('Failed to fetch entity activities');
    return response.data;
  }
}; 