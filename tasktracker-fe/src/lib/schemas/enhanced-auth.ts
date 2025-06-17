import { z } from 'zod';

// === ENHANCED PASSWORD RESET SCHEMAS ===

export const enhancedPasswordResetRequestSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address')
    .max(100, 'Email cannot exceed 100 characters'),
  securityQuestion: z
    .string()
    .max(200, 'Security question cannot exceed 200 characters')
    .optional(),
  securityAnswer: z
    .string()
    .max(100, 'Security answer cannot exceed 100 characters')
    .optional(),
  useAlternateMethod: z.boolean().default(false),
  captchaToken: z.string().optional(),
});

export const passwordStrengthSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password cannot exceed 128 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
           'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const securityQuestionSchema = z.object({
  question1: z
    .string()
    .min(10, 'Security question must be at least 10 characters')
    .max(200, 'Security question cannot exceed 200 characters'),
  answer1: z
    .string()
    .min(3, 'Security answer must be at least 3 characters')
    .max(100, 'Security answer cannot exceed 100 characters'),
  question2: z
    .string()
    .min(10, 'Security question must be at least 10 characters')
    .max(200, 'Security question cannot exceed 200 characters'),
  answer2: z
    .string()
    .min(3, 'Security answer must be at least 3 characters')
    .max(100, 'Security answer cannot exceed 100 characters'),
  question3: z
    .string()
    .min(10, 'Security question must be at least 10 characters')
    .max(200, 'Security question cannot exceed 200 characters'),
  answer3: z
    .string()
    .min(3, 'Security answer must be at least 3 characters')
    .max(100, 'Security answer cannot exceed 100 characters'),
});

// === SESSION MANAGEMENT SCHEMAS ===

export const deviceTrustSchema = z.object({
  deviceId: z.string().min(1, 'Device ID is required'),
  trusted: z.boolean(),
  trustDuration: z.enum(['session', '30days', '90days', 'permanent']).default('session'),
  deviceName: z
    .string()
    .max(50, 'Device name cannot exceed 50 characters')
    .optional(),
});

export const sessionTerminateSchema = z.object({
  sessionId: z.number().positive('Session ID must be a positive number'),
  reason: z
    .string()
    .max(200, 'Reason cannot exceed 200 characters')
    .optional(),
});

export const securitySettingsSchema = z.object({
  mfaEnabled: z.boolean().optional(),
  sessionTimeoutMinutes: z
    .number()
    .min(5, 'Session timeout must be at least 5 minutes')
    .max(1440, 'Session timeout cannot exceed 24 hours')
    .optional(),
  trustedDevicesEnabled: z.boolean().optional(),
  loginNotificationsEnabled: z.boolean().optional(),
  requireMfaForSensitiveActions: z.boolean().optional(),
  allowConcurrentSessions: z.boolean().optional(),
  maxConcurrentSessions: z
    .number()
    .min(1, 'Must allow at least 1 concurrent session')
    .max(10, 'Cannot exceed 10 concurrent sessions')
    .optional(),
});

// === ACCOUNT LOCKOUT SCHEMAS ===

export const unlockRequestSchema = z.object({
  method: z.enum(['email_verification', 'admin_approval', 'security_questions', 'time_based']),
  securityAnswers: z
    .array(z.string().max(100, 'Security answer cannot exceed 100 characters'))
    .optional(),
  adminRequestReason: z
    .string()
    .max(500, 'Reason cannot exceed 500 characters')
    .optional(),
  contactInfo: z
    .string()
    .max(100, 'Contact info cannot exceed 100 characters')
    .optional(),
});

// === ENHANCED LOGIN SCHEMAS ===

export const enhancedLoginSchema = z.object({
  emailOrUsername: z
    .string()
    .min(1, 'Email or username is required')
    .max(100, 'Email or username cannot exceed 100 characters'),
  password: z
    .string()
    .min(1, 'Password is required')
    .max(100, 'Password cannot exceed 100 characters'),
  rememberDevice: z.boolean().default(false),
  trustDevice: z.boolean().default(false),
  captchaToken: z.string().optional(),
  deviceFingerprint: z.string().optional(),
});

export const deviceRecognitionSchema = z.object({
  deviceFingerprint: z.string().min(1, 'Device fingerprint is required'),
  deviceInfo: z.object({
    userAgent: z.string(),
    screenResolution: z.string(),
    timezone: z.string(),
    language: z.string(),
    platform: z.string(),
  }),
  locationInfo: z.object({
    ipAddress: z.string(),
    city: z.string().optional(),
    country: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }).optional(),
});

// === PERMISSION MATRIX SCHEMAS ===

export const permissionChangeSchema = z.object({
  permission: z.string().min(1, 'Permission name is required'),
  action: z.enum(['grant', 'revoke', 'modify']),
  reason: z
    .string()
    .min(10, 'Reason must be at least 10 characters')
    .max(200, 'Reason cannot exceed 200 characters'),
  expiresAt: z.string().datetime().optional(),
  requiresApproval: z.boolean().default(false),
});

export const bulkPermissionChangeSchema = z.object({
  changes: z.array(permissionChangeSchema).min(1, 'At least one permission change is required'),
  applyToAllFamilies: z.boolean().default(false),
  skipConflicts: z.boolean().default(false),
  reason: z
    .string()
    .min(10, 'Overall reason must be at least 10 characters')
    .max(500, 'Reason cannot exceed 500 characters'),
});

// === VALIDATION HELPERS ===

export const validatePasswordStrength = (password: string) => {
  const requirements = [
    { rule: 'min_length', met: password.length >= 8, description: 'At least 8 characters' },
    { rule: 'max_length', met: password.length <= 128, description: 'No more than 128 characters' },
    { rule: 'uppercase', met: /[A-Z]/.test(password), description: 'At least one uppercase letter' },
    { rule: 'lowercase', met: /[a-z]/.test(password), description: 'At least one lowercase letter' },
    { rule: 'number', met: /\d/.test(password), description: 'At least one number' },
    { rule: 'special', met: /[@$!%*?&]/.test(password), description: 'At least one special character' },
    { rule: 'no_common', met: !isCommonPassword(password), description: 'Not a commonly used password' },
    { rule: 'no_personal', met: !containsPersonalInfo(password), description: 'Does not contain personal information' },
  ];

  const metRequirements = requirements.filter(req => req.met);
  const score = Math.round((metRequirements.length / requirements.length) * 100);
  
  let level: 'weak' | 'fair' | 'good' | 'strong' | 'excellent';
  if (score < 40) level = 'weak';
  else if (score < 60) level = 'fair';
  else if (score < 80) level = 'good';
  else if (score < 95) level = 'strong';
  else level = 'excellent';

  const suggestions = requirements
    .filter(req => !req.met)
    .map(req => req.description);

  return {
    score,
    level,
    suggestions,
    requirements,
  };
};

const isCommonPassword = (password: string): boolean => {
  const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
    'admin', 'letmein', 'welcome', 'monkey', '1234567890'
  ];
  return commonPasswords.includes(password.toLowerCase());
};

const containsPersonalInfo = (password: string): boolean => {
  // This would typically check against user's personal information
  // For now, we'll check for common personal info patterns
  const personalPatterns = [
    /birthday/i,
    /name/i,
    /family/i,
    /username/i,
    /email/i,
  ];
  return personalPatterns.some(pattern => pattern.test(password));
};

// === COMPONENT FORM SCHEMAS ===

export const loginFormSchema = z.object({
  emailOrUsername: z.string().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required'),
  rememberDevice: z.boolean(),
  trustDevice: z.boolean(),
  captchaToken: z.string().optional(),
  deviceFingerprint: z.string().optional(),
});

export const passwordResetRequestSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  securityQuestion: z.string().optional(),
  securityAnswer: z.string().optional(),
  useAlternateMethod: z.boolean(),
});

export const securityQuestionsSchema = z.object({
  question1: z.string().min(1, 'Please select a security question'),
  answer1: z.string().min(3, 'Answer must be at least 3 characters'),
  question2: z.string().min(1, 'Please select a security question'),
  answer2: z.string().min(3, 'Answer must be at least 3 characters'),
  question3: z.string().min(1, 'Please select a security question'),
  answer3: z.string().min(3, 'Answer must be at least 3 characters'),
});

export const newPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const mfaSetupSchema = z.object({
  method: z.enum(['email', 'sms', 'app', 'hardware']),
  phoneNumber: z.string().optional(),
  backupCodes: z.array(z.string()).optional(),
});

// === DERIVED TYPES ===

export type LoginFormData = z.infer<typeof loginFormSchema>;
export type PasswordResetRequestFormData = z.infer<typeof passwordResetRequestSchema>;
export type SecurityQuestionsFormData = z.infer<typeof securityQuestionsSchema>;
export type NewPasswordFormData = z.infer<typeof newPasswordSchema>;
export type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>;
export type MfaSetupFormData = z.infer<typeof mfaSetupSchema>;
export type EnhancedPasswordResetRequestFormData = z.infer<typeof enhancedPasswordResetRequestSchema>;
export type PasswordStrengthFormData = z.infer<typeof passwordStrengthSchema>;
export type SecurityQuestionFormData = z.infer<typeof securityQuestionSchema>;
export type DeviceTrustFormData = z.infer<typeof deviceTrustSchema>;
export type SessionTerminateFormData = z.infer<typeof sessionTerminateSchema>;
export type SecuritySettingsFormData = z.infer<typeof securitySettingsSchema>;
export type UnlockRequestFormData = z.infer<typeof unlockRequestSchema>;
export type EnhancedLoginFormData = z.infer<typeof enhancedLoginSchema>;
export type DeviceRecognitionFormData = z.infer<typeof deviceRecognitionSchema>;
export type PermissionChangeFormData = z.infer<typeof permissionChangeSchema>;
export type BulkPermissionChangeFormData = z.infer<typeof bulkPermissionChangeSchema>; 