/*
 * Extended User Hook with Family Management
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/lib/providers/AuthProvider';
import { familyInvitationService } from '@/lib/services/familyInvitationService';
import { UserContextValue, UseUserOptions } from '@/lib/types/user-context';
import { FamilyDTO, FamilyMemberDTO } from '@/lib/types/family-invitation';

/**
 * Enhanced user hook that extends AuthProvider with family management
 * This eliminates the need for a separate UserProvider while maintaining all functionality
 */
export function useUserWithFamily(options: UseUserOptions = {}): UserContextValue {
  const { requireAuth = false, requireFamily = false, requireAdmin = false } = options;
  
  // Base auth state from AuthProvider
  const auth = useAuth();
  
  // Extended family state
  const [selectedFamily, setSelectedFamily] = useState<FamilyDTO | null>(null);
  const [families, setFamilies] = useState<FamilyDTO[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMemberDTO[]>([]);
  const [familyLoading, setFamilyLoading] = useState(false);

  // Stable callback for loading user families
  const loadUserFamilies = useCallback(async () => {
    if (!auth.user) return;
    
    setFamilyLoading(true);
    try {
      const userFamilies = await familyInvitationService.getAllFamilies();
      setFamilies(userFamilies);
      
      // Auto-select first family if none selected and families available
      setSelectedFamily(prev => {
        if (!prev && userFamilies.length > 0) {
          return userFamilies[0];
        }
        return prev;
      });
    } catch (error) {
      console.error('Failed to load user families:', error);
      setFamilies([]);
    } finally {
      setFamilyLoading(false);
    }
  }, [auth.user]);

  // Stable callback for loading family members
  const loadFamilyMembers = useCallback(async (familyId: number) => {
    try {
      const members = await familyInvitationService.getFamilyMembers(familyId);
      setFamilyMembers(members);
    } catch (error) {
      console.error('Failed to load family members:', error);
      setFamilyMembers([]);
    }
  }, []);

  // Load user's families when authenticated
  useEffect(() => {
    if (auth.isAuthenticated && auth.user) {
      loadUserFamilies();
    } else {
      // Clear family data when not authenticated
      setSelectedFamily(null);
      setFamilies([]);
      setFamilyMembers([]);
    }
  }, [auth.isAuthenticated, auth.user, loadUserFamilies]);

  // Load family members when selectedFamily changes
  useEffect(() => {
    if (selectedFamily) {
      loadFamilyMembers(selectedFamily.id);
    } else {
      setFamilyMembers([]);
    }
  }, [selectedFamily, loadFamilyMembers]);

  // Computed properties
  const isLoading = auth.isLoading || familyLoading;
  const isAdmin = auth.user?.role === 'Admin' || auth.user?.role === 'GlobalAdmin';
  const isFamilyAdmin = Boolean(auth.user?.isFamilyAdmin);
  const isGlobalAdmin = auth.user?.role === 'GlobalAdmin';
  
  const currentFamilyRole = useMemo(() => {
    if (!selectedFamily || !auth.user || !familyMembers.length) return null;
    
    const memberData = familyMembers.find(member => member.userId === auth.user!.id);
    return memberData?.role?.name || null;
  }, [selectedFamily, auth.user, familyMembers]);

  const hasMultipleFamilies = families.length > 1;

  // Validation based on options
  useEffect(() => {
    if (requireAuth && !auth.isAuthenticated) {
      throw new Error('Authentication required');
    }
    if (requireFamily && !selectedFamily) {
      throw new Error('Family selection required');
    }
    if (requireAdmin && !isAdmin) {
      throw new Error('Admin privileges required');
    }
  }, [requireAuth, requireFamily, requireAdmin, auth.isAuthenticated, selectedFamily, isAdmin]);

  return {
    // Auth state
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    isLoading,
    
    // Family state
    selectedFamily,
    families,
    familyMembers,
    
    // Actions
    setSelectedFamily,
    setFamilies,
    setFamilyMembers,
    
    // Computed properties
    isAdmin,
    isFamilyAdmin,
    isGlobalAdmin,
    currentFamilyRole,
    hasMultipleFamilies
  };
}

// Backward compatibility alias
export const useUser = useUserWithFamily; 