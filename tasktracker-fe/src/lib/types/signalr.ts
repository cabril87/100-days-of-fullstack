/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 * 
 * SignalR Types and Interfaces
 * Comprehensive type definitions for real-time communication between frontend and backend
 */

import { HubConnection, HttpTransportType } from '@microsoft/signalr';

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
}

export interface LevelUpEvent extends GamificationEvent {
  eventType: 'LevelUp';
  newLevel: number;
  oldLevel: number;
}

export interface StreakUpdatedEvent extends GamificationEvent {
  eventType: 'StreakUpdated';
  currentStreak: number;
  isNewRecord: boolean;
}

export interface BadgeEarnedEvent extends GamificationEvent {
  eventType: 'BadgeEarned';
  badgeName: string;
  badgeId: number;
  rarity: string;
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

// Real-time event types for family task management
export interface TaskCompletionEventData {
  taskId: number;
  taskTitle: string;
  completedBy: string;
  completedByUserId: number;
  pointsEarned: number;
  achievementUnlocked?: string;
  completionTime: string;
  familyId: number;
}

export interface AchievementUnlockedEventData {
  achievementId: string;
  achievementName: string;
  achievementDescription: string;
  unlockedBy: string;
  unlockedByUserId: number;
  pointsEarned: number;
  badgeUrl?: string;
  unlockedAt: string;
  familyId: number;
}

export interface FamilyActivityEventData {
  activityId: string;
  activityType: 'task_completed' | 'achievement_unlocked' | 'family_milestone' | 'challenge_started';
  title: string;
  description: string;
  initiatedBy: string;
  initiatedByUserId: number;
  timestamp: string;
  familyId: number;
  metadata?: Record<string, unknown>;
}

export interface FamilyMilestoneEventData {
  milestoneId: string;
  milestoneName: string;
  description: string;
  achievedBy: string[];
  totalPoints: number;
  achievedAt: string;
  familyId: number;
  celebrationMessage?: string;
}

export interface ChallengeProgressEventData {
  challengeId: string;
  challengeName: string;
  progressBy: string;
  progressByUserId: number;
  currentProgress: number;
  totalRequired: number;
  progressPercentage: number;
  isCompleted: boolean;
  familyId: number;
  updatedAt: string;
}

export interface RewardRedeemedEventData {
  rewardId: string;
  rewardName: string;
  pointsCost: number;
  redeemedBy: string;
  redeemedByUserId: number;
  redeemedAt: string;
  familyId: number;
}

export interface FamilyNotificationEventData {
  notificationId: string;
  type: 'info' | 'success' | 'warning' | 'celebration';
  title: string;
  message: string;
  targetUsers?: number[];
  familyId: number;
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
  actionText?: string;
}

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

// Hub method signatures
export interface FamilyTaskHubMethods {
  // Client-to-server methods
  JoinFamilyGroup: (familyId: number) => Promise<void>;
  LeaveFamilyGroup: (familyId: number) => Promise<void>;
  
  // Server-to-client event names
  TaskCompleted: SignalREventHandler<TaskCompletionEventData>;
  AchievementUnlocked: SignalREventHandler<AchievementUnlockedEventData>;
  FamilyActivity: SignalREventHandler<FamilyActivityEventData>;
  FamilyMilestone: SignalREventHandler<FamilyMilestoneEventData>;
  ChallengeProgress: SignalREventHandler<ChallengeProgressEventData>;
  RewardRedeemed: SignalREventHandler<RewardRedeemedEventData>;
  FamilyNotification: SignalREventHandler<FamilyNotificationEventData>;
  
  // Connection lifecycle events
  UserConnected: SignalREventHandler<{ userId: number; familyId: number; }>;
  UserDisconnected: SignalREventHandler<{ userId: number; familyId: number; }>;
}

export interface NotificationHubMethods {
  // Client-to-server methods
  JoinNotificationGroup: (userId: number) => Promise<void>;
  LeaveNotificationGroup: (userId: number) => Promise<void>;
  MarkNotificationAsRead: (notificationId: string) => Promise<void>;
  
  // Server-to-client event names
  NewNotification: SignalREventHandler<FamilyNotificationEventData>;
  NotificationRead: SignalREventHandler<{ notificationId: string; userId: number; }>;
  BulkNotifications: SignalREventHandler<FamilyNotificationEventData[]>;
}

// Combined hub interface for type safety
export interface AppHubConnection extends HubConnection {
  // Family Task Hub methods
  invoke(methodName: 'JoinFamilyGroup', familyId: number): Promise<void>;
  invoke(methodName: 'LeaveFamilyGroup', familyId: number): Promise<void>;
  
  // Notification Hub methods
  invoke(methodName: 'JoinNotificationGroup', userId: number): Promise<void>;
  invoke(methodName: 'LeaveNotificationGroup', userId: number): Promise<void>;
  invoke(methodName: 'MarkNotificationAsRead', notificationId: string): Promise<void>;
  
  // Event listeners
  on(eventName: 'TaskCompleted', handler: SignalREventHandler<TaskCompletionEventData>): void;
  on(eventName: 'AchievementUnlocked', handler: SignalREventHandler<AchievementUnlockedEventData>): void;
  on(eventName: 'FamilyActivity', handler: SignalREventHandler<FamilyActivityEventData>): void;
  on(eventName: 'FamilyMilestone', handler: SignalREventHandler<FamilyMilestoneEventData>): void;
  on(eventName: 'ChallengeProgress', handler: SignalREventHandler<ChallengeProgressEventData>): void;
  on(eventName: 'RewardRedeemed', handler: SignalREventHandler<RewardRedeemedEventData>): void;
  on(eventName: 'FamilyNotification', handler: SignalREventHandler<FamilyNotificationEventData>): void;
  on(eventName: 'NewNotification', handler: SignalREventHandler<FamilyNotificationEventData>): void;
  on(eventName: 'NotificationRead', handler: SignalREventHandler<{ notificationId: string; userId: number; }>): void;
  on(eventName: 'BulkNotifications', handler: SignalREventHandler<FamilyNotificationEventData[]>): void;
  on(eventName: 'UserConnected', handler: SignalREventHandler<{ userId: number; familyId: number; }>): void;
  on(eventName: 'UserDisconnected', handler: SignalREventHandler<{ userId: number; familyId: number; }>): void;
  
  // Remove listeners
  off(eventName: string, handler?: SignalREventHandler<unknown>): void;
}

// Hook return type for useSignalRConnection
export interface UseSignalRConnectionReturn {
  connection: AppHubConnection | null;
  connectionState: SignalRConnectionState;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  reconnect: () => Promise<void>;
  joinFamilyGroup: (familyId: number) => Promise<void>;
  leaveFamilyGroup: (familyId: number) => Promise<void>;
} 