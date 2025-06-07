/*
 * Customer Support Schemas
 * Copyright (c) 2025 Carlos Abril Jr
 */

import { z } from 'zod';

// Schema for user search form
export const UserSearchSchema = z.object({
  searchTerm: z.string()
    .min(1, 'Search term is required')
    .max(100, 'Search term must be 100 characters or less'),
  searchType: z.enum(['email', 'username', 'id'])
});

// Schema for MFA disable form
export const MFADisableSchema = z.object({
  reason: z.string()
    .min(3, 'Reason must be at least 3 characters')
    .max(500, 'Reason must be 500 characters or less')
    .refine(val => val.trim().length > 0, 'Reason cannot be empty'),
  notifyUser: z.boolean()
});

// Schema for customer support action audit
export const CustomerSupportAuditSchema = z.object({
  action: z.enum(['user_search', 'mfa_disable', 'password_reset', 'account_unlock', 'view_account_info']),
  targetUserId: z.number().int().positive('User ID must be a positive integer'),
  reason: z.string().min(1, 'Reason is required').max(500, 'Reason must be 500 characters or less'),
  details: z.record(z.union([z.string(), z.number(), z.boolean()])).optional()
});

