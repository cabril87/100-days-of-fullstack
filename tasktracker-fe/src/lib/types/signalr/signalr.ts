/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 * 
 * SignalR Types and Interfaces
 * Comprehensive type definitions for real-time communication between frontend and backend
 */

import { HttpTransportType } from '@microsoft/signalr';

// ================================
// CONNECTION STATE MANAGEMENT
// ================================

export enum HubConnectionStatus {
  Disconnected = 'Disconnected',
  Connecting = 'Connecting', 
  Connected = 'Connected',
  Disconnecting = 'Disconnecting',
  Reconnecting = 'Reconnecting'
}

export interface ConnectionState {
  status: HubConnectionStatus;
  lastConnected?: Date;
  lastDisconnected?: Date;
  reconnectAttempts: number;
  error?: string;
}

export interface ConnectionConfig {
  hubUrl: string;
  automaticReconnect: boolean;
  maxReconnectAttempts: number;
  reconnectInterval: number;
  enableLogging: boolean;
}

// ================================
// GAMIFICATION EVENTS
// ================================

export interface GamificationEvent {
  eventType: 'PointsEarned' | 'AchievementUnlocked' | 'LevelUp' | 'StreakUpdated' | 'BadgeEarned' | 'ChallengeProgress' | 'RewardRedeemed';
  userId: number;
  timestamp: Date;
}

export interface PointsEarnedEvent extends GamificationEvent {
  eventType: 'PointsEarned';
  points: number;
  reason: string;
  relatedEntityId?: number;
}

export interface AchievementUnlockedEvent extends GamificationEvent {
  eventType: 'AchievementUnlocked';
  achievementName: string;
  achievementId: number;
  points: number;
  category: string;
  difficulty: 'VeryEasy' | 'Easy' | 'Medium' | 'Hard' | 'VeryHard';
}

export interface LevelUpEvent extends GamificationEvent {
  eventType: 'LevelUp';
  previousLevel: number;
  newLevel: number;
  pointsRequired: number;
  bonusPoints?: number;
}

export interface StreakUpdatedEvent extends GamificationEvent {
  eventType: 'StreakUpdated';
  currentStreak: number;
  previousStreak: number;
  isNewRecord: boolean;
}

export interface BadgeEarnedEvent extends GamificationEvent {
  eventType: 'BadgeEarned';
  badgeName: string;
  badgeId: number;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
  points: number;
}

export interface ChallengeProgressEvent extends GamificationEvent {
  eventType: 'ChallengeProgress';
  challengeName: string;
  progress: number;
  target: number;
  isCompleted: boolean;
}

export interface RewardRedeemedEvent extends GamificationEvent {
  eventType: 'RewardRedeemed';
  rewardName: string;
  pointsCost: number;
}

// ================================
// NOTIFICATION EVENTS
// ================================

export interface NotificationEvent {
  eventType: 'ReceiveNotification' | 'NotificationStatusUpdated' | 'UnreadCountUpdated';
  userId: number;
  timestamp: Date;
}

export interface ReceiveNotificationEvent extends NotificationEvent {
  eventType: 'ReceiveNotification';
  notification: {
    id: number;
    title: string;
    message: string;
    type: string;
    priority: 'Low' | 'Medium' | 'High' | 'Urgent';
    isRead: boolean;
    relatedEntityId?: number;
    relatedEntityType?: string;
  };
}

export interface NotificationStatusUpdatedEvent extends NotificationEvent {
  eventType: 'NotificationStatusUpdated';
  notificationId: number;
  isRead: boolean;
}

export interface UnreadCountUpdatedEvent extends NotificationEvent {
  eventType: 'UnreadCountUpdated';
  unreadCount: number;
}

// ================================
// TASK EVENTS
// ================================

export interface TaskEvent {
  eventType: 'TaskCreated' | 'TaskUpdated' | 'TaskDeleted' | 'TaskMoved' | 'TaskCompleted';
  userId: number;
  taskId: number;
  timestamp: Date;
}

export interface TaskCreatedEvent extends TaskEvent {
  eventType: 'TaskCreated';
  task: {
    id: number;
    title: string;
    description?: string;
    priority: string;
    status: string;
    dueDate?: Date;
    assignedToId?: number;
    familyId?: number;
  };
}

export interface TaskUpdatedEvent extends TaskEvent {
  eventType: 'TaskUpdated';
  changes: Record<string, unknown>;
  previousValues: Record<string, unknown>;
}

export interface TaskDeletedEvent extends TaskEvent {
  eventType: 'TaskDeleted';
  taskTitle: string;
}

export interface TaskMovedEvent extends TaskEvent {
  eventType: 'TaskMoved';
  fromColumn: string;
  toColumn: string;
  boardId?: number;
}

export interface TaskCompletedEvent extends TaskEvent {
  eventType: 'TaskCompleted';
  pointsEarned: number;
  completionTime: Date;
}

// ================================
// BOARD EVENTS  
// ================================

export interface BoardEvent {
  eventType: 'UserJoinedBoard' | 'UserLeftBoard' | 'ColumnUpdated' | 'WipLimitViolation';
  boardId: number;
  userId: number;
  timestamp: Date;
}

export interface UserJoinedBoardEvent extends BoardEvent {
  eventType: 'UserJoinedBoard';
  userName: string;
  userRole: string;
}

export interface UserLeftBoardEvent extends BoardEvent {
  eventType: 'UserLeftBoard';
  userName: string;
}

export interface ColumnUpdatedEvent extends BoardEvent {
  eventType: 'ColumnUpdated';
  columnId: number;
  columnName: string;
  changes: Record<string, unknown>;
}

export interface WipLimitViolationEvent extends BoardEvent {
  eventType: 'WipLimitViolation';
  columnId: number;
  columnName: string;
  currentCount: number;
  wipLimit: number;
}

// ================================
// TEMPLATE MARKETPLACE EVENTS
// ================================

export interface TemplateEvent {
  eventType: 'TemplatePublished' | 'MarketplaceAnalyticsUpdated';
  templateId: number;
  timestamp: Date;
}

export interface TemplatePublishedEvent extends TemplateEvent {
  eventType: 'TemplatePublished';
  templateName: string;
  authorId: number;
  category: string;
}

export interface MarketplaceAnalyticsUpdatedEvent extends TemplateEvent {
  eventType: 'MarketplaceAnalyticsUpdated';
  downloadCount: number;
  rating: number;
  reviewCount: number;
}

// ================================
// FAMILY & CALENDAR EVENTS
// ================================

export interface FamilyEvent {
  eventType: 'FamilyMemberJoined' | 'FamilyActivityUpdated' | 'FamilyAchievementUnlocked';
  familyId: number;
  timestamp: Date;
}

export interface CalendarEvent {
  eventType: 'EventCreated' | 'EventUpdated' | 'ConflictDetected' | 'AvailabilityUpdated';
  eventId?: number;
  familyId: number;
  timestamp: Date;
}

// ================================
// UNIFIED EVENT TYPES
// ================================

export type AllSignalREvents = 
  | GamificationEvent
  | NotificationEvent 
  | TaskEvent
  | BoardEvent
  | TemplateEvent
  | FamilyEvent
  | CalendarEvent;

// ================================
// EVENT HANDLERS
// ================================

export interface SignalREventHandlers {
  // Gamification handlers
  onPointsEarned?: (event: PointsEarnedEvent) => void;
  onAchievementUnlocked?: (event: AchievementUnlockedEvent) => void;
  onLevelUp?: (event: LevelUpEvent) => void;
  onStreakUpdated?: (event: StreakUpdatedEvent) => void;
  onBadgeEarned?: (event: BadgeEarnedEvent) => void;
  onChallengeProgress?: (event: ChallengeProgressEvent) => void;
  onRewardRedeemed?: (event: RewardRedeemedEvent) => void;
  
  // Notification handlers
  onReceiveNotification?: (event: ReceiveNotificationEvent) => void;
  onNotificationStatusUpdated?: (event: NotificationStatusUpdatedEvent) => void;
  onUnreadCountUpdated?: (event: UnreadCountUpdatedEvent) => void;
  
  // Task handlers
  onTaskCreated?: (event: TaskCreatedEvent) => void;
  onTaskUpdated?: (event: TaskUpdatedEvent) => void;
  onTaskDeleted?: (event: TaskDeletedEvent) => void;
  onTaskMoved?: (event: TaskMovedEvent) => void;
  onTaskCompleted?: (event: TaskCompletedEvent) => void;
    
  // Board handlers
  onUserJoinedBoard?: (event: UserJoinedBoardEvent) => void;
  onUserLeftBoard?: (event: UserLeftBoardEvent) => void;
  onColumnUpdated?: (event: ColumnUpdatedEvent) => void;
  onWipLimitViolation?: (event: WipLimitViolationEvent) => void;
  
  // Template handlers
  onTemplatePublished?: (event: TemplatePublishedEvent) => void;
  onMarketplaceAnalyticsUpdated?: (event: MarketplaceAnalyticsUpdatedEvent) => void;
  
  // Connection handlers
  onConnected?: () => void;
  onDisconnected?: (error?: Error) => void;
  onReconnecting?: () => void;
  onReconnected?: () => void;
  onError?: (error: Error) => void;
}

// ================================
// ERROR TYPES
// ================================

export interface SignalRError extends Error {
  code?: string;
  statusCode?: number;
  details?: Record<string, unknown>;
}

export class SignalRConnectionError extends Error implements SignalRError {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'SignalRConnectionError';
  }
}

export class SignalRAuthenticationError extends Error implements SignalRError {
  constructor(
    message: string = 'Authentication failed for SignalR connection',
    public code: string = 'AUTH_FAILED',
    public statusCode: number = 401
  ) {
    super(message);
    this.name = 'SignalRAuthenticationError';
  }
}

// ================================
// UTILITY TYPES
// ================================

export interface HubConnectionInfo {
  hubUrl: string;
  connectionId?: string;
  state: ConnectionState;
  config: ConnectionConfig;
}

export interface SignalRMetrics {
  totalConnections: number;
  totalDisconnections: number;
  totalReconnections: number;
  averageConnectionTime: number;
  lastEventReceived?: Date;
  eventsReceived: number;
}

// ================================
// HUB-SPECIFIC TYPES
// ================================

export interface MainHubEvents {
  // Task events
  TaskCreated: TaskCreatedEvent;
  TaskUpdated: TaskUpdatedEvent;
  TaskDeleted: TaskDeletedEvent;
  TaskMoved: TaskMovedEvent;
  TaskCompleted: TaskCompletedEvent;
  
  // Gamification events
  ReceiveGamificationEvent: GamificationEvent;
  PointsEarned: PointsEarnedEvent;
  AchievementUnlocked: AchievementUnlockedEvent;
  LevelUp: LevelUpEvent;
  StreakUpdated: StreakUpdatedEvent;
  BadgeEarned: BadgeEarnedEvent;
  
  // Notification events
  ReceiveNotification: ReceiveNotificationEvent;
  NotificationStatusUpdated: NotificationStatusUpdatedEvent;
  UnreadCountUpdated: UnreadCountUpdatedEvent;
  
  // Board events
  UserJoinedBoard: UserJoinedBoardEvent;
  UserLeftBoard: UserLeftBoardEvent;
  ColumnUpdated: ColumnUpdatedEvent;
  WipLimitViolation: WipLimitViolationEvent;
  
  // Template events
  TemplatePublished: TemplatePublishedEvent;
  MarketplaceAnalyticsUpdated: MarketplaceAnalyticsUpdatedEvent;
}

export interface CalendarHubEvents {
  // Calendar events
  EventCreated: CalendarEvent;
  EventUpdated: CalendarEvent;
  ConflictDetected: CalendarEvent;
  AvailabilityUpdated: CalendarEvent;
  
  // Focus mode events
  FocusSessionStarted: { userId: number; sessionId: number; duration: number };
  FocusSessionEnded: { userId: number; sessionId: number; completed: boolean };
}

// Legacy event types removed - use types from family-events.ts and backend-signalr-events.ts

// Generic SignalR event handler types
export type SignalREventHandler<T = unknown> = (data: T) => void;
export type SignalRErrorHandler = (error: Error) => void;

// Connection state management
export interface SignalRConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  reconnectAttempts: number;
  lastError?: string;
  connectionId?: string;
}

export interface SignalRConfiguration {
  hubUrl: string;
  enableAutoReconnect: boolean;
  maxReconnectAttempts: number;
  reconnectInterval: number;
  enableLogging: boolean;
  accessTokenFactory?: () => string | Promise<string>;
  transport?: HttpTransportType;
  headers?: Record<string, string>;
}


