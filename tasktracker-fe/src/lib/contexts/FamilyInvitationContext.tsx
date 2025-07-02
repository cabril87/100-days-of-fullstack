/*
 * Family Invitation Context Provider
 * Copyright (c) 2025 Carlos Abril Jr
 */

'use client';

import React, { createContext, useContext, useCallback, useReducer } from 'react';
import {
  InvitationDTO,
  FamilyDTO,
  FamilyMemberDTO,
  FamilyRoleDTO,
  InvitationWithStatus,
  FamilyMemberWithStats
} from '../types/family/family-invitation';
import {
  InvitationFormData,
  FamilyCreateFormData,
  FamilyUpdateFormData,
  BulkInvitationFormData
} from '../schemas/family-invitation';
import { familyInvitationService, FamilyInvitationApiError } from '../services/familyInvitationService';

// Context State Interface
interface FamilyInvitationState {
  // Loading states
  isLoading: boolean;
  isSubmitting: boolean;
  
  // Data states
  currentFamily: FamilyDTO | null;
  familyMembers: FamilyMemberDTO[];
  familyRoles: FamilyRoleDTO[];
  sentInvitations: InvitationDTO[];
  pendingInvitations: InvitationDTO[];
  
  // Stats
  familyStats: {
    memberCount: number;
    pendingInvitations: number;
    totalInvitations: number;
    activeMembers: number;
    totalTasks: number;
    totalPoints: number;
  } | null;
  
  // Error state
  error: string | null;
  
  // UI state
  showInviteModal: boolean;
  showBulkInviteModal: boolean;
  showCreateFamilyModal: boolean;
  showFamilySettingsModal: boolean;
  selectedMemberIds: number[];
  inviteFormMode: 'single' | 'bulk';
}

// Context Actions
type FamilyInvitationAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CURRENT_FAMILY'; payload: FamilyDTO | null }
  | { type: 'SET_FAMILY_MEMBERS'; payload: FamilyMemberDTO[] }
  | { type: 'SET_FAMILY_ROLES'; payload: FamilyRoleDTO[] }
  | { type: 'SET_SENT_INVITATIONS'; payload: InvitationDTO[] }
  | { type: 'SET_PENDING_INVITATIONS'; payload: InvitationDTO[] }
  | { type: 'SET_FAMILY_STATS'; payload: FamilyInvitationState['familyStats'] }
  | { type: 'TOGGLE_INVITE_MODAL'; payload: boolean }
  | { type: 'TOGGLE_BULK_INVITE_MODAL'; payload: boolean }
  | { type: 'TOGGLE_CREATE_FAMILY_MODAL'; payload: boolean }
  | { type: 'TOGGLE_FAMILY_SETTINGS_MODAL'; payload: boolean }
  | { type: 'SET_SELECTED_MEMBERS'; payload: number[] }
  | { type: 'SET_INVITE_FORM_MODE'; payload: 'single' | 'bulk' }
  | { type: 'ADD_INVITATION'; payload: InvitationDTO }
  | { type: 'UPDATE_INVITATION'; payload: InvitationDTO }
  | { type: 'REMOVE_INVITATION'; payload: number }
  | { type: 'UPDATE_MEMBER'; payload: FamilyMemberDTO }
  | { type: 'REMOVE_MEMBER'; payload: number }
  | { type: 'RESET_STATE' };

// Context Interface
interface FamilyInvitationContextType {
  // State
  state: FamilyInvitationState;
  
  // Family Management
  loadCurrentFamily: () => Promise<void>;
  createFamily: (data: FamilyCreateFormData) => Promise<void>;
  updateFamily: (data: FamilyUpdateFormData) => Promise<void>;
  leaveFamily: () => Promise<void>;
  deleteFamily: () => Promise<void>;
  
  // Family Members
  loadFamilyMembers: () => Promise<void>;
  updateMemberRole: (memberId: number, roleId: number) => Promise<void>;
  removeMember: (memberId: number) => Promise<void>;
  
  // Family Roles
  loadFamilyRoles: () => Promise<void>;
  
  // Invitations
  sendInvitation: (data: InvitationFormData) => Promise<void>;
  sendBulkInvitations: (data: BulkInvitationFormData) => Promise<void>;
  loadSentInvitations: () => Promise<void>;
  loadPendingInvitations: () => Promise<void>;
  acceptInvitation: (token: string) => Promise<void>;
  declineInvitation: (token: string) => Promise<void>;
  cancelInvitation: (invitationId: number) => Promise<void>;
  resendInvitation: (invitationId: number) => Promise<void>;
  
  // Stats and Validation
  loadFamilyStats: () => Promise<void>;
  checkEmailExists: (email: string) => Promise<boolean>;
  validateInvitationToken: (token: string) => Promise<boolean>;
  
  // UI State Management
  toggleInviteModal: (show: boolean) => void;
  toggleBulkInviteModal: (show: boolean) => void;
  toggleCreateFamilyModal: (show: boolean) => void;
  toggleFamilySettingsModal: (show: boolean) => void;
  setInviteFormMode: (mode: 'single' | 'bulk') => void;
  toggleMemberSelection: (memberId: number) => void;
  selectAllMembers: () => void;
  clearMemberSelection: () => void;
  
  // Utility Functions
  clearError: () => void;
  refreshData: () => Promise<void>;
  getInvitationWithStatus: (invitation: InvitationDTO) => InvitationWithStatus;
  getMemberWithStats: (member: FamilyMemberDTO) => FamilyMemberWithStats;
}

// Initial State
const initialState: FamilyInvitationState = {
  isLoading: false,
  isSubmitting: false,
  currentFamily: null,
  familyMembers: [],
  familyRoles: [],
  sentInvitations: [],
  pendingInvitations: [],
  familyStats: null,
  error: null,
  showInviteModal: false,
  showBulkInviteModal: false,
  showCreateFamilyModal: false,
  showFamilySettingsModal: false,
  selectedMemberIds: [],
  inviteFormMode: 'single',
};

// Reducer
function familyInvitationReducer(
  state: FamilyInvitationState,
  action: FamilyInvitationAction
): FamilyInvitationState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_SUBMITTING':
      return { ...state, isSubmitting: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false, isSubmitting: false };
    
    case 'SET_CURRENT_FAMILY':
      return { ...state, currentFamily: action.payload };
    
    case 'SET_FAMILY_MEMBERS':
      return { ...state, familyMembers: action.payload };
    
    case 'SET_FAMILY_ROLES':
      return { ...state, familyRoles: action.payload };
    
    case 'SET_SENT_INVITATIONS':
      return { ...state, sentInvitations: action.payload };
    
    case 'SET_PENDING_INVITATIONS':
      return { ...state, pendingInvitations: action.payload };
    
    case 'SET_FAMILY_STATS':
      return { ...state, familyStats: action.payload };
    
    case 'TOGGLE_INVITE_MODAL':
      return { ...state, showInviteModal: action.payload };
    
    case 'TOGGLE_BULK_INVITE_MODAL':
      return { ...state, showBulkInviteModal: action.payload };
    
    case 'TOGGLE_CREATE_FAMILY_MODAL':
      return { ...state, showCreateFamilyModal: action.payload };
    
    case 'TOGGLE_FAMILY_SETTINGS_MODAL':
      return { ...state, showFamilySettingsModal: action.payload };
    
    case 'SET_SELECTED_MEMBERS':
      return { ...state, selectedMemberIds: action.payload };
    
    case 'SET_INVITE_FORM_MODE':
      return { ...state, inviteFormMode: action.payload };
    
    case 'ADD_INVITATION':
      return { 
        ...state, 
        sentInvitations: [...state.sentInvitations, action.payload] 
      };
    
    case 'UPDATE_INVITATION':
      return {
        ...state,
        sentInvitations: state.sentInvitations.map(inv =>
          inv.id === action.payload.id ? action.payload : inv
        ),
        pendingInvitations: state.pendingInvitations.map(inv =>
          inv.id === action.payload.id ? action.payload : inv
        )
      };
    
    case 'REMOVE_INVITATION':
      return {
        ...state,
        sentInvitations: state.sentInvitations.filter(inv => inv.id !== action.payload),
        pendingInvitations: state.pendingInvitations.filter(inv => inv.id !== action.payload)
      };
    
    case 'UPDATE_MEMBER':
      return {
        ...state,
        familyMembers: state.familyMembers.map(member =>
          member.id === action.payload.id ? action.payload : member
        )
      };
    
    case 'REMOVE_MEMBER':
      return {
        ...state,
        familyMembers: state.familyMembers.filter(member => member.id !== action.payload),
        selectedMemberIds: state.selectedMemberIds.filter(id => id !== action.payload)
      };
    
    case 'RESET_STATE':
      return initialState;
    
    default:
      return state;
  }
}

// Create Context
const FamilyInvitationContext = createContext<FamilyInvitationContextType | undefined>(undefined);

// Provider Component
interface FamilyInvitationProviderProps {
  children: React.ReactNode;
}

export function FamilyInvitationProvider({ children }: FamilyInvitationProviderProps) {
  const [state, dispatch] = useReducer(familyInvitationReducer, initialState);

  // Helper function to handle errors
  const handleError = useCallback((error: unknown) => {
    console.error('Family Invitation Error:', error);
    
    if (error instanceof FamilyInvitationApiError) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } else if (error instanceof Error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } else {
      dispatch({ type: 'SET_ERROR', payload: 'An unexpected error occurred' });
    }
  }, []);

  // Family Management
  const loadCurrentFamily = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const family = await familyInvitationService.getCurrentFamily();
      dispatch({ type: 'SET_CURRENT_FAMILY', payload: family });
    } catch (error) {
      handleError(error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [handleError]);

  const createFamily = useCallback(async (data: FamilyCreateFormData) => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const newFamily = await familyInvitationService.createFamily(data);
      dispatch({ type: 'SET_CURRENT_FAMILY', payload: newFamily });
      dispatch({ type: 'TOGGLE_CREATE_FAMILY_MODAL', payload: false });
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError]);

  const updateFamily = useCallback(async (data: FamilyUpdateFormData) => {
    try {
      if (!state.currentFamily) throw new Error('No family to update');
      
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const updatedFamily = await familyInvitationService.updateFamily(
        state.currentFamily.id, 
        data
      );
      dispatch({ type: 'SET_CURRENT_FAMILY', payload: updatedFamily });
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError, state.currentFamily]);

  const leaveFamily = useCallback(async () => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      await familyInvitationService.leaveFamilyAsUser();
      dispatch({ type: 'RESET_STATE' });
    } catch (error) {
      handleError(error);
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError]);

  const deleteFamily = useCallback(async () => {
    try {
      if (!state.currentFamily) throw new Error('No family to delete');
      
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      await familyInvitationService.deleteFamily(state.currentFamily.id);
      dispatch({ type: 'RESET_STATE' });
    } catch (error) {
      handleError(error);
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError, state.currentFamily]);

  // Family Members
  const loadFamilyMembers = useCallback(async () => {
    try {
      if (!state.currentFamily) return;
      
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const members = await familyInvitationService.getFamilyMembers(state.currentFamily.id);
      dispatch({ type: 'SET_FAMILY_MEMBERS', payload: members });
    } catch (error) {
      handleError(error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [handleError, state.currentFamily]);

  const updateMemberRole = useCallback(async (memberId: number, roleId: number) => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const updatedMember = await familyInvitationService.updateMemberRoleInUserFamily(memberId, roleId);
      dispatch({ type: 'UPDATE_MEMBER', payload: updatedMember });
    } catch (error) {
      handleError(error);
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError]);

  const removeMember = useCallback(async (memberId: number) => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      await familyInvitationService.removeFamilyMemberFromUserFamily(memberId);
      dispatch({ type: 'REMOVE_MEMBER', payload: memberId });
    } catch (error) {
      handleError(error);
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError]);

  // Family Roles
  const loadFamilyRoles = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const roles = await familyInvitationService.getFamilyRoles();
      dispatch({ type: 'SET_FAMILY_ROLES', payload: roles });
    } catch (error) {
      handleError(error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [handleError]);

  // Invitations
  const sendInvitation = useCallback(async (data: InvitationFormData) => {
    try {
      if (!state.currentFamily) throw new Error('No family to invite to');
      
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const invitationData = {
        email: data.email,
        familyId: state.currentFamily.id,
        familyRoleId: data.roleId,
        message: data.message,
      };
      
      const invitation = await familyInvitationService.sendInvitation(invitationData);
      dispatch({ type: 'ADD_INVITATION', payload: invitation });
      
      dispatch({ type: 'TOGGLE_INVITE_MODAL', payload: false });
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError, state.currentFamily]);

  const sendBulkInvitations = useCallback(async (data: BulkInvitationFormData) => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const invitations = data.emails.map(email => ({
        email,
        familyId: state.currentFamily!.id,
        familyRoleId: data.roleId,
        message: data.message
      }));
      
      const responses = await familyInvitationService.sendBulkInvitations(invitations);
      
      responses.forEach(invitation => {
        dispatch({ type: 'ADD_INVITATION', payload: invitation });
      });
      
      dispatch({ type: 'TOGGLE_BULK_INVITE_MODAL', payload: false });
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError, state.currentFamily]);

  const loadSentInvitations = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const invitations = await familyInvitationService.getSentInvitations();
      dispatch({ type: 'SET_SENT_INVITATIONS', payload: invitations });
    } catch (error) {
      handleError(error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [handleError]);

  const loadPendingInvitations = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const invitations = await familyInvitationService.getPendingInvitations();
      dispatch({ type: 'SET_PENDING_INVITATIONS', payload: invitations });
    } catch (error) {
      handleError(error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [handleError]);

  const acceptInvitation = useCallback(async (token: string) => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      await familyInvitationService.acceptInvitationByToken(token);
      
      // Refresh family data
      await loadCurrentFamily();
      await loadPendingInvitations();
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError, loadCurrentFamily, loadPendingInvitations]);

  const declineInvitation = useCallback(async (token: string) => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      await familyInvitationService.declineInvitationByToken(token);
      await loadPendingInvitations();
    } catch (error) {
      handleError(error);
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError, loadPendingInvitations]);

  const cancelInvitation = useCallback(async (invitationId: number) => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      await familyInvitationService.cancelInvitation(invitationId);
      dispatch({ type: 'REMOVE_INVITATION', payload: invitationId });
    } catch (error) {
      handleError(error);
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError]);

  const resendInvitation = useCallback(async (invitationId: number) => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      await familyInvitationService.resendInvitation(invitationId);
      // Refresh invitations after resend
      await loadSentInvitations();
    } catch (error) {
      handleError(error);
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError, loadSentInvitations]);

  // Stats and Validation
  const loadFamilyStats = useCallback(async () => {
    try {
      if (!state.currentFamily) return;
      
      const stats = await familyInvitationService.getFamilyStats(state.currentFamily.id);
      dispatch({ type: 'SET_FAMILY_STATS', payload: stats });
    } catch (error) {
      handleError(error);
    }
  }, [handleError, state.currentFamily]);

  const checkEmailExists = useCallback(async (email: string): Promise<boolean> => {
    try {
      return await familyInvitationService.checkEmailExists(email);
    } catch (error) {
      handleError(error);
      return false;
    }
  }, [handleError]);

  const validateInvitationToken = useCallback(async (token: string): Promise<boolean> => {
    try {
      return await familyInvitationService.validateInvitationToken(token);
    } catch (error) {
      handleError(error);
      return false;
    }
  }, [handleError]);

  // UI State Management
  const toggleInviteModal = useCallback((show: boolean) => {
    dispatch({ type: 'TOGGLE_INVITE_MODAL', payload: show });
  }, []);

  const toggleBulkInviteModal = useCallback((show: boolean) => {
    dispatch({ type: 'TOGGLE_BULK_INVITE_MODAL', payload: show });
  }, []);

  const toggleCreateFamilyModal = useCallback((show: boolean) => {
    dispatch({ type: 'TOGGLE_CREATE_FAMILY_MODAL', payload: show });
  }, []);

  const toggleFamilySettingsModal = useCallback((show: boolean) => {
    dispatch({ type: 'TOGGLE_FAMILY_SETTINGS_MODAL', payload: show });
  }, []);

  const setInviteFormMode = useCallback((mode: 'single' | 'bulk') => {
    dispatch({ type: 'SET_INVITE_FORM_MODE', payload: mode });
  }, []);

  const toggleMemberSelection = useCallback((memberId: number) => {
    const isSelected = state.selectedMemberIds.includes(memberId);
    const newSelection = isSelected
      ? state.selectedMemberIds.filter(id => id !== memberId)
      : [...state.selectedMemberIds, memberId];
    
    dispatch({ type: 'SET_SELECTED_MEMBERS', payload: newSelection });
  }, [state.selectedMemberIds]);

  const selectAllMembers = useCallback(() => {
    const allMemberIds = state.familyMembers.map(member => member.id);
    dispatch({ type: 'SET_SELECTED_MEMBERS', payload: allMemberIds });
  }, [state.familyMembers]);

  const clearMemberSelection = useCallback(() => {
    dispatch({ type: 'SET_SELECTED_MEMBERS', payload: [] });
  }, []);

  // Utility Functions
  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  const refreshData = useCallback(async () => {
    await Promise.all([
      loadCurrentFamily(),
      loadFamilyMembers(),
      loadFamilyRoles(),
      loadSentInvitations(),
      loadPendingInvitations(),
      loadFamilyStats(),
    ]);
  }, [
    loadCurrentFamily,
    loadFamilyMembers,
    loadFamilyRoles,
    loadSentInvitations,
    loadPendingInvitations,
    loadFamilyStats,
  ]);

  const getInvitationWithStatus = useCallback((invitation: InvitationDTO): InvitationWithStatus => {
    const now = new Date();
    const expiryDate = new Date(invitation.expiresAt);
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      ...invitation,
      daysUntilExpiry,
      isExpired: daysUntilExpiry <= 0,
      canResend: daysUntilExpiry <= 1 && !invitation.isAccepted,
    };
  }, []);

  const getMemberWithStats = useCallback((member: FamilyMemberDTO): FamilyMemberWithStats => {
    // This would typically come from additional API calls or be included in the member data
    return {
      ...member,
      taskCount: 0,
      pointsBalance: 0,
      lastActive: new Date().toISOString(),
      isOnline: false,
    };
  }, []);

  // Context Value
  const contextValue: FamilyInvitationContextType = {
    state,
    loadCurrentFamily,
    createFamily,
    updateFamily,
    leaveFamily,
    deleteFamily,
    loadFamilyMembers,
    updateMemberRole,
    removeMember,
    loadFamilyRoles,
    sendInvitation,
    sendBulkInvitations,
    loadSentInvitations,
    loadPendingInvitations,
    acceptInvitation,
    declineInvitation,
    cancelInvitation,
    resendInvitation,
    loadFamilyStats,
    checkEmailExists,
    validateInvitationToken,
    toggleInviteModal,
    toggleBulkInviteModal,
    toggleCreateFamilyModal,
    toggleFamilySettingsModal,
    setInviteFormMode,
    toggleMemberSelection,
    selectAllMembers,
    clearMemberSelection,
    clearError,
    refreshData,
    getInvitationWithStatus,
    getMemberWithStats,
  };

  return (
    <FamilyInvitationContext.Provider value={contextValue}>
      {children}
    </FamilyInvitationContext.Provider>
  );
}

// Custom Hook
export function useFamilyInvitation(): FamilyInvitationContextType {
  const context = useContext(FamilyInvitationContext);
  if (context === undefined) {
    throw new Error('useFamilyInvitation must be used within a FamilyInvitationProvider');
  }
  return context;
} 