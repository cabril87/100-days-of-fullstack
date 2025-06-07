/*
 * Component Props Type Definitions
 * Copyright (c) 2025 Carlos Abril Jr
 * 
 * All component prop interfaces following Family Auth Implementation Checklist
 * Centralized component interface definitions for consistent typing
 */

import { User } from './auth';

// Page Content Component Props
export interface FamiliesContentProps {
  user: User;
}

export interface GamificationContentProps {
  user: User;
}

export interface FamilySeedingPageContentProps {
  user: User | null;
}

export interface UserCreationPageContentProps {
  user: User | null;
} 