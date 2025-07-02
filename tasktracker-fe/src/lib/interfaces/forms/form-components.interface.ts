/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 * 
 * Form Component Interfaces - Moved from lib/types/ui-components.ts for .cursorrules compliance
 * lib/interfaces/forms/form-components.interface.ts
 */

// ================================
// FORM CONTEXT INTERFACES
// ================================

export interface FormFieldContextValue<TName extends string = string> {
  name: TName;
}

export interface FormItemContextValue {
  id: string;
} 