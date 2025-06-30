/*
 * Focus Sessions Type Definitions
 * Enterprise TypeScript interfaces matching backend DTOs exactly
 * Copyright (c) 2025 TaskTracker Enterprise
 * Following FAMILY-AUTH-IMPLEMENTATION-CHECKLIST.md standards
 */

// ================================
// CORE FOCUS SESSION TYPES
// ================================

/**
 * Focus session status enum matching backend SessionStatus
 */
export type FocusSessionStatus = 'InProgress' | 'Completed' | 'Interrupted' | 'Paused';

/**
 * Focus session DTO matching backend FocusSession exactly
 */
export interface FocusSessionDTO {
  id: number;
  userId: number;
  taskId: number;
  startTime: string; // ISO string from backend
  endTime?: string; // ISO string from backend
  durationMinutes: number;
  isCompleted: boolean;
  notes?: string;
  sessionQualityRating?: number; // 1-5 stars
  completionNotes?: string;
  taskProgressBefore: number; // 0-100
  taskProgressAfter: number; // 0-100
  taskCompletedDuringSession: boolean;
  status: FocusSessionStatus;
  // Navigation properties from backend
  taskItem?: TaskItemDTO;
  distractions?: DistractionDTO[];
}

/**
 * Frontend-transformed focus session with Date objects
 */
export interface FocusSession {
  id: number;
  userId: number;
  taskId: number;
  startTime: Date;
  endTime?: Date;
  durationMinutes: number;
  isCompleted: boolean;
  notes?: string;
  sessionQualityRating?: number;
  completionNotes?: string;
  taskProgressBefore: number;
  taskProgressAfter: number;
  taskCompletedDuringSession: boolean;
  status: FocusSessionStatus;
  taskItem?: TaskItem;
  distractions?: Distraction[];
}

/**
 * Task item DTO for focus session task selection
 */
export interface TaskItemDTO {
  id: number;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: string; // ISO string
  createdAt: string; // ISO string
  updatedAt?: string; // ISO string
  isCompleted: boolean;
  userId: number;
  progressPercentage: number;
  actualTimeSpentMinutes?: number;
  categoryId?: number;
  categoryName?: string;
}

/**
 * Frontend-transformed task item with Date objects
 */
export interface TaskItem {
  id: number;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: Date;
  createdAt: Date;
  updatedAt?: Date;
  isCompleted: boolean;
  userId: number;
  progressPercentage: number;
  actualTimeSpentMinutes?: number;
  categoryId?: number;
  categoryName?: string;
  estimatedMinutes?: number; // Added for focus session planning
}

// ================================
// DISTRACTION TRACKING TYPES
// ================================

/**
 * Distraction DTO matching backend exactly
 */
export interface DistractionDTO {
  id: number;
  focusSessionId: number;
  description: string;
  category: string;
  timestamp: string; // ISO string from backend
}

/**
 * Frontend-transformed distraction with Date object
 */
export interface Distraction {
  id: number;
  focusSessionId: number;
  description: string;
  category: string;
  timestamp: Date;
}

/**
 * Create distraction DTO matching backend DistractionCreateDto
 */
export interface CreateDistractionDTO {
  sessionId: number;
  description: string;
  category: string;
}

/**
 * Distraction categories for consistent categorization
 */
export const DISTRACTION_CATEGORIES = [
  'Social Media',
  'Phone Call',
  'Email',
  'Colleague Interruption',
  'Noise',
  'Personal Thought',
  'Meeting',
  'Other'
] as const;

export type DistractionCategory = typeof DISTRACTION_CATEGORIES[number];

// ================================
// SESSION MANAGEMENT TYPES
// ================================

/**
 * Create focus session DTO matching backend FocusSessionCreateDto
 */
export interface CreateFocusSessionDTO {
  taskId: number;
  durationMinutes?: number; // Default 25 (Pomodoro)
  notes?: string;
  forceStart?: boolean; // Auto-end existing session
}

/**
 * Complete session DTO matching backend FocusSessionCompleteDto
 */
export interface CompleteFocusSessionDTO {
  sessionQualityRating: number; // 1-5 stars
  completionNotes?: string;
  taskProgressAfter: number; // 0-100
  taskCompletedDuringSession: boolean;
}

/**
 * Focus session state for frontend state management
 */
export type FocusSessionState = 
  | 'NO_SESSION'     // No active session
  | 'STARTING'       // Session initialization
  | 'IN_PROGRESS'    // Active session running
  | 'PAUSED'         // Session temporarily stopped
  | 'COMPLETING'     // Session ending with completion dialog
  | 'ERROR';         // Error state with recovery options

// ================================
// ANALYTICS AND STATISTICS TYPES
// ================================

/**
 * Focus statistics DTO matching backend FocusStatisticsDto
 */
export interface FocusStatisticsDTO {
  totalMinutesFocused: number;
  sessionCount: number;
  distractionCount: number;
  distractionsByCategory: Record<string, number>;
  averageSessionLength: number;
  dailyFocusMinutes: Record<string, number>;
}

/**
 * Frontend-transformed focus statistics
 */
export interface FocusStatistics {
  totalMinutesFocused: number;
  sessionCount: number;
  distractionCount: number;
  distractionsByCategory: Partial<Record<DistractionCategory, number>>;
  averageSessionLength: number;
  dailyFocusMinutes: Record<string, number>;
  // Computed properties
  focusEfficiencyScore: number;
  averageDistractions: number;
  bestFocusDay?: string;
}

/**
 * Productivity insights from backend /focus/insights endpoint
 */
export interface ProductivityInsightsDTO {
  userId: number;
  generatedAt: string; // ISO string
  totalSessions: number;
  totalMinutesFocused: number;
  averageSessionLength: number;
  longestSession: number;
  shortestSession: number;
  totalDistractions: number;
  averageDistractions: number;
  // Time patterns
  optimalFocusHours: number[];
  productivityScore: number;
  focusConsistency: number;
  // Insights and recommendations
  insights: ProductivityInsight[];
  recommendations: ProductivityRecommendation[];
  // Streak data
  currentStreak: number;
  longestStreak: number;
  streakDays: string[];
}

/**
 * Individual productivity insight
 */
export interface ProductivityInsight {
  type: 'positive' | 'negative' | 'neutral';
  title: string;
  description: string;
  confidence: number; // 0-1
  category: 'focus' | 'timing' | 'distraction' | 'task_selection';
}

/**
 * Productivity recommendation
 */
export interface ProductivityRecommendation {
  type: 'timing' | 'duration' | 'environment' | 'task_selection';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
  estimatedImpact: number; // 0-1
}

// ================================
// TASK SUGGESTIONS TYPES
// ================================

/**
 * Focus suggestion response from backend
 */
export interface FocusSuggestion {
  task: TaskItem;
  reason: 'overdue' | 'high_priority' | 'approaching_deadline' | 'good_progress' | 'optimal_time';
  score: number; // 0-1 confidence
  estimatedFocusTime: number; // minutes
}

// ================================
// TIMER AND SESSION CONTROL TYPES
// ================================

/**
 * Timer state for session control
 */
export interface TimerState {
  elapsedSeconds: number;
  isRunning: boolean;
  isPaused: boolean;
  displayTime: string; // MM:SS or HH:MM:SS format
}

/**
 * Session control actions
 */
export type SessionAction = 
  | { type: 'START_SESSION'; payload: { task: TaskItem; notes?: string } }
  | { type: 'PAUSE_SESSION' }
  | { type: 'RESUME_SESSION' }
  | { type: 'END_SESSION' }
  | { type: 'COMPLETE_SESSION'; payload: CompleteFocusSessionDTO }
  | { type: 'RECORD_DISTRACTION'; payload: CreateDistractionDTO }
  | { type: 'SESSION_ERROR'; payload: { error: string } }
  | { type: 'RESET_SESSION' };

// ================================
// ERROR HANDLING TYPES
// ================================

/**
 * Focus service error with specific error codes
 */
export interface FocusServiceError {
  code: 'SESSION_EXISTS' | 'SESSION_NOT_FOUND' | 'TASK_NOT_FOUND' | 'INVALID_OPERATION' | 'NETWORK_ERROR' | 'UNKNOWN_ERROR';
  message: string;
  details?: Record<string, string[]>;
  sessionId?: number;
  taskId?: number;
}

// ================================
// UI COMPONENT PROP TYPES
// ================================

/**
 * Base props for focus components
 */
export interface FocusComponentProps {
  className?: string;
  userId?: number;
}

/**
 * Focus session timer props
 */
export interface FocusTimerProps extends FocusComponentProps {
  session: FocusSession | null;
  onPause: () => void;
  onResume: () => void;
  onEnd: () => void;
  onRecordDistraction: () => void;
  isLoading?: boolean;
}

/**
 * Task selection modal props
 */
export interface TaskSelectionProps extends FocusComponentProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskSelect: (task: TaskItem, notes?: string) => void;
  availableTasks: TaskItem[];
  suggestedTasks: FocusSuggestion[];
  isLoading?: boolean;
}

/**
 * Session completion props
 */
export interface SessionCompletionProps extends FocusComponentProps {
  isOpen: boolean;
  onClose: () => void;
  session: FocusSession;
  task: TaskItem;
  onComplete: (completion: CompleteFocusSessionDTO) => void;
  isLoading?: boolean;
}

/**
 * Focus analytics props
 */
export interface FocusAnalyticsProps extends FocusComponentProps {
  statistics: FocusStatistics;
  insights: ProductivityInsightsDTO;
  dateRange: { start: Date; end: Date };
  onDateRangeChange: (range: { start: Date; end: Date }) => void;
  isLoading?: boolean;
}

// ================================
// MOBILE AND RESPONSIVE TYPES
// ================================

/**
 * Mobile focus enhancements
 */
export interface MobileFocusFeatures {
  hapticFeedback: boolean;
  voiceCommands: boolean;
  gestureControls: boolean;
  orientationLock: boolean;
  preventSleep: boolean;
}

/**
 * Touch gesture types for mobile navigation
 */
export type FocusGestureType = 'swipe_up' | 'swipe_down' | 'swipe_left' | 'swipe_right' | 'double_tap' | 'long_press';

/**
 * Haptic feedback patterns for different actions
 */
export type HapticPattern = 'start' | 'pause' | 'resume' | 'complete' | 'distraction' | 'error'; 