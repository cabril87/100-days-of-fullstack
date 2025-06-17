'use client';

/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 * 
 * Enterprise SignalR Connection Hook
 * Provides production-ready SignalR connection management with comprehensive
 * error handling, authentication, performance optimization, and connection resilience.
 */

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { HubConnection, HubConnectionBuilder, LogLevel, HubConnectionState } from '@microsoft/signalr';
import { 
  HubConnectionStatus, 
  ConnectionState, 
  ConnectionConfig, 
  SignalREventHandlers,
  SignalRConnectionError,
  SignalRAuthenticationError
} from '@/lib/types/signalr';
import { API_CONFIG } from '@/lib/config/api-client';
import { useAuth } from '@/lib/providers/AuthProvider';

// ================================
// ENTERPRISE CONFIGURATION
// ================================

const ENTERPRISE_CONFIG: ConnectionConfig = {
  hubUrl: '',
  automaticReconnect: true,
  maxReconnectAttempts: 10,
  reconnectInterval: 2000, // Start with 2 seconds
  enableLogging: process.env.NODE_ENV === 'development'
};

// Exponential backoff for reconnection attempts
const RECONNECT_DELAYS = [0, 2000, 5000, 10000, 15000, 30000]; // Up to 30 seconds

// ================================
// ENTERPRISE SIGNALR HOOK
// ================================

export function useSignalRConnection(
  hubUrl: string,
  eventHandlers: SignalREventHandlers = {},
  config: Partial<ConnectionConfig> = {}
) {
  // Get authentication status
  const { isAuthenticated } = useAuth();

  // Memoize configuration to prevent recreation
  const fullConfig: ConnectionConfig = useMemo(() => ({
    ...ENTERPRISE_CONFIG,
    ...config,
    hubUrl
  }), [config, hubUrl]);

  // Enhanced state management
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    status: HubConnectionStatus.Disconnected,
    reconnectAttempts: 0,
    lastConnected: undefined,
    lastDisconnected: undefined,
    error: undefined
  });

  // Connection and cleanup references
  const connectionRef = useRef<HubConnection | null>(null);
  const eventHandlersRef = useRef<SignalREventHandlers>(eventHandlers);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);
  const isCleanupInProgressRef = useRef(false);
  const mountedRef = useRef(true);

  // Update event handlers reference when they change
  useEffect(() => {
    eventHandlersRef.current = eventHandlers;
  }, [eventHandlers]);

  // ================================
  // AUTHENTICATION INTEGRATION
  // ================================

  const getAuthHeaders = useCallback(async (): Promise<Record<string, string>> => {
    const headers: Record<string, string> = {};
    
    try {
      // Get CSRF token from cookie (XSRF-TOKEN) as expected by backend
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'XSRF-TOKEN') {
          headers['X-CSRF-Token'] = decodeURIComponent(value);
        }
      }

      // Add custom headers for enterprise features
      headers['X-Requested-With'] = 'XMLHttpRequest';
      headers['X-SignalR-Version'] = '1.0';
      
      if (fullConfig.enableLogging) {
        console.log('🔐 Auth headers prepared for SignalR connection');
      }
    } catch (error) {
      console.error('❌ Failed to get auth headers:', error);
    }

    return headers;
  }, [fullConfig.enableLogging]);

  // ================================
  // CONNECTION STATE MANAGEMENT
  // ================================

  const updateConnectionState = useCallback((updates: Partial<ConnectionState>) => {
    if (!mountedRef.current) return;
    
    setConnectionState(prev => {
      const newState = { ...prev, ...updates };
      
      if (fullConfig.enableLogging) {
        console.log(`📡 SignalR State Update [${hubUrl}]:`, {
          from: prev.status,
          to: newState.status,
          reconnectAttempts: newState.reconnectAttempts,
          error: newState.error
        });
      }
      
      return newState;
    });
  }, [hubUrl, fullConfig.enableLogging]);

  // ================================
  // ENTERPRISE EVENT REGISTRATION
  // ================================

  const registerEventHandlers = useCallback((connection: HubConnection) => {
    const handlers = eventHandlersRef.current;
    let registeredCount = 0;

    try {
      // Gamification events - Enhanced with error handling
      if (handlers.onPointsEarned) {
        connection.on('ReceiveGamificationEvent', (event) => {
          try {
            if (event?.eventType === 'PointsEarned' && mountedRef.current) {
              handlers.onPointsEarned?.(event);
            }
          } catch (error) {
            console.error('❌ Error handling PointsEarned event:', error);
          }
        });
        registeredCount++;
      }

      if (handlers.onAchievementUnlocked) {
        connection.on('ReceiveGamificationEvent', (event) => {
          try {
            if (event?.eventType === 'AchievementUnlocked' && mountedRef.current) {
              handlers.onAchievementUnlocked?.(event);
            }
          } catch (error) {
            console.error('❌ Error handling AchievementUnlocked event:', error);
          }
        });
        registeredCount++;
      }

      if (handlers.onLevelUp) {
        connection.on('ReceiveGamificationEvent', (event) => {
          try {
            if (event?.eventType === 'LevelUp' && mountedRef.current) {
              handlers.onLevelUp?.(event);
            }
          } catch (error) {
            console.error('❌ Error handling LevelUp event:', error);
          }
        });
        registeredCount++;
      }

      if (handlers.onStreakUpdated) {
        connection.on('ReceiveGamificationEvent', (event) => {
          try {
            if (event?.eventType === 'StreakUpdated' && mountedRef.current) {
              handlers.onStreakUpdated?.(event);
            }
          } catch (error) {
            console.error('❌ Error handling StreakUpdated event:', error);
          }
        });
        registeredCount++;
      }

      if (handlers.onBadgeEarned) {
        connection.on('ReceiveGamificationEvent', (event) => {
          try {
            if (event?.eventType === 'BadgeEarned' && mountedRef.current) {
              handlers.onBadgeEarned?.(event);
            }
          } catch (error) {
            console.error('❌ Error handling BadgeEarned event:', error);
          }
        });
        registeredCount++;
      }

      // Notification events - Enhanced with validation
      if (handlers.onReceiveNotification) {
        connection.on('ReceiveNotification', (event) => {
          try {
            if (event && mountedRef.current) {
              handlers.onReceiveNotification?.(event);
            }
          } catch (error) {
            console.error('❌ Error handling ReceiveNotification event:', error);
          }
        });
        registeredCount++;
      }

      if (handlers.onNotificationStatusUpdated) {
        connection.on('NotificationStatusUpdated', (event) => {
          try {
            if (event && mountedRef.current) {
              handlers.onNotificationStatusUpdated?.(event);
            }
          } catch (error) {
            console.error('❌ Error handling NotificationStatusUpdated event:', error);
          }
        });
        registeredCount++;
      }

      if (handlers.onUnreadCountUpdated) {
        connection.on('UnreadCountUpdated', (event) => {
          try {
            if (event && mountedRef.current) {
              handlers.onUnreadCountUpdated?.(event);
            }
          } catch (error) {
            console.error('❌ Error handling UnreadCountUpdated event:', error);
          }
        });
        registeredCount++;
      }

      // Task events - Enhanced with null checking
      if (handlers.onTaskCreated) {
        connection.on('TaskCreated', (event) => {
          try {
            if (event && mountedRef.current) {
              handlers.onTaskCreated?.(event);
            }
          } catch (error) {
            console.error('❌ Error handling TaskCreated event:', error);
          }
        });
        registeredCount++;
      }

      if (handlers.onTaskUpdated) {
        connection.on('TaskUpdated', (event) => {
          try {
            if (event && mountedRef.current) {
              handlers.onTaskUpdated?.(event);
            }
          } catch (error) {
            console.error('❌ Error handling TaskUpdated event:', error);
          }
        });
        registeredCount++;
      }

      if (handlers.onTaskDeleted) {
        connection.on('TaskDeleted', (event) => {
          try {
            if (event && mountedRef.current) {
              handlers.onTaskDeleted?.(event);
            }
          } catch (error) {
            console.error('❌ Error handling TaskDeleted event:', error);
          }
        });
        registeredCount++;
      }

      if (handlers.onTaskMoved) {
        connection.on('TaskMoved', (event) => {
          try {
            if (event && mountedRef.current) {
              handlers.onTaskMoved?.(event);
            }
          } catch (error) {
            console.error('❌ Error handling TaskMoved event:', error);
          }
        });
        registeredCount++;
      }

      if (handlers.onTaskCompleted) {
        connection.on('TaskCompleted', (event) => {
          try {
            if (event && mountedRef.current) {
              handlers.onTaskCompleted?.(event);
            }
          } catch (error) {
            console.error('❌ Error handling TaskCompleted event:', error);
          }
        });
        registeredCount++;
      }

      // Board events - Enhanced with error boundaries
      if (handlers.onUserJoinedBoard) {
        connection.on('UserJoinedBoard', (event) => {
          try {
            if (event && mountedRef.current) {
              handlers.onUserJoinedBoard?.(event);
            }
          } catch (error) {
            console.error('❌ Error handling UserJoinedBoard event:', error);
          }
        });
        registeredCount++;
      }

      if (handlers.onUserLeftBoard) {
        connection.on('UserLeftBoard', (event) => {
          try {
            if (event && mountedRef.current) {
              handlers.onUserLeftBoard?.(event);
            }
          } catch (error) {
            console.error('❌ Error handling UserLeftBoard event:', error);
          }
        });
        registeredCount++;
      }

      if (handlers.onColumnUpdated) {
        connection.on('ColumnUpdated', (event) => {
          try {
            if (event && mountedRef.current) {
              handlers.onColumnUpdated?.(event);
            }
          } catch (error) {
            console.error('❌ Error handling ColumnUpdated event:', error);
          }
        });
        registeredCount++;
      }

      if (handlers.onWipLimitViolation) {
        connection.on('WipLimitViolation', (event) => {
          try {
            if (event && mountedRef.current) {
              handlers.onWipLimitViolation?.(event);
            }
          } catch (error) {
            console.error('❌ Error handling WipLimitViolation event:', error);
          }
        });
        registeredCount++;
      }

      // Template events - With comprehensive error handling
      if (handlers.onTemplatePublished) {
        connection.on('TemplatePublished', (event) => {
          try {
            if (event && mountedRef.current) {
              handlers.onTemplatePublished?.(event);
            }
          } catch (error) {
            console.error('❌ Error handling TemplatePublished event:', error);
          }
        });
        registeredCount++;
      }

      if (handlers.onMarketplaceAnalyticsUpdated) {
        connection.on('MarketplaceAnalyticsUpdated', (event) => {
          try {
            if (event && mountedRef.current) {
              handlers.onMarketplaceAnalyticsUpdated?.(event);
            }
          } catch (error) {
            console.error('❌ Error handling MarketplaceAnalyticsUpdated event:', error);
          }
        });
        registeredCount++;
      }

      if (fullConfig.enableLogging) {
        console.log(`✅ Registered ${registeredCount} enterprise event handlers for ${hubUrl}`);
      }

    } catch (error) {
      console.error(`❌ Failed to register event handlers for ${hubUrl}:`, error);
      throw new SignalRConnectionError('Failed to register event handlers', 'REGISTRATION_FAILED', 500, { hubUrl, error });
    }
  }, [hubUrl, fullConfig.enableLogging]);

  // ================================
  // ENTERPRISE CONNECTION CREATION
  // ================================

  const createConnection = useCallback(async () => {
    if (connectionRef.current && connectionRef.current.state !== HubConnectionState.Disconnected) {
      return connectionRef.current;
    }

    try {
      // For SignalR hubs, we need the base backend URL without /api
      // API controllers use: http://localhost:5000/api/v1/gamification  
      // SignalR hubs use: http://localhost:5000/hubs/main
      const backendBaseUrl = API_CONFIG.BASE_URL.replace('/api', ''); 
      const fullHubUrl = `${backendBaseUrl}${hubUrl}`;
      
      // Get CSRF token before establishing SignalR connection
      try {
        await fetch(`${backendBaseUrl}/api/v1/auth/csrf`, {
          method: 'GET',
          credentials: 'include',
        });
        if (fullConfig.enableLogging) {
          console.log('🔐 CSRF token refreshed for SignalR connection');
        }
      } catch (error) {
        console.warn('⚠️ Failed to get CSRF token, continuing anyway:', error);
      }
      
      const authHeaders = await getAuthHeaders();

      const connectionBuilder = new HubConnectionBuilder()
        .withUrl(fullHubUrl, {
          // Enhanced transport options for enterprise
          skipNegotiation: false,
          transport: undefined, // Let SignalR choose the best transport
          headers: authHeaders,
          withCredentials: true, // Important for cookie-based auth - this will send HTTP-only cookies
          // Enhanced timeout settings
          timeout: 30000, // 30 seconds
        })
        .configureLogging(fullConfig.enableLogging ? LogLevel.Information : LogLevel.Error);

      // Enterprise-grade automatic reconnection with exponential backoff
      if (fullConfig.automaticReconnect) {
        connectionBuilder.withAutomaticReconnect(RECONNECT_DELAYS);
      }

      const connection = connectionBuilder.build();

      // Enhanced connection event handlers
      connection.onreconnecting(() => {
        if (mountedRef.current) {
          updateConnectionState({ 
            status: HubConnectionStatus.Reconnecting,
            error: undefined 
          });
          eventHandlersRef.current.onReconnecting?.();
        }
      });

      connection.onreconnected(() => {
        if (mountedRef.current) {
          updateConnectionState({ 
            status: HubConnectionStatus.Connected,
            lastConnected: new Date(),
            reconnectAttempts: 0,
            error: undefined 
          });
          eventHandlersRef.current.onReconnected?.();
          
          if (fullConfig.enableLogging) {
            console.log(`🎉 Successfully reconnected to ${hubUrl}`);
          }
        }
      });

      connection.onclose((error) => {
        if (mountedRef.current) {
          const errorMessage = error ? error.message : 'Connection closed';
          
          // Enhanced logging for debugging connection issues
          if (fullConfig.enableLogging) {
            console.log(`🔌 Connection closed for ${hubUrl}:`, {
              error: errorMessage,
              errorType: error?.name,
              wasConnected: connectionState.status === HubConnectionStatus.Connected,
              lastConnected: connectionState.lastConnected,
              mountedState: mountedRef.current,
              cleanupInProgress: isCleanupInProgressRef.current
            });
          }
          
          updateConnectionState({
            status: HubConnectionStatus.Disconnected,
            lastDisconnected: new Date(),
            error: errorMessage 
          });
          eventHandlersRef.current.onDisconnected?.(error || new Error(errorMessage));
        }
      });

      // Register all event handlers with enhanced error boundaries
      try {
        registerEventHandlers(connection);
        if (fullConfig.enableLogging) {
          console.log(`📝 Event handlers registered for ${hubUrl}`);
        }
      } catch (handlerError) {
        console.error(`❌ Failed to register event handlers for ${hubUrl}:`, handlerError);
        // Continue with connection even if event handlers fail
      }

      connectionRef.current = connection;
      return connection;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown connection error';
      const signalRError = new SignalRConnectionError(
        `Failed to create SignalR connection to ${hubUrl}`,
        'CONNECTION_CREATION_FAILED',
        500,
        { hubUrl, originalError: errorMessage }
      );
      
      updateConnectionState({ 
        status: HubConnectionStatus.Disconnected,
        error: signalRError.message 
      });
      
      throw signalRError;
    }
  }, [hubUrl, getAuthHeaders, fullConfig, updateConnectionState, registerEventHandlers, connectionState]);

  // ================================
  // ENTERPRISE CONNECTION METHODS
  // ================================

  const connect = useCallback(async () => {
    if (isCleanupInProgressRef.current || !mountedRef.current) {
      return;
    }

    // Skip connection if user is not authenticated
    if (!isAuthenticated) {
      if (fullConfig.enableLogging) {
        console.log(`🔐 Skipping SignalR connection to ${hubUrl} - user not authenticated`);
      }
      updateConnectionState({ 
        status: HubConnectionStatus.Disconnected,
        error: 'User not authenticated'
      });
      return;
    }

    try {
      updateConnectionState({ 
        status: HubConnectionStatus.Connecting,
        error: undefined 
      });

      const connection = await createConnection();
      
      if (connection.state === HubConnectionState.Disconnected) {
        if (fullConfig.enableLogging) {
          console.log(`🔗 Starting connection to ${hubUrl}...`);
        }
        
        await connection.start();
        
        if (mountedRef.current) {
          reconnectAttemptsRef.current = 0;
          
          updateConnectionState({ 
            status: HubConnectionStatus.Connected,
            lastConnected: new Date(),
            reconnectAttempts: 0,
            error: undefined 
          });
          eventHandlersRef.current.onConnected?.();
          
          if (fullConfig.enableLogging) {
            console.log(`🚀 Successfully connected to ${hubUrl}`);
          }
        }
      } else {
        if (fullConfig.enableLogging) {
          console.log(`📋 Connection already in state: ${connection.state} for ${hubUrl}`);
        }
      }
    } catch (error) {
      if (mountedRef.current) {
        const errorMessage = error instanceof Error ? error.message : 'Connection failed';
        const isAuthError = errorMessage.includes('401') || errorMessage.includes('unauthorized');
        
        const signalRError = isAuthError 
          ? new SignalRAuthenticationError()
          : new SignalRConnectionError(errorMessage, 'CONNECTION_FAILED', 500);
        
        reconnectAttemptsRef.current += 1;
        
        updateConnectionState({ 
          status: HubConnectionStatus.Disconnected,
          error: signalRError.message,
          reconnectAttempts: reconnectAttemptsRef.current
        });
        
        eventHandlersRef.current.onError?.(signalRError);
        
        // Attempt reconnection with exponential backoff
        if (fullConfig.automaticReconnect && reconnectAttemptsRef.current < fullConfig.maxReconnectAttempts) {
          const delay = RECONNECT_DELAYS[Math.min(reconnectAttemptsRef.current, RECONNECT_DELAYS.length - 1)];
          
          if (fullConfig.enableLogging) {
            console.log(`🔄 Retrying connection to ${hubUrl} in ${delay}ms (attempt ${reconnectAttemptsRef.current})`);
          }
          
          reconnectTimeoutRef.current = setTimeout(() => {
            if (mountedRef.current) {
              connect();
            }
          }, delay);
        }
      }
    }
  }, [createConnection, hubUrl, fullConfig, updateConnectionState]);

  const disconnect = useCallback(async () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (connectionRef.current && connectionRef.current.state !== HubConnectionState.Disconnected) {
      try {
        updateConnectionState({ status: HubConnectionStatus.Disconnecting });
        await connectionRef.current.stop();
        
        if (fullConfig.enableLogging) {
          console.log(`🛑 Disconnected from ${hubUrl}`);
        }
      } catch (error) {
        console.error(`❌ Error disconnecting from ${hubUrl}:`, error);
      }
    }

    connectionRef.current = null;
    
    if (mountedRef.current) {
      updateConnectionState({ 
        status: HubConnectionStatus.Disconnected,
        lastDisconnected: new Date() 
      });
    }
  }, [hubUrl, fullConfig.enableLogging, updateConnectionState]);

  const reconnect = useCallback(async () => {
    await disconnect();
    await connect();
  }, [disconnect, connect]);

  // ================================
  // ENTERPRISE LIFECYCLE MANAGEMENT
  // ================================

  // Auto-connect on mount, but only if authenticated
  useEffect(() => {
    mountedRef.current = true;
    
    // Only connect if user is authenticated
    if (isAuthenticated) {
      connect();
    } else if (fullConfig.enableLogging) {
      console.log(`🔐 Skipping SignalR connection to ${hubUrl} - user not authenticated`);
    }

    return () => {
      mountedRef.current = false;
      isCleanupInProgressRef.current = true;
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      disconnect();
    };
  }, [connect, disconnect, isAuthenticated, hubUrl, fullConfig.enableLogging]);

  // ================================
  // ENTERPRISE UTILITY METHODS
  // ================================

  const isConnected = connectionState.status === HubConnectionStatus.Connected;
  const isConnecting = connectionState.status === HubConnectionStatus.Connecting;
  const isReconnecting = connectionState.status === HubConnectionStatus.Reconnecting;

  const joinGroup = useCallback(async (groupName: string) => {
    const connection = connectionRef.current;
    if (connection && connection.state === HubConnectionState.Connected) {
      try {
        await connection.invoke('JoinGroup', groupName);
        if (fullConfig.enableLogging) {
          console.log(`👥 Joined group: ${groupName}`);
        }
      } catch (error) {
        console.error(`❌ Failed to join group ${groupName}:`, error);
        throw error;
      }
    } else {
      throw new SignalRConnectionError('Cannot join group: not connected', 'NOT_CONNECTED');
    }
  }, [fullConfig.enableLogging]);

  const leaveGroup = useCallback(async (groupName: string) => {
    const connection = connectionRef.current;
    if (connection && connection.state === HubConnectionState.Connected) {
      try {
        await connection.invoke('LeaveGroup', groupName);
        if (fullConfig.enableLogging) {
          console.log(`👋 Left group: ${groupName}`);
        }
      } catch (error) {
        console.error(`❌ Failed to leave group ${groupName}:`, error);
        throw error;
      }
    }
  }, [fullConfig.enableLogging]);

  // ================================
  // ENTERPRISE API RETURN
  // ================================

  return {
    // Connection state
    connectionState,
    isConnected,
    isConnecting,
    isReconnecting,
    
    // Connection methods
    connect,
    disconnect,
    reconnect,
    
    // Group management
    joinGroup,
    leaveGroup,
    
    // Raw connection for advanced usage
    connection: connectionRef.current
  };
}

// ================================
// CONVENIENCE HOOKS
// ================================

export function useMainHubConnection(eventHandlers: SignalREventHandlers = {}) {
  return useSignalRConnection('/hubs/main', eventHandlers);
}

export function useCalendarHubConnection(eventHandlers: SignalREventHandlers = {}) {
  return useSignalRConnection('/hubs/calendar', eventHandlers);
} 