/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 * 
 * SignalR Event Types - .cursorrules compliant
 * All interfaces properly organized in lib/types/signalr/ subdirectory
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
 * Following .cursorrules enterprise patterns with explicit types
 */
export interface SignalREventHandlers {
  // Gamification Events (using actual backend interfaces)
  onGamificationEvent?: (event: BackendGamificationEventDTO) => void;
  onTaskCompletion?: (event: BackendTaskCompletionEventDTO) => void;

  // Backend SignalR events - matches actual hub method names
  onReceiveGamificationEvent?: (event: BackendGamificationEventDTO) => void;
  onReceiveTaskCompletionEvent?: (event: BackendTaskCompletionEventDTO) => void;
  onReceiveFamilyTaskCompletion?: (event: BackendTaskCompletionEventDTO) => void;
  onReceiveFamilyActivity?: (event: BackendFamilyActivityEventDTO) => void;
  onReceiveFamilyMilestone?: (event: BackendFamilyMilestoneEventDTO) => void;
  onReceiveNotification?: (event: BackendNotificationEventDTO) => void;
  
  // Notification Status Events (using actual backend interfaces)
  onNotificationStatusUpdated?: (event: BackendNotificationStatusDTO) => void;
  onUnreadCountUpdated?: (event: BackendUnreadCountDTO) => void;
  
  // Connection Events (explicit Error type following .cursorrules)
  onConnected?: () => void;
  onDisconnected?: (error?: Error) => void;
  onReconnecting?: () => void;
  onReconnected?: () => void;
  onError?: (error: Error) => void;
}

/**
 * SignalR connection state
 * Following .cursorrules type safety requirements
 */
export interface SignalRConnectionState {
  status: 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';
  isConnected: boolean;
  lastError?: string;
  connectionId?: string;
  reconnectAttempts: number;
  lastConnected?: Date;
}

// ============================================================================
// SIGNALR EVENT HANDLER INTERFACES (.cursorrules compliant)
// ============================================================================

export interface SignalREventConfig {
  enableGamificationEvents: boolean;
  enableTaskEvents: boolean;
  enableCalendarEvents: boolean;
  enableFamilyEvents: boolean;
  enableSystemEvents: boolean;
  autoReconnect: boolean;
  reconnectInterval: number;
  maxReconnectAttempts: number;
}

// ============================================================================
// EVENT HANDLER CONFIGURATION (.cursorrules compliant)
// ============================================================================

export interface EventSubscription {
  eventType: string;
  handler: (data: unknown) => void;
  options?: {
    once?: boolean;
    priority?: number;
  };
}

export interface EventSubscriptionManager {
  subscribe: (subscription: EventSubscription) => string;
  unsubscribe: (subscriptionId: string) => void;
  unsubscribeAll: () => void;
  getActiveSubscriptions: () => EventSubscription[];
} 