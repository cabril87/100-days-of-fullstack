import { z } from 'zod';
import { FamilyMemberAgeGroup } from '../types/auth';

export const loginSchema = z.object({
  emailOrUsername: z
    .string()
    .min(1, 'Email or username is required')
    .max(100, 'Email or username cannot exceed 100 characters'),
  password: z
    .string()
    .min(1, 'Password is required')
    .max(100, 'Password cannot exceed 100 characters'),
});

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username cannot exceed 50 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z
    .string()
    .email('Please enter a valid email address')
    .max(100, 'Email cannot exceed 100 characters'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password cannot exceed 100 characters'),
  confirmPassword: z.string(),
  firstName: z
    .string()
    .max(50, 'First name cannot exceed 50 characters'),
  lastName: z
    .string()
    .max(50, 'Last name cannot exceed 50 characters'),
  ageGroup: z.nativeEnum(FamilyMemberAgeGroup),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const profileUpdateSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username cannot exceed 50 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z
    .string()
    .email('Please enter a valid email address')
    .max(100, 'Email cannot exceed 100 characters'),
  firstName: z
    .string()
    .max(50, 'First name cannot exceed 50 characters')
    .optional()
    .or(z.literal('')),
  lastName: z
    .string()
    .max(50, 'Last name cannot exceed 50 characters')
    .optional()
    .or(z.literal('')),
  bio: z
    .string()
    .max(500, 'Bio cannot exceed 500 characters')
    .optional()
    .or(z.literal('')),
});

export const passwordChangeSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(6, 'New password must be at least 6 characters')
    .max(100, 'New password cannot exceed 100 characters'),
  confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "New passwords don't match",
  path: ["confirmNewPassword"],
});

export const passwordResetSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address')
    .max(100, 'Email cannot exceed 100 characters'),
});

// === MFA SCHEMAS ===

export const mfaSetupCompleteSchema = z.object({
  code: z.string()
    .min(6, 'Code must be exactly 6 digits')
    .max(6, 'Code must be exactly 6 digits')
    .regex(/^\d{6}$/, 'Code must be exactly 6 digits')
});

export const mfaVerificationSchema = z.object({
  code: z.string()
    .min(6, 'Code must be exactly 6 digits')
    .max(6, 'Code must be exactly 6 digits')
    .regex(/^\d{6}$/, 'Code must be exactly 6 digits')
});

export const mfaDisableSchema = z.object({
  password: z.string().min(1, 'Password is required'),
  code: z.string()
    .min(6, 'Code must be exactly 6 digits')
    .max(6, 'Code must be exactly 6 digits')
    .regex(/^\d{6}$/, 'Code must be exactly 6 digits')
    .optional()
});

export const mfaBackupCodeSchema = z.object({
  code: z.string()
    .min(8, 'Backup code must be exactly 8 characters')
    .max(8, 'Backup code must be exactly 8 characters')
    .regex(/^[A-Z0-9]{8}$/, 'Backup code must be 8 uppercase letters or numbers')
});

// MFA Form Data Types (derived from schemas)
export type MFASetupCompleteFormData = z.infer<typeof mfaSetupCompleteSchema>;
export type MFAVerificationFormData = z.infer<typeof mfaVerificationSchema>;
export type MFADisableFormData = z.infer<typeof mfaDisableSchema>;
export type MFABackupCodeFormData = z.infer<typeof mfaBackupCodeSchema>; 