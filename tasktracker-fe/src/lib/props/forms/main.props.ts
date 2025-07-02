/*
 * Main Form Component Props
 * Copyright (c) 2025 Carlos Abril Jr
 * 
 * All form component prop interfaces following .cursorrules standards
 * Extracted from lib/types/ and properly organized in lib/props/
 */

import { ReactNode } from 'react';

// ================================
// BASE FORM PROPS
// ================================

export interface FormFieldProps {
  name: string;
  label?: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
}

export interface FormInputProps extends FormFieldProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  showPasswordToggle?: boolean;
}

export interface FormTextareaProps extends FormFieldProps {
  rows?: number;
  maxLength?: number;
  showCharacterCount?: boolean;
  resizable?: boolean;
}

export interface FormSelectProps extends FormFieldProps {
  options: Array<{ value: string; label: string; description?: string }>;
  multiple?: boolean;
  searchable?: boolean;
}

export interface FormCheckboxProps extends FormFieldProps {
  checked?: boolean;
  indeterminate?: boolean;
}

// ================================
// FORM STEP & WIZARD PROPS
// ================================

export interface FormStep {
  id: string;
  title: string;
  description?: string;
  fields: ReactNode;
  validation?: () => boolean;
}

export interface ProgressiveFormProps {
  steps: FormStep[];
  onComplete: (data: Record<string, unknown>) => void;
  className?: string;
}

// ================================
// FORM DATA TYPES
// ================================

export interface EditBoardFormData {
  name: string;
  description?: string;
  isPublic: boolean;
  templateId?: number;
}

export interface ColumnEditFormData {
  id?: number;
  name: string;
  color: string;
  order: number;
}

export interface CreateTaskFormData {
  title: string;
  description?: string;
  dueDate?: Date;
  priority?: number;
  assigneeId?: number;
  tags?: string[];
  columnId: number;
  boardId: number;
}

export interface CreateCustomBoardFormData {
  name: string;
  description?: string;
  isPublic: boolean;
  columns: Array<{
    id: string;
    name: string;
    color: string;
    order: number;
    isDefault: boolean;
  }>;
}

// ================================
// FORM CONTEXT TYPES
// ================================

export interface FormFieldContextValue<
  TFieldValues extends Record<string, unknown> = Record<string, unknown>,
  TName extends keyof TFieldValues = keyof TFieldValues
> {
  name: TName;
}

export interface FormItemContextValue {
  id: string;
}

// ================================
// CHART CONTEXT (Form Related)
// ================================

export interface ChartContextProps {
  config: Record<string, unknown>;
}

// ================================
// MFA SETUP TYPES
// ================================

export type SetupStep = 'instructions' | 'qr-code' | 'verification' | 'backup-codes' | 'complete'; 