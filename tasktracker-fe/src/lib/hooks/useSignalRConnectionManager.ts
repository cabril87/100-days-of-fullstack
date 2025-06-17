'use client';

/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 * 
 * SignalR Connection Manager
 * Enterprise-grade centralized connection management to prevent multiple competing connections.
 * Implements singleton pattern with shared state across all components.
 */

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { HubConnection, HubConnectionBuilder, LogLevel, HubConnectionState } from '@microsoft/signalr';
import { 
  HubConnectionStatus, 
  ConnectionState, 
  SignalREventHandlers
} from '@/lib/types/signalr';
import { API_CONFIG } from '@/lib/config/api-client';

// ================================
// SINGLETON CONNECTION MANAGER
// ================================

class SignalRConnectionManager {
  private static instance: SignalRConnectionManager;
  private connection: HubConnection | null = null;
  private eventHandlers: Map<string, SignalREventHandlers> = new Map();
  private subscribers: Set<(state: ConnectionState) => void> = new Set();
  private connectionState: ConnectionState = {
    status: HubConnectionStatus.Disconnected,
    reconnectAttempts: 0,
    lastConnected: undefined,
    lastDisconnected: undefined,
    error: undefined
  };

  private constructor() {}

  static getInstance(): SignalRConnectionManager {
    if (!SignalRConnectionManager.instance) {
      SignalRConnectionManager.instance = new SignalRConnectionManager();
    }
    return SignalRConnectionManager.instance;
  }

  // Subscribe to connection state changes
  subscribe(callback: (state: ConnectionState) => void): () => void {
    this.subscribers.add(callback);
    // Immediately notify with current state
    callback(this.connectionState);
    
    return () => {
      this.subscribers.delete(callback);
    };
  }

  // Notify all subscribers of state changes
  private notifySubscribers() {
    this.subscribers.forEach(callback => callback(this.connectionState));
  }

  // Update connection state
  private updateConnectionState(updates: Partial<ConnectionState>) {
    this.connectionState = { ...this.connectionState, ...updates };
    this.notifySubscribers();
  }

  // Register event handlers for a component
  registerEventHandlers(componentId: string, handlers: SignalREventHandlers) {
    this.eventHandlers.set(componentId, handlers);
    
    // If connection exists, register handlers immediately
    if (this.connection && this.connection.state === HubConnectionState.Connected) {
      this.registerHubEventHandlers(handlers);
    }
  }

  // Unregister event handlers for a component
  unregisterEventHandlers(componentId: string) {
    this.eventHandlers.delete(componentId);
  }

  // Register all event handlers with the hub connection
  private registerHubEventHandlers(handlers: SignalREventHandlers) {
    if (!this.connection) return;

    // Register each event handler
    Object.entries(handlers).forEach(([eventName, handler]) => {
      if (eventName.startsWith('on') && typeof handler === 'function') {
        const hubEventName = eventName.substring(2); // Remove 'on' prefix
        try {
          this.connection!.on(hubEventName, handler);
        } catch (error) {
          console.warn(`Failed to register handler for ${hubEventName}:`, error);
        }
      }
    });
  }

  // Get authentication headers
  private async getAuthHeaders(): Promise<Record<string, string>> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/v1/auth/headers`, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const headers = await response.json();
        console.log('🔐 Auth headers prepared for SignalR connection');
        return headers;
      } else {
        console.warn('⚠️ Auth headers endpoint not available, using default headers');
      }
    } catch (error) {
      console.warn('⚠️ Failed to get auth headers, using default headers:', error);
    }
    
    // Return default headers when endpoint is not available
    return {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
  }

  // Create and configure the SignalR connection
  private async createConnection(): Promise<HubConnection> {
    if (this.connection && this.connection.state !== HubConnectionState.Disconnected) {
      return this.connection;
    }

    try {
      // Get CSRF token
      const backendBaseUrl = API_CONFIG.BASE_URL.replace('/api', '');
      try {
        await fetch(`${backendBaseUrl}/api/v1/auth/csrf`, {
          method: 'GET',
          credentials: 'include',
        });
        console.log('🔐 CSRF token refreshed for SignalR connection');
      } catch (error) {
        console.warn('⚠️ Failed to get CSRF token:', error);
      }

      const authHeaders = await this.getAuthHeaders();
      const fullHubUrl = `${backendBaseUrl}/hubs/main`;

      const connectionBuilder = new HubConnectionBuilder()
        .withUrl(fullHubUrl, {
          skipNegotiation: false,
          transport: undefined,
          headers: authHeaders,
          withCredentials: true,
          timeout: 30000,
        })
        .configureLogging(process.env.NODE_ENV === 'development' ? LogLevel.Information : LogLevel.Error)
        .withAutomaticReconnect([0, 2000, 5000, 10000, 15000, 30000]);

      const connection = connectionBuilder.build();

      // Set up connection event handlers
      connection.onreconnecting(() => {
        this.updateConnectionState({ 
          status: HubConnectionStatus.Reconnecting,
          error: undefined 
        });
        this.notifyGlobalHandlers('onReconnecting');
      });

      connection.onreconnected(() => {
        this.updateConnectionState({ 
          status: HubConnectionStatus.Connected,
          lastConnected: new Date(),
          reconnectAttempts: 0,
          error: undefined 
        });
        this.registerAllEventHandlers();
        this.notifyGlobalHandlers('onReconnected');
        console.log('🎉 SignalR reconnected successfully');
      });

      connection.onclose((error) => {
        const errorMessage = error ? error.message : 'Connection closed';
        this.updateConnectionState({
          status: HubConnectionStatus.Disconnected,
          lastDisconnected: new Date(),
          error: errorMessage 
        });
        this.notifyGlobalHandlers('onDisconnected', error);
        console.log('🔌 SignalR connection closed:', errorMessage);
      });

      this.connection = connection;
      return connection;
    } catch (error) {
      console.error('❌ Failed to create SignalR connection:', error);
      throw error;
    }
  }

  // Register all event handlers from all components
  private registerAllEventHandlers() {
    this.eventHandlers.forEach(handlers => {
      this.registerHubEventHandlers(handlers);
    });
  }

  // Notify all components of global connection events
  private notifyGlobalHandlers(eventType: string, error?: Error) {
    this.eventHandlers.forEach(handlers => {
      const handler = (handlers as any)[eventType];
      if (typeof handler === 'function') {
        try {
          handler(error);
        } catch (err) {
          console.warn(`Error in ${eventType} handler:`, err);
        }
      }
    });
  }

  // Connect to SignalR hub
  async connect(): Promise<void> {
    if (this.connectionState.status === HubConnectionStatus.Connected) {
      return; // Already connected
    }

    try {
      this.updateConnectionState({ 
        status: HubConnectionStatus.Connecting,
        error: undefined 
      });

      const connection = await this.createConnection();
      
      if (connection.state === HubConnectionState.Disconnected) {
        console.log('🔗 Starting SignalR connection...');
        await connection.start();
        
        this.updateConnectionState({ 
          status: HubConnectionStatus.Connected,
          lastConnected: new Date(),
          reconnectAttempts: 0,
          error: undefined 
        });

        // Register all event handlers
        this.registerAllEventHandlers();
        this.notifyGlobalHandlers('onConnected');
        
        console.log('🚀 SignalR connected successfully');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown connection error';
      this.updateConnectionState({
        status: HubConnectionStatus.Disconnected,
        reconnectAttempts: this.connectionState.reconnectAttempts + 1,
        error: errorMessage
      });
      this.notifyGlobalHandlers('onError', error instanceof Error ? error : new Error(errorMessage));
      console.error('❌ SignalR connection failed:', error);
      throw error;
    }
  }

  // Disconnect from SignalR hub
  async disconnect(): Promise<void> {
    if (this.connection && this.connection.state !== HubConnectionState.Disconnected) {
      try {
        this.updateConnectionState({ status: HubConnectionStatus.Disconnecting });
        await this.connection.stop();
        console.log('🛑 SignalR disconnected');
      } catch (error) {
        console.error('❌ Error disconnecting SignalR:', error);
      }
    }

    this.connection = null;
    this.updateConnectionState({ 
      status: HubConnectionStatus.Disconnected,
      lastDisconnected: new Date() 
    });
  }

  // Get current connection state
  getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  // Check if connected
  isConnected(): boolean {
    return this.connectionState.status === HubConnectionStatus.Connected;
  }
}

// ================================
// REACT HOOK
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

  // Subscribe to connection state changes
  useEffect(() => {
    const unsubscribe = manager.subscribe((state) => {
      if (mountedRef.current) {
        setConnectionState(state);
      }
    });

    return unsubscribe;
  }, [manager]);

  // Register event handlers
  useEffect(() => {
    if (Object.keys(eventHandlers).length > 0) {
      manager.registerEventHandlers(componentId, eventHandlers);
    }

    return () => {
      manager.unregisterEventHandlers(componentId);
    };
  }, [manager, componentId, eventHandlers]);

  // Auto-connect on mount
  useEffect(() => {
    manager.connect().catch(error => {
      console.error('Failed to connect SignalR:', error);
    });

    return () => {
      mountedRef.current = false;
    };
  }, [manager]);

  const connect = useCallback(() => manager.connect(), [manager]);
  const disconnect = useCallback(() => manager.disconnect(), [manager]);
  const isConnected = connectionState.status === HubConnectionStatus.Connected;

  return {
    connectionState,
    isConnected,
    connect,
    disconnect
  };
} 