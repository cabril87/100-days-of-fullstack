'use client';

/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 * 
 * SignalR Connection Hook
 * Provides enterprise-quality SignalR connection management with auto-reconnection,
 * error handling, and comprehensive state management for real-time features.
 */

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { 
  HubConnectionStatus, 
  ConnectionState, 
  ConnectionConfig, 
  SignalREventHandlers,
  SignalRConnectionError,
  SignalRAuthenticationError,
  HubConnectionInfo
} from '@/lib/types/signalr';
import { API_CONFIG } from '@/lib/config/api-client';

// ================================
// DEFAULT CONFIGURATION
// ================================

const DEFAULT_CONFIG: ConnectionConfig = {
  hubUrl: '',
  automaticReconnect: true,
  maxReconnectAttempts: 5,
  reconnectInterval: 5000, // 5 seconds
  enableLogging: process.env.NODE_ENV === 'development'
};

// ================================
// CUSTOM HOOK
// ================================

export function useSignalRConnection(
  hubUrl: string,
  eventHandlers: SignalREventHandlers = {},
  config: Partial<ConnectionConfig> = {}
) {
  // Memoize fullConfig to prevent recreation on every render (fixes ESLint warning)
  const fullConfig: ConnectionConfig = useMemo(() => ({
    ...DEFAULT_CONFIG,
    ...config,
    hubUrl
  }), [config, hubUrl]);

  // State management
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    status: HubConnectionStatus.Disconnected,
    reconnectAttempts: 0
  });

  // Connection reference
  const connectionRef = useRef<HubConnection | null>(null);
  const eventHandlersRef = useRef<SignalREventHandlers>(eventHandlers);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update event handlers reference when they change
  useEffect(() => {
    eventHandlersRef.current = eventHandlers;
  }, [eventHandlers]);

  // ================================
  // CONNECTION MANAGEMENT
  // ================================

  const updateConnectionState = useCallback((updates: Partial<ConnectionState>) => {
    setConnectionState(prev => ({ ...prev, ...updates }));
  }, []);

  // ================================
  // EVENT REGISTRATION
  // ================================

  const registerEventHandlers = useCallback((connection: HubConnection) => {
    const handlers = eventHandlersRef.current;

    // Gamification events
    if (handlers.onPointsEarned) {
      connection.on('ReceiveGamificationEvent', (event) => {
        if (event.eventType === 'PointsEarned') {
          handlers.onPointsEarned?.(event);
        }
      });
    }

    if (handlers.onAchievementUnlocked) {
      connection.on('ReceiveGamificationEvent', (event) => {
        if (event.eventType === 'AchievementUnlocked') {
          handlers.onAchievementUnlocked?.(event);
        }
      });
    }

    if (handlers.onLevelUp) {
      connection.on('ReceiveGamificationEvent', (event) => {
        if (event.eventType === 'LevelUp') {
          handlers.onLevelUp?.(event);
        }
      });
    }

    if (handlers.onStreakUpdated) {
      connection.on('ReceiveGamificationEvent', (event) => {
        if (event.eventType === 'StreakUpdated') {
          handlers.onStreakUpdated?.(event);
        }
      });
    }

    if (handlers.onBadgeEarned) {
      connection.on('ReceiveGamificationEvent', (event) => {
        if (event.eventType === 'BadgeEarned') {
          handlers.onBadgeEarned?.(event);
        }
      });
    }

    // Notification events
    if (handlers.onReceiveNotification) {
      connection.on('ReceiveNotification', handlers.onReceiveNotification);
    }

    if (handlers.onNotificationStatusUpdated) {
      connection.on('NotificationStatusUpdated', handlers.onNotificationStatusUpdated);
    }

    if (handlers.onUnreadCountUpdated) {
      connection.on('UnreadCountUpdated', handlers.onUnreadCountUpdated);
    }

    // Task events
    if (handlers.onTaskCreated) {
      connection.on('TaskCreated', handlers.onTaskCreated);
    }

    if (handlers.onTaskUpdated) {
      connection.on('TaskUpdated', handlers.onTaskUpdated);
    }

    if (handlers.onTaskDeleted) {
      connection.on('TaskDeleted', handlers.onTaskDeleted);
    }

    if (handlers.onTaskMoved) {
      connection.on('TaskMoved', handlers.onTaskMoved);
    }

    if (handlers.onTaskCompleted) {
      connection.on('TaskCompleted', handlers.onTaskCompleted);
    }

    // Board events
    if (handlers.onUserJoinedBoard) {
      connection.on('UserJoinedBoard', handlers.onUserJoinedBoard);
    }

    if (handlers.onUserLeftBoard) {
      connection.on('UserLeftBoard', handlers.onUserLeftBoard);
    }

    if (handlers.onColumnUpdated) {
      connection.on('ColumnUpdated', handlers.onColumnUpdated);
    }

    if (handlers.onWipLimitViolation) {
      connection.on('WipLimitViolation', handlers.onWipLimitViolation);
    }

    // Template events
    if (handlers.onTemplatePublished) {
      connection.on('TemplatePublished', handlers.onTemplatePublished);
    }

    if (handlers.onMarketplaceAnalyticsUpdated) {
      connection.on('MarketplaceAnalyticsUpdated', handlers.onMarketplaceAnalyticsUpdated);
    }

    if (fullConfig.enableLogging) {
      console.log(`📡 Registered ${Object.keys(handlers).length} event handlers for ${hubUrl}`);
    }
  }, [hubUrl, fullConfig.enableLogging]);

  const createConnection = useCallback(() => {
    if (connectionRef.current) {
      return connectionRef.current;
    }

    try {
      const baseUrl = API_CONFIG.BASE_URL.replace('/api', ''); // Remove /api for SignalR
      const fullHubUrl = `${baseUrl}${hubUrl}`;

      const connectionBuilder = new HubConnectionBuilder()
        .withUrl(fullHubUrl, {
          withCredentials: true, // Include cookies for authentication
          headers: {
            'Authorization': `Bearer ${getCsrfToken()}` // Add CSRF token if available
          }
        })
        .withAutomaticReconnect(fullConfig.automaticReconnect ? [0, 2000, 10000, 30000] : []);

      // Set logging level based on environment
      if (fullConfig.enableLogging) {
        connectionBuilder.configureLogging(LogLevel.Information);
      } else {
        connectionBuilder.configureLogging(LogLevel.Error);
      }

      const connection = connectionBuilder.build();

      // Connection event handlers
      connection.onclose((error) => {
        updateConnectionState({
          status: HubConnectionStatus.Disconnected,
          lastDisconnected: new Date(),
          error: error?.message
        });

        if (fullConfig.enableLogging) {
          console.log(`🔌 SignalR disconnected from ${hubUrl}:`, error?.message || 'Unknown reason');
        }

        eventHandlersRef.current.onDisconnected?.(error || undefined);

        // Note: Manual reconnection logic removed to avoid circular dependencies
        // Reconnection should be handled by the connect() function when called
      });

      connection.onreconnecting((error) => {
        updateConnectionState({
          status: HubConnectionStatus.Reconnecting,
          error: error?.message
        });

        if (fullConfig.enableLogging) {
          console.log(`🔄 SignalR reconnecting to ${hubUrl}...`);
        }

        eventHandlersRef.current.onReconnecting?.();
      });

      connection.onreconnected((connectionId) => {
        updateConnectionState({
          status: HubConnectionStatus.Connected,
          lastConnected: new Date(),
          reconnectAttempts: 0,
          error: undefined
        });

        if (fullConfig.enableLogging) {
          console.log(`✅ SignalR reconnected to ${hubUrl} with connection ID:`, connectionId);
        }

        eventHandlersRef.current.onReconnected?.();
        registerEventHandlers(connection);
      });

      connectionRef.current = connection;
      return connection;
    } catch (error) {
      const signalRError = new SignalRConnectionError(
        `Failed to create SignalR connection to ${hubUrl}`,
        'CONNECTION_CREATION_FAILED',
        500,
        { hubUrl, error }
      );

      updateConnectionState({
        status: HubConnectionStatus.Disconnected,
        error: signalRError.message
      });

      eventHandlersRef.current.onError?.(signalRError);
      throw signalRError;
    }
  }, [hubUrl, fullConfig, updateConnectionState, registerEventHandlers]);

  // ================================
  // CONNECTION CONTROL
  // ================================

  const connect = useCallback(async () => {
    if (connectionRef.current?.state === 'Connected' || 
        connectionState.status === HubConnectionStatus.Connecting ||
        connectionState.status === HubConnectionStatus.Connected) {
      if (fullConfig.enableLogging) {
        console.log(`⚠️ Already connected or connecting to ${hubUrl}`);
      }
      return;
    }

    try {
      updateConnectionState({ 
        status: HubConnectionStatus.Connecting,
        error: undefined 
      });

      const connection = createConnection();
      
      if (fullConfig.enableLogging) {
        console.log(`🔗 Connecting to SignalR hub: ${hubUrl}`);
      }

      await connection.start();
      
      updateConnectionState({
        status: HubConnectionStatus.Connected,
        lastConnected: new Date(),
        reconnectAttempts: 0
      });

      if (fullConfig.enableLogging) {
        console.log(`✅ Successfully connected to ${hubUrl} with connection ID:`, connection.connectionId);
      }

      registerEventHandlers(connection);
      eventHandlersRef.current.onConnected?.();

    } catch (error) {
      const signalRError = error instanceof Error 
        ? error 
        : new SignalRConnectionError(`Failed to connect to ${hubUrl}`, 'CONNECTION_FAILED');

      // Check if it's an authentication error
      if (signalRError.message.includes('401') || signalRError.message.includes('Unauthorized')) {
        const authError = new SignalRAuthenticationError();
        updateConnectionState({
          status: HubConnectionStatus.Disconnected,
          error: authError.message
        });
        eventHandlersRef.current.onError?.(authError);
        throw authError;
      }

      updateConnectionState({
        status: HubConnectionStatus.Disconnected,
        error: signalRError.message
      });

      if (fullConfig.enableLogging) {
        console.error(`❌ Failed to connect to ${hubUrl}:`, signalRError.message);
      }

      eventHandlersRef.current.onError?.(signalRError);
      
      // Note: Manual reconnection removed to avoid circular dependencies
      // If manual reconnection is needed, the consuming component should call connect() again

      throw signalRError;
    }
  }, [createConnection, registerEventHandlers, hubUrl, fullConfig, updateConnectionState]);

  const disconnect = useCallback(async () => {
    // Clear timeout directly to avoid dependency
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (connectionRef.current) {
      try {
        updateConnectionState({ status: HubConnectionStatus.Disconnecting });
        
        if (fullConfig.enableLogging) {
          console.log(`🔌 Disconnecting from ${hubUrl}`);
        }

        await connectionRef.current.stop();
        connectionRef.current = null;

        updateConnectionState({
          status: HubConnectionStatus.Disconnected,
          lastDisconnected: new Date()
        });

        if (fullConfig.enableLogging) {
          console.log(`✅ Successfully disconnected from ${hubUrl}`);
        }

      } catch (error) {
        const signalRError = error instanceof Error 
          ? error 
          : new SignalRConnectionError(`Failed to disconnect from ${hubUrl}`, 'DISCONNECTION_FAILED');

        updateConnectionState({
          status: HubConnectionStatus.Disconnected,
          error: signalRError.message
        });

        if (fullConfig.enableLogging) {
          console.error(`❌ Error during disconnection from ${hubUrl}:`, signalRError.message);
        }

        eventHandlersRef.current.onError?.(signalRError);
      }
    }
  }, [fullConfig.enableLogging, hubUrl, updateConnectionState]);

  // Remove unused scheduleReconnect function (was causing linting error)
  // Reconnection logic is now inlined where needed to avoid circular dependencies

  // ================================
  // LIFECYCLE MANAGEMENT
  // ================================

  useEffect(() => {
    // Auto-connect when component mounts - only if disconnected
    if (connectionState.status === HubConnectionStatus.Disconnected) {
      connect().catch(() => {
        // Error already handled in connect function
      });
    }

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, []); // Empty dependency array to run only on mount/unmount

  // ================================
  // PUBLIC API
  // ================================

  const connectionInfo: HubConnectionInfo = {
    hubUrl: fullConfig.hubUrl,
    connectionId: connectionRef.current?.connectionId || undefined,
    state: connectionState,
    config: fullConfig
  };

  return {
    // Connection state
    connectionState,
    connectionInfo,
    isConnected: connectionState.status === HubConnectionStatus.Connected,
    isConnecting: connectionState.status === HubConnectionStatus.Connecting,
    isReconnecting: connectionState.status === HubConnectionStatus.Reconnecting,
    
    // Connection control
    connect,
    disconnect,
    
    // Connection instance (for advanced use cases)
    connection: connectionRef.current
  };
}

// ================================
// UTILITY FUNCTIONS
// ================================

function getCsrfToken(): string | null {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'XSRF-TOKEN' || name === 'csrf_token') {
      return decodeURIComponent(value);
    }
  }
  return null;
}

// ================================
// SPECIALIZED HOOKS
// ================================

export function useMainHubConnection(eventHandlers: SignalREventHandlers = {}) {
  return useSignalRConnection('/hubs/main', eventHandlers);
}

export function useCalendarHubConnection(eventHandlers: SignalREventHandlers = {}) {
  return useSignalRConnection('/hubs/calendar', eventHandlers);
} 