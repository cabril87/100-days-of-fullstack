/*
 * Enhanced Family Service - Advanced UX Features
 * Copyright (c) 2025 Carlos Abril Jr
 */

import { 
  InvitationPreviewData,
  RoleAssignmentWizardState,
  FamilyPrivacySettings,
  RoleChangeImpact,
  ExtendedRoleInfo,
  CompositionChange
} from '../types/enhanced-family';
import { 
  EnhancedInvitationFormData,
  BulkInvitationFormData,
  RoleAssignmentFormData,
  BulkRoleAssignmentFormData,
  FamilyPrivacySettingsFormData,
  validateAgeAppropriateRole,
  validateFamilyComposition
} from '../schemas/enhanced-family';
import { InvitationDTO, FamilyDTO, FamilyMemberDTO } from '../types/family-invitation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export class EnhancedFamilyService {
  private static instance: EnhancedFamilyService;
  
  public static getInstance(): EnhancedFamilyService {
    if (!EnhancedFamilyService.instance) {
      EnhancedFamilyService.instance = new EnhancedFamilyService();
    }
    return EnhancedFamilyService.instance;
  }

  // === ENHANCED INVITATION SYSTEM ===

  async previewInvitation(
    familyId: number, 
    invitationData: EnhancedInvitationFormData
  ): Promise<InvitationPreviewData> {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/v1/families/${familyId}/invitations/preview`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invitationData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to preview invitation');
    }

    return await response.json();
  }

  async sendEnhancedInvitation(
    familyId: number, 
    invitationData: EnhancedInvitationFormData
  ): Promise<InvitationDTO> {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/v1/families/${familyId}/invitations/enhanced`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invitationData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send invitation');
    }

    return await response.json();
  }

  async sendBulkInvitations(
    familyId: number, 
    bulkData: BulkInvitationFormData
  ): Promise<{ successful: InvitationDTO[]; failed: Record<string, unknown>[] }> {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/v1/families/${familyId}/invitations/bulk`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bulkData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send bulk invitations');
    }

    return await response.json();
  }

  validateInvitationData(
    invitationData: EnhancedInvitationFormData,
    currentFamily: FamilyDTO,
    currentMembers: FamilyMemberDTO[]
  ): { isValid: boolean; warnings: string[]; errors: string[] } {
    const warnings: string[] = [];
    const errors: string[] = [];

    // Age validation
    const estimatedAge = this.calculateAge(invitationData.dateOfBirth);
    const ageValidation = validateAgeAppropriateRole(estimatedAge, []);
    if (!ageValidation.isValid) {
      warnings.push(`Age-based restrictions may apply for ${estimatedAge} year old`);
    }

    // Family size validation
    const compositionValidation = validateFamilyComposition(
      currentMembers.length, 
      1, 
      this.getMaxFamilySize()
    );
    if (!compositionValidation.isValid) {
      errors.push(`Family size limit exceeded. Current: ${compositionValidation.currentSize}, Max: ${compositionValidation.maxSize}`);
    }

    // Email uniqueness validation
    const existingMemberEmails = currentMembers.map(m => m.user.email.toLowerCase());
    if (existingMemberEmails.includes(invitationData.email.toLowerCase())) {
      errors.push('This email address is already a family member');
    }

    // Relationship consistency validation (if we have admin's relationship context)
    // This would require additional context about the inviting user's relationship

    return {
      isValid: errors.length === 0,
      warnings,
      errors,
    };
  }

  // === ADVANCED ROLE ASSIGNMENT ===

  async getRoleAssignmentWizardState(
    familyId: number, 
    memberId: number
  ): Promise<RoleAssignmentWizardState> {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/v1/families/${familyId}/members/${memberId}/role-wizard`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get role assignment wizard state');
    }

    return await response.json();
  }

  async previewRoleChange(
    familyId: number, 
    memberId: number, 
    newRoleId: number
  ): Promise<RoleChangeImpact> {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/v1/families/${familyId}/members/${memberId}/role-preview`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ newRoleId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to preview role change');
    }

    return await response.json();
  }

  async assignRole(
    familyId: number, 
    roleData: RoleAssignmentFormData
  ): Promise<FamilyMemberDTO> {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/v1/families/${familyId}/members/${roleData.memberId}/role`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(roleData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to assign role');
    }

    return await response.json();
  }

  async bulkAssignRoles(
    familyId: number, 
    bulkData: BulkRoleAssignmentFormData
  ): Promise<{ successful: FamilyMemberDTO[]; failed: Record<string, unknown>[] }> {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/v1/families/${familyId}/roles/bulk-assign`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bulkData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to bulk assign roles');
    }

    return await response.json();
  }

  async getExtendedRoleInfo(familyId: number): Promise<ExtendedRoleInfo[]> {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/v1/families/${familyId}/roles/extended`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get extended role info');
    }

    return await response.json();
  }

  // === FAMILY PRIVACY DASHBOARD ===

  async getFamilyPrivacySettings(familyId: number): Promise<FamilyPrivacySettings> {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/v1/families/${familyId}/privacy`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get family privacy settings');
    }

    return await response.json();
  }

  async updateFamilyPrivacySettings(
    familyId: number, 
    settings: FamilyPrivacySettingsFormData
  ): Promise<FamilyPrivacySettings> {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/v1/families/${familyId}/privacy`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update family privacy settings');
    }

    return await response.json();
  }

  async exportFamilyData(
    familyId: number, 
    format: 'json' | 'csv' | 'pdf' | 'xml' = 'json',
    scope: 'all' | 'personal' | 'family' | 'tasks' | 'achievements' = 'all'
  ): Promise<Blob> {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/v1/families/${familyId}/export`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ format, scope }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to export family data');
    }

    return await response.blob();
  }

  async getFamilyComplianceStatus(familyId: number): Promise<{
    compliant: boolean;
    standards: Record<string, unknown>[];
    lastChecked: string;
    nextReview: string;
  }> {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/v1/families/${familyId}/compliance`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get compliance status');
    }

    return await response.json();
  }

  // === FAMILY ANALYTICS & INSIGHTS ===

  async getFamilyCompositionAnalysis(familyId: number): Promise<CompositionChange> {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/v1/families/${familyId}/analytics/composition`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get family composition analysis');
    }

    return await response.json();
  }

  async getFamilyDynamicsInsights(familyId: number): Promise<{
    balanceScore: number;
    recommendations: string[];
    potentialIssues: string[];
    strengths: string[];
  }> {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/v1/families/${familyId}/analytics/dynamics`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get family dynamics insights');
    }

    return await response.json();
  }

  // === HELPER FUNCTIONS ===

  private calculateAge(dateOfBirth: string): number {
    const birth = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }

  private getMaxFamilySize(): number {
    // This would typically come from subscription tier or family settings
    // For now, return a default based on family type or subscription
    return 10; // Default max family size
  }

  // === INVITATION TEMPLATES ===

  generateInvitationMessage(
    inviterName: string,
    familyName: string,
    relationship: string,
    recipientName: string,
    customMessage?: string
  ): string {
    const baseMessage = `Hi ${recipientName}! ${inviterName} has invited you to join the "${familyName}" family on TaskTracker as their ${relationship.toLowerCase()}.`;
    
    const benefits = `
TaskTracker helps families:
• Stay organized with shared task lists
• Celebrate achievements together
• Build healthy habits through gamification
• Communicate effectively about responsibilities

Join us to start building better family habits together!`;

    return customMessage 
      ? `${baseMessage}\n\nPersonal message: "${customMessage}"\n${benefits}`
      : `${baseMessage}\n${benefits}`;
  }

  // === QR CODE GENERATION ===

  async generateInvitationQR(invitationToken: string): Promise<string> {
    const invitationUrl = `${window.location.origin}/invite/${invitationToken}`;
    
    // In a real implementation, you'd use a QR code library
    // For now, return a placeholder or use a QR code API
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(invitationUrl)}`;
    
    return qrApiUrl;
  }

  // === FAMILY HEALTH METRICS ===

  async getFamilyHealthScore(familyId: number): Promise<{
    overallScore: number;
    categories: {
      communication: number;
      taskCompletion: number;
      engagement: number;
      balance: number;
    };
    recommendations: string[];
    trends: {
      week: number;
      month: number;
      quarter: number;
    };
  }> {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/v1/families/${familyId}/health-score`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get family health score');
    }

    return await response.json();
  }
}

export const enhancedFamilyService = EnhancedFamilyService.getInstance(); 