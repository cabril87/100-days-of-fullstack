import { Family } from '../types/family';
import { apiClient } from './apiClient';
import { ApiResponse } from '@/lib/types/api';

interface FamilyDTO {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
  createdBy: {
    id: number;
    username: string;
    email: string;
  } | null;
  members: Array<{
    id: number;
    familyId: number;
    name: string;
    email: string | null;
    avatarUrl: string | null;
    relationship: string;
    user: {
      id: number;
      username: string;
      email: string;
      firstName: string;
      lastName: string;
      displayName: string;
      avatarUrl: string | null;
      createdAt: string;
    };
    role: {
      id: number;
      name: string;
      description: string;
      permissions: string[];
      isDefault: boolean;
      createdAt: string;
    };
    joinedAt: string;
  }>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const familyService = {
  async createFamily(name: string): Promise<ApiResponse<Family>> {
    const response = await apiClient.post<FamilyDTO>('/v1/family/createFamily', { name }, { usePascalCase: true });
    
    console.log('[familyService] Create family response:', JSON.stringify(response, null, 2));
    
    if (response.error) {
      console.log('[familyService] Error in response:', response.error);
      return { error: response.error };
    }
    
    if (!response.data) {
      console.log('[familyService] No data in response');
      return { error: 'No family data received' };
    }
    
    console.log('[familyService] Response data:', JSON.stringify(response.data, null, 2));
    
    try {
      // Convert FamilyDTO to Family
      const family: Family = {
        id: response.data.id.toString(),
        name: response.data.name,
        members: response.data.members.map(member => ({
          id: member.id.toString(),
          userId: member.user.id.toString(),
          username: member.user.username,
          role: member.role.name.toLowerCase() as 'admin' | 'member',
          joinedAt: member.joinedAt
        })),
        createdAt: response.data.createdAt,
        updatedAt: response.data.updatedAt || response.data.createdAt
      };
      
      console.log('[familyService] Converted family:', JSON.stringify(family, null, 2));
      
      return { data: family };
    } catch (error) {
      console.error('[familyService] Error converting family:', error);
      return { error: 'Error converting family data' };
    }
  },

  async getCurrentFamily(): Promise<ApiResponse<Family | null>> {
    const response = await apiClient.get<FamilyDTO>('/v1/family/current');
    
    if (response.error) {
      return { error: response.error };
    }
    
    if (!response.data) {
      return { data: null };
    }
    
    try {
      // Convert FamilyDTO to Family
      const family: Family = {
        id: response.data.id.toString(),
        name: response.data.name,
        members: response.data.members.map(member => ({
          id: member.id.toString(),
          userId: member.user.id.toString(),
          username: member.user.username,
          role: member.role.name.toLowerCase() as 'admin' | 'member',
          joinedAt: member.joinedAt
        })),
        createdAt: response.data.createdAt,
        updatedAt: response.data.updatedAt || response.data.createdAt
      };
      
      return { data: family };
    } catch (error) {
      console.error('[familyService] Error converting family:', error);
      return { error: 'Error converting family data' };
    }
  },

  async updateFamily(familyId: string, data: Partial<Family>): Promise<ApiResponse<Family>> {
    try {
      const response = await apiClient.patch<FamilyDTO>(`/v1/family/${familyId}`, data);
      
      if (response.error) {
        return { error: response.error };
      }
      
      if (!response.data) {
        return { error: 'No family data received' };
      }
      
      // Convert FamilyDTO to Family
      const family: Family = {
        id: response.data.id.toString(),
        name: response.data.name,
        members: response.data.members.map(member => ({
          id: member.id.toString(),
          userId: member.user.id.toString(),
          username: member.user.username,
          role: member.role.name.toLowerCase() as 'admin' | 'member',
          joinedAt: member.joinedAt
        })),
        createdAt: response.data.createdAt,
        updatedAt: response.data.updatedAt || response.data.createdAt
      };
      
      return { data: family };
    } catch (error) {
      console.error('[familyService] Error updating family:', error);
      return { error: error instanceof Error ? error.message : 'Failed to update family' };
    }
  },

  async deleteFamily(familyId: string): Promise<ApiResponse<void>> {
    try {
      console.log('[familyService] Deleting family:', familyId);
      const response = await apiClient.delete(`/v1/family/${familyId}`);
      
      if (response.error) {
        console.log('[familyService] Delete family error:', response.error);
        
        // Handle specific error cases
        if (response.status === 404) {
          return {
            error: 'Family not found. It may have been already deleted.',
            status: 404
          };
        }
        
        if (response.status === 401) {
          return {
            error: 'Please log in again to continue',
            status: 401
          };
        }
        
        if (response.status === 429) {
          return {
            error: 'Too many requests. Please try again in a moment.',
            status: 429
          };
        }
        
        return {
          error: response.error,
          status: response.status
        };
      }
      
      console.log('[familyService] Family deleted successfully');
      return { status: response.status };
    } catch (error) {
      console.error('[familyService] Error deleting family:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to delete family',
        status: 0
      };
    }
  },

  async getAllFamilies(): Promise<ApiResponse<Family[]>> {
    try {
      const response = await apiClient.get<FamilyDTO[]>('/v1/family');
      
      if (response.error) {
        return { error: response.error };
      }
      
      if (!response.data) {
        return { data: [] };
      }
      
      // Convert FamilyDTO[] to Family[]
      const families: Family[] = response.data.map(family => ({
        id: family.id.toString(),
        name: family.name,
        members: family.members.map(member => ({
          id: member.id.toString(),
          userId: member.user.id.toString(),
          username: member.user.username,
          role: member.role.name.toLowerCase() as 'admin' | 'member',
          joinedAt: member.joinedAt
        })),
        createdAt: family.createdAt,
        updatedAt: family.updatedAt || family.createdAt
      }));
      
      return { data: families };
    } catch (error) {
      console.error('[familyService] Error fetching families:', error);
      return { error: error instanceof Error ? error.message : 'Failed to fetch families' };
    }
  },

  async getFamily(id: string): Promise<ApiResponse<Family>> {
    try {
      const response = await apiClient.get<FamilyDTO>(`/v1/family/${id}`);
      
      if (response.error) {
        return { error: response.error };
      }
      
      if (!response.data) {
        return { error: 'Family not found' };
      }
      
      // Convert FamilyDTO to Family
      const family: Family = {
        id: response.data.id.toString(),
        name: response.data.name,
        members: response.data.members.map(member => ({
          id: member.id.toString(),
          userId: member.user.id.toString(),
          username: member.user.username,
          role: member.role.name.toLowerCase() as 'admin' | 'member',
          joinedAt: member.joinedAt
        })),
        createdAt: response.data.createdAt,
        updatedAt: response.data.updatedAt || response.data.createdAt
      };
      
      return { data: family };
    } catch (error) {
      console.error('[familyService] Error fetching family:', error);
      return { error: error instanceof Error ? error.message : 'Failed to fetch family' };
    }
  },

  async createInvitation(familyId: string, email: string): Promise<ApiResponse<any>> {
    return apiClient.post(`/v1/family/${familyId}/invitations`, { email });
  },

  async getFamilyInvitations(familyId: string): Promise<ApiResponse<any[]>> {
    return apiClient.get(`/v1/family/${familyId}/invitations`);
  }
}; 