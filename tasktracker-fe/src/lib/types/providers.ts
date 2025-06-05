/*
 * Provider & Context Types
 * Copyright (c) 2025 Carlos Abril Jr
 */

import { ReactNode } from 'react';

// Theme Provider Types
export interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: string;
  storageKey?: string;
}

// Sidebar Context Types
export interface SidebarContextType {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
  open: () => void;
}

export interface SidebarProviderProps {
  children: ReactNode;
}

// Auth Provider Props (AuthContextType and AuthAction are in auth.ts)
export interface AuthProviderProps {
  children: ReactNode;
} 