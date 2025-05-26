/**
 * SignalR Service for Real-time Notifications
 * 
 * This service provides real-time updates for:
 * - New notifications
 * - Notification status changes (read/unread)
 * - Notification counts
 * - Family notifications
 */

import * as signalR from '@microsoft/signalr';
import { Notification } from '@/lib/types/notification';

export interface NotificationEvents {
  onNewNotification: (notification: Notification) => void;
  onNotificationRead: (notificationId: string) => void;
  onNotificationDeleted: (notificationId: string) => void;
  onUnreadCountUpdated: (count: number) => void;
  onNotificationActionResult: (result: any) => void;
  onConnected: () => void;
  onDisconnected: () => void;
}

class NotificationSignalRService {
  private connection: signalR.HubConnection | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private eventHandlers: Map<string, Function[]> = new Map();
  private isInitialized = false;

  constructor() {
    // Initialize event handler maps
    Object.keys({} as NotificationEvents).forEach(event => {
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
        console.log('NotificationSignalR: No auth token found, skipping connection');
        return;
      }

      // Use environment variable or fallback to localhost
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const signalRUrl = `${baseUrl}/hubs/notifications?access_token=${encodeURIComponent(authToken)}`;
      
      console.log('NotificationSignalR: Connecting to:', signalRUrl);
      
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
      console.error('NotificationSignalR initialization failed:', error);
    }
  }

  private setupEventHandlers() {
    if (!this.connection) return;

    // Handle new notifications
    this.connection.on('ReceiveNotification', (notification: Notification) => {
      console.log('NotificationSignalR: Received new notification:', notification);
      this.eventHandlers.get('onNewNotification')?.forEach(handler => handler(notification));
    });

    // Handle family notifications
    this.connection.on('ReceiveFamilyNotification', (notification: Notification) => {
      console.log('NotificationSignalR: Received family notification:', notification);
      this.eventHandlers.get('onNewNotification')?.forEach(handler => handler(notification));
    });

    // Handle notification status updates
    this.connection.on('NotificationStatusUpdated', (data: { NotificationId: number; IsRead: boolean }) => {
      console.log('NotificationSignalR: Notification status updated:', data);
      if (data.IsRead) {
        this.eventHandlers.get('onNotificationRead')?.forEach(handler => handler(data.NotificationId.toString()));
      }
    });

    // Handle unread count updates
    this.connection.on('UnreadCountUpdated', (count: number) => {
      console.log('NotificationSignalR: Unread count updated:', count);
      this.eventHandlers.get('onUnreadCountUpdated')?.forEach(handler => handler(count));
    });

    // Handle notification action results
    this.connection.on('NotificationActionResult', (result: any) => {
      console.log('NotificationSignalR: Action result:', result);
      this.eventHandlers.get('onNotificationActionResult')?.forEach(handler => handler(result));
    });

    // Handle notification counts updates
    this.connection.on('NotificationCountsUpdated', (counts: any) => {
      console.log('NotificationSignalR: Counts updated:', counts);
      if (counts.unreadCount !== undefined) {
        this.eventHandlers.get('onUnreadCountUpdated')?.forEach(handler => handler(counts.unreadCount));
      }
    });

    // Connection events
    this.connection.onclose((error) => {
      console.log('NotificationSignalR connection closed:', error);
      this.eventHandlers.get('onDisconnected')?.forEach(handler => handler());
      this.handleReconnection();
    });

    this.connection.onreconnecting((error) => {
      console.log('NotificationSignalR reconnecting:', error);
    });

    this.connection.onreconnected((connectionId) => {
      console.log('NotificationSignalR reconnected:', connectionId);
      this.reconnectAttempts = 0;
      this.eventHandlers.get('onConnected')?.forEach(handler => handler());
    });
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
      console.log('NotificationSignalR: Max reconnection attempts reached');
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
        console.error('NotificationSignalR reconnection failed:', error);
      }
    }, delay);
  }

  public on<K extends keyof NotificationEvents>(event: K, callback: NotificationEvents[K]) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)?.push(callback);
  }

  public off<K extends keyof NotificationEvents>(event: K) {
    this.eventHandlers.set(event, []);
  }

  public async startConnection(): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        await this.initializeConnection();
      }

      if (!this.connection) {
        console.log('NotificationSignalR: Connection not initialized');
        return false;
      }

      if (this.connection.state === signalR.HubConnectionState.Connected) {
        console.log('NotificationSignalR: Already connected');
        return true;
      }

      if (this.connection.state === signalR.HubConnectionState.Connecting) {
        console.log('NotificationSignalR: Already connecting, waiting...');
        // Wait for connection to complete
        let attempts = 0;
        while (this.connection.state === signalR.HubConnectionState.Connecting && attempts < 10) {
          await new Promise(resolve => setTimeout(resolve, 500));
          attempts++;
        }
        return this.connection.state === signalR.HubConnectionState.Connected;
      }

      console.log('NotificationSignalR: Starting connection...');
      await this.connection.start();
      console.log('NotificationSignalR: Connected successfully');
      
      this.reconnectAttempts = 0;
      this.eventHandlers.get('onConnected')?.forEach(handler => handler());
      
      return true;
    } catch (error) {
      console.error('NotificationSignalR: Failed to start connection:', error);
      return false;
    }
  }

  public async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      console.log('NotificationSignalR: Disconnected');
    }
  }

  public getConnectionState(): signalR.HubConnectionState | null {
    return this.connection?.state || null;
  }

  public isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected;
  }

  public async joinFamilyNotificationGroup(familyId: number): Promise<void> {
    if (this.isConnected() && this.connection) {
      try {
        await this.connection.invoke('JoinFamilyNotificationGroup', familyId);
        console.log(`NotificationSignalR: Joined family notification group ${familyId}`);
      } catch (error) {
        console.error(`NotificationSignalR: Failed to join family group ${familyId}:`, error);
      }
    }
  }

  public async leaveFamilyNotificationGroup(familyId: number): Promise<void> {
    if (this.isConnected() && this.connection) {
      try {
        await this.connection.invoke('LeaveFamilyNotificationGroup', familyId);
        console.log(`NotificationSignalR: Left family notification group ${familyId}`);
      } catch (error) {
        console.error(`NotificationSignalR: Failed to leave family group ${familyId}:`, error);
      }
    }
  }
}

// Export singleton instance
export const notificationSignalRService = new NotificationSignalRService();

// Export convenience functions
export function onNewNotification(callback: (notification: Notification) => void): () => void {
  notificationSignalRService.on('onNewNotification', callback);
  return () => notificationSignalRService.off('onNewNotification');
}

export function onNotificationRead(callback: (notificationId: string) => void): () => void {
  notificationSignalRService.on('onNotificationRead', callback);
  return () => notificationSignalRService.off('onNotificationRead');
}

export function onNotificationDeleted(callback: (notificationId: string) => void): () => void {
  notificationSignalRService.on('onNotificationDeleted', callback);
  return () => notificationSignalRService.off('onNotificationDeleted');
}

export function onUnreadCountUpdated(callback: (count: number) => void): () => void {
  notificationSignalRService.on('onUnreadCountUpdated', callback);
  return () => notificationSignalRService.off('onUnreadCountUpdated');
}

export async function initializeNotificationSignalR(): Promise<void> {
  try {
    await notificationSignalRService.startConnection();
  } catch (error) {
    console.error('Failed to initialize notification SignalR:', error);
  }
} 