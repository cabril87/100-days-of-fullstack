import { z } from 'zod';
import { FamilyMemberAgeGroup } from '../types/auth';

// Admin User Creation Schema
export const adminUserCreationSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username cannot exceed 50 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
  
  email: z.string()
    .email('Invalid email address')
    .max(100, 'Email cannot exceed 100 characters'),
  
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password cannot exceed 100 characters'),
  
  confirmPassword: z.string(),
  
  firstName: z.string()
    .max(50, 'First name cannot exceed 50 characters')
    .optional()
    .or(z.literal('')),
  
  lastName: z.string()
    .max(50, 'Last name cannot exceed 50 characters')
    .optional()
    .or(z.literal('')),
  
  ageGroup: z.nativeEnum(FamilyMemberAgeGroup, {
    errorMap: () => ({ message: 'Please select a valid age group' })
  }),
  
  familyId: z.number()
    .positive('Family ID must be positive')
    .optional(),
  
  familyRoleId: z.number()
    .positive('Role ID must be positive')
    .optional(),
  
  dateOfBirth: z.string()
    .optional()
    .or(z.literal(''))
    .refine((val) => {
      if (!val) return true; // Optional field
      const date = new Date(val);
      const now = new Date();
      return date <= now;
    }, 'Date of birth cannot be in the future')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine((data) => {
  // If a family is selected, validate that the age group is appropriate for family membership
  if (data.familyId) {
    return data.ageGroup !== undefined;
  }
  return true;
}, {
  message: "Age group is required when assigning to a family",
  path: ["ageGroup"],
});

export type AdminUserCreationFormData = z.infer<typeof adminUserCreationSchema>;

// Admin User Update Schema
export const adminUserUpdateSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username cannot exceed 50 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens')
    .optional(),
  
  email: z.string()
    .email('Invalid email address')
    .max(100, 'Email cannot exceed 100 characters')
    .optional(),
  
  firstName: z.string()
    .max(50, 'First name cannot exceed 50 characters')
    .optional(),
  
  lastName: z.string()
    .max(50, 'Last name cannot exceed 50 characters')
    .optional(),
  
  ageGroup: z.nativeEnum(FamilyMemberAgeGroup).optional(),
  
  role: z.string()
    .min(1, 'Role cannot be empty')
    .optional(),
  
  isActive: z.boolean().optional(),
});

export type AdminUserUpdateFormData = z.infer<typeof adminUserUpdateSchema>;

// Admin Password Change Schema
export const adminPasswordChangeSchema = z.object({
  userId: z.number()
    .positive('User ID must be positive'),
  
  newPassword: z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password cannot exceed 100 characters'),
  
  confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Passwords don't match",
  path: ["confirmNewPassword"],
});

export type AdminPasswordChangeFormData = z.infer<typeof adminPasswordChangeSchema>;

// Family Assignment Schema
export const familyAssignmentSchema = z.object({
  familyId: z.number()
    .positive('Family ID must be positive'),
  
  familyRoleId: z.number()
    .positive('Role ID must be positive')
    .optional(),
  
  userId: z.number()
    .positive('User ID must be positive'),
}).refine(() => {
  // Add any additional business logic validation here
  return true;
}, {
  message: "Invalid family assignment configuration",
});

export type FamilyAssignmentFormData = z.infer<typeof familyAssignmentSchema>;

// Age Group Validation Helpers
export const validateAgeGroupForFamilyManagement = (ageGroup: FamilyMemberAgeGroup): boolean => {
  return ageGroup === FamilyMemberAgeGroup.Teen || ageGroup === FamilyMemberAgeGroup.Adult;
};

export const validateAgeGroupForOwnershipTransfer = (ageGroup: FamilyMemberAgeGroup): boolean => {
  return ageGroup === FamilyMemberAgeGroup.Adult;
};

export const validateAgeGroupForFamilyCreation = (ageGroup: FamilyMemberAgeGroup): boolean => {
  return ageGroup === FamilyMemberAgeGroup.Teen || ageGroup === FamilyMemberAgeGroup.Adult;
}; 