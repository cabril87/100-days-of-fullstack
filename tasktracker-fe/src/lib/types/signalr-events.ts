/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 */

import type { 
  BackendGamificationEventDTO,
  BackendTaskCompletionEventDTO,
  BackendFamilyActivityEventDTO,
  BackendFamilyMilestoneEventDTO,
  BackendNotificationEventDTO,
  BackendNotificationStatusDTO,
  BackendUnreadCountDTO
} from './backend-signalr-events';

/**
 * SignalR connection event handlers
 */
export interface SignalREventHandlers {
  // Connection events
  onConnected?: () => void;
  onDisconnected?: (error?: Error) => void;
  onReconnecting?: () => void;
  onReconnected?: () => void;
  onError?: (error: Error) => void;

  // Backend SignalR events - matches actual hub method names
  onReceiveGamificationEvent?: (event: BackendGamificationEventDTO) => void;
  onReceiveTaskCompletionEvent?: (event: BackendTaskCompletionEventDTO) => void;
  onReceiveFamilyTaskCompletion?: (event: BackendTaskCompletionEventDTO) => void;
  onReceiveFamilyActivity?: (event: BackendFamilyActivityEventDTO) => void;
  onReceiveFamilyMilestone?: (event: BackendFamilyMilestoneEventDTO) => void;
  onReceiveNotification?: (event: BackendNotificationEventDTO) => void;
  onNotificationStatusUpdated?: (event: BackendNotificationStatusDTO) => void;
  onUnreadCountUpdated?: (event: BackendUnreadCountDTO) => void;
}

// Legacy event types removed - use ParsedGamificationEvents from backend-signalr-events.ts

/**
 * SignalR connection state
 */
export interface SignalRConnectionState {
  status: 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';
  isConnected: boolean;
  lastError?: string;
  connectionId?: string;
  reconnectAttempts: number;
  lastConnected?: Date;
} 