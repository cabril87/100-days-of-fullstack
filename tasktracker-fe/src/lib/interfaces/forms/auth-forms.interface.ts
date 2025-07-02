/*
 * Enhanced Authentication Form Interfaces
 * Copyright (c) 2025 Carlos Abril Jr
 * 
 * CURSORRULES COMPLIANT: All auth form interfaces extracted from lib/types/
 */

import { PasswordRequirement } from '../auth/enhanced-auth.interface';

// === ENHANCED AUTH FORM DATA INTERFACES ===

export interface EnhancedPasswordResetFormData {
  email: string;
  securityQuestion?: string;
  securityAnswer?: string;
  useAlternateMethod: boolean;
}

export interface PasswordStrengthFormData {
  password: string;
  requirements: PasswordRequirement[];
  suggestions: string[];
}

export interface DeviceTrustFormData {
  deviceId: string;
  trusted: boolean;
  trustDuration: 'session' | '30days' | '90days' | 'permanent';
  deviceName?: string;
}

export interface SecurityQuestionFormData {
  question1: string;
  answer1: string;
  question2: string;
  answer2: string;
  question3: string;
  answer3: string;
} 