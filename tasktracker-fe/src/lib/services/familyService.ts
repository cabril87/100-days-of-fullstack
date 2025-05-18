import { Family, FamilyMember } from '@/lib/types/family';
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

interface ApiOptions {
  suppressAuthError?: boolean;
  usePascalCase?: boolean;
  useFormData?: boolean;
  retries?: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const DEFAULT_RETRY_COUNT = 2;
const RETRY_DELAY_MS = 1000;

// Helper function for adding delay
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const familyService = {
  async createFamily(name: string, options?: ApiOptions): Promise<ApiResponse<Family>> {
    console.log('[familyService] Creating family with name:', name);
    return this.withRetry(async () => {
      try {
        const response = await apiClient.post<Family>('/v1/family/createFamily', { name }, options);
        console.log('[familyService] Create family response:', response);
        
        if (response.error) {
          return { error: response.error, status: response.status };
        }

        if (!response.data) {
          return { error: 'No family data received', status: response.status };
        }

        return {
          data: this.convertFamily(response.data),
          status: response.status
        };
      } catch (error) {
        console.error('[familyService] Error creating family:', error);
        return {
          error: error instanceof Error ? error.message : 'Failed to create family',
          status: 500
        };
      }
    }, options?.retries);
  },

  async getCurrentFamily(options?: ApiOptions): Promise<ApiResponse<Family>> {
    console.log('[familyService] Getting current family');
    return this.withRetry(async () => {
      try {
        const response = await apiClient.get<Family>('/v1/family/current-family', options);
        console.log('[familyService] Get current family response:', response);
        
        if (response.status === 404 && response.error?.includes('No family found')) {
          return { data: undefined, status: 404 };
        }

        if (response.error) {
          return { error: response.error, status: response.status };
        }

        if (!response.data) {
          return { error: 'No family data received', status: response.status };
        }

        return {
          data: this.convertFamily(response.data),
          status: response.status
        };
      } catch (error) {
        console.error('[familyService] Error getting current family:', error);
        return {
          error: error instanceof Error ? error.message : 'Failed to get current family',
          status: 500
        };
      }
    }, options?.retries);
  },

  async getAllFamilies(options?: ApiOptions): Promise<ApiResponse<Family[]>> {
    console.log('[familyService] Getting all families');
    return this.withRetry(async () => {
      try {
        const response = await apiClient.get<Family[]>('/v1/family', options);
        console.log('[familyService] Get all families response:', response);
        
        if (response.error) {
          return { error: response.error, status: response.status };
        }

        if (!response.data) {
          return { error: 'No family data received', status: response.status };
        }

        return {
          data: response.data.map(family => this.convertFamily(family)),
          status: response.status
        };
      } catch (error) {
        console.error('[familyService] Error getting all families:', error);
        return {
          error: error instanceof Error ? error.message : 'Failed to get families',
          status: 500
        };
      }
    }, options?.retries);
  },

  async getFamily(id: string, options?: any): Promise<ApiResponse<Family>> {
    console.log(`[familyService] Getting family with ID: ${id}`);
    try {
      // Make sure to convert ID to string
      const response = await apiClient.get<Family>(`/v1/family/${id}`, options);
      console.log('[familyService] Get family response:', response);
      
      if (response.error) {
        console.error('[familyService] Error in getFamily:', response.error);
        return { error: response.error, status: response.status };
      }

      if (!response.data) {
        console.error('[familyService] No family data received');
        return { error: 'No family data received', status: response.status };
      }

      return {
        data: this.convertFamily(response.data),
        status: response.status
      };
    } catch (error) {
      console.error(`[familyService] Error getting family ${id}:`, error);
      return {
        error: error instanceof Error ? error.message : `Failed to get family ${id}`,
        status: 500
      };
    }
  },

  async updateFamily(id: string, data: { name: string; description?: string }, options?: ApiOptions): Promise<ApiResponse<Family>> {
    console.log(`[familyService] Updating family with ID: ${id}`, data);
    return this.withRetry(async () => {
      try {
        const response = await apiClient.put(`/v1/family/${id}`, data, options);
        console.log('[familyService] Update family response:', response);
        
        if (response.error) {
          return { error: response.error, status: response.status };
        }

        if (!response.data) {
          return { error: 'No family data received', status: response.status };
        }

        return {
          data: this.convertFamily(response.data),
          status: response.status
        };
      } catch (error) {
        console.error(`[familyService] Error updating family ${id}:`, error);
        return {
          error: error instanceof Error ? error.message : `Failed to update family ${id}`,
          status: 500
        };
      }
    }, options?.retries);
  },

  async deleteFamily(id: string, options?: ApiOptions): Promise<ApiResponse<void>> {
    console.log('[familyService] Deleting family with ID:', id);
    return this.withRetry(async () => {
      try {
        // Get fresh token
        const token = localStorage.getItem('token');
        
        // Get CSRF token from cookies
        const csrfToken = document.cookie.split(';')
          .find(cookie => cookie.trim().startsWith('XSRF-TOKEN='))
          ?.split('=')[1];
        
        console.log('[familyService] Using CSRF token for delete:', csrfToken ? 'Available' : 'Not available');
        
        const url = `${API_URL}/v1/family/${id}`;
        console.log('[familyService] DELETE - URL:', url);
        
        // Make DELETE request
        const response = await fetch(url, {
          method: 'DELETE',
          headers: {
            'Accept': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
            'X-CSRF-TOKEN': csrfToken || '', 
            'X-XSRF-TOKEN': csrfToken || ''
          },
          credentials: 'include'
        });
        
        console.log('[familyService] DELETE - Response status:', response.status);
        
        // Handle different response statuses
        if (response.status === 204 || response.status === 200) {
          return { status: response.status };
        } else if (response.status === 404) {
          return { error: 'Family not found', status: 404 };
        } else if (response.status === 403) {
          return { error: 'You do not have permission to delete this family', status: 403 };
        } else if (response.status === 401) {
          return { error: 'Authentication required', status: 401 };
        }
        
        // Try to get detailed error message
        let errorMessage = 'Failed to delete family';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          // If parsing fails, use default error message
        }
        
        return { error: errorMessage, status: response.status };
      } catch (error) {
        console.error('[familyService] Error deleting family:', error);
        return { 
          error: error instanceof Error ? error.message : 'Failed to delete family',
          status: 500 
        };
      }
    }, options?.retries);
  },

  async getFamilyMemberDetails(id: string, options?: ApiOptions): Promise<ApiResponse<FamilyMember>> {
    console.log(`[familyService] Getting family member details for ID: ${id}`);
    return this.withRetry(async () => {
      try {
        const response = await apiClient.get(`/v1/familyMembers/${id}/details`, options);
        console.log('[familyService] Get family member details response:', response);
        
        if (response.error) {
          return { error: response.error, status: response.status };
        }
        
        return response;
      } catch (error) {
        console.error(`[familyService] Error getting family member details ${id}:`, error);
        return {
          error: error instanceof Error ? error.message : `Failed to get family member details ${id}`,
          status: 500
        };
      }
    }, options?.retries);
  },

  async updateFamilyMember(id: string, data: { name: string; role: string; email?: string }, options?: ApiOptions): Promise<ApiResponse<FamilyMember>> {
    console.log(`[familyService] Updating family member with ID: ${id}`, data);
    return this.withRetry(async () => {
      try {
        const response = await apiClient.put(`/v1/familyMembers/${id}`, data, options);
        console.log('[familyService] Update family member response:', response);
        
        if (response.error) {
          return { error: response.error, status: response.status };
        }
        
        return response;
      } catch (error) {
        console.error(`[familyService] Error updating family member ${id}:`, error);
        return {
          error: error instanceof Error ? error.message : `Failed to update family member ${id}`,
          status: 500
        };
      }
    }, options?.retries);
  },

  async deleteFamilyMember(id: string, options?: ApiOptions): Promise<ApiResponse<void>> {
    console.log(`[familyService] Deleting family member with ID: ${id}`);
    return this.withRetry(async () => {
      try {
        const response = await apiClient.delete(`/v1/familyMembers/${id}`, options);
        console.log('[familyService] Delete family member response:', response);
        
        if (response.error) {
          return { error: response.error, status: response.status };
        }
        
        return response;
      } catch (error) {
        console.error(`[familyService] Error deleting family member ${id}:`, error);
        return {
          error: error instanceof Error ? error.message : `Failed to delete family member ${id}`,
          status: 500
        };
      }
    }, options?.retries);
  },

  async inviteMember(familyId: string, email: string, options?: ApiOptions): Promise<ApiResponse<void>> {
    console.log(`[familyService] Inviting member to family ${familyId}:`, email);
    return this.withRetry(async () => {
      try {
        const response = await apiClient.post(`/v1/family/${familyId}/invitations`, { email }, options);
        console.log('[familyService] Invite member response:', response);
        
        if (response.error) {
          return { error: response.error, status: response.status };
        }
        
        return response;
      } catch (error) {
        console.error(`[familyService] Error inviting member to family ${familyId}:`, error);
        return {
          error: error instanceof Error ? error.message : `Failed to invite member to family ${familyId}`,
          status: 500
        };
      }
    }, options?.retries);
  },

  async createInvitation(familyId: string, email: string, options?: ApiOptions): Promise<ApiResponse<any>> {
    return this.inviteMember(familyId, email, options);
  },

  async getFamilyInvitations(familyId: string, options?: ApiOptions): Promise<ApiResponse<any[]>> {
    console.log(`[familyService] Getting invitations for family ${familyId}`);
    return this.withRetry(async () => {
      try {
        const response = await apiClient.get(`/v1/family/${familyId}/invitations`, options);
        console.log('[familyService] Get family invitations response:', response);
        
        if (response.error) {
          return { error: response.error, status: response.status };
        }
        
        return response;
      } catch (error) {
        console.error(`[familyService] Error getting invitations for family ${familyId}:`, error);
        return {
          error: error instanceof Error ? error.message : `Failed to get invitations for family ${familyId}`,
          status: 500
        };
      }
    }, options?.retries);
  },

  async removeMember(familyId: string, memberId: string, options?: ApiOptions): Promise<ApiResponse<void>> {
    console.log(`[familyService] Removing member ${memberId} from family ${familyId}`);
    return this.withRetry(async () => {
      try {
        const response = await apiClient.delete(`/v1/family/${familyId}/members/${memberId}`, options);
        console.log('[familyService] Remove member response:', response);
        
        if (response.error) {
          return { error: response.error, status: response.status };
        }
        
        return response;
      } catch (error) {
        console.error(`[familyService] Error removing member ${memberId} from family ${familyId}:`, error);
        return {
          error: error instanceof Error ? error.message : `Failed to remove member ${memberId} from family ${familyId}`,
          status: 500
        };
      }
    }, options?.retries);
  },

  async updateMemberRole(familyId: string, memberId: string, roleId: number, options?: ApiOptions): Promise<ApiResponse<void>> {
    console.log(`[familyService] Updating role for member ${memberId} in family ${familyId} to role ${roleId}`);
    return this.withRetry(async () => {
      try {
        const response = await apiClient.patch(`/v1/family/${familyId}/members/${memberId}/role`, { roleId }, options);
        console.log('[familyService] Update member role response:', response);
        
        if (response.error) {
          return { error: response.error, status: response.status };
        }
        
        return response;
      } catch (error) {
        console.error(`[familyService] Error updating role for member ${memberId}:`, error);
        return {
          error: error instanceof Error ? error.message : `Failed to update role for member ${memberId}`,
          status: 500
        };
      }
    }, options?.retries);
  },

  // Helper function for retrying API calls
  async withRetry<T>(fn: () => Promise<T>, retries: number = DEFAULT_RETRY_COUNT): Promise<T> {
    let lastError;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        if (attempt > 0) {
          console.log(`[familyService] Retry attempt ${attempt}/${retries}`);
          await sleep(RETRY_DELAY_MS * attempt);
        }
        return await fn();
      } catch (error) {
        console.error(`[familyService] Attempt ${attempt} failed:`, error);
        lastError = error;
      }
    }
    throw lastError;
  },

  convertFamily(data: any): Family {
    console.log('[familyService] Converting family data:', data);
    
    // Check if data has expected properties - fixed to handle ID 0
    if (data.id === undefined || data.id === null) {
      console.error('[familyService] Missing family ID in data');
    }
    if (!Array.isArray(data.members)) {
      console.error('[familyService] Members is not an array in family data');
    }
    
    return {
      // Convert id to string, but handle 0 as a valid ID
      id: (data.id !== undefined && data.id !== null) ? data.id.toString() : '',
      name: data.name || '',
      description: data.description,
      members: Array.isArray(data.members) ? data.members.map((member: any) => ({
        id: (member.id !== undefined && member.id !== null) ? member.id.toString() : '',
        userId: member.user?.id !== undefined ? member.user.id.toString() : '',
        username: member.user?.username || '',
        role: {
          id: member.role?.id ?? 0,
          name: member.role?.name || '',
          description: member.role?.description || '',
          permissions: member.role?.permissions || [],
          isDefault: member.role?.isDefault || false,
          createdAt: member.role?.createdAt || new Date().toISOString()
        },
        email: member.user?.email || '',
        joinedAt: member.joinedAt || new Date().toISOString(),
        completedTasks: member.completedTasks ?? 0,
        pendingTasks: member.pendingTasks ?? 0,
        isActive: member.isActive ?? true
      })) : [],
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || data.createdAt || new Date().toISOString()
    };
  },

  async joinFamily(invitationCode: string, options?: ApiOptions): Promise<ApiResponse<Family>> {
    console.log('[familyService] Joining family with invitation code:', invitationCode);
    return this.withRetry(async () => {
      try {
        const response = await apiClient.post<Family>('/v1/family/join', { invitationCode }, options);
        console.log('[familyService] Join family response:', response);
        
        if (response.error) {
          return { error: response.error, status: response.status };
        }

        if (!response.data) {
          return { error: 'No family data received', status: response.status };
        }

        return {
          data: this.convertFamily(response.data),
          status: response.status
        };
      } catch (error) {
        console.error('[familyService] Error joining family:', error);
        return {
          error: error instanceof Error ? error.message : 'Failed to join family',
          status: 500
        };
      }
    }, options?.retries);
  }
}; 