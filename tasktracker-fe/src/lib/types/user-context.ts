/*
 * User Context Types - Enterprise Context Management
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 */

import { User } from './auth';
import { FamilyDTO, FamilyMemberDTO } from './family-invitation';

// User Context Value extending AuthProvider functionality
export interface UserContextValue {
  // User state (from AuthProvider)
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Family state (extended functionality)
  selectedFamily: FamilyDTO | null;
  families: FamilyDTO[];
  familyMembers: FamilyMemberDTO[];
  
  // Actions
  setSelectedFamily: (family: FamilyDTO | null) => void;
  setFamilies: (families: FamilyDTO[]) => void;
  setFamilyMembers: (members: FamilyMemberDTO[]) => void;
  
  // Computed properties
  isAdmin: boolean;
  isFamilyAdmin: boolean;
  isGlobalAdmin: boolean;
  currentFamilyRole: string | null;
  hasMultipleFamilies: boolean;
}

// Provider Props
export interface UserContextProviderProps {
  children: React.ReactNode;
}

// Hook Options
export interface UseUserOptions {
  requireAuth?: boolean;
  requireFamily?: boolean;
  requireAdmin?: boolean;
}

// Family Selection Context
export interface FamilySelectionState {
  selectedFamilyId: number | null;
  availableFamilies: FamilyDTO[];
  isLoading: boolean;
  error: string | null;
}

// Extended User for UI components
export interface ExtendedUser extends User {
  currentFamilyId?: number;
  currentFamilyRole?: string;
  familyPermissions?: string[];
} 