/*
 * Form Types & Validation Schemas
 * Copyright (c) 2025 Carlos Abril Jr
 */

import { z } from 'zod';
import { 
  appearanceSettingsSchema,
  notificationPreferencesSchema 
} from '../schemas/settings';
import { profileUpdateSchema } from '../schemas/auth';

// Form data types derived from schemas
export type AppearanceFormData = z.infer<typeof appearanceSettingsSchema>;
export type NotificationPreferencesFormData = z.infer<typeof notificationPreferencesSchema>;
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;

// Password Reset Form (separate from auth.ts PasswordResetRequestDTO)
export interface PasswordResetFormData {
  email: string;
}

// Form Field Context Types (for custom form components)
export type FormFieldContextValue<
  TName extends string = string
> = {
  name: TName;
};

export type FormItemContextValue = {
  id: string;
};

// Chart Context Types
export type ChartContextProps = {
  config: Record<string, {
    label?: React.ReactNode;
    color?: string;
  }>;
}; 