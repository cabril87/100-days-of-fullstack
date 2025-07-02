/*
 * Form State Types
 * Copyright (c) 2025 Carlos Abril Jr
 * 
 * Form state management types following .cursorrules standards
 */

import { ValidationResult, ValidationError } from './form-validation';

// ================================
// FORM STATE TYPES
// ================================

export type FormStatus = 'idle' | 'validating' | 'submitting' | 'success' | 'error';

export interface FormState<T = any> {
  data: T;
  status: FormStatus;
  isValid: boolean;
  isDirty: boolean;
  isTouched: boolean;
  isSubmitting: boolean;
  errors: ValidationError[];
  touchedFields: Set<string>;
  dirtyFields: Set<string>;
  submitCount: number;
  lastSubmitTime: Date | null;
}

// ================================
// FIELD STATE TYPES
// ================================

export interface FieldState {
  value: any;
  isValid: boolean;
  isDirty: boolean;
  isTouched: boolean;
  isValidating: boolean;
  errors: ValidationError[];
  initialValue: any;
}

// ================================
// FIELD PROPS TYPE
// ================================

export interface FieldProps {
  name: string;
  value: any;
  onChange: (value: any) => void;
  onBlur: () => void;
  error?: string;
  disabled?: boolean;
}

// ================================
// FORM ACTIONS
// ================================

export type FormAction<T = any> = 
  | { type: 'SET_FIELD_VALUE'; field: string; value: any }
  | { type: 'SET_FIELD_TOUCHED'; field: string; touched: boolean }
  | { type: 'SET_FORM_DATA'; data: T }
  | { type: 'SET_ERRORS'; errors: ValidationError[] }
  | { type: 'SET_STATUS'; status: FormStatus }
  | { type: 'RESET_FORM'; initialData?: T }
  | { type: 'SUBMIT_START' }
  | { type: 'SUBMIT_SUCCESS' }
  | { type: 'SUBMIT_ERROR'; error: string };

// ================================
// FORM HOOKS TYPES
// ================================

export interface UseFormOptions<T = any> {
  initialData?: T;
  enableReinitialize?: boolean;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  validateOnMount?: boolean;
  resetOnSubmitSuccess?: boolean;
  persistForm?: boolean;
  persistKey?: string;
}

export interface UseFormReturn<T = any> {
  formState: FormState<T>;
  setFieldValue: (field: string, value: any) => void;
  setFieldTouched: (field: string, touched?: boolean) => void;
  setFormData: (data: T) => void;
  validateForm: () => Promise<ValidationResult>;
  validateField: (field: string) => Promise<ValidationResult>;
  resetForm: (data?: T) => void;
  submitForm: (onSubmit: (data: T) => Promise<void>) => Promise<void>;
  getFieldProps: (field: string) => FieldProps;
} 