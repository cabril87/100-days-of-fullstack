/**
 * Board SignalR Service for Real-time Board Updates
 * 
 * This service provides real-time updates for:
 * - Board state changes
 * - Column updates and WIP violations
 * - Task movements and analytics
 * - Settings synchronization
 * - Template marketplace updates
 */

import * as signalR from '@microsoft/signalr';
import { BoardEvent, TemplateMarketplaceEvent, SettingsSyncEvent } from '@/lib/types/signalr';

class BoardSignalRService {
  private enhancedBoardConnection: signalR.HubConnection | null = null;
  private templateMarketplaceConnection: signalR.HubConnection | null = null;
  private settingsSyncConnection: signalR.HubConnection | null = null;
  private eventHandlers: Map<string, Function[]> = new Map();
  private connectedBoards: Set<number> = new Set();

  constructor() {
    // Initialize event handler maps
    this.eventHandlers.set('onBoardUpdate', []);
    this.eventHandlers.set('onTemplateMarketplaceUpdate', []);
    this.eventHandlers.set('onSettingsSyncUpdate', []);
    this.eventHandlers.set('onConnected', []);
    this.eventHandlers.set('onDisconnected', []);
    this.eventHandlers.set('onError', []);
  }

  private async initializeEnhancedBoardConnection() {
    try {
      if (typeof window === 'undefined') {
        console.log('BoardSignalR: Skipping initialization on server side');
        return;
      }

      const authToken = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!authToken) {
        console.log('BoardSignalR: No auth token found, skipping connection');
        return;
      }

      const signalREnabled = process.env.NEXT_PUBLIC_SIGNALR_ENABLED !== 'false';
      if (!signalREnabled) {
        console.log('BoardSignalR: Disabled via environment variable');
        return;
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
      const signalRUrl = `${baseUrl}/hubs/enhanced-board?access_token=${encodeURIComponent(authToken)}`;
      
      console.log('BoardSignalR: Initializing Enhanced Board connection to:', signalRUrl);
      
      this.enhancedBoardConnection = new signalR.HubConnectionBuilder()
        .withUrl(signalRUrl, {
          transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
          skipNegotiation: false,
          withCredentials: false
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            const delay = Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 16000);
            console.log(`BoardSignalR: Enhanced Board retry attempt ${retryContext.previousRetryCount + 1}, delay: ${delay}ms`);
            return delay;
          }
        })
        .configureLogging(signalR.LogLevel.Information)
        .build();

      this.setupEnhancedBoardEventHandlers();
      console.log('BoardSignalR: Enhanced Board connection initialized successfully');
    } catch (error) {
      console.error('BoardSignalR Enhanced Board initialization failed:', error);
      this.eventHandlers.get('onError')?.forEach(handler => handler(error));
    }
  }

  private async initializeTemplateMarketplaceConnection() {
    try {
      if (typeof window === 'undefined') return;

      const authToken = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!authToken) return;

      const signalREnabled = process.env.NEXT_PUBLIC_SIGNALR_ENABLED !== 'false';
      if (!signalREnabled) return;

      const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
      const signalRUrl = `${baseUrl}/hubs/template-marketplace?access_token=${encodeURIComponent(authToken)}`;
      
      console.log('BoardSignalR: Initializing Template Marketplace connection to:', signalRUrl);
      
      this.templateMarketplaceConnection = new signalR.HubConnectionBuilder()
        .withUrl(signalRUrl, {
          transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
          skipNegotiation: false,
          withCredentials: false
        })
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Information)
        .build();

      this.setupTemplateMarketplaceEventHandlers();
      console.log('BoardSignalR: Template Marketplace connection initialized successfully');
    } catch (error) {
      console.error('BoardSignalR Template Marketplace initialization failed:', error);
      this.eventHandlers.get('onError')?.forEach(handler => handler(error));
    }
  }

  private async initializeSettingsSyncConnection() {
    try {
      if (typeof window === 'undefined') return;

      const authToken = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!authToken) return;

      const signalREnabled = process.env.NEXT_PUBLIC_SIGNALR_ENABLED !== 'false';
      if (!signalREnabled) return;

      const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
      const signalRUrl = `${baseUrl}/hubs/settings-sync?access_token=${encodeURIComponent(authToken)}`;
      
      console.log('BoardSignalR: Initializing Settings Sync connection to:', signalRUrl);
      
      this.settingsSyncConnection = new signalR.HubConnectionBuilder()
        .withUrl(signalRUrl, {
          transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
          skipNegotiation: false,
          withCredentials: false
        })
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Information)
        .build();

      this.setupSettingsSyncEventHandlers();
      console.log('BoardSignalR: Settings Sync connection initialized successfully');
    } catch (error) {
      console.error('BoardSignalR Settings Sync initialization failed:', error);
      this.eventHandlers.get('onError')?.forEach(handler => handler(error));
    }
  }

  private setupEnhancedBoardEventHandlers() {
    if (!this.enhancedBoardConnection) return;

    // Board state updates
    this.enhancedBoardConnection.on('BoardUpdated', (data: any) => {
      const update: BoardEvent = {
        type: 'board_updated',
        data,
        boardId: data.boardId,
        userId: data.userId,
        timestamp: new Date().toISOString(),
      };
      this.eventHandlers.get('onBoardUpdate')?.forEach(handler => handler(update));
    });

    // Column updates
    this.enhancedBoardConnection.on('ColumnUpdated', (data: any) => {
      const update: BoardEvent = {
        type: 'column_updated',
        data,
        boardId: data.boardId,
        userId: data.userId,
        timestamp: new Date().toISOString(),
      };
      this.eventHandlers.get('onBoardUpdate')?.forEach(handler => handler(update));
    });

    // Task movements
    this.enhancedBoardConnection.on('TaskMoved', (data: any) => {
      const update: BoardEvent = {
        type: 'task_moved',
        data,
        boardId: data.boardId,
        userId: data.userId,
        timestamp: new Date().toISOString(),
      };
      this.eventHandlers.get('onBoardUpdate')?.forEach(handler => handler(update));
    });

    // WIP violations
    this.enhancedBoardConnection.on('WipViolationsDetected', (data: any) => {
      const update: BoardEvent = {
        type: 'wip_violation',
        data,
        boardId: data.boardId,
        userId: data.userId || 0,
        timestamp: new Date().toISOString(),
      };
      this.eventHandlers.get('onBoardUpdate')?.forEach(handler => handler(update));
    });

    // Analytics updates
    this.enhancedBoardConnection.on('AnalyticsUpdated', (data: any) => {
      const update: BoardEvent = {
        type: 'analytics_updated',
        data,
        boardId: data.boardId,
        userId: data.userId || 0,
        timestamp: new Date().toISOString(),
      };
      this.eventHandlers.get('onBoardUpdate')?.forEach(handler => handler(update));
    });

    // Performance alerts
    this.enhancedBoardConnection.on('PerformanceAlerts', (data: any) => {
      const update: BoardEvent = {
        type: 'analytics_updated',
        data: { ...data, alertType: 'performance' },
        boardId: data.boardId,
        userId: data.userId || 0,
        timestamp: new Date().toISOString(),
      };
      this.eventHandlers.get('onBoardUpdate')?.forEach(handler => handler(update));
    });

    // Connection events
    this.enhancedBoardConnection.onclose((error) => {
      console.log('BoardSignalR Enhanced Board connection closed:', error);
      this.eventHandlers.get('onDisconnected')?.forEach(handler => handler());
    });

    this.enhancedBoardConnection.onreconnected((connectionId) => {
      console.log('BoardSignalR Enhanced Board reconnected:', connectionId);
      this.eventHandlers.get('onConnected')?.forEach(handler => handler());
      // Rejoin all board groups
      this.rejoinBoardGroups();
    });
  }

  private setupTemplateMarketplaceEventHandlers() {
    if (!this.templateMarketplaceConnection) return;

    // Template published
    this.templateMarketplaceConnection.on('TemplatePublished', (data: any) => {
      const update: TemplateMarketplaceEvent = {
        type: 'template_published',
        data,
        templateId: data.templateId,
        userId: data.userId,
        timestamp: new Date().toISOString(),
      };
      this.eventHandlers.get('onTemplateMarketplaceUpdate')?.forEach(handler => handler(update));
    });

    // Template rated
    this.templateMarketplaceConnection.on('TemplateRated', (data: any) => {
      const update: TemplateMarketplaceEvent = {
        type: 'template_rated',
        data,
        templateId: data.templateId,
        userId: data.userId,
        timestamp: new Date().toISOString(),
      };
      this.eventHandlers.get('onTemplateMarketplaceUpdate')?.forEach(handler => handler(update));
    });

    // Trending templates
    this.templateMarketplaceConnection.on('TrendingTemplatesUpdated', (data: any) => {
      const update: TemplateMarketplaceEvent = {
        type: 'template_trending',
        data,
        userId: data.userId || 0,
        timestamp: new Date().toISOString(),
      };
      this.eventHandlers.get('onTemplateMarketplaceUpdate')?.forEach(handler => handler(update));
    });

    // Marketplace analytics
    this.templateMarketplaceConnection.on('MarketplaceAnalyticsUpdated', (data: any) => {
      const update: TemplateMarketplaceEvent = {
        type: 'marketplace_analytics',
        data,
        userId: data.userId || 0,
        timestamp: new Date().toISOString(),
      };
      this.eventHandlers.get('onTemplateMarketplaceUpdate')?.forEach(handler => handler(update));
    });
  }

  private setupSettingsSyncEventHandlers() {
    if (!this.settingsSyncConnection) return;

    // Settings changed
    this.settingsSyncConnection.on('SettingsChanged', (data: any) => {
      const update: SettingsSyncEvent = {
        type: 'settings_changed',
        data,
        boardId: data.boardId,
        userId: data.userId,
        timestamp: new Date().toISOString(),
      };
      this.eventHandlers.get('onSettingsSyncUpdate')?.forEach(handler => handler(update));
    });

    // Theme updated
    this.settingsSyncConnection.on('ThemeChanged', (data: any) => {
      const update: SettingsSyncEvent = {
        type: 'theme_updated',
        data,
        boardId: data.boardId,
        userId: data.userId,
        timestamp: new Date().toISOString(),
      };
      this.eventHandlers.get('onSettingsSyncUpdate')?.forEach(handler => handler(update));
    });

    // Settings imported
    this.settingsSyncConnection.on('SettingsImported', (data: any) => {
      const update: SettingsSyncEvent = {
        type: 'settings_imported',
        data,
        boardId: data.boardId,
        userId: data.userId,
        timestamp: new Date().toISOString(),
      };
      this.eventHandlers.get('onSettingsSyncUpdate')?.forEach(handler => handler(update));
    });
  }

  // Public API methods
  public on(event: 'onBoardUpdate', callback: (update: BoardEvent) => void): void;
  public on(event: 'onTemplateMarketplaceUpdate', callback: (update: TemplateMarketplaceEvent) => void): void;
  public on(event: 'onSettingsSyncUpdate', callback: (update: SettingsSyncEvent) => void): void;
  public on(event: 'onConnected' | 'onDisconnected', callback: () => void): void;
  public on(event: 'onError', callback: (error: Error) => void): void;
  public on(event: string, callback: Function): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(callback);
  }

  public off(event: string): void {
    this.eventHandlers.set(event, []);
  }

  public async startConnections(): Promise<boolean> {
    try {
      await this.initializeEnhancedBoardConnection();
      await this.initializeTemplateMarketplaceConnection();
      await this.initializeSettingsSyncConnection();

      const connections = [
        this.enhancedBoardConnection,
        this.templateMarketplaceConnection,
        this.settingsSyncConnection
      ].filter(conn => conn !== null);

      if (connections.length === 0) {
        console.log('BoardSignalR: No connections to start');
        return false;
      }

      // Start all connections
      await Promise.all(connections.map(conn => conn!.start()));

      console.log('BoardSignalR: All connections started successfully');
      this.eventHandlers.get('onConnected')?.forEach(handler => handler());
      return true;
    } catch (error) {
      console.error('BoardSignalR: Failed to start connections:', error);
      this.eventHandlers.get('onError')?.forEach(handler => handler(error as Error));
      return false;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      const connections = [
        this.enhancedBoardConnection,
        this.templateMarketplaceConnection,
        this.settingsSyncConnection
      ].filter(conn => conn !== null);

      await Promise.all(connections.map(conn => conn!.stop()));

      this.enhancedBoardConnection = null;
      this.templateMarketplaceConnection = null;
      this.settingsSyncConnection = null;
      this.connectedBoards.clear();

      console.log('BoardSignalR: All connections disconnected');
      this.eventHandlers.get('onDisconnected')?.forEach(handler => handler());
    } catch (error) {
      console.error('BoardSignalR: Error during disconnect:', error);
    }
  }

  public isConnected(): boolean {
    return this.enhancedBoardConnection?.state === signalR.HubConnectionState.Connected ||
           this.templateMarketplaceConnection?.state === signalR.HubConnectionState.Connected ||
           this.settingsSyncConnection?.state === signalR.HubConnectionState.Connected;
  }

  // Board-specific methods
  public async joinBoardGroup(boardId: number): Promise<void> {
    try {
      if (this.enhancedBoardConnection?.state === signalR.HubConnectionState.Connected) {
        await this.enhancedBoardConnection.invoke('JoinBoardGroup', boardId);
        this.connectedBoards.add(boardId);
        console.log(`BoardSignalR: Joined board group ${boardId}`);
      }
    } catch (error) {
      console.error(`BoardSignalR: Failed to join board group ${boardId}:`, error);
    }
  }

  public async leaveBoardGroup(boardId: number): Promise<void> {
    try {
      if (this.enhancedBoardConnection?.state === signalR.HubConnectionState.Connected) {
        await this.enhancedBoardConnection.invoke('LeaveBoardGroup', boardId);
        this.connectedBoards.delete(boardId);
        console.log(`BoardSignalR: Left board group ${boardId}`);
      }
    } catch (error) {
      console.error(`BoardSignalR: Failed to leave board group ${boardId}:`, error);
    }
  }

  public async joinTemplateMarketplace(): Promise<void> {
    try {
      if (this.templateMarketplaceConnection?.state === signalR.HubConnectionState.Connected) {
        await this.templateMarketplaceConnection.invoke('JoinTemplateMarketplace');
        console.log('BoardSignalR: Joined template marketplace');
      }
    } catch (error) {
      console.error('BoardSignalR: Failed to join template marketplace:', error);
    }
  }

  public async leaveTemplateMarketplace(): Promise<void> {
    try {
      if (this.templateMarketplaceConnection?.state === signalR.HubConnectionState.Connected) {
        await this.templateMarketplaceConnection.invoke('LeaveTemplateMarketplace');
        console.log('BoardSignalR: Left template marketplace');
      }
    } catch (error) {
      console.error('BoardSignalR: Failed to leave template marketplace:', error);
    }
  }

  private async rejoinBoardGroups(): Promise<void> {
    for (const boardId of this.connectedBoards) {
      await this.joinBoardGroup(boardId);
    }
  }
}

// Export singleton instance
export const boardSignalRService = new BoardSignalRService(); 