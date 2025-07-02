/*
 * Form Validation Types
 * Copyright (c) 2025 Carlos Abril Jr
 * 
 * Form validation-related types following .cursorrules standards
 */

// ================================
// VALIDATION RESULT TYPES
// ================================

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  severity: 'error' | 'warning';
}

export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
}

// ================================
// VALIDATION RULE TYPES
// ================================

export type ValidationType = 
  | 'required'
  | 'email'
  | 'password'
  | 'min'
  | 'max'
  | 'minLength'
  | 'maxLength'
  | 'pattern'
  | 'custom';

export interface ValidationRule {
  type: ValidationType;
  value?: any;
  message: string;
  when?: (formData: any) => boolean;
}

// ================================
// FIELD VALIDATION TYPES
// ================================

export interface FieldValidation {
  field: string;
  rules: ValidationRule[];
  validateOnBlur?: boolean;
  validateOnChange?: boolean;
  debounceMs?: number;
}

// ================================
// FORM VALIDATION CONFIG
// ================================

export interface FormValidationConfig {
  fields: FieldValidation[];
  validateOnSubmit: boolean;
  validateOnChange: boolean;
  validateOnBlur: boolean;
  stopOnFirstError: boolean;
  showWarnings: boolean;
} 