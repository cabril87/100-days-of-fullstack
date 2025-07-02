/**
 * Smart Relationship Service
 * Handles relationship context and mapping for different user types
 */

import { 
  FamilyRelationshipType, 
  SmartInvitationRequest,
  RelationshipContext,
  SmartRelationshipMapping
} from '@/lib/types/family';
import { FamilyMemberAgeGroup } from '@/lib/types/auth';

/**
 * Determines the appropriate relationship context based on user role and permissions
 */
export function getRelationshipContext(
  currentUser: { 
    id: number; 
    globalRole: string; 
    familyRole?: string; 
    isFamilyAdmin?: boolean;
  },
  targetFamilyId?: number
): RelationshipContext {
  const isGlobalAdmin = currentUser.globalRole === 'Admin';
  const isFamilyAdmin = currentUser.isFamilyAdmin || false;
  
  return {
    currentUserId: currentUser.id,
    currentUserRole: currentUser.familyRole || currentUser.globalRole,
    isFamilyAdmin,
    isGlobalAdmin,
    familyId: targetFamilyId,
    mappingStrategy: isGlobalAdmin || isFamilyAdmin ? 'admin-relative' : 'self-relative'
  };
}

/**
 * Gets the appropriate relationship mapping strategy based on context
 */
export function getSmartRelationshipMapping(context: RelationshipContext): SmartRelationshipMapping {
  // Global admins can invite relative to themselves or as family admin
  if (context.isGlobalAdmin) {
    return {
      relationshipLabel: 'Relationship Context',
      relationshipDescription: 'How is this person related? (You can specify relative to you or as family admin)',
      contextualPrompt: 'Select the most appropriate relationship',
      mappingStrategy: 'admin-relative'
    };
  }

  // Family admins invite relative to themselves as the family admin
  if (context.isFamilyAdmin) {
    return {
      relationshipLabel: 'Relationship to Family Admin',
      relationshipDescription: 'How is this person related to you as the family admin?',
      contextualPrompt: 'This relationship will be stored relative to your admin role',
      mappingStrategy: 'admin-relative'
    };
  }

  // Regular users invite relative to themselves
  return {
    relationshipLabel: 'Relationship to You',
    relationshipDescription: 'How is this person related to you personally?',
    contextualPrompt: 'This relationship will be mapped to the family admin context automatically',
    mappingStrategy: 'self-relative'
  };
}

/**
 * Maps a self-relative relationship to admin-relative relationship
 * Example: If user is "Child" and invites their "Sibling", the sibling is "Child" to admin
 */
export function mapSelfRelativeToAdminRelative(
  selfRelationship: FamilyRelationshipType,
  inviterRelationshipToAdmin: FamilyRelationshipType
): FamilyRelationshipType {
  // If inviter is the admin, no mapping needed
  if (inviterRelationshipToAdmin === FamilyRelationshipType.Self) {
    return selfRelationship;
  }

  // Mapping logic based on inviter's relationship to admin
  switch (inviterRelationshipToAdmin) {
    case FamilyRelationshipType.Child:
      switch (selfRelationship) {
        case FamilyRelationshipType.Sibling:
          return FamilyRelationshipType.Child; // Sibling of child = another child
        case FamilyRelationshipType.Parent:
          return FamilyRelationshipType.Self; // Parent of child = admin
        case FamilyRelationshipType.Grandparent:
          return FamilyRelationshipType.Parent; // Grandparent of child = parent to admin
        case FamilyRelationshipType.Child:
          return FamilyRelationshipType.Grandchild; // Child of child = grandchild to admin
        default:
          return selfRelationship; // Keep original for complex relationships
      }

    case FamilyRelationshipType.Spouse:
      switch (selfRelationship) {
        case FamilyRelationshipType.Parent:
          return FamilyRelationshipType.MotherInLaw; // Parent of spouse = in-law
        case FamilyRelationshipType.Sibling:
          return FamilyRelationshipType.SisterInLaw; // Sibling of spouse = in-law
        case FamilyRelationshipType.Child:
          return FamilyRelationshipType.Stepchild; // Child of spouse = stepchild
        default:
          return selfRelationship;
      }

    case FamilyRelationshipType.Parent:
      switch (selfRelationship) {
        case FamilyRelationshipType.Parent:
          return FamilyRelationshipType.Grandparent; // Parent of parent = grandparent
        case FamilyRelationshipType.Sibling:
          return FamilyRelationshipType.Aunt; // Sibling of parent = aunt/uncle
        case FamilyRelationshipType.Child:
          return FamilyRelationshipType.Sibling; // Child of parent = sibling to admin
        default:
          return selfRelationship;
      }

    default:
      // For complex relationships, use intelligent fallback
      return mapComplexRelationship(selfRelationship, inviterRelationshipToAdmin);
  }
}

/**
 * Handles complex relationship mapping scenarios
 */
function mapComplexRelationship(
  selfRelationship: FamilyRelationshipType,
  inviterRelationshipToAdmin: FamilyRelationshipType
): FamilyRelationshipType {
  // For extended family, often the relationship stays the same or becomes more distant
  const directFamilyTypes = [
    FamilyRelationshipType.Parent,
    FamilyRelationshipType.Child,
    FamilyRelationshipType.Spouse,
    FamilyRelationshipType.Sibling
  ];

  // If both are direct family, try to map logically
  if (directFamilyTypes.includes(selfRelationship) && directFamilyTypes.includes(inviterRelationshipToAdmin)) {
    // Use simplified mapping for complex cases
    switch (selfRelationship) {
      case FamilyRelationshipType.Parent:
        return FamilyRelationshipType.Grandparent;
      case FamilyRelationshipType.Child:
        return FamilyRelationshipType.Grandchild;
      case FamilyRelationshipType.Sibling:
        return FamilyRelationshipType.Cousin;
      default:
        return selfRelationship;
    }
  }

  // For non-family relationships, keep as-is
  return selfRelationship;
}

/**
 * Creates a comprehensive smart invitation request with proper relationship context
 */
export function createSmartInvitationWithContext(
  formData: {
    email: string;
    name: string;
    relationship: FamilyRelationshipType;
    dateOfBirth: string;
    personalMessage?: string;
    notes?: string;
    wantsAdminRole?: boolean;
  },
  context: RelationshipContext,
  inviterRelationshipToAdmin?: FamilyRelationshipType
): SmartInvitationRequest {
  let finalRelationshipToAdmin: FamilyRelationshipType;

  // Determine final relationship based on mapping strategy
  if (context.mappingStrategy === 'self-relative' && inviterRelationshipToAdmin) {
    finalRelationshipToAdmin = mapSelfRelativeToAdminRelative(
      formData.relationship,
      inviterRelationshipToAdmin
    );
  } else {
    finalRelationshipToAdmin = formData.relationship;
  }

  return {
    email: formData.email,
    name: formData.name,
    relationshipToAdmin: finalRelationshipToAdmin,
    dateOfBirth: formData.dateOfBirth,
    personalMessage: formData.personalMessage,
    wantsAdminRole: formData.wantsAdminRole || false,
    notes: formData.notes,
    // Additional context for backend processing
    relatedToMemberId: context.currentUserId,
    relationshipToMember: formData.relationship
  };
}

/**
 * Gets appropriate validation warnings based on relationship context
 */
export function getContextualValidationWarnings(
  relationship: FamilyRelationshipType,
  ageGroup: FamilyMemberAgeGroup,
  context: RelationshipContext
): string[] {
  const warnings: string[] = [];

  // Add context-specific warnings
  if (context.mappingStrategy === 'self-relative') {
    warnings.push(
      `This relationship will be automatically mapped to family admin context. The person will be recorded as ${getRelationshipDisplayName(relationship)} relative to the family admin.`
    );
  }

  // Add age-relationship warnings
  if (relationship === FamilyRelationshipType.Parent && ageGroup === FamilyMemberAgeGroup.Child) {
    warnings.push('A child in a parent role is unusual. Please verify this relationship.');
  }

  if (relationship === FamilyRelationshipType.Grandparent && ageGroup !== FamilyMemberAgeGroup.Adult) {
    warnings.push('Grandparents are typically adults. Please verify the age and relationship.');
  }

  return warnings;
}

/**
 * Helper function to get display name for relationships
 */
function getRelationshipDisplayName(relationship: FamilyRelationshipType): string {
  const displayNames: Record<FamilyRelationshipType, string> = {
    [FamilyRelationshipType.Other]: 'Other',
    [FamilyRelationshipType.Parent]: 'Parent',
    [FamilyRelationshipType.Child]: 'Child',
    [FamilyRelationshipType.Spouse]: 'Spouse',
    [FamilyRelationshipType.Partner]: 'Partner',
    [FamilyRelationshipType.Sibling]: 'Sibling',
    [FamilyRelationshipType.Grandparent]: 'Grandparent',
    [FamilyRelationshipType.Grandchild]: 'Grandchild',
    [FamilyRelationshipType.Aunt]: 'Aunt',
    [FamilyRelationshipType.Uncle]: 'Uncle',
    [FamilyRelationshipType.Cousin]: 'Cousin',
    [FamilyRelationshipType.Nephew]: 'Nephew',
    [FamilyRelationshipType.Niece]: 'Niece',
    [FamilyRelationshipType.Stepparent]: 'Stepparent',
    [FamilyRelationshipType.Stepchild]: 'Stepchild',
    [FamilyRelationshipType.Stepsister]: 'Stepsister',
    [FamilyRelationshipType.Stepbrother]: 'Stepbrother',
    [FamilyRelationshipType.HalfSister]: 'Half-sister',
    [FamilyRelationshipType.HalfBrother]: 'Half-brother',
    [FamilyRelationshipType.MotherInLaw]: 'Mother-in-law',
    [FamilyRelationshipType.FatherInLaw]: 'Father-in-law',
    [FamilyRelationshipType.SisterInLaw]: 'Sister-in-law',
    [FamilyRelationshipType.BrotherInLaw]: 'Brother-in-law',
    [FamilyRelationshipType.DaughterInLaw]: 'Daughter-in-law',
    [FamilyRelationshipType.SonInLaw]: 'Son-in-law',
    [FamilyRelationshipType.Guardian]: 'Guardian',
    [FamilyRelationshipType.Caregiver]: 'Caregiver',
    [FamilyRelationshipType.FosterParent]: 'Foster Parent',
    [FamilyRelationshipType.FosterChild]: 'Foster Child',
    [FamilyRelationshipType.FamilyFriend]: 'Family Friend',
    [FamilyRelationshipType.Godparent]: 'Godparent',
    [FamilyRelationshipType.Godchild]: 'Godchild',
    [FamilyRelationshipType.Self]: 'Self'
  };

  return displayNames[relationship] || 'Unknown';
} 
