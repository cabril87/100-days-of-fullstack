/*
 * Enterprise Focus SignalR Hook for TaskTracker
 * Copyright (c) 2025 Carlos Abril Jr
 * Following .cursorrules Enterprise Standards
 */

import { useEffect, useCallback, useRef } from 'react';
import type { FocusSessionStatus } from '@/lib/types/focus';

// ================================
// EXPLICIT TYPESCRIPT INTERFACES - NO ANY TYPES
// ================================

/**
 * Focus SignalR Event Types
 * ✅ EXPLICIT TYPES: Following .cursorrules requirements
 */
interface FocusSessionStartedEvent {
  sessionId: number;
  userId: number;
  taskId: number;
  taskTitle: string;
  startTime: string; // ISO string
}

interface FocusSessionPausedEvent {
  sessionId: number;
  userId: number;
  durationMinutes: number;
  accumulatedTime: number;
}

interface FocusSessionResumedEvent {
  sessionId: number;
  userId: number;
  startTime: string; // ISO string - new start time for duration calculation
}

interface FocusSessionEndedEvent {
  sessionId: number;
  userId: number;
  durationMinutes: number;
  completedAt: string; // ISO string
  pointsAwarded?: number;
  xpAwarded?: number;
}

interface FocusSessionUpdatedEvent {
  sessionId: number;
  userId: number;
  status: FocusSessionStatus;
  durationMinutes: number;
}

/**
 * Focus SignalR Hook Props
 * ✅ EXPLICIT INTERFACE: No optional any types
 */
interface UseFocusSignalRProps {
  userId: number | null;
  isConnected: boolean;
  connection: signalR.HubConnection | null;
  onSessionStarted?: (event: FocusSessionStartedEvent) => void;
  onSessionPaused?: (event: FocusSessionPausedEvent) => void;
  onSessionResumed?: (event: FocusSessionResumedEvent) => void;
  onSessionEnded?: (event: FocusSessionEndedEvent) => void;
  onSessionUpdated?: (event: FocusSessionUpdatedEvent) => void;
  onConnectionStateChange?: (isConnected: boolean) => void;
}

/**
 * Focus SignalR Hook Return Type
 * ✅ EXPLICIT INTERFACE: Clear return contract
 */
interface UseFocusSignalRReturn {
  isConnected: boolean;
  connectionState: 'Connected' | 'Disconnected' | 'Connecting' | 'Reconnecting';
  lastEventTime: Date | null;
  eventCount: number;
}

// ================================
// ENTERPRISE FOCUS SIGNALR HOOK
// ================================

/**
 * Enterprise Focus SignalR Hook
 * ✅ REAL-TIME UPDATES: Session state changes, pause/resume events
 * ✅ EXPLICIT TYPES: No any/unknown types per .cursorrules
 * ✅ ERROR HANDLING: Comprehensive error management
 * ✅ ENTERPRISE PATTERNS: Connection management, event handling
 */
export function useFocusSignalR({
  userId,
  isConnected,
  connection,
  onSessionStarted,
  onSessionPaused,
  onSessionResumed,
  onSessionEnded,
  onSessionUpdated,
  onConnectionStateChange
}: UseFocusSignalRProps): UseFocusSignalRReturn {
  
  // ================================
  // STATE MANAGEMENT
  // ================================
  
  const lastEventTimeRef = useRef<Date | null>(null);
  const eventCountRef = useRef<number>(0);
  const listenersRegisteredRef = useRef<boolean>(false);

  // ================================
  // CONNECTION STATE TRACKING
  // ================================

  const getConnectionState = useCallback((): 'Connected' | 'Disconnected' | 'Connecting' | 'Reconnecting' => {
    if (!connection) return 'Disconnected';
    
    switch (connection.state) {
      case 'Connected':
        return 'Connected';
      case 'Connecting':
        return 'Connecting';
      case 'Reconnecting':
        return 'Reconnecting';
      default:
        return 'Disconnected';
    }
  }, [connection]);

  // ================================
  // EVENT HANDLERS - EXPLICIT TYPES
  // ================================

  const handleSessionStarted = useCallback((event: FocusSessionStartedEvent) => {
    try {
      console.log('🎯 FocusSignalR: Session started event:', event);
      
      if (event.userId === userId) {
        lastEventTimeRef.current = new Date();
        eventCountRef.current += 1;
        onSessionStarted?.(event);
      }
    } catch (error) {
      console.error('❌ FocusSignalR: Error handling session started:', error);
    }
  }, [userId, onSessionStarted]);

  const handleSessionPaused = useCallback((event: FocusSessionPausedEvent) => {
    try {
      console.log('⏸️ FocusSignalR: Session paused event:', event);
      
      if (event.userId === userId) {
        lastEventTimeRef.current = new Date();
        eventCountRef.current += 1;
        onSessionPaused?.(event);
      }
    } catch (error) {
      console.error('❌ FocusSignalR: Error handling session paused:', error);
    }
  }, [userId, onSessionPaused]);

  const handleSessionResumed = useCallback((event: FocusSessionResumedEvent) => {
    try {
      console.log('▶️ FocusSignalR: Session resumed event:', event);
      
      if (event.userId === userId) {
        lastEventTimeRef.current = new Date();
        eventCountRef.current += 1;
        onSessionResumed?.(event);
      }
    } catch (error) {
      console.error('❌ FocusSignalR: Error handling session resumed:', error);
    }
  }, [userId, onSessionResumed]);

  const handleSessionEnded = useCallback((event: FocusSessionEndedEvent) => {
    try {
      console.log('🏁 FocusSignalR: Session ended event:', event);
      
      if (event.userId === userId) {
        lastEventTimeRef.current = new Date();
        eventCountRef.current += 1;
        onSessionEnded?.(event);
      }
    } catch (error) {
      console.error('❌ FocusSignalR: Error handling session ended:', error);
    }
  }, [userId, onSessionEnded]);

  const handleSessionUpdated = useCallback((event: FocusSessionUpdatedEvent) => {
    try {
      console.log('🔄 FocusSignalR: Session updated event:', event);
      
      if (event.userId === userId) {
        lastEventTimeRef.current = new Date();
        eventCountRef.current += 1;
        onSessionUpdated?.(event);
      }
    } catch (error) {
      console.error('❌ FocusSignalR: Error handling session updated:', error);
    }
  }, [userId, onSessionUpdated]);

  // ================================
  // SIGNALR EVENT REGISTRATION
  // ================================

  useEffect(() => {
    if (!connection || !isConnected || !userId || listenersRegisteredRef.current) {
      return;
    }

    try {
      console.log('🔌 FocusSignalR: Registering focus session event listeners');

      // Register all focus session event listeners
      connection.on('FocusSessionStarted', handleSessionStarted);
      connection.on('FocusSessionPaused', handleSessionPaused);
      connection.on('FocusSessionResumed', handleSessionResumed);
      connection.on('FocusSessionEnded', handleSessionEnded);
      connection.on('FocusSessionUpdated', handleSessionUpdated);

      listenersRegisteredRef.current = true;
      
      console.log('✅ FocusSignalR: Event listeners registered successfully');

    } catch (error) {
      console.error('❌ FocusSignalR: Failed to register event listeners:', error);
    }

    // Cleanup function
    return () => {
      if (connection && listenersRegisteredRef.current) {
        try {
          console.log('🧹 FocusSignalR: Cleaning up event listeners');
          
          connection.off('FocusSessionStarted', handleSessionStarted);
          connection.off('FocusSessionPaused', handleSessionPaused);
          connection.off('FocusSessionResumed', handleSessionResumed);
          connection.off('FocusSessionEnded', handleSessionEnded);
          connection.off('FocusSessionUpdated', handleSessionUpdated);
          
          listenersRegisteredRef.current = false;
          
          console.log('✅ FocusSignalR: Event listeners cleaned up');
        } catch (error) {
          console.error('❌ FocusSignalR: Error during cleanup:', error);
        }
      }
    };
  }, [
    connection, 
    isConnected, 
    userId,
    handleSessionStarted,
    handleSessionPaused,
    handleSessionResumed,
    handleSessionEnded,
    handleSessionUpdated
  ]);

  // ================================
  // CONNECTION STATE MONITORING
  // ================================

  useEffect(() => {
    onConnectionStateChange?.(isConnected);
  }, [isConnected, onConnectionStateChange]);

  // ================================
  // RETURN INTERFACE
  // ================================

  return {
    isConnected,
    connectionState: getConnectionState(),
    lastEventTime: lastEventTimeRef.current,
    eventCount: eventCountRef.current
  };
} 