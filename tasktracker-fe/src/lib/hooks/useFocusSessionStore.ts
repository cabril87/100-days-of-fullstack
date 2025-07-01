/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 *
 * This file may not be used, copied, modified, or distributed except in
 * accordance with the terms contained in the LICENSE file.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { focusSessionStore } from '@/lib/stores/focusSessionStore';
import type { 
  FocusSession, 
  FocusSessionState,
  TimerState
} from '@/lib/types/focus';

// ============================================================================
// HOOK RETURN INTERFACE - ENTERPRISE TYPESCRIPT STANDARDS
// ============================================================================

interface UseFocusSessionStoreReturn {
  // State
  session: FocusSession | null;
  focusState: FocusSessionState;
  timerState: TimerState;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  
  // Actions
  startSession: (session: FocusSession, userId: string) => Promise<void>;
  pauseSession: () => Promise<void>;
  resumeSession: () => Promise<void>;
  completeSession: () => Promise<void>;
  clearSession: () => Promise<void>;
  updateSessionData: (session: FocusSession) => Promise<void>;
  
  // Utilities
  getElapsedMinutes: () => number;
  getFormattedTime: () => string;
  isSessionActive: () => boolean;
  canPause: () => boolean;
  canResume: () => boolean;
}

// ============================================================================
// FOCUS SESSION STORE HOOK - ENTERPRISE REACT PATTERNS
// ============================================================================

/**
 * Enterprise-grade React hook for focus session management
 * 
 * Provides persistent, cross-tab synchronized focus session state
 * with automatic timer restoration and robust error handling.
 * 
 * Features:
 * - Persistent session state across page refreshes
 * - Cross-tab synchronization using localStorage events
 * - Automatic timer restoration with accurate elapsed time
 * - Enterprise-grade error handling and validation
 * - Real-time state updates via subscription pattern
 * 
 * @returns Object containing session state and management functions
 */
export function useFocusSessionStore(): UseFocusSessionStoreReturn {
  // ============================================================================
  // LOCAL STATE MANAGEMENT
  // ============================================================================
  
  const [state, setState] = useState(() => focusSessionStore.getState());
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const mounted = useRef(true);

  // ============================================================================
  // STORE SUBSCRIPTION MANAGEMENT
  // ============================================================================

  useEffect(() => {
    mounted.current = true;
    
    // Subscribe to store changes
    unsubscribeRef.current = focusSessionStore.subscribe((newState) => {
      if (mounted.current) {
        setState(newState);
      }
    });

    // Cleanup subscription on unmount
    return () => {
      mounted.current = false;
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, []);

  // ============================================================================
  // ACTION CREATORS - MEMOIZED FOR PERFORMANCE
  // ============================================================================

  const startSession = useCallback(async (session: FocusSession, userId: string): Promise<void> => {
    try {
      await focusSessionStore.startSession(session, userId);
    } catch (error) {
      console.error('🚨 useFocusSessionStore: Failed to start session:', error);
      throw error;
    }
  }, []);

  const pauseSession = useCallback(async (): Promise<void> => {
    try {
      await focusSessionStore.pauseSession();
    } catch (error) {
      console.error('🚨 useFocusSessionStore: Failed to pause session:', error);
      throw error;
    }
  }, []);

  const resumeSession = useCallback(async (): Promise<void> => {
    try {
      await focusSessionStore.resumeSession();
    } catch (error) {
      console.error('🚨 useFocusSessionStore: Failed to resume session:', error);
      throw error;
    }
  }, []);

  const completeSession = useCallback(async (): Promise<void> => {
    try {
      await focusSessionStore.completeSession();
    } catch (error) {
      console.error('🚨 useFocusSessionStore: Failed to complete session:', error);
      throw error;
    }
  }, []);

  const clearSession = useCallback(async (): Promise<void> => {
    try {
      await focusSessionStore.clearSession();
    } catch (error) {
      console.error('🚨 useFocusSessionStore: Failed to clear session:', error);
      throw error;
    }
  }, []);

  const updateSessionData = useCallback(async (session: FocusSession): Promise<void> => {
    try {
      await focusSessionStore.updateSessionData(session);
    } catch (error) {
      console.error('🚨 useFocusSessionStore: Failed to update session data:', error);
      throw error;
    }
  }, []);

  // ============================================================================
  // UTILITY FUNCTIONS - DERIVED STATE CALCULATIONS
  // ============================================================================

  const getElapsedMinutes = useCallback((): number => {
    return Math.floor(state.timerState.elapsedSeconds / 60);
  }, [state.timerState.elapsedSeconds]);

  const getFormattedTime = useCallback((): string => {
    return state.timerState.displayTime;
  }, [state.timerState.displayTime]);

  const isSessionActive = useCallback((): boolean => {
    return state.focusState === 'IN_PROGRESS' || state.focusState === 'PAUSED';
  }, [state.focusState]);

  const canPause = useCallback((): boolean => {
    return state.focusState === 'IN_PROGRESS' && state.timerState.isRunning;
  }, [state.focusState, state.timerState.isRunning]);

  const canResume = useCallback((): boolean => {
    return state.focusState === 'PAUSED' && !state.timerState.isRunning;
  }, [state.focusState, state.timerState.isRunning]);

  // ============================================================================
  // RETURN HOOK API - ENTERPRISE INTERFACE
  // ============================================================================

  return {
    // Current state
    session: state.session,
    focusState: state.focusState,
    timerState: state.timerState,
    isLoading: state.isLoading,
    error: state.error,
    isInitialized: state.isInitialized,
    
    // Session management actions
    startSession,
    pauseSession,
    resumeSession,
    completeSession,
    clearSession,
    updateSessionData,
    
    // Utility functions
    getElapsedMinutes,
    getFormattedTime,
    isSessionActive,
    canPause,
    canResume
  };
}

// ============================================================================
// SPECIALIZED HOOKS - CONVENIENCE PATTERNS
// ============================================================================

/**
 * Hook for components that only need timer display
 */
export function useFocusTimer(): {
  displayTime: string;
  elapsedSeconds: number;
  elapsedMinutes: number;
  isRunning: boolean;
  isPaused: boolean;
} {
  const { timerState, getElapsedMinutes } = useFocusSessionStore();
  
  return {
    displayTime: timerState.displayTime,
    elapsedSeconds: timerState.elapsedSeconds,
    elapsedMinutes: getElapsedMinutes(),
    isRunning: timerState.isRunning,
    isPaused: timerState.isPaused
  };
}

/**
 * Hook for components that only need session status
 */
export function useFocusStatus(): {
  focusState: FocusSessionState;
  hasActiveSession: boolean;
  sessionTask: string | null;
  canPause: boolean;
  canResume: boolean;
  isInitialized: boolean;
} {
  const { 
    focusState, 
    session, 
    canPause, 
    canResume, 
    isInitialized,
    isSessionActive 
  } = useFocusSessionStore();
  
  return {
    focusState,
    hasActiveSession: isSessionActive(),
    sessionTask: session?.taskItem?.title || null,
    canPause: canPause(),
    canResume: canResume(),
    isInitialized
  };
} 