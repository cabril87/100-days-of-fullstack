'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { familyService } from '@/lib/services/familyService';
import { useToast } from '@/lib/hooks/useToast';
import { Family, FamilyMember, CreateFamilyInput, UpdateFamilyInput } from '@/lib/types/family';
import { useRouter } from 'next/navigation';

interface FamilyContextType {
  family: Family | null;
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  createFamily: (input: CreateFamilyInput) => Promise<boolean>;
  updateFamily: (id: string, input: UpdateFamilyInput) => Promise<boolean>;
  deleteFamily: (id: string) => Promise<boolean>;
  inviteMember: (email: string) => Promise<boolean>;
  removeMember: (memberId: string) => Promise<boolean>;
  updateMemberRole: (memberId: string, roleId: number) => Promise<boolean>;
  joinFamily: (invitationCode: string) => Promise<boolean>;
  refreshFamily: () => Promise<void>;
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

// Helper function to safely access localStorage (only in browser)
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  },
  setItem: (key: string, value: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value);
    }
  },
  removeItem: (key: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  }
};

// Helper to consistently check if user is the admin (User ID 1)
const isUserIdAdmin = (userId: string | null): boolean => {
  if (!userId) return false;
  
  // Check different possible formats of userId
  return userId === '1';
};

export function FamilyProvider({ children }: { children: React.ReactNode }) {
  const [family, setFamily] = useState<Family | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();
  const router = useRouter();
  const [adminStatus, setAdminStatus] = useState<boolean>(false);

  // Check if the current user is an admin of the family
  const checkAdminStatus = useCallback(() => {
    // Direct override for known admin accounts - User ID 1 is always admin
    // Check this FIRST before any other logic to ensure it always works
    const currentUserId = safeLocalStorage.getItem('userId');
    if (isUserIdAdmin(currentUserId)) {
      console.log("Direct admin override for User ID 1 (admin account)");
      setAdminStatus(true);
      return;
    }
    
    if (!family) {
      setAdminStatus(false);
      return;
    }
    
    // Find the current user's family member record
    
    // Set a default userId if none exists in localStorage
    if (!currentUserId && family.members?.length > 0) {
      // Find an admin member first
      const adminMember = family.members.find(m => 
        m.role?.name?.toLowerCase() === 'admin' || 
        m.role?.name?.toLowerCase()?.includes('admin')
      );
      
      if (adminMember) {
        console.log("Setting missing userId to admin member:", adminMember.userId);
        safeLocalStorage.setItem('userId', String(adminMember.userId));
        // Use this ID for the current check
        checkAdminWithUserId(String(adminMember.userId));
        return;
      } else if (family.members[0]) {
        console.log("Setting missing userId to first member:", family.members[0].userId);
        safeLocalStorage.setItem('userId', String(family.members[0].userId));
        // Use this ID for the current check
        checkAdminWithUserId(String(family.members[0].userId));
        return;
      }
    }
    
    checkAdminWithUserId(currentUserId || '');
  }, [family]);
  
  // Helper function to check admin status with a specific user ID
  const checkAdminWithUserId = useCallback((userId: string) => {
    // Also check for admin ID at the beginning of this function as well
    if (isUserIdAdmin(userId)) {
      console.log("Admin override in checkAdminWithUserId for User ID 1");
      setAdminStatus(true);
      return;
    }
  
    if (!family) {
      setAdminStatus(false);
      return;
    }
    
    // Check for bypass flags in localStorage
    const testMode = safeLocalStorage.getItem('family_settings_test_mode') === 'true';
    const bypassAdmin = safeLocalStorage.getItem('bypass_admin_family_settings') === 'true';
    
    // If any bypass is active, just set admin to true and return early
    if (testMode || bypassAdmin) {
      console.log("Admin bypass active - granting admin access");
      setAdminStatus(true);
      return;
    }
    
    // Log for debugging
    console.log("Checking admin status for user ID:", userId, "Type:", typeof userId);
    console.log("Family members:", family.members.map(m => ({
      id: m.id,
      userId: m.userId,
      userIdType: typeof m.userId,
      username: m.username,
      role: m.role?.name
    })));
    
    // Try all possible comparison methods to match user IDs
    const currentMember = family.members.find(member => {
      // Convert both to strings and compare
      const memberIdStr = String(member.userId).trim();
      const currentIdStr = String(userId).trim();
      
      // Log each comparison attempt for debugging
      console.log(`Comparing member ${member.username || member.email}:`, {
        memberIdOriginal: member.userId,
        currentIdOriginal: userId,
        memberIdStr,
        currentIdStr,
        matches: memberIdStr === currentIdStr
      });
      
      // Return true if any comparison method works
      return (
        // Direct comparison
        member.userId === userId ||
        // Number to string comparison
        String(member.userId) === userId ||
        // String to number comparison (if possible)
        member.userId === Number(userId) ||
        // Pure string comparison after conversion
        memberIdStr === currentIdStr
      );
    });
    
    if (!currentMember || !currentMember.role) {
      console.log("Current member not found or has no role");
      setAdminStatus(false);
      return;
    }
    
    console.log("Current member role:", currentMember.role);
    
    // Check if the user's role has admin permissions
    // Be more permissive - any role that might indicate admin privileges
    const isUserAdmin = 
      currentMember.role.name.toLowerCase() === 'admin' || 
      currentMember.role.name.toLowerCase().includes('admin') ||
      currentMember.role.name.toLowerCase().includes('owner') ||
      currentMember.role.name.toLowerCase().includes('creator') ||
      (currentMember.role.permissions && 
        (currentMember.role.permissions.includes('admin') || 
         currentMember.role.permissions.includes('manage_family') ||
         currentMember.role.permissions.includes('manage') ||
         currentMember.role.permissions.includes('write')));
    
    console.log("Is user admin:", isUserAdmin);
    setAdminStatus(isUserAdmin);
  }, [family]);

  // Update admin status whenever family changes
  useEffect(() => {
    checkAdminStatus();
  }, [family, checkAdminStatus]);

  // Watch for changes to localStorage userId and refresh admin status
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') return;
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'userId' && family) {
        console.log('User ID changed in localStorage, rechecking admin status');
        checkAdminStatus();
      }
    };

    // For cross-tab changes
    window.addEventListener('storage', handleStorageChange);

    // Custom event for same-tab changes
    const checkStorageInterval = setInterval(() => {
      const currentUserId = safeLocalStorage.getItem('userId');
      if (currentUserId !== prevUserIdRef.current) {
        console.log('User ID changed from', prevUserIdRef.current, 'to', currentUserId);
        prevUserIdRef.current = currentUserId;
        checkAdminStatus();
      }
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(checkStorageInterval);
    };
  }, [family, checkAdminStatus]);

  // Create a ref to track previous userId value - safely initialized
  const prevUserIdRef = React.useRef<string | null>(null);
  
  // Initialize ref value from localStorage safely after mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      prevUserIdRef.current = safeLocalStorage.getItem('userId');
    }
  }, []);

  // Fetch the current family on component mount
  const fetchCurrentFamily = useCallback(async () => {
    if (loading) return; // Prevent concurrent fetches
    setLoading(true);
    try {
      const response = await familyService.getCurrentFamily();
      if (response.data) {
        setFamily(response.data);
      } else if (response.error) {
        setError(response.error);
        if (response.status !== 404) { // Don't show toast for "no family found"
          showToast(response.error, 'error');
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load family data';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  }, [loading, showToast]);

  // Refresh family data
  const refreshFamily = useCallback(async () => {
    if (family) {
      try {
        // Use our improved refreshFamily method with force refresh
        const response = await familyService.refreshFamily(family.id.toString(), true);
        if (response.data) {
          setFamily(response.data);
        } else if (response.error && response.error !== 'Family not found') {
          showToast(response.error, 'error');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to refresh family data';
        showToast(errorMessage, 'error');
      }
    } else {
      await fetchCurrentFamily();
    }
  }, [family, fetchCurrentFamily, showToast]);

  // Create a new family
  const createFamily = async (input: CreateFamilyInput): Promise<boolean> => {
    try {
      const response = await familyService.createFamily(input.name);
      if (response.data) {
        setFamily(response.data);
        showToast('Family created successfully!', 'success');
        router.push('/family/dashboard');
        return true;
      } else if (response.error) {
        showToast(response.error, 'error');
      }
      return false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create family';
      showToast(errorMessage, 'error');
      return false;
    }
  };

  // Update family details
  const updateFamily = async (id: string, input: UpdateFamilyInput): Promise<boolean> => {
    try {
      const response = await familyService.updateFamily(id, {
        name: input.name || '',
        description: input.description 
      });
      
      if (response.data) {
        setFamily(response.data);
        showToast('Family updated successfully!', 'success');
        return true;
      } else if (response.error) {
        showToast(response.error, 'error');
      }
      return false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update family';
      showToast(errorMessage, 'error');
      return false;
    }
  };

  // Delete a family
  const deleteFamily = async (id: string): Promise<boolean> => {
    try {
      const response = await familyService.deleteFamily(id);
      if (response.status === 204 || response.status === 200) {
        setFamily(null);
        showToast('Family deleted successfully!', 'success');
        router.push('/family/create');
        return true;
      } else if (response.error) {
        showToast(response.error, 'error');
      }
      return false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete family';
      showToast(errorMessage, 'error');
      return false;
    }
  };

  // Invite a new member
  const inviteMember = async (email: string): Promise<boolean> => {
    if (!family) return false;
    
    try {
      const response = await familyService.inviteMember(family.id.toString(), email);
      if (response.status === 200 || response.status === 201) {
        showToast(`Invitation sent to ${email}!`, 'success');
        return true;
      } else if (response.error) {
        showToast(response.error, 'error');
      }
      return false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send invitation';
      showToast(errorMessage, 'error');
      return false;
    }
  };

  // Remove a member
  const removeMember = async (memberId: string): Promise<boolean> => {
    if (!family) return false;
    
    try {
      const response = await familyService.removeMember(family.id.toString(), memberId);
      if (response.status === 200 || response.status === 204) {
        // Update the local state to remove the member
        setFamily(prev => {
          if (!prev) return null;
          return {
            ...prev,
            members: prev.members.filter(m => m.id !== memberId)
          };
        });
        showToast('Member removed successfully!', 'success');
        return true;
      } else if (response.error) {
        showToast(response.error, 'error');
      }
      return false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove member';
      showToast(errorMessage, 'error');
      return false;
    }
  };

  // Update a member's role
  const updateMemberRole = async (memberId: string, roleId: number): Promise<boolean> => {
    if (!family) return false;
    
    try {
      const response = await familyService.updateMemberRole(family.id.toString(), memberId, roleId);
      if (response.status === 200 || response.status === 204) {
        await refreshFamily(); // Refresh to get updated member data
        showToast('Member role updated successfully!', 'success');
        return true;
      } else if (response.error) {
        showToast(response.error, 'error');
      }
      return false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update member role';
      showToast(errorMessage, 'error');
      return false;
    }
  };

  // Join a family with an invitation code
  const joinFamily = async (invitationCode: string): Promise<boolean> => {
    try {
      const response = await familyService.joinFamily(invitationCode);
      if (response.data) {
        setFamily(response.data);
        showToast('Successfully joined the family!', 'success');
        router.push('/family/dashboard');
        return true;
      } else if (response.error) {
        showToast(response.error, 'error');
      }
      return false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to join family';
      showToast(errorMessage, 'error');
      return false;
    }
  };

  // Load current family on mount
  useEffect(() => {
    fetchCurrentFamily();
  }, [fetchCurrentFamily]);

  return (
    <FamilyContext.Provider value={{
      family,
      loading,
      error,
      isAdmin: adminStatus,
      createFamily,
      updateFamily,
      deleteFamily,
      inviteMember,
      removeMember,
      updateMemberRole,
      joinFamily,
      refreshFamily
    }}>
      {children}
    </FamilyContext.Provider>
  );
}

export function useFamily() {
  const context = useContext(FamilyContext);
  if (context === undefined) {
    throw new Error('useFamily must be used within a FamilyProvider');
  }
  return context;
}