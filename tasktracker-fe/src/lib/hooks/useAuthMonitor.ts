'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useAuth } from '@/lib/providers/AuthProvider';
import type { AuthHealthStatus, HealthStatusLevel } from '@/lib/types/auth/auth-monitor';

interface AuthMonitorOptions {
  enableLogging?: boolean;
  logInterval?: number;
  trackTransitions?: boolean;
}

interface AuthStatusSnapshot {
  timestamp: Date;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitializing: boolean;
  isInitialized: boolean;
  isReady: boolean;
  userEmail?: string;
  sessionId: string;
}

/**
 * Enterprise authentication monitoring hook
 * Provides detailed tracking and logging of authentication state changes
 */
export function useAuthMonitor(options: AuthMonitorOptions = {}) {
  const {
    enableLogging = false,
    logInterval = 5000,
    trackTransitions = true
  } = options;

  const auth = useAuth();
  const previousStatusRef = useRef<AuthStatusSnapshot | null>(null);
  const sessionIdRef = useRef<string>(
    `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  );

  // Create current status snapshot - wrapped in useMemo to prevent recreation on every render
  const currentStatus: AuthStatusSnapshot = useMemo(() => ({
    timestamp: new Date(),
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    isInitializing: auth.isInitializing,
    isInitialized: auth.isInitialized,
    isReady: auth.isReady,
    userEmail: auth.user?.email,
    sessionId: sessionIdRef.current
  }), [auth.isAuthenticated, auth.isLoading, auth.isInitializing, auth.isInitialized, auth.isReady, auth.user?.email]);

  // Track authentication state transitions
  useEffect(() => {
    if (!trackTransitions) return;

    const previous = previousStatusRef.current;
    if (previous) {
      // Check for meaningful state changes
      const hasStateChanged = 
        previous.isAuthenticated !== currentStatus.isAuthenticated ||
        previous.isLoading !== currentStatus.isLoading ||
        previous.isInitializing !== currentStatus.isInitializing ||
        previous.isInitialized !== currentStatus.isInitialized ||
        previous.isReady !== currentStatus.isReady ||
        previous.userEmail !== currentStatus.userEmail;

      if (hasStateChanged && enableLogging) {
        console.log('🔄 Auth State Transition:', {
          from: {
            authenticated: previous.isAuthenticated,
            loading: previous.isLoading,
            initializing: previous.isInitializing,
            initialized: previous.isInitialized,
            ready: previous.isReady,
            user: previous.userEmail || 'none'
          },
          to: {
            authenticated: currentStatus.isAuthenticated,
            loading: currentStatus.isLoading,
            initializing: currentStatus.isInitializing,
            initialized: currentStatus.isInitialized,
            ready: currentStatus.isReady,
            user: currentStatus.userEmail || 'none'
          },
          duration: currentStatus.timestamp.getTime() - previous.timestamp.getTime()
        });
      }
    }

    previousStatusRef.current = currentStatus;
  }, [
    currentStatus.isAuthenticated,
    currentStatus.isLoading,
    currentStatus.isInitializing,
    currentStatus.isInitialized,
    currentStatus.isReady,
    currentStatus.userEmail,
    trackTransitions,
    enableLogging,
    currentStatus
  ]);

  // Periodic status logging
  useEffect(() => {
    if (!enableLogging || logInterval <= 0) return;

    const interval = setInterval(() => {
      console.log('📊 Auth Status Monitor:', {
        timestamp: new Date().toISOString(),
        status: {
          authenticated: auth.isAuthenticated,
          loading: auth.isLoading,
          initializing: auth.isInitializing,
          initialized: auth.isInitialized,
          ready: auth.isReady
        },
        user: auth.user ? {
          id: auth.user.id,
          email: auth.user.email,
          role: auth.user.role,
          ageGroup: auth.user.ageGroup
        } : null,
        health: getAuthHealthStatus(auth),
        sessionId: sessionIdRef.current
      });
    }, logInterval);

    return () => clearInterval(interval);
  }, [auth, enableLogging, logInterval]);

  return {
    currentStatus,
    sessionId: sessionIdRef.current,
    healthStatus: getAuthHealthStatus(auth),
    isHealthy: isAuthHealthy(auth)
  };
}

/**
 * Determine authentication system health status
 */
function getAuthHealthStatus(auth: AuthHealthStatus): HealthStatusLevel {
  // Still initializing
  if (auth.isInitializing && !auth.isInitialized) {
    return 'initializing';
  }

  // Healthy authenticated state
  if (auth.isReady && auth.isAuthenticated && auth.user) {
    return 'healthy';
  }

  // Healthy unauthenticated state (user not logged in)
  if (auth.isReady && !auth.isAuthenticated && !auth.user) {
    return 'healthy';
  }

  // Warning states
  if (auth.isInitialized && !auth.isReady) {
    return 'warning';
  }

  if (auth.isAuthenticated && !auth.user) {
    return 'warning';
  }

  // Error state
  return 'error';
}

/**
 * Simple health check for authentication system
 */
function isAuthHealthy(auth: AuthHealthStatus): boolean {
  const status = getAuthHealthStatus(auth);
  return status === 'healthy' || status === 'initializing';
}

/**
 * Development-only authentication debug hook
 * Only active in development mode
 */
export function useAuthDebug() {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  return useAuthMonitor({
    enableLogging: isDevelopment,
    logInterval: 10000, // Log every 10 seconds in development
    trackTransitions: isDevelopment
  });
} 