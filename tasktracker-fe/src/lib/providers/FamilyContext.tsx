'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { familyService } from '@/lib/services/familyService';
import { useToast } from '@/lib/hooks/useToast';
import { Family, FamilyMember, CreateFamilyInput, UpdateFamilyInput } from '@/lib/types/family';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/providers/AuthContext';

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
  return userId === '1';
};

export function FamilyProvider({ children }: { children: React.ReactNode }) {
  const [family, setFamily] = useState<Family | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();
  const router = useRouter();
  const [adminStatus, setAdminStatus] = useState<boolean>(false);
  const [hasFetched, setHasFetched] = useState<boolean>(false);
  const { isAuthenticated } = useAuth();

  // Check if the current user is an admin of the family
  const checkAdminStatus = useCallback(() => {
    const currentUserId = safeLocalStorage.getItem('userId');
    
    // Direct override for known admin accounts - User ID 1 is always admin
    if (isUserIdAdmin(currentUserId)) {
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
    
    if (testMode || bypassAdmin) {
      setAdminStatus(true);
      return;
    }
    
    // Set a default userId if none exists in localStorage
    if (!currentUserId && family.members?.length > 0) {
      const adminMember = family.members.find(m => 
        m.role?.name?.toLowerCase() === 'admin' || 
        m.role?.name?.toLowerCase()?.includes('admin')
      );
      
      if (adminMember) {
        safeLocalStorage.setItem('userId', String(adminMember.userId));
        checkAdminWithUserId(String(adminMember.userId));
        return;
      } else if (family.members[0]) {
        safeLocalStorage.setItem('userId', String(family.members[0].userId));
        checkAdminWithUserId(String(family.members[0].userId));
        return;
      }
    }
    
    checkAdminWithUserId(currentUserId || '');
  }, [family]);
  
  // Helper function to check admin status with a specific user ID
  const checkAdminWithUserId = useCallback((userId: string) => {
    if (isUserIdAdmin(userId)) {
      setAdminStatus(true);
      return;
    }
  
    if (!family) {
      setAdminStatus(false);
      return;
    }
    
    const currentMember = family.members.find(member => {
      const memberIdStr = String(member.userId).trim();
      const currentIdStr = String(userId).trim();
      
      return (
        member.userId === userId ||
        String(member.userId) === userId ||
        member.userId === Number(userId) ||
        memberIdStr === currentIdStr
      );
    });
    
    if (!currentMember || !currentMember.role) {
      setAdminStatus(false);
      return;
    }
    
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
    
    setAdminStatus(isUserAdmin);
  }, [family]);

  // Update admin status whenever family changes
  useEffect(() => {
    checkAdminStatus();
  }, [family, checkAdminStatus]);

  // FIXED: Fetch the current family with proper loading management
  const fetchCurrentFamily = useCallback(async () => {
    // Prevent multiple concurrent fetches
    if (hasFetched) return;
    
    try {
      setHasFetched(true);
      setError(null);
      
      const response = await familyService.getCurrentFamily();
      
      if (response.data) {
        setFamily(response.data);
      } else if (response.error) {
        // Check if it's an authentication error
        if (response.status === 401) {
          setError('Authentication required. Please log in to access family data.');
          // Don't show toast for auth errors - let the auth system handle it
        } else {
        setError(response.error);
          if (response.status !== 404) {
          showToast(response.error, 'error');
          }
        }
      } else {
        // No family found (404 case)
        setFamily(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load family data';
      setError(errorMessage);
      // Don't show toast if it's likely an auth error
      if (!errorMessage.toLowerCase().includes('auth') && !errorMessage.toLowerCase().includes('401')) {
      showToast(errorMessage, 'error');
      }
    } finally {
      setLoading(false);
    }
  }, [hasFetched, showToast]);

  // Load family data when component mounts
  useEffect(() => {
    if (!hasFetched && isAuthenticated) {
      fetchCurrentFamily();
    }
  }, [fetchCurrentFamily, isAuthenticated]);

  // Refresh family data
  const refreshFamily = useCallback(async () => {
    if (family) {
      try {
        setLoading(true);
        const response = await familyService.refreshFamily(family.id.toString(), true);
        if (response.data) {
          setFamily(response.data);
        } else if (response.error && response.error !== 'Family not found') {
          showToast(response.error, 'error');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to refresh family data';
        showToast(errorMessage, 'error');
      } finally {
        setLoading(false);
      }
    } else {
      // Reset the fetch flag to allow re-fetching
      setHasFetched(false);
      setLoading(true);
      await fetchCurrentFamily();
    }
  }, [family, fetchCurrentFamily, showToast]);

  // Create a new family
  const createFamily = async (input: CreateFamilyInput): Promise<boolean> => {
    try {
      const response = await familyService.createFamily(input.name);
      if (response.data) {
        setFamily(response.data);
        
        // Clear family-related caches
        if (typeof window !== 'undefined') {
          try {
            localStorage.removeItem('family_dashboard_cache');
            sessionStorage.removeItem('family_dashboard_data');
            
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key && key.includes('family')) {
                localStorage.removeItem(key);
              }
            }
            
            const tempCacheKey = 'temp_new_family_' + Date.now();
            localStorage.setItem(tempCacheKey, JSON.stringify(response.data));
            
            setTimeout(() => {
              try {
                localStorage.removeItem(tempCacheKey);
              } catch (err) {
                console.warn('Error removing temporary family cache:', err);
              }
            }, 30000);
          } catch (err) {
            console.warn('Error managing family cache:', err);
          }
        }
        
        showToast('Family created successfully!', 'success');
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
      setLoading(true);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('family_deletion_in_progress', 'true');
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      const familyToDelete = family;
      setFamily(null);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('recently_deleted_family_' + id, Date.now().toString());
        localStorage.setItem('family_deletion_timestamp', Date.now().toString());
      }
      
      const response = await familyService.deleteFamily(id);
      
      if (response.status === 204 || response.status === 200) {
        if (typeof window !== 'undefined') {
          try {
            localStorage.removeItem('family_dashboard_cache');
            sessionStorage.removeItem('family_dashboard_data');
            
            let clearedItems = 0;
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key && (
                key.includes('family') || 
                key.includes('family_data') || 
                key.includes(`family_${id}`)
              ) && !key.includes('recently_deleted_family_') && !key.includes('family_deletion_timestamp') && !key.includes('family_deletion_in_progress')) {
                localStorage.removeItem(key);
                clearedItems++;
              }
            }
          } catch (err) {
            console.warn('Error clearing family cache:', err);
          }
        }
        
        showToast('Family deleted successfully!', 'success');
        return true;
      } else if (response.error) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('family_deletion_in_progress');
        }
        setLoading(false);
        showToast(response.error, 'error');
      }
      return false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete family';
      if (typeof window !== 'undefined') {
        localStorage.removeItem('family_deletion_in_progress');
      }
      setLoading(false);
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
        await refreshFamily();
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