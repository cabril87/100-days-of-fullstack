/*
 * Family Invitation Validation Schemas - React Hook Form + Zod
 * Copyright (c) 2025 Carlos Abril Jr
 */

import { z } from 'zod';

// Email validation regex (more comprehensive than default)
const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// Family invitation creation schema
export const invitationSchema = z.object({
  email: z
    .string({
      required_error: 'Email address is required'
    })
    .min(1, 'Email address cannot be empty')
    .email('Please enter a valid email address')
    .regex(emailRegex, 'Please enter a valid email address')
    .max(500, 'Email address cannot exceed 500 characters')
    .transform((email) => email.toLowerCase().trim()),
  
  roleId: z
    .number({
      required_error: 'Family role is required',
      invalid_type_error: 'Family role must be selected'
    })
    .positive('Please select a valid family role')
    .int('Role ID must be a valid number'),
  
  message: z
    .string()
    .max(1000, 'Personal message cannot exceed 1000 characters')
    .optional()
    .transform((msg) => msg?.trim() || undefined)
    .refine((msg) => {
      if (!msg) return true;
      return msg.length >= 5;
    }, {
      message: 'Personal message must be at least 5 characters if provided'
    })
});

// Family creation schema
export const familyCreateSchema = z.object({
  name: z
    .string({
      required_error: 'Family name is required'
    })
    .min(2, 'Family name must be at least 2 characters')
    .max(100, 'Family name cannot exceed 100 characters')
    .regex(/^[a-zA-Z0-9\s\-'\.]+$/, 'Family name can only contain letters, numbers, spaces, hyphens, apostrophes, and periods')
    .transform((name) => name.trim())
    .refine((name) => name.length >= 2, {
      message: 'Family name must be at least 2 characters after trimming'
    }),
  
  description: z
    .string()
    .max(500, 'Description cannot exceed 500 characters')
    .optional()
    .transform((desc) => desc?.trim() || undefined)
    .refine((desc) => {
      if (!desc) return true;
      return desc.length >= 10;
    }, {
      message: 'Description must be at least 10 characters if provided'
    })
});

// Family update schema (same as create but allows partial updates)
export const familyUpdateSchema = familyCreateSchema.partial();

// Invitation acceptance schema
export const invitationAcceptSchema = z.object({
  token: z
    .string({
      required_error: 'Invitation token is required'
    })
    .min(1, 'Invalid invitation token')
    .uuid('Invalid invitation token format')
});

// Family role creation schema
export const familyRoleSchema = z.object({
  name: z
    .string({
      required_error: 'Role name is required'
    })
    .min(2, 'Role name must be at least 2 characters')
    .max(50, 'Role name cannot exceed 50 characters')
    .regex(/^[a-zA-Z0-9\s\-]+$/, 'Role name can only contain letters, numbers, spaces, and hyphens')
    .transform((name) => name.trim()),
  
  description: z
    .string({
      required_error: 'Role description is required'
    })
    .min(10, 'Role description must be at least 10 characters')
    .max(500, 'Role description cannot exceed 500 characters')
    .transform((desc) => desc.trim())
});

// Family member role update schema
export const memberRoleUpdateSchema = z.object({
  memberId: z
    .number({
      required_error: 'Member ID is required',
      invalid_type_error: 'Member ID must be a number'
    })
    .positive('Member ID must be positive'),
  
  roleId: z
    .number({
      required_error: 'New role is required',
      invalid_type_error: 'Role ID must be a number'
    })
    .positive('Role ID must be positive')
});

// Bulk invitation schema
export const bulkInvitationSchema = z.object({
  emails: z
    .array(z.string().email('All email addresses must be valid'))
    .min(1, 'At least one email address is required')
    .max(20, 'Cannot send more than 20 invitations at once')
    .refine((emails) => {
      // Check for duplicates
      const uniqueEmails = new Set(emails.map(email => email.toLowerCase().trim()));
      return uniqueEmails.size === emails.length;
    }, {
      message: 'Duplicate email addresses are not allowed'
    }),
  
  roleId: z
    .number({
      required_error: 'Family role is required'
    })
    .positive('Please select a valid family role'),
  
  message: z
    .string()
    .max(1000, 'Personal message cannot exceed 1000 characters')
    .optional()
});

// Family search/filter schema
export const familySearchSchema = z.object({
  searchTerm: z
    .string()
    .max(100, 'Search term cannot exceed 100 characters')
    .optional()
    .transform((term) => term?.trim()),
  
  roleFilter: z
    .number()
    .positive()
    .optional(),
  
  statusFilter: z
    .enum(['active', 'inactive', 'pending'])
    .optional(),
  
  sortBy: z
    .enum(['name', 'joinedAt', 'role', 'lastActive'])
    .default('name'),
  
  sortOrder: z
    .enum(['asc', 'desc'])
    .default('asc'),
  
  page: z
    .number()
    .positive()
    .default(1),
  
  limit: z
    .number()
    .min(5, 'Minimum 5 items per page')
    .max(100, 'Maximum 100 items per page')
    .default(20)
});

// Resend invitation schema
export const resendInvitationSchema = z.object({
  invitationId: z
    .number({
      required_error: 'Invitation ID is required'
    })
    .positive('Invalid invitation ID'),
  
  newMessage: z
    .string()
    .max(1000, 'Message cannot exceed 1000 characters')
    .optional()
});

// Transfer ownership schema (Pass the Baton)
export const transferOwnershipSchema = z.object({
  newOwnerId: z
    .number({
      required_error: 'New owner must be selected',
      invalid_type_error: 'New owner ID must be a number'
    })
    .positive('Please select a valid family member'),
  
  reason: z
    .string()
    .max(500, 'Reason cannot exceed 500 characters')
    .optional()
    .transform((reason) => reason?.trim() || undefined)
    .refine((reason) => {
      if (!reason) return true;
      return reason.length >= 10;
    }, {
      message: 'Reason must be at least 10 characters if provided'
    }),
  
  confirmTransfer: z
    .boolean({
      required_error: 'You must confirm the ownership transfer'
    })
    .refine((val) => val === true, {
      message: 'You must confirm the ownership transfer by checking this box'
    })
});

// Family privacy settings schema
export const familyPrivacySchema = z.object({
  allowPublicDiscovery: z.boolean().default(false),
  requireInviteApproval: z.boolean().default(true),
  allowMemberInvites: z.boolean().default(false),
  shareProgressPublicly: z.boolean().default(false),
  allowCrossMatchFamily: z.boolean().default(false)
});

// Export types inferred from schemas
export type InvitationFormData = z.infer<typeof invitationSchema>;
export type FamilyCreateFormData = z.infer<typeof familyCreateSchema>;
export type FamilyUpdateFormData = z.infer<typeof familyUpdateSchema>;
export type InvitationAcceptFormData = z.infer<typeof invitationAcceptSchema>;
export type FamilyRoleFormData = z.infer<typeof familyRoleSchema>;
export type MemberRoleUpdateFormData = z.infer<typeof memberRoleUpdateSchema>;
export type BulkInvitationFormData = z.infer<typeof bulkInvitationSchema>;
export type FamilySearchFormData = z.infer<typeof familySearchSchema>;
export type ResendInvitationFormData = z.infer<typeof resendInvitationSchema>;
export type TransferOwnershipFormData = z.infer<typeof transferOwnershipSchema>;
export type FamilyPrivacyFormData = z.infer<typeof familyPrivacySchema>; 