'use client';

import { HubConnectionBuilder, HubConnection, LogLevel, HubConnectionState } from '@microsoft/signalr';

// Define the notification types we expect from the server
export interface NotificationMessage {
  id: number;
  title: string;
  message: string;
  type: string;
  notificationType: string;
  isRead: boolean;
  isImportant: boolean;
  createdAt: string;
  relatedEntityId?: number;
  relatedEntityType?: string;
}

export interface NotificationActionResult {
  notificationId: number;
  action: string;
  success: boolean;
  message: string;
  data?: any;
}

export interface NotificationCounts {
  totalCount: number;
  unreadCount: number;
  importantCount: number;
  taskCount: number;
  familyCount: number;
  systemCount: number;
}

class SignalRService {
  private hubConnection: HubConnection | null = null;
  private notificationHubConnection: HubConnection | null = null;
  private notificationCallbacks: ((notification: NotificationMessage) => void)[] = [];
  private countUpdateCallbacks: ((count: number) => void)[] = [];
  private actionResultCallbacks: ((result: NotificationActionResult) => void)[] = [];
  private familyNotificationCallbacks: ((notification: NotificationMessage) => void)[] = [];
  private connectionPromise: Promise<void> | null = null;
  
  // Fetch CSRF token for SignalR connection
  private async fetchCSRFToken(): Promise<string> {
    try {
      const response = await fetch('/api/auth/csrf-token');
      const data = await response.json();
      return data.token || '';
    } catch (error) {
      console.error('Failed to fetch CSRF token:', error);
      return '';
    }
  }
  
  // Initialize and connect to the notification hub
  async connectToNotificationHub(): Promise<void> {
    if (this.notificationHubConnection && 
        this.notificationHubConnection.state === HubConnectionState.Connected) {
      return;
    }
    
    if (this.connectionPromise) {
      return this.connectionPromise;
    }
    
    this.connectionPromise = new Promise<void>(async (resolve, reject) => {
      try {
        // Get CSRF token for SignalR connection
        const csrfToken = await this.fetchCSRFToken();
        
        // Build the hub connection
        this.notificationHubConnection = new HubConnectionBuilder()
          .withUrl('/api/hubs/notifications', {
            headers: {
              'X-CSRF-TOKEN': csrfToken
            }
          })
          .withAutomaticReconnect()
          .configureLogging(LogLevel.Information)
          .build();

        // Set up event handlers
        this.notificationHubConnection.on('ReceiveNotification', (notification: NotificationMessage) => {
          this.notificationCallbacks.forEach(callback => callback(notification));
        });
        
        this.notificationHubConnection.on('UnreadCountUpdated', (count: number) => {
          this.countUpdateCallbacks.forEach(callback => callback(count));
        });
        
        this.notificationHubConnection.on('NotificationCountsUpdated', (counts: NotificationCounts) => {
          // Pass unread count to the same callbacks
          this.countUpdateCallbacks.forEach(callback => callback(counts.unreadCount));
        });
        
        this.notificationHubConnection.on('NotificationActionResult', (result: NotificationActionResult) => {
          this.actionResultCallbacks.forEach(callback => callback(result));
        });
        
        this.notificationHubConnection.on('ReceiveFamilyNotification', (notification: NotificationMessage) => {
          this.familyNotificationCallbacks.forEach(callback => callback(notification));
        });
        
        // Start the connection
        await this.notificationHubConnection.start();
        console.log('Connected to notification hub');
        resolve();
      } catch (err) {
        console.error('Error connecting to notification hub:', err);
        this.connectionPromise = null;
        reject(err);
      }
    });
    
    return this.connectionPromise;
  }
  
  // Join a family notification group
  async joinFamilyNotificationGroup(familyId: number): Promise<void> {
    if (!this.notificationHubConnection || 
        this.notificationHubConnection.state !== HubConnectionState.Connected) {
      await this.connectToNotificationHub();
    }
    
    if (this.notificationHubConnection) {
      await this.notificationHubConnection.invoke('JoinFamilyNotificationGroup', familyId);
      console.log(`Joined family notification group ${familyId}`);
    }
  }
  
  // Leave a family notification group
  async leaveFamilyNotificationGroup(familyId: number): Promise<void> {
    if (this.notificationHubConnection && 
        this.notificationHubConnection.state === HubConnectionState.Connected) {
      await this.notificationHubConnection.invoke('LeaveFamilyNotificationGroup', familyId);
      console.log(`Left family notification group ${familyId}`);
    }
  }
  
  // Disconnect from the notification hub
  async disconnect(): Promise<void> {
    if (this.notificationHubConnection) {
      await this.notificationHubConnection.stop();
      console.log('Disconnected from notification hub');
    }
    
    this.connectionPromise = null;
  }
  
  // Register a callback for new notifications
  onNotification(callback: (notification: NotificationMessage) => void): () => void {
    this.notificationCallbacks.push(callback);
    
    // Return a function to unregister the callback
    return () => {
      this.notificationCallbacks = this.notificationCallbacks.filter(cb => cb !== callback);
    };
  }
  
  // Register a callback for unread count updates
  onUnreadCountUpdate(callback: (count: number) => void): () => void {
    this.countUpdateCallbacks.push(callback);
    
    // Return a function to unregister the callback
    return () => {
      this.countUpdateCallbacks = this.countUpdateCallbacks.filter(cb => cb !== callback);
    };
  }
  
  // Register a callback for notification action results
  onActionResult(callback: (result: NotificationActionResult) => void): () => void {
    this.actionResultCallbacks.push(callback);
    
    // Return a function to unregister the callback
    return () => {
      this.actionResultCallbacks = this.actionResultCallbacks.filter(cb => cb !== callback);
    };
  }
  
  // Register a callback for family notifications
  onFamilyNotification(callback: (notification: NotificationMessage) => void): () => void {
    this.familyNotificationCallbacks.push(callback);
    
    // Return a function to unregister the callback
    return () => {
      this.familyNotificationCallbacks = this.familyNotificationCallbacks.filter(cb => cb !== callback);
    };
  }
}

// Singleton instance
export const signalRService = new SignalRService();
export default signalRService; 