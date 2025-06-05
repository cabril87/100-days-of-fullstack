/*
 * Family Invitation API Service
 * Copyright (c) 2025 Carlos Abril Jr
 */

import {
  InvitationDTO,
  InvitationCreateDTO,
  InvitationResponseDTO,
  PendingInvitationsResponseDTO,
  FamilyDTO,
  FamilyCreateDTO,
  FamilyUpdateDTO,
  FamilyRoleDTO,
  FamilyMemberDTO,
  TransferOwnershipDTO,
  UserFamilyRelationships,
  FamilyManagementPermissions
} from '../types/family-invitation';

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const API_VERSION = 'v1';

// Helper function to get auth headers
const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('accessToken');
  
  // Debug logging for token availability
  if (!token) {
    console.debug('No access token found in localStorage for API request');
  }
  
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

// Custom error class for API errors
export class FamilyInvitationApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'FamilyInvitationApiError';
  }
}

// Helper function to handle API responses
async function handleApiResponse<T>(response: Response, allowNotFound: boolean = false): Promise<T | null> {
  if (!response.ok) {
    // Handle 404 Not Found gracefully for GET requests (expected for users without families)
    if (response.status === 404 && allowNotFound) {
      console.debug(`Expected 404 response handled gracefully for ${response.url}`);
      return null;
    }
    
    // Handle 401 Unauthorized gracefully for family-related calls (user may not have family access)
    if (response.status === 401 && allowNotFound) {
      console.debug(`401 Unauthorized handled gracefully for ${response.url} - user may not have family access`);
      return null;
    }
    
    // Handle 400 Bad Request gracefully for users without families
    if (response.status === 400) {
      const errorData = await response.json().catch(() => ({}));
      if (errorData.message?.includes('family') || errorData.message?.includes('not found')) {
        console.debug(`Family-related 400 response handled gracefully for ${response.url}`);
        return null;
      }
    }
    
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new FamilyInvitationApiError(
      errorData.message || `HTTP ${response.status}`,
      response.status,
      errorData.code,
      errorData.errors
    );
  }
  
  return response.json();
}

// Family Invitation Service Class
export class FamilyInvitationService {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/api/${API_VERSION}`;
  }

  // === FAMILY MANAGEMENT ===

  /**
   * Get current user's family
   */
  async getCurrentFamily(): Promise<FamilyDTO | null> {
    const response = await fetch(
      `${this.baseUrl}/family/current-family`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    return handleApiResponse<FamilyDTO>(response, true);
  }

  /**
   * Check if current user is admin of any family
   */
  async isUserFamilyAdmin(): Promise<boolean> {
    const response = await fetch(
      `${this.baseUrl}/family/is-family-admin`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    const result = await handleApiResponse<boolean>(response, true);
    return result ?? false; // Return false if null (user has no family)
  }

  /**
   * Create a new family
   */
  async createFamily(familyData: FamilyCreateDTO): Promise<FamilyDTO> {
    const response = await fetch(
      `${this.baseUrl}/family`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(familyData),
      }
    );

    const result = await handleApiResponse<FamilyDTO>(response);
    if (!result) {
      throw new FamilyInvitationApiError('Failed to create family', 500);
    }
    return result;
  }

  /**
   * Update family information
   */
  async updateFamily(familyId: number, familyData: FamilyUpdateDTO): Promise<FamilyDTO> {
    const response = await fetch(
      `${this.baseUrl}/family/${familyId}`,
      {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(familyData),
      }
    );

    const result = await handleApiResponse<FamilyDTO>(response);
    if (!result) {
      throw new FamilyInvitationApiError('Failed to update family', 500);
    }
    return result;
  }

  /**
   * Leave current family
   */
  async leaveFamily(): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/family/leave`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new FamilyInvitationApiError(
        'Failed to leave family',
        response.status
      );
    }
  }

  /**
   * Delete family (admin only)
   */
  async deleteFamily(familyId: number): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/family/${familyId}`,
      {
        method: 'DELETE',
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new FamilyInvitationApiError(
        'Failed to delete family',
        response.status
      );
    }
  }

  // === FAMILY MEMBERS ===

  /**
   * Get family members
   */
  async getFamilyMembers(familyId: number): Promise<FamilyMemberDTO[]> {
    const response = await fetch(
      `${this.baseUrl}/family/${familyId}/members`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    const result = await handleApiResponse<FamilyMemberDTO[]>(response, true);
    return result ?? []; // Return empty array if null
  }

  /**
   * Update family member role
   */
  async updateMemberRole(memberId: number, roleId: number): Promise<FamilyMemberDTO> {
    const response = await fetch(
      `${this.baseUrl}/family/members/${memberId}/role`,
      {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ roleId }),
      }
    );

    const result = await handleApiResponse<FamilyMemberDTO>(response);
    if (!result) {
      throw new FamilyInvitationApiError('Failed to update member role', 500);
    }
    return result;
  }

  /**
   * Remove family member
   */
  async removeFamilyMember(memberId: number): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/family/members/${memberId}`,
      {
        method: 'DELETE',
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new FamilyInvitationApiError(
        'Failed to remove family member',
        response.status
      );
    }
  }

  // === FAMILY ROLES ===

  /**
   * Get available family roles
   */
  async getFamilyRoles(): Promise<FamilyRoleDTO[]> {
    const response = await fetch(
      `${this.baseUrl}/family/roles`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    const result = await handleApiResponse<FamilyRoleDTO[]>(response, true);
    return result ?? []; // Return empty array if null
  }

  /**
   * Get family role by ID
   */
  async getFamilyRole(roleId: number): Promise<FamilyRoleDTO> {
    const response = await fetch(
      `${this.baseUrl}/family/roles/${roleId}`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    const result = await handleApiResponse<FamilyRoleDTO>(response);
    if (!result) {
      throw new FamilyInvitationApiError('Family role not found', 404);
    }
    return result;
  }

  // === INVITATIONS ===

  /**
   * Send family invitation
   */
  async sendInvitation(invitationData: InvitationCreateDTO): Promise<InvitationResponseDTO> {
    const response = await fetch(
      `${this.baseUrl}/invitations`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(invitationData),
      }
    );

    const result = await handleApiResponse<InvitationResponseDTO>(response);
    if (!result) {
      throw new FamilyInvitationApiError('Failed to send invitation', 500);
    }
    return result;
  }

  /**
   * Get sent invitations
   */
  async getSentInvitations(): Promise<InvitationDTO[]> {
    const response = await fetch(
      `${this.baseUrl}/invitations/sent`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    const result = await handleApiResponse<InvitationDTO[]>(response, true);
    return result ?? []; // Return empty array if null
  }

  /**
   * Get pending invitations count
   */
  async getPendingInvitations(): Promise<PendingInvitationsResponseDTO> {
    const response = await fetch(
      `${this.baseUrl}/invitations/pending`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    const result = await handleApiResponse<PendingInvitationsResponseDTO>(response, true);
    return result ?? { count: 0, invitations: [] }; // Match the actual DTO structure
  }

  /**
   * Accept family invitation
   */
  async acceptInvitation(token: string): Promise<InvitationResponseDTO> {
    const response = await fetch(
      `${this.baseUrl}/invitations/accept`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ token }),
      }
    );

    const result = await handleApiResponse<InvitationResponseDTO>(response);
    if (!result) {
      throw new FamilyInvitationApiError('Failed to accept invitation', 500);
    }
    return result;
  }

  /**
   * Decline family invitation
   */
  async declineInvitation(token: string): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/invitations/decline`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ token }),
      }
    );

    if (!response.ok) {
      throw new FamilyInvitationApiError(
        'Failed to decline invitation',
        response.status
      );
    }
  }

  /**
   * Cancel/revoke invitation (sender only)
   */
  async cancelInvitation(invitationId: number): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/invitations/${invitationId}/cancel`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new FamilyInvitationApiError(
        'Failed to cancel invitation',
        response.status
      );
    }
  }

  /**
   * Resend invitation (sender only)
   */
  async resendInvitation(invitationId: number, newMessage?: string): Promise<InvitationResponseDTO> {
    const response = await fetch(
      `${this.baseUrl}/invitations/${invitationId}/resend`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ message: newMessage }),
      }
    );

    const result = await handleApiResponse<InvitationResponseDTO>(response);
    if (!result) {
      throw new FamilyInvitationApiError('Failed to resend invitation', 500);
    }
    return result;
  }

  /**
   * Get invitation details by token (for invitation preview)
   */
  async getInvitationByToken(token: string): Promise<InvitationDTO> {
    const response = await fetch(
      `${this.baseUrl}/invitations/token/${token}`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    const result = await handleApiResponse<InvitationDTO>(response);
    if (!result) {
      throw new FamilyInvitationApiError('Invitation not found', 404);
    }
    return result;
  }

  // === BULK OPERATIONS ===

  /**
   * Send multiple invitations at once
   */
  async sendBulkInvitations(
    emails: string[], 
    roleId: number, 
    message?: string
  ): Promise<InvitationResponseDTO[]> {
    const response = await fetch(
      `${this.baseUrl}/invitations/bulk`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ emails, roleId, message }),
      }
    );

    const result = await handleApiResponse<InvitationResponseDTO[]>(response);
    if (!result) {
      throw new FamilyInvitationApiError('Failed to send bulk invitations', 500);
    }
    return result;
  }

  /**
   * Cancel multiple invitations
   */
  async cancelBulkInvitations(invitationIds: number[]): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/invitations/bulk-cancel`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ invitationIds }),
      }
    );

    if (!response.ok) {
      throw new FamilyInvitationApiError(
        'Failed to cancel invitations',
        response.status
      );
    }
  }

  // === VALIDATION HELPERS ===

  /**
   * Check if email already exists in family
   */
  async checkEmailExists(email: string): Promise<boolean> {
    const response = await fetch(
      `${this.baseUrl}/family/check-email/${encodeURIComponent(email)}`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    const result = await handleApiResponse<{ exists: boolean }>(response);
    return result?.exists ?? false;
  }

  /**
   * Check if user has pending invitation for email
   */
  async hasPendingInvitation(email: string): Promise<boolean> {
    const response = await fetch(
      `${this.baseUrl}/invitations/check-pending/${encodeURIComponent(email)}`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    const result = await handleApiResponse<{ hasPending: boolean }>(response);
    return result?.hasPending ?? false;
  }

  /**
   * Validate invitation token
   */
  async validateInvitationToken(token: string): Promise<boolean> {
    try {
      await this.getInvitationByToken(token);
      return true;
    } catch (error) {
      if (error instanceof FamilyInvitationApiError && error.status === 404) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Get family statistics
   */
  async getFamilyStats(familyId: number): Promise<{
    memberCount: number;
    activeInvitations: number;
    totalTasksCompleted: number;
    totalPointsEarned: number;
  }> {
    const response = await fetch(
      `${this.baseUrl}/family/${familyId}/stats`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    const result = await handleApiResponse<{
      memberCount: number;
      activeInvitations: number;
      totalTasksCompleted: number;
      totalPointsEarned: number;
    }>(response, true);
    
    // Return default stats if null (user has no family)
    return result ?? {
      memberCount: 0,
      activeInvitations: 0,
      totalTasksCompleted: 0,
      totalPointsEarned: 0
    };
  }

  // === FAMILY RELATIONSHIPS ===

  /**
   * Get user family relationships
   */
  async getUserFamilyRelationships(): Promise<UserFamilyRelationships> {
    const response = await fetch(
      `${this.baseUrl}/family/user-relationships`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    const result = await handleApiResponse<UserFamilyRelationships>(response, true);
    
    // Return default relationships if null (user has no family)
    return result ?? {
      adminFamilies: [],
      memberFamilies: [],
      managementFamilies: [],
      permissions: {
        canCreateFamily: false,
        canTransferOwnership: false,
        canManageMembers: false,
        canInviteMembers: false,
        canManageCurrentFamily: false,
        ageGroup: 'Adult'
      }
    };
  }

  /**
   * Get family management permissions
   */
  async getFamilyManagementPermissions(familyId?: number): Promise<FamilyManagementPermissions> {
    let url = `${this.baseUrl}/family/management-permissions`;
    if (familyId) {
      url += `?familyId=${familyId}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const result = await handleApiResponse<FamilyManagementPermissions>(response, true);
    
    // Return default permissions if null
    return result ?? {
      canCreateFamily: false,
      canTransferOwnership: false,
      canManageMembers: false,
      canInviteMembers: false,
      canManageCurrentFamily: false,
      ageGroup: 'Adult'
    };
  }

  // === OWNERSHIP TRANSFER ===

  /**
   * Transfer family ownership to another member (Pass the Baton)
   */
  async transferFamilyOwnership(transferData: TransferOwnershipDTO): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/family/${transferData.familyId}/transfer-ownership`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(transferData),
      }
    );

    if (!response.ok) {
      throw new FamilyInvitationApiError(
        'Failed to transfer family ownership',
        response.status
      );
    }
  }

  /**
   * Check if user can manage family based on age
   */
  async canUserManageFamily(familyId: number): Promise<boolean> {
    const response = await fetch(
      `${this.baseUrl}/family/${familyId}/can-manage`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    const result = await handleApiResponse<boolean>(response, true);
    return result ?? false; // Return false if null (user can't manage)
  }

  // === AGE-BASED PERMISSIONS ===

  /**
   * Get management permissions based on user's age
   */
  getFamilyManagementPermissionsByAge(ageGroup: 'Child' | 'Teen' | 'Adult'): FamilyManagementPermissions {
    switch (ageGroup) {
      case 'Child':
        return {
          canCreateFamily: false,
          canTransferOwnership: false,
          canManageMembers: false,
          canInviteMembers: false,
          canManageCurrentFamily: false,
          ageGroup: 'Child',
        };
      
      case 'Teen':
        return {
          canCreateFamily: true,
          canTransferOwnership: false,
          canManageMembers: true,
          canInviteMembers: true,
          canManageCurrentFamily: false,
          maxFamilySize: 5, // Teens can only manage families with <= 5 members
          ageGroup: 'Teen',
        };
      
      case 'Adult':
        return {
          canCreateFamily: true,
          canTransferOwnership: true,
          canManageMembers: true,
          canInviteMembers: true,
          canManageCurrentFamily: false,
          ageGroup: 'Adult',
        };
      
      default:
        return {
          canCreateFamily: false,
          canTransferOwnership: false,
          canManageMembers: false,
          canInviteMembers: false,
          canManageCurrentFamily: false,
          ageGroup: 'Unknown',
        };
    }
  }
}

// Export singleton instance
export const familyInvitationService = new FamilyInvitationService(); 