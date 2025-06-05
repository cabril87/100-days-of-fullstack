/*
 * Parental Control Context Provider
 * Copyright (c) 2025 Carlos Abril Jr
 */

'use client';

import React, { createContext, useContext, useCallback, useReducer } from 'react';
import { 
  ParentalControlDTO,
  PermissionRequestDTO,
  ParentalControlSummaryDTO,
  PermissionRequestStatus 
} from '../types/parental-control';
import { 
  ParentalControlFormData,
  PermissionRequestFormData
} from '../schemas/parental-control';
import { parentalControlService, ParentalControlApiError } from '../services/parentalControlService';

// Context State Interface
interface ParentalControlState {
  // Loading states
  isLoading: boolean;
  isSubmitting: boolean;
  
  // Data states
  currentChildControls: ParentalControlDTO | null;
  allChildrenControls: ParentalControlDTO[];
  pendingRequests: PermissionRequestDTO[];
  childSummaries: Map<number, ParentalControlSummaryDTO>;
  
  // Error state
  error: string | null;
  
  // UI state
  selectedChildId: number | null;
  showRequestModal: boolean;
  showBulkApprovalModal: boolean;
  selectedRequests: number[];
}

// Context Actions
type ParentalControlAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CURRENT_CHILD_CONTROLS'; payload: ParentalControlDTO | null }
  | { type: 'SET_ALL_CHILDREN_CONTROLS'; payload: ParentalControlDTO[] }
  | { type: 'SET_PENDING_REQUESTS'; payload: PermissionRequestDTO[] }
  | { type: 'SET_CHILD_SUMMARY'; payload: { childId: number; summary: ParentalControlSummaryDTO } }
  | { type: 'SET_SELECTED_CHILD'; payload: number | null }
  | { type: 'TOGGLE_REQUEST_MODAL'; payload: boolean }
  | { type: 'TOGGLE_BULK_APPROVAL_MODAL'; payload: boolean }
  | { type: 'SET_SELECTED_REQUESTS'; payload: number[] }
  | { type: 'ADD_PERMISSION_REQUEST'; payload: PermissionRequestDTO }
  | { type: 'UPDATE_PERMISSION_REQUEST'; payload: PermissionRequestDTO }
  | { type: 'REMOVE_PERMISSION_REQUEST'; payload: number }
  | { type: 'UPDATE_PARENTAL_CONTROLS'; payload: ParentalControlDTO }
  | { type: 'RESET_STATE' };

// Context Interface
interface ParentalControlContextType {
  // State
  state: ParentalControlState;
  
  // Child Management Actions
  loadChildControls: (childUserId: number) => Promise<void>;
  loadAllChildrenControls: () => Promise<void>;
  updateChildControls: (childUserId: number, data: ParentalControlFormData) => Promise<void>;
  deleteChildControls: (childUserId: number) => Promise<void>;
  
  // Permission Request Actions
  createPermissionRequest: (data: PermissionRequestFormData) => Promise<void>;
  loadPendingRequests: () => Promise<void>;
  loadChildRequests: (childUserId: number) => Promise<void>;
  approveRequest: (requestId: number, message?: string) => Promise<void>;
  denyRequest: (requestId: number, message?: string) => Promise<void>;
  bulkApproveRequests: (requestIds: number[], message?: string) => Promise<void>;
  bulkDenyRequests: (requestIds: number[], message?: string) => Promise<void>;
  deleteRequest: (requestId: number) => Promise<void>;
  
  // Summary and Stats
  loadChildSummary: (childUserId: number) => Promise<void>;
  recordScreenTime: (childUserId: number, minutes: number) => Promise<void>;
  
  // UI State Management
  selectChild: (childUserId: number | null) => void;
  toggleRequestModal: (show: boolean) => void;
  toggleBulkApprovalModal: (show: boolean) => void;
  toggleRequestSelection: (requestId: number) => void;
  selectAllRequests: () => void;
  clearRequestSelection: () => void;
  
  // Utility Functions
  hasPermission: (childUserId: number) => Promise<boolean>;
  requiresApproval: (childUserId: number, actionType: string) => Promise<boolean>;
  clearError: () => void;
  refreshData: () => Promise<void>;
}

// Initial State
const initialState: ParentalControlState = {
  isLoading: false,
  isSubmitting: false,
  currentChildControls: null,
  allChildrenControls: [],
  pendingRequests: [],
  childSummaries: new Map(),
  error: null,
  selectedChildId: null,
  showRequestModal: false,
  showBulkApprovalModal: false,
  selectedRequests: [],
};

// Reducer
function parentalControlReducer(
  state: ParentalControlState, 
  action: ParentalControlAction
): ParentalControlState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_SUBMITTING':
      return { ...state, isSubmitting: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false, isSubmitting: false };
    
    case 'SET_CURRENT_CHILD_CONTROLS':
      return { ...state, currentChildControls: action.payload };
    
    case 'SET_ALL_CHILDREN_CONTROLS':
      return { ...state, allChildrenControls: action.payload };
    
    case 'SET_PENDING_REQUESTS':
      return { ...state, pendingRequests: action.payload };
    
    case 'SET_CHILD_SUMMARY':
      const newSummaries = new Map(state.childSummaries);
      newSummaries.set(action.payload.childId, action.payload.summary);
      return { ...state, childSummaries: newSummaries };
    
    case 'SET_SELECTED_CHILD':
      return { ...state, selectedChildId: action.payload };
    
    case 'TOGGLE_REQUEST_MODAL':
      return { ...state, showRequestModal: action.payload };
    
    case 'TOGGLE_BULK_APPROVAL_MODAL':
      return { ...state, showBulkApprovalModal: action.payload };
    
    case 'SET_SELECTED_REQUESTS':
      return { ...state, selectedRequests: action.payload };
    
    case 'ADD_PERMISSION_REQUEST':
      return { 
        ...state, 
        pendingRequests: [...state.pendingRequests, action.payload] 
      };
    
    case 'UPDATE_PERMISSION_REQUEST':
      return {
        ...state,
        pendingRequests: state.pendingRequests.map(req =>
          req.id === action.payload.id ? action.payload : req
        )
      };
    
    case 'REMOVE_PERMISSION_REQUEST':
      return {
        ...state,
        pendingRequests: state.pendingRequests.filter(req => req.id !== action.payload),
        selectedRequests: state.selectedRequests.filter(id => id !== action.payload)
      };
    
    case 'UPDATE_PARENTAL_CONTROLS':
      return {
        ...state,
        currentChildControls: action.payload,
        allChildrenControls: state.allChildrenControls.map(controls =>
          controls.childUserId === action.payload.childUserId ? action.payload : controls
        )
      };
    
    case 'RESET_STATE':
      return initialState;
    
    default:
      return state;
  }
}

// Create Context
const ParentalControlContext = createContext<ParentalControlContextType | undefined>(undefined);

// Provider Component
interface ParentalControlProviderProps {
  children: React.ReactNode;
}

export function ParentalControlProvider({ children }: ParentalControlProviderProps) {
  const [state, dispatch] = useReducer(parentalControlReducer, initialState);

  // Helper function to handle errors
  const handleError = useCallback((error: unknown) => {
    console.error('Parental Control Error:', error);
    
    if (error instanceof ParentalControlApiError) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } else if (error instanceof Error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } else {
      dispatch({ type: 'SET_ERROR', payload: 'An unexpected error occurred' });
    }
  }, []);

  // Child Management Actions
  const loadChildControls = useCallback(async (childUserId: number) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const controls = await parentalControlService.getParentalControlByChildId(childUserId);
      dispatch({ type: 'SET_CURRENT_CHILD_CONTROLS', payload: controls });
      dispatch({ type: 'SET_SELECTED_CHILD', payload: childUserId });
    } catch (error) {
      handleError(error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [handleError]);

  const loadAllChildrenControls = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const allControls = await parentalControlService.getParentalControlsByParent();
      dispatch({ type: 'SET_ALL_CHILDREN_CONTROLS', payload: allControls });
    } catch (error) {
      handleError(error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [handleError]);

  const updateChildControls = useCallback(async (
    childUserId: number, 
    data: ParentalControlFormData
  ) => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      // Transform form data to DTO format
      const updateData = {
        childUserId,
        screenTimeEnabled: data.screenTimeEnabled,
        dailyTimeLimitHours: data.dailyTimeLimitHours,
        allowedHours: data.allowedHours.map(hour => ({
          startTime: hour.startTime,
          endTime: hour.endTime,
          dayOfWeek: hour.dayOfWeek,
          isActive: hour.isActive,
        })),
        taskApprovalRequired: data.taskApprovalRequired,
        pointSpendingApprovalRequired: data.pointSpendingApprovalRequired,
        blockedFeatures: data.blockedFeatures,
        chatMonitoringEnabled: data.chatMonitoringEnabled,
        maxPointsWithoutApproval: data.maxPointsWithoutApproval,
        canInviteOthers: data.canInviteOthers,
        canViewOtherMembers: data.canViewOtherMembers,
      };
      
      const updatedControls = await parentalControlService.createOrUpdateParentalControl(
        childUserId, 
        updateData
      );
      
      dispatch({ type: 'UPDATE_PARENTAL_CONTROLS', payload: updatedControls });
    } catch (error) {
      handleError(error);
      throw error; // Re-throw for form handling
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError]);

  const deleteChildControls = useCallback(async (childUserId: number) => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      await parentalControlService.deleteParentalControl(childUserId);
      
      // Update state
      if (state.currentChildControls?.childUserId === childUserId) {
        dispatch({ type: 'SET_CURRENT_CHILD_CONTROLS', payload: null });
      }
      
      // Reload all children controls
      await loadAllChildrenControls();
    } catch (error) {
      handleError(error);
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError, loadAllChildrenControls, state.currentChildControls]);

  // Permission Request Actions
  const createPermissionRequest = useCallback(async (data: PermissionRequestFormData) => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const newRequest = await parentalControlService.createPermissionRequest(data);
      dispatch({ type: 'ADD_PERMISSION_REQUEST', payload: newRequest });
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError]);

  const loadPendingRequests = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const requests = await parentalControlService.getPendingPermissionRequests();
      dispatch({ type: 'SET_PENDING_REQUESTS', payload: requests });
    } catch (error) {
      handleError(error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [handleError]);

  const loadChildRequests = useCallback(async (childUserId: number) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const requests = await parentalControlService.getPermissionRequestsByChild(childUserId);
      dispatch({ type: 'SET_PENDING_REQUESTS', payload: requests });
    } catch (error) {
      handleError(error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [handleError]);

  const approveRequest = useCallback(async (requestId: number, message?: string) => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      
      const updatedRequest = await parentalControlService.respondToPermissionRequest(
        requestId,
        { approved: true, responseMessage: message }
      );
      
      dispatch({ type: 'UPDATE_PERMISSION_REQUEST', payload: updatedRequest });
    } catch (error) {
      handleError(error);
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError]);

  const denyRequest = useCallback(async (requestId: number, message?: string) => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      
      const updatedRequest = await parentalControlService.respondToPermissionRequest(
        requestId,
        { approved: false, responseMessage: message }
      );
      
      dispatch({ type: 'UPDATE_PERMISSION_REQUEST', payload: updatedRequest });
    } catch (error) {
      handleError(error);
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError]);

  const bulkApproveRequests = useCallback(async (requestIds: number[], message?: string) => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      
      const updatedRequests = await parentalControlService.bulkRespondToPermissionRequests({
        requestIds,
        approved: true,
        responseMessage: message
      });
      
      updatedRequests.forEach(request => {
        dispatch({ type: 'UPDATE_PERMISSION_REQUEST', payload: request });
      });
      
      dispatch({ type: 'SET_SELECTED_REQUESTS', payload: [] });
    } catch (error) {
      handleError(error);
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError]);

  const bulkDenyRequests = useCallback(async (requestIds: number[], message?: string) => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      
      const updatedRequests = await parentalControlService.bulkRespondToPermissionRequests({
        requestIds,
        approved: false,
        responseMessage: message
      });
      
      updatedRequests.forEach(request => {
        dispatch({ type: 'UPDATE_PERMISSION_REQUEST', payload: request });
      });
      
      dispatch({ type: 'SET_SELECTED_REQUESTS', payload: [] });
    } catch (error) {
      handleError(error);
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError]);

  const deleteRequest = useCallback(async (requestId: number) => {
    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      
      await parentalControlService.deletePermissionRequest(requestId);
      dispatch({ type: 'REMOVE_PERMISSION_REQUEST', payload: requestId });
    } catch (error) {
      handleError(error);
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [handleError]);

  // Summary and Stats
  const loadChildSummary = useCallback(async (childUserId: number) => {
    try {
      const summary = await parentalControlService.getParentalControlSummary(childUserId);
      dispatch({ type: 'SET_CHILD_SUMMARY', payload: { childId: childUserId, summary } });
    } catch (error) {
      handleError(error);
    }
  }, [handleError]);

  const recordScreenTime = useCallback(async (childUserId: number, minutes: number) => {
    try {
      await parentalControlService.recordScreenTime(childUserId, minutes);
      // Reload summary to get updated screen time
      await loadChildSummary(childUserId);
    } catch (error) {
      handleError(error);
    }
  }, [handleError, loadChildSummary]);

  // UI State Management
  const selectChild = useCallback((childUserId: number | null) => {
    dispatch({ type: 'SET_SELECTED_CHILD', payload: childUserId });
  }, []);

  const toggleRequestModal = useCallback((show: boolean) => {
    dispatch({ type: 'TOGGLE_REQUEST_MODAL', payload: show });
  }, []);

  const toggleBulkApprovalModal = useCallback((show: boolean) => {
    dispatch({ type: 'TOGGLE_BULK_APPROVAL_MODAL', payload: show });
  }, []);

  const toggleRequestSelection = useCallback((requestId: number) => {
    const isSelected = state.selectedRequests.includes(requestId);
    const newSelection = isSelected
      ? state.selectedRequests.filter(id => id !== requestId)
      : [...state.selectedRequests, requestId];
    
    dispatch({ type: 'SET_SELECTED_REQUESTS', payload: newSelection });
  }, [state.selectedRequests]);

  const selectAllRequests = useCallback(() => {
    const pendingIds = state.pendingRequests
      .filter(req => req.status === PermissionRequestStatus.Pending)
      .map(req => req.id);
    dispatch({ type: 'SET_SELECTED_REQUESTS', payload: pendingIds });
  }, [state.pendingRequests]);

  const clearRequestSelection = useCallback(() => {
    dispatch({ type: 'SET_SELECTED_REQUESTS', payload: [] });
  }, []);

  // Utility Functions
  const hasPermission = useCallback(async (childUserId: number): Promise<boolean> => {
    try {
      return await parentalControlService.validateParentPermission(childUserId);
    } catch (error) {
      handleError(error);
      return false;
    }
  }, [handleError]);

  const requiresApproval = useCallback(async (
    childUserId: number, 
    actionType: string
  ): Promise<boolean> => {
    try {
      return await parentalControlService.requiresParentApproval(childUserId, actionType);
    } catch (error) {
      handleError(error);
      return false;
    }
  }, [handleError]);

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  const refreshData = useCallback(async () => {
    await Promise.all([
      loadAllChildrenControls(),
      loadPendingRequests(),
    ]);
  }, [loadAllChildrenControls, loadPendingRequests]);

  // Context Value
  const contextValue: ParentalControlContextType = {
    state,
    loadChildControls,
    loadAllChildrenControls,
    updateChildControls,
    deleteChildControls,
    createPermissionRequest,
    loadPendingRequests,
    loadChildRequests,
    approveRequest,
    denyRequest,
    bulkApproveRequests,
    bulkDenyRequests,
    deleteRequest,
    loadChildSummary,
    recordScreenTime,
    selectChild,
    toggleRequestModal,
    toggleBulkApprovalModal,
    toggleRequestSelection,
    selectAllRequests,
    clearRequestSelection,
    hasPermission,
    requiresApproval,
    clearError,
    refreshData,
  };

  return (
    <ParentalControlContext.Provider value={contextValue}>
      {children}
    </ParentalControlContext.Provider>
  );
}

// Custom Hook
export function useParentalControl(): ParentalControlContextType {
  const context = useContext(ParentalControlContext);
  if (context === undefined) {
    throw new Error('useParentalControl must be used within a ParentalControlProvider');
  }
  return context;
} 