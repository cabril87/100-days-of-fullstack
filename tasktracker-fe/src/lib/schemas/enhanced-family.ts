import { z } from 'zod';
import { FamilyRelationshipType } from '@/lib/types/family-invitation';
import { FamilyMemberAgeGroup } from '@/lib/types/auth';
  

// === ENHANCED INVITATION SCHEMAS ===

export const enhancedInvitationSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address')
    .max(100, 'Email cannot exceed 100 characters'),
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),
  relationship: z.nativeEnum(FamilyRelationshipType),
  dateOfBirth: z
    .string()
    .datetime('Please enter a valid date'),
  personalMessage: z
    .string()
    .max(500, 'Personal message cannot exceed 500 characters')
    .optional(),
  roleId: z.number().positive('Role ID must be a positive number'),
  wantsAdminRole: z.boolean().default(false),
  notes: z
    .string()
    .max(1000, 'Notes cannot exceed 1000 characters')
    .optional(),
  expirationDays: z
    .number()
    .min(1, 'Expiration must be at least 1 day')
    .max(30, 'Expiration cannot exceed 30 days')
    .default(7),
  sendingMethod: z.enum(['email', 'sms', 'in_app', 'qr_code']).default('email'),
  includeQr: z.boolean().default(false),
  followUpReminders: z.boolean().default(true),
});

export const bulkInvitationSchema = z.object({
  invitations: z
    .array(enhancedInvitationSchema)
    .min(1, 'At least one invitation is required')
    .max(20, 'Cannot send more than 20 invitations at once'),
  sharedMessage: z
    .string()
    .max(500, 'Shared message cannot exceed 500 characters')
    .optional(),
  skipValidationErrors: z.boolean().default(false),
  staggerSending: z.boolean().default(false),
  sendingInterval: z
    .number()
    .min(1, 'Sending interval must be at least 1 minute')
    .max(60, 'Sending interval cannot exceed 60 minutes')
    .default(5),
});

// === ROLE ASSIGNMENT SCHEMAS ===

export const roleAssignmentSchema = z.object({
  memberId: z.number().positive('Member ID must be a positive number'),
  roleId: z.number().positive('Role ID must be a positive number'),
  customPermissions: z
    .array(z.string().min(1, 'Permission name cannot be empty'))
    .optional(),
  reason: z
    .string()
    .min(10, 'Reason must be at least 10 characters')
    .max(500, 'Reason cannot exceed 500 characters'),
  effectiveDate: z
    .string()
    .datetime('Please enter a valid date')
    .optional(),
  expirationDate: z
    .string()
    .datetime('Please enter a valid date')
    .optional(),
  requiresApproval: z.boolean().default(false),
  notifyMember: z.boolean().default(true),
});

export const bulkRoleAssignmentSchema = z.object({
  assignments: z
    .array(roleAssignmentSchema)
    .min(1, 'At least one role assignment is required')
    .max(50, 'Cannot assign more than 50 roles at once'),
  applyToAllFamilies: z.boolean().default(false),
  overallReason: z
    .string()
    .min(10, 'Overall reason must be at least 10 characters')
    .max(1000, 'Overall reason cannot exceed 1000 characters'),
  skipConflicts: z.boolean().default(false),
  previewChanges: z.boolean().default(true),
});

// === FAMILY PRIVACY SCHEMAS ===

export const familyVisibilitySchema = z.object({
  profileVisibility: z.enum(['public', 'family_only', 'admin_only', 'private']).default('family_only'),
  taskVisibility: z.enum(['all_members', 'age_appropriate', 'role_based', 'custom']).default('age_appropriate'),
  achievementVisibility: z.enum(['public', 'family_only', 'private']).default('family_only'),
  activityVisibility: z.enum(['all_members', 'parents_only', 'admin_only']).default('all_members'),
  searchable: z.boolean().default(true),
  showInDirectory: z.boolean().default(false),
});

export const dataSharingSchema = z.object({
  shareWithPartners: z.boolean().default(false),
  analyticsOptIn: z.boolean().default(true),
  marketingOptIn: z.boolean().default(false),
  researchParticipation: z.boolean().default(false),
  dataRetentionPeriod: z
    .number()
    .min(30, 'Data retention must be at least 30 days')
    .max(3650, 'Data retention cannot exceed 10 years')
    .default(365),
  automaticDeletion: z.boolean().default(false),
});

export const memberPrivacySchema = z.object({
  memberId: z.number().positive('Member ID must be a positive number'),
  profileVisibility: z.object({
    showRealName: z.boolean().default(true),
    showAge: z.boolean().default(true),
    showAchievements: z.boolean().default(true),
    showTaskHistory: z.boolean().default(true),
    showOnlineStatus: z.boolean().default(true),
  }),
  taskVisibility: z.object({
    showAssignedTasks: z.boolean().default(true),
    showCompletedTasks: z.boolean().default(true),
    showPointsEarned: z.boolean().default(true),
    showTaskComments: z.boolean().default(true),
    allowTaskSharing: z.boolean().default(false),
  }),
  communicationPreferences: z.object({
    allowDirectMessages: z.boolean().default(true),
    allowGroupMessages: z.boolean().default(true),
    allowNotifications: z.boolean().default(true),
    allowEmailContact: z.boolean().default(true),
    allowPhoneContact: z.boolean().default(false),
    preferredContactMethod: z.enum(['app', 'email', 'sms', 'none']).default('app'),
  }),
});

export const parentalControlSchema = z.object({
  memberId: z.number().positive('Member ID must be a positive number'),
  requireApprovalFor: z.array(z.object({
    action: z.string().min(1, 'Action cannot be empty'),
    required: z.boolean(),
    approvers: z.array(z.number().positive()).min(1, 'At least one approver is required'),
    maxValue: z.number().positive().optional(),
    timeWindow: z.string().optional(),
  })),
  timeRestrictions: z.array(z.object({
    type: z.enum(['daily', 'weekly', 'date_range']),
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
    daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
  })),
  contentFiltering: z.object({
    enableFilter: z.boolean().default(false),
    filterLevel: z.enum(['strict', 'moderate', 'basic', 'off']).default('moderate'),
    blockedCategories: z.array(z.string()),
    allowedDomains: z.array(z.string().url('Invalid domain URL')),
    blockedKeywords: z.array(z.string()),
  }),
});

export const childProtectionSchema = z.object({
  enableProtection: z.boolean().default(true),
  ageVerificationRequired: z.boolean().default(true),
  parentalConsentRequired: z.boolean().default(true),
  dataMinimization: z.boolean().default(true),
  automaticDeletion: z.object({
    enabled: z.boolean().default(false),
    retentionPeriod: z
      .number()
      .min(30, 'Retention period must be at least 30 days')
      .max(1095, 'Retention period cannot exceed 3 years')
      .default(365),
    exemptions: z.array(z.string()),
    notificationBeforeDeletion: z.boolean().default(true),
  }),
  reportingSettings: z.object({
    enableReporting: z.boolean().default(true),
    reportableActions: z.array(z.string()),
    notificationRecipients: z.array(z.number().positive()),
    escalationRules: z.array(z.object({
      trigger: z.string().min(1, 'Trigger cannot be empty'),
      action: z.string().min(1, 'Action cannot be empty'),
      delay: z.number().min(0, 'Delay cannot be negative'),
      recipients: z.array(z.number().positive()),
    })),
  }),
});

export const familyPrivacySettingsSchema = z.object({
  familyId: z.number().positive('Family ID must be a positive number'),
  visibility: familyVisibilitySchema,
  dataSharing: dataSharingSchema,
  memberPrivacy: z.array(memberPrivacySchema),
  childProtection: childProtectionSchema,
  externalIntegrations: z.array(z.object({
    service: z.string().min(1, 'Service name cannot be empty'),
    enabled: z.boolean(),
    dataSharing: z.array(z.string()),
    permissions: z.array(z.string()),
    syncFrequency: z.enum(['real_time', 'hourly', 'daily', 'weekly', 'manual']).default('daily'),
  })),
});

// === VALIDATION HELPERS ===

export const validateAgeAppropriateRole = (age: number, rolePermissions: string[]) => {
  const ageGroup = getAgeGroup(age);
  const restrictedPermissions = getRestrictedPermissionsForAge(ageGroup);
  
  const violations = rolePermissions.filter(permission => 
    restrictedPermissions.includes(permission)
  );
  
  return {
    isValid: violations.length === 0,
    violations,
    ageGroup,
    recommendations: getRecommendationsForAge(ageGroup),
  };
};

export const validateFamilyComposition = (currentMembers: number, newMembers: number, maxSize: number) => {
  const totalMembers = currentMembers + newMembers;
  
  return {
    isValid: totalMembers <= maxSize,
    currentSize: currentMembers,
    newSize: totalMembers,
    maxSize,
    exceededBy: Math.max(0, totalMembers - maxSize),
    availableSlots: Math.max(0, maxSize - currentMembers),
  };
};

export const validateRelationshipConsistency = (
  inviterRelationship: FamilyRelationshipType,
  inviteeRelationship: FamilyRelationshipType
) => {
  const consistencyRules = getRelationshipConsistencyRules();
  const rule = consistencyRules[inviterRelationship as keyof typeof consistencyRules];
  
  if (!rule) return { isValid: true, warnings: [] };
  
  const isValid = rule.allowedRelationships.includes(inviteeRelationship);
  const warnings = isValid ? [] : rule.warnings;
  
  return {
    isValid,
    warnings,
    suggestions: rule.suggestions || [],
  };
};

const getAgeGroup = (age: number): FamilyMemberAgeGroup => {
  if (age < 13) return FamilyMemberAgeGroup.Child;
  if (age < 18) return FamilyMemberAgeGroup.Teen;
  return FamilyMemberAgeGroup.Adult;
};

const getRestrictedPermissionsForAge = (ageGroup: FamilyMemberAgeGroup): string[] => {
  switch (ageGroup) {
    case FamilyMemberAgeGroup.Child:
      return [
        'manage_family',
        'invite_members',
        'manage_roles',
        'delete_family',
        'manage_billing',
        'access_admin_panel',
        'moderate_content',
        'manage_external_integrations',
      ];
    case FamilyMemberAgeGroup.Teen:
      return [
        'delete_family',
        'manage_billing',
        'access_admin_panel',
        'manage_external_integrations',
      ];
    case FamilyMemberAgeGroup.Adult:
      return [];
    default:
      return [];
  }
};

const getRecommendationsForAge = (ageGroup: FamilyMemberAgeGroup): string[] => {
  switch (ageGroup) {
    case FamilyMemberAgeGroup.Child:
      return [
        'Consider the "Child Member" role with basic task permissions',
        'Enable parental approval for point spending',
        'Set up time restrictions for app usage',
        'Enable content filtering for age-appropriate content',
      ];
    case FamilyMemberAgeGroup.Teen:
      return [
        'Consider the "Teen Member" role with expanded permissions',
        'Allow some family management capabilities under supervision',
        'Enable educational goal tracking',
        'Set up graduated privileges system',
      ];
    case FamilyMemberAgeGroup.Adult:
      return [
        'Consider "Parent" or "Admin" role based on family structure',
        'Enable full family management capabilities',
        'Set up oversight for younger family members',
        'Configure privacy settings appropriately',
      ];
    default:
      return [];
  }
};

const getRelationshipConsistencyRules = () => ({
  [FamilyRelationshipType.Parent]: {
    allowedRelationships: [
      FamilyRelationshipType.Child,
      FamilyRelationshipType.Spouse,
      FamilyRelationshipType.Partner,
    ],
    warnings: ['Parents typically invite children, spouses, or partners'],
    suggestions: ['Consider if this relationship makes sense in your family context'],
  },
  [FamilyRelationshipType.Child]: {
    allowedRelationships: [
      FamilyRelationshipType.Parent,
      FamilyRelationshipType.Sibling,
      FamilyRelationshipType.Grandparent,
    ],
    warnings: ['Children typically invite parents, siblings, or grandparents'],
    suggestions: ['Ensure this invitation is approved by a parent or guardian'],
  },
  // Add more rules as needed
});

// === COMPONENT FORM SCHEMAS ===

export const invitationBasicSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  name: z.string().min(1, 'Name is required').max(50, 'Name cannot exceed 50 characters'),
  estimatedAge: z.number().min(0, 'Age must be 0 or greater').max(120, 'Age must be reasonable').optional(),
  relationship: z.nativeEnum(FamilyRelationshipType),
  relationshipDescription: z.string().max(200, 'Description cannot exceed 200 characters').optional(),
});

export const invitationSendingSchema = z.object({
  method: z.enum(['email', 'sms', 'in_app', 'qr_code']),
  customMessage: z.string().max(500, 'Message cannot exceed 500 characters').optional(),
  includeQr: z.boolean(),
  scheduledFor: z.string().optional(),
  expirationDays: z.number().min(1, 'Must be at least 1 day').max(30, 'Cannot exceed 30 days'),
  followUpReminders: z.boolean(),
});

// === DERIVED TYPES ===

export type InvitationBasicFormData = z.infer<typeof invitationBasicSchema>;
export type InvitationSendingFormData = z.infer<typeof invitationSendingSchema>;
export type EnhancedInvitationFormData = z.infer<typeof enhancedInvitationSchema>;
export type BulkInvitationFormData = z.infer<typeof bulkInvitationSchema>;
export type RoleAssignmentFormData = z.infer<typeof roleAssignmentSchema>;
export type BulkRoleAssignmentFormData = z.infer<typeof bulkRoleAssignmentSchema>;
export type FamilyVisibilityFormData = z.infer<typeof familyVisibilitySchema>;
export type DataSharingFormData = z.infer<typeof dataSharingSchema>;
export type MemberPrivacyFormData = z.infer<typeof memberPrivacySchema>;
export type ParentalControlFormData = z.infer<typeof parentalControlSchema>;
export type ChildProtectionFormData = z.infer<typeof childProtectionSchema>;
export type FamilyPrivacySettingsFormData = z.infer<typeof familyPrivacySettingsSchema>; 