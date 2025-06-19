'use client';

/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 * 
 * SignalR Connection Manager
 * Enterprise-grade centralized connection management to prevent multiple competing connections.
 * Implements singleton pattern with shared state across all components.
 * 
 * UPDATED: Enhanced with authentication checks and public page handling
 */

import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { 
  ConnectionState, 
  HubConnectionStatus
} from '@/lib/types/signalr';
import { SignalREventHandlers } from '@/lib/types/signalr-events';
import { useAuth } from '@/lib/providers/AuthProvider';

type ConnectionStateSubscriber = (state: ConnectionState) => void;

// ================================
// SINGLETON CONNECTION MANAGER
// ================================

class SignalRConnectionManager {
  private static instance: SignalRConnectionManager;
  private connection: HubConnection | null = null;
  private eventHandlers: Map<string, SignalREventHandlers> = new Map();
  private subscribers: Set<ConnectionStateSubscriber> = new Set();
  private connectionState: ConnectionState = {
    status: HubConnectionStatus.Disconnected,
    lastConnected: undefined,
    lastDisconnected: undefined,
    reconnectAttempts: 0,
    error: undefined
  };
  private isConnecting = false;
  private isDisconnecting = false;
  private connectionPromise: Promise<void> | null = null;
  private reconnectTimeoutId: NodeJS.Timeout | null = null;
  private lastConnectionAttempt = 0;
  private readonly connectionThrottleMs = 1000; // Prevent rapid connection attempts
  private lastThrottleLogTime = 0;

  // ✨ ENTERPRISE: Advanced reconnection strategy with exponential backoff
  private reconnectionStrategy = {
    attempts: 0,
    maxAttempts: 10,
    baseDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 1.5,
    jitterRange: 0.1,
    lastAttemptTime: 0
  };

  // Authentication state
  private isAuthenticated = false;
  private authReady = false;



  static getInstance(): SignalRConnectionManager {
    if (!SignalRConnectionManager.instance) {
      SignalRConnectionManager.instance = new SignalRConnectionManager();
      // Start state validation after instance creation
      SignalRConnectionManager.instance.startStateValidation();
    }
    return SignalRConnectionManager.instance;
  }

  updateAuthState(isAuthenticated: boolean, authReady: boolean) {
    console.log(`🔐 Auth state updated: authenticated=${isAuthenticated}, ready=${authReady}`);
    const wasAuthenticated = this.isAuthenticated;
    this.isAuthenticated = isAuthenticated;
    this.authReady = authReady;

    // If user logged out, disconnect immediately
    if (wasAuthenticated && !isAuthenticated) {
      console.log('🔐 User logged out, disconnecting SignalR');
      this.disconnect();
    }
    // If user just authenticated and we have handlers, try to connect
    else if (!wasAuthenticated && isAuthenticated && this.eventHandlers.size > 0) {
      console.log('🔐 User authenticated, attempting to connect');
      this.connect().catch(error => {
        console.error('Failed to connect after authentication:', error);
      });
    }
  }

  private shouldConnect(): boolean {
    const shouldConnect = this.isAuthenticated && 
                         this.authReady && 
                         this.eventHandlers.size > 0 &&
                         !this.isDisconnecting;
    
    console.log(`🔍 Should connect check: auth=${this.isAuthenticated}, ready=${this.authReady}, handlers=${this.eventHandlers.size}, disconnecting=${this.isDisconnecting} → ${shouldConnect}`);
    return shouldConnect;
  }

  subscribe(callback: ConnectionStateSubscriber): () => void {
    this.subscribers.add(callback);
    // Immediately notify the subscriber of current state
    callback(this.connectionState);
    
    return () => {
      this.subscribers.delete(callback);
    };
  }

  // Update connection state and notify subscribers - enterprise optimized
  private updateConnectionState(updates: Partial<ConnectionState>) {
    const previousStatus = this.connectionState.status;
    this.connectionState = { ...this.connectionState, ...updates };
    
    console.log(`🔄 Connection state updated: ${previousStatus} → ${this.connectionState.status}`);
    
    // **ENTERPRISE OPTIMIZATION**: Single efficient notification with React batching
    const notifySubscribers = () => {
      // Use requestAnimationFrame for optimal React reconciliation timing
      requestAnimationFrame(() => {
        this.subscribers.forEach(callback => {
          try {
            // Create a new object reference to force React updates
            const stateClone = { ...this.connectionState };
            callback(stateClone);
          } catch (error) {
            console.error('Error in connection state subscriber:', error);
          }
        });
        
        // Single consolidated log
        console.log(`📡 State notification: ${this.connectionState.status} to ${this.subscribers.size} subscribers`);
      });
    };

    // Single optimized notification
    notifySubscribers();
  }

  // Register event handlers for a component
  registerEventHandlers(componentId: string, handlers: SignalREventHandlers) {
    console.log(`📝 Registering handlers for component: ${componentId}`);
    this.eventHandlers.set(componentId, handlers);
    
    console.log(`📊 Total registered components: ${this.eventHandlers.size}`);
    console.log(`🔐 Auth state: authenticated=${this.isAuthenticated}, ready=${this.authReady}`);
    console.log(`🔗 Connection state: ${this.connection?.state || 'null'} (Status: ${this.connectionState.status})`);
    
    // If already connected and authenticated, register handlers immediately
    if (this.connection && this.connection.state === HubConnectionState.Connected && this.isAuthenticated) {
      console.log('✅ Already connected, setting up handlers immediately');
      this.setupEventHandlers();
    }
    // If authenticated but not connected, try to connect
    else if (this.shouldConnect()) {
      console.log('🚀 Should connect - attempting connection...');
      this.connect().catch(error => {
        console.error('Failed to connect after registering handlers:', error);
      });
    } else {
      console.log('🚫 Cannot connect yet - waiting for auth or more handlers');
    }
  }

  // Unregister event handlers for a component
  unregisterEventHandlers(componentId: string) {
    console.log(`🗑️ Unregistering handlers for component: ${componentId}`);
    this.eventHandlers.delete(componentId);
    
    // If no more handlers and connected, disconnect
    if (this.eventHandlers.size === 0 && this.connection) {
      console.log('📝 No more handlers, disconnecting SignalR');
      this.disconnect();
    }
  }

  // Setup all event handlers from all registered components
  private setupEventHandlers() {
    if (!this.connection) return;

    // Clear existing handlers first
    this.connection.off('ReceiveGamificationEvent');
    this.connection.off('ReceiveNotification');
    this.connection.off('NotificationStatusUpdated');
    this.connection.off('UnreadCountUpdated');

    let handlerCount = 0;
    
    // Consolidate all handlers from all components
    const allHandlers = Array.from(this.eventHandlers.values());
    
    // Set up notification handlers
    const notificationHandlers = allHandlers.filter(h => h.onReceiveNotification);
    if (notificationHandlers.length > 0) {
      this.connection.on('ReceiveNotification', (event) => {
        try {
          notificationHandlers.forEach(handler => {
            handler.onReceiveNotification?.(event);
          });
        } catch (error) {
          console.error('Error handling notification event:', error);
        }
      });
      handlerCount++;
    }

    // Set up notification status handlers
    const statusHandlers = allHandlers.filter(h => h.onNotificationStatusUpdated);
    if (statusHandlers.length > 0) {
      this.connection.on('NotificationStatusUpdated', (event) => {
        try {
          statusHandlers.forEach(handler => {
            handler.onNotificationStatusUpdated?.(event);
          });
        } catch (error) {
          console.error('Error handling notification status event:', error);
        }
      });
      handlerCount++;
    }

    // Set up unread count handlers
    const unreadHandlers = allHandlers.filter(h => h.onUnreadCountUpdated);
    if (unreadHandlers.length > 0) {
      this.connection.on('UnreadCountUpdated', (event) => {
        try {
          unreadHandlers.forEach(handler => {
            handler.onUnreadCountUpdated?.(event);
          });
        } catch (error) {
          console.error('Error handling unread count event:', error);
        }
      });
      handlerCount++;
    }

    // ✨ BACKEND: Enhanced gamification event handlers
    const backendGamificationHandlers = allHandlers.filter(h => h.onReceiveGamificationEvent);
    if (backendGamificationHandlers.length > 0) {
      this.connection.on('ReceiveGamificationEvent', (event) => {
        try {
          console.log('🎮 Backend gamification event received:', event);
          backendGamificationHandlers.forEach(handler => {
            handler.onReceiveGamificationEvent?.(event);
          });
        } catch (error) {
          console.error('❌ Error handling backend gamification event:', error);
        }
      });
      handlerCount++;
    }

    // ✨ BACKEND: Enhanced task completion event handlers
    const backendTaskCompletionHandlers = allHandlers.filter(h => h.onReceiveTaskCompletionEvent);
    if (backendTaskCompletionHandlers.length > 0) {
      this.connection.on('ReceiveTaskCompletionEvent', (event) => {
        try {
          console.log('🎉 Backend task completion event received:', event);
          backendTaskCompletionHandlers.forEach(handler => {
            handler.onReceiveTaskCompletionEvent?.(event);
          });
        } catch (error) {
          console.error('❌ Error handling backend task completion event:', error);
        }
      });
      handlerCount++;
    }

    // ✨ BACKEND: Family task completion event handlers
    const backendFamilyTaskHandlers = allHandlers.filter(h => h.onReceiveFamilyTaskCompletion);
    if (backendFamilyTaskHandlers.length > 0) {
      this.connection.on('ReceiveFamilyTaskCompletion', (event) => {
        try {
          console.log('👨‍👩‍👧‍👦 Backend family task completion event received:', event);
          backendFamilyTaskHandlers.forEach(handler => {
            handler.onReceiveFamilyTaskCompletion?.(event);
          });
        } catch (error) {
          console.error('❌ Error handling backend family task completion event:', error);
        }
      });
      handlerCount++;
    }

    // ✨ BACKEND: Family activity event handlers
    const backendFamilyActivityHandlers = allHandlers.filter(h => h.onReceiveFamilyActivity);
    if (backendFamilyActivityHandlers.length > 0) {
      this.connection.on('ReceiveFamilyActivity', (event) => {
        try {
          console.log('👨‍👩‍👧‍👦 Backend family activity event received:', event);
          backendFamilyActivityHandlers.forEach(handler => {
            handler.onReceiveFamilyActivity?.(event);
          });
        } catch (error) {
          console.error('❌ Error handling backend family activity event:', error);
        }
      });
      handlerCount++;
    }

    // ✨ BACKEND: Family milestone event handlers
    const backendFamilyMilestoneHandlers = allHandlers.filter(h => h.onReceiveFamilyMilestone);
    if (backendFamilyMilestoneHandlers.length > 0) {
      this.connection.on('ReceiveFamilyMilestone', (event) => {
        try {
          console.log('🏆 Backend family milestone event received:', event);
          backendFamilyMilestoneHandlers.forEach(handler => {
            handler.onReceiveFamilyMilestone?.(event);
          });
        } catch (error) {
          console.error('❌ Error handling backend family milestone event:', error);
        }
      });
      handlerCount++;
    }

    console.log(`✅ Set up ${handlerCount} consolidated event handlers`);
  }

  // Enhanced connection with authentication checks
  async connect(): Promise<void> {
    // Check authentication first
    if (!this.shouldConnect()) {
      console.log('🚫 Skipping SignalR connection - not authenticated or no handlers');
      return Promise.resolve();
    }

    // Throttle connection attempts
    const now = Date.now();
    if (now - this.lastConnectionAttempt < this.connectionThrottleMs) {
      // Only log throttling message every 5 seconds to reduce noise
      if (now - this.lastThrottleLogTime > 5000) {
        console.log('🛑 Connection attempt throttled - too frequent (suppressing similar messages for 5s)');
        this.lastThrottleLogTime = now;
      }
      // If there's an active connection promise, return it; otherwise resolve immediately
      if (this.connectionPromise) {
        return this.connectionPromise;
      }
      // If already connected, just return
      if (this.connection && this.connection.state === HubConnectionState.Connected) {
        return Promise.resolve();
      }
      // Otherwise, wait for throttle period to end
      return new Promise(resolve => {
        setTimeout(() => {
          this.connect().then(resolve).catch(resolve);
        }, this.connectionThrottleMs - (now - this.lastConnectionAttempt));
      });
    }
    this.lastConnectionAttempt = now;

    // If already connecting, return existing promise
    if (this.isConnecting && this.connectionPromise) {
      console.log('🔄 Connection already in progress, waiting...');
      return this.connectionPromise;
    }

    // If already connected, just setup handlers
    if (this.connection && this.connection.state === HubConnectionState.Connected) {
      console.log('✅ Already connected, setting up handlers');
      this.setupEventHandlers();
      return Promise.resolve();
    }

    // Start new connection
    this.connectionPromise = this._doConnect();
    return this.connectionPromise;
  }

  private async _doConnect(): Promise<void> {
    if (this.isConnecting) {
      console.log('🔄 Connection already in progress');
      return;
    }

    this.isConnecting = true;
    console.log('🚀 Starting SignalR connection...');
    
    try {
      // Update state to connecting immediately
      this.updateConnectionState({ status: HubConnectionStatus.Connecting });

      // Clean up any existing connection
      if (this.connection) {
        try {
          await this.connection.stop();
        } catch (error) {
          console.warn('Error stopping existing connection:', error);
        }
        this.connection = null;
      }

      // Create new connection with Docker-optimized settings
      const hubUrl = process.env.NODE_ENV === 'production' 
        ? `${window.location.protocol}//${window.location.host}/hubs/main`
        : 'http://localhost:5000/hubs/main';

      console.log(`🔗 Connecting to SignalR hub: ${hubUrl}`);

      this.connection = new HubConnectionBuilder()
        .withUrl(hubUrl, {
          withCredentials: true, // Essential for Docker cookie-based auth
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            // Exponential backoff with jitter for Docker environments
            const delay = Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 30000);
            const jitter = Math.random() * 1000;
            return delay + jitter;
          }
        })
        .configureLogging(LogLevel.Information)
        .build();

      // Set up connection event handlers
      this.connection.onreconnecting(() => {
        console.log('🔄 SignalR reconnecting...');
        this.updateConnectionState({ status: HubConnectionStatus.Reconnecting });
        this.notifyConnectionHandlers('onReconnecting');
      });

      this.connection.onreconnected(() => {
        console.log('✅ SignalR reconnected');
        this.updateConnectionState({ 
          status: HubConnectionStatus.Connected,
          lastConnected: new Date(),
          reconnectAttempts: 0,
          error: undefined
        });
        this.setupEventHandlers();
        this.notifyConnectionHandlers('onReconnected');
      });

      this.connection.onclose((error) => {
        console.log('🔌 SignalR connection closed:', error?.message || 'No error');
        
        // **ENTERPRISE FIX**: Enhanced connection close handling for page refresh scenarios
        const isPageRefresh = error?.message?.includes('stopped during negotiation') || 
                             error?.message?.includes('AbortError') ||
                             error?.message?.includes('WebSocket connection closed');
        
        // Only update to disconnected if we're not in the middle of connecting AND it's not a page refresh
        if (!this.isConnecting && !isPageRefresh) {
          this.updateConnectionState({ 
            status: HubConnectionStatus.Disconnected,
            lastDisconnected: new Date(),
            error: error?.message
          });
          this.notifyConnectionHandlers('onDisconnected', error || undefined);
        } else if (isPageRefresh) {
          console.log('🔄 Connection closed due to page refresh/navigation - maintaining connection state');
          // For page refresh scenarios, don't immediately mark as disconnected
          // The connection will be re-established automatically
        } else {
          console.log('🔄 Connection closed during connection attempt - maintaining connecting state');
        }
      });

      // Start the connection with timeout for Docker environments
      const connectionTimeout = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Connection timeout after 10 seconds')), 10000);
      });

      await Promise.race([
        this.connection.start(),
        connectionTimeout
      ]);
      
      // **CRITICAL FIX**: Double-check connection state and force update
      if (!this.connection || this.connection.state !== HubConnectionState.Connected) {
        throw new Error('Connection failed to establish properly');
      }
      
      console.log('🚀 SignalR connected successfully');
      
      // **ENTERPRISE FIX**: Force immediate state update with multiple propagation methods
      this.updateConnectionState({ 
        status: HubConnectionStatus.Connected,
        lastConnected: new Date(),
        reconnectAttempts: 0,
        error: undefined
      });
      
      // Additional immediate state propagation for React
      setTimeout(() => {
        this.updateConnectionState({ 
          status: HubConnectionStatus.Connected,
          lastConnected: new Date(),
          reconnectAttempts: 0,
          error: undefined
        });
      }, 0);

      // Setup event handlers after successful connection
      this.setupEventHandlers();
      this.notifyConnectionHandlers('onConnected');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Connection failed';
      
      // Handle specific error types
      if (errorMessage.includes('stopped during negotiation') || errorMessage.includes('AbortError')) {
        console.warn('⚠️ SignalR connection was aborted during setup (likely due to rapid connect/disconnect)');
        // Don't treat this as a critical error, just log it
      } else {
        console.error('❌ SignalR connection failed:', error);
      }
      
      // Clean up connection reference on error
      if (this.connection) {
        try {
          this.connection.stop();
        } catch (stopError) {
          console.warn('Error stopping failed connection:', stopError);
        }
        this.connection = null;
      }

      this.updateConnectionState({
        status: HubConnectionStatus.Disconnected,
        error: errorMessage
      });
      
      // Only notify error handlers for non-abort errors
      if (!errorMessage.includes('stopped during negotiation') && !errorMessage.includes('AbortError')) {
        this.notifyConnectionHandlers('onError', error instanceof Error ? error : new Error('Connection failed'));
      }
      
      // Don't throw for abort errors to prevent console spam
      if (!errorMessage.includes('stopped during negotiation') && !errorMessage.includes('AbortError')) {
        throw error;
      }
    } finally {
      this.isConnecting = false;
      this.connectionPromise = null;
    }
  }

  // Force disconnect without waiting
  private async _forceDisconnect(): Promise<void> {
    if (this.connection) {
      try {
        const currentConnection = this.connection;
        this.connection = null; // Clear reference immediately to prevent race conditions
        
        // Try to stop gracefully first, but don't wait too long
        const stopPromise = currentConnection.stop();
        const timeoutPromise = new Promise<void>((resolve) => {
          setTimeout(() => resolve(), 500); // 500ms timeout
        });
        
        await Promise.race([stopPromise, timeoutPromise]);
        console.log('🧹 Connection cleanup completed');
      } catch (error) {
        console.warn('Warning during force disconnect:', error);
      }
    }
  }

  // Graceful disconnect
  async disconnect(): Promise<void> {
    if (this.isDisconnecting) {
      console.log('🛑 Already disconnecting');
      return;
    }

    // If currently connecting, wait for it to finish or timeout
    if (this.isConnecting && this.connectionPromise) {
      console.log('⏳ Waiting for connection to finish before disconnecting...');
      try {
        await Promise.race([
          this.connectionPromise,
          new Promise(resolve => setTimeout(resolve, 2000)) // 2 second timeout
        ]);
      } catch (error) {
        console.warn('Connection promise failed while waiting to disconnect:', error);
      }
    }

    this.isDisconnecting = true;

    try {
      // Clear any pending connection promise
      this.connectionPromise = null;

      if (this.reconnectTimeoutId) {
        clearTimeout(this.reconnectTimeoutId);
        this.reconnectTimeoutId = null;
      }

      if (this.connection && this.connection.state !== HubConnectionState.Disconnected) {
        console.log('🔌 Disconnecting SignalR...');
        this.updateConnectionState({ status: HubConnectionStatus.Disconnecting });
        
        const currentConnection = this.connection;
        this.connection = null; // Clear reference immediately
        
        try {
          await currentConnection.stop();
          console.log('🛑 SignalR disconnected');
        } catch (stopError) {
          console.warn('Error during connection stop:', stopError);
        }
      } else {
        this.connection = null;
      }

      this.updateConnectionState({ 
        status: HubConnectionStatus.Disconnected,
        lastDisconnected: new Date()
      });
    } catch (error) {
      console.error('Error during disconnect:', error);
    } finally {
      this.isDisconnecting = false;
    }
  }

  // Notify all components with connection handlers
  private notifyConnectionHandlers(event: string, error?: Error) {
    this.eventHandlers.forEach((handlers) => {
      try {
        switch (event) {
          case 'onConnected':
            handlers.onConnected?.();
            break;
          case 'onDisconnected':
            handlers.onDisconnected?.(error);
            break;
          case 'onReconnecting':
            handlers.onReconnecting?.();
            break;
          case 'onReconnected':
            handlers.onReconnected?.();
            break;
          case 'onError':
            handlers.onError?.(error!);
            break;
        }
      } catch (err) {
        console.error(`Error in ${event} handler:`, err);
      }
    });
  }

  getConnectionState(): ConnectionState {
    return { ...this.connectionState };
  }

  // **ENTERPRISE FIX**: Force reconnect with state cleanup
  async forceReconnect(): Promise<void> {
    console.log('🔄 Force reconnecting SignalR...');
    
    // Clear any existing connection state issues
    this.isConnecting = false;
    this.isDisconnecting = false;
    this.connectionPromise = null;
    
    // Force disconnect first
    if (this.connection) {
      try {
        await this.connection.stop();
      } catch (error) {
        console.warn('Error during force disconnect:', error);
      }
      this.connection = null;
    }
    
    // Reset state and reconnect
    this.updateConnectionState({ 
      status: HubConnectionStatus.Disconnected,
      error: undefined
    });
    
    // Attempt fresh connection
    return this.connect();
  }

  // **ENTERPRISE FIX**: Enhanced connection state validation and repair
  validateConnectionState(): boolean {
    let repaired = false;
    
    // Check for connection state mismatch
    if (this.connection && this.connection.state === HubConnectionState.Connected) {
      if (this.connectionState.status !== HubConnectionStatus.Connected) {
        console.log('🔧 Repairing connection state mismatch - SignalR is connected but state shows disconnected');
        this.updateConnectionState({ 
          status: HubConnectionStatus.Connected,
          lastConnected: new Date(),
          error: undefined
        });
        
        // Notify all subscribers of the corrected state
        this.notifyConnectionHandlers('onConnected');
        repaired = true;
      }
    } else if (this.connection && this.connection.state === HubConnectionState.Disconnected) {
      if (this.connectionState.status === HubConnectionStatus.Connected) {
        console.log('🔧 Repairing connection state mismatch - SignalR is disconnected but state shows connected');
        this.updateConnectionState({ 
          status: HubConnectionStatus.Disconnected,
          lastDisconnected: new Date()
        });
        repaired = true;
      }
    }
    
    return repaired;
  }

  // **NEW**: Periodic state validation to catch and fix desynchronization
  private startStateValidation(): void {
    setInterval(() => {
      const repaired = this.validateConnectionState();
      if (repaired) {
        console.log('🔧 SignalR state validation repaired connection state mismatch');
      }
    }, 3000); // Check every 3 seconds for faster detection
  }
}

// ================================
// REACT HOOK WITH AUTHENTICATION
// ================================

export function useSignalRConnectionManager(
  componentId: string,
  eventHandlers: SignalREventHandlers = {}
) {
  const manager = useMemo(() => SignalRConnectionManager.getInstance(), []);
  const [connectionState, setConnectionState] = useState<ConnectionState>(
    manager.getConnectionState()
  );
  const mountedRef = useRef(true);
  const handlersRegisteredRef = useRef(false);
  const { isAuthenticated, isReady } = useAuth();

  // Update manager with auth state
  useEffect(() => {
    manager.updateAuthState(isAuthenticated, isReady);
  }, [manager, isAuthenticated, isReady]);

  // Subscribe to connection state changes - simplified to prevent render loops
  useEffect(() => {
    const unsubscribe = manager.subscribe((state) => {
      if (mountedRef.current) {
        console.log(`🔄 ${componentId}: Received connection state update: ${state.status}`);
        setConnectionState(state);
          }
    });
        
    // Initial sync with current manager state
    const currentState = manager.getConnectionState();
    if (mountedRef.current) {
      console.log(`🔄 ${componentId}: Initial state sync: ${currentState.status}`);
      setConnectionState(currentState);
    }

    return unsubscribe;
  }, [manager, componentId]);

  // Register event handlers with stability check
  useEffect(() => {
    if (Object.keys(eventHandlers).length > 0 && isReady && !handlersRegisteredRef.current) {
      console.log(`📝 Registering handlers for component: ${componentId} (immediate)`);
      manager.registerEventHandlers(componentId, eventHandlers);
      handlersRegisteredRef.current = true;
    }

    return () => {
      if (handlersRegisteredRef.current) {
      console.log(`🗑️ Unregistering handlers for component: ${componentId} (cleanup)`);
      manager.unregisterEventHandlers(componentId);
        handlersRegisteredRef.current = false;
      }
    };
  }, [manager, componentId, isReady, eventHandlers]); // Include eventHandlers since it's used in the effect

  // Auto-connect when auth is ready and we have handlers - with proper timing for page refresh
  useEffect(() => {
    let connectTimer: NodeJS.Timeout;
    
    // Wait for both auth to be ready AND to have event handlers registered
    if (isAuthenticated && isReady && handlersRegisteredRef.current) {
      // Use longer delay for page refresh scenarios to ensure auth is fully settled
      const delay = manager.getConnectionState().status === 'Disconnected' ? 500 : 100;
      
      connectTimer = setTimeout(() => {
        if (mountedRef.current) {
          console.log(`🚀 ${componentId}: Auto-connecting SignalR (auth ready: ${isReady}, authenticated: ${isAuthenticated})`);
          manager.connect().catch(error => {
            // Only log non-abort errors
            if (!error?.message?.includes('stopped during negotiation') && !error?.message?.includes('AbortError')) {
              console.error('Failed to connect SignalR:', error);
            }
          });
        }
      }, delay);
    } else {
      console.log(`⏳ ${componentId}: Waiting for connection conditions - Auth: ${isAuthenticated}, Ready: ${isReady}, Handlers: ${handlersRegisteredRef.current}`);
    }

    return () => {
      if (connectTimer) {
        clearTimeout(connectTimer);
      }
      mountedRef.current = false;
    };
  }, [manager, isAuthenticated, isReady, componentId]); // Use handlersRegisteredRef.current instead of eventHandlers

  const connect = useCallback(() => manager.connect(), [manager]);
  const disconnect = useCallback(() => manager.disconnect(), [manager]);
  const forceReconnect = useCallback(() => manager.forceReconnect(), [manager]);
  
  // Enhanced connection state determination with validation
  const isConnected = useMemo(() => {
    const statusConnected = connectionState.status === HubConnectionStatus.Connected;
    
    // Validate against actual SignalR connection state to catch desync
    const actualConnection = manager.getConnectionState();
    const actualConnected = actualConnection.status === HubConnectionStatus.Connected;
    
    if (componentId === 'dashboard') { // Only log for dashboard to reduce spam
      console.log(`🔍 ${componentId}: Connection check - Local Status: ${connectionState.status}, Manager Status: ${actualConnection.status}, Connected: ${statusConnected}`);
      
      // If there's a mismatch, sync the local state
      if (statusConnected !== actualConnected) {
        console.log(`🔧 ${componentId}: State mismatch detected - syncing local state with manager`);
        setConnectionState(actualConnection);
        return actualConnected;
      }
    }
    
    return statusConnected;
  }, [connectionState.status, componentId, manager]);

  return {
    connectionState,
    isConnected,
    connect,
    disconnect,
    forceReconnect
  };
} 