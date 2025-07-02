/**
 * Smart Relationship Validation Schemas
 * Zod schemas for smart family relationship features
 */

import { z } from 'zod';
import { FamilyRelationshipType } from '@/lib/types/family';

/**
 * Schema for smart relationship form data
 */
export const smartRelationshipFormSchema = z.object({
  email: z.string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required'),
  
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  
  suggestedName: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .optional(),
  
  relationship: z.nativeEnum(FamilyRelationshipType, {
    required_error: 'Please select a relationship'
  }),
  
  dateOfBirth: z.string()
    .min(1, 'Date of birth is required')
    .refine((date) => {
      const parsedDate = new Date(date);
      const now = new Date();
      return parsedDate <= now;
    }, 'Date of birth cannot be in the future')
    .refine((date) => {
      const parsedDate = new Date(date);
      const hundredYearsAgo = new Date();
      hundredYearsAgo.setFullYear(hundredYearsAgo.getFullYear() - 100);
      return parsedDate >= hundredYearsAgo;
    }, 'Date of birth cannot be more than 100 years ago'),
  
  personalMessage: z.string()
    .max(500, 'Personal message must be less than 500 characters')
    .optional(),
  
  notes: z.string()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional(),
  
  wantsAdminRole: z.boolean()
    .default(false)
});

/**
 * Schema for relationship context validation
 */
export const relationshipContextSchema = z.object({
  currentUserId: z.number()
    .positive('User ID must be positive'),
  
  currentUserRole: z.string()
    .min(1, 'User role is required'),
  
  isFamilyAdmin: z.boolean(),
  
  isGlobalAdmin: z.boolean(),
  
  familyId: z.number()
    .positive('Family ID must be positive')
    .optional(),
  
  mappingStrategy: z.enum(['self-relative', 'admin-relative', 'family-relative'])
});

/**
 * Schema for user context data validation
 */
export const userContextDataSchema = z.object({
  id: z.number()
    .positive('User ID must be positive'),
  
  globalRole: z.string()
    .min(1, 'Global role is required'),
  
  familyRole: z.string()
    .optional(),
  
  isFamilyAdmin: z.boolean()
    .optional(),
  
  relationshipToAdmin: z.nativeEnum(FamilyRelationshipType)
    .optional()
});

/**
 * Schema for relationship mapping validation
 */
export const smartRelationshipMappingSchema = z.object({
  relationshipLabel: z.string()
    .min(1, 'Relationship label is required'),
  
  relationshipDescription: z.string()
    .min(1, 'Relationship description is required'),
  
  contextualPrompt: z.string()
    .min(1, 'Contextual prompt is required'),
  
  mappingStrategy: z.enum(['self-relative', 'admin-relative', 'family-relative'])
});

/**
 * Type exports for use in components
 */
export type SmartRelationshipFormData = z.infer<typeof smartRelationshipFormSchema>;
export type RelationshipContextData = z.infer<typeof relationshipContextSchema>;
export type UserContextValidation = z.infer<typeof userContextDataSchema>;
export type SmartRelationshipMappingData = z.infer<typeof smartRelationshipMappingSchema>; 
