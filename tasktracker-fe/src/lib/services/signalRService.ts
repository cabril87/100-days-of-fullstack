/**
 * SignalR Service for Real-time Gamification Updates
 * 
 * This service provides real-time updates for:
 * - Point changes
 * - New achievements unlocked
 * - Leaderboard position changes
 * - Daily login status updates
 * - Family member activities
 */

import * as signalR from '@microsoft/signalr';
import { GamificationEvent, SignalREvents } from '@/lib/types/signalr';

class SignalRService {
  private connection: signalR.HubConnection | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private eventHandlers: Map<string, Function[]> = new Map();

  constructor() {
    // Don't auto-initialize - let components explicitly start connection when needed
  }

  private async initializeConnection() {
    try {
      // Only run on client side
      if (typeof window === 'undefined') {
        console.log('SignalR: Skipping initialization on server side');
        return;
      }

      // Check if user is authenticated
      const authToken = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!authToken) {
        console.log('SignalR: No auth token found, skipping connection');
        return;
      }

      // SignalR is enabled by default when user is authenticated
      const signalREnabled = process.env.NEXT_PUBLIC_SIGNALR_ENABLED !== 'false';
      if (!signalREnabled) {
        console.log('SignalR: Disabled via environment variable');
        return;
      }

      // Use environment variable for SignalR URL or fallback to localhost
      // Note: SignalR hubs are mapped directly without /api prefix
      const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
      const signalRUrl = `${baseUrl}/hubs/gamification?access_token=${encodeURIComponent(authToken)}`;
      
      console.log('SignalR: Initializing connection to:', signalRUrl);
      
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(signalRUrl, {
          transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
          skipNegotiation: false,
          withCredentials: false
          })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            // Exponential backoff: 1s, 2s, 4s, 8s, 16s
            const delay = Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 16000);
            console.log(`SignalR: Retry attempt ${retryContext.previousRetryCount + 1}, delay: ${delay}ms`);
            return delay;
          }
        })
        .configureLogging(signalR.LogLevel.Information)
          .build();

        // Set up event handlers
      this.setupEventHandlers();

      console.log('SignalR: Connection initialized successfully');
    } catch (error) {
      console.error('SignalR initialization failed:', error);
      this.eventHandlers.get('onError')?.forEach(handler => handler(error));
    }
  }

  private setupEventHandlers() {
    if (!this.connection) return;

    // Handle incoming gamification updates
    this.connection.on('GamificationUpdate', (update: GamificationEvent) => {
      console.log('Received gamification update:', update);
      this.eventHandlers.get('onGamificationUpdate')?.forEach(handler => handler(update));
    });

    // Handle points earned specifically
    this.connection.on('PointsEarned', (data: { points: number; reason: string; userId: number }) => {
      const update: GamificationEvent = {
        type: 'points_earned',
        data,
        userId: data.userId,
        timestamp: new Date().toISOString(),
      };
      this.eventHandlers.get('onGamificationUpdate')?.forEach(handler => handler(update));
        });
        
    // Handle achievement unlocked
    this.connection.on('AchievementUnlocked', (data: { achievementName: string; achievementId: number; points: number; userId: number }) => {
      const update: GamificationEvent = {
        type: 'achievement_unlocked',
        data,
        userId: data.userId,
        timestamp: new Date().toISOString(),
      };
      this.eventHandlers.get('onGamificationUpdate')?.forEach(handler => handler(update));
        });
        
    // Handle level up
    this.connection.on('LevelUp', (data: { newLevel: number; oldLevel: number; userId: number }) => {
      const update: GamificationEvent = {
        type: 'level_up',
        data,
        userId: data.userId,
        timestamp: new Date().toISOString(),
      };
      this.eventHandlers.get('onGamificationUpdate')?.forEach(handler => handler(update));
    });

    // Handle streak updates
    this.connection.on('StreakUpdated', (data: { currentStreak: number; isNewRecord: boolean; userId: number }) => {
      const update: GamificationEvent = {
        type: 'streak_updated',
        data,
        userId: data.userId,
        timestamp: new Date().toISOString(),
      };
      this.eventHandlers.get('onGamificationUpdate')?.forEach(handler => handler(update));
    });

    // Handle challenge progress
    this.connection.on('ChallengeProgress', (data: { challengeName: string; progress: number; target: number; isCompleted: boolean; userId: number }) => {
      const update: GamificationEvent = {
        type: 'challenge_progress',
        data,
        userId: data.userId,
        timestamp: new Date().toISOString(),
      };
      this.eventHandlers.get('onGamificationUpdate')?.forEach(handler => handler(update));
    });

    // Handle badge earned
    this.connection.on('BadgeEarned', (data: { badgeName: string; badgeId: number; rarity: string; userId: number }) => {
      const update: GamificationEvent = {
        type: 'badge_earned',
        data,
        userId: data.userId,
        timestamp: new Date().toISOString(),
      };
      this.eventHandlers.get('onGamificationUpdate')?.forEach(handler => handler(update));
    });

    // Handle reward redeemed
    this.connection.on('RewardRedeemed', (data: { rewardName: string; pointsCost: number; userId: number }) => {
      const update: GamificationEvent = {
        type: 'reward_redeemed',
        data,
        userId: data.userId,
        timestamp: new Date().toISOString(),
      };
      this.eventHandlers.get('onGamificationUpdate')?.forEach(handler => handler(update));
    });

    // Connection events
    this.connection.onclose((error) => {
      console.log('SignalR connection closed:', error);
      this.eventHandlers.get('onDisconnected')?.forEach(handler => handler());
      this.handleReconnection();
    });

    this.connection.onreconnecting((error) => {
      console.log('SignalR reconnecting:', error);
    });

    this.connection.onreconnected((connectionId) => {
      console.log('SignalR reconnected:', connectionId);
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

    // Don't attempt reconnection if SignalR is disabled
    const signalREnabled = process.env.NEXT_PUBLIC_SIGNALR_ENABLED !== 'false';
    if (!signalREnabled) {
      return;
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      return;
    }
  
    this.reconnectAttempts++;

    setTimeout(() => {
      this.startConnection();
    }, this.reconnectDelay * this.reconnectAttempts);
  }

  public on<K extends keyof SignalREvents>(event: K, callback: SignalREvents[K]) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)?.push(callback);
  }

  public off<K extends keyof SignalREvents>(event: K) {
    this.eventHandlers.delete(event);
  }

  public async startConnection(): Promise<boolean> {
    // Only run on client side
    if (typeof window === 'undefined') {
      console.log('SignalR: Skipping connection on server side');
      return false;
    }

    // Check if user is authenticated by looking for token
    const authToken = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!authToken) {
      console.log('SignalR: User not authenticated, skipping connection');
      return false;
    }

    // SignalR is enabled by default when user is authenticated
    // Can be disabled by setting NEXT_PUBLIC_SIGNALR_ENABLED=false
    const signalREnabled = process.env.NEXT_PUBLIC_SIGNALR_ENABLED !== 'false';
    if (!signalREnabled) {
      console.log('SignalR: Disabled via environment variable');
      return false;
    }

    if (!this.connection) {
      console.log('SignalR: Initializing connection...');
      await this.initializeConnection();
    }

    if (!this.connection) {
      console.error('SignalR: Failed to initialize connection');
      return false;
    }

    // Check current connection state
    const currentState = this.connection.state;
    console.log(`SignalR: Current connection state: ${currentState}`);
    
    if (currentState === signalR.HubConnectionState.Connected) {
      console.log('SignalR: Already connected');
      return true;
    }

    // If already connecting, wait for it to complete
    if (currentState === signalR.HubConnectionState.Connecting) {
      console.log('SignalR: Connection already in progress, waiting...');
      return false;
    }

    // Only start if disconnected
    if (currentState !== signalR.HubConnectionState.Disconnected) {
      console.log(`SignalR: Cannot start connection in state: ${currentState}`);
      return false;
    }

    try {
      console.log('SignalR: Starting connection...');
      await this.connection.start();
      console.log('SignalR: Connected successfully');
      this.reconnectAttempts = 0;
      this.eventHandlers.get('onConnected')?.forEach(handler => handler());
      return true;
    } catch (error) {
      console.error('SignalR: Connection failed:', error);
      
      // Check if it's a network error or authentication error
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          console.error('SignalR: Authentication failed - token may be invalid');
        } else if (error.message.includes('404') || error.message.includes('Not Found')) {
          console.error('SignalR: Hub endpoint not found - check server configuration');
        } else if (error.message.includes('ECONNREFUSED') || error.message.includes('Network')) {
          console.error('SignalR: Network connection failed - server may be down');
        }
      }
      
      this.eventHandlers.get('onError')?.forEach(handler => handler(error));
      return false;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await this.connection?.stop();
      console.log('SignalR disconnected');
    } catch (error) {
      console.error('Error disconnecting SignalR:', error);
    }
  }
  
  public getConnectionState(): signalR.HubConnectionState | null {
    return this.connection?.state || null;
  }

  public isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected;
  }

  // Join specific groups for targeted updates
  public async joinUserGroup(userId: number): Promise<void> {
    if (this.isConnected()) {
    try {
        await this.connection?.invoke('JoinUserGroup', userId);
        console.log(`Joined user group: ${userId}`);
      } catch (error) {
        console.error('Failed to join user group:', error);
      }
    }
  }

  public async joinFamilyGroup(familyId: number): Promise<void> {
    if (this.isConnected()) {
      try {
        await this.connection?.invoke('JoinFamilyGroup', familyId);
        console.log(`Joined family group: ${familyId}`);
      } catch (error) {
        console.error('Failed to join family group:', error);
      }
    }
  }

  public async leaveUserGroup(userId: number): Promise<void> {
    if (this.isConnected()) {
      try {
        await this.connection?.invoke('LeaveUserGroup', userId);
        console.log(`Left user group: ${userId}`);
    } catch (error) {
        console.error('Failed to leave user group:', error);
      }
    }
  }

  public async leaveFamilyGroup(familyId: number): Promise<void> {
    if (this.isConnected()) {
      try {
        await this.connection?.invoke('LeaveFamilyGroup', familyId);
        console.log(`Left family group: ${familyId}`);
      } catch (error) {
        console.error('Failed to leave family group:', error);
      }
    }
  }
}

// Create singleton instance
export const signalRService = new SignalRService();
export default signalRService; 