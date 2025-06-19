/*
 * Family Invitation Service - Complete family management API integration
 * Handles families, members, invitations, roles, and age-based permissions
 * Copyright (c) 2025 Carlos Abril Jr
 */

import {
  FamilyDTO,
  FamilyMemberDTO,
  InvitationDTO,
  FamilyCreateDTO,
  FamilyUpdateDTO,
  InvitationCreateDTO,
  TransferOwnershipDTO,
  UserFamilyRelationships,
  FamilyManagementPermissions,
  FamilyRoleDTO,
  SmartInvitationRequest,
  InvitationValidationResult,
  FamilyRelationshipType,
  getRelationshipDisplayName,
  PrimaryFamilyStatusDTO,
  UserFamilyWithPrimary
} from '../types/family-invitation';
import { FamilyMemberAgeGroup } from '../types/auth';
import { apiClient } from '../config/api-client';

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

// Family Invitation Service Class
export class FamilyInvitationService {
  // Cache for preventing duplicate API calls
  private primaryFamilyPromise: Promise<FamilyDTO | null> | null = null;
  private allFamiliesPromise: Promise<FamilyDTO[]> | null = null;
  private familyRelationshipsPromise: Promise<UserFamilyRelationships> | null = null;
  private cacheTimestamp = 0;
  private readonly CACHE_DURATION = 30000; // 30 seconds

  // Clear cache when it's stale
  private isCacheValid(): boolean {
    return Date.now() - this.cacheTimestamp < this.CACHE_DURATION;
  }

  private clearCache(): void {
    this.primaryFamilyPromise = null;
    this.allFamiliesPromise = null;
    this.familyRelationshipsPromise = null;
    this.cacheTimestamp = 0;
  }

  // === FAMILY OPERATIONS ===

  /**
   * Get all families for current user
   */
  async getAllFamilies(): Promise<FamilyDTO[]> {
    try {
      if (this.allFamiliesPromise && this.isCacheValid()) {
        return await this.allFamiliesPromise;
      }
      
      this.allFamiliesPromise = apiClient.get<FamilyDTO[]>('/v1/family').then(result => {
        this.cacheTimestamp = Date.now();
        return result;
      }).catch(error => {
        // Clear failed promise from cache
        this.allFamiliesPromise = null;
        throw error;
      });
      
      return await this.allFamiliesPromise;
    } catch (error) {
      console.error('Failed to fetch families:', error);
      return [];
    }
  }

  /**
   * Get family by ID
   */
  async getFamilyById(id: number): Promise<FamilyDTO> {
    try {
      return await apiClient.get<FamilyDTO>(`/v1/family/${id}`);
    } catch (error) {
      console.error('Failed to fetch family by ID:', error);
      throw error;
    }
  }

  /**
   * Get family for current user
   */
  async getUserFamily(): Promise<FamilyDTO | null> {
    try {
      return await apiClient.get<FamilyDTO>('/v1/family/current-family');
    } catch {
      // This is expected for new users who haven't joined a family yet
      console.debug('User has no family yet (this is normal for new users)');
      return null;
    }
  }

  /**
   * Get current family (alias for getUserFamily for backward compatibility)
   */
  async getCurrentFamily(): Promise<FamilyDTO | null> {
    return this.getUserFamily();
  }

  /**
   * Create a new family
   */
  async createFamily(familyData: FamilyCreateDTO): Promise<FamilyDTO> {
    try {
      const result = await apiClient.post<FamilyDTO>('/v1/family', familyData);
      this.clearCache(); // Clear cache after family creation
      return result;
    } catch (error) {
      console.error('Failed to create family:', error);
      throw error;
    }
  }

  /**
   * Update family information
   */
  async updateFamily(id: number, familyData: FamilyUpdateDTO): Promise<FamilyDTO> {
    try {
      return await apiClient.put<FamilyDTO>(`/v1/family/${id}`, familyData);
    } catch (error) {
      console.error('Failed to update family:', error);
      throw error;
    }
  }

  /**
   * Delete family
   */
  async deleteFamily(id: number): Promise<void> {
    try {
      await apiClient.delete<void>(`/v1/family/${id}`);
    } catch (error) {
      console.error('Failed to delete family:', error);
      throw error;
    }
  }

  /**
   * Leave family (remove self as member)
   */
  async leaveFamily(familyId: number): Promise<void> {
    try {
      await apiClient.post<void>(`/v1/family/${familyId}/leave`);
      this.clearCache(); // Clear cache after leaving family
    } catch (error) {
      console.error('Failed to leave family:', error);
      throw error;
    }
  }

  // === FAMILY MEMBER OPERATIONS ===

  /**
   * Get all members of a family
   */
  async getFamilyMembers(familyId: number): Promise<FamilyMemberDTO[]> {
    try {
      return await apiClient.get<FamilyMemberDTO[]>(`/v1/family/${familyId}/members`);
    } catch (error) {
      console.error('Failed to fetch family members:', error);
      return [];
    }
  }

  /**
   * Get specific family member
   */
  async getFamilyMember(familyId: number, memberId: number): Promise<FamilyMemberDTO> {
    try {
      return await apiClient.get<FamilyMemberDTO>(`/v1/family/${familyId}/members/${memberId}`);
    } catch (error) {
      console.error('Failed to fetch family member:', error);
      throw error;
    }
  }

  /**
   * Update family member role
   */
  async updateMemberRole(familyId: number, memberId: number, roleId: number): Promise<FamilyMemberDTO> {
    try {
      return await apiClient.put<FamilyMemberDTO>(`/v1/family/${familyId}/members/${memberId}/role`, { roleId });
    } catch (error) {
      console.error('Failed to update member role:', error);
      throw error;
    }
  }

  /**
   * Remove member from family
   */
  async removeFamilyMember(familyId: number, memberId: number): Promise<void> {
    try {
      await apiClient.delete<void>(`/v1/family/${familyId}/members/${memberId}`);
    } catch (error) {
      console.error('Failed to remove family member:', error);
      throw error;
    }
  }

  /**
   * Transfer family ownership (Pass the Baton)
   */
  async transferOwnership(familyId: number, transferData: TransferOwnershipDTO): Promise<FamilyDTO> {
    try {
      return await apiClient.post<FamilyDTO>(`/v1/family/${familyId}/transfer-ownership`, transferData);
    } catch (error) {
      console.error('Failed to transfer family ownership:', error);
      throw error;
    }
  }

  // === INVITATION OPERATIONS ===

    /**
   * Get all invitations for a family
   */
  async getFamilyInvitations(familyId: number): Promise<InvitationDTO[]> {
    try {
      return await apiClient.get<InvitationDTO[]>(`/v1/family/${familyId}/invitations`);
    } catch (error) {
      console.error('Failed to fetch family invitations:', error);
      return [];
    }
  }

    /**
   * Get pending invitations for current user
   */
  async getPendingInvitations(): Promise<InvitationDTO[]> {
    try {
      return await apiClient.get<InvitationDTO[]>('/v1/invitation/pending');
    } catch (error) {
      console.error('Failed to fetch pending invitations:', error);
      return [];
    }
  }

  /**
   * Get invitation by ID
   */
  async getInvitationById(id: number): Promise<InvitationDTO> {
    try {
      return await apiClient.get<InvitationDTO>(`/v1/invitation/${id}`);
    } catch (error) {
      console.error('Failed to fetch invitation by ID:', error);
      throw error;
    }
  }

  /**
   * Get invitation by token (for public acceptance page)
   */
  async getInvitationByToken(token: string): Promise<InvitationDTO> {
    try {
      return await apiClient.get<InvitationDTO>(`/v1/invitation/token/${token}`);
    } catch (error) {
      console.error('Failed to fetch invitation by token:', error);
      throw error;
    }
  }

  /**
   * Create new family invitation
   */
  async createInvitation(invitationData: InvitationCreateDTO): Promise<InvitationDTO> {
    try {
      return await apiClient.post<InvitationDTO>(`/v1/family/${invitationData.familyId}/invitations`, invitationData);
    } catch (error) {
      console.error('Failed to create invitation:', error);
      throw error;
    }
  }

  /**
   * Accept family invitation by ID (kept for backward compatibility)
   */
  async acceptInvitation(): Promise<FamilyMemberDTO> {
    try {
      // For backward compatibility, this method still exists
      // but in practice, the backend uses token-based acceptance
      throw new Error('Use acceptInvitationByToken instead');
    } catch (error) {
      console.error('Failed to accept invitation:', error);
      throw error;
    }
  }

  /**
   * Accept family invitation by token
   */
  async acceptInvitationByToken(token: string): Promise<{ success: boolean; message: string }> {
    try {
      return await apiClient.post<{ success: boolean; message: string }>('/v1/invitation/accept', { token });
    } catch (error) {
      console.error('Failed to accept invitation by token:', error);
      throw error;
    }
  }

  /**
   * Decline family invitation by ID (kept for backward compatibility)
   */
  async declineInvitation(): Promise<void> {
    try {
      // For backward compatibility, this method still exists
      // but in practice, the backend uses token-based decline
      throw new Error('Use declineInvitationByToken instead');
    } catch (error) {
      console.error('Failed to decline invitation:', error);
      throw error;
    }
  }

  /**
   * Decline family invitation by token
   */
  async declineInvitationByToken(token: string): Promise<{ success: boolean; message: string }> {
    try {
      return await apiClient.post<{ success: boolean; message: string }>('/v1/invitation/decline', { token });
    } catch (error) {
      console.error('Failed to decline invitation by token:', error);
      throw error;
    }
  }

  /**
   * Cancel family invitation (by sender)
   */
  async cancelInvitation(invitationId: number): Promise<{ success: boolean; message: string }> {
    try {
      return await apiClient.delete<{ success: boolean; message: string }>(`/v1/invitation/${invitationId}`);
    } catch (error) {
      console.error('Failed to cancel invitation:', error);
      throw error;
    }
  }

  /**
   * Resend family invitation
   */
  async resendInvitation(invitationId: number): Promise<{ success: boolean; message: string }> {
    try {
      return await apiClient.post<{ success: boolean; message: string }>(`/v1/invitation/${invitationId}/resend`);
    } catch (error) {
      console.error('Failed to resend invitation:', error);
      throw error;
    }
  }

  // === USER FAMILY RELATIONSHIPS ===

  /**
   * Get user's family relationships and permissions
   */
  async getUserFamilyRelationships(): Promise<UserFamilyRelationships> {
    try {
      if (this.familyRelationshipsPromise && this.isCacheValid()) {
        return await this.familyRelationshipsPromise;
      }
      
      this.familyRelationshipsPromise = apiClient.get<UserFamilyRelationships>('/v1/family/user-relationships').then(result => {
        this.cacheTimestamp = Date.now();
        return result;
      }).catch(error => {
        // Clear failed promise from cache
        this.familyRelationshipsPromise = null;
        throw error;
      });
      
      return await this.familyRelationshipsPromise;
    } catch (error) {
      console.error('Failed to fetch user family relationships:', error);
      throw error;
    }
  }

  /**
   * Get family management permissions for current user
   */
  async getFamilyManagementPermissions(familyId?: number): Promise<FamilyManagementPermissions> {
    try {
      const endpoint = familyId 
        ? `/v1/family/management-permissions?familyId=${familyId}`
        : '/v1/family/management-permissions';
      return await apiClient.get<FamilyManagementPermissions>(endpoint);
    } catch (error) {
      console.error('Failed to fetch family management permissions:', error);
      return {
        canCreateFamily: false,
        canManageFamily: false,
        canInviteMembers: false,
        canRemoveMembers: false,
        canUpdateRoles: false,
        canTransferOwnership: false,
        isGlobalAdmin: false,
        isFamilyAdmin: false,
        maxFamilySize: 0,
        ageGroup: FamilyMemberAgeGroup.Child,
        ageRestrictions: []
      };
    }
  }

  /**
   * Check if user is family admin
   */
  async isUserFamilyAdmin(familyId?: number): Promise<boolean> {
    try {
      const permissions = await this.getFamilyManagementPermissions(familyId);
      return permissions.isFamilyAdmin || permissions.isGlobalAdmin;
    } catch (error) {
      console.error('Failed to check family admin status:', error);
      return false;
    }
  }

  // === CONVENIENCE METHODS ===

  /**
   * Create family and return with admin permissions check
   */
  async createFamilyWithPermissions(familyData: FamilyCreateDTO): Promise<{ family: FamilyDTO; permissions: FamilyManagementPermissions }> {
    try {
      const family = await this.createFamily(familyData);
      const permissions = await this.getFamilyManagementPermissions(family.id);
      return { family, permissions };
    } catch (error) {
      console.error('Failed to create family with permissions:', error);
      throw error;
    }
  }

  /**
   * Get family with members and invitations
   */
  async getFamilyComplete(familyId: number): Promise<{ family: FamilyDTO; members: FamilyMemberDTO[]; invitations: InvitationDTO[] }> {
    try {
      const [family, members, invitations] = await Promise.all([
        this.getFamilyById(familyId),
        this.getFamilyMembers(familyId),
        this.getFamilyInvitations(familyId)
      ]);
      return { family, members, invitations };
    } catch (error) {
      console.error('Failed to fetch complete family data:', error);
      throw error;
    }
  }

  /**
   * Get user's complete family status
   */
  async getUserFamilyStatus(): Promise<{
    family: FamilyDTO | null;
    relationships: UserFamilyRelationships | null;
    permissions: FamilyManagementPermissions | null;
    pendingInvitations: InvitationDTO[];
  }> {
    try {
      const [family, pendingInvitations] = await Promise.all([
        this.getUserFamily(),
        this.getPendingInvitations()
      ]);

      let relationships: UserFamilyRelationships | null = null;
      let permissions: FamilyManagementPermissions | null = null;

      if (family) {
        [relationships, permissions] = await Promise.all([
          this.getUserFamilyRelationships().catch(() => null),
          this.getFamilyManagementPermissions(family.id).catch(() => null)
        ]);
      }

      return {
        family,
        relationships,
        permissions,
        pendingInvitations
      };
    } catch (error) {
      console.error('Failed to get user family status:', error);
      return {
        family: null,
        relationships: null,
        permissions: null,
        pendingInvitations: []
      };
    }
  }

  // === INVITATION GENERATION & QR CODES ===

  /**
   * Generate invitation link
   */
  generateInvitationLink(token: string, baseUrl?: string): string {
    const base = baseUrl || window.location.origin;
    return `${base}/invitation/${token}`;
  }

  /**
   * Generate QR code data URL for invitation
   */
  async generateQRCode(token: string, baseUrl?: string): Promise<string> {
    try {
      const link = this.generateInvitationLink(token, baseUrl);
      // In a real implementation, you would use a QR code library
      // For now, return a placeholder data URL
      return `data:image/svg+xml;base64,${btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
          <rect width="200" height="200" fill="white"/>
          <text x="100" y="100" text-anchor="middle" font-family="Arial" font-size="12">
            QR Code for: ${link}
          </text>
        </svg>
      `)}`;
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      throw error;
    }
  }

  // === AGE-BASED UTILITIES ===

  /**
   * Calculate age group from date of birth
   */
  calculateAgeGroup(dateOfBirth: Date): FamilyMemberAgeGroup {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return this.getAgeGroupFromAge(age - 1);
    }
    
    return this.getAgeGroupFromAge(age);
  }

  /**
   * Get age group from numerical age
   */
  getAgeGroupFromAge(age: number): FamilyMemberAgeGroup {
    if (age < 13) return FamilyMemberAgeGroup.Child;
    if (age < 18) return FamilyMemberAgeGroup.Teen;
    return FamilyMemberAgeGroup.Adult;
  }

  /**
   * Check if age group can perform family management action
   */
  canAgeGroupManageFamily(ageGroup: FamilyMemberAgeGroup): boolean {
    return ageGroup === FamilyMemberAgeGroup.Teen || ageGroup === FamilyMemberAgeGroup.Adult;
  }

  /**
   * Check if age group can transfer ownership
   */
  canAgeGroupTransferOwnership(ageGroup: FamilyMemberAgeGroup): boolean {
    return ageGroup === FamilyMemberAgeGroup.Adult;
  }

  /**
   * Get maximum family size for age group
   */
  getMaxFamilySizeForAgeGroup(ageGroup: FamilyMemberAgeGroup): number {
    switch (ageGroup) {
      case FamilyMemberAgeGroup.Child:
        return 0; // Children cannot create families
      case FamilyMemberAgeGroup.Teen:
        return 5; // Teens can create small families
      case FamilyMemberAgeGroup.Adult:
        return 50; // Adults can create large families
      default:
        return 0;
    }
  }

  // === MISSING METHODS FOR BACKWARD COMPATIBILITY ===

  /**
   * Get family roles (required by family settings page and contexts)
   */
  async getFamilyRoles(): Promise<FamilyRoleDTO[]> {
    try {
      return await apiClient.get<FamilyRoleDTO[]>('/v1/family/roles');
    } catch (error) {
      console.error('Failed to fetch family roles:', error);
      return [];
    }
  }

  /**
   * Send invitation (required by family invitation context)
   */
  async sendInvitation(invitationData: InvitationCreateDTO): Promise<InvitationDTO> {
    return this.createInvitation(invitationData);
  }

  /**
   * Send bulk invitations (required by family invitation context)
   */
  async sendBulkInvitations(invitations: InvitationCreateDTO[]): Promise<InvitationDTO[]> {
    try {
      const promises = invitations.map(invitation => this.createInvitation(invitation));
      return await Promise.all(promises);
    } catch (error) {
      console.error('Failed to send bulk invitations:', error);
      throw error;
    }
  }

  /**
   * Get sent invitations (required by family settings and contexts)
   */
  async getSentInvitations(): Promise<InvitationDTO[]> {
    try {
      return await apiClient.get<InvitationDTO[]>('/v1/invitation/sent');
    } catch (error) {
      console.error('Failed to fetch sent invitations:', error);
      return [];
    }
  }

  /**
   * Get family stats (required by family settings page and context)
   */
  async getFamilyStats(familyId: number): Promise<{
    memberCount: number;
    pendingInvitations: number;
    totalInvitations: number;
    activeMembers: number;
    totalTasks: number;
    totalPoints: number;
  }> {
    try {
      const [members, invitations] = await Promise.all([
        this.getFamilyMembers(familyId),
        this.getFamilyInvitations(familyId)
      ]);
      
      return {
        memberCount: members.length,
        pendingInvitations: invitations.filter(inv => !inv.isAccepted).length,
        totalInvitations: invitations.length,
        activeMembers: members.filter(member => member.isActive).length,
        totalTasks: 0, // TODO: Add when task service integrated
        totalPoints: 0 // TODO: Add when points system integrated
      };
    } catch (error) {
      console.error('Failed to fetch family stats:', error);
      return {
        memberCount: 0,
        pendingInvitations: 0,
        totalInvitations: 0,
        activeMembers: 0,
        totalTasks: 0,
        totalPoints: 0
      };
    }
  }

  /**
   * Check if email exists (required by family invitation context)
   */
  async checkEmailExists(email: string): Promise<boolean> {
    try {
      // This would typically be a separate API endpoint
      // For now, return false as placeholder
      console.debug('Checking email existence:', email);
      return false;
    } catch (error) {
      console.error('Failed to check email existence:', error);
      return false;
    }
  }

  /**
   * Validate invitation token (required by family invitation context)
   */
  async validateInvitationToken(token: string): Promise<boolean> {
    try {
      await this.getInvitationByToken(token);
      return true;
    } catch (error) {
      console.error('Failed to validate invitation token:', error);
        return false;
      }
  }

  /**
   * Can user manage family (required by family settings page)
   */
  async canUserManageFamily(familyId: number): Promise<boolean> {
    try {
      const permissions = await this.getFamilyManagementPermissions(familyId);
      return permissions.canManageFamily;
    } catch (error) {
      console.error('Failed to check family management permissions:', error);
      return false;
    }
  }

  /**
   * Transfer family ownership (required by family settings page)
   */
  async transferFamilyOwnership(transferData: TransferOwnershipDTO): Promise<FamilyDTO> {
    try {
      const userFamily = await this.getUserFamily();
      if (!userFamily) throw new Error('User has no family');
      return this.transferOwnership(userFamily.id, transferData);
    } catch (error) {
      console.error('Failed to transfer family ownership:', error);
      throw error;
    }
  }

  /**
   * Update member role (backward compatibility with different parameter signature)
   */
  async updateMemberRoleInUserFamily(memberId: number, roleId: number): Promise<FamilyMemberDTO> {
    try {
      const userFamily = await this.getUserFamily();
      if (!userFamily) throw new Error('User has no family');
      return this.updateMemberRole(userFamily.id, memberId, roleId);
    } catch (error) {
      console.error('Failed to update member role:', error);
      throw error;
    }
  }

  /**
   * Remove family member (backward compatibility with different parameter signature)
   */
  async removeFamilyMemberFromUserFamily(memberId: number): Promise<void> {
    try {
      const userFamily = await this.getUserFamily();
      if (!userFamily) throw new Error('User has no family');
      return this.removeFamilyMember(userFamily.id, memberId);
    } catch (error) {
      console.error('Failed to remove family member:', error);
      throw error;
    }
  }

  /**
   * Leave family (backward compatibility - no parameters)
   */
  async leaveFamilyAsUser(): Promise<void> {
    try {
      const userFamily = await this.getUserFamily();
      if (!userFamily) throw new Error('User has no family');
      return this.leaveFamily(userFamily.id);
    } catch (error) {
      console.error('Failed to leave family:', error);
      throw error;
    }
  }

  // === SMART INVITATION FEATURES ===

  /**
   * Calculate actual age from date of birth
   */
  calculateAgeFromBirthDate(dateOfBirth: string): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    // Adjust age if birthday hasn't occurred this year
    return monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) 
      ? age - 1 
      : age;
  }

  /**
   * Calculate age group from date of birth
   */
  calculateAgeGroupFromDate(dateOfBirth: string): FamilyMemberAgeGroup {
    const actualAge = this.calculateAgeFromBirthDate(dateOfBirth);
    if (actualAge < 13) return FamilyMemberAgeGroup.Child;
    if (actualAge < 18) return FamilyMemberAgeGroup.Teen;
    return FamilyMemberAgeGroup.Adult;
  }

  /**
   * Get recommended role based on relationship and age
   */
  getRecommendedRole(
    relationship: FamilyRelationshipType, 
    ageGroup: FamilyMemberAgeGroup,
    availableRoles: FamilyRoleDTO[]
  ): { roleId: number; roleName: string; reasoning: string } {
    
    // Find available roles
    const parentRole = availableRoles.find(r => r.name === 'Parent');
    const childRole = availableRoles.find(r => r.name === 'Child');
    const memberRole = availableRoles.find(r => r.name === 'Member');

    // Default fallback to Member role
    const fallbackRole = memberRole || availableRoles[0];

    // Age-based restrictions first
    if (ageGroup === FamilyMemberAgeGroup.Child) {
      const role = childRole || fallbackRole;
      return {
        roleId: role.id,
        roleName: role.name,
        reasoning: 'Children (under 13) are automatically assigned the Child role for safety and appropriate permissions.'
      };
    }

    // Relationship-based role recommendations
    switch (relationship) {
      case FamilyRelationshipType.Parent:
      case FamilyRelationshipType.Stepparent:
      case FamilyRelationshipType.MotherInLaw:
      case FamilyRelationshipType.FatherInLaw:
        if (ageGroup === FamilyMemberAgeGroup.Adult && parentRole) {
          return {
            roleId: parentRole.id,
            roleName: parentRole.name,
            reasoning: 'Parent figures typically get the Parent role with task and member management capabilities.'
          };
        }
        break;

      case FamilyRelationshipType.Child:
      case FamilyRelationshipType.Stepchild:
      case FamilyRelationshipType.Grandchild:
        if (ageGroup === FamilyMemberAgeGroup.Teen && memberRole) {
          return {
            roleId: memberRole.id,
            roleName: memberRole.name,
            reasoning: 'Teen children get Member role with basic permissions appropriate for their age.'
          };
        }
        if (childRole) {
          return {
            roleId: childRole.id,
            roleName: childRole.name,
            reasoning: 'Child family members get the Child role with age-appropriate permissions.'
          };
        }
        break;

      case FamilyRelationshipType.Spouse:
        if (ageGroup === FamilyMemberAgeGroup.Adult && parentRole) {
          return {
            roleId: parentRole.id,
            roleName: parentRole.name,
            reasoning: 'Spouses typically share parental responsibilities and get the Parent role.'
          };
        }
        break;

      case FamilyRelationshipType.Grandparent:
        if (ageGroup === FamilyMemberAgeGroup.Adult && parentRole) {
          return {
            roleId: parentRole.id,
            roleName: parentRole.name,
            reasoning: 'Grandparents often help with family management and get the Parent role.'
          };
        }
        break;

      case FamilyRelationshipType.Caregiver:
      case FamilyRelationshipType.Caregiver:
        if (parentRole) {
          return {
            roleId: parentRole.id,
            roleName: parentRole.name,
            reasoning: 'Caregivers need task management permissions and get the Parent role.'
          };
        }
        break;

      case FamilyRelationshipType.FamilyFriend:
        if (memberRole) {
          return {
            roleId: memberRole.id,
            roleName: memberRole.name,
            reasoning: 'Tutors get Member role with basic family visibility.'
          };
        }
        break;
    }

    // Default to Member role for all other cases
    const defaultRole = memberRole || fallbackRole;
    return {
      roleId: defaultRole.id,
      roleName: defaultRole.name,
      reasoning: 'Default Member role with basic family permissions.'
    };
  }

  /**
   * Validate smart invitation request
   */
  async validateSmartInvitation(
    request: SmartInvitationRequest,
    currentFamily: FamilyDTO,
    currentMembers: FamilyMemberDTO[],
    inviterAgeGroup: FamilyMemberAgeGroup,
    availableRoles: FamilyRoleDTO[]
  ): Promise<InvitationValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Calculate age group if date of birth provided
    let calculatedAgeGroup: FamilyMemberAgeGroup | undefined;
    if (request.dateOfBirth) {
      calculatedAgeGroup = this.calculateAgeGroupFromDate(request.dateOfBirth);
    }

    // Get recommended role
    const ageGroupForRole = calculatedAgeGroup || FamilyMemberAgeGroup.Adult; // Default to adult if no DOB
    const roleRecommendation = this.getRecommendedRole(request.relationshipToAdmin, ageGroupForRole, availableRoles);

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(request.email)) {
      errors.push('Please enter a valid email address.');
    }

    // Check for existing member with same email
    const existingMember = currentMembers.find(m => 
      m.user?.email?.toLowerCase() === request.email.toLowerCase()
    );
    if (existingMember) {
      errors.push('A family member with this email address already exists.');
    }

    // Family size validation for teen creators
    if (inviterAgeGroup === FamilyMemberAgeGroup.Teen) {
      const currentSize = currentMembers.length;
      if (currentSize >= 5) {
        errors.push('Teen-managed families are limited to 5 members maximum.');
      } else if (currentSize === 4) {
        warnings.push('This will be the maximum member (5) for a teen-managed family.');
      }
    }

    // Age-relationship logic validation  
    if (request.dateOfBirth) {
      const age = this.calculateAgeFromBirthDate(request.dateOfBirth);
      if (age < 13 && (request.relationshipToAdmin === FamilyRelationshipType.Parent ||
          request.relationshipToAdmin === FamilyRelationshipType.Spouse)) {
        warnings.push('This person appears to be under 13 but is being invited as a parent/spouse. Please verify the relationship and age.');
      }
    }

    // Role permission warnings
    if (roleRecommendation.roleName === 'Admin' && inviterAgeGroup !== FamilyMemberAgeGroup.Adult) {
      warnings.push('Only adults can invite other admins. The role will be adjusted to Parent.');
      const parentRole = availableRoles.find(r => r.name === 'Parent') || availableRoles.find(r => r.name === 'Member');
      if (parentRole) {
        roleRecommendation.roleId = parentRole.id;
        roleRecommendation.roleName = parentRole.name;
      }
    }

    // Family composition warnings
    const parents = currentMembers.filter(m => m.role.name === 'Parent' || m.role.name === 'Admin');
    const children = currentMembers.filter(m => m.role.name === 'Child');
    
    if (request.relationshipToAdmin === FamilyRelationshipType.Child && children.length >= 6) {
      warnings.push('This family will have many children. Consider if all need Child role permissions.');
    }

    if (request.relationshipToAdmin === FamilyRelationshipType.Parent && parents.length >= 4) {
      warnings.push('This family will have many parents/admins. Consider member roles for some relatives.');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestedRole: roleRecommendation.roleName,
      suggestedRoleId: roleRecommendation.roleId,
      // SmartInvitationValidation properties
      recommendedRole: roleRecommendation.roleName,
      recommendationReasoning: roleRecommendation.reasoning,
      ageGroup: calculatedAgeGroup || ageGroupForRole,
      relationshipDisplayName: getRelationshipDisplayName(request.relationshipToAdmin),
      willExceedFamilyLimit: inviterAgeGroup === FamilyMemberAgeGroup.Teen && currentMembers.length >= 5,
      currentFamilySize: currentMembers.length,
      maxFamilySize: this.getMaxFamilySizeForAgeGroup(inviterAgeGroup),
      familySizeWarning: inviterAgeGroup === FamilyMemberAgeGroup.Teen && currentMembers.length >= 4 
        ? 'Teen-managed families are limited to 5 members' 
        : undefined
    };
  }

  /**
   * Create smart invitation with relationship context
   */
  async createSmartInvitation(request: SmartInvitationRequest): Promise<InvitationDTO> {
    try {
      // Get current family and validate
      const currentFamily = await this.getUserFamily();
      if (!currentFamily) {
        throw new Error('No family found. Please create a family first.');
      }

      // Get family members and roles for validation
      const [members, roles] = await Promise.all([
        this.getFamilyMembers(currentFamily.id),
        this.getFamilyRoles()
      ]);

      // Get current user permissions
      const permissions = await this.getFamilyManagementPermissions(currentFamily.id);
      
      // Validate the invitation
      const validation = await this.validateSmartInvitation(
        request,
        currentFamily,
        members,
        permissions.ageGroup,
        roles
      );

      if (!validation.isValid) {
        throw new Error(`Invitation validation failed: ${validation.errors.join(', ')}`);
      }

      // Create invitation DTO
      const invitationData: InvitationCreateDTO = {
        email: request.email,
        familyId: currentFamily.id,
        familyRoleId: validation.suggestedRoleId,
        message: request.personalMessage || `You've been invited to join our family as ${getRelationshipDisplayName(request.relationshipToAdmin)}.`,
        relationship: request.relationshipToAdmin,
        suggestedName: request.name,
        dateOfBirth: request.dateOfBirth,
        notes: request.notes
      };

      // Create the invitation
      const invitation = await this.createInvitation(invitationData);
      
      console.log(`Smart invitation created for ${request.email} as ${validation.suggestedRole} (${getRelationshipDisplayName(request.relationshipToAdmin)})`);
      
      return invitation;

    } catch (error) {
      console.error('Failed to create smart invitation:', error);
      throw error;
    }
  }

  /**
   * Get invitation validation preview without creating
   */
  async getInvitationPreview(request: SmartInvitationRequest): Promise<InvitationValidationResult> {
    try {
      const currentFamily = await this.getUserFamily();
      if (!currentFamily) {
        throw new Error('No family found.');
      }

      const [members, roles] = await Promise.all([
        this.getFamilyMembers(currentFamily.id),
        this.getFamilyRoles()
      ]);

      const permissions = await this.getFamilyManagementPermissions(currentFamily.id);
      
      return await this.validateSmartInvitation(
        request,
        currentFamily,
        members,
        permissions.ageGroup,
        roles
      );

    } catch (error) {
      console.error('Failed to get invitation preview:', error);
        return {
        isValid: false,
        errors: ['Failed to validate invitation. Please try again.'],
        warnings: [],
        suggestedRole: 'Member',
        suggestedRoleId: 0,
        // SmartInvitationValidation properties
        recommendedRole: 'Member',
        recommendationReasoning: 'Default role due to validation error',
        ageGroup: FamilyMemberAgeGroup.Adult,
        relationshipDisplayName: 'Family Member',
        willExceedFamilyLimit: false,
        currentFamilySize: 0,
        maxFamilySize: 10,
        familySizeWarning: undefined
        };
    }
  }

  // === PRIMARY FAMILY OPERATIONS ===

  /**
   * Get user's primary family
   */
  async getPrimaryFamily(): Promise<FamilyDTO | null> {
    try {
      if (this.primaryFamilyPromise && this.isCacheValid()) {
        return await this.primaryFamilyPromise;
      }
      
      this.primaryFamilyPromise = apiClient.get<FamilyDTO>('/v1/family/primary').then(result => {
        this.cacheTimestamp = Date.now();
        return result;
      }).catch(error => {
        // Clear failed promise from cache only for non-404 errors
        if ((error as { statusCode?: number })?.statusCode !== 404) {
          this.primaryFamilyPromise = null;
        } else {
          // Cache null result for 404s to prevent repeated failed requests
          this.primaryFamilyPromise = Promise.resolve(null);
          this.cacheTimestamp = Date.now();
        }
        throw error;
      });
      
      return await this.primaryFamilyPromise;
    } catch (error: unknown) {
      if ((error as { statusCode?: number })?.statusCode === 404) {
        // No primary family set - this is normal for new users
        // Don't log this as it's expected behavior
        return null;
      }
      // Only log unexpected errors (non-404)
      console.error('Failed to fetch primary family:', error);
      throw error;
    }
  }

  /**
   * Set primary family for current user
   */
  async setPrimaryFamily(familyId: number): Promise<FamilyDTO> {
    try {
      const result = await apiClient.post<FamilyDTO>(`/v1/family/${familyId}/set-primary`);
      console.log(`Successfully set family ${familyId} as primary family`);
      this.clearCache();
      return result;
    } catch (error) {
      console.error('Failed to set primary family:', error);
      throw error;
    }
  }

  /**
   * Update primary family for current user
   */
  async updatePrimaryFamily(familyId: number): Promise<boolean> {
    try {
      await apiClient.put<void>(`/v1/family/primary/${familyId}`);
      console.log(`Successfully updated primary family to ${familyId}`);
      this.clearCache();
      return true;
    } catch (error) {
      console.error('Failed to update primary family:', error);
      return false;
    }
  }

  /**
   * Get all families with primary family indication
   */
  async getAllFamiliesWithPrimary(): Promise<UserFamilyWithPrimary[]> {
    try {
      const [allFamilies, primaryFamily] = await Promise.all([
        this.getAllFamilies(),
        this.getPrimaryFamily().catch(() => null) // Handle 404 gracefully
      ]);

      return allFamilies.map(family => ({
        ...family,
        isPrimary: primaryFamily?.id === family.id,
        memberRole: 'Member', // TODO: Get actual role from family members
        joinedAt: family.createdAt, // TODO: Get actual join date
        canSetAsPrimary: true // TODO: Add actual permission check
      }));
    } catch (error) {
      // Only log unexpected errors (not 404 for no primary family)
      console.debug('Could not fetch families with primary indication (normal for new users):', error);
      return [];
    }
  }

  /**
   * Get primary family status for current user
   */
  async getPrimaryFamilyStatus(): Promise<PrimaryFamilyStatusDTO> {
    try {
      const [primaryFamily, allFamilies] = await Promise.all([
        this.getPrimaryFamily().catch(() => null), // Handle 404 gracefully
        this.getAllFamilies().catch(() => []) // Handle potential errors
      ]);

      return {
        hasPrimaryFamily: primaryFamily !== null,
        primaryFamily,
        allFamilies,
        canSetPrimary: allFamilies.length > 0
      };
    } catch (error) {
      // Only log unexpected errors (not 404 for primary family)
      console.debug('Could not get primary family status (normal for new users):', error);
      return {
        hasPrimaryFamily: false,
        primaryFamily: null,
        allFamilies: [],
        canSetPrimary: false
      };
    }
  }

  /**
   * Auto-assign primary family if user has only one family and no primary set
   */
  async autoAssignPrimaryFamily(): Promise<FamilyDTO | null> {
    try {
      const status = await this.getPrimaryFamilyStatus();
      
      // If no primary family and exactly one family, auto-assign it
      if (!status.hasPrimaryFamily && status.allFamilies.length === 1) {
        const family = status.allFamilies[0];
        console.log(`Auto-assigning primary family: ${family.name} (ID: ${family.id})`);
        return await this.setPrimaryFamily(family.id);
      }

      return status.primaryFamily;
    } catch (error) {
      console.error('Failed to auto-assign primary family:', error);
      return null;
    }
  }

  /**
   * Get current family (enhanced to use primary family logic)
   */
  async getCurrentFamilyEnhanced(): Promise<FamilyDTO | null> {
    try {
      // Try to get primary family first
      let family = await this.getPrimaryFamily();
      
      // If no primary family, try auto-assignment
      if (!family) {
        family = await this.autoAssignPrimaryFamily();
      }
      
      // Fall back to original getCurrentFamily method
      if (!family) {
        family = await this.getCurrentFamily();
      }

      return family;
    } catch (error) {
      console.error('Failed to get current family (enhanced):', error);
      return null;
    }
  }
}

// Export singleton instance
export const familyInvitationService = new FamilyInvitationService(); 