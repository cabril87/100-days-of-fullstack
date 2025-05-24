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

import React from 'react';
import * as signalR from '@microsoft/signalr';

interface GamificationEvent {
  type: 'points_earned' | 'achievement_unlocked' | 'level_up' | 'streak_updated' | 'challenge_progress' | 'badge_earned' | 'reward_redeemed';
  data: any;
  userId: number;
  timestamp: string;
}

export interface SignalREvents {
  onGamificationUpdate: (update: GamificationEvent) => void;
  onConnected: () => void;
  onDisconnected: () => void;
  onError: (error: Error) => void;
}

class SignalRService {
  private connection: signalR.HubConnection | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private eventHandlers: Map<string, Function[]> = new Map();

  constructor() {
    // Only initialize on client side
    if (typeof window !== 'undefined') {
      this.initializeConnection();
    }
  }

  private async initializeConnection() {
    try {
      // Only run on client side
      if (typeof window === 'undefined') {
        return;
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(`${baseUrl}/gamificationHub`, {
          accessTokenFactory: () => {
            return localStorage.getItem('token') || sessionStorage.getItem('token') || '';
          },
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

      // Start connection
      await this.startConnection();
    } catch (error) {
      console.error('SignalR: Failed to initialize connection', error);
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
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.eventHandlers.get('onError')?.forEach(handler => handler(new Error('Failed to reconnect to real-time updates')));
      return;
  }
  
    this.reconnectAttempts++;
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

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
    if (!this.connection) {
      await this.initializeConnection();
    }

    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      return true;
    }

    try {
      await this.connection?.start();
      console.log('SignalR connected successfully');
      this.reconnectAttempts = 0;
      this.eventHandlers.get('onConnected')?.forEach(handler => handler());
      return true;
    } catch (error) {
      console.error('Failed to connect to SignalR:', error);
      this.eventHandlers.get('onError')?.forEach(handler => handler(error as Error));
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