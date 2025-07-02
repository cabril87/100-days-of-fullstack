/*
 * Authentication Helper Functions
 * Utility functions for authentication and authorization
 * Following .cursorrules compliance standards
 */

import { FamilyMemberAgeGroup } from '@/lib/types/auth';

// ================================
// PERMISSION HELPERS
// ================================

/**
 * Checks if user has required age group
 */
export const hasRequiredAgeGroup = (
  userAgeGroup: FamilyMemberAgeGroup,
  requiredAgeGroup: FamilyMemberAgeGroup
): boolean => {
  const ageGroupHierarchy: Record<FamilyMemberAgeGroup, number> = {
    [FamilyMemberAgeGroup.Child]: 1,
    [FamilyMemberAgeGroup.Teen]: 2,
    [FamilyMemberAgeGroup.Adult]: 3
  };

  return ageGroupHierarchy[userAgeGroup] >= ageGroupHierarchy[requiredAgeGroup];
};

/**
 * Checks if user has required role
 */
export const hasRequiredRole = (
  userRole: string | undefined,
  requiredRole: string
): boolean => {
  if (!userRole) return false;

  const roleHierarchy: Record<string, number> = {
    'member': 1,
    'moderator': 2,
    'admin': 3,
    'owner': 4
  };

  const userLevel = roleHierarchy[userRole.toLowerCase()] || 0;
  const requiredLevel = roleHierarchy[requiredRole.toLowerCase()] || 0;

  return userLevel >= requiredLevel;
};

/**
 * Gets user permissions based on age group and role
 */
export const getUserPermissions = (
  ageGroup: FamilyMemberAgeGroup,
  role?: string
): {
  canCreateTasks: boolean;
  canDeleteTasks: boolean;
  canManageFamily: boolean;
  canInviteMembers: boolean;
  canModifySettings: boolean;
  canAccessAnalytics: boolean;
  canApproveRequests: boolean;
} => {
  const isAdult = ageGroup === FamilyMemberAgeGroup.Adult;
  const isAdmin = hasRequiredRole(role, 'admin');
  const isModerator = hasRequiredRole(role, 'moderator');

  return {
    canCreateTasks: true, // All age groups can create tasks
    canDeleteTasks: isAdult || isAdmin,
    canManageFamily: isAdult && (isAdmin || isModerator),
    canInviteMembers: isAdult || isModerator,
    canModifySettings: isAdult || isAdmin,
    canAccessAnalytics: isAdult || ageGroup === FamilyMemberAgeGroup.Teen,
    canApproveRequests: isAdult || isModerator
  };
};

// ================================
// SESSION HELPERS
// ================================

/**
 * Checks if session is expired
 */
export const isSessionExpired = (expiresAt?: Date | string): boolean => {
  if (!expiresAt) return true;
  
  const expiry = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt;
  return expiry <= new Date();
};

/**
 * Gets time until session expires
 */
export const getTimeUntilExpiry = (expiresAt?: Date | string): number => {
  if (!expiresAt) return 0;
  
  const expiry = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt;
  const now = new Date();
  
  return Math.max(0, expiry.getTime() - now.getTime());
};

/**
 * Formats session duration for display
 */
export const formatSessionDuration = (milliseconds: number): string => {
  const minutes = Math.floor(milliseconds / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  return 'Less than a minute';
};

// ================================
// VALIDATION HELPERS
// ================================

/**
 * Validates email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates password strength
 */
export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  score: number; // 0-100
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 0;

  // Length check
  if (password.length >= 8) {
    score += 25;
  } else {
    feedback.push('Password must be at least 8 characters long');
  }

  // Uppercase check
  if (/[A-Z]/.test(password)) {
    score += 20;
  } else {
    feedback.push('Include at least one uppercase letter');
  }

  // Lowercase check
  if (/[a-z]/.test(password)) {
    score += 20;
  } else {
    feedback.push('Include at least one lowercase letter');
  }

  // Number check
  if (/\d/.test(password)) {
    score += 20;
  } else {
    feedback.push('Include at least one number');
  }

  // Special character check
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 15;
  } else {
    feedback.push('Include at least one special character');
  }

  return {
    isValid: score >= 80,
    score,
    feedback
  };
};

/**
 * Validates username format
 */
export const isValidUsername = (username: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (!username) {
    errors.push('Username is required');
    return { isValid: false, errors };
  }

  if (username.length < 3) {
    errors.push('Username must be at least 3 characters long');
  }

  if (username.length > 20) {
    errors.push('Username must be less than 20 characters long');
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    errors.push('Username can only contain letters, numbers, underscores, and hyphens');
  }

  if (/^[0-9]/.test(username)) {
    errors.push('Username cannot start with a number');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// ================================
// SECURITY HELPERS
// ================================

/**
 * Generates a secure random string
 */
export const generateSecureToken = (length: number = 32): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
};

/**
 * Sanitizes user input to prevent XSS
 */
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Checks if IP address is in allowed range (basic example)
 */
export const isAllowedIP = (
  ip: string, 
  allowedRanges: string[] = []
): boolean => {
  if (allowedRanges.length === 0) return true;
  
  // Basic implementation - in production, use proper IP range checking
  return allowedRanges.some(range => ip.startsWith(range));
};

// ================================
// MFA HELPERS
// ================================

/**
 * Generates MFA backup codes
 */
export const generateBackupCodes = (count: number = 8): string[] => {
  const codes: string[] = [];
  
  for (let i = 0; i < count; i++) {
    // Generate 8-digit backup code
    const code = Math.floor(10000000 + Math.random() * 90000000).toString();
    codes.push(code);
  }
  
  return codes;
};

/**
 * Validates MFA code format
 */
export const isValidMFACode = (code: string): boolean => {
  // Remove spaces and hyphens
  const cleanCode = code.replace(/[\s-]/g, '');
  
  // Check if it's 6 digits (TOTP) or 8 digits (backup)
  return /^\d{6}$/.test(cleanCode) || /^\d{8}$/.test(cleanCode);
}; 