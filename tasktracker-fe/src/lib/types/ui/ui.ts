/*
 * UI Core Types
 * Copyright (c) 2025 Carlos Abril Jr
 * 
 * Core UI-related types following .cursorrules standards
 */

// ================================
// CORE UI TYPES
// ================================

export type UISize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type UIVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';

export type UIState = 'idle' | 'loading' | 'success' | 'error' | 'disabled';

// ================================
// LAYOUT TYPES
// ================================

export type LayoutDirection = 'horizontal' | 'vertical';

export type LayoutAlignment = 'start' | 'center' | 'end' | 'stretch';

export type LayoutJustification = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';

// ================================
// SPACING TYPES
// ================================

export type SpacingSize = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export type PaddingSize = SpacingSize;

export type MarginSize = SpacingSize;

// ================================
// COLOR TYPES
// ================================

export type ColorScheme = 'light' | 'dark' | 'auto';

export type ThemeColor = 
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'neutral'
  | 'muted';

// ================================
// ANIMATION TYPES
// ================================

export type AnimationType = 
  | 'none'
  | 'fade'
  | 'slide'
  | 'scale'
  | 'rotate'
  | 'bounce'
  | 'pulse'
  | 'shake';

export type AnimationDuration = 'fast' | 'normal' | 'slow';

export type AnimationEasing = 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';

// ================================
// INTERACTION TYPES
// ================================

export type InteractionState = 'normal' | 'hover' | 'active' | 'focus' | 'disabled';

export type CursorType = 
  | 'auto'
  | 'pointer'
  | 'text'
  | 'move'
  | 'grab'
  | 'grabbing'
  | 'not-allowed'
  | 'help';

// ================================
// RESPONSIVE TYPES
// ================================

export type Breakpoint = 'mobile' | 'tablet' | 'desktop' | 'wide';

export type ResponsiveValue<T> = T | Partial<Record<Breakpoint, T>>;

// ================================
// ACCESSIBILITY TYPES
// ================================

export type AriaRole = 
  | 'button'
  | 'link'
  | 'menuitem'
  | 'tab'
  | 'tabpanel'
  | 'dialog'
  | 'alert'
  | 'status'
  | 'region'
  | 'navigation';

export type AriaLive = 'off' | 'polite' | 'assertive';

// ================================
// FORM TYPES
// ================================

export type InputType = 
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'url'
  | 'search'
  | 'date'
  | 'time'
  | 'datetime-local';

export type ValidationState = 'valid' | 'invalid' | 'pending';

// ================================
// LOADING TYPES
// ================================

export type LoadingType = 'spinner' | 'skeleton' | 'pulse' | 'dots' | 'bars';

export type LoadingPosition = 'center' | 'inline' | 'overlay'; 