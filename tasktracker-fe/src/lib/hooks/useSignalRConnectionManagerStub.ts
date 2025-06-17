'use client';

/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 * 
 * SignalR Connection Manager Stub
 * Returns empty connection state without creating SignalR connections.
 * Used by widgets when shared connection is provided to prevent duplicate connections.
 */

import { HubConnectionStatus, ConnectionState } from '@/lib/types/signalr';

// ================================
// STUB CONNECTION STATE
// ================================

const STUB_CONNECTION_STATE: ConnectionState = {
  status: HubConnectionStatus.Disconnected,
  reconnectAttempts: 0,
  lastConnected: undefined,
  lastDisconnected: undefined,
  error: undefined
};

// ================================
// STUB HOOK - NO CONNECTIONS
// ================================

export function useSignalRConnectionManagerStub() {
  return {
    connectionState: STUB_CONNECTION_STATE,
    isConnected: false,
    connect: async () => {},
    disconnect: async () => {}
  };
} 