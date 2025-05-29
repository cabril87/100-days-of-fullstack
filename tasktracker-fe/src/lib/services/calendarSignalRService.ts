/**
 * Calendar SignalR Service for Real-time Updates
 * 
 * This service provides real-time updates for:
 * - Calendar events (create, update, delete)
 * - Availability changes and matrix updates
 * - Scheduling conflicts and resolutions
 * - Focus mode sessions and optimal time suggestions
 * - Family quiet time coordination
 * - Analytics and efficiency updates
 */

import * as signalR from '@microsoft/signalr';

// Types for calendar events
interface CalendarEvent {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  familyId: number;
  eventType: string;
  attendees: any[];
}

interface AvailabilityUpdate {
  memberId: number;
  date: string;
  timeRange: string;
  status: 'Available' | 'Busy' | 'Tentative' | 'OutOfOffice';
  reason?: string;
  isRecurring: boolean;
}

interface SchedulingConflict {
  id: number;
  eventId: number;
  conflictType: string;
  severity: 'Minor' | 'Major' | 'Critical';
  affectedMembers: number[];
  description: string;
}

interface FocusSession {
  sessionId: number;
  memberId: number;
  status: 'InProgress' | 'Paused' | 'Completed' | 'Cancelled';
  startTime?: string;
  endTime?: string;
  durationMinutes?: number;
  taskTitle?: string;
  qualityRating?: number;
}

interface OptimalTimeSlot {
  startTime: string;
  endTime: string;
  confidenceScore: number;
  availabilityQuality: 'Optimal' | 'Good' | 'Fair' | 'Poor';
  conflictCount: number;
  reasoning: string;
}

interface FamilyQuietTimeRequest {
  requestedBy: number;
  startTime: string;
  endTime: string;
  reason: string;
  priority: number;
  requireConfirmation: boolean;
}

interface CalendarNotification {
  notificationType: string;
  title: string;
  message: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  data: Record<string, any>;
  actionDeadline?: string;
  requiresAction: boolean;
}

export interface CalendarSignalREvents {
  // Calendar Events
  onCalendarEventUpdated: (data: { type: string; event: CalendarEvent; timestamp: string; familyId: number }) => void;
  onBatchOperationCompleted: (data: { result: any; timestamp: string; familyId: number }) => void;
  
  // Availability Updates
  onAvailabilityUpdated: (data: { memberId: number; update: AvailabilityUpdate; timestamp: string }) => void;
  onAvailabilityMatrixUpdated: (data: { familyId: number; matrix: any; timestamp: string }) => void;
  
  // Conflict Detection
  onConflictDetected: (data: { conflict: SchedulingConflict; familyId: number; timestamp: string; requiresAction: boolean }) => void;
  onMemberConflictDetected: (data: { conflict: SchedulingConflict; familyId: number; timestamp: string; requiresAction: boolean }) => void;
  onConflictResolved: (data: { resolution: any; familyId: number; timestamp: string }) => void;
  
  // Smart Scheduling
  onSchedulingSuggestionsReceived: (data: { suggestions: any[]; userId: number; timestamp: string; count: number }) => void;
  onOptimalTimeSlotsUpdated: (data: { timeSlots: OptimalTimeSlot[]; familyId: number; timestamp: string; count: number }) => void;
  
  // Focus Mode Integration
  onFocusSessionStarted: (session: FocusSession) => void;
  onFocusSessionEnded: (data: { memberId: number; userId: number; endTime: string; sessionQuality?: number; status: string }) => void;
  onFocusSessionUpdated: (data: { memberId: number; update: FocusSession; timestamp: string; blocksAvailability: boolean }) => void;
  onOptimalFocusTimeSuggestions: (data: { suggestions: OptimalTimeSlot[]; memberId: number; requestedDuration: number }) => void;
  onOptimalFocusTimesReceived: (data: { suggestions: any[]; userId: number; timestamp: string; count: number }) => void;
  onFamilyQuietTimeRequested: (data: { request: FamilyQuietTimeRequest; familyId: number; timestamp: string; requiresResponse: boolean }) => void;
  
  // Analytics
  onAnalyticsUpdated: (data: { analytics: any; familyId: number; timestamp: string }) => void;
  onEfficiencyUpdated: (data: { efficiency: any; userId: number; timestamp: string }) => void;
  
  // Notifications
  onCalendarNotificationReceived: (data: { notification: CalendarNotification; userId: number; timestamp: string; priority: string }) => void;
  
  // Connection Events
  onConnected: () => void;
  onDisconnected: () => void;
  onReconnected: () => void;
}

class CalendarSignalRService {
  private connection: signalR.HubConnection | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private eventHandlers: Map<string, Function[]> = new Map();
  private isInitialized = false;
  private hasLoggedConnectedState = false;
  private subscribedFamilyIds: Set<number> = new Set();
  private subscribedMemberIds: Set<number> = new Set();

  constructor() {
    // Initialize event handler maps
    Object.keys({} as CalendarSignalREvents).forEach(event => {
      this.eventHandlers.set(event, []);
    });
  }

  private async initializeConnection() {
    try {
      // Only run on client side
      if (typeof window === 'undefined') {
        return;
      }

      // Check if user is authenticated
      const authToken = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!authToken) {
        console.log('CalendarSignalR: No auth token found, skipping connection');
        return;
      }

      // Use environment variable or fallback to localhost
      const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
      const signalRUrl = `${baseUrl}/hubs/calendar?access_token=${encodeURIComponent(authToken)}`;
      
      console.log('CalendarSignalR: Connecting to:', signalRUrl);
      
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(signalRUrl, {
          transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            // Exponential backoff: 1s, 2s, 4s, 8s, 16s
            return Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 16000);
          }
        })
        .configureLogging(signalR.LogLevel.Information)
        .build();

      // Set up event handlers
      this.setupEventHandlers();
      this.isInitialized = true;

    } catch (error) {
      console.error('CalendarSignalR initialization failed:', error);
    }
  }

  private setupEventHandlers() {
    if (!this.connection) return;

    // Calendar Event Updates
    this.connection.on('CalendarEventUpdated', (data: any) => {
      console.log('CalendarSignalR: Calendar event updated:', data);
      this.eventHandlers.get('onCalendarEventUpdated')?.forEach(handler => handler(data));
    });

    this.connection.on('BatchOperationCompleted', (data: any) => {
      console.log('CalendarSignalR: Batch operation completed:', data);
      this.eventHandlers.get('onBatchOperationCompleted')?.forEach(handler => handler(data));
    });

    // Availability Updates
    this.connection.on('AvailabilityUpdated', (data: any) => {
      console.log('CalendarSignalR: Availability updated:', data);
      this.eventHandlers.get('onAvailabilityUpdated')?.forEach(handler => handler(data));
    });

    this.connection.on('AvailabilityMatrixUpdated', (data: any) => {
      console.log('CalendarSignalR: Availability matrix updated:', data);
      this.eventHandlers.get('onAvailabilityMatrixUpdated')?.forEach(handler => handler(data));
    });

    // Conflict Detection
    this.connection.on('ConflictDetected', (data: any) => {
      console.log('CalendarSignalR: Conflict detected:', data);
      this.eventHandlers.get('onConflictDetected')?.forEach(handler => handler(data));
    });

    this.connection.on('MemberConflictDetected', (data: any) => {
      console.log('CalendarSignalR: Member conflict detected:', data);
      this.eventHandlers.get('onMemberConflictDetected')?.forEach(handler => handler(data));
    });

    this.connection.on('ConflictResolved', (data: any) => {
      console.log('CalendarSignalR: Conflict resolved:', data);
      this.eventHandlers.get('onConflictResolved')?.forEach(handler => handler(data));
    });

    // Smart Scheduling
    this.connection.on('SchedulingSuggestionsReceived', (data: any) => {
      console.log('CalendarSignalR: Scheduling suggestions received:', data);
      this.eventHandlers.get('onSchedulingSuggestionsReceived')?.forEach(handler => handler(data));
    });

    this.connection.on('OptimalTimeSlotsUpdated', (data: any) => {
      console.log('CalendarSignalR: Optimal time slots updated:', data);
      this.eventHandlers.get('onOptimalTimeSlotsUpdated')?.forEach(handler => handler(data));
    });

    // Focus Mode Integration
    this.connection.on('FocusSessionStarted', (session: FocusSession) => {
      console.log('CalendarSignalR: Focus session started:', session);
      this.eventHandlers.get('onFocusSessionStarted')?.forEach(handler => handler(session));
    });

    this.connection.on('FocusSessionEnded', (data: any) => {
      console.log('CalendarSignalR: Focus session ended:', data);
      this.eventHandlers.get('onFocusSessionEnded')?.forEach(handler => handler(data));
    });

    this.connection.on('FocusSessionUpdated', (data: any) => {
      console.log('CalendarSignalR: Focus session updated:', data);
      this.eventHandlers.get('onFocusSessionUpdated')?.forEach(handler => handler(data));
    });

    this.connection.on('OptimalFocusTimeSuggestions', (data: any) => {
      console.log('CalendarSignalR: Optimal focus time suggestions:', data);
      this.eventHandlers.get('onOptimalFocusTimeSuggestions')?.forEach(handler => handler(data));
    });

    this.connection.on('OptimalFocusTimesReceived', (data: any) => {
      console.log('CalendarSignalR: Optimal focus times received:', data);
      this.eventHandlers.get('onOptimalFocusTimesReceived')?.forEach(handler => handler(data));
    });

    this.connection.on('FamilyQuietTimeRequested', (data: any) => {
      console.log('CalendarSignalR: Family quiet time requested:', data);
      this.eventHandlers.get('onFamilyQuietTimeRequested')?.forEach(handler => handler(data));
    });

    // Analytics
    this.connection.on('AnalyticsUpdated', (data: any) => {
      console.log('CalendarSignalR: Analytics updated:', data);
      this.eventHandlers.get('onAnalyticsUpdated')?.forEach(handler => handler(data));
    });

    this.connection.on('EfficiencyUpdated', (data: any) => {
      console.log('CalendarSignalR: Efficiency updated:', data);
      this.eventHandlers.get('onEfficiencyUpdated')?.forEach(handler => handler(data));
    });

    // Notifications
    this.connection.on('CalendarNotificationReceived', (data: any) => {
      console.log('CalendarSignalR: Calendar notification received:', data);
      this.eventHandlers.get('onCalendarNotificationReceived')?.forEach(handler => handler(data));
    });

    // Connection events
    this.connection.onclose((error) => {
      console.log('CalendarSignalR connection closed:', error);
      this.eventHandlers.get('onDisconnected')?.forEach(handler => handler());
      this.handleReconnection();
    });

    this.connection.onreconnecting((error) => {
      console.log('CalendarSignalR reconnecting:', error);
    });

    this.connection.onreconnected((connectionId) => {
      console.log('CalendarSignalR reconnected:', connectionId);
      this.reconnectAttempts = 0;
      this.eventHandlers.get('onReconnected')?.forEach(handler => handler());
      
      // Re-subscribe to family and member groups
      this.resubscribeToGroups();
    });
  }

  private async resubscribeToGroups() {
    if (!this.isConnected()) return;

    try {
      // Re-join family calendar groups
      for (const familyId of this.subscribedFamilyIds) {
        await this.joinFamilyCalendarGroup(familyId);
      }

      // Re-subscribe to member availability updates
      for (const familyId of this.subscribedFamilyIds) {
        const memberIds = Array.from(this.subscribedMemberIds);
        if (memberIds.length > 0) {
          await this.subscribeToAvailabilityUpdates(familyId, memberIds);
        }
      }
    } catch (error) {
      console.error('CalendarSignalR: Error resubscribing to groups:', error);
    }
  }

  private async handleReconnection() {
    // Don't attempt reconnection if user is not authenticated
    if (typeof window === 'undefined') {
      return;
    }

    const authToken = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!authToken) {
      return;
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('CalendarSignalR: Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 16000);

    setTimeout(async () => {
      try {
        if (this.connection?.state === signalR.HubConnectionState.Disconnected) {
          await this.startConnection();
        }
      } catch (error) {
        console.error('CalendarSignalR reconnection failed:', error);
      }
    }, delay);
  }

  public async startConnection(): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        await this.initializeConnection();
      }

      if (!this.connection) {
        console.log('CalendarSignalR: Connection not initialized');
        return false;
      }

      if (this.connection.state === signalR.HubConnectionState.Connected) {
        if (!this.hasLoggedConnectedState) {
          console.log('CalendarSignalR: Already connected');
          this.hasLoggedConnectedState = true;
        }
        return true;
      }

      if (this.connection.state === signalR.HubConnectionState.Connecting) {
        console.log('CalendarSignalR: Already connecting, waiting...');
        let attempts = 0;
        const maxAttempts = 10;
        while (this.connection.state === signalR.HubConnectionState.Connecting && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 500));
          attempts++;
        }
        return this.isConnected();
      }

      console.log('CalendarSignalR: Starting connection...');
      await this.connection.start();
      console.log('CalendarSignalR: Connected successfully');
      
      this.reconnectAttempts = 0;
      this.hasLoggedConnectedState = false;
      this.eventHandlers.get('onConnected')?.forEach(handler => handler());
      
      return true;
    } catch (error) {
      console.error('CalendarSignalR: Failed to start connection:', error);
      return false;
    }
  }

  public async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      console.log('CalendarSignalR: Disconnected');
    }
  }

  public isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected;
  }

  // Family calendar group management
  public async joinFamilyCalendarGroup(familyId: number): Promise<void> {
    if (this.isConnected() && this.connection) {
      try {
        await this.connection.invoke('JoinFamilyCalendarGroup', familyId);
        this.subscribedFamilyIds.add(familyId);
        console.log(`CalendarSignalR: Joined family calendar group ${familyId}`);
      } catch (error) {
        console.error(`CalendarSignalR: Failed to join family calendar group ${familyId}:`, error);
      }
    }
  }

  public async leaveFamilyCalendarGroup(familyId: number): Promise<void> {
    if (this.isConnected() && this.connection) {
      try {
        await this.connection.invoke('LeaveFamilyCalendarGroup', familyId);
        this.subscribedFamilyIds.delete(familyId);
        console.log(`CalendarSignalR: Left family calendar group ${familyId}`);
      } catch (error) {
        console.error(`CalendarSignalR: Failed to leave family calendar group ${familyId}:`, error);
      }
    }
  }

  // Availability subscription management
  public async subscribeToAvailabilityUpdates(familyId: number, memberIds: number[]): Promise<void> {
    if (this.isConnected() && this.connection) {
      try {
        await this.connection.invoke('SubscribeToAvailabilityUpdates', familyId, memberIds);
        memberIds.forEach(id => this.subscribedMemberIds.add(id));
        console.log(`CalendarSignalR: Subscribed to availability updates for ${memberIds.length} members`);
      } catch (error) {
        console.error(`CalendarSignalR: Failed to subscribe to availability updates:`, error);
      }
    }
  }

  // Focus mode coordination
  public async startFocusSession(memberId: number, durationMinutes: number, taskTitle: string): Promise<void> {
    if (this.isConnected() && this.connection) {
      try {
        await this.connection.invoke('StartFocusSession', memberId, durationMinutes, taskTitle);
        console.log(`CalendarSignalR: Started focus session for member ${memberId}`);
      } catch (error) {
        console.error(`CalendarSignalR: Failed to start focus session:`, error);
      }
    }
  }

  public async endFocusSession(memberId: number, sessionQuality?: number): Promise<void> {
    if (this.isConnected() && this.connection) {
      try {
        await this.connection.invoke('EndFocusSession', memberId, sessionQuality);
        console.log(`CalendarSignalR: Ended focus session for member ${memberId}`);
      } catch (error) {
        console.error(`CalendarSignalR: Failed to end focus session:`, error);
      }
    }
  }

  public async requestOptimalFocusTime(memberId: number, desiredDuration: number): Promise<void> {
    if (this.isConnected() && this.connection) {
      try {
        await this.connection.invoke('RequestOptimalFocusTime', memberId, desiredDuration);
        console.log(`CalendarSignalR: Requested optimal focus time for member ${memberId}`);
      } catch (error) {
        console.error(`CalendarSignalR: Failed to request optimal focus time:`, error);
      }
    }
  }

  public async coordinateFamilyQuietTime(familyId: number, startTime: Date, endTime: Date, reason: string): Promise<void> {
    if (this.isConnected() && this.connection) {
      try {
        await this.connection.invoke('CoordinateFamilyQuietTime', familyId, startTime, endTime, reason);
        console.log(`CalendarSignalR: Coordinated family quiet time for family ${familyId}`);
      } catch (error) {
        console.error(`CalendarSignalR: Failed to coordinate family quiet time:`, error);
      }
    }
  }

  // Event subscription management
  public on<K extends keyof CalendarSignalREvents>(event: K, callback: CalendarSignalREvents[K]): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    
    this.eventHandlers.get(event)!.push(callback);
    
    return () => {
      const handlers = this.eventHandlers.get(event);
      if (handlers) {
        const index = handlers.indexOf(callback);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    };
  }

  public off<K extends keyof CalendarSignalREvents>(event: K, callback?: CalendarSignalREvents[K]): void {
    const handlers = this.eventHandlers.get(event);
    if (!handlers) return;

    if (callback) {
      const index = handlers.indexOf(callback);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    } else {
      // Remove all handlers for this event
      this.eventHandlers.set(event, []);
    }
  }
}

// Create and export singleton instance
export const calendarSignalRService = new CalendarSignalRService();

// Export convenience functions
export function onCalendarEventUpdated(callback: CalendarSignalREvents['onCalendarEventUpdated']): () => void {
  return calendarSignalRService.on('onCalendarEventUpdated', callback);
}

export function onAvailabilityUpdated(callback: CalendarSignalREvents['onAvailabilityUpdated']): () => void {
  return calendarSignalRService.on('onAvailabilityUpdated', callback);
}

export function onConflictDetected(callback: CalendarSignalREvents['onConflictDetected']): () => void {
  return calendarSignalRService.on('onConflictDetected', callback);
}

export function onFocusSessionStarted(callback: CalendarSignalREvents['onFocusSessionStarted']): () => void {
  return calendarSignalRService.on('onFocusSessionStarted', callback);
}

export function onOptimalTimeSlotsUpdated(callback: CalendarSignalREvents['onOptimalTimeSlotsUpdated']): () => void {
  return calendarSignalRService.on('onOptimalTimeSlotsUpdated', callback);
}

export async function initializeCalendarSignalR(): Promise<void> {
  try {
    await calendarSignalRService.startConnection();
  } catch (error) {
    console.error('Failed to initialize calendar SignalR:', error);
  }
}

// Export types
export type {
  CalendarEvent,
  AvailabilityUpdate,
  SchedulingConflict,
  FocusSession,
  OptimalTimeSlot,
  FamilyQuietTimeRequest,
  CalendarNotification
}; 