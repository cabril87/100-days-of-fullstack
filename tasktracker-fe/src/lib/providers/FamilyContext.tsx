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

export function FamilyProvider({ children }: { children: React.ReactNode }) {
  const [family, setFamily] = useState<Family | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();
  const router = useRouter();

  // Check if the current user is an admin of the family
  const isAdmin = useCallback(() => {
    if (!family) return false;
    
    // Find the current user's family member record
    // This would need to be adapted based on how you store the current user ID
    const currentUserId = localStorage.getItem('userId') || '';
    const currentMember = family.members.find(member => member.userId === currentUserId);
    
    if (!currentMember || !currentMember.role) return false;
    
    // Check if the user's role has admin permissions
    return currentMember.role.name.toLowerCase() === 'admin' || 
           currentMember.role.permissions.includes('admin') ||
           currentMember.role.permissions.includes('manage_family');
  }, [family]);

  // Fetch the current family on component mount
  const fetchCurrentFamily = useCallback(async () => {
    if (loading) return; // Prevent concurrent fetches
    setLoading(true);    try {
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
  }, []);

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
      isAdmin: isAdmin(),
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