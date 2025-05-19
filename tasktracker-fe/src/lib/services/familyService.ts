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

  async getFamily(id: string, options?: ApiOptions): Promise<ApiResponse<Family>> {
    console.log(`[familyService] Getting family with ID: ${id}`);
    
    // Check authentication status
    const authToken = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!authToken) {
      console.error('[familyService] Authentication token not found');
      return {
        error: 'You must be logged in to view family details',
        status: 401
      };
    }
    
    try {
      // Make sure to convert ID to string
      console.log(`[familyService] Sending request to get family ${id}`);
      const response = await apiClient.get<Family>(`/v1/family/${id}`, options);
      console.log('[familyService] Get family response:', response);
      
      if (response.status === 401) {
        console.error('[familyService] Authentication failed in getFamily');
        // Clear invalid token
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        return { 
          error: 'Authentication failed. Please log in again.',
          status: 401 
        };
      }
      
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
        
        if (response.status === 404) {
          return { 
            error: 'Member not found. The member may have been removed or you don\'t have access.', 
            status: 404 
          };
        }
        
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
        // Include familyRoleId: 1 to specify a default member role
        // Also include familyId in the request body
        const response = await apiClient.post(`/v1/family/${familyId}/invitations`, { 
          email,
          familyId: parseInt(familyId), // Convert string to number for the backend
          familyRoleId: 1  // Default member role ID
        }, options);
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

  async getUserPendingInvitations(options?: ApiOptions): Promise<ApiResponse<any[]>> {
    console.log(`[familyService] Getting pending invitations for current user`);
    return this.withRetry(async () => {
      try {
        // Log authentication details
        const token = localStorage.getItem('token');
        console.log(`[familyService] Auth token available: ${!!token}`);
        
        // Enhanced error handling for this endpoint
        try {
          // Check for token before making request
          if (!token) {
            console.warn('[familyService] No auth token available for pending invitations request');
            // Return empty array instead of failing - client might not be logged in yet
            return { data: [], status: 401, error: 'Authentication required' };
          }

          // Update to use the correct API endpoint matching our backend
          const response = await apiClient.get<any[]>(`/v1/invitation/pending`, {
            ...options,
            suppressAuthError: false // Ensure we get auth errors
          });
          
          console.log('[familyService] Get user pending invitations response:', response);
          
          // Add detailed logging for debugging
          if (response.data) {
            console.log(`[familyService] Found ${response.data.length} pending invitations`);
            if (response.data.length > 0) {
              console.log('[familyService] First invitation sample:', JSON.stringify(response.data[0]));
            }
          } else if (response.error) {
            console.error(`[familyService] Error getting pending invitations: ${response.error}`);
          } else {
            console.log('[familyService] No invitations data returned but no error either');
          }
          
          if (response.error) {
            return { error: response.error, status: response.status, data: [] };
          }
          
          // Force data to always be an array
          return { 
            ...response, 
            data: Array.isArray(response.data) ? response.data : [] 
          };
        } catch (apiError) {
          console.error('[familyService] API error in getUserPendingInvitations:', apiError);
          // Return empty array instead of failing completely
          return { data: [], status: 500, error: 'Unable to retrieve pending invitations' };
        }
      } catch (error) {
        console.error(`[familyService] Error getting pending invitations for user:`, error);
        // Return empty array as fallback
        return {
          error: error instanceof Error ? error.message : `Failed to get pending invitations for user`,
          status: 500,
          data: []
        };
      }
    }, options?.retries || 3); // Increase default retries for this important call
  },

  async checkEmailHasPendingInvitation(email: string, familyId?: string): Promise<ApiResponse<boolean>> {
    console.log(`[familyService] Checking if email ${email} has pending invitation${familyId ? ` for family ${familyId}` : ''}`);
    return this.withRetry(async () => {
      try {
        const endpoint = familyId 
          ? `/v1/invitations/check?email=${encodeURIComponent(email)}&familyId=${familyId}`
          : `/v1/invitations/check?email=${encodeURIComponent(email)}`;
          
        const response = await apiClient.get(endpoint);
        console.log('[familyService] Check pending invitation response:', response);
        
        if (response.error) {
          return { error: response.error, status: response.status };
        }
        
        return response;
      } catch (error) {
        console.error(`[familyService] Error checking pending invitation for email ${email}:`, error);
        return {
          error: error instanceof Error ? error.message : `Failed to check pending invitation for email ${email}`,
          status: 500
        };
      }
    }, 1); // Only retry once for this check
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
    
    // Safety check for null or undefined data
    if (!data) {
      console.error('[familyService] Cannot convert null or undefined family data');
      return {
        id: '',
        name: '',
        members: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
    
    // Convert members with error handling for missing data
    let members: any[] = [];
    try {
      members = Array.isArray(data.members) ? data.members : [];
      
      // Add helpful warning for debugging but don't block processing
      if (!Array.isArray(data.members)) {
        console.warn('[familyService] Members is not an array:', data.members);
      }
      
      // Filter out any null members before processing
      members = members.filter(member => member !== null && member !== undefined);
      
      // Check if members array contains valid data
      members.forEach((member, index) => {
        if (!member.role) {
          console.warn(`[familyService] Member at index ${index} has no role information - will create default`);
        }
        if (!member.user) {
          console.log(`[familyService] Member at index ${index} has no user information - will use member data directly`);
        }
      });
    } catch (error) {
      console.error('[familyService] Error processing members data:', error);
      members = [];
    }
    
    return {
      // Convert id to string, but handle 0 as a valid ID
      id: (data.id !== undefined && data.id !== null) ? data.id.toString() : '',
      name: data.name || '',
      description: data.description,
      members: members.map((member: any) => {
        try {
          // Get the user data directly if it exists, or use member data otherwise
          const userData = member.user || {};
          
          // Get user info with fallbacks for key fields
          // Use member data directly if user data is missing
          const userId = member.userId || userData.id || member.id || '';
          const username = userData.username || member.username || member.name || 'Unknown';
          const email = userData.email || member.email || '';
          
          return {
            id: (member.id !== undefined && member.id !== null) ? member.id.toString() : '',
            userId: userId.toString(), // Ensure userId is a string
            username: username,
            role: member.role ? {
              id: member.role.id ?? 0,
              name: member.role.name || '',
              description: member.role.description || '',
              permissions: member.role.permissions || [],
              isDefault: member.role.isDefault || false,
              createdAt: member.role.createdAt || new Date().toISOString()
            } : {
              id: 0,
              name: 'Member',
              description: 'Default family member',
              permissions: [],
              isDefault: true,
              createdAt: new Date().toISOString()
            },
            email: email,
            joinedAt: member.joinedAt || new Date().toISOString(),
            completedTasks: member.completedTasks ?? 0,
            pendingTasks: member.pendingTasks ?? 0,
            isActive: member.isActive ?? true
          };
        } catch (error) {
          console.error('[familyService] Error converting member:', error);
          // Provide a minimal fallback for this member
          return {
            id: member.id ? member.id.toString() : '0',
            userId: member.id ? member.id.toString() : '0',
            username: 'Unknown Member',
            joinedAt: new Date().toISOString(),
            role: {
              id: 0,
              name: 'Member',
              description: 'Default role',
              permissions: [],
              isDefault: true,
              createdAt: new Date().toISOString()
            }
          };
        }
      }),
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
  },
  
  /**
   * Refresh a family by ID, ensuring that all the latest information is retrieved
   * This includes updated members, tasks, and other state information
   * 
   * @param id Family ID to refresh
   * @param forceRefresh Whether to bypass any caching and force a full reload
   * @param options API options including retries
   * @returns ApiResponse with the refreshed family data
   */
  async refreshFamily(id: string, forceRefresh: boolean = false, options?: ApiOptions): Promise<ApiResponse<Family>> {
    console.log(`[familyService] Refreshing family with ID: ${id}, forceRefresh: ${forceRefresh}`);
    
    // Use more retries for refresh operations to ensure data consistency
    const refreshRetries = options?.retries || DEFAULT_RETRY_COUNT + 1;
    
    return this.withRetry(async () => {
      try {
        // Add cache busting parameter if forceRefresh is true
        const endpoint = forceRefresh ? 
          `/v1/family/${id}?_=${Date.now()}` : 
          `/v1/family/${id}`;
        
        // Use fresh auth token for refresh operations
        const token = localStorage.getItem('token');
        const headers: Record<string, string> = {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        };
        
        if (token) {
          headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
        }
        
        // Make direct fetch request to ensure we bypass any potential caching
        const url = `${API_URL}${endpoint}`;
        console.log(`[familyService] Refresh - Making direct request to: ${url}`);
        
        const response = await fetch(url, {
          method: 'GET',
          headers,
          credentials: 'include'
        });
        
        console.log(`[familyService] Refresh response status: ${response.status}`);
        
        if (response.status === 401) {
          return { error: 'Authentication required', status: 401 };
        }
        
        if (response.status === 404) {
          return { error: 'Family not found', status: 404 };
        }
        
        if (!response.ok) {
          let errorMessage = `Server returned ${response.status}`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
          } catch {
            // Ignore JSON parsing errors
          }
          return { error: errorMessage, status: response.status };
        }
        
        try {
          const responseData = await response.json();
          console.log('[familyService] Successfully refreshed family data');
          
          // Check if the response is wrapped in a 'data' property (API response wrapper)
          const familyData = responseData.data || responseData;
          
          return {
            data: this.convertFamily(familyData),
            status: response.status
          };
        } catch (parseError) {
          console.error('[familyService] Error parsing refresh response:', parseError);
          return { 
            error: 'Error parsing server response', 
            status: response.status 
          };
        }
      } catch (error) {
        console.error(`[familyService] Error refreshing family ${id}:`, error);
        return {
          error: error instanceof Error ? error.message : `Failed to refresh family ${id}`,
          status: 500
        };
      }
    }, refreshRetries);
  },
  
  /**
   * Sync family state after operations like member addition/removal or task assignments
   * This ensures that all components using family data have consistent state
   * 
   * @param familyId Family ID to sync
   * @param operation The operation that was performed (for logging)
   * @returns ApiResponse with the synced family data
   */
  async syncFamilyState(familyId: string, operation: string): Promise<ApiResponse<Family>> {
    console.log(`[familyService] Syncing family state after ${operation} for family ID: ${familyId}`);
    
    try {
      // Short delay to allow backend to complete any processing
      await sleep(300);
      
      // Use refreshFamily with force refresh to ensure we get the latest data
      const response = await this.refreshFamily(familyId, true);
      
      if (response.error) {
        console.error(`[familyService] Error syncing family state: ${response.error}`);
      } else {
        console.log('[familyService] Family state synchronized successfully');
      }
      
      return response;
    } catch (error) {
      console.error('[familyService] Error in syncFamilyState:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to sync family state',
        status: 500
      };
    }
  }
}; 